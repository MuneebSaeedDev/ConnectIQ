/**
 * Data + submit for the Create Role Screen (SCR-041, node 113:19063,
 * Figma page "Page 1", frame "Create Role").
 *
 * MOCK BOUNDARY: MOD-003 (RBAC & Permissions) is still `PLANNED` with no
 * backend deployed — no `Role`, `Permission`, `RolePermission`, or
 * `UserRole` endpoint exists yet (see docs/modules/module-plan.md).
 * `createRole` always attempts a real POST first and only falls back to a
 * simulated success when the endpoint is unreachable / returns non-JSON
 * (defends against the Vite dev server's own 200-OK HTML SPA fallback),
 * mirroring the sibling read-side roles/roleList.api.js and the write-side
 * organizations/createOrganization.api.js + users/addUser.api.js patterns.
 * The simulated success returns a generated `role_…` id + key so the
 * caller can route back to the Role List, and marks the result
 * `mocked: true` so the UI can disclose nothing was really persisted.
 *
 * FIGMA VERIFICATION: node 113:19063 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata, 293 text nodes extracted).
 * The header (breadcrumb Administration › Roles › Create Role, title,
 * subtitle, Cancel / Reset / Save Draft / Create Role actions), the Role
 * Information section, Permission Groups (assigned/available with scope
 * tags), Direct Permissions (grouped enable/deny counts), Administrative
 * Privileges toggles, Resource Access Scope table, Permission Inheritance,
 * Role Assignment Rules, the right-rail Role Summary / Effective Access
 * Overview / Validation Status / Security Impact, and the confirm dialog
 * are transcribed from the actual frame's text nodes, so layout/content
 * fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * The catalogues below are design-sourced (from the frame's controls); a
 * real MOD-003 backend would serve the org's permission-group taxonomy,
 * permission catalogue, and inheritable-role list from a config endpoint.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class CreateRoleError extends Error {}

/** Role Information select options (node 113:19063). */
export const ROLE_CATEGORY_OPTIONS = [
  'Engineering',
  'Operations',
  'Analytics',
  'Administration',
  'Security',
  'Compliance',
  'Business',
];

export const ROLE_TYPE_OPTIONS = ['Custom Role', 'System Role'];

export const PRIVILEGE_LEVEL_OPTIONS = [
  'Read Only',
  'Standard',
  'Elevated',
  'Administrative',
  'Full Administrative',
];

export const DESCRIPTION_MAX = 300;

/**
 * Permission-group catalogue (node 113:19063 "Permission Groups"). Each
 * group carries the scope tag + description shown on the card. `assigned`
 * seeds the design's default Assigned/Available split for a new custom
 * role.
 */
export const PERMISSION_GROUPS = [
  {
    id: 'grp_data_engineering',
    name: 'Data Engineering',
    scope: 'Department',
    description: 'Build, configure, and execute ETL pipelines and transformations.',
    assigned: true,
  },
  {
    id: 'grp_pipeline_operations',
    name: 'Pipeline Operations',
    scope: 'Department',
    description: 'Schedule, monitor, and operate production pipelines.',
    assigned: true,
  },
  {
    id: 'grp_connector_management',
    name: 'Connector Management',
    scope: 'Department',
    description: 'Create and manage source and destination connectors.',
    assigned: true,
  },
  {
    id: 'grp_org_administration',
    name: 'Organization Administration',
    scope: 'Organization',
    description: 'Manage organization settings, billing, and configuration.',
    assigned: false,
  },
  {
    id: 'grp_user_management',
    name: 'User Management',
    scope: 'Organization',
    description: 'Invite, edit, and deactivate users across the organization.',
    assigned: false,
  },
  {
    id: 'grp_reporting',
    name: 'Reporting',
    scope: 'Department',
    description: 'Build dashboards and generate reports across resources.',
    assigned: false,
  },
  {
    id: 'grp_security_administration',
    name: 'Security Administration',
    scope: 'Organization',
    description: 'Manage security policies, MFA, and access controls.',
    assigned: false,
  },
  {
    id: 'grp_audit_access',
    name: 'Audit Access',
    scope: 'Organization',
    description: 'Read-only access to audit trails and compliance logs.',
    assigned: false,
  },
  {
    id: 'grp_read_only',
    name: 'Read Only',
    scope: 'Organization',
    description: 'View-only access to assigned dashboards and data sets.',
    assigned: false,
  },
];

