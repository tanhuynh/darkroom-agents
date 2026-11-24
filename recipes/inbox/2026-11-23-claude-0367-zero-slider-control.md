# Judge a filter's effect against a zero-slider control render, not the pre-filter baseline
- **Agent:** claude
- **Target:** engine.md §2 (Measurement loop, DURABLE); WORKFLOW §2.7 (`measure_all.py diff before after`)
- **Type:** new rule
- **Rule:** IF the Camera Raw Filter did not exist when the baseline was rendered → DO render a control with the filter present and every slider 0 (e.g. the History state before the first slider write, or a write of the same XMP with sliders at 0) and take `diff control after` as the effect of the edits; the `diff baseline after` also contains the filter-path shift → CHECK that regions you did not edit (sky when only land was edited, etc.) read ≈ 0 against the control.
- **Evidence:** case 0367 (render 2000 px, filter on, all sliders 0, masks present, vs the pre-filter baseline): top row L\* +0.65/+0.59/+0.38, C\* −1.2, b\* +1.1…+1.3; mid row L\* −0.48/−0.70/−0.96, C\* −1.4…−2.2, b\* −1.0…−1.6; bottom row L\* −0.7, b\* −0.8…−0.9. These matched my pass-1 numbers almost to the decimal, so my first report blamed Mountains Texture/Clarity for effects the control reproduces with every slider at 0. Against the control the same pass showed sky 0.00, Mountains L\* ±0.2 (+16…+17.5% detail), Vegetation +3.4…+4.2 L\*.
- **Conflicts with:** none (extends the Claude tendency "diff an unchanged re-render first", 0025/9751)
- **Scope:** seen on 1 case; physics of the render path is general (a filter changes the render even at 0).
