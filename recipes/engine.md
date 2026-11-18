# Engine — how to drive Photoshop + Camera Raw headlessly

Genre- and location-free mechanics: setup, measurement, batchPlay, Camera Raw XMP, calibrations.
*What* to edit lives in `playbooks/`; material behavior in `materials.md`; worked examples in `cases/`.
Verified on Camera Raw 19.0, Photoshop (Beta, Developer Mode), Canon R5 II CR3 / pano DNG, Nov 2026.

## 1. Session setup
- Chain: chat ⇄ remote-devices ⇄ MCP servers ⇄ node proxy :3001 ⇄ UXP plugin ⇄ Photoshop.
- `cd ~/dev/adb-mcp/adb-proxy-socket && node proxy.js` → Photoshop → UXP Dev Tools: Load/**Reload** "Photoshop MCP Agent" → Plugins › Photoshop MCP Agent › **Connect**.
- Proxy log `No clients registered for application: photoshop` = proxy up, plugin not connected → Reload plugin → Connect.
- Claude Desktop launches the servers repo-locked: `uv run --directory ~/dev/adb-mcp/mcp mcp run ps-mcp.py` (and `ps-batch-play.py`). **Never `--with mcp`** (pulls SDK 2.x without FastMCP). Gemini/Antigravity launch `python ps-mcp.py` directly (needs the `__main__` entry point in the adb-mcp fork).
- Work on a **duplicate** document. Quit LrC. One doc open, PS memory ~60%.
- **Close every PS / Camera Raw dialog before acting** — otherwise `host is in a modal state`.
- User saves edits as TIFF next to the source (`/Volumes/Photos2/root/<year>/<date>/<name>-Edit.tif`); `get` document → `path` / `saved`. Home path: `get` application `preferencesFolder`.
- **Document `_id` can change mid-session** (reopen, crash recovery: 143 → 194; layer renamed `_52_00281`) → `get_documents` before targeting by `_id`. After a PS crash: restart proxy + plugin Connect; auto-recovery may restore the duplicate *with* raw edits.
- Heavy re-renders (152 MP pano, big `set`s) can time out the MCP call (`Could not connect… Timed Out`) while the command **succeeds** (~50% on big sets) → check state / render before retrying; never blind-retry a write.

## 2. Measurement loop
Always measure with `tools/measure_all.py` (one call per checkpoint):
- `…/.venv/bin/python tools/measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]` — WB bins, 3×3 weight grid, crop grid preview.
- `… diff <before.png> <after.png> [--hero x0,y0,x1,y1]` — regional table, tonal bands, `before_after`, `|ΔL*|×15` `diffmap`, `Δb*` `dbmap`, `hero_zoom`.
- `tools/wb.py` = the detailed WB density-bin check (auto horizon; sky/cloud, fog/haze, pale-rock, darks/foliage bins).

**Getting a render:** batchPlay [`duplicate` (merged) → `imageSize` 2000 px long edge → `convertToProfile` sRGB (colorimetric, BPC)], then `save_document_as(path, "PNG")` → **16-bit PNG** → `device_stage_files` → numpy; `close` the measure doc by `_id` (if PS already closed it, `close` errors "Cannot read properties of null" → `get_documents` first).
- batchPlay `save` with a `_path` fails ("invalid file token"); `save_document_image_as_png` → "No raw image data".
- For a visual JPEG: run `convertMode` depth 8 **as its own call** (inside a batch it silently doesn't run → "Only 8 bit image data can be encoded as jpeg"); fetch the image **after** the batch returns. `get_document_image` fails on 16-bit docs. Standalone `convertToProfile` on an sRGB doc → "parameters not currently valid" (harmless).
- **Full-res check** (Texture, "is there data in the shadows"): duplicate merged → `crop` `delete:true` → save PNG. The 2000 px preview under-reads Texture/Clarity (8.5× downsample): +0.22/+0.22 read +11% at 2000 px but was clearly crisper at 1:1.

**Metrics vocabulary**
- Tone: median L*, p5/p95, p1 (crushed?), p99.9 (clipped?).
- Color: **Lab C\*** (HSV saturation hides chroma loss); hue angle; a*/b* on neutrals.
- Local contrast ("detail"): std of `L − gaussian(L, σ≈2.5)` per region — separates *darker* from *flatter* (Exp burn −25% detail; Dehaze +10% at the same L*).
- Visual weight: `detail × (C*+5) × |L − median|`, blurred (σ≈40 px). Highest weight not on the subject → crop or calm it. Guide, not target.
- Mask verification: render diff `|ΔL*|×15` shows the effective mask; `Δb*×25` shows color edits.

