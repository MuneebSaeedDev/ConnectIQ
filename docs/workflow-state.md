# Workflow State

This file describes the canonical state machine. The actual current project state should live in the generated tracking files under `docs/figma/`, `docs/modules/`, and `docs/reviews/`.

## Required trackers

### Figma tracker
`docs/figma/screen-inventory.md`

Tracks:
- Figma page/frame
- screen ID/name
- route or expected route
- variants/states
- implementation status
- frontend screen status
- module association
- dependencies
- notes/conflicts

### Module tracker
`docs/modules/module-plan.md`

Tracks:
- module ID
- module name
- business purpose
- ordered build position
- dependencies
- required frontend screens
- backend/data requirements
- status
- blockers
- acceptance criteria

### Review tracker
`docs/reviews/review-log.md`

Tracks:
- unit
- review type
- date/time
- checks performed
- findings
- fixes
- final status

## Status transitions

```text
DISCOVERED
   ↓
PLANNED
   ↓
IN_PROGRESS
   ├──→ BLOCKED
   ↓
REVIEW_REQUIRED
   ↓
VERIFIED
   ↓
DONE
```

`BLOCKED` may return to `IN_PROGRESS` after the blocker is resolved.

## Continuation behavior

When a user says "continue", "next", "build the next screen", or equivalent:
1. read the tracker;
2. select the first eligible item after the last completed item;
3. respect dependency order;
4. never rebuild an item marked `DONE` unless the user explicitly asks for a revision;
5. execute only the next eligible unit;
6. run the required quality gates;
7. update the tracker;
8. stop.

If no eligible item remains, report that the current workflow is complete and do not invent additional work.
