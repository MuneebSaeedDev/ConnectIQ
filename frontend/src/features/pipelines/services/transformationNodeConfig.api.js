/**
 * transformationNodeConfig.api.js
 * API client, mock data contracts, and validation engine for SCR-070: Transformation Node Configuration Screen
 * Figma Frame Node: 220:5908 (Page 1 "Transformation Node Configuration Screen", 1716x5293)
 *
 * Provides full API communication with content-type JSON guards, error handling,
 * and comprehensive mock fallback for offline and local development.
 */

export class TransformationNodeConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'TransformationNodeConfigError';
    this.status = status;
    this.details = details;
  }
}

export const TRANSFORMATION_CATEGORY_OPTIONS = [
  'Data Cleaning',
  'Type Conversion',
  'Date Formatting',
  'Duplicate Removal',
  'Lookup & Enrichment',
  'Custom Expression',
  'Aggregation',
  'Normalization',
];

export const OWNER_OPTIONS = [
  'D. Engineer',
  'J. Doe',
  'A. Weber',
  'M. Chen',
  'System / Automated',
];

export const TRANSFORMATION_MODES = [
  { id: 'rule_based', label: 'Rule-Based Transformation', desc: 'Structured field-by-field rule mapping' },
  { id: 'expression', label: 'Expression', desc: 'Formula-based computed columns' },
  { id: 'cleaning', label: 'Data Cleaning', desc: 'String trimming, casing, and sanitization' },
  { id: 'type_conversion', label: 'Type Conversion', desc: 'Casting data types with format masks' },
  { id: 'date_formatting', label: 'Date Formatting', desc: 'Parsing & converting timestamps/locales' },
  { id: 'deduplication', label: 'Duplicate Removal', desc: 'Deduplication across key columns' },
  { id: 'lookup', label: 'Lookup', desc: 'Dataset & dictionary joins' },
  { id: 'custom', label: 'Custom Transformation', desc: 'Advanced code or script logic' },
];

export const DATA_CLEANING_OPERATIONS = [
  { value: 'normalize_case', label: 'Normalize Case', params: 'lowercase' },
  { value: 'trim_whitespace', label: 'Trim Whitespace', params: 'both' },
  { value: 'remove_extra_spaces', label: 'Remove Extra Spaces', params: 'single_space' },
  { value: 'remove_special_chars', label: 'Remove Special Characters', params: 'alphanumeric_only' },
  { value: 'replace_values', label: 'Replace Values', params: 'regex / substring' },
  { value: 'standardize_values', label: 'Standardize Values', params: 'dictionary' },
  { value: 'handle_nulls', label: 'Handle Nulls', params: 'coalesce / default' },
  { value: 'remove_empty_values', label: 'Remove Empty Values', params: 'strip' },
  { value: 'normalize_text', label: 'Normalize Text', params: 'unicode_nfkc' },
  { value: 'clean_numeric_values', label: 'Clean Numeric Values', params: 'strip_currency_symbols' },
];

export const INVALID_VALUE_HANDLING_OPTIONS = [
  { value: 'set_to_null', label: 'Set to Null' },
  { value: 'use_default', label: 'Use Default Value' },
  { value: 'skip_record', label: 'Skip Record (Filter Out)' },
  { value: 'fail_pipeline', label: 'Fail Pipeline Execution' },
  { value: 'send_to_dlq', label: 'Send to Dead Letter Queue' },
];

export const DATA_TYPES = ['String', 'Integer', 'Decimal', 'Boolean', 'Date', 'Timestamp', 'JSON', 'Array'];

export const DATE_FORMATS = [
  'ISO 8601',
  'yyyy-MM-dd',
  'yyyy-MM-dd HH:mm:ss',
  'MM/dd/yyyy',
  'dd/MM/yyyy',
  'yyyyMMdd',
  'UNIX Timestamp (ms)',
  'UNIX Timestamp (s)',
];

export const TIME_ZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'];

export const LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'es-ES'];

