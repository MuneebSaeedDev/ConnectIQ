import { apiFetch } from '../../../services/api/client';

export const TYPE_CATEGORIES = {
  TEXT: ['String', 'Text', 'JSON/Text'],
  NUMERIC: ['Integer', 'Decimal', 'Float', 'Number'],
  DATETIME: ['Date', 'DateTime', 'Timestamp'],
  BOOLEAN: ['Boolean'],
  STRUCTURED: ['JSON', 'Object', 'Array']
};

export const SUPPORTED_SOURCE_TYPES = [
  'String',
  'Text',
  'JSON/Text',
  'Integer',
  'Decimal',
  'Float',
  'Number',
  'Date',
  'DateTime',
  'Timestamp',
  'Boolean',
  'JSON',
  'Object',
  'Array'
];

export const SUPPORTED_TARGET_TYPES = [
  'String',
  'Text',
  'Integer',
  'Decimal',
  'Float',
  'Number',
  'Date',
  'DateTime',
  'Timestamp',
  'Boolean',
  'JSON',
  'Object',
  'Array'
];

export const CONVERSION_METHODS = [
  'Standard Cast',
  'Format-based Parse',
  'Custom Expression',
  'Conditional Rule',
  'Regex Extractor'
];

export const CONVERSION_STRATEGIES = [
  { value: 'strict', label: 'Strict Conversion (Fail record on any error)' },
  { value: 'lenient', label: 'Lenient Conversion (Apply defaults or null)' },
  { value: 'preserve', label: 'Preserve Original (Keep original string value)' },
  { value: 'nullify', label: 'Set Null (Output null on conversion failure)' },
  { value: 'skip_field', label: 'Skip Field (Omit field from downstream payload)' }
];

export const INVALID_VALUE_STRATEGIES = [
  { value: 'reject', label: 'Reject invalid records' },
  { value: 'null', label: 'Set value to null' },
  { value: 'default', label: 'Use configured default value' },
  { value: 'preserve', label: 'Preserve original raw value' },
  { value: 'error_workflow', label: 'Send to error-handling dead-letter queue' }
];

export const NULL_HANDLING_STRATEGIES = [
  { value: 'preserve', label: 'Preserve null (do not execute conversion)' },
  { value: 'replace', label: 'Replace null with default value' },
  { value: 'reject', label: 'Reject record if value is null' },
  { value: 'empty_representation', label: 'Convert null to empty representation (e.g. "", 0)' }
];

