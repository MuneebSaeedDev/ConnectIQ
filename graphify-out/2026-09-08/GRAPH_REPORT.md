# Graph Report - ConnectIQ  (2026-09-08)

## Corpus Check
- 239 files · ~462,257 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2837 nodes · 4539 edges · 155 communities (134 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04f83a59`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TeamManagementScreen.jsx
- agent.md
- ErrorAnalyticsScreen.jsx
- excelUpload.api.js
- dependencies
- DataQualityScreen.jsx
- ExecutiveDashboardScreen.jsx
- PipelineOverviewScreen.jsx
- Screen Matrix
- index.js
- useChangePassword.js
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
- client.js
- AccessControlSettingsScreen.jsx
- ProfileForm
- AppShell
- useAppSelector
- editRole.api.js
- PermissionMatrixScreen.jsx
- ApiConnectorSetupScreen.jsx
- EditRoleScreen.jsx
- SettingsForm
- useBootstrap.js
- userProfile.api.js
- UserActivityHistoryScreen.jsx
- UserPermissionManagementScreen.jsx
- DashboardScreen.jsx
- auth.api.js
- DestinationListScreen.jsx
- UserLoginHistoryScreen.jsx
- ConfirmDialog
- useResetPasswordConfirm.js
- permissionMatrix.api.js
- NumberField
- CreateRoleScreen.jsx
- accessControlSettings.api.js
- DatabaseConnectorSetupScreen.jsx
- teamManagement.api.js
- SourceConnectionSetupScreen.jsx
- ConnectionTestResultScreen.jsx
- CreateRoleScreen
- createRole.api.js
- FtpConnectionScreen.jsx
- ConfirmDialog
- csvUpload.api.js
- destinationConnectionTest.api.js
- createRole
- AddDataSourceScreen
- AddDataSourceScreen.jsx
- ConfirmDialog
- CsvUploadScreen
- DataSourceListScreen.jsx
- ExcelUploadScreen.jsx
- MatrixPanel
- ExcelUploadScreen
- getPermissionMatrix
- editOrganization.api.js
- readJson
- destinationConfiguration.api.js
- DetailPanel
- OrganizationListScreen.jsx
- setField
- isModified
- destinationHistory.api.js
- SftpConnectionScreen.jsx
- SourceHealthMonitoringScreen.jsx
- useAppDispatch
- setField
- EditForm
- AppShell.jsx
- ConfirmDialog
- router.jsx
- sftpConnection.api.js
- SftpConnectionScreen
- WebhookConfigurationScreen.jsx
- webhookConfiguration.api.js
- executionStats.api.js
- pipelineList.api.js
- EditForm
- ConfirmDialog
- WebhookConfigurationScreen
- importWorkbook
- ConfirmDialog
- ConfirmDialog
- isModified
- dashboard.api.js
- ConfirmDialog
- notifications.api.js
- apiFetch
- ConfirmDialog
- ConfirmDialog
- react
- dataQuality.api.js
- createDataSource
- destinationHealth.api.js
- errorAnalytics.api.js
- ConfirmDialog
- organizationActivity.api.js
- organizationList.api.js
- userList.api.js
- useLogin
- uploadCsvFile
- startCsvImport

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 151 edges
2. `readJson()` - 142 edges
3. `react` - 82 edges
4. `AppShell()` - 54 edges
5. `SettingsForm()` - 19 edges
6. `CreateRoleScreen()` - 18 edges
7. `EditForm()` - 18 edges
8. `useAppDispatch` - 17 edges
9. `useAppSelector` - 17 edges
10. `Screen Matrix` - 17 edges

## Surprising Connections (you probably didn't know these)
- `useEmailVerification()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useEmailVerification.js → frontend/src/app/hooks.js
- `useLogin()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useLogin.js → frontend/src/app/hooks.js
- `useResetPasswordConfirm()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useResetPasswordConfirm.js → frontend/src/app/hooks.js
- `useResetPasswordRequest()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useResetPasswordRequest.js → frontend/src/app/hooks.js
- `useTwoFactor()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/app/hooks.js

## Import Cycles
- None detected.

## Communities (155 total, 21 thin omitted)

### Community 0 - "TeamManagementScreen.jsx"
Cohesion: 0.07
Nodes (10): CODE_TONE, DOT_TONE, KPI_TONE, PIPELINE_TONE, STATUS_TONE, TeamDrawer(), getFocusable(), handleKeyDown() (+2 more)

### Community 1 - "agent.md"
Cohesion: 0.05
Nodes (41): 10.1 Registration Rule, 10.2 Token Design, 10.3 Authentication Request Flow, 10. Authentication Architecture, 11. Role-Based Access Control, 1. Purpose of This Document, 2. Project Overview, 3. Project Objectives (+33 more)

### Community 2 - "ErrorAnalyticsScreen.jsx"
Cohesion: 0.07
Nodes (17): useErrorAnalytics(), BAR_TONE, DELTA_TONE, ERROR_STATUS, ErrorAnalyticsScreen(), ErrorsTable(), INCIDENT_STATUS, KPI_ICON (+9 more)

### Community 3 - "excelUpload.api.js"
Cohesion: 0.07
Nodes (27): ACCEPTED_EXTENSIONS, COMPLIANCE_FRAMEWORKS, DEFAULT_TAGS, DESTINATION_OPTIONS, DETECTED_SCHEMA, DUPLICATE_STRATEGIES, ExcelUploadError, FORMULA_STRATEGIES (+19 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (37): autoprefixer, dependencies, lucide-react, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit (+29 more)

### Community 5 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (17): useDataQuality(), ALERT_SEVERITY, chartPoints(), DataQualityScreen(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+9 more)

### Community 6 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.07
Nodes (19): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+11 more)

### Community 7 - "PipelineOverviewScreen.jsx"
Cohesion: 0.07
Nodes (16): usePipelineOverview(), ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON (+8 more)

### Community 8 - "Screen Matrix"
Cohesion: 0.05
Nodes (39): Conflicts / ambiguities, Design system, Figma Notes, Figma Notes, Figma Screen Inventory, Missing or inaccessible Figma information, MOD-001 AppShell visual-polish redesign (2026-08-22), MOD-001 shared shell build notes (2026-08-22) (+31 more)

### Community 9 - "index.js"
Cohesion: 0.10
Nodes (13): authSlice, initialState, emailVerificationSlice, initialState, initialState, logoutSlice, initialState, passwordResetConfirmSlice (+5 more)

### Community 10 - "useChangePassword.js"
Cohesion: 0.22
Nodes (9): useChangePassword(), submit(), validate(), ChangePasswordScreen(), handleSubmit(), changePassword(), ChangePasswordError, changePasswordSlice (+1 more)

### Community 11 - "CreateOrganizationScreen.jsx"
Cohesion: 0.09
Nodes (17): buildPayload(), computeChecklist(), CreateOrganizationScreen(), handleConfirmCreate(), markTouched(), setField(), showError(), INITIAL_FORM (+9 more)

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
Nodes (14): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+6 more)

