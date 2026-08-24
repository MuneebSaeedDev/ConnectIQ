/**
 * Centralized permission model for the shared AppShell (MOD-001).
 *
 * agent.md §11 requires authorization to be permission-based rather
 * than relying on role names directly ("pipeline:create",
 * "source:read", etc.), and agent-rules.md §4.3 requires permission
 * checks to be DRY/centralized rather than re-implemented per screen.
 * The real permission model belongs to MOD-003 (RBAC & Permissions),
 * which is still `PLANNED` (no backend, no Role/Permission entities)
 * per docs/modules/module-plan.md. Until that module ships, this file
 * is the single place the sidebar (and any future screen) consults to
 * decide what a role can see — a real permission-checking surface,
 * not a decorative role switch, so MOD-003 can later replace
 * `ROLE_PERMISSIONS`'s static map with a real per-user permission set
 * fetched from the backend without changing any consumer of
 * `hasPermission`/`useVisibleNav`.
 *
 * MOCK BOUNDARY: `ROLE_PERMISSIONS` and `CURRENT_ROLE` (see
 * ../state/sessionSlice.js) are a hardcoded stand-in for a real
 * session/permission payload, since MOD-002's login response and
 * MOD-003's permission matrix do not exist yet. Once MOD-002/MOD-003
 * ship, the current user's permission set should come from the
 * authenticated session, not this static map.
 */

// Permission keys. Named after the resource:action pairs agent.md §11
// enumerates (pipeline:create/read/update/execute/schedule,
// source:read, destination:read, validation:manage,
// transformation:manage) plus the additional resources the sidebar's
// Administration/Operations/Analytics sections require, following the
// same `resource:action` convention.
export const PERMISSIONS = {
  DATA_SOURCE_READ: 'source:read',
  DESTINATION_READ: 'destination:read',
  PIPELINE_READ: 'pipeline:read',
  PIPELINE_CREATE: 'pipeline:create',
  PIPELINE_EXECUTE: 'pipeline:execute',
  OPERATIONS_READ: 'operations:read',
  ANALYTICS_READ: 'analytics:read',
  USER_MANAGE: 'user:manage',
  TEAM_MANAGE: 'team:manage',
  ORGANIZATION_MANAGE: 'organization:manage',
  ROLE_MANAGE: 'role:manage',
  AUDIT_READ: 'audit:read',
  SETTINGS_MANAGE: 'settings:manage',
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Role catalog. Only Super Admin and Organization Admin are named
 * explicitly in agent.md (§9.2, §10.1); Data/ETL Engineer and Viewer
 * are project-level additions requested for the sidebar's role-based
 * filtering requirement, scoped per the recorded product decision:
 * Data/ETL Engineer gets the full ETL working surface (Data,
 * Pipelines, Operations, Analytics) without the Administration
 * section; Viewer gets read-only visibility into Analytics plus
 * Pipelines/Operations, with no source/destination configuration and
 * no Administration access.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  DATA_ETL_ENGINEER: 'data_etl_engineer',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ORG_ADMIN]: 'Organization Admin',
  [ROLES.DATA_ETL_ENGINEER]: 'Data Engineer',
  [ROLES.VIEWER]: 'Viewer',
};

const DATA_ETL_ENGINEER_PERMISSIONS = [
  PERMISSIONS.DATA_SOURCE_READ,
  PERMISSIONS.DESTINATION_READ,
  PERMISSIONS.PIPELINE_READ,
  PERMISSIONS.PIPELINE_CREATE,
  PERMISSIONS.PIPELINE_EXECUTE,
  PERMISSIONS.OPERATIONS_READ,
  PERMISSIONS.ANALYTICS_READ,
];

const VIEWER_PERMISSIONS = [PERMISSIONS.PIPELINE_READ, PERMISSIONS.OPERATIONS_READ, PERMISSIONS.ANALYTICS_READ];

// Super Admin (all organizations, agent.md §9.2) and Organization
// Admin (own organization, same §9.2 rule) both hold every permission
// at the UI-visibility layer described here — org-scoping of the
// underlying data is a backend/query concern for MOD-004, not a
// sidebar-visibility concern.
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ORG_ADMIN]: ALL_PERMISSIONS,
  [ROLES.DATA_ETL_ENGINEER]: DATA_ETL_ENGINEER_PERMISSIONS,
  [ROLES.VIEWER]: VIEWER_PERMISSIONS,
};

export function hasPermission(role, permission) {
  const granted = ROLE_PERMISSIONS[role];
  if (!granted) return false;
  return granted.includes(permission);
}

export function hasAnyPermission(role, permissions) {
  if (!permissions || permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(role, permission));
}
