/**
 * API service and mock contracts for Destination Health Screen (SCR-061).
 * Figma Node: 131:105 (Page 1 -> Destination Health Screen).
 *
 * MOCK BOUNDARY:
 * MOD-007 (Destinations) backend is still PLANNED.
 * `getDestinationHealth` attempts real org-scoped endpoint first:
 * `/organizations/${orgId}/destinations/${destinationId}/health`
 * with a content-type JSON guard defending against SPA fallback HTML.
 * On failure or unreachable backend, it falls back to design-accurate simulated health telemetry.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DestinationHealthError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'DestinationHealthError';
    this.status = status;
    this.details = details;
  }
}

export const ORG_ID = 'current';

export const HEALTH_STATUS_OPTIONS = ['All', 'Healthy', 'Warning', 'Critical'];

export const DEFAULT_DESTINATION_HEALTH_DATA = {
  id: 'dest_sf_prod_01',
  name: 'Snowflake Production',
  type: 'Snowflake',
  environment: 'Production',
  status: 'Healthy',
  statusLabel: 'Healthy',
  healthScore: 98,
  lastHealthCheck: '2 min ago',
  lastSuccessfulConnection: '4 min ago',
  monitoringInterval: '5 minutes',
  lastUpdated: '14:31:02 UTC',
  lastUpdatedRelative: '2 min ago',
  availability30d: '99.98%',
  activeAlertsCount: 0,
  activeAlertsSubtext: 'Active Alerts no issues',
  lastIncident: '12 days ago',
  lastIncidentDate: 'Aug 22, 2026',
  currentStatusDetail: 'all checks passed',
  mocked: true,

  kpiMetrics: {
    availability: {
      label: 'Availability',
      value: '99.98%',
      trend: '+0.01%',
      direction: 'up',
      period: 'Last 30 days',
      status: 'healthy',
      sparkline: [99.85, 99.88, 99.91, 99.94, 99.96, 99.97, 99.98],
    },
    avgResponseTime: {
      label: 'Avg Response Time',
      value: '142ms',
      trend: '-8ms',
      direction: 'down',
      period: 'vs. yesterday',
      status: 'healthy',
      sparkline: [158, 154, 150, 148, 145, 143, 142],
    },
    successfulConnections: {
      label: 'Successful Connections',
      value: '1,284',
      trend: '+12',
      direction: 'up',
      period: 'Last 24h',
      status: 'healthy',
      sparkline: [1180, 1205, 1224, 1245, 1260, 1272, 1284],
    },
    failedConnections: {
      label: 'Failed Connections',
      value: '3',
      trend: '-1',
      direction: 'down',
      period: 'Last 24h',
      status: 'warning',
      sparkline: [6, 5, 5, 4, 4, 3, 3],
    },
    authStatus: {
      label: 'Auth Status',
      value: 'Valid',
      subtext: 'Expires in 47d',
      detail: 'OAuth token active',
      status: 'healthy',
    },
    writeSuccessRate: {
      label: 'Write Success Rate',
      value: '99.77%',
      trend: '+0.02%',
      direction: 'up',
      period: 'Last 24h',
      status: 'healthy',
      sparkline: [99.68, 99.7, 99.72, 99.73, 99.75, 99.76, 99.77],
    },
  },

  healthTimeline: [
    {
      id: 'evt-1',
      timestamp: '14:31:02',
      event: 'Health Check Passed',
      status: 'Healthy',
      duration: '210ms',
      initiatedBy: 'System',
    },
    {
      id: 'evt-2',
      timestamp: '14:26:02',
      event: 'Health Check Passed',
      status: 'Healthy',
      duration: '198ms',
      initiatedBy: 'System',
    },
    {
      id: 'evt-3',
      timestamp: '14:21:02',
      event: 'Health Check Passed',
      status: 'Healthy',
      duration: '205ms',
      initiatedBy: 'System',
    },
    {
      id: 'evt-4',
      timestamp: '13:58:14',
      event: 'Connection Success',
      status: 'Healthy',
      duration: '142ms',
      initiatedBy: 'customer_sync_pipeline',
    },
    {
      id: 'evt-5',
      timestamp: '13:47:31',
      event: 'SSL Certificate Verified',
      status: 'Healthy',
      duration: '34ms',
      initiatedBy: 'System',
    },
    {
      id: 'evt-6',
      timestamp: '13:32:09',
      event: 'Connection Success',
      status: 'Healthy',
      duration: '155ms',
      initiatedBy: 'orders_etl_pipeline',
    },
    {
      id: 'evt-7',
      timestamp: '12:15:44',
      event: 'Authentication Refreshed',
      status: 'Healthy',
      duration: '87ms',
      initiatedBy: 'oauth_refresh_service',
    },
    {
      id: 'evt-8',
      timestamp: '11:04:22',
      event: 'Configuration Change',
      status: 'Warning',
      duration: '—',
      initiatedBy: 'priya.s@acme.com',
    },
    {
      id: 'evt-9',
      timestamp: '08:31:00',
      event: 'Timeout Detected',
      status: 'Warning',
      duration: '30s',
      initiatedBy: 'System',
    },
    {
      id: 'evt-10',
      timestamp: '08:32:15',
      event: 'Recovery — Connection Restored',
      status: 'Healthy',
      duration: '—',
      initiatedBy: 'System',
    },
  ],

  performanceOverview: [
    {
      id: 'perf-1',
      label: 'Avg Response Time',
      value: '142ms',
      prev: 'prev 150ms',
      history: [158, 155, 152, 149, 146, 144, 142],
    },
    {
      id: 'perf-2',
      label: 'Peak Response Time',
      value: '310ms',
      prev: 'prev 298ms',
      history: [280, 285, 290, 320, 305, 298, 310],
    },
    {
      id: 'perf-3',
      label: 'DNS Lookup Time',
      value: '12ms',
      prev: 'prev 14ms',
      history: [15, 14, 13, 14, 12, 13, 12],
    },
    {
      id: 'perf-4',
      label: 'TLS Handshake Time',
      value: '34ms',
      prev: 'prev 38ms',
      history: [39, 38, 36, 35, 34, 35, 34],
    },
    {
      id: 'perf-5',
      label: 'Authentication Time',
      value: '87ms',
      prev: 'prev 92ms',
      history: [95, 93, 91, 90, 88, 89, 87],
    },
    {
      id: 'perf-6',
      label: 'Write Latency',
      value: '28ms',
      prev: 'prev 31ms',
      history: [32, 31, 30, 31, 29, 30, 28],
    },
    {
      id: 'perf-7',
      label: 'Health Check Duration',
      value: '210ms',
      prev: 'prev 198ms',
      history: [195, 200, 205, 198, 208, 202, 210],
    },
  ],

  healthChecks: [
    {
      id: 'chk-1',
      name: 'Network Connectivity',
      status: 'Healthy',
      lastExecuted: '2 min ago',
      duration: '12ms',
      result: 'Connection to xy12345.us-east-1.snowflakecomputing.com successful',
      logOutput: '[14:31:02.104 INFO] Resolving hostname xy12345.us-east-1.snowflakecomputing.com...\n[14:31:02.112 INFO] IP address resolved: 52.204.12.89 (Latency: 4.2ms)\n[14:31:02.116 INFO] TCP handshake established on port 443 in 7.8ms.\n[14:31:02.116 SUCCESS] Network connectivity verified healthy.',
    },
    {
      id: 'chk-2',
      name: 'Authentication',
      status: 'Healthy',
      lastExecuted: '2 min ago',
      duration: '87ms',
      result: 'OAuth token valid, expires in 47 days',
      logOutput: '[14:31:02.117 INFO] Checking cached OAuth 2.0 bearer credentials for user ETL_SERVICE_USER...\n[14:31:02.152 INFO] Snowflake OAuth token introspection response: 200 OK (active=true, scope=session:role-any).\n[14:31:02.204 SUCCESS] Authentication credentials valid and active.',
    },
    {
      id: 'chk-3',
      name: 'SSL Certificate',
      status: 'Healthy',
      lastExecuted: '2 min ago',
      duration: '34ms',
      result: 'Certificate valid, expires 2027-02-14',
      logOutput: '[14:31:02.205 INFO] Initiating TLS 1.3 certificate chain inspection...\n[14:31:02.228 INFO] Leaf cert subject: CN=*.snowflakecomputing.com\n[14:31:02.234 INFO] Issuer: DigiCert Global Root G2 (Valid from 2024-02-14 to 2027-02-14)\n[14:31:02.239 SUCCESS] Certificate chain complete and trusted.',
    },
    {
      id: 'chk-4',
      name: 'Destination Reachability',
      status: 'Healthy',
      lastExecuted: '2 min ago',
      duration: '145ms',
      result: 'HTTPS 200 OK from Snowflake endpoint',
      logOutput: '[14:31:02.240 INFO] Sending HTTP GET /session/v1/ping heartbeat...\n[14:31:02.382 INFO] Received HTTP/2 200 OK (content-length: 42, server: SnowflakeCore/1.2).\n[14:31:02.385 SUCCESS] Snowflake API endpoint reachable.',
    },
    {
      id: 'chk-5',
      name: 'Permissions',
      status: 'Healthy',
      lastExecuted: '5 min ago',
      duration: '68ms',
      result: 'ETL_SERVICE_USER has required grants on ANALYTICS_DB',
      logOutput: '[14:26:02.100 INFO] Validating permissions on database ANALYTICS_DB schema PUBLIC...\n[14:26:02.150 INFO] Checking USAGE, CREATE TABLE, INSERT, UPDATE grants on role TRANSFORM_WRITER_ROLE.\n[14:26:02.168 SUCCESS] All required RBAC privileges confirmed active.',
    },
    {
      id: 'chk-6',
      name: 'Schema Validation',
      status: 'Healthy',
      lastExecuted: '5 min ago',
      duration: '112ms',
      result: 'Target schema PUBLIC accessible; 3 target tables verified',
      logOutput: '[14:26:02.170 INFO] Inspecting target information_schema in ANALYTICS_DB.PUBLIC...\n[14:26:02.240 INFO] Target tables found: CUSTOMER_DATA_RAW (14 cols), ORDERS_STREAM (28 cols), INVENTORY_SNAPSHOTS (19 cols).\n[14:26:02.282 SUCCESS] Schema topology verified and compatible with active pipelines.',
    },
    {
      id: 'chk-7',
      name: 'Write Validation',
      status: 'Warning',
      lastExecuted: '5 min ago',
      duration: '198ms',
      result: 'Write test succeeded; minor latency spike detected (310ms peak)',
      logOutput: '[14:26:02.285 INFO] Executing probe insert into _connectiq_health_probe table...\n[14:26:02.420 WARN] Transient queue latency observed in warehouse COMPUTE_WH (peak write 310ms vs 140ms avg).\n[14:26:02.483 SUCCESS] Write succeeded, row committed and verified.',
    },
    {
      id: 'chk-8',
      name: 'Storage Availability',
      status: 'Healthy',
      lastExecuted: '10 min ago',
      duration: '55ms',
      result: 'Warehouse COMPUTE_WH active, storage 62% utilized',
      logOutput: '[14:21:02.110 INFO] Querying storage metrics and warehouse cluster state...\n[14:21:02.155 INFO] Warehouse state: STARTED (size: MEDIUM, 4 active clusters, storage quota: 62% of 5TB used).\n[14:21:02.165 SUCCESS] Sufficient storage and compute headroom available.',
    },
  ],

  connectionHistory: [
    {
      id: 'conn-1',
      time: '14:28:41',
      result: 'Healthy',
      responseTime: '138ms',
      userProcess: 'orders_etl_pipeline',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-2',
      time: '14:15:22',
      result: 'Healthy',
      responseTime: '144ms',
      userProcess: 'customer_sync_pipeline',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-3',
      time: '14:02:10',
      result: 'Healthy',
      responseTime: '152ms',
      userProcess: 'inventory_sync',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-4',
      time: '13:58:14',
      result: 'Healthy',
      responseTime: '142ms',
      userProcess: 'customer_sync_pipeline',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-5',
      time: '13:47:00',
      result: 'Healthy',
      responseTime: '156ms',
      userProcess: 'priya.s@acme.com',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-6',
      time: '13:32:09',
      result: 'Healthy',
      responseTime: '155ms',
      userProcess: 'orders_etl_pipeline',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-7',
      time: '13:20:05',
      result: 'Warning',
      responseTime: '310ms',
      userProcess: 'inventory_sync',
      authentication: 'OAuth',
      environment: 'Production',
    },
    {
      id: 'conn-8',
      time: '13:10:18',
      result: 'Healthy',
      responseTime: '140ms',
      userProcess: 'customer_sync_pipeline',
      authentication: 'OAuth',
      environment: 'Production',
    },
  ],

  alerts: [
    {
      id: 'alt-1',
      severity: 'Warning',
      title: 'Elevated Write Latency',
      timestamp: '— 13:20:05 UTC',
      description: 'Write latency peaked at 310ms at 13:20 UTC, exceeding the 250ms threshold. Monitoring for recurrence.',
      suggestion: 'Suggested: Monitor. Consider reducing batch size if sustained.',
      status: 'Active',
      detailsText: 'Target table: staging.orders_stream. Latency anomaly resolved after 1m 15s.',
      logs: '[13:20:05.112 WARN] Batch commit time 310ms exceeded alarm threshold 250ms.\n[13:20:06.002 INFO] Cluster auto-scaling evaluation initiated.\n[13:21:20.400 INFO] Latency returned to baseline (142ms).',
    },
    {
      id: 'alt-2',
      severity: 'Information',
      title: 'SSL Certificate Renewal Recommended',
      timestamp: '— Aug 1, 2026',
      description: 'SSL certificate expires in 166 days (2027-02-14). Schedule renewal within the next 30 days.',
      suggestion: 'Suggested: Renew certificate before 2027-01-14.',
      status: 'Acknowledged',
      detailsText: 'Issuer: DigiCert Global Root G2. Serial: 08:3b:4e:22:1a:90. SAN: *.snowflakecomputing.com.',
      logs: '[2026-08-01 00:00:00 INFO] Automated certificate validity audit passed.\n[2026-08-01 00:00:01 INFO] Scheduled advisory notice generated for 180-day window.',
    },
  ],

  connectedPipelines: [
    {
      id: 'pipe-1',
      name: 'Customer Sync',
      status: 'Healthy',
      lastExecution: '5 min ago',
      currentImpact: 'None',
      pipelineId: 'pipe_cust_01',
    },
    {
      id: 'pipe-2',
      name: 'Orders ETL',
      status: 'Healthy',
      lastExecution: '2 hrs ago',
      currentImpact: 'None',
      pipelineId: 'pipe_orders_02',
    },
    {
      id: 'pipe-3',
      name: 'Inventory Sync',
      status: 'Warning',
      lastExecution: '15 min ago',
      currentImpact: 'Minor — latency delay',
      pipelineId: 'pipe_inv_03',
    },
    {
      id: 'pipe-4',
      name: 'Product Catalog Sync',
      status: 'Healthy',
      lastExecution: '1 hr ago',
      currentImpact: 'None',
      pipelineId: 'pipe_prod_04',
    },
  ],

  diagnostics: {
    hostEndpoint: 'xy12345.us-east-1.snowflakecomputing.com:443',
    database: 'ANALYTICS_DB',
    schema: 'PUBLIC',
    warehouse: 'COMPUTE_WH (Size: Medium, 4 Clusters)',
    tlsVersion: 'TLS 1.3',
    cipherSuite: 'TLS_AES_256_GCM_SHA384',
    connectionPool: 'Active: 8 / Max: 32 / Idle: 4',
    keepAlive: 'Enabled (60s probe interval)',
    statementTimeout: '300 seconds (Default)',
    maxBatchSize: '50,000 records (100 MB max payload)',
    retryPolicy: 'Exponential Backoff (Max 5 attempts, 1000ms base)',
    driverVersion: 'Snowflake JDBC Driver v3.14.2 (Secure Auth)',
  },

  recommendations: [
    {
      id: 'rec-1',
      priority: 'Low',
      priorityTone: 'info',
      title: 'Renew SSL Certificate',
      description: 'SSL certificate expires in 166 days. Schedule renewal to avoid service interruption.',
      buttonLabel: 'Schedule renewal',
      category: 'SSL Certificate Management',
    },
    {
      id: 'rec-2',
      priority: 'Low',
      priorityTone: 'info',
      title: 'Investigate Peak Write Latency',
      description: 'Write latency spiked to 310ms. Review warehouse size or batch configuration.',
      buttonLabel: 'Review configuration',
      category: 'Performance Tuning Guide',
    },
    {
      id: 'rec-3',
      priority: 'Info',
      priorityTone: 'neutral',
      title: 'Rotate Authentication Credentials',
      description: 'Credentials last rotated 90 days ago. Recommended rotation interval is 90 days.',
      buttonLabel: 'Rotate credentials',
      category: 'Credential Rotation',
    },
  ],
};

/**
 * Fetch destination health monitoring data for a specific destination.
 */
