# Graph Report - Intern Project  (2026-08-29)

## Corpus Check
- 189 files · ~301,107 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2038 nodes · 3091 edges · 108 communities (98 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `741bb645`
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
- react
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
- RoleListScreen.jsx
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
- EditForm
- useLogin
- AccessControlSettingsScreen.jsx
- ProfileForm
- useAppDispatch
- useTwoFactor
- editRole.api.js
- PermissionMatrixScreen.jsx
- client.js
- EditRoleScreen.jsx
- SettingsForm
- useBootstrap.js
- userProfile.api.js
- UserActivityHistoryScreen.jsx
- UserPermissionManagementScreen.jsx
- AppShell
- useEmailVerification.js
- useChangePassword.js
- UserLoginHistoryScreen.jsx
- ConfirmDialog
- notifications.api.js
- permissionMatrix.api.js
- NumberField
- CreateRoleScreen.jsx
- accessControlSettings.api.js
- useLogout
- Header.jsx
- organizationSettings.api.js
- errorAnalytics.api.js
- CreateRoleScreen
- createRole.api.js
- ConfirmDialog
- apiFetch
- createRole
- AddDataSourceScreen.jsx
- ConfirmDialog
- router.jsx
- DataSourceListScreen.jsx
- executionStatistics.api.js
- MatrixPanel
- getPermissionMatrix
- departmentManagement.api.js
- DetailPanel
- organizationList.api.js
- teamManagement.api.js
- organizationActivity.api.js

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 95 edges
2. `readJson()` - 90 edges
3. `react` - 54 edges
4. `AppShell()` - 36 edges
5. `SettingsForm()` - 19 edges
6. `CreateRoleScreen()` - 18 edges
7. `EditForm()` - 18 edges
8. `useAppDispatch` - 17 edges
9. `useAppSelector` - 17 edges
10. `Screen Matrix` - 17 edges

## Surprising Connections (you probably didn't know these)
- `resend()` --calls--> `resendVerificationEmail()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/features/auth/services/auth.api.js
- `resend()` --calls--> `resendTwoFactorCode()`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/features/auth/services/auth.api.js
- `handleConfirmSave()` --calls--> `updateOrganizationSettings()`  [EXTRACTED]
  frontend/src/features/organizations/pages/OrganizationSettingsScreen.jsx → frontend/src/features/organizations/services/organizationSettings.api.js
- `handleConfirmSave()` --calls--> `updateUser()`  [EXTRACTED]
  frontend/src/features/users/pages/EditUserScreen.jsx → frontend/src/features/users/services/editUser.api.js
- `useEmailVerification()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/app/hooks.js

## Import Cycles
- None detected.

## Communities (108 total, 10 thin omitted)

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
Cohesion: 0.07
Nodes (23): DEFAULT_STATS, Footer(), Header(), getFocusable(), handleKeyDown(), NAV_ICONS, DEFAULT_BADGES, Sidebar() (+15 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (35): autoprefixer, dependencies, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit, @tanstack/react-query (+27 more)

### Community 5 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (16): useDataQuality(), ALERT_SEVERITY, chartPoints(), DataQualityScreen(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+8 more)

### Community 6 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.07
Nodes (18): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+10 more)

### Community 7 - "PipelineOverviewScreen.jsx"
Cohesion: 0.07
Nodes (15): usePipelineOverview(), ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON (+7 more)

### Community 8 - "Screen Matrix"
Cohesion: 0.05
Nodes (37): Conflicts / ambiguities, Design system, Figma Notes, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, MOD-001 AppShell visual-polish redesign (2026-08-22), MOD-001 shared shell build notes (2026-08-22) (+29 more)

### Community 9 - "index.js"
Cohesion: 0.09
Nodes (15): authSlice, initialState, initialState, logoutSlice, initialState, passwordResetConfirmSlice, initialState, passwordResetSlice (+7 more)

### Community 10 - "react"
Cohesion: 0.30
Nodes (8): useResetPasswordConfirm(), submit(), validate(), ForgetPasswordScreen(), handleSubmit(), evaluatePasswordStrength(), inputBase, react

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
Cohesion: 0.07
Nodes (16): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+8 more)

