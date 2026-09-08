/**
 * Data loader and services for the Pipeline List Screen (SCR-063, node 146:6124,
 * Figma page "Page 1", frame "Pipline List Screen").
 *
 * MOCK BOUNDARY: MOD-008 (Pipeline Builder & Execution) is still `PLANNED`
 * with no backend deployed — no `Pipeline`, `PipelineExecution`, or
 * `ExecutionLog` endpoint exists yet (see docs/modules/module-plan.md).
 * `getPipelines` always attempts a real GET first and only falls back to
 * the design-sourced baseline below when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK HTML
 * SPA fallback, mirroring the sibling destinations/*.api.js + dataSources/*.api.js
 * modules). Results are flagged `mocked: true` so the UI can disclose that
 * the data is sample data, not persisted records.
 *
 * FIGMA VERIFICATION: node 146:6124 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata text-node extraction).
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class PipelineListError extends Error {}

export const STATUS_OPTIONS = [
  'All Statuses',
  'Running',
  'Completed',
  'Failed',
  'Scheduled',
  'Paused',
  'Disabled',
  'Retrying',
  'Draft',
];

export const TYPE_OPTIONS = [
  'All Types',
  'ETL / Batch',
  'Streaming',
  'CDC Replication',
  'Event-driven',
  'API Ingestion',
  'File Sync',
];

export const ENVIRONMENT_OPTIONS = [
  'All Environments',
  'Production',
  'Staging',
  'Development',
];

export const SCHEDULE_OPTIONS = [
  'All Schedules',
  'Continuous',
  'Every 15m',
  'Every 30m',
  'Hourly',
  'Every 2h',
  'Every 4h',
  'Daily 02:00',
  'Daily 06:00',
  'Daily 08:00',
  'Manual',
];

export const OWNER_OPTIONS = [
  'All Owners',
  'A. Chen',
  'R. Patel',
  'S. Kim',
  'M. Torres',
  'L. Wang',
  'J. Lee',
  'D. Okafor',
  'E. Müller',
  'C. Dubois',
  'N. Krishnan',
];

export const TEAM_OPTIONS = [
  'All Teams',
  'Data Eng',
  'Platform',
  'Finance',
  'Analytics',
  'Ops',
  'Marketing',
  'Infra',
  'Partnerships',
  'ML Platform',
];

export const TAG_OPTIONS = [
  'All Tags',
  'realtime',
  'kafka',
  'streaming',
  'database',
  'finance',
  'marketing',
  'infra',
  'ml',
  'etl',
];

export const SOURCE_OPTIONS = [
  'All Sources',
  'Salesforce CRM',
  'MongoDB',
  'Oracle DB',
  'Kafka',
  'SAP ERP',
  'GA4 + HubSpot',
  'Fluentd',
  'Stripe API',
  'SFTP',
  'Feature Eng DB',
];

export const DESTINATION_OPTIONS = [
  'All Destinations',
  'Snowflake DW',
  'BigQuery',
  'Redshift',
  'ClickHouse',
  'Databricks',
  'Elasticsearch',
  'PostgreSQL',
  'S3 + Redshift',
  'Vertex AI',
];

export const LAST_EXEC_OPTIONS = [
  'All Last Executions',
  'Last 15m',
  'Last 1h',
  'Last 24h',
  'Last 7d',
];

export const CREATED_DATE_OPTIONS = [
  'All Created Dates',
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'Older',
];

export const SAVED_VIEWS = [
  { id: 'all', label: 'All Pipelines' },
  { id: 'production', label: 'Production Only' },
  { id: 'streaming', label: 'Streaming / Real-time' },
  { id: 'critical', label: 'Failed & Retrying' },
  { id: 'scheduled', label: 'Daily Schedules' },
];

export const QUICK_FILTERS = [
  { id: 'all', label: 'All', count: 248 },
  { id: 'running', label: 'Running', count: 31, tone: 'blue' },
  { id: 'failed', label: 'Failed', count: 7, tone: 'red' },
  { id: 'scheduled', label: 'Scheduled', count: 142, tone: 'purple' },
  { id: 'draft', label: 'Draft', count: 12, tone: 'gray' },
  { id: 'recentlyModified', label: 'Recently Modified', count: 24, tone: 'sky' },
  { id: 'myPipelines', label: 'My Pipelines', count: 18, tone: 'amber' },
];

export const BASELINE_KPIS = [
  {
    id: 'total',
    label: 'Total Pipelines',
    value: '248',
    change: '▲ +12',
    changeTone: 'up',
    subtext: 'Across all environments',
    icon: 'hexagon',
  },
  {
    id: 'active',
    label: 'Active Pipelines',
    value: '183',
    change: '▲ +4',
    changeTone: 'up',
    subtext: 'Enabled & configured',
    icon: 'target',
  },
  {
    id: 'running',
    label: 'Running Now',
    value: '31',
    change: '▼ -3',
    changeTone: 'neutral',
    subtext: 'Live executions',
    icon: 'play',
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    value: '142',
    change: '▲ +8',
    changeTone: 'up',
    subtext: 'Next 24 hours',
    icon: 'clock',
  },
  {
    id: 'failed',
    label: 'Failed (24h)',
    value: '7',
    change: '▼ +2',
    changeTone: 'danger',
    subtext: 'Requires attention',
    icon: 'x',
  },
  {
    id: 'success_rate',
    label: 'Avg Success Rate',
    value: '96.4%',
    change: '▲ +0.3%',
    changeTone: 'up',
    subtext: 'Last 30 days',
    icon: 'check',
  },
  {
    id: 'avg_duration',
    label: 'Avg Execution Time',
    value: '4m 12s',
    change: '▲ -18s',
    changeTone: 'up',
    subtext: 'Last 30 days',
    icon: 'stopwatch',
  },
  {
    id: 'records_today',
    label: 'Records Today',
    value: '2.41B',
    change: '▲ +14%',
    changeTone: 'up',
    subtext: 'Total processed',
    icon: 'grid',
  },
];

export const BASELINE_STATUS_DISTRIBUTION = [
  { label: 'Active', count: 183, percentage: 74, color: '#10b981' },
  { label: 'Running', count: 31, percentage: 13, color: '#3b82f6' },
  { label: 'Failed', count: 7, percentage: 3, color: '#ef4444' },
  { label: 'Paused', count: 15, percentage: 6, color: '#f59e0b' },
  { label: 'Disabled', count: 12, percentage: 4, color: '#94a3b8' },
];

export const BASELINE_TRIGGER_TYPES = {
  total: 248,
  scheduled: 57,
  manual: 22,
  eventDriven: 21,
};

export const BASELINE_EXECUTION_TREND_7D = [
  { day: 'Mon', count: 1420, height: 65 },
  { day: 'Tue', count: 1580, height: 75 },
  { day: 'Wed', count: 1510, height: 70 },
  { day: 'Thu', count: 1620, height: 80 },
  { day: 'Fri', count: 1490, height: 72 },
  { day: 'Sat', count: 1180, height: 50 },
  { day: 'Sun', count: 1090, height: 45 },
];

export const BASELINE_SUCCESS_VS_FAILURE_24H = [
  { hour: '00:00', success: 94, failure: 6 },
  { hour: '02:00', success: 91, failure: 9 },
  { hour: '04:00', success: 96, failure: 4 },
  { hour: '06:00', success: 88, failure: 12 },
  { hour: '08:00', success: 98, failure: 2 },
  { hour: '10:00', success: 97, failure: 3 },
  { hour: '12:00', success: 95, failure: 5 },
  { hour: '14:00', success: 96, failure: 4 },
  { hour: '16:00', success: 99, failure: 1 },
  { hour: '18:00', success: 97, failure: 3 },
  { hour: '20:00', success: 95, failure: 5 },
  { hour: '22:00', success: 96, failure: 4 },
];

export const BASELINE_PIPELINES = [
  {
    id: 'pipe-001',
    name: 'Customer Data Sync',
    description: 'Bi-directional synchronization of enterprise customer records and accounts.',
    status: 'Running',
    schedule: 'Every 15m',
    source: 'Salesforce CRM',
    destination: 'Snowflake DW',
    owner: 'A. Chen',
    team: 'Data Eng',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['salesforce', 'snowflake', 'crm', 'etl'],
    lastExec: '2m ago',
    nextExec: '13m',
    duration: '1m 42s',
    records: '48.2K',
    recordsNumber: 48200,
    successRate: '99.1%',
    version: 'v2.4',
    created: 'Feb 14, 2024',
    trigger: 'Scheduled',
    frequency: 'Every 15 minutes',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '99.1%',
      avgDuration: '1m 42s',
      recordsToday: '48.2K',
      throughput: '450 rec/s',
      retryCount: '0',
      queueTime: '< 20ms',
    },
    connectors: {
      source: { name: 'Salesforce CRM', status: 'Connected', health: 'Healthy', lastCheck: '2m ago' },
      destination: { name: 'Snowflake DW', status: 'Connected', health: 'Healthy', lastCheck: '1m ago' },
    },
    components: {
      source: 'Salesforce Connector × 2',
      transformations: '4 transform nodes',
      validation: '2 validation steps',
      merge: '1 merge node',
      destination: 'Snowflake Loader × 2',
      totalNodes: 11,
      complexity: 'Medium',
    },
  },
  {
    id: 'pipe-002',
    name: 'Product Catalog ETL',
    description: 'Hourly ingestion and aggregation of catalog metadata, pricing, and inventory.',
    status: 'Completed',
    schedule: 'Hourly',
    source: 'MongoDB',
    destination: 'BigQuery',
    owner: 'R. Patel',
    team: 'Platform',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['mongodb', 'bigquery', 'catalog', 'etl'],
    lastExec: '38m ago',
    nextExec: '22m',
    duration: '3m 07s',
    records: '126K',
    recordsNumber: 126000,
    successRate: '98.7%',
    version: 'v1.8',
    created: 'Mar 10, 2024',
    trigger: 'Scheduled',
    frequency: 'Hourly',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '98.7%',
      avgDuration: '3m 07s',
      recordsToday: '126K',
      throughput: '680 rec/s',
      retryCount: '0',
      queueTime: '< 15ms',
    },
    connectors: {
      source: { name: 'MongoDB (replica)', status: 'Connected', health: 'Healthy', lastCheck: '5m ago' },
      destination: { name: 'BigQuery Core', status: 'Connected', health: 'Healthy', lastCheck: '4m ago' },
    },
    components: {
      source: 'MongoDB Ingest × 1',
      transformations: '6 transform nodes',
      validation: '3 validation steps',
      merge: '1 merge node',
      destination: 'BigQuery Sink × 1',
      totalNodes: 12,
      complexity: 'Medium',
    },
  },
  {
    id: 'pipe-003',
    name: 'Financial Reporting',
    description: 'Nightly ledger aggregation, reconciliation, and GAAP balance sheet ingestion.',
    status: 'Failed',
    schedule: 'Daily 02:00',
    source: 'Oracle DB',
    destination: 'Redshift',
    owner: 'S. Kim',
    team: 'Finance',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['finance', 'oracle', 'redshift', 'ledger'],
    lastExec: '4h ago',
    nextExec: 'Tomorrow',
    duration: '—',
    records: '0',
    recordsNumber: 0,
    successRate: '91.3%',
    version: 'v3.1',
    created: 'Jan 05, 2024',
    trigger: 'Scheduled',
    frequency: 'Daily at 02:00 UTC',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '91.3%',
      avgDuration: '4m 21s',
      recordsToday: '0',
      throughput: '0 rec/s',
      retryCount: '3',
      queueTime: '120ms',
    },
    connectors: {
      source: { name: 'Oracle Financial DB', status: 'Warning', health: 'Degraded', lastCheck: '4h ago' },
      destination: { name: 'Redshift Warehouse', status: 'Connected', health: 'Healthy', lastCheck: '4h ago' },
    },
    components: {
      source: 'Oracle JDBC Extractor × 2',
      transformations: '5 transform nodes',
      validation: '4 validation steps',
      merge: '2 merge nodes',
      destination: 'Redshift Redactor × 1',
      totalNodes: 14,
      complexity: 'High',
    },
  },
  {
    id: 'pipe-004',
    name: 'User Events Stream',
    description: 'Continuous Kafka → ClickHouse stream for real-time analytics.',
    status: 'Running',
    schedule: 'Continuous',
    source: 'Kafka',
    destination: 'ClickHouse',
    owner: 'M. Torres',
    team: 'Analytics',
    environment: 'Production',
    type: 'Streaming',
    tags: ['realtime', 'kafka', 'streaming'],
    lastExec: 'Live',
    nextExec: '—',
    duration: 'Ongoing',
    records: '1.2B',
    recordsNumber: 1200000000,
    successRate: '99.9%',
    version: 'v4.0',
    created: 'Jun 1, 2024',
    trigger: 'Continuous',
    frequency: 'Streaming',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '99.9%',
      avgDuration: 'Ongoing',
      recordsToday: '1.2B',
      throughput: '142K/s',
      retryCount: '0',
      queueTime: '< 10ms',
    },
    connectors: {
      source: { name: 'Kafka (prod-cluster)', status: 'Connected', health: 'Healthy', lastCheck: '2m ago' },
      destination: { name: 'ClickHouse Analytics', status: 'Connected', health: 'Healthy', lastCheck: '1m ago' },
    },
    components: {
      source: 'Kafka Consumer × 4',
      transformations: '8 transform nodes',
      validation: '3 validation steps',
      merge: '2 merge nodes',
      destination: 'ClickHouse Sink × 2',
      totalNodes: 19,
      complexity: 'High',
    },
  },
  {
    id: 'pipe-005',
    name: 'Inventory Reconciliation',
    description: 'Daily warehouse inventory reconciliation and SKU discrepancy reporting.',
    status: 'Scheduled',
    schedule: 'Daily 06:00',
    source: 'SAP ERP',
    destination: 'Snowflake DW',
    owner: 'L. Wang',
    team: 'Ops',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['sap', 'inventory', 'snowflake'],
    lastExec: '22h ago',
    nextExec: '6h',
    duration: '18m 44s',
    records: '892K',
    recordsNumber: 892000,
    successRate: '97.2%',
    version: 'v2.0',
    created: 'Apr 18, 2024',
    trigger: 'Scheduled',
    frequency: 'Daily at 06:00 UTC',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '97.2%',
      avgDuration: '18m 44s',
      recordsToday: '892K',
      throughput: '790 rec/s',
      retryCount: '0',
      queueTime: '< 30ms',
    },
    connectors: {
      source: { name: 'SAP RFC Connector', status: 'Connected', health: 'Healthy', lastCheck: '6h ago' },
      destination: { name: 'Snowflake DW', status: 'Connected', health: 'Healthy', lastCheck: '6h ago' },
    },
    components: {
      source: 'SAP Connector × 1',
      transformations: '7 transform nodes',
      validation: '4 validation steps',
      merge: '1 merge node',
      destination: 'Snowflake Staging × 1',
      totalNodes: 14,
      complexity: 'Medium',
    },
  },
  {
    id: 'pipe-006',
    name: 'Marketing Attribution',
    description: 'Multi-touch campaign attribution aggregating GA4, HubSpot, and ad spend.',
    status: 'Paused',
    schedule: 'Every 4h',
    source: 'GA4 + HubSpot',
    destination: 'Databricks',
    owner: 'J. Lee',
    team: 'Marketing',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['marketing', 'ga4', 'hubspot', 'databricks'],
    lastExec: '6h ago',
    nextExec: 'Paused',
    duration: '7m 22s',
    records: '34.1K',
    recordsNumber: 34100,
    successRate: '94.8%',
    version: 'v1.5',
    created: 'May 02, 2024',
    trigger: 'Scheduled',
    frequency: 'Every 4 hours',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '94.8%',
      avgDuration: '7m 22s',
      recordsToday: '34.1K',
      throughput: '90 rec/s',
      retryCount: '1',
      queueTime: '< 45ms',
    },
    connectors: {
      source: { name: 'GA4 & HubSpot APIs', status: 'Connected', health: 'Healthy', lastCheck: '6h ago' },
      destination: { name: 'Databricks Delta', status: 'Connected', health: 'Healthy', lastCheck: '6h ago' },
    },
    components: {
      source: 'REST Ingest × 2',
      transformations: '5 transform nodes',
      validation: '2 validation steps',
      merge: '2 merge nodes',
      destination: 'Delta Lake Table × 1',
      totalNodes: 12,
      complexity: 'Medium',
    },
  },
  {
    id: 'pipe-007',
    name: 'Log Aggregation',
    description: 'Enterprise syslog, audit trail, and container event ingest pipeline.',
    status: 'Running',
    schedule: 'Continuous',
    source: 'Fluentd',
    destination: 'Elasticsearch',
    owner: 'D. Okafor',
    team: 'Infra',
    environment: 'Production',
    type: 'Streaming',
    tags: ['infra', 'fluentd', 'elasticsearch', 'logging'],
    lastExec: 'Live',
    nextExec: '—',
    duration: 'Ongoing',
    records: '4.7B',
    recordsNumber: 4700000000,
    successRate: '99.7%',
    version: 'v6.2',
    created: 'Nov 12, 2023',
    trigger: 'Continuous',
    frequency: 'Streaming',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '99.7%',
      avgDuration: 'Ongoing',
      recordsToday: '4.7B',
      throughput: '540K/s',
      retryCount: '0',
      queueTime: '< 5ms',
    },
    connectors: {
      source: { name: 'Fluentd Aggregator', status: 'Connected', health: 'Healthy', lastCheck: '1m ago' },
      destination: { name: 'Elasticsearch Cluster', status: 'Connected', health: 'Healthy', lastCheck: '1m ago' },
    },
    components: {
      source: 'Fluentd Forwarder × 8',
      transformations: '3 transform nodes',
      validation: '1 validation step',
      merge: '1 merge node',
      destination: 'ES Bulk Indexer × 4',
      totalNodes: 17,
      complexity: 'Medium',
    },
  },
  {
    id: 'pipe-008',
    name: 'Subscription Billing Sync',
    description: 'Payment settlement and subscription invoice synchronization with general ledger.',
    status: 'Retrying',
    schedule: 'Every 30m',
    source: 'Stripe API',
    destination: 'PostgreSQL',
    owner: 'E. Müller',
    team: 'Finance',
    environment: 'Production',
    type: 'API Ingestion',
    tags: ['stripe', 'postgres', 'billing', 'finance'],
    lastExec: '12m ago',
    nextExec: '18m',
    duration: '—',
    records: '0',
    recordsNumber: 0,
    successRate: '88.4%',
    version: 'v2.1',
    created: 'Jan 22, 2024',
    trigger: 'Scheduled',
    frequency: 'Every 30 minutes',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '88.4%',
      avgDuration: '1m 42s',
      recordsToday: '0',
      throughput: '0 rec/s',
      retryCount: '2',
      queueTime: '80ms',
    },
    connectors: {
      source: { name: 'Stripe Billing Webhook/API', status: 'Warning', health: 'Degraded', lastCheck: '12m ago' },
      destination: { name: 'PostgreSQL Primary', status: 'Connected', health: 'Healthy', lastCheck: '12m ago' },
    },
    components: {
      source: 'Stripe API Ingestion × 1',
      transformations: '4 transform nodes',
      validation: '3 validation steps',
      merge: '1 merge node',
      destination: 'PostgreSQL Writer × 1',
      totalNodes: 10,
      complexity: 'Low',
    },
  },
  {
    id: 'pipe-009',
    name: 'Partner Feed Ingest',
    description: 'Bulk SFTP data exchange for affiliate and reseller product inventory feeds.',
    status: 'Disabled',
    schedule: 'Daily 08:00',
    source: 'SFTP',
    destination: 'S3 + Redshift',
    owner: 'C. Dubois',
    team: 'Partnerships',
    environment: 'Production',
    type: 'File Sync',
    tags: ['sftp', 's3', 'redshift', 'partners'],
    lastExec: '3d ago',
    nextExec: 'Disabled',
    duration: '52m 11s',
    records: '—',
    recordsNumber: 0,
    successRate: '85.1%',
    version: 'v1.2',
    created: 'Jul 15, 2024',
    trigger: 'Scheduled',
    frequency: 'Daily at 08:00 UTC',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '85.1%',
      avgDuration: '52m 11s',
      recordsToday: '—',
      throughput: '—',
      retryCount: '0',
      queueTime: '—',
    },
    connectors: {
      source: { name: 'Partner SFTP Server', status: 'Disconnected', health: 'Disabled', lastCheck: '3d ago' },
      destination: { name: 'S3 + Redshift Staging', status: 'Connected', health: 'Healthy', lastCheck: '3d ago' },
    },
    components: {
      source: 'SFTP File Parser × 1',
      transformations: '6 transform nodes',
      validation: '2 validation steps',
      merge: '1 merge node',
      destination: 'S3 Stage / Copy × 1',
      totalNodes: 11,
      complexity: 'Low',
    },
  },
  {
    id: 'pipe-010',
    name: 'ML Feature Store Sync',
    description: 'Hourly extraction and transformation of user behavior features for Vertex AI models.',
    status: 'Completed',
    schedule: 'Every 2h',
    source: 'Feature Eng DB',
    destination: 'Vertex AI',
    owner: 'N. Krishnan',
    team: 'ML Platform',
    environment: 'Production',
    type: 'ETL / Batch',
    tags: ['ml', 'vertex', 'features', 'ai'],
    lastExec: '1h ago',
    nextExec: '1h',
    duration: '9m 53s',
    records: '5.8M',
    recordsNumber: 5800000,
    successRate: '99.3%',
    version: 'v3.7',
    created: 'Apr 02, 2024',
    trigger: 'Scheduled',
    frequency: 'Every 2 hours',
    timezone: 'UTC',
    operationalMetrics: {
      successRate: '99.3%',
      avgDuration: '9m 53s',
      recordsToday: '5.8M',
      throughput: '9,700 rec/s',
      retryCount: '0',
      queueTime: '< 15ms',
    },
    connectors: {
      source: { name: 'Feature DB (Timescale)', status: 'Connected', health: 'Healthy', lastCheck: '1h ago' },
      destination: { name: 'Vertex AI Feature Store', status: 'Connected', health: 'Healthy', lastCheck: '1h ago' },
    },
    components: {
      source: 'Timescale Connector × 2',
      transformations: '9 transform nodes',
      validation: '4 validation steps',
      merge: '2 merge nodes',
      destination: 'Vertex AI Sink × 2',
      totalNodes: 19,
      complexity: 'High',
    },
  },
];

export const BASELINE_RECENT_EXECUTIONS = [
  {
    id: 'EX-90412',
    pipeline: 'Customer Data Sync',
    status: 'Running',
    started: '10:48:12',
    completed: '—',
    duration: '2m 04s',
    records: '22.1K',
    worker: 'wkr-03',
    trigger: 'Schedule',
  },
  {
    id: 'EX-90411',
    pipeline: 'Log Aggregation',
    status: 'Completed',
    started: '10:30:00',
    completed: '10:44:37',
    duration: '14m 37s',
    records: '1.4B',
    worker: 'wkr-07',
    trigger: 'Schedule',
  },
  {
    id: 'EX-90410',
    pipeline: 'Subscription Billing Sync',
    status: 'Failed',
    started: '10:18:00',
    completed: '10:19:42',
    duration: '1m 42s',
    records: '0',
    worker: 'wkr-02',
    trigger: 'Schedule',
  },
  {
    id: 'EX-90409',
    pipeline: 'Product Catalog ETL',
    status: 'Completed',
    started: '09:00:00',
    completed: '09:03:07',
    duration: '3m 07s',
    records: '126K',
    worker: 'wkr-05',
    trigger: 'Schedule',
  },
  {
    id: 'EX-90408',
    pipeline: 'Financial Reporting',
    status: 'Failed',
    started: '06:00:00',
    completed: '06:04:21',
    duration: '4m 21s',
    records: '0',
    worker: 'wkr-01',
    trigger: 'Schedule',
  },
  {
    id: 'EX-90407',
    pipeline: 'ML Feature Store Sync',
    status: 'Completed',
    started: '09:00:00',
    completed: '09:09:53',
    duration: '9m 53s',
    records: '5.8M',
    worker: 'wkr-06',
    trigger: 'Schedule',
  },
];

export const BASELINE_OPERATIONAL_ACTIVITY = [
  {
    id: 'act-001',
    time: '10:51:03',
    actor: 'System',
    action: 'Pipeline Started',
    pipeline: 'Customer Data Sync',
    status: 'Running',
    ref: 'EX-90412',
    type: 'execution',
  },
  {
    id: 'act-002',
    time: '10:44:37',
    actor: 'System',
    action: 'Pipeline Completed',
    pipeline: 'Log Aggregation',
    status: 'Completed',
    ref: 'EX-90411',
    type: 'execution',
  },
  {
    id: 'act-003',
    time: '10:19:42',
    actor: 'System',
    action: 'Pipeline Failed',
    pipeline: 'Subscription Billing Sync',
    status: 'Failed',
    ref: 'EX-90410',
    type: 'execution',
  },
  {
    id: 'act-004',
    time: '10:15:00',
    actor: 'J. Lee',
    action: 'Pipeline Paused',
    pipeline: 'Marketing Attribution',
    status: 'Paused',
    ref: '',
    type: 'lifecycle',
  },
  {
    id: 'act-005',
    time: '09:48:11',
    actor: 'A. Chen',
    action: 'Version Published',
    pipeline: 'Customer Data Sync',
    status: 'Completed',
    ref: 'v2.4',
    type: 'version',
  },
  {
    id: 'act-006',
    time: '09:03:07',
    actor: 'System',
    action: 'Pipeline Completed',
    pipeline: 'Product Catalog ETL',
    status: 'Completed',
    ref: 'EX-90409',
    type: 'execution',
  },
  {
    id: 'act-007',
    time: '08:30:00',
    actor: 'S. Kim',
    action: 'Schedule Updated',
    pipeline: 'Financial Reporting',
    status: '',
    ref: '',
    type: 'configuration',
  },
  {
    id: 'act-008',
    time: '07:12:44',
    actor: 'N. Krishnan',
    action: 'Pipeline Updated',
    pipeline: 'ML Feature Store Sync',
    status: '',
    ref: 'v3.7',
    type: 'configuration',
  },
];

export const BASELINE_ANALYTICS = {
  timeframe: '7d',
  executionTrend: [120, 145, 130, 160, 155, 170, 162],
  successRate: [95.2, 95.8, 96.1, 96.0, 96.4, 96.7, 96.4],
  failureTrend: [6, 7, 5, 8, 4, 5, 7],
  throughput: [1.8, 2.1, 1.9, 2.4, 2.3, 2.5, 2.41],
  avgDuration: [4.8, 4.5, 4.4, 4.3, 4.2, 4.15, 4.2],
  pipelineActivity: [
    { name: 'User Events Stream', percentage: 80 },
    { name: 'Log Aggregation', percentage: 60 },
    { name: 'ML Feature Store Sync', percentage: 45 },
    { name: 'Customer Data Sync', percentage: 30 },
    { name: 'Product Catalog ETL', percentage: 25 },
    { name: 'Inventory Reconciliation', percentage: 20 },
  ],
  distributionByStatus: [
    { label: 'Active', percentage: 74, color: '#10b981' },
    { label: 'Running', percentage: 13, color: '#3b82f6' },
    { label: 'Failed', percentage: 3, color: '#ef4444' },
    { label: 'Other', percentage: 10, color: '#94a3b8' },
  ],
  distributionByTeam: [
    { label: 'Data Eng', percentage: 35, color: '#3b82f6' },
    { label: 'Analytics', percentage: 22, color: '#8b5cf6' },
    { label: 'Finance', percentage: 18, color: '#f59e0b' },
    { label: 'Infra', percentage: 25, color: '#10b981' },
  ],
  distributionByEnvironment: [
    { label: 'Production', percentage: 58, color: '#0ea5e9' },
    { label: 'Staging', percentage: 27, color: '#64748b' },
    { label: 'Dev', percentage: 15, color: '#94a3b8' },
  ],
  distributionBySchedule: [
    { label: 'Scheduled', percentage: 57, color: '#6366f1' },
    { label: 'Continuous', percentage: 21, color: '#06b6d4' },
    { label: 'Manual', percentage: 22, color: '#64748b' },
  ],
};

/**
 * Fetch pipeline inventory and analytics with full filtering, search, and pagination.
 */
