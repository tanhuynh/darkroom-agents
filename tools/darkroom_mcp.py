#!/usr/bin/env python3
"""Repo-local MCP server for agents that have no shell (e.g. a local model in LM Studio).

Gives a small model exactly what the workflow needs outside Photoshop, with the write policy enforced in code:
  - read_file / search_repo   read knowledge files in small slices (small context windows)
  - write_file                only cases, inbox proposals, handoff, the agent's own adapter, measure/
  - measure_baseline / measure_diff   run tools/measure_all.py (the one measurement entry point)
  - prophoto_to_srgb  convert a Photoshop-saved ProPhoto PNG to sRGB (the render recipe; never use convertToProfile)
  - view_image                return a (downscaled) image so a vision model can look at renders / overlays
  - validate_xmp              well-formedness check before a Camera Raw XMP is sent to Photoshop

Run (stdio):  .venv/bin/python tools/darkroom_mcp.py
Not a Photoshop connector — Photoshop access stays with the adb-mcp servers (engine.md ACCESS sections).
"""
import io
import re
import subprocess
import sys
from pathlib import Path
from xml.dom import minidom

from mcp.server.fastmcp import FastMCP, Image
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
MAX_READ_LINES = 400
MAX_IMG = 768  # image tokens ~ (px/28)^2 per view: 768 px ≈ 750 tokens, 1280 px ≈ 2100 — big prefill spikes ran a 36 GB Mac out of GPU memory

# Write policy (WORKFLOW §5): cases directly, own adapter, handoff, inbox proposals, measure renders. Never rules/playbooks.
WRITABLE = [
    "recipes/cases/",
    "recipes/inbox/",
    "recipes/session-handoff.md",
    "measure/",
    "agents/local-",  # only <dir>/ADAPTER.md of a local agent — checked below
]
READ_DENY = (".git/", ".venv/", "node_modules/")

mcp = FastMCP("darkroom")


def _resolve(rel: str) -> Path:
    p = (ROOT / rel).resolve()
    if ROOT not in p.parents and p != ROOT:
        raise ValueError(f"path escapes the repo: {rel}")
    r = p.relative_to(ROOT).as_posix() + ("/" if p.is_dir() else "")
    if r.startswith(READ_DENY):
        raise ValueError(f"not readable: {rel}")
    return p


def _writable(rel: str) -> Path:
    p = _resolve(rel)
    r = p.relative_to(ROOT).as_posix()
    if r.startswith("agents/local-"):
        ok = r.count("/") == 2 and r.endswith("/ADAPTER.md")
    else:
        ok = any(r.startswith(w) or r == w for w in WRITABLE)
    if not ok:
        raise ValueError(
            f"write refused: {rel}. Allowed: recipes/cases/, recipes/inbox/ (proposals), recipes/session-handoff.md, "
            "measure/, agents/local-*/ADAPTER.md. Rule changes go to recipes/inbox/ as a proposal (WORKFLOW §5)."
        )
    return p


@mcp.tool()
def read_file(path: str, start_line: int = 1, max_lines: int = 200) -> str:
    """Read a repo file (relative path, e.g. 'WORKFLOW.md'). Returns numbered lines start_line..start_line+max_lines-1.
    Read big files (engine.md, playbooks) in slices; use search_repo to find the right section first."""
    p = _resolve(path)
    if p.is_dir():
        return "\n".join(sorted(x.name + ("/" if x.is_dir() else "") for x in p.iterdir()))
    lines = p.read_text(errors="replace").splitlines()
    n = min(max_lines, MAX_READ_LINES)
    a = max(start_line, 1) - 1
    out = [f"{i + 1}\t{l}" for i, l in enumerate(lines[a:a + n], start=a)]
    tail = f"\n[… {len(lines)} lines total; next start_line={a + n + 1}]" if a + n < len(lines) else ""
    return "\n".join(out) + tail


