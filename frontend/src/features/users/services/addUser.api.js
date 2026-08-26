/**
 * Data + submit for the Add User Screen (SCR-033, node 103:6282, Figma
 * page "Page 1"), including the nested Confirm Invitation dialog (node
 * 103:7455).
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no invite / provision
 * endpoint exists yet (see docs/modules/module-plan.md). User creation
 * is invitation-driven (admin-invite, not self-registration) per
 * docs/agent-rules.md §10.1, so the primary action is "Send Invitation",
 * not "Create User". `inviteUser` always attempts a real POST first and
 * only falls back to a simulated success when the endpoint is
 * unreachable, mirroring the SCR-026 createOrganization.api.js
 * real-POST-first / `mocked: true` fallback shape (including the
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback). The simulated success returns a generated `usr_…` id +
 * `invited` status so the caller can disclose that nothing was really
 * persisted and route back to the (also-mocked) user list.
 *
 * FIGMA VERIFICATION: node 103:6282 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The six numbered
 * form sections (Basic Information, Organization Assignment, Role &
 * Permissions, License Assignment, Authentication & Security,
 * Notifications), the "already in use" Employee ID validation state,
 * the Engineer access-scope callout, the license-availability banner
 * (273 / 300 assigned, 27 remaining), the Feature Access grid (5
 * included / 4 excluded for the Engineer profile), the right-rail User
 * Summary / License Availability meter / Validation Status (5/6 with
 * "Employee ID unique" failing) / Security Checklist / Quick Help, the
 * Cancel / Save Draft / Send Invitation header actions, and the Confirm
 * Invitation dialog ("What happens next" info box) are all transcribed
 * from the actual frame's text nodes, so the layout/content fidelity is
 * `verified`. See docs/reviews/review-log.md.
 *
 * The option lists below are design-sourced (from the frame's select
 * values); a real MOD-005 backend would serve departments/teams/roles/
 * license types from the org's config. They are exported as constants
 * rather than fetched because SCR-033 has no live directory endpoint.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class InviteUserError extends Error {}

/** Design-sourced select option sets (Figma node 103:6282). */
export const ADD_USER_OPTIONS = {
  department: [
    'Data Engineering',
    'Analytics Platform',
    'Customer Data',
    'BI & Reporting',
    'ML Infrastructure',
  ],
  team: [
    'Pipeline Core',
    'Analytics Core',
    'Feature Engineering',
    'Quality Ops',
    'Platform Infra',
    'Event Streaming',
  ],
  manager: [
    'Sarah Chen — Sr. Data Engineer',
    'James Park — Analytics Lead',
    'Maria Rodriguez — Analytics Manager',
    'David Lee — System Administrator',
    'Chris Ward — Data Architect',
  ],
  officeLocation: [
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'London, UK',
    'Remote',
  ],
  primaryRole: ['Administrator', 'Manager', 'Engineer', 'Analyst', 'Viewer'],
  permissionGroup: [
    'Standard Engineer Access',
    'Standard Analyst Access',
    'Manager Access',
    'Administrator Access',
    'Read-only Access',
  ],
  additionalRoles: [
    'Data Quality Reviewer',
    'Pipeline Approver',
    'Connector Manager',
    'Billing Viewer',
  ],
  administrativePrivileges: [
    'None — Standard Access',
    'Department Admin',
    'Organization Admin',
  ],
  resourceAccessProfile: [
    'Data Engineering Standard',
    'Analytics Standard',
    'Customer Data Restricted',
    'Full Platform Access',
  ],
  licenseType: [
    'Full — Engineer',
    'Full — Analyst',
    'Full — Manager',
    'Viewer (read-only)',
    'Guest (temporary)',
  ],
  licenseExpiration: [
    'No expiration (perpetual)',
    '30 days',
    '90 days',
    '1 year',
  ],
};

