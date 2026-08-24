/**
 * Data for the Execution Statistics Dashboard Screen (SCR-020, node
 * 84:5098, Figma page "Page 1").
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-006 (Pipelines / Executions) — the module that
 * would produce real execution-run telemetry — is also still `PLANNED`
 * with no backend deployed. `getExecutionStatistics` always attempts a
 * real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring destinationHealth.api.js's
 * dev-proxy-aware mock-fallback shape (including the SCR-014-discovered
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback).
 *
 * FIGMA VERIFICATION: node 84:5098 WAS inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). Every KPI value, chart
 * breakdown, ranked list, schedule stat, insight, and the 10 execution
 * rows below are transcribed from the actual frame's text nodes, so the
 * layout/content fidelity is `verified` (unlike SCR-018/019, which had
 * no MCP available). See docs/reviews/review-log.md.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed dataset and
 * ignores the `range` param (7d/30d/90d/1y) — same documented
 * limitation as the sibling MOD-009 api modules. A real MOD-009
 * endpoint would aggregate per range.
 *
 * FIGMA-SOURCE CONFLICT (agent-rules.md §3): the Figma frame itself
 * quotes two different success rates — "98.3%" in the headline chip and
 * "98.9%" in the summary strip / KPI card. Rather than surface an
 * internally-contradictory UI, the headline success rate is reconciled
 * to 98.9% here (successful 38,037 / total 38,452 = 98.92%, which is the
 * arithmetically correct figure). The 98.3% figure is a Figma typo and
 * is intentionally NOT reproduced.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ExecutionStatisticsError extends Error {}

const MOCK_EXECUTION_STATISTICS = {
  updatedAt: '17 seconds ago',
  headline: {
    growth: '+12.4% Growth',
    successRate: '98.9% Success Rate',
    context: '38,452 total executions · 56 active regions',
    successful: '38,037',
    failed: '415',
    atRisk: '42',
  },
  summary: {
    growthLabel: '+12.4% Execution Growth · 98.9% Success Rate',
    context: '38,452 total executions this period · 42 active',
    stats: [
      { key: 'total', label: 'Total Executions', value: '38,452', tone: 'default' },
      { key: 'successful', label: 'Successful', value: '38,037', tone: 'success' },
      { key: 'failed', label: 'Failed', value: '415', tone: 'danger' },
      { key: 'active-now', label: 'Active Now', value: '42', tone: 'default' },
      { key: 'success-rate', label: 'Success Rate', value: '98.9%', tone: 'default' },
      { key: 'avg-runtime', label: 'Avg Runtime', value: '1m 48s', tone: 'default' },
    ],
  },
  kpis: [
    { key: 'error-rate', label: 'Error Rate', value: '1.08', suffix: '%', tone: 'default', trend: '↓ 3.5bp', trendTone: 'up', footer: '5th pct of 30,451', icon: 'triangle' },
    { key: 'sla-compliance', label: 'SLA Compliance', value: '99.2', suffix: '%', tone: 'success', trend: '↑ 1bp', trendTone: 'up', footer: '23 SLA breaches full average', icon: 'shield' },
    { key: 'avg-queue-time', label: 'Avg Queue Time', value: '2m 14s', tone: 'default', trend: '↓ 20.2%', trendTone: 'up', footer: 'vs 3s overall period', icon: 'clock' },
    { key: 'pipeline-growth', label: 'Pipeline Growth', value: '+12.4', suffix: '%', tone: 'success', trend: '↑ 4.3bp', trendTone: 'up', footer: 'vs 12% last period', icon: 'trend-up' },
    { key: 'retries', label: 'Retries', value: '128', tone: 'default', trend: '↑ 16 vs last', trendTone: 'down', footer: 'avg last 7d: 110', icon: 'refresh' },
    { key: 'success-rate', label: 'Success Rate', value: '98.9', suffix: '%', tone: 'success', trend: '↑ 4.9%', trendTone: 'up', footer: 'vs target 98.1%', icon: 'circle-check' },
    { key: 'avg-runtime', label: 'Avg Runtime', value: '1m 48s', tone: 'default', trend: '↑ 14.5%', trendTone: 'down', footer: 'vs 1.3s daily goal', icon: 'wave' },
    { key: 'throughput', label: 'Throughput', value: '3,210', tone: 'default', trend: '↑ 16.8%', trendTone: 'up', footer: 'executions per hour', icon: 'activity' },
    { key: 'total-executions', label: 'Total Executions', value: '38,452', tone: 'default', trend: '↑ 8.1%', trendTone: 'up', footer: 'vs 23,091 last period', icon: 'pipeline' },
    { key: 'outcomes', label: 'Outcomes', value: '38,037', tone: 'default', trend: '↑ 10.2%', trendTone: 'up', footer: 'vs 33,090 last period', icon: 'check-square' },
    { key: 'daily-executions', label: 'Daily Executions', value: '415', tone: 'default', trend: '↓ 20.4%', trendTone: 'down', footer: 'vs 521 last control', icon: 'bar-chart' },
    { key: 'active-regions', label: 'Active Regions', value: '42', tone: 'default', trend: null, trendTone: 'flat', footer: 'Across 6 environments', icon: 'server' },
  ],
  volumeTrend: {
    subtitle: 'Daily execution results · last 30 days',
    axisMax: 6000,
    ticks: ['Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
    successful: [3120, 2980, 3240, 3010, 2870, 3180, 3410, 3300, 3150, 3260, 3390, 3480, 3300, 3120],
    failed: [42, 38, 55, 61, 48, 44, 39, 52, 47, 41, 58, 63, 49, 45],
  },
  outcomeBreakdown: {
    subtitle: 'Execution outcome breakdown — last 7 days',
    rows: [
      { key: 'successful', label: 'Successful', value: '38,037', pct: 98.9, tone: 'success' },
      { key: 'failed', label: 'Failed', value: '415', pct: 1.08, tone: 'danger' },
      { key: 'retry-success', label: 'Retry Success', value: '312', pct: 0.81, tone: 'info' },
      { key: 'partial', label: 'Partial Success', value: '68', pct: 0.18, tone: 'warning' },
      { key: 'cancelled', label: 'Cancelled', value: '29', pct: 0.07, tone: 'neutral' },
      { key: 'timeout', label: 'Timeout', value: '18', pct: 0.05, tone: 'purple' },
    ],
  },
  runtimePerformance: {
    subtitle: 'Execution duration distribution',
    average: '1m 48s',
    median: '0.4s',
    longest: '18m 32s',
    axisTicks: ['0s', '150s', '300s', '450s', '600s'],
    axisMax: 600,
    percentiles: [
      { key: 'p50', label: 'P50', value: 0.4, tone: 'primary' },
      { key: 'p75', label: 'P75', value: 12, tone: 'primary' },
      { key: 'p90', label: 'P90', value: 108, tone: 'primary' },
      { key: 'p95', label: 'P95', value: 320, tone: 'danger' },
      { key: 'p99', label: 'P99', value: 560, tone: 'danger' },
    ],
  },
  environmentStats: {
    subtitle: 'Execution breakdown by performance',
    rows: [
      { key: 'production', label: 'Production', pct: 99.4, total: '124 total runs', tone: 'success' },
      { key: 'staging', label: 'Staging', pct: 69.2, total: '124 total runs', tone: 'warning' },
      { key: 'development', label: 'Development', pct: 46.8, total: '124 total runs', tone: 'danger' },
      { key: 'testing', label: 'Testing', pct: 94.2, total: '124 total runs', tone: 'success' },
    ],
  },
  mostExecuted: {
    subtitle: 'By run count — last 7 days',
    rows: [
      { rank: 1, name: 'Customer Sync Daily', runs: '4,218 runs', rate: '99.6%' },
      { rank: 2, name: 'Orders → Warehouse', runs: '3,891 runs', rate: '98.9%' },
      { rank: 3, name: 'Inventory Refresh', runs: '3,244 runs', rate: '99.1%' },
      { rank: 4, name: 'Analytics Rollup', runs: '2,760 runs', rate: '97.4%' },
      { rank: 5, name: 'User Events Stream', runs: '2,481 runs', rate: '98.2%' },
    ],
  },
  highestFailure: {
    subtitle: 'By failure percentage — last 7 days',
    rows: [
      { rank: 1, name: 'External API Fetch', rate: '8.4% fail rate', severity: 'critical' },
      { rank: 2, name: 'Legacy DB Export', rate: '5.1% fail rate', severity: 'high' },
      { rank: 3, name: 'Partner Data Ingest', rate: '3.7% fail rate', severity: 'medium' },
      { rank: 4, name: 'CDC Replication', rate: '2.2% fail rate', severity: 'medium' },
      { rank: 5, name: 'S3 Archival Job', rate: '1.8% fail rate', severity: 'low' },
    ],
  },
  scheduleAnalytics: {
    subtitle: 'Execution trigger breakdown and schedule reliability',
    triggerTypes: [
      { key: 'scheduled', label: 'Scheduled', value: '28,440', pct: 73.9, tone: 'primary' },
      { key: 'manual', label: 'Manual', value: '5,614', pct: 14.6, tone: 'primary' },
      { key: 'api', label: 'API-Triggered', value: '3,080', pct: 8, tone: 'primary' },
      { key: 'event', label: 'Event-Driven', value: '1,318', pct: 3.4, tone: 'primary' },
    ],
    reliability: [
      { key: 'on-time', label: 'On-time', value: '27,892', pct: 98.1, tone: 'success' },
      { key: 'delayed', label: 'Delayed', value: '382', pct: 1.3, tone: 'warning' },
      { key: 'missed', label: 'Missed', value: '166', pct: 0.6, tone: 'danger' },
    ],
  },
  insights: {
    subtitle: 'Automated operational intelligence — last 24 hours',
    rows: [
      { id: 'in1', title: 'Success rate improved by 4.2%', description: 'vs prior 7-day period · driven by pipeline stability fixes', badge: 'Improvement', tone: 'success' },
      { id: 'in2', title: '"Customer Sync" reduced runtime by 18%', description: 'Avg dropped from 2m 12s → 1m 49s after indexing update', badge: 'Performance', tone: 'info' },
      { id: 'in3', title: 'Retry rate spiked during 02:00–04:00 UTC', description: 'External API timeouts on partner endpoint · monitoring active', badge: 'Warning', tone: 'warning' },
      { id: 'in4', title: 'Production executions increased by 11%', description: 'New tenant onboarding driving volume growth · SLA maintained', badge: 'Growth', tone: 'purple' },
    ],
  },
  executions: {
    subtitle: '10 most recent · Filtered and Paginated',
    total: 38452,
    statusFilters: ['All', 'Success', 'Failed', 'Running', 'Queued', 'Cancelled'],
    environmentFilters: ['All', 'Production', 'Staging', 'Development'],
    triggerFilters: ['All', 'Scheduled', 'Manual', 'API', 'Event'],
    rows: [
      { id: 'EX-48291', pipeline: 'Customer Sync Daily', trigger: 'Scheduled', environment: 'Production', status: 'Success', runtime: '1m 42s', queueTime: '0.8s', startedAt: '08:00:02 UTC', worker: 'worker-prod-01', data: '2.4 GB', sla: 'Met' },
      { id: 'EX-48290', pipeline: 'Orders → Warehouse', trigger: 'Scheduled', environment: 'Production', status: 'Success', runtime: '3m 08s', queueTime: '1.1s', startedAt: '07:55:00 UTC', worker: 'worker-prod-03', data: '8.1 GB', sla: 'Met' },
      { id: 'EX-48289', pipeline: 'External API Fetch', trigger: 'API', environment: 'Production', status: 'Failed', runtime: '0m 14s', queueTime: '0.3s', startedAt: '07:52:14 UTC', worker: 'worker-prod-02', data: '0 B', sla: 'Breached' },
      { id: 'EX-48288', pipeline: 'Analytics Rollup', trigger: 'Scheduled', environment: 'Staging', status: 'Running', runtime: '2m 31s', queueTime: '2.4s', startedAt: '08:01:00 UTC', worker: 'worker-stg-01', data: '—', sla: 'Met' },
      { id: 'EX-48287', pipeline: 'Inventory Refresh', trigger: 'Event', environment: 'Production', status: 'Success', runtime: '0m 58s', queueTime: '0.6s', startedAt: '07:48:10 UTC', worker: 'worker-prod-04', data: '440 MB', sla: 'Met' },
      { id: 'EX-48286', pipeline: 'Legacy DB Export', trigger: 'Manual', environment: 'Development', status: 'Failed', runtime: '1m 02s', queueTime: '4.2s', startedAt: '07:44:33 UTC', worker: 'worker-dev-01', data: '120 MB', sla: 'Breached' },
      { id: 'EX-48285', pipeline: 'User Events Stream', trigger: 'Scheduled', environment: 'Production', status: 'Success', runtime: '2m 19s', queueTime: '0.9s', startedAt: '07:40:00 UTC', worker: 'worker-prod-01', data: '6.3 GB', sla: 'Met' },
      { id: 'EX-48284', pipeline: 'CDC Replication', trigger: 'Scheduled', environment: 'Production', status: 'Queued', runtime: '—', queueTime: '1m 14s', startedAt: '08:02:01 UTC', worker: '—', data: '—', sla: 'Met' },
      { id: 'EX-48283', pipeline: 'S3 Archival Job', trigger: 'Scheduled', environment: 'Staging', status: 'Success', runtime: '4m 22s', queueTime: '1.8s', startedAt: '07:30:00 UTC', worker: 'worker-stg-02', data: '18.2 GB', sla: 'Met' },
      { id: 'EX-48282', pipeline: 'Partner Data Ingest', trigger: 'API', environment: 'Production', status: 'Cancelled', runtime: '0m 08s', queueTime: '0.5s', startedAt: '07:25:44 UTC', worker: 'worker-prod-02', data: '0 B', sla: 'Breached' },
    ],
  },
};

export async function getExecutionStatistics(range) {
  try {
    const query = range ? `?range=${encodeURIComponent(range)}` : '';
    const res = await apiFetch(`/dashboard/execution-statistics${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ExecutionStatisticsError('Unable to load the execution statistics dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new ExecutionStatisticsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_EXECUTION_STATISTICS, mocked: true };
  }
}