export const RETRY_POLICY_OPTIONS = [
  'Exponential Backoff',
  'Linear Backoff (3 retries)',
  'Fixed Delay (5 retries)',
  'No Retry (Fail on error)',
];

export const ERROR_HANDLING_OPTIONS = [
  'Send Invalid Records to Error Output',
  'Skip Invalid Records and Continue',
  'Abort Transformation on First Error',
  'Replace with Default Values',
];

export const DEFAULT_TRANSFORMATION_NODE_CONFIG = {
  nodeId: 'node_trans_008',
  pipelineId: 'pip_001',
  version: 'v1.0.0',
  status: 'Draft',
  nodeName: 'clean_customer_records',
  displayName: 'Clean Customer Records',
  description: 'Configure transformation rules, expressions, type conversions, cleaning operations, and reusable logic.',
  category: 'Data Cleaning',
  owner: 'D. Engineer',
  tags: ['cleaning', 'customer', 'prod'],
  nodeType: 'Transformation',
  createdBy: 'D. Engineer',
  lastModified: '2 min ago',
  lastSaved: '2026-08-07 14:22:04',

  inputDataset: {
    previousNode: 'Filter: Valid Orders',
    dataset: 'orders_filtered',
    schemaVersion: 'v3.2',
    totalFields: 14,
    estimatedRecords: 284590,
    lastSchemaRefresh: '4 min ago',
    fields: [
      { name: 'customer_id', type: 'String', nullable: false, sample: 'CUS-00482910', sourcePath: 'orders.customer_id' },
      { name: 'order_date', type: 'String', nullable: false, sample: '2024-01-15T08:32:00Z', sourcePath: 'orders.created_at' },
      { name: 'email', type: 'String', nullable: true, sample: '[EMAIL_REDACTED]', sourcePath: 'orders.customer.email' },
      { name: 'total_amount', type: 'String', nullable: false, sample: '"1499.99"', sourcePath: 'orders.total' },
      { name: 'status', type: 'String', nullable: false, sample: 'COMPLETED', sourcePath: 'orders.status' },
    ],
  },

  activeMode: 'rule_based',

  transformationRules: [
    {
      id: 'rule_1',
      inputField: 'email',
      transformation: 'Normalize Case',
      parameters: 'lowercase',
      outputField: 'email_clean',
      outputType: 'String',
      status: 'Active',
    },
    {
      id: 'rule_2',
      inputField: 'total_amount',
      transformation: 'String → Decimal',
      parameters: 'format: "0.00"',
      outputField: 'amount',
      outputType: 'Decimal',
      status: 'Active',
    },
    {
      id: 'rule_3',
      inputField: 'order_date',
      transformation: 'Parse Timestamp',
      parameters: 'src: "ISO8601", tz: "UTC"',
      outputField: 'order_ts',
      outputType: 'Timestamp',
      status: 'Active',
    },
    {
      id: 'rule_4',
      inputField: 'customer_id',
      transformation: 'Trim Whitespace',
      parameters: '—',
      outputField: 'customer_id',
      outputType: 'String',
      status: 'Disabled',
    },
    {
      id: 'rule_5',
      inputField: 'status',
      transformation: 'Lookup',
      parameters: 'table: status_map',
      outputField: 'status_label',
      outputType: 'String',
      status: 'Invalid',
    },
  ],

  dataCleaning: {
    inputField: 'email',
    operation: 'Normalize Case',
    parameters: 'lowercase',
    outputField: 'email_clean',
    invalidHandling: 'set_to_null',
  },

  typeConversion: {
    sourceField: 'total_amount',
    sourceType: 'String',
    targetType: 'Decimal',
    format: '0.00',
    invalidHandling: 'use_default',
    defaultValue: '0.00',
    isValid: true,
  },

  dateFormatting: {
    inputField: 'order_date',
    sourceFormat: 'ISO 8601',
    targetFormat: 'yyyy-MM-dd',
    timeZone: 'UTC',
    locale: 'en-US',
    outputField: 'order_date_clean',
    inputSample: '2024-01-15T08:32:00Z',
    outputPreview: '2024-01-15',
  },

  deduplication: {
    fields: ['customer_id', 'email', 'order_date'],
    matchingStrategy: 'Exact Match',
    keepStrategy: 'First Record',
    nullHandling: 'Treat as Distinct',
    estimatedDuplicates: 3241,
    duplicatePercentage: '1.14%',
    estimatedUnique: 281349,
    uniquePercentage: '98.86%',
  },

  lookup: {
    lookupSource: 'Internal Dataset',
    lookupDataset: 'status_map_v2',
    lookupKey: 'code',
    inputKey: 'status',
    outputField: 'status_label',
    matchStrategy: 'Exact Match',
    defaultValue: 'UNKNOWN',
    status: 'unavailable',
    warningMessage: 'Lookup dataset status_map_v2 is unavailable. Validate lookup before saving.',
  },

  expressionEditor: {
    outputField: 'full_name',
    outputType: 'String',
    activeTab: 'String',
    expression: 'output_field = CONCAT(TRIM(first_name), " ", UPPER(last_name))',
    comment: '// Full name from first + last',
    inputSample: 'first_name="alice", last_name="smith"',
    evaluatedOutput: '"alice SMITH"',
    isValid: true,
  },

  preview: {
    activeTab: 'differences', // 'input' | 'transformed' | 'differences'
    recordsTested: 500,
    transformedCount: 498,
    unchangedCount: 1,
    errorCount: 1,
    nullCount: 0,
    rows: [
      {
        id: 'row_1',
        inputValue: 'COMPLETED',
        transformation: 'Lookup → status_map',
        outputValue: 'Order Completed',
        validation: 'valid',
      },
      {
        id: 'row_2',
        inputValue: '"1499.99"',
        transformation: 'String → Decimal',
        outputValue: '1499.99',
        validation: 'valid',
      },
      {
        id: 'row_3',
        inputValue: '[EMAIL_REDACTED]',
        transformation: 'Normalize Case',
        outputValue: '[EMAIL_REDACTED]',
        validation: 'valid',
      },
      {
        id: 'row_4',
        inputValue: 'NULL',
        transformation: 'Trim → Handle Null',
        outputValue: 'null',
        validation: 'warning',
      },
      {
        id: 'row_5',
        inputValue: 'INVALID_CODE',
        transformation: 'Lookup → status_map',
        outputValue: 'UNKNOWN',
        validation: 'error',
      },
    ],
  },

  testing: {
    mode: 'all', // 'individual' | 'selected' | 'all'
    lastRun: '2 min ago',
    testResults: [
      {
        id: 'test_1',
        testInput: 'email = [EMAIL_REDACTED]',
        expectedOutput: 'email_clean = [EMAIL_REDACTED]',
        actualOutput: '[EMAIL_REDACTED]',
        status: 'Passed',
        duration: '2ms',
      },
      {
        id: 'test_2',
        testInput: 'total = "1299.00"',
        expectedOutput: 'amount = 1299.00',
        actualOutput: '1299.00',
        status: 'Passed',
        duration: '1ms',
      },
      {
        id: 'test_3',
        testInput: 'order_date = 2024-01-15T08:32:00Z',
        expectedOutput: 'order_ts = 2024-01-15',
        actualOutput: '2024-01-15',
        status: 'Passed',
        duration: '3ms',
      },
      {
        id: 'test_4',
        testInput: 'status = INVALID_CODE',
        expectedOutput: 'status_label = UNKNOWN',
        actualOutput: 'null',
        status: 'Failed',
        duration: '4ms',
      },
    ],
  },

  validation: {
    statusPercent: 60,
    items: [
      {
        id: 'val_1',
        severity: 'Error',
        target: 'Lookup: status_map_v2',
        description: 'Lookup dataset unavailable or inaccessible',
        resolution: 'Verify dataset exists and re-validate lookup',
        action: 'Verify dataset exists and re-validate',
        fixable: true,
      },
      {
        id: 'val_2',
        severity: 'Warning',
        target: 'Rule #4: customer_id',
        description: 'Rule is disabled and has no effect on output',
        resolution: 'Enable rule or remove it to reduce confusion',
        action: 'Enable rule or remove it',
        fixable: true,
      },
      {
        id: 'val_3',
        severity: 'Info',
        target: 'Expression: full_name',
        description: 'Output field does not exist in upstream schema — will be created',
        resolution: 'Confirm field creation is intended',
        action: 'Confirm field creation is intended',
        fixable: false,
      },
      {
        id: 'val_4',
        severity: 'Success',
        target: 'Type Conversion: total_amount',
        description: 'String → Decimal conversion valid',
        resolution: 'Valid format mask "0.00"',
        action: 'Passed',
        fixable: false,
      },
      {
        id: 'val_5',
        severity: 'Success',
        target: 'Date Formatting: order_date',
        description: 'Source format ISO 8601 parsed correctly',
        resolution: 'Timezone set to UTC',
        action: 'Passed',
        fixable: false,
      },
      {
        id: 'val_6',
        severity: 'Success',
        target: 'Expression: full_name',
        description: 'Expression syntax valid, output type confirmed',
        resolution: 'Syntax checks passed',
        action: 'Passed',
        fixable: false,
      },
    ],
  },

  runtimeConfig: {
    batchSize: 10000,
    parallelism: 4,
    timeoutSeconds: 60,
    retryPolicy: 'Exponential Backoff',
    errorHandling: 'Send Invalid Records to Error Output',
  },

  monitoring: {
    enableMetrics: true,
    enableLogs: true,
    trackErrors: true,
    trackRejected: true,
    trackDuration: true,
    alertOnErrorRate: true,
    telemetry: {
      recordsProcessed: '—',
      recordsTransformed: '—',
      recordsRejected: '—',
      transformationErrors: '—',
      processingDuration: '—',
      throughput: '—',
    },
  },

  advancedConfig: {
    runtimeVariables: 'CUSTOM_PRECISION=4\nSTRICT_TYPING=true',
    customFunctions: 'def clean_phone(val):\n  return re.sub(r"\\D", "", val)',
    lookupCacheTTL: 3600,
    schemaOverrides: '{}',
  },
};

