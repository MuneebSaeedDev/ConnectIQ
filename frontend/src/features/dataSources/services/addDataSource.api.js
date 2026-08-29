/**
 * Data + submit for the Add Data Source Screen (SCR-046, node 115:28040,
 * Figma page "Page 1", frame "Add Data Source Screen" / "AddDataSource").
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, connector-config
 * validation, `test-connection` action, or `SourceHealthRecord` endpoint
 * exists yet (see docs/modules/module-plan.md). Both `testConnection` and
 * `createDataSource` always attempt a real request first and only fall
 * back to a simulated result when the endpoint is unreachable / returns
 * non-JSON (defends against the Vite dev server's own 200-OK HTML SPA
 * fallback), mirroring the sibling write-side users/addUser.api.js and
 * roles/createRole.api.js real-request-first / `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 115:28040 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata, 664 named nodes extracted).
 * The eight numbered sections (General Information, Connection
 * Configuration, Authentication, Security Configuration, Schema Discovery,
 * Operational Configuration, Metadata and Governance, Monitoring and
 * Alerts), the Source Type connector grid (Relational Databases / Cloud
 * Warehouses / Cloud Storage / APIs · SaaS · Streaming), the connection
 * test-result panel (Network Reachability / Authentication / SSL·TLS
 * Handshake / Server Version / Latency / Permissions), the schema-tree
 * checkboxes (analytics_db › public/analytics/reporting/staging with per-
 * table col·row counts), and the right-rail Data Source Summary / Connection
 * Status / Validation Status (5/6 with "Schema Discovery Complete" failing)
 * / Security Review / Pending Configuration are all transcribed from the
 * actual frame's text nodes, so layout/content fidelity is `verified`.
 * See docs/reviews/review-log.md.
 *
 * The catalogues below are design-sourced (from the frame's controls); a
 * real MOD-006 backend would serve connector types, the org's owner/
 * department directory, and per-connector config schema from an endpoint.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DataSourceError extends Error {}

/**
 * Connector catalogue (node 115:28040 "Source Type"), grouped exactly as
 * the Figma picker groups them. `kind` drives which Connection
 * Configuration field set renders (database vs. api vs. storage vs. file
 * vs. streaming), so the form is connector-aware rather than hardcoded to
 * the PostgreSQL example shown selected in the design.
 */
export const CONNECTOR_GROUPS = [
  {
    group: 'Relational Databases',
    connectors: [
      { id: 'postgresql', name: 'PostgreSQL', subtitle: 'Relational Database', kind: 'database', defaultPort: 5432 },
      { id: 'mysql', name: 'MySQL', subtitle: 'Relational Database', kind: 'database', defaultPort: 3306 },
      { id: 'sqlserver', name: 'SQL Server', subtitle: 'Relational Database', kind: 'database', defaultPort: 1433 },
      { id: 'oracle', name: 'Oracle', subtitle: 'Relational Database', kind: 'database', defaultPort: 1521 },
      { id: 'mariadb', name: 'MariaDB', subtitle: 'Relational Database', kind: 'database', defaultPort: 3306 },
    ],
  },
  {
    group: 'Cloud Warehouses',
    connectors: [
      { id: 'snowflake', name: 'Snowflake', subtitle: 'Cloud Warehouse', kind: 'database', defaultPort: 443 },
      { id: 'bigquery', name: 'BigQuery', subtitle: 'Cloud Warehouse', kind: 'warehouse', defaultPort: 443 },
      { id: 'redshift', name: 'Redshift', subtitle: 'Cloud Warehouse', kind: 'database', defaultPort: 5439 },
      { id: 'azure-synapse', name: 'Azure Synapse', subtitle: 'Cloud Warehouse', kind: 'database', defaultPort: 1433 },
    ],
  },
  {
    group: 'Cloud Storage',
    connectors: [
      { id: 's3', name: 'Amazon S3', subtitle: 'Object Storage', kind: 'storage', defaultPort: 443 },
      { id: 'azure-blob', name: 'Azure Blob', subtitle: 'Object Storage', kind: 'storage', defaultPort: 443 },
      { id: 'gcs', name: 'Google Cloud Storage', subtitle: 'Object Storage', kind: 'storage', defaultPort: 443 },
    ],
  },
  {
    group: 'APIs · SaaS · Streaming',
    connectors: [
      { id: 'rest', name: 'REST API', subtitle: 'HTTP API', kind: 'api', defaultPort: 443 },
      { id: 'salesforce', name: 'Salesforce', subtitle: 'SaaS', kind: 'api', defaultPort: 443 },
      { id: 'kafka', name: 'Apache Kafka', subtitle: 'Streaming', kind: 'streaming', defaultPort: 9092 },
      { id: 'hubspot', name: 'HubSpot', subtitle: 'SaaS', kind: 'api', defaultPort: 443 },
      { id: 'sftp', name: 'SFTP', subtitle: 'File Transfer', kind: 'file', defaultPort: 22 },
    ],
  },
];

/** Flat lookup by connector id. */
export const CONNECTORS_BY_ID = Object.fromEntries(
  CONNECTOR_GROUPS.flatMap((g) => g.connectors.map((c) => [c.id, c])),
);

