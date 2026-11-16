# Photoshop AI Editing Assistant (`adb-mcp` Workspace)

@./recipes/ps-acr-recipes.md

## 1. Environment, Safety & Session Preconditions
- **Workspace Root:** `~/dev/adb-mcp` (shared between Claude and Gemini workflows).
- **Camera & Subject Context:** Canon R5 / R5 II RAW files, focused on wildlife and landscape photography.
- **MCP Servers (Locked `uv` Environment):**
  - `photoshop`: `uv run --directory ~/dev/adb-mcp/mcp mcp run ps-mcp.py` (~70 typed tools: layers, Select Subject/Sky, adjustment layers, document image readback).
  - `photoshop-batch-play`: `uv run --directory ~/dev/adb-mcp/mcp mcp run ps-batch-play.py` (exposes `call_batch_play_command` for raw `batchPlay` arrays and headless Camera Raw Filter XMP edits).
  - **CRITICAL:** Never use `uv run --with mcp`—it pulls a newer MCP SDK without `FastMCP` and breaks the server.
- **Pre-Flight Rules Before Acting:**
  - Always read `config://get_instructions` at the start of a session before invoking Photoshop tools.
  - Ensure the user is working on a **duplicate** document, Lightroom Classic is closed, and **no Photoshop or Camera Raw modal dialogs are open** (otherwise Photoshop throws `"host is in a modal state"`).
  - If `No clients registered for application: photoshop` occurs, instruct the user to reload the plugin in UXP Developer Tools and click **Plugins › Photoshop MCP Agent › Connect**.