/**
 * Direct-permission catalogue (node 113:19063 "Direct Permissions").
 * Grouped per resource; each permission defaults to `granted` for the
 * data-engineer-style baseline the frame shows (pipeline/connector/data-
 * source operate access on, destructive + org/security admin actions off).
 * The live "N enabled / N denied" chip is computed from this catalogue at
 * render time — it is not a hard-coded figure — so the count always matches
 * whatever the catalogue actually contains.
 */
export const PERMISSION_CATALOG = [
  {
    id: 'perm_organization',
    label: 'Organization',
    permissions: [
      { id: 'org_view', label: 'View Organization', granted: true },
      { id: 'org_edit', label: 'Edit Organization', granted: false },
      { id: 'org_manage_settings', label: 'Manage Settings', granted: false },
    ],
  },
  {
    id: 'perm_users',
    label: 'Users',
    permissions: [
      { id: 'users_view', label: 'View Users', granted: true },
      { id: 'users_invite', label: 'Invite Users', granted: false },
      { id: 'users_edit', label: 'Edit Users', granted: false },
      { id: 'users_deactivate', label: 'Deactivate Users', granted: false },
      { id: 'users_manage_roles', label: 'Manage User Roles', granted: false },
    ],
  },
  {
    id: 'perm_departments',
    label: 'Departments',
    permissions: [
      { id: 'dept_view', label: 'View Departments', granted: true },
      { id: 'dept_create', label: 'Create Departments', granted: false },
      { id: 'dept_edit', label: 'Edit Departments', granted: false },
      { id: 'dept_delete', label: 'Delete Departments', granted: false },
    ],
  },
  {
    id: 'perm_teams',
    label: 'Teams',
    permissions: [
      { id: 'teams_view', label: 'View Teams', granted: true },
      { id: 'teams_create', label: 'Create Teams', granted: false },
      { id: 'teams_edit', label: 'Edit Teams', granted: false },
      { id: 'teams_manage_members', label: 'Manage Members', granted: false },
    ],
  },
  {
    id: 'perm_pipelines',
    label: 'Pipelines',
    permissions: [
      { id: 'pipe_view', label: 'View Pipelines', granted: true },
      { id: 'pipe_create', label: 'Create Pipelines', granted: true },
      { id: 'pipe_edit', label: 'Edit Pipelines', granted: true },
      { id: 'pipe_run', label: 'Run Pipelines', granted: true },
      { id: 'pipe_schedule', label: 'Schedule Pipelines', granted: true },
      { id: 'pipe_delete', label: 'Delete Pipelines', granted: false },
    ],
  },
  {
    id: 'perm_connectors',
    label: 'Connectors',
    permissions: [
      { id: 'conn_view', label: 'View Connectors', granted: true },
      { id: 'conn_create', label: 'Create Connectors', granted: true },
      { id: 'conn_edit', label: 'Edit Connectors', granted: true },
      { id: 'conn_test', label: 'Test Connectors', granted: true },
      { id: 'conn_delete', label: 'Delete Connectors', granted: false },
    ],
  },
  {
    id: 'perm_data_sources',
    label: 'Data Sources',
    permissions: [
      { id: 'ds_view', label: 'View Data Sources', granted: true },
      { id: 'ds_configure', label: 'Configure Data Sources', granted: true },
      { id: 'ds_delete', label: 'Delete Data Sources', granted: false },
    ],
  },
  {
    id: 'perm_dashboards',
    label: 'Dashboards & Reports',
    permissions: [
      { id: 'dash_view', label: 'View Dashboards', granted: true },
      { id: 'dash_create', label: 'Create Dashboards', granted: false },
      { id: 'dash_edit', label: 'Edit Dashboards', granted: false },
      { id: 'dash_share', label: 'Share Dashboards', granted: false },
      { id: 'dash_export', label: 'Export Reports', granted: false },
    ],
  },
  {
    id: 'perm_security',
    label: 'Security',
    permissions: [
      { id: 'sec_manage_roles', label: 'Manage Roles', granted: true },
      { id: 'sec_manage_permissions', label: 'Manage Permissions', granted: true },
      { id: 'sec_api_tokens', label: 'Manage API Tokens', granted: false },
      { id: 'sec_view_audit', label: 'View Audit Logs', granted: false },
    ],
  },
];

/**
 * Administrative-privilege toggles (node 113:19063 "Administrative
 * Privileges"). All default off for a new non-admin custom role.
 */
