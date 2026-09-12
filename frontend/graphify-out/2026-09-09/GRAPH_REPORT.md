# Graph Report - frontend  (2026-09-09)

## Corpus Check
- 255 files · ~363,098 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2733 nodes · 4674 edges · 124 communities (118 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `baba993d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ApiConnectorSetupScreen.jsx
- FtpConnectionScreen.jsx
- ConnectionTestResultScreen.jsx
- DatabaseConnectorSetupScreen.jsx
- UserLoginHistoryScreen.jsx
- UserActivityHistoryScreen.jsx
- UserProfileScreen.jsx
- UserPermissionManagementScreen.jsx
- DataQualityScreen.jsx
- DataSourceListScreen.jsx
- DestinationListScreen.jsx
- RoleListScreen.jsx
- OrganizationActivityScreen.jsx
- dependencies
- ExecutiveDashboardScreen.jsx
- PipelineOverviewScreen.jsx
- SourceHealthMonitoringScreen.jsx
- AddUserScreen.jsx
- PerformanceAnalyticsScreen.jsx
- RealTimeMonitoringScreen.jsx
- DestinationHealthScreen.jsx
- ExecutionStatisticsScreen.jsx
- SourceHealthScreen.jsx
- AddDataSourceScreen.jsx
- OrganizationSettingsScreen.jsx
- ErrorAnalyticsScreen.jsx
- SystemHealthScreen.jsx
- ExcelUploadScreen.jsx
- EditUserScreen.jsx
- OrganizationDetailsScreen.jsx
- TeamManagementScreen.jsx
- CreateOrganizationScreen.jsx
- UserListScreen.jsx
- DepartmentManagementScreen.jsx
- AccessControlSettingsScreen.jsx
- SftpConnectionScreen.jsx
- EditRoleScreen.jsx
- UserDetailsScreen.jsx
- excelUpload.api.js
- react
- WebhookConfigurationScreen.jsx
- SourceConnectionSetupScreen.jsx
- csvUpload.api.js
- CreateRoleScreen.jsx
- PermissionMatrixScreen.jsx
- useAppDispatch
- EditOrganizationScreen.jsx
- sourceNodeConfig.api.js
- EditForm
- index.js
- DashboardScreen.jsx
- setField
- SettingsForm
- CreateRoleScreen
- useResetPasswordConfirm.js
- ExcelUploadScreen
- permissions.js
- createRole.api.js
- OrganizationListScreen.jsx
- permissionMatrix.api.js
- CsvUploadScreen
- Header.jsx
- client.js
- ProfileForm
- webhookConfiguration.api.js
- editRole.api.js
- destinationHistory.api.js
- setField
- useLogin
- destinationConnectionTest.api.js
- setField
- setField
- editOrganization.api.js
- accessControlSettings.api.js
- NodeCatalogGrid.jsx
- AddDataSourceScreen
- WebhookConfigurationScreen
- sftpConnection.api.js
- EditForm
- pipelineList.api.js
- NodeLibraryScreen.jsx
- EditForm
- useTwoFactor.js
- SftpConnectionScreen
- isModified
- isModified
- useEmailVerification.js
- NumberField
- .oxlintrc.json
- nodeLibrary.api.js
- visualPipelineBuilder.api.js
- userProfile.api.js
- AppShell
- destinationConfiguration.api.js
- setField
- MatrixPanel
- React + TypeScript + Vite
- ConfirmDialog
- apiFetch
- getPermissionMatrix
- destinationHealthMonitoring.api.js
- ConfirmDialog
- ConfirmDialog
- ConfirmDialog
- ConfirmDialog
- ConfirmDialog
- ConfirmDialog
- DetailPanel
- ConfirmDialog
- ConfirmDialog
- ConfirmDialog
- VisualPipelineBuilderScreen.jsx
- ConfirmDialog
- useChangePassword.js
- Sidebar.jsx
- router.jsx
- AppShell.jsx
- NodeDetailDrawer.jsx
- executionStats.api.js
- dashboard.api.js

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 166 edges
2. `readJson()` - 157 edges
3. `react` - 125 edges
4. `AppShell()` - 57 edges
5. `SettingsForm()` - 19 edges
6. `CreateRoleScreen()` - 18 edges
7. `EditForm()` - 18 edges
8. `useAppDispatch` - 17 edges
9. `useAppSelector` - 17 edges
10. `CsvUploadScreen()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `resend()` --calls--> `resendVerificationEmail()`  [EXTRACTED]
  src/features/auth/hooks/useEmailVerification.js → src/features/auth/services/auth.api.js
- `resend()` --calls--> `resendTwoFactorCode()`  [EXTRACTED]
  src/features/auth/hooks/useTwoFactor.js → src/features/auth/services/auth.api.js
- `handleSave()` --calls--> `saveValidatedConnection()`  [EXTRACTED]
  src/features/dataSources/pages/ConnectionTestResultScreen.jsx → src/features/dataSources/services/connectionTestResult.api.js
- `useEmailVerification()` --calls--> `useAppDispatch`  [EXTRACTED]
  src/features/auth/hooks/useEmailVerification.js → src/app/hooks.js
- `useLogin()` --calls--> `useAppDispatch`  [EXTRACTED]
  src/features/auth/hooks/useLogin.js → src/app/hooks.js

## Import Cycles
- None detected.

## Communities (124 total, 6 thin omitted)

### Community 0 - "ApiConnectorSetupScreen.jsx"
Cohesion: 0.05
Nodes (40): ApiConnectorSetupScreen(), addPair(), handleConfirmCreate(), handleTestRequest(), invalidateTest(), markTouched(), removePair(), setField() (+32 more)

### Community 1 - "FtpConnectionScreen.jsx"
Cohesion: 0.05
Nodes (34): Authentication(), buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), ConnectionConfiguration(), CRED_META (+26 more)

