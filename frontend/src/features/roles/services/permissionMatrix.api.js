/**
 * Data loader for the Permission Matrix Screen (SCR-043, node 113:22359,
 * Figma page "Page 1", frame "Permission Matrix Screen").
 *
 * MOCK BOUNDARY: MOD-003 (RBAC & Permissions) is still `PLANNED` with no
 * backend deployed — no `Role`, `Permission`, `RolePermission`, or
 * `UserRole` endpoint exists yet (see docs/modules/module-plan.md).
 * `getPermissionMatrix` always attempts a real GET first and only falls
 * back to the design-sourced baseline below when the endpoint is
 * unreachable / returns non-JSON (defends against the Vite dev server's
 * own 200-OK HTML SPA fallback, mirroring the sibling roles/*.api.js and
 * users/*.api.js modules). Results are flagged `mocked: true` so the UI can
 * disclose that the data is sample data, not persisted records.
 *
 * FIGMA VERIFICATION (agent-rules.md §2): node 113:22359 was inspected
 * this session via the Figma MCP (get_screenshot + get_metadata text-node
 * extraction). VERIFIED from the frame's own text nodes: the breadcrumb
 * (Administration › Roles › Permission Matrix), title + subtitle, the six
 * header actions (Refresh / Save View / Compare Roles / Export Matrix), the
 * 6 KPI cards (Total Roles 14, Total Permissions 53, Administrative 12,
 * Inherited Permissions 347, Custom Permissions 8, Policy Conflicts 2), the
 * seven saved-view chips, the toolbar controls, the 6-state legend
 * (Granted / Inherited / Conditional / Restricted / Denied / N/A), the 10
 * role columns with their type/assigned-user/privilege sub-labels
 * (Super Administrator System·3·Full Admin, Org Administrator System·8·Admin,
 * Security Admin System·5·Admin, Dept Manager System·24·Elevated,
 * Team Lead System·61·Elevated, Data Engineer System·187·Standard,
 * Data Analyst System·312·Standard, Operations Eng System·94·Standard,
 * Sr. Data Engineer Custom·41·Elevated, Business User System·423·Read Only),
 * the 9 permission groups with their permission labels (Organization 3,
 * User Management 5, Departments 4, Teams 4, Pipelines 6, Connectors 5,
 * Data Sources 3, Security 5, System Administration 4 = 39 rendered rows),
 * the Permission Details drawer sections (Permission Summary / Role Context /
 * Permission Source / Affected Resources + 3 links), and the four Coverage
 * Insight cards (Most Assigned / Administrative / Unused-Zero-Coverage /
 * Density by Privilege Level).
 *
 * DERIVED / sample data (NOT frame-verified per cell): the individual
 * per-cell permission STATES (39 permissions × 10 roles = 390 cells) are
 * generated as a coherent, privilege-consistent sample matrix — the frame's
 * 390 tiny state glyphs are not all legibly transcribable, so they are
 * illustrative, not an asserted pixel match (same honesty pattern as the
 * SCR-031 activity rows). The per-group "% coverage" figures shown on the
 * frame are likewise illustrative; this screen instead computes coverage
 * live from the actual matrix so the number always matches what is rendered.
 *
 * FIGMA-SOURCE COUNT NOTE (agent-rules.md §3): the frame's KPI card /
 * headline says "53 permissions" but the 9 rendered permission groups total
 * 39 permission rows. 53 is preserved as the KPI card's org-wide
 * permission-node count; the matrix's live "Showing N permissions" line is
 * computed from the 39 catalogued rows actually rendered (honest count),
 * not hard-coded to 53. A real MOD-003 backend would serve the full node
 * catalogue and the matrix would render all of it.
 *
 * A real MOD-003 backend would serve the persisted, org-scoped permission
 * matrix with computed coverage, inheritance sources, and policy-conflict
 * detection.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class PermissionMatrixError extends Error {}

/** State codes → legend metadata (node 113:22359 "Permission States"). */
export const PERMISSION_STATES = {
  granted: { code: 'granted', label: 'Granted' },
  inherited: { code: 'inherited', label: 'Inherited' },
  conditional: { code: 'conditional', label: 'Conditional' },
  restricted: { code: 'restricted', label: 'Restricted' },
  denied: { code: 'denied', label: 'Denied' },
  na: { code: 'na', label: 'N/A' },
};

export const STATE_ORDER = ['granted', 'inherited', 'conditional', 'restricted', 'denied', 'na'];

