/**
 * Data loader for the User Details Screen (SCR-035, node 105:9208, Figma
 * page "Page 1", frame "UserDetailsScreen").
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no user read endpoint
 * exists yet (see docs/modules/module-plan.md). `getUserDetails` always
 * attempts a real GET first and only falls back to the design-sourced
 * baseline below when the endpoint is unreachable / returns non-JSON
 * (defends against the Vite dev server's own 200-OK HTML SPA fallback,
 * mirroring the sibling editUser.api.js / addUser.api.js modules). The
 * mocked result is flagged `mocked: true` so the UI can disclose that
 * nothing was really loaded.
 *
 * FIGMA VERIFICATION: node 105:9208 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The hero header (JS
 * avatar, "John Smith", Active status pill, "Senior Data Engineer · Data
 * Engineering · Pipeline Core" subtitle, Engineer / MFA / SSO / Full
 * License chips, and the Reset Password / Suspend User / More / Edit User
 * header actions), the left rail (User Summary, Account Status, Security
 * Health checklist, License Summary, Quick Actions), and the eight
 * numbered content sections (1 User Profile, 2 Organization Assignment,
 * 3 Roles & Permissions w/ Engineer Effective Access Scope, 4 License
 * Information w/ Enabled Features grid, 5 Authentication & Security w/ the
 * "Last Successful Login" field + Administrative Actions, 6 Assigned
 * Resources, 7 Recent Activity, 8 Audit History) are transcribed from the
 * actual frame's text nodes, so layout/content fidelity is `verified`.
 * See docs/reviews/review-log.md.
 *
 * The Engineer Effective Access Scope copy + Enabled Features matrix are
 * shared design-sourced enumerations, re-exported from addUser.api.js for
 * a single import site. A real MOD-005 backend would serve the persisted
 * record for `userId` from the org's user directory.
 */

import { apiFetch, readJson } from '../../../services/api/client';
import { ROLE_ACCESS_SCOPE, FEATURE_ACCESS_BY_LICENSE } from './addUser.api';

export { ROLE_ACCESS_SCOPE, FEATURE_ACCESS_BY_LICENSE };

export class UserDetailsError extends Error {}

/**
 * Design-sourced detail record for the viewed user (node 105:9208,
 * "John Smith" / USR-004812). All fields are read-only on this screen —
 * mutations happen on the Edit User screen (SCR-034). A real MOD-005
 * endpoint would return the persisted record for `userId`.
 */
