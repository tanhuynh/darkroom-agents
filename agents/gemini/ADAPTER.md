# Gemini adapter

Read with `WORKFLOW.md`. Only Gemini-specific plumbing lives here.

## Gemini CLI (terminal on the Mac)
- Start in the repo: `cd ~/dev/darkroom-agents && gemini` → `GEMINI.md` imports `WORKFLOW.md` + this adapter.
  Verify once per session with `/memory show` (both files must appear); after edits use `/memory refresh`.
- **MCP servers** come from `.gemini/settings.json` (Mac `.venv` Python running `~/dev/adb-mcp/mcp/ps-mcp.py` and `ps-batch-play.py` directly — this needs the `__main__` entry points in the adb-mcp fork).
- **Measurement:** `.venv/bin/python tools/measure_all.py baseline|diff … --out-dir measure` (never ad-hoc scripts).
- **Show overlays:** `open measure/<composite>.png` right after each `measure_all.py` run.
- **Git:** local identity and SSH work; commit in `darkroom-agents` only. The user pushes unless asked otherwise.

## Antigravity IDE
- MCP config: `.agents/mcp_config.json` (same servers). Embed overlay PNGs inline in the response instead of `open`.
- If the IDE doesn't read `GEMINI.md`, start the session with: "Read WORKFLOW.md and agents/gemini/ADAPTER.md first."

## Conformance rules for Gemini (from the 2026-11 benchmarks)
- Follow the loaded playbook rules, not a generic contrast/histogram optimization. In particular: never dehaze or
  clarify the distant rim (depth cue); calm loud edges; keep the hero crisp rather than lifting it globally.
- Gemini's strength on 0265 — mid-ground structure and cloud modeling — is now in `recipes/playbooks/landscape.md` §E/§F; use those values.
- **Do not edit** `WORKFLOW.md`, `agents/claude/`, the playbooks, `materials.md` or `engine.md` directly. New lessons go to
  `recipes/inbox/<date>-gemini-<case>.md` using the template; case cards and filter JSONs may be written directly.
- Provenance tag: `gemini` (with model name if useful, e.g. `gemini:3.8-flash`).
