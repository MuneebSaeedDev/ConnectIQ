# Claude Code Figma → Build Workflow

This package adds a documentation-driven workflow for Claude Code projects that are designed from Figma.

## Included

### Skills
- `figma-project-audit` — traverses the available Figma source, inventories screens/states, identifies built vs remaining work, and maintains project documentation.
- `module-planner` — decomposes the application into ordered build modules and maintains the dependency-aware module plan.
- `frontend-screen-builder` — builds exactly one frontend screen per invocation/continuation, maps it to the Figma/spec, makes it dynamic, runs automatic review/testing, and records completion.
- `module-builder` — builds exactly one complete module at a time across frontend/backend/integration layers. It maps required frontend screens to the frontend-screen tracker and stops if prerequisites are missing.

### Automatic quality agents
- `ui-reviewer` — reviews implementation against the Figma/spec, UX consistency, responsiveness, accessibility, and project conventions.
- `integration-reviewer` — reviews module-level frontend/backend contracts, error/loading states, data flow, security boundaries, and integration quality.
- `tester` — validates the completed screen/module with available tests, static checks, build/type checks, and runtime verification where possible.

### Shared rules
- `docs/agent-rules.md` — non-negotiable operating rules.
- `docs/workflow-state.md` — canonical state model and update protocol.
- `docs/templates/` — templates for generated project documentation.
- `prompts/` — copy/paste initiator prompts for each workflow.
- `agents/` — Claude Code subagent definitions.

## Installation

Copy the `.claude` directory and `docs` directory from this package into the project root. Copy `prompts` wherever you keep team prompts.

Recommended resulting structure:

```text
your-project/
├── .claude/
│   ├── agents/
│   │   ├── integration-reviewer.md
│   │   ├── tester.md
│   │   └── ui-reviewer.md
│   └── skills/
│       ├── figma-project-audit/
│       ├── frontend-screen-builder/
│       ├── module-builder/
│       └── module-planner/
├── docs/
│   ├── agent-rules.md
│   ├── workflow-state.md
│   ├── figma/
│   ├── modules/
│   └── reviews/
└── prompts/
    ├── 01-audit-figma.md
    ├── 02-plan-modules.md
    ├── 03-build-next-screen.md
    └── 04-build-next-module.md
```

## Important

This workflow intentionally does **not** perform Git/repository operations. It does not commit, branch, merge, push, pull, reset, stash, rebase, amend, or modify Git configuration.

### Figma MCP

Figma is a required dependency for the audit workflow and is accessed directly through the project's configured **Figma MCP server**.

The `figma-project-audit` skill:
- discovers the available Figma MCP tools;
- traverses the connected Figma file;
- records Figma page/frame/node IDs;
- inspects screens, variants, components, states, interactions, and design properties;
- uses Figma MCP visual/screenshot capabilities where available;
- compares the Figma inventory with the current codebase.

It does not substitute web search for Figma MCP.

If Figma MCP is unavailable or the file cannot be accessed, the audit becomes `BLOCKED` rather than guessing.

Caveman and Graphify remain installed extension integrations. The skills instruct the agent to discover and use their actual exposed capabilities when relevant, without assuming undocumented command names or APIs.