### Community 2 - "ConnectionTestResultScreen.jsx"
Cohesion: 0.05
Nodes (22): useConnectionTestResult(), ConnectionTestResultScreen(), handleCopyDiagnostics(), handleSave(), Diagnostics(), PerformanceMetrics(), Recommendations(), ResultBanner() (+14 more)

### Community 3 - "DatabaseConnectorSetupScreen.jsx"
Cohesion: 0.06
Nodes (29): Authentication(), buildPayload(), computeChecklist(), ConfirmDialog(), getFocusable(), handleKeyDown(), ConnectionConfiguration(), ConnectionOptions() (+21 more)

### Community 4 - "UserLoginHistoryScreen.jsx"
Cohesion: 0.05
Nodes (17): useUserLoginHistory(), ACCOUNT_STATUS_DOT, AUTH_TONE, MFA_TONE, RISK_TONE, STAT_TONE, UserLoginHistoryScreen(), AUTH_RESULTS (+9 more)

### Community 5 - "UserActivityHistoryScreen.jsx"
Cohesion: 0.06
Nodes (14): useUserActivityHistory(), ACCOUNT_STATUS_DOT, SEVERITY_TONE, STAT_TONE, STATUS_TONE, UserActivityHistoryScreen(), ACTIVITY_TYPES, buildBaseline() (+6 more)

### Community 6 - "UserProfileScreen.jsx"
Cohesion: 0.05
Nodes (6): ACTIVITY_ICON_TONE, ACTIVITY_TAG_TONE, BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, SECURITY_TONE

### Community 7 - "UserPermissionManagementScreen.jsx"
Cohesion: 0.06
Nodes (11): useUserPermissions(), PermissionView(), handleSave(), STATE_TONE, UserPermissionManagementScreen(), ACCESS_LEVEL_OPTIONS, buildBaseline(), getUserPermissions() (+3 more)

### Community 8 - "DataQualityScreen.jsx"
Cohesion: 0.06
Nodes (19): useDataQuality(), ALERT_SEVERITY, chartPoints(), DataQualityScreen(), DATE_RANGES, FailedValidationsTable(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+11 more)

### Community 9 - "DataSourceListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDataSourceList(), DataSourceListScreen(), DataSourcesTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 10 - "DestinationListScreen.jsx"
Cohesion: 0.07
Nodes (17): useDestinationList(), DestinationListScreen(), DestinationsTable(), KPI_TONE, SourceDrawer(), getFocusable(), handleKeyDown(), STATUS_TONE (+9 more)

### Community 11 - "RoleListScreen.jsx"
Cohesion: 0.06
Nodes (18): useRoleList(), KPI_TONE, PRIVILEGE_TONE, RoleDrawer(), getFocusable(), handleKeyDown(), RoleListScreen(), RolesTable() (+10 more)

### Community 12 - "OrganizationActivityScreen.jsx"
Cohesion: 0.06
Nodes (15): useOrganizationActivity(), ActivityTable(), CATEGORY_TONE, EventDrawer(), getFocusable(), handleKeyDown(), KPI_TONE, OrganizationActivityScreen() (+7 more)

### Community 13 - "dependencies"
Cohesion: 0.05
Nodes (37): autoprefixer, lucide-react, oxlint, dependencies, lucide-react, react, react-dom, react-redux (+29 more)

### Community 14 - "ExecutiveDashboardScreen.jsx"
Cohesion: 0.06
Nodes (21): useExecutiveDashboard(), AdoptionTrendChart(), ALERT_SEVERITY, chartPoints(), DATE_RANGES, ExecutiveDashboardScreen(), HEALTH_BAR_TONE, HEALTH_DOT_TONE (+13 more)

### Community 15 - "PipelineOverviewScreen.jsx"
Cohesion: 0.06
Nodes (18): usePipelineOverview(), ALERT_SEVERITY, AllPipelinesTable(), chartPoints(), DATE_RANGES, HEALTH_BAR_TONE, HEALTH_DOT_TONE, KPI_ICON (+10 more)

### Community 16 - "SourceHealthMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (13): useSourceHealth(), HEALTH_FILTERS, HEALTH_TONE, KPI_TONE, POSTURE_TONE, SEVERITY_TONE, SourceHealthMonitoringScreen(), TIMELINE_TONE (+5 more)

### Community 17 - "AddUserScreen.jsx"
Cohesion: 0.08
Nodes (17): AddUserScreen(), handleConfirmInvite(), markTouched(), setField(), showError(), AuthenticationSecurity(), BasicInformation(), buildPayload() (+9 more)

