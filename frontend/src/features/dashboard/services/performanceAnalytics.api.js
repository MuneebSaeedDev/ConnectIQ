/**
 * Data for the Performance Analytics Dashboard Screen (SCR-022, node
 * 70:43606, Figma page "Page 1").
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-008 (Operations — the module that would produce
 * real worker/queue/runtime telemetry) is also `PLANNED` with no
 * backend deployed. `getPerformanceAnalytics` always attempts a real
 * request first and only falls back to the mock snapshot below when the
 * endpoint is unreachable, mirroring the sibling MOD-009 modules
 * (executionStatistics.api.js / errorAnalytics.api.js), including the
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback.
 *
 * FIGMA VERIFICATION: node 70:43606 WAS inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). Every KPI value, chart
 * series, resource-utilization row, runtime/throughput stat, ranked
 * pipeline, regression, worker row, capacity forecast, recommendation,
 * and the 8 component table rows below are transcribed from the actual
 * frame's text nodes, so the layout/content fidelity is `verified`.
 * See docs/reviews/review-log.md.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed dataset and
 * ignores the `range` param (7d/30d/90d/1y) — same documented
 * limitation as the sibling MOD-009 api modules. A real MOD-009/MOD-008
 * endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class PerformanceAnalyticsError extends Error {}

const MOCK_PERFORMANCE_ANALYTICS = {
  updatedAt: '31 seconds ago',
  headline: {
    summary: '94.8% Efficiency · 99.2% SLA · ↑ 8.4% Improvement',
    context: 'Platform running above target across execution speed, throughput, and infrastructure utilization',
    stats: [
      { key: 'efficiency', label: 'Overall Efficiency', value: '94.8%', tone: 'success' },
      { key: 'sla', label: 'SLA Compliance', value: '99.2%', tone: 'success' },
      { key: 'avg-runtime', label: 'Avg Runtime', value: '1m 48s', tone: 'default' },
      { key: 'throughput', label: 'Throughput', value: '3,210/hr', tone: 'default' },
      { key: 'improvement', label: 'Improvement', value: '+8.4%', tone: 'success' },
      { key: 'active-workers', label: 'Active Workers', value: '24', tone: 'default' },
    ],
  },
  kpis: [
    { key: 'performance-score', label: 'Performance Score', value: '94.8', tone: 'success', trend: '+2.1 vs last week', trendTone: 'up', footer: 'Composite of speed, SLA & utilization', icon: 'zap' },
    { key: 'avg-execution-time', label: 'Avg Execution Time', value: '1.42', suffix: 's', tone: 'success', trend: '-0.18s', trendTone: 'up', footer: 'Per record — vs 1.60s last week', icon: 'clock' },
    { key: 'avg-pipeline-runtime', label: 'Avg Pipeline Runtime', value: '1m 48s', tone: 'success', trend: '-12s', trendTone: 'up', footer: 'End-to-end — vs 2m 00s', icon: 'activity' },
    { key: 'throughput', label: 'Throughput', value: '3,210', tone: 'default', trend: '+7.3%', trendTone: 'up', footer: 'Pipelines completed / hour', icon: 'trend-up' },
    { key: 'cpu', label: 'CPU Utilization', value: '68', suffix: '%', tone: 'warning', trend: '+4pp vs 24h', trendTone: 'down', footer: 'Elevated — 24 active workers', icon: 'cpu' },
    { key: 'memory', label: 'Memory Utilization', value: '74', suffix: '%', tone: 'warning', trend: '+2pp vs 24h', trendTone: 'down', footer: 'Elevated — 148 GB / 200 GB', icon: 'layers' },
    { key: 'storage', label: 'Storage Utilization', value: '61', suffix: '%', tone: 'success', trend: '+1pp vs 24h', trendTone: 'down', footer: 'Healthy — 6.1 TB / 10 TB', icon: 'hard-drive' },
    { key: 'network', label: 'Network Utilization', value: '42', suffix: '%', tone: 'success', trend: '-3pp vs 24h', trendTone: 'up', footer: 'Normal — 4.2 Gbps peak', icon: 'wave' },
    { key: 'worker-efficiency', label: 'Worker Efficiency', value: '91.4', suffix: '%', tone: 'success', trend: '+1.6pp', trendTone: 'up', footer: '22 of 24 workers optimal', icon: 'server' },
    { key: 'queue-latency', label: 'Queue Latency', value: '2.1', suffix: 's', tone: 'success', trend: '-0.4s', trendTone: 'up', footer: 'Avg wait — vs 2.5s last week', icon: 'clock' },
    { key: 'sla-compliance', label: 'SLA Compliance', value: '99.2', suffix: '%', tone: 'success', trend: '+0.3pp', trendTone: 'up', footer: 'Target 99.0% — met', icon: 'shield' },
    { key: 'perf-improvement', label: 'Perf Improvement', value: '+8.4', suffix: '%', tone: 'success', trend: 'vs 30d baseline', trendTone: 'up', footer: 'Sustained optimization gains', icon: 'trend-up' },
  ],
  scoreTrend: {
    subtitle: 'Performance score & SLA compliance — last 28 days',
    axisMax: 100,
    ticks: ['Aug 4', 'Aug 8', 'Aug 12', 'Aug 16', 'Aug 20', 'Aug 24', 'Aug 28', 'Aug 31'],
    score: [91.2, 90.8, 92.1, 91.5, 92.8, 93.4, 92.9, 93.8, 94.2, 93.6, 94.5, 94.1, 94.6, 94.8],
    sla: [98.4, 98.1, 98.6, 98.3, 98.8, 99.0, 98.7, 99.1, 99.3, 98.9, 99.2, 99.0, 99.1, 99.2],
  },
  resourceUtilization: {
    subtitle: 'Live infrastructure utilization by resource',
    rows: [
      { key: 'cpu', label: 'CPU', pct: 68, status: 'Elevated', tone: 'warning' },
      { key: 'memory', label: 'Memory', pct: 74, status: 'Elevated', tone: 'warning' },
      { key: 'storage', label: 'Storage', pct: 61, status: 'Healthy', tone: 'success' },
      { key: 'network', label: 'Network', pct: 42, status: 'Normal', tone: 'success' },
      { key: 'disk-io', label: 'Disk I/O', pct: 88, status: 'Critical', tone: 'danger' },
      { key: 'cache', label: 'Cache', pct: 55, status: 'Healthy', tone: 'success' },
    ],
  },
  runtime: {
    subtitle: 'Execution runtime distribution — last 7 days',
    stats: [
      { key: 'average', label: 'Average', value: '1m 48s', tone: 'default' },
      { key: 'fastest', label: 'Fastest', value: '4.2s', tone: 'success' },
      { key: 'slowest', label: 'Slowest', value: '14m 06s', tone: 'danger' },
    ],
    percentiles: [
      { key: 'p50', label: 'P50', value: '1m 12s', pct: 24 },
      { key: 'p75', label: 'P75', value: '2m 04s', pct: 41 },
      { key: 'p90', label: 'P90', value: '3m 48s', pct: 62 },
      { key: 'p95', label: 'P95', value: '5m 32s', pct: 78 },
      { key: 'p99', label: 'P99', value: '11m 20s', pct: 96 },
    ],
  },
  throughput: {
    subtitle: 'Data movement rates — last 24 hours',
    stats: [
      { key: 'records', label: 'Records / sec', value: '48,200', trend: '+6.1%', trendTone: 'up' },
      { key: 'data', label: 'Data / hour', value: '1.8 TB', trend: '+4.4%', trendTone: 'up' },
      { key: 'pipelines', label: 'Pipelines / hr', value: '3,210', trend: '+7.3%', trendTone: 'up' },
    ],
    chartLabel: 'Hourly Throughput (records/sec)',
    axisMax: 60000,
    hourly: [38200, 41500, 39800, 44200, 47100, 45600, 49200, 52400, 48800, 46200, 50100, 48200],
  },
  fastestPipelines: {
    subtitle: 'Best average runtime — last 7 days',
    rows: [
      { rank: 1, name: 'Event Stream Ingest', runtime: '4.2s', throughput: '82k rec/s' },
      { rank: 2, name: 'Cache Warmer', runtime: '6.8s', throughput: '71k rec/s' },
      { rank: 3, name: 'Metrics Rollup', runtime: '11.4s', throughput: '58k rec/s' },
      { rank: 4, name: 'Session Aggregator', runtime: '18.2s', throughput: '44k rec/s' },
      { rank: 5, name: 'Feature Store Sync', runtime: '24.6s', throughput: '39k rec/s' },
    ],
  },
  regressions: {
    subtitle: 'Slowing vs baseline — last 7 days',
    rows: [
      { name: 'Legacy DB Export', delta: '+42%', runtime: '14m 06s', status: 'Regressing', tone: 'danger' },
      { name: 'Partner Data Ingest', delta: '+28%', runtime: '9m 12s', status: 'Regressing', tone: 'danger' },
      { name: 'External API Fetch', delta: '+16%', runtime: '6m 48s', status: 'Warning', tone: 'warning' },
      { name: 'Customer Sync', delta: '+9%', runtime: '4m 20s', status: 'Warning', tone: 'warning' },
      { name: 'Analytics Rollup', delta: '+3%', runtime: '2m 54s', status: 'Normal', tone: 'success' },
    ],
  },
  workers: {
    subtitle: '6 of 24 workers shown — sorted by utilization',
    total: 24,
    rows: [
      { id: 'worker-01', name: 'worker-prod-01', utilization: 92, tasks: 1842, avgDuration: '1m 12s', failRate: '0.4%', status: 'Optimal', tone: 'success' },
      { id: 'worker-02', name: 'worker-prod-02', utilization: 88, tasks: 1710, avgDuration: '1m 20s', failRate: '0.6%', status: 'Optimal', tone: 'success' },
      { id: 'worker-03', name: 'worker-prod-03', utilization: 81, tasks: 1588, avgDuration: '1m 34s', failRate: '1.1%', status: 'Optimal', tone: 'success' },
      { id: 'worker-07', name: 'worker-prod-07', utilization: 76, tasks: 1402, avgDuration: '1m 48s', failRate: '1.8%', status: 'Busy', tone: 'warning' },
      { id: 'worker-11', name: 'worker-prod-11', utilization: 69, tasks: 1256, avgDuration: '2m 06s', failRate: '2.4%', status: 'Busy', tone: 'warning' },
      { id: 'worker-14', name: 'worker-prod-14', utilization: 41, tasks: 812, avgDuration: '3m 22s', failRate: '4.9%', status: 'Degraded', tone: 'danger' },
    ],
  },
  capacity: {
    subtitle: '90-day forecast at current growth rate',
    rows: [
      { key: 'cpu', label: 'CPU', current: '68%', forecast: '84%', risk: 'Medium', tone: 'warning' },
      { key: 'memory', label: 'Memory', current: '74%', forecast: '93%', risk: 'High', tone: 'danger' },
      { key: 'storage', label: 'Storage', current: '61%', forecast: '72%', risk: 'Low', tone: 'success' },
      { key: 'workers', label: 'Workers', current: '24', forecast: '31', risk: 'Medium', tone: 'warning' },
    ],
  },
  recommendations: {
    subtitle: 'Ranked by projected impact',
    rows: [
      { key: 'rec-1', priority: 'Critical', title: 'Scale worker pool ahead of memory saturation', detail: 'Memory forecast reaches 93% within 90 days; provision 6 additional workers to avoid throttling.', impact: '+18% headroom' },
      { key: 'rec-2', priority: 'High', title: 'Optimize Legacy DB Export query plan', detail: 'Runtime regressed 42% this week; add indexed extraction and batch pagination.', impact: '-40% runtime' },
      { key: 'rec-3', priority: 'High', title: 'Rebalance Disk I/O across storage tiers', detail: 'Disk I/O is at 88% (Critical); migrate cold archival jobs to secondary volume.', impact: '-30% I/O contention' },
      { key: 'rec-4', priority: 'Medium', title: 'Retire under-utilized worker-prod-14', detail: 'Worker running at 41% utilization with 4.9% fail rate; recycle instance.', impact: '+2% efficiency' },
    ],
  },
  components: {
    subtitle: '8 of 142 components shown — filtered: last 7d, all environments',
    total: 142,
    categoryFilters: ['All', 'Extract', 'Transform', 'Load', 'Validate', 'Route'],
    slaFilters: ['All', 'Met', 'At Risk', 'Breached'],
    environmentFilters: ['All', 'Production', 'Staging', 'Development'],
    rows: [
      { id: 'CMP-3012', name: 'Event Stream Ingest', category: 'Extract', environment: 'Production', score: 98.4, runtime: '4.2s', throughput: '82k/s', cpu: '52%', memory: '48%', latency: '0.8s', sla: 'Met', trend: 'up', owner: 'J. Park' },
      { id: 'CMP-2988', name: 'Cache Warmer', category: 'Load', environment: 'Production', score: 97.1, runtime: '6.8s', throughput: '71k/s', cpu: '44%', memory: '39%', latency: '1.1s', sla: 'Met', trend: 'up', owner: 'A. Chen' },
      { id: 'CMP-2954', name: 'Metrics Rollup', category: 'Transform', environment: 'Staging', score: 95.6, runtime: '11.4s', throughput: '58k/s', cpu: '61%', memory: '57%', latency: '1.4s', sla: 'Met', trend: 'flat', owner: 'L. Osei' },
      { id: 'CMP-2901', name: 'Customer Sync', category: 'Load', environment: 'Production', score: 88.2, runtime: '4m 20s', throughput: '12k/s', cpu: '73%', memory: '68%', latency: '2.9s', sla: 'At Risk', trend: 'down', owner: 'M. Torres' },
      { id: 'CMP-2877', name: 'External API Fetch', category: 'Extract', environment: 'Production', score: 82.4, runtime: '6m 48s', throughput: '8k/s', cpu: '69%', memory: '71%', latency: '4.2s', sla: 'At Risk', trend: 'down', owner: 'J. Park' },
      { id: 'CMP-2830', name: 'Partner Data Ingest', category: 'Extract', environment: 'Production', score: 74.8, runtime: '9m 12s', throughput: '5k/s', cpu: '78%', memory: '82%', latency: '6.1s', sla: 'Breached', trend: 'down', owner: 'R. Kim' },
      { id: 'CMP-2799', name: 'Analytics Rollup', category: 'Transform', environment: 'Staging', score: 91.5, runtime: '2m 54s', throughput: '31k/s', cpu: '58%', memory: '54%', latency: '1.9s', sla: 'Met', trend: 'flat', owner: 'L. Osei' },
      { id: 'CMP-2761', name: 'Legacy DB Export', category: 'Load', environment: 'Development', score: 61.3, runtime: '14m 06s', throughput: '3k/s', cpu: '91%', memory: '88%', latency: '9.4s', sla: 'Breached', trend: 'down', owner: 'M. Torres' },
    ],
  },
};

export async function getPerformanceAnalytics(range) {
  try {
    const query = range ? `?range=${encodeURIComponent(range)}` : '';
    const res = await apiFetch(`/dashboard/performance-analytics${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new PerformanceAnalyticsError('Unable to load the performance analytics dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new PerformanceAnalyticsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_PERFORMANCE_ANALYTICS, mocked: true };
  }
}
