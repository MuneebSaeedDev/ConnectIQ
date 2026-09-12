/**
 * mappingNodeConfig.api.js
 * API client, validation helpers, and Figma-verified mock baseline for SCR-069: Mapping Node Configuration Screen
 * Figma frame node: 170:1542 (Page 1 "Mapping Node Configuration Screen", 1920x3342)
 *
 * Provides real HTTP client methods with JSON content-type and error guards,
 * falling back to the Figma-specified mock contract when no backend daemon is present.
 */

export class MappingNodeConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'MappingNodeConfigError';
    this.status = status;
    this.details = details;
  }
}

export const DATA_TYPES = ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSON', 'ARRAY'];

export const MAPPING_TYPES = [
  { value: 'Direct', label: 'Direct Mapping', description: 'Pass field directly from source to target without transformation' },
  { value: 'Expression', label: 'Expression', description: 'Transform using custom formula or function expression' },
  { value: 'Rename', label: 'Rename / Clean', description: 'Rename field with optional string sanitization (trim, lower)' },
  { value: 'Cast', label: 'Cast / Convert', description: 'Explicit type coercion between source and target types' },
  { value: 'Conditional', label: 'Conditional Logic', description: 'IF / CASE evaluation based on predicate conditions' },
  { value: 'Lookup', label: 'Lookup / Join', description: 'Enrich field against external reference table or dataset' },
];

export const NULL_HANDLING_STRATEGIES = [
  { value: 'preserve', label: 'Preserve Null', description: 'Leave null values as null in target dataset' },
  { value: 'default', label: 'Replace With Default', description: 'Substitute missing or null values with a specified default' },
  { value: 'reject', label: 'Reject Record', description: 'Drop and route the entire record to the rejected stream' },
  { value: 'skip', label: 'Skip Field', description: 'Omit field from the emitted target record payload' },
];

export const RETRY_POLICY_OPTIONS = [
  { value: 'Exponential Backoff (3x)', label: 'Exponential Backoff (3x)' },
  { value: 'Linear Backoff (3x)', label: 'Linear Backoff (3x)' },
  { value: 'Immediate Retry (5x)', label: 'Immediate Retry (5x)' },
  { value: 'No Retry', label: 'No Retry (Fail Immediately)' },
];

export const ERROR_HANDLING_OPTIONS = [
  { value: 'Skip Invalid Records', label: 'Skip Invalid Records' },
  { value: 'Fail Pipeline Immediately', label: 'Fail Pipeline Immediately' },
  { value: 'Dead Letter Queue (DLQ)', label: 'Dead Letter Queue (DLQ)' },
  { value: 'Set Field to Null', label: 'Set Field to Null' },
];

