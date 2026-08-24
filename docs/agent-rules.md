# Agent Operating Rules

These rules apply to every skill and every reviewer/tester.

## 1. Absolute Git and repository-operation prohibition

The agent MUST NOT:
- run Git commands;
- create, delete, switch, merge, rebase, reset, stash, cherry-pick, amend, tag, push, pull, fetch, clone, or commit;
- modify `.git/`;
- change Git configuration;
- create branches/worktrees;
- rewrite repository history;
- invoke scripts whose purpose is Git/repository management.

The agent may read ordinary project files needed to understand the application, but Git metadata is out of scope.

If the user asks for a Git operation, stop that part and tell the user it is outside this workflow.

## 2. No invented evidence

Never claim that:
- a Figma screen was inspected when it was not accessible;
- an API exists when it was not found;
- a backend endpoint exists when it was not verified;
- a component is reusable merely because it looks reusable;
- a test passed when it was not actually run;
- a screen is complete when acceptance criteria are unmet.

Use explicit statuses such as `blocked`, `unknown`, `verified`, and `not-verified`.

## 3. Figma is the visual source of truth

When a Figma source is available:
- inspect the relevant frame/page/component;
- capture screen names, dimensions where useful, responsive variants, states, interactions, components, typography, spacing, colors, icons, assets, and content structure;
- distinguish design intent from implementation assumptions;
- never overwrite project design-system decisions silently.

If the Figma source conflicts with the written project specification, document the conflict and follow the highest-priority project rule defined by the project. Do not silently choose.

## 4. Existing project conventions win over invention

Before implementing:
- inspect the existing architecture;
- identify routing;
- identify styling system;
- identify component conventions;
- identify data-fetching/state patterns;
- identify validation/error-handling patterns;
- identify test/build commands;
- reuse existing components before creating duplicates.

Do not introduce a new framework, state library, API layer, component library, or styling system without explicit project requirements.

## 5. Dynamic means real behavior

A screen is not complete if it is only a static visual mock.

Where applicable, implementation must include:
- real data flow;
- loading states;
- empty states;
- error states;
- validation;
- success/failure feedback;
- interaction states;
- disabled states;
- pagination/search/filter/sort behavior when specified;
- responsive behavior;
- keyboard/accessibility behavior;
- API integration when the module specification requires it.

Use realistic local mocks only when the project explicitly has no backend yet. Clearly label mock boundaries.

## 6. One unit at a time

Frontend screen skill:
- build one screen only;
- complete it;
- review/test it;
- update documentation;
- stop.

Module skill:
- build one module only;
- map all required screens;
- reuse screens already built by the frontend workflow;
- do not silently build missing screens;
- if required screens are missing, stop and instruct the user to run the frontend screen workflow first;
- complete backend/integration pieces required by that module;
- review/test;
- update documentation;
- stop.

## 7. Documentation is the persistent workflow state

Every meaningful operation updates the relevant docs.

Never mark an item `done` until:
1. implementation exists;
2. acceptance criteria are checked;
3. reviewer has completed;
4. tester has completed;
5. known blockers are resolved or explicitly accepted by the user.

## 8. Automatic review and test gates

After every frontend screen:
1. run `ui-reviewer`;
2. run `tester`;
3. fix issues that are within scope;
4. rerun the relevant checks;
5. update docs;
6. only then mark the screen complete.

After every module:
1. run `ui-reviewer` for affected UI;
2. run `integration-reviewer`;
3. run `tester`;
4. fix in-scope failures;
5. rerun relevant checks;
6. update docs;
7. only then mark the module complete.

Reviewers are read-only with respect to Git. They may suggest or, when explicitly instructed by the invoking skill, make safe code corrections inside the current work unit.

## 9. Scope control

Do not refactor unrelated parts of the application.

If a prerequisite is required:
- identify it;
- determine whether it belongs to the current unit;
- if it is outside the current unit, record it as a dependency/blocker;
- do not silently expand scope.

## 10. Security and secrets

Never expose or hard-code secrets.
Never print API keys, tokens, passwords, credentials, private keys, or environment secrets.
Use existing environment/configuration mechanisms.

## 11. Completion language

Use:
- `DISCOVERED` — found in Figma/spec.
- `PLANNED` — scheduled in module plan.
- `IN_PROGRESS` — currently being built.
- `BLOCKED` — cannot proceed due to a prerequisite.
- `REVIEW_REQUIRED` — implementation exists but quality gate is pending.
- `VERIFIED` — implementation and quality gates passed.
- `DONE` — verified and documented as complete.

A reviewer failure prevents `DONE`.

## 12. Caveman and Graphify

At the start of a task, inspect the currently available Claude Code tools/extensions.

If Caveman or Graphify expose relevant capabilities:
- use them when they improve traversal, dependency understanding, visualization, graph inspection, or project analysis;
- follow the actual installed interface rather than assuming a command name;
- record important findings in project docs.

Do not install, modify, remove, or reconfigure extensions unless the user explicitly asks.
