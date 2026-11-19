# Local model setup — Bionic + Qwen3.8-27B (Mac)

Reuses the repo and the adb-mcp servers; adds one small server (`tools/darkroom_mcp.py`) because Bionic gives the model no shell or file access. Hardware notes: 36 GB Mac Studio — lower Photoshop's memory limit (Settings › Performance) to ~40 % while the model is loaded.

## One time
1. `cd ~/dev/darkroom-agents && uv pip install -r requirements.txt` (adds `mcp[cli]<2` to the venv).
2. Install **Bionic** (done) and download `Qwen3.8-27B-MLX-4bit` (done; ~15 GB in `~/.lmstudio/models/lmstudio-community/`).
3. Load the model → set **Context Length 32768** (not more until measured).
4. MCP servers (Bionic UI): `photoshop` and `photoshop-batch-play` are added. **Add a third, `darkroom`** — type `stdio`, command `/Users/tanhuynh/dev/darkroom-agents/.venv/bin/python`, args `/Users/tanhuynh/dev/darkroom-agents/tools/darkroom_mcp.py`, cwd `/Users/tanhuynh/dev/darkroom-agents` (same as `bionic-mcp.json`). Enable all three.
5. Smoke test the repo server without Bionic: `.venv/bin/python tools/darkroom_mcp.py` should start and wait (Ctrl-C to stop).

## Each session
1. Proxy + UXP plugin as in `docs/running-a-session.md` §0–1 (Photoshop open, duplicate document, no dialogs).
2. New Bionic chat with the model loaded; allow its tool calls when prompted.
3. Paste `agents/local-qwen38-27b/START.md`. Check it quotes the write policy.
4. Work through the staged use in `agents/local-qwen38-27b/ADAPTER.md` (read-only → plan → one small write → full pass).
5. Commit and push yourself; the model has no git.

## Bring-up checklist (record results in the adapter's *Limits observed*)
- [ ] `darkroom` tools listed in the chat; `read_file WORKFLOW.md` works.
- [ ] `get_documents` returns the open document.
- [ ] `measure_baseline` on a 2000 px render, then `view_image` of the crop preview.
- [ ] It reproduces the write policy and refuses to edit `engine.md` (`write_file` will also refuse).
- [ ] Plan for a known image (e.g. one with a finished case) lands within the case's numbers.
- [ ] A scripted filter write keeps every existing key (compare the live filter before/after).

## If it struggles
- Tool calls malformed / skipped → try the 8-bit quant, shorten the system prompt, reduce loaded tools.
- Forgets rules mid-session → re-paste `START.md` step 3 and re-read WORKFLOW §3.
- Too slow / out of memory → lower context to 24k, close other apps, or pick a smaller quant. Alternative already downloaded: Qwen3.6-35B-A3B (4-bit, ~15 GB, ~3B active → much faster; check it has vision).
- Menu names depend on the Bionic version; Bionic stores its servers in `~/.lmstudio/apps/bionic/.internal/ng-mcp.json` (let the UI write it; don't hand-edit).