/** Toolbar filter option catalogues (node 113:22359 toolbar dropdowns). */
export const ROLE_TYPE_OPTIONS = ['All Role Types', 'System', 'Custom'];
export const STATE_OPTIONS = [
  'All States',
  'Granted',
  'Inherited',
  'Conditional',
  'Restricted',
  'Denied',
  'N/A',
];
export const LEVEL_OPTIONS = [
  'All Levels',
  'Full Administrative',
  'Administrative',
  'Elevated',
  'Standard',
  'Read Only',
];
export const SOURCE_OPTIONS = [
  'All Sources',
  'Direct Assignment',
  'Group',
  'Policy',
  'Inheritance',
];

export const SAVED_VIEWS = [
  'All Roles',
  'Administrative',
  'Security Perms',
  'Pipeline Access',
  'Read-Only Roles',
  'System Roles',
  'Custom Roles',
];

/**
 * KPI cards (node 113:22359 header strip). Values are the frame's own
 * org-wide figures. `totalPermissions` (53) is the org's full permission-
 * node count; the rendered matrix below catalogues 39 of them across 9
 * groups (see FIGMA-SOURCE COUNT NOTE in the header).
 */
export const MOCK_KPIS = [
  { key: 'roles', label: 'Total Roles', value: '14', subtitle: 'Across platform', tone: 'default' },
  { key: 'permissions', label: 'Total Permissions', value: '53', subtitle: 'Unique permission nodes', tone: 'info' },
  { key: 'admin', label: 'Administrative', value: '12', subtitle: 'Elevated or above', tone: 'danger' },
  { key: 'inherited', label: 'Inherited Permissions', value: '347', subtitle: 'Role + group inheritance', tone: 'accent' },
  { key: 'custom', label: 'Custom Permissions', value: '8', subtitle: 'Directly assigned', tone: 'success' },
  { key: 'conflicts', label: 'Policy Conflicts', value: '2', subtitle: 'Require review', tone: 'warning' },
];

/**
 * Role columns (node 113:22359 role headers). `type`/`assignedUsers`/
 * `privilege` are transcribed from the frame's sub-labels. `rank` drives
 * the sample-state generator below (higher = more privileged).
 */
export const MATRIX_ROLES = [
  { id: 'role_super_admin', name: 'Super Administrator', short: 'Super Administrator', type: 'System', assignedUsers: 3, privilege: 'Full Admin', privilegeLevel: 'Full Administrative', rank: 5 },
  { id: 'role_org_admin', name: 'Org Administrator', short: 'Org Administrator', type: 'System', assignedUsers: 8, privilege: 'Admin', privilegeLevel: 'Administrative', rank: 4 },
  { id: 'role_security_admin', name: 'Security Admin', short: 'Security Admin', type: 'System', assignedUsers: 5, privilege: 'Admin', privilegeLevel: 'Administrative', rank: 4, security: true },
  { id: 'role_dept_manager', name: 'Dept Manager', short: 'Dept Manager', type: 'System', assignedUsers: 24, privilege: 'Elevated', privilegeLevel: 'Elevated', rank: 3 },
  { id: 'role_team_lead', name: 'Team Lead', short: 'Team Lead', type: 'System', assignedUsers: 61, privilege: 'Elevated', privilegeLevel: 'Elevated', rank: 3 },
  { id: 'role_data_engineer', name: 'Data Engineer', short: 'Data Engineer', type: 'System', assignedUsers: 187, privilege: 'Standard', privilegeLevel: 'Standard', rank: 2, engineer: true },
  { id: 'role_data_analyst', name: 'Data Analyst', short: 'Data Analyst', type: 'System', assignedUsers: 312, privilege: 'Standard', privilegeLevel: 'Standard', rank: 2, analyst: true },
  { id: 'role_ops_engineer', name: 'Operations Eng', short: 'Operations Eng', type: 'System', assignedUsers: 94, privilege: 'Standard', privilegeLevel: 'Standard', rank: 2, ops: true },
  { id: 'role_sr_data_engineer', name: 'Sr. Data Engineer', short: 'Sr. Data Engineer', type: 'Custom', assignedUsers: 41, privilege: 'Elevated', privilegeLevel: 'Elevated', rank: 3, engineer: true },
  { id: 'role_business_user', name: 'Business User', short: 'Business User', type: 'System', assignedUsers: 423, privilege: 'Read Only', privilegeLevel: 'Read Only', rank: 1 },
];

/**
 * Permission groups + their permissions (node 113:22359 row headers).
 * `sensitivity` flags how privileged a permission is (drives the sample
 * matrix): `admin` = org/security/system admin action, `destructive` =
 * delete/suspend, `write` = create/edit/configure, `read` = view/read-only.
 */
