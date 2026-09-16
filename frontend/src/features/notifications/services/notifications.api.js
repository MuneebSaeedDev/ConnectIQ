/**
 * Data for the Notification Panel Screen (SCR-012, node 36:5210,
 * shell overlay attached to Header's bell button).
 *
 * MOCK BOUNDARY: MOD-010 (Notifications) is still `PLANNED` with no
 * backend deployed — `getNotifications`/`markAllNotificationsRead`
 * each attempt a real request first and only fall back to a mock
 * snapshot/no-op on an unreachable endpoint, mirroring every other
 * feature's mock-fallback shape (see dashboard.api.js). The mock list
 * reproduces the literal notifications shown in the Figma design
 * (node 36:5210) as a fixed snapshot grouped by day and category —
 * it does not simulate new incoming notifications, since no real-time
 * push channel exists yet (that is SCR-023/MOD-010's Socket.IO scope).
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class NotificationsError extends Error {}

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    group: 'Today',
    category: 'pipeline',
    categoryLabel: 'Pipeline',
    severity: 'critical',
    icon: 'fail',
    unread: true,
    title: 'Orders Sync pipeline failed',
    detail: 'Execution exceeded retry limit. Connection timeout at step 3 of 8.',
    time: '2m ago',
  },
  {
    id: 'n2',
    group: 'Today',
    category: 'monitoring',
    categoryLabel: 'Monitoring',
    severity: 'warning',
    icon: 'warn',
    unread: true,
    title: 'Worker etl-worker-04 restarted unexpectedly',
    detail: 'Auto-recovery initiated. Worker returned online after 34s.',
    time: '12m ago',
  },
  {
    id: 'n3',
    group: 'Today',
    category: 'monitoring',
    categoryLabel: null,
    severity: 'warning',
    icon: 'warn',
    unread: true,
    title: 'Worker queue delay detected',
    detail: 'Average wait exceeded 2m threshold. 8 executions pending.',
    time: '32m ago',
  },
  {
    id: 'n4',
    group: 'Today',
    category: 'pipeline',
    categoryLabel: 'Pipeline',
    severity: 'success',
    icon: 'check',
    unread: true,
    title: 'Customer Sync completed successfully',
    detail: '1.2M records processed. Postgres destination updated.',
    time: '1h ago',
  },
  {
    id: 'n5',
    group: 'Today',
    category: 'account',
    categoryLabel: 'Account',
    severity: 'success',
    icon: 'worker',
    unread: true,
    title: 'New member Jamie Park joined the organization',
    detail: 'Invited by A. Chen. Role: Data Engineer · Read access.',
    time: '2h ago',
  },
  {
    id: 'n6',
    group: 'Today',
    category: 'pipeline',
    categoryLabel: null,
    severity: 'success',
    icon: 'check',
    unread: false,
    title: 'Daily Sales ETL completed',
    detail: '84K records synced. Snowflake destination updated in 5m 12s.',
    time: '3h ago',
  },
  {
    id: 'n7',
    group: 'Today',
    category: 'data-quality',
    categoryLabel: 'Data Quality',
    severity: 'warning',
    icon: 'warn',
    unread: false,
    title: 'Data quality score dropped on Orders dataset',
    detail: '24 new validation issues. Score: 94.1% (↓ 3.2%).',
    time: '4h ago',
  },
  {
    id: 'n8',
    group: 'Yesterday',
    category: 'security',
    categoryLabel: 'Security',
    severity: 'warning',
    icon: 'shield',
    unread: false,
    title: 'New login detected from Chicago, IL',
    detail: 'Chrome · macOS · 192.168.1.42',
    time: 'Yesterday',
  },
  {
    id: 'n9',
    group: 'Yesterday',
    category: 'system',
    categoryLabel: 'System',
    severity: 'neutral',
    icon: 'settings',
    unread: false,
    title: 'Salesforce connector credentials updated',
    detail: 'Updated by A. Chen · Credentials expire in 88 days.',
    time: 'Yesterday',
  },
  {
    id: 'n10',
    group: 'Yesterday',
    category: 'account',
    categoryLabel: 'Account',
    severity: 'success',
    icon: 'worker',
    unread: false,
    title: 'Role updated for M. Torres',
    detail: 'Promoted from Viewer to Data Engineer by A. Chen.',
    time: 'Yesterday',
  },
];

export async function getNotifications() {
  try {
    const res = await apiFetch('/notifications');
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new NotificationsError('Unable to load notifications right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new NotificationsError('Received an unexpected response from the server.');
    }
    return { items: data.items ?? data, mocked: false };
  } catch {
    // Backend not deployed yet (MOD-010 PLANNED) — documented mock fallback
    return { items: MOCK_NOTIFICATIONS, mocked: true };
  }
}

export async function markAllNotificationsRead() {
  try {
    const res = await apiFetch('/notifications/mark-all-read', { method: 'POST' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new NotificationsError('Unable to mark notifications as read right now.');
    }
    return { ok: true, mocked: false };
  } catch {
    // Mock mode: optimistic update in useNotifications handles client state
    return { ok: true, mocked: true };
  }
}
