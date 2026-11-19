# Local adapter — Qwen3.8-27B (MLX 4-bit) in Bionic

Read with `WORKFLOW.md`. Only plumbing and this model's tendencies live here. Provenance tag: `local:qwen3.8-27b`.
Setup steps for the human: `docs/local-model-setup.md`.
Earlier plan was Qwen3-VL-8B; Qwen3.6-35B-A3B (also downloaded) is the fallback if the 27B is too slow.

## Model & runtime
- **Model:** `lmstudio-community/Qwen3.8-27B-MLX-4bit` (~15 GB, `qwen3_5` architecture, ships image/video preprocessors → **confirm vision works** with `view_image` before relying on it), in **Bionic** (shares `~/.lmstudio/models`; MCP servers are set in its UI, stored in `~/.lmstudio/apps/bionic/.internal/ng-mcp.json`). Dense 27B: expect roughly 15–20 tok/s at best on a 410 GB/s M4 Max.
- **Memory:** ~15 GB weights + KV cache + Photoshop on a 36 GB Mac → lower Photoshop's memory limit to ~40 % and keep context ≤ 32k until measured.
- **Context:** set the context length to **≥ 32k** (load-time setting; default is far lower). Budget below.
- **Photoshop access:** connector = adb-mcp via Bionic's MCP settings (`agents/local-qwen38-27b/bionic-mcp.json` lists the three servers; `photoshop` and `photoshop-batch-play` are already added, `darkroom` is added by hand in the UI) — implements `engine.md` capabilities C1–C7 via its ACCESS sections (§1–5, §10). On a connector swap, update this line and the MCP config.
- **No shell, no file access of its own.** Everything outside Photoshop goes through the **`darkroom` MCP server** (`tools/darkroom_mcp.py`):
  `read_file` / `search_repo` (knowledge, small slices) · `write_file` (only cases, inbox proposals, handoff, `measure/`, this ADAPTER.md — the write policy is enforced in code) · `prophoto_to_srgb` (render step) · `measure_baseline` / `measure_diff` (`tools/measure_all.py`) · `view_image` (renders and overlays, downscaled to 768 px by default) · `validate_xmp`.
- **Git:** none from the model. The user commits and pushes.

## How it loads the rules
Bionic does not read `CLAUDE.md`/`GEMINI.md`. Start every chat with the prompt in `agents/local-qwen38-27b/START.md`, which makes it read the files in a context-sized order. Verify: ask it to quote the write policy (WORKFLOW §5) — it must say rule changes go to `recipes/inbox/`.

## Context budget (32k)
Load order: `WORKFLOW.md` (but **not** the `@` imports — `read_file` returns raw text, so `engine.md`, `recipes/README.md`, `session-handoff.md` are read only when needed) → this adapter → the matching playbook → **one** case card. `engine.md` by section via `search_repo` + `read_file` slices: §6 (XMP), §8 (calibrations), §9 (who does what) matter most; §5 only to write the filter. Images cost tokens: one `view_image` per decision, never a gallery.

## Staged use (do not skip ahead; record results under Limits observed)
1. **Read-only:** `get_documents`, baseline render (exact calls in `agents/local-qwen38-27b/render-recipe.md` — read it, don't search for descriptors: duplicate merged → `imageSize` 2000 px → `save_document_as` PNG to `measure/<id>.png` → `prophoto_to_srgb`; **no `convertToProfile`**, pending-merge rule `recipes/inbox/2026-11-17-claude-0025-render-prophoto.md`) → `measure_baseline` on `<id>_srgb.png` → classify + WB read + critique (FIX/TASTE).
2. **Plan only:** full numerical Camera Raw plan in text; the user approves.
3. **Write one small correction:** one linear gradient or radial via `$LCs` — `validate_xmp` first, read the live filter, resend every key.
4. **Full pass** on an image with a finished case; benchmark against it (`docs/adding-an-agent.md` §4).

## Limits observed
- First session: with no hint it looked for the files in Bionic's own empty workspace / skills and reported "workspace is empty" → `START.md` now names `darkroom` `read_file` as the only way to read repo files.
- Bionic wraps tools in `call_mcp_tool`; **parallel calls dropped their parameters** (0025 run) → one call at a time (now in `START.md`).
- Vision works (0025: correct composition, blurred background, flat light) but misnamed the species ("black" for grey crowned crane) — don't trust identification details; measurements and `view_image` descriptions of tone/composition are fine.
- **GPU out of memory** (Metal `kIOGPUCommandBufferCallbackErrorOutOfMemory`) during prompt processing on a 36 GB Mac: 27B 4-bit (~15 GB) + 32k context + 1280 px image views + Photoshop → `view_image` default cut to 768 px; reload the model at 16k context; restart Bionic first (a helper held 9 GB after the crash).
*(fill in as sessions happen — tool-call reliability, XMP accuracy, max corrections per batch, image sizes it reads well)*

## Known tendencies (this agent maintains this section)
Agent-specific habits and quirks only — editing knowledge goes to `recipes/inbox/`.
- Over-deliberates when a tool prints something unexpected (0025 run: a harmless libpng iCCP warning produced pages of reasoning with no tool call) → the user cuts in with a direct instruction; name the next tool call and say what to ignore.

## Write policy
Same as every agent: cases directly; rule/material/engine changes as `recipes/inbox/` proposals; never edit `WORKFLOW.md`, another agent's adapter, playbooks, materials or engine.
