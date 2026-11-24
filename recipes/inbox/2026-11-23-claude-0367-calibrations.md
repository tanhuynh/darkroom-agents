# Calibrations from 0367: local sliders on dark land, a bright sky burn, structure and the right-slope band
- **Agent:** claude
- **Target:** engine.md §8 (Calibrations)
- **Type:** engine fact (starting points; stored values, dialog = ×100, Exposure ×4; all against a zero-slider control render, 2000 px unless noted)
- **Rule:** use as starting points, then render → measure:
  | Control | Calibration | Source |
  |---|---|---|
  | `LocalExposure2012` on dark land (L\* 17–22, object masks) | **+0.08 stored (+0.32) with Shadows +0.20 → +3.7…+4.2 L\*** (dark pixels p90 +4.6…+5.0 on Slopes) | 0367 Vegetation / Slopes |
  | `LocalExposure2012` on near-black (L\* 7–10) | +0.0375 + Shadows +0.09 → only **+1.3…+1.6 L\*** (~0.04 per L\* at this darkness: needs ≥ 2× the midtone value) | 0367 right-slope band |
  | `LocalExposure2012` burn on a mid-bright sky (L\* 50–65) | **−0.10 stored (−0.40) → −6 to −7.5 L\*** at full gradient weight (L\* 50–55 −6.2, pure sky next to the crest −7.4) | 0367 Horizon |
  | `LocalHighlights2012` on a mostly mid-tone sky (L\* ~51) | −0.20 stored → −2.4 L\* whole sky, up to −6 on bright cloud edges | 0367 Sky |
  | `LocalTemperature` on warm shade (b\* +8…+10) | −0.20 stored (−20) → b\* −1.1 (right slope) … −1.9 (left slope), −1.9…−2.9 on the foreground, i.e. ≈ −0.06…−0.14 b\* per −0.01 (§8 has +0.13 b\* per +0.01 on darks; same order, weaker on slopes with red rock) | 0367 |
  | `LocalTexture` +0.20 / `LocalClarity` +0.10 on lit sandstone | **+16…+17.5% detail at 2000 px**, L\* ±0.2, highlights band +1.8 L\*; reads as stone at 1:1 (std 4.1–5.3), no halos | 0367 Mountains |
  | `LocalExposure2012` −0.02 + `LocalShadows2012` −0.06 on tower crevices (Lum 0.10–0.50, minus radials) | −0.27 L\* mean, p10 −0.88 (isolated −2…−4 on trees/lichen) — gentle | 0367 Hero shadows |
  | filter Calibration blue hue −7 / sat +11 (`$BHue`, `$BSat`) | sky hue 282° → 279°; **C\* +1.8 on the lit rock** and +0.9…+1.3 on slopes/valley, sky C\* +1.1…+1.9; red clipped in the sRGB preview 13.2% → 15.3% but ProPhoto red ≥ 0.998 only 0.03% | 0367 |
- **Evidence:** case 0367 (passes 1–3, `measure_all.py diff` against the zero-slider control; hero 1:1 crops for Texture/Clarity).
- **Conflicts with:** engine.md §8 `LocalTemperature` row (darks only, 0265) — this adds a lower value on warm shade at L\* 12–25 with object masks; both can hold.
- **Scope:** seen on 1 case.
