/**
 * Visual Pipeline Builder API Service (MOD-008 / SCR-065)
 *
 * Real-request-first endpoints for visual ETL pipeline authoring,
 * node configuration, connection topology, validation checks, and
 * execution simulation. When backend is unavailable, gracefully falls
 * back to design-accurate mock representations flagged `mocked: true`.
 *
 * Figma node: 150:8519 (Visual Pipeline Builder Screen)
 */

export class PipelineBuilderError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'PipelineBuilderError';
    this.status = status;
    this.details = details;
  }
}

export const NODE_CATEGORIES = {
  sources: {
    id: 'sources',
    name: 'SOURCES',
    color: '#3b82f6',
    dotClass: 'bg-blue-500',
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    items: [
      { id: 'src_db', name: 'Database', type: 'database', category: 'sources', defaultTitle: 'Database Source', defaultSubtitle: 'PostgreSQL Production', icon: 'Database' },
      { id: 'src_dw', name: 'Data Warehouse', type: 'warehouse', category: 'sources', defaultTitle: 'Data Warehouse', defaultSubtitle: 'Snowflake Analytics', icon: 'Warehouse' },
      { id: 'src_cs', name: 'Cloud Storage', type: 'cloud_storage', category: 'sources', defaultTitle: 'Cloud Storage', defaultSubtitle: 'Amazon S3 / GCS', icon: 'Cloud' },
      { id: 'src_api', name: 'REST API', type: 'rest_api', category: 'sources', defaultTitle: 'REST API Source', defaultSubtitle: 'Orders Service v2', icon: 'Globe' },
      { id: 'src_gql', name: 'GraphQL', type: 'graphql', category: 'sources', defaultTitle: 'GraphQL Source', defaultSubtitle: 'Unified Gateway', icon: 'Hexagon' },
      { id: 'src_kafka', name: 'Kafka', type: 'kafka', category: 'sources', defaultTitle: 'Kafka Stream', defaultSubtitle: 'events.customer.v1', icon: 'Share2' },
      { id: 'src_stream', name: 'Streaming', type: 'streaming', category: 'sources', defaultTitle: 'Streaming Source', defaultSubtitle: 'Kinesis / PubSub', icon: 'Activity' },
      { id: 'src_file', name: 'File', type: 'file', category: 'sources', defaultTitle: 'File Ingestion', defaultSubtitle: 'CSV / Excel / Parquet', icon: 'FileText' },
    ],
  },
  transformations: {
    id: 'transformations',
    name: 'TRANSFORMATIONS',
    color: '#8b5cf6',
    dotClass: 'bg-violet-500',
    headerBg: 'bg-violet-50',
    headerBorder: 'border-violet-200',
    badgeText: 'text-violet-700',
    items: [
      { id: 'tx_filter', name: 'Filter', type: 'filter', category: 'transformations', defaultTitle: 'Filter', defaultSubtitle: 'Active Records Only', icon: 'Filter' },
      { id: 'tx_map', name: 'Map', type: 'map', category: 'transformations', defaultTitle: 'Map Fields', defaultSubtitle: 'Field Rename & Cast', icon: 'Workflow' },
      { id: 'tx_join', name: 'Join', type: 'join', category: 'transformations', defaultTitle: 'Join', defaultSubtitle: 'Orders ⋈ Customers', icon: 'GitMerge' },
      { id: 'tx_agg', name: 'Aggregate', type: 'aggregate', category: 'transformations', defaultTitle: 'Aggregate', defaultSubtitle: 'Revenue by Region', icon: 'BarChart2' },
      { id: 'tx_sort', name: 'Sort', type: 'sort', category: 'transformations', defaultTitle: 'Sort', defaultSubtitle: 'timestamp DESC', icon: 'ArrowUpDown' },
      { id: 'tx_merge', name: 'Merge', type: 'merge', category: 'transformations', defaultTitle: 'Merge Streams', defaultSubtitle: 'Union All Inputs', icon: 'GitPullRequest' },
      { id: 'tx_sql', name: 'SQL', type: 'sql', category: 'transformations', defaultTitle: 'SQL Transform', defaultSubtitle: 'Enrichment Query', icon: 'Code' },
      { id: 'tx_python', name: 'Python', type: 'python', category: 'transformations', defaultTitle: 'Python Script', defaultSubtitle: 'custom_clean.py', icon: 'Terminal' },
      { id: 'tx_validation', name: 'Validation', type: 'validation', category: 'transformations', defaultTitle: 'Validation', defaultSubtitle: 'Schema + Null Check', icon: 'ShieldCheck' },
    ],
  },
  destinations: {
    id: 'destinations',
    name: 'DESTINATIONS',
    color: '#10b981',
    dotClass: 'bg-emerald-500',
    headerBg: 'bg-emerald-50',
    headerBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    items: [
      { id: 'dst_db', name: 'Database', type: 'database', category: 'destinations', defaultTitle: 'Database Destination', defaultSubtitle: 'PostgreSQL Analytics', icon: 'Database' },
      { id: 'dst_wh', name: 'Warehouse', type: 'warehouse', category: 'destinations', defaultTitle: 'Warehouse', defaultSubtitle: 'Snowflake — analytics', icon: 'Building' },
      { id: 'dst_cs', name: 'Cloud Storage', type: 'cloud_storage', category: 'destinations', defaultTitle: 'S3 Destination', defaultSubtitle: 'data-lake-prod/output', icon: 'Cloud' },
      { id: 'dst_rest', name: 'REST Endpoint', type: 'rest_endpoint', category: 'destinations', defaultTitle: 'REST Webhook', defaultSubtitle: 'https://api.crm.internal', icon: 'ExternalLink' },
      { id: 'dst_kafka', name: 'Kafka', type: 'kafka', category: 'destinations', defaultTitle: 'Kafka Topic', defaultSubtitle: 'orders.enriched.v1', icon: 'Share2' },
      { id: 'dst_lake', name: 'Data Lake', type: 'data_lake', category: 'destinations', defaultTitle: 'Delta Lake', defaultSubtitle: 'gold/customer_revenue', icon: 'Layers' },
    ],
  },
  utility: {
    id: 'utility',
    name: 'UTILITY',
    color: '#f59e0b',
    dotClass: 'bg-amber-500',
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    items: [
      { id: 'ut_cond', name: 'Conditional', type: 'conditional', category: 'utility', defaultTitle: 'Conditional Router', defaultSubtitle: 'If / Else Branch', icon: 'GitBranch' },
      { id: 'ut_delay', name: 'Delay', type: 'delay', category: 'utility', defaultTitle: 'Delay Timer', defaultSubtitle: '500ms backoff', icon: 'Clock' },
      { id: 'ut_loop', name: 'Loop', type: 'loop', category: 'utility', defaultTitle: 'Loop Iterator', defaultSubtitle: 'For Each Batch', icon: 'Repeat' },
      { id: 'ut_notify', name: 'Notification', type: 'notification', category: 'utility', defaultTitle: 'Slack / PagerAlert', defaultSubtitle: '#data-alerts', icon: 'Bell' },
      { id: 'ut_err', name: 'Error Handler', type: 'error_handler', category: 'utility', defaultTitle: 'Dead Letter Queue', defaultSubtitle: 'Retry & Divert', icon: 'AlertTriangle' },
      { id: 'ut_sched', name: 'Scheduler', type: 'scheduler', category: 'utility', defaultTitle: 'Cron Trigger', defaultSubtitle: '0 */4 * * *', icon: 'Calendar' },
    ],
  },
};

