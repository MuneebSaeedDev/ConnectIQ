# Enterprise ETL Platform — Design System

## 1. Design Direction

The application should use a **minimal, modern enterprise interface** designed for data engineers, operations teams, analysts, administrators, and auditors.

The visual language should communicate:

* Reliability
* Precision
* Control
* Data clarity
* Operational visibility
* Security
* Scalability
* Professional enterprise software

The interface should feel **clean and intelligent rather than decorative**.

Avoid:

* Excessive gradients
* Large decorative illustrations
* Excessive rounded cards
* Heavy shadows
* Excessive animations
* Visually noisy dashboards
* Oversized typography
* Unnecessary borders
* Excessive colors
* Consumer/SaaS-style marketing aesthetics

Prioritize:

* Clear hierarchy
* Information density
* Consistency
* Fast scanning
* Strong alignment
* Predictable interactions
* Clear status communication
* Excellent empty/loading/error states

---

# 2. Visual Philosophy

The UI should follow:

> **Minimal surface + strong hierarchy + high information clarity.**

Every element should have a purpose.

The interface should visually distinguish between:

1. Navigation
2. Context
3. Primary action
4. Important information
5. Supporting information
6. System status
7. Detailed data
8. Destructive actions

The application should not attempt to visually emphasize everything.

Use visual hierarchy so the user immediately understands:

**Where am I → What is happening → What requires attention → What can I do next**

---

# 3. Visual Hierarchy

Use a consistent hierarchy throughout the application.

### Level 1 — Page Identity

The page title should clearly identify the current workspace.

Example:

```text
Pipeline Monitoring
Monitor executions, workers, queues and pipeline health
```

Page title:

* Strong
* Prominent
* Compact
* Never oversized

### Level 2 — Primary Information

Important information such as:

* Pipeline status
* Execution status
* Success rate
* Failure rate
* Throughput
* Data quality
* Active jobs

should have stronger visual emphasis.

### Level 3 — Supporting Information

Examples:

* Last execution
* Created date
* Owner
* Execution duration
* Retry count
* Source
* Destination

Use smaller typography and muted colors.

### Level 4 — Metadata

Low-priority information should visually recede.

Examples:

* IDs
* timestamps
* correlation IDs
* technical metadata
* secondary descriptions

---

# 4. Color System

Use a restrained enterprise color palette.

The primary interface should be based on:

* Neutral background
* White/surface cards
* Dark text
* Muted secondary text
* One primary brand/accent color
* Semantic status colors

### Base Colors

```text
Background        #F8FAFC
Surface           #FFFFFF
Surface Secondary #F1F5F9
Border            #E2E8F0

Primary Text      #0F172A
Secondary Text    #475569
Muted Text        #64748B
Disabled Text     #94A3B8
```

### Primary Accent

Use a single strong primary accent for:

* Primary buttons
* Active navigation
* Selected states
* Links
* Focus indicators
* Important interactive elements

The accent should be professional and restrained.

Avoid using the primary color everywhere.

### Semantic Colors

Use semantic colors consistently.

```text
Success:
Used for completed, healthy, valid, synchronized

Warning:
Used for delayed, degraded, attention required

Error:
Used for failed, invalid, disconnected, destructive

Info:
Used for informational or processing states
```

Semantic colors should primarily communicate **state**, not decoration.

---

# 5. Status Colors

Pipeline and execution states should be immediately recognizable.

Example:

```text
Draft       → Neutral
Scheduled   → Information
Queued      → Information
Running     → Primary/Information
Completed   → Success
Failed      → Error
Cancelled   → Neutral
Retrying    → Warning
Paused      → Warning
```

Use a combination of:

* Color
* Icon
* Text

Never rely on color alone.

Example:

```text
● Running
✓ Completed
! Failed
↻ Retrying
○ Queued
```

---

# 6. Typography

Typography should be highly readable and compact.

Use a modern UI font such as:

**Inter**

or an equivalent highly readable sans-serif.

### Type Scale

```text
Page Title       24px / 32px / 600
Section Title    18px / 26px / 600
Card Title       15–16px / 22px / 600
Body             14px / 20px / 400
Secondary        13px / 18px / 400
Metadata         12px / 16px / 400
Button           14px / 20px / 500
Table Header     12px / 16px / 600
```

Avoid extremely large headings.

This is an **enterprise operational application**, not a marketing website.

---

# 7. Typography Rules

Use typography to communicate hierarchy rather than excessive visual styling.

### Primary text

Dark and highly readable.

### Secondary text

Muted but still readable.

### Metadata

Small and subdued.

### Numbers

Important operational metrics may use slightly stronger typography.

Example:

```text
12,482
Processed Records
```

The number should dominate the label, but remain proportional to the overall interface.

---

# 8. Spacing System

Use a consistent spacing scale based on 4px increments.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Common usage:

