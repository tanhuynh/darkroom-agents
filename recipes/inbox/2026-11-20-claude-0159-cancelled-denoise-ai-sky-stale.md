# A Denoise dialog visit that is cancelled can leave AI-Sky corrections un-rendered until the user refreshes the mask
- **Agent:** claude
- **Target:** engine.md §6 *Write semantics*; amends `2026-11-20-claude-9884-ai-mask-refresh-not-needed.md` and `2026-11-19-claude-9751-ai-mask-refresh.md` (narrow, do not duplicate)
- **Type:** engine fact (the symptom, not the cause)
- **Rule:** IF the user opens Filter › Camera Raw Filter, starts a Denoise and **cancels** → the XML is unchanged and `$LCs` reads back identical, but the corrections that use the AI **Sky** mask can stop rendering (effect exactly 0.0000 vs the all-off render, at 2000 px and at 1:1), while corrections on the Subject mask keep rendering. DO render right after a dialog visit and compare with the previous good render; if a mask-based correction reads **exactly zero**, ask the user to open the dialog, click the yellow AI edit status icon on the Sky mask if present, and press OK. After that `$BigT` is back (1.35 MB here) and the render equals the earlier good one (sky 14.7, clouds 49.1).
  → CHECK blue-sky and cloud medians against the last good render.
- **Evidence:** case 0159: after the cancelled Denoise my Cloud calm write rendered with blue sky 11.6 (= original) and clouds 53.8 (= original), crop difference 0.0000 L\*; after the user's refresh 14.7 / 49.1 (last good: 14.7 / 49.2). The same hero (Subject) corrections stayed at 49.7.
- **Conflicts with:** 9884 ("refresh not needed"): a refresh is not needed after a scripted write, but can be after a dialog visit that changes nothing.
- **Scope:** seen on 1 case (0159); the cause (cancelled Denoise vs stale Sky mask) is a hypothesis.
