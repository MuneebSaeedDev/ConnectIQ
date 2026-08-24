# Graph Report - Intern Project  (2026-08-22)

## Corpus Check
- 105 files · ~88,972 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 713 nodes · 999 edges · 44 communities (36 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- router.jsx
- agent.md
- apiFetch
- AppShell.jsx
- package.json
- DataQualityScreen.jsx
- ExecutiveDashboardScreen.jsx
- PipelineOverviewScreen.jsx
- Figma Notes
- index.js
- DashboardScreen.jsx
- Header.jsx
- Dependency Notes
- Agent Operating Rules
- Module Builder
- SourceHealthScreen.jsx
- Figma Project Audit
- Module Planner
- Review checklist
- Frontend Screen Builder
- Review checklist
- Figma Design System Notes
- Claude Code Figma → Build Workflow
- Figma Notes
- Required trackers
- .oxlintrc.json
- Figma Coverage Report
- Figma MCP Integration
- Module Build Plan
- Tester
- Orchestration Protocol
- React + TypeScript + Vite
- Review Log
- Review Log
- CLAUDE.md
- docs/README.md
- 01-audit-figma.md
- 02-plan-modules.md
- 03-build-next-screen.md
- 04-build-next-module.md
- SystemHealthScreen.jsx

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 29 edges
2. `react` - 28 edges
3. `readJson()` - 24 edges
4. `useAppDispatch` - 17 edges
5. `useAppSelector` - 17 edges
6. `Figma Notes` - 14 edges
7. `Agent Operating Rules` - 13 edges
8. `4. Core Engineering Principles` - 11 edges
9. `Screen Matrix` - 11 edges
10. `Dependency Notes` - 11 edges

## Surprising Connections (you probably didn't know these)
- `resend()` --calls--> `resendVerificationEmail()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/features/auth/services/auth.api.js
- `LogoutScreen()` --calls--> `reset()`  [EXTRACTED]
  frontend/src/features/auth/pages/LogoutScreen.jsx → frontend/src/features/auth/hooks/useLogout.js
- `TwoFactorAuthenticationScreen()` --calls--> `setDigit()`  [EXTRACTED]
  frontend/src/features/auth/pages/TwoFactorAuthenticationScreen.jsx → frontend/src/features/auth/hooks/useTwoFactor.js
- `TwoFactorAuthenticationScreen()` --calls--> `handleKeyDown()`  [EXTRACTED]
  frontend/src/features/auth/pages/TwoFactorAuthenticationScreen.jsx → frontend/src/features/auth/hooks/useTwoFactor.js
- `resend()` --calls--> `resendTwoFactorCode()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/features/auth/services/auth.api.js

## Import Cycles
- None detected.

## Communities (44 total, 8 thin omitted)

### Community 0 - "router.jsx"
Cohesion: 0.06
Nodes (59): useAppDispatch, useAppSelector, maskEmail(), useEmailVerification(), resend(), useLogin(), submit(), validate() (+51 more)

### Community 1 - "agent.md"
Cohesion: 0.05
Nodes (41): 10.1 Registration Rule, 10.2 Token Design, 10.3 Authentication Request Flow, 10. Authentication Architecture, 11. Role-Based Access Control, 1. Purpose of This Document, 2. Project Overview, 3. Project Objectives (+33 more)

### Community 2 - "apiFetch"
Cohesion: 0.08
Nodes (32): env, resend(), resendTwoFactorCode(), run(), checkConnectivity(), loadPlatformConfig(), restoreSession(), usePipelineOverview() (+24 more)

### Community 3 - "AppShell.jsx"
Cohesion: 0.08
Nodes (21): AppShell(), DEFAULT_STATS, Footer(), NAV_ICONS, DEFAULT_BADGES, Sidebar(), SidebarToggleIcon(), NAV_TREE (+13 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (35): autoprefixer, dependencies, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit, @tanstack/react-query (+27 more)

### Community 5 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (17): useDataQuality(), ALERT_SEVERITY, chartPoints(), DataQualityScreen(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+9 more)

### Community 6 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.07
Nodes (19): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+11 more)

### Community 7 - "PipelineOverviewScreen.jsx"
Cohesion: 0.07
Nodes (13): ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON, KPI_TONE (+5 more)

### Community 8 - "Figma Notes"
Cohesion: 0.07
Nodes (27): Conflicts / ambiguities, Design system, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, MOD-001 AppShell visual-polish redesign (2026-08-22), MOD-001 shared shell build notes (2026-08-22), SCR-002 build notes (2026-08-22) (+19 more)

### Community 9 - "index.js"
Cohesion: 0.07
Nodes (20): App(), queryClient, router, authSlice, initialState, emailVerificationSlice, initialState, initialState (+12 more)

### Community 10 - "DashboardScreen.jsx"
Cohesion: 0.11
Nodes (13): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+5 more)

### Community 11 - "Header.jsx"
Cohesion: 0.13
Nodes (11): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, Header(), getFocusable(), handleKeyDown() (+3 more)