```text
4px   → Icon/text relationships
8px   → Tight component spacing
12px  → Form/control spacing
16px  → Standard component padding
24px  → Card/page sections
32px  → Major sections
48px+ → Large page separation
```

Avoid arbitrary spacing values.

---

# 9. Border Radius

Use subtle corner rounding.

Recommended:

```text
Small controls      6px
Inputs              6px
Buttons             6px
Cards               8px
Modals              10px
Large containers    10–12px
```

Avoid excessive pill-shaped interfaces.

Pills should primarily be used for:

* Status badges
* Tags
* Categories
* Compact filters

---

# 10. Shadows

Use shadows minimally.

Most enterprise surfaces should rely on:

* Background contrast
* Borders
* Spacing

rather than large shadows.

Recommended:

```text
Default card:
No shadow or extremely subtle shadow

Dropdown:
Small elevation

Modal:
Moderate elevation

Floating panel:
Moderate elevation
```

Avoid dramatic floating-card effects.

---

# 11. Borders

Use subtle borders to establish structure.

Default:

```text
1px solid #E2E8F0
```

Borders should define:

* Cards
* Tables
* Inputs
* Panels
* Sidebars
* Modals
* Configuration sections

Do not put borders around every small element.

---

# 12. Application Shell

The application should use a professional enterprise application shell.

```text
┌───────────────────────────────────────────────────────────┐
│ Header                                                     │
├──────────────┬────────────────────────────────────────────┤
│              │                                            │
│ Sidebar      │ Main Content                               │
│              │                                            │
│ Navigation   │ Page Header                                │
│              │                                            │
│              │ Content                                    │
│              │                                            │
│              │                                            │
└──────────────┴────────────────────────────────────────────┘
```

### Sidebar

The sidebar should contain:

* Logo/product identity
* Main navigation
* Navigation groups
* Active state
* Collapsible behavior
* User/account section

Keep it visually quiet.

The sidebar should support fast navigation without dominating the screen.

---

# 13. Header

The header should contain contextual and operational controls such as:

* Breadcrumbs where useful
* Search
* Notifications
* Help
* Organization context
* User profile
* Account menu

Avoid filling the header with unnecessary controls.

---

# 14. Navigation Design

Navigation should be organized around user workflows rather than technical implementation.

Possible structure:

```text
Overview

Data
  Data Sources
  Destinations

Pipelines
  Pipeline Library
  Pipeline Builder
  Executions
  Monitoring

Operations
  Workers
  Queues
  Errors

Analytics
  Dashboard
  Reports
  Data Quality

Administration
  Users
  Teams
  Roles
  Audit Logs
  Settings
```

Use clear grouping and visual separation.

---

# 15. Page Layout

Every major page should follow a predictable structure:

```text
Page Title
Description / Context
Primary Actions

Filters / Controls

Primary Content

Secondary Information
```

Example:

```text
Pipeline Monitoring
Monitor running and completed pipeline executions

[Date Range] [Status] [Pipeline] [Search]

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Running  │ │ Failed   │ │ Success  │
│   12     │ │    3     │ │   98.2%  │
└──────────┘ └──────────┘ └──────────┘

Execution Table
```

---

# 16. Cards

Cards should be used to group meaningful information.

Good uses:

* KPI metrics
* Pipeline summaries
* System health
* Connector status
* Execution summaries
* Configuration sections

Avoid turning every piece of information into a card.

Cards should feel like **functional containers**, not decorative objects.

---

# 17. Dashboard Design

The dashboard should prioritize operational awareness.

Recommended hierarchy:

```text
Page Header

Global Health / Alerts

Key Metrics

Pipeline Activity

Execution Performance

Data Quality

System Health

Recent Activity
```

Important information should appear above the fold.

Dashboard widgets should answer:

* Is the platform healthy?
* Are pipelines running?
* Are pipelines failing?
* Is data quality acceptable?
* Are workers healthy?
* Are queues delayed?
* Is the system under load?

---

# 18. KPI Cards

KPI cards should remain compact.

Example:

```text
Running Pipelines

24
↑ 8.4%

Currently executing
```

Structure:

```text
Label
Value
Trend / Status
Supporting context
```

Do not overload KPI cards with excessive charts.

---

# 19. Tables

Tables are a primary UI pattern because the application manages large amounts of operational data.

Tables should support:

* Search
* Filtering
* Sorting
* Pagination
* Row selection
* Bulk actions where appropriate
* Column visibility where appropriate
* Row actions
* Status indicators

Example:

```text
Pipeline        Status       Records      Duration      Updated
──────────────────────────────────────────────────────────────
Customer Sync   ● Running    42,812       02:14         2m ago
Inventory Sync  ✓ Completed  120,482      05:42         10m ago
Orders Sync     ! Failed     12,402       01:18         15m ago
```

