# darkroom-agents — project overview

## What it is
An AI-assisted RAW editing workflow for Photoshop + Camera Raw. An LLM agent measures the image (CIELAB white balance,
tone, detail, visual weight), critiques it (FIX vs TASTE), proposes a numerical plan, and — after approval — writes
**non-destructive** local corrections (radials, gradients, Luminance/Color Range masks) into a single Camera Raw Filter
via `batchPlay`. Every slider stays hand-editable. Each pass is verified numerically and visually.

The same knowledge base serves several agents (Claude, Gemini, later local models), which can also be benchmarked
against each other on the same image.

## Architecture
```
 agent (Claude app / Claude Code / Gemini CLI / local model)
   │  MCP (stdio)
   ▼
 adb-mcp servers  ── ~/dev/adb-mcp  (fork of mikechambers/adb-mcp; ps-mcp.py, ps-batch-play.py)
   │  websocket :3001
   ▼
 node proxy (adb-proxy-socket) ──► UXP plugin "Photoshop MCP Agent" ──► Photoshop / Camera Raw
                                                                        │ 16-bit PNG renders
 tools/measure_all.py ◄──────────────────────────────────────────────────┘
```

## Two repos
| Repo | Path | Holds | Changes |
|---|---|---|---|
| `tanhuynh/adb-mcp` (fork) | `~/dev/adb-mcp` | the MCP servers + UXP plugin + proxy | rarely; `git fetch upstream && git merge upstream/main` to follow Mike's changes |
| `tanhuynh/darkroom-agents` | `~/dev/darkroom-agents` | everything below | every editing session |

## This repo
| Path | Purpose |
|---|---|
| `WORKFLOW.md` | Shared, model-neutral rules: session steps, Camera Raw rules, write policy |
| `agents/<agent>/ADAPTER.md` | Per-agent plumbing: how that agent reaches Photoshop, files, shell, git; its known tendencies |
| `CLAUDE.md`, `GEMINI.md` | Two-line entry files that import `WORKFLOW.md` + the agent's adapter |
| `AGENTS.md` | Entry point for other tools that read the AGENTS.md convention |
| `recipes/` | Knowledge: `engine.md` (how), `playbooks/` (what), `materials.md`, `cases/` (+ `index.csv`), `inbox/` (proposals), `archive/` |
| `tools/` | `measure_all.py` (baseline / diff + overlays), `wb.py`, helpers |
| `comparisons/` | Agent-vs-agent benchmarks on the same image |
| `docs/` | This documentation and write-ups |
| `measure/` | Render scratch (git-ignored, cleared after each image) |
| `.mcp.json`, `.gemini/`, `.agents/` | MCP configs for Claude Code, Gemini CLI, Antigravity |

## Knowledge model (why it is layered)
- **Engine** — Photoshop/Camera Raw mechanics, true everywhere.
- **Playbooks** — principles as IF measurement → DO → CHECK, per genre (landscape, wildlife). Values are ranges with a check, not presets.
- **Materials** — how surfaces behave (sandstone, fog, foliage, snow, fur…), so a new place adds entries instead of rewriting rules.
- **Cases** — one card + filter JSON per finished image, tagged for retrieval. Episodic memory.
- **Inbox** — agents propose rule changes; the user reviews before they become shared knowledge.

See `docs/running-a-session.md` (day-to-day use), `docs/updating-recipes.md` and `docs/adding-an-agent.md`.
