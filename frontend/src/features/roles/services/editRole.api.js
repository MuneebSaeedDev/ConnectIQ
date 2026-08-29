/**
 * Data + submit for the Edit Role Screen (SCR-042, node 113:20627, Figma
 * page "Page 1", frame "Edit Role Screen").
 *
 * MOCK BOUNDARY: MOD-003 (RBAC & Permissions) is still `PLANNED` with no
 * backend deployed — no `Role`, `Permission`, `RolePermission`, or
 * `UserRole` endpoint exists yet (see docs/modules/module-plan.md).
 * `getEditableRole` always attempts a real GET first and only falls back
 * to the design-sourced baseline below when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK HTML
 * SPA fallback, mirroring the sibling users/editUser.api.js and
 * roles/roleList.api.js modules). `updateRole` always attempts a real PUT
 * first and only falls back to a simulated success when unreachable. Both
 * results are flagged `mocked: true` so the UI can disclose that nothing
 * was really loaded / persisted.
 *
 * FIGMA VERIFICATION: node 113:20627 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata over 1131 text nodes). The
 * breadcrumb (Administration › Roles › Data Engineer › Edit Role), header
 * (title "Edit Role", Active pill, "Unsaved changes" badge, Cancel / Reset
 * Changes / Save Draft / Save Changes), Role Information card (name, role
 * key data_engineer read-only, description w/ char counter, category,
 * status, and role metadata), Permission Groups card (assigned vs
 * available w/ Added/Removed markers), Direct Permissions card (9 domains
 * w/ x/y counts and per-item toggles), Administrative Privileges card (6
 * privileges + warning), Resource Access Scope card (5 resource rows w/
 * access-level scopes), Permission Inheritance card, Assignment Rules
 * card, and the sticky right rail (Role Summary, Effective Access
 * Overview, Assigned Users Impact 187, Validation Status 5/5, Security
 * Impact Low, Pending Changes) are all transcribed from the actual
 * frame's text nodes, so layout/content fidelity is `verified`. See
 * docs/reviews/review-log.md.
 *
 * The design's frame shows the role MID-EDIT (5 pending changes already
 * applied: Reporting group added, Audit Access group removed, Schedule
 * Pipelines permission added, Configure Data Sources permission added,
 * Dashboards scope None → View). We do NOT seed the form in that dirty
 * state — a real edit screen loads the SAVED record and the user makes
 * changes. The design's pre-edit ("Modified from" / "→ from") values
 * therefore become the SAVED baseline, and the dirty-tracking + Pending
 * Changes summary are computed live from the user's edits against that
 * baseline (mirroring SCR-034 EditUser / SCR-027 EditOrganization).
 *
 * A real MOD-003 backend would serve the persisted, org-scoped role with
 * its permission grants, resource scopes, inheritance, and audit metadata.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class EditRoleError extends Error {}

/** Design-sourced select option sets (node 113:20627 dropdowns). */
export const EDIT_ROLE_OPTIONS = {
  category: ['Engineering', 'Analytics', 'Operations', 'Administration', 'Security', 'Compliance'],
  status: ['Active', 'Deprecated', 'Draft'],
  inheritFromRole: ['None', 'Data Analyst', 'Senior Data Engineer', 'Team Lead', 'Operations Engineer'],
  permissionTemplate: ['None', 'Default Engineering Policy', 'Standard Read Access', 'Full Pipeline Access'],
  organizationPolicy: ['Default Organization Policy', 'Restricted Policy', 'Open Policy'],
  departmentPolicy: ['None', 'Default Engineering Policy', 'Analytics Department Policy'],
  assignableBy: ['Organization Administrators', 'Department Managers', 'Security Administrators', 'Any Administrator'],
  maxAssignmentScope: ['Organization-wide', 'Department-level only', 'Team-level only', 'Individual users only'],
  departmentRestrictions: ['No restrictions', 'Engineering only', 'Assigned departments only'],
  teamRestrictions: ['No restrictions', 'Assigned teams only', 'Data teams only'],
  resourceAccessLevel: ['None', 'View', 'Read-only', 'Standard', 'Full Access', 'Dept-level only'],
  resourceScope: ['Organization', 'Assigned Departments', 'Assigned Teams', 'Individual'],
};

/**
 * Design-sourced saved baseline for the "Data Engineer" role
 * (role_7a3f2c91). This is the SAVED state the user edits FROM — i.e.
 * the design's pre-edit values: the Reporting group is NOT yet assigned,
 * Audit Access IS still assigned, the Schedule Pipelines / Configure Data
 * Sources permissions are OFF, and the Dashboards resource scope is None.
 * A real MOD-003 endpoint would return the persisted record for `roleId`.
 */
