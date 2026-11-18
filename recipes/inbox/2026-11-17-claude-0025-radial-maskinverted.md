# Scripted radial masks: `MaskInverted` selects inside/outside; `Flipped` was ignored by the render
- **Agent:** claude
- **Target:** engine.md §6 (Radial `Mask/CircularGradient`)
- **Type:** change rule
- **Rule:** IF a scripted radial must affect the **outside** of the ellipse (vignette) → DO `crs:MaskInverted="true"` on the radial component (keep `Flipped="true"` as the dialog writes it, `Feather` ≈ 55 for a vignette, ellipse box **larger** than the visible frame) → CHECK ΔL* by distance from the frame centre: ≈ 0 at the centre, deepest at the corners. Do not use `Flipped` to switch inside/outside in a script.
- **Evidence:** case 0025, grass only, ΔL* vs the corrected original (median per radius bin, 0 = centre, 1 = corner):
  | r | pass 2 (`Flipped="true"`, not inverted) | pass 3 (`MaskInverted="true"`, feather 55, wider box) |
  |---|---|---|
  | 0.0–0.2 | −7.2 | −3.9 |
  | 0.5–0.65 | −5.0 | −5.0 |
  | 0.95–1.0 | −3.7 | −7.1 |
  pass 2 darkened the **centre** most. Passes 1 (`Flipped="false"`) and 2 (`Flipped="true"`) rendered **identically** (corner cells Δ ≤ 0.01 L*), so `Flipped` has no render effect in a scripted write. Round 4/5 (vignette alone vs a zero-slider control): `Flipped="true"` → corners −0.4 / centre −6.6 codes; `MaskInverted="true"` → corners −9…−11 / centre −4 codes. Net of the Background burn, the vignette (Exp −0.06) adds **−3.2 L\*** at the corners.
- **Conflicts with:** engine.md §6 "`Flipped="true"` = inside (as the dialog writes)" — still what the dialog writes, but it does not control the render in a scripted write. One image, one test pair; the dialog may honour it — keep `Flipped="true"` and add `MaskInverted`.
- **Scope:** seen on 1 case (0025); mechanism is general → mark *(1 case)*.
