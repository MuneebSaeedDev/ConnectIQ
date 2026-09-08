/**
 * API service and mock contracts for Destination Configuration Screen (SCR-060).
 * Figma Node: 130:3610 (Page 1 -> Destination Configuration Screen).
 *
 * MOCK BOUNDARY:
 * MOD-007 (Destinations) backend is still PLANNED.
 * `getDestinationConfiguration` and `updateDestinationConfiguration` attempt
 * real org-scoped endpoints first:
 * `/organizations/${orgId}/destinations/${destinationId}/config`
 * with a content-type JSON guard defending against SPA fallback HTML.
 * On failure or unreachable backend, it falls back to design-accurate simulated configuration.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DestinationConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'DestinationConfigError';
    this.status = status;
    this.details = details;
  }
}

export const ORG_ID = 'current';

export const AUTH_METHODS = [
  'Username & Password',
  'OAuth 2.0',
  'Key Pair Authentication',
  'AWS IAM Role',
  'Service Account',
];

export const ENVIRONMENTS = ['Production', 'Staging', 'Development', 'Disaster Recovery'];

export const DEFAULT_DESTINATION_CONFIG = {
  id: 'dest_sf_prod_01',
  name: 'Snowflake Production',
  type: 'Snowflake',
  typeLabel: 'Snowflake Data Warehouse',
  environment: 'Production',
  owner: 'Priya S.',
  createdBy: 'Priya S.',
  createdDate: '2026-03-12',
  lastUpdated: '2 hours ago',
  lastTested: '14:02:17 today',
  version: 'v1.0.0',
  status: 'Connected',

  general: {
    displayName: 'Snowflake Production',
    type: 'Snowflake',
    description: 'Primary data warehouse for production analytics, financial reporting, and customer intelligence pipelines.',
    environment: 'Production',
    owner: 'Priya S.',
    tags: ['analytics', 'finance', 'prod', 'snowflake', 'warehouse'],
  },

  connection: {
    account: 'xy12345.us-east-1',
    warehouse: 'COMPUTE_WH',
    database: 'ANALYTICS_DB',
    schema: 'PUBLIC',
    role: 'SYSADMIN',
  },

  auth: {
    method: 'Username & Password',
    username: 'etl_service_user',
    password: '••••••••••••',
    lastRotated: '14 days ago',
    encryption: 'AES-256',
    keyFingerprint: 'SHA256:7b:9c:4a:12:ef:90:3d:1a:88:5b:bc:aa',
    roleArn: 'arn:aws:iam::123456789012:role/ConnectIQSnowflakeAccess',
  },

  configuration: {
    connectionTimeout: 30,
    retryAttempts: 3,
    retryInterval: 5,
    batchSize: 10000,
    parallelWrites: 4,
    sslEnabled: true,
    compression: false,
    keepAlive: true,
  },

  validationChecklist: [
    {
      id: 'v1',
      name: 'Required Fields',
      description: 'All required fields complete',
      status: 'passed',
      timestamp: 'Just now',
      required: true,
    },
    {
      id: 'v2',
      name: 'Authentication',
      description: 'Credentials validated with server',
      status: 'passed',
      timestamp: '14:02:13',
      required: true,
    },
    {
      id: 'v3',
      name: 'SSL Configuration',
      description: 'TLS 1.3 · Certificate trusted (expires 284d)',
      status: 'passed',
      timestamp: '14:02:14',
      required: true,
    },
    {
      id: 'v4',
      name: 'Network Connectivity',
      description: 'Host reachable via TCP port 443 (24ms)',
      status: 'passed',
      timestamp: '14:02:12',
      required: true,
    },
    {
      id: 'v5',
      name: 'Destination Permissions',
      description: 'Write access verified on ANALYTICS_DB.PUBLIC',
      status: 'passed',
      timestamp: '14:02:15',
      required: true,
    },
    {
      id: 'v6',
      name: 'Write Access',
      description: 'One minor schema mismatch detected in staging',
      status: 'warning',
      timestamp: '14:02:16',
      required: false,
    },
    {
      id: 'v7',
      name: 'Schema Validation',
      description: 'Continuous schema drift validation',
      status: 'pending',
      timestamp: '—',
      required: false,
    },
  ],

  healthMetrics: {
    currentStatus: 'Connected',
    lastSuccessful: '14:02:17',
    avgResponseTimeMs: 354,
    availabilityPct: 99.8,
    consecutiveFailures: 0,
    successfulTests: 142,
    failedTests: 1,
    timelineBars: [
      { hour: '24h ago', height: 28, status: 'healthy', value: '100%' },
      { hour: '23h', height: 28, status: 'healthy', value: '100%' },
      { hour: '22h', height: 28, status: 'healthy', value: '100%' },
      { hour: '21h', height: 28, status: 'healthy', value: '100%' },
      { hour: '20h', height: 28, status: 'healthy', value: '100%' },
      { hour: '19h', height: 28, status: 'healthy', value: '100%' },
      { hour: '18h', height: 28, status: 'healthy', value: '100%' },
      { hour: '17h', height: 28, status: 'healthy', value: '100%' },
      { hour: '16h', height: 28, status: 'healthy', value: '100%' },
      { hour: '15h', height: 14, status: 'warning', value: '94.2%' },
      { hour: '14h', height: 28, status: 'healthy', value: '100%' },
      { hour: '13h', height: 28, status: 'healthy', value: '100%' },
      { hour: '12h', height: 28, status: 'healthy', value: '100%' },
      { hour: '11h', height: 28, status: 'healthy', value: '100%' },
      { hour: '10h', height: 28, status: 'healthy', value: '100%' },
      { hour: '9h', height: 28, status: 'healthy', value: '100%' },
      { hour: '8h', height: 20, status: 'warning', value: '96.8%' },
      { hour: '7h', height: 20, status: 'warning', value: '97.1%' },
      { hour: '6h', height: 28, status: 'healthy', value: '100%' },
      { hour: '5h', height: 28, status: 'healthy', value: '100%' },
      { hour: '4h', height: 28, status: 'healthy', value: '100%' },
      { hour: '3h', height: 28, status: 'healthy', value: '100%' },
      { hour: '2h', height: 28, status: 'healthy', value: '100%' },
      { hour: 'Now', height: 28, status: 'healthy', value: '100%' },
    ],
  },

  connectedPipelines: [
    {
      id: 'pipe_01',
      name: 'Customer Sync',
      status: 'Running',
      statusType: 'running',
      schedule: 'Hourly',
      lastRun: '5 min ago',
      health: 'Healthy',
      recordsProcessed: '1.2M records/day',
    },
    {
      id: 'pipe_02',
      name: 'Orders ETL',
      status: 'Completed',
      statusType: 'completed',
      schedule: 'Daily at 02:00 UTC',
      lastRun: '2 hrs ago',
      health: 'Healthy',
      recordsProcessed: '450K records/day',
    },
    {
      id: 'pipe_03',
      name: 'Inventory Sync',
      status: 'Warning',
      statusType: 'warning',
      schedule: 'Every 30 min',
      lastRun: '12 min ago',
      health: 'Delayed (3 min latency)',
      recordsProcessed: '89K records/day',
    },
  ],

  advanced: {
    poolSize: 20,
    statementTimeout: 300,
    queryTag: 'connectiq-etl-prod',
    autoResumeWarehouse: true,
    clientSessionKeepAlive: true,
    maxConcurrentQueries: 8,
  },

  summary: {
    connectionStatus: 'Connected',
    validationStatus: '1 Warning',
    healthScore: '99.8%',
    lastCheck: '14:02:17',
    connectedPipelinesCount: '3 active',
    authMethod: 'Username & Password',
    environment: 'Production',
    configVersion: 'v1.0.0',
    requiredFieldsCount: '6 / 7',
    recentActivity: [
      { id: 'act_1', time: '14:02:17', text: 'Connection test passed successfully', author: 'System' },
      { id: 'act_2', time: '13:48:01', text: 'Config updated by Priya S.', author: 'Priya S.' },
      { id: 'act_3', time: '12:00:00', text: 'Scheduled warehouse sync completed', author: 'ETL Pipeline' },
      { id: 'act_4', time: 'Yesterday', text: 'Password rotated by Security Policy', author: 'Vault Service' },
    ],
  },
};

/**
 * Fetches destination configuration by ID.
 */
