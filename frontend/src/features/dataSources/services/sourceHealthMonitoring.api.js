/**
 * Data loader for the Source Health Monitoring Screen (SCR-056, node
 * 125:47806, Figma page "Page 1", frame "Source Health Monitoring Screen").
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `SourceHealthRecord`, `HealthTimeline`, or
 * `SourceIncident` endpoint exists yet (see docs/modules/module-plan.md).
 * `getSourceHealth` always attempts a real GET first and only falls back to
 * the design-sourced baseline below when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK HTML
 * SPA fallback, mirroring the sibling dataSourceList.api.js + roles/*.api.js
 * + users/*.api.js modules). Results are flagged `mocked: true` so the UI can
 * disclose that the data is sample data, not persisted records.
 *
 * FIGMA VERIFICATION: node 125:47806 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata text-node extraction ordered by
 * y-coordinate). The breadcrumb (Monitoring › Source Health › Source Health
 * Monitoring), header + 5 actions (Refresh / Configure Alerts / Export
 * Report / Run Health Check / time-range), the Enterprise Health Overview
 * KPIs, the Source Health Grid, the Health Timeline, Availability /
 * Performance / Auth & Security / Data Freshness monitoring sections, Active
 * Alerts, Incident History, Scheduled Maintenance, and the right rail
 * (Overall Health / SLA Status / Recommendations) are transcribed from the
 * actual frame's text nodes, so layout/content fidelity is `verified`.
 *
 * SCOPE NOTE: the inventory route is per-source (`/data-sources/:id/health`)
 * but the frame's breadcrumb and content are enterprise-wide (monitoring
 * across every source). The screen therefore treats `:id` as the entry
 * context and renders the enterprise health picture; a real MOD-006 backend
 * would scope/aggregate server-side.
 *
 * A real MOD-006 backend would serve live, org-scoped source-health
 * telemetry: rolling availability, latency, auth/credential posture, data
 * freshness, active alerts, and incident history.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class SourceHealthError extends Error {}

/** Time-range options (node 125:47806 header control). */
export const TIME_RANGE_OPTIONS = [
  'Last 24 Hours',
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
];

const MOCK_TITLE =
  'MOD-006 (Data Sources & Connectors) has no backend deployed yet — showing sample data, not live records.';

export { MOCK_TITLE };

/**
 * Design-sourced baseline health telemetry (node 125:47806). A real MOD-006
 * endpoint would return live, org-scoped source-health telemetry.
 */
