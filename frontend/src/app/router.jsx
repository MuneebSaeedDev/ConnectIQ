import { createBrowserRouter } from 'react-router-dom';
import SplashScreen from '../features/bootstrap/pages/SplashScreen';
import LoginScreen from '../features/auth/pages/LoginScreen';
// import SignupScreen from '../features/auth/pages/SignupScreen';
import ResetPasswordScreen from '../features/auth/pages/ResetPasswordScreen';
import ForgetPasswordScreen from '../features/auth/pages/ForgetPasswordScreen';
import EmailVerificationScreen from '../features/auth/pages/EmailVerificationScreen';
import TwoFactorAuthenticationScreen from '../features/auth/pages/TwoFactorAuthenticationScreen';
import ChangePasswordScreen from '../features/settings/pages/ChangePasswordScreen';
import ProfileSettingsScreen from '../features/settings/pages/ProfileSettingsScreen';
import PreferencesSettingsScreen from '../features/settings/pages/PreferencesSettingsScreen';
import NotificationsSettingsScreen from '../features/settings/pages/NotificationsSettingsScreen';
import TwoFactorSettingsScreen from '../features/settings/pages/TwoFactorSettingsScreen';
import ActiveSessionsSettingsScreen from '../features/settings/pages/ActiveSessionsSettingsScreen';
import TeamMembersSettingsScreen from '../features/settings/pages/TeamMembersSettingsScreen';
import IntegrationsSettingsScreen from '../features/settings/pages/IntegrationsSettingsScreen';
import ApiKeysSettingsScreen from '../features/settings/pages/ApiKeysSettingsScreen';
import AuditLogsSettingsScreen from '../features/settings/pages/AuditLogsSettingsScreen';
import LogoutScreen from '../features/auth/pages/LogoutScreen';
import DashboardScreen from '../features/dashboard/pages/DashboardScreen';
import ExecutiveDashboardScreen from '../features/dashboard/pages/ExecutiveDashboardScreen';
import PipelineOverviewScreen from '../features/dashboard/pages/PipelineOverviewScreen';
import DataQualityScreen from '../features/dashboard/pages/DataQualityScreen';
import SystemHealthScreen from '../features/dashboard/pages/SystemHealthScreen';
import SourceHealthScreen from '../features/dashboard/pages/SourceHealthScreen';
import DestinationHealthScreen from '../features/dashboard/pages/DestinationHealthScreen';
import ExecutionStatisticsScreen from '../features/dashboard/pages/ExecutionStatisticsScreen';
import ErrorAnalyticsScreen from '../features/dashboard/pages/ErrorAnalyticsScreen';
import PerformanceAnalyticsScreen from '../features/dashboard/pages/PerformanceAnalyticsScreen';
import RealTimeMonitoringScreen from '../features/dashboard/pages/RealTimeMonitoringScreen';
import RoutePlaceholder from '../features/placeholder/pages/RoutePlaceholder';
import OrganizationListScreen from '../features/organizations/pages/OrganizationListScreen';
import OrganizationDetailsScreen from '../features/organizations/pages/OrganizationDetailsScreen';
import CreateOrganizationScreen from '../features/organizations/pages/CreateOrganizationScreen';
import EditOrganizationScreen from '../features/organizations/pages/EditOrganizationScreen';
import OrganizationSettingsScreen from '../features/organizations/pages/OrganizationSettingsScreen';
import DepartmentManagementScreen from '../features/organizations/pages/DepartmentManagementScreen';
import TeamManagementScreen from '../features/organizations/pages/TeamManagementScreen';
import OrganizationActivityScreen from '../features/organizations/pages/OrganizationActivityScreen';
import UserListScreen from '../features/users/pages/UserListScreen';
import AddUserScreen from '../features/users/pages/AddUserScreen';
import EditUserScreen from '../features/users/pages/EditUserScreen';
import UserDetailsScreen from '../features/users/pages/UserDetailsScreen';
import UserProfileScreen from '../features/users/pages/UserProfileScreen';
import UserActivityHistoryScreen from '../features/users/pages/UserActivityHistoryScreen';
import UserLoginHistoryScreen from '../features/users/pages/UserLoginHistoryScreen';
import UserPermissionManagementScreen from '../features/users/pages/UserPermissionManagementScreen';
import RoleListScreen from '../features/roles/pages/RoleListScreen';
import EditRoleScreen from '../features/roles/pages/EditRoleScreen';
import CreateRoleScreen from '../features/roles/pages/CreateRoleScreen';
import PermissionMatrixScreen from '../features/roles/pages/PermissionMatrixScreen';
import AccessControlSettingsScreen from '../features/roles/pages/AccessControlSettingsScreen';
import DataSourceListScreen from '../features/dataSources/pages/DataSourceListScreen';
import AddDataSourceScreen from '../features/dataSources/pages/AddDataSourceScreen';
import EditDataSourceScreen from '../features/dataSources/pages/EditDataSourceScreen';
import ApiConnectorSetupScreen from '../features/dataSources/pages/ApiConnectorSetupScreen';
import DatabaseConnectorSetupScreen from '../features/dataSources/pages/DatabaseConnectorSetupScreen';
import SourceConnectionSetupScreen from '../features/dataSources/pages/SourceConnectionSetupScreen';
import CsvUploadScreen from '../features/dataSources/pages/CsvUploadScreen';
import ExcelUploadScreen from '../features/dataSources/pages/ExcelUploadScreen';
import FtpConnectionScreen from '../features/dataSources/pages/FtpConnectionScreen';
import WebhookConfigurationScreen from '../features/dataSources/pages/WebhookConfigurationScreen';
import SftpConnectionScreen from '../features/dataSources/pages/SftpConnectionScreen';
import ConnectionTestResultScreen from '../features/dataSources/pages/ConnectionTestResultScreen';
import SourceHealthMonitoringScreen from '../features/dataSources/pages/SourceHealthMonitoringScreen';
import DestinationListScreen from '../features/destinations/pages/DestinationListScreen';
import AddDestinationScreen from '../features/destinations/pages/AddDestinationScreen';
import DestinationConnectionTestScreen from '../features/destinations/pages/DestinationConnectionTestScreen';
import DestinationConfigurationScreen from '../features/destinations/pages/DestinationConfigurationScreen';
import DestinationHealthMonitoringScreen from '../features/destinations/pages/DestinationHealthMonitoringScreen';
import DestinationHistoryScreen from '../features/destinations/pages/DestinationHistoryScreen';
import CreatePipelineScreen from '../features/pipelines/pages/CreatePipelineScreen';
import PipelineListScreen from '../features/pipelines/pages/PipelineListScreen';
import PipelineDetailScreen from '../features/pipelines/pages/PipelineDetailScreen';
import VisualPipelineBuilderScreen from '../features/pipelines/pages/VisualPipelineBuilderScreen';
import NodeLibraryScreen from '../features/pipelines/pages/NodeLibraryScreen';
import SourceNodeConfigScreen from '../features/pipelines/pages/SourceNodeConfigScreen';
import FilterNodeConfigScreen from '../features/pipelines/pages/FilterNodeConfigScreen';
import MappingNodeConfigScreen from '../features/pipelines/pages/MappingNodeConfigScreen';
import TransformationNodeConfigScreen from '../features/pipelines/pages/TransformationNodeConfigScreen';
import ValidationNodeConfigScreen from '../features/pipelines/pages/ValidationNodeConfigScreen';
import MergeNodeConfigScreen from '../features/pipelines/pages/MergeNodeConfigScreen';
import DestinationNodeConfigScreen from '../features/pipelines/pages/DestinationNodeConfigScreen';
import PipelineSettingsScreen from '../features/pipelines/pages/PipelineSettingsScreen';
import PipelineVersionHistoryScreen from '../features/pipelines/pages/PipelineVersionHistoryScreen';
import PipelineTemplateLibraryScreen from '../features/pipelines/pages/PipelineTemplateLibraryScreen';
import PipelineScheduleScreen from '../features/pipelines/pages/PipelineScheduleScreen';
import PipelineParametersScreen from '../features/pipelines/pages/PipelineParametersScreen';
import PipelineReviewScreen from '../features/pipelines/pages/PipelineReviewScreen';
import PipelineTestExecutionScreen from '../features/pipelines/pages/PipelineTestExecutionScreen';
import NotificationsCenterScreen from '../features/notifications/pages/NotificationsCenterScreen';
import HelpCenterScreen from '../features/help/pages/HelpCenterScreen';
import ContactSupportScreen from '../features/help/pages/ContactSupportScreen';
import AppShell from '../features/shell/components/AppShell.jsx';