export const MOCK_TYPE_CONVERSION_RULES = [
  {
    id: 'tcr-001',
    ruleName: 'Customer ID String → Integer',
    description: 'Converts legacy string customer IDs into clean 64-bit integer values.',
    category: 'Numeric Conversion',
    sourceType: 'String',
    targetType: 'Integer',
    targetFields: ['customer_id', 'legacy_id', 'account_ref'],
    conversionMethod: 'Standard Cast',
    strategy: 'strict',
    invalidValueBehavior: 'reject',
    nullHandling: 'preserve',
    defaultValue: null,
    parameters: {
      trimWhitespace: true,
      thousandsSeparator: ',',
      overflowBehavior: 'error'
    },
    pipelineUsage: 14,
    pipelines: ['Customer Master ETL', 'Billing Sync V2', 'HubSpot Contact Ingest'],
    status: 'active',
    version: 'v1.3.0',
    updatedAt: '2026-09-18T14:22:00Z',
    updatedBy: 'S. DataEng',
    tags: ['customer', 'finance', 'id-mapping']
  },
  {
    id: 'tcr-002',
    ruleName: 'Order Amount String → Decimal',
    description: 'Parses currency strings like "$1,249.50" into precise Decimal(18,2) metrics.',
    category: 'Numeric Conversion',
    sourceType: 'String',
    targetType: 'Decimal',
    targetFields: ['total_amount', 'subtotal', 'tax_amount'],
    conversionMethod: 'Format-based Parse',
    strategy: 'lenient',
    invalidValueBehavior: 'default',
    nullHandling: 'replace',
    defaultValue: '0.00',
    parameters: {
      precision: 18,
      scale: 2,
      rounding: 'HALF_UP',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencyHandling: 'strip_symbols'
    },
    pipelineUsage: 8,
    pipelines: ['Stripe Ingest', 'ERP Ledger Sync'],
    status: 'active',
    version: 'v2.0.1',
    updatedAt: '2026-09-18T11:45:00Z',
    updatedBy: 'A. Weber',
    tags: ['finance', 'orders', 'currency']
  },
  {
    id: 'tcr-003',
    ruleName: 'Created At String → DateTime',
    description: 'Parses ISO-8601 & RFC timestamps into standardized UTC DateTime objects.',
    category: 'Date/Time Conversion',
    sourceType: 'String',
    targetType: 'DateTime',
    targetFields: ['created_at', 'updated_at', 'event_timestamp'],
    conversionMethod: 'Format-based Parse',
    strategy: 'strict',
    invalidValueBehavior: 'null',
    nullHandling: 'preserve',
    defaultValue: null,
    parameters: {
      inputFormat: 'YYYY-MM-DDTHH:mm:ss[Z]',
      outputFormat: 'ISO-8601',
      timezone: 'UTC',
      locale: 'en_US'
    },
    pipelineUsage: 26,
    pipelines: ['Telemetry Stream', 'Audit Log Consolidator', 'Clickstream Batch'],
    status: 'active',
    version: 'v1.0.0',
    updatedAt: '2026-09-17T09:12:00Z',
    updatedBy: 'D. Miller',
    tags: ['core', 'datetime', 'timestamps']
  },
  {
    id: 'tcr-004',
    ruleName: 'Active Flag String → Boolean',
    description: 'Normalizes varied truthy ("yes", "1", "true") & falsy tokens into boolean.',
    category: 'Boolean Conversion',
    sourceType: 'String',
    targetType: 'Boolean',
    targetFields: ['is_active', 'opt_in_email', 'verified'],
    conversionMethod: 'Standard Cast',
    strategy: 'lenient',
    invalidValueBehavior: 'default',
    nullHandling: 'replace',
    defaultValue: 'false',
    parameters: {
      trueValues: ['true', 'TRUE', '1', 'yes', 'Y'],
      falseValues: ['false', 'FALSE', '0', 'no', 'N'],
      caseSensitive: false,
      trimWhitespace: true
    },
    pipelineUsage: 19,
    pipelines: ['User Profile Sync', 'Auth Account Export'],
    status: 'active',
    version: 'v3.1.0',
    updatedAt: '2026-09-16T18:00:00Z',
    updatedBy: 'J. Chen',
    tags: ['flags', 'boolean', 'crm']
  },
  {
    id: 'tcr-005',
    ruleName: 'Date of Birth String → Date',
    description: 'Parses MM/DD/YYYY or YYYY-MM-DD input strings to SQL DATE representation.',
    category: 'Date/Time Conversion',
    sourceType: 'String',
    targetType: 'Date',
    targetFields: ['birth_date', 'effective_date'],
    conversionMethod: 'Format-based Parse',
    strategy: 'strict',
    invalidValueBehavior: 'reject',
    nullHandling: 'preserve',
    defaultValue: null,
    parameters: {
      inputFormat: 'MM/DD/YYYY',
      outputFormat: 'YYYY-MM-DD',
      timezone: 'UTC'
    },
    pipelineUsage: 4,
    pipelines: ['HRIS Sync'],
    status: 'draft',
    version: 'v0.9.0',
    updatedAt: '2026-09-15T10:30:00Z',
    updatedBy: 'S. DataEng',
    tags: ['hr', 'dates']
  },
  {
    id: 'tcr-006',
    ruleName: 'Country Code Number → String',
    description: 'Converts ISO numeric phone codes or country IDs to 3-digit padded String.',
    category: 'Text Conversion',
    sourceType: 'Number',
    targetType: 'String',
    targetFields: ['country_code_num', 'calling_code'],
    conversionMethod: 'Standard Cast',
    strategy: 'lenient',
    invalidValueBehavior: 'null',
    nullHandling: 'preserve',
    defaultValue: '000',
    parameters: {
      prefix: '',
      suffix: '',
      padLength: 3,
      padCharacter: '0'
    },
    pipelineUsage: 0,
    pipelines: [],
    status: 'disabled',
    version: 'v1.0.0',
    updatedAt: '2026-09-12T16:20:00Z',
    updatedBy: 'A. Weber',
    tags: ['geo', 'lookup']
  },
  {
    id: 'tcr-007',
    ruleName: 'Payload Text → Structured JSON',
    description: 'Parses incoming unescaped JSON text strings into structured MongoDB Object types.',
    category: 'Structured Data Conversion',
    sourceType: 'JSON/Text',
    targetType: 'JSON',
    targetFields: ['metadata_raw', 'request_payload'],
    conversionMethod: 'Standard Cast',
    strategy: 'strict',
    invalidValueBehavior: 'error_workflow',
    nullHandling: 'preserve',
    defaultValue: '{}',
    parameters: {
      schemaAware: true,
      handleInvalidJson: 'send_to_dlq'
    },
    pipelineUsage: 12,
    pipelines: ['Webhook Ingest', 'API Gateway Proxy ETL'],
    status: 'active',
    version: 'v2.2.0',
    updatedAt: '2026-09-18T08:15:00Z',
    updatedBy: 'M. Operations',
    tags: ['json', 'structured', 'webhooks']
  }
];