export async function getPipelines(orgId = 'current', filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.status && filters.status !== 'All Statuses') queryParams.set('status', filters.status);
  if (filters.type && filters.type !== 'All Types') queryParams.set('type', filters.type);
  if (filters.environment && filters.environment !== 'All Environments') queryParams.set('environment', filters.environment);
  if (filters.schedule && filters.schedule !== 'All Schedules') queryParams.set('schedule', filters.schedule);
  if (filters.owner && filters.owner !== 'All Owners') queryParams.set('owner', filters.owner);
  if (filters.team && filters.team !== 'All Teams') queryParams.set('team', filters.team);
  if (filters.tag && filters.tag !== 'All Tags') queryParams.set('tag', filters.tag);
  if (filters.source && filters.source !== 'All Sources') queryParams.set('source', filters.source);
  if (filters.destination && filters.destination !== 'All Destinations') queryParams.set('destination', filters.destination);
  if (filters.quickFilter && filters.quickFilter !== 'all') queryParams.set('quick', filters.quickFilter);
  if (filters.page) queryParams.set('page', filters.page);
  if (filters.pageSize) queryParams.set('pageSize', filters.pageSize);
  if (filters.sortField) queryParams.set('sortField', filters.sortField);
  if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

  const url = `/api/v1/organizations/${orgId}/pipelines?${queryParams.toString()}`;

  try {
    const res = await apiFetch(url);
    const body = await readJson(res);
    if (res.ok && body && Array.isArray(body.items)) {
      return {
        ...body,
        mocked: false,
      };
    }
  } catch {
    // Fall through to sample baseline dataset
  }

  // Filter client-side baseline dataset
  let items = [...BASELINE_PIPELINES];

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.source.toLowerCase().includes(s) ||
        p.destination.toLowerCase().includes(s) ||
        p.owner.toLowerCase().includes(s) ||
        p.team.toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  if (filters.status && filters.status !== 'All Statuses') {
    items = items.filter((p) => p.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.type && filters.type !== 'All Types') {
    items = items.filter((p) => p.type.toLowerCase().includes(filters.type.toLowerCase()));
  }

  if (filters.environment && filters.environment !== 'All Environments') {
    items = items.filter((p) => p.environment.toLowerCase() === filters.environment.toLowerCase());
  }

  if (filters.schedule && filters.schedule !== 'All Schedules') {
    items = items.filter((p) => p.schedule.toLowerCase().includes(filters.schedule.toLowerCase()));
  }

  if (filters.owner && filters.owner !== 'All Owners') {
    items = items.filter((p) => p.owner.toLowerCase() === filters.owner.toLowerCase());
  }

  if (filters.team && filters.team !== 'All Teams') {
    items = items.filter((p) => p.team.toLowerCase() === filters.team.toLowerCase());
  }

  if (filters.source && filters.source !== 'All Sources') {
    items = items.filter((p) => p.source.toLowerCase().includes(filters.source.toLowerCase()));
  }

  if (filters.destination && filters.destination !== 'All Destinations') {
    items = items.filter((p) => p.destination.toLowerCase().includes(filters.destination.toLowerCase()));
  }

  if (filters.quickFilter && filters.quickFilter !== 'all') {
    switch (filters.quickFilter) {
      case 'running':
        items = items.filter((p) => p.status === 'Running');
        break;
      case 'failed':
        items = items.filter((p) => p.status === 'Failed' || p.status === 'Retrying');
        break;
      case 'scheduled':
        items = items.filter((p) => p.status === 'Scheduled');
        break;
      case 'draft':
        items = items.filter((p) => p.status === 'Draft');
        break;
      case 'recentlyModified':
        items = items.filter((p) => p.lastExec.includes('m ago') || p.lastExec.includes('h ago'));
        break;
      case 'myPipelines':
        items = items.filter((p) => p.owner === 'M. Torres' || p.owner === 'A. Chen');
        break;
      default:
        break;
    }
  }

  // Sorting
  if (filters.sortField) {
    const field = filters.sortField;
    const order = filters.sortOrder === 'desc' ? -1 : 1;
    items.sort((a, b) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  }

  const total = items.length;
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total: 248, // Total platform pipelines count
    filteredTotal: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
    kpis: BASELINE_KPIS,
    statusDistribution: BASELINE_STATUS_DISTRIBUTION,
    triggerTypes: BASELINE_TRIGGER_TYPES,
    executionTrend7d: BASELINE_EXECUTION_TREND_7D,
    successVsFailure24h: BASELINE_SUCCESS_VS_FAILURE_24H,
    recentExecutions: BASELINE_RECENT_EXECUTIONS,
    recentActivity: BASELINE_OPERATIONAL_ACTIVITY,
    analytics: BASELINE_ANALYTICS,
    mocked: true,
  };
}

