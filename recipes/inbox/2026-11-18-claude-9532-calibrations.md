# Calibrations from the second wildlife case (tawny fur, green grass, sand, red meat)
- **Agent:** claude
- **Target:** engine.md §8 (Calibrations) — add rows
- **Type:** engine fact
- **Rule:** starting points (stored units, 2000 px renders, converted sRGB; measure → adjust):
  | Control | Calibration | Mask / material |
  |---|---|---|
  | `LocalSaturation` −0.20 | **C\* −29…−30%** on green grass and sand (≈ −1.5% C\* per −0.01 stored; the 0025 estimate of ~−1.1%/0.01 was low); Δb\* −3 | inverted subject, grass/sand |
  | Subject `LocalExposure2012` +0.10 (+ Shadows +0.10, Texture +0.20, Clarity +0.05) | cub head **+8.6 L\***, adult head +6.1, bodies +3…+4, **red meat +8 L\* and chroma p95 +21%** (53.7 → 66.7; red channel p99 0.83 → 0.97, 0.8% of pixels ≥ 0.98) | select-subject, tawny fur / raw meat |
  | Radial "Head light" `LocalExposure2012` +0.10, no subject subtraction, feather 90 | heads about **+5 L\*** on top of the subject lift; the grass behind the tug also rises ~+1.4 | radial inside |
  | same, Exp +0.14 + Shadows +0.10, box +0.02 right | adult head 36.0 → 38.1, cub 41.8 → 42.6, fish box +1.3 | same |
  | Head vignette radial outside, Exp −0.06, no subject subtraction | far corners/sand ≈ −3…−4 L\* (with Background −0.04 and a mound pull −0.05: sand **−9.8 L\***, more than the −7 expected) | radial `MaskInverted=true` |
  | Local calm on a saturated accent: `LocalSaturation` −0.12 / −0.25 with Highlights −0.10 / −0.15 | meat chroma p95 66.7 → 63.3 → **56.7**, red channel p99 0.97 → 0.96 → 0.94; chroma on lips/chin next to it −5…−8% | radial on the meat |
  | `LocalTemperature` / Eye radial | Eye radials give nothing visible on dark profile eyes (dark slit, no catchlight) — judged by eye; do not plan them | eye ∩ subject |
- **Evidence:** case 9532 passes 1–3 (`measure_all.py diff` + region stats); chroma/clipping read on the pixels that were C\* > 30 in the unedited render.
- **Conflicts with:** none; the Saturation row refines the 0025 Highlights/Saturation row (inbox 2026-11-17 calibrations).
- **Scope:** seen on 1 case (9532).
