/**
 * Data loader for the Data Source List Screen (SCR-045, node 115:26755,
 * Figma page "Page 1", frame "Data Source List Screen").
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource`, `ConnectionTestResult`, or
 * `SourceHealthRecord` endpoint exists yet (see docs/modules/module-plan.md).
 * `getDataSources` always attempts a real GET first and only falls back to
 * the design-sourced baseline below when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK HTML
 * SPA fallback, mirroring the sibling roles/*.api.js + users/*.api.js
 * modules). Results are flagged `mocked: true` so the UI can disclose that
 * the data is sample data, not persisted records.
 *
 * FIGMA VERIFICATION: node 115:26755 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata text-node extraction). The
 * header (breadcrumb Data Management › Data Sources, title "Data Sources",
 * subtitle, Refresh / Export Data Sources / Import Configuration / + Add
 * Data Source actions), the 6 KPI cards (Total Data Sources 47 · 12 source
 * types, Active Connections 39 · 82.9% of total, Connection Failures 3 ·
 * 6.4% failure rate, Healthy Sources 36 · +2 since yesterday, Sources in
 * Use 31 · across 124 pipelines, Credential Expirations 5 · within 30
 * days), the Saved Views row (All Sources / Databases / Cloud Warehouses /
 * APIs / Production / Failed Connections (3) / Unused Sources / + Save
 * Current View), the toolbar (search, All Types / All Status / All
 * Environments / All Auth Types / All Owners / Last Updated, Columns, Clear
 * Filters), the bulk-action bar ("3 data sources selected" · Test
 * Connections / Archive Selected / Export Selected / Assign Tags), all 14
 * visible table rows (name, description, source type, environment,
 * connection status, auth method, owner, pipelines, last connection, last
 * modified), the "Showing 14 of 47 data sources" pager, and the right-hand
 * source detail drawer (Production PostgreSQL — General Information,
 * Connection Information, Credential Status, Operational Status, Usage
 * Summary, Technical Metadata) are transcribed from the actual frame's text
 * nodes, so layout/content fidelity is `verified`.
 *
 * A real MOD-006 backend would serve the persisted, org-scoped data-source
 * catalogue with live connection status, health, and credential metadata.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DataSourceListError extends Error {}

/** Filter option catalogues (node 115:26755 toolbar dropdowns). */
export const SOURCE_TYPE_OPTIONS = [
  'All Types',
  'PostgreSQL',
  'Snowflake',
  'Salesforce',
  'Amazon S3',
  'MySQL',
  'Azure Blob',
  'Apache Kafka',
  'BigQuery',
  'REST API',
  'Oracle',
  'HubSpot',
  'SFTP',
  'SQL Server',
  'Redshift',
];
export const STATUS_OPTIONS = [
  'All Status',
  'Connected',
  'Warning',
  'Failed',
  'Maintenance',
  'Disconnected',
];
export const ENVIRONMENT_OPTIONS = [
  'All Environments',
  'Production',
  'Staging',
  'Development',
];
export const AUTH_TYPE_OPTIONS = [
  'All Auth Types',
  'SSL + Password',
  'OAuth 2.0',
  'API Key',
  'IAM Role',
  'Password',
  'Managed Identity',
  'SASL/SSL',
  'Service Account',
  'Bearer Token',
  'Kerberos',
  'SSH Key',
  'SQL Auth',
  'IAM',
];
export const SORT_OPTIONS = [
  'Last Updated',
  'Data Source Name',
  'Source Type',
  'Connection Status',
  'Pipelines',
];

/**
 * Saved views (node 115:26755 "Saved Views" row). Each maps to a
 * predicate applied client-side over the baseline rows. A real MOD-006
 * backend would persist per-user saved views.
 */
export const SAVED_VIEWS = [
  { key: 'all', label: 'All Sources' },
  { key: 'databases', label: 'Databases' },
  { key: 'warehouses', label: 'Cloud Warehouses' },
  { key: 'apis', label: 'APIs' },
  { key: 'production', label: 'Production' },
  { key: 'failed', label: 'Failed Connections', badge: 3 },
  { key: 'unused', label: 'Unused Sources' },
];

