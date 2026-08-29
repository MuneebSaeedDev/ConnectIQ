/**
 * Data loader + save for the User Permission Management Screen (SCR-039,
 * node 109:16386, Figma page "Page 1", frame "UserPermissionManagement").
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) and MOD-003 (RBAC &
 * Permissions) are both still `PLANNED` with no backend deployed — no
 * `User`, `Role`, `Permission`, `RolePermission`, or per-user permission
 * override endpoint exists yet (see docs/modules/module-plan.md).
 * `getUserPermissions` always attempts a real GET first and only falls
 * back to the design-sourced baseline below when the endpoint is
 * unreachable / returns non-JSON (defends against the Vite dev server's
 * own 200-OK HTML SPA fallback, mirroring the sibling userDetails.api.js
 * / editUser.api.js modules). `saveUserPermissions` attempts a real PUT
 * first and otherwise returns a simulated success. Results are flagged
 * `mocked: true` so the UI can disclose that nothing was really persisted.
 *
 * FIGMA VERIFICATION: node 109:16386 was inspected this session via the
 * Figma MCP (get_design_context text-node extraction + get_screenshot).
 * The header (breadcrumb Administration › Users › John Smith › Permission
 * Management, "Unsaved changes" badge, Cancel / Compare Permissions /
 * Reset Changes / Save Permission Changes actions), the user banner (JS /
 * John Smith / john.smith@acmecorp.com, Current Role Data Engineer,
 * Department Engineering, Team Platform Infra, Account Status Active,
 * License Enterprise Pro, View User Details / View Activity), and every
 * main section (Roles, Permission Groups w/ assigned + available,
 * Effective Permissions matrix across 8 categories, Resource-Level Access
 * table w/ 7 rows, Administrative Privileges w/ 6 toggles, Inherited
 * Access w/ 6 sources) plus the right rail (Effective Access Summary,
 * Security Impact, Validation Status 4/5, Pending Changes 3, Permission
 * Audit) are transcribed from the actual frame's text nodes, so
 * layout/content fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * A real MOD-003/MOD-005 backend would serve the persisted role/group
 * assignments, the computed effective-permission matrix, the resource
 * grants, and the audit metadata for `userId` scoped to the org.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class UserPermissionsError extends Error {}

/** Design-sourced role catalogue (node 109:16386 dropdowns). */
export const PRIMARY_ROLE_OPTIONS = [
  'Data Engineer',
  'Analytics Engineer',
  'Operations Engineer',
  'Organization Administrator',
  'Security Auditor',
  'Read Only',
];

/** Access levels selectable per resource grant. */
export const ACCESS_LEVEL_OPTIONS = ['View', 'Edit', 'Execute', 'Manage', 'Full'];

/**
 * Design-sourced baseline permission record for the viewed user (node
 * 109:16386, "John Smith"). A real MOD-003/MOD-005 endpoint would return
 * the persisted, org-scoped record for `userId`.
 */
