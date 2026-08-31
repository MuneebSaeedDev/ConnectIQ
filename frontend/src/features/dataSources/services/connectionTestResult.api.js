/**
 * Data for the Connection Test Result Screen (SCR-055, node 124:45976,
 * Figma page "Page 1", frame "Connection Test Result Screen"). This is
 * the terminal step of the "add source" wizard — the read-only report
 * shown after a connector's `test-connection` action runs: the
 * validation checklist, connection metadata, latency/performance
 * breakdown, security-validation matrix, permission verification,
 * structured diagnostics, and a validation-history log, plus the
 * right-rail Test Summary / Validation Score / Connection Health /
 * Security Review / Recommendations.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, `test-connection`
 * action, or `ConnectionTestResult` endpoint exists yet (see
 * docs/modules/module-plan.md). `fetchConnectionTestResult` and
 * `saveValidatedConnection` each attempt a real request first and only
 * fall back to a simulated result when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK
 * HTML SPA fallback), mirroring the sibling ftpConnection.api.js /
 * sftpConnection.api.js real-request-first / `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 124:45976 WAS inspected this session
 * (get_screenshot + get_design_context over the full frame both
 * succeeded). All content below (result status, the 13 checklist items
 * with timings, the 15 connection-info rows, latency breakdown, the 12
 * security checks, the 13 permission rows, the diagnostics table, the 7
 * validation-history runs, and the right-rail summary/score/health/
 * security/recommendations) is transcribed from that inspection. See
 * docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ConnectionTestResultError extends Error {}

/** Scope this connection to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/**
 * The design's default result — a Snowflake data-warehouse connection
 * that validated with 1 warning (11 of 13 checks passed; certificate
 * expiring in 28 days). Used as the simulated baseline behind the mock
 * boundary and as the shape a live `ConnectionTestResult` returns.
 */