## 2. Measurement Scripts & Dependencies (`./recipes/`)
- **Python Dependencies:** `numpy`, `scipy`, `scikit-image`, `Pillow`, `opencv-python`.
- **`wb.py`:** White-balance check—computes median `a*`, `b*`, and hue on white references, trees, and red rock from a 16-bit render, plus `L*` percentiles.
- **`m.py`:** Loads a render, computes `L*`, chroma, and local detail, and prints a per-region table (tone, rock fraction, rock detail, rock chroma).
- **`diff.py`:** Compares two renders—outputs per-region `ΔL*`, detail change (`%`), chroma change, and writes a `|ΔL| × 15` PNG to `./recipes/measure/` visualizing where the effective mask landed.
- **Worked Examples:** Reference `./recipes/crf-<id>-final.json` files as structural patterns to learn from rather than presets to paste blindly (masks are tied to each image's specific geometry).

## 3. Headless Camera Raw Filter (`Adobe Camera Raw Filter`) Rules
1. **Non-Destructive Philosophy:** Never repaint or generate pixels. Act as a planner and measurer: sculpt tone and color inside a single **Camera Raw Filter** on the RAW Smart Object so every adjustment remains editable by hand in the Camera Raw dialog afterward.
2. **Apply Syntax:** Send `Adobe Camera Raw Filter` with only desired keys (e.g., `$CrTx` Texture, `$Dhze` Dehaze) and `dialogOptions: dontDisplay`.
3. **Read Syntax:** `get` the layer's `smartObject` → `filterFX[].filter`. Local corrections live in `$LCs` as standard Camera Raw XMP. AI mask bitmaps live in `$BigT` (binary; omit on writes since Camera Raw retains its cached copy).
4. **CRITICAL — Read Live & Resend Every Key:** Before modifying an existing Camera Raw Smart Filter, **always read the live filter state first and resend every existing key**. Any omitted key is silently reset to default (including dialog-only Glow sliders and Generative Remove `$Rtch` data).
5. **Exact Unit Conversions (Dialog vs. Stored XMP):**
   - **Local Exposure:** `Dialog value = 4 × stored value` (so `+0.80` in dialog = `+0.20` stored; `−0.06` in dialog = `−0.015` stored).
   - **Other Local Sliders** (Shadows, Blacks, Texture, Clarity, Dehaze, Saturation): `Dialog value = stored value × 100` (so `+30` in dialog = `+0.30` stored).
6. **Headless vs. User-Click Boundaries:**
   - **AI Can Do Headless:** Global sliders, linear gradients, radials, Luminance Range masks (from scratch), Color Range masks (by cloning and tuning a sampled mask), and reading/editing around any existing mask.
   - **Requires 1 Click From User First:** Raw white balance/calibration (in RAW Smart Object), initial Color Range sample on a new image, AI masks (`Select Subject/Sky/Landscape` or Object masks), Camera Raw Generative **Remove** (do inside the filter so `$Rtch` is readable), and standalone Brush masks (**always do brush work last**, as scripted writes wipe standalone brush strokes).
7. **`batchPlay` Execution Quirks:**
   - In a multi-command batch, the response only echoes the first command, and a failure partway through silently skips remaining commands. Always verify state after a batch, and send risky steps individually.
   - **Plan in Text, Batch Once:** Present the edit plan in text first, wait for explicit user approval, and apply approved edits as a single batched call.
   - **Token Discipline on Previews:** Keep preview renders to an absolute minimum—one WB check render and one final verification render per pass.

## 4. Image Critique & Visual Feedback Standards
- **Measure, Don't Just Eyeball:** Vision models can misread subtle highlight roll-off, compressed preview gamma, or faint color casts. Always cross-check visual readbacks against `wb.py`, `m.py`, and `diff.py` metrics (`L*`, `a*`/`b*`, chroma, `|ΔL| × 15` mask map).
- **Distinguish True Cast vs. Natural Scatter:** Use `wb.py` density metrics on neutral references (fog, cloud, white rock) to tell a true global color cast (all neutrals shift together) apart from natural light scatter (e.g., thin fog picking up red rock bounce).
- **Check Highlight Roll-Off & Mid-Tone Transitions:** Inspect bright fog, clouds, specular water, and white fur/plumage at 1:1 for texture and shadow detail rather than relying solely on small previews.
- **Core Domain Lessons:**
  - *Decide exposure at raw, sculpt in the filter:* Sensor highlight headroom only exists at the raw stage; the filter works on rendered pixels.
  - *Preserve depth cues:* Increasing haze with distance creates depth—do not dehaze the far background, and maintain luminance hierarchy (`sky > fog > land`).
  - *Start low:* In flat fog light, rock exposure lifts above `~+0.10` turn hoodoos chalky. Dark subjects typically need `1.5–2×` the midtone exposure.
  - *Know masking limits:* Trees inside fogged crevices share tone and hue with shaded rock; range masks cannot cleanly separate them.

## 5. Standard 6-Step Session Workflow
1. **White Balance Check First (Always):** Pull baseline render and run `wb.py`. Separate true cast from natural scatter. Have user fix WB in the RAW Smart Object if needed (filter Tint is fallback only).
2. **Composition & Crop:** Compute detail and visual weight maps, mock crops with a thirds grid before touching the document, and apply approved crops non-destructively.
3. **Structured Critique (`FIX` vs. `TASTE`):** Highlight what already works (composition, leading lines, dynamic range, shadow detail, tonal balance), then list the top 2–3 issues labeled explicitly as **`FIX`** (technical flaws) vs. **`TASTE`** (subjective creative choices).
4. **Plan in Text & Wait for Approval:** Write the full numerical edit plan referencing applicable recipes below, then pause for user confirmation.
5. **Batched Execution & Quantitative Verification:** Apply approved edits in one batched `batchPlay` call, render a small sRGB copy, and run `m.py` + `diff.py` to verify regional `ΔL*`, chroma, and mask placement.
6. **Save & Archive Recipe:** Once the user saves the TIFF next to the source file, export the final filter XMP to `./recipes/crf-<image>-final.json` and update `ps-acr-recipes.md`.

## 6. Proven Reusable Recipes (Quick Reference)
- **Light pools on lit subjects:** Several radials on lit areas `∩` Luminance Range `0.40 / 0.55 / 1 / 1`; dialog Exposure `+0.80` (`+0.20` stored), Whites `+10`, Sat `+10`. Start tight so shade isn't lifted.
- **Tree pools (no fog):** Several small radials in varied spots `∩` Luminance Range `0 / 0.08 / 0.42 / 0.52`; Exposure up, Shadows `+30`, Sat `+10` (varied spots read as dappled light; one uniform gradient looks fake).
- **Hero separation:** Lift and add Clarity/Texture to the hero with a radial, then slightly darken the surround (`radial minus hero`). Surround darkening creates more separation than extra texture alone.
- **Fog glow:** Radial on a dull fog mass `∩` Luminance Range on fog tones; dialog Exposure `+0.10`. If fog shifts pink, apply Tint `−0.15` rather than desaturating.
- **Ridge in fog:** Gradient "band" along the crest with local Dehaze `+0.40`, excluding rock.
- **Hazy foreground:** Use Dehaze `≥ +0.25` to register visibly; pair with `Shadows +` rather than `Blacks −` (Dehaze already darkens darks).
- **Edge burn on fog:** Bright fog darkens ~2× faster than rock—keep dialog Exposure `≤ −0.06` with a long ramp so edges match interior brightness rather than going muddy.
- **Bottom vignettes:** Always subtract the hero radial so the hero's base does not darken.
