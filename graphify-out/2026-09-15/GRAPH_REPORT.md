# Graph Report - ConnectIQ  (2026-09-15)

## Corpus Check
- 515 files · ~697,472 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4069 nodes · 6520 edges · 235 communities (202 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1b836946`
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
- visualPipelineBuilder.api.js
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
- 2026-09-13 — MOD-004 Organization Management (Backend + Conversion to JS)
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
- TransformationNodeConfigScreen.jsx
- UserListScreen.jsx
- UserProfileScreen.jsx
- EditForm
- DestinationNodeConfigScreen.jsx
- AccessControlSettingsScreen.jsx
- ProfileForm
- dependencies
- useTwoFactor
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
- router.jsx
- DestinationListScreen.jsx
- UserLoginHistoryScreen.jsx
- ConfirmDialog
- permissions.js
- permissionMatrix.api.js
- NumberField
- CreateRoleScreen.jsx
- accessControlSettings.api.js
- DatabaseConnectorSetupScreen.jsx
- SourceNodeConfigScreen.jsx
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
- destinationHealthMonitoring.api.js
- destinationConfiguration.api.js
- DetailPanel
- OrganizationListScreen.jsx
- setField
- AppShell.jsx
- destinationHistory.api.js
- SftpConnectionScreen.jsx
- SourceHealthMonitoringScreen.jsx
- useLogout
- setField
- CreatePipelineScreen.jsx
- Header.jsx
- ConfirmDialog
- PipelineController
- sftpConnection.api.js
- SftpConnectionScreen
- WebhookConfigurationScreen.jsx
- webhookConfiguration.api.js
- executionStats.api.js
- pipelineList.api.js
- EditForm
- ConfirmDialog
- WebhookConfigurationScreen
- UserController
- Sidebar.jsx
- ConfirmDialog
- isModified
- DestinationController
- ConfirmDialog
- readJson
- design_context.md
- ConfirmDialog
- ConfirmDialog
- NodeLibraryScreen.jsx
- react
- createDataSource
- MergeNodeConfigScreen.jsx
- MappingNodeConfigScreen.jsx
- ConfirmDialog
- transformationNodeConfig.api.js
- validationNodeConfig.api.js
- FilterNodeConfigScreen.jsx
- screen_lists.md
- dataSource.controller.js
- apiFetch
- notification.controller.js
- uploadCsvFile
- AuthController
- startCsvImport
- rbac.controller.js
- parse_meta.js
- auth.api.js
- useResetPasswordConfirm.js
- detailed_analysis.js
- extract_all.js
- parse_details.js
- .tmp/parse_metadata.js
- parse_metadata.js
- parse_texts.js
- extract_cards.js
- extract_scr069.js
- extract_sections.js
- extract_texts_correct.js
- find_sections.js
- parse_tags.js
- make_outline.js
- parse_scr069.js
- parse_all_sections.js
- parse_all_sections2.js
- parse_full_breakdown.js
- parse_sections.js
- print_all.js
- hierarchy.js
- print_texts.js
- app.js
- useChangePassword.js
- auth.middleware.js
- department.service.js
- server.js
- editUser.api.js
- team.service.js
- organization.controller.js
- OrganizationService
- Module Summary: MOD-004 Organization Management
- AuthService
- Module Summary: MOD-005 User Management & Profile
- OrganizationController
- errors.js
- Module Summary: MOD-006 Data Sources & Connectors
- MOD-001: Shell & Bootstrap
- MOD-002: Authentication & Session
- MOD-003: RBAC & Permissions
- Module Summary: MOD-007 Destinations
- Module Summary: MOD-008 Pipeline Builder & Execution
- Module Summary: MOD-010 Notifications
- auth.service.js
- test_auth_api.sh
- RbacController
- EditForm
- convert-to-js.js
- notification.model.js
- loginHistory.model.js
- userActivity.model.js
- auth.controller.js
- dataSource.service.js
- PipelineSettingsScreen.jsx
- nodeLibrary.api.js
- 41. Role-Based Experience
- VisualPipelineBuilderScreen.jsx
- jwt.js
- pipelineHistory.api.js
- addDestination.api.js
- isModified
- PipelineTemplateLibraryScreen.jsx
- token.model.js
- 3. Visual Hierarchy
- 7. Typography Rules
- 35. Buttons
- 4. Color System
- importWorkbook
- ConfirmDialog
- 12. Application Shell
- Enterprise ETL Platform — Design System
- 20. Pipeline Builder Design
- 6. Typography

## God Nodes (most connected - your core abstractions)
1. `react` - 258 edges
2. `apiFetch()` - 192 edges
3. `readJson()` - 183 edges
4. `AppShell()` - 66 edges
5. `SettingsForm()` - 19 edges
6. `CreateRoleScreen()` - 18 edges
7. `EditForm()` - 18 edges
8. `useAppDispatch` - 17 edges
9. `useAppSelector` - 17 edges
10. `Screen Matrix` - 17 edges

## Surprising Connections (you probably didn't know these)
- `useLogin()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useLogin.js → frontend/src/app/hooks.js
- `useLogout()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useLogout.js → frontend/src/app/hooks.js
- `useResetPasswordConfirm()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useResetPasswordConfirm.js → frontend/src/app/hooks.js
- `useTwoFactor()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/auth/hooks/useTwoFactor.js → frontend/src/app/hooks.js
- `useBootstrap()` --calls--> `useAppDispatch`  [EXTRACTED]
  frontend/src/features/bootstrap/hooks/useBootstrap.js → frontend/src/app/hooks.js

## Import Cycles
- None detected.

## Communities (235 total, 33 thin omitted)

### Community 0 - "TeamManagementScreen.jsx"
Cohesion: 0.07
Nodes (12): useTeamManagement(), CODE_TONE, DOT_TONE, KPI_TONE, PIPELINE_TONE, STATUS_TONE, TeamDrawer(), getFocusable() (+4 more)

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
Cohesion: 0.09
Nodes (16): App(), queryClient, router, authSlice, initialState, emailVerificationSlice, initialState, initialState (+8 more)

### Community 10 - "visualPipelineBuilder.api.js"
Cohesion: 0.19
Nodes (16): ICON_MAP, NodeLibraryPanel(), useVisualPipelineBuilder(), executePipelineRun(), fetchPipelineBuilderGraph(), INITIAL_CONSOLE_LOGS, INITIAL_PIPELINE_EDGES, INITIAL_PIPELINE_NODES (+8 more)

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
Cohesion: 0.07
Nodes (16): usePerformanceAnalytics(), BAR_TONE, ComponentsTable(), KPI_ICON, KPI_TONE, PerformanceAnalyticsScreen(), PRIORITY_BADGE, RANGES (+8 more)

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

### Community 32 - "2026-09-13 — MOD-004 Organization Management (Backend + Conversion to JS)"
Cohesion: 0.50
Nodes (3): 2026-09-13 — MOD-004 Organization Management (Backend + Conversion to JS), Review Log, Review log entry

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
Cohesion: 0.07
Nodes (13): useDepartmentManagement(), DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE (+5 more)

### Community 56 - "AddUserScreen.jsx"
Cohesion: 0.08
Nodes (17): AddUserScreen(), handleConfirmInvite(), markTouched(), setField(), showError(), AuthenticationSecurity(), BasicInformation(), buildPayload() (+9 more)

### Community 57 - "TransformationNodeConfigScreen.jsx"
Cohesion: 0.06
Nodes (26): AddRuleModal(), AdvancedConfigSection(), BottomTelemetryPanel(), DataCleaningSection(), DiscardChangesModal(), DuplicateNodeModal(), DuplicateRemovalSection(), EXPRESSION_SNIPPET_CATEGORIES (+18 more)

### Community 58 - "UserListScreen.jsx"
Cohesion: 0.07
Nodes (11): useUserList(), AVATAR_TONE, KPI_TONE, ROLE_TONE, STATUS_TONE, UserDrawer(), getFocusable(), handleKeyDown() (+3 more)

### Community 59 - "UserProfileScreen.jsx"
Cohesion: 0.05
Nodes (6): ACTIVITY_ICON_TONE, ACTIVITY_TAG_TONE, BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, SECURITY_TONE

### Community 60 - "EditForm"
Cohesion: 0.13
Nodes (18): AssignmentRulesCard(), computeChecklist(), displaySimple(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), markTouched() (+10 more)

### Community 61 - "DestinationNodeConfigScreen.jsx"
Cohesion: 0.10
Nodes (15): DestinationNodeHeader(), DryRunSection(), ErrorDeadLetterPerformanceSection(), GeneralInfoSection(), SchemaMappingSection(), SummaryRail(), TargetConnectorSection(), TargetSchemaWriteStrategySection() (+7 more)

### Community 62 - "AccessControlSettingsScreen.jsx"
Cohesion: 0.06
Nodes (6): BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, FACTOR_KEYS, NUMBER_FIELDS, PROVIDER_KEYS

### Community 63 - "ProfileForm"
Cohesion: 0.19
Nodes (12): displayValue(), NotificationPreferences(), PersonalInformation(), PersonalPreferences(), ProfileForm(), handleSubmit(), isModified(), markTouched() (+4 more)

### Community 66 - "dependencies"
Cohesion: 0.06
Nodes (35): author, dependencies, bcryptjs, bullmq, cookie-parser, cors, dotenv, express (+27 more)

### Community 67 - "useTwoFactor"
Cohesion: 0.23
Nodes (9): useTwoFactor(), handleKeyDown(), resend(), setDigit(), submit(), TwoFactorAuthenticationScreen(), handleSubmit(), resendTwoFactorCode() (+1 more)

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
Cohesion: 0.10
Nodes (15): useDashboardSummary(), DashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON (+7 more)

### Community 78 - "router.jsx"
Cohesion: 0.14
Nodes (13): useLogin(), submit(), validate(), EmailVerificationScreen(), LoginScreen(), handleSubmit(), ResetPasswordScreen(), handleSubmit() (+5 more)

### Community 79 - "DestinationListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDestinationList(), DestinationListScreen(), DestinationsTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 80 - "UserLoginHistoryScreen.jsx"
Cohesion: 0.05
Nodes (17): useUserLoginHistory(), ACCOUNT_STATUS_DOT, AUTH_TONE, MFA_TONE, RISK_TONE, STAT_TONE, UserLoginHistoryScreen(), AUTH_RESULTS (+9 more)

### Community 81 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 82 - "permissions.js"
Cohesion: 0.18
Nodes (12): NAV_TREE, ALL_PERMISSIONS, DATA_ETL_ENGINEER_PERMISSIONS, hasAnyPermission(), hasPermission(), PERMISSIONS, ROLE_PERMISSIONS, ROLES (+4 more)

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

### Community 88 - "SourceNodeConfigScreen.jsx"
Cohesion: 0.06
Nodes (46): AdvancedSettingsSection(), AuthenticationSection(), DataExtractionSection(), DataSamplingPreviewSection(), DiscardChangesModal(), DuplicateNodeModal(), GeneralInfoSection(), LiveValidationCard() (+38 more)

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

### Community 109 - "destinationHealthMonitoring.api.js"
Cohesion: 0.24
Nodes (11): useDestinationHealthMonitoring(), DestinationHealthMonitoringScreen(), acknowledgeDestinationAlert(), DEFAULT_DESTINATION_HEALTH_DATA, DestinationHealthError, getDestinationHealth(), HEALTH_STATUS_OPTIONS, ORG_ID (+3 more)

### Community 110 - "destinationConfiguration.api.js"
Cohesion: 0.28
Nodes (11): useDestinationConfiguration(), DestinationConfigurationScreen(), AUTH_METHODS, DEFAULT_DESTINATION_CONFIG, DestinationConfigError, ENVIRONMENTS, getDestinationConfiguration(), ORG_ID (+3 more)

### Community 111 - "DetailPanel"
Cohesion: 1.00
Nodes (3): DetailPanel(), getFocusable(), handleKeyDown()

### Community 112 - "OrganizationListScreen.jsx"
Cohesion: 0.08
Nodes (10): useOrganizationList(), KPI_TONE, ORG_TONE, OrganizationListScreen(), OrganizationsTable(), PLAN_TONE, STATUS_TONE, getOrganizationList() (+2 more)

### Community 113 - "setField"
Cohesion: 0.20
Nodes (17): AuthenticationSecuritySection(), addCidr(), removeCidr(), updateCidr(), EndpointConfigurationSection(), EventProcessingSection(), EventSubscriptionSection(), clearAll() (+9 more)

### Community 114 - "AppShell.jsx"
Cohesion: 0.13
Nodes (7): DESTINATION_TYPES, INITIAL_FORM, DestinationError, AppShell(), DEFAULT_STATS, Footer(), ROLE_LABELS

### Community 115 - "destinationHistory.api.js"
Cohesion: 0.24
Nodes (12): useDestinationHistory(), DestinationHistoryScreen(), DEFAULT_DESTINATION_HISTORY_DATA, DESTINATION_OPTIONS, DestinationHistoryError, ENVIRONMENTS, EVENT_CATEGORIES, exportHistoryCsv() (+4 more)

### Community 116 - "SftpConnectionScreen.jsx"
Cohesion: 0.06
Nodes (5): CRED_META, cronHint(), INITIAL_FORM, SchedulingAutomation(), TRANSFER_DIRECTIONS

### Community 117 - "SourceHealthMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (13): useSourceHealth(), HEALTH_FILTERS, HEALTH_TONE, KPI_TONE, POSTURE_TONE, SEVERITY_TONE, SourceHealthMonitoringScreen(), TIMELINE_TONE (+5 more)

### Community 118 - "useLogout"
Cohesion: 0.36
Nodes (6): useLogout(), confirm(), reset(), LogoutScreen(), handleConfirm(), logout()

### Community 119 - "setField"
Cohesion: 0.30
Nodes (12): Authentication(), ConnectionConfiguration(), DirectoryDiscovery(), FileDiscoveryRules(), MonitoringAudit(), ServerConfiguration(), markTouched(), setAuthMethod() (+4 more)

### Community 120 - "CreatePipelineScreen.jsx"
Cohesion: 0.29
Nodes (11): CreatePipelineScreen(), BUSINESS_DOMAINS, CATEGORIES, createPipeline(), ENVIRONMENTS, INITIAL_PIPELINE_FORM, savePipelineDraft(), TEAMS (+3 more)

### Community 121 - "Header.jsx"
Cohesion: 0.10
Nodes (17): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, QUERY_KEY, useNotifications(), getNotifications() (+9 more)

### Community 122 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 123 - "PipelineController"
Cohesion: 0.04
Nodes (15): pipeline_service_1, PipelineController, response_1, ExecutionLogSchema, mongoose_1, PipelineExecutionSchema, PipelineNodeSchema, PipelineSchema (+7 more)

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
Nodes (44): BulkActionBar(), ExpandedRowPreview(), STATUS_CONFIG, PipelineAnalyticsSection(), PipelineDetailDrawer(), STATUS_CONFIG, RecentExecutionsSection(), STATUS_CONFIG (+36 more)

### Community 130 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateOrganization()

### Community 132 - "WebhookConfigurationScreen"
Cohesion: 0.22
Nodes (10): WebhookConfigurationScreen(), handleConfirmCreate(), handleGenerateEndpoint(), handleTestWebhook(), setAuthMethod(), buildPayload(), computeChecklist(), createWebhookSource() (+2 more)

### Community 133 - "UserController"
Cohesion: 0.06
Nodes (7): response_1, user_service_1, UserController, express_1, router, user_controller_1, UserService

### Community 134 - "Sidebar.jsx"
Cohesion: 0.19
Nodes (5): NAV_ICONS, DEFAULT_BADGES, Sidebar(), SidebarToggleIcon(), useVisibleNav()

### Community 136 - "isModified"
Cohesion: 0.49
Nodes (10): isModified(), markTouched(), setField(), showError(), OrganizationInformation(), PlatformConfiguration(), PrimaryAdministrator(), RegionalSettings() (+2 more)

### Community 137 - "DestinationController"
Cohesion: 0.06
Nodes (11): destination_service_1, DestinationController, response_1, DestinationSchema, mongoose_1, destination_controller_1, express_1, router (+3 more)

### Community 138 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 139 - "readJson"
Cohesion: 0.06
Nodes (37): env, DataQualityError, MOCK_DATA_QUALITY, DestinationHealthError, MOCK_DESTINATION_HEALTH, ErrorAnalyticsError, MOCK_ERROR_ANALYTICS, ExecutionStatisticsError (+29 more)

### Community 140 - "design_context.md"
Cohesion: 0.06
Nodes (34): 10. Shadows, 11. Borders, 13. Header, 14. Navigation Design, 15. Page Layout, 16. Cards, 17. Dashboard Design, 18. KPI Cards (+26 more)

### Community 141 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 142 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 143 - "NodeLibraryScreen.jsx"
Cohesion: 0.07
Nodes (24): AddToPipelineModal(), SAMPLE_PIPELINES, CreateCustomNodeModal(), ExportCatalogModal(), ImportNodePackageModal(), ManageCategoriesModal(), NODE_ICON_MAP, NodeCard() (+16 more)

### Community 144 - "react"
Cohesion: 0.06
Nodes (24): AdvancedConfigSection(), BusinessRulesSection(), DataPreviewSection(), DataTypeValidationSection(), EmailValidationSection(), ErrorStructureSection(), FieldValidationRulesSection(), GeneralInfoSection() (+16 more)

### Community 145 - "createDataSource"
Cohesion: 0.40
Nodes (5): handleConfirmCreate(), handleTestConnection(), buildPayload(), createDataSource(), testConnection()

### Community 146 - "MergeNodeConfigScreen.jsx"
Cohesion: 0.13
Nodes (11): DeduplicationSection(), FieldMappingSection(), GeneralInfoSection(), InputStreamsSection(), JoinConditionsSection(), JoinStrategySection(), MergeNodeHeader(), PerformanceBufferSection() (+3 more)

### Community 147 - "MappingNodeConfigScreen.jsx"
Cohesion: 0.07
Nodes (33): AddMappingModal(), AdvancedConfigSection(), AutoMappingSection(), DataPreviewSection(), DataTypeAndNullSection(), DiscardChangesModal(), DuplicateNodeModal(), GeneralInfoSection() (+25 more)

### Community 148 - "ConfirmDialog"
Cohesion: 0.67
Nodes (4): ConfirmDialog(), getFocusable(), handleKeyDown(), formatRows()

### Community 149 - "transformationNodeConfig.api.js"
Cohesion: 0.12
Nodes (22): DateFormattingSection(), GeneralInfoSection(), RuntimeConfigSection(), MODE_ICONS, TransformationModeSelector(), useTransformationNodeConfig(), DATE_FORMATS, DEFAULT_TRANSFORMATION_NODE_CONFIG (+14 more)

### Community 150 - "validationNodeConfig.api.js"
Cohesion: 0.13
Nodes (24): AddBusinessRuleModal(), AddRuleModal(), SeverityFailureBehaviorSection(), useValidationNodeConfig(), apiRequest(), DEFAULT_VALIDATION_NODE_CONFIG, duplicateValidationNode(), FAILURE_BEHAVIORS (+16 more)

### Community 151 - "FilterNodeConfigScreen.jsx"
Cohesion: 0.06
Nodes (39): AdvancedConfigSection(), AdvancedExpressionSection(), DataPreviewSection(), DiscardChangesModal(), DuplicateNodeModal(), FILTER_MODES, FilterModeSelector(), FilterNodeHeader() (+31 more)

### Community 152 - "screen_lists.md"
Cohesion: 0.09
Nodes (22): 10. Transformation Engine (8 Screens), 11. Validation Engine (8 Screens), 12. Scheduler Module (7 Screens), 13. Pipeline Monitoring Module (10 Screens), 14. Error Management Module (7 Screens), 15. Queue & Worker Monitoring (8 Screens), 16. Reports & Analytics (8 Screens), 17. Notification Center (5 Screens) (+14 more)

### Community 153 - "dataSource.controller.js"
Cohesion: 0.18
Nodes (6): dataSource_service_1, DataSourceController, response_1, dataSource_controller_1, express_1, router

### Community 154 - "apiFetch"
Cohesion: 0.20
Nodes (14): useMergeNodeConfig(), CONFLICT_RESOLUTIONS, DEFAULT_MERGE_NODE_CONFIG, duplicateMergeNode(), getMergeNodeConfig(), INPUT_STREAM_LEFT, INPUT_STREAM_RIGHT, MERGE_STRATEGIES (+6 more)

### Community 155 - "notification.controller.js"
Cohesion: 0.10
Nodes (7): notification_service_1, NotificationController, response_1, express_1, notification_controller_1, router, NotificationService

### Community 156 - "uploadCsvFile"
Cohesion: 0.50
Nodes (4): handleFileSelected(), deriveTableName(), formatBytes(), uploadCsvFile()

### Community 158 - "startCsvImport"
Cohesion: 0.67
Nodes (3): buildPayload(), handleConfirmImport(), startCsvImport()

### Community 159 - "rbac.controller.js"
Cohesion: 0.07
Nodes (15): joi_1, rbac_service_1, response_1, role_model_1, accessControlSettingsSchema, mongoose_1, mongoose_1, roleSchema (+7 more)

### Community 160 - "parse_meta.js"
Cohesion: 0.29
Nodes (6): candidates, fs, glob, lines, parsed, raw

### Community 161 - "auth.api.js"
Cohesion: 0.20
Nodes (17): useAppDispatch, useAppSelector, maskEmail(), useEmailVerification(), resend(), useResetPasswordRequest(), submit(), validate() (+9 more)

### Community 162 - "useResetPasswordConfirm.js"
Cohesion: 0.23
Nodes (11): useResetPasswordConfirm(), submit(), validate(), ForgetPasswordScreen(), handleSubmit(), confirmPasswordReset(), SettingsShellScaffold(), evaluatePasswordStrength() (+3 more)

### Community 163 - "detailed_analysis.js"
Cohesion: 0.33
Nodes (5): cards, frames, fs, texts, xml

### Community 164 - "extract_all.js"
Cohesion: 0.33
Nodes (5): elements, fs, textDump, textElements, xml

### Community 165 - "parse_details.js"
Cohesion: 0.33
Nodes (5): frameMatches, fs, out, textMatches, xml

### Community 166 - ".tmp/parse_metadata.js"
Cohesion: 0.33
Nodes (5): files, fs, lines, parsed, path

### Community 167 - "parse_metadata.js"
Cohesion: 0.40
Nodes (4): frames, fs, texts, xml

### Community 168 - "parse_texts.js"
Cohesion: 0.40
Nodes (4): frames, fs, texts, xml

### Community 169 - "extract_cards.js"
Cohesion: 0.40
Nodes (4): cardIds, fs, out, xml

### Community 170 - "extract_scr069.js"
Cohesion: 0.40
Nodes (4): dump, fs, texts, xml

### Community 171 - "extract_sections.js"
Cohesion: 0.40
Nodes (4): dump, fs, texts, xml

### Community 172 - "extract_texts_correct.js"
Cohesion: 0.40
Nodes (4): dump, fs, texts, xml

### Community 173 - "find_sections.js"
Cohesion: 0.40
Nodes (4): elements, fs, sectionTitles, xml

### Community 174 - "parse_tags.js"
Cohesion: 0.40
Nodes (4): elements, fs, texts, xml

### Community 175 - "make_outline.js"
Cohesion: 0.50
Nodes (3): fs, lines, xml

### Community 176 - "parse_scr069.js"
Cohesion: 0.50
Nodes (3): fs, lines, xml

### Community 184 - "app.js"
Cohesion: 0.14
Nodes (13): app, auth_routes_1, cookie_parser_1, cors_1, dataSources_routes_1, destinations_routes_1, express_1, notifications_routes_1 (+5 more)

### Community 185 - "useChangePassword.js"
Cohesion: 0.22
Nodes (9): useChangePassword(), submit(), validate(), ChangePasswordScreen(), handleSubmit(), changePassword(), ChangePasswordError, changePasswordSlice (+1 more)

### Community 186 - "auth.middleware.js"
Cohesion: 0.22
Nodes (6): errors_1, jwt_1, response_1, user_model_1, mongoose_1, UserSchema

### Community 187 - "department.service.js"
Cohesion: 0.15
Nodes (6): DepartmentSchema, mongoose_1, { Department }, { DepartmentNotFoundError }, DepartmentService, DepartmentNotFoundError

### Community 188 - "server.js"
Cohesion: 0.25
Nodes (5): dotenv_1, node_process_1, app_1, env_1, mongoose_1

### Community 189 - "editUser.api.js"
Cohesion: 0.22
Nodes (10): useEditableUser(), EditUserScreen(), ADD_USER_OPTIONS, InviteUserError, LICENSE_POOL, TAKEN_EMPLOYEE_IDS, buildBaseline(), EDIT_USER_OPTIONS (+2 more)

### Community 190 - "team.service.js"
Cohesion: 0.15
Nodes (6): mongoose_1, TeamSchema, { Team }, { TeamNotFoundError }, TeamService, TeamNotFoundError

### Community 191 - "organization.controller.js"
Cohesion: 0.11
Nodes (13): { departmentService }, { organizationActivityService }, { organizationService }, { sendSuccess, sendError }, { teamService }, mongoose_1, OrganizationActivitySchema, express (+5 more)

### Community 193 - "Module Summary: MOD-004 Organization Management"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-004 Organization Management, Quality Gates & Verification

### Community 195 - "Module Summary: MOD-005 User Management & Profile"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-005 User Management & Profile, Quality Gates & Verification

### Community 197 - "errors.js"
Cohesion: 0.09
Nodes (13): mongoose_1, OrganizationSchema, { Organization }, { OrganizationActivity }, { OrganizationNotFoundError, ConflictError }, AppError, AuthenticationError, AuthorizationError (+5 more)

### Community 198 - "Module Summary: MOD-006 Data Sources & Connectors"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-006 Data Sources & Connectors, Quality Gates & Verification

### Community 199 - "MOD-001: Shell & Bootstrap"
Cohesion: 0.29
Nodes (6): Downstream Contracts & Mock Boundaries, Implemented Capabilities, Mapped Frontend Screens & Frames, MOD-001: Shell & Bootstrap, Module Summary, Quality Gates Summary

### Community 200 - "MOD-002: Authentication & Session"
Cohesion: 0.29
Nodes (6): Backend Capabilities & Data Models, Integration & Network Layer, Mapped Frontend Screens, MOD-002: Authentication & Session, Module Summary, Quality Gates Summary

### Community 201 - "MOD-003: RBAC & Permissions"
Cohesion: 0.29
Nodes (6): Backend Capabilities & Data Models, Integration & Network Layer, Mapped Frontend Screens, MOD-003: RBAC & Permissions, Module Summary, Quality Gates Summary

### Community 202 - "Module Summary: MOD-007 Destinations"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-007 Destinations, Quality Gates & Verification

### Community 203 - "Module Summary: MOD-008 Pipeline Builder & Execution"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-008 Pipeline Builder & Execution, Quality Gates & Verification

### Community 204 - "Module Summary: MOD-010 Notifications"
Cohesion: 0.33
Nodes (5): Backend Capabilities & Data Models, Frontend Screens Mapped, Module Identification, Module Summary: MOD-010 Notifications, Quality Gates & Verification

### Community 205 - "auth.service.js"
Cohesion: 0.18
Nodes (7): crypto_1, errors_1, jwt_1, password_1, token_model_1, user_model_1, bcryptjs_1

### Community 208 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateUser()

### Community 209 - "convert-to-js.js"
Cohesion: 0.40
Nodes (3): fs, path, ts

### Community 210 - "notification.model.js"
Cohesion: 0.50
Nodes (3): mongoose_1, NotificationPreferenceSchema, NotificationSchema

### Community 213 - "auth.controller.js"
Cohesion: 0.20
Nodes (8): auth_service_1, errors_1, joi_1, response_1, auth_controller_1, auth_middleware_1, express_1, router

### Community 214 - "dataSource.service.js"
Cohesion: 0.20
Nodes (5): DataSourceSchema, mongoose_1, dataSources_model_1, DataSourceService, errors_1

### Community 215 - "PipelineSettingsScreen.jsx"
Cohesion: 0.46
Nodes (5): usePipelineSettings(), PipelineSettingsScreen(), DEFAULT_PIPELINE_SETTINGS, getPipelineSettings(), savePipelineSettings()

### Community 216 - "nodeLibrary.api.js"
Cohesion: 0.21
Nodes (17): NodeFilterToolbar(), useNodeLibrary(), CERTIFICATION_OPTIONS, COMPATIBILITY_OPTIONS, CONNECTOR_TYPE_OPTIONS, createCustomNode(), exportCatalogFile(), getNodeCatalog() (+9 more)

### Community 217 - "41. Role-Based Experience"
Cohesion: 0.22
Nodes (9): 41. Role-Based Experience, Auditor, Business User, Data Analyst, Data Engineer, Operations Engineer, Organization Admin, QA / Data Quality Manager (+1 more)

### Community 218 - "VisualPipelineBuilderScreen.jsx"
Cohesion: 0.20
Nodes (8): BuilderHeader(), BuilderSubheader(), ExecutionConsole(), NodeConfigPanel(), CATEGORY_COLORS, NODE_ICON_MAP, PipelineCanvas(), VisualPipelineBuilderScreen()

### Community 220 - "pipelineHistory.api.js"
Cohesion: 0.33
Nodes (6): usePipelineHistory(), PipelineVersionHistoryScreen(), getPipelineHistory(), MOCK_HISTORY, PipelineHistoryError, rollbackPipeline()

### Community 221 - "addDestination.api.js"
Cohesion: 0.43
Nodes (6): AddDestinationScreen(), createDestination(), ORG_ID, testConnection(), validateDestination(), validateTestConnection()

### Community 222 - "isModified"
Cohesion: 0.49
Nodes (10): AuthenticationSecurity(), isModified(), markTouched(), setField(), showError(), LicenseManagement(), NotificationPreferences(), OrganizationAssignment() (+2 more)

### Community 223 - "PipelineTemplateLibraryScreen.jsx"
Cohesion: 0.44
Nodes (6): usePipelineTemplates(), PipelineTemplateLibraryScreen(), getPipelineTemplates(), instantiateTemplate(), MOCK_TEMPLATES, TEMPLATE_CATEGORIES

### Community 224 - "token.model.js"
Cohesion: 0.40
Nodes (4): EmailVerificationTokenSchema, mongoose_1, PasswordResetTokenSchema, RefreshTokenSchema

### Community 225 - "3. Visual Hierarchy"
Cohesion: 0.40
Nodes (5): 3. Visual Hierarchy, Level 1 — Page Identity, Level 2 — Primary Information, Level 3 — Supporting Information, Level 4 — Metadata

### Community 226 - "7. Typography Rules"
Cohesion: 0.40
Nodes (5): 7. Typography Rules, Metadata, Numbers, Primary text, Secondary text

### Community 227 - "35. Buttons"
Cohesion: 0.50
Nodes (4): 35. Buttons, Destructive, Primary, Secondary

### Community 228 - "4. Color System"
Cohesion: 0.50
Nodes (4): 4. Color System, Base Colors, Primary Accent, Semantic Colors

### Community 229 - "importWorkbook"
Cohesion: 0.67
Nodes (3): buildPayload(), handleConfirmImport(), importWorkbook()

### Community 230 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

## Knowledge Gaps
- **970 isolated node(s):** `fs`, `xml`, `frames`, `texts`, `cards` (+965 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `index.js`, `visualPipelineBuilder.api.js`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `.oxlintrc.json`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `TransformationNodeConfigScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `DestinationNodeConfigScreen.jsx`, `AccessControlSettingsScreen.jsx`, `useTwoFactor`, `PermissionMatrixScreen.jsx`, `ApiConnectorSetupScreen.jsx`, `EditRoleScreen.jsx`, `useBootstrap.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `router.jsx`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `permissions.js`, `CreateRoleScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `SourceNodeConfigScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `ConnectionTestResultScreen.jsx`, `FtpConnectionScreen.jsx`, `CsvUploadScreen.jsx`, `destinationConnectionTest.api.js`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `ExcelUploadScreen.jsx`, `destinationHealthMonitoring.api.js`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `AppShell.jsx`, `destinationHistory.api.js`, `SftpConnectionScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `useLogout`, `CreatePipelineScreen.jsx`, `Header.jsx`, `WebhookConfigurationScreen.jsx`, `pipelineList.api.js`, `Sidebar.jsx`, `readJson`, `NodeLibraryScreen.jsx`, `MergeNodeConfigScreen.jsx`, `MappingNodeConfigScreen.jsx`, `transformationNodeConfig.api.js`, `validationNodeConfig.api.js`, `FilterNodeConfigScreen.jsx`, `apiFetch`, `auth.api.js`, `useResetPasswordConfirm.js`, `useChangePassword.js`, `PipelineSettingsScreen.jsx`, `nodeLibrary.api.js`, `VisualPipelineBuilderScreen.jsx`, `pipelineHistory.api.js`, `PipelineTemplateLibraryScreen.jsx`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell.jsx` to `TeamManagementScreen.jsx`, `pipelineList.api.js`, `ErrorAnalyticsScreen.jsx`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `NodeLibraryScreen.jsx`, `react`, `MergeNodeConfigScreen.jsx`, `MappingNodeConfigScreen.jsx`, `FilterNodeConfigScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `RoleListScreen.jsx`, `EditOrganizationScreen.jsx`, `OrganizationDetailsScreen.jsx`, `EditUserScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `TransformationNodeConfigScreen.jsx`, `UserListScreen.jsx`, `UserProfileScreen.jsx`, `DestinationNodeConfigScreen.jsx`, `AccessControlSettingsScreen.jsx`, `PermissionMatrixScreen.jsx`, `ApiConnectorSetupScreen.jsx`, `EditRoleScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DashboardScreen.jsx`, `router.jsx`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `CreateRoleScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `PipelineSettingsScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `ConnectionTestResultScreen.jsx`, `SourceNodeConfigScreen.jsx`, `pipelineHistory.api.js`, `FtpConnectionScreen.jsx`, `VisualPipelineBuilderScreen.jsx`, `PipelineTemplateLibraryScreen.jsx`, `CsvUploadScreen.jsx`, `destinationConnectionTest.api.js`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `ExcelUploadScreen.jsx`, `destinationHealthMonitoring.api.js`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `SftpConnectionScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `CreatePipelineScreen.jsx`, `WebhookConfigurationScreen.jsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `TeamManagementScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `excelUpload.api.js`, `DataQualityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `CreateOrganizationScreen.jsx`, `SourceHealthScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `UserDetailsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `RoleListScreen.jsx`, `OrganizationDetailsScreen.jsx`, `OrganizationSettingsScreen.jsx`, `OrganizationActivityScreen.jsx`, `DepartmentManagementScreen.jsx`, `AddUserScreen.jsx`, `UserListScreen.jsx`, `EditForm`, `ProfileForm`, `useTwoFactor`, `editRole.api.js`, `ApiConnectorSetupScreen.jsx`, `SettingsForm`, `useBootstrap.js`, `userProfile.api.js`, `UserActivityHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DashboardScreen.jsx`, `DestinationListScreen.jsx`, `UserLoginHistoryScreen.jsx`, `permissionMatrix.api.js`, `accessControlSettings.api.js`, `DatabaseConnectorSetupScreen.jsx`, `SourceNodeConfigScreen.jsx`, `ConnectionTestResultScreen.jsx`, `createRole.api.js`, `FtpConnectionScreen.jsx`, `csvUpload.api.js`, `destinationConnectionTest.api.js`, `createRole`, `AddDataSourceScreen.jsx`, `DataSourceListScreen.jsx`, `getPermissionMatrix`, `editOrganization.api.js`, `destinationHealthMonitoring.api.js`, `destinationConfiguration.api.js`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `SourceHealthMonitoringScreen.jsx`, `useLogout`, `CreatePipelineScreen.jsx`, `Header.jsx`, `sftpConnection.api.js`, `SftpConnectionScreen`, `webhookConfiguration.api.js`, `executionStats.api.js`, `pipelineList.api.js`, `EditForm`, `WebhookConfigurationScreen`, `readJson`, `createDataSource`, `uploadCsvFile`, `startCsvImport`, `auth.api.js`, `useResetPasswordConfirm.js`, `useChangePassword.js`, `editUser.api.js`, `EditForm`, `PipelineSettingsScreen.jsx`, `nodeLibrary.api.js`, `pipelineHistory.api.js`, `addDestination.api.js`, `PipelineTemplateLibraryScreen.jsx`, `importWorkbook`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `SettingsForm()` (e.g. with `isModified()` and `markTouched()`) actually correct?**
  _`SettingsForm()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `xml`, `frames` to the rest of the system?**
  _970 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TeamManagementScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07311827956989247 - nodes in this community are weakly interconnected._
- **Should `agent.md` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._