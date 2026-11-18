# Inbox — proposed knowledge changes awaiting review

Agents never edit the playbooks, `materials.md` or `engine.md` directly. They drop a proposal here; the user (or an
agent the user asks) reviews and merges it, then deletes the proposal. Git history keeps who proposed and who merged.

**File name:** `YYYY-MM-DD-<agent>-<case>.md` (e.g. `2026-11-20-gemini-0301.md`). One proposal per lesson is easiest to review.

## Template
```markdown
# <one-line rule>
- **Agent:** claude | gemini | local:<model>
- **Target:** playbooks/landscape.md §E | playbooks/wildlife.md §B | materials.md (Snow) | engine.md §8 …
- **Type:** new rule | change rule | contradiction | material note | engine fact
- **Rule:** IF <measurement> → DO <values, stored units> → CHECK <what must hold>
- **Evidence:** case <id>: <before → after numbers from measure_all.py>; overlay files / screenshots if useful
- **Conflicts with:** <existing rule + its cases, or "none">
- **Scope:** physics/general | seen on N cases | this image only (→ probably belongs in the case card, not here)
```

## Review checklist (merger)
1. Evidence is measured, not just "looks better".
2. Physics or ≥2 cases → merge as a rule; 1 case → merge marked *(1 case)* or leave in the case card.
3. Contradiction → edit the existing rule (narrow its IF or change values) and cite both cases; never keep two conflicting rules.
4. Add provenance to the rule's citation: *(0301 · gemini)*.
5. Delete the proposal file in the same commit as the merge.
