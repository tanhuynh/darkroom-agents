# Recipe library — how it is organized and how to use it

| Layer | File | Changes when… |
|---|---|---|
| **Engine** (how) | `engine.md` | Photoshop/Camera Raw/MCP behavior is learned (schema, calibrations, gotchas) |
| **Playbooks** (what) | `playbooks/landscape.md`, `playbooks/wildlife.md` | a principle is confirmed on ≥2 images, or is clearly physics |
| **Materials** | `materials.md` | a new surface/place is met (snow, water, grass, fur…) |
| **Cases** (episodes) | `cases/<id>.md`, `cases/crf-<id>-final.json`, `cases/index.csv` | every finished image |
| **Inbox** (proposals) | `inbox/` | an agent learns something it wants added to the shared layers — reviewed before merge |
| Archive | `archive/ps-acr-recipes-2026-11-16.md` | never — the pre-restructure log, kept for reference |

## In a session
1. **Classify** the image: genre (landscape / wildlife / mixed), light (sunrise, midday, overcast, fog, storm, night),
   subject and elements, main problems (from the baseline measurement). Note any new material.
2. **Load** `engine.md` (always) + the matching playbook (both for mixed, e.g. animals in a big landscape) +
   `materials.md` entries for what's in the frame + the 2–3 closest cases from `cases/index.csv` (match light + problems first, location last).
3. Plan with playbook rules (IF → DO → CHECK); use cases for concrete values, never paste a case's masks blindly (geometry is per image).

## After the user saves (archive step) — any agent
1. Write `cases/crf-<id>-final.json` (final filter command + raw-SO manual settings) and `cases/<id>.md` (tags + what worked/failed), add a row to `cases/index.csv`.
2. **Sort the lessons** — each one either stays in the case card (image-specific) or becomes a **proposal** in `inbox/` (template there) targeting:
   - `engine.md` — engine fact (schema, unit, calibration, tool quirk);
   - `materials.md` — material behavior;
   - a playbook — principle: **promote** if physics or now seen on ≥2 cases (add the case ID; drop *(1 case)*); otherwise mark *(1 case)*.
   Proposals are merged by the user, or by an agent the user explicitly asks to merge (checklist in `inbox/README.md`).
3. If a case **contradicts** a rule, propose an edit of that rule (type `contradiction`: narrow its IF or change its values, cite both cases) — never a second, conflicting rule.
4. Every ~5 cases: consolidation pass — merge overlapping rules, retire *(1 case)* rules that were never confirmed, check playbooks stay short.
