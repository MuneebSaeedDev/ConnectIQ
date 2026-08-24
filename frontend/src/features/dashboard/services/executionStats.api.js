/**
 * Data for the Execution Statistics Dashboard Screen (SCR-020, node 84:5098).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-008 (Pipeline Builder & Execution) — the module
 * that produces the real `PipelineExecution`/`ExecutionLog` records this
 * dashboard aggregates — is also still `PLANNED` with no backend
 * deployed. `getExecutionStats` always attempts a real request first and
 * only falls back to the mock snapshot below when the endpoint is
 * unreachable, mirroring destinationHealth.api.js's/sourceHealth.api.js's
 * dev-proxy-aware mock-fallback shape (including the SCR-014-discovered
 * content-type check against the Vite dev server's own HTML fallback).
 *
 * FIGMA-VERIFIED (agent-rules.md §3): unlike SCR-019, a Figma MCP tool
 * WAS available in the session that built this screen. Node 84:5098 was
 * traversed in full (get_metadata + per-section get_design_context) and
 * every label/value/color below is read directly from the design, not
 * inferred — the SCR-019 "not-verified" gap does not apply here.
 *
 * FIGMA DATA CONFLICT (documented, not silently resolved — agent-rules.md
 * §3): the design's top "summary strip" sub-node reads "98.3% Success
 * Rate · 56 active regions", which contradicts the banner, all KPI cards,
 * and the Success-vs-Failure card (all 98.9% / 42 active). The dominant
 * value set (98.9% / 42) is reproduced here and the stale strip copy is
 * NOT rendered as a separate contradictory row — flagged for the design
 * owner. Two KPI footer captions ("5th pct of 30,451", "23 SLA breaches
 * full average") read like placeholder phrasing in the source; preserved
 * verbatim rather than rewritten.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed dataset and
 * ignores the `timeRange` param (7d/30d/90d/1y) — same documented
 * limitation as every sibling MOD-009 screen. A real MOD-009 endpoint
 * would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ExecutionStatsError extends Error {}

const MOCK_EXECUTION_STATS = {
  updatedAt: '18 seconds ago',
  summary: {
    headline: '+12.4% Execution Growth · 98.9% Success Rate',
    subtitle: '38,452 total executions this period · 42 active',
    tiles: [
      { key: 'total', label: 'Total Executions', value: '38,452', tone: 'default' },
      { key: 'successful', label: 'Successful', value: '38,037', tone: 'success' },
      { key: 'failed', label: 'Failed', value: '415', tone: 'danger' },
      { key: 'active', label: 'Active Now', value: '42', tone: 'primary' },
      { key: 'success-rate', label: 'Success Rate', value: '98.9%', tone: 'default' },
      { key: 'avg-runtime', label: 'Avg Runtime', value: '1m 48s', tone: 'default' },
    ],
  },
  kpis: [
    { key: 'error-rate', label: 'Error Rate', value: '1.08', suffix: '%', tone: 'default', footer: '5th pct of 30,451', trend: '↓ 3.5bp', trendTone: 'up', icon: 'alert' },
    { key: 'sla-compliance', label: 'SLA Compliance', value: '99.2', suffix: '%', tone: 'success', footer: '23 SLA breaches full average', trend: '↑ 1bp', trendTone: 'up', icon: 'shield' },
    { key: 'avg-queue-time', label: 'Avg Queue Time', value: '2m 14s', tone: 'default', footer: 'vs 3s overall period', trend: '↓ 20.2%', trendTone: 'up', icon: 'clock' },
    { key: 'pipeline-growth', label: 'Pipeline Growth', value: '+12.4', suffix: '%', tone: 'info', footer: 'vs 12% last period', trend: '↑ 4.3bp', trendTone: 'up', icon: 'trend' },
    { key: 'retries', label: 'Retries', value: '128', tone: 'default', footer: 'avg last 7d: 110', trend: '↑ 16 vs last', trendTone: 'down', icon: 'refresh' },
    { key: 'success-rate', label: 'Success Rate', value: '98.9', suffix: '%', tone: 'success', footer: 'vs target 98.1%', trend: '↑ 4.9%', trendTone: 'up', icon: 'circle-check' },
    { key: 'avg-runtime', label: 'Avg Runtime', value: '1m 48s', tone: 'default', footer: 'vs 1.3s daily goal', trend: '↑ 14.5%', trendTone: 'down', icon: 'wave' },
    { key: 'throughput', label: 'Throughput', value: '3,210', tone: 'default', footer: 'executions per hour', trend: '↑ 16.8%', trendTone: 'up', icon: 'activity' },
    { key: 'total-executions', label: 'Total Executions', value: '38,452', tone: 'default', footer: 'vs 23,091 last period', trend: '↑ 8.1%', trendTone: 'up', icon: 'layers' },
    { key: 'outcomes', label: 'Outcomes', value: '38,037', tone: 'success', footer: 'vs 33,090 last period', trend: '↑ 10.2%', trendTone: 'up', icon: 'circle-check' },
    { key: 'daily-executions', label: 'Daily Executions', value: '415', tone: 'danger', footer: 'vs 521 last control', trend: '↓ 20.4%', trendTone: 'down', icon: 'bar-chart' },
    { key: 'active-regions', label: 'Active Regions', value: '42', tone: 'default', footer: 'Across 6 environments', trend: null, trendTone: 'flat', icon: 'pipeline' },
  ],
  volumeTrend: {
    subtitle: 'Daily execution results · last 30 days',
    xLabels: ['Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
    yMax: 6000,
    yTicks: [6000, 4500, 3000, 1500, 0],
    successful: [3120, 3480, 3260, 3900, 4180, 4020, 4560],
    failed: [58, 42, 96, 61, 48, 74, 52],
  },
  outcomeBreakdown: {
    subtitle: 'Execution outcome breakdown — last 7 days',
    rows: [
      { key: 'successful', label: 'Successful', value: '38,037', percent: 98.9, tone: 'success' },
      { key: 'failed', label: 'Failed', value: '415', percent: 1.08, tone: 'danger' },
      { key: 'retry-success', label: 'Retry Success', value: '312', percent: 0.81, tone: 'primary' },
      { key: 'partial', label: 'Partial Success', value: '68', percent: 0.18, tone: 'warning' },
      { key: 'cancelled', label: 'Cancelled', value: '29', percent: 0.07, tone: 'neutral' },
      { key: 'timeout', label: 'Timeout', value: '18', percent: 0.05, tone: 'purple' },
    ],
  },
  runtimePerformance: {
    subtitle: 'Execution duration distribution',
    stats: [
      { key: 'average', label: 'Average', value: '1m 48s', tone: 'primary' },
      { key: 'median', label: 'Median', value: '0.4s', tone: 'default' },
      { key: 'longest', label: 'Longest', value: '18m 32s', tone: 'danger' },
    ],
    xLabels: ['0s', '150s', '300s', '450s', '600s'],
    bars: [
      { key: 'p50', label: 'P50', seconds: 24, max: 600 },
      { key: 'p75', label: 'P75', seconds: 62, max: 600 },
      { key: 'p90', label: 'P90', seconds: 148, max: 600 },
      { key: 'p95', label: 'P95', seconds: 312, max: 600 },
      { key: 'p99', label: 'P99', seconds: 548, max: 600 },
    ],
  },
  environments: {
    subtitle: 'Execution breakdown by performance',
    rows: [
      { key: 'production', label: 'Production', percent: 99.4, tone: 'success', runs: '124 total runs' },
      { key: 'staging', label: 'Staging', percent: 69.2, tone: 'warning', runs: '124 total runs' },
      { key: 'development', label: 'Development', percent: 46.8, tone: 'danger', runs: '124 total runs' },
      { key: 'testing', label: 'Testing', percent: 94.2, tone: 'success', runs: '124 total runs' },
    ],
  },
  mostExecuted: {
    subtitle: 'By run count — last 7 days',
    rows: [
      { id: 'me1', rank: 1, name: 'Customer Sync Daily', runs: '4,218 runs', rate: '99.6%', rateTone: 'success' },
      { id: 'me2', rank: 2, name: 'Orders → Warehouse', runs: '3,891 runs', rate: '98.9%', rateTone: 'success' },
      { id: 'me3', rank: 3, name: 'Inventory Refresh', runs: '3,244 runs', rate: '99.1%', rateTone: 'success' },
      { id: 'me4', rank: 4, name: 'Analytics Rollup', runs: '2,760 runs', rate: '97.4%', rateTone: 'warning' },
      { id: 'me5', rank: 5, name: 'User Events Stream', runs: '2,481 runs', rate: '98.2%', rateTone: 'success' },
    ],
  },
  highestFailure: {
    subtitle: 'By failure percentage — last 7 days',
    rows: [
      { id: 'hf1', name: 'External API Fetch', rate: '8.4% fail rate', rateTone: 'danger', severity: 'Critical' },
      { id: 'hf2', name: 'Legacy DB Export', rate: '5.1% fail rate', rateTone: 'danger', severity: 'High' },
      { id: 'hf3', name: 'Partner Data Ingest', rate: '3.7% fail rate', rateTone: 'warning', severity: 'Medium' },
      { id: 'hf4', name: 'CDC Replication', rate: '2.2% fail rate', rateTone: 'warning', severity: 'Medium' },
      { id: 'hf5', name: 'S3 Archival Job', rate: '1.8% fail rate', rateTone: 'warning', severity: 'Low' },
    ],
  },
  schedule: {
    subtitle: 'Execution trigger breakdown and schedule reliability',
    triggers: [
      { key: 'scheduled', label: 'Scheduled', value: '28,440', percent: 73.9, dot: 'primary' },
      { key: 'manual', label: 'Manual', value: '5,614', percent: 14.6, dot: 'neutral' },
      { key: 'api', label: 'API-Triggered', value: '3,080', percent: 8, dot: 'purple' },
      { key: 'event', label: 'Event-Driven', value: '1,318', percent: 3.4, dot: 'warning' },
    ],
    reliability: [
      { key: 'on-time', label: 'On-time', value: '27,892', percent: 98.1, dot: 'success' },
      { key: 'delayed', label: 'Delayed', value: '382', percent: 1.3, dot: 'warning' },
      { key: 'missed', label: 'Missed', value: '166', percent: 0.6, dot: 'danger' },
    ],
  },
  insights: {
    subtitle: 'Automated operational intelligence — last 24 hours',
    rows: [
      { id: 'in1', icon: 'circle-check', tone: 'success', title: 'Success rate improved by 4.2%', description: 'vs prior 7-day period · driven by pipeline stability fixes', label: 'Improvement' },
      { id: 'in2', icon: 'activity', tone: 'primary', title: '"Customer Sync" reduced runtime by 18%', description: 'Avg dropped from 2m 12s → 1m 49s after indexing update', label: 'Performance' },
      { id: 'in3', icon: 'alert-triangle', tone: 'warning', title: 'Retry rate spiked during 02:00–04:00 UTC', description: 'External API timeouts on partner endpoint — monitoring active', label: 'Warning' },
      { id: 'in4', icon: 'activity', tone: 'purple', title: 'Production executions increased by 11%', description: 'New tenant onboarding driving volume growth · SLA maintained', label: 'Growth' },
    ],
  },
  executions: {
    subtitle: '10 most recent · Filtered and Paginated',
    total: 38452,
    statusFilters: [
      { key: 'all', label: 'All' },
      { key: 'Success', label: 'Success' },
      { key: 'Failed', label: 'Failed' },
      { key: 'Running', label: 'Running' },
      { key: 'Queued', label: 'Queued' },
      { key: 'Cancelled', label: 'Cancelled' },
    ],
    rows: [
      { id: 'EX-48291', pipeline: 'Customer Sync Daily', trigger: 'Scheduled', env: 'Production', status: 'Success', runtime: '1m 42s', queue: '0.8s', started: '08:00:02 UTC', worker: 'worker-prod-01', data: '2.4 GB', sla: 'Met' },
      { id: 'EX-48290', pipeline: 'Orders → Warehouse', trigger: 'Scheduled', env: 'Production', status: 'Success', runtime: '3m 08s', queue: '1.1s', started: '07:55:00 UTC', worker: 'worker-prod-03', data: '8.1 GB', sla: 'Met' },
      { id: 'EX-48289', pipeline: 'External API Fetch', trigger: 'API', env: 'Production', status: 'Failed', runtime: '0m 14s', queue: '0.3s', started: '07:52:14 UTC', worker: 'worker-prod-02', data: '0 B', sla: 'Breached' },
      { id: 'EX-48288', pipeline: 'Analytics Rollup', trigger: 'Scheduled', env: 'Staging', status: 'Running', runtime: '2m 31s', queue: '2.4s', started: '08:01:00 UTC', worker: 'worker-stg-01', data: '—', sla: 'Met' },
      { id: 'EX-48287', pipeline: 'Inventory Refresh', trigger: 'Event', env: 'Production', status: 'Success', runtime: '0m 58s', queue: '0.6s', started: '07:48:10 UTC', worker: 'worker-prod-04', data: '440 MB', sla: 'Met' },
      { id: 'EX-48286', pipeline: 'Legacy DB Export', trigger: 'Manual', env: 'Development', status: 'Failed', runtime: '1m 02s', queue: '4.2s', started: '07:44:33 UTC', worker: 'worker-dev-01', data: '120 MB', sla: 'Breached' },
      { id: 'EX-48285', pipeline: 'User Events Stream', trigger: 'Scheduled', env: 'Production', status: 'Success', runtime: '2m 19s', queue: '0.9s', started: '07:40:00 UTC', worker: 'worker-prod-01', data: '6.3 GB', sla: 'Met' },
      { id: 'EX-48284', pipeline: 'CDC Replication', trigger: 'Scheduled', env: 'Production', status: 'Queued', runtime: '—', queue: '1m 14s', started: '08:02:01 UTC', worker: '—', data: '—', sla: 'Met' },
      { id: 'EX-48283', pipeline: 'S3 Archival Job', trigger: 'Scheduled', env: 'Staging', status: 'Success', runtime: '4m 22s', queue: '1.8s', started: '07:30:00 UTC', worker: 'worker-stg-02', data: '18.2 GB', sla: 'Met' },
      { id: 'EX-48282', pipeline: 'Partner Data Ingest', trigger: 'API', env: 'Production', status: 'Cancelled', runtime: '0m 08s', queue: '0.5s', started: '07:25:44 UTC', worker: 'worker-prod-02', data: '0 B', sla: 'Breached' },
    ],
  },
};

export async function getExecutionStats(timeRange) {
  try {
    const query = timeRange ? `?range=${encodeURIComponent(timeRange)}` : '';
    const res = await apiFetch(`/dashboard/executions${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ExecutionStatsError('Unable to load the execution statistics dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new ExecutionStatsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_EXECUTION_STATS, mocked: true };
  }
}