export const BUILTIN_FUNCTIONS = {
  String: [
    { name: 'CONCAT(a, b, ...)', snippet: "CONCAT(first_name, ' ', last_name)", desc: 'Concatenates multiple string arguments' },
    { name: 'TRIM(s)', snippet: 'TRIM(field_name)', desc: 'Strips leading and trailing whitespace' },
    { name: 'UPPER(s)', snippet: 'UPPER(field_name)', desc: 'Converts string to uppercase' },
    { name: 'LOWER(s)', snippet: 'LOWER(field_name)', desc: 'Converts string to lowercase' },
    { name: 'SUBSTR(s, i, n)', snippet: 'SUBSTR(field_name, 1, 10)', desc: 'Extracts substring starting at index i with length n' },
    { name: 'REPLACE(s, a, b)', snippet: "REPLACE(field_name, 'old', 'new')", desc: 'Replaces substring matches' },
    { name: 'LENGTH(s)', snippet: 'LENGTH(field_name)', desc: 'Returns character length of string' },
  ],
  Numeric: [
    { name: 'ROUND(n, d)', snippet: 'ROUND(amount, 2)', desc: 'Rounds numeric value to d decimal places' },
    { name: 'ABS(n)', snippet: 'ABS(amount)', desc: 'Absolute numeric value' },
    { name: 'CEIL(n)', snippet: 'CEIL(amount)', desc: 'Smallest integer greater than or equal to n' },
    { name: 'FLOOR(n)', snippet: 'FLOOR(amount)', desc: 'Largest integer less than or equal to n' },
    { name: 'MOD(a, b)', snippet: 'MOD(id, 10)', desc: 'Modulo remainder' },
  ],
  'Date/Time': [
    { name: "DATE_FORMAT(d, 'fmt')", snippet: "DATE_FORMAT(created_at, 'YYYY-MM-DD')", desc: 'Formats timestamp or date string' },
    { name: 'DATE_ADD(d, n, unit)', snippet: "DATE_ADD(created_at, 7, 'DAY')", desc: 'Adds time intervals to date' },
    { name: 'DATEDIFF(d1, d2)', snippet: 'DATEDIFF(end_date, start_date)', desc: 'Calculates day difference between two dates' },
    { name: 'NOW()', snippet: 'NOW()', desc: 'Current UTC timestamp' },
  ],
  Logical: [
    { name: 'AND(p1, p2)', snippet: 'AND(is_active, amount > 0)', desc: 'Logical AND conjunction' },
    { name: 'OR(p1, p2)', snippet: 'OR(is_admin, is_owner)', desc: 'Logical OR disjunction' },
    { name: 'NOT(p)', snippet: 'NOT(is_deleted)', desc: 'Logical negation' },
  ],
  'Null Handling': [
    { name: 'COALESCE(a, b, ...)', snippet: "COALESCE(country_code, 'UNKNOWN')", desc: 'Returns first non-null argument' },
    { name: 'IS_NULL(a)', snippet: 'IS_NULL(status)', desc: 'Tests if value is null' },
    { name: 'NULLIF(a, b)', snippet: "NULLIF(email, '')", desc: 'Returns null if a equals b' },
  ],
  Conversion: [
    { name: 'CAST(x AS type)', snippet: 'CAST(account_balance AS DECIMAL(10,2))', desc: 'Explicit datatype coercion' },
    { name: 'PARSE_JSON(s)', snippet: 'PARSE_JSON(raw_payload)', desc: 'Parses string to JSON object' },
    { name: 'TO_BOOLEAN(x)', snippet: 'TO_BOOLEAN(active_flag)', desc: 'Converts value to boolean' },
  ],
  Conditional: [
    { name: 'IF(cond, val_true, val_false)', snippet: "IF(country_code IS NULL, 'UNKNOWN', country_code)", desc: 'Ternary branch evaluation' },
    { name: 'CASE WHEN cond THEN ... END', snippet: "CASE WHEN status = 'A' THEN 'Active' ELSE 'Inactive' END", desc: 'Multi-branch conditional logic' },
  ],
  Custom: [
    { name: 'UDF_GEO_LOOKUP(ip)', snippet: 'UDF_GEO_LOOKUP(ip_address)', desc: 'Custom user-defined geolocation lookup' },
    { name: 'UDF_SANITIZE_PII(s)', snippet: 'UDF_SANITIZE_PII(full_name)', desc: 'Custom PII redaction routine' },
  ],
};