export const MOCK_SOURCE_HEALTH = {
  updatedAt: 'Jan 15, 2025 · 10:42 AM',
  organizationName: 'Acme Corporation',
  overview: [
    { key: 'monitored', label: 'Sources Monitored', value: '47', hint: '12 source types', tone: 'default' },
    { key: 'healthy', label: 'Healthy', value: '36', hint: '76.6% of sources', tone: 'success' },
    { key: 'degraded', label: 'Degraded', value: '8', hint: 'reduced performance', tone: 'warning' },
    { key: 'critical', label: 'Critical', value: '3', hint: 'immediate attention', tone: 'danger' },
    { key: 'availability', label: 'Avg Availability', value: '99.2%', hint: 'last 30 days', tone: 'info' },
    { key: 'incidents', label: 'Open Incidents', value: '2', hint: '1 high severity', tone: 'danger' },
  ],
  sources: [
    { id: 'ds_01HKM92V4WX3', name: 'Production PostgreSQL', sourceType: 'PostgreSQL', environment: 'Production', health: 'Healthy', healthScore: 98, availability: '99.98%', latency: '12 ms', errorRate: '0.02%', lastCheck: '2 min ago', uptime: '30d 4h' },
    { id: 'ds_02SNFLK8823', name: 'Snowflake Data Warehouse', sourceType: 'Snowflake', environment: 'Production', health: 'Healthy', healthScore: 96, availability: '99.95%', latency: '340 ms', errorRate: '0.05%', lastCheck: '5 min ago', uptime: '30d 4h' },
    { id: 'ds_03SFDC44190', name: 'Salesforce CRM', sourceType: 'Salesforce', environment: 'Production', health: 'Degraded', healthScore: 74, availability: '98.10%', latency: '890 ms', errorRate: '1.90%', lastCheck: '1h ago', uptime: '12d 6h' },
    { id: 'ds_04S3LAKE221', name: 'AWS S3 Data Lake', sourceType: 'Amazon S3', environment: 'Production', health: 'Healthy', healthScore: 99, availability: '99.99%', latency: '120 ms', errorRate: '0.01%', lastCheck: '3 min ago', uptime: '90d 2h' },
    { id: 'ds_05MYSQL7734', name: 'MySQL Analytics DB', sourceType: 'MySQL', environment: 'Development', health: 'Healthy', healthScore: 94, availability: '99.80%', latency: '45 ms', errorRate: '0.20%', lastCheck: '22 min ago', uptime: '18d 1h' },
    { id: 'ds_06AZBLOB901', name: 'Azure Blob Storage', sourceType: 'Azure Blob', environment: 'Staging', health: 'Healthy', healthScore: 97, availability: '99.92%', latency: '95 ms', errorRate: '0.08%', lastCheck: '8 min ago', uptime: '45d 3h' },
    { id: 'ds_07KAFKA5512', name: 'Apache Kafka Stream', sourceType: 'Apache Kafka', environment: 'Production', health: 'Critical', healthScore: 32, availability: '87.40%', latency: '—', errorRate: '12.60%', lastCheck: '2h ago', uptime: '0d 2h' },
    { id: 'ds_08BQUERY330', name: 'Google BigQuery', sourceType: 'BigQuery', environment: 'Production', health: 'Healthy', healthScore: 95, availability: '99.90%', latency: '410 ms', errorRate: '0.10%', lastCheck: '18 min ago', uptime: '60d 8h' },
    { id: 'ds_09RESTAPI77', name: 'REST API Gateway', sourceType: 'REST API', environment: 'Production', health: 'Degraded', healthScore: 78, availability: '98.60%', latency: '210 ms', errorRate: '1.40%', lastCheck: '45 min ago', uptime: '22d 5h' },
    { id: 'ds_10ORACLE118', name: 'Oracle ERP Database', sourceType: 'Oracle', environment: 'Production', health: 'Degraded', healthScore: 68, availability: '97.20%', latency: '1,240 ms', errorRate: '2.80%', lastCheck: '3h ago', uptime: '8d 12h' },
    { id: 'ds_11HUBSPOT44', name: 'HubSpot Marketing', sourceType: 'HubSpot', environment: 'Production', health: 'Healthy', healthScore: 93, availability: '99.70%', latency: '320 ms', errorRate: '0.30%', lastCheck: '12 min ago', uptime: '28d 9h' },
    { id: 'ds_12SFTP99201', name: 'SFTP File Server', sourceType: 'SFTP', environment: 'Staging', health: 'Critical', healthScore: 41, availability: '91.30%', latency: '—', errorRate: '8.70%', lastCheck: '6h ago', uptime: '0d 6h' },
  ],
  timeline: [
    { id: 'tl_1', time: '09:12 AM', source: 'Apache Kafka Stream', kind: 'critical', title: 'Connection lost', detail: 'SASL handshake failed — broker unreachable on port 9093.' },
    { id: 'tl_2', time: '08:47 AM', source: 'SFTP File Server', kind: 'critical', title: 'Authentication failure', detail: 'SSH key rejected during scheduled partner drop.' },
    { id: 'tl_3', time: '07:30 AM', source: 'Oracle ERP Database', kind: 'warning', title: 'Elevated latency', detail: 'Avg response climbed above 1,200 ms for 15 min.' },
    { id: 'tl_4', time: '06:15 AM', source: 'Salesforce CRM', kind: 'warning', title: 'API rate limit approaching', detail: '82% of daily API quota consumed.' },
    { id: 'tl_5', time: '05:02 AM', source: 'Production PostgreSQL', kind: 'success', title: 'Recovered', detail: 'Replication lag returned to normal after failover.' },
    { id: 'tl_6', time: '02:40 AM', source: 'REST API Gateway', kind: 'warning', title: 'Intermittent 5xx responses', detail: '1.4% of requests returned 503 over 10 min.' },
  ],
  availability: [
    { id: 'av_1', name: 'Production PostgreSQL', current: '99.98%', slaTarget: '99.90%', downtime: '9 min', met: true },
    { id: 'av_2', name: 'Snowflake Data Warehouse', current: '99.95%', slaTarget: '99.90%', downtime: '22 min', met: true },
    { id: 'av_3', name: 'Salesforce CRM', current: '98.10%', slaTarget: '99.50%', downtime: '8h 12m', met: false },
    { id: 'av_4', name: 'Apache Kafka Stream', current: '87.40%', slaTarget: '99.50%', downtime: '3d 18h', met: false },
    { id: 'av_5', name: 'AWS S3 Data Lake', current: '99.99%', slaTarget: '99.90%', downtime: '4 min', met: true },
  ],
  performance: [
    { id: 'pf_1', name: 'Production PostgreSQL', p50: '8 ms', p95: '24 ms', p99: '48 ms', throughput: '1,240 req/s', trend: 'stable' },
    { id: 'pf_2', name: 'Snowflake Data Warehouse', p50: '290 ms', p95: '540 ms', p99: '820 ms', throughput: '86 q/s', trend: 'stable' },
    { id: 'pf_3', name: 'Oracle ERP Database', p50: '980 ms', p95: '1,640 ms', p99: '2,310 ms', throughput: '18 q/s', trend: 'degrading' },
    { id: 'pf_4', name: 'REST API Gateway', p50: '160 ms', p95: '380 ms', p99: '720 ms', throughput: '420 req/s', trend: 'improving' },
    { id: 'pf_5', name: 'Google BigQuery', p50: '350 ms', p95: '620 ms', p99: '940 ms', throughput: '54 q/s', trend: 'stable' },
  ],
  authSecurity: [
    { id: 'as_1', name: 'Production PostgreSQL', authMethod: 'SSL + Password', tls: 'TLS 1.3', credentialStatus: 'Expiring', credentialDetail: 'Expires Mar 15, 2025', posture: 'warning' },
    { id: 'as_2', name: 'Apache Kafka Stream', authMethod: 'SASL/SSL', tls: 'TLS 1.2', credentialStatus: 'Expiring', credentialDetail: 'Expires Jan 25, 2025', posture: 'critical' },
    { id: 'as_3', name: 'AWS S3 Data Lake', authMethod: 'IAM Role', tls: 'TLS 1.3', credentialStatus: 'Healthy', credentialDetail: 'Rotated automatically', posture: 'healthy' },
    { id: 'as_4', name: 'Salesforce CRM', authMethod: 'API Key', tls: 'TLS 1.2', credentialStatus: 'Expiring', credentialDetail: 'Expires Feb 02, 2025', posture: 'warning' },
    { id: 'as_5', name: 'MS SQL Server Dev', authMethod: 'SQL Auth', tls: 'TLS 1.2 (optional)', credentialStatus: 'Inactive', credentialDetail: 'Credentials disabled', posture: 'critical' },
  ],
  freshness: [
    { id: 'fr_1', name: 'Production PostgreSQL', lastSync: '2 min ago', expected: 'Every 5 min', lag: 'On time', stale: false },
    { id: 'fr_2', name: 'Snowflake Data Warehouse', lastSync: '5 min ago', expected: 'Every 15 min', lag: 'On time', stale: false },
    { id: 'fr_3', name: 'Salesforce CRM', lastSync: '1h ago', expected: 'Every 30 min', lag: '30 min behind', stale: true },
    { id: 'fr_4', name: 'Apache Kafka Stream', lastSync: '2h ago', expected: 'Continuous', lag: '2h behind', stale: true },
    { id: 'fr_5', name: 'AWS S3 Data Lake', lastSync: '3 min ago', expected: 'Every 10 min', lag: 'On time', stale: false },
  ],
  alerts: [
    { id: 'al_1', severity: 'high', source: 'Apache Kafka Stream', title: 'Source unreachable for 2h 4m', triggered: '09:12 AM', rule: 'Availability < 90%' },
    { id: 'al_2', severity: 'high', source: 'SFTP File Server', title: 'Authentication failing on scheduled drops', triggered: '08:47 AM', rule: 'Auth failures > 3' },
    { id: 'al_3', severity: 'medium', source: 'Oracle ERP Database', title: 'Latency above 1,200 ms threshold', triggered: '07:30 AM', rule: 'p95 latency > 1s' },
    { id: 'al_4', severity: 'medium', source: 'Salesforce CRM', title: 'API quota 82% consumed', triggered: '06:15 AM', rule: 'API quota > 80%' },
    { id: 'al_5', severity: 'low', source: 'Production PostgreSQL', title: 'Credentials expire in 59 days', triggered: 'Jan 14', rule: 'Credential expiry < 60d' },
  ],
  incidents: [
    { id: 'in_1', ref: 'INC-2041', source: 'Apache Kafka Stream', severity: 'high', status: 'Investigating', opened: 'Jan 15, 09:12 AM', duration: '2h 4m', summary: 'Broker cluster unreachable after network partition.' },
    { id: 'in_2', ref: 'INC-2038', source: 'SFTP File Server', severity: 'high', status: 'Identified', opened: 'Jan 15, 08:47 AM', duration: '2h 29m', summary: 'Rotated SSH key not propagated to partner allowlist.' },
    { id: 'in_3', ref: 'INC-2027', source: 'Oracle ERP Database', severity: 'medium', status: 'Monitoring', opened: 'Jan 14, 03:20 PM', duration: '19h', summary: 'Query plan regression after index rebuild.' },
    { id: 'in_4', ref: 'INC-2019', source: 'Salesforce CRM', severity: 'low', status: 'Resolved', opened: 'Jan 12, 11:05 AM', duration: '3h 12m', summary: 'Transient OAuth token refresh delay.' },
  ],
  maintenance: [
    { id: 'mt_1', source: 'Snowflake Data Warehouse', window: 'Jan 18, 02:00–04:00 AM UTC', kind: 'Planned upgrade', impact: 'Read-only during window', owner: 'bob.smith' },
    { id: 'mt_2', source: 'Oracle ERP Database', window: 'Jan 20, 10:00–11:30 PM UTC', kind: 'Patch cycle', impact: 'Brief connection resets', owner: 'dave.wilson' },
    { id: 'mt_3', source: 'AWS S3 Data Lake', window: 'Jan 25, 01:00–01:30 AM UTC', kind: 'Region failover test', impact: 'No expected downtime', owner: 'alice.chen' },
  ],
  overall: { score: 87, label: 'Good', description: '36 of 47 sources healthy. 3 critical incidents require attention.' },
  sla: { met: 44, total: 47, breaches: 3, monthTarget: '99.50%', monthActual: '99.20%' },
  recommendations: [
    { id: 'rc_1', priority: 'high', title: 'Restore Apache Kafka Stream', detail: 'Broker unreachable for 2h — verify SASL credentials and broker network.' },
    { id: 'rc_2', priority: 'high', title: 'Rotate SFTP partner key', detail: 'Push the new SSH key to the partner allowlist to resume drops.' },
    { id: 'rc_3', priority: 'medium', title: 'Renew expiring credentials', detail: '5 sources have credentials expiring within 60 days.' },
    { id: 'rc_4', priority: 'low', title: 'Tune Oracle ERP query plan', detail: 'Latency degrading since the Jan 14 index rebuild.' },
  ],
};

/**
 * Load org-scoped source-health telemetry. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getSourceHealth(orgId, sourceId, filters = {}) {
  const params = new URLSearchParams();
  if (sourceId) params.set('sourceId', sourceId);
  if (filters.range) params.set('range', filters.range);
  if (filters.health && filters.health !== 'All') params.set('health', filters.health);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/source-health${query}`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SourceHealthError('Unable to load source health right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.sources)) {
      throw new SourceHealthError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_SOURCE_HEALTH, mocked: true };
  }
}