export const PERMISSION_GROUPS = [
  {
    id: 'grp_organization',
    name: 'Organization',
    permissions: [
      { id: 'org_view', label: 'View Organization', sensitivity: 'read' },
      { id: 'org_edit', label: 'Edit Organization', sensitivity: 'admin' },
      { id: 'org_manage_settings', label: 'Manage Settings', sensitivity: 'admin' },
    ],
  },
  {
    id: 'grp_user_management',
    name: 'User Management',
    permissions: [
      { id: 'users_view', label: 'View Users', sensitivity: 'read' },
      { id: 'users_create', label: 'Create Users', sensitivity: 'admin' },
      { id: 'users_edit', label: 'Edit Users', sensitivity: 'write' },
      { id: 'users_suspend', label: 'Suspend Users', sensitivity: 'destructive' },
      { id: 'users_delete', label: 'Delete Users', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_departments',
    name: 'Departments',
    permissions: [
      { id: 'dept_view', label: 'View Departments', sensitivity: 'read' },
      { id: 'dept_create', label: 'Create Departments', sensitivity: 'write' },
      { id: 'dept_edit', label: 'Edit Departments', sensitivity: 'write' },
      { id: 'dept_delete', label: 'Delete Departments', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_teams',
    name: 'Teams',
    permissions: [
      { id: 'teams_view', label: 'View Teams', sensitivity: 'read' },
      { id: 'teams_create', label: 'Create Teams', sensitivity: 'write' },
      { id: 'teams_edit', label: 'Edit Teams', sensitivity: 'write' },
      { id: 'teams_delete', label: 'Delete Teams', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_pipelines',
    name: 'Pipelines',
    permissions: [
      { id: 'pipe_view', label: 'View Pipelines', sensitivity: 'read' },
      { id: 'pipe_create', label: 'Create Pipelines', sensitivity: 'write' },
      { id: 'pipe_edit', label: 'Edit Pipelines', sensitivity: 'write' },
      { id: 'pipe_execute', label: 'Execute Pipelines', sensitivity: 'write' },
      { id: 'pipe_schedule', label: 'Schedule Pipelines', sensitivity: 'write' },
      { id: 'pipe_delete', label: 'Delete Pipelines', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_connectors',
    name: 'Connectors',
    permissions: [
      { id: 'conn_view', label: 'View Connectors', sensitivity: 'read' },
      { id: 'conn_create', label: 'Create Connectors', sensitivity: 'write' },
      { id: 'conn_edit', label: 'Edit Connectors', sensitivity: 'write' },
      { id: 'conn_test', label: 'Test Connection', sensitivity: 'write' },
      { id: 'conn_delete', label: 'Delete Connectors', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_data_sources',
    name: 'Data Sources',
    permissions: [
      { id: 'ds_view', label: 'View Data Sources', sensitivity: 'read' },
      { id: 'ds_configure', label: 'Configure Sources', sensitivity: 'write' },
      { id: 'ds_delete', label: 'Delete Data Sources', sensitivity: 'destructive' },
    ],
  },
  {
    id: 'grp_security',
    name: 'Security',
    permissions: [
      { id: 'sec_manage_roles', label: 'Manage Roles', sensitivity: 'admin' },
      { id: 'sec_manage_permissions', label: 'Manage Permissions', sensitivity: 'admin' },
      { id: 'sec_manage_api_tokens', label: 'Manage API Tokens', sensitivity: 'admin' },
      { id: 'sec_view_audit_logs', label: 'View Audit Logs', sensitivity: 'read' },
      { id: 'sec_security_policies', label: 'Security Policies', sensitivity: 'admin' },
    ],
  },
  {
    id: 'grp_system_administration',
    name: 'System Administration',
    permissions: [
      { id: 'sys_platform_config', label: 'Platform Config', sensitivity: 'admin' },
      { id: 'sys_license_management', label: 'License Management', sensitivity: 'admin' },
      { id: 'sys_audit_administration', label: 'Audit Administration', sensitivity: 'admin' },
      { id: 'sys_backup_management', label: 'Backup Management', sensitivity: 'admin' },
    ],
  },
];

// GENERATOR

/**
 * Deterministic sample-state generator (DERIVED data — see header). Produces
 * a coherent, privilege-consistent state for a (role, permission) pair.
 * Pure and deterministic (no randomness) so the matrix is stable across
 * renders and the computed coverage/insight figures never drift.
 *
 *  - Read Only roles (Business User): read perms granted, everything else N/A.
 *  - Super Admin: everything granted.
 *  - Org/Security Admin: admin perms granted (security perms restricted for
 *    the non-security admin as a realistic conditional), destructive granted,
 *    writes granted, reads granted.
 *  - Elevated (Dept Manager / Team Lead / Sr. Data Engineer): reads/writes
 *    granted, destructive denied, admin N/A.
 *  - Standard engineers/analysts/ops: reads granted, domain writes granted
 *    (via group inheritance), destructive denied, admin N/A.
 *
 * Group inheritance (`inherited`) and a couple of `conditional`/`restricted`
 * cells are seeded to exercise all six legend states, matching the frame's
 * mix of glyphs.
 */
function stateFor(role, group, perm) {
  const s = perm.sensitivity;

  // Read Only: only read permissions, and only in the low-risk groups.
  if (role.privilegeLevel === 'Read Only') {
    if (s === 'read' && ['grp_organization', 'grp_pipelines', 'grp_connectors', 'grp_data_sources', 'grp_departments', 'grp_teams'].includes(group.id)) {
      return 'granted';
    }
    if (s === 'read' && group.id === 'grp_security') return 'na';
    return 'na';
  }

  // Super Administrator: full access everywhere.
  if (role.id === 'role_super_admin') return 'granted';

  // Org Administrator: broad admin, but security policies are a conditional.
  if (role.id === 'role_org_admin') {
    if (group.id === 'grp_security' && s === 'admin') return 'conditional';
    return 'granted';
  }

  // Security Administrator: security + audit granted; non-security admin
  // (platform/license/backup, org edit) restricted; ops perms N/A.
  if (role.id === 'role_security_admin') {
    if (group.id === 'grp_security') return 'granted';
    if (group.id === 'grp_system_administration') return 'granted';
    if (group.id === 'grp_organization') return s === 'read' ? 'granted' : 'restricted';
    if (s === 'read') return 'granted';
    if (s === 'destructive') return 'denied';
    return 'na';
  }

  // Elevated managers/leads/senior engineers.
  if (role.privilegeLevel === 'Elevated') {
    if (s === 'admin') return 'na';
    if (s === 'destructive') {
      // Managers keep a couple of scoped destructive rights as conditional.
      if (role.id === 'role_dept_manager' && ['grp_departments', 'grp_teams'].includes(group.id)) return 'conditional';
      return 'denied';
    }
    if (s === 'read') return 'granted';
    // writes
    if (role.engineer && ['grp_pipelines', 'grp_connectors', 'grp_data_sources'].includes(group.id)) return 'granted';
    if (['grp_departments', 'grp_teams', 'grp_pipelines'].includes(group.id)) return 'inherited';
    return 'granted';
  }

  // Standard: reads granted; domain writes inherited via groups.
  if (role.privilegeLevel === 'Standard') {
    if (s === 'admin') return 'na';
    if (s === 'destructive') return 'denied';
    if (s === 'read') {
      // Audit-log read gated to ops for a realistic conditional.
      if (perm.id === 'sec_view_audit_logs') return role.ops ? 'granted' : 'na';
      return 'granted';
    }
    // writes
    if (role.engineer && ['grp_pipelines', 'grp_connectors', 'grp_data_sources'].includes(group.id)) return 'inherited';
    if (role.ops && ['grp_pipelines', 'grp_connectors'].includes(group.id)) return 'inherited';
    if (role.analyst && group.id === 'grp_pipelines' && perm.id === 'pipe_execute') return 'conditional';
    if (['grp_departments', 'grp_teams'].includes(group.id)) return 'na';
    return 'restricted';
  }

  return 'na';
}

/** Human-readable state-source label for the detail drawer. */
function sourceFor(state, role) {
  switch (state) {
    case 'granted': return role.type === 'Custom' ? 'Direct Assignment' : 'Direct Assignment';
    case 'inherited': return 'Group Inheritance';
    case 'conditional': return 'Conditional Policy';
    case 'restricted': return 'Policy Restriction';
    case 'denied': return 'Explicit Deny';
    default: return 'Not Applicable';
  }
}

/**
 * Build the full matrix: for each permission (flattened across groups),
 * a `states` map keyed by roleId. Also computes per-group coverage (share
 * of role-cells that are granted or inherited) live from the states.
 */
function buildMatrix() {
  const groups = PERMISSION_GROUPS.map((group) => {
    const permissions = group.permissions.map((perm) => {
      const states = {};
      MATRIX_ROLES.forEach((role) => {
        states[role.id] = stateFor(role, group, perm);
      });
      const assignedCount = MATRIX_ROLES.filter(
        (r) => states[r.id] === 'granted' || states[r.id] === 'inherited',
      ).length;
      return { ...perm, states, assignedCount };
    });
    const totalCells = permissions.length * MATRIX_ROLES.length;
    const activeCells = permissions.reduce(
      (sum, p) => sum + MATRIX_ROLES.filter((r) => p.states[r.id] === 'granted' || p.states[r.id] === 'inherited').length,
      0,
    );
    const coverage = totalCells === 0 ? 0 : Math.round((activeCells / totalCells) * 100);
    return { ...group, permissions, coverage };
  });

  const permissionCount = groups.reduce((n, g) => n + g.permissions.length, 0);
  return { groups, permissionCount };
}

/**
 * Coverage-insight cards (node 113:22359 footer "Permission Coverage
 * Insights"). Computed live from the built matrix so the /10 figures always
 * match the rendered cells.
 */
function buildInsights(groups) {
  const flat = groups.flatMap((g) => g.permissions.map((p) => ({ ...p, groupName: g.name })));
  const total = MATRIX_ROLES.length;

  const mostAssigned = [...flat]
    .sort((a, b) => b.assignedCount - a.assignedCount || a.label.localeCompare(b.label))
    .slice(0, 5)
    .map((p) => ({ label: p.label, value: p.assignedCount, total, tone: 'info' }));

  const administrative = flat
    .filter((p) => p.sensitivity === 'admin')
    .sort((a, b) => b.assignedCount - a.assignedCount || a.label.localeCompare(b.label))
    .slice(0, 5)
    .map((p) => ({ label: p.label, value: p.assignedCount, total, tone: 'danger' }));

  const unused = [...flat]
    .sort((a, b) => a.assignedCount - b.assignedCount || a.label.localeCompare(b.label))
    .slice(0, 5)
    .map((p) => ({ label: p.label, value: p.assignedCount, total, tone: 'warning' }));

  const density = MATRIX_ROLES.reduce((acc, role) => {
    const granted = groups.reduce(
      (sum, g) => sum + g.permissions.filter((p) => p.states[role.id] === 'granted' || p.states[role.id] === 'inherited').length,
      0,
    );
    acc[role.privilege] = (acc[role.privilege] ?? 0) + granted;
    return acc;
  }, {});
  const densityRows = ['Full Admin', 'Admin', 'Elevated', 'Standard', 'Read Only']
    .filter((k) => k in density)
    .map((k) => ({ label: k, value: density[k] }));

  return { mostAssigned, administrative, unused, densityRows };
}

/**
 * Design-sourced Permission Details drawer content for a highlighted cell.
 * The frame shows the "Execute Pipelines × Data Engineer" cell selected;
 * for any other cell we derive a coherent summary from the matrix data.
 */
export function buildCellDetail(group, perm, role) {
  const state = perm.states[role.id];
  const stateLabel = PERMISSION_STATES[state]?.label ?? 'N/A';
  const source = sourceFor(state, role);
  const active = state === 'granted' || state === 'inherited';
  return {
    permission: perm.label,
    category: group.name,
    currentState: stateLabel,
    stateSource: source,
    active,
    role: {
      name: role.name,
      type: role.type === 'System' ? 'System Role' : 'Custom Role',
      privilegeLevel: role.privilegeLevel,
      assignedUsers: `${role.assignedUsers.toLocaleString()} users`,
    },
    sources: [
      { label: source, active: true },
      { label: `${role.name} Group`, active: state === 'inherited' },
      { label: 'Default Policy', active: state === 'granted' || state === 'inherited' },
    ],
    resources: [
      { label: 'Departments', value: `${role.rank >= 3 ? 'All' : '4'} departments` },
      { label: 'Teams', value: `${role.rank >= 3 ? 'All' : '11'} teams` },
      { label: 'Pipelines', value: active ? 'All assigned pipelines' : 'None' },
    ],
  };
}

// LOADER

/** Assemble the full design-sourced baseline payload. */
export function buildMockMatrix() {
  const { groups, permissionCount } = buildMatrix();
  const insights = buildInsights(groups);
  return {
    updatedAt: 'Aug 28, 2025',
    organizationName: 'Acme Corporation',
    kpis: MOCK_KPIS,
    roles: MATRIX_ROLES,
    groups,
    permissionCount,
    roleCount: MATRIX_ROLES.length,
    insights,
  };
}

/**
 * Load the org's permission matrix. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getPermissionMatrix(orgId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/permission-matrix`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new PermissionMatrixError('Unable to load the permission matrix right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.groups) || !Array.isArray(data.roles)) {
      throw new PermissionMatrixError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildMockMatrix(), mocked: true };
  }
}


