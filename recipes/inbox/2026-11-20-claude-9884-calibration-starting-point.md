# §I Calibration Blue primary values are a starting point per image, not a target
- **Agent:** claude
- **Target:** playbooks/landscape.md §I (Color), first bullet
- **Type:** change rule
- **Rule:** IF a global Calibration Blue primary shift is used to even rock and greens → DO treat "Sat +5…+7 / Hue −9" as a starting range and tune by the whole-frame effect (the primary moves every bluish pixel incl. fog/sky and the blue component of rock) → CHECK rock stays warm and separated from the fog, fog stays clean (b\* change < 0.5), no odd hue breaks; judge on a render diff (`dbmap`), not on matching the numbers.
- **Evidence:** the user's own values differ by image: 9799 (−8, +10 → +7), 9884 (−6, +9). On 9884: chroma +0.6…+1.3 on rock (spire C\* 21.9 → 23.2), fog Δb\* −0.45 / Δa\* −0.9, ΔL\* < 0.5. Filter keys after the dialog edit: `$BHue` −6, `$BSat` 9 (the other primaries and `$BlkB` are written as 0).
- **Conflicts with:** §I as written (a fixed range from 0028, tagged *(1 case)*).
- **Scope:** seen on 3 cases (0028, 9799, 9884); the user's judgement, measured on 9884 only.