### Community 44 - "DestinationHealthScreen.jsx"
Cohesion: 0.07
Nodes (17): useDestinationHealth(), ALERT_SEVERITY, AllDestinationsTable(), chartPoints(), DeliverySuccessCard(), DestinationHealthScreen(), KPI_ICON, KPI_TONE (+9 more)

### Community 45 - "ExecutionStatisticsScreen.jsx"
Cohesion: 0.07
Nodes (16): useExecutionStatistics(), ENV_TONE, ExecutionsTable(), ExecutionStatisticsScreen(), INSIGHT_TONE, KPI_ICON, KPI_TONE, OUTCOME_TONE (+8 more)

### Community 46 - "UserDetailsScreen.jsx"
Cohesion: 0.08
Nodes (9): useUserDetails(), STATUS_TONE, TAG_TONE, UserDetailsScreen(), FEATURE_ACCESS_BY_LICENSE, ROLE_ACCESS_SCOPE, buildBaseline(), getUserDetails() (+1 more)

### Community 47 - "RealTimeMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (17): useRealTimeMonitoring(), ACTIVITY_BADGE, ALERT_TONE, CONN_TONE, EVENT_TONE, INFRA_TONE, KPI_ICON, KPI_TONE (+9 more)

### Community 48 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 49 - "RoleListScreen.jsx"
Cohesion: 0.06
Nodes (18): useRoleList(), KPI_TONE, PRIVILEGE_TONE, RoleDrawer(), getFocusable(), handleKeyDown(), RoleListScreen(), RolesTable() (+10 more)

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
Nodes (13): useOrganizationActivity(), ActivityTable(), CATEGORY_TONE, EventDrawer(), getFocusable(), handleKeyDown(), KPI_TONE, OrganizationActivityScreen() (+5 more)

