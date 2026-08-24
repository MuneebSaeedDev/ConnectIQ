/**
 * Data for the Executive Dashboard Screen (SCR-014, node 45:7).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics/Monitoring Dashboards) is still
 * `PLANNED` with no backend deployed. `getExecutiveDashboard` always
 * attempts a real request first and only falls back to the mock
 * snapshot below when the endpoint is unreachable, mirroring
 * dashboard.api.js's `getDashboardSummary()` mock-fallback shape.
 *
 * The mock KPI/summary/alert/report values reproduce the literal
 * numbers shown in the Figma design (node 45:7). The "Adoption by
 * Business Unit" table is the one exception: Figma's 4 visible rows
 * all repeat the identical label "Sales & Revenue Ops" and "68 users"
 * (only pipeline count/% differ) — clearly unfinished/duplicated
 * placeholder content in the design file, not real per-department
 * data (flagged in screen-inventory.md SCR-014 build notes). Rather
 * than reproduce 4 identical rows, this mock uses distinct business
 * units consistent with the screen's own "Across 8 business units"
 * KPI figure, so the table renders as real per-row data.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ExecutiveDashboardError extends Error {}

const MOCK_EXECUTIVE_DASHBOARD = {
  updatedAt: '1m ago',
  dateRanges: ['7d', '30d', '90d', '1yr'],
  activeDateRange: '30d',
  summary: [
    { key: 'platform-status', label: 'Platform Status', kind: 'status', status: 'healthy', statusLabel: 'Healthy', helper: 'All systems operational' },
    { key: 'sla-compliance', label: 'SLA Compliance', kind: 'value', value: '99.94%', tone: 'success', helper: 'Target: 99.5% · Last 30 days' },
    { key: 'pipeline-success', label: 'Pipeline Success', kind: 'value', value: '98.7%', tone: 'default', helper: '↑ 0.4% vs prior month' },
    { key: 'data-processed', label: 'Data Processed', kind: 'value', value: '14.2 TB', tone: 'primary', helper: '↑ 18% vs prior month' },
    { key: 'critical-issues', label: 'Critical Issues', kind: 'value', value: '2', tone: 'danger', helper: 'Requires attention' },
    { key: 'platform-adoption', label: 'Platform Adoption', kind: 'value', value: '+12%', tone: 'primary', helper: '284 active users' },
  ],
  executiveKpis: [
    { key: 'availability', label: 'Platform Availability', value: '99.97%', tone: 'success', trend: '↑ 0.04% vs prior month', trendTone: 'up', footer: 'Last 30 days · SLA target 99.5%', icon: 'circle-check' },
    { key: 'sla', label: 'SLA Compliance', value: '99.94%', tone: 'success', trend: '↑ 0.1% vs prior month', trendTone: 'up', footer: '1 incident · Resolved', icon: 'shield' },
    { key: 'pipeline-success-rate', label: 'Pipeline Success Rate', value: '98.7%', tone: 'primary', trend: '↑ 0.4% vs prior month', trendTone: 'up', footer: '5,482 of 5,554 executions', icon: 'pipeline' },
    { key: 'total-executions', label: 'Total Executions', value: '18,432', tone: 'default', trend: '↑ 12% vs prior month', trendTone: 'up', footer: 'Last 30 days', icon: 'wave' },
  ],
  businessKpis: [
    { key: 'data-processed', label: 'Data Processed', value: '14.2 TB', tone: 'primary', trend: '↑ 18% vs prior month', trendTone: 'up', footer: 'Across 47 connectors', icon: 'database' },
    { key: 'active-users', label: 'Active Users', value: '284', tone: 'success', trend: '↑ 34 new this month', trendTone: 'up', footer: 'Across 8 business units', icon: 'users' },
    { key: 'cost-savings', label: 'Cost Savings (est.)', value: '$48K', tone: 'success', trend: '↑ $6K vs prior month', trendTone: 'up', footer: 'Automation ROI · Last 30 days', icon: 'trend-up' },
    { key: 'critical-failures', label: 'Critical Failures', value: '3', tone: 'danger', trend: '= Same as prior month', trendTone: 'flat', footer: 'Business-critical pipelines', icon: 'triangle' },
  ],
  slaPerformance: {
    subtitle: '30-day availability · 1 incident on Aug 10 (resolved)',
    series: [
      { label: 'Aug 1', availability: 99.98 },
      { label: 'Aug 8', availability: 99.99 },
      { label: 'Aug 15', availability: 99.62 },
      { label: 'Aug 22', availability: 99.99 },
      { label: 'Aug 29', availability: 100 },
    ],
    slaThreshold: 99.5,
    incidentLabel: 'Aug 10 incident',
    stats: { avgAvailability: '99.97%', incidents: 1, downtime: '2h 14m', mttr: '2h 14m' },
  },
  executionVolume: {
    subtitle: '30-day daily execution trend · incident Aug 9–10',
    series: [
      { label: 'Aug 1', successful: 178, failed: 4 },
      { label: 'Aug 8', successful: 182, failed: 3 },
      { label: 'Aug 15', successful: 145, failed: 22 },
      { label: 'Aug 22', successful: 191, failed: 2 },
      { label: 'Aug 29', successful: 186, failed: 3 },
    ],
    stats: { totalThisMonth: '5,554', successful: '5,482', failed: '72', avgDuration: '3m 28s' },
  },
  platformAdoption: {
    subtitle: 'Active users — 12-week growth trend',
    series: [190, 198, 205, 211, 219, 228, 234, 241, 252, 261, 273, 284],
    weekLabels: ['W1', 'W12'],
    stats: { currentUsers: '284', growth: '+43%', newThisMonth: '34' },
  },
  alerts: [
    { id: 'a1', title: 'Orders Sync failing repeatedly', description: '3 failures this week · $12K revenue at risk', severity: 'critical' },
    { id: 'a2', title: 'Finance pipeline SLA at risk', description: 'Avg latency 4.2× above threshold', severity: 'critical' },
    { id: 'a3', title: 'Worker capacity at 82%', description: 'Peak hours may cause queue delays', severity: 'warning' },
    { id: 'a4', title: 'Data quality degradation', description: 'Orders dataset · Score 94.1% (↓ 3.2%)', severity: 'warning' },
    { id: 'a5', title: 'New admin login detected', description: 'Chicago, IL · Yesterday', severity: 'security' },
  ],
  operationalHealth: {
    workerFleet: { value: '12 / 12', state: 'healthy' },
    queueStatus: { value: '8 pending', state: 'healthy' },
    connectorHealth: { value: '46 / 47', state: 'warning' },
    cpu: { percent: 42, state: 'healthy' },
    memory: { percent: 61, state: 'warning' },
    database: { value: 'Healthy', state: 'healthy' },
    apiLayer: { value: 'Operational', state: 'healthy' },
    avgResponseTime: '142ms',
  },
  reports: [
    { id: 'r1', title: 'Monthly Executive Summary', subtitle: 'Aug 2026 · Generated Aug 1', icon: 'file-text', tone: 'primary' },
    { id: 'r2', title: 'SLA Compliance Report', subtitle: 'Last 30 days · 99.94% achieved', icon: 'shield', tone: 'success' },
    { id: 'r3', title: 'Platform Adoption Report', subtitle: 'Q3 2026 · +43% user growth', icon: 'users', tone: 'success-alt' },
    { id: 'r4', title: 'Cost Analysis', subtitle: 'Jul 2026 · $48K savings estimated', icon: 'trend-up', tone: 'warning' },
    { id: 'r5', title: 'Operational Health Report', subtitle: 'Last 30 days · 5,554 executions', icon: 'activity', tone: 'neutral' },
  ],
  businessUnitAdoption: [
    { unit: 'Sales & Revenue Ops', users: 68, pipelines: 18, adoptionPercent: 100 },
    { unit: 'Finance & Billing', users: 41, pipelines: 12, adoptionPercent: 82 },
    { unit: 'Customer Success', users: 53, pipelines: 15, adoptionPercent: 91 },
    { unit: 'Product & Engineering', users: 37, pipelines: 22, adoptionPercent: 76 },
    { unit: 'Marketing Ops', users: 29, pipelines: 9, adoptionPercent: 64 },
    { unit: 'Supply Chain', users: 22, pipelines: 14, adoptionPercent: 58 },
    { unit: 'People & HR Systems', users: 18, pipelines: 6, adoptionPercent: 45 },
    { unit: 'Data & Analytics', users: 16, pipelines: 11, adoptionPercent: 70 },
  ],
};

export async function getExecutiveDashboard() {
  try {
    const res = await apiFetch('/dashboard/executive');
    // No MOD-009 backend and no dev API proxy exist yet, so a real
    // request here resolves to the SPA's own index.html (200 OK,
    // text/html) rather than a network failure — treated the same as
    // "no backend reachable" so the mock fallback still fires (found
    // by tester agent during SCR-014's quality gate).
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ExecutiveDashboardError('Unable to load the executive dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new ExecutiveDashboardError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    // Backend not deployed yet (MOD-009 still PLANNED) — documented
    // mock fallback.
    return { ...MOCK_EXECUTIVE_DASHBOARD, mocked: true };
  }
}
