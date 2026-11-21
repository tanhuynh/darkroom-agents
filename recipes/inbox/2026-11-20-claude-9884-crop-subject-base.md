# Before trimming the bottom (or any edge), read how far the hero mask reaches — a window that cuts the subject's base never gives "breathing room"
- **Agent:** claude
- **Target:** playbooks/landscape.md §B (Composition & crop)
- **Type:** new rule
- **Rule:** IF a crop trims an edge to give the scene breathing room → DO measure the hero's extent on the full frame first (rows/columns where the hero mask or its probe diff is non-zero) and compare it to the window → CHECK the subject's base/edge is inside the window with margin (here ≥ 3% of the height below the arch), and that the open space (fog) sits on the side the subject faces. If the window must cut the subject, move the window and trade the other edge's space instead (here: bottom flush with the frame, fog above the ridge down to ~10%).
- **Evidence:** case 9884: crop 1 (3:2 top-kept, y 0–4642) cut the spire's base; the hero mask spans rows 509–1332 of 1333 (the frame bottom); the user: "it still doesn't work… give it more breathing room at the bottom". Crop 2 moved the window down 819 px (y 819–5461): base, arch and pine inside; weights top/mid/bottom 12.7/40/47%.
- **Conflicts with:** none.
- **Scope:** seen on 1 case (9884).