export const DEFAULT_MAPPING_NODE_CONFIG = {
  nodeId: 'map_node_0041',
  pipelineId: 'customer-etl-v2',
  version: '2.4.1',
  status: 'Draft',
  stageNumber: 3,
  totalStages: 7,
  nodeName: 'customer_field_mapper',
  displayName: 'Customer Field Mapper',
  owner: 'data-engineering-team',
  description: 'Maps and transforms customer source fields to the unified CRM target schema. Handles type coercions and conditional routing for international records.',
  tags: ['customer', 'crm', 'pii-sensitive', 'v2'],
  nodeType: 'MAPPING',
  createdBy: 'a[EMAIL_REDACTED]',
  lastModified: '2026-08-07 14:32',
  lastSaved: '2026-08-08 14:32 UTC',

  // 02 Input Schema
  inputSchema: {
    sourceNode: 'filter_node_02',
    dataset: 'customers_raw',
    schemaVersion: '3.1.0',
    totalFields: 18,
    estRecords: '4.2M',
    lastRefreshed: '08:14 UTC',
    fields: [
      { name: 'customer_id', type: 'INTEGER', nullable: false, sample: '100421' },
      { name: 'first_name', type: 'STRING', nullable: true, sample: 'Alice' },
      { name: 'last_name', type: 'STRING', nullable: true, sample: 'Chen' },
      { name: 'email_address', type: 'STRING', nullable: false, sample: '[EMAIL_REDACTED]' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, sample: '2024-01-15T09:00Z' },
      { name: 'account_balance', type: 'DECIMAL', nullable: true, sample: '1240.50' },
      { name: 'country_code', type: 'STRING', nullable: true, sample: 'US' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, sample: 'true' },
      { name: 'phone_number', type: 'STRING', nullable: true, sample: '+1-555-0199' },
      { name: 'address_line1', type: 'STRING', nullable: true, sample: '742 Evergreen Terr' },
      { name: 'city', type: 'STRING', nullable: true, sample: 'Springfield' },
      { name: 'postal_code', type: 'STRING', nullable: true, sample: '97477' },
      { name: 'signup_source', type: 'STRING', nullable: true, sample: 'web_portal' },
      { name: 'loyalty_tier', type: 'STRING', nullable: true, sample: 'standard' },
      { name: 'currency', type: 'STRING', nullable: true, sample: 'USD' },
      { name: 'language_pref', type: 'STRING', nullable: true, sample: 'en-US' },
      { name: 'opt_in_marketing', type: 'BOOLEAN', nullable: false, sample: 'false' },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: true, sample: '2024-01-16T11:20Z' },
    ],
  },

  // 03 Target Schema
  targetSchema: {
    targetNode: 'crm_loader_01',
    dataset: 'customers_unified',
    schemaVersion: '1.8.2',
    totalFields: 14,
    requiredFields: 9,
    schemaMode: 'STRICT',
    fields: [
      { name: 'customer_id', type: 'INTEGER', required: true, defaultValue: '—' },
      { name: 'full_name', type: 'STRING', required: true, defaultValue: '—' },
      { name: 'email', type: 'STRING', required: true, defaultValue: '—' },
      { name: 'created_date', type: 'DATE', required: true, defaultValue: '—' },
      { name: 'balance_usd', type: 'DECIMAL', required: false, defaultValue: '0.00' },
      { name: 'region', type: 'STRING', required: false, defaultValue: 'UNKNOWN' },
      { name: 'status', type: 'STRING', required: true, defaultValue: '—' },
      { name: 'tier', type: 'STRING', required: false, defaultValue: 'standard' },
      { name: 'phone_e164', type: 'STRING', required: false, defaultValue: '—' },
      { name: 'primary_address', type: 'STRING', required: false, defaultValue: '—' },
      { name: 'postal_code', type: 'STRING', required: false, defaultValue: '—' },
      { name: 'preferred_language', type: 'STRING', required: false, defaultValue: 'en' },
      { name: 'marketing_consent', type: 'BOOLEAN', required: true, defaultValue: 'false' },
      { name: 'external_sync_id', type: 'STRING', required: false, defaultValue: '—' },
    ],
  },

  // 05 Auto Mapping Settings
  autoMappingConfig: {
    matchByName: true,
    matchBySimilarName: true,
    matchByDataType: false,
    matchBySourcePath: false,
    matchesFound: 8,
    conflicts: 2,
  },

  // 04 Mapping Workspace Table Items
  mappings: [
    {
      id: 'map_1',
      sourceField: 'customer_id',
      srcType: 'INTEGER',
      mappingType: 'Direct',
      transformation: '—',
      targetField: 'customer_id',
      tgtType: 'INTEGER',
      validationStatus: 'pass',
      validationMessage: 'Direct mapping validated successfully.',
      status: 'mapped',
    },
    {
      id: 'map_2',
      sourceField: 'first_name, last_name',
      srcType: 'STRING',
      mappingType: 'Expression',
      transformation: "CONCAT(first_name, ' ', last_name)",
      targetField: 'full_name',
      tgtType: 'STRING',
      validationStatus: 'pass',
      validationMessage: 'CONCAT expression is syntactically valid.',
      status: 'mapped',
    },
    {
      id: 'map_3',
      sourceField: 'email_address',
      srcType: 'STRING',
      mappingType: 'Rename',
      transformation: 'LOWER(TRIM(email_address))',
      targetField: 'email',
      tgtType: 'STRING',
      validationStatus: 'pass',
      validationMessage: 'LOWER(TRIM()) expression validated.',
      status: 'mapped',
    },
    {
      id: 'map_4',
      sourceField: 'created_at',
      srcType: 'TIMESTAMP',
      mappingType: 'Cast',
      transformation: "DATE_FORMAT(created_at, 'YYYY-MM-DD')",
      targetField: 'created_date',
      tgtType: 'DATE',
      validationStatus: 'pass',
      validationMessage: 'DATE_FORMAT transformation validated.',
      status: 'mapped',
    },
    {
      id: 'map_5',
      sourceField: 'account_balance',
      srcType: 'DECIMAL',
      mappingType: 'Cast',
      transformation: 'CAST(account_balance AS DECIMAL(10,2))',
      targetField: 'balance_usd',
      tgtType: 'DECIMAL',
      validationStatus: 'warning',
      validationMessage: 'Precision loss possible: source DECIMAL may exceed DECIMAL(10,2).',
      status: 'warning',
    },
    {
      id: 'map_6',
      sourceField: 'country_code',
      srcType: 'STRING',
      mappingType: 'Conditional',
      transformation: "IF(country_code IS NULL, 'UNKNOWN', country_code)",
      targetField: 'region',
      tgtType: 'STRING',
      validationStatus: 'pass',
      validationMessage: 'Conditional null-substitution validated.',
      status: 'mapped',
    },
    {
      id: 'map_7',
      sourceField: '—',
      srcType: '—',
      mappingType: '—',
      transformation: '—',
      targetField: 'status',
      tgtType: 'STRING',
      validationStatus: 'error',
      validationMessage: 'Required target field has no source mapping.',
      status: 'missing',
    },
    {
      id: 'map_8',
      sourceField: 'is_active',
      srcType: 'BOOLEAN',
      mappingType: '—',
      transformation: '—',
      targetField: '—',
      tgtType: '—',
      validationStatus: 'unmapped',
      validationMessage: 'Source field is not mapped to any target field.',
      status: 'unmapped',
    },
  ],

  // 06 Transformation Configuration (Selected item state)
  selectedMappingId: 'map_2',
  transformationConfig: {
    selectedLabel: 'first_name → full_name',
    transformationType: 'Expression',
    outputType: 'STRING',
    inputFields: ['first_name', 'last_name'],
    nullHandling: 'Replace With Default',
    defaultValue: 'UNKNOWN',
    expression: "CONCAT(\n  first_name,\n  ' ',\n  last_name\n)",
    syntaxValid: true,
  },

  // 08 Data Type Conversion
  dataTypeConversion: {
    sourceType: 'DECIMAL',
    targetType: 'DECIMAL',
    conversionRule: 'CAST(x AS DECIMAL(10,2))',
    invalidValueHandling: 'Use Default',
    defaultValue: '0.00',
    precisionWarning: 'Precision warning: Source DECIMAL may have higher precision than target DECIMAL(10,2). Values will be rounded. Verify with sample data.',
  },

  // 09 Null & Default Handling
  nullHandling: {
    strategy: 'default', // 'preserve' | 'default' | 'reject' | 'skip'
    defaultValue: 'UNKNOWN',
    defaultExpression: "COALESCE(country_code, 'UNKNOWN')",
  },

  // 12 Data Preview
  dataPreview: {
    recordsLimit: 10,
    stats: {
      recordsPreviewed: 10,
      successfulMappings: 9,
      failedTransformations: 1,
      nullValues: 3,
      rejectedRecords: 0,
    },
    sourceRows: [
      { id: 1, customer_id: 100421, first_name: 'Alice', last_name: 'Chen', email_address: '[EMAIL_REDACTED]', created_at: '2024-01-15T09:00Z', account_balance: '1240.50', country_code: 'US' },
      { id: 2, customer_id: 100422, first_name: 'Bob', last_name: 'Martinez', email_address: '[EMAIL_REDACTED]', created_at: '2024-02-03T14:22Z', account_balance: '540.00', country_code: 'MX' },
      { id: 3, customer_id: 100423, first_name: 'Chen', last_name: 'Wei', email_address: '[EMAIL_REDACTED]', created_at: '2024-02-18T08:15Z', account_balance: '3870.25', country_code: 'CN' },
      { id: 4, customer_id: 100424, first_name: 'Diana', last_name: 'Ross', email_address: '[EMAIL_REDACTED]', created_at: '2024-03-07T16:45Z', account_balance: '0.00', country_code: 'UK' },
    ],
    mappedRows: [
      { id: 1, customer_id: 100421, full_name: 'Alice Chen', email: '[EMAIL_REDACTED]', created_date: '2024-01-15', balance_usd: '1240.50', region: 'US', status: 'NULL' },
      { id: 2, customer_id: 100422, full_name: 'Bob Martinez', email: '[EMAIL_REDACTED]', created_date: '2024-02-03', balance_usd: '540.00', region: 'MX', status: 'NULL' },
      { id: 3, customer_id: 100423, full_name: 'Chen Wei', email: '[EMAIL_REDACTED]', created_date: '2024-02-18', balance_usd: '3870.25', region: 'CN', status: 'NULL' },
      { id: 4, customer_id: 100424, full_name: 'Diana Ross', email: '[EMAIL_REDACTED]', created_date: '2024-03-07', balance_usd: '0.00', region: 'UK', status: 'NULL' },
    ],
  },

  // 13 Runtime Configuration
  runtimeConfig: {
    batchSize: 5000,
    parallelism: 4,
    timeoutSeconds: 300,
    errorHandling: 'Skip Invalid Records',
    retryPolicy: 'Exponential Backoff (3x)',
  },

  // 14 Monitoring
  monitoring: {
    enableMetrics: true,
    enableTransformationLogs: true,
    trackRejectedRecords: true,
    trackTransformationErrors: false,
    alertOnFailures: false,
    stats: {
      recordsProcessed: '4,200,000',
      recordsMapped: '4,183,421',
      recordsRejected: '16,579',
      transformErrors: '142',
      processingDuration: '8m 24s',
    },
  },

  // 15 Advanced Configuration
  advancedConfig: {
    runtimeVariables: [
      { key: 'ENVIRONMENT_TIMEZONE', value: 'UTC' },
      { key: 'MAX_DECIMAL_SCALE', value: '4' },
      { key: 'STRICT_NULL_CHECK', value: 'true' },
    ],
    schemaStrictness: 'STRICT',
    memoryThresholdMb: 1024,
    customUdfScript: '-- Custom User Defined Functions\nfunction cleanPostal(val) {\n  return val ? val.trim().toUpperCase() : null;\n}',
  },

  // Validation inspector checks
  validationChecks: [
    {
      id: 'val_err_1',
      type: 'error',
      code: 'ERROR',
      field: 'status',
      target: 'status',
      title: 'Required target field has no source mapping.',
      description: 'Map a source field or provide a default expression.',
      fixAction: 'Map field to default status value "active"',
    },
    {
      id: 'val_warn_1',
      type: 'warning',
      code: 'WARN',
      field: 'balance_usd',
      target: 'balance_usd → balance_usd',
      title: 'Precision loss possible: source DECIMAL may exceed DECIMAL(10,2).',
      description: 'Verify sample data or increase target precision.',
      fixAction: 'Adjust target column precision or verify sample rows',
    },
    {
      id: 'val_pass_1',
      type: 'pass',
      code: 'PASS',
      field: 'customer_id',
      target: 'customer_id',
      title: 'Direct mapping validated successfully.',
      description: '—',
    },
    {
      id: 'val_pass_2',
      type: 'pass',
      code: 'PASS',
      field: 'full_name',
      target: 'full_name',
      title: 'CONCAT expression is syntactically valid.',
      description: '—',
    },
    {
      id: 'val_pass_3',
      type: 'pass',
      code: 'PASS',
      field: 'email',
      target: 'email',
      title: 'LOWER(TRIM()) expression validated.',
      description: '—',
    },
    {
      id: 'val_pass_4',
      type: 'pass',
      code: 'PASS',
      field: 'created_date',
      target: 'created_date',
      title: 'DATE_FORMAT transformation validated.',
      description: '—',
    },
  ],

  // Live Summary Rail
  summary: {
    completionPercentage: 75,
    totalSourceFields: 18,
    mappedFields: 6,
    unmappedFields: 2,
    totalTargetFields: 14,
    requiredFieldsMapped: '5 / 6',
    transformations: 4,
    validationErrors: 1,
    schemaSummary: {
      sourceFields: 18,
      targetFields: 14,
      requiredFields: 9,
    },
    transformationSummary: {
      directMappings: 2,
      transformations: 3,
      typeConversions: 1,
    },
    validationSummary: {
      passed: 6,
      warnings: 1,
      errors: 1,
    },
    mappingStatus: {
      totalMappings: 8,
      complete: 6,
      incomplete: 1,
      invalid: 1,
    },
  },
};

