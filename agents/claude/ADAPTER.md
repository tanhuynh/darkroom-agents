# Claude adapter

Read with `WORKFLOW.md`. Only Claude-specific plumbing lives here. Two ways Claude runs this project:

## A. Claude app (desktop/web chat, linked to the Mac via the desktop app)
- **Folder access is per chat:** request `~/dev/darkroom-agents` at the start (and `~/dev/adb-mcp` only if server code is needed); deletion (git lock files, `measure/` cleanup) needs a separate per-chat permission. The Project instructions tell Claude to do this.
- **Photoshop:** MCP tools proxied through the device bridge (`mcp__remote-devices__Adobe_Photoshop_MCP_Server__*`, `…Batch_Play_MCP_Server__call_batch_play_command`). `config://get_instructions` is not reachable through the proxy — it's the generic adb-mcp prompt (source: `~/dev/adb-mcp/mcp/ps-mcp.py`); this repo's rules supersede it.
- **Shell:** `device_bash` is a Linux VM on the Mac with the connected folders under `$HOME/mnt/<folder>` — it **cannot run the Mac `.venv`** and has no scikit-image. Run `tools/measure_all.py` in Claude's cloud workspace instead: `device_stage_files` the render PNG + tools → run there (install `numpy scipy scikit-image opencv-python Pillow` if missing) → show overlays with `SendUserFile`. `tools/wb.py` also runs in the VM (pure numpy + OpenCV).
- **Renders:** batchPlay duplicate/resize/sRGB → `save_document_as(<repo>/measure/<id>_16.png, "PNG")` → stage → measure.
- **Writing files:** edit in the cloud workspace, then `device_commit_files` to the repo path (or edit in place with `device_bash`).
- **Git:** the VM has no identity → `git -c user.name="Tan Huynh" -c user.email=<from git log> commit …`. SSH to GitHub is blocked from the VM → the user pushes. `gh` GraphQL is blocked; REST works only for repos attached to the session.
- **Long calls:** heavy `set`s/renders may time out while succeeding → re-read state before retrying.

## B. Claude Code (terminal on the Mac)
- Start in the repo: `cd ~/dev/darkroom-agents && claude` → `CLAUDE.md` loads `WORKFLOW.md` + this adapter.
- MCP servers come from `.mcp.json` in the repo (repo-locked `uv run --directory ~/dev/adb-mcp/mcp mcp run …`; never `--with mcp`).
- Measurement runs locally: `.venv/bin/python tools/measure_all.py baseline|diff …`; open overlays with `open measure/<file>.png`.
- Normal git identity and SSH push work.

## Known tendencies (Claude maintains this section)
Agent-specific habits and quirks only — editing knowledge goes to `recipes/inbox/`.
- Tends toward restraint: lifts that are too timid on the mid-ground (0265 pass 2: +1% detail) — apply the structure pass (landscape §E) by default.
- Has made calibration slips in summaries (LocalTemperature once reported as 0.025 instead of ~0.15 b\*/0.01) — quote calibrations from `engine.md` §8, not from memory.
- Trusts a tool's `SUCCESS` echo over the state it should have produced (0025: `convertToProfile` echoed SUCCESS while a dialog was cancelled, so the baseline stayed ProPhoto) — read the state back (`get profile`, layer/filter) before measuring, and diff an unchanged re-render first.
- Announces causes from uncontrolled numbers (0025: blamed Clarity / a mask "leak" for a shift that was a render error) — run the control before naming a cause, and say "hypothesis" until a control confirms it.
- First background-quieting pass stops at Exposure + Texture (0025: Gemini's edit of the same frame also pulled Highlights −0.15 and Saturation −0.05, and looked better) — include Highlights and Saturation (playbook §B.1) from the start, then judge.
- Reads an annotated preview grid at the wrong scale (0025: labels were ×2 of the drawn grid, so a "head" box measured background) — put the full-resolution scale in the label and sanity-check a region on the image before drawing a conclusion from its numbers.
- Judges small local corrections at 2000 px (0025: the Eye radial read 0.00 there and was +1.5 L* / catchlight +3.2 L* at 1:1) and states a cause for a visual change before a control (0025: "Push may read weaker after the blur" — the four-way control showed no change) — render 1:1 for small masks, run the control first.
- After a Photoshop crash/restart, assumes the document is where it left it (0025: the last two scripted edits were gone, document `_id` and folder changed) — read the live filter and compare with the last written XMP first.
- Keep image previews minimal (session limits): plan in text, one batched call, one composite image per pass.
- Provenance tag for cases/proposals: `claude`.