export const DEFAULT_RESULT = {
  connectionId: 'ds_acme_snowflake_prod',
  connectionName: 'acme-snowflake-prod',
  connectorType: 'Snowflake Data Warehouse',
  connectorShort: 'Snowflake DWH',
  status: 'partial', // 'passed' | 'partial' | 'failed'
  statusLabel: 'Partial Success',
  summary: 'Connection validated with 1 warning. Certificate renewal recommended before production deployment.',
  checksPassed: 11,
  checksTotal: 13,
  durationSeconds: 4.82,
  testedAt: '2024-01-15 · 14:22:07 UTC',
  testedBy: 'alice.johnson@acme.corp',
  environment: 'Production',
  validationScore: 85,

  checklist: [
    { step: 1, label: 'DNS Resolution', detail: 'acme.us-east-1.snowflakecomputing.com → 34.224.181.45', timing: '38 ms', status: 'passed' },
    { step: 2, label: 'Server Reachability', detail: 'ICMP reachable · TCP/443 open · firewall permit confirmed', timing: '12 ms', status: 'passed' },
    { step: 3, label: 'Network Connectivity', detail: 'RTT 24 ms · packet loss 0% · MTU 1500', timing: '24 ms', status: 'passed' },
    { step: 4, label: 'TLS Negotiation', detail: 'TLS 1.3 · ECDHE-RSA-AES256-GCM-SHA384 · session resumption enabled', timing: '186 ms', status: 'passed' },
    { step: 5, label: 'TLS Certificate', detail: 'Certificate valid · expires 2024-02-12 (28 days) · chain trusted', timing: '—', status: 'warning', note: 'Certificate expiry in 28 days — schedule renewal before it lapses.' },
    { step: 6, label: 'Authentication', detail: 'OAuth 2.0 service account authenticated · token issued', timing: '310 ms', status: 'passed' },
    { step: 7, label: 'Authorization', detail: 'Role ACME_ETL_ROLE has USAGE on database ACME_PROD', timing: '88 ms', status: 'passed' },
    { step: 8, label: 'Session Establishment', detail: 'Snowflake session ID: 01b3e992-0000-0001-0000-0000', timing: '142 ms', status: 'passed' },
    { step: 9, label: 'Schema Discovery', detail: '42 schemas discovered · 1,847 tables enumerated', timing: '621 ms', status: 'passed' },
    { step: 10, label: 'Read Permission', detail: 'SELECT permission confirmed on 1,847 tables in ACME_PROD', timing: '204 ms', status: 'passed' },
    { step: 11, label: 'Write Permission', detail: 'INSERT, UPDATE, DELETE confirmed on staging schema', timing: '196 ms', status: 'passed' },
    { step: 12, label: 'Metadata Retrieval', detail: 'Metadata retrieved successfully — high latency (2,342 ms)', timing: '2,342 ms', status: 'warning', note: 'Metadata latency (2,342 ms) exceeds the recommended threshold — consider warming the warehouse.' },
    { step: 13, label: 'Validation Complete', detail: 'All critical checks passed · 2 warnings logged · connection usable', timing: '4,823 ms', status: 'passed' },
  ],

  connectionInfo: [
    { label: 'Connection Name', value: 'acme-snowflake-prod', mono: true },
    { label: 'Connector Type', value: 'Snowflake Data Warehouse' },
    { label: 'Account Identifier', value: 'acme.us-east-1', mono: true },
    { label: 'Host', value: 'acme.us-east-1.snowflakecomputing.com', mono: true },
    { label: 'Port', value: '443 (HTTPS)' },
    { label: 'Protocol', value: 'HTTPS / JDBC 3.13.x' },
    { label: 'Authentication', value: 'OAuth 2.0 · Service Account' },
    { label: 'Snowflake Role', value: 'ACME_ETL_ROLE', mono: true },
    { label: 'Warehouse', value: 'ACME_ETL_WH (Large)', mono: true },
    { label: 'Database', value: 'ACME_PROD', mono: true },
    { label: 'Default Schema', value: 'PUBLIC', mono: true },
    { label: 'Server Version', value: '7.37.1 (2024-01-09)' },
    { label: 'Environment', value: 'Production' },
    { label: 'Region', value: 'US East 1 (AWS us-east-1)' },
  ],

  performance: {
    metrics: [
      { label: 'Total Duration', value: '4,823 ms', note: 'end-to-end', tone: 'neutral' },
      { label: 'Connection RTT', value: '24 ms', note: 'excellent', tone: 'good' },
      { label: 'Auth Latency', value: '310 ms', note: 'normal', tone: 'good' },
      { label: 'Schema Discovery', value: '621 ms', note: 'good', tone: 'good' },
      { label: 'Metadata Retrieval', value: '2,342 ms', note: 'high — check warehouse', tone: 'warning' },
      { label: 'TLS Handshake', value: '186 ms', note: 'TLS 1.3', tone: 'good' },
    ],
    latencyBreakdown: [
      { label: 'DNS Resolution', ms: 38 },
      { label: 'TCP Connect', ms: 12 },
      { label: 'TLS Handshake', ms: 186 },
      { label: 'Authentication', ms: 310 },
      { label: 'Session Setup', ms: 142 },
      { label: 'Schema Discovery', ms: 621 },
      { label: 'Metadata Retrieval', ms: 2342 },
    ],
    network: {
      quality: 'Excellent',
      packetLoss: '0.00%',
      jitter: '1.2 ms',
      bandwidth: '≥ 1 Gbps',
    },
  },

  security: {
    warnings: 1,
    checks: [
      { check: 'Transport Encryption', value: 'TLS 1.3', status: 'passed' },
      { check: 'Cipher Suite', value: 'ECDHE-RSA-AES256-GCM-SHA384', status: 'passed' },
      { check: 'Key Exchange', value: 'ECDHE (X25519)', status: 'passed' },
      { check: 'Certificate Authority', value: 'DigiCert Inc (SHA-256)', status: 'passed' },
      { check: 'Certificate Subject', value: '*.snowflakecomputing.com', status: 'passed' },
      { check: 'Certificate Expiry', value: '2024-02-12 (28 days remaining)', status: 'warning' },
      { check: 'Certificate Revocation', value: 'OCSP: Good', status: 'passed' },
      { check: 'Host Verification', value: 'CN match confirmed', status: 'passed' },
      { check: 'OAuth Token Integrity', value: 'JWT signature valid · exp 3600 s', status: 'passed' },
      { check: 'Credential Exposure', value: 'No secrets in transport', status: 'passed' },
      { check: 'SOC 2 Type II', value: 'Snowflake certified (2023)', status: 'passed' },
      { check: 'FIPS 140-2', value: 'Compliant modules in use', status: 'passed' },
    ],
    callout: {
      title: 'TLS Certificate Renewal Required',
      body: 'Certificate for *.snowflakecomputing.com expires 2024-02-12. Renew before 2024-02-05 to avoid connection interruption.',
    },
  },

  permissions: {
    granted: 10,
    notRequired: 2,
    denied: 0,
    rows: [
      { permission: 'USAGE', scope: 'Database: ACME_PROD', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'USAGE', scope: 'Schema: PUBLIC, ETL_STAGING', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'SELECT', scope: 'All tables in ACME_PROD.PUBLIC', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'SELECT', scope: 'All views in ACME_PROD.PUBLIC', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'INSERT', scope: 'ACME_PROD.ETL_STAGING.*', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'UPDATE', scope: 'ACME_PROD.ETL_STAGING.*', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'DELETE', scope: 'ACME_PROD.ETL_STAGING.*', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'CREATE TABLE', scope: 'ACME_PROD.ETL_STAGING', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'OPERATE', scope: 'Warehouse: ACME_ETL_WH', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'MONITOR', scope: 'Warehouse: ACME_ETL_WH', grant: 'ACME_ETL_ROLE', verified: 'granted' },
      { permission: 'CREATE SCHEMA', scope: 'Database: ACME_PROD', grant: 'Not granted', verified: 'not-required' },
      { permission: 'ACCOUNTADMIN', scope: 'Account level', grant: 'Not granted', verified: 'not-required' },
    ],
  },

  diagnostics: [
    { category: 'Network', key: 'IP Address', value: '34.224.181.45', status: 'ok' },
    { category: 'Network', key: 'DNS TTL', value: '60 s', status: 'ok' },
    { category: 'Network', key: 'RTT', value: '24 ms', status: 'ok' },
    { category: 'Network', key: 'Packet Loss', value: '0.00%', status: 'ok' },
    { category: 'Security', key: 'TLS Version', value: 'TLS 1.3', status: 'ok' },
    { category: 'Security', key: 'Cipher', value: 'ECDHE-RSA-AES256-GCM-SHA384', status: 'ok' },
    { category: 'Security', key: 'Certificate Valid Until', value: '2024-02-12', status: 'warning' },
    { category: 'Security', key: 'OCSP Status', value: 'Good', status: 'ok' },
    { category: 'Authentication', key: 'Method', value: 'OAuth 2.0 (Service Account)', status: 'ok' },
    { category: 'Authentication', key: 'Token Expiry', value: '3600 s', status: 'ok' },
    { category: 'Authentication', key: 'Scopes', value: 'READ_SESSION, WAREHOUSE_OPERATE', status: 'ok' },
    { category: 'Server', key: 'Snowflake Version', value: '7.37.1', status: 'ok' },
    { category: 'Server', key: 'Cloud Provider', value: 'AWS us-east-1', status: 'ok' },
    { category: 'Server', key: 'Warehouse Status', value: 'Suspended (auto-resume enabled)', status: 'warning' },
    { category: 'Resources', key: 'Databases Found', value: '4', status: 'ok' },
    { category: 'Resources', key: 'Schemas Discovered', value: '42', status: 'ok' },
    { category: 'Resources', key: 'Tables Enumerated', value: '1,847', status: 'ok' },
    { category: 'Config', key: 'JDBC Driver', value: 'net.snowflake:snowflake-jdbc:3.13.34', status: 'ok' },
  ],

  history: [
    { timestamp: '2024-01-15 · 14:22:07', result: 'partial', duration: '4.82 s', testedBy: 'alice.johnson', environment: 'Production', current: true },
    { timestamp: '2024-01-15 · 09:01:44', result: 'passed', duration: '3.94 s', testedBy: 'alice.johnson', environment: 'Production' },
    { timestamp: '2024-01-14 · 17:38:21', result: 'passed', duration: '4.11 s', testedBy: 'bob.chen', environment: 'Staging' },
    { timestamp: '2024-01-13 · 11:55:03', result: 'failed', duration: '12.3 s', testedBy: 'alice.johnson', environment: 'Production' },
    { timestamp: '2024-01-12 · 08:19:47', result: 'passed', duration: '3.78 s', testedBy: 'carol.smith', environment: 'Staging' },
    { timestamp: '2024-01-11 · 16:42:15', result: 'passed', duration: '4.02 s', testedBy: 'alice.johnson', environment: 'Production' },
    { timestamp: '2024-01-10 · 10:08:33', result: 'warning', duration: '5.67 s', testedBy: 'bob.chen', environment: 'Production' },
  ],

  health: {
    status: 'Healthy',
    availability: '99.97%',
    responseTime: '24 ms',
    authLatency: '310 ms',
    schemaSpeed: '621 ms',
    metadataSpeed: '2,342 ms',
    networkQuality: 'Excellent',
    packetLoss: '0.00%',
  },

  securityReview: {
    warnings: 1,
    rows: [
      { label: 'Encryption', value: 'TLS 1.3', status: 'ok' },
      { label: 'Auth Valid', value: 'OAuth 2.0', status: 'ok' },
      { label: 'Certificate', value: 'Expiring soon', status: 'warning' },
      { label: 'Host Verified', value: 'CN match', status: 'ok' },
      { label: 'OCSP', value: 'Good', status: 'ok' },
      { label: 'SOC 2 Type II', value: 'Certified', status: 'ok' },
      { label: 'FIPS 140-2', value: 'Compliant', status: 'ok' },
    ],
    note: 'Certificate renewal required before 2024-02-05 to maintain uninterrupted production connectivity.',
  },

  recommendations: [
    { title: 'Renew TLS Certificate', body: 'Expires in 28 days. Schedule renewal to prevent connection failure.', tone: 'warning' },
    { title: 'Warm Warehouse Before Pipeline', body: 'ACME_ETL_WH is suspended. Enable auto-resume to reduce cold-start latency.', tone: 'info' },
    { title: 'Enable Query Tagging', body: 'Tag ETL queries with pipeline_id for Snowflake cost attribution.', tone: 'info' },
    { title: 'Configure Auto-Reconnect', body: 'Set max_connections=10 and connection pooling for resilient ETL runs.', tone: 'info' },
    { title: 'Ready for Staging Deployment', body: 'All critical checks passed. Proceed after resolving the certificate warning.', tone: 'success' },
  ],
};

