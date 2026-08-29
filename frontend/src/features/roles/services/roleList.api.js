/**
 * Data loader for the Role List Screen (SCR-040, node 113:17935, Figma
 * page "Page 1", frame "Role Management").
 *
 * MOCK BOUNDARY: MOD-003 (RBAC & Permissions) is still `PLANNED` with no
 * backend deployed — no `Role`, `Permission`, `RolePermission`, or
 * `UserRole` endpoint exists yet (see docs/modules/module-plan.md).
 * `getRoles` always attempts a real GET first and only falls back to the
 * design-sourced baseline below when the endpoint is unreachable / returns
 * non-JSON (defends against the Vite dev server's own 200-OK HTML SPA
 * fallback, mirroring the sibling users/*.api.js modules). Results are
 * flagged `mocked: true` so the UI can disclose that the data is sample
 * data, not persisted records.
 *
 * FIGMA VERIFICATION: node 113:17935 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata text-node extraction). The
 * header (breadcrumb Administration › Roles, title "Role Management",
 * subtitle, Export Roles / Compare Roles / + Create Role actions), the 6
 * KPI cards (Total Roles 14, System Roles 9, Custom Roles 5, Active
 * Assignments 1,284, Administrative Roles 3, Unused Roles 2), the toolbar
 * (search, All Types / All Status / All Levels / All filters, sort by Role
 * Name, Columns, Clear Filters), the bulk-action bar, all 14 table rows
 * (name, description, role type, permission groups, assigned users,
 * privilege level, status, last updated, updated by), and the footer
 * pagination are transcribed from the actual frame's text nodes, so
 * layout/content fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * A real MOD-003 backend would serve the persisted, org-scoped role
 * catalogue with computed assignment counts and audit metadata.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class RoleListError extends Error {}

/** Filter option catalogues (node 113:17935 toolbar dropdowns). */
export const ROLE_TYPE_OPTIONS = ['All Types', 'System', 'Custom'];
export const ROLE_STATUS_OPTIONS = ['All Status', 'Active', 'Deprecated'];
export const PRIVILEGE_LEVEL_OPTIONS = [
  'All Levels',
  'Full Administrative',
  'Administrative',
  'Elevated',
  'Standard',
  'Read Only',
];
export const ROLE_SORT_OPTIONS = [
  'Role Name',
  'Assigned Users',
  'Privilege Level',
  'Last Updated',
];

/**
 * Permission-group filter options (node 113:17935 toolbar "All"
 * dropdown). Derived from the distinct permission groups across the
 * baseline catalogue below; a real MOD-003 backend would expose the
 * org's permission-group taxonomy.
 */
export const PERMISSION_GROUP_OPTIONS = [
  'All Groups',
  'All Permissions',
  'Org Management',
  'User Management',
  'Billing',
  'Security',
  'Audit',
  'Department Management',
  'Team Management',
  'Reporting',
  'Dashboards',
  'Pipelines',
  'Connectors',
  'Data Sources',
  'Monitoring',
  'Schedulers',
  'Compliance',
  'Testing',
  'API Tokens',
  'Pipelines (Legacy)',
];

/**
 * Design-sourced baseline role list (node 113:17935). A real MOD-003
 * endpoint would return the persisted, org-scoped catalogue.
 */
