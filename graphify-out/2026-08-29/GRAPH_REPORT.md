# Graph Report - Intern Project  (2026-08-27)

## Corpus Check
- 170 files · ~244,975 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1621 nodes · 2421 edges · 79 communities (70 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `172efa17`
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
- OrganizationListScreen.jsx
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
- UserDetailsScreen.jsx
- RealTimeMonitoringScreen.jsx
- .oxlintrc.json
- useResetPasswordRequest
- EditOrganizationScreen.jsx
- OrganizationDetailsScreen.jsx
- EditUserScreen.jsx
- OrganizationSettingsScreen.jsx
- OrganizationActivityScreen.jsx
- DepartmentManagementScreen.jsx
- AddUserScreen.jsx
- editUser.api.js
- UserListScreen.jsx
- UserProfileScreen.jsx
- userDetails.api.js
- react
- ProfileForm
- useLogout
- useTwoFactor.js
- EditForm
- isModified
- auth.api.js
- useChangePassword.js
- apiFetch
- userProfile.api.js
- UserActivityHistoryScreen.jsx
- readJson
- AppShell
- router.jsx
- useResetPasswordConfirm.js
- UserLoginHistoryScreen.jsx

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 78 edges
2. `readJson()` - 73 edges
3. `react` - 47 edges
4. `AppShell()` - 29 edges
5. `useAppDispatch` - 17 edges
6. `useAppSelector` - 17 edges
7. `Screen Matrix` - 17 edges
8. `svgProps()` - 16 edges
9. `EditForm()` - 15 edges
10. `SettingsForm()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `useLogin()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useLogin.js → frontend/src/app/hooks.js
- `useLogout()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useLogout.js → frontend/src/app/hooks.js
- `useResetPasswordConfirm()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useResetPasswordConfirm.js → frontend/src/app/hooks.js
- `useResetPasswordRequest()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useResetPasswordRequest.js → frontend/src/app/hooks.js
- `useTwoFactor()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/app/hooks.js

## Import Cycles
- None detected.

## Communities (79 total, 9 thin omitted)

### Community 0 - "TeamManagementScreen.jsx"
Cohesion: 0.07
Nodes (14): useTeamManagement(), CODE_TONE, DOT_TONE, KPI_TONE, PIPELINE_TONE, STATUS_TONE, TeamDrawer(), getFocusable() (+6 more)

### Community 1 - "agent.md"
Cohesion: 0.05
Nodes (41): 10.1 Registration Rule, 10.2 Token Design, 10.3 Authentication Request Flow, 10. Authentication Architecture, 11. Role-Based Access Control, 1. Purpose of This Document, 2. Project Overview, 3. Project Objectives (+33 more)

### Community 2 - "ErrorAnalyticsScreen.jsx"
Cohesion: 0.07
Nodes (19): useErrorAnalytics(), BAR_TONE, DELTA_TONE, ERROR_STATUS, ErrorAnalyticsScreen(), ErrorsTable(), INCIDENT_STATUS, KPI_ICON (+11 more)

### Community 3 - "AppShell.jsx"
Cohesion: 0.08
Nodes (20): DEFAULT_STATS, Footer(), NAV_ICONS, DEFAULT_BADGES, Sidebar(), SidebarToggleIcon(), NAV_TREE, ALL_PERMISSIONS (+12 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (35): autoprefixer, dependencies, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit, @tanstack/react-query (+27 more)

### Community 5 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (19): useDataQuality(), ALERT_SEVERITY, chartPoints(), DataQualityScreen(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+11 more)

### Community 6 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.06
Nodes (21): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+13 more)

### Community 7 - "PipelineOverviewScreen.jsx"
Cohesion: 0.06
Nodes (18): usePipelineOverview(), ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON (+10 more)

### Community 8 - "Screen Matrix"
Cohesion: 0.05
Nodes (37): Conflicts / ambiguities, Design system, Figma Notes, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, MOD-001 AppShell visual-polish redesign (2026-08-22), MOD-001 shared shell build notes (2026-08-22) (+29 more)

### Community 9 - "index.js"
Cohesion: 0.09
Nodes (15): authSlice, initialState, emailVerificationSlice, initialState, initialState, logoutSlice, initialState, passwordResetConfirmSlice (+7 more)

### Community 10 - "OrganizationListScreen.jsx"
Cohesion: 0.08
Nodes (10): useOrganizationList(), KPI_TONE, ORG_TONE, OrganizationListScreen(), OrganizationsTable(), PLAN_TONE, STATUS_TONE, getOrganizationList() (+2 more)

### Community 11 - "CreateOrganizationScreen.jsx"
Cohesion: 0.08
Nodes (20): buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), CreateOrganizationScreen(), handleConfirmCreate(), markTouched() (+12 more)

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
Nodes (19): useSourceHealth(), ALERT_SEVERITY, AllSourcesTable(), AUTH_STAT_TONE, AUTH_TIMELINE_STATUS, chartPoints(), ConnectionHealthCard(), KPI_ICON (+11 more)

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
Cohesion: 0.07
Nodes (16): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+8 more)

