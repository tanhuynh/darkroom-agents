# Photoshop AI Editing Assistant (`adb-mcp` Workspace)

@./recipes/ps-acr-recipes.md
@./recipes/session-handoff.md

## 1. Environment, Safety & Session Preconditions
- **Workspace Root:** `~/dev/adb-mcp` (shared between Claude and Gemini workflows via `CLAUDE.md` symlink).
- **Camera & Subject Context:** Canon R5 / R5 II RAW files, focused on wildlife and landscape photography.
- **MCP Servers (Locked Python Environment):**
  - `photoshop`: `/Users/tanhuynh/dev/adb-mcp/mcp/.venv/bin/python /Users/tanhuynh/dev/adb-mcp/mcp/ps-mcp.py` (~62 typed tools: layers, Select Subject/Sky, adjustment layers, document image readback).
  - `photoshop-batch-play`: `/Users/tanhuynh/dev/adb-mcp/mcp/.venv/bin/python /Users/tanhuynh/dev/adb-mcp/mcp/ps-batch-play.py` (exposes `call_batch_play_command` for raw `batchPlay` arrays and headless Camera Raw Filter XMP edits).
  - **CRITICAL:** Never use `uv run --with mcp`—it pulls a newer MCP SDK without `FastMCP` and breaks the server. Use `/Users/tanhuynh/dev/adb-mcp/mcp/.venv/bin/python` for measurement (`recipes/measure_all.py` — see below).
- **Pre-Flight Rules Before Acting:**
  - Always read `config://get_instructions` at the start of a session before invoking Photoshop tools.
  - Ensure the user is working on a **duplicate** document, Lightroom Classic is closed, and **no Photoshop or Camera Raw modal dialogs are open** (otherwise Photoshop throws `"host is in a modal state"`).
  - If `No clients registered for application: photoshop` occurs, instruct the user to reload the plugin in UXP Developer Tools and click **Plugins › Photoshop MCP Agent › Connect**.