### Community 44 - "DestinationHealthScreen.jsx"
Cohesion: 0.07
Nodes (16): useDestinationHealth(), ALERT_SEVERITY, AllDestinationsTable(), chartPoints(), DeliverySuccessCard(), DestinationHealthScreen(), KPI_ICON, KPI_TONE (+8 more)

### Community 45 - "ExecutionStatisticsScreen.jsx"
Cohesion: 0.07
Nodes (15): useExecutionStatistics(), ENV_TONE, ExecutionsTable(), ExecutionStatisticsScreen(), INSIGHT_TONE, KPI_ICON, KPI_TONE, OUTCOME_TONE (+7 more)

### Community 46 - "UserDetailsScreen.jsx"
Cohesion: 0.08
Nodes (7): useUserDetails(), STATUS_TONE, TAG_TONE, UserDetailsScreen(), buildBaseline(), getUserDetails(), UserDetailsError

### Community 47 - "RealTimeMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (16): useRealTimeMonitoring(), ACTIVITY_BADGE, ALERT_TONE, CONN_TONE, EVENT_TONE, INFRA_TONE, KPI_ICON, KPI_TONE (+8 more)

### Community 48 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 49 - "RoleListScreen.jsx"
Cohesion: 0.06
Nodes (18): useRoleList(), KPI_TONE, PRIVILEGE_TONE, RoleDrawer(), getFocusable(), handleKeyDown(), RoleListScreen(), RolesTable() (+10 more)

### Community 50 - "EditOrganizationScreen.jsx"
Cohesion: 0.06
Nodes (32): useEditableOrganization(), CHANGE_LABELS, computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), displayValue(), EDITABLE_KEYS (+24 more)

### Community 51 - "OrganizationDetailsScreen.jsx"
Cohesion: 0.07
Nodes (12): useOrganizationDetails(), DOT_TONE, HEADER_ACTIONS, KPI_ACCENT, ORG_TONE, OrganizationDetailsScreen(), RUN_TONE, STATUS_TONE (+4 more)

### Community 52 - "EditUserScreen.jsx"
Cohesion: 0.05
Nodes (23): AuthenticationSecurity(), BOOLEAN_KEYS, CHANGE_LABELS, CIDR_LIST_PATTERN, computeChecklist(), ConfirmDialog(), displayValue(), EDITABLE_KEYS (+15 more)

### Community 53 - "OrganizationSettingsScreen.jsx"
Cohesion: 0.05
Nodes (41): useOrganizationSettings(), BOOLEAN_KEYS, BrandingSettings(), CHANGE_LABELS, ComplianceAudit(), computeChecklist(), ConfirmDialog(), displayValue() (+33 more)

### Community 54 - "OrganizationActivityScreen.jsx"
Cohesion: 0.06
Nodes (11): ActivityTable(), CATEGORY_TONE, EventDrawer(), getFocusable(), handleKeyDown(), KPI_TONE, OrganizationActivityScreen(), RESULT_TONE (+3 more)

### Community 55 - "DepartmentManagementScreen.jsx"
Cohesion: 0.08
Nodes (9): DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE, PIPELINE_TONE (+1 more)

### Community 56 - "AddUserScreen.jsx"
Cohesion: 0.07
Nodes (20): AddUserScreen(), handleConfirmInvite(), markTouched(), setField(), showError(), AuthenticationSecurity(), BasicInformation(), buildPayload() (+12 more)

### Community 57 - "editUser.api.js"
Cohesion: 0.20
Nodes (12): useEditableUser(), EditUserScreen(), ADD_USER_OPTIONS, FEATURE_ACCESS_BY_LICENSE, inviteUser(), InviteUserError, LICENSE_POOL, ROLE_ACCESS_SCOPE (+4 more)

