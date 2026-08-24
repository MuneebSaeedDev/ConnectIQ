---
name: module-planner
description: Decompose an application into small dependency-aware modules and maintain an ordered build plan covering frontend screens, backend, data, integrations, and acceptance criteria.
---

# Module Planner

## Mission

Turn the audited application into a small, executable, dependency-aware module plan.

## Required reading

1. `docs/agent-rules.md`
2. `docs/workflow-state.md`
3. `docs/figma/screen-inventory.md`
4. existing architecture/specification docs
5. existing `docs/modules/module-plan.md`

Inspect the project structure to validate assumptions.

## Planning rules

A module should represent a coherent business capability, not a single UI component.

Split work when a capability has:
- independent data ownership;
- independent API contracts;
- independent user journey;
- meaningful dependency boundaries;
- a distinct acceptance boundary.

Avoid:
- giant "build the whole app" modules;
- modules containing unrelated features;
- modules so tiny that they have no useful independent acceptance boundary.

## Dependency ordering

Determine:
1. foundational/shared capabilities;
2. authentication/authorization dependencies;
3. data/source dependencies;
4. core business workflows;
5. secondary workflows;
6. reporting/admin/support capabilities.

Use explicit dependency IDs.

## Frontend mapping

For each module, map every required Figma screen using the exact screen IDs from `screen-inventory.md`.

A module plan must distinguish:
- `BUILT` frontend screens;
- `PLANNED` frontend screens;
- `BLOCKED` frontend screens.

Do not build frontend screens from this skill.

## Backend mapping

For each module identify:
- entities/data models;
- API endpoints/actions;
- validation;
- authorization;
- business rules;
- external integrations;
- jobs/events if applicable;
- error behavior;
- persistence requirements;
- tests.

Do not invent implementation details that the project does not support. Mark unknowns.

## Acceptance criteria

Each module needs testable criteria covering:
- frontend;
- backend;
- integration;
- permissions;
- error/loading/empty states where applicable;
- responsiveness/accessibility where applicable.

## Write docs

Create/update:
- `docs/modules/module-plan.md`
- `docs/modules/MOD-XXX.md` for each module when useful.

Record the plan order and rationale.

## Stop condition

After the plan is documented, stop. Do not implement a module or screen.
