# Local model adapter — template (not set up yet)

Copy to `agents/local-<model>/ADAPTER.md` when a local model is added (see `docs/adding-an-agent.md`).

## Fill in
- **Model & runtime:** e.g. Qwen3-VL via MLX / LM Studio / Ollama; context window; vision support (needed to look at renders).
- **MCP client:** which client connects the model to the adb-mcp servers, and its config file in this repo.
- **How it loads the rules:** does the client read a context file automatically? If not, the first prompt must be
  "Read WORKFLOW.md and agents/local-<model>/ADAPTER.md first."
- **Measurement:** `.venv/bin/python tools/measure_all.py …`; how overlays are shown.
- **Limits observed:** tool-call reliability, XMP generation accuracy, max corrections per batch, image size it can read.
- **Write policy:** same as every agent — cases directly, rule changes via `recipes/inbox/`. Provenance tag `local:<model>`.

## Context budget hint
Small context windows: load `WORKFLOW.md` + this adapter + the matching playbook + 1 case; load `engine.md` sections on demand (§5–6 for XMP, §8 for calibrations).
