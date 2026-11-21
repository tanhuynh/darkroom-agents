# A local exception inside an AI-mask correction: add a feathered radial as a subtract component (AI − radial)
- **Agent:** claude
- **Target:** playbooks/landscape.md §F (sky); engine.md §6 (blend modes — already documents subtract = blend 1)
- **Type:** new rule
- **Rule:** IF an AI-mask correction (e.g. Sky Highlights −0.15 / Texture +0.15) is wrong in one area only (0233: the far-left cloud bank went crunchy) → DO add a `Mask/CircularGradient` as a **subtract** component (`MaskBlendMode="1"`, `MaskInverted="false"`, `Flipped="true"`) on the **same correction**, feather ≥ 50, box a little bigger than the area, edit the existing correction in place (keeps the AI component and its `MaskSyncID` untouched, `$BigT` omitted) → CHECK the area returns to its baseline L\* (top-left 49.7 → 49.9), no seam at 2000 px and 1:1, the rest of the sky edit unchanged. Prefer it to a second correction with opposite sliders.
- **Evidence:** case 0233: subtract radial T −0.15 L −0.08 B 0.16 R 0.24, feather 50 → top-left L\* +0.18 → +0.24, detail +4.6% → +2.1%; the user judged the corner right by eye. The component write rendered right away (no AI-mask refresh was needed after the scripted write).
- **Conflicts with:** none (uses the subtract form already in `cloned-ai-mask`; this edits in place rather than cloning).
- **Scope:** seen on 1 case.
