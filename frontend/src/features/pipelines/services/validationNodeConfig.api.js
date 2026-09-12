/**
 * validationNodeConfig.api.js
 * API client and Figma-verified mock baseline for SCR-071: Validation Node Configuration Screen
 * Figma frame node: 221:7477 (Page 1 "Validation Node Configuration Screen", 1920x6175)
 *
 * Provides real HTTP client methods with JSON content-type and error guards,
 * falling back to the Figma-specified mock contract when no backend daemon is present.
 */

export class ValidationNodeConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ValidationNodeConfigError';
    this.status = status;
    this.details = details;
  }
}

export const VALIDATION_CATEGORY_OPTIONS = [
  'Schema Validation',
  'Business Rules',
  'Data Quality',
  'Referential Integrity',
  'Compliance & PII',
  'Custom Expression',
];

export const VALIDATION_MODES = [
  { id: 'rule_based', label: 'Rule-Based Validation', description: 'Apply named validation rules per field. Each rule defines condition, operator, expected value, severity, and failure behavior independently.' },
  { id: 'schema', label: 'Schema Validation', description: 'Validate incoming records strictly against structural data types, nullability, and schema version constraints.' },
  { id: 'business_rules', label: 'Business Rules', description: 'Define complex multi-field cross-validation predicates and domain-specific logic rules.' },
  { id: 'data_quality', label: 'Data Quality Validation', description: 'Enforce completeness, precision, range thresholds, and statistical quality benchmarks.' },
  { id: 'duplicate_detection', label: 'Duplicate Detection', description: 'Identify and flag or drop duplicate records across composite primary keys.' },
  { id: 'referential', label: 'Referential Validation', description: 'Verify foreign keys against reference datasets and dimension tables.' },
  { id: 'custom_expression', label: 'Custom Expression', description: 'Write SQL or Python expressions for advanced custom validation workflows.' },
];

export const INPUT_DATASET_FIELDS = [
  { name: 'customer_id', type: 'INTEGER', nullable: 'NO', sample: '100421', path: '$.customer_id' },
  { name: 'full_name', type: 'STRING', nullable: 'YES', sample: 'Alice Chen', path: '$.full_name' },
  { name: 'email', type: 'STRING', nullable: 'NO', sample: '[EMAIL_REDACTED]', path: '$.email' },
  { name: 'created_date', type: 'DATE', nullable: 'NO', sample: '2024-01-15', path: '$.created_date' },
  { name: 'balance_usd', type: 'DECIMAL', nullable: 'YES', sample: '1240.50', path: '$.balance_usd' },
  { name: 'region', type: 'STRING', nullable: 'YES', sample: 'US', path: '$.region' },
  { name: 'status', type: 'STRING', nullable: 'NO', sample: 'active', path: '$.status' },
];

export const RULE_TYPES = [
  { value: 'not_null', label: 'Not Null' },
  { value: 'pattern', label: 'Pattern / Regex' },
  { value: 'enum', label: 'Enum / In List' },
  { value: 'range', label: 'Range / Bounds' },
  { value: 'min_length', label: 'Min Length' },
  { value: 'max_length', label: 'Max Length' },
  { value: 'date_range', label: 'Date Range' },
  { value: 'minimum', label: 'Minimum Value' },
  { value: 'maximum', label: 'Maximum Value' },
  { value: 'email_format', label: 'Email Format' },
  { value: 'phone_format', label: 'Phone Format' },
  { value: 'custom', label: 'Custom Condition' },
];

export const RULE_SEVERITIES = [
  { id: 'error', label: 'Error', icon: '✗', badge: '✗ Error', description: 'Record fails validation. Triggers the configured failure behavior immediately.' },
  { id: 'warning', label: 'Warning', icon: '!', badge: '! Warning', description: 'Record passes through but is flagged. Downstream systems receive the warning.' },
  { id: 'info', label: 'Informational', icon: 'i', badge: 'i Info', description: 'Observation only. No action taken. Logged for auditing purposes.' },
];