/** Design-sourced select option sets (Figma node 115:28040). */
export const DATA_SOURCE_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  category: ['Analytics', 'Operational', 'Financial', 'Customer', 'Marketing', 'Compliance'],
  owner: [
    'alice.chen@company.com',
    'james.park@company.com',
    'maria.rodriguez@company.com',
    'david.lee@company.com',
    'chris.ward@company.com',
  ],
  department: [
    'Data Engineering',
    'Analytics Platform',
    'Customer Data',
    'BI & Reporting',
    'ML Infrastructure',
  ],
  authMethod: [
    'Username & Password',
    'OAuth 2.0',
    'API Key',
    'Service Account',
    'IAM Role',
    'SSL Certificate',
  ],
  minTlsVersion: ['TLS 1.2', 'TLS 1.3'],
  certificateAuthority: [
    'Corporate PKI (Internal CA)',
    'Public CA (Let’s Encrypt)',
    'Public CA (DigiCert)',
    'Self-signed (Development only)',
  ],
  dataClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  sensitivityLevel: ['Low', 'Medium', 'High', 'Critical'],
  lifecycleStatus: ['Active', 'Deprecated', 'Archived', 'Draft'],
  businessDomain: [
    'Data Analytics',
    'Sales & Revenue',
    'Customer Experience',
    'Finance',
    'Marketing',
    'Operations',
  ],
};

/** Authentication-method → which credential fields to show. */
export const AUTH_FIELD_MAP = {
  'Username & Password': ['username', 'password'],
  'OAuth 2.0': ['clientId', 'clientSecret'],
  'API Key': ['apiKey'],
  'Service Account': ['serviceAccount'],
  'IAM Role': ['iamRole'],
  'SSL Certificate': ['clientCert'],
};

/**
 * Design-sourced schema tree (Figma "Schema Discovery"). A real MOD-006
 * connector would introspect the live source; this reproduces the frame's
 * analytics_db catalogue with per-table col·row metadata so the selection
 * counts and estimated-volume figures are computed, not hardcoded.
 */
export const SCHEMA_TREE = [
  {
    id: 'public',
    name: 'public',
    tables: [
      { id: 'users', cols: 12, rows: 2_400_000, rowsLabel: '2.4M rows' },
      { id: 'orders', cols: 18, rows: 8_700_000, rowsLabel: '8.7M rows' },
      { id: 'products', cols: 9, rows: 47_000, rowsLabel: '47K rows' },
      { id: 'events', cols: 14, rows: 142_000_000, rowsLabel: '142M rows' },
      { id: 'sessions', cols: 8, rows: 31_000_000, rowsLabel: '31M rows' },
    ],
  },
  {
    id: 'analytics',
    name: 'analytics',
    tables: [
      { id: 'user_metrics', cols: 22, rows: 4_100_000, rowsLabel: '4.1M rows' },
      { id: 'revenue_summary', cols: 15, rows: 890_000, rowsLabel: '890K rows' },
      { id: 'funnel_data', cols: 11, rows: 3_200_000, rowsLabel: '3.2M rows' },
      { id: 'cohort_analysis', cols: 19, rows: 1_800_000, rowsLabel: '1.8M rows' },
      { id: 'attribution', cols: 16, rows: 6_500_000, rowsLabel: '6.5M rows' },
    ],
  },
  {
    id: 'reporting',
    name: 'reporting',
    tables: [
      { id: 'daily_kpi', cols: 10, rows: 365_000, rowsLabel: '365K rows' },
      { id: 'weekly_rollup', cols: 12, rows: 52_000, rowsLabel: '52K rows' },
    ],
  },
  {
    id: 'staging',
    name: 'staging',
    tables: [
      { id: 'raw_events', cols: 6, rows: 210_000_000, rowsLabel: '210M rows' },
      { id: 'import_buffer', cols: 8, rows: 1_100_000, rowsLabel: '1.1M rows' },
    ],
  },
];

/** Notification channels (Figma "Monitoring and Alerts"). */
export const NOTIFICATION_CHANNELS = [
  { id: 'email', name: 'Email', target: 'alice.chen@company.com', configured: true },
  { id: 'slack', name: 'Slack', target: '#data-engineering-alerts', configured: true },
  { id: 'webhook', name: 'Webhook', target: 'Not configured', configured: false },
  { id: 'pagerduty', name: 'PagerDuty', target: 'Not configured', configured: false },
];

/** Scope this source to the caller's organization (see addUser.api.js note). */
export const ORG_ID = 'current';

/** Operational Configuration select option sets (Figma node 115:28040). */
export const SYNC_FREQUENCY_OPTIONS = [
  'Real-time (CDC)',
  'Every 5 minutes',
  'Every 15 minutes',
  'Hourly',
  'Daily',
  'Manual only',
];

export const RETRY_POLICY_OPTIONS = [
  'Exponential backoff (3 retries)',
  'Fixed interval (5 retries)',
  'No automatic retry',
];

/**
 * Attempt a connection test. Real POST first; on any failure return a
 * simulated success flagged `mocked: true`. The checks array mirrors the
 * Figma result panel (Network Reachability / Authentication / SSL·TLS /
 * Server Version / Latency / Permissions).
 */
export async function testConnection(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/test-connection`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DataSourceError('Unable to test the connection right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new DataSourceError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const connector = CONNECTORS_BY_ID[payload?.connectorId] ?? null;
    return {
      success: true,
      latencyMs: 12,
      serverVersion: connector?.id === 'postgresql' ? 'PostgreSQL 16.1' : `${connector?.name ?? 'Server'} (detected)`,
      permissions: 'Read, Write, Schema',
      checks: [
        { key: 'network', label: 'Network Reachability', ok: true },
        { key: 'auth', label: 'Authentication', ok: true },
        { key: 'ssl', label: 'SSL / TLS Handshake', ok: true },
      ],
      mocked: true,
    };
  }
}

/**
 * Attempt to create the data source. Real POST first; on any failure
 * return a simulated success flagged `mocked: true`.
 */
export async function createDataSource(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DataSourceError('Unable to create the data source right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new DataSourceError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