### Community 18 - "PerformanceAnalyticsScreen.jsx"
Cohesion: 0.06
Nodes (18): usePerformanceAnalytics(), BAR_TONE, ComponentsTable(), KPI_ICON, KPI_TONE, PerformanceAnalyticsScreen(), PRIORITY_BADGE, RANGES (+10 more)

### Community 19 - "RealTimeMonitoringScreen.jsx"
Cohesion: 0.06
Nodes (19): useRealTimeMonitoring(), ACTIVITY_BADGE, ALERT_TONE, CONN_TONE, EVENT_TONE, INFRA_TONE, KPI_ICON, KPI_TONE (+11 more)

### Community 20 - "DestinationHealthScreen.jsx"
Cohesion: 0.07
Nodes (19): useDestinationHealth(), ALERT_SEVERITY, AllDestinationsTable(), chartPoints(), DeliverySuccessCard(), DestinationHealthScreen(), KPI_ICON, KPI_TONE (+11 more)

### Community 21 - "ExecutionStatisticsScreen.jsx"
Cohesion: 0.06
Nodes (18): useExecutionStatistics(), ENV_TONE, ExecutionsTable(), ExecutionStatisticsScreen(), INSIGHT_TONE, KPI_ICON, KPI_TONE, OUTCOME_TONE (+10 more)

### Community 22 - "SourceHealthScreen.jsx"
Cohesion: 0.07
Nodes (19): useSourceHealth(), ALERT_SEVERITY, AllSourcesTable(), AUTH_STAT_TONE, AUTH_TIMELINE_STATUS, chartPoints(), ConnectionHealthCard(), KPI_ICON (+11 more)

### Community 23 - "AddDataSourceScreen.jsx"
Cohesion: 0.07
Nodes (12): ALL_TABLE_IDS, CONNECTOR_ORDER, INITIAL_FORM, AUTH_FIELD_MAP, CONNECTOR_GROUPS, DATA_SOURCE_OPTIONS, DataSourceError, NOTIFICATION_CHANNELS (+4 more)

### Community 24 - "OrganizationSettingsScreen.jsx"
Cohesion: 0.05
Nodes (45): useOrganizationSettings(), BOOLEAN_KEYS, BrandingSettings(), CHANGE_LABELS, ComplianceAudit(), computeChecklist(), ConfirmDialog(), displayValue() (+37 more)

### Community 25 - "ErrorAnalyticsScreen.jsx"
Cohesion: 0.07
Nodes (19): useErrorAnalytics(), BAR_TONE, DELTA_TONE, ERROR_STATUS, ErrorAnalyticsScreen(), ErrorsTable(), INCIDENT_STATUS, KPI_ICON (+11 more)

### Community 26 - "SystemHealthScreen.jsx"
Cohesion: 0.07
Nodes (16): useSystemHealth(), ALERT_SEVERITY, chartPoints(), healthBarTone(), InfrastructureComponentsTable(), KPI_ICON, KPI_TONE, linePath() (+8 more)

### Community 28 - "EditUserScreen.jsx"
Cohesion: 0.06
Nodes (5): BOOLEAN_KEYS, CHANGE_LABELS, CIDR_LIST_PATTERN, ConfirmDialog(), EDITABLE_KEYS

### Community 29 - "OrganizationDetailsScreen.jsx"
Cohesion: 0.07
Nodes (12): useOrganizationDetails(), DOT_TONE, HEADER_ACTIONS, KPI_ACCENT, ORG_TONE, OrganizationDetailsScreen(), RUN_TONE, STATUS_TONE (+4 more)

### Community 30 - "TeamManagementScreen.jsx"
Cohesion: 0.07
Nodes (14): useTeamManagement(), CODE_TONE, DOT_TONE, KPI_TONE, PIPELINE_TONE, STATUS_TONE, TeamDrawer(), getFocusable() (+6 more)

### Community 31 - "CreateOrganizationScreen.jsx"
Cohesion: 0.09
Nodes (16): buildPayload(), computeChecklist(), CreateOrganizationScreen(), handleConfirmCreate(), markTouched(), setField(), showError(), INITIAL_FORM (+8 more)

### Community 32 - "UserListScreen.jsx"
Cohesion: 0.07
Nodes (13): useUserList(), AVATAR_TONE, KPI_TONE, ROLE_TONE, STATUS_TONE, UserDrawer(), getFocusable(), handleKeyDown() (+5 more)

### Community 33 - "DepartmentManagementScreen.jsx"
Cohesion: 0.07
Nodes (13): useDepartmentManagement(), DepartmentDrawer(), getFocusable(), handleKeyDown(), DepartmentManagementScreen(), DepartmentsTable(), DEPT_TONE, KPI_TONE (+5 more)

### Community 34 - "AccessControlSettingsScreen.jsx"
Cohesion: 0.06
Nodes (6): BOOLEAN_KEYS, CHANGE_LABELS, EDITABLE_KEYS, FACTOR_KEYS, NUMBER_FIELDS, PROVIDER_KEYS

### Community 35 - "SftpConnectionScreen.jsx"
Cohesion: 0.06
Nodes (5): CRED_META, cronHint(), INITIAL_FORM, SchedulingAutomation(), TRANSFER_DIRECTIONS

