/**
 * Data loader for the User Activity History Screen (SCR-037, node
 * 109:13321, Figma page "Page 1", frame "User Activity History Screen").
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no user-activity read
 * endpoint exists yet (see docs/modules/module-plan.md).
 * `getUserActivityHistory` always attempts a real GET first and only
 * falls back to the design-sourced baseline below when the endpoint is
 * unreachable / returns non-JSON (defends against the Vite dev server's
 * own 200-OK HTML SPA fallback, mirroring the sibling
 * userDetails.api.js / userProfile.api.js modules). The mocked result is
 * flagged `mocked: true` so the UI can disclose that nothing was really
 * loaded.
 *
 * FIGMA VERIFICATION: node 109:13321 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The header (title +
 * "Review authentication events, operational activity, administrative
 * changes, resource access, and audit records for this user." subtitle,
 * Refresh / Save Filter / Export Activity History actions), the user
 * context strip (JS avatar, John Smith, Senior Data Engineer,
 * john.smith@acmecorp.com, Department/Team/Role/Account Status/Last
 * Login/Member Since, "View User Details"), the six summary stat cards
 * (Total Activities 2,847 / Login Events 186 / Pipeline Actions 1,204 /
 * Administrative 38 / Security Events 12 / Failed Operations 29), the
 * seven saved-view tabs, the filter row, the eight-column activity table
 * with its 12 seeded rows, the pagination footer, and the right-hand
 * Activity Details inspector (Event Summary, User Context, Resource
 * Information, Activity Timeline, Technical Metadata + actions) are all
 * transcribed from the actual frame's text nodes, so layout/content
 * fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * A real MOD-005 backend would serve the persisted activity log for
 * `userId` from the org's audit/event store, paginated and filterable.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class UserActivityHistoryError extends Error {}

/** Saved-view tabs (node 109:13xxx "Saved views"). `key` doubles as the
 *  activity-category filter each tab applies (null = no category filter). */
export const SAVED_VIEWS = [
  { id: 'all', label: 'All Activity', category: null },
  { id: 'login', label: 'Login History', category: 'Authentication' },
  { id: 'failed', label: 'Failed Logins', status: 'Failed', category: 'Authentication' },
  { id: 'pipeline', label: 'Pipeline Activity', category: 'Pipelines' },
  { id: 'admin', label: 'Administrative Changes', category: 'Administrative' },
  { id: 'security', label: 'Security Events', category: 'Security' },
  { id: 'connector', label: 'Connector Activity', category: 'Connectors' },
];

/** Distinct filter option lists, design-sourced from the table content. */
export const ACTIVITY_TYPES = ['Authentication', 'Pipelines', 'Resources', 'Connectors', 'Administrative', 'Security'];
export const STATUSES = ['Success', 'Failed', 'Warning'];
export const SEVERITIES = ['Info', 'Low', 'Medium', 'High', 'Critical'];

export const PLACEHOLDER_MARK = '•••'; // redacted-tail marker seen in the frame

/**
 * Design-sourced activity-history record for the viewed user (node
 * 109:13321, "John Smith" / USR-004812). Read-only screen. A real
 * MOD-005 endpoint would return the paginated, filterable log.
 */