/**
 * Fetch Mapping Node Configuration
 */
export async function getMappingNodeConfig(nodeId = 'map_node_0041', pipelineId = 'customer-etl-v2') {
  try {
    const response = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/mapping-config`, {
      headers: { credentials: 'omit' },
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return { ...data, mocked: false };
    }
  } catch (_err) {
    // Fall back to verified Figma mock baseline
  }

  return {
    ...DEFAULT_MAPPING_NODE_CONFIG,
    nodeId,
    pipelineId,
    mocked: true,
  };
}

/**
 * Save Mapping Node Configuration
 */
export async function saveMappingNodeConfig(nodeId, pipelineId, payload) {
  try {
    const response = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/mapping-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return { ...data, mocked: false };
    }
  } catch (_err) {
    // Fall back to mock response
  }

  return {
    success: true,
    message: 'Mapping configuration saved successfully.',
    nodeId,
    timestamp: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Save Draft Configuration
 */
export async function saveMappingDraft(nodeId, pipelineId, payload) {
  try {
    const response = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/mapping-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return { ...data, mocked: false };
    }
  } catch (_err) {
    // Fall back to mock
  }

  return {
    success: true,
    message: 'Draft configuration saved.',
    nodeId,
    timestamp: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Run Validation on Mappings
 */
export async function validateMapping(nodeId, pipelineId, payload) {
  try {
    const response = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/validate-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return { ...data, mocked: false };
    }
  } catch (_err) {
    // Fall back to mock
  }

  // Count errors based on mappings
  const hasUnmappedRequired = (payload.mappings || []).some((m) => m.status === 'missing' || m.validationStatus === 'error');

  return {
    success: true,
    passed: hasUnmappedRequired ? 6 : 7,
    warnings: 1,
    errors: hasUnmappedRequired ? 1 : 0,
    validationChecks: DEFAULT_MAPPING_NODE_CONFIG.validationChecks,
    timestamp: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Preview Mapped Data Transformation
 */
export async function previewMappedData(nodeId, pipelineId, payload) {
  try {
    const response = await fetch(`/api/v1/pipelines/${pipelineId}/nodes/${nodeId}/preview-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return { ...data, mocked: false };
    }
  } catch (_err) {
    // Fall back to mock
  }

  return {
    ...DEFAULT_MAPPING_NODE_CONFIG.dataPreview,
    mocked: true,
  };
}

