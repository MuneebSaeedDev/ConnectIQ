# Figma Design System Notes

Generated and maintained by `figma-project-audit`. Source: https://www.figma.com/design/FU593OPeUscEvpu3hbOZrT/Ezitech-Project (file key `FU593OPeUscEvpu3hbOZrT`).

This file has **no Figma Variables bound** (`get_variable_defs` returned `{}` on every sampled node across auth, dashboard, org-management, and pipeline-builder screens) and **no libraries attached** (`get_libraries` → `libraries_added_to_file: []`). Everything below is reverse-engineered from raw values observed directly on layers, not read from an actual token system. Treat this document as the de-facto spec for tokens a real implementation should define — the Figma file itself does not define them.

## Typography

Two font families are used throughout, consistently:

- **Inter** — primary UI font.
  - Semi Bold: headings, card titles, primary buttons, nav labels.
  - Medium: secondary emphasis, table headers, form labels.
  - Regular: body copy, table cell values, descriptions.
  - Observed sizes: ~16px (H1/page titles), ~13–14px (section headings), ~12.5–13.5px (body/table text), ~11–12px (secondary/meta text).
- **JetBrains Mono** — monospace, used sparingly for system/technical strings.
  - Regular/Medium.
  - Observed usage: environment badges ("PRODUCTION"), version/build strings ("TLS 1.3 · v7.2.1"), footer legal/security text, node IDs (e.g. `val_node_0052`), the "or" divider on auth screens.
  - Observed sizes: ~8.5–11px — always small, decorative/technical, never body copy.

No Figma text styles exist; every text node sets size/weight/family directly. A real implementation should define a small type scale (e.g. `text-xs/sm/base/lg` + weight tokens) matching the sizes above rather than copying literal px values per component.

## Color system

No color variables or styles are bound. Recurring hex values group into a clear semantic palette:

| Role | Hex values observed | Usage |
|---|---|---|
| Primary/brand | `#0f5699` | Primary buttons, links, active nav state, brand mark |
| Text — primary | `#0f172a`, `#111827` | Headings, primary body text |
| Text — secondary | `#64748b`, `#6b7280`, `#94a3b8`, `#9ca3af` | Captions, helper text, table secondary columns |
| Border/divider | `#e2e8f0`, `#f1f5f9`, `#ddd`, `#cbd5e1` | Card borders, table dividers, input borders |
| Surface/background | `#fafbfc`, `#f3f5f7`, `#eceef2`, `#ffffff` | Page background, card background, hover surfaces |
| Success | `#16a34a`, `#15803d`, `#f0fdf4` | Success badges/banners, "Success Rate" metrics, completed states |
| Error/danger | `#dc2626`, `#b91c1c` | Error badges/banners, validation errors, failed-run indicators |
| Warning | `#d97706`, `#fffbeb` | Warning badges/banners, degraded-health indicators |

Recommendation for implementation: define these as CSS custom properties / a Tailwind theme extension (`primary`, `success`, `danger`, `warning`, `text-primary`, `text-secondary`, `border`, `surface`) rather than hardcoding hex values per component, since Figma provides no token source to keep in sync with.

## Spacing

No spacing variables bound. Observed spacing values cluster on an approximate 4px base unit: 4, 6, 8, 12, 16, 20, 24, 28, 36px recur most often for padding/gaps. Card/input corner radii are small and consistent, roughly 3–6px. No large-radius ("pill"/rounded-2xl style) elements were observed except badges/pills for status tags.

## Components

The file does not use Figma's native component/component-set system — no `component` or `component_set` node types were found anywhere in the traversed metadata (only plain `frame`, `text`, `instance`, and `vector` node types). 471 `instance` nodes exist, but they instance from frames, not from a published component library (confirmed: `get_libraries` shows zero attached libraries).

Repeated UI patterns are authored as plain frames with descriptive names rather than reusable components:
- Buttons (primary/secondary, various sizes) — recreated per screen.
- Form fields/labels — recreated per screen, consistent structure (`Label` + `Field`/`Container`).
- Dialogs — `ConfirmDialog`, `ConfirmationDialog`, `SaveConfirmationDialog` (nested inside several management screens as secondary states, e.g. Create/Edit Organization, Add/Edit User).
- Drawers — `DetailDrawer`, `UserDrawer` (nested inside list screens for Department, Team, Organization Activity, and User List screens).
- Cards — KPI/metric cards on all dashboard screens, consistent header+value+trend layout.
- Status badges/pills — colored per the semantic palette above (success/error/warning).

Because there's no component library in Figma, a real frontend implementation should build its own shared component library (Button, Input, Select, Card, Dialog, Drawer, Badge, Table) matching these repeated patterns, rather than trying to "import" anything from Figma directly.

## Icons/assets

Icons are individual SVG vector layers (209 `vector` nodes total across the file), named descriptively per instance (e.g. `EyeIcon`, `BuildingIcon`). No icon font or icon component library is attached. A logo/logomark image appears on auth screens ("Image - Meridian logomark"). No shared icon sprite/kit exists in the file — icons would need to be sourced from an icon library (e.g. Lucide/Heroicons, matching the visual style) during implementation rather than exported 1:1 from Figma, unless exact visual parity is required (in which case export each vector individually via Figma MCP asset download).

## Layout / responsiveness

Desktop-only design — no mobile or tablet frame variants exist anywhere in the file. Frame widths are inconsistent across sections:
- Auth screens (Splash, Login, Reset/Forgot Password, Email Verification, 2FA, Change Password, Logout): ~911px wide — appears to be a smaller "component mockup" canvas size rather than a real viewport.
- Application screens (dashboards, organization/user/role management, data sources, destinations, pipelines): range from ~1315px to ~2218px, with common widths at 1440px, 1580px, 1716px, 1920px, and 1957px.

This is a design-system inconsistency, not an intentional breakpoint system (there's no consistent stepped set of widths like 640/768/1024/1440). Treat 1440px (a common value in the set) as the reference desktop viewport for implementation, and do not attempt to derive responsive breakpoints from the frame width variety.

## States/variants coverage

Most screens show exactly one populated "happy path" state with realistic mock data as literal text content — there is no Figma variant system modeling loading/empty/error states for most screens (confirmed: 0 matches for `variant=`/`Variant` naming across all frame names in the file).

Real secondary states that do exist as separate nested frames:
- Confirmation/save dialogs nested inside Create/Edit Organization, Add/Edit User screens.
- Detail drawers nested inside Department, Team, Organization Activity, and User List screens.
- A likely modal-overlay sub-frame inside Add Destination Screen (`div.fixed`, unconfirmed).
- A likely before/after state pair inside Logout Confirmation Screen (two sibling root frames, unconfirmed).

**Gap**: this Figma file does not provide explicit loading/empty/error visual specs for the great majority of screens (list screens, dashboards, forms). Per `docs/agent-rules.md`, dynamic screens must still implement these states — the `frontend-screen-builder` skill will need to design them following the existing visual language (spacing/color/typography documented above) since Figma does not supply direct references for them. This should be treated as an open dependency, not a blocker, since the visual language is well-established enough to extrapolate consistently.