### Community 58 - "UserListScreen.jsx"
Cohesion: 0.07
Nodes (13): useUserList(), AVATAR_TONE, KPI_TONE, ROLE_TONE, STATUS_TONE, UserDrawer(), getFocusable(), handleKeyDown() (+5 more)

### Community 59 - "UserProfileScreen.jsx"
Cohesion: 0.05
Nodes (6): ACTIVITY_ICON_TONE, ACTIVITY_TAG_TONE, BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, SECURITY_TONE

### Community 60 - "EditForm"
Cohesion: 0.13
Nodes (18): AssignmentRulesCard(), computeChecklist(), displaySimple(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), markTouched() (+10 more)

### Community 61 - "useLogin"
Cohesion: 0.47
Nodes (5): useLogin(), submit(), validate(), LoginScreen(), handleSubmit()

### Community 62 - "AccessControlSettingsScreen.jsx"
Cohesion: 0.06
Nodes (6): BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, FACTOR_KEYS, NUMBER_FIELDS, PROVIDER_KEYS

### Community 63 - "ProfileForm"
Cohesion: 0.19
Nodes (12): displayValue(), NotificationPreferences(), PersonalInformation(), PersonalPreferences(), ProfileForm(), handleSubmit(), isModified(), markTouched() (+4 more)

### Community 66 - "useAppDispatch"
Cohesion: 0.22
Nodes (11): useAppDispatch, useAppSelector, useResetPasswordRequest(), submit(), validate(), ResetPasswordScreen(), handleSubmit(), LoginError (+3 more)

### Community 67 - "useTwoFactor"
Cohesion: 0.29
Nodes (7): useTwoFactor(), handleKeyDown(), resend(), setDigit(), submit(), TwoFactorAuthenticationScreen(), handleSubmit()

### Community 68 - "editRole.api.js"
Cohesion: 0.21
Nodes (11): useEditableRole(), EditRoleScreen(), ADMIN_PRIVILEGES, buildBaseline(), DEFAULT_PERMISSION_STATE(), EDIT_ROLE_OPTIONS, EditRoleError, getEditableRole() (+3 more)

### Community 69 - "PermissionMatrixScreen.jsx"
Cohesion: 0.08
Nodes (3): CELL_STATE, KPI_TONE, PRIVILEGE_TONE

### Community 70 - "client.js"
Cohesion: 0.22
Nodes (7): useExecutionStats(), ExecutionStatsError, getExecutionStats(), MOCK_EXECUTION_STATS, getSourceHealth(), MOCK_SOURCE_HEALTH, SourceHealthError

### Community 71 - "EditRoleScreen.jsx"
Cohesion: 0.06
Nodes (7): ADMIN_LABEL, BOOLEAN_KEYS, GROUP_LABEL, PERM_LABEL, RESOURCE_LABEL, SIMPLE_KEYS, SIMPLE_LABELS

### Community 72 - "SettingsForm"
Cohesion: 0.12
Nodes (15): AuthenticationPolicies(), computeChecklist(), computeImpact(), displayValue(), MfaPolicies(), NetworkRestrictions(), SettingsForm(), guardedNavigate() (+7 more)

### Community 73 - "useBootstrap.js"
Cohesion: 0.35
Nodes (7): env, useBootstrap(), run(), SplashScreen(), checkConnectivity(), loadPlatformConfig(), restoreSession()

### Community 74 - "userProfile.api.js"
Cohesion: 0.36
Nodes (6): useMyProfile(), UserProfileScreen(), buildBaseline(), getMyProfile(), PROFILE_OPTIONS, UserProfileError

### Community 75 - "UserActivityHistoryScreen.jsx"
Cohesion: 0.06
Nodes (14): useUserActivityHistory(), ACCOUNT_STATUS_DOT, SEVERITY_TONE, STAT_TONE, STATUS_TONE, UserActivityHistoryScreen(), ACTIVITY_TYPES, buildBaseline() (+6 more)

### Community 76 - "UserPermissionManagementScreen.jsx"
Cohesion: 0.06
Nodes (11): useUserPermissions(), PermissionView(), handleSave(), STATE_TONE, UserPermissionManagementScreen(), ACCESS_LEVEL_OPTIONS, buildBaseline(), getUserPermissions() (+3 more)

