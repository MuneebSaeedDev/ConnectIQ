/**
 * Data loader for the User Login History Screen (SCR-038, node
 * 109:14710, Figma page "Page 1", frame "User Login History Screen").
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no login-history /
 * session read endpoint exists yet (see docs/modules/module-plan.md).
 * `getUserLoginHistory` always attempts a real GET first and only falls
 * back to the design-sourced baseline below when the endpoint is
 * unreachable / returns non-JSON (defends against the Vite dev server's
 * own 200-OK HTML SPA fallback, mirroring the sibling
 * userActivityHistory.api.js / userDetails.api.js / userProfile.api.js
 * modules). The mocked result is flagged `mocked: true` so the UI can
 * disclose that nothing was really loaded.
 *
 * FIGMA VERIFICATION: node 109:14710 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The header (title +
 * "Review authentication events, login sessions, MFA…" subtitle, Refresh
 * / Save Filter / Export Login History actions), the user context card
 * (JS avatar, John Smith, Senior Data Engineer, john.smith@acmecorp.com,
 * Department/Team/Role/Account Status/Last Successful Login/Last Failed
 * Login, View User Details / Force Reset), the six summary stat cards
 * (Total Login Events 863 / Successful Logins 847 / Failed Attempts 16 /
 * Active Sessions 2 / MFA Challenges 831 / Suspicious Events 3), the
 * seven saved-view chips, the search + date-range filter row, the
 * eleven-column login-events table with its 12 seeded rows, the Active
 * Sessions panel, the pagination footer, and the right-hand Login Details
 * inspector (Authentication Summary, User Context, Device Information,
 * Network Information, Authentication Timeline, Technical Metadata +
 * actions) are all transcribed from the actual frame's text nodes, so
 * layout/content fidelity is `verified`. The 11 filter dropdowns rendered
 * as empty sublayer frames in the sparse metadata dump; their option sets
 * are derived from the visible table content (auth result / method / MFA
 * / device / risk), documented as `derived`, not independently re-pulled.
 * See docs/reviews/review-log.md.
 *
 * A real MOD-005 backend would serve the persisted login/session log for
 * `userId` from the org's auth/audit store, paginated and filterable.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class UserLoginHistoryError extends Error {}

/** Saved-view chips (node 109:15xxx "Saved views"). `authResult`/`risk`/
 *  `mfa` narrow the set each chip applies (undefined = no extra filter). */
export const SAVED_VIEWS = [
  { id: 'all', label: 'All Logins' },
  { id: 'failed', label: 'Failed Logins', authResult: 'Failed' },
  { id: 'suspicious', label: 'Suspicious Activity', authResult: 'Suspicious' },
  { id: 'active', label: 'Active Sessions', session: 'Active' },
  { id: 'mfa-failures', label: 'MFA Failures', mfa: 'Failed' },
  { id: 'new-device', label: 'New Device Logins', device: 'Unknown' },
  { id: 'high-risk', label: 'High Risk Events', risk: 'High' },
];

/** Distinct filter option lists, derived from the visible table content. */
export const AUTH_RESULTS = ['Successful', 'Failed', 'Suspicious', 'Warning', 'Expired'];
export const METHODS = ['SSO + MFA', 'SSO', 'Password'];
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
export const DEVICES = ['MacBook Pro', 'iPhone 15 Pro', 'iPad Air', 'Unknown'];

export const PLACEHOLDER_MARK = '•••'; // redacted-octet marker seen in the frame

/**
 * Design-sourced login-history record for the viewed user (node
 * 109:14710, "John Smith" / USR-004812). Read-only screen. A real
 * MOD-005 endpoint would return the paginated, filterable log.
 */
