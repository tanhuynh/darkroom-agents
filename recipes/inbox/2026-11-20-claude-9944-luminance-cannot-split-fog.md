# A Luminance Range cannot take fog off a hero mask when the fog sits at the rock's tone
- **Agent:** claude
- **Target:** playbooks/landscape.md §G (Fog-specific); materials.md (Fog / low cloud, Sandstone)
- **Type:** change rule (adds a number to the existing "no range mask separates shaded rock from trees" idea)
- **Rule:** IF a hero oval radial (no brush) lifts fog inside it → DO intersect a Luminance Range on the rock tones (here 0.10/0.20/0.58/0.70 ≈ L\* 20–70) to drop the bright fog; it removes the lift of fog above ~L\* 62 but **not** fog at L\* 55–60 (same tone as the rock). Only a brush (painted last) separates those.
  → CHECK the lift by original tone inside the oval.
- **Evidence:** case 9944 (oval over the central cluster): lift by original L\* before / after narrowing the range from 0.72/0.82 to 0.58/0.70: 0–40: +3.7 / +3.7; 40–55: +4.8 / +4.7; 55–62: +4.4 / +3.6; 62–70: +3.5 / **+0.6**; 70+: +1.8 / **−0.2**. The fog right of the cluster (original L\* 55.1) stayed at +4.7.
- **Conflicts with:** none.
- **Scope:** seen on 1 case (9944).