// Every route below renders inside the real shared AppShell (MOD-001
// — Header/Sidebar/Footer, see features/shell/components/AppShell.jsx)
// with a route-appropriate breadcrumb, wrapping a RoutePlaceholder
// since the destination screens themselves are still PLANNED per
// docs/figma/screen-inventory.md. This keeps every Sidebar nav item
// (see features/shell/rbac/navConfig.js) landing on a real, shell-
// wrapped page instead of a dead link, without fabricating the
// screens' real content ahead of their own frontend-screen-builder
// pass.
function shellRoute(screenId, title, breadcrumb) {
  return (
    <AppShell breadcrumb={breadcrumb}>
      <RoutePlaceholder screenId={screenId} title={title} />
    </AppShell>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <SplashScreen /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/reset-password', element: <ResetPasswordScreen /> },
  { path: '/forgot-password', element: <ForgetPasswordScreen /> },
  { path: '/verify-email', element: <EmailVerificationScreen /> },
  { path: '/2fa', element: <TwoFactorAuthenticationScreen /> },
  { path: '/account/profile', element: <ProfileSettingsScreen /> },
  { path: '/account/preferences', element: <PreferencesSettingsScreen /> },
  { path: '/account/notifications', element: <NotificationsSettingsScreen /> },
  { path: '/account/change-password', element: <ChangePasswordScreen /> },
  { path: '/account/two-factor', element: <TwoFactorSettingsScreen /> },
  { path: '/account/active-sessions', element: <ActiveSessionsSettingsScreen /> },
  { path: '/account/team-members', element: <TeamMembersSettingsScreen /> },
  { path: '/account/integrations', element: <IntegrationsSettingsScreen /> },
  { path: '/account/api-keys', element: <ApiKeysSettingsScreen /> },
  { path: '/account/audit-logs', element: <AuditLogsSettingsScreen /> },
  { path: '/logout', element: <LogoutScreen /> },
  { path: '/profile', element: <UserProfileScreen /> },
  { path: '/dashboard', element: <DashboardScreen /> },
  { path: '/notifications', element: <NotificationsCenterScreen /> },
  { path: '/help', element: <HelpCenterScreen /> },
  { path: '/support/help', element: <HelpCenterScreen /> },
  { path: '/docs', element: <HelpCenterScreen /> },
  { path: '/support/contact', element: <ContactSupportScreen /> },
  { path: '/support', element: <ContactSupportScreen /> },
  { path: '/help/release-notes', element: <HelpCenterScreen /> },
  { path: '/release-notes', element: <HelpCenterScreen /> },

  // Data
  { path: '/data-sources', element: <DataSourceListScreen /> },
  { path: '/data-sources/new', element: <AddDataSourceScreen /> },
  { path: '/data-sources/:id/edit', element: <EditDataSourceScreen /> },
  { path: '/data-sources/new/connection', element: <SourceConnectionSetupScreen /> },
  { path: '/data-sources/new/database', element: <DatabaseConnectorSetupScreen /> },
  { path: '/data-sources/new/api', element: <ApiConnectorSetupScreen /> },
  { path: '/data-sources/new/csv', element: <CsvUploadScreen /> },
  { path: '/data-sources/new/excel', element: <ExcelUploadScreen /> },
  { path: '/data-sources/new/ftp', element: <FtpConnectionScreen /> },
  { path: '/data-sources/new/sftp', element: <SftpConnectionScreen /> },
  { path: '/data-sources/new/webhook', element: <WebhookConfigurationScreen /> },
  { path: '/data-sources/new/test-result', element: <ConnectionTestResultScreen /> },
  { path: '/data-sources/:id/health', element: <SourceHealthMonitoringScreen /> },
  { path: '/destinations', element: <DestinationListScreen /> },
  { path: '/destinations/new', element: <AddDestinationScreen /> },
  { path: '/destinations/new/test', element: <DestinationConnectionTestScreen /> },
  { path: '/destinations/:id/configure', element: <DestinationConfigurationScreen /> },
  { path: '/destinations/:id/health', element: <DestinationHealthMonitoringScreen /> },
  { path: '/destinations/:id/history', element: <DestinationHistoryScreen /> },
  { path: '/destinations/history', element: <DestinationHistoryScreen /> },

  // Pipelines
  { path: '/pipelines', element: <PipelineListScreen /> },
  { path: '/pipelines/new', element: <CreatePipelineScreen /> },
  { path: '/pipelines/:id', element: <PipelineDetailScreen /> },
  { path: '/pipelines/:id/details', element: <PipelineDetailScreen /> },
  { path: '/pipelines/:id/settings', element: <PipelineSettingsScreen /> },
  { path: '/pipelines/settings', element: <PipelineSettingsScreen /> },
  { path: '/pipelines/:id/history', element: <PipelineVersionHistoryScreen /> },
  { path: '/pipelines/history', element: <PipelineVersionHistoryScreen /> },
  { path: '/pipelines/templates', element: <PipelineTemplateLibraryScreen /> },
  { path: '/pipelines/library/templates', element: <PipelineTemplateLibraryScreen /> },
  { path: '/pipelines/:id/builder', element: <VisualPipelineBuilderScreen /> },
  { path: '/pipelines/builder', element: <VisualPipelineBuilderScreen /> },
  { path: '/pipelines/nodes', element: <NodeLibraryScreen /> },
  { path: '/pipelines/library/nodes', element: <NodeLibraryScreen /> },
  { path: '/pipelines/builder/nodes', element: <NodeLibraryScreen /> },
  { path: '/pipelines/library', element: <NodeLibraryScreen /> },
  { path: '/pipelines/new/source', element: <SourceNodeConfigScreen /> },
  { path: '/pipelines/nodes/source', element: <SourceNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/source', element: <SourceNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/source', element: <SourceNodeConfigScreen /> },
  { path: '/pipelines/builder/source', element: <SourceNodeConfigScreen /> },
  { path: '/pipelines/new/filter', element: <FilterNodeConfigScreen /> },
  { path: '/pipelines/nodes/filter', element: <FilterNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/filter', element: <FilterNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/filter', element: <FilterNodeConfigScreen /> },
  { path: '/pipelines/builder/filter', element: <FilterNodeConfigScreen /> },
  { path: '/pipelines/new/mapping', element: <MappingNodeConfigScreen /> },
  { path: '/pipelines/nodes/mapping', element: <MappingNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/mapping', element: <MappingNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/mapping', element: <MappingNodeConfigScreen /> },
  { path: '/pipelines/builder/mapping', element: <MappingNodeConfigScreen /> },
  { path: '/pipelines/new/transformation', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/nodes/transformation', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/transformation', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/transformation', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/builder/transformation', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/new/validation', element: <ValidationNodeConfigScreen /> },
  { path: '/pipelines/nodes/validation', element: <ValidationNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/validation', element: <ValidationNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/validation', element: <ValidationNodeConfigScreen /> },
  { path: '/pipelines/builder/validation', element: <ValidationNodeConfigScreen /> },
  { path: '/pipelines/new/merge', element: <MergeNodeConfigScreen /> },
  { path: '/pipelines/nodes/merge', element: <MergeNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/merge', element: <MergeNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/merge', element: <MergeNodeConfigScreen /> },
  { path: '/pipelines/builder/merge', element: <MergeNodeConfigScreen /> },
  { path: '/pipelines/new/destination', element: <DestinationNodeConfigScreen /> },
  { path: '/pipelines/nodes/destination', element: <DestinationNodeConfigScreen /> },
  { path: '/pipelines/:id/nodes/destination', element: <DestinationNodeConfigScreen /> },
  { path: '/pipelines/builder/nodes/destination', element: <DestinationNodeConfigScreen /> },
  { path: '/pipelines/builder/destination', element: <DestinationNodeConfigScreen /> },
  { path: '/pipelines/new/transformations', element: <TransformationNodeConfigScreen /> },
  { path: '/pipelines/new/schedule', element: <PipelineScheduleScreen /> },
  { path: '/pipelines/new/parameters', element: <PipelineParametersScreen /> },
  { path: '/pipelines/new/review', element: <PipelineReviewScreen /> },
  { path: '/pipelines/new/run', element: <PipelineTestExecutionScreen /> },
  { path: '/pipelines/:id/test', element: <PipelineTestExecutionScreen /> },
  { path: '/pipelines/test', element: <PipelineTestExecutionScreen /> },
  { path: '/pipelines/executions', element: <ExecutionStatisticsScreen /> },
  { path: '/executions', element: <ExecutionStatisticsScreen /> },
  { path: '/dashboard/pipelines', element: <PipelineOverviewScreen /> },
  { path: '/dashboard/executions', element: <ExecutionStatisticsScreen /> },
  { path: '/dashboard/realtime', element: <RealTimeMonitoringScreen /> },

  // Operations
  { path: '/operations/workers', element: shellRoute('MOD-008', 'Workers', ['ConnectIQ', 'Operations', 'Workers']) },
  { path: '/operations/queues', element: shellRoute('MOD-008', 'Queues', ['ConnectIQ', 'Operations', 'Queues']) },
  { path: '/dashboard/errors', element: <ErrorAnalyticsScreen /> },
  { path: '/operations/logs', element: shellRoute('MOD-008', 'Logs', ['ConnectIQ', 'Operations', 'Logs']) },

  // Analytics
  { path: '/dashboard/executive', element: <ExecutiveDashboardScreen /> },
  { path: '/dashboard/performance', element: <PerformanceAnalyticsScreen /> },
  { path: '/dashboard/data-quality', element: <DataQualityScreen /> },
  { path: '/dashboard/system-health', element: <SystemHealthScreen /> },
  { path: '/dashboard/source-health', element: <SourceHealthScreen /> },
  { path: '/dashboard/destination-health', element: <DestinationHealthScreen /> },

  // Administration
  { path: '/organizations', element: <OrganizationListScreen /> },
  { path: '/organizations/new', element: <CreateOrganizationScreen /> },
  { path: '/organizations/:id/edit', element: <EditOrganizationScreen /> },
  { path: '/organizations/:id/settings', element: <OrganizationSettingsScreen /> },
  { path: '/organizations/:id/departments', element: <DepartmentManagementScreen /> },
  { path: '/organizations/:id/teams', element: <TeamManagementScreen /> },
  { path: '/organizations/:id/activity', element: <OrganizationActivityScreen /> },
  { path: '/organizations/:id', element: <OrganizationDetailsScreen /> },
  { path: '/users', element: <UserListScreen /> },
  { path: '/users/new', element: <AddUserScreen /> },
  { path: '/users/:id/edit', element: <EditUserScreen /> },
  { path: '/users/:id/activity', element: <UserActivityHistoryScreen /> },
  { path: '/users/:id/login-history', element: <UserLoginHistoryScreen /> },
  { path: '/users/:id/permissions', element: <UserPermissionManagementScreen /> },
  { path: '/users/:id', element: <UserDetailsScreen /> },
  { path: '/organizations/current/teams', element: <TeamManagementScreen /> },
  { path: '/roles', element: <RoleListScreen /> },
  { path: '/roles/new', element: <CreateRoleScreen /> },
  { path: '/roles/permissions', element: <PermissionMatrixScreen /> },
  { path: '/roles/:id/edit', element: <EditRoleScreen /> },
  { path: '/organizations/current/activity', element: <OrganizationActivityScreen /> },
  { path: '/settings/access-control', element: <AccessControlSettingsScreen /> },
]);