## 3. batchPlay gotchas
- A multi-command batch echoes **only the first command**; a failure mid-batch **silently skips the rest** → verify state after; send risky steps alone.
- Curves: `make` adjustmentLayer (curves, luminosity) **then** `set` targetEnum with points (points inside `make` are ignored). Inputs are ProPhoto γ1.8: in ≈ 255·Y^(1/1.8); 100→112 ≈ +5 L* near L*50.
- Luminosity-mode lifts cost ~5% chroma → pair with Saturation +5 (Vibrance alone recovers little).
- **Never `select` the `mask` channel to paint it** — can toggle Quick Mask; exit with `clearEvent` on `quickMask`.
- Nest a stack: `select` top, `addToSelectionContinuous` bottom, `newPlacedLayer`. Unwrap an outer SO: `placedLayerConvertToLayers` (render pixel-identical).
- Duplicated SO layers are linked instances (raw-level edit shows in all).
- Non-destructive crop: `crop` with `delete:false` (layer keeps hidden pixels; bounds go negative).

## 4. Photoshop selection masks (legacy layer workflow; prefer Camera Raw masks)
| Need | Recipe |
|---|---|
| Land vs fog/sky | `select_subject(SO)` — on landscapes returns **all land**, not "the subject" |
| Sky | `select_sky(SO)` (+ `inverse`) |
| Mask ∩ polygon | `set selection to [mask, layer]`, then `intersectWith` `_target: selection`, `to: {polygon…}`, `feather` (reverse form → "not available") |
| Soft stratum boundary | `subtractFrom` a feathered `rectangle` (feather 100 px) at a row found by per-row brightness |
| Gradient mask | clear selection, make layer, select `mask`, `gradientClassEvent` linear |
| Smart-filter mask | with selection: `delete` channel `filterMask`, `make new: channel at: filterMask using: revealSelection`; toggle `filterMaskEnable` |
- Polygon from preview: doc px = preview px × (doc width / preview width); 20 px feather on true edges; verify with a zoomed diff (first try spilled ~40 px).
- Adobe cloud connector prompt masks → seams; Prompt-to-Edit is generative → never for tonal work.
- Legacy layer recipes (before everything moved into one Camera Raw Filter):
  | Recipe | Values | Mask | Result |
  |---|---|---|---|
  | Rock lift | Curves Lum 100→112 (192, 255 pinned) | inverted sky / select_subject | +4.7 L* (9822) |
  | Restore chroma after lift | Vibrance +10, Sat +5 | same | C* back to baseline |
  | Bottom burn | Curves Lum 100→84, 220→215 | gradient bottom → 62% | bottom under ridge (9689) |
  | Red stratum burn | Curves Lum 100→86 | rock ∩ polygon − feathered rect | −4.8 L*, C* +1 (9822) |
- To edit a nested SO later: double-click the layer → inner document → adjust → save/close.
- PS → Camera Raw mapping: Curves-Luminosity lift/burn → `LocalExposure2012`; polygon → intersected linear gradients; `select_subject` rock → Color Range on rock.

## 5. Camera Raw Filter — apply, read, edit
**Apply** (selected SO layer → editable Smart Filter; only sent keys change):
```json
{"_obj":"Adobe Camera Raw Filter","$CrTx":15,"_options":{"dialogOptions":"dontDisplay"}}
```
**Apply with all local corrections in one call** (verified 9785, 0265 with 6 corrections):
```json
{"_obj":"Adobe Camera Raw Filter","$CrVe":"19.0","$PrVN":6,"$PrVe":251920384,"$LCs":"<XMP>","_options":{"dialogOptions":"dontDisplay"}}
```
(Batched after a `select`, the response is empty → confirm with `get smartObject`.)

