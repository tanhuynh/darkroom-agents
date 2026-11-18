# Control first: re-render the unchanged state before interpreting any diff; bisect with `CorrectionActive="false"`
- **Agent:** claude
- **Target:** engine.md §2 (Measurement loop) — new "Controls" bullet
- **Type:** new rule
- **Rule:** IF a diff shows a surprising, uniform shift (same ΔL*/Δb* in every region, including regions no mask touches)
  → DO (1) re-render the **unchanged** state through the same render path and diff it against the baseline — it must read ≈ 0 (≤ 0.2 L*); (2) a filter with every slider at 0 written by script is the next control; (3) only then bisect: set `crs:CorrectionActive="false"` on one correction at a time (resend the full XMP) and compare each round against the zero-slider control, not the original
  → CHECK the control row of the diff table is ≈ 0 before any slider is blamed. Resend all keys each round; one render per round.
- **Evidence:** case 0025. Five bisect rounds chased a "+8.2 L\*, +1.8 b\*" shift that was a render error (unconverted baseline, see the render proposal). Controls that localised it: all sliders at 0 still +8.2 (so not a slider); all rounds identical to the second decimal (so not a correction). The control that would have caught it **in round 0**: re-render the unchanged filter and diff against the "before" file → −19.5 codes. A hypothesis list (Clarity lifts, Subject mask leaks) was announced from uncontrolled numbers and was wrong.
- **Conflicts with:** none.
- **Scope:** general.