### Community 55 - "DepartmentManagementScreen.jsx"
Cohesion: 0.08
Nodes (11): useDepartmentManagement(), DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE (+3 more)

### Community 56 - "AddUserScreen.jsx"
Cohesion: 0.08
Nodes (17): AddUserScreen(), handleConfirmInvite(), markTouched(), setField(), showError(), AuthenticationSecurity(), BasicInformation(), buildPayload() (+9 more)

### Community 57 - "editUser.api.js"
Cohesion: 0.22
Nodes (10): useEditableUser(), EditUserScreen(), ADD_USER_OPTIONS, InviteUserError, LICENSE_POOL, TAKEN_EMPLOYEE_IDS, buildBaseline(), EDIT_USER_OPTIONS (+2 more)

### Community 58 - "UserListScreen.jsx"
Cohesion: 0.07
Nodes (11): useUserList(), AVATAR_TONE, KPI_TONE, ROLE_TONE, STATUS_TONE, UserDrawer(), getFocusable(), handleKeyDown() (+3 more)

### Community 59 - "UserProfileScreen.jsx"
Cohesion: 0.05
Nodes (6): ACTIVITY_ICON_TONE, ACTIVITY_TAG_TONE, BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, SECURITY_TONE

### Community 60 - "EditForm"
Cohesion: 0.13
Nodes (18): AssignmentRulesCard(), computeChecklist(), displaySimple(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), markTouched() (+10 more)

### Community 61 - "client.js"
Cohesion: 0.09
Nodes (15): env, ExecutionStatisticsError, MOCK_EXECUTION_STATISTICS, ExecutiveDashboardError, MOCK_EXECUTIVE_DASHBOARD, MOCK_PIPELINE_OVERVIEW, PipelineOverviewError, MOCK_REAL_TIME_MONITORING (+7 more)

### Community 62 - "AccessControlSettingsScreen.jsx"
Cohesion: 0.06
Nodes (6): BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, FACTOR_KEYS, NUMBER_FIELDS, PROVIDER_KEYS

### Community 63 - "ProfileForm"
Cohesion: 0.19
Nodes (12): displayValue(), NotificationPreferences(), PersonalInformation(), PersonalPreferences(), ProfileForm(), handleSubmit(), isModified(), markTouched() (+4 more)

### Community 66 - "AppShell"
Cohesion: 0.11
Nodes (21): AddDestinationScreen(), DESTINATION_TYPES, INITIAL_FORM, createDestination(), DestinationError, ORG_ID, testConnection(), validateDestination() (+13 more)

### Community 67 - "useAppSelector"
Cohesion: 0.22
Nodes (10): useAppSelector, useTwoFactor(), handleKeyDown(), resend(), setDigit(), submit(), TwoFactorAuthenticationScreen(), handleSubmit() (+2 more)

### Community 68 - "editRole.api.js"
Cohesion: 0.21
Nodes (11): useEditableRole(), EditRoleScreen(), ADMIN_PRIVILEGES, buildBaseline(), DEFAULT_PERMISSION_STATE(), EDIT_ROLE_OPTIONS, EditRoleError, getEditableRole() (+3 more)

### Community 69 - "PermissionMatrixScreen.jsx"
Cohesion: 0.08
Nodes (3): CELL_STATE, KPI_TONE, PRIVILEGE_TONE