### Community 37 - "EditRoleScreen.jsx"
Cohesion: 0.06
Nodes (7): ADMIN_LABEL, BOOLEAN_KEYS, GROUP_LABEL, PERM_LABEL, RESOURCE_LABEL, SIMPLE_KEYS, SIMPLE_LABELS

### Community 38 - "UserDetailsScreen.jsx"
Cohesion: 0.08
Nodes (7): useUserDetails(), STATUS_TONE, TAG_TONE, UserDetailsScreen(), buildBaseline(), getUserDetails(), UserDetailsError

### Community 39 - "excelUpload.api.js"
Cohesion: 0.07
Nodes (27): ACCEPTED_EXTENSIONS, COMPLIANCE_FRAMEWORKS, DEFAULT_TAGS, DESTINATION_OPTIONS, DETECTED_SCHEMA, DUPLICATE_STRATEGIES, ExcelUploadError, FORMULA_STRATEGIES (+19 more)

### Community 40 - "react"
Cohesion: 0.10
Nodes (21): plugins, oxc, react, AdvancedSettingsSection(), AuthenticationSection(), DataExtractionSection(), DataSamplingPreviewSection(), DiscardChangesModal() (+13 more)

### Community 41 - "WebhookConfigurationScreen.jsx"
Cohesion: 0.07
Nodes (4): AUTH_ORDER, INITIAL_FORM, RETRY_SCHEDULE, SAMPLE_HEADERS

### Community 42 - "SourceConnectionSetupScreen.jsx"
Cohesion: 0.10
Nodes (10): SourceConnectionSetupScreen(), CONNECTORS_BY_ID, ADD_DATA_SOURCE_ROUTE, CONNECTION_METHOD_GROUPS, LIVE_METHOD_ROUTES, METHOD_ORDER, METHODS_BY_ID, NOTE: `defaultPort` on each method is informational only — SCR-047 (+2 more)

### Community 43 - "csvUpload.api.js"
Cohesion: 0.08
Nodes (25): COLUMN_TYPE_OPTIONS, COMPLIANCE_FRAMEWORKS, CsvUploadError, DEFAULT_DESTINATION, DEFAULT_GOVERNANCE, DEFAULT_PARSE_CONFIG, DESTINATION_OPTIONS, DETECTED_FILE_INFO (+17 more)

### Community 45 - "PermissionMatrixScreen.jsx"
Cohesion: 0.08
Nodes (3): CELL_STATE, KPI_TONE, PRIVILEGE_TONE

### Community 46 - "useAppDispatch"
Cohesion: 0.25
Nodes (9): useAppDispatch, useAppSelector, useLogout(), confirm(), reset(), LogoutScreen(), handleConfirm(), LoginError (+1 more)

### Community 48 - "sourceNodeConfig.api.js"
Cohesion: 0.11
Nodes (28): GeneralInfoSection(), SourceConfigSection(), SourceConnectorSection(), useSourceNodeConfig(), BASELINE_LIVE_VALIDATIONS, BASELINE_PREVIEW_DATA, BASELINE_SCHEMA_MAPPINGS, CATEGORIES (+20 more)

### Community 49 - "EditForm"
Cohesion: 0.13
Nodes (18): AssignmentRulesCard(), computeChecklist(), displaySimple(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), markTouched() (+10 more)

### Community 50 - "index.js"
Cohesion: 0.10
Nodes (14): App(), queryClient, router, authSlice, initialState, initialState, logoutSlice, initialState (+6 more)

### Community 51 - "DashboardScreen.jsx"
Cohesion: 0.12
Nodes (10): HEALTH_BAR_TONE, HEALTH_DOT_TONE, healthBarTone(), HealthMeterRow(), KPI_BAR_TONE, KPI_ICON, KPI_ICON_WRAP_TONE, KPI_VALUE_TONE (+2 more)

### Community 52 - "setField"
Cohesion: 0.20
Nodes (17): AuthenticationSecuritySection(), addCidr(), removeCidr(), updateCidr(), EndpointConfigurationSection(), EventProcessingSection(), EventSubscriptionSection(), clearAll() (+9 more)

### Community 53 - "SettingsForm"
Cohesion: 0.12
Nodes (15): AuthenticationPolicies(), computeChecklist(), computeImpact(), displayValue(), MfaPolicies(), NetworkRestrictions(), SettingsForm(), guardedNavigate() (+7 more)

### Community 54 - "CreateRoleScreen"
Cohesion: 0.12
Nodes (14): AdministrativePrivileges(), buildPayload(), computeChecklist(), countPermissions(), CreateRoleScreen(), handleConfirmCreate(), removeResourceRow(), toggleAdmin() (+6 more)

### Community 55 - "useResetPasswordConfirm.js"
Cohesion: 0.23
Nodes (11): useResetPasswordConfirm(), submit(), validate(), ForgetPasswordScreen(), handleSubmit(), PasswordResetConfirmError, SettingsShellScaffold(), evaluatePasswordStrength() (+3 more)

### Community 56 - "ExcelUploadScreen"
Cohesion: 0.12
Nodes (16): buildPayload(), computeChecklist(), DataQualityValidation(), DestinationConfiguration(), ExcelUploadScreen(), handleConfirmImport(), setField(), setParsing() (+8 more)