@mcp.tool()
def search_repo(pattern: str, path: str = "recipes", max_hits: int = 40) -> str:
    """Case-insensitive regex search of text files under `path` (default recipes/). Returns file:line: text."""
    rx = re.compile(pattern, re.I)
    hits = []
    base = _resolve(path)
    for f in sorted(base.rglob("*") if base.is_dir() else [base]):
        rel = f.relative_to(ROOT).as_posix()
        if not f.is_file() or rel.startswith(READ_DENY) or f.suffix.lower() in {".png", ".jpg", ".tif", ".json"}:
            continue
        try:
            for i, line in enumerate(f.read_text(errors="replace").splitlines(), 1):
                if rx.search(line):
                    hits.append(f"{rel}:{i}: {line.strip()[:160]}")
                    if len(hits) >= max_hits:
                        return "\n".join(hits) + "\n[truncated]"
        except OSError:
            pass
    return "\n".join(hits) or "no matches"


@mcp.tool()
def write_file(path: str, content: str) -> str:
    """Create/overwrite a file the write policy allows (cases, inbox proposals, handoff, measure/, your own ADAPTER.md)."""
    p = _writable(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    return f"wrote {path} ({len(content)} chars)"


def _run_measure(args: list[str]) -> str:
    r = subprocess.run([PY, str(ROOT / "tools/measure_all.py"), *args], cwd=ROOT, capture_output=True, text=True, timeout=600)
    return (r.stdout + ("\n[stderr]\n" + r.stderr if r.returncode else "")).strip() or f"exit {r.returncode}"


@mcp.tool()
def prophoto_to_srgb(render: str) -> str:
    """Convert a 16-bit ProPhoto PNG saved by Photoshop (e.g. measure/0301.png) to sRGB -> measure/0301_srgb.png.
    Render recipe: duplicate(merged) -> imageSize 2000 px -> save_document_as PNG (stays ProPhoto) -> THIS -> measure the *_srgb.png.
    Do not use convertToProfile in Photoshop (it can pop a dialog and still report SUCCESS)."""
    _resolve(render)
    r = subprocess.run([PY, str(ROOT / "tools/prophoto_to_srgb.py"), render], cwd=ROOT, capture_output=True, text=True, timeout=300)
    return (r.stdout + r.stderr).strip() or f"exit {r.returncode}"


@mcp.tool()
def measure_baseline(render: str, crop: str = "") -> str:
    """tools/measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]. `render` is a repo-relative PNG, e.g. measure/0301_16.png."""
    _resolve(render)
    return _run_measure(["baseline", render] + (["--crop", crop] if crop else []))


@mcp.tool()
def measure_diff(before: str, after: str, hero: str = "") -> str:
    """tools/measure_all.py diff <before.png> <after.png> [--hero x0,y0,x1,y1]. Writes overlays into measure/; view them with view_image."""
    _resolve(before), _resolve(after)
    return _run_measure(["diff", before, after] + (["--hero", hero] if hero else []))


@mcp.tool()
def view_image(path: str, max_px: int = MAX_IMG) -> Image:
    """Show an image (render, before_after, diffmap, dbmap, hero_zoom, crop preview), downscaled to `max_px` long edge (default 768, max 1280).
    One view per decision — every view adds image tokens to the context."""
    p = _resolve(path)
    im = PILImage.open(p)
    if im.mode in ("I;16", "I", "F"):
        im = im.point(lambda v: v / 256).convert("L")
    im = im.convert("RGB")
    m = max(256, min(max_px, 1280))
    im.thumbnail((m, m))
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return Image(data=buf.getvalue(), format="png")


@mcp.tool()
def validate_xmp(xmp: str) -> str:
    """Check that a Camera Raw XMP string is well-formed XML before sending it to Photoshop. Returns OK or the parse error."""
    try:
        minidom.parseString(xmp.encode())
    except Exception as e:  # noqa: BLE001
        return f"INVALID: {e}"
    ids = re.findall(r'(?:CorrectionSyncID|MaskSyncID)="([^"]*)"', xmp)
    bad = [i for i in ids if not re.fullmatch(r"[0-9A-Fa-f]{32}", i)]
    dup = len(ids) != len(set(ids))
    notes = ([f"{len(bad)} SyncID(s) are not 32 hex chars"] if bad else []) + (["duplicate SyncIDs"] if dup else [])
    return "OK" if not notes else "well-formed, but: " + "; ".join(notes)


if __name__ == "__main__":
    mcp.run()