## 2. Measurement Scripts & Dependencies (`./recipes/`)
- **Python Dependencies (Installed in `mcp/.venv`):** `numpy`, `scipy`, `scikit-image`, `Pillow`, `opencv-python`.
- **`wb.py`:** White-balance check—computes median `a*`, `b*`, and hue across dynamic tone and color bins from a 16-bit sRGB render, plus `L*` percentiles.
- **`m.py`:** Loads a render, computes `L*`, chroma, and local detail, and prints a per-region table (tone, rock fraction, rock detail, rock chroma, visual weight).
- **`diff.py`:** Compares two renders—outputs per-region `ΔL*`, detail change (`%`), chroma change, and writes a `|ΔL| × 15` PNG to `./recipes/measure/` visualizing where the effective mask landed. Always pass the 3rd output filename argument.
- **Worked Examples:** Reference `./recipes/crf-<id>-final.json` files as structural patterns to learn from rather than presets to paste blindly (masks are tied to each image's specific geometry).

## Unified Measurement & Visual Proof Script
- Always use `/Users/tanhuynh/dev/adb-mcp/mcp/.venv/bin/python /Users/tanhuynh/dev/adb-mcp/recipes/measure_all.py` instead of writing ad-hoc measurement scripts or calling `wb.py`, `m.py`, and `diff.py` separately:
  - **Baseline & Crop Check:** `measure_all.py baseline <render.png> [--crop x0,y0,x1,y1]`
  - **Post-Pass Diff & Overlays:** `measure_all.py diff <before.png> <after.png> [--hero x0,y0,x1,y1]`

## 3. Headless Camera Raw Filter (`Adobe Camera Raw Filter`) Rules
1. **Non-Destructive Philosophy:** Never repaint or generate pixels. Act as a planner and measurer: sculpt tone and color inside a single **Camera Raw Filter** on the RAW Smart Object so every adjustment remains editable by hand in the Camera Raw dialog afterward.
2. **Apply Syntax:** Send `Adobe Camera Raw Filter` with only desired keys (e.g., `$CrTx` Texture, `$Dhze` Dehaze) and `dialogOptions: dontDisplay`.
3. **Read Syntax:** `get` the layer's `smartObject` → `filterFX[].filter`. Local corrections live in `$LCs` as standard Camera Raw XMP. AI mask bitmaps live in `$BigT` (binary; omit on writes since Camera Raw retains its cached copy).
4. **CRITICAL — Read Live & Resend Every Key:** Before modifying an existing Camera Raw Smart Filter, **always read the live filter state first and resend every existing key**. Any omitted key is silently reset to default (including dialog-only Glow sliders and Generative Remove `$Rtch` data).
5. **Exact Unit Conversions (Dialog vs. Stored XMP):**
   - **Local Exposure:** `Dialog value = 4 × stored value` (so `+0.80` in dialog = `+0.20` stored; `−0.06` in dialog = `−0.015` stored).
   - **Other Local Sliders** (Shadows, Blacks, Texture, Clarity, Dehaze, Saturation, Temperature, Tint): `Dialog value = stored value × 100` (so `+30` in dialog = `+0.30` stored).
6. **Uncropped Coordinate Space:** After a non-destructive crop (`delete: false`), Camera Raw mask coordinates (`Top`, `Left`, `Bottom`, `Right`, `ZeroX/Y`, `FullX/Y`) remain normalized `0.0–1.0` relative to the **uncropped** Smart Object bounds.
7. **Headless vs. User-Click Boundaries:**
   - **AI Can Do Headless:** Global sliders, linear gradients, radials, Luminance Range masks (from scratch), Color Range masks (by cloning and tuning a sampled mask), and reading/editing around any existing mask.
   - **Requires 1 Click From User First:** Raw white balance/calibration (in RAW Smart Object), initial Color Range sample on a new image, AI masks (`Select Subject/Sky/Landscape` or Object masks), Camera Raw Generative **Remove** (do inside the filter so `$Rtch` is readable), and standalone Brush masks (**always do brush work last**, as scripted writes wipe standalone brush strokes).
8. **`batchPlay` Execution Quirks:**
   - In a multi-command batch, the response only echoes the first command, and a failure partway through silently skips remaining commands. Always verify state after a batch, and send risky steps individually.
   - **Plan in Text, Batch Once:** Present the edit plan in text first, wait for explicit user approval, and apply approved edits as a single batched call.

## 4. Aesthetic Restraint & Image Critique Standards
- **Milder, Center-Guiding Philosophy:** Favor natural, restrained tonal sculpting that draws the viewer's eye toward the center of the frame rather than high global contrast.
- **Guide the Eye via Edge Restraint:** When bright or heavily textured foreground corners/edges pull visual weight away from the hero subject, calm those edges (`LocalExposure2012` `−0.06` to `−0.08` stored, `LocalTexture` `−0.10` to `−0.15`, `LocalHighlights2012` `−0.15`) rather than over-lifting the hero.
- **Restrained Hero Lift & Crispness Over Brightness:** Cap first-pass hero luminance lifts around `+1.5` to `+2.5 ΔL*` (`LocalExposure2012` `~+0.05` stored / `+0.20 EV` dialog) and use tight radials (`Feather: 55–60`) with `Texture` (`+0.15` to `+0.22`) and `Clarity` (`+0.15` to `+0.22`) rather than wide, heavily feathered ovals (`Feather: 75+`) or overlapping positive exposure lifts.
- **Protect Aerial Perspective (Zero Far-Rim Dehaze):** Never dehaze or apply Clarity to the distant background plateau/ridge (`0.0 ΔL*` target on far ridges). Increasing haze with distance creates scale.
- **Neutralize Blue Shade Locally:** Use a dark-tones Luminance Range mask (`0 0 0.14 0.24`) with `LocalTemperature` (`~0.15 b*` shift per `0.01` stored unit; e.g., `+0.25` to `+0.30` stored) to remove cold blue skylight casts (`b* ≈ −12`) from deep forest shade without warming sunlit foliage or lifting rock crevices.
- **Measure, Don't Just Eyeball:** Cross-check visual readbacks against `measure_all.py` (which unifies `wb.py`, `m.py`, `diff.py`, and visual proof overlays into one call) metrics (`L*`, `a*`/`b*`, chroma, visual weight) to distinguish true global casts from natural light scatter and verify zero highlight/shadow clipping.

## 5. Visual Verification Overlays & Speed Discipline (Mandatory)
- **Generate Visual Proof Overlays on Every Pass:**
  - **Before Cropping (Step 2):** Generate a crop-preview PNG with rule-of-thirds gridlines overlaid (`crop_preview.png`) in `./recipes/measure/`.
  - **After Every Edit Pass (Step 6):** Generate a side-by-side `before_after.png`, a `|ΔL*| × 15` spatial mask map (`diffmap.png`), a `Δb*` color-shift map (`dbmap.png`) whenever Temperature/Tint is edited, and a 1:1 crop (`hero_zoom.png`) of the primary focal subject.
  - **Surface Visuals Immediately:** When running in **Gemini CLI** (terminal), automatically open the generated verification composite via `open ./recipes/measure/<composite>.png` so the user can inspect mask boundaries and 1:1 detail visually without hunting for files. When running in **Antigravity IDE**, embed the PNGs inline in your response.
- **Speed & Context Efficiency:**
  - Run **`measure_all.py` once** per checkpoint (it unifies `wb.py`, `m.py`, `diff.py`, and the visual overlays) rather than spawning multiple sequential shell calls.
  - Use a single `2000px` long-edge sRGB render per checkpoint (plus one 1:1 crop of the hero subject for Texture/Clarity checks) instead of repeatedly exporting full 45 MP files.

## 6. Standard 6-Step Session Workflow
1. **White Balance Check First (Always):** Pull a `2000px` baseline render and run `measure_all.py baseline <render.png>`. Separate true global cast from natural scatter and local shadow blue casts. Have user fix global WB in the RAW Smart Object only if needed.
2. **Composition & Crop:** Compute detail and visual weight maps, generate `crop_preview.png` with a rule-of-thirds grid overlay, and apply approved crops non-destructively (`delete: false`).
3. **Structured Critique (`FIX` vs. `TASTE`):** Highlight what already works, then list the top 2–3 issues labeled explicitly as **`FIX`** (technical flaws) vs. **`TASTE`** (subjective creative choices).
4. **Plan in Text & Wait for Approval:** Write the full numerical Camera Raw XMP edit plan (showing both stored XMP values and dialog equivalents), then pause for explicit user confirmation.
5. **Batched Execution & Quantitative Verification:** Apply approved edits in one batched `batchPlay` call, export a `2000px` sRGB render, and run `measure_all.py diff <before.png> <after.png> --hero …` (regional table + `before_after.png`, `diffmap.png`, `dbmap.png`, `hero_zoom.png`) in one pass, opening the visual composite automatically.
6. **Save & Archive Recipe:** Once the user saves the TIFF next to the source file, export the final filter XMP to `./recipes/crf-<image>-final.json`, update `ps-acr-recipes.md` / `session-handoff.md`, and clean up temporary render files in `./recipes/measure/`.