function buildBaseline(roleId) {
  const id = roleId || 'role_data_engineer';
  return {
    id,
    roleId: 'role_7a3f2c91',
    roleKey: 'data_engineer', // read-only, immutable after creation
    roleType: 'System Role',
    status: 'Active',
    createdLabel: 'Mar 12, 2024',
    createdBy: 'System',
    lastUpdatedLabel: 'Jun 15, 2025',
    lastUpdatedBy: 'Sarah Kim',
    assignedUsers: 187,
    activeUsers: 183,
    assignedDepartments: 4,
    assignedTeams: 11,
    inheritedPermissionsCount: 12,
    inheritedFromLabel: 'Default Engineering Policy',
    inheritedPermissions: [
      'View Pipelines', 'View Connectors', 'View Data Sources', 'View Organization',
      'View Users', 'View Teams', 'View Departments', 'Manage API Tokens',
      'View Audit Logs', 'View Dashboards', 'View Reports', 'Export Reports',
    ],
    // ---- Editable form (the SAVED state the user edits from) ----
    form: {
      // Role Information
      name: 'Data Engineer',
      description:
        'Builds, configures, and executes ETL pipelines and manages connectors across assigned data sources.',
      category: 'Engineering',
      status: 'Active',
      // Permission Groups — ids the role is assigned. Baseline: Reporting
      // NOT yet added; Audit Access still assigned (design shows the
      // pending edit adding Reporting and removing Audit Access).
      permissionGroups: ['data_engineering', 'pipeline_operations', 'audit_access'],
      // Direct permissions — id → enabled. Baseline: schedule_pipelines
      // OFF, configure_data_sources OFF (design shows +2 added).
      permissions: DEFAULT_PERMISSION_STATE(),
      // Administrative privileges — id → enabled (all off in baseline).
      adminPrivileges: {
        user_admin: false,
        org_admin: false,
        security_admin: false,
        audit_admin: false,
        license_admin: false,
        platform_config: false,
      },
      // Resource access scope — resourceId → access level. Baseline:
      // dashboards = 'None' (design shows pending None → View).
      resourceAccess: {
        pipelines: 'Dept-level only',
        connectors: 'Standard',
        data_sources: 'Read-only',
        dashboards: 'None',
        departments: 'View',
      },
      // Permission inheritance
      inheritFromRole: 'None',
      permissionTemplate: 'Default Engineering Policy',
      organizationPolicy: 'Default Organization Policy',
      departmentPolicy: 'Default Engineering Policy',
      // Assignment rules
      assignableBy: 'Department Managers',
      maxAssignmentScope: 'Department-level only',
      departmentRestrictions: 'Assigned departments only',
      teamRestrictions: 'No restrictions',
      requiresApproval: true,
      restrictedRole: false,
    },
  };
}

/**
 * Permission-domain catalogue (node 113:20627 Direct Permissions card).
 * Each domain lists its individual permission items; `DEFAULT_PERMISSION_STATE`
 * derives the baseline enabled map. A real MOD-003 backend would expose
 * the org's permission taxonomy and the role's grant map.
 */
export const PERMISSION_DOMAINS = [
  {
    key: 'organization', label: 'Organization', items: [
      { id: 'org_view', label: 'View Organization', enabled: true },
      { id: 'org_manage', label: 'Manage Organization', enabled: false },
      { id: 'org_billing', label: 'Manage Billing', enabled: false },
    ],
  },
  {
    key: 'users', label: 'Users', items: [
      { id: 'user_view', label: 'View Users', enabled: true },
      { id: 'user_create', label: 'Create Users', enabled: false },
      { id: 'user_edit', label: 'Edit Users', enabled: false },
      { id: 'user_delete', label: 'Delete Users', enabled: false },
      { id: 'user_invite', label: 'Invite Users', enabled: false },
    ],
  },
  {
    key: 'departments', label: 'Departments', items: [
      { id: 'dept_view', label: 'View Departments', enabled: true },
      { id: 'dept_manage', label: 'Manage Departments', enabled: false },
      { id: 'dept_assign', label: 'Assign to Departments', enabled: false },
      { id: 'dept_reports', label: 'View Department Reports', enabled: false },
    ],
  },
  {
    key: 'teams', label: 'Teams', items: [
      { id: 'team_view', label: 'View Teams', enabled: true },
      { id: 'team_manage', label: 'Manage Teams', enabled: false },
      { id: 'team_assign', label: 'Assign to Teams', enabled: false },
      { id: 'team_members', label: 'Manage Team Members', enabled: false },
    ],
  },
  {
    key: 'pipelines', label: 'Pipelines', modified: true, items: [
      { id: 'pipe_view', label: 'View Pipelines', enabled: true },
      { id: 'pipe_create', label: 'Create Pipelines', enabled: true },
      { id: 'pipe_edit', label: 'Edit Pipelines', enabled: true },
      { id: 'pipe_execute', label: 'Execute Pipelines', enabled: true },
      { id: 'pipe_delete', label: 'Delete Pipelines', enabled: true },
      // Pending edit adds this one (+ in "5/6" and "+2 added" totals).
      { id: 'pipe_schedule', label: 'Schedule Pipelines', enabled: false },
    ],
  },
  {
    key: 'connectors', label: 'Connectors', items: [
      { id: 'conn_view', label: 'View Connectors', enabled: true },
      { id: 'conn_create', label: 'Create Connectors', enabled: true },
      { id: 'conn_edit', label: 'Edit Connectors', enabled: true },
      { id: 'conn_test', label: 'Test Connectors', enabled: true },
      { id: 'conn_delete', label: 'Delete Connectors', enabled: false },
    ],
  },
  {
    key: 'data_sources', label: 'Data Sources', modified: true, items: [
      { id: 'ds_view', label: 'View Data Sources', enabled: true },
      { id: 'ds_connect', label: 'Connect Data Sources', enabled: true },
      // Pending edit adds this one (+ in "2/3" and "+2 added" totals).
      { id: 'ds_configure', label: 'Configure Data Sources', enabled: false },
    ],
  },
  {
    key: 'dashboards', label: 'Dashboards & Reports', items: [
      { id: 'dash_view', label: 'View Dashboards', enabled: true },
      { id: 'dash_create', label: 'Create Dashboards', enabled: false },
      { id: 'dash_export', label: 'Export Reports', enabled: false },
      { id: 'dash_share', label: 'Share Dashboards', enabled: false },
      { id: 'dash_schedule', label: 'Schedule Reports', enabled: false },
    ],
  },
  {
    key: 'security', label: 'Security', items: [
      { id: 'sec_view', label: 'View Security Settings', enabled: true },
      { id: 'sec_tokens', label: 'Manage API Tokens', enabled: true },
      { id: 'sec_audit', label: 'View Audit Logs', enabled: false },
      { id: 'sec_policies', label: 'Manage Security Policies', enabled: false },
    ],
  },
];

