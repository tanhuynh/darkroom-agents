# Session handoff — Photoshop + Camera Raw automation (Nov 17 2026, after the recipe restructure)

Loaded via `WORKFLOW.md` (+ your `agents/<agent>/ADAPTER.md`); load the matching playbook per image.

## Setup
- Server/proxy from `~/dev/adb-mcp` (fork of `mikechambers/adb-mcp`; local patch = `__main__` entry points, PR sent upstream).
  `cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js` → Photoshop → UXP Dev Tools Load/Reload "Photoshop MCP Agent" → Connect.
- Work in `~/dev/darkroom-agents` (connect it as the chat folder; measure PNGs go to `measure/`). Duplicate document, LrC closed, no open dialogs.
- Measurement: `tools/measure_all.py baseline|diff …` (never ad-hoc scripts); where it runs depends on the agent (see adapter).

## Workflow (user rules in bold)
0. **Classify + load** (README "In a session").
1. `get_documents` / `get_layers` / doc info (size, raw SO type), baseline render.
2. **WB check first, before any edit** (`measure_all.py baseline`; `wb.py` for detail). Global cast → user fixes in the raw SO.
3. Composition / crop: weight map + crop mocks; non-destructive `crop` (`delete:false`).
4. **Critique says what works** (composition, leading lines, DR, shadow detail, tonal balance) + top 2–3 FIX/TASTE. Ignore the mat; small clipping only matters for print.
5. **Plan all edits in text (stored + dialog values), wait for approval, then apply as one batched call**; render → `measure_all.py diff` → adjust in follow-up passes.
6. **Before every scripted write: read the live filter and resend ALL keys** (`$GLW*`, `$Rtch`, …); omit `$BigT`.
7. **Remove: user paints it in a Camera Raw Filter, never in the raw SO dialog.** Save before the first scripted write after a Remove. Standalone brush work last.
8. After the user saves: archive step (`recipes/README.md`) — case JSON + card + index row; rule changes go to `recipes/inbox/` as proposals.
9. **Cleanup:** delete render PNGs in `measure/` (keep the folder). Commit in `darkroom-agents` (git details per adapter); the user pushes.

## Status
- 9 landscape cases (all Bryce, Nov 2026) + 1 wildlife case (0025, grey crowned crane, Nov 17 2026) — `cases/index.csv`. `playbooks/wildlife.md` is still a draft: 0025 supports §A crop and §B.1 Texture only, as *(1 case)*.
- **Render recipe changed (pending merge):** save the ProPhoto 16-bit PNG and convert with `tools/prophoto_to_srgb.py`; `convertToProfile` can pop a dialog and echo SUCCESS when it is cancelled (see inbox). Until merged, verify the profile (`get profile`) before measuring.
- Pre-Nov-16 nested recipes history: `~/dev/recipes-history.git`. Pre-restructure library: `recipes/archive/`.

## Agents
- Shared rules `WORKFLOW.md`; adapters `agents/claude/`, `agents/gemini/`, `agents/local/` (template). Inbox: `recipes/inbox/` — 5 proposals from 0025 (render-prophoto, radial-maskinverted, cloned-ai-mask, bisect-protocol, calibrations) awaiting review.

## Open items
- More wildlife frames to verify/revise `playbooks/wildlife.md` (0025 left open: eye correction unverified at 1:1; Select Subject + Remove are user steps, the filter JSON cannot replay `$BigT`).
- `measure_all.py` wildlife metrics: subject vs background separation across the mask edge, background busyness, crop/lead-room simulator.
- Not yet observed: standalone Brush XMP, Depth masks, Lens Blur via script.
- `acr.py` / `acr_band.py` XMP builders were never committed — rebuild in `tools/` when next needed.
