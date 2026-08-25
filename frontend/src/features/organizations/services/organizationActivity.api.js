/**
 * Data for the Organization Activity Screen (SCR-031, node 99:2052,
 * Figma page "Page 1"), including the per-event DetailDrawer
 * (node 99:3801) and the inline expandable Event Timeline row.
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no activity / audit-event stream and no
 * event-detail / export / saved-view endpoints exist yet (see
 * docs/modules/module-plan.md). `getOrganizationActivity` always
 * attempts a real request first (scoped to the organization in the
 * route) and only falls back to the mock snapshot below when the
 * endpoint is unreachable, mirroring the SCR-030 team-management api
 * module's dev-proxy-aware mock-fallback shape (including the
 * SCR-014-discovered content-type check against the Vite dev server's
 * own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 99:2052 was inspected this session via the
 * Figma MCP (get_screenshot on 99:2052 + get_design_context on the
 * nested drawer 99:3801). The KPI values/labels (1,847 / 43 / 28 / 934
 * / 17 / 9), the saved-view tab set, the filter toolbar, the activity
 * table columns, the inline expandable timeline pattern, and the full
 * "Pipeline Execution Failed" (EVT-0841) drawer — event summary, actor,
 * resource, event timeline, schema-mismatch error banner, and technical
 * metadata — are transcribed from the actual frame and are `verified`.
 * The masked source-IP octet (10.0.4.●●● / 203.0.113.●●) is preserved
 * exactly as the design masks it.
 *
 * DERIVED (not frame-verified): the individual event ROWS below, their
 * per-event timelines, and the KPI helper subtitles are SAMPLE data,
 * internally consistent with the verified structure but NOT a
 * one-to-one transcription of every text node in the frame (the frame's
 * own row list is illustrative). They are clearly labeled "Sample data"
 * in the UI. A real endpoint would accept the org id + query params
 * (search, eventType, resourceType, user, department, team, status,
 * severity, savedView, date, sort, page) and return matching events
 * plus each event's timeline and technical metadata.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class OrganizationActivityError extends Error {}

const MOCK_ORGANIZATION_ACTIVITY = {
  updatedAt: 'just now',
  organizationName: 'Acme Corporation',
  kpis: [
    { key: 'today', label: 'Events Today', value: '1,847', helper: '↑ 12% vs. yesterday', tone: 'default' },
    { key: 'users', label: 'Active Users', value: '43', helper: 'of 247 total members', tone: 'success' },
    { key: 'admin', label: 'Admin Actions', value: '28', helper: 'Org, dept & user changes', tone: 'default' },
    { key: 'pipeline', label: 'Pipeline Events', value: '934', helper: '14 currently running', tone: 'default' },
    { key: 'security', label: 'Security Events', value: '17', helper: '2 require review', tone: 'warning' },
    { key: 'failed', label: 'Failed Operations', value: '9', helper: '3 since last hour', tone: 'danger' },
  ],
  savedViews: [
    { key: 'all', label: 'All Activity' },
    { key: 'security', label: 'Security Events' },
    { key: 'failed', label: 'Failed Operations' },
    { key: 'pipeline', label: 'Pipeline Activity' },
    { key: 'users', label: 'User Management' },
    { key: 'admin', label: 'Admin Changes' },
  ],
  eventTypeFilters: ['All event types', 'Pipeline Execution', 'Connector Sync', 'Authentication', 'Permission Change', 'Configuration Change', 'User Management', 'Data Access'],
  resourceTypeFilters: ['All resources', 'Pipeline', 'Connector', 'User', 'Role', 'Organization', 'Department', 'Team'],
  userFilters: ['All users', 'System Scheduler', 'Sarah Chen', 'Michael Patterson', 'Luca Ricci', 'Priya Nair', 'James Park', 'Omar Hassan'],
  departmentFilters: ['All departments', 'Data Engineering', 'BI & Reporting', 'ML Infrastructure', 'Analytics Platform', 'Risk & Compliance', 'Platform Administration'],
  teamFilters: ['All teams', 'Pipeline Core', 'Pipeline Integrations', 'Reporting & Statements', 'Analytics Core', 'Event Streaming', 'Compliance Ops', 'Platform Admins'],
  statusFilters: ['All statuses', 'Success', 'Failed', 'Warning', 'Info'],
  severityFilters: ['All severities', 'Critical', 'High', 'Medium', 'Low', 'Info'],
  sortOptions: ['Newest first', 'Oldest first', 'Severity', 'Category'],
  total: 1847,
  rows: [
    {
      id: 'EVT-0841', time: '14:32:17', timestamp: 'Aug 2, 2026 at 14:32:17 UTC', epoch: 1754145137,
      title: 'Pipeline Execution Failed', category: 'Pipeline Execution', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Pipeline', resourceName: 'Customer ETL Daily', resourceId: 'PL-00291',
      department: 'Data Engineering', team: 'Pipeline Core',
      result: 'Failed', severity: 'High',
      sourceIp: '10.0.4.●●●', authMethod: 'Service Token',
      detail: {
        durationLabel: '17 seconds', role: 'System Process',
        actorSubtitle: 'Automated pipeline trigger',
        timeline: [
          { label: 'Execution request received', time: '14:32:00', tone: 'ok' },
          { label: 'Pipeline validation passed', time: '14:32:02', tone: 'ok' },
          { label: 'Worker assigned — Worker #4', time: '14:32:05', tone: 'ok' },
          { label: 'Data extraction started', time: '14:32:10', tone: 'ok' },
          { label: 'Transformation error — schema mismatch', time: '14:32:17', tone: 'error' },
        ],
        errorTitle: 'Schema Mismatch — Transformation Failed',
        errorDetail: 'Column customer_id expected VARCHAR(36) but source returned INT.',
        errorHint: '→ Review source schema & update pipeline mapping',
        metadata: [
          { label: 'Correlation ID', value: 'cid-8a2f91bc-04d3' },
          { label: 'Session ID', value: 'sess-7e3a12ff' },
          { label: 'Request ID', value: 'req-0841-exec' },
          { label: 'API Version', value: 'v2.4.1' },
          { label: 'Client Type', value: 'Scheduler Daemon' },
        ],
      },
    },
    {
      id: 'EVT-0840', time: '14:31:58', timestamp: 'Aug 2, 2026 at 14:31:58 UTC', epoch: 1754145118,
      title: 'Pipeline Execution Completed', category: 'Pipeline Execution', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Pipeline', resourceName: 'Finance Reconciliation', resourceId: 'PL-00184',
      department: 'BI & Reporting', team: 'Reporting & Statements',
      result: 'Success', severity: 'Info', sourceIp: '10.0.4.●●●', authMethod: 'Service Token',
    },
    {
      id: 'EVT-0839', time: '14:30:44', timestamp: 'Aug 2, 2026 at 14:30:44 UTC', epoch: 1754145044,
      title: 'User signed in', category: 'Authentication', categoryTone: 'green',
      actorName: 'Sarah Chen', actorInitials: 'SC', isSystem: false,
      resourceType: 'User', resourceName: 'Sarah Chen', resourceId: 'USR-00042',
      department: 'Data Engineering', team: 'Pipeline Core',
      result: 'Success', severity: 'Info', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0838', time: '14:29:12', timestamp: 'Aug 2, 2026 at 14:29:12 UTC', epoch: 1754144952,
      title: 'Role permissions updated', category: 'Permission Change', categoryTone: 'orange',
      actorName: 'Michael Patterson', actorInitials: 'MP', isSystem: false,
      resourceType: 'Role', resourceName: 'Pipeline Operator', resourceId: 'ROLE-0007',
      department: 'Platform Administration', team: 'Platform Admins',
      result: 'Success', severity: 'Medium', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0837', time: '14:28:03', timestamp: 'Aug 2, 2026 at 14:28:03 UTC', epoch: 1754144883,
      title: 'Connector Sync Failed', category: 'Connector Sync', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Connector', resourceName: 'Salesforce Production', resourceId: 'CN-00117',
      department: 'Data Engineering', team: 'Pipeline Integrations',
      result: 'Failed', severity: 'High', sourceIp: '10.0.4.●●●', authMethod: 'OAuth2',
      detail: {
        durationLabel: '3 seconds', role: 'System Process',
        actorSubtitle: 'Scheduled connector sync',
        timeline: [
          { label: 'Sync request received', time: '14:28:00', tone: 'ok' },
          { label: 'OAuth2 handshake initiated', time: '14:28:01', tone: 'ok' },
          { label: 'Token refresh attempted', time: '14:28:02', tone: 'ok' },
          { label: 'Authorization failed — 401 Unauthorized', time: '14:28:03', tone: 'error' },
        ],
        errorTitle: 'OAuth2 token expired · Salesforce API returned 401 Unauthorized',
        errorDetail: 'The stored refresh token for Salesforce Production is no longer valid.',
        errorHint: '→ Re-authorize the connector to restore automated syncs',
        metadata: [
          { label: 'Correlation ID', value: 'cid-5d1c77ae-9b20' },
          { label: 'Session ID', value: 'sess-3c98a740' },
          { label: 'Request ID', value: 'req-0837-sync' },
          { label: 'API Version', value: 'v2.4.1' },
          { label: 'Client Type', value: 'Scheduler Daemon' },
        ],
      },
    },
    {
      id: 'EVT-0836', time: '14:26:51', timestamp: 'Aug 2, 2026 at 14:26:51 UTC', epoch: 1754144811,
      title: 'Data export requested', category: 'Data Access', categoryTone: 'purple',
      actorName: 'Omar Hassan', actorInitials: 'OH', isSystem: false,
      resourceType: 'Pipeline', resourceName: 'Executive KPIs', resourceId: 'PL-00203',
      department: 'BI & Reporting', team: 'Reporting & Statements',
      result: 'Success', severity: 'Low', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0835', time: '14:24:39', timestamp: 'Aug 2, 2026 at 14:24:39 UTC', epoch: 1754144679,
      title: 'Pipeline schedule modified', category: 'Configuration Change', categoryTone: 'orange',
      actorName: 'James Park', actorInitials: 'JP', isSystem: false,
      resourceType: 'Pipeline', resourceName: 'Product Events', resourceId: 'PL-00256',
      department: 'Analytics Platform', team: 'Analytics Core',
      result: 'Success', severity: 'Medium', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0834', time: '14:22:07', timestamp: 'Aug 2, 2026 at 14:22:07 UTC', epoch: 1754144527,
      title: 'Failed sign-in attempt', category: 'Authentication', categoryTone: 'green',
      actorName: 'Unknown', actorInitials: '??', isSystem: false,
      resourceType: 'User', resourceName: 'j.doe@acme.example', resourceId: '—',
      department: '—', team: '—',
      result: 'Warning', severity: 'Critical', sourceIp: '198.51.100.●●', authMethod: 'Password',
    },
    {
      id: 'EVT-0833', time: '14:20:55', timestamp: 'Aug 2, 2026 at 14:20:55 UTC', epoch: 1754144455,
      title: 'Connector Sync Completed', category: 'Connector Sync', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Connector', resourceName: 'Snowflake Warehouse', resourceId: 'CN-00098',
      department: 'Data Engineering', team: 'Pipeline Core',
      result: 'Success', severity: 'Info', sourceIp: '10.0.4.●●●', authMethod: 'Service Token',
    },
    {
      id: 'EVT-0832', time: '14:18:31', timestamp: 'Aug 2, 2026 at 14:18:31 UTC', epoch: 1754144311,
      title: 'New user invited', category: 'User Management', categoryTone: 'teal',
      actorName: 'Michael Patterson', actorInitials: 'MP', isSystem: false,
      resourceType: 'User', resourceName: 'k.tanaka@acme.example', resourceId: 'USR-00248',
      department: 'Platform Administration', team: 'Platform Admins',
      result: 'Success', severity: 'Low', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0831', time: '14:16:09', timestamp: 'Aug 2, 2026 at 14:16:09 UTC', epoch: 1754144169,
      title: 'Pipeline Execution Completed', category: 'Pipeline Execution', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Pipeline', resourceName: 'Event Stream Ingest', resourceId: 'PL-00271',
      department: 'Analytics Platform', team: 'Event Streaming',
      result: 'Success', severity: 'Info', sourceIp: '10.0.4.●●●', authMethod: 'Service Token',
    },
    {
      id: 'EVT-0830', time: '14:13:47', timestamp: 'Aug 2, 2026 at 14:13:47 UTC', epoch: 1754144027,
      title: 'Organization setting changed', category: 'Configuration Change', categoryTone: 'orange',
      actorName: 'Michael Patterson', actorInitials: 'MP', isSystem: false,
      resourceType: 'Organization', resourceName: 'Acme Corporation', resourceId: 'ORG-0001',
      department: 'Platform Administration', team: 'Platform Admins',
      result: 'Success', severity: 'Medium', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0829', time: '14:11:22', timestamp: 'Aug 2, 2026 at 14:11:22 UTC', epoch: 1754143882,
      title: 'Data access granted', category: 'Permission Change', categoryTone: 'orange',
      actorName: 'Priya Nair', actorInitials: 'PN', isSystem: false,
      resourceType: 'Team', resourceName: 'Event Streaming', resourceId: 'TEAM-0009',
      department: 'Analytics Platform', team: 'Event Streaming',
      result: 'Success', severity: 'Medium', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0828', time: '14:08:58', timestamp: 'Aug 2, 2026 at 14:08:58 UTC', epoch: 1754143738,
      title: 'Pipeline Execution Warning', category: 'Pipeline Execution', categoryTone: 'blue',
      actorName: 'System Scheduler', actorInitials: 'SY', isSystem: true,
      resourceType: 'Pipeline', resourceName: 'Compliance Audit Export', resourceId: 'PL-00159',
      department: 'Risk & Compliance', team: 'Compliance Ops',
      result: 'Warning', severity: 'Medium', sourceIp: '10.0.4.●●●', authMethod: 'Service Token',
    },
    {
      id: 'EVT-0827', time: '14:05:33', timestamp: 'Aug 2, 2026 at 14:05:33 UTC', epoch: 1754143533,
      title: 'User role revoked', category: 'User Management', categoryTone: 'teal',
      actorName: 'Michael Patterson', actorInitials: 'MP', isSystem: false,
      resourceType: 'User', resourceName: 'e.rossi@acme.example', resourceId: 'USR-00061',
      department: 'Platform Administration', team: 'Platform Admins',
      result: 'Success', severity: 'High', sourceIp: '203.0.113.●●', authMethod: 'SSO (Okta)',
    },
    {
      id: 'EVT-0826', time: '14:02:14', timestamp: 'Aug 2, 2026 at 14:02:14 UTC', epoch: 1754143334,
      title: 'Connector authorization refreshed', category: 'Connector Sync', categoryTone: 'blue',
      actorName: 'Luca Ricci', actorInitials: 'LR', isSystem: false,
      resourceType: 'Connector', resourceName: 'HubSpot Marketing', resourceId: 'CN-00133',
      department: 'Data Engineering', team: 'Pipeline Integrations',
      result: 'Success', severity: 'Low', sourceIp: '203.0.113.●●', authMethod: 'OAuth2',
    },
  ],
};

export async function getOrganizationActivity(
  orgId,
  { search, eventType, resourceType, user, department, team, status, severity, savedView, sort } = {},
) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (eventType && eventType !== 'All event types') params.set('eventType', eventType);
    if (resourceType && resourceType !== 'All resources') params.set('resourceType', resourceType);
    if (user && user !== 'All users') params.set('user', user);
    if (department && department !== 'All departments') params.set('department', department);
    if (team && team !== 'All teams') params.set('team', team);
    if (status && status !== 'All statuses') params.set('status', status);
    if (severity && severity !== 'All severities') params.set('severity', severity);
    if (savedView && savedView !== 'all') params.set('view', savedView);
    if (sort) params.set('sort', sort);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/activity${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new OrganizationActivityError('Unable to load activity right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new OrganizationActivityError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_ORGANIZATION_ACTIVITY, mocked: true };
  }
}