### Community 12 - "Dependency Notes"
Cohesion: 0.11
Nodes (17): Acceptance Criteria (per module), Build Principles, Dependency Notes, Dependency-tier rationale, Global Build Risks, MOD-001, MOD-002, MOD-003 (+9 more)

### Community 13 - "Agent Operating Rules"
Cohesion: 0.14
Nodes (13): 10. Security and secrets, 11. Completion language, 12. Caveman and Graphify, 1. Absolute Git and repository-operation prohibition, 2. No invented evidence, 3. Figma is the visual source of truth, 4. Existing project conventions win over invention, 5. Dynamic means real behavior (+5 more)

### Community 14 - "Module Builder"
Cohesion: 0.15
Nodes (12): Automatic quality gate, Backend, Documentation, Frontend integration, Frontend prerequisite gate, Hard stop, Integration, Mission (+4 more)

### Community 15 - "SourceHealthScreen.jsx"
Cohesion: 0.07
Nodes (17): useSourceHealth(), ALERT_SEVERITY, AllSourcesTable(), AUTH_STAT_TONE, AUTH_TIMELINE_STATUS, chartPoints(), ConnectionHealthCard(), KPI_ICON (+9 more)

### Community 16 - "Figma Project Audit"
Cohesion: 0.18
Nodes (10): Figma MCP traversal requirements, Figma Project Audit, Mission, Output behavior, Phase 1 — Connect to Figma through MCP, Phase 2 — Traverse systematically, Phase 3 — Compare with code, Phase 4 — Write docs (+2 more)

### Community 17 - "Module Planner"
Cohesion: 0.18
Nodes (10): Acceptance criteria, Backend mapping, Dependency ordering, Frontend mapping, Mission, Module Planner, Planning rules, Required reading (+2 more)

### Community 18 - "Review checklist"
Cohesion: 0.20
Nodes (9): Authorization, Business logic, Contracts, Data, Integration Reviewer, Output, Reliability, Review checklist (+1 more)

### Community 19 - "Frontend Screen Builder"
Cohesion: 0.20
Nodes (9): Automatic quality gate, Before coding, Documentation gate, Frontend Screen Builder, Hard stop, Implementation requirements, Mission, Required reading (+1 more)

### Community 20 - "Review checklist"
Cohesion: 0.22
Nodes (8): Accessibility, Figma fidelity, Output, Responsive behavior, Review checklist, Rules, UI Reviewer, UX

### Community 21 - "Figma Design System Notes"
Cohesion: 0.22
Nodes (8): Color system, Components, Figma Design System Notes, Icons/assets, Layout / responsiveness, Spacing, States/variants coverage, Typography

### Community 22 - "Claude Code Figma → Build Workflow"
Cohesion: 0.22
Nodes (8): Automatic quality agents, Claude Code Figma → Build Workflow, Figma MCP, Important, Included, Installation, Shared rules, Skills

### Community 23 - "Figma Notes"
Cohesion: 0.25
Nodes (7): Conflicts / ambiguities, Design system, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, Screen Matrix, Summary

### Community 24 - "Required trackers"
Cohesion: 0.25
Nodes (7): Continuation behavior, Figma tracker, Module tracker, Required trackers, Review tracker, Status transitions, Workflow State

### Community 25 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 26 - "Figma Coverage Report"
Cohesion: 0.29
Nodes (6): By module (candidate grouping), Dependencies / blockers for future skills, Design ambiguities (see screen-inventory.md → Conflicts / ambiguities for full detail), Figma Coverage Report, Final audit gate checklist, Headline result

### Community 27 - "Figma MCP Integration"
Cohesion: 0.29
Nodes (6): During implementation, Failure behavior, Figma MCP Integration, Figma-to-project mapping, MCP-first rules, Source of truth

### Community 28 - "Module Build Plan"
Cohesion: 0.29
Nodes (6): Build Principles, Dependency Notes, Global Build Risks, MOD-001, Module Build Plan, Module Matrix

### Community 29 - "Tester"
Cohesion: 0.33
Nodes (5): Failure handling, Output, Rules, Test layers, Tester

### Community 30 - "Orchestration Protocol"
Cohesion: 0.33
Nodes (5): Automatic agents, Invocation sequence, Orchestration Protocol, State consistency, User control

### Community 31 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 43 - "SystemHealthScreen.jsx"
Cohesion: 0.07
Nodes (14): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+6 more)

## Knowledge Gaps
- **311 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+306 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `router.jsx` to `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `index.js`, `SystemHealthScreen.jsx`, `Header.jsx`, `SourceHealthScreen.jsx`, `.oxlintrc.json`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `router.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `DashboardScreen.jsx`, `SystemHealthScreen.jsx`, `SourceHealthScreen.jsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell.jsx` to `router.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `DashboardScreen.jsx`, `SystemHealthScreen.jsx`, `SourceHealthScreen.jsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _311 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `router.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05854049719326383 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `apiFetch` be split into smaller, more focused modules?**
  _Cohesion score 0.07922705314009662 - nodes in this community are weakly interconnected._