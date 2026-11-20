# When Select Landscape → Vegetation does not pick up the trees: Color Range (user's first sample) ∩ a radial works, and the intersect form is verified
- **Agent:** claude
- **Target:** `engine.md` §9 (last bullet: Vegetation fallback "Luminance Range ∩ Radial − Object mask") and §6 (Color Range, intersect form); `playbooks/landscape.md` (tree lift)
- **Type:** engine fact (DURABLE) + landscape rule
- **Rule:** IF a landscape frame has trees/pines the AI Vegetation mask misses (small dark conifers on rock) → DO ask the user for a **Color Range sample on the trees**, then script the correction as Color Range (`MaskBlendMode="1"`, `MaskInverted="true"` = intersect) with a **radial** over the area (box and feather yours, 60 worked) → the lift stays inside the radial and on the tree pixels. Value that worked at 2000 px: Exp +0.16, Shadows +0.20, Sat +0.05, Texture +0.10 → pines +3.0 L\*, C\* +1.2; a corner patch at about half (Exp +0.08, Shadows +0.10) read natural.
  → CHECK with a control: rock next to the trees ≈ vignette only (−0.5), trees outside the radial = vignette only (−3.1 at the corner).
- **Evidence:** case 9799 (pine valley behind the spires, Camera Raw 19.0); intersect verified by the control above on the center pines and the top-right corner trees (the second Color Range was made by the user with its own sample, `ColorAmount` ≈ 0.49).
- **Conflicts with:** WORKFLOW §2.6 "Intersect forms (AI ∩ Luminance/Color Range or gradient) are unverified" — this verifies Color Range ∩ radial (not AI ∩ range).
- **Not verified:** AI mask ∩ Color Range; whether Luminance Range does the same on trees.
- **Scope:** 1 case, one session.
