# Initiator — Audit Figma

Run the `figma-project-audit` skill.

Audit the Figma design through the configured **Figma MCP server** and the current application. Figma MCP is mandatory for the design traversal; do not substitute web search or guesswork. Traverse the complete design hierarchy, identify all real application screens and important states/variants, compare them with the existing implementation, and create/update the persistent screen inventory and design notes.

Use the configured Figma MCP to traverse the Figma file and preserve useful Figma page/frame/node IDs in the documentation. Use the installed Caveman and Graphify capabilities if they expose relevant functionality, but do not assume undocumented commands.

Do not build or modify application features during this run.

Follow `docs/agent-rules.md` strictly.

When the audit is complete, update all relevant docs and STOP.
