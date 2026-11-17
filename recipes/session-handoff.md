# Session handoff — Photoshop + Camera Raw automation (Nov 16 2026, after 0265)
Paste this into the new session together with **ps-acr-recipes.md** (full reference), **acr.py** (XMP builder), **acr_band.py**, **measure_all.py** (unified measurement — use this; `wb.py` / `m.py` / `diff.py` are its components). `crf-*.json` are worked examples — attach one only if the new image is similar (fog pano → `crf-9956-final.json`).

## Setup (unchanged)
- Chain: chat ⇄ remote-devices ⇄ MCP servers (Claude Desktop) ⇄ node proxy :3001 ⇄ UXP plugin ⇄ Photoshop.
- Each session: `cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js` → Photoshop → UXP Dev Tools: Load/**Reload** "Photoshop MCP Agent" → Plugins › Photoshop MCP Agent › **Connect**. (`No clients registered for application: photoshop` = plugin not connected.)
- Connect `~/dev/adb-mcp` as a folder in the Claude app (measure PNGs go to `measure/`). Open a DUPLICATE of the image. Quit LrC. **Close every dialog before Claude acts** (else "host is in a modal state").

## Unified Measurement & Visual Proof Script
- Always use `/Users/tanhuynh/dev/adb-mcp/mcp/.venv/bin/python /Users/tanhuynh/dev/adb-mcp/recipes/measure_all.py` instead of writing ad-hoc measurement scripts or calling `wb.py`, `m.py`, and `diff.py` separately:
  - **Baseline & Crop Check:** `measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]`
  - **Post-Pass Diff & Overlays:** `measure_all.py diff <before.png> <after.png> [--hero x0,y0,x1,y1]`

## Workflow (user rules in bold)
1. Claude: `get_documents` / `get_layers`, read doc info (size, raw SO type, existing raw settings), baseline render.
2. **WB check first, before any edit** — run `measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]` (see below); fog/sky by density bins; distinguish rock-scatter warmth from a cast. Fix in the raw SO (user double-click) or filter Tint as fallback.
3. Composition discussion: metrics (detail/weight map) + crop mocks with thirds grid; non-destructive `crop` (`delete:false`).
4. **Feedback includes what works** (composition, leading lines, DR retention, shadow detail, tonal balance) plus top FIX/TASTE items. Ignore the mat; don't chase small clipping numbers unless it's for print.
5. One correction at a time in **one Camera Raw Filter**: render → measure → adjust. Start low; dark subjects need ~1.5–2× the exposure; hazy areas need Dehaze ≥ +0.25.
6. **Before every scripted write: read the live filter and resend ALL keys** (user's Glow `$GLW*`, `$Rtch` Remove, …). `$BigT` can be omitted — AI masks and Generative Remove patches survive (verified 9956).
7. Removals: user paints Camera Raw **Remove** (Generative) **in a Camera Raw Filter on the layer — never in the raw SO dialog** (raw-SO settings aren't readable, so no recipe). Save before the first scripted write after a Remove (revert = safety net).
8. After the user saves: Claude writes `crf-<id>-final.json` and updates the recipe library.
9. **Cleanup after each image** (once the recipe is written): delete the render PNGs in `~/dev/adb-mcp/measure/` (scratch, ~10 MB each; keep the folder). Commit in the `adb-mcp` repo (recipes/ is tracked there since Nov 16; the old nested recipes repo history is archived at `~/dev/recipes-history.git`). Pass `-c user.name/-c user.email` (the device shell has no git identity); the user pushes (`git@github.com:tanhuynh/adb-mcp.git`, SSH isn't reachable from the device shell).

## Done so far
| Image | What made it work | Status |
|---|---|---|
| 9822 fog hill | Crest dehaze band, rock lift, red band burn | saved |
| 9861 fog hoodoo | WB → raw; forest Dehaze + Clarity; small rock lift (+0.06); 16:9 crop | saved |
| 9785 storm amphitheater | Light pool, frame burn, mesa detail, sky top, cloud glow | saved |
| 9792 near-raw fog/gorge | Land lift, sky texture, gorge dodge (Radials ∩ Luminance Range), 4:3 crop, manual Remove | saved |
| **9956 fog pano** | WB OK (rock scatter, not cast); 2.4:1 crop; Fog glow (LumRange ∩ Radial, Exp +0.10, Tint −0.15); Hub light (LumRange skips crevices, Exp +0.17); Foreground haze (Dehaze +0.25); user Glow 28; Generative Remove of foreground spine | saved (`…/2026-11-01/_52_9956-Pano-Edit.tif`) |
| **9956 revisit (PM)** | Fog rock edges (Texture/Clarity ∩ rock-tone range, +20…39% detail); Crevice lift (darks only, gentle); Right edge Exp −0.06 (fog edge flat with interior); Window fin Clarity/Texture +0.20, Dehaze +0.15; BR calm. Tree lift in crevices abandoned (not maskable under fog) | saved, 8 corrections |
| **0028 hoodoo bowl** | WB cast fixed in raw SO (eyedropper on white tower); spire lift + surround darken; tree pools (spot radials ∩ LumRange); user pine deepen (∩ Color Range), FG vignette minus spire, Blue primary Sat +7; left-trim crop 1.40:1 | saved (`…/2026-11-01/_52_0028-Edit.tif`) |
| **0013 fog-gap canyon** | WB cyan cast → 5300/+7 (Tint matters); 16:9 sky trim; sky gradient ∩ bright; hero crispness > lift; tree pools (skip far forest); distant ravines ∩ shadows; user object-mask pine | saved (`…/2026-11-01/_52_0013-Edit.tif`) |
| **0044 sunrise amphitheater** | WB OK (clouds neutral a* +0.08, b* +0.48); 3:2 native framing; Hero Contrast (Texture +15, Clarity +15, Exp +0.30 EV dialog ∩ LumRange); Mesa flare Dehaze +25 + Shadows +15; Sunlit Hoodoo tips (Exp +0.30 EV, Whites +10, Temp +6); FG tree calming (Exp -0.40 EV ∩ LumRange); Hero detail +27%, dL +4.3, zero sky spill | saved (`…/2026-11-02/_52_0044-Edit.tif`) |
| **0265 midday amphitheater** | WB as shot (only deep forest shadows blue → local Temp +0.30 on darks); 16:9 full-width crop (spire on right third); BR calm (Exp −0.08, Hl −0.15, Sat −0.10, + Texture −0.15/Clarity −0.10 in pass 2); hero Clarity/Texture +0.22; mid shadows +0.15; BL calm; cloud Hl −0.25. 2 passes, user stopped with weight still bottom-right (looks right) | `crf-0265-final.json` |


## Learned this session
- Remove schema = filter key `$Rtch` (`crs:RemoveAreas`, `heal_patchmatch`, `fill_method="firefly"`, Mask/Paint dabs); pixels in `$BigT`.
- Scripted writes after Remove are safe if `$Rtch` + all slider keys are resent.
- Filter-level dialog sliders (Glow) come back as `$GLWA/$GLWR/$GLWS/$GLWW/$GLST/$GLWD/$GLSF`.
- Pinkish fog: Saturation alone removes yellow, not magenta → LocalTint −0.15.
- Heavy pano re-renders can time out the MCP call while still succeeding → check state, don't blindly retry.

## Learned (PM)
- Pixels to Claude: `save_document_as(..., "PNG")` + `device_stage_files`; batchPlay `save` with a path fails (file token). 16-bit PNG if saved before `convertMode`.
- Judge Texture and shadow data on a full-res crop, not the 2000 px preview.
- Bright fog burns ~2× harder than rock: edge burns Exp ≤ −0.06; aim for edge ≈ interior.
- Trees in fogged crevices = same tone/hue as shaded rock → don't attempt with range masks.
- Big sets time out ~50% while succeeding → render to verify.

## Learned (0028)
- Without fog, dark trees lift cleanly with spot radials ∩ Luminance Range; vary the spots.
- Bottom burns/vignettes must subtract the hero radial.
- Raw-SO edits (WB, Calibration) aren't readable → user reports values; record as manual.

## Learned (0013)
- Local Exposure: dialog = 4 × stored (confirmed). Quote dialog values.
- Object masks (Mask/Image) live in `$BigT`; omit it on scripted writes, rebuild from the live `$LCs`.
- Long `get smartObject` results with `$BigT` get truncated in chat → extract `$LCs` from the saved tool-result file.

## Open items
- Still not observed: Brush (standalone), Depth masks.

## Learned (0265)
- **Default plan = subject edit + mid-ground structure pass** (Claude-vs-Gemini merge, pass 5): lift midtone faces (Lum `0.16/0.26/0.55/0.70`, Exp +0.08, Shadows +0.10) + Clarity/Texture +0.15 on the same range; keep crevices ≤ original L*; no Shadows on color-only shadow fixes. Mid detail +1% → +13% with the subject edits intact.
- `wb.py` is now generic (auto-horizon sky/cloud bins, fog/haze bins, pale-rock bins, darks/foliage bins, hue histogram, clipping; pure numpy, runs in the device VM too). Only deep darks blue + lit foliage green = skylight in open shade → local fix.
- **`LocalTemperature` ≈ +0.15 b* per +0.01 stored** on darks (L* 10–20); a darks-only mask also warms shaded red rock (b* +2.7 at +0.30).
- Visual weight on busy rubble is texture-driven: burns barely move it; Texture/Clarity negative does. Treat the weight ratio as a guide — stop when the eye lands on the hero.
- Hero Texture/Clarity gains under-read at 2000 px (+11% vs visibly crisper at 1:1).
- Six corrections in one first-apply call worked; pass-2 edits = read live filter → edit `$LCs` → `set` all keys.
- Photoshop can reissue the document `_id` mid-session (143 → 194) — re-read before targeting.

