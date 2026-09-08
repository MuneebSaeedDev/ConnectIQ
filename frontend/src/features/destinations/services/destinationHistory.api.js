/**
 * API service and mock contracts for Destination History Screen (SCR-062).
 * Figma Node: 133:2160 (Page 1 -> Destination History Screen).
 *
 * MOCK BOUNDARY:
 * MOD-007 (Destinations) backend is still PLANNED.
 * `getDestinationHistory` attempts real org-scoped endpoint first:
 * `/organizations/${orgId}/destinations/${destinationId}/history`
 * with a content-type JSON guard defending against SPA fallback HTML.
 * On failure or unreachable backend, it falls back to design-accurate simulated history records.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DestinationHistoryError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'DestinationHistoryError';
    this.status = status;
    this.details = details;
  }
}

export const ORG_ID = 'current';

export const EVENT_CATEGORIES = [
  'All Categories',
  'Sync & Streams',
  'Authentication',
  'Configuration',
  'Performance',
  'Health',
  'Storage',
  'Maintenance',
];

export const SEVERITIES = ['All Severity', 'Critical', 'High', 'Medium', 'Low', 'Info'];

export const STATUSES = ['All Statuses', 'Success', 'Failed', 'Warning', 'Running', 'Skipped'];

export const ENVIRONMENTS = ['All Environments', 'Production', 'Staging', 'Development', 'Disaster Recovery'];

export const DESTINATION_OPTIONS = [
  { id: 'all', name: 'All Destinations' },
  { id: 'dest-snowflake-01', name: 'Snowflake Production (dest-snowflake-01)', type: 'Snowflake' },
  { id: 'dest-kafka-prod', name: 'Kafka Event Bus (dest-kafka-prod)', type: 'Kafka' },
  { id: 's3-analytics-bucket', name: 'S3 Raw Lake (s3-analytics-bucket)', type: 'S3' },
  { id: 'bigquery-reporting', name: 'BigQuery Analytics (bigquery-reporting)', type: 'BigQuery' },
  { id: 'postgres-archive', name: 'PostgreSQL Archive (postgres-archive)', type: 'PostgreSQL' },
  { id: 'redshift-dw', name: 'Redshift Cluster (redshift-dw)', type: 'Redshift' },
];

export const DEFAULT_DESTINATION_HISTORY_DATA = {
  destinationId: 'dest-snowflake-01',
  destinationName: 'Snowflake Production',
  totalRecords: 48291,
  lastUpdated: '2026-08-05 14:22:07',
  timeframe: '2026-07-01 to 2026-08-05',

  kpis: {
    totalEvents: { value: 48291, change: '+12.4%', trend: 'up', period: 'All time' },
    successfulSyncs: { value: 41803, change: '+8.1%', trend: 'up', period: 'Last 30 days' },
    failedSyncs: { value: 2147, change: '-3.2%', trend: 'down', period: 'Last 30 days' },
    configChanges: { value: 831, change: '+2.7%', trend: 'up', period: 'Last 30 days' },
    connectionFailures: { value: 319, change: '-18%', trend: 'down', period: 'Last 30 days' },
    recoveryEvents: { value: 287, change: '+5.9%', trend: 'up', period: 'Last 30 days' },
    avgDailyEvents: { value: 1609, change: '+0.3%', trend: 'neutral', period: '30-day avg' },
    archivedRecords: { value: 12440, change: '12,440', trend: 'neutral', period: 'Total archived' },
  },

  analytics: {
    eventsOverTime: {
      peakDay: '2,341',
      avgPerDay: '1,609',
      successRate: '95.1%',
      failureRate: '4.9%',
      timeRange: '30D',
      data: [
        { date: 'Jul 07', events: 1420, success: 1350, failure: 70 },
        { date: 'Jul 09', events: 1580, success: 1500, failure: 80 },
        { date: 'Jul 11', events: 1820, success: 1740, failure: 80 },
        { date: 'Jul 13', events: 1640, success: 1560, failure: 80 },
        { date: 'Jul 15', events: 1910, success: 1830, failure: 80 },
        { date: 'Jul 17', events: 2150, success: 2040, failure: 110 },
        { date: 'Jul 19', events: 1790, success: 1710, failure: 80 },
        { date: 'Jul 21', events: 1950, success: 1860, failure: 90 },
        { date: 'Jul 22', events: 2341, success: 2210, failure: 131 },
        { date: 'Jul 24', events: 1880, success: 1790, failure: 90 },
        { date: 'Jul 26', events: 1720, success: 1640, failure: 80 },
        { date: 'Jul 28', events: 2040, success: 1950, failure: 90 },
        { date: 'Jul 30', events: 1890, success: 1800, failure: 90 },
        { date: 'Aug 01', events: 2110, success: 2000, failure: 110 },
        { date: 'Aug 03', events: 1980, success: 1890, failure: 90 },
        { date: 'Aug 05', events: 1609, success: 1530, failure: 79 },
      ],
    },
    eventDistribution: [
      { category: 'Sync & Streams', count: 28410, percentage: 59, color: 'bg-primary' },
      { category: 'Authentication', count: 9218, percentage: 19, color: 'bg-indigo-500' },
      { category: 'Configuration', count: 5312, percentage: 11, color: 'bg-sky-500' },
      { category: 'Performance', count: 2890, percentage: 6, color: 'bg-warning' },
      { category: 'Health', count: 1634, percentage: 3, color: 'bg-success' },
      { category: 'Storage', count: 827, percentage: 2, color: 'bg-danger' },
    ],
    failureTrend: {
      monthlyChange: '↓ 18% this month',
      syncFailures: 1847,
      connectionFailures: 319,
      authFailures: 124,
      sslIssues: 287,
      dailyTrend: [
        { date: 'Jul 07', count: 18 },
        { date: 'Jul 10', count: 24 },
        { date: 'Jul 13', count: 15 },
        { date: 'Jul 16', count: 32 },
        { date: 'Jul 19', count: 19 },
        { date: 'Jul 22', count: 45 },
        { date: 'Jul 25', count: 22 },
        { date: 'Jul 28', count: 17 },
        { date: 'Jul 31', count: 28 },
        { date: 'Aug 03', count: 14 },
        { date: 'Aug 05', count: 11 },
      ],
    },
  },

  recentCriticalEvents: [
    {
      id: 'EVT-CRIT-001',
      severity: 'Critical',
      event: 'Connection Lost',
      destination: 'dest-snowflake-01',
      timestamp: '2026-08-05 14:18:02',
      impact: 'All pipelines using this destination are halted',
      remediationAction: 'Investigate network connectivity',
      category: 'Connection',
    },
    {
      id: 'EVT-CRIT-002',
      severity: 'High',
      event: 'Authentication Failed',
      destination: 'dest-kafka-prod',
      timestamp: '2026-08-05 13:44:55',
      impact: 'Credential rotation may have missed this destination',
      remediationAction: 'Rotate API key and verify access',
      category: 'Auth',
    },
    {
      id: 'EVT-CRIT-003',
      severity: 'High',
      event: 'Storage Threshold Reached',
      destination: 's3-analytics-bucket',
      timestamp: '2026-08-05 12:30:11',
      impact: 'Bucket at 94% capacity — writes may fail soon',
      remediationAction: 'Expand bucket or archive data',
      category: 'Storage',
    },
    {
      id: 'EVT-CRIT-004',
      severity: 'Medium',
      event: 'Sync Failed (Retry #3)',
      destination: 'bigquery-reporting',
      timestamp: '2026-08-05 11:02:38',
      impact: '24,800 records undelivered in last 3 retries',
      remediationAction: 'Review query limits and schema drift',
      category: 'Sync',
    },
    {
      id: 'EVT-CRIT-005',
      severity: 'Medium',
      event: 'High Latency Detected',
      destination: 'kafka-events-prod',
      timestamp: '2026-08-05 09:15:22',
      impact: 'Avg latency 4.2s — SLA threshold is 1.5s',
      remediationAction: 'Check consumer lag and broker load',
      category: 'Performance',
    },
    {
      id: 'EVT-CRIT-006',
      severity: 'Low',
      event: 'SSL Certificate Updated',
      destination: 'postgres-restore',
      timestamp: '2026-08-04 23:57:10',
      impact: 'Certificate rotated via automation — verify chain',
      remediationAction: 'Confirm handshake on next sync',
      category: 'Config',
    },
  ],

  activityTimeline: [
    {
      date: 'Aug 05, 2026',
      eventCount: 17,
      events: [
        {
          id: 'EVT-TL-001',
          time: '14:18',
          severity: 'Critical',
          category: 'Connection',
          title: 'Connection Lost',
          target: 'dest-snowflake-01',
          description: 'TCP connection refused on port 5439. All dependent pipelines suspended.',
          actor: 'System Monitor',
        },
        {
          id: 'EVT-TL-002',
          time: '13:44',
          severity: 'High',
          category: 'Auth',
          title: 'Authentication Failed',
          target: 'dest-kafka-prod',
          description: 'Bearer token rejected — credential may be expired or rotated.',
          actor: 'Kafka Agent',
        },
        {
          id: 'EVT-TL-003',
          time: '13:01',
          severity: 'Info',
          category: 'Sync',
          title: 'Synchronization Completed',
          target: 'bigquery-reporting',
          description: 'Completed successfully. 481,200 records written in 2m 34s.',
          actor: 'Sync Service v2',
        },
        {
          id: 'EVT-TL-004',
          time: '12:30',
          severity: 'High',
          category: 'Storage',
          title: 'Storage Threshold Reached',
          target: 's3-analytics-bucket',
          description: 'Bucket utilization at 94.3%. Threshold configured at 90%.',
          actor: 'Storage Monitor',
        },
        {
          id: 'EVT-TL-005',
          time: '11:45',
          severity: 'Info',
          category: 'Sync',
          title: 'Synchronization Started',
          target: 'kafka-events-prod',
          description: 'Pipeline initiated real-time sync to Kafka cluster.',
          actor: 'Scheduler Agent',
        },
        {
          id: 'EVT-TL-006',
          time: '10:12',
          severity: 'Low',
          category: 'Config',
          title: 'SSL Certificate Update',
          target: 'postgres-restore',
          description: 'Certificate auto-rotated. New expiry: 2027-08-05.',
          actor: 'Cert Automation',
        },
        {
          id: 'EVT-TL-007',
          time: '09:15',
          severity: 'Medium',
          category: 'Performance',
          title: 'High Latency Detected',
          target: 'kafka-events-prod',
          description: 'P95 latency exceeded 4.2s. SLA threshold: 1.5s.',
          actor: 'APM Monitor',
        },
        {
          id: 'EVT-TL-008',
          time: '08:00',
          severity: 'Info',
          category: 'Maintenance',
          title: 'Maintenance Completed',
          target: 'snowflake-analytics',
          description: 'Scheduled maintenance window closed. Destination re-enabled.',
          actor: 'DataOps Team',
        },
      ],
    },
    {
      date: 'Aug 04, 2026',
      eventCount: 32,
      events: [
        {
          id: 'EVT-TL-009',
          time: '23:57',
          severity: 'Low',
          category: 'Config',
          title: 'SSL Certificate Auto-Rotated',
          target: 'postgres-restore',
          description: 'Certificate renewed successfully with Let’s Encrypt CA.',
          actor: 'Security Daemon',
        },
        {
          id: 'EVT-TL-010',
          time: '20:15',
          severity: 'Info',
          category: 'Sync',
          title: 'Batch Sync Complete',
          target: 'dest-snowflake-01',
          description: '1.24M rows ingested into analytics.raw_events.',
          actor: 'Pipeline Runner',
        },
      ],
    },
    {
      date: 'Aug 03, 2026',
      eventCount: 29,
      events: [
        {
          id: 'EVT-TL-011',
          time: '16:40',
          severity: 'Medium',
          category: 'Performance',
          title: 'Throughput Drop Alert',
          target: 'bigquery-reporting',
          description: 'Ingestion rate dipped below 5k rec/sec during peak traffic.',
          actor: 'Health Sentinel',
        },
      ],
    },
  ],

  historyRecords: [
    {
      id: 'EVT-2026-081422-0041',
      timestamp: '2026-08-05 14:18:02',
      destination: 'dest-snowflake-01',
      event: 'Connection Lost',
      category: 'Connection',
      status: 'Failed',
      severity: 'Critical',
      userOrSystem: 'System Monitor',
      pipeline: 'pipe-sales-hourly',
      duration: '12.4s',
      records: '0',
      errorCode: 'ERR_CONN_TIMEOUT',
      sourceIp: '10.0.1.42',
      org: 'Sales Corp',
      region: 'us-east-1',
      description: 'TCP connection refused on port 5439. All dependent pipelines suspended.',
      correlationId: 'EXEC-8821-A',
      sessionId: 'sess-8821',
      tenant: 'enterprise-tier',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0040',
      timestamp: '2026-08-05 13:44:55',
      destination: 'dest-kafka-prod',
      event: 'Auth Failed',
      category: 'Auth',
      status: 'Failed',
      severity: 'High',
      userOrSystem: 'Kafka Daemon',
      pipeline: 'pipe-events-stream',
      duration: '450ms',
      records: '0',
      errorCode: 'ERR_AUTH_EXPIRED',
      sourceIp: '10.0.2.15',
      org: 'FinTech Hub',
      region: 'us-east-2',
      description: 'Bearer token rejected — credential may be expired or rotated.',
      correlationId: 'EXEC-8820-B',
      sessionId: 'sess-8820',
      tenant: 'fintech-core',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0039',
      timestamp: '2026-08-05 13:01:14',
      destination: 'bigquery-reporting',
      event: 'Sync Finished',
      category: 'Sync',
      status: 'Success',
      severity: 'Info',
      userOrSystem: 'Scheduler Svc',
      pipeline: 'pipe-analytics-daily',
      duration: '2m 34s',
      records: '481,200',
      errorCode: '—',
      sourceIp: '10.0.1.18',
      org: 'Analytics Team',
      region: 'us-central1',
      description: 'Completed successfully. 481,200 records written in 2m 34s.',
      correlationId: 'EXEC-8819-C',
      sessionId: 'sess-8819',
      tenant: 'analytics-prod',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0038',
      timestamp: '2026-08-05 12:30:11',
      destination: 's3-analytics-bucket',
      event: 'Storage Threshold',
      category: 'Storage',
      status: 'Warning',
      severity: 'High',
      userOrSystem: 'Storage Monitor',
      pipeline: 'pipe-lake-raw',
      duration: '1.2s',
      records: '—',
      errorCode: 'WARN_STORAGE_94PCT',
      sourceIp: '10.0.3.90',
      org: 'Data Platform',
      region: 'us-west-2',
      description: 'Bucket utilization at 94.3%. Threshold configured at 90%.',
      correlationId: 'EXEC-8818-D',
      sessionId: 'sess-8818',
      tenant: 'lake-storage',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0037',
      timestamp: '2026-08-05 11:45:00',
      destination: 'kafka-events-prod',
      event: 'Sync Started',
      category: 'Sync',
      status: 'Running',
      severity: 'Info',
      userOrSystem: 'Stream Manager',
      pipeline: 'pipe-stream-cdc',
      duration: '14m 22s',
      records: '128,400',
      errorCode: '—',
      sourceIp: '10.0.2.11',
      org: 'Streaming Team',
      region: 'us-east-1',
      description: 'Pipeline initiated real-time sync to Kafka cluster.',
      correlationId: 'EXEC-8817-E',
      sessionId: 'sess-8817',
      tenant: 'realtime-stream',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0036',
      timestamp: '2026-08-05 11:02:38',
      destination: 'bigquery-reporting',
      event: 'Sync Failed',
      category: 'Sync',
      status: 'Failed',
      severity: 'Medium',
      userOrSystem: 'Retry Engine',
      pipeline: 'pipe-bi-metrics',
      duration: '35.4s',
      records: '0',
      errorCode: 'ERR_SCHEMA_MISMATCH',
      sourceIp: '10.0.1.24',
      org: 'BI Corp',
      region: 'us-central1',
      description: '24,800 records undelivered in last 3 retries due to schema drift.',
      correlationId: 'EXEC-8816-F',
      sessionId: 'sess-8816',
      tenant: 'bi-reporting',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0035',
      timestamp: '2026-08-05 10:12:00',
      destination: 'postgres-restore',
      event: 'SSL Cert Updated',
      category: 'Config',
      status: 'Success',
      severity: 'Low',
      userOrSystem: 'Cert Automation',
      pipeline: '—',
      duration: '2.5s',
      records: '—',
      errorCode: '—',
      sourceIp: '10.0.4.5',
      org: 'Core Infrastructure',
      region: 'eu-west-1',
      description: 'Certificate auto-rotated. New expiry: 2027-08-05.',
      correlationId: 'EXEC-8815-G',
      sessionId: 'sess-8815',
      tenant: 'core-infra',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0034',
      timestamp: '2026-08-05 09:15:22',
      destination: 'kafka-events-prod',
      event: 'High Latency',
      category: 'Performance',
      status: 'Warning',
      severity: 'Medium',
      userOrSystem: 'APM Monitor',
      pipeline: 'pipe-telemetry',
      duration: '—',
      records: '—',
      errorCode: 'WARN_HIGH_LATENCY',
      sourceIp: '10.0.2.14',
      org: 'Telemetry Svc',
      region: 'us-east-1',
      description: 'P95 latency exceeded 4.2s. SLA threshold: 1.5s.',
      correlationId: 'EXEC-8814-H',
      sessionId: 'sess-8814',
      tenant: 'telemetry-prod',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0033',
      timestamp: '2026-08-05 08:00:00',
      destination: 'snowflake-analytics',
      event: 'Maintenance Done',
      category: 'Maintenance',
      status: 'Success',
      severity: 'Info',
      userOrSystem: 'DataOps Admin',
      pipeline: '—',
      duration: '1h 00m',
      records: '—',
      errorCode: '—',
      sourceIp: '192.168.1.10',
      org: 'DataOps Core',
      region: 'us-east-1',
      description: 'Scheduled maintenance window closed. Destination re-enabled.',
      correlationId: 'EXEC-8813-I',
      sessionId: 'sess-8813',
      tenant: 'ops-admin',
      version: 'v2.14.0',
    },
    {
      id: 'EVT-2026-081422-0032',
      timestamp: '2026-08-05 07:30:14',
      destination: 'postgres-archive',
      event: 'Sync Completed',
      category: 'Sync',
      status: 'Success',
      severity: 'Info',
      userOrSystem: 'Archive Svc',
      pipeline: 'pipe-legacy-archive',
      duration: '54.2s',
      records: '2,240,000',
      errorCode: '—',
      sourceIp: '10.0.4.12',
      org: 'Compliance Team',
      region: 'eu-west-1',
      description: 'Partition archive dump successful. 2,240,000 records processed.',
      correlationId: 'EXEC-8812-J',
      sessionId: 'sess-8812',
      tenant: 'compliance-vault',
      version: 'v2.14.0',
    },
  ],

  configHistory: [
    {
      timestamp: '2026-08-05 10:12:00',
      fieldChanged: 'ssl_certificate_secret',
      previousValue: 'vault://cert/2025-v2',
      newValue: 'vault://cert/2026-v1',
      modifiedBy: 'auto-bot',
      approval: 'Auto',
    },
    {
      timestamp: '2026-08-04 18:30:15',
      fieldChanged: 'max_connection_pool',
      previousValue: '50',
      newValue: '100',
      modifiedBy: 'priya-s',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-03 14:22:40',
      fieldChanged: 'timeout_sec',
      previousValue: '3000',
      newValue: '6000',
      modifiedBy: 'alex-k',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-02 09:10:12',
      fieldChanged: 'warehouse_size',
      previousValue: 'Small',
      newValue: 'Large-Compute-X2',
      modifiedBy: 'dave-pipeline',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-01 16:45:00',
      fieldChanged: 'compression_type',
      previousValue: 'NONE',
      newValue: 'GZIP',
      modifiedBy: 'priya-s',
      approval: 'Pending',
    },
  ],

  availabilityHistory: {
    availabilityRate: '98.2%',
    daysSummary: '30-Day Availability',
    totalAttempts: 14201,
    successfulAttempts: 13882,
    failedAttempts: 319,
    authFailures: 124,
    sslIssues: 12,
    totalDowntime: '4h 23m',
    dailyUptime: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      let status = 'healthy';
      let uptime = 100;
      if (day === 8 || day === 22) {
        status = 'degraded';
        uptime = 96.4;
      } else if (day === 29) {
        status = 'down';
        uptime = 91.2;
      }
      return {
        day: `Day ${day}`,
        date: `2026-07-${day < 10 ? '0' + day : day}`,
        status,
        uptime,
      };
    }),
  },

  syncHistory: [
    {
      id: 'SYNC-001',
      started: '14:02:11',
      completed: '14:04:45',
      duration: '2m 34s',
      written: '481,200',
      failed: '0',
      retries: '0',
      throughput: '3,120/s',
      status: 'Success',
    },
    {
      id: 'SYNC-002',
      started: '13:00:00',
      completed: '13:00:15',
      duration: '15s',
      written: '0',
      failed: '24,800',
      retries: '3',
      throughput: '—',
      status: 'Failed',
    },
    {
      id: 'SYNC-003',
      started: '12:00:00',
      completed: '12:08:20',
      duration: '8m 20s',
      written: '920,110',
      failed: '0',
      retries: '1',
      throughput: '1,840/s',
      status: 'Success',
    },
    {
      id: 'SYNC-004',
      started: '11:00:00',
      completed: '11:04:30',
      duration: '4m 30s',
      written: '715,000',
      failed: '42',
      retries: '0',
      throughput: '2,650/s',
      status: 'Warning',
    },
    {
      id: 'SYNC-005',
      started: '10:00:00',
      completed: '10:00:05',
      duration: '5s',
      written: '0',
      failed: '0',
      retries: '0',
      throughput: '—',
      status: 'Skipped',
    },
  ],

  storageHistory: {
    totalCapacity: '10 TB',
    used: '9.43 TB',
    usedPercentage: '94.3%',
    dailyGrowth: '82 GB',
    retentionDays: '90 days',
    alertThreshold: '90%',
    alertTriggeredDate: 'Aug 01',
    monthlyGrowth: [
      { month: 'Feb', percentage: 40, usedGB: 4000 },
      { month: 'Mar', percentage: 52, usedGB: 5200 },
      { month: 'Apr', percentage: 60, usedGB: 6000 },
      { month: 'May', percentage: 68, usedGB: 6800 },
      { month: 'Jun', percentage: 75, usedGB: 7500 },
      { month: 'Jul', percentage: 84, usedGB: 8400 },
      { month: 'Aug', percentage: 94, usedGB: 9430 },
    ],
  },

  auditHistory: [
    {
      timestamp: '2026-08-05 10:12:00',
      user: 'priya-s@enterprise.com',
      role: 'System Admin',
      action: 'UPDATE',
      resource: 'dest_conf // postgres-restore',
      previousState: 'cert-v2',
      newState: 'cert-v3',
      sourceIp: '10.0.4.5',
      session: 'sess-8815',
      approval: 'Auto',
    },
    {
      timestamp: '2026-08-04 18:30:15',
      user: 'j-smith@prod.io',
      role: 'Database Eng',
      action: 'UPDATE',
      resource: 'dest_conn_pool // dest-snowflake-01',
      previousState: '50',
      newState: '100',
      sourceIp: '192.168.1.45',
      session: 'sess-8722',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-03 14:22:40',
      user: 'sec-ops-bot',
      role: 'Security Bot',
      action: 'ROTATE',
      resource: 'dest_auth // kafka-key-secret',
      previousState: 'key-enc-1',
      newState: 'key-enc-2',
      sourceIp: '10.0.2.99',
      session: 'sess-8700',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-02 09:10:12',
      user: 'a-chen',
      role: 'Data Engineer',
      action: 'UPDATE',
      resource: 'dest_wh // snowflake-wh-pricing',
      previousState: 'Small',
      newState: 'Large-X2',
      sourceIp: '192.168.3.12',
      session: 'sess-8650',
      approval: 'Approved',
    },
    {
      timestamp: '2026-08-01 16:45:00',
      user: 'j-smith@prod.io',
      role: 'Database Eng',
      action: 'UPDATE',
      resource: 'dest_comp // s3-analytics-bucket',
      previousState: 'raw-tar',
      newState: 'gzip-v2',
      sourceIp: '192.168.1.45',
      session: 'sess-8580',
      approval: 'Pending',
    },
    {
      timestamp: '2026-07-30 11:20:00',
      user: 'support@vendor.com',
      role: 'Support Read',
      action: 'CREATE',
      resource: 'dest_test // staging-mysql',
      previousState: 'null',
      newState: 'active',
      sourceIp: '10.0.5.1',
      session: 'sess-8490',
      approval: 'Approved',
    },
  ],

  relatedPipelines: [
    {
      id: 'pipe-sales-hourly',
      name: 'pipe-sales-hourly',
      currentStatus: 'Failed',
      lastExecution: '2026-08-05 14:18:02',
      totalRuns: 2894,
      successRate: 97.8,
    },
    {
      id: 'pipe-events-stream',
      name: 'pipe-events-stream',
      currentStatus: 'Running',
      lastExecution: '2026-08-05 13:44:55',
      totalRuns: 890,
      successRate: 94.2,
    },
    {
      id: 'pipe-analytics-daily',
      name: 'pipe-analytics-daily',
      currentStatus: 'Success',
      lastExecution: '2026-08-05 13:01:14',
      totalRuns: 412,
      successRate: 99.5,
    },
    {
      id: 'pipe-lake-raw',
      name: 'pipe-lake-raw',
      currentStatus: 'Warning',
      lastExecution: '2026-08-05 12:30:11',
      totalRuns: 1204,
      successRate: 88.4,
    },
    {
      id: 'pipe-legacy-archive',
      name: 'pipe-legacy-archive',
      currentStatus: 'Success',
      lastExecution: '2026-08-05 07:30:14',
      totalRuns: 754,
      successRate: 99.8,
    },
  ],
};

/**
 * Fetch destination history records with simulated fallback.
 */