function buildBaseline(userId) {
  const id = userId || 'usr_smith';
  return {
    id,
    // User context card
    user: {
      name: 'John Smith',
      initials: 'JS',
      jobTitle: 'Senior Data Engineer',
      email: 'john.smith@acmecorp.com',
      department: 'Engineering',
      team: 'Platform Infra',
      role: 'Data Engineer',
      accountStatus: 'Active',
      lastSuccessfulLogin: 'Today 09:14 AM',
      lastFailedLogin: 'Aug 1 23:18 PM',
    },

    // Six summary stat cards
    stats: [
      { key: 'total', label: 'Total Login Events', value: '863', hint: 'Last 90 days', tone: 'default' },
      { key: 'success', label: 'Successful Logins', value: '847', hint: '98.1% success rate', tone: 'success' },
      { key: 'failed', label: 'Failed Attempts', value: '16', hint: '2 this week', tone: 'warning' },
      { key: 'sessions', label: 'Active Sessions', value: '2', hint: '1 primary device', tone: 'default' },
      { key: 'mfa', label: 'MFA Challenges', value: '831', hint: '98.3% pass rate', tone: 'default' },
      { key: 'suspicious', label: 'Suspicious Events', value: '3', hint: '1 flagged today', tone: 'danger' },
    ],

    // Design stat total. The seeded `events` below are only the first page
    // the frame shows; a real MOD-005 endpoint would paginate the full
    // 863-row set server-side (offset/limit) and return this as the total
    // count. Until then the table paginates client-side over the seeded
    // rows and this figure drives the "Total Login Events" stat + the
    // "Showing 1–12 of 863" footer wording.
    totalCount: 863,

    // Login events table — 12 seeded rows (page 1 of the design)
    events: buildEvents(),

    // Active Sessions panel (below the table) — 2 devices signed in
    activeSessions: [
      {
        id: 'sess_current', device: 'MacBook Pro 16"', current: true,
        browserOs: 'Chrome 126 / macOS 14.5', loginTime: 'Today 09:14 AM',
        lastActivity: 'Just now', duration: '3h 22m', status: 'Active',
      },
      {
        id: 'sess_iphone', device: 'iPhone 15 Pro', current: false,
        browserOs: 'Safari 17 / iOS 17.4', loginTime: 'Aug 1 17:32 PM',
        lastActivity: '2h ago', duration: '15h 42m', status: 'Active',
      },
    ],
  };
}

/** The 12 seeded login-event rows. The first row carries the full
 *  `detail` record shown in the Login Details inspector; the rest resolve
 *  to a graceful summary in the panel (a real backend serves per-event
 *  detail on demand). */