export const FAILURE_BEHAVIORS = [
  { id: 'fail_pipeline', label: 'Fail Pipeline', description: 'Stops the entire pipeline. No further records are processed.' },
  { id: 'reject_record', label: 'Reject Record', description: 'Removes the record from the valid stream. Sent to error output.' },
  { id: 'continue_processing', label: 'Continue Processing', description: 'Records continue despite failures. All failures are logged.' },
  { id: 'send_to_error_output', label: 'Send to Error Output', description: 'Routes invalid records to a dedicated error output node.' },
  { id: 'mark_as_warning', label: 'Mark as Warning', description: 'Records continue with a warning flag attached.' },
];

export const INITIAL_VALIDATION_RULES = [
  {
    id: 'rule_01',
    ruleName: 'required_customer_id',
    field: 'customer_id',
    validationType: 'Not Null',
    condition: 'IS NOT NULL',
    expectedValue: '—',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_02',
    ruleName: 'valid_email_format',
    field: 'email',
    validationType: 'Pattern',
    condition: 'MATCHES',
    expectedValue: 'RFC 5322',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_03',
    ruleName: 'email_not_null',
    field: 'email',
    validationType: 'Not Null',
    condition: 'IS NOT NULL',
    expectedValue: '—',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Fail',
    active: true,
  },
  {
    id: 'rule_04',
    ruleName: 'status_enum_check',
    field: 'status',
    validationType: 'Enum',
    condition: 'IN',
    expectedValue: 'active, inactive, pending',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Fail',
    active: true,
  },
  {
    id: 'rule_05',
    ruleName: 'balance_range',
    field: 'balance_usd',
    validationType: 'Range',
    condition: 'BETWEEN',
    expectedValue: '0 – 999999',
    severity: 'Warning',
    failureBehavior: 'Mark Warning',
    status: 'Warn',
    active: true,
  },
  {
    id: 'rule_06',
    ruleName: 'name_min_length',
    field: 'full_name',
    validationType: 'Min Length',
    condition: '>= 2',
    expectedValue: '2',
    severity: 'Warning',
    failureBehavior: 'Mark Warning',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_07',
    ruleName: 'valid_region_code',
    field: 'region',
    validationType: 'Pattern',
    condition: 'MATCHES',
    expectedValue: '[A-Z]{2}',
    severity: 'Info',
    failureBehavior: 'Continue',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_08',
    ruleName: 'date_not_future',
    field: 'created_date',
    validationType: 'Date Range',
    condition: '<= TODAY()',
    expectedValue: 'today',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_09',
    ruleName: 'id_positive',
    field: 'customer_id',
    validationType: 'Minimum',
    condition: '> 0',
    expectedValue: '1',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    status: 'Pass',
    active: true,
  },
  {
    id: 'rule_10',
    ruleName: 'phone_format',
    field: 'phone',
    validationType: 'Pattern',
    condition: 'MATCHES',
    expectedValue: 'E.164',
    severity: 'Warning',
    failureBehavior: 'Mark Warning',
    status: 'Disabled',
    active: false,
  },
];

export const INITIAL_SCHEMA_VALIDATION_FIELDS = [
  { field: 'customer_id', expectedType: 'INTEGER', incomingType: 'INTEGER', conversionAllowed: 'YES', severity: 'Error', status: 'Pass' },
  { field: 'email', expectedType: 'STRING', incomingType: 'STRING', conversionAllowed: 'NO', severity: 'Error', status: 'Pass' },
  { field: 'created_date', expectedType: 'DATE', incomingType: 'TIMESTAMP', conversionAllowed: 'YES', severity: 'Warning', status: 'Warn' },
  { field: 'balance_usd', expectedType: 'DECIMAL', incomingType: 'STRING', conversionAllowed: 'NO', severity: 'Error', status: 'Fail' },
  { field: 'status', expectedType: 'STRING', incomingType: 'STRING', conversionAllowed: 'NO', severity: 'Error', status: 'Pass' },
  { field: 'full_name', expectedType: 'STRING', incomingType: 'STRING', conversionAllowed: 'NO', severity: 'Error', status: 'Pass' },
  { field: 'region', expectedType: 'STRING', incomingType: 'STRING', conversionAllowed: 'NO', severity: 'Info', status: 'Pass' },
];

