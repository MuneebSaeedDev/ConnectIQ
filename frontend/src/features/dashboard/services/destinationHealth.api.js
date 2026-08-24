/**
 * Data for the Destination Health Dashboard Screen (SCR-019, node 65:17501).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-007 (Destinations) — the module that would produce
 * real destination/delivery/sync health data — is also still `PLANNED`
 * with no backend deployed. `getDestinationHealth` always attempts a
 * real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring sourceHealth.api.js's/
 * systemHealth.api.js's dev-proxy-aware mock-fallback shape (including
 * the SCR-014-discovered content-type check against the Vite dev
 * server's own HTML fallback).
 *
 * FIGMA-VERIFICATION GAP (agent-rules.md §2): no Figma MCP tool was
 * available in the session that built this screen, so node 65:17501's
 * pixel-level layout was NOT independently inspected. The screen was
 * built against the screen-inventory.md description ("Default,
 * delivery/sync success-rate widgets") and the established MOD-009
 * sibling pattern — SCR-018 Source Health (sourceHealth.api.js) is the
 * direct inbound analog. Recorded as `not-verified` fidelity, not an
 * asserted match.
 *
 * DESTINATION-TYPE CAVEAT (module-plan.md MOD-007 "Global Build Risks"):
 * the destination connector taxonomy is explicitly unenumerated in the
 * current design/spec. The category set below (Warehouse / Database /
 * Storage / Streaming / BI / Webhook) is realistic sample data, not a
 * confirmed connector list — must be reconciled once MOD-007's spec
 * lands.
 *
 * KNOWN LIMITATION: the mock snapshot below is a single fixed dataset
 * and ignores the `timeRange` param (Live/1h/24h/7d) — same documented
 * limitation as sourceHealth.api.js's/systemHealth.api.js's range
 * handling. A real MOD-009 endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DestinationHealthError extends Error {}

const MOCK_DESTINATION_HEALTH = {
  updatedAt: '22 seconds ago',
  kpis: [
    { key: 'total-destinations', label: 'Total Destinations', value: '128', tone: 'default', trend: null, trendTone: 'flat', footer: '38 Warehouse · 32 Database · 24 Storage · 34 Streaming/API', icon: 'target' },
    { key: 'healthy-destinations', label: 'Healthy Destinations', value: '121', tone: 'success', trend: '↑ 3 vs yesterday', trendTone: 'up', footer: '94.5% of total', icon: 'circle-check' },
    { key: 'offline-critical', label: 'Offline / Critical', value: '2', tone: 'default', trend: null, trendTone: 'flat', footer: 'redshift-eu-archive · snowflake-finance', icon: 'x' },
    { key: 'warning-destinations', label: 'Warning Destinations', value: '5', tone: 'default', trend: null, trendTone: 'flat', footer: 'Elevated latency or delivery backlog', icon: 'alert-sm' },
    { key: 'failed-deliveries', label: 'Failed Deliveries', value: '312', tone: 'default', trend: '↓ 48 vs yesterday', trendTone: 'up', footer: 'Last 24h, across all destinations', icon: 'x-circle' },
    { key: 'delivery-success', label: 'Delivery Success Rate', value: '99.6', suffix: '%', tone: 'success', trend: '↑ 0.2% this week', trendTone: 'up', footer: '2.41M delivered · 312 failed (24h)', icon: 'send' },
    { key: 'sync-success', label: 'Sync Success Rate', value: '98.9', suffix: '%', tone: 'success', trend: '↑ 0.4% this week', trendTone: 'up', footer: '4,182 syncs · 46 failed (24h)', icon: 'refresh-cw' },
    { key: 'records-delivered', label: 'Records Delivered', value: '2.41', suffix: 'M', tone: 'default', trend: null, trendTone: 'flat', footer: 'Last 24h, across all destinations', icon: 'layers' },
    { key: 'avg-latency', label: 'Avg Delivery Latency', value: '218', suffix: 'ms', tone: 'default', trend: 'P95 486ms', trendTone: 'flat', footer: 'End-to-end write acknowledgement', icon: 'wave' },
    { key: 'pending-retries', label: 'Pending Retries', value: '27', tone: 'default', trend: null, trendTone: 'flat', footer: 'Queued for redelivery', badge: '4 exhausted', icon: 'retry' },
    { key: 'throughput', label: 'Throughput', value: '18.4', suffix: 'K/s', tone: 'default', trend: null, trendTone: 'flat', footer: 'Records/sec across active writers', icon: 'activity' },
    { key: 'availability-7d', label: 'Availability (7d)', value: '99.74', suffix: '%', tone: 'success', trend: null, trendTone: 'flat', footer: 'Across all 128 destinations', icon: 'shield' },
  ],
  deliverySuccess: {
    subtitle: 'Delivery success rate · last 24h',
    total: '2,410,882',
    successful: '2,410,570',
    failed: '312',
    retryRate: '0.11%',
    avgLatency: '218ms',
    series: [99.2, 99.4, 99.5, 99.7, 99.8, 99.6, 99.3, 99.1, 99.4, 99.6, 99.7, 99.8, 99.7, 99.5, 99.6, 99.7, 99.8, 99.9, 99.7, 99.6, 99.5, 99.7, 99.8, 99.9],
  },
  destinationAlerts: [
    { id: 'da1', title: 'redshift-eu-archive delivery failing', description: 'Warehouse · Write rejected · Disk quota exceeded', severity: 'critical' },
    { id: 'da2', title: 'snowflake-finance unreachable', description: 'Warehouse · Connection timeout for 42m', severity: 'critical' },
    { id: 'da3', title: 'bigquery-events retry backlog growing', description: 'Streaming · 27 records queued for redelivery', severity: 'warning' },
    { id: 'da4', title: 'partner-webhook-eu latency elevated', description: 'Webhook · Avg 1.2s vs 300ms baseline', severity: 'warning' },
    { id: 'da5', title: 's3-cold-archive sync delayed', description: 'Storage · Last sync 3h 40m ago · SLA 2h', severity: 'warning' },
    { id: 'da6', title: 'looker-bi credentials rotated', description: 'BI · Service-account key auto-rotated successfully', severity: 'info' },
    { id: 'da7', title: 'postgres-replica caught up', description: 'Database · Replication lag cleared (0s)', severity: 'info' },
  ],
  deliveryVolume: {
    subtitle: 'Delivery volume by destination type · 24h',
    totalLabel: '2.41M records',
    stats: [
      { key: 'vol-warehouse', label: 'Warehouse', value: 1120, max: 2410, tone: 'success', display: '1.12M' },
      { key: 'vol-database', label: 'Database', value: 642, max: 2410, tone: 'success', display: '642K' },
      { key: 'vol-storage', label: 'Storage', value: 388, max: 2410, tone: 'success', display: '388K' },
      { key: 'vol-streaming', label: 'Streaming / API', value: 214, max: 2410, tone: 'success', display: '214K' },
      { key: 'vol-bi', label: 'BI / Analytics', value: 34, max: 2410, tone: 'warning', display: '34K' },
      { key: 'vol-webhook', label: 'Webhook', value: 12, max: 2410, tone: 'warning', display: '12K' },
    ],
    queue: [
      { id: 'q1', destination: 'bigquery-events', kind: 'Streaming', depthLabel: '27 queued', status: 'retrying' },
      { id: 'q2', destination: 'redshift-eu-archive', kind: 'Warehouse', depthLabel: '4 exhausted', status: 'failed' },
      { id: 'q3', destination: 'snowflake-finance', kind: 'Warehouse', depthLabel: 'Blocked', status: 'failed' },
      { id: 'q4', destination: 's3-cold-archive', kind: 'Storage', depthLabel: 'Draining', status: 'ok' },
      { id: 'q5', destination: 'postgres-replica', kind: 'Database', depthLabel: 'Empty', status: 'ok' },
      { id: 'q6', destination: 'partner-webhook-eu', kind: 'Webhook', depthLabel: '2 queued', status: 'retrying' },
    ],
  },
  syncPerformance: {
    subtitle: 'Sync success rate (%) · last 24h',
    avg24h: '98.9%',
    p95: '486ms',
    p99: '742ms',
    peak: '1.2s',
    withinSla: '98.6%',
    series: [98.4, 98.6, 98.9, 99.1, 98.8, 98.5, 98.2, 98.6, 98.9, 99.0, 99.2, 99.1, 98.9, 98.7, 98.8, 99.0, 99.1, 99.2, 99.0, 98.9, 98.8, 99.0, 99.1, 99.2],
  },
  deliveryMethods: {
    filters: [
      { key: 'all', label: 'All', count: 5 },
      { key: 'batch', label: 'Batch', count: 2 },
      { key: 'streaming', label: 'Streaming', count: 2 },
      { key: 'micro-batch', label: 'Micro-batch', count: 1 },
    ],
    changes: [
      { id: 'dm1', destination: 'snowflake-finance', description: 'Batch load every 15m · last run failed (timeout)', type: 'batch', detectedAt: '42m ago', tone: 'danger' },
      { id: 'dm2', destination: 'bigquery-events', description: 'Streaming insert · 27 rows pending redelivery', type: 'streaming', detectedAt: '8m ago', tone: 'warning' },
      { id: 'dm3', destination: 's3-cold-archive', description: 'Batch export daily · delayed 1h 40m past SLA', type: 'batch', detectedAt: '3h ago', tone: 'warning' },
      { id: 'dm4', destination: 'kafka-downstream', description: 'Streaming · healthy, 0 lag', type: 'streaming', detectedAt: '1m ago', tone: 'success' },
      { id: 'dm5', destination: 'postgres-replica', description: 'Micro-batch CDC · caught up', type: 'micro-batch', detectedAt: '2m ago', tone: 'success' },
    ],
  },
  deliverySla: {
    subtitle: 'Sync schedule adherence',
    onSchedule: 118,
    delayed: 5,
    breached: 5,
    rows: [
      { id: 'ds1', destination: 'redshift-eu-archive', lastSync: '42m ago', expected: 'Every 15m', delay: '27m', sla: 'Breached', status: 'Offline' },
      { id: 'ds2', destination: 'snowflake-finance', lastSync: '42m ago', expected: 'Every 15m', delay: '27m', sla: 'Breached', status: 'Breached' },
      { id: 'ds3', destination: 's3-cold-archive', lastSync: '3h 40m ago', expected: 'Every 2h', delay: '1h 40m', sla: 'At risk', status: 'Delayed' },
      { id: 'ds4', destination: 'bigquery-events', lastSync: '8m ago', expected: 'Real-time', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'ds5', destination: 'postgres-replica', lastSync: '2m ago', expected: 'Real-time', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'ds6', destination: 'kafka-downstream', lastSync: '1m ago', expected: 'Real-time', delay: '—', sla: 'Met', status: 'OK' },
      { id: 'ds7', destination: 'looker-bi', lastSync: '11m ago', expected: 'Every 30m', delay: '—', sla: 'Met', status: 'OK' },
    ],
  },
  allDestinations: {
    subtitle: '128 destinations · full inventory',
    categoryFilters: [
      { key: 'all', label: 'All', count: 128 },
      { key: 'healthy', label: 'Healthy', count: 121, dot: 'success' },
      { key: 'warning', label: 'Warning', count: 5, dot: 'warning' },
      { key: 'offline', label: 'Offline', count: 2, dot: 'danger' },
      { key: 'warehouse', label: 'Warehouse', count: 38 },
      { key: 'database', label: 'Database', count: 32 },
      { key: 'storage', label: 'Storage', count: 24 },
      { key: 'streaming', label: 'Streaming', count: 34 },
    ],
    rows: [
      { id: 'd1', name: 'snowflake-finance', host: 'finance.snowflakecomputing.com', category: 'Warehouse', env: 'prod', status: 'Offline', health: 0, healthTone: 'danger', lastSync: '42m ago', sla: 'Breached', latency: '—', successRate: '82.1%', auth: 'OK', owner: 'MK' },
      { id: 'd2', name: 'redshift-eu-archive', host: 'redshift.eu-west-1.internal', category: 'Warehouse', env: 'prod', status: 'Offline', health: 12, healthTone: 'danger', lastSync: '42m ago', sla: 'Breached', latency: '—', successRate: '78.4%', auth: 'OK', owner: 'RT' },
      { id: 'd3', name: 'bigquery-events', host: 'bigquery.googleapis.com', category: 'Streaming', env: 'prod', status: 'Warning', health: 93.4, healthTone: 'warning', lastSync: '8m ago', sla: 'Met', latency: '204ms', successRate: '99.1%', auth: 'OK', owner: 'AL' },
      { id: 'd4', name: 's3-cold-archive', host: 's3.amazonaws.com', category: 'Storage', env: 'prod', status: 'Warning', health: 95.1, healthTone: 'warning', lastSync: '3h 40m ago', sla: 'At risk', latency: '88ms', successRate: '99.6%', auth: 'OK', owner: 'MK' },
      { id: 'd5', name: 'partner-webhook-eu', host: 'hooks.partner.eu', category: 'Streaming', env: 'prod', status: 'Warning', health: 90.8, healthTone: 'warning', lastSync: '3m ago', sla: 'Met', latency: '1.2s', successRate: '98.2%', auth: 'Expiring', owner: 'JD' },
      { id: 'd6', name: 'postgres-replica', host: 'pg-replica.internal', category: 'Database', env: 'prod', status: 'Healthy', health: 99.8, lastSync: '2m ago', sla: 'Met', latency: '14ms', successRate: '99.9%', auth: 'OK', owner: 'RT' },
      { id: 'd7', name: 'kafka-downstream', host: 'kafka.internal:9092', category: 'Streaming', env: 'prod', status: 'Healthy', health: 99.9, lastSync: '1m ago', sla: 'Met', latency: '6ms', successRate: '100%', auth: 'OK', owner: 'AL' },
      { id: 'd8', name: 'looker-bi', host: 'looker.company.com', category: 'BI', env: 'prod', status: 'Healthy', health: 99.4, lastSync: '11m ago', sla: 'Met', latency: '142ms', successRate: '99.8%', auth: 'OK', owner: 'JD' },
      { id: 'd9', name: 'databricks-lakehouse', host: 'dbc.cloud.databricks.com', category: 'Warehouse', env: 'prod', status: 'Healthy', health: 99.7, lastSync: '5m ago', sla: 'Met', latency: '96ms', successRate: '99.9%', auth: 'OK', owner: 'MK' },
      { id: 'd10', name: 'mysql-reporting', host: 'mysql-report.internal', category: 'Database', env: 'prod', status: 'Healthy', health: 99.6, lastSync: '4m ago', sla: 'Met', latency: '11ms', successRate: '99.9%', auth: 'OK', owner: 'RT' },
      { id: 'd11', name: 'gcs-data-exports', host: 'storage.googleapis.com', category: 'Storage', env: 'prod', status: 'Healthy', health: 99.9, lastSync: '6m ago', sla: 'Met', latency: '52ms', successRate: '100%', auth: 'OK', owner: 'AL' },
      { id: 'd12', name: 'segment-warehouse', host: 'segment.com', category: 'Warehouse', env: 'staging', status: 'Warning', health: 96.2, healthTone: 'warning', lastSync: '9m ago', sla: 'Met', latency: '176ms', successRate: '99.4%', auth: 'Expiring', owner: 'JD' },
    ],
  },
};

export async function getDestinationHealth(timeRange) {
  try {
    const query = timeRange ? `?range=${encodeURIComponent(timeRange)}` : '';
    const res = await apiFetch(`/dashboard/destination-health${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DestinationHealthError('Unable to load the destination health dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new DestinationHealthError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_DESTINATION_HEALTH, mocked: true };
  }
}