Keep tables dense enough for professional users without becoming difficult to scan.

---

# 20. Pipeline Builder Design

The Pipeline Builder is the application's primary visual workspace.

It should feel like a **professional engineering canvas**.

```text
┌──────────────┬───────────────────────────────┬───────────────┐
│ Node Library │                               │ Configuration │
│              │                               │               │
│ Source       │       [Source]                │ Node Settings │
│ Filter       │           │                   │               │
│ Mapping      │           ▼                   │ Properties    │
│ Transform    │      [Transform]              │               │
│ Validation   │           │                   │               │
│ Merge        │           ▼                   │               │
│ Destination  │      [Destination]            │               │
│              │                               │               │
└──────────────┴───────────────────────────────┴───────────────┘
```

### Canvas

The canvas should support:

* Pan
* Zoom
* Node selection
* Connections
* Drag/drop
* Multi-selection
* Clear connection lines
* Grid alignment
* Visual validation
* Execution status

Keep the canvas visually clean.

---

# 21. Pipeline Nodes

Each node should have a consistent structure.

```text
┌──────────────────────────┐
│ ● Source                 │
│                          │
│ Shopify                  │
│ Connected                │
└──────────────────────────┘
```

Node hierarchy:

```text
Icon + Node Type
Node Name
Important status
Optional metadata
Connection handles
```

Avoid putting too much configuration inside the node itself.

Detailed configuration belongs in the configuration panel.

---

# 22. Pipeline Node States

Nodes should visually communicate:

```text
Default
Selected
Running
Completed
Failed
Warning
Disabled
Invalid
```

Use subtle borders/background changes and semantic indicators.

Failed nodes should be immediately identifiable without making the entire canvas visually aggressive.

---

# 23. Configuration Panels

Configuration panels should prioritize clarity.

Structure:

```text
Node Configuration

General
────────────────
Name
Description

Connection
────────────────
Data Source

Options
────────────────
Batch Size
Timeout
Retry Policy

Validation
────────────────
...

[Cancel] [Save]
```

Use sections to prevent overwhelming long forms.

---

# 24. Forms

Forms should be clean and predictable.

Each field should have:

```text
Label
Input
Helper text when required
Validation message when invalid
```

Required fields should be clearly identified.

Errors should appear close to the field causing the problem.

---

# 25. Data Source / Destination UI

Connector pages should prioritize connection health.

Example:

```text
Salesforce
Connected

Connection Status     ● Healthy
Last Checked          2 minutes ago
Authentication        Configured

[ Test Connection ]

Configuration
─────────────────────
...
```

Never visually expose sensitive credentials.

---

# 26. Monitoring Interface

Monitoring should feel like an operational command center.

Use:

* Status indicators
* Execution timeline
* Progress
* Logs
* Metrics
* Current node
* Worker information
* Queue information

Example:

```text
Customer Sync
● Running

Progress
██████████████░░░░  78%

42,812 / 55,000 records

Current Node
Transformation

Worker
worker-03

Duration
04:21
```

---

# 27. Logs

Logs should use a highly readable technical layout.

```text
10:42:31  INFO   Extracted 10,000 records
10:42:34  INFO   Transformation started
10:42:37  WARN   42 invalid records detected
10:42:41  INFO   Batch completed
```

Use monospace typography only where appropriate for technical content.

Do not use monospace across the entire interface.

---

# 28. Error Experience

Errors should be actionable rather than merely descriptive.

Structure:

```text
Pipeline Failed

What happened
Destination connection timed out.

Impact
2,400 records were not loaded.

Suggested action
Check destination connectivity.

[Retry Execution]
[View Logs]
[View Failed Records]
```

Users should understand:

**What happened → Why → Impact → What can I do?**

---

# 29. Notifications

Notifications should be concise.

Example:

```text
✓ Pipeline completed

Customer Synchronization completed successfully.

2 minutes ago
```

For failures:

```text
! Pipeline failed

Inventory Synchronization failed during loading.

View execution →
```

Avoid intrusive notifications for non-critical events.

---

# 30. Data Quality UI

Data quality should use clear visual scoring.

Example:

```text
Data Quality

94.8%

Completeness       98%
Validity            96%
Uniqueness          91%
Consistency         94%
```

Use charts sparingly.

The user should immediately understand whether data quality is healthy.

---

# 31. Charts

Charts should be minimal and information-focused.

Use charts for:

* Execution trends
* Throughput
* Success/failure rates
* Data quality
* Resource usage
* Pipeline activity

Avoid unnecessary 3D charts, decorative graphs, or excessive colors.

Every chart should answer a specific operational question.

---

# 32. Empty States

Empty states should explain what the user can do next.

Bad:

```text
No data.
```

Good:

```text
No pipelines yet

Create your first pipeline to start moving
and transforming data between systems.

[Create Pipeline]
```

---

