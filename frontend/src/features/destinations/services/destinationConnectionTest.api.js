/**
 * API service and mock data contracts for Destination Connection Test Screen (SCR-059).
 * Figma Node: 130:2662 (Page 1 -> Destination Connection Test Screen).
 *
 * MOCK BOUNDARY:
 * MOD-007 (Destinations) backend is still PLANNED (no live connection test daemon).
 * `runDestinationConnectionTest` attempts a real org-scoped POST first:
 * `/organizations/${orgId}/destinations/${destinationId}/test`
 * with a content-type JSON guard defending against Vite SPA HTML fallbacks.
 * On failure or unreachable backend, it falls back to design-accurate simulated test results.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DestinationConnectionTestError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'DestinationConnectionTestError';
    this.status = status;
    this.details = details;
  }
}

export const ORG_ID = 'current';

export const TEST_MODES = [
  {
    id: 'quick',
    name: 'Quick Validation',
    description: 'Tests connectivity, basic authentication, and schema existence (~5-10s).',
    estimatedSeconds: '5-10s',
  },
  {
    id: 'full',
    name: 'Full Validation',
    description: 'Performs complete end-to-end test including write permissions and sample data insertion (~20-30s).',
    estimatedSeconds: '20-30s',
  },
];

export const DEFAULT_DESTINATION_METADATA = {
  id: 'dest_sf_prod_01',
  name: 'Snowflake Production',
  type: 'Snowflake',
  typeLabel: 'Snowflake Data Warehouse',
  environment: 'Production',
  authMethod: 'Username & Password',
  lastTested: 'Never',
  configVersion: 'v1.0.0',
  account: 'xy12345.us-east-1',
  database: 'PROD_ANALYTICS',
  schema: 'PUBLIC',
  warehouse: 'COMPUTE_WH',
  username: 'CONNECTIQ_PROD_SVC',
  host: 'xy12345.us-east-1.snowflakecomputing.com',
  port: 443,
  sslEnabled: true,
};

export const DEFAULT_TEST_CONFIG = {
  mode: 'quick', // 'quick' | 'full'
  timeoutSeconds: 30,
  retryAttempts: 3,
  verifyWritePermissions: true,
  validateSchema: true,
  verifySslCertificate: true,
  performSampleWrite: false,
};

export const DEFAULT_TEST_RESULT_SUCCESS = {
  testId: 'test_run_8839201a',
  sessionId: 'sess_sf_8839201a',
  status: 'passed', // 'passed' | 'failed' | 'warning'
  statusLabel: 'Passed',
  message: 'Connection test completed successfully. All selected validation checks passed.',
  executedAt: 'Just now',
  totalExecutionMs: 1248,
  checksPassed: 5,
  checksTotal: 5,
  healthScore: 98,
  healthScoreLabel: 'Excellent',
  healthScoreNote: 'Optimal for production pipelines',

  validationSteps: [
    {
      id: 'step_dns',
      name: 'DNS & Network Reachability',
      description: 'Resolved xy12345.us-east-1.snowflakecomputing.com ([IP_REDACTED]) · Port 443 open · Latency 24ms',
      status: 'passed',
      durationMs: 38,
      required: true,
    },
    {
      id: 'step_tls',
      name: 'TLS / SSL Negotiation',
      description: 'TLS 1.3 negotiated · Cipher: TLS_AES_256_GCM_SHA384 · Certificate valid (expires in 284 days)',
      status: 'passed',
      durationMs: 186,
      required: true,
    },
    {
      id: 'step_auth',
      name: 'Authentication & Credentials',
      description: "User 'CONNECTIQ_PROD_SVC' authenticated successfully via Snowflake Native Auth · Token issued",
      status: 'passed',
      durationMs: 312,
      required: true,
    },
    {
      id: 'step_warehouse',
      name: 'Warehouse Availability',
      description: "Warehouse 'COMPUTE_WH' is ACTIVE · Auto-resume enabled · Size: X-Small · Current load: 0.12",
      status: 'passed',
      durationMs: 94,
      required: true,
    },
    {
      id: 'step_schema',
      name: 'Database & Schema Verification',
      description: "Database 'PROD_ANALYTICS' found · Schema 'PUBLIC' verified · 48 tables discovered",
      status: 'passed',
      durationMs: 142,
      required: true,
    },
    {
      id: 'step_write',
      name: 'Write & DDL Permissions',
      description: "Role 'ETL_ADMIN_ROLE' has INSERT, UPDATE, DELETE, CREATE TABLE on 'PROD_ANALYTICS.PUBLIC'",
      status: 'passed',
      durationMs: 218,
      required: false,
    },
    {
      id: 'step_sample_write',
      name: 'Data Insertion Test',
      description: 'Sample row written to temporary table and rolled back cleanly · Write speed: 14.2 MB/s',
      status: 'passed',
      durationMs: 258,
      required: false,
    },
  ],

  metrics: {
    responseTimeMs: 24,
    dnsLookupMs: 38,
    tlsHandshakeMs: 186,
    authTimeMs: 312,
    permissionCheckMs: 218,
    sampleWriteMs: 258,
    totalExecutionMs: 1248,
  },

  timeline: [
    { time: '00:00.000', event: 'Test initialization started (Quick Validation mode)', status: 'INFO' },
    { time: '00:00.038', event: 'DNS lookup completed for xy12345.us-east-1.snowflakecomputing.com', status: 'SUCCESS' },
    { time: '00:00.224', event: 'TLS 1.3 handshake established with server certificate verification', status: 'SUCCESS' },
    { time: '00:00.536', event: 'Authentication token acquired for user CONNECTIQ_PROD_SVC', status: 'SUCCESS' },
    { time: '00:00.630', event: 'Warehouse COMPUTE_WH status confirmed (ACTIVE)', status: 'SUCCESS' },
    { time: '00:00.772', event: 'Database PROD_ANALYTICS and schema PUBLIC introspection complete', status: 'SUCCESS' },
    { time: '00:00.990', event: 'Role permissions verified (INSERT, UPDATE, DELETE, CREATE TABLE)', status: 'SUCCESS' },
    { time: '00:01.248', event: 'All validation checks completed successfully', status: 'SUCCESS' },
  ],

  diagnostics: {
    destinationHost: 'xy12345.us-east-1.snowflakecomputing.com',
    targetPort: '443',
    protocol: 'HTTPS / JDBC',
    tlsVersion: 'TLS 1.3',
    cipherSuite: 'TLS_AES_256_GCM_SHA384',
    driverVersion: 'Snowflake JDBC 3.14.4',
    serverVersion: 'Snowflake 7.32.1',
    cloudRegion: 'AWS us-east-1 (N. Virginia)',
    sessionId: '01b4e889-0001-2a3b-0003-918273645012',
    clientIp: '[IP_REDACTED] (NAT Gateway)',
  },
};

/**
 * Builds printable diagnostics text for clipboard copying or export.
 */
