import { createBrowserRouter } from 'react-router-dom';
import SplashScreen from '../features/bootstrap/pages/SplashScreen';
import LoginScreen from '../features/auth/pages/LoginScreen';
import ResetPasswordScreen from '../features/auth/pages/ResetPasswordScreen';
import ForgetPasswordScreen from '../features/auth/pages/ForgetPasswordScreen';
import EmailVerificationScreen from '../features/auth/pages/EmailVerificationScreen';
import TwoFactorAuthenticationScreen from '../features/auth/pages/TwoFactorAuthenticationScreen';
import ChangePasswordScreen from '../features/settings/pages/ChangePasswordScreen';
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
  { path: '/account/change-password', element: <ChangePasswordScreen /> },
  { path: '/logout', element: <LogoutScreen /> },
  { path: '/profile', element: <UserProfileScreen /> },
  { path: '/dashboard', element: <DashboardScreen /> },

  // Data
  { path: '/data-sources', element: <DataSourceListScreen /> },
  { path: '/data-sources/new', element: <AddDataSourceScreen /> },
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
  { path: '/destinations', element: shellRoute('SCR-057', 'Destinations', ['ConnectIQ', 'Data', 'Destinations']) },

  // Pipelines
  { path: '/pipelines', element: shellRoute('SCR-063', 'Pipeline Library', ['ConnectIQ', 'Pipelines', 'Pipeline Library']) },
  { path: '/pipelines/new', element: shellRoute('SCR-064', 'Pipeline Builder — Overview', ['ConnectIQ', 'Pipelines', 'Pipeline Builder']) },
  { path: '/pipelines/new/source', element: shellRoute('SCR-067', 'Pipeline Builder — Source', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Source']) },
  { path: '/pipelines/new/destination', element: shellRoute('SCR-064', 'Pipeline Builder — Destination', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Destination']) },
  { path: '/pipelines/new/transformations', element: shellRoute('SCR-070', 'Pipeline Builder — Transformations', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Transformations']) },
  { path: '/pipelines/new/schedule', element: shellRoute('SCR-064', 'Pipeline Builder — Schedule', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Schedule']) },
  { path: '/pipelines/new/parameters', element: shellRoute('SCR-064', 'Pipeline Builder — Parameters', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Parameters']) },
  { path: '/pipelines/new/review', element: shellRoute('SCR-064', 'Pipeline Builder — Review', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Review']) },
  { path: '/pipelines/new/run', element: shellRoute('SCR-064', 'Pipeline Builder — Run', ['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Run']) },
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