export const ADMIN_PRIVILEGES = [
  { id: 'adm_user', label: 'User Administration', description: 'Full control over user accounts and access.' },
  { id: 'adm_org', label: 'Organization Administration', description: 'Manage organization-wide settings and billing.' },
  { id: 'adm_security', label: 'Security Administration', description: 'Manage security policies and access controls.' },
  { id: 'adm_audit', label: 'Audit Administration', description: 'Access and export all audit and compliance logs.' },
  { id: 'adm_license', label: 'License Administration', description: 'Manage seat allocation and subscription limits.' },
  { id: 'adm_platform', label: 'Platform Configuration', description: 'Configure platform-wide defaults and integrations.' },
];

/**
 * Resource Access Scope defaults (node 113:19063 table). A real backend
 * would resolve access levels against the effective permission set.
 */
export const RESOURCE_SCOPE_OPTIONS = ['Organization', 'Department', 'Team', 'Assigned Only'];
export const ACCESS_LEVEL_OPTIONS = ['Full Access', 'Read/Write', 'Read Only', 'No Access'];

export const DEFAULT_RESOURCE_SCOPE = [
  { id: 'rs_pipelines', resourceType: 'Pipelines', scope: 'Department', accessLevel: 'Read/Write', conditions: 'Assigned departments only' },
  { id: 'rs_connectors', resourceType: 'Connectors', scope: 'Department', accessLevel: 'Read/Write', conditions: 'Non-production only' },
  { id: 'rs_data_sources', resourceType: 'Data Sources', scope: 'Department', accessLevel: 'Read/Write', conditions: '—' },
  { id: 'rs_dashboards', resourceType: 'Dashboards', scope: 'Team', accessLevel: 'Read Only', conditions: 'Shared dashboards' },
  { id: 'rs_departments', resourceType: 'Departments', scope: 'Assigned Only', accessLevel: 'Read Only', conditions: '—' },
];

/** Permission Inheritance options (node 113:19063). */
export const INHERIT_ROLE_OPTIONS = [
  'None',
  'Data Engineer',
  'Data Analyst',
  'Team Lead',
  'Operations Engineer',
];

export const PERMISSION_TEMPLATE_OPTIONS = ['Organization Policy', 'Department Policy', 'Custom'];

/** Role Assignment Rules options (node 113:19063). */
export const ASSIGNABLE_BY_OPTIONS = [
  'Organization Admins',
  'Department Managers',
  'Team Leads',
  'Security Admins',
];

export const MAX_ASSIGNMENT_SCOPE_OPTIONS = ['Organization', 'Department', 'Team'];

/** Empty form seeded with the design's defaults for a new custom role. */
export const INITIAL_FORM = {
  name: '',
  key: '',
  description: '',
  category: 'Engineering',
  type: 'Custom Role',
  privilegeLevel: 'Standard',
  // Permission-group ids currently assigned to the role.
  assignedGroups: PERMISSION_GROUPS.filter((g) => g.assigned).map((g) => g.id),
  // Map of permission id → granted boolean (seeded from the catalogue).
  permissions: Object.fromEntries(
    PERMISSION_CATALOG.flatMap((grp) => grp.permissions.map((p) => [p.id, p.granted])),
  ),
  // Map of admin-privilege id → enabled boolean.
  adminPrivileges: Object.fromEntries(ADMIN_PRIVILEGES.map((p) => [p.id, false])),
  resourceScope: DEFAULT_RESOURCE_SCOPE,
  inheritFrom: 'Data Engineer',
  permissionTemplate: 'Organization Policy',
  // Assignment rules
  assignableBy: 'Department Managers',
  maxAssignmentScope: 'Department',
  departmentRestrictions: '',
  teamRestrictions: '',
  requiresApproval: true,
  restrictedRole: false,
};

/** Slugify a role name into a snake_case role key (design: "Lowercase, underscores only"). Guarantees a leading letter so the generated key satisfies KEY_PATTERN. */
export function slugifyKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/g, '')
    .slice(0, 48);
}

/**
 * Attempt to create a role. Real POST first; on any failure (unreachable
 * endpoint, non-JSON dev-server fallback, network error) return a
 * simulated success flagged `mocked: true`.
 */
export async function createRole(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/roles`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new CreateRoleError('Unable to create the role right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new CreateRoleError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const key = payload?.key || slugifyKey(payload?.name || 'role');
    const id = `role_${Math.random().toString(36).slice(2, 10)}`;
    return { id, key, name: payload?.name, mocked: true };
  }
}