const MOCK_TITLE =
  'MOD-006 (Data Sources & Connectors) has no backend deployed yet — showing sample data, not live records.';

export { MOCK_TITLE };

/**
 * Design-sourced baseline data-source list (node 115:26755). A real
 * MOD-006 endpoint would return the persisted, org-scoped catalogue with
 * live connection/health/credential state.
 */
export const MOCK_DATA_SOURCE_LIST = {
  updatedAt: 'Jan 15, 2025',
  organizationName: 'Acme Corporation',
  kpis: [
    { key: 'total', label: 'Total Data Sources', value: '47', hint: '12 source types', tone: 'default' },
    { key: 'active', label: 'Active Connections', value: '39', hint: '82.9% of total', tone: 'success' },
    { key: 'failures', label: 'Connection Failures', value: '3', hint: '6.4% failure rate', tone: 'danger' },
    { key: 'healthy', label: 'Healthy Sources', value: '36', hint: '+2 since yesterday', tone: 'success' },
    { key: 'inUse', label: 'Sources in Use', value: '31', hint: 'across 124 pipelines', tone: 'info' },
    { key: 'expiring', label: 'Credential Expirations', value: '5', hint: 'within 30 days', tone: 'warning' },
  ],
  total: 47,
  rows: [
    {
      id: 'ds_01HKM92V4WX3',
      name: 'Production PostgreSQL',
      description: 'Primary OLTP database for production workloads',
      sourceType: 'PostgreSQL',
      category: 'database',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'SSL + Password',
      owner: 'alice.chen',
      ownerEmail: 'alice.chen@company.com',
      pipelines: 8,
      lastConnection: '2 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 15, 2025',
      tags: ['production', 'oltp', 'core', 'postgres'],
      connection: { host: 'pg-prod-01.internal.company.com', port: '5432', database: 'etl_production' },
      credentialStatus: 'Active — expires Mar 15, 2025',
      credentialExpiring: true,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '2 minutes ago', lastFailure: '—', avgResponse: '12 ms', scheduledJobs: '5 active' },
      detailDescription: 'Primary OLTP PostgreSQL database for production workloads',
      sourceId: 'ds_01HKM92V4WX3',
      createdBy: 'alice.chen',
      created: 'Dec 12, 2024',
      configVersion: 'v4',
      unused: false,
    },
    {
      id: 'ds_02SNFLK8823',
      name: 'Snowflake Data Warehouse',
      description: 'Enterprise cloud data warehouse for analytics',
      sourceType: 'Snowflake',
      category: 'warehouse',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'OAuth 2.0',
      owner: 'bob.smith',
      ownerEmail: 'bob.smith@company.com',
      pipelines: 23,
      lastConnection: '5 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 14, 2025',
      tags: ['analytics', 'warehouse'],
      connection: { host: 'acme.snowflakecomputing.com', port: '443', database: 'ANALYTICS_PROD' },
      credentialStatus: 'Active',
      credentialExpiring: false,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '5 minutes ago', lastFailure: '—', avgResponse: '340 ms', scheduledJobs: '18 active' },
      sourceId: 'ds_02SNFLK8823',
      createdBy: 'bob.smith',
      created: 'Oct 03, 2024',
      configVersion: 'v7',
      unused: false,
    },
    {
      id: 'ds_03SFDC44190',
      name: 'Salesforce CRM',
      description: 'Customer relationship management integration',
      sourceType: 'Salesforce',
      category: 'api',
      environment: 'Production',
      status: 'Warning',
      authMethod: 'API Key',
      owner: 'carol.jones',
      ownerEmail: 'carol.jones@company.com',
      pipelines: 6,
      lastConnection: '1h ago',
      lastConnectionWarning: true,
      lastModified: 'Jan 12, 2025',
      tags: ['crm', 'sales'],
      connection: { host: 'acme.my.salesforce.com', port: '443', database: '—' },
      credentialStatus: 'Active — expires Feb 02, 2025',
      credentialExpiring: true,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '1 hour ago', lastFailure: '52 minutes ago', avgResponse: '890 ms', scheduledJobs: '3 active' },
      sourceId: 'ds_03SFDC44190',
      createdBy: 'carol.jones',
      created: 'Sep 18, 2024',
      configVersion: 'v3',
      unused: false,
    },
    {
      id: 'ds_04S3LAKE221',
      name: 'AWS S3 Data Lake',
      description: 'Primary S3 object storage for raw data ingestion',
      sourceType: 'Amazon S3',
      category: 'storage',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'IAM Role',
      owner: 'alice.chen',
      ownerEmail: 'alice.chen@company.com',
      pipelines: 14,
      lastConnection: '3 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 15, 2025',
      tags: ['storage', 'datalake', 's3'],
      connection: { host: 's3.us-east-1.amazonaws.com', port: '443', database: 'acme-raw-ingest' },
      credentialStatus: 'Active (IAM Role)',
      credentialExpiring: false,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '3 minutes ago', lastFailure: '—', avgResponse: '120 ms', scheduledJobs: '9 active' },
      sourceId: 'ds_04S3LAKE221',
      createdBy: 'alice.chen',
      created: 'Aug 21, 2024',
      configVersion: 'v5',
      unused: false,
    },
    {
      id: 'ds_05MYSQL7734',
      name: 'MySQL Analytics DB',
      description: 'Development analytics database for testing pipelines',
      sourceType: 'MySQL',
      category: 'database',
      environment: 'Development',
      status: 'Connected',
      authMethod: 'Password',
      owner: 'dave.wilson',
      ownerEmail: 'dave.wilson@company.com',
      pipelines: 3,
      lastConnection: '22 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 10, 2025',
      tags: ['analytics', 'dev'],
      connection: { host: 'mysql-dev-01.internal.company.com', port: '3306', database: 'analytics_dev' },
      credentialStatus: 'Active',
      credentialExpiring: false,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '22 minutes ago', lastFailure: '—', avgResponse: '45 ms', scheduledJobs: '2 active' },
      sourceId: 'ds_05MYSQL7734',
      createdBy: 'dave.wilson',
      created: 'Nov 05, 2024',
      configVersion: 'v2',
      unused: false,
    },
    {
      id: 'ds_06AZBLOB901',
      name: 'Azure Blob Storage',
      description: 'Staging zone for intermediate ETL output files',
      sourceType: 'Azure Blob',
      category: 'storage',
      environment: 'Staging',
      status: 'Connected',
      authMethod: 'Managed Identity',
      owner: 'eve.taylor',
      ownerEmail: 'eve.taylor@company.com',
      pipelines: 5,
      lastConnection: '8 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 13, 2025',
      tags: ['storage', 'staging'],
      connection: { host: 'acmestaging.blob.core.windows.net', port: '443', database: 'etl-staging' },
      credentialStatus: 'Active (Managed Identity)',
      credentialExpiring: false,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '8 minutes ago', lastFailure: '—', avgResponse: '95 ms', scheduledJobs: '4 active' },
      sourceId: 'ds_06AZBLOB901',
      createdBy: 'eve.taylor',
      created: 'Dec 01, 2024',
      configVersion: 'v3',
      unused: false,
    },
    {
      id: 'ds_07KAFKA5512',
      name: 'Apache Kafka Stream',
      description: 'Real-time event streaming platform for pipeline events',
      sourceType: 'Apache Kafka',
      category: 'streaming',
      environment: 'Production',
      status: 'Failed',
      authMethod: 'SASL/SSL',
      owner: 'frank.miller',
      ownerEmail: 'frank.miller@company.com',
      pipelines: 2,
      lastConnection: '2h ago',
      lastConnectionWarning: false,
      lastModified: 'Dec 28, 2024',
      tags: ['streaming', 'events', 'realtime'],
      connection: { host: 'kafka-prod-01.internal.company.com', port: '9093', database: 'etl-events' },
      credentialStatus: 'Active — expires Jan 25, 2025',
      credentialExpiring: true,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '2 hours ago', lastFailure: '4 minutes ago', avgResponse: '—', scheduledJobs: '2 active' },
      sourceId: 'ds_07KAFKA5512',
      createdBy: 'frank.miller',
      created: 'Jul 14, 2024',
      configVersion: 'v6',
      unused: false,
    },
    {
      id: 'ds_08BQUERY330',
      name: 'Google BigQuery',
      description: 'Analytics data warehouse for BI and reporting pipelines',
      sourceType: 'BigQuery',
      category: 'warehouse',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'Service Account',
      owner: 'alice.chen',
      ownerEmail: 'alice.chen@company.com',
      pipelines: 11,
      lastConnection: '18 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 14, 2025',
      tags: ['analytics', 'bi', 'warehouse'],
      connection: { host: 'bigquery.googleapis.com', port: '443', database: 'acme-analytics' },
      credentialStatus: 'Active (Service Account)',
      credentialExpiring: false,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '18 minutes ago', lastFailure: '—', avgResponse: '410 ms', scheduledJobs: '7 active' },
      sourceId: 'ds_08BQUERY330',
      createdBy: 'alice.chen',
      created: 'Sep 02, 2024',
      configVersion: 'v4',
      unused: false,
    },
    {
      id: 'ds_09RESTAPI77',
      name: 'REST API Gateway',
      description: 'Corporate API gateway for internal microservices',
      sourceType: 'REST API',
      category: 'api',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'Bearer Token',
      owner: 'grace.lee',
      ownerEmail: 'grace.lee@company.com',
      pipelines: 7,
      lastConnection: '45 min ago',
      lastConnectionWarning: true,
      lastModified: 'Jan 11, 2025',
      tags: ['api', 'gateway', 'microservices'],
      connection: { host: 'api-gateway.internal.company.com', port: '443', database: '—' },
      credentialStatus: 'Active — expires Feb 10, 2025',
      credentialExpiring: true,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '45 minutes ago', lastFailure: '—', avgResponse: '210 ms', scheduledJobs: '3 active' },
      sourceId: 'ds_09RESTAPI77',
      createdBy: 'grace.lee',
      created: 'Oct 28, 2024',
      configVersion: 'v2',
      unused: false,
    },
    {
      id: 'ds_10ORACLE118',
      name: 'Oracle ERP Database',
      description: 'Legacy ERP Oracle database — finance and procurement',
      sourceType: 'Oracle',
      category: 'database',
      environment: 'Production',
      status: 'Warning',
      authMethod: 'Kerberos',
      owner: 'dave.wilson',
      ownerEmail: 'dave.wilson@company.com',
      pipelines: 4,
      lastConnection: '3h ago',
      lastConnectionWarning: true,
      lastModified: 'Jan 8, 2025',
      tags: ['erp', 'finance', 'legacy'],
      connection: { host: 'oracle-erp-01.internal.company.com', port: '1521', database: 'ERPPROD' },
      credentialStatus: 'Active — expires Mar 01, 2025',
      credentialExpiring: true,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '3 hours ago', lastFailure: '2 hours ago', avgResponse: '1,240 ms', scheduledJobs: '2 active' },
      sourceId: 'ds_10ORACLE118',
      createdBy: 'dave.wilson',
      created: 'Jun 12, 2024',
      configVersion: 'v8',
      unused: false,
    },
    {
      id: 'ds_11HUBSPOT44',
      name: 'HubSpot Marketing',
      description: 'Marketing CRM integration for lead data synchronization',
      sourceType: 'HubSpot',
      category: 'api',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'OAuth 2.0',
      owner: 'carol.jones',
      ownerEmail: 'carol.jones@company.com',
      pipelines: 2,
      lastConnection: '12 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 15, 2025',
      tags: ['marketing', 'crm', 'leads'],
      connection: { host: 'api.hubapi.com', port: '443', database: '—' },
      credentialStatus: 'Active',
      credentialExpiring: false,
      sslTls: 'TLS 1.3 enforced',
      operational: { lastSuccess: '12 minutes ago', lastFailure: '—', avgResponse: '320 ms', scheduledJobs: '1 active' },
      sourceId: 'ds_11HUBSPOT44',
      createdBy: 'carol.jones',
      created: 'Nov 22, 2024',
      configVersion: 'v1',
      unused: false,
    },
    {
      id: 'ds_12SFTP99201',
      name: 'SFTP File Server',
      description: 'Legacy file transfer server for partner data drops',
      sourceType: 'SFTP',
      category: 'file',
      environment: 'Staging',
      status: 'Maintenance',
      authMethod: 'SSH Key',
      owner: 'eve.taylor',
      ownerEmail: 'eve.taylor@company.com',
      pipelines: 1,
      lastConnection: '6h ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 9, 2025',
      tags: ['file', 'partner', 'legacy'],
      connection: { host: 'sftp.partners.company.com', port: '22', database: '/inbound' },
      credentialStatus: 'Active (SSH Key)',
      credentialExpiring: false,
      sslTls: 'SSH-2 (Ed25519)',
      operational: { lastSuccess: '6 hours ago', lastFailure: '—', avgResponse: '—', scheduledJobs: '1 active' },
      sourceId: 'ds_12SFTP99201',
      createdBy: 'eve.taylor',
      created: 'May 30, 2024',
      configVersion: 'v2',
      unused: false,
    },
    {
      id: 'ds_13MSSQL5580',
      name: 'MS SQL Server Dev',
      description: 'Development SQL Server instance for schema testing',
      sourceType: 'SQL Server',
      category: 'database',
      environment: 'Development',
      status: 'Disconnected',
      authMethod: 'SQL Auth',
      owner: 'frank.miller',
      ownerEmail: 'frank.miller@company.com',
      pipelines: 0,
      lastConnection: '3 days ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 5, 2025',
      tags: ['dev', 'schema-testing'],
      connection: { host: 'mssql-dev-02.internal.company.com', port: '1433', database: 'schema_test' },
      credentialStatus: 'Inactive',
      credentialExpiring: false,
      sslTls: 'TLS 1.2 (optional)',
      operational: { lastSuccess: '3 days ago', lastFailure: '3 days ago', avgResponse: '—', scheduledJobs: '0 active' },
      sourceId: 'ds_13MSSQL5580',
      createdBy: 'frank.miller',
      created: 'Dec 20, 2024',
      configVersion: 'v1',
      unused: true,
    },
    {
      id: 'ds_14RDSHFT662',
      name: 'Amazon Redshift',
      description: 'Redshift cluster for large-scale historical analytics',
      sourceType: 'Redshift',
      category: 'warehouse',
      environment: 'Production',
      status: 'Connected',
      authMethod: 'IAM',
      owner: 'bob.smith',
      ownerEmail: 'bob.smith@company.com',
      pipelines: 9,
      lastConnection: '7 min ago',
      lastConnectionWarning: false,
      lastModified: 'Jan 14, 2025',
      tags: ['warehouse', 'historical', 'analytics'],
      connection: { host: 'acme.redshift.amazonaws.com', port: '5439', database: 'historical' },
      credentialStatus: 'Active (IAM)',
      credentialExpiring: false,
      sslTls: 'TLS 1.2 enforced',
      operational: { lastSuccess: '7 minutes ago', lastFailure: '—', avgResponse: '520 ms', scheduledJobs: '6 active' },
      sourceId: 'ds_14RDSHFT662',
      createdBy: 'bob.smith',
      created: 'Aug 09, 2024',
      configVersion: 'v5',
      unused: false,
    },
  ],
};

/**
 * Load the org's data-source catalogue. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getDataSources(orgId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.type && filters.type !== 'All Types') params.set('type', filters.type);
  if (filters.status && filters.status !== 'All Status') params.set('status', filters.status);
  if (filters.environment && filters.environment !== 'All Environments') params.set('environment', filters.environment);
  if (filters.authType && filters.authType !== 'All Auth Types') params.set('auth', filters.authType);
  if (filters.sort) params.set('sort', filters.sort);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources${query}`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DataSourceListError('Unable to load data sources right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.rows)) {
      throw new DataSourceListError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_DATA_SOURCE_LIST, mocked: true };
  }
}