### Community 57 - "permissions.js"
Cohesion: 0.23
Nodes (10): NAV_TREE, ALL_PERMISSIONS, DATA_ETL_ENGINEER_PERMISSIONS, hasAnyPermission(), hasPermission(), PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS (+2 more)

### Community 58 - "createRole.api.js"
Cohesion: 0.12
Nodes (16): ACCESS_LEVEL_OPTIONS, ADMIN_PRIVILEGES, ASSIGNABLE_BY_OPTIONS, CreateRoleError, DEFAULT_RESOURCE_SCOPE, DESCRIPTION_MAX, INHERIT_ROLE_OPTIONS, INITIAL_FORM (+8 more)

### Community 59 - "OrganizationListScreen.jsx"
Cohesion: 0.08
Nodes (10): useOrganizationList(), KPI_TONE, ORG_TONE, OrganizationListScreen(), OrganizationsTable(), PLAN_TONE, STATUS_TONE, getOrganizationList() (+2 more)

### Community 60 - "permissionMatrix.api.js"
Cohesion: 0.15
Nodes (15): buildInsights(), buildMatrix(), buildMockMatrix(), LEVEL_OPTIONS, MATRIX_ROLES, MOCK_KPIS, PERMISSION_GROUPS, PERMISSION_STATES (+7 more)

### Community 61 - "CsvUploadScreen"
Cohesion: 0.13
Nodes (8): buildPayload(), computeChecklist(), CsvUploadScreen(), handleConfirmImport(), handleFileSelected(), deriveTableName(), formatBytes(), validate()

### Community 62 - "Header.jsx"
Cohesion: 0.10
Nodes (17): ICONS, NotificationPanel(), SEVERITY_BADGE, SEVERITY_WASH, TABS, QUERY_KEY, useNotifications(), getNotifications() (+9 more)

### Community 63 - "client.js"
Cohesion: 0.17
Nodes (13): env, useEditableUser(), EditUserScreen(), ADD_USER_OPTIONS, FEATURE_ACCESS_BY_LICENSE, InviteUserError, LICENSE_POOL, ROLE_ACCESS_SCOPE (+5 more)

### Community 64 - "ProfileForm"
Cohesion: 0.19
Nodes (12): displayValue(), NotificationPreferences(), PersonalInformation(), PersonalPreferences(), ProfileForm(), handleSubmit(), isModified(), markTouched() (+4 more)

### Community 65 - "webhookConfiguration.api.js"
Cohesion: 0.15
Nodes (12): AUTH_METHODS_BY_ID, DEFAULT_IP_ALLOWLIST, DEFAULT_JSON_SCHEMA, DEFAULT_SUBSCRIBED_EVENT_IDS, EVENT_CATEGORIES, EVENTS_BY_ID, ORG_ID, TOTAL_EVENT_COUNT (+4 more)

### Community 66 - "editRole.api.js"
Cohesion: 0.21
Nodes (11): useEditableRole(), EditRoleScreen(), ADMIN_PRIVILEGES, buildBaseline(), DEFAULT_PERMISSION_STATE(), EDIT_ROLE_OPTIONS, EditRoleError, getEditableRole() (+3 more)

### Community 67 - "destinationHistory.api.js"
Cohesion: 0.24
Nodes (12): useDestinationHistory(), DestinationHistoryScreen(), DEFAULT_DESTINATION_HISTORY_DATA, DESTINATION_OPTIONS, DestinationHistoryError, ENVIRONMENTS, EVENT_CATEGORIES, exportHistoryCsv() (+4 more)

### Community 68 - "setField"
Cohesion: 0.48
Nodes (7): markTouched(), setField(), showError(), DestinationConfiguration(), Governance(), ImportConfiguration(), ParsingConfiguration()

### Community 69 - "useLogin"
Cohesion: 0.21
Nodes (11): useLogin(), submit(), validate(), useResetPasswordRequest(), submit(), validate(), LoginScreen(), handleSubmit() (+3 more)

### Community 70 - "destinationConnectionTest.api.js"
Cohesion: 0.21
Nodes (11): useDestinationConnectionTest(), DestinationConnectionTestScreen(), buildDiagnosticsExportText(), DEFAULT_DESTINATION_METADATA, DEFAULT_TEST_CONFIG, DEFAULT_TEST_RESULT_SUCCESS, DestinationConnectionTestError, ORG_ID (+3 more)

### Community 71 - "setField"
Cohesion: 0.26
Nodes (12): markTouched(), setConnector(), setField(), showError(), toggleChannel(), Authentication(), ConnectionConfiguration(), GeneralInformation() (+4 more)

### Community 72 - "setField"
Cohesion: 0.30
Nodes (12): Authentication(), ConnectionConfiguration(), DirectoryDiscovery(), FileDiscoveryRules(), MonitoringAudit(), ServerConfiguration(), markTouched(), setAuthMethod() (+4 more)

### Community 73 - "editOrganization.api.js"
Cohesion: 0.26
Nodes (9): useEditableOrganization(), EditOrganizationScreen(), CreateOrganizationError, ORG_FORM_OPTIONS, PLAN_CATALOG, SUBSCRIPTION_PLANS, buildBaseline(), EditOrganizationError (+1 more)

