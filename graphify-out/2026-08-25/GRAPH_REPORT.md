# Graph Report - Intern Project  (2026-08-25)

## Corpus Check
- 147 files · ~195,599 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1241 nodes · 1825 edges · 71 communities (63 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b1ef326`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TeamManagementScreen.jsx
- agent.md
- ErrorAnalyticsScreen.jsx
- AppShell.jsx
- package.json
- DataQualityScreen.jsx
- ExecutiveDashboardScreen.jsx
- PipelineOverviewScreen.jsx
- Screen Matrix
- index.js
- DashboardScreen.jsx
- CreateOrganizationScreen.jsx
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
- PerformanceAnalyticsScreen.jsx
- Figma Coverage Report
- Figma MCP Integration
- Module Build Plan
- Tester
- Orchestration Protocol
- React + TypeScript + Vite
- reviews/review-log.md
- Review Log
- CLAUDE.md
- docs/README.md
- 01-audit-figma.md
- 02-plan-modules.md
- 03-build-next-screen.md
- 04-build-next-module.md
- SystemHealthScreen.jsx
- DestinationHealthScreen.jsx
- ExecutionStatisticsScreen.jsx
- router.jsx
- RealTimeMonitoringScreen.jsx
- .oxlintrc.json
- OrganizationListScreen.jsx
- EditOrganizationScreen.jsx
- OrganizationDetailsScreen.jsx
- Header.jsx
- OrganizationSettingsScreen.jsx
- OrganizationActivityScreen.jsx
- DepartmentManagementScreen.jsx
- readJson
- client.js
- useEmailVerification.js
- apiFetch
- dataQuality.api.js
- executionStats.api.js
- departmentManagement.api.js
- organizationActivity.api.js
- teamManagement.api.js
- destinationHealth.api.js
- errorAnalytics.api.js
- executiveDashboard.api.js
- realTimeMonitoring.api.js

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 59 edges
2. `readJson()` - 54 edges
3. `react` - 40 edges
4. `AppShell()` - 21 edges
5. `useAppDispatch` - 17 edges
6. `useAppSelector` - 17 edges
7. `Screen Matrix` - 17 edges
8. `svgProps()` - 16 edges
9. `EditForm()` - 15 edges
10. `SettingsForm()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `resend()` --calls--> `resendTwoFactorCode()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/features/auth/services/auth.api.js
- `useDashboardSummary()` --indirect_call--> `getDashboardSummary()`  [INFERRED]
  frontend/src/features/dashboard/hooks/useDashboardSummary.js → frontend/src/features/dashboard/services/dashboard.api.js
- `useEmailVerification()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/app/hooks.js
- `useEmailVerification()` --calls--> `useAppSelector`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/app/hooks.js
- `resend()` --calls--> `resendVerificationEmail()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/features/auth/services/auth.api.js

## Import Cycles
- None detected.

## Communities (71 total, 8 thin omitted)

### Community 0 - "TeamManagementScreen.jsx"
Cohesion: 0.07
Nodes (10): CODE_TONE, DOT_TONE, KPI_TONE, PIPELINE_TONE, STATUS_TONE, TeamDrawer(), getFocusable(), handleKeyDown() (+2 more)

### Community 1 - "agent.md"
Cohesion: 0.05
Nodes (41): 10.1 Registration Rule, 10.2 Token Design, 10.3 Authentication Request Flow, 10. Authentication Architecture, 11. Role-Based Access Control, 1. Purpose of This Document, 2. Project Overview, 3. Project Objectives (+33 more)

### Community 2 - "ErrorAnalyticsScreen.jsx"
Cohesion: 0.07
Nodes (16): useErrorAnalytics(), BAR_TONE, DELTA_TONE, ERROR_STATUS, ErrorAnalyticsScreen(), ErrorsTable(), INCIDENT_STATUS, KPI_ICON (+8 more)

### Community 3 - "AppShell.jsx"
Cohesion: 0.08
Nodes (20): DEFAULT_STATS, Footer(), NAV_ICONS, DEFAULT_BADGES, Sidebar(), SidebarToggleIcon(), NAV_TREE, ALL_PERMISSIONS (+12 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (35): autoprefixer, dependencies, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit, @tanstack/react-query (+27 more)

### Community 5 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (14): ALERT_SEVERITY, chartPoints(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, IMPACT_BADGE, KPI_ICON (+6 more)

### Community 6 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.07
Nodes (18): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+10 more)

### Community 7 - "PipelineOverviewScreen.jsx"
Cohesion: 0.07
Nodes (15): usePipelineOverview(), ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON (+7 more)

### Community 8 - "Screen Matrix"
Cohesion: 0.06
Nodes (33): Conflicts / ambiguities, Design system, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, MOD-001 AppShell visual-polish redesign (2026-08-22), MOD-001 shared shell build notes (2026-08-22), SCR-002 build notes (2026-08-22) (+25 more)

### Community 9 - "index.js"
Cohesion: 0.07
Nodes (20): App(), queryClient, router, authSlice, initialState, emailVerificationSlice, initialState, initialState (+12 more)

### Community 10 - "DashboardScreen.jsx"
Cohesion: 0.11
Nodes (12): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+4 more)

### Community 11 - "CreateOrganizationScreen.jsx"
Cohesion: 0.09
Nodes (19): buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), CreateOrganizationScreen(), handleConfirmCreate(), markTouched() (+11 more)

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
Nodes (16): useSourceHealth(), ALERT_SEVERITY, AllSourcesTable(), AUTH_STAT_TONE, AUTH_TIMELINE_STATUS, chartPoints(), ConnectionHealthCard(), KPI_ICON (+8 more)

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

### Community 25 - "PerformanceAnalyticsScreen.jsx"
Cohesion: 0.06
Nodes (18): usePerformanceAnalytics(), BAR_TONE, ComponentsTable(), KPI_ICON, KPI_TONE, PerformanceAnalyticsScreen(), PRIORITY_BADGE, RANGES (+10 more)

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
Cohesion: 0.08
Nodes (13): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+5 more)

### Community 44 - "DestinationHealthScreen.jsx"
Cohesion: 0.07
Nodes (16): useDestinationHealth(), ALERT_SEVERITY, AllDestinationsTable(), chartPoints(), DeliverySuccessCard(), DestinationHealthScreen(), KPI_ICON, KPI_TONE (+8 more)

### Community 45 - "ExecutionStatisticsScreen.jsx"
Cohesion: 0.06
Nodes (18): useExecutionStatistics(), ENV_TONE, ExecutionsTable(), ExecutionStatisticsScreen(), INSIGHT_TONE, KPI_ICON, KPI_TONE, OUTCOME_TONE (+10 more)

### Community 46 - "router.jsx"
Cohesion: 0.06
Nodes (53): useAppDispatch, useAppSelector, useLogin(), submit(), validate(), useLogout(), confirm(), reset() (+45 more)

### Community 47 - "RealTimeMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (16): useRealTimeMonitoring(), ACTIVITY_BADGE, ALERT_TONE, CONN_TONE, EVENT_TONE, INFRA_TONE, KPI_ICON, KPI_TONE (+8 more)

### Community 48 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 49 - "OrganizationListScreen.jsx"
Cohesion: 0.08
Nodes (11): useOrganizationList(), KPI_TONE, ORG_TONE, OrganizationListScreen(), OrganizationsTable(), PLAN_TONE, STATUS_TONE, getOrganizationList() (+3 more)

### Community 50 - "EditOrganizationScreen.jsx"
Cohesion: 0.06
Nodes (32): useEditableOrganization(), CHANGE_LABELS, computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), displayValue(), EDITABLE_KEYS (+24 more)

### Community 51 - "OrganizationDetailsScreen.jsx"
Cohesion: 0.07
Nodes (12): useOrganizationDetails(), DOT_TONE, HEADER_ACTIONS, KPI_ACCENT, ORG_TONE, OrganizationDetailsScreen(), RUN_TONE, STATUS_TONE (+4 more)

### Community 52 - "Header.jsx"
Cohesion: 0.10
Nodes (17): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, QUERY_KEY, useNotifications(), getNotifications() (+9 more)

### Community 53 - "OrganizationSettingsScreen.jsx"
Cohesion: 0.05
Nodes (45): useOrganizationSettings(), BOOLEAN_KEYS, BrandingSettings(), CHANGE_LABELS, ComplianceAudit(), computeChecklist(), ConfirmDialog(), displayValue() (+37 more)

### Community 54 - "OrganizationActivityScreen.jsx"
Cohesion: 0.06
Nodes (11): ActivityTable(), CATEGORY_TONE, EventDrawer(), getFocusable(), handleKeyDown(), KPI_TONE, OrganizationActivityScreen(), RESULT_TONE (+3 more)

### Community 55 - "DepartmentManagementScreen.jsx"
Cohesion: 0.08
Nodes (9): DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE, PIPELINE_TONE (+1 more)

### Community 56 - "readJson"
Cohesion: 0.18
Nodes (11): DashboardError, getDashboardSummary(), MOCK_SUMMARY, getSourceHealth(), MOCK_SOURCE_HEALTH, SourceHealthError, getSystemHealth(), MOCK_SYSTEM_HEALTH (+3 more)

### Community 57 - "client.js"
Cohesion: 0.20
Nodes (6): env, getPipelineOverview(), MOCK_PIPELINE_OVERVIEW, PipelineOverviewError, changePassword(), ChangePasswordError

### Community 58 - "useEmailVerification.js"
Cohesion: 0.36
Nodes (7): maskEmail(), useEmailVerification(), resend(), EmailVerificationScreen(), confirmEmailVerification(), EmailVerificationError, resendVerificationEmail()

### Community 59 - "apiFetch"
Cohesion: 0.46
Nodes (7): confirmPasswordReset(), login(), logout(), requestPasswordReset(), resendTwoFactorCode(), verifyTwoFactorCode(), apiFetch()

### Community 60 - "dataQuality.api.js"
Cohesion: 0.47
Nodes (4): useDataQuality(), DataQualityError, getDataQuality(), MOCK_DATA_QUALITY

### Community 61 - "executionStats.api.js"
Cohesion: 0.47
Nodes (4): useExecutionStats(), ExecutionStatsError, getExecutionStats(), MOCK_EXECUTION_STATS

### Community 62 - "departmentManagement.api.js"
Cohesion: 0.47
Nodes (4): useDepartmentManagement(), DepartmentManagementError, getDepartmentManagement(), MOCK_DEPARTMENT_MANAGEMENT

### Community 63 - "organizationActivity.api.js"
Cohesion: 0.47
Nodes (4): useOrganizationActivity(), getOrganizationActivity(), MOCK_ORGANIZATION_ACTIVITY, OrganizationActivityError

### Community 66 - "teamManagement.api.js"
Cohesion: 0.47
Nodes (4): useTeamManagement(), getTeamManagement(), MOCK_TEAM_MANAGEMENT, TeamManagementError

### Community 67 - "destinationHealth.api.js"
Cohesion: 0.50
Nodes (3): DestinationHealthError, getDestinationHealth(), MOCK_DESTINATION_HEALTH

### Community 68 - "errorAnalytics.api.js"
Cohesion: 0.50
Nodes (3): ErrorAnalyticsError, getErrorAnalytics(), MOCK_ERROR_ANALYTICS

### Community 69 - "executiveDashboard.api.js"
Cohesion: 0.50
Nodes (3): ExecutiveDashboardError, getExecutiveDashboard(), MOCK_EXECUTIVE_DASHBOARD

### Community 70 - "realTimeMonitoring.api.js"
Cohesion: 0.50
Nodes (3): getRealTimeMonitoring(), MOCK_REAL_TIME_MONITORING, RealTimeMonitoringError

## Knowledge Gaps
- **425 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+420 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `router.jsx` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `index.js`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `.oxlintrc.json`, `OrganizationListScreen.jsx`, `EditOrganizationScreen.jsx`, `Header.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `useEmailVerification.js`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `OrganizationListScreen.jsx` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `DashboardScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `router.jsx`, `RealTimeMonitoringScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `PerformanceAnalyticsScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `router.jsx`, `OrganizationListScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `Header.jsx`, `OrganizationSettingsScreen.jsx`, `readJson`, `client.js`, `useEmailVerification.js`, `dataQuality.api.js`, `executionStats.api.js`, `departmentManagement.api.js`, `organizationActivity.api.js`, `teamManagement.api.js`, `destinationHealth.api.js`, `errorAnalytics.api.js`, `executiveDashboard.api.js`, `realTimeMonitoring.api.js`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TeamManagementScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `ErrorAnalyticsScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07311827956989247 - nodes in this community are weakly interconnected._