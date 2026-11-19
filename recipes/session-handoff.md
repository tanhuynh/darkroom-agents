# Session handoff — Photoshop + Camera Raw automation (Nov 18 2026, local-model bring-up in progress)

Loaded via `WORKFLOW.md` (+ your `agents/<agent>/ADAPTER.md`); load the matching playbook per image.

## Setup
- Server/proxy from `~/dev/adb-mcp` (fork of `mikechambers/adb-mcp`; local patch = `__main__` entry points, PR sent upstream).
  `cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js` → Photoshop → UXP Dev Tools Load/Reload "Photoshop MCP Agent" → Connect.
- Work in `~/dev/darkroom-agents` (connect it as the chat folder; measure PNGs go to `measure/`). Duplicate document, LrC closed, no open dialogs.
- Measurement: `tools/measure_all.py baseline|diff …` (never ad-hoc scripts); where it runs depends on the agent (see adapter).

## Workflow (user rules in bold; canonical text in `WORKFLOW.md` §2)
0. **Classify + load** (README "In a session").
1. `get_documents` / `get_layers` / doc info (size, raw SO type), baseline render.
2. **WB check first, before any edit** (`measure_all.py baseline`; `wb.py` for detail). Global cast → user fixes in the raw SO.
3. Composition / crop: weight map + crop mocks; non-destructive `crop` (`delete:false`); commit the crop before the user opens the filter dialog.
4. **Subject decision, then AI masks (user step):** the user makes the masks the frame supports (Select Subject; Sky / Landscape only if present). Agent reads, quality-gates (1:1 overlay), clones them; poor/missing → parametric fallback. Optional `measure_all.py --mask` alpha (PS proxy).
5. **Critique says what works** (composition, leading lines, DR, shadow detail, tonal balance) + top 2–3 FIX/TASTE. Ignore the mat; small clipping only matters for print.
6. **Plan all edits in text (stored + dialog values, mask source per correction), wait for approval, then apply as one batched call**; render → `measure_all.py diff` → adjust in follow-up passes.
7. **Before every scripted write: read the live filter and resend ALL keys** (`$GLW*`, `$Rtch`, …); omit `$BigT`.
8. **Remove: user paints it in a Camera Raw Filter, never in the raw SO dialog.** Save before the first scripted write after a Remove. Standalone brush work last.
9. After the user saves: archive step (`recipes/README.md`) — case JSON + card + index row; rule changes go to `recipes/inbox/` as proposals.
10. **Cleanup:** delete render PNGs in `measure/` (keep the folder). Commit in `darkroom-agents` (git details per adapter); the user pushes.

## Status
- 9 landscape cases (all Bryce, Nov 2026) + 2 wildlife cases — 0025 (grey crowned crane, saved `…/2026-10-31/_52_0025-2-Edit.tif`) and 9532 (servals tugging a fish, Nov 18 2026; **archived before the TIFF was saved: path and final size to confirm**) — `cases/index.csv`. `playbooks/wildlife.md` is still a draft: every rule is *(1 case)* (§A crop, §B.1/§B.2 background, §E Push-Pull from 0025; §F multi-subject, §B.1 desaturation, accent calm from 9532).
- **Render recipe changed (pending merge):** save the ProPhoto 16-bit PNG and convert with `tools/prophoto_to_srgb.py`; `convertToProfile` can pop a dialog and echo SUCCESS when it is cancelled (see inbox). Until merged, verify the profile (`get profile`) before measuring.
- Pre-Nov-16 nested recipes history: `~/dev/recipes-history.git`. Pre-restructure library: `recipes/archive/`.