### Community 74 - "accessControlSettings.api.js"
Cohesion: 0.21
Nodes (10): useAccessControlSettings(), AccessControlSettingsScreen(), ACCESS_CONTROL_OPTIONS, AccessControlSettingsError, AUTH_PROVIDERS, buildBaseline(), COMPLEXITY_REQUIREMENTS, COUNTRY_OPTIONS (+2 more)

### Community 75 - "NodeCatalogGrid.jsx"
Cohesion: 0.40
Nodes (4): NODE_ICON_MAP, NodeCard(), NodeCatalogGrid(), SORT_OPTIONS

### Community 76 - "AddDataSourceScreen"
Cohesion: 0.25
Nodes (10): AddDataSourceScreen(), handleConfirmCreate(), handleTestConnection(), toggleSchema(), toggleTable(), buildPayload(), computeChecklist(), connectionFieldsFor() (+2 more)

### Community 77 - "WebhookConfigurationScreen"
Cohesion: 0.22
Nodes (10): WebhookConfigurationScreen(), handleConfirmCreate(), handleGenerateEndpoint(), handleTestWebhook(), setAuthMethod(), buildPayload(), computeChecklist(), generateEndpoint() (+2 more)

### Community 78 - "sftpConnection.api.js"
Cohesion: 0.18
Nodes (10): NEGOTIATED_SUITE, ORG_ID, SAMPLE_MATCHES, SFTP_AUTH_FIELD_MAP, SFTP_AUTH_METHODS, SFTP_OPTIONS, SFTP_TRANSPORT, SFTP_TRIGGER_TYPES (+2 more)

### Community 79 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateOrganization()

### Community 80 - "pipelineList.api.js"
Cohesion: 0.06
Nodes (44): BulkActionBar(), ExpandedRowPreview(), STATUS_CONFIG, PipelineAnalyticsSection(), PipelineDetailDrawer(), STATUS_CONFIG, RecentExecutionsSection(), STATUS_CONFIG (+36 more)

### Community 81 - "NodeLibraryScreen.jsx"
Cohesion: 0.13
Nodes (13): AddToPipelineModal(), SAMPLE_PIPELINES, ExportCatalogModal(), ImportNodePackageModal(), ManageCategoriesModal(), NODE_ICON_MAP, NodeCatalogTable(), CATEGORY_ICON_MAP (+5 more)

### Community 82 - "EditForm"
Cohesion: 0.22
Nodes (8): computeChecklist(), displayValue(), EditForm(), guardedNavigate(), handleCancel(), handleConfirmSave(), validate(), updateUser()

### Community 83 - "useTwoFactor.js"
Cohesion: 0.18
Nodes (10): useTwoFactor(), handleKeyDown(), resend(), setDigit(), submit(), TwoFactorAuthenticationScreen(), handleSubmit(), TwoFactorError (+2 more)

### Community 84 - "SftpConnectionScreen"
Cohesion: 0.24
Nodes (9): buildPayload(), computeChecklist(), SftpConnectionScreen(), handleBrowse(), handleConfirmCreate(), handleTestConnection(), validate(), simulatedChecks() (+1 more)

### Community 85 - "isModified"
Cohesion: 0.49
Nodes (10): isModified(), markTouched(), setField(), showError(), OrganizationInformation(), PlatformConfiguration(), PrimaryAdministrator(), RegionalSettings() (+2 more)

### Community 87 - "isModified"
Cohesion: 0.49
Nodes (10): AuthenticationSecurity(), isModified(), markTouched(), setField(), showError(), LicenseManagement(), NotificationPreferences(), OrganizationAssignment() (+2 more)

### Community 88 - "useEmailVerification.js"
Cohesion: 0.25
Nodes (8): maskEmail(), useEmailVerification(), resend(), EmailVerificationScreen(), confirmEmailVerification(), EmailVerificationError, emailVerificationSlice, initialState

### Community 89 - "NumberField"
Cohesion: 0.36
Nodes (9): NumberField(), PasswordPolicy(), passwordStrength(), SelectField(), isModified(), markTouched(), setField(), showError() (+1 more)

### Community 90 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): rules, react/only-export-components, react/rules-of-hooks, $schema, warn

### Community 91 - "nodeLibrary.api.js"
Cohesion: 0.17
Nodes (19): CreateCustomNodeModal(), NodeFilterToolbar(), useNodeLibrary(), CATEGORY_OPTIONS, CERTIFICATION_OPTIONS, COMPATIBILITY_OPTIONS, CONNECTOR_TYPE_OPTIONS, createCustomNode() (+11 more)

### Community 92 - "visualPipelineBuilder.api.js"
Cohesion: 0.20
Nodes (15): ICON_MAP, useVisualPipelineBuilder(), executePipelineRun(), fetchPipelineBuilderGraph(), INITIAL_CONSOLE_LOGS, INITIAL_PIPELINE_EDGES, INITIAL_PIPELINE_NODES, INITIAL_VALIDATION_ITEMS (+7 more)

### Community 93 - "userProfile.api.js"
Cohesion: 0.36
Nodes (6): useMyProfile(), UserProfileScreen(), buildBaseline(), getMyProfile(), PROFILE_OPTIONS, UserProfileError