export const RECENTLY_USED_NODES = [
  { id: 'rec_1', name: 'PostgreSQL Source', category: 'sources', type: 'database' },
  { id: 'rec_2', name: 'Filter Transform', category: 'transformations', type: 'filter' },
  { id: 'rec_3', name: 'S3 Destination', category: 'destinations', type: 'cloud_storage' },
];

export const INITIAL_PIPELINE_NODES = [
  {
    id: 'node-1',
    category: 'sources',
    type: 'database',
    title: 'Database Source',
    subtitle: 'PostgreSQL Production',
    x: 118,
    y: 88,
    status: 'connected',
    statusTone: 'success',
    metrics: [
      { label: 'RECORDS', value: '12.4M' },
      { label: 'THROUGHPUT', value: '2.1K/s' },
    ],
    config: {
      name: 'Database Source',
      description: 'PostgreSQL production database',
      tags: ['source', 'postgres', 'prod'],
      connection: 'PostgreSQL Production',
      database: 'orders_db',
      schema: 'public',
      tableOrQuery: 'Table',
      table: 'orders',
      sqlQuery: '',
      batchSize: '5000',
      parallelism: '4',
      timeoutSeconds: '30',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-2',
    category: 'sources',
    type: 'rest_api',
    title: 'REST API Source',
    subtitle: 'Orders Service v2',
    x: 118,
    y: 238,
    status: 'connected',
    statusTone: 'success',
    metrics: [
      { label: 'ENDPOINT', value: '/api/orders' },
      { label: 'RATE', value: '500/s' },
    ],
    config: {
      name: 'REST API Source',
      description: 'Orders microservice v2 ingestion endpoint',
      tags: ['source', 'api', 'orders'],
      connection: 'Orders API Service',
      database: '',
      schema: '',
      tableOrQuery: 'Table',
      table: '/api/orders',
      sqlQuery: '',
      batchSize: '1000',
      parallelism: '2',
      timeoutSeconds: '15',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: true,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-3',
    category: 'sources',
    type: 'kafka',
    title: 'Kafka Stream',
    subtitle: 'events.customer.v1',
    x: 118,
    y: 388,
    status: 'warning',
    statusTone: 'warning',
    metrics: [
      { label: 'TOPIC', value: 'customer-events' },
      { label: 'LAG', value: '1.2K' },
    ],
    config: {
      name: 'Kafka Stream',
      description: 'Customer events real-time stream',
      tags: ['source', 'kafka', 'events'],
      connection: 'Kafka Cluster Prod',
      database: '',
      schema: '',
      tableOrQuery: 'Table',
      table: 'events.customer.v1',
      sqlQuery: '',
      batchSize: '2000',
      parallelism: '6',
      timeoutSeconds: '60',
      retries: '5',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: true,
      duplicateCheck: true,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-4',
    category: 'transformations',
    type: 'filter',
    title: 'Filter',
    subtitle: 'Active Records Only',
    x: 400,
    y: 138,
    status: 'valid',
    statusTone: 'success',
    metrics: [
      { label: 'CONDITION', value: 'status = active' },
      { label: 'PASS', value: '94%' },
    ],
    config: {
      name: 'Filter',
      description: 'Filter out inactive and soft-deleted records',
      tags: ['transform', 'filter', 'active'],
      connection: 'Internal Filter Engine',
      database: '',
      schema: '',
      tableOrQuery: 'Query',
      table: '',
      sqlQuery: 'status = "active"',
      batchSize: '5000',
      parallelism: '4',
      timeoutSeconds: '30',
      retries: '0',
      retryPolicy: 'None',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: false,
    },
  },
  {
    id: 'node-5',
    category: 'transformations',
    type: 'join',
    title: 'Join',
    subtitle: 'Orders ⋈ Customers',
    x: 400,
    y: 248,
    status: 'valid',
    statusTone: 'success',
    metrics: [
      { label: 'TYPE', value: 'LEFT JOIN' },
      { label: 'KEY', value: 'customer_id' },
    ],
    config: {
      name: 'Join',
      description: 'Enrich orders stream with customer demographic master data',
      tags: ['transform', 'join', 'customers'],
      connection: 'Internal Join Engine',
      database: '',
      schema: '',
      tableOrQuery: 'Query',
      table: '',
      sqlQuery: 'LEFT JOIN customers ON orders.customer_id = customers.id',
      batchSize: '5000',
      parallelism: '4',
      timeoutSeconds: '30',
      retries: '2',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-6',
    category: 'transformations',
    type: 'aggregate',
    title: 'Aggregate',
    subtitle: 'Revenue by Region',
    x: 678,
    y: 158,
    status: 'Running…',
    statusTone: 'running',
    metrics: [
      { label: 'ROWS', value: '48.2K' },
      { label: 'GROUPS', value: '142' },
    ],
    config: {
      name: 'Aggregate',
      description: 'Compute regional revenue metrics and order volume counts',
      tags: ['transform', 'aggregate', 'revenue'],
      connection: 'Aggregation Engine',
      database: '',
      schema: '',
      tableOrQuery: 'Query',
      table: '',
      sqlQuery: 'GROUP BY region_id, country_code',
      batchSize: '10000',
      parallelism: '8',
      timeoutSeconds: '45',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: true,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-7',
    category: 'transformations',
    type: 'sql',
    title: 'SQL Transform',
    subtitle: 'Enrichment Query',
    x: 678,
    y: 248,
    status: 'valid',
    statusTone: 'success',
    metrics: [
      { label: 'ROWS', value: '12.4K' },
      { label: 'DURATION', value: '0.3s' },
    ],
    config: {
      name: 'SQL Transform',
      description: 'Format currency and compute tax calculations',
      tags: ['transform', 'sql', 'enrich'],
      connection: 'DuckDB In-Memory SQL Engine',
      database: '',
      schema: '',
      tableOrQuery: 'Query',
      table: '',
      sqlQuery: 'SELECT *, (subtotal * (1 + tax_rate)) AS final_total FROM input_stream',
      batchSize: '5000',
      parallelism: '4',
      timeoutSeconds: '30',
      retries: '1',
      retryPolicy: 'Fixed Interval',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-8',
    category: 'transformations',
    type: 'validation',
    title: 'Validation',
    subtitle: 'Schema + Null Check',
    x: 678,
    y: 388,
    status: 'warning',
    statusTone: 'warning',
    metrics: [
      { label: 'ERRORS', value: '3' },
      { label: 'WARNINGS', value: '7' },
    ],
    config: {
      name: 'Validation',
      description: 'Strict schema conformance and null constraint validation',
      tags: ['transform', 'validation', 'quality'],
      connection: 'Great Expectations Engine',
      database: '',
      schema: '',
      tableOrQuery: 'Table',
      table: 'order_validation_suite',
      sqlQuery: '',
      batchSize: '5000',
      parallelism: '4',
      timeoutSeconds: '30',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: true,
      duplicateCheck: true,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-9',
    category: 'destinations',
    type: 'cloud_storage',
    title: 'S3 Destination',
    subtitle: 'data-lake-prod/output',
    x: 960,
    y: 188,
    status: 'idle',
    statusTone: 'idle',
    metrics: [
      { label: 'FORMAT', value: 'Parquet' },
      { label: 'PARTITION', value: 'date' },
    ],
    config: {
      name: 'S3 Destination',
      description: 'Primary analytical data lake parquet sink',
      tags: ['destination', 's3', 'parquet'],
      connection: 'AWS S3 Production Analytics',
      database: 's3://data-lake-prod',
      schema: 'output/orders/enriched',
      tableOrQuery: 'Table',
      table: 'orders_parquet',
      sqlQuery: '',
      batchSize: '10000',
      parallelism: '4',
      timeoutSeconds: '60',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
  {
    id: 'node-10',
    category: 'destinations',
    type: 'warehouse',
    title: 'Warehouse',
    subtitle: 'Snowflake — analytics',
    x: 960,
    y: 338,
    status: 'idle',
    statusTone: 'idle',
    metrics: [
      { label: 'TABLE', value: 'fact_orders' },
      { label: 'MODE', value: 'Append' },
    ],
    config: {
      name: 'Warehouse',
      description: 'Snowflake analytics enterprise warehouse table',
      tags: ['destination', 'snowflake', 'warehouse'],
      connection: 'Snowflake Production',
      database: 'ANALYTICS_PROD',
      schema: 'PUBLIC',
      tableOrQuery: 'Table',
      table: 'fact_orders',
      sqlQuery: '',
      batchSize: '10000',
      parallelism: '6',
      timeoutSeconds: '90',
      retries: '3',
      retryPolicy: 'Exponential Backoff',
      schemaValidation: true,
      requiredFields: true,
      nullHandling: false,
      duplicateCheck: false,
      enableMetrics: true,
      enableLogs: true,
      alerts: true,
    },
  },
];

export const INITIAL_PIPELINE_EDGES = [
  { id: 'edge-1-4', from: 'node-1', to: 'node-4' },
  { id: 'edge-1-5', from: 'node-1', to: 'node-5' },
  { id: 'edge-2-5', from: 'node-2', to: 'node-5' },
  { id: 'edge-3-8', from: 'node-3', to: 'node-8' },
  { id: 'edge-4-6', from: 'node-4', to: 'node-6' },
  { id: 'edge-5-7', from: 'node-5', to: 'node-7' },
  { id: 'edge-6-9', from: 'node-6', to: 'node-9' },
  { id: 'edge-7-9', from: 'node-7', to: 'node-9' },
  { id: 'edge-8-10', from: 'node-8', to: 'node-10' },
];

export const INITIAL_CONSOLE_LOGS = [
  { id: 'log-1', time: '14:32:01.441', level: 'INFO', node: 'Database Source', message: 'Connection established to postgresql://prod-db.internal:5432/orders_db' },
  { id: 'log-2', time: '14:32:01.892', level: 'INFO', node: 'Database Source', message: 'Query executed. Fetched 12,400,000 records from table `orders`' },
  { id: 'log-3', time: '14:32:02.140', level: 'INFO', node: 'Filter', message: 'Filter condition applied: status = "active". Pass rate: 94.2%' },
  { id: 'log-4', time: '14:32:02.553', level: 'INFO', node: 'REST API Source', message: 'HTTP GET /api/orders completed. 200 OK — 11,680 records received' },
  { id: 'log-5', time: '14:32:02.871', level: 'WARN', node: 'Kafka Stream', message: 'Consumer lag detected: 1,243 messages behind on partition 0' },
  { id: 'log-6', time: '14:32:03.102', level: 'INFO', node: 'Join', message: 'LEFT JOIN on customer_id — matched 11,204 of 11,680 records' },
  { id: 'log-7', time: '14:32:03.419', level: 'INFO', node: 'Aggregate', message: 'Aggregating revenue by region — 142 groups identified, processing...' },
  { id: 'log-8', time: '14:32:03.551', level: 'WARN', node: 'Validation', message: 'Null values detected in column `shipping_address` — 3 records affected' },
  { id: 'log-9', time: '14:32:03.788', level: 'ERROR', node: 'Validation', message: 'Schema mismatch: field `order_total` expected DECIMAL, got VARCHAR in 3 rows' },
  { id: 'log-10', time: '14:32:04.012', level: 'INFO', node: 'SQL Transform', message: 'Enrichment query complete. 12,401 rows enriched with customer metadata' },
];

export const INITIAL_VALIDATION_ITEMS = [
  { id: 'val-1', label: 'Source Connectivity Check', status: 'Passed', details: 'PostgreSQL, REST API, and Kafka cluster endpoints respond within SLA.' },
  { id: 'val-2', label: 'Schema Invariants Check', status: 'Error', count: 3, details: 'Field `order_total` in 3 incoming records contains non-numeric string values.' },
  { id: 'val-3', label: 'Null Value Boundary Check', status: 'Warning', count: 7, details: '7 records missing non-critical `shipping_address` optional attribute.' },
  { id: 'val-4', label: 'Transformation Graph Cycle Check', status: 'Passed', details: 'DAG is acyclic. Topological execution order computed successfully.' },
  { id: 'val-5', label: 'Join Key Compatibility', status: 'Passed', details: 'Primary key `customer_id` data types match between orders and customer master.' },
  { id: 'val-6', label: 'Destination Path Permissions', status: 'Passed', details: 'S3 bucket write permissions and Snowflake table schema verified.' },
  { id: 'val-7', label: 'Throughput & Backpressure Guard', status: 'Passed', details: 'Configured buffer limits and batch sizes are within memory allocation limits.' },
];

export const MOCK_PIPELINE_META = {
  id: 'pipe-001',
  name: 'Omnichannel Orders Processing Pipeline',
  version: 'v1.2.0',
  status: 'Draft',
  lastSaved: '2m ago',
  environment: 'Production',
  owner: 'Data Engineering Team',
  progressPercent: 63,
  activeNode: 'Aggregate',
  recordsProcessed: '7.8M / 12.4M',
  duration: '2m 14s',
  eta: '~1m 18s',
};

/**
 * Fetch visual pipeline builder graph (nodes, edges, config, telemetry)
 */
export async function fetchPipelineBuilderGraph(orgId = 'current', pipelineId = 'pipe-001') {
  const url = `/api/v1/organizations/${encodeURIComponent(orgId)}/pipelines/${encodeURIComponent(pipelineId)}/builder`;
  try {
    const res = await fetch(url, {
      headers: { credentials: 'same-origin', Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ...data,
        mocked: false,
      };
    }
  } catch {
    // Network or server error -> fall through to mock
  }

  return {
    meta: MOCK_PIPELINE_META,
    nodes: INITIAL_PIPELINE_NODES,
    edges: INITIAL_PIPELINE_EDGES,
    logs: INITIAL_CONSOLE_LOGS,
    validationItems: INITIAL_VALIDATION_ITEMS,
    mocked: true,
  };
}

/**
 * Save updated pipeline graph
 */
export async function savePipelineBuilderGraph(orgId = 'current', pipelineId = 'pipe-001', payload = {}) {
  const url = `/api/v1/organizations/${encodeURIComponent(orgId)}/pipelines/${encodeURIComponent(pipelineId)}/builder`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ...data, mocked: false };
    }
  } catch {
    // Fall through to mock result
  }

  return {
    success: true,
    savedAt: new Date().toISOString(),
    nodesCount: payload.nodes?.length || INITIAL_PIPELINE_NODES.length,
    edgesCount: payload.edges?.length || INITIAL_PIPELINE_EDGES.length,
    mocked: true,
  };
}

/**
 * Validate pipeline DAG and node configs
 */
export async function validatePipelineGraph(orgId = 'current', pipelineId = 'pipe-001', graph = {}) {
  const url = `/api/v1/organizations/${encodeURIComponent(orgId)}/pipelines/${encodeURIComponent(pipelineId)}/validate`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(graph),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ...data, mocked: false };
    }
  } catch {
    // Mock result
  }

  return {
    isValid: false,
    errorsCount: 3,
    warningsCount: 7,
    items: INITIAL_VALIDATION_ITEMS,
    validatedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Execute or trigger pipeline run
 */
export async function executePipelineRun(orgId = 'current', pipelineId = 'pipe-001') {
  const url = `/api/v1/organizations/${encodeURIComponent(orgId)}/pipelines/${encodeURIComponent(pipelineId)}/execute`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ...data, mocked: false };
    }
  } catch {
    // Mock result
  }

  return {
    runId: `run_${Math.random().toString(36).substring(2, 9)}`,
    status: 'Running',
    startedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Publish pipeline to production
 */
export async function publishPipelineVersion(orgId = 'current', pipelineId = 'pipe-001', payload = {}) {
  const url = `/api/v1/organizations/${encodeURIComponent(orgId)}/pipelines/${encodeURIComponent(pipelineId)}/publish`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return { ...data, mocked: false };
    }
  } catch {
    // Mock result
  }

  return {
    published: true,
    version: payload.version || 'v1.2.0',
    publishedAt: new Date().toISOString(),
    mocked: true,
  };
}