### Community 70 - "ApiConnectorSetupScreen.jsx"
Cohesion: 0.05
Nodes (42): ApiConnectorSetupScreen(), addPair(), handleConfirmCreate(), handleTestRequest(), invalidateTest(), markTouched(), removePair(), setField() (+34 more)

### Community 71 - "EditRoleScreen.jsx"
Cohesion: 0.06
Nodes (7): ADMIN_LABEL, BOOLEAN_KEYS, GROUP_LABEL, PERM_LABEL, RESOURCE_LABEL, SIMPLE_KEYS, SIMPLE_LABELS

### Community 72 - "SettingsForm"
Cohesion: 0.12
Nodes (15): AuthenticationPolicies(), computeChecklist(), computeImpact(), displayValue(), MfaPolicies(), NetworkRestrictions(), SettingsForm(), guardedNavigate() (+7 more)

### Community 73 - "useBootstrap.js"
Cohesion: 0.29
Nodes (8): useBootstrap(), run(), SplashScreen(), checkConnectivity(), loadPlatformConfig(), restoreSession(), bootstrapSlice, initialState

### Community 74 - "userProfile.api.js"
Cohesion: 0.36
Nodes (6): useMyProfile(), UserProfileScreen(), buildBaseline(), getMyProfile(), PROFILE_OPTIONS, UserProfileError

### Community 75 - "UserActivityHistoryScreen.jsx"
Cohesion: 0.06
Nodes (14): useUserActivityHistory(), ACCOUNT_STATUS_DOT, SEVERITY_TONE, STAT_TONE, STATUS_TONE, UserActivityHistoryScreen(), ACTIVITY_TYPES, buildBaseline() (+6 more)

### Community 76 - "UserPermissionManagementScreen.jsx"
Cohesion: 0.06
Nodes (11): useUserPermissions(), PermissionView(), handleSave(), STATE_TONE, UserPermissionManagementScreen(), ACCESS_LEVEL_OPTIONS, buildBaseline(), getUserPermissions() (+3 more)

### Community 77 - "DashboardScreen.jsx"
Cohesion: 0.11
Nodes (13): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+5 more)

### Community 78 - "auth.api.js"
Cohesion: 0.23
Nodes (11): maskEmail(), useEmailVerification(), resend(), EmailVerificationScreen(), confirmEmailVerification(), EmailVerificationError, login(), LoginError (+3 more)

### Community 79 - "DestinationListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDestinationList(), DestinationListScreen(), DestinationsTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 80 - "UserLoginHistoryScreen.jsx"
Cohesion: 0.05
Nodes (17): useUserLoginHistory(), ACCOUNT_STATUS_DOT, AUTH_TONE, MFA_TONE, RISK_TONE, STAT_TONE, UserLoginHistoryScreen(), AUTH_RESULTS (+9 more)

### Community 81 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 82 - "useResetPasswordConfirm.js"
Cohesion: 0.23
Nodes (11): useResetPasswordConfirm(), submit(), validate(), ForgetPasswordScreen(), handleSubmit(), confirmPasswordReset(), SettingsShellScaffold(), evaluatePasswordStrength() (+3 more)

### Community 83 - "permissionMatrix.api.js"
Cohesion: 0.15
Nodes (15): buildInsights(), buildMatrix(), buildMockMatrix(), LEVEL_OPTIONS, MATRIX_ROLES, MOCK_KPIS, PERMISSION_GROUPS, PERMISSION_STATES (+7 more)

### Community 84 - "NumberField"
Cohesion: 0.36
Nodes (9): NumberField(), PasswordPolicy(), passwordStrength(), SelectField(), isModified(), markTouched(), setField(), showError() (+1 more)

### Community 86 - "accessControlSettings.api.js"
Cohesion: 0.21
Nodes (10): useAccessControlSettings(), AccessControlSettingsScreen(), ACCESS_CONTROL_OPTIONS, AccessControlSettingsError, AUTH_PROVIDERS, buildBaseline(), COMPLEXITY_REQUIREMENTS, COUNTRY_OPTIONS (+2 more)