/** Summary counts derived from the checklist / security data. */
export const RESULT_BREAKDOWN = {
  passed: { label: 'Passed', count: 11, note: '11 checks' },
  warnings: { label: 'Warnings', count: 1, note: '1 check' },
  info: { label: 'Info', count: 1, note: '1 check' },
  failed: { label: 'Failed', count: 0, note: '0 critical' },
};

/**
 * Fetch the connection test result. Real GET first; on any failure
 * (including the Vite dev-server HTML SPA fallback) return the
 * design-sourced baseline flagged `mocked: true`.
 */
export async function fetchConnectionTestResult(orgId, connectionId, { signal } = {}) {
  const target = connectionId ? encodeURIComponent(connectionId) : DEFAULT_RESULT.connectionId;
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/${target}/test-result`,
      { signal },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ConnectionTestResultError('Unable to load the test result right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.checklist)) {
      throw new ConnectionTestResultError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return { ...DEFAULT_RESULT, mocked: true };
  }
}

/**
 * Persist the validated connection (the "Save Connection" action). Real
 * POST first; on any failure return a simulated success flagged
 * `mocked: true`.
 */
export async function saveValidatedConnection(orgId, connectionId, payload) {
  const target = connectionId ? encodeURIComponent(connectionId) : DEFAULT_RESULT.connectionId;
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/${target}/activate`,
      { method: 'POST', body: payload ?? {} },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ConnectionTestResultError('Unable to save the connection right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new ConnectionTestResultError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: connectionId ?? DEFAULT_RESULT.connectionId, status: 'active', mocked: true };
  }
}

/** Build the diagnostics text block for the Copy Diagnostics action. */
export function buildDiagnosticsText(result) {
  const lines = [
    `Connection Test Result — ${result.connectionName}`,
    `Status: ${result.statusLabel} (${result.checksPassed}/${result.checksTotal} checks)`,
    `Connector: ${result.connectorType}`,
    `Tested: ${result.testedAt} by ${result.testedBy}`,
    `Validation Score: ${result.validationScore}%`,
    '',
    'Diagnostics:',
    ...result.diagnostics.map((d) => `  [${d.category}] ${d.key}: ${d.value} (${d.status})`),
  ];
  return lines.join('\n');
}