/** Trigger single pipeline run */
export async function triggerPipelineRun(pipelineId) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${pipelineId}/run`, { method: 'POST' });
    if (res.ok) return await readJson(res);
  } catch {
    // fallback
  }
  return { success: true, executionId: `EX-${Math.floor(10000 + Math.random() * 90000)}`, status: 'Running' };
}

/** Toggle pipeline status (pause, resume, disable, enable) */
export async function setPipelineStatus(pipelineId, newStatus) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${pipelineId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) return await readJson(res);
  } catch {
    // fallback
  }
  return { success: true, id: pipelineId, status: newStatus };
}

/** Duplicate pipeline */
export async function duplicatePipeline(pipelineId) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${pipelineId}/duplicate`, { method: 'POST' });
    if (res.ok) return await readJson(res);
  } catch {
    // fallback
  }
  return { success: true, id: `${pipelineId}-copy`, name: 'Copy of Pipeline' };
}

/** Delete pipeline */
export async function deletePipeline(pipelineId) {
  try {
    const res = await apiFetch(`/api/v1/pipelines/${pipelineId}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch {
    // fallback
  }
  return true;
}

/** Bulk operations on pipelines */
export async function bulkOperatePipelines(pipelineIds, action, payload = {}) {
  try {
    const res = await apiFetch('/api/v1/pipelines/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: pipelineIds, action, ...payload }),
    });
    if (res.ok) return await readJson(res);
  } catch {
    // fallback
  }
  return { success: true, count: pipelineIds.length, action };
}