### Community 87 - "DatabaseConnectorSetupScreen.jsx"
Cohesion: 0.06
Nodes (30): Authentication(), buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), ConnectionConfiguration(), ConnectionOptions() (+22 more)

### Community 88 - "teamManagement.api.js"
Cohesion: 0.47
Nodes (4): useTeamManagement(), getTeamManagement(), MOCK_TEAM_MANAGEMENT, TeamManagementError

### Community 89 - "SourceConnectionSetupScreen.jsx"
Cohesion: 0.10
Nodes (10): SourceConnectionSetupScreen(), CONNECTORS_BY_ID, ADD_DATA_SOURCE_ROUTE, CONNECTION_METHOD_GROUPS, LIVE_METHOD_ROUTES, METHOD_ORDER, METHODS_BY_ID, NOTE: `defaultPort` on each method is informational only — SCR-047 (+2 more)

### Community 90 - "ConnectionTestResultScreen.jsx"
Cohesion: 0.05
Nodes (23): useConnectionTestResult(), ConnectionTestResultScreen(), handleCopyDiagnostics(), handleSave(), Diagnostics(), PerformanceMetrics(), Recommendations(), ResultBanner() (+15 more)

### Community 91 - "CreateRoleScreen"
Cohesion: 0.12
Nodes (15): AdministrativePrivileges(), computeChecklist(), countPermissions(), CreateRoleScreen(), markTouched(), removeResourceRow(), showError(), toggleAdmin() (+7 more)

### Community 92 - "createRole.api.js"
Cohesion: 0.12
Nodes (16): ACCESS_LEVEL_OPTIONS, ADMIN_PRIVILEGES, ASSIGNABLE_BY_OPTIONS, CreateRoleError, DEFAULT_RESOURCE_SCOPE, DESCRIPTION_MAX, INHERIT_ROLE_OPTIONS, INITIAL_FORM (+8 more)

### Community 93 - "FtpConnectionScreen.jsx"
Cohesion: 0.05
Nodes (36): Authentication(), buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), ConnectionConfiguration(), CRED_META (+28 more)

### Community 95 - "csvUpload.api.js"
Cohesion: 0.08
Nodes (25): COLUMN_TYPE_OPTIONS, COMPLIANCE_FRAMEWORKS, CsvUploadError, DEFAULT_DESTINATION, DEFAULT_GOVERNANCE, DEFAULT_PARSE_CONFIG, DESTINATION_OPTIONS, DETECTED_FILE_INFO (+17 more)

### Community 97 - "destinationConnectionTest.api.js"
Cohesion: 0.21
Nodes (11): useDestinationConnectionTest(), DestinationConnectionTestScreen(), buildDiagnosticsExportText(), DEFAULT_DESTINATION_METADATA, DEFAULT_TEST_CONFIG, DEFAULT_TEST_RESULT_SUCCESS, DestinationConnectionTestError, ORG_ID (+3 more)

### Community 98 - "createRole"
Cohesion: 0.29
Nodes (7): buildPayload(), handleConfirmCreate(), setField(), PermissionInheritance(), RoleAssignmentRules(), createRole(), slugifyKey()

### Community 99 - "AddDataSourceScreen"
Cohesion: 0.17
Nodes (19): AddDataSourceScreen(), markTouched(), setConnector(), setField(), showError(), toggleChannel(), toggleSchema(), toggleTable() (+11 more)

### Community 100 - "AddDataSourceScreen.jsx"
Cohesion: 0.07
Nodes (12): ALL_TABLE_IDS, CONNECTOR_ORDER, INITIAL_FORM, AUTH_FIELD_MAP, CONNECTOR_GROUPS, DATA_SOURCE_OPTIONS, DataSourceError, NOTIFICATION_CHANNELS (+4 more)

### Community 101 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 102 - "CsvUploadScreen"
Cohesion: 0.16
Nodes (10): computeChecklist(), CsvUploadScreen(), markTouched(), setField(), showError(), DestinationConfiguration(), Governance(), ImportConfiguration() (+2 more)