**Read:** `get` `smartObject` on the layer → `filterFX[i].filter`:
- `$LCs` — Camera Raw XMP (`crs:MaskGroupBasedCorrections`), fully editable.
- `$BigT` — binary AI-mask/Remove bitmaps; omit on writes (cached by digest). With a Remove present the response is ~11 MB → saved to a file; parse with `ast.literal_eval`; extract `$LCs` from the file (chat output truncates).
- `$CrVe` "19.0", `$PrVN` 6, `$PrVe` 251920384 — send back unchanged.
- Dialog-only filter sliders come back as their own keys — Glow: `$GLWA` amount, `$GLWR` range, `$GLWS` spread, `$GLWW` warmth, `$GLST` style, `$GLWD` direction, `$GLSF` softness.
- `$Rtch` — Remove tool XMP (§7). Send back unchanged.

**Edit in place — read live first, resend EVERY key** (keys not sent are reset):
```json
{"_obj":"set","_target":[{"_ref":"filterFX","_index":1},{"_ref":"layer","_id":ID}],
 "filterFX":{"_obj":"filterFX","filter":{"_obj":"Adobe Camera Raw Filter",
   "$CrVe":"19.0","$PrVN":6,"$PrVe":251920384,"$LCs":"<edited XMP>"}},
 "_options":{"dialogOptions":"dontDisplay"}}
```
- AI masks, object masks and Generative Remove patches survive with `$BigT` omitted (verified 9956: patch ΔL* 0.00). Save before the first scripted write after a Remove (revert = safety net).
- **Standalone Brush masks do NOT survive scripted writes** (0044) → do brush work last, after all scripted passes. (Brush dabs *inside* a mask group with Color Range did survive on 0028.)
- New corrections need fresh 32-char `CorrectionSyncID` / `MaskSyncID`.
- Dialog re-save normalizes XMP (radials `Flipped="true"`, range masks `MaskValue="0"`) — keep what it wrote.
- Global filter keys verified: `$CrTx` Texture, `$Dhze` Dehaze, `$Tint` (relative on the rendered SO: −8 → fog a* ≈ −1.3; also nudges b* warmer and L* +2 globally). Probably (pixel-check first): `$Ex12 $Cr12 $Hi12 $Sh12 $Wh12 $Bk12 $Cl12 $Vibr`. An unknown key is still echoed by `get` → only a pixel check proves it works.

**Raw Smart Object vs filter**
- WB and Calibration belong in the **raw SO** (user double-clicks; not scriptable). Raw-SO settings are **not readable** (only `documentID` changes) → user reports values; record as manual in the case JSON.
- Do all mask work and Remove in a Camera Raw **Filter** so it is readable (user rule).
- Raw SO can be a pano DNG; its LrC settings (incl. Glow) stack with filter Glow.

## 6. Camera Raw mask XMP schema
Correction: `crs:What="Correction"`, `CorrectionAmount="1"`, `CorrectionActive`, `CorrectionName`, `CorrectionSyncID`; local sliders on −1…+1 (`LocalExposure2012`, `LocalContrast2012`, `LocalHighlights2012`, `LocalShadows2012`, `LocalWhites2012`, `LocalBlacks2012`, `LocalClarity2012`, `LocalTexture`, `LocalDehaze`, `LocalTemperature`, `LocalTint`, `LocalSaturation`); then `crs:CorrectionMasks` seq. Components combine in order:
- **Blend:** `MaskBlendMode="0"` add · `"1"` subtract · **intersect = `"1"` + `MaskInverted="true"`**. "∪ then ∩": several add components, then one intersect applies to the union. Radial subtract = blend 1, inverted false.
- **Linear** `Mask/Gradient`: `ZeroX/ZeroY` (0) → `FullX/FullY` (1, stays 1 beyond); normalized, origin top-left; perpendicular in pixel space (`acr_band.py`).
- **Radial** `Mask/CircularGradient`: `Top/Left/Bottom/Right` (normalized box, may exceed 0–1), `Angle`, `Midpoint` 50, `Roundness` 0, `Feather` 0–100, `Flipped="true"` = inside (as the dialog writes), `Version="2"`.
- **Luminance Range** `Mask/RangeMask` + self-closing `crs:CorrectionRangeMask` `Version="4" Type="2"`, `LumRange="f_lo lo hi f_hi"` (0–1 ≈ L*/100 of the image the filter sees), `LuminanceDepthSampleInfo="0 0.5 1"`. **Creatable headless from scratch.**
- **Color Range** `Version="4" Type="1"`, `ColorAmount` 0–1, `PointModels "x y c1 c2 c3 i"` (multiple samples = multiple entries). **Writable headless by cloning a user sample**; ColorAmount 0.49 = tan rock only, 0.8 = also pink/red rock.
- **AI** `Mask/Image` with `MaskSubCategoryID` (landscape: Mountains 50002, Vegetation 50005); **object mask** = `Mask/Image` without subcategory + `crs:Gesture` → `Mask/Paint` dabs. Bitmaps in `$BigT`; **cannot be created headless**; survive writes without `$BigT`/`Gesture`.
- Not yet observed: standalone Brush XMP, Depth masks.
- **All coordinates are in the uncropped SO frame** — a non-destructive crop only hides pixels; convert from an uncropped render (or crop-preview px → uncropped normalized).