/** Build the baseline id→enabled map from the domain catalogue. */
function DEFAULT_PERMISSION_STATE() {
  const state = {};
  for (const domain of PERMISSION_DOMAINS) {
    for (const item of domain.items) state[item.id] = item.enabled;
  }
  return state;
}

/** Administrative privilege catalogue (node 113:20627). */
export const ADMIN_PRIVILEGES = [
  { id: 'user_admin', label: 'User Administration', description: 'Create, edit, and remove user accounts organization-wide.' },
  { id: 'org_admin', label: 'Organization Administration', description: 'Manage organization settings, structure, and configuration.' },
  { id: 'security_admin', label: 'Security Administration', description: 'Manage security policies, MFA, and access controls.' },
  { id: 'audit_admin', label: 'Audit Administration', description: 'Full access to audit trails and compliance reports.' },
  { id: 'license_admin', label: 'License Administration', description: 'Assign, revoke, and manage platform licenses.' },
  { id: 'platform_config', label: 'Platform Configuration', description: 'Modify platform-wide configuration and feature flags.' },
];

/** Permission-group catalogue (node 113:20627 Permission Groups card). */
export const PERMISSION_GROUP_CATALOGUE = [
  { id: 'data_engineering', label: 'Data Engineering', scope: 'Department', locked: false },
  { id: 'pipeline_operations', label: 'Pipeline Operations', scope: 'Organization', locked: false },
  { id: 'reporting', label: 'Reporting', scope: 'Department', locked: false },
  { id: 'org_admin', label: 'Organization Administration', scope: 'Organization', locked: false },
  { id: 'security_admin', label: 'Security Administration', scope: 'Organization', locked: false },
  { id: 'connector_mgmt', label: 'Connector Management', scope: 'Department', locked: false },
  { id: 'audit_access', label: 'Audit Access', scope: 'Organization', locked: false },
  { id: 'read_only', label: 'Read Only', scope: 'Organization', locked: false },
];

/** Resource-access-scope catalogue (node 113:20627). */
export const RESOURCE_ACCESS_CATALOGUE = [
  { id: 'pipelines', label: 'Pipelines', scope: 'Assigned Departments', conditions: 'Dept-level only' },
  { id: 'connectors', label: 'Connectors', scope: 'Assigned Departments', conditions: 'None' },
  { id: 'data_sources', label: 'Data Sources', scope: 'Assigned Departments', conditions: 'Read-only' },
  { id: 'dashboards', label: 'Dashboards', scope: 'Organization', conditions: 'None' },
  { id: 'departments', label: 'Departments', scope: 'Assigned Departments', conditions: 'None' },
];

/**
 * Load the editable role. Real GET first; on any failure (unreachable
 * endpoint, non-JSON dev-server fallback, network error) return the
 * design-sourced baseline flagged `mocked: true`.
 */
export async function getEditableRole(orgId, roleId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}/edit`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditRoleError('Unable to load this role for editing right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new EditRoleError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(roleId), mocked: true };
  }
}

/**
 * Persist edits to a role. Real PUT first; on any failure return a
 * simulated success flagged `mocked: true` so the UI can disclose that
 * nothing was really persisted.
 */
export async function updateRole(orgId, roleId, changes) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}`,
      { method: 'PUT', body: changes },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditRoleError('Unable to save changes right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new EditRoleError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: roleId, savedAt: new Date().toISOString(), mocked: true };
  }
}
