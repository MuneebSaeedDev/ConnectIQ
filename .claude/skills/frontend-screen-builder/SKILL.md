---
name: frontend-screen-builder
description: Build exactly one Figma-backed frontend screen at a time, dynamically and according to project specifications, then automatically review/test it and persist completion state. Continue builds the next eligible screen only.
---

# Frontend Screen Builder

## Mission

Implement exactly one frontend screen per invocation.

The screen must be a real application screen, not a static mock.

## Required reading

1. `docs/agent-rules.md`
2. `docs/workflow-state.md`
3. `docs/figma/screen-inventory.md`
4. `docs/modules/module-plan.md` if available
5. relevant module spec
6. existing architecture and component conventions

## Selection logic

If the user specifies a screen:
- select that exact screen ID/name;
- verify it exists in the inventory.

If the user says continue/next:
- select the first eligible screen in planned order;
- skip `DONE`/`VERIFIED`;
- respect dependencies;
- never silently jump over a blocked prerequisite.

If the user has not specified a target and there is no prior workflow state:
- select the first eligible planned screen.

## Before coding

Use the stored Figma page/frame/node ID and inspect the exact target through the configured Figma MCP.

Inspect:
- Figma frame/variants;
- route;
- existing components;
- design tokens;
- data contracts;
- backend availability;
- existing screen patterns;
- relevant assets.

If the screen is already complete, do not rebuild it. Report it and select the next screen only when the user explicitly asked to continue.

## Implementation requirements

Build only the selected screen and its directly required support pieces.

Match the Figma design while preserving project architecture.

Implement real behavior:
- data loading;
- empty state;
- errors;
- validation;
- interactions;
- responsive layouts;
- accessibility;
- navigation;
- API calls when available.

Reuse existing components.

Do not create fake backend behavior merely to make a screenshot look complete. If a backend dependency is not available, use the project's established mock strategy and document the boundary.

## Automatic quality gate

After implementation:
1. invoke `ui-reviewer`;
2. invoke `tester`;
3. fix in-scope findings;
4. rerun affected checks;
5. repeat until pass or a genuine blocker remains.

A reviewer/tester may not use Git operations.

## Documentation gate

Update:
- `docs/figma/screen-inventory.md`;
- the relevant module document;
- `docs/reviews/review-log.md`.

Mark:
- `IN_PROGRESS` while building;
- `REVIEW_REQUIRED` after implementation;
- `VERIFIED` after review/test pass;
- `DONE` only after docs are updated.

If blocked, mark `BLOCKED` and record the exact blocker.

## Hard stop

After one screen reaches a terminal state (`DONE`, `BLOCKED`, or a clearly documented unresolved review failure), STOP.

Do not automatically build another screen.

A later "continue" invocation starts the next eligible screen.
