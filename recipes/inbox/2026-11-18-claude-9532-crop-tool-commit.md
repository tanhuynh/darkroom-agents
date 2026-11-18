# A pending Crop-tool box in Photoshop is committed by scripted commands and overrides a scripted crop
- **Agent:** claude
- **Target:** engine.md §1 (Session setup) and §3 (batchPlay gotchas; "Non-destructive crop")
- **Type:** engine fact
- **Rule:** IF the Photoshop **Crop tool is active with a pending crop box** (the user typed a ratio or dragged a box and did not press Enter/Esc) → DO NOT script anything until the box is cancelled (Esc, or switch tool after cancelling): a scripted command (a `duplicate`, a render, a `get`) can **commit** that box, replacing the canvas you just set with `crop … delete:false`. Ask the user to press **Esc** first → CHECK `get_document_info` size and `get_layer_bounds` (non-destructive crop: `top` negative, `bottom`/`right` beyond the canvas) after the scripted crop **and** again a few commands later; the status bar of a screenshot shows the true canvas size (`7784 px x 4865 px`), the Crop tool's ratio field (`16:9`) and its overlay do not.
- **Evidence:** case 9532 — a scripted crop to 7784×4865 read back correctly, then a later read showed 7784×4379 (16:9, layer top −393 instead of −150) twice; the user's screenshot showed the Crop tool active with a 16:9 box over a 16:10 canvas. Nothing else in the session changed the canvas.
- **Also useful:** a non-destructive crop can be re-set from any state by passing coordinates relative to the *current* canvas (negative `top` / `bottom` beyond the canvas re-extend it from the hidden layer pixels; verified: 8192×5464 → crop A → crop C → restored with top −390…bottom 5074, then re-cropped).
- **Conflicts with:** none.
- **Scope:** seen on 1 case (9532).
