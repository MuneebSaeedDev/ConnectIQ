/**
 * Data for the User List Screen (SCR-032, node 101:4147, Figma page
 * "Page 1"), including the per-user UserDrawer (node 101:5921).
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no user list / invite
 * / suspend / activate / assign-role / assign-department / assign-team
 * endpoints exist yet (see docs/modules/module-plan.md). User creation
 * is invitation-driven (admin-invite, not self-registration) per
 * docs/agent-rules.md §10.1, so the primary action is "Invite User",
 * not "Create User". `getUserList` always attempts a real request first
 * and only falls back to the mock snapshot below when the endpoint is
 * unreachable, mirroring the SCR-030 team-management api module's
 * dev-proxy-aware mock-fallback shape (including the SCR-014-discovered
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback).
 *
 * FIGMA VERIFICATION: node 101:4147 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The 6 KPI cards
 * (Total Users, Active Users, Pending Invitations, Administrators,
 * License Utilization 91% / 27 of 300 remaining, Inactive Accounts),
 * the license-threshold warning banner, the toolbar filters
 * (search + Role / Department / Team / Status / Account Type / Last
 * Login + sort), the bulk-action set (Assign Role / Assign Department /
 * Assign Team / Activate / Suspend / Resend Invite / Export / Delete),
 * the 16 visible user rows (name, job title, email, role, department,
 * team, status pill [Active / Locked / Pending / Suspended], last
 * login, MFA/SSO security badges), the "Showing 16 of 247 users"
 * footer, and the Sarah Chen UserDrawer (EMP-00142, User Information /
 * Account Summary / Activity Summary / Recent Events) are all
 * transcribed from the actual frame's text nodes, so that content's
 * fidelity is `verified`.
 *
 * KNOWN LIMITATION: only the 16 visible rows are transcribed from the
 * Figma frame; the "of 247" total is Figma-verified but the remaining
 * rows do not exist in the design. The detailed UserDrawer breakdown
 * (activity events, login/session counters) is Figma-verified for Sarah
 * Chen only — other users expose their (real) row-level fields and a
 * labeled note that the full activity/profile detail loads from the
 * MOD-005 user service. A real endpoint would accept the org scope +
 * query params (search, role, department, team, status, accountType,
 * lastLogin, sort, page) and return matching rows plus per-user detail.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class UserListError extends Error {}

const MOCK_USER_LIST = {
  updatedAt: 'just now',
  organizationName: 'Acme Corporation',
  license: { used: 273, total: 300, remaining: 27, percent: 91, threshold: 90 },
  kpis: [
    { key: 'total', label: 'Total Users', value: '247', helper: 'Across 24 departments', tone: 'default' },
    { key: 'active', label: 'Active Users', value: '219', helper: '89% of all accounts', tone: 'success' },
    { key: 'pending', label: 'Pending Invitations', value: '12', helper: 'Awaiting first sign-in', tone: 'warning' },
    { key: 'admins', label: 'Administrators', value: '8', helper: 'Org & department admins', tone: 'default' },
    { key: 'license', label: 'License Utilization', value: '91%', helper: '27 of 300 remaining', tone: 'warning' },
    { key: 'inactive', label: 'Inactive Accounts', value: '16', helper: 'Locked, suspended or idle', tone: 'danger' },
  ],
  roleFilters: ['All roles', 'Administrator', 'Manager', 'Engineer', 'Analyst', 'Viewer'],
  departmentFilters: ['All departments', 'Data Engineering', 'Analytics Platform', 'Customer Data', 'BI & Reporting', 'ML Infrastructure'],
  teamFilters: ['All teams', 'Pipeline Core', 'Analytics Core', 'Feature Engineering', 'Quality Ops', 'Platform Infra', 'Event Streaming'],
  statusFilters: ['All statuses', 'Active', 'Locked', 'Pending', 'Suspended'],
  accountTypeFilters: ['All account types', 'Org Admin', 'Dept Manager', 'Team Lead', 'Standard', 'Guest'],
  lastLoginFilters: ['Any time', 'Today', 'Last 7 days', 'Last 30 days', 'Over 30 days', 'Never'],
  sortOptions: ['Name', 'Role', 'Last Login', 'Created', 'Status'],
  total: 247,
  rows: [
    { id: 'usr_chen', name: 'Sarah Chen', initials: 'SC', tone: 'blue', title: 'Senior Data Engineer', email: 'chen@acme.com', role: 'Engineer', accountType: 'Team Lead', department: 'Data Engineering', team: 'Pipeline Core', status: 'Active', lastLogin: '2 hours ago', loginMinutes: 120, license: 'Assigned', mfa: true, sso: true, created: 'Jan 14, 2023', employeeId: 'EMP-00142' },
    { id: 'usr_park', name: 'James Park', initials: 'JP', tone: 'purple', title: 'Analytics Lead', email: 'park@acme.com', role: 'Manager', accountType: 'Team Lead', department: 'Analytics Platform', team: 'Analytics Core', status: 'Active', lastLogin: '5 hours ago', loginMinutes: 300, license: 'Assigned', mfa: true, sso: false, created: 'Jan 30, 2023', employeeId: 'EMP-00087' },
    { id: 'usr_alaziz', name: 'Fatima Al-Aziz', initials: 'FA', tone: 'blue', title: 'Pipeline Engineer', email: 'alaziz@acme.com', role: 'Engineer', accountType: 'Standard', department: 'Data Engineering', team: 'Pipeline Core', status: 'Active', lastLogin: 'Yesterday', loginMinutes: 1440, license: 'Assigned', mfa: false, sso: false, created: 'Feb 8, 2023', employeeId: 'EMP-00201' },
    { id: 'usr_zhang', name: 'William Zhang', initials: 'WZ', tone: 'orange', title: 'Feature Engineer', email: 'zhang@acme.com', role: 'Engineer', accountType: 'Standard', department: 'ML Infrastructure', team: 'Feature Engineering', status: 'Active', lastLogin: 'Today', loginMinutes: 30, license: 'Assigned', mfa: true, sso: false, created: 'Jun 6, 2023', employeeId: 'EMP-00318' },
    { id: 'usr_rodriguez', name: 'Maria Rodriguez', initials: 'MR', tone: 'purple', title: 'Analytics Manager', email: 'rodriguez@acme.com', role: 'Manager', accountType: 'Dept Manager', department: 'Analytics Platform', team: 'Analytics Core', status: 'Active', lastLogin: 'Today', loginMinutes: 90, license: 'Assigned', mfa: true, sso: true, created: 'Mar 3, 2023', employeeId: 'EMP-00112' },
    { id: 'usr_wilson', name: 'Tom Wilson', initials: 'TW', tone: 'red', title: 'Data Quality Lead', email: 'wilson@acme.com', role: 'Engineer', accountType: 'Team Lead', department: 'Customer Data', team: 'Quality Ops', status: 'Locked', lastLogin: '3 days ago', loginMinutes: 4320, license: 'Assigned', mfa: false, sso: false, created: 'Mar 12, 2023', employeeId: 'EMP-00145' },
    { id: 'usr_nakamura', name: 'Emily Nakamura', initials: 'EN', tone: 'teal', title: 'Analytics Analyst', email: 'nakamura@acme.com', role: 'Analyst', accountType: 'Standard', department: 'Analytics Platform', team: 'Analytics Core', status: 'Pending', lastLogin: 'Never', loginMinutes: Number.MAX_SAFE_INTEGER, license: 'Pending', mfa: false, sso: false, created: 'Aug 18, 2026', employeeId: '—' },
    { id: 'usr_lee', name: 'David Lee', initials: 'DL', tone: 'blue', title: 'System Administrator', email: 'lee@acme.com', role: 'Administrator', accountType: 'Org Admin', department: 'Data Engineering', team: 'Platform Infra', status: 'Active', lastLogin: '4 hours ago', loginMinutes: 240, license: 'Assigned', mfa: true, sso: true, created: 'Jan 14, 2023', employeeId: 'EMP-00003' },
    { id: 'usr_ricci', name: 'Lisa Ricci', initials: 'LR', tone: 'blue', title: 'Platform Infrastructure Lead', email: 'ricci@acme.com', role: 'Engineer', accountType: 'Team Lead', department: 'Data Engineering', team: 'Platform Infra', status: 'Active', lastLogin: 'Yesterday', loginMinutes: 1500, license: 'Assigned', mfa: true, sso: false, created: 'Jan 22, 2023', employeeId: 'EMP-00099' },
    { id: 'usr_okafor', name: 'Kevin Okafor', initials: 'KO', tone: 'orange', title: 'ML Engineer', email: 'okafor@acme.com', role: 'Engineer', accountType: 'Standard', department: 'ML Infrastructure', team: 'Feature Engineering', status: 'Active', lastLogin: 'Today', loginMinutes: 15, license: 'Assigned', mfa: true, sso: false, created: 'Apr 4, 2023', employeeId: 'EMP-00230' },
    { id: 'usr_sharma', name: 'Priya Sharma', initials: 'PS', tone: 'red', title: 'Customer Data Analyst', email: 'sharma@acme.com', role: 'Analyst', accountType: 'Standard', department: 'Customer Data', team: 'Quality Ops', status: 'Active', lastLogin: '2 days ago', loginMinutes: 2880, license: 'Assigned', mfa: false, sso: false, created: 'May 9, 2023', employeeId: 'EMP-00256' },
    { id: 'usr_johnson', name: 'Marcus Johnson', initials: 'MJ', tone: 'blue', title: 'Data Engineer', email: 'johnson@acme.com', role: 'Engineer', accountType: 'Team Lead', department: 'Data Engineering', team: 'Pipeline Core', status: 'Suspended', lastLogin: '14 days ago', loginMinutes: 20160, license: 'Suspended', mfa: false, sso: false, created: 'Feb 20, 2023', employeeId: 'EMP-00131' },
    { id: 'usr_brooks', name: 'Rachel Brooks', initials: 'RB', tone: 'gray', title: 'Executive Stakeholder', email: 'brooks@acme.com', role: 'Viewer', accountType: 'Guest', department: 'BI & Reporting', team: '—', status: 'Active', lastLogin: '5 days ago', loginMinutes: 7200, license: 'Assigned', mfa: true, sso: true, created: 'Jul 15, 2023', employeeId: 'EMP-00402' },
    { id: 'usr_thompson', name: 'Alex Thompson', initials: 'AT', tone: 'red', title: 'Connector Engineer', email: 'thompson@acme.com', role: 'Engineer', accountType: 'Standard', department: 'Customer Data', team: 'Event Streaming', status: 'Active', lastLogin: 'Today', loginMinutes: 45, license: 'Assigned', mfa: false, sso: true, created: 'Sep 1, 2023', employeeId: 'EMP-00355' },
    { id: 'usr_petrov', name: 'Nadia Petrov', initials: 'NP', tone: 'purple', title: 'Data Analyst', email: 'petrov@acme.com', role: 'Analyst', accountType: 'Standard', department: 'Analytics Platform', team: 'Event Streaming', status: 'Pending', lastLogin: 'Never', loginMinutes: Number.MAX_SAFE_INTEGER, license: 'Pending', mfa: false, sso: false, created: 'Aug 20, 2026', employeeId: '—' },
    { id: 'usr_ward', name: 'Chris Ward', initials: 'CW', tone: 'blue', title: 'Data Architect', email: 'ward@acme.com', role: 'Engineer', accountType: 'Team Lead', department: 'Data Engineering', team: 'Platform Infra', status: 'Active', lastLogin: 'Yesterday', loginMinutes: 1560, license: 'Assigned', mfa: true, sso: false, created: 'Jul 20, 2023', employeeId: 'EMP-00178' },
  ],
  // Figma-verified activity + account detail for the Sarah Chen (SC)
  // drawer only (node 101:5921). Other users expose their real
  // row-level fields but no activity/session breakdown until MOD-005
  // ships — the drawer labels that boundary.
  details: {
    usr_chen: {
      account: [
        { label: 'Total Logins', value: '1,247' },
        { label: 'Failed Attempts', value: '2' },
        { label: 'Days Active', value: '318' },
        { label: 'Last Password Change', value: 'Mar 4, 2026' },
      ],
      events: [
        { action: 'Logged in', detail: 'from San Francisco, CA', when: '2 hours ago' },
        { action: 'Modified pipeline', detail: 'Customer ETL Daily', when: 'Yesterday' },
        { action: 'Executed pipeline', detail: 'Finance Reconciliation', when: '3 days ago' },
        { action: 'Password changed', detail: 'Self-service reset', when: 'Mar 4, 2026' },
      ],
    },
  },
};

export async function getUserList(orgId, { search, role, department, team, status, accountType, lastLogin } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role && role !== 'All roles') params.set('role', role);
    if (department && department !== 'All departments') params.set('department', department);
    if (team && team !== 'All teams') params.set('team', team);
    if (status && status !== 'All statuses') params.set('status', status);
    if (accountType && accountType !== 'All account types') params.set('accountType', accountType);
    if (lastLogin && lastLogin !== 'Any time') params.set('lastLogin', lastLogin);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/users${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserListError('Unable to load users right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new UserListError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_USER_LIST, mocked: true };
  }
}
