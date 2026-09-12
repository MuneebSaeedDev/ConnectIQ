/**
 * Source Node Configuration API Service (MOD-008 / SCR-067)
 *
 * Real-request-first endpoints for configuring visual ETL pipeline source nodes:
 * connector selection, credentials/authentication, database/table extraction,
 * incremental watermarks & CDC, data sampling & live preview, field-level schema
 * mapping, data quality validation rules, runtime parallelism & buffer tuning,
 * monitoring alerts, advanced connection settings, and real-time live validation.
 *
 * Falls back to design-accurate mock state flagged `mocked: true` when backend is offline.
 *
 * Figma source: https://www.figma.com/design/FU593OPeUscEvpu3hbOZrT/Ezitech-Project
 * Node: 155:2137 ("Source Node Configuration Screem")
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class SourceNodeConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'SourceNodeConfigError';
    this.status = status;
    this.details = details;
  }
}

export const CONNECTOR_TYPES = [
  { id: 'postgresql', code: 'PG', name: 'PostgreSQL', category: 'Relational', color: '#336791', bg: 'bg-[#336791]/10', border: 'border-[#336791]/30', text: 'text-[#336791]' },
  { id: 'mysql', code: 'MY', name: 'MySQL', category: 'Relational', color: '#00758f', bg: 'bg-[#00758f]/10', border: 'border-[#00758f]/30', text: 'text-[#00758f]' },
  { id: 'sqlserver', code: 'MS', name: 'SQL Server', category: 'Relational', color: '#cc292b', bg: 'bg-[#cc292b]/10', border: 'border-[#cc292b]/30', text: 'text-[#cc292b]' },
  { id: 'oracle', code: 'OR', name: 'Oracle', category: 'Relational', color: '#f80000', bg: 'bg-[#f80000]/10', border: 'border-[#f80000]/30', text: 'text-[#f80000]' },
  { id: 'mongodb', code: 'MG', name: 'MongoDB', category: 'NoSQL', color: '#13aa52', bg: 'bg-[#13aa52]/10', border: 'border-[#13aa52]/30', text: 'text-[#13aa52]' },
  { id: 'snowflake', code: 'SF', name: 'Snowflake', category: 'Warehouse', color: '#29b5e8', bg: 'bg-[#29b5e8]/10', border: 'border-[#29b5e8]/30', text: 'text-[#29b5e8]' },
  { id: 'bigquery', code: 'BQ', name: 'BigQuery', category: 'Warehouse', color: '#4285f4', bg: 'bg-[#4285f4]/10', border: 'border-[#4285f4]/30', text: 'text-[#4285f4]' },
  { id: 'redshift', code: 'RS', name: 'Redshift', category: 'Warehouse', color: '#8c4fff', bg: 'bg-[#8c4fff]/10', border: 'border-[#8c4fff]/30', text: 'text-[#8c4fff]' },
  { id: 's3', code: 'S3', name: 'Amazon S3', category: 'Cloud', color: '#e07a5f', bg: 'bg-[#e07a5f]/10', border: 'border-[#e07a5f]/30', text: 'text-[#e07a5f]' },
  { id: 'kafka', code: 'KF', name: 'Kafka', category: 'Streaming', color: '#231f20', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800' },
  { id: 'rest_api', code: 'RE', name: 'REST API', category: 'API', color: '#0284c7', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  { id: 'excel', code: 'XL', name: 'Excel', category: 'File', color: '#107c41', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
];

export const CONNECTOR_INSTANCES = [
  { id: 'pg-prod-primary', name: 'pg-prod-primary ● Connected', connectorType: 'postgresql', status: 'Connected', host: 'pg-prod-01.internal', port: 5432 },
  { id: 'pg-analytics-replica', name: 'pg-analytics-replica ● Connected', connectorType: 'postgresql', status: 'Connected', host: 'pg-ro-02.internal', port: 5432 },
  { id: 'pg-staging-master', name: 'pg-staging-master ● Idle', connectorType: 'postgresql', status: 'Idle', host: 'pg-stage-01.internal', port: 5432 },
  { id: 'mysql-orders-prod', name: 'mysql-orders-prod ● Connected', connectorType: 'mysql', status: 'Connected', host: 'mysql-01.internal', port: 3306 },
  { id: 'sf-dw-prod', name: 'sf-dw-prod ● Connected', connectorType: 'snowflake', status: 'Connected', host: 'xy12345.snowflakecomputing.com', port: 443 },
];

export const CONNECTION_PROFILES = [
  { id: 'default', name: 'Default Profile' },
  { id: 'high_throughput', name: 'High Throughput Profile (Pool: 50)' },
  { id: 'read_replica', name: 'Read Replica Profile' },
  { id: 'low_latency_ssl', name: 'Low Latency SSL Profile' },
];

export const ENVIRONMENTS = [
  { id: 'Production', name: 'Production' },
  { id: 'Staging', name: 'Staging' },
  { id: 'Development', name: 'Development' },
  { id: 'QA', name: 'QA' },
  { id: 'Sandbox', name: 'Sandbox' },
];

export const REGIONS = [
  { id: 'us-east-1', name: 'us-east-1 (N. Virginia)' },
  { id: 'us-west-2', name: 'us-west-2 (Oregon)' },
  { id: 'eu-west-1', name: 'eu-west-1 (Ireland)' },
  { id: 'ap-southeast-1', name: 'ap-southeast-1 (Singapore)' },
];

export const CATEGORIES = [
  { id: 'Data Ingestion', name: 'Data Ingestion' },
  { id: 'Change Data Capture', name: 'Change Data Capture' },
  { id: 'File Streaming', name: 'File Streaming' },
  { id: 'API Polling', name: 'API Polling' },
  { id: 'Database Mirroring', name: 'Database Mirroring' },
];

export const OWNERS = [
  { id: 'Priya S.', name: 'Priya S. (Data Lead)' },
  { id: 'Marcus Chen', name: 'Marcus Chen (Staff Engineer)' },
  { id: 'John Smith', name: 'John Smith (Senior Data Eng)' },
  { id: 'Sarah Jenkins', name: 'Sarah Jenkins (DevOps)' },
  { id: 'Pipeline Team', name: 'Pipeline Team (Core Platform)' },
];

export const AUTH_METHODS = [
  { id: 'username_password', name: 'Username / Password' },
  { id: 'oauth2', name: 'OAuth 2.0' },
  { id: 'service_account', name: 'Service Account' },
  { id: 'api_key', name: 'API Key' },
  { id: 'certificate', name: 'Certificate' },
  { id: 'token', name: 'Token' },
  { id: 'iam_role', name: 'IAM Role' },
  { id: 'managed_identity', name: 'Managed Identity' },
];

export const DATABASES = [
  { id: 'analytics_db', name: 'analytics_db' },
  { id: 'production_core', name: 'production_core' },
  { id: 'warehouse_raw', name: 'warehouse_raw' },
  { id: 'staging_db', name: 'staging_db' },
];

export const SCHEMAS = [
  { id: 'public', name: 'public' },
  { id: 'analytics', name: 'analytics' },
  { id: 'cdc_feed', name: 'cdc_feed' },
  { id: 'audit', name: 'audit' },
];

export const TABLES = [
  { id: 'orders', name: 'orders' },
  { id: 'order_items', name: 'order_items' },
  { id: 'customers', name: 'customers' },
  { id: 'transactions', name: 'transactions' },
  { id: 'payments', name: 'payments' },
];

export const EXTRACTION_MODES = [
  { id: 'full_load', name: 'Full Load', description: 'Extract entire table dataset on every run' },
  { id: 'incremental_load', name: 'Incremental Load', description: 'Extract only rows modified since last watermark' },
  { id: 'cdc', name: 'CDC', description: 'Continuous change data capture from binlog/WAL' },
  { id: 'snapshot', name: 'Snapshot', description: 'Point-in-time consistent snapshot extraction' },
  { id: 'streaming', name: 'Streaming', description: 'Real-time event/message consumption' },
];

export const BASELINE_PREVIEW_DATA = [
  { id: 1, field_name: 'customer_id', data_type: 'INTEGER', sample_value: '10042', nullable: false, primary_key: true },
  { id: 2, field_name: 'email', data_type: 'VARCHAR', sample_value: 'user@corp.com', nullable: false, primary_key: false },
  { id: 3, field_name: 'created_at', data_type: 'TIMESTAMP', sample_value: '2024-03-15 09:12:33', nullable: true, primary_key: false },
  { id: 4, field_name: 'revenue', data_type: 'DECIMAL', sample_value: '4821.50', nullable: true, primary_key: false },
  { id: 5, field_name: 'region_code', data_type: 'CHAR(3)', sample_value: 'NAM', nullable: true, primary_key: false },
  { id: 6, field_name: 'is_active', data_type: 'BOOLEAN', sample_value: 'true', nullable: false, primary_key: false },
];

export const TARGET_DATA_TYPES = [
  'BIGINT',
  'INTEGER',
  'SMALLINT',
  'STRING',
  'VARCHAR',
  'TEXT',
  'DATETIME',
  'TIMESTAMP',
  'DATE',
  'FLOAT64',
  'DECIMAL',
  'DOUBLE',
  'BOOL',
  'BOOLEAN',
  'JSON',
  'BYTES',
];

export const BASELINE_SCHEMA_MAPPINGS = [
  { id: 'field_1', field: 'customer_id', source_type: 'INTEGER', target_type: 'BIGINT', nullable: false, default_value: '—', validation_rule: 'NOT NULL', selected: true },
  { id: 'field_2', field: 'email', source_type: 'VARCHAR', target_type: 'STRING', nullable: false, default_value: '—', validation_rule: 'Email pattern', selected: true },
  { id: 'field_3', field: 'created_at', source_type: 'TIMESTAMP', target_type: 'DATETIME', nullable: true, default_value: 'NOW()', validation_rule: 'Range check', selected: true },
  { id: 'field_4', field: 'revenue', source_type: 'DECIMAL', target_type: 'FLOAT64', nullable: true, default_value: '0', validation_rule: 'Min ≥ 0', selected: true },
  { id: 'field_5', field: 'region_code', source_type: 'CHAR(3)', target_type: 'STRING', nullable: true, default_value: 'NAM', validation_rule: '[A-Z]{3}', selected: true },
  { id: 'field_6', field: 'is_active', source_type: 'BOOLEAN', target_type: 'BOOL', nullable: false, default_value: 'true', validation_rule: 'NOT NULL', selected: true },
];

export const VALIDATION_RULES = [
  { id: 'required_fields', name: 'Required Fields', description: 'Reject records with null required fields', enabled: true },
  { id: 'duplicate_detection', name: 'Duplicate Detection', description: 'Flag duplicate primary keys', enabled: true },
  { id: 'null_validation', name: 'Null Validation', description: 'Enforce non-nullable column constraints', enabled: true },
  { id: 'type_validation', name: 'Type Validation', description: 'Enforce column data type compatibility', enabled: true },
  { id: 'range_validation', name: 'Range Validation', description: 'Validate numeric and date value ranges', enabled: false },
  { id: 'pattern_matching', name: 'Pattern Matching', description: 'Regex patterns for string fields', enabled: false },
  { id: 'business_rules', name: 'Business Rules', description: 'Custom rule expressions (CEL supported)', enabled: false },
];

export const RETRY_POLICIES = [
  { id: 'exponential', name: 'Exponential Backoff' },
  { id: 'linear', name: 'Linear Retry' },
  { id: 'fixed', name: 'Fixed Interval' },
  { id: 'fail_fast', name: 'Fail Fast (No Retry)' },
];

export const BASELINE_LIVE_VALIDATIONS = [
  { id: 'chk_conn', title: 'Connection', message: 'pg-prod-primary reachable on port 5432', status: 'passed' },
  { id: 'chk_auth', title: 'Authentication', message: 'Credentials verified — valid for 90 days', status: 'passed' },
  { id: 'chk_schema', title: 'Schema Detection', message: '6 fields detected in orders table', status: 'passed' },
  { id: 'chk_req_fields', title: 'Required Fields', message: 'All mandatory fields populated', status: 'passed' },
  { id: 'chk_query', title: 'Query Validation', message: 'Custom SQL skips index on created_at', status: 'warning', note: 'Consider adding WHERE created_at > :watermark to leverage the existing partial index.' },
  { id: 'chk_resource', title: 'Resource Availability', message: 'Checking table row count and estimated size…', status: 'pending' },
];

export const INITIAL_SOURCE_NODE_FORM = {
  // 1. General Information
  nodeName: 'source_node_001',
  displayName: 'Customer Orders Source',
  description: 'Primary customer orders ingestion stream from PostgreSQL OLTP cluster with incremental timestamp extraction.',
  category: 'Data Ingestion',
  environment: 'Production',
  owner: 'Priya S.',
  tags: ['orders', 'customers', 'production'],
  nodeType: 'Source',
  version: 'v2.4.1',
  createdBy: 'Priya S.',
  lastModified: '2 hr ago',

  // 2. Source Connector
  connectorType: 'postgresql',
  connectorInstance: 'pg-prod-primary',
  connectionProfile: 'default',
  region: 'us-east-1',
  connectorStatus: 'Healthy',

  // 3. Authentication
  authMethod: 'username_password',
  username: 'etl_service_reader',
  password: '••••••••••••',
  authStatus: 'Verified',
  credentialExpiry: '90 days',
  lastValidation: '8 min ago',

  // 4. Source Configuration
  database: 'analytics_db',
  schema: 'public',
  table: 'orders',
  sqlQueryOverride: 'SELECT * FROM orders WHERE created_at > :last_watermark ORDER BY created_at ASC;',
  customEndpoint: 'https://api.internal/v1/resource',
  requestMethod: 'GET',
  customHeaders: 'X-Api-Key: <key>\nContent-Type: application/json',

  // 5. Data Extraction
  extractionMode: 'incremental_load',
  watermarkColumn: 'created_at',
  cursorField: 'id',
  timestampColumn: 'updated_at',
  batchWindow: '6',
  batchWindowUnit: 'hours',

  // 6. Data Sampling & Preview
  samplingMetrics: {
    totalRecords: '1,284,301',
    estimatedSize: '2.4 GB',
    lastSample: 'Just now',
    sampledRows: '100',
  },
  previewRows: BASELINE_PREVIEW_DATA,

  // 7. Schema Mapping
  schemaMappings: BASELINE_SCHEMA_MAPPINGS,

  // 8. Validation Rules
  validationRules: VALIDATION_RULES,

  // 9. Runtime Configuration
  batchSize: '10,000',
  parallelism: 4,
  fetchSize: '1,000',
  timeout: 30,
  timeoutUnit: 'sec',
  retryPolicy: 'exponential',
  bufferSize: '64 MB',
  failOnError: true,
  skipInvalid: false,
  continueProcessing: true,
  compression: false,

  // 10. Monitoring
  enableMetrics: true,
  enableLogs: true,
  enableAlerts: false,
  performanceMonitoring: true,
  dataProfiling: false,
  notificationChannels: {
    email: true,
    slack: true,
    teams: false,
    webhook: false,
  },

  // 11. Advanced Settings
  advancedSettings: {
    customJdbcParams: 'sslmode=verify-full&sslrootcert=/etc/ssl/certs/rds-ca.pem&connectTimeout=10',
    envVarOverrides: 'PGTZ=UTC',
    tlsVersion: 'TLS 1.3',
    verifyCert: true,
    caBundle: 'Enterprise-Root-CA-2026',
    proxyEnabled: false,
    proxyHost: '',
    proxyPort: '',
    keepAliveInterval: 30,
    maxPoolSize: 20,
  },

  // Live Validations
  validations: BASELINE_LIVE_VALIDATIONS,
};

/**
 * Fetch source node configuration
 */
