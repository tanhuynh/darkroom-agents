# Calibrations from 0834: Tint on cloud, Highlights and Exposure on pale rock, Dehaze on a dark cloud sky, Luminance Range 0.55/0.67 ≈ L\* 45/50, Nik Darken/Lighten reach
- **Agent:** claude
- **Target:** engine.md §8 (calibration table); §6 *Luminance Range* bullet (second point for the 0367 mapping)
- **Type:** engine fact (DURABLE)
- **Rule (rows to add, all *(0834 · claude, 1 case)*; stored values, dialog = ×100, Exposure ×4):**

| Control | Calibration | Note |
|---|---|---|
| Local Tint on grey/teal cloud (AI Sky mask, whole sky) | **+0.10 → a\* −1.1 → +0.7 (Δ +1.8), b\* 1.8 → 0.2 (Δ −1.6)**, top-row C\* 6.0 → 4.9; orange cloud Δa\* +1.3, Δb\* −1.3 | the fog row (−0.15 → a\* ≈ −1) under-forecasts clouds by ~2.4× at the same magnitude |
| Local Highlights on pale rock (L\* 45–80, Mountains clone ∩ radial ∩ Luminance Range) | **−0.10 → −0.14 (L\* 45–50) … −0.42 (L\* ≥ 60), p10 −0.62** | ~5× weaker than the sky rows (−0.20 → −2.4 on 0367); do not scale Highlights from the sky |
| Local Exposure on the same pale rock | **−0.03 → −0.3 (L\* 35–45), −0.9 (45–50), −1.1 (50–55), −1.4 (55–60), −1.5 (≥ 60)**, p10 −2.3; detail −3% | the dependable slider; the effect is set by the range weight, not by the slider alone |
| Local Dehaze on a dark/overcast cloud sky (AI Sky mask, with Contrast +0.12, Highlights −0.15) | **+0.25 → top row −7…−9 L\*, detail +21…+43%; +0.20 → ≈ 1.4 L\* lighter** (≈ 1.4 L\* per 0.05) | the fog row (−11 headless / −5.5 after OK) does not transfer |
| Local Exposure on mid-tone rock through the whole AI Mountains mask | **+0.04 → ≈ +1.5 L\* (Mid-Center)** | forecast +3…+2 from the +0.09–0.10 → +5 row was ~2× high: the mask covers each tone only partly |
| Dark foreground (L\* < 25), Shadows +0.17 / Blacks +0.04 through 3 Object masks ∩ Lum `0 0 0.178 0.428` − Color Range | dark pixels **+1.5 L\* mean (p90 +2.9)**, deepest 5.7 → 7.4; detail +2.5%; 1:1 clean | a modest near-black lift did not go muddy here (0743 did) |
| Luminance Range `0.55 0.67 1.00 1.00` | the correction was **fully effective from ≈ L\* 50**, partly at L\* 45–50, ~0 below 35 | second point for 0367's 0.85 ≈ L\* 58 (0.67 ≈ L\* 50, 0.55 ≈ L\* 45); roughly linear ≈ 44 L\* per unit around 0.4–0.85 |
| Nik Darken/Lighten Center (centre +0.25, border −0.30, size 0.55) | lift **+6.5 L\* at the centre, +5.1 at r 0.15, +3.9 at 0.25, +1.2 at 0.35, −1.6 at ≥ 0.4** (r in fractions of the image width/height); chroma +1.1…+1.5 near the centre | with an unmasked Pro Contrast (strength 11.6, fix brightness 0.068) the whole frame was ~1.6 L\* lighter and detail +12% |

- **Evidence:** case 0834, `measure_all.py diff` against the previous render and a zero-slider control; numbers per row in `cases/0834.md`.
- **Conflicts with:** engine §8 rows on Tint (fog), Highlights (sky), Dehaze (fog), Local Exposure (midtone). They are not wrong, only surface-specific — add the surface to those rows' labels.
- **Scope:** seen on 1 case (0834); Luminance Range is a second point for the 0367 mapping (2 cases).
