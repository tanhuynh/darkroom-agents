# Calibrations from the first wildlife case (dry-grass background, black/grey plumage subject)
- **Agent:** claude
- **Target:** engine.md §8 (Calibrations) — add rows; wildlife.md §B/§C only after the user's final edit is archived
- **Type:** engine fact
- **Rule:** starting points (stored units, 2000 px renders, converted sRGB; measure → adjust):
  | Control | Calibration | Mask / material |
  |---|---|---|
  | `LocalExposure2012` −0.05 | **−3.9 L\*** (L\* ~46 → ~42), C\* −0.7, b\* −0.6 | inverted subject, dry grass — **~2× the −0.13 ≈ −5 L\* burn estimate**, so on bright-ish midtones start at −0.03 |
  | `LocalTexture` −0.30 (+ Clarity −0.10) | grass detail **−28…−36%** (cells with only grass); cells containing bird edges/stems −7…−14% | inverted subject |
  | Subject `LocalShadows2012` (Exp +0.08, Texture +0.20, Clarity +0.05 on top) | +0.06 → deep darks (L\* < 15) **+1.7**; +0.10 → **+2.3**; +0.15 → **+3.0** (detail +33…+42%) | subject, black/grey plumage |
  | Vignette `LocalExposure2012` −0.06 | **−3.2 L\*** at the corners, ≈ 0 at the centre (feather 55, ellipse box larger than the frame, `MaskInverted="true"`) | radial minus subject |
  | Negative Clarity (−0.15 → 0) on the background | no change in L\* (0.00–0.03) and ~5 points of detail | inverted subject |
  | Background `LocalHighlights2012` −0.10 + `LocalSaturation` −0.05 (on top of Exp −0.05, Texture −0.30) | grass **−0.7…−0.9 L\***, C\* −0.5, Δb\* −0.5, detail −1…−4%; bird deep darks/shadows −0.06/−0.08 | inverted subject, dry grass (pass 4) |
  | Diagonal pull gradient, minus subject: `LocalExposure2012` −0.10 (+ Highlights −0.04, Blacks −0.02) | bottom grass **−5.5…−6.8 L\*** (bottom-left to L\* ~28 with the vignette), detail −4…−8%; bird whites/darks ±0.06 | linear gradient toward the heaviest background, minus subject |
  | same pull at −0.06 | bottom grass **−3.2 / −2.0 / −0.9 L\*** (bottom-left / center / right) vs the −0.10 version recovered; non-linear: halving Exposure recovered only ~60% of the darkening, the rest comes from Highlights/Blacks | same |
  | Push radial, no subject subtraction: Exp +0.03, Highlights +0.05 | head/beak **+1.4 L\***, upper neck +0.7, chest 0.00; **but** upper-right grass +2.3 L\* | large soft radial (feather 88) |
  | `LocalTemperature` on dry grass | **≈ +0.3…0.4 b\* per +0.01 stored** (+0.03 → +1.0, +0.015 → +0.6) — about 2× the dark-area figure in engine.md §8 | warm grass L\* ~40 |
- **Evidence:** case 0025 pass 1–3 vs the corrected original (`measure/0025_before_srgb.png`), see the render proposal for why the earlier numbers were wrong. Detail columns come from `measure_all.py diff` Det % per 3×3 cell.
- **Conflicts with:** engine.md §8 "burns need ~1.3× the magnitude of an equal lift (−0.13 vs +0.09)" — not contradicted for bright rock, but grass at L\* 46 burned ~2× harder than that estimate predicts.
- **Scope:** seen on 1 case (0025); the user's final edit may change the values — keep as starting points, mark *(1 case)*. The wildlife playbook's background-quieting rule (§B.1: Texture −0.20…−0.40, Clarity −0.10…−0.20) is consistent with the Texture row.
