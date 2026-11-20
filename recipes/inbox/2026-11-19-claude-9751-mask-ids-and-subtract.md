# Camera Raw AI-mask identifiers (People parts, Landscape parts) and the Subject-subtract component on an AI correction
- **Agent:** claude
- **Target:** engine.md §6 (Camera Raw mask XMP schema, "AI" bullet)
- **Type:** engine fact
- **Rule:** the `Mask/Image` component carries `MaskSubType` and `MaskSubCategoryID`: **Subject** `MaskSubType=1` (no category); **Sky** `MaskSubType=2`; People parts `MaskSubType=0` with `MaskSubCategoryID` **Facial Skin 2, Iris and Pupil 3, Hair 5, Lips 6, Eye Sclera 8, Eyebrows 9, Clothes 11, Teeth 12**; Landscape `MaskSubCategoryID` **Mountains 50002, Natural Ground 50004, Vegetation 50005**. Corrections are named by the dialog ("Person 1 - Clothes", "Natural Ground" …); a created-twice Sky shows up as two corrections with the same `MaskDigest`. All components of one dialog session share `InputDigest`/`LocalInputDigest` and `FullMaskSize` (2879×1920 for a 3:2 frame, uncropped).
  - To subtract the subject from an AI correction, append a clone of the `Subject 1` `Mask/Image` (fresh `MaskSyncID`, `MaskBlendMode="1"`, `MaskInverted="false"`) to its `CorrectionMasks` seq; the dialog refresh normalizes the clone's `ReferencePoint` to `0.5 0.5` and keeps the digests. Verified at 1:1 on Sky − Subject (hair clean). A person part made by the dialog has no `Local*` attributes until a slider is set: insert `crs:LocalExposure2012="…"` etc. before `crs:LocalCurveRefineSaturation`.
  - Camera Raw also writes **global** HSL (`$HA_R…$HA_M`, `$SA_*`, `$LA_*`) as separate filter keys, outside `$LCs` (see the correction in `2026-11-19-claude-9751-ai-mask-refresh.md`).
- **Evidence:** case 9751 (14 masks read from the saved filter; `crf-9751-final.json`).
- **Conflicts with:** none (extends the "AI" bullet; the `Entire Person` / `Body Skin` ids were not seen — not offered or not made).
- **Scope:** seen on 1 case (9751), Camera Raw 19.0.
