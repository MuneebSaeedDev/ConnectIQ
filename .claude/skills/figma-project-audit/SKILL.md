---
name: figma-project-audit
description: Audit an available Figma design and the current project to create a complete, evidence-based inventory of screens, states, variants, implementation status, and remaining work. Use when the user asks to audit/traverse Figma, determine what screens are built/remaining, or refresh the design inventory.
---

# Figma Project Audit

## Mission

Create a reliable design-to-code inventory before implementation. The output is persistent project documentation, not a one-off response.

## Required reading

Before acting:
1. Read `docs/agent-rules.md`.
2. Read `docs/workflow-state.md`.
3. Inspect existing `docs/figma/screen-inventory.md` if present.
4. Inspect the current application structure without performing Git operations.
5. Discover currently available Figma/visual-design tools.
6. If Caveman or Graphify exposes relevant functionality, use the actual installed functionality where useful.

## Phase 1 — Connect to Figma through MCP

Figma is accessed through the project's configured **Figma MCP server**. Treat Figma MCP as the authoritative design source for this workflow.

Before auditing:
1. Discover the available Figma MCP tools/resources in the current Claude Code environment.
2. Identify the connected Figma file/design URL from the user prompt, project configuration, or available MCP context.
3. Use the Figma MCP tools to inspect the file directly.
4. If the Figma MCP exposes file/page/frame/node metadata, traverse it systematically rather than relying only on screenshots.
5. Use visual/screenshot capabilities from the Figma MCP when needed to validate layout, spacing, styling, responsive variants, and states.

Do **not** use web search as a substitute for the configured Figma MCP.

If the Figma MCP server is unavailable, disconnected, or the requested Figma file cannot be accessed:
- document `BLOCKED`;
- state the exact MCP/access issue;
- do not fabricate the screen inventory;
- do not switch to an unverified public/web representation of the design.

## Figma MCP traversal requirements

Use the Figma MCP as the primary source of truth and, where its available tools support it, inspect:

- file metadata;
- pages;
- top-level frames;
- nested frames;
- components/component sets;
- variants;
- prototypes/interactions;
- node IDs;
- text/content;
- layout properties;
- fills/strokes/effects;
- typography;
- spacing/constraints/auto-layout;
- assets/icons;
- desktop/tablet/mobile variants;
- loading/empty/error/success states.

Preserve useful Figma node IDs in the generated documentation so later skills can locate the exact design source again.

When possible, store a compact mapping such as:
`SCR-001 → Figma page → frame/node ID → route → module`.

## Phase 2 — Traverse systematically

Inspect the design hierarchy:
- pages;
- sections;
- frames;
- nested screen frames;
- responsive variants;
- components and component sets;
- prototypes/interactions when accessible;
- relevant assets;
- empty/loading/error/success states;
- dialogs/drawers/modals;
- mobile/tablet/desktop variants.

Identify actual application screens separately from reusable components.

Use stable IDs such as `SCR-001`, `SCR-002`.

## Phase 3 — Compare with code

For each discovered screen, inspect the existing project for:
- route;
- page/component implementation;
- API/data wiring;
- states;
- responsive behavior;
- tests.

Classify status using the canonical workflow states.

Never equate "a route exists" with "screen is complete."

## Phase 4 — Write docs

Create/update:
- `docs/figma/screen-inventory.md`
- `docs/figma/design-system-notes.md` when useful
- `docs/figma/coverage-report.md`

The inventory must clearly show:
- built;
- partially built;
- remaining;
- blocked;
- design ambiguities;
- dependencies.

Preserve previous findings when still valid. Do not erase useful history.

## Phase 5 — Final audit gate

Before finishing:
- verify every discovered screen has a row;
- verify every row has a status;
- verify routes/implementation evidence where available;
- identify screens that cannot be verified;
- list unresolved Figma/code conflicts.

Do not build screens in this skill.

## Output behavior

After documentation is updated, stop. Do not continue into module planning or implementation unless the user explicitly invokes the next workflow.