export async function getSourceNodeConfig(nodeId = 'source_node_001', pipelineId = 'pip_001') {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/source-config`, {
      method: 'GET',
    });
    if (res.ok) {
      const data = await readJson(res);
      if (data && typeof data === 'object') {
        return { ...INITIAL_SOURCE_NODE_FORM, ...data, mocked: false };
      }
    }
  } catch {
    // Graceful offline fallback
  }
  return { ...INITIAL_SOURCE_NODE_FORM, mocked: true };
}

/**
 * Save / update source node configuration
 */
export async function saveSourceNodeConfig(nodeId = 'source_node_001', pipelineId = 'pip_001', payload = {}) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/source-config`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, success: true, savedAt: new Date().toISOString(), mocked: false };
    }
  } catch {
    // Graceful offline fallback
  }
  return {
    success: true,
    nodeId,
    savedAt: new Date().toISOString(),
    message: 'Configuration saved (simulated / mock mode)',
    mocked: true,
  };
}

/**
 * Test source connection
 */
export async function testSourceConnection(payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/nodes/source/test-connection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    status: 'connected',
    latencyMs: 18,
    serverVersion: 'PostgreSQL 15.4 (Ubuntu 22.04)',
    sslActive: true,
    tlsVersion: 'TLS 1.3',
    maxConnections: 100,
    activeConnections: 14,
    testedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Test authentication
 */
export async function testAuthentication(payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/nodes/source/test-auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    status: 'verified',
    principal: payload.username || 'etl_service_reader',
    grantedRoles: ['pg_read_all_data', 'connect'],
    validUntil: '90 days',
    testedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Auto-detect schema from target database & table
 */
export async function detectSchema(payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/nodes/source/detect-schema', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    table: payload.table || 'orders',
    schema: payload.schema || 'public',
    fieldsCount: 6,
    mappings: BASELINE_SCHEMA_MAPPINGS,
    detectedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Preview sampled source data
 */
export async function fetchPreviewData(payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/nodes/source/preview-data', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    rows: BASELINE_PREVIEW_DATA,
    sampledAt: new Date().toISOString(),
    totalRecords: '1,284,301',
    estimatedSize: '2.4 GB',
    mocked: true,
  };
}

/**
 * Trigger live validation suite
 */
export async function runLiveValidation(payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/nodes/source/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    validations: [
      { id: 'chk_conn', title: 'Connection', message: `${payload.connectorInstance || 'pg-prod-primary'} reachable on port 5432`, status: 'passed' },
      { id: 'chk_auth', title: 'Authentication', message: 'Credentials verified — valid for 90 days', status: 'passed' },
      { id: 'chk_schema', title: 'Schema Detection', message: `6 fields detected in ${payload.table || 'orders'} table`, status: 'passed' },
      { id: 'chk_req_fields', title: 'Required Fields', message: payload.nodeName ? 'All mandatory fields populated' : 'Node name is missing', status: payload.nodeName ? 'passed' : 'failed' },
      { id: 'chk_query', title: 'Query Validation', message: 'Custom SQL skips index on created_at', status: 'warning', note: 'Consider adding WHERE created_at > :watermark to leverage the existing partial index.' },
      { id: 'chk_resource', title: 'Resource Availability', message: 'Table row count (1.28M rows, 2.4 GB) verified within runtime limits', status: 'passed' },
    ],
    summary: { passed: 5, warning: 1, pending: 0, failed: 0 },
    validatedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Duplicate a source node
 */
export async function duplicateSourceNode(nodeId, pipelineId, newName) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName }),
    });
    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch {
    // Fallback
  }
  return {
    newNodeId: `source_node_${Math.floor(100 + Math.random() * 900)}`,
    nodeName: newName || 'source_node_copy',
    duplicatedAt: new Date().toISOString(),
    mocked: true,
  };
}