export async function getDestinationHealth(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  try {
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/health`);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return {
        ...DEFAULT_DESTINATION_HEALTH_DATA,
        id: destinationId,
        mocked: true,
      };
    }
    const data = await readJson(res);
    return {
      ...DEFAULT_DESTINATION_HEALTH_DATA,
      ...data,
      kpiMetrics: {
        ...DEFAULT_DESTINATION_HEALTH_DATA.kpiMetrics,
        ...(data?.kpiMetrics || {}),
      },
      diagnostics: {
        ...DEFAULT_DESTINATION_HEALTH_DATA.diagnostics,
        ...(data?.diagnostics || {}),
      },
      healthTimeline: Array.isArray(data?.healthTimeline)
        ? data.healthTimeline
        : DEFAULT_DESTINATION_HEALTH_DATA.healthTimeline,
      performanceOverview: Array.isArray(data?.performanceOverview)
        ? data.performanceOverview
        : DEFAULT_DESTINATION_HEALTH_DATA.performanceOverview,
      healthChecks: Array.isArray(data?.healthChecks)
        ? data.healthChecks
        : DEFAULT_DESTINATION_HEALTH_DATA.healthChecks,
      connectionHistory: Array.isArray(data?.connectionHistory)
        ? data.connectionHistory
        : DEFAULT_DESTINATION_HEALTH_DATA.connectionHistory,
      alerts: Array.isArray(data?.alerts) ? data.alerts : DEFAULT_DESTINATION_HEALTH_DATA.alerts,
      connectedPipelines: Array.isArray(data?.connectedPipelines)
        ? data.connectedPipelines
        : DEFAULT_DESTINATION_HEALTH_DATA.connectedPipelines,
      recommendations: Array.isArray(data?.recommendations)
        ? data.recommendations
        : DEFAULT_DESTINATION_HEALTH_DATA.recommendations,
      mocked: false,
    };
  } catch (err) {
    if (err instanceof DestinationHealthError) {
      throw err;
    }
    return {
      ...DEFAULT_DESTINATION_HEALTH_DATA,
      id: destinationId,
      mocked: true,
    };
  }
}

/**
 * Trigger an execution of a single health check.
 */
export async function runDestinationHealthCheck(orgId = ORG_ID, destinationId = 'dest_sf_prod_01', checkId = 'chk-1') {
  try {
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/health/checks/${checkId}/run`, {
      method: 'POST',
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await readJson(res);
    }
  } catch {
    // fall through to mock simulation
  }

  // Simulated check run
  await new Promise((r) => setTimeout(r, 600));
  return {
    success: true,
    checkId,
    status: 'Healthy',
    lastExecuted: 'Just now',
    duration: `${Math.floor(Math.random() * 80 + 20)}ms`,
    result: 'Check executed successfully. Destination responded with healthy telemetry.',
    mocked: true,
  };
}