export async function getDestinationHistory(orgId = ORG_ID, destinationId = 'dest-snowflake-01', filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.destination) queryParams.set('destination', filters.destination);
    if (filters.type) queryParams.set('type', filters.type);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.severity) queryParams.set('severity', filters.severity);
    if (filters.search) queryParams.set('q', filters.search);
    if (filters.startDate) queryParams.set('startDate', filters.startDate);
    if (filters.endDate) queryParams.set('endDate', filters.endDate);

    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiFetch(`/organizations/${orgId}/destinations/${destinationId}/history${queryStr}`, {
      headers: { Accept: 'application/json' },
    });

    const contentType = res.headers?.get?.('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await readJson(res);
      if (json && typeof json === 'object') {
        return { ...DEFAULT_DESTINATION_HISTORY_DATA, ...json, mocked: false };
      }
    }
    // Fallback to simulated data
    return { ...DEFAULT_DESTINATION_HISTORY_DATA, mocked: true };
  } catch (err) {
    if (err instanceof DestinationHistoryError) throw err;
    return { ...DEFAULT_DESTINATION_HISTORY_DATA, mocked: true };
  }
}

/**
 * Export history records to CSV format.
 */
export function exportHistoryCsv(records) {
  const headers = [
    'Event ID',
    'Timestamp',
    'Destination',
    'Event',
    'Category',
    'Status',
    'Severity',
    'User/System',
    'Pipeline',
    'Duration',
    'Records',
    'Error Code',
    'Source IP',
    'Org',
    'Region',
  ];

  const rows = records.map((r) => [
    r.id,
    `"${r.timestamp}"`,
    `"${r.destination}"`,
    `"${r.event}"`,
    `"${r.category}"`,
    `"${r.status}"`,
    `"${r.severity}"`,
    `"${r.userOrSystem}"`,
    `"${r.pipeline}"`,
    `"${r.duration}"`,
    `"${r.records}"`,
    `"${r.errorCode}"`,
    `"${r.sourceIp}"`,
    `"${r.org}"`,
    `"${r.region}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `destination-history-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
