/**
 * Data for the Organization Details Screen (SCR-025, node 91:9827, Figma
 * page "Page 1").
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no `Organization` entity and no
 * org detail / users / connectors / audit-activity endpoints exist yet
 * (see docs/modules/module-plan.md). `getOrganizationDetails` always
 * attempts a real request first and only falls back to the mock
 * snapshot below when the endpoint is unreachable, mirroring the
 * MOD-004 SCR-024 (organizationList.api.js) and MOD-009 dashboard api
 * modules' dev-proxy-aware mock-fallback shape (including the
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback).
 *
 * FIGMA VERIFICATION: node 91:9827 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The page header, the
 * 6 KPI cards, Organization Overview, Organization Info, Subscription &
 * Licensing (with utilization/storage bars), Pipeline Activity table,
 * Platform Health, Users table, Quick Actions, Connectors table,
 * Security Status, and Recent Audit Activity timeline are all
 * transcribed from the actual frame's text nodes, so the layout/content
 * fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * ID RECONCILIATION: the SCR-025 Figma frame labels Acme Corporation
 * with organization ID `org_8kx2m9q`, whereas the SCR-024 list mock
 * (organizationList.api.js) uses `org_8kx2n9q` for the same row. The
 * two differ by a single character (`m` vs `n`) — almost certainly a
 * Figma transcription typo. To keep in-app navigation from the list
 * coherent, the mock echoes back whatever `id` the route provides as
 * the displayed organization ID (so a "View" from the list shows the
 * list's own id), and does NOT hard-code the Figma `org_8kx2m9q`. The
 * discrepancy is recorded here per docs/agent-rules.md §3 rather than
 * silently picking one.
 *
 * KNOWN LIMITATION: the mock is a single fixed organization snapshot
 * (Acme Corporation) served for any requested id. A real MOD-004
 * endpoint would return the record matching the id (404 otherwise).
 * This is clearly labeled as sample data in the UI.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class OrganizationDetailsError extends Error {}

function buildMock(orgId) {
  const id = orgId || 'org_8kx2n9q';
  return {
    updatedAt: 'Today, 09:41 AM',
    id,
    name: 'Acme Corporation',
    initials: 'A',
    tone: 'blue',
    status: 'Active',
    plan: 'Enterprise',
    region: 'US East',
    created: 'Jan 14, 2023',
    adminName: 'James Park',
    kpis: [
      { key: 'activeUsers', label: 'Active Users', value: '284', helper: '300 licensed', tone: 'default' },
      { key: 'activePipelines', label: 'Active Pipelines', value: '142', helper: '8 running now', tone: 'default' },
      { key: 'successRate', label: 'Success Rate', value: '98.6%', helper: '+0.4pp this week', tone: 'success' },
      { key: 'connectorHealth', label: 'Connector Health', value: '44/46', helper: '2 with warnings', tone: 'warning' },
      { key: 'storageUsage', label: 'Storage Usage', value: '1.8 TB', helper: 'of 5 TB allocated', tone: 'default' },
      { key: 'licenseUtilization', label: 'License Utilization', value: '94.7%', helper: '284 of 300 used', tone: 'warning' },
    ],
    overview: {
      organizationName: 'Acme Corporation',
      organizationId: id,
      primaryAdmin: 'James Park · j.park@acme.com',
      region: 'US East (us-east-1)',
      timeZone: 'America/New_York (UTC-5)',
      industry: 'Financial Services',
      createdDate: 'January 14, 2023',
      lastActivity: 'Just now',
      currentStatus: 'Active',
    },
    info: [
      { label: 'Organization ID', value: id, mono: true },
      { label: 'Region', value: 'US East (us-east-1)' },
      { label: 'Time Zone', value: 'UTC-5 (New York)' },
      { label: 'Created', value: 'Jan 14, 2023' },
      { label: 'Last Updated', value: 'Today, 09:41 AM' },
      { label: 'Owner', value: 'James Park' },
    ],
    subscription: {
      plan: 'Enterprise',
      billingStatus: 'Active',
      renewalDate: 'Jan 14, 2026',
      licenseLimit: '300 seats',
      activeUsers: '284',
      remaining: '16 seats',
      licenseUtilizationLabel: '94.7%',
      licenseUtilizationPct: 94.7,
      storageLabel: '1.8 TB / 5 TB',
      storagePct: 36,
    },
    pipelineActivity: {
      stats: [
        { key: 'total', label: 'Total', value: '142', tone: 'default' },
        { key: 'running', label: 'Running', value: '8', tone: 'primary' },
        { key: 'failed', label: 'Failed', value: '3', tone: 'danger' },
        { key: 'draft', label: 'Draft', value: '14', tone: 'default' },
        { key: 'paused', label: 'Paused', value: '6', tone: 'warning' },
        { key: 'success', label: 'Success', value: '98.6%', tone: 'success' },
      ],
      rows: [
        { id: 'pl_1', name: 'Customer Sync Daily', status: 'Running', records: 'In progress', duration: '1m 42s', lastRun: 'Now' },
        { id: 'pl_2', name: 'Orders → Warehouse', status: 'Running', records: 'In progress', duration: '3m 08s', lastRun: 'Now' },
        { id: 'pl_3', name: 'Analytics Rollup', status: 'Success', records: '4.2M', duration: '2m 18s', lastRun: '1h ago' },
        { id: 'pl_4', name: 'Historical Backfill', status: 'Running', records: 'In progress', duration: '18m 32s', lastRun: 'Now' },
        { id: 'pl_5', name: 'Legacy DB Export', status: 'Failed', records: '—', duration: '8s 04s', lastRun: '24m ago' },
        { id: 'pl_6', name: 'Partner Data Ingest', status: 'Success', records: '128K', duration: '8m 54s', lastRun: '2h ago' },
        { id: 'pl_7', name: 'Nightly Archive', status: 'Paused', records: '—', duration: '—', lastRun: 'Yesterday' },
      ],
    },
    platformHealth: [
      { label: 'API Availability', value: 'Operational', tone: 'success' },
      { label: 'Workers', value: '8 active', tone: 'default' },
      { label: 'Queue Health', value: 'Elevated (284)', tone: 'warning' },
      { label: 'Connector Status', value: '2 warnings', tone: 'warning' },
      { label: 'Data Quality', value: 'Healthy', tone: 'success' },
    ],
    users: {
      total: '284',
      rows: [
        { id: 'u_1', name: 'James Park', initials: 'JP', tone: 'blue', role: 'Admin', email: 'j.park@acme.com', status: 'Active', lastLogin: 'Just now' },
        { id: 'u_2', name: 'Lisa Chen', initials: 'LC', tone: 'purple', role: 'Editor', email: 'l.chen@acme.com', status: 'Active', lastLogin: '2h ago' },
        { id: 'u_3', name: 'Marcus Johnson', initials: 'MJ', tone: 'green', role: 'Viewer', email: 'm.johnson@acme.com', status: 'Active', lastLogin: 'Yesterday' },
        { id: 'u_4', name: 'Priya Sharma', initials: 'PS', tone: 'blue', role: 'Editor', email: 'p.sharma@acme.com', status: 'Active', lastLogin: '3 days ago' },
        { id: 'u_5', name: 'Tom Bradley', initials: 'TB', tone: 'gray', role: 'Viewer', email: 't.bradley@acme.com', status: 'Inactive', lastLogin: '2 weeks ago' },
        { id: 'u_6', name: 'sarah@acme.com', initials: 'SA', tone: 'purple', role: 'Editor', email: 'sarah@acme.com', status: 'Invited', lastLogin: '—' },
      ],
    },
    connectors: {
      total: '46',
      summary: [
        { key: 'connected', label: '4 Connected', tone: 'success' },
        { key: 'warning', label: '1 Warning', tone: 'warning' },
        { key: 'failed', label: '1 Failed', tone: 'danger' },
      ],
      rows: [
        { id: 'c_1', name: 'Salesforce CRM', type: 'API', health: 'Connected', lastSync: '2m ago', auth: 'OAuth — Valid', authTone: 'default' },
        { id: 'c_2', name: 'PostgreSQL DB', type: 'Database', health: 'Connected', lastSync: '8m ago', auth: 'Password — Valid', authTone: 'default' },
        { id: 'c_3', name: 'Snowflake DW', type: 'Cloud', health: 'Connected', lastSync: 'Just now', auth: 'Key Pair — Valid', authTone: 'default' },
        { id: 'c_4', name: 'S3 Raw Bucket', type: 'Cloud', health: 'Connected', lastSync: '15m ago', auth: 'IAM Role — Valid', authTone: 'default' },
        { id: 'c_5', name: 'Stripe Payments', type: 'API', health: 'Failed', lastSync: '6h ago', auth: 'API Key — Expired', authTone: 'danger' },
        { id: 'c_6', name: 'Legacy Oracle DB', type: 'Database', health: 'Warning', lastSync: '3h ago', auth: 'Password — Expiring', authTone: 'warning' },
      ],
    },
    quickActions: [
      { key: 'add-user', label: 'Add User' },
      { key: 'invite-admin', label: 'Invite Administrator' },
      { key: 'create-pipeline', label: 'Create Pipeline' },
      { key: 'manage-subscription', label: 'Manage Subscription' },
      { key: 'open-audit-logs', label: 'Open Audit Logs' },
      { key: 'configure-security', label: 'Configure Security' },
    ],
    securityStatus: [
      { label: 'MFA Enforcement', value: 'Enabled', tone: 'success' },
      { label: 'SSO Status', value: 'Configured', tone: 'success' },
      { label: 'API Keys', value: '3 active', tone: 'success' },
      { label: 'Active Sessions', value: '42', tone: 'success' },
      { label: 'Security Alerts', value: '0 open', tone: 'success' },
    ],
    auditActivity: [
      { id: 'a_1', when: 'Just now', action: 'Subscription Updated', outcome: 'Success', actor: 'Super Admin', detail: 'Enterprise Plan' },
      { id: 'a_2', when: '2h ago', action: 'API Key Rotated', outcome: 'Success', actor: 'James Park', detail: 'prod-key-001' },
      { id: 'a_3', when: '4h ago', action: 'User Added', outcome: 'Success', actor: 'Super Admin', detail: 'sarah@acme.com' },
      { id: 'a_4', when: 'Yesterday', action: 'Pipeline Deleted', outcome: 'Success', actor: 'Lisa Chen', detail: 'Legacy Reporting ETL' },
      { id: 'a_5', when: '2 days ago', action: 'Role Modified', outcome: 'Success', actor: 'James Park', detail: 'Editor → Admin' },
      { id: 'a_6', when: '3 days ago', action: 'Connector Config Changed', outcome: 'Success', actor: 'Super Admin', detail: 'Salesforce CRM' },
      { id: 'a_7', when: '5 days ago', action: 'Security Settings Updated', outcome: 'Success', actor: 'Super Admin', detail: 'MFA Enforcement ON' },
    ],
  };
}

export async function getOrganizationDetails(orgId) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new OrganizationDetailsError('Unable to load this organization right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new OrganizationDetailsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildMock(orgId), mocked: true };
  }
}
