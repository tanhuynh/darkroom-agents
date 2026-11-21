# Lifting a veiled hero with Shadows + Exposure instead of Dehaze: calibration and the colour cost
- **Agent:** claude
- **Target:** playbooks/landscape.md §C and §F; engine.md §8
- **Type:** new rule (calibration)
- **Rule:** IF the hero is veiled by fog and Dehaze adds grain → DO lift it with Shadows +0.30 and Exp +0.06 (Dehaze 0) on a hero radial ∩ Luminance Range 0.10/0.20/0.58/0.70, Clarity +0.12, Texture +0.12, Sat +0.03 → cluster median +5.5 L\* over the original (41.4 → 46.9; shadows pixels 30.3 → 34.0; p5 26.1 → 28.5). Shadows +0.15 alone gave only +1.2 L\* (with Dehaze +0.25 still on). The colour is flatter than with Dehaze (C\* 11.3 vs 13.4) and detail +27% (+20% after Denoise 30).
  → CHECK the hero ends 2–6 L\* above its original tone, no halo; the fog beside it at the rock's tone is lifted too (+4.5), see `luminance-cannot-split-fog`.
- **Evidence:** case 9944: forecast +3.5 from pass 2 was wrong because dropping Dehaze removed a −5 darkening; forecast from the original tone.
- **Conflicts with:** playbook §E ("lift lit faces, never the shadows") — here the user chose the shadow lift on a veiled hero and the 1:1 crop stayed structured.
- **Scope:** seen on 1 case (9944).