export const INITIAL_BUSINESS_RULES = [
  {
    id: 'br_01',
    name: 'active_customers_must_have_email',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    description: 'Active status records must have a non-null email.',
    inputFields: ['status', 'email'],
    condition: "IF status = 'active' THEN email IS NOT NULL",
  },
  {
    id: 'br_02',
    name: 'balance_requires_positive_id',
    severity: 'Error',
    failureBehavior: 'Reject Record',
    description: 'Records with positive balance must have a valid customer ID.',
    inputFields: ['balance_usd', 'customer_id'],
    condition: 'IF balance_usd > 0 THEN customer_id IS NOT NULL AND customer_id > 0',
  },
  {
    id: 'br_03',
    name: 'region_code_format',
    severity: 'Warning',
    failureBehavior: 'Mark Warning',
    description: 'Region field must be a 2-character ISO country code.',
    inputFields: ['region'],
    condition: "MATCHES(region, '^[A-Z]{2}$') OR region IS NULL",
  },
];

export const INITIAL_ERROR_STRUCTURE_ROWS = [
  {
    errorCode: 'VAL-E-0041',
    rule: 'email_not_null',
    field: 'email',
    recordId: '100421',
    severity: 'Error',
    message: 'email IS NULL — required field',
    resolution: 'Ensure email is populated before this node.',
  },
  {
    errorCode: 'VAL-E-0041',
    rule: 'email_not_null',
    field: 'email',
    recordId: '100429',
    severity: 'Error',
    message: 'email IS NULL — required field',
    resolution: 'Ensure email is populated before this node.',
  },
  {
    errorCode: 'VAL-B-0012',
    rule: 'active_customers_must_have_email',
    field: 'email',
    recordId: '100421',
    severity: 'Error',
    message: 'Business rule violated: active record missing email',
    resolution: 'Populate email or change status.',
  },
  {
    errorCode: 'VAL-E-0022',
    rule: 'valid_email_format',
    field: 'email',
    recordId: '100423',
    severity: 'Error',
    message: "'invalid-email' does not match RFC 5322",
    resolution: 'Normalize email at source.',
  },
  {
    errorCode: 'VAL-W-0003',
    rule: 'balance_range',
    field: 'balance_usd',
    recordId: '100425',
    severity: 'Warning',
    message: 'balance_usd near upper bound (99999.99)',
    resolution: 'Review high-balance record for accuracy.',
  },
];

export const INITIAL_PREVIEW_RECORDS = [
  {
    id: 1,
    customerId: '100421',
    email: 'null',
    status: 'active',
    balanceUsd: '1240.50',
    validationStatus: 'Invalid',
    failedRule: 'email_not_null + business_rule',
    errorMessage: 'email IS NULL; active record must have email',
  },
  {
    id: 2,
    customerId: '100422',
    email: '[EMAIL_REDACTED]',
    status: 'inactive',
    balanceUsd: '540.00',
    validationStatus: 'Valid',
    failedRule: '—',
    errorMessage: '—',
  },
  {
    id: 3,
    customerId: '100423',
    email: 'invalid-email',
    status: 'pending',
    balanceUsd: '3870.25',
    validationStatus: 'Invalid',
    failedRule: 'valid_email_format',
    errorMessage: 'email does not match RFC 5322 pattern',
  },
  {
    id: 4,
    customerId: '100424',
    email: '[EMAIL_REDACTED]',
    status: 'DELETED',
    balanceUsd: '0.00',
    validationStatus: 'Invalid',
    failedRule: 'status_enum_check',
    errorMessage: "'DELETED' not in enum [active, inactive, pending]",
  },
  {
    id: 5,
    customerId: '100425',
    email: '[EMAIL_REDACTED]',
    status: 'active',
    balanceUsd: '99999.99',
    validationStatus: 'Warning',
    failedRule: 'balance_range',
    errorMessage: 'balance_usd near upper bound — review recommended',
  },
];