function buildEvents() {
  return [
    {
      id: 'evt_9a4c2d8f1b3e', loginTime: '2025-08-02 09:14:22', authResult: 'Successful',
      method: 'SSO + MFA', mfa: 'Verified', device: 'MacBook Pro', browser: 'Chrome 126',
      os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: 'Active', risk: 'Low',
      detail: {
        summary: [
          ['Event ID', 'evt_9a4c2d8f1b3e'], ['Login Time', '2025-08-02 09:14:22 PDT'],
          ['Auth Result', 'Successful Login'], ['Auth Method', 'SSO + MFA (TOTP)'],
          ['Session Duration', 'Active (3h 22m)'], ['Risk Level', 'Low'],
        ],
        userContext: [
          ['User', 'John Smith'], ['Role', 'Data Engineer'],
          ['Department', 'Engineering'], ['Team', 'Platform Infra'],
        ],
        device: [
          ['Device', 'MacBook Pro 16"'], ['Device Type', 'Desktop'],
          ['Browser', 'Chrome 126'], ['Browser Version', '126.0.6478.127'],
          ['Operating System', 'macOS 14.5 (Sonoma)'], ['Client App', 'Platform Web'],
        ],
        network: [
          ['Location', 'San Francisco, CA, US'], ['IP Address', '198.51.100.•••'],
          ['ISP', 'Acme Corp Network'], ['VPN / Proxy', 'Not detected'],
          ['Trusted Device', 'Yes — registered'],
        ],
        timeline: [
          ['Login Request Received', '09:14:22.000'], ['Credentials Validated', '09:14:22.112'],
          ['MFA Challenge Sent', '09:14:22.198'], ['MFA Verified', '09:14:22.304'],
          ['Session Created', '09:14:22.342'], ['Session Active', '—'],
        ],
        metadata: [
          ['Correlation ID', 'corr_7f3a1e9c4b2d'], ['Session ID', 'sess_4a8b2c6d9e1f'],
          ['Auth Provider', 'Okta SAML 2.0'], ['Identity Provider', 'Acme Corp IdP'],
          ['Request ID', 'req_1c3e5f7a9b2d'], ['Client Version', '3.14.2'],
        ],
      },
    },
    { id: 'evt_fail_2318', loginTime: '2025-08-01 23:18:44', authResult: 'Failed', method: 'Password', mfa: '—', device: 'Unknown', browser: 'Firefox 127', os: 'Windows 11', location: 'Moscow, RU', ip: '203.0.•••.•••', session: '—', risk: 'Critical' },
    { id: 'evt_ok_1732', loginTime: '2025-08-01 17:32:01', authResult: 'Successful', method: 'SSO + MFA', mfa: 'Verified', device: 'iPhone 15 Pro', browser: 'Safari 17', os: 'iOS 17.4', location: 'San Francisco, CA', ip: '198.51.100.•••', session: 'Active', risk: 'Low' },
    { id: 'evt_ok_0905', loginTime: '2025-08-01 09:05:33', authResult: 'Successful', method: 'SSO', mfa: 'Skipped', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '8h 15m', risk: 'Low' },
    { id: 'evt_susp_2244', loginTime: '2025-07-31 22:44:11', authResult: 'Suspicious', method: 'SSO + MFA', mfa: 'Verified', device: 'Unknown', browser: 'Chrome 125', os: 'Windows 10', location: 'Singapore, SG', ip: '203.•••.•••.•••', session: '—', risk: 'High' },
    { id: 'evt_ok_0922', loginTime: '2025-07-31 09:22:40', authResult: 'Successful', method: 'SSO + MFA', mfa: 'Verified', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '9h 18m', risk: 'Low' },
    { id: 'evt_fail_1548', loginTime: '2025-07-30 15:48:18', authResult: 'Failed', method: 'SSO + MFA', mfa: 'Failed', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '—', risk: 'Medium' },
    { id: 'evt_ok_1002', loginTime: '2025-07-30 10:02:55', authResult: 'Successful', method: 'SSO + MFA', mfa: 'Verified', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '5h 44m', risk: 'Low' },
    { id: 'evt_warn_1630', loginTime: '2025-07-29 16:30:22', authResult: 'Warning', method: 'SSO + MFA', mfa: 'Verified', device: 'iPad Air', browser: 'Safari 17', os: 'iPadOS 17.4', location: 'New York, NY', ip: '192.0.•••.•••', session: '2h 08m', risk: 'Medium' },
    { id: 'evt_ok_0911', loginTime: '2025-07-29 09:11:40', authResult: 'Successful', method: 'SSO + MFA', mfa: 'Verified', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '7h 19m', risk: 'Low' },
    { id: 'evt_exp_2005', loginTime: '2025-07-28 20:05:17', authResult: 'Expired', method: 'SSO', mfa: '—', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: 'Expired', risk: 'Low' },
    { id: 'evt_ok_0900', loginTime: '2025-07-28 09:00:44', authResult: 'Successful', method: 'SSO + MFA', mfa: 'Verified', device: 'MacBook Pro', browser: 'Chrome 126', os: 'macOS 14.5', location: 'San Francisco, CA', ip: '198.51.100.•••', session: '11h 04m', risk: 'Low' },
  ];
}

/**
 * Load a user's login history. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getUserLoginHistory(orgId, userId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}/login-history`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserLoginHistoryError('Unable to load login history right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.events) || !data.user) {
      throw new UserLoginHistoryError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(userId), mocked: true };
  }
}
