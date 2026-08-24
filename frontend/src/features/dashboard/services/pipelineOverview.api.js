/**
 * Data for the Pipeline Overview Dashboard Screen (SCR-015, node 49:1793).
 *
 * MOCK BOUNDARY: MOD-008 (Pipeline Builder & Execution) is still
 * `PLANNED` with no backend deployed. `getPipelineOverview` always
 * attempts a real request first and only falls back to the mock
 * snapshot below when the endpoint is unreachable, mirroring
 * dashboard.api.js's `getDashboardSummary()` mock-fallback shape
 * (including the SCR-014-discovered dev-proxy content-type check).
 *
 * The mock KPI/health/alert/table values reproduce the literal
 * numbers shown in the Figma design (node 49:1793).
 *
 * KNOWN LIMITATION: the mock snapshot below is a single fixed
 * dataset and ignores the `dateRange` param (Today/7d/30d) — same
 * documented limitation as executiveDashboard.api.js's dateRange
 * handling. A real MOD-008 endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class PipelineOverviewError extends Error {}

const MOCK_PIPELINE_OVERVIEW = {
  updatedAt: '1m ago',
  summary: [
    { key: 'total', label: 'Total Pipelines', value: '184', helper: 'across all envs' },
    { key: 'running', label: 'Running Now', value: '28', helper: 'currently executing' },
    { key: 'succeeded', label: 'Succeeded Today', value: '1,428', helper: 'since midnight' },
    { key: 'failed', label: 'Failed Today', value: '17', helper: 'require attention' },
    { key: 'success-rate', label: 'Success Rate', value: '98.8%', helper: '↑ 0.2% vs yesterday' },
    { key: 'avg-runtime', label: 'Avg Runtime', value: '4m 26s', helper: "today's executions" },
  ],
  kpis: [
    { key: 'total', label: 'Total Pipelines', value: '184', tone: 'default', trend: '↑ 12 new this month', trendTone: 'up', footer: '156 active · 28 paused', icon: 'pipeline' },
    { key: 'running', label: 'Running Now', value: '28', tone: 'primary', trend: '↑ 4 from 1h ago', trendTone: 'up', footer: 'Across 4 workers', icon: 'wave' },
    { key: 'failed', label: 'Failed Today', value: '17', tone: 'danger', trend: '↑ 5 vs yesterday', trendTone: 'down', footer: '3 critical · 14 retried', icon: 'triangle' },
    { key: 'success-rate', label: 'Success Rate', value: '98.8%', tone: 'success', trend: '↑ 0.2% vs yesterday', trendTone: 'up', footer: 'Today · 1,445 executions', icon: 'circle-check' },
    { key: 'scheduled', label: 'Scheduled', value: '94', tone: 'default', trend: 'No changes', trendTone: 'flat', footer: 'Next run in 12m', icon: 'clock' },
    { key: 'queue', label: 'Queue Depth', value: '8', tone: 'warning', trend: 'Normal range', trendTone: 'flat', footer: 'Avg wait 28s', icon: 'play' },
    { key: 'data-processed', label: 'Data Processed', value: '3.1 TB', tone: 'default', trend: '↑ 8% vs yesterday', trendTone: 'up', footer: 'Today · 47 connectors', icon: 'database' },
    { key: 'sla', label: 'SLA Compliance', value: '99.94%', tone: 'success', trend: '↑ 0.1% this month', trendTone: 'up', footer: '1 incident · Resolved', icon: 'shield' },
  ],
  pipelineHealth: {
    total: 184,
    breakdown: [
      { key: 'healthy', label: 'Healthy', count: 139, percent: 75 },
      { key: 'warning', label: 'Warning', count: 18, percent: 10 },
      { key: 'failed', label: 'Failed', count: 11, percent: 6 },
      { key: 'paused', label: 'Paused', count: 12, percent: 7 },
      { key: 'disabled', label: 'Disabled', count: 4, percent: 2 },
    ],
    healthyTrend: '↑ 2%',
    avgUptime: '99.6%',
  },
  alerts: [
    { id: 'al1', title: 'Orders Sync failed 3× in 2 hours', description: 'shopify → bigquery · Connection timeout at extract step', severity: 'critical' },
    { id: 'al2', title: 'Finance pipeline latency 4.2× threshold', description: 'netsuite → postgres · Avg 18m 42s vs SLA of 5m', severity: 'critical' },
    { id: 'al3', title: 'Supplier Feed validation failure rate 28%', description: 'sftp → postgres · 3,218 records rejected this run', severity: 'warning' },
    { id: 'al4', title: 'Worker etl-worker-04 memory at 91%', description: 'etl-worker-04 · May cause slow executions during peak hours', severity: 'warning' },
    { id: 'al5', title: 'Email Campaigns pipeline missed schedule', description: 'mailchimp → bigquery · Last successful run 3 days ago', severity: 'warning' },
    { id: 'al6', title: 'Salesforce connector token expiring soon', description: 'Expires in 6 days · Renew to prevent pipeline interruption', severity: 'info' },
  ],
  activePipelines: [
    { id: 'ap1', name: 'Customer Data Sync', route: 'salesforce → postgres', progress: 68, stage: 'Transform · step 5/8', runtime: '2m 14s', trigger: 'Scheduled', worker: 'worker-01' },
    { id: 'ap2', name: 'Inventory Sync', route: 'warehouse api → redshift', progress: 44, stage: 'Load · step 3/6', runtime: '4m 32s', trigger: 'Scheduled', worker: 'worker-03' },
    { id: 'ap3', name: 'User Analytics', route: 'mixpanel → snowflake', progress: 21, stage: 'Extract · step 2/9', runtime: '3m 12s', trigger: 'Scheduled', worker: 'worker-02' },
    { id: 'ap4', name: 'Orders Retry #4', route: 'shopify → bigquery', progress: 8, stage: 'Extract · step 1/8', runtime: '0m 28s', trigger: 'Manual', worker: 'worker-04' },
    { id: 'ap5', name: 'Marketing Events', route: 'segment → redshift', progress: 94, stage: 'Validate · step 7/8', runtime: '0m 44s', trigger: 'Scheduled', worker: 'worker-01' },
  ],
  executionVolume24h: {
    subtitle: 'Hourly breakdown — last 24 hours',
    series: [
      { label: '12a', successful: 34, failed: 2 }, { label: '1a', successful: 22, failed: 1 },
      { label: '2a', successful: 18, failed: 0 }, { label: '3a', successful: 15, failed: 0 },
      { label: '4a', successful: 12, failed: 1 }, { label: '5a', successful: 20, failed: 0 },
      { label: '6a', successful: 38, failed: 2 }, { label: '7a', successful: 52, failed: 1 },
      { label: '8a', successful: 61, failed: 3 }, { label: '9a', successful: 58, failed: 2 },
      { label: '10a', successful: 64, failed: 1 }, { label: '11a', successful: 70, failed: 2 },
      { label: '12p', successful: 74, failed: 3 }, { label: '1p', successful: 69, failed: 1 },
      { label: '2p', successful: 63, failed: 2 }, { label: '3p', successful: 57, failed: 1 },
      { label: '4p', successful: 51, failed: 0 }, { label: '5p', successful: 46, failed: 1 },
      { label: '6p', successful: 40, failed: 0 }, { label: '7p', successful: 35, failed: 0 },
      { label: '8p', successful: 30, failed: 0 }, { label: '9p', successful: 27, failed: 0 },
      { label: '10p', successful: 24, failed: 0 }, { label: '11p', successful: 21, failed: 0 },
    ],
    stats: { totalToday: '1,445', successful: '1,428', failed: '17', peakHour: '12pm · 74' },
  },
  successRateTrend7d: {
    subtitle: 'Last 7 days · daily',
    series: [
      { label: 'Mon', rate: 98.7 }, { label: 'Tue', rate: 99.0 }, { label: 'Wed', rate: 99.4 },
      { label: 'Thu', rate: 98.5 }, { label: 'Fri', rate: 99.6 }, { label: 'Sat', rate: 99.8 },
      { label: 'Sun', rate: 98.9 },
    ],
    stats: { avg7d: '98.6%', bestDay: '99.1%' },
  },
  pipelinesTable: {
    statusFilters: [
      { key: 'all', label: 'All', count: 184 },
      { key: 'running', label: 'Running', count: 28 },
      { key: 'failed', label: 'Failed', count: 17 },
      { key: 'warning', label: 'Warning', count: 18 },
      { key: 'paused', label: 'Paused', count: 12 },
      { key: 'scheduled', label: 'Scheduled', count: 94 },
    ],
    rows: [
      { id: 'pl1', name: 'Customer Data Sync', route: 'salesforce → postgres', status: 'running', owner: 'A. Chen', ownerInitials: 'AC', schedule: 'Hourly', nextRun: '+1h', lastRun: 'Just now', runtime: '2m 14s', successRate: 99.2, tags: ['CRM', 'Sales'] },
      { id: 'pl2', name: 'Orders Sync', route: 'shopify → bigquery', status: 'failed', owner: 'R. Chen', ownerInitials: 'RC', schedule: '30m', nextRun: '+15m', lastRun: '15m ago', runtime: '1m 18s', successRate: 97.8, tags: ['Commerce'] },
      { id: 'pl3', name: 'Inventory Sync', route: 'warehouse api → redshift', status: 'running', owner: 'M. Torres', ownerInitials: 'MT', schedule: 'Every 2h', nextRun: '+1h 52m', lastRun: '8m ago', runtime: '4m 32s', successRate: 98.4, tags: ['Commerce'] },
      { id: 'pl4', name: 'User Analytics', route: 'mixpanel → snowflake', status: 'running', owner: 'A. Chen', ownerInitials: 'AC', schedule: 'Every 4h', nextRun: '+2h 30m', lastRun: '18m ago', runtime: '3m 12s', successRate: 96.9, tags: ['Analytics'] },
      { id: 'pl5', name: 'Product Catalog', route: 'pim → elasticsearch', status: 'warning', owner: 'M. Torres', ownerInitials: 'MT', schedule: 'Daily', nextRun: '+18h', lastRun: '1h ago', runtime: '5m 42s', successRate: 91.2, tags: ['Commerce'] },
      { id: 'pl6', name: 'Financial Reconciliation', route: 'netsuite → postgres', status: 'paused', owner: 'R. Chen', ownerInitials: 'RC', schedule: 'Daily', nextRun: '—', lastRun: '2d ago', runtime: '6m 05s', successRate: 94.1, tags: ['Finance'] },
      { id: 'pl7', name: 'Supplier Feed Validation', route: 'sftp → postgres', status: 'warning', owner: 'A. Chen', ownerInitials: 'AC', schedule: 'Every 6h', nextRun: '+3h', lastRun: '3h ago', runtime: '2m 51s', successRate: 72.4, tags: ['Supply Chain'] },
      { id: 'pl8', name: 'Email Campaign Sync', route: 'mailchimp → bigquery', status: 'scheduled', owner: 'M. Torres', ownerInitials: 'MT', schedule: 'Daily', nextRun: '+9h', lastRun: '3d ago', runtime: '1m 40s', successRate: 99.0, tags: ['Marketing'] },
    ],
    totalCount: 184,
  },
};

export async function getPipelineOverview(dateRange) {
  try {
    const query = dateRange ? `?range=${encodeURIComponent(dateRange)}` : '';
    const res = await apiFetch(`/dashboard/pipelines${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new PipelineOverviewError('Unable to load the pipeline overview right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new PipelineOverviewError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_PIPELINE_OVERVIEW, mocked: true };
  }
}
