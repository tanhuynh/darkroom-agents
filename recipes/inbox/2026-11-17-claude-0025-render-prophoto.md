# Render for measurement: save the ProPhoto PNG and convert to sRGB in Python — never trust `convertToProfile` in the render path
- **Agent:** claude
- **Target:** engine.md §2 ("Getting a render") and §1 (timeouts); new `tools/prophoto_to_srgb.py`
- **Type:** engine fact (change of the render recipe)
- **Rule:** IF a render for `measure_all.py` / `wb.py` is needed → DO batchPlay [`duplicate` (merged) → `imageSize` 2000 px long edge] → `save_document_as(<repo>/measure/<id>.png, "PNG")` (16-bit, **ProPhoto RGB, no ICC embedded**) → `python tools/prophoto_to_srgb.py measure/<id>.png` → measure on `<id>_srgb.png`. Do **not** put `convertToProfile` in the render path. If a doc's profile is not ProPhoto, check `get profile` first (the tool assumes ProPhoto).
  → CHECK once per session: re-render the *unchanged* state through the same path as a control (see the bisect proposal); mean |before − control| must be ≈ 0.
- **Evidence:** case 0025 (Nov 2026).
  - Photoshop (Beta) put up a **Convert to Profile dialog** even with `dialogOptions: dontDisplay`. The user closed it; the batch call still echoed `SUCCESS`, the PNG stayed ProPhoto, and PNGs carry no ICC, so nothing flagged it.
  - Proof: `before.png` = ProPhoto re-encoding of the correctly converted `r3.png` to **0.04** 8-bit codes; read as sRGB the unconverted file was **−19.5 codes** (≈ −8.2 L*, −1.8 b*, −2 C*) vs the true sRGB render.
  - Two renders (the original and the first baseline) were affected, which also corrupted the first critique: median L* 38.2 → **46.4**, grass hue 94° / C* 7 → **74–83° / 9.4**, whites b* −8.7 → **−3.2**. A "dim, drab, cool-whites" diagnosis was an artefact.
  - The numpy conversion (ROMM D50 γ1.8 w/ toe → XYZ D50 → sRGB, Bradford matrix, relative colorimetric, no BPC) matches Photoshop's own conversion to **0.039** codes.
  - Timeout behaviour (extends §1): a timed-out `convertToProfile` batch **completed late** (profile read ProPhoto, then sRGB a minute later); the retry I sent in between returned `{"_obj":"error","result":-128}`. After a timeout: `get profile` / state, wait, never re-send.
- **Conflicts with:** engine.md §2 render recipe (it prescribes `convertToProfile` sRGB (colorimetric, BPC)); that line is replaced by the rule above. The "standalone `convertToProfile` on an sRGB doc → not valid (harmless)" note stays true.
- **Scope:** general (any agent that renders through this Photoshop build). Tool is in `tools/prophoto_to_srgb.py` (uncommitted until merged).
