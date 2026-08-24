# Orchestration Protocol

Claude Code should treat each initiator as a stateful workflow invocation.

## Invocation sequence

Recommended project lifecycle:

1. `01-audit-figma.md`
2. `02-plan-modules.md`
3. repeat `03-build-next-screen.md` until frontend prerequisites required for the desired module are complete
4. repeat `04-build-next-module.md` until modules are complete

These are not mandatory linear stages for every project; dependencies in the persisted docs determine eligibility.

## Automatic agents

The screen workflow automatically invokes:
- `ui-reviewer`
- `tester`

The module workflow automatically invokes:
- `ui-reviewer`
- `integration-reviewer`
- `tester`

If a required agent is unavailable in the current Claude Code runtime:
- document the missing quality gate;
- do not falsely mark the unit as `DONE`.

## State consistency

At the end of each invocation:
- no stale `IN_PROGRESS` status may remain for the completed unit;
- blockers must include a reason and prerequisite;
- review results must be recorded;
- the next eligible unit must be determinable from the docs.

## User control

The agent never continues to the next screen/module unless the user invokes the workflow again or explicitly says to continue/next.

This keeps each build step reviewable and prevents accidental large-scope implementation.