export async function getDestinationConfiguration(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/config`;
  try {
    const res = await apiFetch(url);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await readJson(res);
      if (data && typeof data === 'object') {
        return {
          ...DEFAULT_DESTINATION_CONFIG,
          ...data,
          mocked: false,
        };
      }
    }
  } catch (err) {
    console.debug('[DestinationConfig] Real endpoint fallback:', err?.message);
  }

  // Simulated latency
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    ...DEFAULT_DESTINATION_CONFIG,
    id: destinationId,
    mocked: true,
  };
}

/**
 * Updates destination configuration by ID.
 */
export async function updateDestinationConfiguration(orgId = ORG_ID, destinationId = 'dest_sf_prod_01', payload = {}) {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/config`;
  try {
    const res = await apiFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await readJson(res);
      return {
        ...data,
        mocked: false,
      };
    }
  } catch (err) {
    console.debug('[DestinationConfig] Update endpoint fallback:', err?.message);
  }

  // Simulated latency
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    id: destinationId,
    status: 'SAVED',
    savedAt: new Date().toISOString(),
    payload,
    mocked: true,
  };
}

/**
 * Triggers a quick connection test for this destination.
 */
export async function testDestinationConnectionQuick(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/test-quick`;
  try {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await readJson(res);
      return {
        ...data,
        mocked: false,
      };
    }
  } catch (err) {
    console.debug('[DestinationConfig] Quick test fallback:', err?.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    status: 'Connected',
    responseTimeMs: 342,
    testedAt: new Date().toLocaleTimeString(),
    serverVersion: 'Snowflake 7.32.1',
    mocked: true,
  };
}

/**
 * Rotates credentials for this destination.
 */
export async function rotateDestinationCredentials(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  const url = `/organizations/${encodeURIComponent(orgId)}/destinations/${encodeURIComponent(destinationId)}/rotate-credentials`;
  try {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await readJson(res);
      return {
        ...data,
        mocked: false,
      };
    }
  } catch (err) {
    console.debug('[DestinationConfig] Credential rotation fallback:', err?.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    lastRotated: 'Just now',
    rotatedBy: 'Priya S.',
    mocked: true,
  };
}
