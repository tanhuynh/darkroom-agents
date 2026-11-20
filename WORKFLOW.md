# darkroom-agents — shared workflow (all agents)

AI-assisted RAW editing in Photoshop/Camera Raw for wildlife and landscape (Canon R5 / R5 II). This file is
**model-neutral**: it says *what* to do. *How* your agent reaches Photoshop, files and the shell is in your adapter
(`agents/<agent>/ADAPTER.md`). Knowledge lives in `recipes/` (see `recipes/README.md`).

@./recipes/README.md
@./recipes/engine.md
@./recipes/session-handoff.md

## 1. Preconditions
- The Photoshop connector (named in your adapter) is running and connected; if not, follow its setup (`engine.md` §1, tagged ACCESS; `docs/running-a-session.md`). Never edit connector code from a session.
- The user works on a **duplicate** document, Lightroom Classic is closed, and **no Photoshop / Camera Raw dialog is open** (else `host is in a modal state`).
- Connector not connected → ask the user to restart/reconnect it per the adapter (adb-mcp: Reload the UXP plugin and click Connect).

## 2. Session workflow
0. **Classify & load:** genre, light, subject, main problems (+ any new material) → read `recipes/playbooks/<genre>.md` (both only for mixed scenes — the landscape is itself a subject, e.g. a vista with a small animal; a subject that fills the frame is its genre alone, so one playbook), the relevant `recipes/materials.md` entries, and the 2–3 closest cases from `recipes/cases/index.csv`.
1. **Inspect:** documents, layers, doc info (size, raw SO type); baseline render (2000 px long edge, 16-bit sRGB PNG).
2. **White balance first, always** — `tools/measure_all.py baseline` (+ `tools/wb.py` for detail). Global cast → user fixes it in the raw SO; local shade casts → filter corrections.
3. **Composition & crop:** weight map + crop preview with thirds grid; non-destructive crop (`delete:false`). The crop and the critique decide which AI masks are needed, so both come before them. Commit the crop (no pending Crop-tool box) before the user opens the filter dialog.
4. **Critique:** state the subject, then what works first (composition, leading lines, DR retention, shadow detail, tonal balance), then the top 2–3 issues labeled **FIX** vs **TASTE**. Ignore the mat; small clipping/gamut numbers matter only for print. For each fix **name the masks it needs** (Select Subject; for a person the whole person or the parts the filter offers, e.g. skin, eyes, teeth, hair, clothes; Sky / Landscape sub-categories only if the frame has them). Numbers at this point come from region boxes.
5. **AI masks (user step):** the user creates the masks the critique asked for in the Camera Raw Filter (wildlife: one animal, all of them, or animals + an accent such as food — accents must sit inside the mask; people: whole person or the parts that are offered, `Select People` can fail on some builds → fall back to Select Subject). The agent never creates an AI mask; it reads the live filter and records each AI component (type, subcategory, `MaskSyncID`, digests).
   - **Quality gate:** judge each mask on an overlay at 1:1 before using it. Good → clone it (see §3). Poor or missing → fall back to parametric masks (Luminance Range ∩ Radial/Linear − Object mask, Color Range with the user's first sample), or ask the user to refine it; say in the plan why a mask was skipped.
   - Optional measurement alpha: a Photoshop `select_subject` / `select_sky` export, labelled "PS proxy" (not the Camera Raw mask), for `measure_all.py baseline|diff --mask alpha.png` (subject / background / edge-ring stats); only when the mask passed the gate, otherwise measure by regions.
6. **Plan in text, wait for approval:** full numerical Camera Raw plan (stored XMP values + dialog equivalents); each correction names its mask source (AI-mask clone / inverted / subtracted, parametric, or intersect). Intersect forms (AI ∩ Luminance/Color Range or gradient) are unverified — flag them as experiments with a 1:1 control. No sliders before the user approves.
7. **Apply as one batched call**, render, run `tools/measure_all.py diff before after --hero …`, show the overlays (`before_after`, `diffmap`, `dbmap` when color changed, `hero_zoom`). Adjust in follow-up passes, each approved.
8. **Archive** after the user saves the TIFF (§5), then delete the render PNGs in `measure/` (keep the folder).

## 3. Camera Raw rules (details: `recipes/engine.md`)
- **Non-destructive:** never repaint or generate pixels; sculpt inside **one Camera Raw Filter** on the raw Smart Object so every adjustment stays editable by hand.
- **Read the live filter and resend every key** before any scripted write (Glow `$GLW*`, Remove `$Rtch`, …); omit the AI-mask bitmap blob (adb-mcp: `$BigT`).
- Units: local Exposure dialog = 4 × stored; other local sliders dialog = stored × 100.
- Mask coordinates are normalized to the **uncropped** SO.
- **AI masks are made once by the user, then reused by script:** copy the `Mask/Image` component into other corrections with a fresh `MaskSyncID` (invert = background, blend 1 = subtract), `$BigT` omitted. After the user reopens the dialog (e.g. after a Remove) the digests change — re-read before cloning. Proposal: `recipes/inbox/2026-11-17-claude-0025-cloned-ai-mask.md`.
- User-only steps: raw-SO WB/Calibration, first Color Range sample, AI masks (Select Subject/Sky/Landscape/Object), **Remove — always in the filter, never in the raw SO dialog**, standalone brush (last — scripted writes wipe it).

## 4. Measurement & proof
- Always `tools/measure_all.py` (`baseline` / `diff`) — never ad-hoc measurement scripts. One run per checkpoint; one 2000 px render (+ one 1:1 hero crop for Texture/Clarity).
- Overlays on every pass; your adapter says how to show them to the user.
- Weight ratios are guides, not targets — stop when the eye lands on the subject. Answer "flat" with structure (face-vs-shadow separation), not global contrast.

## 5. Writing to the knowledge base
| What | Where | How |
|---|---|---|
| Finished image (the edit the user saved) | `recipes/cases/<id>.md` + `cases/crf-<id>-final.json`, row in `cases/index.csv` (`agent`, `role=final`) | write directly |
| Alternative / benchmark edit of the same image | `recipes/cases/<id>-<agent>.md` + `cases/crf-<id>-<agent>.json`, row with `role=benchmark` | write directly |
| Your own tendencies (habits, failure modes, tool quirks of *your* agent) | the **Known tendencies** section of your own `agents/<agent>/ADAPTER.md` | write directly |
| New/changed rule, material note, engine fact | `recipes/inbox/<date>-<agent>-<case>.md` | **propose** (template in `recipes/inbox/README.md`); merged only after review |
| Status / open items | `recipes/session-handoff.md` | write directly |
- Never edit `WORKFLOW.md`, another agent's adapter, or the playbooks/materials/engine directly unless the user explicitly asks you to merge.
- Editing knowledge (how Camera Raw responds, calibrations, rules about light/materials) is the same for every agent — it never goes into an adapter or a per-agent lessons file; propose it via the inbox.
- Tag provenance: cases and proposals name the agent (`claude`, `gemini`, `local:<model>`).
- Commit in `darkroom-agents` only; the user pushes.