export function buildDiagnosticsExportText(destination, config, result) {
  const lines = [
    '============================================================',
    'CONNECTIQ — DESTINATION CONNECTION TEST REPORT',
    '============================================================',
    `Generated: ${new Date().toISOString()}`,
    `Destination: ${destination.name} (${destination.type})`,
    `Environment: ${destination.environment}`,
    `Host: ${destination.host}:${destination.port}`,
    `Account: ${destination.account}`,
    `Database: ${destination.database}`,
    `Schema: ${destination.schema}`,
    `Warehouse: ${destination.warehouse}`,
    `Auth Method: ${destination.authMethod}`,
    '',
    '------------------ TEST CONFIGURATION ----------------------',
    `Mode: ${config.mode.toUpperCase()}`,
    `Timeout: ${config.timeoutSeconds}s`,
    `Retry Attempts: ${config.retryAttempts}`,
    `Verify Write Permissions: ${config.verifyWritePermissions ? 'YES' : 'NO'}`,
    `Validate Schema: ${config.validateSchema ? 'YES' : 'NO'}`,
    `Verify SSL Certificate: ${config.verifySslCertificate ? 'YES' : 'NO'}`,
    `Perform Sample Write: ${config.performSampleWrite ? 'YES' : 'NO'}`,
    '',
    '------------------- TEST RESULTS ---------------------------',
    `Status: ${result ? result.statusLabel : 'NOT_TESTED'}`,
    `Checks Passed: ${result ? `${result.checksPassed}/${result.checksTotal}` : 'N/A'}`,
    `Total Duration: ${result ? `${result.totalExecutionMs} ms` : 'N/A'}`,
    `Health Score: ${result ? `${result.healthScore}/100 (${result.healthScoreLabel})` : 'N/A'}`,
    '',
    '------------------ VALIDATION STEPS ------------------------',
  ];

  if (result && result.validationSteps) {
    result.validationSteps.forEach((step, idx) => {
      lines.push(`[${idx + 1}] ${step.status.toUpperCase()} (${step.durationMs}ms) — ${step.name}`);
      lines.push(`    ${step.description}`);
    });
  }

  lines.push('');
  lines.push('---------------- TECHNICAL DIAGNOSTICS ---------------------');
  if (result && result.diagnostics) {
    Object.entries(result.diagnostics).forEach(([key, val]) => {
      lines.push(`${key.padEnd(20)}: ${val}`);
    });
  }

  lines.push('============================================================');
  return lines.join('\n');
}