### Community 77 - "AppShell"
Cohesion: 0.05
Nodes (22): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+14 more)

### Community 78 - "useEmailVerification.js"
Cohesion: 0.25
Nodes (8): maskEmail(), useEmailVerification(), resend(), EmailVerificationScreen(), confirmEmailVerification(), EmailVerificationError, emailVerificationSlice, initialState

### Community 79 - "useChangePassword.js"
Cohesion: 0.20
Nodes (11): SettingsShellScaffold(), useChangePassword(), submit(), validate(), ChangePasswordScreen(), handleSubmit(), changePassword(), ChangePasswordError (+3 more)

### Community 80 - "UserLoginHistoryScreen.jsx"
Cohesion: 0.05
Nodes (17): useUserLoginHistory(), ACCOUNT_STATUS_DOT, AUTH_TONE, MFA_TONE, RISK_TONE, STAT_TONE, UserLoginHistoryScreen(), AUTH_RESULTS (+9 more)

### Community 81 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 82 - "notifications.api.js"
Cohesion: 0.39
Nodes (6): QUERY_KEY, useNotifications(), getNotifications(), markAllNotificationsRead(), MOCK_NOTIFICATIONS, NotificationsError

### Community 83 - "permissionMatrix.api.js"
Cohesion: 0.15
Nodes (15): buildInsights(), buildMatrix(), buildMockMatrix(), LEVEL_OPTIONS, MATRIX_ROLES, MOCK_KPIS, PERMISSION_GROUPS, PERMISSION_STATES (+7 more)

### Community 84 - "NumberField"
Cohesion: 0.36
Nodes (9): NumberField(), PasswordPolicy(), passwordStrength(), SelectField(), isModified(), markTouched(), setField(), showError() (+1 more)

### Community 86 - "accessControlSettings.api.js"
Cohesion: 0.21
Nodes (10): useAccessControlSettings(), AccessControlSettingsScreen(), ACCESS_CONTROL_OPTIONS, AccessControlSettingsError, AUTH_PROVIDERS, buildBaseline(), COMPLEXITY_REQUIREMENTS, COUNTRY_OPTIONS (+2 more)

### Community 87 - "useLogout"
Cohesion: 0.43
Nodes (5): useLogout(), confirm(), reset(), LogoutScreen(), handleConfirm()

### Community 88 - "Header.jsx"
Cohesion: 0.16
Nodes (8): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, UserProfileMenu(), getFocusable(), handleKeyDown()

### Community 89 - "organizationSettings.api.js"
Cohesion: 0.50
Nodes (4): buildBaseline(), getOrganizationSettings(), OrganizationSettingsError, updateOrganizationSettings()

### Community 90 - "errorAnalytics.api.js"
Cohesion: 0.50
Nodes (3): ErrorAnalyticsError, getErrorAnalytics(), MOCK_ERROR_ANALYTICS

### Community 91 - "CreateRoleScreen"
Cohesion: 0.12
Nodes (15): AdministrativePrivileges(), computeChecklist(), countPermissions(), CreateRoleScreen(), markTouched(), removeResourceRow(), showError(), toggleAdmin() (+7 more)

### Community 92 - "createRole.api.js"
Cohesion: 0.12
Nodes (16): ACCESS_LEVEL_OPTIONS, ADMIN_PRIVILEGES, ASSIGNABLE_BY_OPTIONS, CreateRoleError, DEFAULT_RESOURCE_SCOPE, DESCRIPTION_MAX, INHERIT_ROLE_OPTIONS, INITIAL_FORM (+8 more)

### Community 97 - "apiFetch"
Cohesion: 0.12
Nodes (27): confirmPasswordReset(), login(), logout(), requestPasswordReset(), resendTwoFactorCode(), resendVerificationEmail(), verifyTwoFactorCode(), DataQualityError (+19 more)