### Community 103 - "DataSourceListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDataSourceList(), DataSourceListScreen(), DataSourcesTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 105 - "MatrixPanel"
Cohesion: 0.33
Nodes (3): MatrixPanel(), buildCellDetail(), sourceFor()

### Community 106 - "ExcelUploadScreen"
Cohesion: 0.14
Nodes (14): computeChecklist(), DataQualityValidation(), DestinationConfiguration(), ExcelUploadScreen(), setField(), setParsing(), setToggle(), toggleFramework() (+6 more)

### Community 107 - "getPermissionMatrix"
Cohesion: 0.67
Nodes (3): usePermissionMatrix(), PermissionMatrixScreen(), getPermissionMatrix()

### Community 108 - "editOrganization.api.js"
Cohesion: 0.26
Nodes (9): useEditableOrganization(), EditOrganizationScreen(), CreateOrganizationError, ORG_FORM_OPTIONS, PLAN_CATALOG, SUBSCRIPTION_PLANS, buildBaseline(), EditOrganizationError (+1 more)

### Community 109 - "readJson"
Cohesion: 0.26
Nodes (12): useDestinationHealthMonitoring(), DestinationHealthMonitoringScreen(), acknowledgeDestinationAlert(), DEFAULT_DESTINATION_HEALTH_DATA, DestinationHealthError, getDestinationHealth(), HEALTH_STATUS_OPTIONS, ORG_ID (+4 more)

### Community 110 - "destinationConfiguration.api.js"
Cohesion: 0.28
Nodes (11): useDestinationConfiguration(), DestinationConfigurationScreen(), AUTH_METHODS, DEFAULT_DESTINATION_CONFIG, DestinationConfigError, ENVIRONMENTS, getDestinationConfiguration(), ORG_ID (+3 more)

### Community 111 - "DetailPanel"
Cohesion: 1.00
Nodes (3): DetailPanel(), getFocusable(), handleKeyDown()

### Community 112 - "OrganizationListScreen.jsx"
Cohesion: 0.09
Nodes (8): useOrganizationList(), KPI_TONE, ORG_TONE, OrganizationListScreen(), OrganizationsTable(), PLAN_TONE, STATUS_TONE, getOrganizationList()

### Community 113 - "setField"
Cohesion: 0.20
Nodes (17): AuthenticationSecuritySection(), addCidr(), removeCidr(), updateCidr(), EndpointConfigurationSection(), EventProcessingSection(), EventSubscriptionSection(), clearAll() (+9 more)

### Community 114 - "isModified"
Cohesion: 0.49
Nodes (10): AuthenticationSecurity(), isModified(), markTouched(), setField(), showError(), LicenseManagement(), NotificationPreferences(), OrganizationAssignment() (+2 more)

### Community 115 - "destinationHistory.api.js"
Cohesion: 0.24
Nodes (12): useDestinationHistory(), DestinationHistoryScreen(), DEFAULT_DESTINATION_HISTORY_DATA, DESTINATION_OPTIONS, DestinationHistoryError, ENVIRONMENTS, EVENT_CATEGORIES, exportHistoryCsv() (+4 more)

### Community 116 - "SftpConnectionScreen.jsx"
Cohesion: 0.06
Nodes (5): CRED_META, cronHint(), INITIAL_FORM, SchedulingAutomation(), TRANSFER_DIRECTIONS

### Community 117 - "SourceHealthMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (13): useSourceHealth(), HEALTH_FILTERS, HEALTH_TONE, KPI_TONE, POSTURE_TONE, SEVERITY_TONE, SourceHealthMonitoringScreen(), TIMELINE_TONE (+5 more)

### Community 118 - "useAppDispatch"
Cohesion: 0.33
Nodes (7): useAppDispatch, useLogout(), confirm(), reset(), LogoutScreen(), handleConfirm(), logout()

### Community 119 - "setField"
Cohesion: 0.30
Nodes (12): Authentication(), ConnectionConfiguration(), DirectoryDiscovery(), FileDiscoveryRules(), MonitoringAudit(), ServerConfiguration(), markTouched(), setAuthMethod() (+4 more)