function buildBaseline(userId) {
  const id = userId || 'usr_smith';
  return {
    id,
    // User context strip
    user: {
      name: 'John Smith',
      initials: 'JS',
      jobTitle: 'Senior Data Engineer',
      email: 'john.smith@acmecorp.com',
      department: 'Engineering',
      team: 'Platform Infra',
      role: 'Data Engineer',
      accountStatus: 'Active',
      lastLogin: 'Today 08:42 AM',
      memberSince: '2022-09-14',
    },

    // Six summary stat cards
    stats: [
      { key: 'total', label: 'Total Activities', value: '2,847', hint: 'Last 90 days', tone: 'default' },
      { key: 'login', label: 'Login Events', value: '186', hint: '14 this week', tone: 'default' },
      { key: 'pipeline', label: 'Pipeline Actions', value: '1,204', hint: '43 today', tone: 'default' },
      { key: 'admin', label: 'Administrative', value: '38', hint: '3 this month', tone: 'warning' },
      { key: 'security', label: 'Security Events', value: '12', hint: '2 flagged', tone: 'danger' },
      { key: 'failed', label: 'Failed Operations', value: '29', hint: '1.0% failure rate', tone: 'danger' },
    ],

    // Design stat total. The seeded `activities` below are only the first
    // page the frame shows; a real MOD-005 endpoint would paginate the full
    // 2,847-row set server-side (offset/limit) and return this as the total
    // count. Until then the table paginates client-side over the seeded rows
    // and this figure drives the "Total Activities" stat card only.
    totalCount: 2847,

    // Activity table — 12 seeded rows (page 1 of the design)
    activities: [
      {
        id: 'evt_4f8a3d1c9e2b', timestamp: '2025-08-02 09:14:22', activity: 'Successful Login',
        icon: 'auth', category: 'Authentication', resource: 'Platform Web', action: 'Login',
        status: 'Success', severity: 'Info', source: 'Chrome 126 · macOS',
        detail: {
          summary: [
            ['Event', 'Successful Login'], ['Event ID', 'evt_4f8a3d1c9e2b'],
            ['Timestamp', '2025-08-02 09:14:22 PDT'], ['Duration', '342 ms'],
            ['Category', 'Authentication'], ['Action', 'Login'],
          ],
          userContext: [
            ['User', 'John Smith'], ['Role', 'Data Engineer'], ['Department', 'Engineering'],
            ['Team', 'Platform Infra'], ['Auth Method', 'SSO + MFA (TOTP)'],
          ],
          resource: [
            ['Resource Type', 'Platform Web'], ['Resource Name', 'Enterprise ETL Platform'],
            ['Resource ID', 'res_platform_web'], ['Related Pipeline', '—'], ['Related Connector', '—'],
          ],
          timeline: [
            ['Request Received', '09:14:22.000'], ['Authorization Completed', '09:14:22.148'],
            ['MFA Verified', '09:14:22.290'], ['Session Established', '09:14:22.338'],
            ['Operation Finished', '09:14:22.342'],
          ],
          metadata: [
            ['Correlation ID', 'corr_9b2e4a7f1c3d'], ['Session ID', 'sess_7c1d8e2f5a09'],
            ['Request ID', 'req_2a4b6c8d1e3f'], ['Client Type', 'Browser'],
            ['Browser', 'Chrome 126'], ['OS', 'macOS 14.5'], ['IP Address', '198.51.100.•••'],
          ],
        },
      },
      { id: 'evt_pipe_0855', timestamp: '2025-08-02 08:55:10', activity: 'Pipeline Executed', icon: 'pipeline', category: 'Pipelines', resource: 'customer_sync_prod', action: 'Execute', status: 'Success', severity: 'Info', source: 'Scheduler' },
      { id: 'evt_data_0844', timestamp: '2025-08-02 08:44:07', activity: 'Dataset Accessed', icon: 'resource', category: 'Resources', resource: 'orders_warehouse_v3', action: 'Read', status: 'Success', severity: 'Info', source: 'API Token' },
      { id: 'evt_fail_2318', timestamp: '2025-08-01 23:18:44', activity: 'Failed Login Attempt', icon: 'auth', category: 'Authentication', resource: 'Platform Web', action: 'Login', status: 'Failed', severity: 'High', source: 'Unknown · 203.0.113.42' },
      { id: 'evt_conn_1732', timestamp: '2025-08-01 17:32:01', activity: 'Connector Updated', icon: 'connector', category: 'Connectors', resource: 'Salesforce CRM v2', action: 'Update', status: 'Success', severity: 'Low', source: 'Platform Web' },
      { id: 'evt_pipe_1510', timestamp: '2025-08-01 15:10:59', activity: 'Pipeline Execution Failed', icon: 'pipeline', category: 'Pipelines', resource: 'inventory_etl_daily', action: 'Execute', status: 'Failed', severity: 'Medium', source: 'Scheduler' },
      { id: 'evt_rpt_1428', timestamp: '2025-08-01 14:28:33', activity: 'Report Generated', icon: 'resource', category: 'Resources', resource: 'Q2 Revenue Summary', action: 'Generate', status: 'Success', severity: 'Info', source: 'Platform Web' },
      { id: 'evt_role_1104', timestamp: '2025-08-01 11:04:12', activity: 'Role Updated', icon: 'admin', category: 'Administrative', resource: 'John Smith', action: 'Role Change', status: 'Success', severity: 'Medium', source: 'Admin Console' },
      { id: 'evt_api_1655', timestamp: '2025-07-31 16:55:08', activity: 'API Token Used', icon: 'resource', category: 'Resources', resource: 'CI Pipeline Runner', action: 'API Call', status: 'Success', severity: 'Info', source: 'CI/CD · 10.0.0.•••' },
      { id: 'evt_susp_0922', timestamp: '2025-07-31 09:22:40', activity: 'Suspicious Login Detected', icon: 'security', category: 'Security', resource: 'Platform Web', action: 'Login', status: 'Warning', severity: 'Critical', source: 'Unknown · 198.•••' },
      { id: 'evt_sync_1348', timestamp: '2025-07-30 13:48:18', activity: 'Synchronization Completed', icon: 'connector', category: 'Connectors', resource: 'Snowflake DWH', action: 'Sync', status: 'Success', severity: 'Info', source: 'Scheduler' },
      { id: 'evt_mfa_1000', timestamp: '2025-07-30 10:00:00', activity: 'MFA Verification', icon: 'auth', category: 'Authentication', resource: 'Platform Web', action: 'MFA', status: 'Success', severity: 'Info', source: 'Chrome 126 · macOS' },
    ],
  };
}

/**
 * Load a user's activity history. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getUserActivityHistory(orgId, userId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}/activity`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserActivityHistoryError('Unable to load activity history right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.activities) || !data.user) {
      throw new UserActivityHistoryError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(userId), mocked: true };
  }
}