## Local model (in progress — Nov 18 2026)
- Setup is in `agents/local-qwen38-27b/` (adapter, `START.md`, `render-recipe.md`, `bionic-mcp.json`), `docs/local-model-setup.md`, and `tools/darkroom_mcp.py` (shell-less MCP server: read/search/write with the write policy enforced, `prophoto_to_srgb`, `measure_*`, `view_image` 768 px, `validate_xmp`). Runtime is **Bionic** (shares `~/.lmstudio/models`); servers `photoshop`, `photoshop-batch-play`, `darkroom` are configured in its UI.
- **Benchmark target:** case 0025 (the crane). The model must not read any 0025 file (card, JSON, inbox) — tell it explicitly.
- **Done:** file access via `darkroom`; render recipe worked (2000×1334 16-bit ProPhoto PNG → `measure/0025-local-base_srgb.png`); vision read the image correctly (species slip: "black" for grey crowned crane). **Not done:** `measure_baseline`, classification/WB/critique, plan, any write.
- **Blocker:** Qwen3.8-27B-MLX-4bit (~15 GB) ran out of GPU memory (Metal `OutOfMemory`) during prompt processing on the 36 GB Mac, twice, with Photoshop open; swap near full. Slow even before that (dense 27B, long context).
- **Next (tomorrow):** quit Bionic fully (a `node` helper held 9 GB), lower Photoshop memory to ~40 %, load **Qwen3.6-35B-A3B-MLX-4bit** at **16k** context (has vision files, smaller KV, ~3B active → faster), confirm vision, then repeat the render + `measure_baseline` and the read-only stage. If it works: rename the adapter dir/provenance (`local:qwen3.6-35b-a3b`) and update refs; if not: try an 8B VL model or plan for 64 GB.
- Findings from the run (adapter "Limits observed"): Bionic wraps tools in `call_mcp_tool` and drops params on parallel calls (one at a time); the model first searched Bionic's empty workspace (use `darkroom` `read_file`); it over-deliberates on unexpected warnings (give it the next tool call explicitly). Inbox: `2026-11-18-claude-0025-png-iccp.md` (PNG embeds ProPhoto iCCP; libpng warning harmless).

## Agents
- Shared rules `WORKFLOW.md`; adapters `agents/claude/`, `agents/gemini/`, `agents/local-qwen38-27b/` (Bionic, in bring-up), `agents/local/` (template). Inbox: `recipes/inbox/` — 10 proposals awaiting review: 0025 (render-prophoto, radial-maskinverted, cloned-ai-mask, bisect-protocol, calibrations, lens-blur-keys, ps-filter-tool, png-iccp) and 9532 (crop-tool-commit, calibrations, wildlife-composition).

## Open items
- **AI-mask-first workflow (Nov 19):** `WORKFLOW.md` §2 steps 3–4 changed (crop → subject decision → user-made AI masks → gate → clone); `measure_all.py --mask` built and synthetic-tested (`tools/test_measure_mask.py`). Still to do: read-only check on a real wildlife frame (render + PS `select_subject` alpha vs the Camera Raw mask), verify the intersect form (AI ∩ Luminance/Color Range) with a 1:1 control, merge inbox `cloned-ai-mask` into `engine.md` §5/§6.
- More wildlife frames to verify/revise `playbooks/wildlife.md` (0025: Eye, Push-subtract and Lens Blur interaction are now checked; the saved TIFF loses fine feather tips to the Lens Blur — accepted as good enough; next time paint stray tips into the subject depth before saving; Select Subject, Remove and Lens Blur are user steps, the filter JSON cannot replay `$BigT`).
- `tools/apply_pushpull_filter.js`, `apply_step4_filter.js`, `build_pushpull*_xmp.py`, `get_filter.js`, `render_prophoto.js` are Gemini's 0025 scratch scripts (image-specific, stale mask digests), committed as examples; `tools/ps_filter.js` is the general read/write tool that replaces them.
- 9532: confirm the saved TIFF's size (expected 7784×4865, x 0–7784, y 150–5015) and path; if Photoshop's Crop tool box is pending, scripted commands can revert the crop — Esc first (inbox).
- `measure_all.py` / `wb.py` cannot sample a patch (WB table is whole-frame; `wb.py` is landscape-oriented) — wildlife WB needs neutral-patch sampling and region stats (heads vs bodies vs background, accent chroma/clipping).
- `measure_all.py` wildlife metrics: subject vs background separation across the mask edge, background busyness, crop/lead-room simulator.
- Not yet observed: standalone Brush XMP, Depth *masks* (Lens Blur depth corrections are now seen: `$Lblr`, `$DMIn`, `DepthBasedCorrections` — see inbox). Lens Blur can be toggled by script (`crs:Active` in `$Lblr`) but not created headless.
- `acr.py` / `acr_band.py` XMP builders were never committed — rebuild in `tools/` when next needed.
