/**
 * Data loader and services for the Node Library Screen (SCR-066, node 151:9778,
 * Figma page "Page 1", frame "Node Library Screen").
 *
 * MOCK BOUNDARY: MOD-008 (Pipeline Builder & Execution) is still `PLANNED`
 * with no backend deployed — no `PipelineNode` library CRUD or catalog API exists yet.
 * `getNodeCatalog` always attempts a real GET first and only falls back to
 * the design-sourced baseline below when the endpoint is unreachable / returns non-JSON.
 * Results are flagged `mocked: true` so the UI can disclose that the data is sample data.
 *
 * FIGMA VERIFICATION: node 151:9778 was inspected via the Figma MCP
 * (full XML layout extraction + text node taxonomy).
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class NodeLibraryError extends Error {}

export const CATEGORY_OPTIONS = [
  'All Categories',
  'Sources',
  'Transformations',
  'Validation',
  'Destinations',
  'Utilities',
];

export const CONNECTOR_TYPE_OPTIONS = [
  'All Connector Types',
  'Relational Databases',
  'NoSQL Databases',
  'Data Warehouses',
  'Cloud Storage',
  'REST APIs',
  'GraphQL',
  'SOAP',
  'FTP / SFTP',
  'Kafka',
  'Streaming',
  'File Systems',
  'SaaS Connectors',
];

export const STATUS_OPTIONS = [
  'All Statuses',
  'Active',
  'Beta',
  'Deprecated',
  'Maintenance',
];

export const COMPATIBILITY_OPTIONS = [
  'All Versions',
  'v4.x+',
  'v4.0+',
  'v3.5+',
  'v3.x+',
  'Any',
];

export const OWNER_OPTIONS = [
  'All Owners',
  'Platform Team',
  'Streaming Team',
  'Integration Team',
  'Data Eng Team',
  'Core Pipeline Team',
  'ML Engineering',
  'Governance Team',
  'Security & Compliance',
  'Community',
];

export const CERTIFICATION_OPTIONS = [
  'All Certifications',
  'Enterprise',
  'Internal',
  'Custom',
  'Community',
];

export const SORT_OPTIONS = [
  { id: 'most_used', label: 'Most Used' },
  { id: 'name_asc', label: 'Name (A to Z)' },
  { id: 'name_desc', label: 'Name (Z to A)' },
  { id: 'highest_rated', label: 'Success Rate' },
  { id: 'newest', label: 'Newest Release' },
];

export const INITIAL_METRICS = {
  totalNodes: { value: 284, change: '+12', subtext: 'Across all categories', icon: 'Layers' },
  sourceNodes: { value: 86, change: '+4', subtext: '12 connector types', icon: 'Database' },
  transformations: { value: 94, change: '+6', subtext: '15 transform types', icon: 'Workflow' },
  destinations: { value: 52, change: '+2', subtext: '8 sink types', icon: 'Warehouse' },
  utilityNodes: { value: 38, change: '+1', subtext: '9 utility types', icon: 'Code' },
  customNodes: { value: 14, change: null, subtext: 'Enterprise-built', icon: 'ShieldCheck' },
  deprecated: { value: 7, change: '+1', subtext: 'Scheduled removal', icon: 'AlertTriangle' },
  mostUsed: { value: 'PostgreSQL', change: null, subtext: '1,248 pipeline uses', icon: 'Activity' },
};

export const INITIAL_CATEGORIES = [
  {
    id: 'all',
    name: 'All Nodes',
    count: 284,
    icon: 'Layers',
    subcategories: [],
  },
  {
    id: 'sources',
    name: 'Sources',
    count: 86,
    icon: 'Database',
    subcategories: [
      { id: 'relational', name: 'Relational Databases', count: 24 },
      { id: 'nosql', name: 'NoSQL Databases', count: 14 },
      { id: 'warehouses', name: 'Data Warehouses', count: 12 },
      { id: 'cloud-storage', name: 'Cloud Storage', count: 10 },
      { id: 'rest-apis', name: 'REST APIs', count: 8 },
      { id: 'graphql', name: 'GraphQL', count: 4 },
      { id: 'soap', name: 'SOAP', count: 2 },
      { id: 'ftp-sftp', name: 'FTP / SFTP', count: 4 },
      { id: 'kafka', name: 'Kafka', count: 3 },
      { id: 'streaming', name: 'Streaming', count: 3 },
      { id: 'filesystems', name: 'File Systems', count: 2 },
      { id: 'saas', name: 'SaaS Connectors', count: 12 },
    ],
  },
  {
    id: 'transformations',
    name: 'Transformations',
    count: 94,
    icon: 'Workflow',
    subcategories: [
      { id: 'field-mapping', name: 'Field Mapping & Cast', count: 22 },
      { id: 'filtering', name: 'Filter & Cleanse', count: 18 },
      { id: 'aggregation', name: 'Aggregation & Grouping', count: 16 },
      { id: 'enrichment', name: 'Join & Enrichment', count: 14 },
      { id: 'scripting', name: 'Scripting (Python/SQL)', count: 12 },
      { id: 'schema-morph', name: 'Schema Morphing', count: 12 },
    ],
  },
  {
    id: 'validation',
    name: 'Validation',
    count: 23,
    icon: 'ShieldCheck',
    subcategories: [
      { id: 'schema-integrity', name: 'Schema Integrity', count: 8 },
      { id: 'null-range', name: 'Null & Range Check', count: 6 },
      { id: 'business-rules', name: 'Business Rules Engine', count: 5 },
      { id: 'profiler', name: 'Data Profiler', count: 4 },
    ],
  },
  {
    id: 'destinations',
    name: 'Destinations',
    count: 52,
    icon: 'Warehouse',
    subcategories: [
      { id: 'relational-sinks', name: 'Relational Databases', count: 16 },
      { id: 'cloud-warehouses', name: 'Cloud Warehouses', count: 14 },
      { id: 'cloud-buckets', name: 'Cloud Storage', count: 10 },
      { id: 'stream-sinks', name: 'Streaming & Kafka', count: 8 },
      { id: 'webhook-sinks', name: 'REST & Webhook', count: 4 },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    count: 38,
    icon: 'Code',
    subcategories: [
      { id: 'telemetry', name: 'Logger & Telemetry', count: 10 },
      { id: 'rate-limiting', name: 'Rate Limiter', count: 8 },
      { id: 'retry-logic', name: 'Retry & Backoff', count: 8 },
      { id: 'encryption', name: 'Encryption & Masking', count: 7 },
      { id: 'notifications', name: 'Notifications', count: 5 },
    ],
  },
];

export const INITIAL_NODES = [
  {
    id: 'node-pg-src-01',
    name: 'PostgreSQL Source',
    category: 'Sources',
    categoryId: 'sources',
    subcategory: 'Relational Databases',
    subcategoryId: 'relational',
    description: 'Read from PostgreSQL relational databases with full query support, CDC, and batch modes.',
    version: 'v3.2.1',
    minPlatformVersion: 'v4.x+',
    runtime: 'JVM 17 / Python 3.11',
    usesCount: 1248,
    updatedDate: '2026-07-14',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: true,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: true,
    healthPercent: 98,
    healthDots: 5,
    metrics: {
      usageCount: '1,248',
      successRate: '98.7%',
      failureRate: '1.3%',
      avgExecTime: '4.2 s',
    },
    ownerTeam: 'Platform Team · Data Eng',
    author: 'Platform Team',
    accentColor: '#3b82f6',
    instancePreviewName: 'prod-db-01',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'JVM 17 / Python 3.11',
      supportedSources: '12 connector types',
      supportedDestinations: 'Any sink node',
    },
    configParameters: [
      { name: 'Authentication', required: true, type: 'OAuth 2.0 / Password', default: 'OAuth 2.0 / Password' },
      { name: 'Batch Size', required: false, type: 'Integer (default: 5000)', default: '5000' },
      { name: 'Query Timeout', required: false, type: 'Seconds (default: 30)', default: '30' },
      { name: 'Parallelism', required: false, type: 'Integer (1–32)', default: '8' },
    ],
    dependencies: [
      { name: 'postgresql-42.6.0.jar', type: 'Required', status: 'ready' },
      { name: 'hikari-pool 5.x', type: 'Required', status: 'ready' },
      { name: 'debezium-core 2.4', type: 'Optional (CDC)', status: 'ready' },
    ],
    ports: {
      inputs: [],
      outputs: [
        { id: 'out-1', name: 'records', type: 'Table / Stream', format: 'application/x-record-batch' },
        { id: 'out-2', name: 'cdc_stream', type: 'Event Log', format: 'application/json' },
      ],
    },
    versions: [
      { version: 'v3.2.1', date: '2026-07-14', note: 'Added optimized parallel fetch cursor support and SSL cert auto-reload.' },
      { version: 'v3.2.0', date: '2026-05-02', note: 'Added streaming CDC with Debezium 2.4 engine.' },
      { version: 'v3.1.0', date: '2026-02-18', note: 'Connection pooling enhancements with HikariCP 5.x.' },
    ],
    documentation: `### PostgreSQL Source Node
The PostgreSQL Source connector extracts high-volume structured data from PostgreSQL 11+ clusters.

#### Key Features:
- **Batch Query Execution**: Chunked pagination with server-side cursors.
- **Change Data Capture (CDC)**: Logical replication slot streaming with Wal2Json / pgoutput.
- **Failover Resiliency**: Automatic read-replica redirection during primary maintenance.
- **Security**: TLS 1.3 encryption with client-certificate mutual authentication.

#### Configuration Example:
\`\`\`json
{
  "host": "db.internal.production.net",
  "port": 5432,
  "database": "analytics_dw",
  "sslMode": "verify-full",
  "batchSize": 5000
}
\`\`\``,
  },
  {
    id: 'node-kafka-src-02',
    name: 'Kafka Stream Reader',
    category: 'Sources',
    categoryId: 'sources',
    subcategory: 'Kafka',
    subcategoryId: 'kafka',
    description: 'Consume from Apache Kafka topics with consumer group management and offset tracking.',
    version: 'v2.4.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'JVM 17',
    usesCount: 876,
    updatedDate: '2026-07-22',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: true,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: false,
    healthPercent: 96,
    healthDots: 5,
    metrics: {
      usageCount: '876',
      successRate: '97.4%',
      failureRate: '2.6%',
      avgExecTime: '12 ms',
    },
    ownerTeam: 'Streaming Team · Infra',
    author: 'Streaming Team',
    accentColor: '#3b82f6',
    instancePreviewName: 'kafka-events-in',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'JVM 17 / Apache Kafka 3.6+',
      supportedSources: 'Kafka Cluster 2.8–3.6',
      supportedDestinations: 'Transform / Sink',
    },
    configParameters: [
      { name: 'Bootstrap Servers', required: true, type: 'String (host:port)', default: 'kafka:9092' },
      { name: 'Topic Name', required: true, type: 'String / RegEx', default: 'telemetry.events' },
      { name: 'Consumer Group', required: true, type: 'String', default: 'connectiq-cg-01' },
      { name: 'Offset Reset', required: false, type: 'latest / earliest', default: 'latest' },
    ],
    dependencies: [
      { name: 'kafka-clients-3.6.1.jar', type: 'Required', status: 'ready' },
      { name: 'lz4-java 1.8.0', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [],
      outputs: [
        { id: 'out-1', name: 'messages', type: 'Stream', format: 'application/json' },
      ],
    },
    versions: [
      { version: 'v2.4.0', date: '2026-07-22', note: 'SASL_SSL SCRAM-SHA-512 authentication added.' },
      { version: 'v2.3.0', date: '2026-04-10', note: 'Automatic partition rebalance re-alignment.' },
    ],
    documentation: `### Kafka Stream Reader
High-performance distributed consumer that streams realtime events into ConnectIQ pipelines.`,
  },
  {
    id: 'node-rest-src-03',
    name: 'REST API Connector',
    category: 'Sources',
    categoryId: 'sources',
    subcategory: 'REST APIs',
    subcategoryId: 'rest-apis',
    description: 'HTTP/HTTPS source with OAuth 2.0, API key auth, pagination, rate-limit handling.',
    version: 'v1.8.3',
    minPlatformVersion: 'v3.5+',
    runtime: 'Node.js 20 / Python 3.11',
    usesCount: 654,
    updatedDate: '2026-06-30',
    status: 'Active',
    certification: 'Internal',
    isFavorite: false,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: false,
    isMostUsed: false,
    healthPercent: 91,
    healthDots: 4,
    metrics: {
      usageCount: '654',
      successRate: '94.8%',
      failureRate: '5.2%',
      avgExecTime: '380 ms',
    },
    ownerTeam: 'Integration Team · Data Eng',
    author: 'Integration Team',
    accentColor: '#3b82f6',
    instancePreviewName: 'http-inbound-01',
    compatibility: {
      platformVersion: 'v3.5+',
      runtime: 'HTTP/1.1 & HTTP/2',
      supportedSources: 'Any REST Endpoint',
      supportedDestinations: 'Any intermediate / sink',
    },
    configParameters: [
      { name: 'Endpoint URL', required: true, type: 'URL', default: 'https://api.service.com/v1/data' },
      { name: 'Auth Scheme', required: true, type: 'Bearer / Basic / ApiKey', default: 'Bearer' },
      { name: 'Pagination Mode', required: false, type: 'Cursor / Offset / LinkHeader', default: 'Cursor' },
      { name: 'Retry on 429', required: false, type: 'Boolean', default: 'true' },
    ],
    dependencies: [
      { name: 'undici-http-client', type: 'Required', status: 'ready' },
      { name: 'oauth2-token-refresher', type: 'Optional', status: 'ready' },
    ],
    ports: {
      inputs: [],
      outputs: [
        { id: 'out-1', name: 'json_records', type: 'JSON Array', format: 'application/json' },
      ],
    },
    versions: [
      { version: 'v1.8.3', date: '2026-06-30', note: 'Exponential backoff rate limit retry with jitter.' },
    ],
    documentation: `### REST API Connector
Pulls paginated batches or single resources from authenticated third-party web services.`,
  },
  {
    id: 'node-field-map-04',
    name: 'Field Mapper',
    category: 'Transformations',
    categoryId: 'transformations',
    subcategory: 'Field Mapping & Cast',
    subcategoryId: 'field-mapping',
    description: 'Map, rename, cast, and drop fields with visual schema editor and expression support.',
    version: 'v2.1.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'ConnectIQ Expression Engine',
    usesCount: 2041,
    updatedDate: '2026-07-01',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: true,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: true,
    healthPercent: 99,
    healthDots: 5,
    metrics: {
      usageCount: '2,041',
      successRate: '99.4%',
      failureRate: '0.6%',
      avgExecTime: '1.8 ms',
    },
    ownerTeam: 'Data Eng Team',
    author: 'Elena Rostova',
    accentColor: '#8b5cf6',
    instancePreviewName: 'map-schema-01',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'Native SIMD Vectorizer',
      supportedSources: 'Any stream / table',
      supportedDestinations: 'Any downstream node',
    },
    configParameters: [
      { name: 'Schema Definition', required: true, type: 'Schema JSON / Visual Mapping', default: 'Auto-detect' },
      { name: 'Strict Type Cast', required: false, type: 'Boolean', default: 'true' },
      { name: 'Drop Unmapped Fields', required: false, type: 'Boolean', default: 'false' },
    ],
    dependencies: [
      { name: 'arrow-memory-engine', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'source_records', type: 'RecordBatch' }],
      outputs: [{ id: 'out-1', name: 'mapped_records', type: 'RecordBatch' }],
    },
    versions: [
      { version: 'v2.1.0', date: '2026-07-01', note: 'Direct Apache Arrow zero-copy memory transformation.' },
    ],
    documentation: `### Field Mapper
Declarative field renaming, type conversion, timezone translation, and nested object flattening.`,
  },
  {
    id: 'node-filter-05',
    name: 'Filter & Cleanse',
    category: 'Transformations',
    categoryId: 'transformations',
    subcategory: 'Filter & Cleanse',
    subcategoryId: 'filtering',
    description: 'Conditional row filtering with SQL/RegEx predicates, deduplication, and anomaly rejection.',
    version: 'v3.0.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'Compiled Rule Engine',
    usesCount: 1680,
    updatedDate: '2026-07-18',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: false,
    isRecentlyUsed: false,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: true,
    healthPercent: 97,
    healthDots: 5,
    metrics: {
      usageCount: '1,680',
      successRate: '98.9%',
      failureRate: '1.1%',
      avgExecTime: '2.1 ms',
    },
    ownerTeam: 'Core Pipeline Team',
    author: 'David Kim',
    accentColor: '#8b5cf6',
    instancePreviewName: 'filter-rules-01',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'JIT Regex Engine',
      supportedSources: 'Any Record Stream',
      supportedDestinations: 'Split routes',
    },
    configParameters: [
      { name: 'Predicate Expression', required: true, type: 'SQL / CEL Expression', default: 'status == "active"' },
      { name: 'Emit Dropped to DLQ', required: false, type: 'Boolean', default: 'true' },
    ],
    dependencies: [
      { name: 'cel-parser-engine', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'input_records', type: 'RecordBatch' }],
      outputs: [
        { id: 'out-1', name: 'passed', type: 'RecordBatch' },
        { id: 'out-2', name: 'rejected', type: 'DeadLetterBatch' },
      ],
    },
    versions: [
      { version: 'v3.0.0', date: '2026-07-18', note: 'Common Expression Language (CEL) execution speedup.' },
    ],
    documentation: `### Filter & Cleanse
Filters out invalid records, strips whitespaces, removes unwanted nulls, and routes rejected rows to DLQs.`,
  },
  {
    id: 'node-python-transform-06',
    name: 'Python Script Worker',
    category: 'Transformations',
    categoryId: 'transformations',
    subcategory: 'Scripting (Python/SQL)',
    subcategoryId: 'scripting',
    description: 'Execute arbitrary Python 3.11 pandas/numpy data transformations inside isolated sandboxes.',
    version: 'v1.4.2',
    minPlatformVersion: 'v4.0+',
    runtime: 'Python 3.11 WASM / Container',
    usesCount: 520,
    updatedDate: '2026-08-05',
    status: 'Active',
    certification: 'Custom',
    isFavorite: true,
    isRecentlyUsed: false,
    isCustom: true,
    isEnterprise: false,
    isMostUsed: false,
    healthPercent: 94,
    healthDots: 4,
    metrics: {
      usageCount: '520',
      successRate: '95.6%',
      failureRate: '4.4%',
      avgExecTime: '45 ms',
    },
    ownerTeam: 'ML Engineering',
    author: 'Priya Patel',
    accentColor: '#8b5cf6',
    instancePreviewName: 'py-worker-ml',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'CPython 3.11 Sandbox',
      supportedSources: 'DataFrames',
      supportedDestinations: 'Transformed Records',
    },
    configParameters: [
      { name: 'Entrypoint Function', required: true, type: 'String (def transform(df))', default: 'transform' },
      { name: 'Memory Limit', required: false, type: 'MB (default: 1024)', default: '1024' },
      { name: 'Timeout Seconds', required: false, type: 'Seconds', default: '60' },
    ],
    dependencies: [
      { name: 'pandas-2.2.0', type: 'Required', status: 'ready' },
      { name: 'numpy-1.26.4', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'df_in', type: 'DataFrame' }],
      outputs: [{ id: 'out-1', name: 'df_out', type: 'DataFrame' }],
    },
    versions: [
      { version: 'v1.4.2', date: '2026-08-05', note: 'Upgraded sandboxed container base image.' },
    ],
    documentation: `### Python Script Worker
Allows data scientists to inject custom analytics, model inferences, and complex heuristics into pipelines.`,
  },
  {
    id: 'node-schema-val-07',
    name: 'Schema Integrity Validator',
    category: 'Validation',
    categoryId: 'validation',
    subcategory: 'Schema Integrity',
    subcategoryId: 'schema-integrity',
    description: 'Validate incoming payloads against JSON Schema / Avro specs with dead-letter queue routing.',
    version: 'v2.2.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'High-speed JSON Validator',
    usesCount: 1420,
    updatedDate: '2026-07-25',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: false,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: false,
    healthPercent: 99,
    healthDots: 5,
    metrics: {
      usageCount: '1,420',
      successRate: '99.8%',
      failureRate: '0.2%',
      avgExecTime: '0.9 ms',
    },
    ownerTeam: 'Governance Team',
    author: 'Jordan Lee',
    accentColor: '#f59e0b',
    instancePreviewName: 'val-schema-01',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'JSON Schema Draft 2020-12',
      supportedSources: 'Any Payload',
      supportedDestinations: 'Validated Stream',
    },
    configParameters: [
      { name: 'Schema URI / Spec', required: true, type: 'JSON Schema / Avro', default: 'urn:schema:user_event_v1' },
      { name: 'Validation Level', required: false, type: 'Strict / Coercive / Warning', default: 'Strict' },
    ],
    dependencies: [
      { name: 'ajv-schema-validator', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'raw_payloads', type: 'JSON Stream' }],
      outputs: [
        { id: 'out-1', name: 'valid', type: 'JSON Stream' },
        { id: 'out-2', name: 'schema_errors', type: 'Error Stream' },
      ],
    },
    versions: [
      { version: 'v2.2.0', date: '2026-07-25', note: 'JSON Schema Draft 2020-12 dialect support.' },
    ],
    documentation: `### Schema Integrity Validator
Prevents schema drift and malformed data from contaminating downstream data warehouses.`,
  },
  {
    id: 'node-snowflake-dst-08',
    name: 'Snowflake Warehouse Sink',
    category: 'Destinations',
    categoryId: 'destinations',
    subcategory: 'Cloud Warehouses',
    subcategoryId: 'cloud-warehouses',
    description: 'High-throughput bulk copy loading into Snowflake staging and production tables.',
    version: 'v3.1.4',
    minPlatformVersion: 'v4.x+',
    runtime: 'Snowflake JDBC / Snowpipe',
    usesCount: 1120,
    updatedDate: '2026-07-28',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: true,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: true,
    healthPercent: 97,
    healthDots: 5,
    metrics: {
      usageCount: '1,120',
      successRate: '98.1%',
      failureRate: '1.9%',
      avgExecTime: '3.4 s',
    },
    ownerTeam: 'Analytics Infra',
    author: 'Rachel Moore',
    accentColor: '#0d9488',
    instancePreviewName: 'sf-wh-prod',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'Snowflake SQL API & Snowpipe',
      supportedSources: 'Any Transformed Record',
      supportedDestinations: 'Snowflake Stage & Table',
    },
    configParameters: [
      { name: 'Account Identifier', required: true, type: 'String (org-account)', default: 'xy12345.us-east-1' },
      { name: 'Warehouse', required: true, type: 'String', default: 'LOAD_WH_XSM' },
      { name: 'Target Table', required: true, type: 'String (DB.SCHEMA.TABLE)', default: 'PROD_DB.ANALYTICS.EVENTS' },
      { name: 'Write Mode', required: false, type: 'Append / Merge / Truncate', default: 'Merge' },
    ],
    dependencies: [
      { name: 'snowflake-jdbc-3.14.4.jar', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'records', type: 'Table Stream' }],
      outputs: [{ id: 'out-1', name: 'ingest_status', type: 'Audit Event' }],
    },
    versions: [
      { version: 'v3.1.4', date: '2026-07-28', note: 'Optimized micro-batch Snowpipe REST streaming.' },
    ],
    documentation: `### Snowflake Warehouse Sink
Delivers transformed records directly into Snowflake data cloud tables with automated deduplication.`,
  },
  {
    id: 'node-s3-dst-09',
    name: 'Amazon S3 Parquet Sink',
    category: 'Destinations',
    categoryId: 'destinations',
    subcategory: 'Cloud Storage',
    subcategoryId: 'cloud-buckets',
    description: 'Write compressed columnar Parquet or Snappy files directly to partitioned S3 buckets.',
    version: 'v2.8.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'AWS SDK v3 / Parquet Engine',
    usesCount: 950,
    updatedDate: '2026-07-10',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: false,
    isRecentlyUsed: false,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: false,
    healthPercent: 98,
    healthDots: 5,
    metrics: {
      usageCount: '950',
      successRate: '99.2%',
      failureRate: '0.8%',
      avgExecTime: '1.5 s',
    },
    ownerTeam: 'Storage Team',
    author: 'Chris Taylor',
    accentColor: '#0d9488',
    instancePreviewName: 's3-lake-sink',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'AWS S3 API',
      supportedSources: 'DataFrames / Tables',
      supportedDestinations: 'S3 URI',
    },
    configParameters: [
      { name: 'S3 Bucket URI', required: true, type: 's3://bucket/path/', default: 's3://datalake-prod-archive/' },
      { name: 'Partition Pattern', required: false, type: 'String (/year=YYYY/month=MM/)', default: '/year={YYYY}/month={MM}/' },
      { name: 'Compression Codec', required: false, type: 'Snappy / GZIP / ZSTD', default: 'Snappy' },
    ],
    dependencies: [
      { name: 'aws-sdk-s3', type: 'Required', status: 'ready' },
      { name: 'parquetjs-engine', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'parquet_records', type: 'Table Stream' }],
      outputs: [{ id: 'out-1', name: 's3_manifest', type: 'File Manifest' }],
    },
    versions: [
      { version: 'v2.8.0', date: '2026-07-10', note: 'ZSTD compression algorithm support with dictionary training.' },
    ],
    documentation: `### Amazon S3 Parquet Sink
Dumps large volumes into object storage in Apache Parquet format ready for Amazon Athena and AWS Glue.`,
  },
  {
    id: 'node-rate-limiter-10',
    name: 'Token Bucket Rate Limiter',
    category: 'Utilities',
    categoryId: 'utilities',
    subcategory: 'Rate Limiter',
    subcategoryId: 'rate-limiting',
    description: 'Regulate downstream egress throughput with burst tokens and smooth pacing windows.',
    version: 'v2.0.1',
    minPlatformVersion: 'v4.x+',
    runtime: 'Atomic Token Bucket',
    usesCount: 890,
    updatedDate: '2026-06-25',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: false,
    isRecentlyUsed: false,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: false,
    healthPercent: 99,
    healthDots: 5,
    metrics: {
      usageCount: '890',
      successRate: '99.9%',
      failureRate: '0.1%',
      avgExecTime: '0.1 ms',
    },
    ownerTeam: 'Core Architecture',
    author: 'Elena Rostova',
    accentColor: '#64748b',
    instancePreviewName: 'pace-limiter-01',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'Distributed Redis / In-Memory',
      supportedSources: 'Any Event Flow',
      supportedDestinations: 'Paced Stream',
    },
    configParameters: [
      { name: 'Rate Limit (req/sec)', required: true, type: 'Integer', default: '500' },
      { name: 'Burst Capacity', required: false, type: 'Integer', default: '1000' },
    ],
    dependencies: [
      { name: 'ioredis-client', type: 'Optional (Cluster Mode)', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'in_events', type: 'Stream' }],
      outputs: [{ id: 'out-1', name: 'paced_events', type: 'Stream' }],
    },
    versions: [
      { version: 'v2.0.1', date: '2026-06-25', note: 'Cluster-wide synchronization over Redis.' },
    ],
    documentation: `### Token Bucket Rate Limiter
Prevents overwhelming downstream legacy APIs or databases with bursty traffic spikes.`,
  },
  {
    id: 'node-masking-11',
    name: 'PII / PCI Masking Node',
    category: 'Utilities',
    categoryId: 'utilities',
    subcategory: 'Encryption & Masking',
    subcategoryId: 'encryption',
    description: 'Cryptographic tokenization and format-preserving masking for emails, SSNs, and cards.',
    version: 'v1.9.0',
    minPlatformVersion: 'v4.x+',
    runtime: 'AES-256 GCM / Vault',
    usesCount: 1340,
    updatedDate: '2026-07-30',
    status: 'Active',
    certification: 'Enterprise',
    isFavorite: true,
    isRecentlyUsed: true,
    isCustom: false,
    isEnterprise: true,
    isMostUsed: false,
    healthPercent: 98,
    healthDots: 5,
    metrics: {
      usageCount: '1,340',
      successRate: '99.5%',
      failureRate: '0.5%',
      avgExecTime: '0.8 ms',
    },
    ownerTeam: 'Security & Compliance',
    author: 'Hannah Woods',
    accentColor: '#64748b',
    instancePreviewName: 'pii-masker-sec',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: 'FIPS 140-2 Crypto Provider',
      supportedSources: 'Sensitive Records',
      supportedDestinations: 'Sanitized Records',
    },
    configParameters: [
      { name: 'Masking Rules', required: true, type: 'JSON Pattern Config', default: '{"ssn":"XXX-XX-####","email":"mask"}' },
      { name: 'Key Vault Provider', required: true, type: 'HashiCorp Vault / AWS KMS', default: 'HashiCorp Vault' },
    ],
    dependencies: [
      { name: 'vault-transit-client', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [{ id: 'in-1', name: 'raw_records', type: 'Table Stream' }],
      outputs: [{ id: 'out-1', name: 'sanitized_records', type: 'Table Stream' }],
    },
    versions: [
      { version: 'v1.9.0', date: '2026-07-30', note: 'Hardware-accelerated AES-NI cryptographic pipeline.' },
    ],
    documentation: `### PII / PCI Masking Node
Ensures compliance with GDPR, HIPAA, and PCI-DSS by sanitizing identifying attributes before storage.`,
  },
  {
    id: 'node-legacy-soap-12',
    name: 'Legacy SOAP XML Consumer',
    category: 'Sources',
    categoryId: 'sources',
    subcategory: 'SOAP',
    subcategoryId: 'soap',
    description: 'Deprecated XML-RPC/SOAP 1.1 connector. Scheduled for end-of-life Q4 2026.',
    version: 'v0.9.8',
    minPlatformVersion: 'v3.0+',
    runtime: 'Legacy XML Engine',
    usesCount: 85,
    updatedDate: '2025-11-20',
    status: 'Deprecated',
    certification: 'Internal',
    isFavorite: false,
    isRecentlyUsed: false,
    isCustom: false,
    isEnterprise: false,
    isMostUsed: false,
    healthPercent: 78,
    healthDots: 3,
    metrics: {
      usageCount: '85',
      successRate: '82.5%',
      failureRate: '17.5%',
      avgExecTime: '1.2 s',
    },
    ownerTeam: 'Platform Team',
    author: 'Thomas Wright',
    accentColor: '#ef4444',
    instancePreviewName: 'legacy-soap-ws',
    compatibility: {
      platformVersion: 'v3.0+',
      runtime: 'SOAP 1.1 / WSDL 1.1',
      supportedSources: 'WSDL Endpoint',
      supportedDestinations: 'XML Payload',
    },
    configParameters: [
      { name: 'WSDL URL', required: true, type: 'URL', default: 'http://legacy.server/ws?wsdl' },
      { name: 'SOAP Action', required: true, type: 'String', default: 'GetCustomerBatch' },
    ],
    dependencies: [
      { name: 'soap-envelope-parser', type: 'Required', status: 'ready' },
    ],
    ports: {
      inputs: [],
      outputs: [{ id: 'out-1', name: 'xml_nodes', type: 'XML' }],
    },
    versions: [
      { version: 'v0.9.8', date: '2025-11-20', note: 'Security patches for legacy XML entity parsing.' },
    ],
    documentation: `### Legacy SOAP XML Consumer (Deprecated)
Maintained for backwards compatibility. Please migrate pipelines to REST or gRPC connectors.`,
  },
];

/**
 * Fetch the node catalog with filters, search, and category scoping.
 */
