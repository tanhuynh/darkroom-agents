# Render recipe for measurement (copy these calls — do not search the repo for descriptors)

Goal: a 2000 px, 16-bit PNG of the **merged** current document, in ProPhoto, then converted to sRGB by `darkroom` `prophoto_to_srgb`.
Source of the commands: `tools/render_prophoto.js` (worked on case 0025). Photoshop must have **no dialog open**.
Call order — **one call at a time, check the result after each** (a multi-command batch only echoes the first command and silently skips the rest after a failure).

## 0. Where things are
- Photoshop tools = the `photoshop` / `photoshop-batch-play` servers (`get_documents`, `save_document_as`, `call_batch_play_command`, …). Repo files and measuring = `darkroom`.
- You cannot see the repo in Photoshop; `<repo>` below is `/Users/tanhuynh/dev/darkroom-agents`.

## File names (decided — don't deliberate)
`<id>` = `<case id>-local-<label>`, e.g. `0025-local-base` for the baseline, `0025-local-p1` after the first pass.
Render → `measure/<id>.png` → converted `measure/<id>_srgb.png`. `measure/` holds only throwaway renders (git-ignored, emptied at archive time), so overwriting a file there loses nothing; do not look for existing files first. You cannot list directories with `darkroom`; if you must check, use the workspace listing once.

## 1. Document info
`get_documents` → note the id/name of the working document (the duplicate the user made) and its width × height.
If the document is **portrait** (height > width) use `height` instead of `width` in step 3 (the long edge must be 2000 px).

## 2. Duplicate the merged image (its own call)
`call_batch_play_command` with commands:
```json
[{"_obj":"duplicate","_target":[{"_ref":"document","_enum":"ordinal","_value":"targetEnum"}],"merged":true}]
```
Then `get_documents`: a new document should exist and be active. If not, stop and tell the user.

## 3. Resize the duplicate (its own call)
```json
[{"_obj":"imageSize","width":{"_unit":"pixelsUnit","_value":2000},"scaleStyles":true,"constrainProportions":true,
  "interfaceIconFrameDimmed":{"_enum":"interpolationType","_value":"bicubic"}}]
```
(portrait: `"height"` instead of `"width"`). Check the new size with `get_documents`.

## 4. Save as PNG
`save_document_as` with path `<repo>/measure/<id>.png`, type `PNG`. (batchPlay `save` with a path fails — don't use it.)
The file stays **ProPhoto** (PNGs carry no profile). Do NOT use `convertToProfile`.

## 5. Close the duplicate without saving (its own call)
```json
[{"_obj":"close","saving":{"_enum":"yesNo","_value":"no"}}]
```
Then `get_documents` and confirm only the user's working document remains and is the active one. Never close the user's original.

## 6. Convert and measure
`darkroom` `prophoto_to_srgb` with `measure/<id>.png` → `measure/<id>_srgb.png`; then `measure_baseline` on `measure/<id>_srgb.png`; `view_image` for a look.

## Errors
- "host is in a modal state" → a Photoshop dialog is open: ask the user to close it, then retry that one step.
- Timed out → the command may have succeeded: `get_documents` / check the file before retrying; never re-send blindly.
- **Profile:** `prophoto_to_srgb` assumes the document is ProPhoto RGB. There is no tool to read the profile — do not search the plugin source for one. Ask the user once ("Is the document ProPhoto RGB? Status bar › Document Profile") and continue on their answer. If it is not ProPhoto, stop and say so.
