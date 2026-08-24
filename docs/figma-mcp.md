# Figma MCP Integration

## Source of truth

The Figma design is accessed through the project's configured **Figma MCP server**.

The audit workflow must use Figma MCP directly to inspect the design before creating or updating the screen inventory.

## MCP-first rules

1. Discover the available Figma MCP tools in the current Claude Code session.
2. Locate the target Figma file from the user's supplied context or the connected MCP context.
3. Traverse pages and relevant nodes.
4. Preserve Figma node IDs in project documentation.
5. Use visual/screenshot inspection through Figma MCP when structural metadata alone is insufficient.
6. Re-query the relevant Figma node when implementing/reviewing a screen if visual details are ambiguous.
7. Never claim a design detail was verified unless it was actually obtained from Figma MCP.

## Figma-to-project mapping

Each screen should have a mapping like:

| Screen ID | Figma Page | Figma Node ID | Route | Module | Status |
|---|---|---|---|---|---|
| SCR-001 | Dashboard | `node-id` | `/dashboard` | MOD-001 | PLANNED |

The exact node ID syntax returned by the configured Figma MCP should be preserved; do not normalize or invent IDs.

## Failure behavior

If the Figma MCP cannot access the file:
- set the audit status to `BLOCKED`;
- document the MCP/tool/file access issue;
- do not use web search as a replacement;
- do not fabricate screens or Figma properties.

## During implementation

The frontend screen builder should use the stored Figma node ID to locate the exact design frame through Figma MCP whenever the design needs to be rechecked.

The UI reviewer should also use Figma MCP for visual verification when available.
