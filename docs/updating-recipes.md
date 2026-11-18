# Updating the recipes

## After every finished image (any agent)
1. User saves the TIFF next to the source (`…/<date>/<name>-Edit.tif`).
2. Agent writes, directly:
   - `recipes/cases/crf-<id>-final.json` — the final filter command (read live, all keys) + any manual raw-SO settings the user reports (WB, Calibration, raw Remove).
   - `recipes/cases/<id>.md` — tags table (genre, light, subject, problems, location, agent) + what worked / what failed, with measured numbers.
   - a row in `recipes/cases/index.csv` with `agent` and `role=final`.
   - Alternative or benchmark edits of the same image: `cases/<id>-<agent>.md` + `crf-<id>-<agent>.json`, `role=benchmark`.
3. Agent sorts the lessons:
   - image-specific → stays in the case card;
   - anything for `engine.md`, `materials.md` or a playbook → a **proposal** in `recipes/inbox/` (template in `recipes/inbox/README.md`).
4. Agent updates `recipes/session-handoff.md` (status, open items), clears `measure/`, commits. User pushes.

## Reviewing the inbox (user, or an agent you ask)
- Merge only measured evidence. Physics or ≥2 cases → a rule; 1 case → rule marked *(1 case)* or keep it in the case card.
- A contradiction **edits** the existing rule (narrow the IF, change values) and cites both cases — never two conflicting rules.
- Add provenance to citations: *(0301 · gemini)*.
- Delete the proposal in the same commit as the merge.
- Quick way: ask an agent "review the inbox and merge what qualifies; list what you rejected and why."

## Consolidation (every ~5 images)
- Merge overlapping rules; retire *(1 case)* rules never confirmed; keep each playbook short enough to load every session.
- Move values that turned out to be universal into `engine.md` §8 (calibrations).
- Check `materials.md` "⚠️ not yet observed" entries that are now observed → mark ✅ with case IDs.

## Adding a genre
Copy the structure of `recipes/playbooks/landscape.md` (Default plan → sections of IF → DO → CHECK → critique standards),
start it as a ⚠️ draft like `wildlife.md`, and add the genre value to `cases/index.csv`.

## Where agent-specific knowledge goes
Only an agent's *own* habits, failure modes and tool quirks → the **Known tendencies** section of its adapter (the agent may edit that section directly). Everything about editing itself stays shared.

## What not to do
- Don't append per-image logs to the playbooks (that's what cases are for).
- Don't store presets — every value needs a CHECK.
- Don't paste a case's masks onto a new image; geometry is per image.
