# Separate the Photoshop access layer (adb-mcp) from durable Camera Raw knowledge, so the MCP can be swapped (Adobe's own MCP expected 2027)
- **Agent:** claude
- **Target:** engine.md (restructure) · WORKFLOW.md §1 · agents/*/ADAPTER.md (one pointer line each)
- **Type:** change rule (structure only — no value or rule changes)
- **Rule:** IF a fact would still be true with a different Photoshop connector → it lives in **Part A (durable)**. IF it names adb-mcp, UXP, the proxy, `batchPlay`, the descriptor key encoding (`$CrVe`, `$LCs`, `$BigT`, `filterFX`) or an MCP tool → it lives in **Part B (access: adb-mcp)**. DO keep playbooks/materials/WORKFLOW free of Part B names; they ask for *capabilities* (below), never tools. CHECK a connector swap = rewrite Part B + the "Photoshop access" line of each adapter + MCP config files; nothing else.
- **Evidence:** audit of the repo (Nov 18 2026): playbooks and `materials.md` have zero mentions of MCP/batchPlay/UXP; `WORKFLOW.md` has two (§1 lines about `~/dev/adb-mcp` and the UXP Reload/Connect); `engine.md` mixes both layers throughout; `adb-mcp` appears in 25 files (configs, adapters, docs, 6 tools).
- **Conflicts with:** none
- **Scope:** physics/general (structure)

## 1. Capability contract (new `engine.md` header, ~12 lines)
The workflow needs only these operations. Any connector must provide them; Part B says how adb-mcp does each.

| # | Capability | Used by |
|---|---|---|
| C1 | List documents / layers; read doc info (size, path, saved, raw SO type) | WORKFLOW §2.1 |
| C2 | Render the merged image to a 16-bit PNG at 2000 px long edge (and 1:1 crops) in a known colour space | §2.1, §4 |
| C3 | **Read** the live Camera Raw Filter on a layer, complete (XMP + dialog-only keys + Remove/Lens Blur state) | §3 "read live, resend every key" |
| C4 | **Write** the Camera Raw Filter in one call, preserving every non-edited key and AI/Remove data | §2.6 |
| C5 | Non-destructive crop (`delete:false` equivalent) and reading it back | §2.3 |
| C6 | Save/export a file; read the saved path | §5 archive |
| C7 | Detect "blocked by a dialog" and a disconnected host, with a clear error | §1, troubleshooting |
| C8 | Do **not** provide (user-only): raw-SO WB/Calibration, AI masks, Remove, standalone brush | §3 |

If a future connector lacks C3/C4 (no way to read/write the full filter), the workflow degrades to "agent plans, user applies" — record that in its adapter.

## 2. `engine.md` — new structure (move text, do not rewrite values)
Add a one-line **layer tag** to each section heading.

**Part A — Durable (Camera Raw / Photoshop behaviour, measurement)**
| Current § | Tag | Notes |
|---|---|---|
| §2 *Metrics vocabulary* + measurement tools list | DURABLE | `measure_all.py`/`wb.py` are connector-independent |
| §6 Camera Raw mask XMP schema | DURABLE | the XMP itself |
| §7 Remove tool — *what it is*, "user paints it, cannot be authored headless" | DURABLE | the `$Rtch` key name moves to Part B |
| §8 Calibrations | DURABLE | keep the "render path varies" caveat |
| §9 Who does what | DURABLE | it is the C8 boundary |
| §4 *Curves/selection* behaviour facts only (e.g. ProPhoto γ1.8 point mapping, Luminosity lift costs ~5 % chroma) | DURABLE | extract the two or three facts; rest is legacy |

**Part B — Access: adb-mcp (replace wholesale when the connector changes)**
| Current § | Tag | Notes |
|---|---|---|
| §1 Session setup (chain, proxy, UXP plugin, `uv run --directory`, `host is in a modal state`, `_id` changes, timeouts) | ACCESS | keep as-is; also keep "duplicate document, LrC closed, one doc open" under Part A "Preconditions" (they are about Photoshop, not the connector) |
| §2 *Getting a render* (duplicate→imageSize→save PNG, JPEG depth quirk) | ACCESS (C2) | |
| §3 batchPlay gotchas | ACCESS | |
| §4 PS selection masks + legacy layer recipes | ACCESS / LEGACY | candidate for the archive once nothing cites it |
| §5 apply / read / edit the filter (`$CrVe`, `$PrVN`, `$PrVe`, `$LCs`, `$BigT`, `$GLW*`, `$Rtch`, `filterFX` set) | ACCESS (C3/C4) | the *behaviours* (AI masks survive without `$BigT`, brush masks do not survive scripted writes, fresh SyncIDs, dialog re-save normalizes XMP) are Camera Raw facts → keep them in Part A §6 as "Write semantics" |
| §10 Tooling (`apply_filter.js`, `render_helper.js`, `ps_filter.js`, …) | ACCESS | |

Each Part B section gets a heading line `> Implements C1…C7 for adb-mcp.` so a replacement connector knows what to cover.

## 3. `WORKFLOW.md` §1 (Preconditions)
Replace the connector-specific lines with capability wording; details go to the adapter / `engine.md` Part B:
- "The Photoshop connector (see your adapter) is running and connected; if not, follow its setup. Never edit connector code from a session."
- Keep: duplicate document, LrC closed, no dialog open.
- Drop the UXP Reload/Connect sentence here (it stays in `engine.md` Part B §1 and `docs/running-a-session.md`).
Also §3's "Read the live filter and resend every key … omit `$BigT`" → "… omit the AI-mask bitmap blob (`$BigT` in adb-mcp)".

## 4. Adapters and docs (one line each, no content move)
- Each `agents/<agent>/ADAPTER.md`: add a **Photoshop access** line: which connector, which config file, "implements engine.md Part B".
- `docs/running-a-session.md` / `docs/installing-prerequisites.md`: mark the UXP/proxy sections "adb-mcp setup" so they are visibly the replaceable part.
- `tools/`: leave in place; `ps_filter.js` is Part B; add a header comment `// ACCESS layer: adb-mcp` to each connector-specific script (not `measure_all.py`, `wb.py`).

## 5. Merge checklist
1. Reorder/retag `engine.md`; run a grep that no playbook/materials/WORKFLOW line mentions `batchPlay|MCP|UXP|proxy|\$BigT|\$LCs`.
2. Update `recipes/README.md` table row for `engine.md` ("Part A durable / Part B access").
3. Delete this proposal in the same commit.
4. When a new connector arrives: write `engine.md` Part B′ for it, fill the capability table's "how" column, test C1–C7 once, then retire the old Part B.
