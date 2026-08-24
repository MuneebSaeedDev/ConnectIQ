/**
 * Data for the Error Analytics Dashboard Screen (SCR-021, node
 * 69:37077, Figma page "Page 1").
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED`, and MOD-008 (Operations — the module that would produce
 * real error/incident telemetry) is also `PLANNED` with no backend
 * deployed. `getErrorAnalytics` always attempts a real request first
 * and only falls back to the mock snapshot below when the endpoint is
 * unreachable, mirroring executionStatistics.api.js's dev-proxy-aware
 * mock-fallback shape (including the content-type check against the
 * Vite dev server's own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 69:37077 WAS inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). Every KPI value, chart
 * breakdown, severity/root-cause row, ranked list, active-incident,
 * category, and the 8 error table rows below are transcribed from the
 * actual frame's text nodes, so the layout/content fidelity is
 * `verified`. See docs/reviews/review-log.md.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed dataset and
 * ignores the `range` param (7d/30d/90d/1y) — same documented
 * limitation as the sibling MOD-009 api modules. A real MOD-009/MOD-008
 * endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ErrorAnalyticsError extends Error {}

const MOCK_ERROR_ANALYTICS = {
  updatedAt: '24 seconds ago',
  headline: {
    alert: '12 Critical · 19 High — Immediate Attention',
    context: '↓ 14% weekly error rate · 96.8% recovery success · MTTR improved 22%',
    stats: [
      { key: 'total-today', label: 'Total Errors Today', value: '248', tone: 'default' },
      { key: 'critical', label: 'Critical Incidents', value: '12', tone: 'danger' },
      { key: 'open', label: 'Open Incidents', value: '31', tone: 'warning' },
      { key: 'resolved', label: 'Resolved Today', value: '216', tone: 'success' },
      { key: 'recovery', label: 'Recovery Rate', value: '96.8%', tone: 'success' },
      { key: 'mttr', label: 'Avg MTTR', value: '18m', tone: 'default' },
    ],
  },
  kpis: [
    { key: 'total-errors', label: 'Total Errors', value: '248', tone: 'default', trend: '-13.9%', trendTone: 'up', footer: 'vs 288 yesterday', icon: 'alert' },
    { key: 'critical-errors', label: 'Critical Errors', value: '12', tone: 'danger', trend: '-3 vs avg', trendTone: 'up', footer: 'Requires immediate action', icon: 'triangle' },
    { key: 'warning-events', label: 'Warning Events', value: '86', tone: 'warning', trend: '+4 vs 24h', trendTone: 'down', footer: 'Escalation candidates', icon: 'wave' },
    { key: 'resolved-incidents', label: 'Resolved Incidents', value: '216', tone: 'success', trend: '+18 vs avg', trendTone: 'up', footer: 'Today — 96.8% rate', icon: 'circle-check' },
    { key: 'open-incidents', label: 'Open Incidents', value: '31', tone: 'warning', trend: '+5 vs 1h ago', trendTone: 'down', footer: 'Across 8 environments', icon: 'activity' },
    { key: 'error-rate', label: 'Error Rate', value: '1.08', suffix: '%', tone: 'success', trend: '-0.76pp', trendTone: 'up', footer: 'vs 1.84% last week', icon: 'bar-chart' },
    { key: 'recovery-rate', label: 'Recovery Rate', value: '96.8', suffix: '%', tone: 'success', trend: '+1.8pp', trendTone: 'up', footer: 'SLA target 95.0%', icon: 'shield' },
    { key: 'avg-mttr', label: 'Avg MTTR', value: '18m', tone: 'success', trend: '-21.7%', trendTone: 'up', footer: 'vs 23m last week', icon: 'clock' },
    { key: 'avg-mtbf', label: 'Avg MTBF', value: '4.2h', tone: 'success', trend: '+35.5%', trendTone: 'up', footer: 'vs 3.1h last week', icon: 'trend-up' },
    { key: 'retry-success', label: 'Retry Success', value: '82.4', suffix: '%', tone: 'success', trend: '+6.2pp', trendTone: 'up', footer: '204 retried, 168 recovered', icon: 'refresh' },
    { key: 'failed-executions', label: 'Failed Executions', value: '415', tone: 'default', trend: '-31.4%', trendTone: 'up', footer: 'vs 605 last period', icon: 'triangle' },
    { key: 'escalations', label: 'Escalations', value: '7', tone: 'default', trend: '-2 vs avg', trendTone: 'up', footer: '2 awaiting assignment', icon: 'server' },
  ],
  volumeTrend: {
    subtitle: 'Daily error counts — last 28 days',
    axisMax: 400,
    ticks: ['Aug 4', 'Aug 8', 'Aug 12', 'Aug 16', 'Aug 20', 'Aug 24', 'Aug 28', 'Aug 31'],
    total: [312, 298, 284, 331, 276, 264, 289, 305, 271, 258, 244, 262, 288, 248],
    critical: [18, 22, 15, 27, 14, 12, 19, 24, 11, 9, 8, 13, 16, 12],
  },
  severityBreakdown: {
    subtitle: 'Incident distribution by severity level',
    rows: [
      { key: 'critical', label: 'Critical', count: 12, pct: 4.8, recovery: '91.7%', tone: 'danger' },
      { key: 'high', label: 'High', count: 19, pct: 7.7, recovery: '94.7%', tone: 'warning-strong' },
      { key: 'medium', label: 'Medium', count: 86, pct: 34.7, recovery: '97.7%', tone: 'warning' },
      { key: 'low', label: 'Low', count: 112, pct: 45.2, recovery: '99.1%', tone: 'info' },
      { key: 'info', label: 'Info', count: 19, pct: 7.7, recovery: '100%', tone: 'neutral' },
    ],
  },
  rootCause: {
    subtitle: 'Error attribution — last 7 days',
    rows: [
      { key: 'network', label: 'Network Timeout', count: 68, pct: 27.4, tone: 'danger' },
      { key: 'auth', label: 'Authentication', count: 42, pct: 16.9, tone: 'warning-strong' },
      { key: 'data-quality', label: 'Data Quality', count: 39, pct: 15.7, tone: 'warning' },
      { key: 'infrastructure', label: 'Infrastructure', count: 31, pct: 12.5, tone: 'info' },
      { key: 'source', label: 'Source Connectivity', count: 28, pct: 11.3, tone: 'primary' },
      { key: 'transformation', label: 'Transformation', count: 18, pct: 7.3, tone: 'primary' },
      { key: 'permissions', label: 'Permissions', count: 12, pct: 4.8, tone: 'neutral' },
      { key: 'unknown', label: 'Unknown', count: 10, pct: 4, tone: 'neutral' },
    ],
  },
  reliability: {
    subtitle: 'Reliability trend — last 7 days',
    stats: [
      { key: 'mttr', label: 'Avg MTTR', value: '18m', context: 'vs 23m last week', trend: '▼ 21.7%', trendTone: 'up' },
      { key: 'mtbf', label: 'Avg MTBF', value: '4.2h', context: 'vs 3.1h last week', trend: '▲ 35.5%', trendTone: 'up' },
      { key: 'longest', label: 'Longest Incident', value: '3h 12m', context: 'External API issue', trend: null, trendTone: 'flat' },
    ],
    trendLabel: 'MTTR Trend (minutes)',
    axisMax: 40,
    trend: [23, 26, 24, 28, 21, 19, 22, 25, 20, 18, 17, 19, 21, 18],
  },
  mostAffected: {
    subtitle: 'By error count — last 7 days',
    rows: [
      { rank: 1, name: 'External API Fetch', count: 42, rate: '8.4%', severity: 'critical' },
      { rank: 2, name: 'Legacy DB Export', count: 31, rate: '5.1%', severity: 'high' },
      { rank: 3, name: 'Partner Data Ingest', count: 24, rate: '3.7%', severity: 'high' },
      { rank: 4, name: 'CDC Replication', count: 18, rate: '2.2%', severity: 'medium' },
      { rank: 5, name: 'S3 Archival Job', count: 11, rate: '1.8%', severity: 'low' },
    ],
  },
  activeCritical: {
    subtitle: 'Unresolved critical incidents — sorted by impact',
    rows: [
      { id: 'INC-4821', status: 'Investigating', title: 'Partner API returning 503 errors', pipeline: 'External API Fetch', duration: '48m', since: 'since 08:14 UTC', owner: 'J. Park' },
      { id: 'INC-4817', status: 'Mitigating', title: 'CDC replication lag exceeds 30 min', pipeline: 'CDC Replication', duration: '1h 30m', since: 'since 07:32 UTC', owner: 'A. Chen' },
      { id: 'INC-4809', status: 'Escalated', title: 'Auth token expiry — Legacy DB', pipeline: 'Legacy DB Export', duration: '2h 52m', since: 'since 06:10 UTC', owner: 'M. Torres' },
    ],
  },
  categories: {
    subtitle: 'Recurring error types — last 7 days',
    rows: [
      { key: 'connection', label: 'Connection Timeouts', count: 74, delta: '+8%', deltaTone: 'up' },
      { key: 'auth', label: 'Authentication Failures', count: 42, delta: '-12%', deltaTone: 'down' },
      { key: 'schema', label: 'Schema Validation Errors', count: 38, delta: '+2%', deltaTone: 'up' },
      { key: 'data-quality', label: 'Data Quality Failures', count: 31, delta: '-5%', deltaTone: 'down' },
      { key: 'rate-limit', label: 'API Rate Limits', count: 24, delta: '+18%', deltaTone: 'up' },
      { key: 'transformation', label: 'Transformation Errors', count: 19, delta: '-3%', deltaTone: 'down' },
      { key: 'permission', label: 'Permission Failures', count: 12, delta: '-9%', deltaTone: 'down' },
      { key: 'storage', label: 'Storage Errors', count: 8, delta: '+1%', deltaTone: 'up' },
    ],
  },
  errors: {
    subtitle: '8 errors shown — filtered: last 7d, all environments',
    total: 248,
    severityFilters: ['All', 'Critical', 'High', 'Medium', 'Low'],
    statusFilters: ['All', 'Investigating', 'Escalated', 'Open', 'Mitigating', 'Resolved'],
    environmentFilters: ['All', 'Production', 'Staging', 'Development'],
    rootCauseFilters: ['All', 'Network', 'Authentication', 'Data Quality', 'Infrastructure', 'Transformation', 'Permissions', 'Destination Conn.'],
    rows: [
      { id: 'ERR-9121', category: 'Connection Timeout', severity: 'Critical', status: 'Investigating', pipeline: 'External API Fetch', environment: 'Production', rootCause: 'Network', firstSeen: '08:14 UTC', lastSeen: '09:02 UTC', count: 18, mttr: '—', owner: 'J. Park' },
      { id: 'ERR-9118', category: 'Auth Failure', severity: 'Critical', status: 'Escalated', pipeline: 'Legacy DB Export', environment: 'Production', rootCause: 'Authentication', firstSeen: '06:10 UTC', lastSeen: '09:01 UTC', count: 31, mttr: '—', owner: 'M. Torres' },
      { id: 'ERR-9110', category: 'Schema Mismatch', severity: 'High', status: 'Open', pipeline: 'Customer Sync', environment: 'Production', rootCause: 'Data Quality', firstSeen: '07:44 UTC', lastSeen: '08:58 UTC', count: 9, mttr: '—', owner: 'A. Chen' },
      { id: 'ERR-9104', category: 'Replication Lag', severity: 'High', status: 'Mitigating', pipeline: 'CDC Replication', environment: 'Production', rootCause: 'Infrastructure', firstSeen: '07:32 UTC', lastSeen: '09:02 UTC', count: 4, mttr: '—', owner: 'A. Chen' },
      { id: 'ERR-9091', category: 'Transform Error', severity: 'Medium', status: 'Resolved', pipeline: 'Analytics Rollup', environment: 'Staging', rootCause: 'Transformation', firstSeen: '04:12 UTC', lastSeen: '06:44 UTC', count: 7, mttr: '2h 32m', owner: 'L. Osei' },
      { id: 'ERR-9087', category: 'Permission Denied', severity: 'Medium', status: 'Resolved', pipeline: 'S3 Archival Job', environment: 'Production', rootCause: 'Permissions', firstSeen: '03:55 UTC', lastSeen: '05:10 UTC', count: 3, mttr: '1h 15m', owner: 'R. Kim' },
      { id: 'ERR-9082', category: 'API Rate Limit', severity: 'Low', status: 'Resolved', pipeline: 'Partner Data Ingest', environment: 'Production', rootCause: 'Destination Conn.', firstSeen: '02:30 UTC', lastSeen: '03:01 UTC', count: 12, mttr: '31m', owner: 'J. Park' },
      { id: 'ERR-9078', category: 'Storage Error', severity: 'Low', status: 'Resolved', pipeline: 'S3 Archival Job', environment: 'Staging', rootCause: 'Infrastructure', firstSeen: '01:14 UTC', lastSeen: '01:44 UTC', count: 2, mttr: '30m', owner: 'L. Osei' },
    ],
  },
};

export async function getErrorAnalytics(range) {
  try {
    const query = range ? `?range=${encodeURIComponent(range)}` : '';
    const res = await apiFetch(`/dashboard/error-analytics${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ErrorAnalyticsError('Unable to load the error analytics dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new ErrorAnalyticsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_ERROR_ANALYTICS, mocked: true };
  }
}