### Community 44 - "DestinationHealthScreen.jsx"
Cohesion: 0.07
Nodes (19): useDestinationHealth(), ALERT_SEVERITY, AllDestinationsTable(), chartPoints(), DeliverySuccessCard(), DestinationHealthScreen(), KPI_ICON, KPI_TONE (+11 more)

### Community 45 - "ExecutionStatisticsScreen.jsx"
Cohesion: 0.06
Nodes (18): useExecutionStatistics(), ENV_TONE, ExecutionsTable(), ExecutionStatisticsScreen(), INSIGHT_TONE, KPI_ICON, KPI_TONE, OUTCOME_TONE (+10 more)

### Community 47 - "RealTimeMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (19): useRealTimeMonitoring(), ACTIVITY_BADGE, ALERT_TONE, CONN_TONE, EVENT_TONE, INFRA_TONE, KPI_ICON, KPI_TONE (+11 more)

### Community 48 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 49 - "useResetPasswordRequest"
Cohesion: 0.60
Nodes (5): useResetPasswordRequest(), submit(), validate(), ResetPasswordScreen(), handleSubmit()

### Community 50 - "EditOrganizationScreen.jsx"
Cohesion: 0.06
Nodes (32): useEditableOrganization(), CHANGE_LABELS, computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), displayValue(), EDITABLE_KEYS (+24 more)

### Community 51 - "OrganizationDetailsScreen.jsx"
Cohesion: 0.07
Nodes (12): useOrganizationDetails(), DOT_TONE, HEADER_ACTIONS, KPI_ACCENT, ORG_TONE, OrganizationDetailsScreen(), RUN_TONE, STATUS_TONE (+4 more)

### Community 52 - "EditUserScreen.jsx"
Cohesion: 0.06
Nodes (5): BOOLEAN_KEYS, CHANGE_LABELS, CIDR_LIST_PATTERN, ConfirmDialog(), EDITABLE_KEYS

### Community 53 - "OrganizationSettingsScreen.jsx"
Cohesion: 0.05
Nodes (45): useOrganizationSettings(), BOOLEAN_KEYS, BrandingSettings(), CHANGE_LABELS, ComplianceAudit(), computeChecklist(), ConfirmDialog(), displayValue() (+37 more)

### Community 54 - "OrganizationActivityScreen.jsx"
Cohesion: 0.06
Nodes (15): useOrganizationActivity(), ActivityTable(), CATEGORY_TONE, EventDrawer(), getFocusable(), handleKeyDown(), KPI_TONE, OrganizationActivityScreen() (+7 more)

### Community 55 - "DepartmentManagementScreen.jsx"
Cohesion: 0.07
Nodes (13): useDepartmentManagement(), DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE (+5 more)

### Community 56 - "AddUserScreen.jsx"
Cohesion: 0.07
Nodes (20): AddUserScreen(), handleConfirmInvite(), markTouched(), setField(), showError(), AuthenticationSecurity(), BasicInformation(), buildPayload() (+12 more)

### Community 57 - "editUser.api.js"
Cohesion: 0.20
Nodes (12): useEditableUser(), EditUserScreen(), ADD_USER_OPTIONS, FEATURE_ACCESS_BY_LICENSE, InviteUserError, LICENSE_POOL, ROLE_ACCESS_SCOPE, TAKEN_EMPLOYEE_IDS (+4 more)

### Community 58 - "UserListScreen.jsx"
Cohesion: 0.07
Nodes (13): useUserList(), AVATAR_TONE, KPI_TONE, ROLE_TONE, STATUS_TONE, UserDrawer(), getFocusable(), handleKeyDown() (+5 more)

### Community 59 - "UserProfileScreen.jsx"
Cohesion: 0.05
Nodes (6): ACTIVITY_ICON_TONE, ACTIVITY_TAG_TONE, BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, SECURITY_TONE

### Community 60 - "userDetails.api.js"
Cohesion: 0.43
Nodes (5): useUserDetails(), UserDetailsScreen(), buildBaseline(), getUserDetails(), UserDetailsError

### Community 61 - "react"
Cohesion: 0.24
Nodes (9): useLogin(), submit(), validate(), LoginScreen(), handleSubmit(), login(), LoginError, inputBase (+1 more)

