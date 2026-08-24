/**
 * Data for the Main Dashboard Layout Screen (SCR-009, node 27:2238).
 *
 * MOCK BOUNDARY: MOD-008 (Pipeline Builder & Execution) and MOD-009
 * (Analytics/Monitoring Dashboards) — the modules that would own the
 * real KPI/pipeline-activity/system-health endpoints this screen
 * displays — are both still `PLANNED` in docs/modules/module-plan.md
 * with no backend deployed. `getDashboardSummary` always attempts a
 * real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring every other feature's
 * mock-fallback shape (see auth.api.js). The mock values reproduce the
 * literal numbers shown in the Figma design (node 27:2238) as a fixed
 * snapshot — they do not update or simulate live change, since no
 * real-time contract exists yet (SCR-023's Socket.IO real-time
 * monitoring is a separate, unbuilt screen).
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DashboardError extends Error {}

const MOCK_SUMMARY = {
  updatedAt: '1m ago',
  systemStatus: {
    state: 'operational',
    headline: 'All systems operational',
    detail: '12 workers healthy · No alerts · Queue normal · Last checked 1m ago',
  },
  kpis: [
    { key: 'running', label: 'Running Pipelines', value: 24, tone: 'primary', trend: '↑ 3 from last hour', trendTone: 'success', helper: 'Currently executing' },
    { key: 'failed', label: 'Failed Pipelines', value: 3, tone: 'danger', trend: '↑ 2 from yesterday', trendTone: 'danger', helper: 'Requires attention' },
    { key: 'completed', label: 'Completed Today', value: 186, tone: 'default', trend: '↑ 12 from yesterday', trendTone: 'success', helper: "Today's executions" },
    { key: 'success-rate', label: 'Success Rate', value: '98.2%', tone: 'success', trend: '↑ 0.3% from yesterday', trendTone: 'success', helper: 'Last 24 hours' },
  ],
  pipelineActivity: [
    { id: 'p1', name: 'Customer Sync', route: 'salesforce → postgres', status: 'running', progress: 68, duration: '02:14', started: '2m ago' },
    { id: 'p2', name: 'Inventory Sync', route: 'warehouse api → redshift', status: 'running', progress: 44, duration: '01:32', started: '4m ago' },
    { id: 'p3', name: 'Orders Sync', route: 'shopify → bigquery', status: 'failed', progress: null, duration: '01:18', started: '15m ago' },
    { id: 'p4', name: 'Product Catalog', route: 'pim → elasticsearch', status: 'completed', progress: null, duration: '05:42', started: '18m ago' },
    { id: 'p5', name: 'User Analytics', route: 'mixpanel → snowflake', status: 'running', progress: 21, duration: '00:47', started: '22m ago' },
    { id: 'p6', name: 'Financial Data', route: 'netsuite → postgres', status: 'queued', progress: null, duration: null, started: null },
  ],
  systemHealth: {
    headline: 'All services operational',
    workers: { value: '12 / 12', state: 'healthy' },
    queue: { value: '8 pending', state: 'normal' },
    cpu: { percent: 42, state: 'healthy' },
    memory: { percent: 61, state: 'warning' },
    disk: { percent: 34, state: 'healthy' },
    database: { state: 'healthy' },
    api: { state: 'operational' },
    network: { state: 'operational' },
  },
  executionPerformance: {
    totalToday: 186,
    successful: 183,
    failed: 3,
    avgDuration: '3m 42s',
  },
};

export async function getDashboardSummary() {
  try {
    const res = await apiFetch('/dashboard/summary');
    // No MOD-008/MOD-009 backend and no dev API proxy exist yet, so a
    // real request here resolves to the SPA's own index.html (200 OK,
    // text/html) rather than a network failure — treated the same as
    // "no backend reachable" so the mock fallback still fires (same
    // content-type guard established at SCR-014's executiveDashboard.api.js).
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DashboardError('Unable to load dashboard data right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new DashboardError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    // Backend not deployed yet (MOD-008/MOD-009 both PLANNED) —
    // documented mock fallback, covers both network failure and the
    // dev-server HTML-fallback case caught by the guard above.
    return { ...MOCK_SUMMARY, mocked: true };
  }
}
