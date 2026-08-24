/**
 * Data for the System Health Dashboard Screen (SCR-017, node 51:6763).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED` with no backend deployed. `getSystemHealth` always attempts
 * a real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring dataQuality.api.js's/
 * pipelineOverview.api.js's/executiveDashboard.api.js's dev-proxy-aware
 * mock-fallback shape (including the SCR-014-discovered content-type
 * check against the Vite dev server's own HTML fallback).
 *
 * The mock KPI/service/alert/chart/table values reproduce the literal
 * numbers shown in the Figma design (node 51:6763).
 *
 * KNOWN LIMITATION: the mock snapshot below is a single fixed dataset
 * and ignores the `timeRange` param (Live/1h/24h/7d) — same documented
 * limitation as dataQuality.api.js's/pipelineOverview.api.js's
 * dateRange handling. A real MOD-009 endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class SystemHealthError extends Error {}

const MOCK_SYSTEM_HEALTH = {
  updatedAt: '12 seconds ago',
  globalStatus: {
    label: 'All Systems Operational',
    tone: 'success',
    availability30d: '99.98%',
    activeServices: '12 / 12',
    runningWorkers: '12 / 12',
    openIncidents: 0,
    warningEvents: 2,
    uptime: '47d 12h',
  },
  kpis: [
    { key: 'health-score', label: 'Health Score', value: '99.8', suffix: '%', tone: 'success', trend: '↑ 0.1% vs yesterday', trendTone: 'up', footer: 'All critical checks passing', icon: 'circle-check' },
    { key: 'availability', label: 'Availability (30d)', value: '99.98', suffix: '%', tone: 'success', trend: '↑ 0.02% this month', trendTone: 'up', footer: '1 incident · Resolved', icon: 'shield' },
    { key: 'active-services', label: 'Active Services', value: '12', suffix: '/12', tone: 'success', trend: null, trendTone: 'flat', footer: 'Reporting svc slowed', badge: '1 degraded', icon: 'server' },
    { key: 'active-workers', label: 'Active Workers', value: '12', suffix: '/12', tone: 'success', trend: null, trendTone: 'flat', footer: 'etl-worker-04 at 91%', badge: '1 high memory', icon: 'wave' },
    { key: 'cpu', label: 'CPU Utilization', value: '42', suffix: '%', tone: 'default', trend: 'Peak 70% today', trendTone: 'up', footer: 'Normal operating range', icon: 'cpu' },
    { key: 'memory', label: 'Memory Utilization', value: '61', suffix: '%', tone: 'default', trend: null, trendTone: 'flat', footer: '28.4 GB / 46.4 GB used', badge: 'Stable', icon: 'activity' },
    { key: 'storage', label: 'Storage Used', value: '68', suffix: '%', tone: 'default', trend: '↑ 3% this week', trendTone: 'down', footer: '10.9 TB / 16 TB used', icon: 'hard-drive' },
    { key: 'incidents', label: 'Open Incidents', value: '0', tone: 'success', trend: null, trendTone: 'flat', footer: 'Last resolved 4d ago', badge: 'All clear', icon: 'bell' },
  ],
  serviceHealth: {
    subtitle: '12 services · live status',
    rows: [
      { id: 'svc1', name: 'Authentication Service', status: 'Operational', uptime: '99.99%', response: '42ms', errorRate: '0.01%', lastRestart: '14d ago' },
      { id: 'svc2', name: 'Execution Engine', status: 'Operational', uptime: '99.97%', response: '180ms', errorRate: '0.12%', lastRestart: '7d ago', warn: true },
      { id: 'svc3', name: 'Scheduler', status: 'Operational', uptime: '100%', response: '8ms', errorRate: '0.00%', lastRestart: '47d ago' },
      { id: 'svc4', name: 'Notification Service', status: 'Operational', uptime: '99.98%', response: '64ms', errorRate: '0.02%', lastRestart: '21d ago' },
      { id: 'svc5', name: 'Audit Service', status: 'Operational', uptime: '99.99%', response: '28ms', errorRate: '0.00%', lastRestart: '30d ago' },
      { id: 'svc6', name: 'Monitoring Service', status: 'Operational', uptime: '99.94%', response: '92ms', errorRate: '0.08%', lastRestart: '7d ago' },
      { id: 'svc7', name: 'Reporting Service', status: 'Degraded', uptime: '99.82%', response: '840ms', errorRate: '1.20%', lastRestart: '2d ago', warn: true, danger: true },
      { id: 'svc8', name: 'Integration Service', status: 'Operational', uptime: '99.96%', response: '118ms', errorRate: '0.04%', lastRestart: '14d ago' },
    ],
  },
  alerts: [
    { id: 'al1', title: 'ETL Worker 04 memory at 91%', description: 'etl-worker-04 · May cause slow execution at peak hours', severity: 'warning' },
    { id: 'al2', title: 'Reporting Service latency degraded', description: 'Avg 840ms vs 200ms SLA · 1.2% error rate elevated', severity: 'warning' },
    { id: 'al3', title: 'Storage utilization at 68%', description: '10.9 TB / 16 TB · Growing 3% per week', severity: 'warning' },
    { id: 'al4', title: 'Scheduler job completed late', description: 'nightly_archive · Finished 4m 12s after deadline', severity: 'info' },
    { id: 'al5', title: 'PostgreSQL replica lag spike', description: 'Max lag 284ms at 14:32 · Now resolved', severity: 'info' },
    { id: 'al6', title: 'TLS certificate expiring in 18 days', description: 'api.etl-platform.internal · Renew before Aug 18', severity: 'info' },
  ],
  cpuTrend: {
    subtitle: 'Last 24 hours · all nodes avg',
    current: '34%',
    peak24h: '70%',
    avg24h: '52%',
    tone: 'success',
    toneLabel: 'Normal',
    threshold: 80,
    series: [34, 30, 28, 32, 40, 48, 55, 62, 68, 70, 65, 60, 58, 62, 66, 70, 64, 58, 52, 46, 40, 38, 36, 34],
  },
  memoryTrend: {
    subtitle: 'Last 24 hours · all nodes avg',
    current: '58%',
    peak24h: '76%',
    used: '28.4 GB',
    tone: 'default',
    toneLabel: 'Stable',
    series: [58, 56, 55, 57, 60, 63, 66, 68, 70, 72, 74, 76, 74, 72, 70, 68, 66, 64, 62, 60, 59, 58, 58, 58],
  },
  queueWorkers: {
    workers: [
      { id: 'w1', name: 'etl-worker-01', load: 58, tone: 'success' },
      { id: 'w2', name: 'etl-worker-02', load: 72, tone: 'success' },
      { id: 'w3', name: 'etl-worker-03', load: 44, tone: 'success' },
      { id: 'w4', name: 'etl-worker-04', load: 91, tone: 'danger' },
    ],
    metrics: [
      { key: 'pending', label: 'Pending Jobs', value: '8' },
      { key: 'processing', label: 'Processing', value: '28' },
      { key: 'avg-wait', label: 'Avg Wait Time', value: '28s' },
      { key: 'throughput', label: 'Throughput', value: '62/min' },
      { key: 'failed', label: 'Failed (1h)', value: '2' },
      { key: 'retry', label: 'Retry Queue', value: '3' },
    ],
  },
  databaseHealth: {
    subtitle: 'PostgreSQL + Redis',
    instances: [
      { id: 'db1', name: 'PostgreSQL Primary', connections: '142/500', queryLatency: '3ms', storage: '4.2 TB', slowQueries: '0', backup: '2h ago' },
      { id: 'db2', name: 'PostgreSQL Replica', connections: '28/200', queryLatency: '4ms', storage: '4.2 TB', slowQueries: '0', backup: 'Streaming' },
      { id: 'db3', name: 'Redis Cache', connections: '84/1000', queryLatency: '0.8ms', storage: '12 GB', slowQueries: '0', backup: 'AOF' },
    ],
  },
  apiPerformance: {
    subtitle: 'Last 1 hour',
    availability: '99.94%',
    avgResponse: '142ms',
    reqPerMin: '1,284',
    endpoints: [
      { path: '/api/pipelines', reqPerMin: 480, latency: '98ms', errorRate: '0.02%' },
      { path: '/api/executions', reqPerMin: 342, latency: '182ms', errorRate: '0.08%' },
      { path: '/api/connectors', reqPerMin: 184, latency: '124ms', errorRate: '0.04%' },
      { path: '/api/schedules', reqPerMin: 128, latency: '68ms', errorRate: '0.00%' },
      { path: '/api/quality', reqPerMin: 82, latency: '204ms', errorRate: '0.12%', warn: true },
      { path: '/api/reporting', reqPerMin: 68, latency: '840ms', errorRate: '1.20%', danger: true },
    ],
  },
  infrastructureComponents: {
    subtitle: '24 components · full inventory',
    categoryFilters: [
      { key: 'all', label: 'All', count: 24 },
      { key: 'healthy', label: 'Healthy', count: 22, dot: 'success' },
      { key: 'warning', label: 'Warning', count: 2, dot: 'warning' },
      { key: 'compute', label: 'Compute', count: 6 },
      { key: 'database', label: 'Database', count: 3 },
      { key: 'network', label: 'Network', count: 2 },
    ],
    rows: [
      { id: 'c1', name: 'App Server 01', category: 'Compute', status: 'Healthy', availability: '99.99%', health: 99.9, response: '18ms', uptime: '47d 12h', heartbeat: '2s ago', env: 'prod' },
      { id: 'c2', name: 'App Server 02', category: 'Compute', status: 'Healthy', availability: '99.99%', health: 99.9, response: '22ms', uptime: '47d 12h', heartbeat: '2s ago', env: 'prod' },
      { id: 'c3', name: 'ETL Worker 01', category: 'Worker', status: 'Healthy', availability: '99.97%', health: 99.7, response: '—', uptime: '30d 4h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c4', name: 'ETL Worker 02', category: 'Worker', status: 'Healthy', availability: '99.98%', health: 99.8, response: '—', uptime: '30d 4h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c5', name: 'ETL Worker 03', category: 'Worker', status: 'Healthy', availability: '99.96%', health: 99.6, response: '—', uptime: '30d 4h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c6', name: 'ETL Worker 04', category: 'Worker', status: 'Warning', availability: '99.82%', health: 91, healthTone: 'danger', response: '—', uptime: '2d 6h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c7', name: 'Scheduler Primary', category: 'Scheduler', status: 'Healthy', availability: '100%', health: 100, response: '8ms', uptime: '47d 12h', heartbeat: '1s ago', env: 'prod' },
      { id: 'c8', name: 'API Gateway', category: 'Network', status: 'Healthy', availability: '99.99%', health: 99.9, response: '12ms', uptime: '47d 12h', heartbeat: '3s ago', env: 'prod' },
      { id: 'c9', name: 'Load Balancer', category: 'Network', status: 'Healthy', availability: '100%', health: 100, response: '1ms', uptime: '47d 12h', heartbeat: '1s ago', env: 'prod' },
      { id: 'c10', name: 'PostgreSQL Primary', category: 'Database', status: 'Healthy', availability: '99.99%', health: 99.9, response: '3ms', uptime: '47d 12h', heartbeat: '5s ago', env: 'prod' },
      { id: 'c11', name: 'PostgreSQL Replica', category: 'Database', status: 'Healthy', availability: '99.97%', health: 99.7, response: '4ms', uptime: '30d 2h', heartbeat: '5s ago', env: 'prod' },
      { id: 'c12', name: 'Redis Cache', category: 'Database', status: 'Healthy', availability: '99.99%', health: 99.9, response: '0.8ms', uptime: '47d 12h', heartbeat: '2s ago', env: 'prod' },
      { id: 'c13', name: 'App Server 03', category: 'Compute', status: 'Healthy', availability: '99.98%', health: 99.8, response: '19ms', uptime: '47d 12h', heartbeat: '2s ago', env: 'prod' },
      { id: 'c14', name: 'App Server 04', category: 'Compute', status: 'Healthy', availability: '99.97%', health: 99.7, response: '24ms', uptime: '47d 12h', heartbeat: '2s ago', env: 'prod' },
      { id: 'c15', name: 'ETL Worker 05', category: 'Worker', status: 'Healthy', availability: '99.95%', health: 99.5, response: '—', uptime: '18d 6h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c16', name: 'ETL Worker 06', category: 'Worker', status: 'Healthy', availability: '99.96%', health: 99.6, response: '—', uptime: '18d 6h', heartbeat: '4s ago', env: 'prod' },
      { id: 'c17', name: 'Scheduler Replica', category: 'Scheduler', status: 'Healthy', availability: '100%', health: 100, response: '9ms', uptime: '47d 12h', heartbeat: '1s ago', env: 'prod' },
      { id: 'c18', name: 'Notification Worker', category: 'Worker', status: 'Healthy', availability: '99.94%', health: 99.4, response: '—', uptime: '21d 3h', heartbeat: '6s ago', env: 'prod' },
      { id: 'c19', name: 'Audit Log Store', category: 'Database', status: 'Healthy', availability: '99.99%', health: 99.9, response: '5ms', uptime: '47d 12h', heartbeat: '5s ago', env: 'prod' },
      { id: 'c20', name: 'Message Broker', category: 'Network', status: 'Healthy', availability: '99.98%', health: 99.8, response: '6ms', uptime: '30d 4h', heartbeat: '3s ago', env: 'prod' },
      { id: 'c21', name: 'CDN Edge Node', category: 'Network', status: 'Healthy', availability: '100%', health: 100, response: '2ms', uptime: '47d 12h', heartbeat: '1s ago', env: 'prod' },
      { id: 'c22', name: 'Backup Storage', category: 'Database', status: 'Healthy', availability: '99.99%', health: 99.9, response: '—', uptime: '47d 12h', heartbeat: '2h ago', env: 'prod' },
      { id: 'c23', name: 'App Server 05 (staging)', category: 'Compute', status: 'Healthy', availability: '99.90%', health: 99.0, response: '28ms', uptime: '12d 1h', heartbeat: '2s ago', env: 'staging' },
      { id: 'c24', name: 'ETL Worker 07 (staging)', category: 'Worker', status: 'Healthy', availability: '99.88%', health: 98.8, response: '—', uptime: '12d 1h', heartbeat: '4s ago', env: 'staging' },
    ],
  },
};

export async function getSystemHealth(timeRange) {
  try {
    const query = timeRange ? `?range=${encodeURIComponent(timeRange)}` : '';
    const res = await apiFetch(`/dashboard/system-health${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SystemHealthError('Unable to load the system health dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new SystemHealthError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_SYSTEM_HEALTH, mocked: true };
  }
}
