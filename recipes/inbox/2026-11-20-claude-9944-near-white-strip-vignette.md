# Taking down a near-white strip at the frame edge: Highlights/Whites barely move the whitest pixels; stacking and Saturation make the neighbouring pale rock grey
- **Agent:** claude
- **Target:** playbooks/landscape.md §D (Calm the loud edges); engine.md §8 (calibrations)
- **Type:** change rule + calibration
- **Rule:** IF a pale ledge at the frame edge (L\* 70–78, C\* ~2) pulls the eye → DO a radial ∩ Luminance Range 0.62/0.70/1/1 vignette **limited to that section** (not the pinker rock below it); start at Exp −0.08, Highlights −0.25, Whites −0.15, Sat 0, Texture −0.05 → median −8 L\* on the section, pixels L\* 65–72 −7.6, whites above 72 only −2.3. Exp −0.08 / Highlights −0.15 gave −5.3 / −1.5; Exp −0.10 / Highlights −0.35 / Whites −0.30 gave −10.9 / −3.5 (too strong, the strip fell below the fog beside it, 59 vs 63). Do not add Saturation −0.04 on rock already under a −0.05 correction: it read grey.
  → CHECK the strip ends near the neighbouring fog tone (not darker); pink rock below keeps its C\* (15.5 → 15.6).
- **Evidence:** case 9944, right-edge strip (x 93–100%, y 62–78%): L\* 73.6 → 67.8 → 65.1 → 59.4 (passes) → 64.5 final on the section; the lower pinker strip stayed 63.5 (from the earlier Pale cap, original 67.1). Stacking with a second radial (Pale cap: radial ∩ Lum 0.56/0.64/0.95/1.0, Exp −0.08, Highlights −0.15, Sat −0.05, Texture −0.12, Clarity −0.08; tops −5.3) caused the grey look at the overlap.
- **Conflicts with:** none.
- **Scope:** seen on 1 case (9944).