export const MOCK_ROLE_LIST = {
  updatedAt: 'Aug 28, 2025',
  organizationName: 'Acme Corporation',
  kpis: [
    { key: 'total', label: 'Total Roles', value: '14', tone: 'default' },
    { key: 'system', label: 'System Roles', value: '9', tone: 'info' },
    { key: 'custom', label: 'Custom Roles', value: '5', tone: 'accent' },
    { key: 'assignments', label: 'Active Assignments', value: '1,284', tone: 'success' },
    { key: 'admin', label: 'Administrative Roles', value: '3', tone: 'warning' },
    { key: 'unused', label: 'Unused Roles', value: '2', tone: 'danger' },
  ],
  total: 14,
  rows: [
    {
      id: 'role_super_admin',
      name: 'Super Administrator',
      description: 'Unrestricted access to all platform resources, settings, and administrative functions.',
      type: 'System',
      permissionGroups: ['All Permissions'],
      assignedUsers: 2,
      assignedDepartments: 0,
      assignedTeams: 0,
      privilegeLevel: 'Full Administrative',
      status: 'Active',
      lastUpdated: 'Jul 30, 2025',
      updatedBy: 'System',
    },
    {
      id: 'role_org_admin',
      name: 'Organization Administrator',
      description: 'Manages organization settings, users, billing, and platform configuration.',
      type: 'System',
      permissionGroups: ['Org Management', 'User Management', 'Billing'],
      assignedUsers: 4,
      assignedDepartments: 1,
      assignedTeams: 0,
      privilegeLevel: 'Administrative',
      status: 'Active',
      lastUpdated: 'Jul 28, 2025',
      updatedBy: 'Sarah Kim',
    },
    {
      id: 'role_sec_admin',
      name: 'Security Administrator',
      description: 'Manages security policies, MFA, audit access, and compliance controls.',
      type: 'System',
      permissionGroups: ['Security', 'Audit', 'User Management'],
      assignedUsers: 3,
      assignedDepartments: 0,
      assignedTeams: 0,
      privilegeLevel: 'Administrative',
      status: 'Active',
      lastUpdated: 'Jul 25, 2025',
      updatedBy: 'Sarah Kim',
    },
    {
      id: 'role_dept_manager',
      name: 'Department Manager',
      description: 'Manages department users, resources, and reporting within assigned departments.',
      type: 'System',
      permissionGroups: ['Department Management', 'Reporting'],
      assignedUsers: 18,
      assignedDepartments: 6,
      assignedTeams: 0,
      privilegeLevel: 'Elevated',
      status: 'Active',
      lastUpdated: 'Jul 22, 2025',
      updatedBy: 'Michael Chen',
    },
    {
      id: 'role_team_lead',
      name: 'Team Lead',
      description: 'Manages team pipelines, members, and dashboards within assigned teams.',
      type: 'System',
      permissionGroups: ['Team Management', 'Pipelines'],
      assignedUsers: 42,
      assignedDepartments: 0,
      assignedTeams: 14,
      privilegeLevel: 'Elevated',
      status: 'Active',
      lastUpdated: 'Jul 20, 2025',
      updatedBy: 'Michael Chen',
    },
    {
      id: 'role_data_engineer',
      name: 'Data Engineer',
      description: 'Builds, configures, and executes ETL pipelines and manages connectors.',
      type: 'System',
      permissionGroups: ['Pipelines', 'Connectors', 'Data Sources'],
      assignedUsers: 156,
      assignedDepartments: 4,
      assignedTeams: 22,
      privilegeLevel: 'Standard',
      status: 'Active',
      lastUpdated: 'Jul 18, 2025',
      updatedBy: 'System',
    },
    {
      id: 'role_data_analyst',
      name: 'Data Analyst',
      description: 'Analyzes data, builds dashboards, and generates reports across assigned resources.',
      type: 'System',
      permissionGroups: ['Reporting', 'Dashboards', 'Data Sources'],
      assignedUsers: 203,
      assignedDepartments: 5,
      assignedTeams: 28,
      privilegeLevel: 'Standard',
      status: 'Active',
      lastUpdated: 'Jul 15, 2025',
      updatedBy: 'System',
    },
    {
      id: 'role_ops_engineer',
      name: 'Operations Engineer',
      description: 'Schedules and monitors operational pipelines, jobs, and platform health.',
      type: 'System',
      permissionGroups: ['Pipelines', 'Monitoring', 'Schedulers'],
      assignedUsers: 87,
      assignedDepartments: 2,
      assignedTeams: 11,
      privilegeLevel: 'Standard',
      status: 'Active',
      lastUpdated: 'Jul 12, 2025',
      updatedBy: 'System',
    },
    {
      id: 'role_auditor',
      name: 'Auditor',
      description: 'Read-only access to audit trails, compliance reports, and security logs.',
      type: 'System',
      permissionGroups: ['Audit', 'Compliance'],
      assignedUsers: 6,
      assignedDepartments: 0,
      assignedTeams: 0,
      privilegeLevel: 'Read Only',
      status: 'Active',
      lastUpdated: 'Jul 10, 2025',
      updatedBy: 'Sarah Kim',
    },
    {
      id: 'role_business_user',
      name: 'Business User',
      description: 'View-only access to assigned dashboards, reports, and shared data sets.',
      type: 'System',
      permissionGroups: ['Dashboards', 'Reporting'],
      assignedUsers: 512,
      assignedDepartments: 8,
      assignedTeams: 0,
      privilegeLevel: 'Read Only',
      status: 'Active',
      lastUpdated: 'Jul 08, 2025',
      updatedBy: 'System',
    },
    {
      id: 'role_senior_data_engineer',
      name: 'Senior Data Engineer',
      description: 'Extended pipeline and connector management with data source configuration authority.',
      type: 'Custom',
      permissionGroups: ['Pipelines', 'Connectors', 'Data Sources', 'API Tokens'],
      assignedUsers: 34,
      assignedDepartments: 2,
      assignedTeams: 8,
      privilegeLevel: 'Elevated',
      status: 'Active',
      lastUpdated: 'Aug 02, 2025',
      updatedBy: 'Michael Chen',
    },
    {
      id: 'role_qa_automation',
      name: 'QA Automation Engineer',
      description: 'Executes test pipelines, manages test data sources, and reviews validation results.',
      type: 'Custom',
      permissionGroups: ['Pipelines', 'Testing', 'Data Sources'],
      assignedUsers: 11,
      assignedDepartments: 1,
      assignedTeams: 3,
      privilegeLevel: 'Standard',
      status: 'Active',
      lastUpdated: 'Aug 05, 2025',
      updatedBy: 'Michael Chen',
    },
    {
      id: 'role_compliance_reviewer',
      name: 'Compliance Reviewer',
      description: 'Reviews compliance reports and approves data handling policies. No active assignments.',
      type: 'Custom',
      permissionGroups: ['Compliance', 'Audit'],
      assignedUsers: 0,
      assignedDepartments: 0,
      assignedTeams: 0,
      privilegeLevel: 'Read Only',
      status: 'Active',
      lastUpdated: 'Jun 15, 2025',
      updatedBy: 'Sarah Kim',
      unused: true,
    },
    {
      id: 'role_legacy_pipeline_operator',
      name: 'Legacy Pipeline Operator',
      description: 'Deprecated role for legacy pipeline execution. Scheduled for removal.',
      type: 'Custom',
      permissionGroups: ['Pipelines (Legacy)'],
      assignedUsers: 0,
      assignedDepartments: 0,
      assignedTeams: 0,
      privilegeLevel: 'Standard',
      status: 'Deprecated',
      lastUpdated: 'Mar 20, 2025',
      updatedBy: 'System',
      unused: true,
    },
  ],
};

/**
 * Load the org's role catalogue. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getRoles(orgId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.type && filters.type !== 'All Types') params.set('type', filters.type);
  if (filters.status && filters.status !== 'All Status') params.set('status', filters.status);
  if (filters.level && filters.level !== 'All Levels') params.set('level', filters.level);
  if (filters.sort) params.set('sort', filters.sort);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/roles${query}`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new RoleListError('Unable to load roles right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.rows)) {
      throw new RoleListError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_ROLE_LIST, mocked: true };
  }
}