export async function fetchTypeConversionRules(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.sourceType && params.sourceType !== 'All') query.append('sourceType', params.sourceType);
    if (params.targetType && params.targetType !== 'All') query.append('targetType', params.targetType);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = `/api/type-conversion-rules${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch(endpoint);
    if (res && res.data && Array.isArray(res.data.rules)) {
      return res.data;
    }
  } catch (_err) {
    // Graceful fallback to client-side filtered mock data
  }

  // Client-side fallback processing
  let filtered = [...MOCK_TYPE_CONVERSION_RULES];

  if (params.sourceType && params.sourceType !== 'All') {
    filtered = filtered.filter(r => r.sourceType === params.sourceType);
  }
  if (params.targetType && params.targetType !== 'All') {
    filtered = filtered.filter(r => r.targetType === params.targetType);
  }
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter(r => r.status.toLowerCase() === params.status.toLowerCase());
  }
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter(r => r.category === params.category);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.ruleName.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.targetFields.some(f => f.toLowerCase().includes(s)) ||
      r.sourceType.toLowerCase().includes(s) ||
      r.targetType.toLowerCase().includes(s) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(s)))
    );
  }

  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 20;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const stats = {
    totalRules: MOCK_TYPE_CONVERSION_RULES.length,
    activeRules: MOCK_TYPE_CONVERSION_RULES.filter(r => r.status === 'active').length,
    draftRules: MOCK_TYPE_CONVERSION_RULES.filter(r => r.status === 'draft').length,
    disabledRules: MOCK_TYPE_CONVERSION_RULES.filter(r => r.status === 'disabled').length,
    rulesUsedInPipelines: MOCK_TYPE_CONVERSION_RULES.filter(r => r.pipelineUsage > 0).length,
  };

  return {
    rules: paginated,
    stats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }
  };
}

export async function fetchTypeConversionRuleById(id) {
  try {
    const res = await apiFetch(`/api/type-conversion-rules/${id}`);
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }
  return MOCK_TYPE_CONVERSION_RULES.find(r => r.id === id) || null;
}

export async function createTypeConversionRule(payload) {
  try {
    const res = await apiFetch('/api/type-conversion-rules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }

  return {
    id: `tcr-${Date.now()}`,
    ...payload,
    status: payload.status || 'draft',
    version: 'v1.0.0',
    pipelineUsage: 0,
    pipelines: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'Current User'
  };
}

export async function updateTypeConversionRule(id, updates) {
  try {
    const res = await apiFetch(`/api/type-conversion-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }

  return {
    id,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

export async function deleteTypeConversionRule(id) {
  try {
    await apiFetch(`/api/type-conversion-rules/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (_err) {
    return true;
  }
}

export async function testTypeConversionRule(payload) {
  try {
    const res = await apiFetch('/api/type-conversion-rules/test', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && res.data && res.data.results) {
      return res.data;
    }
  } catch (_err) {
    // Fallback simulation test engine
  }

  const sampleValues = payload.sampleValues || [];
  const results = sampleValues.map((val, idx) => {
    let converted = null;
    let status = 'success';
    let errorMessage = null;

    try {
      if (val === null || val === undefined || val === '') {
        if (payload.nullHandling === 'replace') {
          converted = payload.defaultValue || 'DEFAULT';
        } else if (payload.nullHandling === 'reject') {
          status = 'failed';
          errorMessage = 'Null value rejected by rule policy';
        } else {
          converted = null;
        }
      } else if (payload.targetType === 'Integer') {
        const parsed = parseInt(String(val).replace(/,/g, ''), 10);
        if (isNaN(parsed)) {
          throw new Error(`Cannot parse "${val}" as Integer`);
        }
        converted = parsed;
      } else if (payload.targetType === 'Decimal' || payload.targetType === 'Float') {
        const clean = String(val).replace(/[$,]/g, '');
        const parsed = parseFloat(clean);
        if (isNaN(parsed)) {
          throw new Error(`Cannot parse "${val}" as Decimal`);
        }
        converted = parsed.toFixed(2);
      } else if (payload.targetType === 'Boolean') {
        const str = String(val).trim().toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(str)) converted = true;
        else if (['false', '0', 'no', 'n'].includes(str)) converted = false;
        else throw new Error(`Invalid boolean token "${val}"`);
      } else if (payload.targetType === 'Date' || payload.targetType === 'DateTime') {
        const d = new Date(val);
        if (isNaN(d.getTime())) throw new Error(`Invalid date string "${val}"`);
        converted = payload.targetType === 'Date' ? d.toISOString().split('T')[0] : d.toISOString();
      } else {
        converted = String(val);
      }
    } catch (e) {
      status = 'failed';
      errorMessage = e.message;
      if (payload.invalidValueBehavior === 'default') {
        converted = payload.defaultValue;
        status = 'warning';
        errorMessage = `Fallback to default: ${e.message}`;
      } else if (payload.invalidValueBehavior === 'null') {
        converted = null;
        status = 'warning';
        errorMessage = `Fallback to null: ${e.message}`;
      }
    }

    return {
      index: idx + 1,
      field: payload.targetFields?.[0] || 'sample_field',
      originalValue: val,
      sourceType: payload.sourceType || 'String',
      convertedValue: converted,
      targetType: payload.targetType || 'String',
      status,
      errorMessage
    };
  });

  const totalTested = results.length;
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const nullResults = results.filter(r => r.convertedValue === null).length;

  return {
    results,
    statistics: {
      recordsTested: totalTested,
      successful,
      failed,
      warnings,
      nullResults,
      successRate: totalTested > 0 ? ((successful / totalTested) * 100).toFixed(1) : '100.0'
    }
  };
}