export const DEFAULT_VALIDATION_NODE_CONFIG = {
  nodeId: 'val_node_0052',
  pipelineId: 'customer-etl-pipeline',
  pipelineDisplay: 'customer-etl-v2',
  version: '1.2.0',
  stageNumber: 4,
  stageTotal: 7,
  status: 'Draft',
  nodeName: 'customer_validator',
  displayName: 'Customer Data Validator',
  description: 'Validates incoming customer records against schema requirements, business rules, and data-quality thresholds. Rejects records failing required-field or type checks.',
  category: 'Schema Validation',
  owner: 'data-quality-team',
  createdBy: '[EMAIL_REDACTED]',
  lastModified: '2026-08-09 11:18 UTC',
  lastSaved: '2026-08-09 11:18 UTC',
  tags: ['customer', 'pii-sensitive', 'data-quality', 'crm-pipeline'],
  nodeType: 'VALIDATION',

  inputDataset: {
    previousNode: 'mapper_node_0041',
    datasetName: 'customers_mapped',
    schemaVersion: '2.1.0',
    totalFields: 10,
    estimatedRecords: '4.2M',
    lastRefreshed: '09:42 UTC',
    fields: INPUT_DATASET_FIELDS,
  },

  validationMode: 'rule_based',

  rules: INITIAL_VALIDATION_RULES,

  requiredFieldValidation: {
    fields: [
      { name: 'customer_id', required: true, status: 'Pass' },
      { name: 'email', required: true, status: 'Fail' },
      { name: 'status', required: true, status: 'Fail' },
      { name: 'created_date', required: true, status: 'Pass' },
      { name: 'full_name', required: false, status: 'Pass' },
    ],
    behavior: {
      failIfMissing: true,
      failIfNull: true,
      failIfEmpty: true,
      failIfWhitespaceOnly: true,
    },
    stats: {
      requiredFields: 5,
      missing: 2,
      failures: 2,
    },
  },

  dataTypeValidation: {
    fields: INITIAL_SCHEMA_VALIDATION_FIELDS,
    mismatchWarning: 'Type mismatch — balance_usd: Incoming type STRING cannot be automatically converted to DECIMAL. Explicit cast required or record will be rejected.',
  },

  fieldValidationRules: {
    textRules: [
      { type: 'Min Length', field: 'full_name', condition: '≥ 2' },
      { type: 'Max Length', field: 'full_name', condition: '≤ 200' },
      { type: 'Pattern', field: 'email', condition: 'RFC 5322' },
      { type: 'Pattern', field: 'region', condition: '[A-Z]{2}' },
    ],
    numericRules: [
      { type: 'Minimum', field: 'customer_id', condition: '> 0' },
      { type: 'Range', field: 'balance_usd', condition: '0–999999' },
      { type: 'Decimal Precision', field: 'balance_usd', condition: '≤ 2 places' },
    ],
    dateTimeRules: [
      { type: 'Date Range', field: 'created_date', condition: '≤ TODAY()' },
      { type: 'Valid Date', field: 'created_date', condition: 'ISO 8601' },
      { type: 'Timestamp Validity', field: '—', condition: '—' },
    ],
  },

  emailValidation: {
    field: 'email',
    severity: 'Error',
    pattern: 'RFC 5322',
    caseSensitivity: 'Case Insensitive',
    validRecords: '4,181,203',
    invalidRecords: '18,797',
    validationRate: '99.6%',
  },

  phoneValidation: {
    field: 'phone (disabled)',
    countryRegion: 'International (E.164)',
    format: 'E.164 ([PHONE_REDACTED])',
    normalization: 'Normalize to E.164',
    valid: '—',
    invalid: '—',
    missing: '—',
    disabledNotice: 'Rule is disabled — phone field not present in current schema.',
    active: false,
  },

  businessRules: INITIAL_BUSINESS_RULES,

  referentialValidation: {
    sourceField: 'customer_id',
    referenceDataset: 'customers_master',
    referenceField: 'id',
    matchStrategy: 'Exact Match',
    missingBehavior: 'Reject Record',
    matched: '4,194,001',
    unmatched: '6,000',
    matchRate: '99.9%',
  },

  duplicateDetection: {
    detectionFields: ['customer_id', 'email'],
    matchingStrategy: 'Exact Match',
    caseSensitivity: 'Case Insensitive',
    nullHandling: 'Nulls are not equal',
    keepStrategy: 'First Record',
    checked: '4,200,000',
    duplicates: '1,241',
    unique: '4,198,759',
    dupRate: '0.03%',
  },

  failureBehavior: {
    primaryBehavior: 'reject_record',
    stats: {
      rejected: '24,797',
      errorReasons: 3,
      topRule: 'email_not_null',
    },
  },

  validationTest: {
    scope: 'Entire Validation Node',
    samplePayload: JSON.stringify(
      {
        customer_id: 100421,
        email: null,
        status: 'active',
        balance_usd: 1240.50,
      },
      null,
      2
    ),
    lastExecution: {
      status: 'FAILED',
      execTime: '0.84 ms',
      failedRulesCount: 2,
      results: [
        { status: 'FAIL', rule: 'email_not_null', message: 'email IS NULL — required field missing' },
        { status: 'FAIL', rule: 'active_customers_must_have_email', message: 'Business rule violated: active status requires non-null email' },
        { status: 'PASS', rule: 'required_customer_id', message: 'Passed' },
        { status: 'PASS', rule: 'balance_range', message: '1240.50 within range [0, 999999]' },
      ],
    },
  },

  dataPreview: {
    totalTested: 25,
    valid: 21,
    invalid: 4,
    warnings: 1,
    validationRate: '84.0%',
    invalidTotalSystem: '24,797',
    records: INITIAL_PREVIEW_RECORDS,
  },

  validationResults: {
    rulesExecuted: 12,
    passedRules: 8,
    failedRules: 2,
    warnings: 1,
    recordsChecked: '4,200,000',
    validRecords: '4,175,203',
    invalidRecords: '24,797',
    validationRate: '99.4%',
  },

  dataQualityMetrics: {
    qualityScore: 87.3,
    validityRate: '99.4%',
    completenessRate: '96.2%',
    duplicateRate: '0.03%',
    errorRate: '0.59%',
    recordsRejected: '24,797',
    qualityTrend: '▲ +1.2%',
  },

  errorStructure: {
    rows: INITIAL_ERROR_STRUCTURE_ROWS,
  },

  runtimeConfig: {
    batchSize: 5000,
    parallelism: 4,
    timeoutSeconds: 120,
    errorHandling: 'Validate All Records',
    maxErrorThreshold: 1000,
    thresholdNotice: 'records — pipeline stops if exceeded. Invalid pipeline configuration is non-recoverable.',
  },

  monitoring: {
    enableMetrics: true,
    enableLogs: true,
    trackFailedRecords: true,
    trackRulePerformance: true,
    trackDataQualityScore: true,
    alertOnValidationFailure: true,
    alertOnQualityThreshold: false,
    channels: {
      inApp: true,
      email: true,
      webhook: true,
      sms: false,
    },
  },

  advancedConfig: {
    customEngineArgs: '--conf spark.sql.validation.mode=strict',
    tempSpillPath: '/tmp/spark-validation-spill',
    memoryLimitMb: 8192,
    qualityThresholds: 'completeness > 95.0%, validity > 99.0%',
    enableJit: true,
  },
};