# 33. Loading States

Use skeletons for content-heavy interfaces.

Avoid blank screens.

For operations:

```text
Loading pipeline...
Connecting to source...
Fetching execution history...
```

Long-running operations should show progress when possible.

---

# 34. Destructive Actions

Destructive actions must be visually distinct.

Examples:

* Delete pipeline
* Remove connector
* Deactivate user
* Cancel execution

Require confirmation when the action has meaningful consequences.

Clearly explain what will happen.

---

# 35. Buttons

Use three primary button levels.

### Primary

For the main action:

```text
Create Pipeline
Save
Run Pipeline
Connect
```

### Secondary

For supporting actions:

```text
Cancel
Test Connection
View Details
```

### Destructive

For dangerous operations:

```text
Delete
Deactivate
Cancel Execution
```

Do not make every button visually prominent.

---

# 36. Icons

Icons should support recognition, not replace text unnecessarily.

Use consistent iconography throughout the application.

Examples:

```text
Pipeline      → workflow icon
Source        → database/cloud icon
Monitoring    → activity icon
Errors        → alert icon
Users         → users icon
Settings      → settings icon
Reports       → document/chart icon
```

Avoid mixing multiple icon styles.

---

# 37. Responsive Design

The platform is primarily a professional desktop application.

Desktop should receive the strongest optimization because:

* Pipeline Builder requires large canvas space.
* Monitoring requires dense information.
* Tables require horizontal space.
* Configuration panels require multiple columns.

On smaller screens:

* Sidebar collapses
* Panels stack
* Tables become horizontally scrollable or adapt
* Multi-column layouts become single-column
* Controls remain accessible
* Critical actions remain visible

Do not attempt to force complex pipeline editing into an unnecessarily constrained mobile layout.

---

# 38. Accessibility

The interface should provide:

* Keyboard navigation
* Visible focus states
* Accessible labels
* Semantic HTML
* Appropriate ARIA attributes
* Sufficient color contrast
* Non-color status indicators
* Accessible form errors
* Accessible dialogs
* Accessible tables

Accessibility should be built into components rather than added later.

---

# 39. Motion

Motion should be subtle and functional.

Use animation for:

* Loading
* Progress
* Panel transitions
* Notifications
* Status changes
* Modal transitions

Avoid:

* Excessive bouncing
* Large transitions
* Decorative animation
* Constant movement

Enterprise users should be able to work quickly without visual distraction.

---

# 40. Density

The application should support **high information density without visual clutter**.

Prefer:

```text
Compact spacing
Clear grouping
Strong alignment
Readable tables
Small metadata
Focused actions
```

Avoid:

```text
Huge whitespace
Oversized cards
Oversized headings
Decorative sections
Unnecessary illustrations
```

The UI should feel optimized for users who work with the platform for hours every day.

---

# 41. Role-Based Experience

The same design system should adapt to different enterprise users.

### Super Admin

Emphasis on:

* Platform health
* Organizations
* Infrastructure
* Security
* Global configuration

### Organization Admin

Emphasis on:

* Users
* Teams
* Connectors
* Pipelines
* Organization analytics

### Data Engineer

Emphasis on:

* Pipeline Builder
* Data sources
* Transformations
* Validation
* Execution
* Logs
* Errors

### Data Analyst

Emphasis on:

* Dashboards
* Analytics
* Reports
* Data quality

### QA / Data Quality Manager

Emphasis on:

* Validation rules
* Failed records
* Data quality
* Quality metrics

### Operations Engineer

Emphasis on:

* Workers
* Queues
* Execution health
* Failures
* Recovery
* Infrastructure

### Business User

Emphasis on:

* Business data
* Reports
* Pipeline results

### Auditor

Emphasis on:

* Audit logs
* History
* Compliance
* Read-only information

The UI should expose only relevant actions while maintaining a consistent visual language.

---

# 42. Overall Product Personality

The final interface should feel:

**Professional**
—not flashy.

**Minimal**
—not empty.

**Dense**
—not cluttered.

**Technical**
—not intimidating.

**Enterprise**
—not corporate-looking.

**Modern**
—not trendy.

**Reliable**
—not overly decorative.

**Data-focused**
—not marketing-focused.

The product should visually communicate:

> **"This is the control center for an organization's entire data ecosystem."**

---

# 43. Design System Rule

Every new screen or component must follow the same system.

Before adding a UI element, ask:

1. Does it have a clear purpose?
2. Does it follow the existing hierarchy?
3. Does it use the established spacing?
4. Does it use the established typography?
5. Does it use semantic status colors correctly?
6. Is the interaction obvious?
7. Is the information density appropriate?
8. Does it work with loading, empty, error, and success states?
9. Is it accessible?
10. Does it feel like part of the same enterprise platform?

The design should evolve as **one coherent system**, not as a collection of individually designed screens.