### Community 120 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateUser()

### Community 121 - "AppShell.jsx"
Cohesion: 0.05
Nodes (31): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, DEFAULT_STATS, Footer(), Header() (+23 more)

### Community 122 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 123 - "router.jsx"
Cohesion: 0.29
Nodes (4): App(), queryClient, router, RoutePlaceholder()

### Community 124 - "sftpConnection.api.js"
Cohesion: 0.17
Nodes (12): NEGOTIATED_SUITE, ORG_ID, SAMPLE_MATCHES, SFTP_AUTH_FIELD_MAP, SFTP_AUTH_METHODS, SFTP_OPTIONS, SFTP_TRANSPORT, SFTP_TRIGGER_TYPES (+4 more)

### Community 125 - "SftpConnectionScreen"
Cohesion: 0.24
Nodes (9): buildPayload(), computeChecklist(), SftpConnectionScreen(), handleBrowse(), handleConfirmCreate(), handleTestConnection(), validate(), browseSftpDirectories() (+1 more)

### Community 126 - "WebhookConfigurationScreen.jsx"
Cohesion: 0.07
Nodes (4): AUTH_ORDER, INITIAL_FORM, RETRY_SCHEDULE, SAMPLE_HEADERS

### Community 127 - "webhookConfiguration.api.js"
Cohesion: 0.14
Nodes (14): AUTH_METHODS_BY_ID, DEFAULT_IP_ALLOWLIST, DEFAULT_JSON_SCHEMA, DEFAULT_SUBSCRIBED_EVENT_IDS, EVENT_CATEGORIES, EVENTS_BY_ID, generateEndpoint(), ORG_ID (+6 more)

### Community 128 - "executionStats.api.js"
Cohesion: 0.47
Nodes (4): useExecutionStats(), ExecutionStatsError, getExecutionStats(), MOCK_EXECUTION_STATS

### Community 129 - "pipelineList.api.js"
Cohesion: 0.06
Nodes (37): BulkActionBar(), ExpandedRowPreview(), STATUS_CONFIG, PipelineAnalyticsSection(), PipelineDetailDrawer(), STATUS_CONFIG, RecentExecutionsSection(), STATUS_CONFIG (+29 more)

### Community 130 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateOrganization()

### Community 132 - "WebhookConfigurationScreen"
Cohesion: 0.22
Nodes (10): WebhookConfigurationScreen(), handleConfirmCreate(), handleGenerateEndpoint(), handleTestWebhook(), setAuthMethod(), buildPayload(), computeChecklist(), createWebhookSource() (+2 more)

### Community 133 - "importWorkbook"
Cohesion: 0.67
Nodes (3): buildPayload(), handleConfirmImport(), importWorkbook()

### Community 134 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 136 - "isModified"
Cohesion: 0.49
Nodes (10): isModified(), markTouched(), setField(), showError(), OrganizationInformation(), PlatformConfiguration(), PrimaryAdministrator(), RegionalSettings() (+2 more)

### Community 138 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 139 - "notifications.api.js"
Cohesion: 0.39
Nodes (6): QUERY_KEY, useNotifications(), getNotifications(), markAllNotificationsRead(), MOCK_NOTIFICATIONS, NotificationsError

### Community 140 - "apiFetch"
Cohesion: 0.53
Nodes (8): usePipelineList(), bulkOperatePipelines(), deletePipeline(), duplicatePipeline(), getPipelines(), setPipelineStatus(), triggerPipelineRun(), apiFetch()

### Community 141 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 142 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 143 - "react"
Cohesion: 0.27
Nodes (9): useResetPasswordRequest(), submit(), validate(), ResetPasswordScreen(), handleSubmit(), PasswordResetError, requestPasswordReset(), inputBase (+1 more)

### Community 145 - "createDataSource"
Cohesion: 0.40
Nodes (5): handleConfirmCreate(), handleTestConnection(), buildPayload(), createDataSource(), testConnection()

