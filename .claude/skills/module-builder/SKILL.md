---
name: module-builder
description: Build exactly one complete application module at a time across frontend, backend, data, and integrations. Reuse and map frontend screens built by the frontend-screen workflow and block when required screens are missing.
---

# Module Builder

## Mission

Build one complete business module per invocation.

The module includes whatever frontend, backend, data, integration, validation, authorization, and testing work the module plan requires.

## Required reading

1. `docs/agent-rules.md`
2. `docs/workflow-state.md`
3. `docs/figma/screen-inventory.md`
4. `docs/modules/module-plan.md`
5. the selected `docs/modules/MOD-XXX.md`
6. relevant project architecture/specification docs

## Selection logic

If a module is specified:
- use that exact module ID.

If the user says continue/next:
- select the first eligible module by module-plan order;
- verify all dependencies are satisfied.

Never rebuild a completed module without an explicit revision request.

## Frontend prerequisite gate

Before backend/module integration work:
- map all required frontend screens to `screen-inventory.md`;
- inspect each screen's status.

If a required screen is not `DONE`/`VERIFIED`:
1. do not build that missing frontend screen here;
2. mark the module `BLOCKED`;
3. list exact missing screen IDs;
4. tell the user to invoke the frontend-screen-builder workflow;
5. stop.

The module-builder may wire existing completed frontend screens into the module, but it does not replace the dedicated frontend screen workflow.

## Module implementation

Once prerequisites pass:

### Frontend integration
- connect completed screens to real module data/actions;
- wire loading/error/empty/success states;
- connect navigation and permissions;
- preserve Figma fidelity.

### Backend
Implement the module's defined:
- models/entities;
- migrations/schema changes;
- services/use cases;
- API routes/actions;
- validation;
- authorization;
- business rules;
- error handling;
- transactions where required;
- background jobs/events if specified.

### Integration
Connect frontend to backend using existing project conventions.

Verify:
- request/response contracts;
- validation;
- authorization;
- error propagation;
- loading states;
- optimistic behavior only when specified;
- cache/state invalidation patterns.

Do not add unrelated features.

## Automatic quality gate

Run:
1. `ui-reviewer` for affected UI;
2. `integration-reviewer`;
3. `tester`.

Fix in-scope findings and rerun checks.

A module cannot be `DONE` while required checks fail.

## Documentation

Update:
- `docs/modules/module-plan.md`;
- `docs/modules/MOD-XXX.md`;
- `docs/figma/screen-inventory.md` when frontend status changes;
- `docs/reviews/review-log.md`.

Record:
- implemented capabilities;
- API/data changes;
- frontend mappings;
- tests;
- review findings;
- known limitations.

## Hard stop

After one module reaches `DONE`, `BLOCKED`, or an unresolved terminal failure, STOP.

A later "continue" invocation starts the next eligible module.