### Community 98 - "createRole"
Cohesion: 0.29
Nodes (7): buildPayload(), handleConfirmCreate(), setField(), PermissionInheritance(), RoleAssignmentRules(), createRole(), slugifyKey()

### Community 100 - "AddDataSourceScreen.jsx"
Cohesion: 0.05
Nodes (39): AddDataSourceScreen(), handleConfirmCreate(), handleTestConnection(), markTouched(), setConnector(), setField(), showError(), toggleChannel() (+31 more)

### Community 101 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 102 - "router.jsx"
Cohesion: 0.29
Nodes (4): App(), queryClient, router, RoutePlaceholder()

### Community 103 - "DataSourceListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDataSourceList(), DataSourceListScreen(), DataSourcesTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 104 - "executionStatistics.api.js"
Cohesion: 0.50
Nodes (3): ExecutionStatisticsError, getExecutionStatistics(), MOCK_EXECUTION_STATISTICS

### Community 105 - "MatrixPanel"
Cohesion: 0.33
Nodes (3): MatrixPanel(), buildCellDetail(), sourceFor()

### Community 107 - "getPermissionMatrix"
Cohesion: 0.67
Nodes (3): usePermissionMatrix(), PermissionMatrixScreen(), getPermissionMatrix()

### Community 108 - "departmentManagement.api.js"
Cohesion: 0.47
Nodes (4): useDepartmentManagement(), DepartmentManagementError, getDepartmentManagement(), MOCK_DEPARTMENT_MANAGEMENT

### Community 111 - "DetailPanel"
Cohesion: 1.00
Nodes (3): DetailPanel(), getFocusable(), handleKeyDown()

### Community 112 - "organizationList.api.js"
Cohesion: 0.47
Nodes (4): useOrganizationList(), getOrganizationList(), MOCK_ORGANIZATION_LIST, OrganizationListError

### Community 113 - "teamManagement.api.js"
Cohesion: 0.47
Nodes (4): useTeamManagement(), getTeamManagement(), MOCK_TEAM_MANAGEMENT, TeamManagementError

### Community 123 - "organizationActivity.api.js"
Cohesion: 0.47
Nodes (4): useOrganizationActivity(), getOrganizationActivity(), MOCK_ORGANIZATION_ACTIVITY, OrganizationActivityError

## Knowledge Gaps
- **508 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+503 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `.oxlintrc.json`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `AccessControlSettingsScreen.jsx`, `useAppDispatch`, `useTwoFactor`, `PermissionMatrixScreen.jsx`, `EditRoleScreen.jsx`, `useBootstrap.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `AppShell`, `useEmailVerification.js`, `useChangePassword.js`, `UserLoginHistoryScreen.jsx`, `CreateRoleScreen.jsx`, `useLogout`, `Header.jsx`, `AddDataSourceScreen.jsx`, `router.jsx`, `DataSourceListScreen.jsx`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `AppShell.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `AccessControlSettingsScreen.jsx`, `PermissionMatrixScreen.jsx`, `EditRoleScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `UserLoginHistoryScreen.jsx`, `CreateRoleScreen.jsx`, `AddDataSourceScreen.jsx`, `router.jsx`, `DataSourceListScreen.jsx`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `UserDetailsScreen.jsx`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `editUser.api.js`, `UserListScreen.jsx`, `EditForm`, `ProfileForm`, `editRole.api.js`, `client.js`, `SettingsForm`, `useBootstrap.js`, `userProfile.api.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `AppShell`, `useEmailVerification.js`, `useChangePassword.js`, `UserLoginHistoryScreen.jsx`, `notifications.api.js`, `permissionMatrix.api.js`, `accessControlSettings.api.js`, `organizationSettings.api.js`, `errorAnalytics.api.js`, `createRole.api.js`, `createRole`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `executionStatistics.api.js`, `getPermissionMatrix`, `departmentManagement.api.js`, `organizationList.api.js`, `teamManagement.api.js`, `organizationActivity.api.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `SettingsForm()` (e.g. with `isModified()` and `markTouched()`) actually correct?**
  _`SettingsForm()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _508 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TeamManagementScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._