export async function getNodeCatalog({ orgId = 'current', search, category, subcategory, quickFilter, connectorType, status, compatibility, owner, certification, sort = 'most_used' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'all' && category !== 'All Categories') params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (quickFilter) params.set('quickFilter', quickFilter);
    if (connectorType && connectorType !== 'All Connector Types') params.set('connectorType', connectorType);
    if (status && status !== 'All Statuses') params.set('status', status);
    if (compatibility && compatibility !== 'All Versions') params.set('compatibility', compatibility);
    if (owner && owner !== 'All Owners') params.set('owner', owner);
    if (certification && certification !== 'All Certifications') params.set('certification', certification);
    if (sort) params.set('sort', sort);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations/${orgId}/pipeline-nodes${queryStr}`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          total: data.total || data.items.length,
          mocked: false,
          lastUpdated: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Graceful fallback to mock data
  }

  // Filter mock items
  let filtered = [...INITIAL_NODES];

  if (category && category !== 'all' && category !== 'All Categories') {
    filtered = filtered.filter(
      (n) => n.categoryId.toLowerCase() === category.toLowerCase() || n.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (subcategory && subcategory !== 'all') {
    filtered = filtered.filter(
      (n) => n.subcategoryId?.toLowerCase() === subcategory.toLowerCase() || n.subcategory?.toLowerCase() === subcategory.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.subcategory?.toLowerCase().includes(q) ||
        n.ownerTeam.toLowerCase().includes(q) ||
        n.version.toLowerCase().includes(q)
    );
  }

  if (connectorType && connectorType !== 'All Connector Types') {
    filtered = filtered.filter((n) => n.subcategory?.toLowerCase() === connectorType.toLowerCase());
  }

  if (status && status !== 'All Statuses') {
    filtered = filtered.filter((n) => n.status.toLowerCase() === status.toLowerCase());
  }

  if (compatibility && compatibility !== 'All Versions') {
    filtered = filtered.filter((n) => n.minPlatformVersion.toLowerCase().includes(compatibility.toLowerCase()));
  }

  if (owner && owner !== 'All Owners') {
    filtered = filtered.filter((n) => n.ownerTeam.toLowerCase().includes(owner.toLowerCase()));
  }

  if (certification && certification !== 'All Certifications') {
    filtered = filtered.filter((n) => n.certification.toLowerCase() === certification.toLowerCase());
  }

  // Quick filter pills
  if (quickFilter) {
    switch (quickFilter) {
      case 'favorites':
        filtered = filtered.filter((n) => n.isFavorite);
        break;
      case 'recently_used':
        filtered = filtered.filter((n) => n.isRecentlyUsed);
        break;
      case 'custom':
        filtered = filtered.filter((n) => n.isCustom);
        break;
      case 'enterprise':
        filtered = filtered.filter((n) => n.isEnterprise);
        break;
      case 'most_used':
        filtered = filtered.filter((n) => n.isMostUsed || n.usesCount > 1000);
        break;
      default:
        break;
    }
  }

  // Sorting
  switch (sort) {
    case 'name_asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name_desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'highest_rated':
      filtered.sort((a, b) => b.healthPercent - a.healthPercent);
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
      break;
    case 'most_used':
    default:
      filtered.sort((a, b) => b.usesCount - a.usesCount);
      break;
  }

  return {
    items: filtered,
    total: 284,
    filteredCount: filtered.length,
    mocked: true,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch category definitions and dynamic counts
 */
export async function getNodeCategories({ orgId = 'current' } = {}) {
  try {
    const res = await apiFetch(`/organizations/${orgId}/pipeline-node-categories`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && Array.isArray(data.categories)) {
        return { categories: data.categories, mocked: false };
      }
    }
  } catch {
    // fallback
  }

  return { categories: INITIAL_CATEGORIES, mocked: true };
}

/**
 * Fetch summary KPI metrics
 */
export async function getNodeMetrics({ orgId = 'current' } = {}) {
  try {
    const res = await apiFetch(`/organizations/${orgId}/pipeline-node-metrics`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.metrics) {
        return { metrics: data.metrics, mocked: false };
      }
    }
  } catch {
    // fallback
  }

  return { metrics: INITIAL_METRICS, mocked: true };
}

/**
 * Create a new custom node
 */
export async function createCustomNode({ orgId = 'current', payload } = {}) {
  try {
    const res = await apiFetch(`/organizations/${orgId}/pipeline-nodes`, {
      method: 'POST',
      body: payload,
    });
    if (res.ok) {
      const data = await readJson(res);
      return { success: true, node: data, mocked: false };
    }
  } catch {
    // fallback
  }

  // Simulated creation
  const newNode = {
    id: `node-custom-${Date.now()}`,
    name: payload.name || 'Custom Node',
    category: payload.category || 'Transformations',
    categoryId: (payload.category || 'transformations').toLowerCase(),
    subcategory: payload.subcategory || 'Custom Script',
    subcategoryId: 'custom',
    description: payload.description || 'Custom authored pipeline node component.',
    version: 'v1.0.0',
    minPlatformVersion: 'v4.0+',
    runtime: payload.runtime || 'Python 3.11',
    usesCount: 1,
    updatedDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    certification: 'Custom',
    isFavorite: false,
    isRecentlyUsed: true,
    isCustom: true,
    isEnterprise: false,
    isMostUsed: false,
    healthPercent: 100,
    healthDots: 5,
    metrics: {
      usageCount: '1',
      successRate: '100%',
      failureRate: '0%',
      avgExecTime: '15 ms',
    },
    ownerTeam: payload.ownerTeam || 'Custom Development',
    author: payload.author || 'Current User',
    accentColor: '#8b5cf6',
    instancePreviewName: payload.name ? payload.name.toLowerCase().replace(/\s+/g, '-') : 'custom-node',
    compatibility: {
      platformVersion: 'v4.0+',
      runtime: payload.runtime || 'Python 3.11',
      supportedSources: 'Any stream',
      supportedDestinations: 'Any sink',
    },
    configParameters: payload.configParameters || [
      { name: 'Parameter 1', required: true, type: 'String', default: 'default_val' },
    ],
    dependencies: payload.dependencies || [],
    ports: payload.ports || {
      inputs: [{ id: 'in-1', name: 'input_data', type: 'JSON' }],
      outputs: [{ id: 'out-1', name: 'output_data', type: 'JSON' }],
    },
    versions: [
      { version: 'v1.0.0', date: new Date().toISOString().slice(0, 10), note: 'Initial release.' },
    ],
    documentation: `### ${payload.name || 'Custom Node'}\n${payload.description || ''}`,
  };

  return { success: true, node: newNode, mocked: true };
}