/**
 * Auto Map Fields Algorithm Simulation
 */
export function runAutoMappingAlgorithm(sourceFields, targetFields, options) {
  const matches = [];
  const conflicts = [];

  targetFields.forEach((tgt) => {
    // 1. Exact name match
    if (options.matchByName) {
      const exact = sourceFields.find((src) => src.name.toLowerCase() === tgt.name.toLowerCase());
      if (exact) {
        matches.push({
          sourceField: exact.name,
          srcType: exact.type,
          targetField: tgt.name,
          tgtType: tgt.type,
          mappingType: exact.type === tgt.type ? 'Direct' : 'Cast',
          confidence: 1.0,
          strategy: 'Exact Name Match',
        });
        return;
      }
    }

    // 2. Similar name match
    if (options.matchBySimilarName) {
      const cleanTgt = tgt.name.toLowerCase().replace(/_/g, '');
      const similar = sourceFields.find((src) => {
        const cleanSrc = src.name.toLowerCase().replace(/_/g, '');
        return cleanSrc.includes(cleanTgt) || cleanTgt.includes(cleanSrc);
      });
      if (similar) {
        matches.push({
          sourceField: similar.name,
          srcType: similar.type,
          targetField: tgt.name,
          tgtType: tgt.type,
          mappingType: similar.type === tgt.type ? 'Direct' : 'Cast',
          confidence: 0.85,
          strategy: 'Fuzzy / Similar Name',
        });
        return;
      }
    }
  });

  return { matches, conflicts };
}
