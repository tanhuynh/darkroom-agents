# Local model adapter — template (not set up yet)

Copy to `agents/local-<model>/ADAPTER.md` when a local model is added (see `docs/adding-an-agent.md`).

## Fill in
- **Photoshop access (fill in):** connector = adb-mcp (the client's MCP config) — implements `engine.md` capabilities C1–C7 via its ACCESS sections (§1–5, §10). On a connector swap, update this line and the MCP config.
- **Model & runtime:** e.g. Qwen3-VL via MLX / LM Studio / Ollama; context window; vision support (needed to look at renders).
- **MCP client:** which client connects the model to the adb-mcp servers, and its config file in this repo.
- **How it loads the rules:** does the client read a context file automatically? If not, the first prompt must be
  "Read WORKFLOW.md and agents/local-<model>/ADAPTER.md first."
- **Measurement:** `.venv/bin/python tools/measure_all.py …`; how overlays are shown.
- **Limits observed:** tool-call reliability, XMP generation accuracy, max corrections per batch, image size it can read.
- **Write policy:** same as every agent — cases directly, rule changes via `recipes/inbox/`. Provenance tag `local:<model>`.

## Same workflow for every agent
Don't redefine the order of work here: it is `WORKFLOW.md` §2 for all agents (crop → subject decision → user-made AI masks → critique → plan). An adapter may add *gates* that stop the model at those steps (e.g. staged autonomy for a weak model), never reorder or skip them.

## Context budget hint
Small context windows: load `WORKFLOW.md` + this adapter + the matching playbook + 1 case; load `engine.md` sections on demand (§5–6 for XMP, §8 for calibrations).
