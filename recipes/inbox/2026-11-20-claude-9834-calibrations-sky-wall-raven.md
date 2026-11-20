# Calibrations from 9834: Highlights on near-white fog sky, bright wet foreground stone, a black bird, arch rock; parametric sky ramp as the fallback for a cut-off AI Sky
- **Agent:** claude
- **Target:** `engine.md` §8 (calibrations) and `playbooks/landscape.md` §F Sky (type: contradiction, narrows the IF)
- **Type:** calibration + landscape rule *(1 case)*
- **Rule:**
  - **IF the sky/fog mask is near white (L\* ≥ 90)** → start at **Highlights −0.10, Exp −0.02** (Dehaze +0.08 optional), not the playbook's Highlights −0.25…−0.40: on 9834 Exp −0.05 / Highlights −0.30 gave −8.4 L\* (grey, airy fog lost); Exp −0.02 / Highlights −0.10 gave −3.8 (94.5 → 90.7). Consistent with 9751 (whole sky, Highlights −0.10 → −5…−7).
  - **IF the AI Sky mask is cut off** at a haze/fog boundary (jagged edge, hazy ridge left out) → **parametric sky ramp**: `Mask/Gradient` (ZeroY 0.40 → FullY 0.30 of the uncropped frame, i.e. full above the horizon, zero a little below it) ∩ `Mask/RangeMask` Luminance `LumRange="0.72 0.84 1 1"` (second component `MaskBlendMode="1"`, `MaskInverted="true"`) → smooth fade, no step at the ridge at 1:1; hazy hills (L\* ≈ 65–72) stay out.
  - **Bright wet foreground stone (L\* 54, C\* 16):** Exp −0.08 / Highlights −0.15 / Sat −0.06 / Texture −0.10 plus a corner vignette → −9.4 L\* (too much, dull); Exp −0.03 / Highlights −0.08 / Sat −0.03 / Texture −0.08 → −4.6, C\* −11%. Highlights bites bright surfaces about 2× harder than Exposure.
  - **Black bird (core L\* 4.8, C\* 1.8):** Exp +0.12, Shadows +0.25, Texture +0.15, Clarity +0.05 → L\* 11.6 (+6.8), C\* 4.1, detail +120%; feather structure and sheen visible at 1:1, blacks p1 3.8 → 5.7 (frame), no noise (ISO 250).
  - **Saturated arch rock (C\* 27):** Exp −0.02, Highlights −0.08, Sat −0.03, Texture −0.08 → −2.7 L\*, C\* −7.5%; the first try (−0.04/−0.12/−0.06) gave −4.5 / −10% once the vignette was added.
  - **Pines in an arch (L\* 20):** Exp +0.08, Shadows +0.15, Sat +0.04, Texture +0.10 → +6.5 L\*, C\* +23% (foreground branches turned lime — Sat 0…+0.02 is probably enough).
  → CHECK with a mask-region measurement (probe masks, see `mask-coverage-probe`), not 3×3 cells; state the mask extent next to each forecast.
- **Evidence:** case 9834 passes 1 and 2 (2000 px, real mask regions).
- **Conflicts with:** `playbooks/landscape.md` §F Sky ("Highlights −0.25…−0.40 … cores −3…−5"), written for a ramp ∩ bright range on clouds, not a near-white fog sky.
- **Not verified:** a second near-white sky; the Subject calibration on another dark bird.
- **Scope:** 1 case, Camera Raw 19.0.