/**
 * Real-request-first helper wrapping fetch with JSON verification & fallback
 */
async function apiRequest(url, options = {}, fallbackData = null) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      // In Vite dev or offline, fallback to mock data
      return fallbackData !== null ? { ...fallbackData, mocked: true } : null;
    }

    const json = await res.json();
    return json;
  } catch (_err) {
    if (fallbackData !== null) {
      return { ...fallbackData, mocked: true };
    }
    throw new ValidationNodeConfigError('Network error connecting to validation node service');
  }
}

/**
 * GET validation node configuration
 */
export async function getValidationNodeConfig(nodeId = 'val_node_0052', pipelineId = 'customer-etl-pipeline') {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/validation-config`;
  const result = await apiRequest(url, { method: 'GET' }, DEFAULT_VALIDATION_NODE_CONFIG);
  return result;
}

/**
 * PUT/POST save validation node configuration
 */
export async function saveValidationNodeConfig(nodeId, pipelineId, payload) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/validation-config`;
  const result = await apiRequest(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    {
      success: true,
      nodeId,
      pipelineId,
      status: 'Configured',
      savedAt: new Date().toISOString(),
      mocked: true,
    }
  );
  return result;
}

/**
 * POST save validation node draft
 */
export async function saveValidationNodeDraft(nodeId, pipelineId, payload) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/validation-draft`;
  const result = await apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    {
      success: true,
      nodeId,
      pipelineId,
      status: 'Draft',
      savedAt: new Date().toISOString(),
      mocked: true,
    }
  );
  return result;
}

/**
 * POST validate node rules
 */
export async function validateNodeRules(nodeId, pipelineId, rules) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/validate`;
  const result = await apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify({ rules }),
    },
    {
      valid: false,
      summary: {
        passed: 8,
        warnings: 1,
        errors: 2,
        total: 11,
      },
      errors: [
        { ruleId: 'rule_03', field: 'email', message: 'email_not_null failed for sampled null records' },
        { ruleId: 'rule_04', field: 'status', message: "status_enum_check encountered 'DELETED' which is outside defined enum" },
      ],
      warnings: [
        { ruleId: 'rule_05', field: 'balance_usd', message: 'balance_usd near upper bound (99999.99)' },
      ],
      mocked: true,
    }
  );
  return result;
}