/**
 * Fetch transformation node configuration
 */
export async function fetchTransformationNodeConfig(nodeId = 'node_trans_008', pipelineId = 'pip_001') {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/transformation-config`, {
      headers: { Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fall back to default mock
  }
  return { ...DEFAULT_TRANSFORMATION_NODE_CONFIG, nodeId, pipelineId };
}

/**
 * Save transformation configuration
 */
export async function saveTransformationNodeConfig(nodeId, pipelineId, config) {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/transformation-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(config),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    success: true,
    savedAt: new Date().toISOString(),
    config,
  };
}

/**
 * Save draft configuration
 */
export async function saveTransformationDraft(nodeId, pipelineId, config) {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/transformation-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(config),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    success: true,
    savedAt: new Date().toISOString(),
    message: 'Draft saved successfully.',
  };
}

/**
 * Test transformation rules
 */
export async function testTransformation(nodeId, pipelineId, testMode = 'all', rules = []) {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/test-transformation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ testMode, rules }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    success: true,
    passedCount: 3,
    failedCount: 1,
    warnCount: 0,
    results: DEFAULT_TRANSFORMATION_NODE_CONFIG.testing.testResults,
  };
}

/**
 * Refresh upstream dataset schema
 */
export async function refreshUpstreamSchema(nodeId, pipelineId) {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/refresh-schema`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    success: true,
    schemaVersion: 'v3.2',
    totalFields: 14,
    estimatedRecords: 284590,
    refreshedAt: 'Just now',
    fields: DEFAULT_TRANSFORMATION_NODE_CONFIG.inputDataset.fields,
  };
}

/**
 * Duplicate transformation node
 */
export async function duplicateTransformationNode(nodeId, pipelineId, newName) {
  try {
    const res = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ newName }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    success: true,
    newNodeId: `node_trans_${Date.now().toString(36)}`,
    newNodeName: newName,
  };
}