### Community 148 - "ConfirmDialog"
Cohesion: 0.67
Nodes (4): ConfirmDialog(), getFocusable(), handleKeyDown(), formatRows()

### Community 154 - "useLogin"
Cohesion: 0.47
Nodes (5): useLogin(), submit(), validate(), LoginScreen(), handleSubmit()

### Community 156 - "uploadCsvFile"
Cohesion: 0.50
Nodes (4): handleFileSelected(), deriveTableName(), formatBytes(), uploadCsvFile()

### Community 158 - "startCsvImport"
Cohesion: 0.67
Nodes (3): buildPayload(), handleConfirmImport(), startCsvImport()

## Knowledge Gaps
- **583 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+578 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `TeamManagementScreen.jsx`, `pipelineList.api.js`, `ErrorAnalyticsScreen.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `useChangePassword.js`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `.oxlintrc.json`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `AccessControlSettingsScreen.jsx`, `AppShell`, `useAppSelector`, `PermissionMatrixScreen.jsx`, `ApiConnectorSetupScreen.jsx`, `EditRoleScreen.jsx`, `useBootstrap.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `auth.api.js`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `useResetPasswordConfirm.js`, `CreateRoleScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `ConnectionTestResultScreen.jsx`, `FtpConnectionScreen.jsx`, `CsvUploadScreen.jsx`, `destinationConnectionTest.api.js`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `ExcelUploadScreen.jsx`, `readJson`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `SftpConnectionScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `useAppDispatch`, `AppShell.jsx`, `router.jsx`, `WebhookConfigurationScreen.jsx`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell` to `TeamManagementScreen.jsx`, `pipelineList.api.js`, `ErrorAnalyticsScreen.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `AccessControlSettingsScreen.jsx`, `PermissionMatrixScreen.jsx`, `ApiConnectorSetupScreen.jsx`, `EditRoleScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DashboardScreen.jsx`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `CreateRoleScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `ConnectionTestResultScreen.jsx`, `FtpConnectionScreen.jsx`, `CsvUploadScreen.jsx`, `destinationConnectionTest.api.js`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `ExcelUploadScreen.jsx`, `readJson`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `SftpConnectionScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `AppShell.jsx`, `router.jsx`, `WebhookConfigurationScreen.jsx`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `ErrorAnalyticsScreen.jsx`, `excelUpload.api.js`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `useChangePassword.js`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `RoleListScreen.jsx`, `OrganizationDetailsScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `editUser.api.js`, `UserListScreen.jsx`, `EditForm`, `client.js`, `ProfileForm`, `AppShell`, `useAppSelector`, `editRole.api.js`, `ApiConnectorSetupScreen.jsx`, `SettingsForm`, `useBootstrap.js`, `userProfile.api.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DashboardScreen.jsx`, `auth.api.js`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `useResetPasswordConfirm.js`, `permissionMatrix.api.js`, `accessControlSettings.api.js`, `DatabaseConnectorSetupScreen.jsx`, `teamManagement.api.js`, `ConnectionTestResultScreen.jsx`, `createRole.api.js`, `FtpConnectionScreen.jsx`, `csvUpload.api.js`, `destinationConnectionTest.api.js`, `createRole`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `getPermissionMatrix`, `editOrganization.api.js`, `readJson`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `SourceHealthMonitoringScreen.jsx`, `useAppDispatch`, `EditForm`, `sftpConnection.api.js`, `SftpConnectionScreen`, `webhookConfiguration.api.js`, `executionStats.api.js`, `pipelineList.api.js`, `EditForm`, `WebhookConfigurationScreen`, `importWorkbook`, `dashboard.api.js`, `notifications.api.js`, `react`, `dataQuality.api.js`, `createDataSource`, `destinationHealth.api.js`, `errorAnalytics.api.js`, `organizationActivity.api.js`, `organizationList.api.js`, `userList.api.js`, `uploadCsvFile`, `startCsvImport`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `SettingsForm()` (e.g. with `isModified()` and `markTouched()`) actually correct?**
  _`SettingsForm()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _583 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TeamManagementScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._