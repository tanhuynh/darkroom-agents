# darkroom-agents — shared workflow (all agents)

AI-assisted RAW editing in Photoshop/Camera Raw for wildlife and landscape (Canon R5 / R5 II). This file is
**model-neutral**: it says *what* to do. *How* your agent reaches Photoshop, files and the shell is in your adapter
(`agents/<agent>/ADAPTER.md`). Knowledge lives in `recipes/` (see `recipes/README.md`).

@./recipes/README.md
@./recipes/engine.md
@./recipes/session-handoff.md

## 1. Preconditions
- The Photoshop MCP server runs from `~/dev/adb-mcp` (fork of `mikechambers/adb-mcp`). Never edit workflow files there.
- The user works on a **duplicate** document, Lightroom Classic is closed, and **no Photoshop / Camera Raw dialog is open** (else `host is in a modal state`).
- Plugin not connected (`No clients registered for application: photoshop`) → ask the user to Reload the UXP plugin and click Connect.

## 2. Session workflow
0. **Classify & load:** genre, light, subject, main problems (+ any new material) → read `recipes/playbooks/<genre>.md` (both for mixed scenes), the relevant `recipes/materials.md` entries, and the 2–3 closest cases from `recipes/cases/index.csv`.
1. **Inspect:** documents, layers, doc info (size, raw SO type); baseline render (2000 px long edge, 16-bit sRGB PNG).
2. **White balance first, always** — `tools/measure_all.py baseline` (+ `tools/wb.py` for detail). Global cast → user fixes it in the raw SO; local shade casts → filter corrections.
3. **Composition & crop:** weight map + crop preview with thirds grid; non-destructive crop (`delete:false`).
4. **Critique:** what works first (composition, leading lines, DR retention, shadow detail, tonal balance), then the top 2–3 issues labeled **FIX** vs **TASTE**. Ignore the mat; small clipping/gamut numbers matter only for print.
5. **Plan in text, wait for approval:** full numerical Camera Raw plan (stored XMP values + dialog equivalents). No sliders before the user approves.
6. **Apply as one batched call**, render, run `tools/measure_all.py diff before after --hero …`, show the overlays (`before_after`, `diffmap`, `dbmap` when color changed, `hero_zoom`). Adjust in follow-up passes, each approved.
7. **Archive** after the user saves the TIFF (§5), then delete the render PNGs in `measure/` (keep the folder).

## 3. Camera Raw rules (details: `recipes/engine.md`)
- **Non-destructive:** never repaint or generate pixels; sculpt inside **one Camera Raw Filter** on the raw Smart Object so every adjustment stays editable by hand.
- **Read the live filter and resend every key** before any scripted write (Glow `$GLW*`, Remove `$Rtch`, …); omit `$BigT`.
- Units: local Exposure dialog = 4 × stored; other local sliders dialog = stored × 100.
- Mask coordinates are normalized to the **uncropped** SO.
- User-only steps: raw-SO WB/Calibration, first Color Range sample, AI masks (Select Subject/Sky/Landscape/Object), **Remove — always in the filter, never in the raw SO dialog**, standalone brush (last — scripted writes wipe it).

## 4. Measurement & proof
- Always `tools/measure_all.py` (`baseline` / `diff`) — never ad-hoc measurement scripts. One run per checkpoint; one 2000 px render (+ one 1:1 hero crop for Texture/Clarity).
- Overlays on every pass; your adapter says how to show them to the user.
- Weight ratios are guides, not targets — stop when the eye lands on the subject. Answer "flat" with structure (face-vs-shadow separation), not global contrast.

## 5. Writing to the knowledge base
| What | Where | How |
|---|---|---|
| Finished image | `recipes/cases/<id>.md`, `cases/crf-<id>-final.json`, row in `cases/index.csv` | write directly |
| New/changed rule, material note, engine fact | `recipes/inbox/<date>-<agent>-<case>.md` | **propose** (template in `recipes/inbox/README.md`); merged only after review |
| Status / open items | `recipes/session-handoff.md` | write directly |
- Never edit `WORKFLOW.md`, another agent's adapter, or the playbooks/materials/engine directly unless the user explicitly asks you to merge.
- Tag provenance: cases and proposals name the agent (`claude`, `gemini`, `local:<model>`).
- Commit in `darkroom-agents` only; the user pushes.