### Community 94 - "AppShell"
Cohesion: 0.11
Nodes (21): AddDestinationScreen(), DESTINATION_TYPES, INITIAL_FORM, createDestination(), DestinationError, ORG_ID, testConnection(), validateDestination() (+13 more)

### Community 95 - "destinationConfiguration.api.js"
Cohesion: 0.28
Nodes (11): useDestinationConfiguration(), DestinationConfigurationScreen(), AUTH_METHODS, DEFAULT_DESTINATION_CONFIG, DestinationConfigError, ENVIRONMENTS, getDestinationConfiguration(), ORG_ID (+3 more)

### Community 96 - "setField"
Cohesion: 0.29
Nodes (7): markTouched(), setField(), showError(), PermissionInheritance(), RoleAssignmentRules(), RoleInformation(), slugifyKey()

### Community 97 - "MatrixPanel"
Cohesion: 0.33
Nodes (3): MatrixPanel(), buildCellDetail(), sourceFor()

### Community 98 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 99 - "ConfirmDialog"
Cohesion: 0.67
Nodes (4): ConfirmDialog(), getFocusable(), handleKeyDown(), formatRows()

### Community 100 - "apiFetch"
Cohesion: 0.16
Nodes (26): confirmPasswordReset(), login(), logout(), requestPasswordReset(), resendTwoFactorCode(), resendVerificationEmail(), verifyTwoFactorCode(), createDataSource() (+18 more)

### Community 101 - "getPermissionMatrix"
Cohesion: 0.67
Nodes (3): usePermissionMatrix(), PermissionMatrixScreen(), getPermissionMatrix()

### Community 102 - "destinationHealthMonitoring.api.js"
Cohesion: 0.24
Nodes (11): useDestinationHealthMonitoring(), DestinationHealthMonitoringScreen(), acknowledgeDestinationAlert(), DEFAULT_DESTINATION_HEALTH_DATA, DestinationHealthError, getDestinationHealth(), HEALTH_STATUS_OPTIONS, ORG_ID (+3 more)

### Community 103 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 105 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 106 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 107 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 108 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 109 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 110 - "DetailPanel"
Cohesion: 1.00
Nodes (3): DetailPanel(), getFocusable(), handleKeyDown()

### Community 111 - "ConfirmDialog"
Cohesion: 1.00
Nodes (3): ConfirmDialog(), getFocusable(), handleKeyDown()

### Community 114 - "VisualPipelineBuilderScreen.jsx"
Cohesion: 0.18
Nodes (9): BuilderHeader(), BuilderSubheader(), ExecutionConsole(), NodeConfigPanel(), NodeLibraryPanel(), CATEGORY_COLORS, NODE_ICON_MAP, PipelineCanvas() (+1 more)

### Community 119 - "useChangePassword.js"
Cohesion: 0.22
Nodes (9): useChangePassword(), submit(), validate(), ChangePasswordScreen(), handleSubmit(), changePassword(), ChangePasswordError, changePasswordSlice (+1 more)

### Community 120 - "Sidebar.jsx"
Cohesion: 0.19
Nodes (5): NAV_ICONS, DEFAULT_BADGES, Sidebar(), SidebarToggleIcon(), useVisibleNav()

### Community 121 - "router.jsx"
Cohesion: 0.25
Nodes (8): useBootstrap(), run(), SplashScreen(), checkConnectivity(), loadPlatformConfig(), restoreSession(), SourceNodeConfigScreen(), RoutePlaceholder()

### Community 122 - "AppShell.jsx"
Cohesion: 0.22
Nodes (5): DEFAULT_STATS, Footer(), ROLES, initialState, sessionSlice

### Community 126 - "NodeDetailDrawer.jsx"
Cohesion: 0.33
Nodes (5): ICON_MAP, NodeDetailDrawer(), TABS, ICON_MAP, NodeSchematicPreview()

### Community 127 - "executionStats.api.js"
Cohesion: 0.47
Nodes (4): useExecutionStats(), ExecutionStatsError, getExecutionStats(), MOCK_EXECUTION_STATS

### Community 128 - "dashboard.api.js"
Cohesion: 0.38
Nodes (5): useDashboardSummary(), DashboardScreen(), DashboardError, getDashboardSummary(), MOCK_SUMMARY