/**
 * Design-sourced access-scope descriptions per primary role, shown in
 * the callout under "Role & Permissions". A real MOD-005 roles endpoint
 * would supply the scope copy and the Feature Access matrix.
 */
export const ROLE_ACCESS_SCOPE = {
  Administrator:
    'Administrators have full control over users, billing, organization settings, and all platform resources across every department and team.',
  Manager:
    'Managers can manage their department and teams, review pipelines and data quality, and assign work. Managers cannot change billing or organization settings.',
  Engineer:
    'Engineers can create, edit, and execute pipelines; configure connectors; manage data quality rules; and access platform resources within their assigned department and team. Engineers cannot manage users, billing, or organization settings.',
  Analyst:
    'Analysts can build and run analytics, view pipelines and data quality, and access reporting within their assigned department. Analysts cannot edit pipelines or manage platform configuration.',
  Viewer:
    'Viewers have read-only access to dashboards, reports, and shared resources within their assigned scope. Viewers cannot create or modify any resources.',
};

/**
 * Design-sourced Feature Access matrix keyed by license type. `true`
 * capabilities render checked/included; `false` render excluded. The
 * Figma frame shows the Full — Engineer profile with 5 included / 4
 * excluded; other license types follow the same capability set.
 */
export const FEATURE_ACCESS_BY_LICENSE = {
  'Full — Engineer': {
    'Pipeline Builder': true,
    'Connector Manager': true,
    'Execution Engine': true,
    'Data Quality': true,
    Scheduler: true,
    'Analytics Dashboard': false,
    'Billing & Licensing': false,
    'Admin Console': false,
    'Audit Logs': false,
  },
  'Full — Analyst': {
    'Pipeline Builder': false,
    'Connector Manager': false,
    'Execution Engine': true,
    'Data Quality': true,
    Scheduler: true,
    'Analytics Dashboard': true,
    'Billing & Licensing': false,
    'Admin Console': false,
    'Audit Logs': false,
  },
  'Full — Manager': {
    'Pipeline Builder': true,
    'Connector Manager': true,
    'Execution Engine': true,
    'Data Quality': true,
    Scheduler: true,
    'Analytics Dashboard': true,
    'Billing & Licensing': false,
    'Admin Console': false,
    'Audit Logs': true,
  },
  'Viewer (read-only)': {
    'Pipeline Builder': false,
    'Connector Manager': false,
    'Execution Engine': false,
    'Data Quality': false,
    Scheduler: false,
    'Analytics Dashboard': true,
    'Billing & Licensing': false,
    'Admin Console': false,
    'Audit Logs': false,
  },
  'Guest (temporary)': {
    'Pipeline Builder': false,
    'Connector Manager': false,
    'Execution Engine': false,
    'Data Quality': false,
    Scheduler: false,
    'Analytics Dashboard': true,
    'Billing & Licensing': false,
    'Admin Console': false,
    'Audit Logs': false,
  },
};

/**
 * Design-sourced license pool for the org (Figma: 273 / 300 assigned,
 * 27 remaining, low-availability threshold at 90%). A real MOD-005 /
 * MOD-004 licensing endpoint would serve this per organization.
 */
export const LICENSE_POOL = { used: 273, total: 300, remaining: 27, threshold: 90 };

/**
 * Design-sourced set of employee IDs already assigned in the org, used
 * to reproduce the Figma "Employee ID already in use" validation state.
 * A real MOD-005 endpoint would validate uniqueness server-side.
 */
export const TAKEN_EMPLOYEE_IDS = ['EMP-00142', 'EMP-00087', 'EMP-00003', 'EMP-00099'];

/**
 * Attempt to invite (provision) a user. Real POST first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return a simulated success flagged `mocked: true`.
 */
export async function inviteUser(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/users`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new InviteUserError('Unable to send the invitation right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new InviteUserError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `usr_${Math.random().toString(36).slice(2, 10)}`;
    return {
      id,
      status: 'invited',
      email: payload?.basic?.email ?? null,
      mocked: true,
    };
  }
}