function buildBaseline(userId) {
  const id = userId || 'usr_smith';
  return {
    id,
    userId: 'USR-004812',
    name: 'John Smith',
    initials: 'JS',
    email: 'john.smith@acmecorp.com',
    banner: {
      currentRole: 'Data Engineer',
      department: 'Engineering',
      team: 'Platform Infra',
      accountStatus: 'Active',
      license: 'Enterprise Pro',
    },

    // ---- Roles ----
    primaryRole: 'Data Engineer',
    primaryRoleDescription:
      'Can build, configure, and execute ETL pipelines. Manages connectors and data sources within assigned departments.',
    additionalRoles: [{ id: 'ar_ops', label: 'Operations Engineer' }],
    administrativePrivilegesSummary: 'No administrative privileges assigned',

    // ---- Permission groups ----
    assignedGroups: [
      {
        id: 'grp_data_eng',
        name: 'Data Engineering',
        scope: 'Department',
        description:
          'Full access to pipelines, connectors, and data sources within the Engineering department.',
      },
      {
        id: 'grp_ops',
        name: 'Operations',
        scope: 'Organization',
        description:
          'Read and execute access to operational pipelines. Manage schedulers and monitors.',
      },
      {
        id: 'grp_reporting',
        name: 'Reporting',
        scope: 'Department',
        description:
          'View and generate reports. Access dashboards and export data sets.',
      },
    ],
    availableGroups: [
      {
        id: 'grp_org_admin',
        name: 'Organization Administrator',
        scope: 'Organization',
        description:
          'Full administrative control over the entire organization, users, and platform settings.',
      },
      {
        id: 'grp_sec_auditor',
        name: 'Security Auditor',
        scope: 'Organization',
        description:
          'Read-only access to security logs, audit trails, and compliance reports.',
      },
      {
        id: 'grp_read_only',
        name: 'Read Only',
        scope: 'Organization',
        description:
          'View-only access across all assigned resources. No create or modify capabilities.',
      },
    ],

    // ---- Effective permissions matrix (8 categories) ----
    effectivePermissions: [
      {
        category: 'Organization',
        rows: [
          { key: 'org_view', label: 'View Organization', state: 'Granted', source: 'Role' },
          { key: 'org_edit', label: 'Edit Organization', state: 'Denied', source: '—' },
          { key: 'org_settings', label: 'Manage Settings', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'User Management',
        rows: [
          { key: 'user_view', label: 'View Users', state: 'Inherited', source: 'Data Engineering' },
          { key: 'user_create', label: 'Create Users', state: 'Denied', source: '—' },
          { key: 'user_edit', label: 'Edit Users', state: 'Denied', source: '—' },
          { key: 'user_delete', label: 'Delete Users', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Departments',
        rows: [
          { key: 'dept_view', label: 'View Departments', state: 'Inherited', source: 'Operations' },
          { key: 'dept_create', label: 'Create Departments', state: 'Denied', source: '—' },
          { key: 'dept_edit', label: 'Edit Departments', state: 'Denied', source: '—' },
          { key: 'dept_delete', label: 'Delete Departments', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Teams',
        rows: [
          { key: 'team_view', label: 'View Teams', state: 'Inherited', source: 'Data Engineering' },
          { key: 'team_create', label: 'Create Teams', state: 'Denied', source: '—' },
          { key: 'team_edit', label: 'Edit Teams', state: 'Denied', source: '—' },
          { key: 'team_delete', label: 'Delete Teams', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Pipelines',
        rows: [
          { key: 'pipe_view', label: 'View Pipelines', state: 'Granted', source: 'Role' },
          { key: 'pipe_create', label: 'Create Pipelines', state: 'Granted', source: 'Role' },
          { key: 'pipe_edit', label: 'Edit Pipelines', state: 'Granted', source: 'Role' },
          { key: 'pipe_execute', label: 'Execute Pipelines', state: 'Granted', source: 'Role' },
          { key: 'pipe_schedule', label: 'Schedule Pipelines', state: 'Inherited', source: 'Operations' },
          { key: 'pipe_delete', label: 'Delete Pipelines', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Connectors',
        rows: [
          { key: 'conn_view', label: 'View Connectors', state: 'Granted', source: 'Role' },
          { key: 'conn_create', label: 'Create Connectors', state: 'Granted', source: 'Role' },
          { key: 'conn_edit', label: 'Edit Connectors', state: 'Granted', source: 'Role' },
          { key: 'conn_test', label: 'Test Connection', state: 'Granted', source: 'Role' },
          { key: 'conn_delete', label: 'Delete Connectors', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Data Sources',
        rows: [
          { key: 'ds_view', label: 'View Data Sources', state: 'Granted', source: 'Role' },
          { key: 'ds_configure', label: 'Configure Data Sources', state: 'Inherited', source: 'Data Engineering' },
          { key: 'ds_delete', label: 'Delete Data Sources', state: 'Denied', source: '—' },
        ],
      },
      {
        category: 'Security',
        rows: [
          { key: 'sec_roles', label: 'Manage Roles', state: 'Denied', source: '—' },
          { key: 'sec_perms', label: 'Manage Permissions', state: 'Denied', source: '—' },
          { key: 'sec_tokens', label: 'Manage API Tokens', state: 'Inherited', source: 'Data Engineering' },
          { key: 'sec_audit', label: 'View Audit Logs', state: 'Inherited', source: 'Operations' },
        ],
      },
    ],

    // ---- Resource-level access ----
    resources: [
      { id: 'res_1', resource: 'customer_sync_prod', type: 'Pipeline', accessLevel: 'Execute', source: 'Direct', expires: 'No expiry' },
      { id: 'res_2', resource: 'inventory_etl_daily', type: 'Pipeline', accessLevel: 'Edit', source: 'Direct', expires: 'No expiry' },
      { id: 'res_3', resource: 'Salesforce CRM v2', type: 'Connector', accessLevel: 'Edit', source: 'Group: Data Engineering', expires: 'No expiry' },
      { id: 'res_4', resource: 'Snowflake DWH', type: 'Connector', accessLevel: 'View', source: 'Group: Operations', expires: 'No expiry' },
      { id: 'res_5', resource: 'orders_warehouse_v3', type: 'Data Source', accessLevel: 'View', source: 'Group: Data Engineering', expires: 'No expiry' },
      { id: 'res_6', resource: 'Q2 Revenue Summary', type: 'Dashboard', accessLevel: 'View', source: 'Group: Reporting', expires: 'No expiry' },
      { id: 'res_7', resource: 'Platform Engineering Dept', type: 'Department', accessLevel: 'View', source: 'Role', expires: 'No expiry' },
    ],

    // ---- Administrative privileges (toggles, all off in baseline) ----
    adminPrivileges: [
      { key: 'user_admin', label: 'User Administration', description: 'Create, edit, and delete users. Manage roles and permissions.', enabled: false },
      { key: 'org_admin', label: 'Organization Administration', description: 'Modify organization settings, billing, and platform configuration.', enabled: false },
      { key: 'sec_admin', label: 'Security Administration', description: 'Manage security policies, MFA requirements, and session controls.', enabled: false },
      { key: 'audit_admin', label: 'Audit Administration', description: 'Access complete audit logs and export compliance reports.', enabled: false },
      { key: 'license_admin', label: 'License Administration', description: 'Manage user licenses, entitlements, and seat assignments.', enabled: false },
      { key: 'platform_config', label: 'Platform Configuration', description: 'Configure global platform settings, integrations, and feature flags.', enabled: false },
    ],

    // ---- Inherited access sources ----
    inheritedAccess: [
      { id: 'inh_role_de', kind: 'Role-Based Permissions', via: 'Data Engineer', count: 18, sample: ['View Pipelines', 'Create Pipelines', 'Edit Pipelines', 'Execute Pipelines', 'View Connectors', 'Create Connectors'], more: 12 },
      { id: 'inh_role_ops', kind: 'Role-Based Permissions', via: 'Operations Engineer', count: 9, sample: ['Schedule Pipelines', 'View Teams', 'View Departments', 'Manage Monitors'], more: 5 },
      { id: 'inh_dept', kind: 'Department Membership', via: 'Engineering', count: 4, sample: ['View Department Users', 'View Department Reports', 'Access Dept Resources', 'View Dept Connectors'], more: 0 },
      { id: 'inh_team', kind: 'Team Membership', via: 'Platform Infra', count: 3, sample: ['View Team Pipelines', 'Access Team Dashboards', 'View Team Members'], more: 0 },
      { id: 'inh_grp_de', kind: 'Permission Group', via: 'Data Engineering', count: 14, sample: ['Configure Data Sources', 'Manage API Tokens'], more: 12 },
      { id: 'inh_grp_ops', kind: 'Permission Group', via: 'Operations', count: 7, sample: ['View Audit Logs', 'Schedule Jobs'], more: 5 },
    ],

    // ---- Right rail: audit metadata (read-only, backend-sourced) ----
    audit: {
      lastUpdated: 'Jul 28, 2025',
      updatedBy: 'Sarah Kim',
      auditRef: 'AUD-2025-0441',
      securityReview: 'Jul 12, 2025',
      reviewStatus: 'Approved',
    },
  };
}

/**
 * Load a user's permission record. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getUserPermissions(orgId, userId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}/permissions`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserPermissionsError('Unable to load this user’s permissions right now.');
    }
    const data = await readJson(res);
    if (!data || !data.userId || !Array.isArray(data.effectivePermissions)) {
      throw new UserPermissionsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(userId), mocked: true };
  }
}

/**
 * Persist permission changes. Real PUT first; falls back to a simulated
 * success flagged `mocked: true` when no MOD-003/MOD-005 backend exists.
 */
export async function saveUserPermissions(orgId, userId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}/permissions`,
      { method: 'PUT', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserPermissionsError('Unable to save permission changes right now.');
    }
    const data = await readJson(res);
    return { ...data, mocked: false };
  } catch {
    return { ok: true, userId, mocked: true };
  }
}