/**
 * Trigger an execution of all health checks in batch.
 */
export async function runAllDestinationHealthChecks(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  try {
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/health/checks/run-all`, {
      method: 'POST',
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await readJson(res);
    }
  } catch {
    // fall through to mock simulation
  }

  await new Promise((r) => setTimeout(r, 1000));
  return {
    success: true,
    executedCount: 8,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    mocked: true,
  };
}

/**
 * Acknowledge an active alert.
 */
export async function acknowledgeDestinationAlert(orgId = ORG_ID, destinationId = 'dest_sf_prod_01', alertId = 'alt-1') {
  try {
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/health/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await readJson(res);
    }
  } catch {
    // fall through to mock simulation
  }

  await new Promise((r) => setTimeout(r, 300));
  return {
    success: true,
    alertId,
    status: 'Acknowledged',
    mocked: true,
  };
}

/**
 * Run a full live test of destination connectivity.
 */
export async function testDestinationConnectivity(orgId = ORG_ID, destinationId = 'dest_sf_prod_01') {
  try {
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/health/test`, {
      method: 'POST',
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await readJson(res);
    }
  } catch {
    // fall through to mock simulation
  }

  await new Promise((r) => setTimeout(r, 800));
  return {
    success: true,
    status: 'Healthy',
    latency: '142ms',
    message: 'Destination endpoint reachable and credentials validated.',
    mocked: true,
  };
}