/**
 * POST run validation test on sample record
 */
export async function runValidationTest(nodeId, pipelineId, samplePayload) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/test-validation`;
  const result = await apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify({ samplePayload }),
    },
    {
      success: false,
      status: 'FAILED',
      execTime: '0.84 ms',
      failedRulesCount: 2,
      results: [
        { status: 'FAIL', rule: 'email_not_null', message: 'email IS NULL — required field missing' },
        { status: 'FAIL', rule: 'active_customers_must_have_email', message: 'Business rule violated: active status requires non-null email' },
        { status: 'PASS', rule: 'required_customer_id', message: 'Passed' },
        { status: 'PASS', rule: 'balance_range', message: '1240.50 within range [0, 999999]' },
      ],
      mocked: true,
    }
  );
  return result;
}

/**
 * POST preview validation data
 */
export async function previewValidationData(nodeId, pipelineId, limit = 25) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/preview-data?limit=${limit}`;
  const result = await apiRequest(url, { method: 'POST' }, {
    totalTested: limit,
    valid: 21,
    invalid: 4,
    warnings: 1,
    validationRate: '84.0%',
    records: INITIAL_PREVIEW_RECORDS,
    mocked: true,
  });
  return result;
}

/**
 * POST refresh schema metadata
 */
export async function refreshValidationSchema(nodeId, pipelineId) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/refresh-schema`;
  const result = await apiRequest(url, { method: 'POST' }, {
    refreshedAt: '09:42 UTC',
    fields: INPUT_DATASET_FIELDS,
    mocked: true,
  });
  return result;
}

/**
 * POST duplicate node
 */
export async function duplicateValidationNode(nodeId, pipelineId, newName) {
  const url = `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/nodes/${encodeURIComponent(nodeId)}/duplicate`;
  const result = await apiRequest(
    url,
    {
      method: 'POST',
      body: JSON.stringify({ newName }),
    },
    {
      success: true,
      newNodeId: `val_node_${Math.floor(Math.random() * 9000 + 1000)}`,
      newNodeName: newName,
      mocked: true,
    }
  );
  return result;
}