/**
 * Runs a destination connection test against the backend API (with mock fallback).
 */
export async function runDestinationConnectionTest(orgId = ORG_ID, destinationId = 'dest_sf_prod_01', config = DEFAULT_TEST_CONFIG) {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/test`;

  try {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });

    if (res.ok) {
      const data = await readJson(res);
      if (data && typeof data === 'object') {
        return {
          ...DEFAULT_TEST_RESULT_SUCCESS,
          ...data,
          mocked: false,
        };
      }
    }
  } catch (err) {
    // Expected fallback when backend route is not mounted
    console.debug('[DestinationConnectionTest] Real endpoint fallback:', err?.message);
  }

  // Simulate network timing based on mode
  const delay = config.mode === 'full' ? 1200 : 700;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Determine active steps based on toggles
  const steps = [
    {
      id: 'step_dns',
      name: 'DNS & Network Reachability',
      description: 'Resolved xy12345.us-east-1.snowflakecomputing.com ([IP_REDACTED]) · Port 443 open · Latency 24ms',
      status: 'passed',
      durationMs: 38,
      required: true,
    },
    config.verifySslCertificate
      ? {
          id: 'step_tls',
          name: 'TLS / SSL Negotiation',
          description: 'TLS 1.3 negotiated · Cipher: TLS_AES_256_GCM_SHA384 · Certificate valid (expires in 284 days)',
          status: 'passed',
          durationMs: 186,
          required: true,
        }
      : {
          id: 'step_tls',
          name: 'TLS / SSL Negotiation',
          description: 'TLS validation bypassed per configuration',
          status: 'warning',
          durationMs: 12,
          required: false,
        },
    {
      id: 'step_auth',
      name: 'Authentication & Credentials',
      description: "User 'CONNECTIQ_PROD_SVC' authenticated successfully via Snowflake Native Auth · Token issued",
      status: 'passed',
      durationMs: 312,
      required: true,
    },
    {
      id: 'step_warehouse',
      name: 'Warehouse Availability',
      description: "Warehouse 'COMPUTE_WH' is ACTIVE · Auto-resume enabled · Size: X-Small · Current load: 0.12",
      status: 'passed',
      durationMs: 94,
      required: true,
    },
    config.validateSchema
      ? {
          id: 'step_schema',
          name: 'Database & Schema Verification',
          description: "Database 'PROD_ANALYTICS' found · Schema 'PUBLIC' verified · 48 tables discovered",
          status: 'passed',
          durationMs: 142,
          required: true,
        }
      : {
          id: 'step_schema',
          name: 'Database & Schema Verification',
          description: 'Schema verification skipped per test configuration',
          status: 'warning',
          durationMs: 10,
          required: false,
        },
    config.verifyWritePermissions
      ? {
          id: 'step_write',
          name: 'Write & DDL Permissions',
          description: "Role 'ETL_ADMIN_ROLE' has INSERT, UPDATE, DELETE, CREATE TABLE on 'PROD_ANALYTICS.PUBLIC'",
          status: 'passed',
          durationMs: 218,
          required: false,
        }
      : {
          id: 'step_write',
          name: 'Write & DDL Permissions',
          description: 'Write permission verification skipped',
          status: 'warning',
          durationMs: 8,
          required: false,
        },
    config.performSampleWrite || config.mode === 'full'
      ? {
          id: 'step_sample_write',
          name: 'Data Insertion Test',
          description: 'Sample row written to temporary table and rolled back cleanly · Write speed: 14.2 MB/s',
          status: 'passed',
          durationMs: 258,
          required: false,
        }
      : {
          id: 'step_sample_write',
          name: 'Data Insertion Test',
          description: 'Sample write not requested in quick mode',
          status: 'warning',
          durationMs: 6,
          required: false,
        },
  ];

  const totalDuration = steps.reduce((sum, s) => sum + s.durationMs, 0);
  const passedCount = steps.filter((s) => s.status === 'passed').length;

  return {
    ...DEFAULT_TEST_RESULT_SUCCESS,
    validationSteps: steps,
    totalExecutionMs: totalDuration,
    checksPassed: passedCount,
    checksTotal: steps.length,
    mocked: true,
  };
}

/**
 * Persists / finalizes the tested destination configuration.
 */
export async function saveValidatedDestination(orgId = ORG_ID, destinationId = 'dest_sf_prod_01', payload = {}) {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/save`;

  try {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await readJson(res);
      return { ...data, mocked: false };
    }
  } catch (err) {
    console.debug('[DestinationSave] Endpoint fallback:', err?.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    id: destinationId,
    status: 'ACTIVE',
    savedAt: new Date().toISOString(),
    mocked: true,
  };
}