## 7. Remove tool (`$Rtch`)
`crs:RemoveAreas` seq; items `SpotType="heal_patchmatch"`, `fill_method="firefly"` (Generative), `pm_target_*` (px, uncropped SO), `pm_search_*`, patch digests (bitmaps in `$BigT`), `crs:Masks` → `Mask/Paint` (`Radius` normalized, `Flow`, `CenterWeight`, `Dabs`). Image-specific — **cannot be authored headless**; the user paints it (in the filter). Scripted Content-Aware Fill (stamp → polygon → fill → mask) failed twice on textured edges (9792). Example: `cases/crf-9956-final.json`.

## 8. Calibrations (measured — use as starting points, then render → measure)
| Control | Calibration | Source |
|---|---|---|
| Local Exposure units | dialog = **4 × stored** (+0.65 dialog = 0.1625) | 0013 |
| Other local sliders | dialog = stored × 100 | 0013 |
| `LocalExposure2012` | linear light before the tone curve: **~+0.09–0.10 stored ≈ +5 L*** on midtones; 0.3 ≈ +14 L*; burns need ~1.3× the magnitude of an equal lift (−0.13 vs +0.09) | 9822, 0265 |
| Dark subjects (L* ~20) | need ~1.5–2× the midtone exposure (0.07 → +0.7; 0.12 → +4.5…5.9; 0.17 → +2 more) | 9956 |
| Bright areas | burn ~1.3× (bright rock) to ~2× (bright fog) harder than midtone rock | 9956, 0265 |
| `LocalTemperature` | **≈ +0.15 b\* per +0.01 stored** on darks L* 10–20 (+0.12 → +1.6; +0.30 → +4.6) | 0265 |
| `LocalTint` | −0.15 → a* ≈ −1 on fog | 9956 |
| Local Dehaze | needs ≥ +0.25 to show on hazy areas; **strength varies by render path** (headless −11 L*, after dialog OK −5.5, after nesting −11) → judge on a full re-render | 9956, 9861 |
| Texture/Clarity | under-read at 2000 px; +0.15/+0.10 invisible at preview scale on fog rock, +0.25/+0.15 → +20…39% | 9956, 0265 |

## 9. Who does what
| Task | Headless | Needs the user |
|---|---|---|
| Global filter sliders, radials, linear gradients, Luminance Range | ✅ | |
| Color Range | ✅ (clone + tune) | first sample on a new image |
| Read / edit around any existing mask | ✅ | |
| Crop | ✅ `delete:false` | |
| White balance, Calibration | check (`wb.py`); filter `$Tint`/LocalTint as fallback | ✅ raw SO dialog |
| Select Subject/Sky/Landscape/Object, Depth | | ✅ (then edit around it) |
| Remove | preserve `$Rtch` | ✅ paints it in the filter |
| Glow and other dialog-only sliders | preserve keys | ✅ |
| Standalone Brush | | ✅ last |
- Select Landscape → Vegetation isn't always offered → fallback: Luminance Range ∩ Radial − Object mask.

## 10. Tooling
- `tools/measure_all.py` — the one measurement entry point (16-bit aware; diff handles size mismatch).
- `tools/wb.py` — detailed WB density bins (pure numpy; runs in the device VM).
- `tools/m.py`, `tools/diff.py` — components (region table; region ΔL/detail/C* + mask image).
- `tools/apply_filter.js`, `tools/render_helper.js`, `tools/export_comparison_renders.js` — UXP/batchPlay helpers.
- XMP builders used in sessions (`acr.py`: `grad()`, `radial()`, `lum()`, `corr()`; `acr_band.py`: band endpoints) are not in the repo yet — rebuild from §6 or edit the live `$LCs`.
