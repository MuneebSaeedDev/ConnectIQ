/**
 * Data for the Source Health Dashboard Screen (SCR-018, node 56:11333).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-006 (Data Sources & Connectors) — the module that
 * would produce real source/connection/auth-credential health data —
 * is also still `PLANNED` with no backend deployed. `getSourceHealth`
 * always attempts a real request first and only falls back to the
 * mock snapshot below when the endpoint is unreachable, mirroring
 * systemHealth.api.js's/dataQuality.api.js's/pipelineOverview.api.js's
 * dev-proxy-aware mock-fallback shape (including the SCR-014-discovered
 * content-type check against the Vite dev server's own HTML fallback).
 *
 * The mock KPI/alert/chart/table values reproduce the literal numbers
 * shown in the Figma design (node 56:11333).
 *
 * KNOWN LIMITATION: the mock snapshot below is a single fixed dataset
 * and ignores the `timeRange` param (Live/1h/24h/7d) — same documented
 * limitation as systemHealth.api.js's/dataQuality.api.js's range handling.
 * A real MOD-009 endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class SourceHealthError extends Error {}

const MOCK_SOURCE_HEALTH = {
  updatedAt: '18 seconds ago',
  kpis: [
    { key: 'total-sources', label: 'Total Sources', value: '247', tone: 'default', trend: null, trendTone: 'flat', footer: '94 SaaS · 68 Database · 42 Storage · 28 API', icon: 'plug' },
    { key: 'healthy-sources', label: 'Healthy Sources', value: '238', tone: 'success', trend: '↑ 2 vs yesterday', trendTone: 'up', footer: '96.4% of total', icon: 'circle-check' },
    { key: 'offline-critical', label: 'Offline / Critical', value: '1', tone: 'default', trend: null, trendTone: 'flat', footer: 'ftp-legacy-archive · 6h down', icon: 'x' },
    { key: 'warning-sources', label: 'Warning Sources', value: '6', tone: 'default', trend: null, trendTone: 'flat', footer: 'Elevated latency or delayed sync', icon: 'alert-sm' },
    { key: 'failed-connections', label: 'Failed Connections', value: '14', tone: 'default', trend: '↓ 3 vs yesterday', trendTone: 'up', footer: 'Last 24h, across all sources', icon: 'wifi' },
    { key: 'auth-errors', label: 'Auth Errors', value: '2', tone: 'default', trend: null, trendTone: 'flat', footer: 'Token renewal needed', badge: '2 expired', icon: 'key' },
    { key: 'freshness-sla', label: 'Freshness SLA', value: '97.2', suffix: '%', tone: 'success', trend: '↑ 0.3% this week', trendTone: 'up', footer: '240 on schedule · 4 delayed · 3 breached', icon: 'clock' },
    { key: 'sync-failures', label: 'Sync Failures', value: '8', tone: 'default', trend: null, trendTone: 'flat', footer: 'Last 24h', icon: 'refresh-cw' },
    { key: 'schema-changes', label: 'Schema Changes', value: '3', tone: 'default', trend: null, trendTone: 'flat', footer: '1 breaking · 2 additive', badge: '1 breaking', icon: 'layers' },
    { key: 'avg-response', label: 'Avg Response Time', value: '184', suffix: 'ms', tone: 'default', trend: 'P95 324ms', trendTone: 'flat', footer: 'Across all connection tests', icon: 'wave' },
    { key: 'active-connections', label: 'Active Connections', value: '1,842', tone: 'default', trend: null, trendTone: 'flat', footer: 'Currently open pooled connections', icon: 'activity' },
    { key: 'availability-7d', label: 'Availability (7d)', value: '99.82', suffix: '%', tone: 'success', trend: null, trendTone: 'flat', footer: 'Across all 247 sources', icon: 'shield' },
  ],
  connectionHealth: {
    subtitle: 'Connections per hour · last 24h',
    total: '44,208',
    successful: '44,194',
    failed: '14',
    timeoutRate: '0.03%',
    avgLatency: '184ms',
    series: [98.9, 99.1, 99.4, 99.6, 99.7, 99.5, 99.2, 98.8, 99.0, 99.3, 99.6, 99.8, 99.7, 99.5, 99.4, 99.6, 99.7, 99.8, 99.6, 99.5, 99.4, 99.6, 99.7, 99.8],
  },
  sourceAlerts: [
    { id: 'sa1', title: 'ftp-legacy-archive offline', description: 'FTP · Unreachable for 6h · Connection refused', severity: 'critical' },
    { id: 'sa2', title: 'salesforce-prod token expiring', description: 'OAuth2 · Expires in 6 days · Renewal required', severity: 'warning' },
    { id: 'sa3', title: 'analytics-warehouse schema change detected', description: 'PostgreSQL · Breaking change · 2 columns removed', severity: 'critical' },
    { id: 'sa4', title: 'stripe-webhook latency elevated', description: 'Webhook · Avg 820ms vs 200ms baseline', severity: 'warning' },
    { id: 'sa5', title: 'hubspot-crm sync delayed', description: 'REST API · Last sync 2h 14m ago · SLA 1h', severity: 'warning' },
    { id: 'sa6', title: 'zendesk-support cert renewed', description: 'API Key · TLS certificate auto-renewed successfully', severity: 'info' },
    { id: 'sa7', title: 's3-data-lake schema addition', description: 'Storage · Additive change · 3 new fields', severity: 'info' },
  ],
  sourcePerformance: {
    subtitle: 'Avg response time (ms) · last 24h',
    avg24h: '184ms',
    p95: '324ms',
    p99: '412ms',
    peak: '820ms',
    withinSla: '99.4%',
    series: [162, 158, 170, 184, 196, 210, 224, 240, 236, 218, 202, 188, 176, 168, 172, 180, 190, 204, 212, 198, 182, 170, 164, 158],
  },
  schemaMonitoring: {
    filters: [
      { key: 'all', label: 'All', count: 5 },
      { key: 'breaking', label: 'Breaking', count: 1 },
      { key: 'additive', label: 'Additive', count: 2 },
      { key: 'renamed', label: 'Renamed', count: 1 },
      { key: 'removed', label: 'Removed', count: 1 },
    ],
    changes: [
      { id: 'sc1', source: 'analytics-warehouse', description: '2 columns removed from `orders` table', type: 'breaking', detectedAt: '2h ago' },
      { id: 'sc2', source: 's3-data-lake', description: '3 new fields added to `events` schema', type: 'additive', detectedAt: '5h ago' },
      { id: 'sc3', source: 'hubspot-crm', description: 'field `deal_stage` renamed to `pipeline_stage`', type: 'renamed', detectedAt: '1d ago' },
      { id: 'sc4', source: 'mongo-inventory', description: 'new field `warehouse_zone` added', type: 'additive', detectedAt: '1d ago' },
      { id: 'sc5', source: 'legacy-crm-mysql', description: 'column `fax_number` removed', type: 'removed', detectedAt: '3d ago' },
    ],
  },
  dataFreshness: {
    subtitle: 'Sync schedule adherence',
    onSchedule: 240,
    delayed: 4,
    breached: 3,
    rows: [
      { id: 'df1', source: 'ftp-legacy-archive', lastSync: '6h ago', expected: 'Every 1h', delay: '5h 12m', sla: 'Breached', status: 'Offline' },
      { id: 'df2', source: 'analytics-warehouse', lastSync: '3h ago', expected: 'Every 2h', delay: '1h 4m', sla: 'Breached', status: 'Breached' },
      { id: 'df3', source: 'hubspot-crm', lastSync: '2h 14m ago', expected: 'Every 1h', delay: '1h 14m', sla: 'At risk', status: 'Delayed' },
      { id: 'df4', source: 'stripe-webhook', lastSync: '12m ago', expected: 'Real-time', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'df5', source: 'salesforce-prod', lastSync: '4m ago', expected: 'Every 15m', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'df6', source: 'mongo-inventory', lastSync: '1m ago', expected: 'Every 5m', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'df7', source: 'legacy-crm-mysql', lastSync: '18h ago', expected: 'Daily', delay: '—', sla: 'Met', status: 'OK' },
    ],
  },
  authStatus: {
    subtitle: 'Credentials across all sources',
    expiredCount: 2,
    stats: [
      { key: 'oauth-valid', label: 'OAuth Valid', value: 184, max: 190, tone: 'success' },
      { key: 'api-keys-valid', label: 'API Keys Valid', value: 48, max: 50, tone: 'success' },
      { key: 'expiring-14d', label: 'Expiring ≤14d', value: 6, max: 190, tone: 'warning' },
      { key: 'expired-failed', label: 'Expired / Failed', value: 2, max: 190, tone: 'danger' },
      { key: 'certificates-ok', label: 'Certificates OK', value: 11, max: 11, tone: 'success' },
      { key: 'service-accounts', label: 'Service Accounts', value: 28, max: 28, tone: 'success' },
    ],
    timeline: [
      { id: 'at1', source: 'salesforce-prod', authType: 'OAuth2', expiresLabel: '6d', status: 'expiring' },
      { id: 'at2', source: 'netsuite-erp', authType: 'OAuth2', expiresLabel: '11d', status: 'expiring' },
      { id: 'at3', source: 'legacy-ftp-vendor', authType: 'API Key', expiresLabel: 'Expired', status: 'expired' },
      { id: 'at4', source: 'zendesk-support', authType: 'API Key', expiresLabel: 'OK', status: 'ok' },
      { id: 'at5', source: 'partner-sftp-eu', authType: 'Certificate', expiresLabel: 'Expired', status: 'expired' },
      { id: 'at6', source: 'workday-hr', authType: 'Service Account', expiresLabel: 'OK', status: 'ok' },
    ],
  },
  allSources: {
    subtitle: '247 sources · full inventory',
    categoryFilters: [
      { key: 'all', label: 'All', count: 247 },
      { key: 'healthy', label: 'Healthy', count: 238, dot: 'success' },
      { key: 'warning', label: 'Warning', count: 6, dot: 'warning' },
      { key: 'offline', label: 'Offline', count: 1, dot: 'danger' },
      { key: 'saas', label: 'SaaS', count: 94 },
      { key: 'database', label: 'Database', count: 68 },
      { key: 'storage', label: 'Storage', count: 42 },
      { key: 'api', label: 'API', count: 28 },
    ],
    rows: [
      { id: 's1', name: 'salesforce-prod', host: 'salesforce.com', category: 'SaaS', env: 'prod', status: 'Warning', health: 94.2, healthTone: 'warning', lastSync: '4m ago', freshness: 'Met', response: '112ms', availability: '99.6%', auth: 'Expiring', owner: 'JD' },
      { id: 's2', name: 'analytics-warehouse', host: 'pg-analytics.internal', category: 'Database', env: 'prod', status: 'Warning', health: 91.0, healthTone: 'warning', lastSync: '3h ago', freshness: 'Breached', response: '18ms', availability: '99.4%', auth: 'OK', owner: 'MK' },
      { id: 's3', name: 'ftp-legacy-archive', host: 'ftp.legacy.internal', category: 'Storage', env: 'prod', status: 'Offline', health: 0, healthTone: 'danger', lastSync: '6h ago', freshness: 'Breached', response: '—', availability: '92.1%', auth: 'OK', owner: 'RT' },
      { id: 's4', name: 'hubspot-crm', host: 'hubapi.com', category: 'SaaS', env: 'prod', status: 'Warning', health: 95.8, healthTone: 'warning', lastSync: '2h 14m ago', freshness: 'Delayed', response: '204ms', availability: '99.7%', auth: 'OK', owner: 'JD' },
      { id: 's5', name: 'stripe-webhook', host: 'api.stripe.com', category: 'API', env: 'prod', status: 'Healthy', health: 99.8, lastSync: '12m ago', freshness: 'Met', response: '820ms', availability: '99.9%', auth: 'OK', owner: 'AL' },
      { id: 's6', name: 'mongo-inventory', host: 'mongo-inv.internal', category: 'Database', env: 'prod', status: 'Healthy', health: 99.6, lastSync: '1m ago', freshness: 'Met', response: '9ms', availability: '99.9%', auth: 'OK', owner: 'MK' },
      { id: 's7', name: 'legacy-crm-mysql', host: 'mysql-crm.internal', category: 'Database', env: 'prod', status: 'Healthy', health: 99.9, lastSync: '18h ago', freshness: 'Met', response: '12ms', availability: '100%', auth: 'OK', owner: 'RT' },
      { id: 's8', name: 'zendesk-support', host: 'zendesk.com', category: 'SaaS', env: 'prod', status: 'Healthy', health: 99.5, lastSync: '6m ago', freshness: 'Met', response: '98ms', availability: '99.8%', auth: 'OK', owner: 'AL' },
      { id: 's9', name: 's3-data-lake', host: 's3.amazonaws.com', category: 'Storage', env: 'prod', status: 'Healthy', health: 99.9, lastSync: '5m ago', freshness: 'Met', response: '42ms', availability: '100%', auth: 'OK', owner: 'MK' },
      { id: 's10', name: 'netsuite-erp', host: 'netsuite.com', category: 'SaaS', env: 'prod', status: 'Warning', health: 96.4, healthTone: 'warning', lastSync: '8m ago', freshness: 'Met', response: '164ms', availability: '99.5%', auth: 'Expiring', owner: 'JD' },
      { id: 's11', name: 'legacy-ftp-vendor', host: 'ftp.vendor.net', category: 'Storage', env: 'staging', status: 'Warning', health: 88.0, healthTone: 'warning', lastSync: '1d ago', freshness: 'Delayed', response: '—', availability: '96.2%', auth: 'Expired', owner: 'RT' },
      { id: 's12', name: 'partner-sftp-eu', host: 'sftp.partner.eu', category: 'Storage', env: 'prod', status: 'Warning', health: 90.5, healthTone: 'warning', lastSync: '2h ago', freshness: 'Met', response: '—', availability: '98.1%', auth: 'Expired', owner: 'AL' },
    ],
  },
};

export async function getSourceHealth(timeRange) {
  try {
    const query = timeRange ? `?range=${encodeURIComponent(timeRange)}` : '';
    const res = await apiFetch(`/dashboard/source-health${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SourceHealthError('Unable to load the source health dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new SourceHealthError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_SOURCE_HEALTH, mocked: true };
  }
}