### Community 63 - "ProfileForm"
Cohesion: 0.19
Nodes (12): displayValue(), NotificationPreferences(), PersonalInformation(), PersonalPreferences(), ProfileForm(), handleSubmit(), isModified(), markTouched() (+4 more)

### Community 66 - "useLogout"
Cohesion: 0.36
Nodes (6): useLogout(), confirm(), reset(), LogoutScreen(), handleConfirm(), logout()

### Community 67 - "useTwoFactor.js"
Cohesion: 0.24
Nodes (9): useTwoFactor(), handleKeyDown(), resend(), setDigit(), submit(), TwoFactorAuthenticationScreen(), handleSubmit(), resendTwoFactorCode() (+1 more)

### Community 68 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateUser()

### Community 69 - "isModified"
Cohesion: 0.49
Nodes (10): AuthenticationSecurity(), isModified(), markTouched(), setField(), showError(), LicenseManagement(), NotificationPreferences(), OrganizationAssignment() (+2 more)

### Community 70 - "auth.api.js"
Cohesion: 0.22
Nodes (13): useAppDispatch, useAppSelector, maskEmail(), useEmailVerification(), resend(), EmailVerificationScreen(), confirmEmailVerification(), EmailVerificationError (+5 more)

### Community 72 - "useChangePassword.js"
Cohesion: 0.22
Nodes (9): useChangePassword(), submit(), validate(), ChangePasswordScreen(), handleSubmit(), changePassword(), ChangePasswordError, changePasswordSlice (+1 more)

### Community 73 - "apiFetch"
Cohesion: 0.08
Nodes (27): env, run(), checkConnectivity(), loadPlatformConfig(), restoreSession(), useExecutionStats(), ExecutionStatsError, getExecutionStats() (+19 more)

### Community 74 - "userProfile.api.js"
Cohesion: 0.36
Nodes (6): useMyProfile(), UserProfileScreen(), buildBaseline(), getMyProfile(), PROFILE_OPTIONS, UserProfileError

### Community 75 - "UserActivityHistoryScreen.jsx"
Cohesion: 0.06
Nodes (14): useUserActivityHistory(), ACCOUNT_STATUS_DOT, SEVERITY_TONE, STAT_TONE, STATUS_TONE, UserActivityHistoryScreen(), ACTIVITY_TYPES, buildBaseline() (+6 more)

### Community 76 - "readJson"
Cohesion: 0.06
Nodes (12): useUserPermissions(), PERM_STATE, PermissionView(), save(), UserPermissionManagementScreen(), ACCESS_LEVEL_OPTIONS, buildBaseline(), getUserPermissions() (+4 more)

### Community 77 - "AppShell"
Cohesion: 0.09
Nodes (16): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+8 more)

### Community 78 - "router.jsx"
Cohesion: 0.23
Nodes (6): App(), queryClient, router, useBootstrap(), SplashScreen(), RoutePlaceholder()

### Community 79 - "useResetPasswordConfirm.js"
Cohesion: 0.23
Nodes (11): useResetPasswordConfirm(), submit(), validate(), ForgetPasswordScreen(), handleSubmit(), confirmPasswordReset(), SettingsShellScaffold(), evaluatePasswordStrength() (+3 more)

### Community 80 - "UserLoginHistoryScreen.jsx"
Cohesion: 0.05
Nodes (17): useUserLoginHistory(), ACCOUNT_STATUS_DOT, AUTH_TONE, MFA_TONE, RISK_TONE, STAT_TONE, UserLoginHistoryScreen(), AUTH_RESULTS (+9 more)

## Knowledge Gaps
- **468 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+463 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `OrganizationListScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `.oxlintrc.json`, `EditOrganizationScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `useLogout`, `useTwoFactor.js`, `auth.api.js`, `useChangePassword.js`, `apiFetch`, `UserActivityHistoryScreen.jsx`, `readJson`, `router.jsx`, `useResetPasswordConfirm.js`, `UserLoginHistoryScreen.jsx`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `OrganizationListScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `UserActivityHistoryScreen.jsx`, `readJson`, `router.jsx`, `UserLoginHistoryScreen.jsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `OrganizationListScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `editUser.api.js`, `UserListScreen.jsx`, `userDetails.api.js`, `react`, `ProfileForm`, `useLogout`, `useTwoFactor.js`, `EditForm`, `auth.api.js`, `useChangePassword.js`, `userProfile.api.js`, `UserActivityHistoryScreen.jsx`, `readJson`, `AppShell`, `useResetPasswordConfirm.js`, `UserLoginHistoryScreen.jsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _468 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TeamManagementScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0677361853832442 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `ErrorAnalyticsScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06722689075630252 - nodes in this community are weakly interconnected._