/**
 * Import a node package archive / JSON manifest
 */
export async function importNodePackage({ orgId = 'current', packageData } = {}) {
  try {
    const res = await apiFetch(`/organizations/${orgId}/pipeline-nodes/import`, {
      method: 'POST',
      body: packageData,
    });
    if (res.ok) {
      const data = await readJson(res);
      return { success: true, count: data.importedCount || 1, mocked: false };
    }
  } catch {
    // fallback
  }

  return { success: true, count: 1, mocked: true };
}

/**
 * Export catalog definitions in JSON / CSV / YAML format
 */
export function exportCatalogFile(items, format = 'json') {
  if (format === 'json') {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectiq-node-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  if (format === 'csv') {
    const headers = ['ID', 'Name', 'Category', 'Subcategory', 'Version', 'Status', 'Certification', 'Uses', 'Success Rate', 'Owner'];
    const rows = items.map((item) => [
      item.id,
      `"${item.name}"`,
      item.category,
      item.subcategory,
      item.version,
      item.status,
      item.certification,
      item.usesCount,
      item.metrics.successRate,
      `"${item.ownerTeam}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectiq-node-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  if (format === 'yaml') {
    const yamlLines = ['# ConnectIQ Node Catalog Export', `version: '1.0'`, 'nodes:'];
    items.forEach((item) => {
      yamlLines.push(`  - id: "${item.id}"`);
      yamlLines.push(`    name: "${item.name}"`);
      yamlLines.push(`    category: "${item.category}"`);
      yamlLines.push(`    subcategory: "${item.subcategory}"`);
      yamlLines.push(`    version: "${item.version}"`);
      yamlLines.push(`    status: "${item.status}"`);
      yamlLines.push(`    certification: "${item.certification}"`);
      yamlLines.push(`    runtime: "${item.runtime}"`);
      yamlLines.push(`    ownerTeam: "${item.ownerTeam}"`);
    });
    const blob = new Blob([yamlLines.join('\n')], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectiq-node-catalog-${new Date().toISOString().slice(0, 10)}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  return false;
}
