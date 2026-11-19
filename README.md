# darkroom-agents

AI-assisted RAW editing for Photoshop/Camera Raw: rules, recipes, and measurement tools that let an LLM agent
plan and apply **non-destructive Camera Raw Filter edits** (radials, gradients, Luminance/Color Range masks via
`batchPlay`), then verify them numerically in CIELAB.

The Photoshop bridge is a separate repo — a fork of [`mikechambers/adb-mcp`](https://github.com/mikechambers/adb-mcp),
checked out at `~/dev/adb-mcp`. This repo is model-neutral so Claude, Gemini, and (later) local models share one
workflow and can be benchmarked on the same images.

| Path | What |
|---|---|
| `WORKFLOW.md` | Shared, model-neutral rules (WB first → crop → FIX/TASTE critique → XMP plan → batched apply → measure → archive) and the write policy |
| `agents/` | Per-agent adapters (`claude/`, `gemini/`, `local/` template); `CLAUDE.md` / `GEMINI.md` import `WORKFLOW.md` + their adapter; `AGENTS.md` is the generic entry point |
| `recipes/` | `engine.md` (how), `playbooks/` landscape + wildlife (what: IF → DO → CHECK), `materials.md`, `cases/` (per-image cards, filter JSONs, `index.csv`), `session-handoff.md`; see `recipes/README.md` |
| `tools/` | `measure_all.py` (baseline / diff + overlays), `wb.py`, `m.py`, `diff.py`, render helpers |
| `comparisons/` | Model-vs-model benchmarks on the same image |
| `docs/` | `overview.md`, `installing-prerequisites.md`, `running-a-session.md`, `updating-recipes.md`, `adding-an-agent.md`, write-ups |
| `.gemini/`, `.agents/` | Agent MCP configs (point at the adb-mcp server) |

## Setup
```bash
cd ~/dev/darkroom-agents && uv venv && uv pip install -r requirements.txt
.venv/bin/python tools/measure_all.py baseline measure/<id>_16.png
```
MCP server: run from `~/dev/adb-mcp` (proxy: `cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js`, then connect the UXP plugin).
