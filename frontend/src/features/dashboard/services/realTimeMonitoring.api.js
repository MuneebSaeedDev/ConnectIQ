/**
 * Data for the Real-Time Monitoring Dashboard Screen (SCR-023, node
 * 72:45894, Figma page "Page 1").
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and the modules that would produce live telemetry —
 * MOD-006 (Pipelines / Executions), MOD-007, and MOD-008 (Operations /
 * Workers / Queues) — are also still `PLANNED` with no backend
 * deployed. A production build of this screen would additionally
 * consume a Socket.IO live stream (per agent.md §5.2); no realtime
 * transport exists yet either. `getRealTimeMonitoring` always attempts
 * a real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring
 * executionStatistics.api.js / systemHealth.api.js's dev-proxy-aware
 * mock-fallback shape (including the SCR-014-discovered content-type
 * check against the Vite dev server's own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 72:45894 WAS inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). Every KPI value, status
 * metric, live-activity row, infrastructure bar, event, alert, and the
 * monitoring-table rows below are transcribed from the actual frame's
 * text nodes, so the layout/content fidelity is `verified`. See
 * docs/reviews/review-log.md.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed dataset and
 * ignores the `range` param (30s/7d/30d) — same documented limitation
 * as the sibling MOD-009 api modules. A real MOD-009 endpoint would
 * aggregate per range and push deltas over the websocket. The "live"
 * feel on this screen is driven client-side by the 15s React Query
 * refetch plus a paused/live toggle; the mock returns the same
 * snapshot each poll, so the "Updated" clock advances but the numbers
 * do not actually stream. This is clearly labeled as sample data.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class RealTimeMonitoringError extends Error {}

const MOCK_REAL_TIME_MONITORING = {
  updatedAt: 'just now',
  status: {
    label: 'Operational',
    tone: 'success',
    context: 'Live · data refresh on',
    metrics: [
      { key: 'active-pipelines', label: 'Active Pipelines', value: '42', tone: 'default' },
      { key: 'running-workers', label: 'Running Workers', value: '18', tone: 'default' },
      { key: 'critical-alerts', label: 'Critical Alerts', value: '1', tone: 'danger' },
      { key: 'availability', label: 'Availability', value: '99.96%', tone: 'success' },
      { key: 'running-now', label: 'Running, now', value: '48,312', tone: 'default' },
      { key: 'queue-depth', label: 'Queue Depth', value: '284', tone: 'warning' },
    ],
  },
  kpis: [
    { key: 'active-pipelines', label: 'Active Pipelines', value: '42', tone: 'default', trend: '+10.5%', trendTone: 'up', footer: 'vs 38 avg', icon: 'pipeline' },
    { key: 'running-executions', label: 'Running Executions', value: '128', tone: 'default', trend: '+8.7%', trendTone: 'up', footer: 'across all environments', icon: 'activity' },
    { key: 'queued-jobs', label: 'Queued Jobs', value: '284', tone: 'default', trend: '+16.3%', trendTone: 'down', footer: '3 exceeding SLA', icon: 'clock' },
    { key: 'active-workers', label: 'Active Workers', value: '18', tone: 'success', trend: null, trendTone: 'flat', footer: 'Healthy · 18/24 pool', icon: 'server' },
    { key: 'queue-depth', label: 'Queue Depth', value: '284', tone: 'default', trend: '+12.6%', trendTone: 'down', footer: 'Normal · 500 cap', icon: 'bar-chart' },
    { key: 'retries', label: 'Retries / 1hr', value: '48.3K', tone: 'default', trend: '+4.2%', trendTone: 'down', footer: 'Peak 62.4K/hr', icon: 'refresh' },
    { key: 'active-connections', label: 'Active Connections', value: '94', tone: 'default', trend: '-2.1%', trendTone: 'up', footer: '2 reconnecting', icon: 'activity' },
    { key: 'data-transfer', label: 'Data Transfer', value: '1.8 TB', tone: 'default', trend: '+0.6%', trendTone: 'up', footer: 'Data / hour', icon: 'trend-up' },
    { key: 'cpu-usage', label: 'CPU Usage', value: '68', suffix: '%', tone: 'warning', trend: '+4pp', trendTone: 'down', footer: 'Avg across nodes', icon: 'wave' },
    { key: 'memory-usage', label: 'Memory Usage', value: '74', suffix: '%', tone: 'warning', trend: '+2pp', trendTone: 'down', footer: '13 of 16 GB', icon: 'wave' },
    { key: 'error-rate', label: 'Error Rate', value: '0.8', suffix: '%', tone: 'success', trend: '-0.2pp', trendTone: 'up', footer: 'Target < 2%', icon: 'circle-check' },
    { key: 'active-alerts', label: 'Active Alerts', value: '1', tone: 'danger', trend: 'New', trendTone: 'down', footer: 'Critical · needs review', icon: 'triangle' },
  ],
  liveActivity: {
    subtitle: 'Active, recently completed, and failed executions',
    statusFilters: ['All', 'Running', 'Completed', 'Failed', 'Queued'],
    rows: [
      { id: 'RA-1', pipeline: 'Customer Sync Daily', status: 'Running', progress: 78, runtime: '1m 42s', worker: 'worker-prod-01', environment: 'Production' },
      { id: 'RA-2', pipeline: 'Orders → Warehouse', status: 'Running', progress: 91, runtime: '3m 08s', worker: 'worker-prod-03', environment: 'Production' },
      { id: 'RA-3', pipeline: 'Analytics Rollup', status: 'Running', progress: 34, runtime: '1m 12s', worker: 'worker-prod-02', environment: 'Production' },
      { id: 'RA-4', pipeline: 'Partner Data Ingest', status: 'Running', progress: 22, runtime: '0m 44s', worker: 'worker-prod-01', environment: 'Production' },
      { id: 'RA-5', pipeline: 'Config Sync', status: 'Completed', progress: 100, runtime: '0m 24s', worker: 'worker-stg-01', environment: 'Staging' },
      { id: 'RA-6', pipeline: 'Tag Enrichment', status: 'Completed', progress: 100, runtime: '1m 03s', worker: 'worker-prod-04', environment: 'Production' },
      { id: 'RA-7', pipeline: 'Historical Backfill', status: 'Running', progress: 55, runtime: '15m 32s', worker: 'worker-prod-02', environment: 'Production' },
      { id: 'RA-8', pipeline: 'Legacy DB Export', status: 'Failed', progress: 100, runtime: '0m 04s', worker: 'worker-prod-02', environment: 'Production' },
      { id: 'RA-9', pipeline: 'ML Feature Pipeline', status: 'Queued', progress: 0, runtime: '—', worker: '—', environment: 'Production' },
      { id: 'RA-10', pipeline: 'Nightly Archive', status: 'Running', progress: 12, runtime: '0m 18s', worker: 'worker-prod-04', environment: 'Production' },
    ],
  },
  activePipelines: {
    subtitle: 'Currently running — sorted by priority',
    rows: [
      { key: 'ap-1', name: 'Customer Sync Daily', stage: 'Transforming', status: 'Running', progress: 78, rows: '10K / 12.4K', throughput: 'rows/s' },
      { key: 'ap-2', name: 'Orders → Warehouse', stage: 'Loading', status: 'Running', progress: 91, rows: '18K / 19.8K', throughput: 'rows/s' },
      { key: 'ap-3', name: 'Historical Backfill', stage: 'Extracting', status: 'Slow', progress: 55, rows: '55K / 1.3M', throughput: 'rows/s' },
      { key: 'ap-4', name: 'Partner Data Ingest', stage: 'Extracting', status: 'Running', progress: 22, rows: '204 / 2.8K', throughput: 'rows/s' },
      { key: 'ap-5', name: 'Analytics Rollup', stage: 'Aggregating', status: 'Running', progress: 34, rows: '1.1M / 3.1M', throughput: 'rows/s' },
      { key: 'ap-6', name: 'Nightly Archive', stage: 'Verifying (2/3)', status: 'Retrying', progress: 12, rows: '18 GB / 60 GB', throughput: '' },
    ],
  },
  workerQueue: {
    subtitle: 'Live worker utilization and queue depth',
    queueDepth: { label: 'Queue Depth (10-min)', value: '284', latency: '2.9s avg', processing: '48.3K rec/s' },
    workers: [
      { key: 'w1', name: 'worker-prod-01', state: 'Busy', util: 82, tasks: '3 tasks' },
      { key: 'w2', name: 'worker-prod-02', state: 'Busy', util: 91, tasks: '4 tasks' },
      { key: 'w3', name: 'worker-prod-03', state: 'Busy', util: 74, tasks: '3 tasks' },
      { key: 'w4', name: 'worker-prod-04', state: 'Busy', util: 66, tasks: '2 tasks' },
      { key: 'w5', name: 'worker-stg-01', state: 'Idle', util: 12, tasks: '0 tasks' },
      { key: 'w6', name: 'worker-stg-02', state: 'Idle', util: 8, tasks: '0 tasks' },
    ],
  },
  infrastructure: {
    subtitle: 'Real-time network utilization across all nodes',
    rows: [
      { key: 'cpu', label: 'CPU', pct: 68, status: 'Warning', tone: 'warning' },
      { key: 'memory', label: 'Memory', pct: 74, status: 'Warning', tone: 'warning' },
      { key: 'storage', label: 'Storage', pct: 43, status: 'Healthy', tone: 'success' },
      { key: 'network', label: 'Network', pct: 42, status: 'Healthy', tone: 'success' },
      { key: 'disk-io', label: 'Disk IO', pct: 51, status: 'Healthy', tone: 'success' },
      { key: 'db-latency', label: 'DB Latency', pct: 28, status: 'Healthy', tone: 'success' },
    ],
  },
  throughput: {
    subtitle: 'Records processing — rolling 10-min window',
    current: '48,312',
    peak: '82,460/s',
    processed: '12,846',
    axisMax: 90000,
    series: [41200, 43800, 46100, 44900, 48200, 51300, 49700, 52100, 48312, 47600, 50400, 48312],
    footer: '10 min ago',
  },
  connectivity: {
    subtitle: 'Live connection status across all integrations',
    connected: 8,
    reconnecting: 1,
    failed: 1,
    remote: [
      { key: 'salesforce', label: 'Salesforce', status: 'Connected', tone: 'success', latency: '42ms' },
      { key: 'postgres', label: 'Postgres', status: 'Connected', tone: 'success', latency: '8ms' },
      { key: 's3', label: 'S3 Raw', status: 'Connected', tone: 'success', latency: '61ms' },
      { key: 'stripe', label: 'Stripe Payer', status: 'Connected', tone: 'success', latency: '88ms' },
      { key: 'legacy', label: 'Legacy DB', status: 'Reconnecting', tone: 'warning', latency: '—' },
    ],
    local: [
      { key: 'snowflake', label: 'Snowflake', status: 'Connected', tone: 'success', latency: '33ms' },
      { key: 'bigquery', label: 'BigQuery', status: 'Connected', tone: 'success', latency: '54ms' },
      { key: 'redshift', label: 'Redshift', status: 'Connected', tone: 'success', latency: '47ms' },
      { key: 'kafka', label: 'Kafka T', status: 'Connected', tone: 'success', latency: '12ms' },
      { key: 'reports', label: 'Reports S', status: 'Failed', tone: 'danger', latency: '—' },
    ],
  },
  eventStream: {
    subtitle: 'Newest events first — auto-updating',
    rows: [
      { id: 'ev1', time: '0s ago', badge: 'Alert Fired', tone: 'danger', title: 'worker-prod-05', description: 'CPU utilization exceeded 90% threshold' },
      { id: 'ev2', time: '3s ago', badge: 'Pipeline Started', tone: 'info', title: 'Nightly Archive', description: 'Retry attempt #2 initiated by scheduler' },
      { id: 'ev3', time: '5s ago', badge: 'Pipeline Completed', tone: 'success', title: 'Config Sync', description: 'Completed in 0m 24s · 1,024 records processed' },
      { id: 'ev4', time: '8s ago', badge: 'Queue Threshold', tone: 'warning', title: 'prod-queue-01', description: 'Queue depth reached 280 (threshold: 250)' },
      { id: 'ev5', time: '12s ago', badge: 'Worker Assigned', tone: 'info', title: 'worker-prod-01', description: 'Assigned to Customer Sync Daily execution' },
      { id: 'ev6', time: '15s ago', badge: 'Pipeline Completed', tone: 'success', title: 'Tag Enrichment', description: 'Completed in 1m 03s · 28,400 records processed' },
      { id: 'ev7', time: '19s ago', badge: 'Auto-Refreshed', tone: 'info', title: 'Salesforce CRM', description: 'Connection restored after 14s interruption' },
      { id: 'ev8', time: '24s ago', badge: 'Connector Reconnected', tone: 'info', title: 'Snowflake DW', description: 'Connection restored after 14s interruption' },
      { id: 'ev9', time: '31s ago', badge: 'Pipeline Failed', tone: 'danger', title: 'Legacy DB Export', description: 'Query timeout after 30s · no rows on join operation' },
      { id: 'ev10', time: '38s ago', badge: 'Auto-Scaled', tone: 'info', title: 'Worker Cluster', description: 'Scaled from 16 to 18 workers due to queue pressure' },
    ],
  },
  alerts: {
    subtitle: 'Unresolved operational alerts — sorted by severity',
    rows: [
      { id: 'al1', severity: 'Critical', tone: 'danger', target: 'worker-prod-05', context: 'Infrastructure', title: 'CPU utilization exceeded 90% for 6+ minutes', ago: '0s ago' },
      { id: 'al2', severity: 'Warning', tone: 'warning', target: 'prod-queue-01', context: 'Monitoring', title: 'Queue depth at 284 — approaching 500 threshold', ago: '8s ago' },
      { id: 'al3', severity: 'Warning', tone: 'warning', target: 'Legacy DB Export', context: 'Sync', title: 'Pipeline failed — query timeout, no rows on join', ago: '31s ago' },
      { id: 'al4', severity: 'Info', tone: 'info', target: 'Snowflake DW', context: 'Resolved', title: 'Connection reconnected after 14s interruption', ago: '24s ago' },
    ],
  },
  monitoringTable: {
    subtitle: 'All monitored components — near real operational data',
    total: 148,
    typeFilters: ['All', 'Pipeline', 'Worker', 'Connector', 'Queue'],
    statusFilters: ['All', 'Running', 'Busy', 'High CPU', 'Failed', 'Warning', 'Idle'],
    environmentFilters: ['All', 'Production', 'Staging', 'DevOps'],
    rows: [
      { id: 'c1', name: 'Customer Sync Daily', type: 'Pipeline', status: 'Running', activity: 'Transforming records', runtime: '1m 42s', throughput: '12.4K/s', cpu: '62%', latency: '—', environment: 'Production', owner: 'J. Park' },
      { id: 'c2', name: 'Orders → Warehouse', type: 'Pipeline', status: 'Running', activity: 'Loading to warehouse', runtime: '3m 08s', throughput: '19.8K/s', cpu: '58%', latency: '—', environment: 'Production', owner: 'A. Chen' },
      { id: 'c3', name: 'worker-prod-01', type: 'Worker', status: 'Busy', activity: '3 active tasks', runtime: '4h 12m', throughput: '9.1K/s', cpu: '82%', latency: '—', environment: 'Production', owner: 'DevOps' },
      { id: 'c4', name: 'worker-prod-02', type: 'Worker', status: 'High CPU', activity: '4 active tasks', runtime: '4h 12m', throughput: '14.3K/s', cpu: '91%', latency: '—', environment: 'Production', owner: 'DevOps' },
      { id: 'c5', name: 'Salesforce CRM', type: 'Connector', status: 'Running', activity: 'Polling — every 60s', runtime: '—', throughput: '—', cpu: '—', latency: '42ms', environment: 'Production', owner: 'S. Kim' },
      { id: 'c6', name: 'Stripe Payments', type: 'Connector', status: 'Failed', activity: 'Connection refused', runtime: '—', throughput: '—', cpu: '—', latency: '—', environment: 'Production', owner: 'S. Kim' },
      { id: 'c7', name: 'Historical Backfill', type: 'Pipeline', status: 'Warning', activity: 'Extracting (14%)', runtime: '15m 32s', throughput: '1.2K/s', cpu: '44%', latency: '—', environment: 'Production', owner: 'M. Torres' },
      { id: 'c8', name: 'Legacy DB Export', type: 'Pipeline', status: 'Failed', activity: 'Query timeout', runtime: '0m 04s', throughput: '—', cpu: '—', latency: '—', environment: 'Production', owner: 'K. Roy' },
      { id: 'c9', name: 'prod-queue-01', type: 'Queue', status: 'Warning', activity: '284 items queued', runtime: '—', throughput: '46.7K/s', cpu: '—', latency: '—', environment: 'Production', owner: 'DevOps' },
      { id: 'c10', name: 'worker-stg-02', type: 'Worker', status: 'Idle', activity: '0 active tasks', runtime: '4h 12m', throughput: '—', cpu: '8%', latency: '—', environment: 'Staging', owner: 'DevOps' },
    ],
  },
};

export async function getRealTimeMonitoring(range) {
  try {
    const query = range ? `?range=${encodeURIComponent(range)}` : '';
    const res = await apiFetch(`/dashboard/realtime-monitoring${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new RealTimeMonitoringError('Unable to load the real-time monitoring dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new RealTimeMonitoringError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_REAL_TIME_MONITORING, mocked: true };
  }
}