function buildBaseline(userId) {
  const id = userId || 'usr_smith';
  return {
    id,
    userId: 'USR-004812',
    employeeId: 'EMP-00089',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    initials: 'JS',
    email: 'j.smith@acme.com',
    status: 'Active',
    jobTitle: 'Senior Data Engineer',
    subtitle: 'Senior Data Engineer · Data Engineering · Pipeline Core',
    primaryRole: 'Engineer',
    licenseType: 'Full — Engineer',
    mfa: true,
    sso: true,

    // Left rail — Account Status
    accountStatus: {
      status: 'Active',
      lastLogin: 'Today 08:11 UTC',
      loginMethod: 'SSO — Google',
      invitationAccepted: 'Mar 5, 2024',
      accountAge: '148 days',
      memberSince: 'Mar 5, 2024',
    },

    // Left rail — Security Health checklist + metrics
    securityHealth: {
      checklist: [
        { key: 'mfa', label: 'MFA Enabled', ok: true },
        { key: 'sso', label: 'SSO Configured', ok: true },
        { key: 'password', label: 'Strong Password', ok: true },
        { key: 'verified', label: 'Email Verified', ok: true },
        { key: 'recovery', label: 'Recovery Method Set', ok: true },
        { key: 'ip', label: 'IP Restrictions', ok: false },
      ],
      passwordAge: '14 days',
      activeSessions: '1 session',
      failedLogins24h: '0 attempts',
    },

    // Left rail — License Summary
    license: {
      type: 'Full — Engineer',
      status: 'Active',
      assigned: 'Mar 5, 2024',
      expiration: 'No expiration',
      seat: '#0089',
      featuresLabel: '6 of 9 features',
    },

    // Section 1 — User Profile
    profile: [
      { label: 'Full Name', value: 'John Smith' },
      { label: 'Work Email', value: 'j.smith@acme.com' },
      { label: 'Employee ID', value: 'EMP-00089', mono: true },
      { label: 'User ID', value: 'USR-004812', mono: true },
      { label: 'Job Title', value: 'Senior Data Engineer' },
      { label: 'Phone Number', value: '+1 (628) 555-0174' },
      { label: 'Office Location', value: 'New York, NY' },
      { label: 'Account Type', value: 'Full Member' },
    ],

    // Section 2 — Organization Assignment (department/team/manager linkable)
    organization: {
      department: { label: 'Data Engineering', to: '/organizations/current/departments' },
      team: { label: 'Pipeline Core', to: '/organizations/current/teams' },
      manager: { label: 'Maria Rodriguez — Analytics Manager', to: '/users/usr_rodriguez' },
      businessUnit: 'Technology & Data',
      costCenter: 'CC-3210',
      reportingLine: 'Engineering › Data Platform',
    },

    // Section 3 — Roles & Permissions
    roles: {
      primaryRole: 'Engineer',
      permissionGroup: 'Standard Engineer Access',
      additionalRoles: 'Data Quality Reviewer',
      administrativePrivileges: 'None — Standard Access',
      resourceAccessProfile: 'Data Engineering Standard',
    },

    // Section 4 — License Information
    licenseInfo: {
      type: 'Full — Engineer',
      status: 'Active',
      assigned: 'Mar 5, 2024',
      expiration: 'No expiration (perpetual)',
      seatNumber: '#0089',
      lastVerified: 'Aug 1, 2026',
    },

    // Section 5 — Authentication & Security (13 read-only fields)
    security: [
      { label: 'Multi-Factor Authentication', value: 'Enabled — Authenticator App' },
      { label: 'Single Sign-On', value: 'Active — Google Workspace' },
      { label: 'Last Successful Login', value: 'Today 08:11 UTC' },
      { label: 'Last Login IP', value: '203.0.113.42' },
      { label: 'Login Method', value: 'SSO — Google' },
      { label: 'Password Age', value: '14 days' },
      { label: 'Password Last Changed', value: 'Aug 13, 2026' },
      { label: 'Failed Login Attempts (24h)', value: '0 attempts' },
      { label: 'Active Sessions', value: '1 session' },
      { label: 'Concurrent Session Limit', value: '3 sessions maximum' },
      { label: 'Allowed IP Range', value: 'None set' },
      { label: 'Account Expiration', value: 'No expiration' },
      { label: 'Recovery Method', value: 'Verified email' },
    ],

    // Section 6 — Assigned Resources
    resources: [
      { key: 'pipelines', label: 'Pipelines', count: 18, to: '/pipelines' },
      { key: 'connectors', label: 'Connectors', count: 6, to: '/data-sources' },
      { key: 'dataSources', label: 'Data Sources', count: 3, to: '/data-sources' },
      { key: 'scheduledJobs', label: 'Scheduled Jobs', count: 12, to: '/pipelines' },
      { key: 'dashboards', label: 'Dashboards', count: 0, to: '/dashboard' },
      { key: 'reports', label: 'Reports', count: 2, to: '/dashboard' },
    ],

    // Section 7 — Recent Activity (tagged)
    recentActivity: [
      { id: 'ra_1', tag: 'Auth', label: 'Logged in via SSO (Google)', meta: 'Today 08:11 UTC' },
      { id: 'ra_2', tag: 'Pipeline', label: 'Executed pipeline “Orders → Warehouse”', meta: 'Today 07:52 UTC' },
      { id: 'ra_3', tag: 'Profile', label: 'Job title updated to Senior Data Engineer', meta: 'Jul 29, 2026' },
      { id: 'ra_4', tag: 'Connector', label: 'Configured Snowflake connector', meta: 'Jul 27, 2026' },
      { id: 'ra_5', tag: 'Pipeline', label: 'Created pipeline “Events Stream”', meta: 'Jul 24, 2026' },
      { id: 'ra_6', tag: 'Auth', label: 'Password reset by administrator', meta: 'Jul 22, 2026' },
      { id: 'ra_7', tag: 'Data Quality', label: 'Added data quality rule set', meta: 'Jun 18, 2026' },
      { id: 'ra_8', tag: 'Role', label: 'Role assigned — Analyst', meta: 'Jun 14, 2026' },
    ],

    // Section 8 — Audit History (actor-attributed)
    auditHistory: [
      { id: 'ah_1', action: 'Primary role changed Analyst → Engineer', actor: 'admin@acme.com', meta: 'Jul 29, 2026 · 14:02 UTC' },
      { id: 'ah_2', action: 'Department transferred Analytics Platform → Data Engineering', actor: 'admin@acme.com', meta: 'Jul 29, 2026 · 14:01 UTC' },
      { id: 'ah_3', action: 'License upgraded Full — Analyst → Full — Engineer', actor: 'admin@acme.com', meta: 'Jul 29, 2026 · 13:58 UTC' },
      { id: 'ah_4', action: 'Password reset issued', actor: 'security@acme.com', meta: 'Jul 22, 2026 · 09:14 UTC' },
      { id: 'ah_5', action: 'MFA enabled', actor: 'j.smith@acme.com', meta: 'Mar 6, 2024 · 10:20 UTC' },
      { id: 'ah_6', action: 'Account created via invitation', actor: 'admin@acme.com', meta: 'Mar 5, 2024 · 16:45 UTC' },
    ],
  };
}

/**
 * Load a user's detail record. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getUserDetails(orgId, userId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserDetailsError('Unable to load this user right now.');
    }
    const data = await readJson(res);
    if (!data || !data.userId || !data.profile) {
      throw new UserDetailsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(userId), mocked: true };
  }
}