## Knowledge Gaps
- **402 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+397 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ApiConnectorSetupScreen.jsx`, `FtpConnectionScreen.jsx`, `ConnectionTestResultScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `UserLoginHistoryScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserProfileScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DataQualityScreen.jsx`, `DataSourceListScreen.jsx`, `DestinationListScreen.jsx`, `RoleListScreen.jsx`, `OrganizationActivityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `AddUserScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `SourceHealthScreen.jsx`, `AddDataSourceScreen.jsx`, `OrganizationSettingsScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `ExcelUploadScreen.jsx`, `EditUserScreen.jsx`, `TeamManagementScreen.jsx`, `CreateOrganizationScreen.jsx`, `UserListScreen.jsx`, `DepartmentManagementScreen.jsx`, `AccessControlSettingsScreen.jsx`, `SftpConnectionScreen.jsx`, `CsvUploadScreen.jsx`, `EditRoleScreen.jsx`, `WebhookConfigurationScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `CreateRoleScreen.jsx`, `PermissionMatrixScreen.jsx`, `useAppDispatch`, `EditOrganizationScreen.jsx`, `sourceNodeConfig.api.js`, `index.js`, `useResetPasswordConfirm.js`, `permissions.js`, `OrganizationListScreen.jsx`, `Header.jsx`, `destinationHistory.api.js`, `useLogin`, `destinationConnectionTest.api.js`, `NodeCatalogGrid.jsx`, `pipelineList.api.js`, `NodeLibraryScreen.jsx`, `useTwoFactor.js`, `useEmailVerification.js`, `nodeLibrary.api.js`, `visualPipelineBuilder.api.js`, `AppShell`, `destinationConfiguration.api.js`, `destinationHealthMonitoring.api.js`, `VisualPipelineBuilderScreen.jsx`, `useChangePassword.js`, `Sidebar.jsx`, `router.jsx`, `AppShell.jsx`, `NodeDetailDrawer.jsx`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell` to `ApiConnectorSetupScreen.jsx`, `FtpConnectionScreen.jsx`, `ConnectionTestResultScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `UserLoginHistoryScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserProfileScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DataQualityScreen.jsx`, `DataSourceListScreen.jsx`, `DestinationListScreen.jsx`, `RoleListScreen.jsx`, `OrganizationActivityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `AddUserScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `SourceHealthScreen.jsx`, `AddDataSourceScreen.jsx`, `OrganizationSettingsScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `ExcelUploadScreen.jsx`, `EditUserScreen.jsx`, `OrganizationDetailsScreen.jsx`, `TeamManagementScreen.jsx`, `CreateOrganizationScreen.jsx`, `UserListScreen.jsx`, `DepartmentManagementScreen.jsx`, `AccessControlSettingsScreen.jsx`, `SftpConnectionScreen.jsx`, `CsvUploadScreen.jsx`, `EditRoleScreen.jsx`, `UserDetailsScreen.jsx`, `react`, `WebhookConfigurationScreen.jsx`, `SourceConnectionSetupScreen.jsx`, `CreateRoleScreen.jsx`, `PermissionMatrixScreen.jsx`, `EditOrganizationScreen.jsx`, `DashboardScreen.jsx`, `OrganizationListScreen.jsx`, `destinationHistory.api.js`, `destinationConnectionTest.api.js`, `pipelineList.api.js`, `NodeLibraryScreen.jsx`, `destinationConfiguration.api.js`, `destinationHealthMonitoring.api.js`, `VisualPipelineBuilderScreen.jsx`, `router.jsx`, `AppShell.jsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `apiFetch()` connect `apiFetch` to `dashboard.api.js`, `ApiConnectorSetupScreen.jsx`, `ConnectionTestResultScreen.jsx`, `DatabaseConnectorSetupScreen.jsx`, `FtpConnectionScreen.jsx`, `UserActivityHistoryScreen.jsx`, `UserLoginHistoryScreen.jsx`, `UserPermissionManagementScreen.jsx`, `DataQualityScreen.jsx`, `DataSourceListScreen.jsx`, `DestinationListScreen.jsx`, `RoleListScreen.jsx`, `OrganizationActivityScreen.jsx`, `ExecutiveDashboardScreen.jsx`, `PipelineOverviewScreen.jsx`, `SourceHealthMonitoringScreen.jsx`, `AddUserScreen.jsx`, `PerformanceAnalyticsScreen.jsx`, `RealTimeMonitoringScreen.jsx`, `DestinationHealthScreen.jsx`, `ExecutionStatisticsScreen.jsx`, `SourceHealthScreen.jsx`, `AddDataSourceScreen.jsx`, `OrganizationSettingsScreen.jsx`, `ErrorAnalyticsScreen.jsx`, `SystemHealthScreen.jsx`, `OrganizationDetailsScreen.jsx`, `TeamManagementScreen.jsx`, `UserListScreen.jsx`, `DepartmentManagementScreen.jsx`, `UserDetailsScreen.jsx`, `excelUpload.api.js`, `csvUpload.api.js`, `sourceNodeConfig.api.js`, `EditForm`, `SettingsForm`, `createRole.api.js`, `OrganizationListScreen.jsx`, `permissionMatrix.api.js`, `Header.jsx`, `client.js`, `ProfileForm`, `webhookConfiguration.api.js`, `editRole.api.js`, `destinationHistory.api.js`, `destinationConnectionTest.api.js`, `editOrganization.api.js`, `accessControlSettings.api.js`, `WebhookConfigurationScreen`, `sftpConnection.api.js`, `EditForm`, `pipelineList.api.js`, `EditForm`, `SftpConnectionScreen`, `useEmailVerification.js`, `nodeLibrary.api.js`, `userProfile.api.js`, `AppShell`, `destinationConfiguration.api.js`, `getPermissionMatrix`, `destinationHealthMonitoring.api.js`, `useChangePassword.js`, `router.jsx`, `executionStats.api.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `SettingsForm()` (e.g. with `isModified()` and `markTouched()`) actually correct?**
  _`SettingsForm()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _402 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ApiConnectorSetupScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051923076923076926 - nodes in this community are weakly interconnected._
- **Should `FtpConnectionScreen.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05201636469900643 - nodes in this community are weakly interconnected._