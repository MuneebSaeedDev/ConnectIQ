import { apiFetch } from '../../../services/api/client';

export const SUPPORTED_DATE_TYPES = [
  'String',
  'Date',
  'DateTime',
  'Timestamp',
  'Time'
];

export const COMMON_INPUT_FORMATS = [
  { label: 'Auto Detect / Multi-Format', value: 'AUTO' },
  { label: 'ISO 8601 (YYYY-MM-DD)', value: 'YYYY-MM-DD' },
  { label: 'ISO 8601 DateTime (YYYY-MM-DDTHH:mm:ssZ)', value: 'YYYY-MM-DDTHH:mm:ssZ' },
  { label: 'Standard DateTime (YYYY-MM-DD HH:mm:ss)', value: 'YYYY-MM-DD HH:mm:ss' },
  { label: 'US Standard Date (MM/DD/YYYY)', value: 'MM/DD/YYYY' },
  { label: 'US DateTime (MM/DD/YYYY hh:mm:ss A)', value: 'MM/DD/YYYY hh:mm:ss A' },
  { label: 'European Date (DD/MM/YYYY)', value: 'DD/MM/YYYY' },
  { label: 'European DateTime (DD/MM/YYYY HH:mm:ss)', value: 'DD/MM/YYYY HH:mm:ss' },
  { label: 'Unix Timestamp Seconds (X)', value: 'X' },
  { label: 'Unix Timestamp Milliseconds (x)', value: 'x' },
  { label: 'RFC 2822 (ddd, DD MMM YYYY HH:mm:ss ZZ)', value: 'ddd, DD MMM YYYY HH:mm:ss ZZ' },
  { label: 'Compact Date (YYYYMMDD)', value: 'YYYYMMDD' },
  { label: 'Custom Pattern', value: 'CUSTOM' }
];

export const COMMON_OUTPUT_FORMATS = [
  { label: 'ISO 8601 Date (YYYY-MM-DD)', value: 'YYYY-MM-DD' },
  { label: 'ISO 8601 UTC (YYYY-MM-DDTHH:mm:ss.SSS[Z])', value: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' },
  { label: 'Standard SQL DateTime (YYYY-MM-DD HH:mm:ss)', value: 'YYYY-MM-DD HH:mm:ss' },
  { label: 'US Standard Date (MM/DD/YYYY)', value: 'MM/DD/YYYY' },
  { label: 'US DateTime (MM/DD/YYYY hh:mm A)', value: 'MM/DD/YYYY hh:mm A' },
  { label: 'European Date (DD/MM/YYYY)', value: 'DD/MM/YYYY' },
  { label: 'European DateTime (DD/MM/YYYY HH:mm:ss)', value: 'DD/MM/YYYY HH:mm:ss' },
  { label: 'Human Readable Long (MMMM DD, YYYY)', value: 'MMMM DD, YYYY' },
  { label: 'Human Readable with Time (MMMM DD, YYYY HH:mm)', value: 'MMMM DD, YYYY HH:mm' },
  { label: 'Month-Year (MMM YYYY)', value: 'MMM YYYY' },
  { label: 'Time Only 24-hr (HH:mm:ss)', value: 'HH:mm:ss' },
  { label: 'Time Only 12-hr (hh:mm:ss A)', value: 'hh:mm:ss A' },
  { label: 'Unix Timestamp ms (x)', value: 'x' },
  { label: 'Custom Pattern', value: 'CUSTOM' }
];

export const SUPPORTED_LOCALES = [
  { value: 'en-US', label: 'English (United States) - en-US' },
  { value: 'en-GB', label: 'English (United Kingdom) - en-GB' },
  { value: 'en-CA', label: 'English (Canada) - en-CA' },
  { value: 'de-DE', label: 'German (Germany) - de-DE' },
  { value: 'fr-FR', label: 'French (France) - fr-FR' },
  { value: 'es-ES', label: 'Spanish (Spain) - es-ES' },
  { value: 'ja-JP', label: 'Japanese (Japan) - ja-JP' },
  { value: 'zh-CN', label: 'Chinese (Simplified) - zh-CN' }
];

export const SUPPORTED_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' }
];

export const INVALID_DATE_STRATEGIES = [
  { value: 'reject', label: 'Reject record (Fail job / Pipeline error)' },
  { value: 'null', label: 'Set output to null' },
  { value: 'default', label: 'Apply default fallback date' },
  { value: 'preserve', label: 'Preserve original raw value' },
  { value: 'skip', label: 'Skip record formatting' },
  { value: 'error_workflow', label: 'Send to error-handling dead letter queue' }
];

export const NULL_DATE_STRATEGIES = [
  { value: 'preserve', label: 'Preserve null (do not format)' },
  { value: 'replace', label: 'Replace null with default date' },
  { value: 'reject', label: 'Reject null values (Fail validation)' },
  { value: 'empty_string', label: 'Convert null to empty string ""' }
];

export const MOCK_DATE_FORMATTING_RULES = [
  {
    id: 'dfr-001',
    ruleName: 'US Date to ISO Standard',
    description: 'Converts legacy US date strings into standard ISO-8601 format.',
    category: 'Date Normalization',
    inputType: 'String',
    outputType: 'Date',
    inputFormat: 'MM/DD/YYYY',
    outputFormat: 'YYYY-MM-DD',
    timezoneConversion: 'convert',
    sourceTimezone: 'America/New_York',
    targetTimezone: 'UTC',
    locale: 'en-US',
    targetFields: ['created_date', 'order_date'],
    fallbackFormats: ['MM-DD-YYYY', 'M/D/YYYY'],
    invalidDateBehavior: 'reject',
    nullDateBehavior: 'preserve',
    defaultValue: null,
    pipelineUsage: 12,
    pipelines: ['Customer Master ETL', 'Billing Sync V2'],
    status: 'active',
    version: 'v1.4',
    updatedAt: '2026-09-18T14:32:00Z',
    updatedBy: 'Sarah Jenkins',
    tags: ['E-Commerce', 'Standardization']
  },
  {
    id: 'dfr-002',
    ruleName: 'Convert Timestamp to UTC DateTime',
    description: 'Converts Unix epoch timestamps into standardized UTC DateTime format.',
    category: 'Timezone Conversion',
    inputType: 'Timestamp',
    outputType: 'DateTime',
    inputFormat: 'x',
    outputFormat: 'YYYY-MM-DD HH:mm:ss',
    timezoneConversion: 'convert',
    sourceTimezone: 'UTC',
    targetTimezone: 'UTC',
    locale: 'en-US',
    targetFields: ['event_timestamp', 'login_time'],
    fallbackFormats: ['X'],
    invalidDateBehavior: 'null',
    nullDateBehavior: 'preserve',
    defaultValue: null,
    pipelineUsage: 8,
    pipelines: ['Telemetry Stream', 'Audit Log Consolidator'],
    status: 'active',
    version: 'v2.1',
    updatedAt: '2026-09-17T09:15:00Z',
    updatedBy: 'David Chen',
    tags: ['Logs', 'UTC']
  },
  {
    id: 'dfr-003',
    ruleName: 'Standardize Customer Birth Date',
    description: 'Parses multiple legacy regional formats and standardizes to YYYY-MM-DD.',
    category: 'Date Parsing',
    inputType: 'String',
    outputType: 'Date',
    inputFormat: 'Multiple (3)',
    outputFormat: 'YYYY-MM-DD',
    timezoneConversion: 'preserve',
    sourceTimezone: 'America/New_York',
    targetTimezone: 'America/New_York',
    locale: 'en-US',
    targetFields: ['dob', 'birth_date'],
    fallbackFormats: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'],
    invalidDateBehavior: 'default',
    nullDateBehavior: 'replace',
    defaultValue: '1970-01-01',
    pipelineUsage: 4,
    pipelines: ['CRM Contact Ingestion'],
    status: 'draft',
    version: 'v0.9',
    updatedAt: '2026-09-16T18:22:00Z',
    updatedBy: 'Alex Rivera',
    tags: ['CRM', 'Customers']
  },
  {
    id: 'dfr-004',
    ruleName: 'Normalize Order DateTime',
    description: 'Formats European order timestamps with custom timezone adjustments.',
    category: 'DateTime Formatting',
    inputType: 'String',
    outputType: 'DateTime',
    inputFormat: 'DD/MM/YYYY HH:mm',
    outputFormat: 'YYYY-MM-DD HH:mm:ss',
    timezoneConversion: 'convert',
    sourceTimezone: 'Europe/London',
    targetTimezone: 'UTC',
    locale: 'en-GB',
    targetFields: ['order_placed_at'],
    fallbackFormats: ['DD-MM-YYYY HH:mm:ss'],
    invalidDateBehavior: 'error_workflow',
    nullDateBehavior: 'preserve',
    defaultValue: null,
    pipelineUsage: 19,
    pipelines: ['ERP Ledger Sync', 'Order Batch Processor'],
    status: 'active',
    version: 'v3.0',
    updatedAt: '2026-09-15T11:45:00Z',
    updatedBy: 'Elena Rostova',
    tags: ['Finance', 'Orders']
  },
  {
    id: 'dfr-005',
    ruleName: 'Format Date for Reporting',
    description: 'Converts DateTime to human-readable month string for analytical dashboards.',
    category: 'Reporting Format',
    inputType: 'DateTime',
    outputType: 'String',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
    outputFormat: 'MMMM DD, YYYY',
    timezoneConversion: 'convert',
    sourceTimezone: 'UTC',
    targetTimezone: 'America/New_York',
    locale: 'en-US',
    targetFields: ['report_period_end'],
    fallbackFormats: [],
    invalidDateBehavior: 'null',
    nullDateBehavior: 'preserve',
    defaultValue: null,
    pipelineUsage: 0,
    pipelines: [],
    status: 'disabled',
    version: 'v1.0',
    updatedAt: '2026-09-10T16:00:00Z',
    updatedBy: 'Michael Brown',
    tags: ['Analytics', 'Reports']
  }
];

export async function fetchDateFormattingRules(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.inputType && params.inputType !== 'All') query.append('inputType', params.inputType);
    if (params.outputType && params.outputType !== 'All') query.append('outputType', params.outputType);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = `/api/date-formatting-rules${queryString ? '?' + queryString : ''}`;
    const res = await apiFetch(endpoint);
    if (res && res.data && Array.isArray(res.data.rules)) {
      return res.data;
    }
  } catch (_err) {
    // Graceful fallback to client-side filtering
  }

  let filtered = [...MOCK_DATE_FORMATTING_RULES];

  if (params.status && params.status !== 'All') {
    filtered = filtered.filter(r => r.status.toLowerCase() === params.status.toLowerCase());
  }
  if (params.inputType && params.inputType !== 'All') {
    filtered = filtered.filter(r => r.inputType === params.inputType);
  }
  if (params.outputType && params.outputType !== 'All') {
    filtered = filtered.filter(r => r.outputType === params.outputType);
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
      r.inputFormat.toLowerCase().includes(s) ||
      r.outputFormat.toLowerCase().includes(s) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(s)))
    );
  }

  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 20;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const stats = {
    totalRules: MOCK_DATE_FORMATTING_RULES.length,
    activeRules: MOCK_DATE_FORMATTING_RULES.filter(r => r.status === 'active').length,
    draftRules: MOCK_DATE_FORMATTING_RULES.filter(r => r.status === 'draft').length,
    disabledRules: MOCK_DATE_FORMATTING_RULES.filter(r => r.status === 'disabled').length,
    rulesUsedInPipelines: MOCK_DATE_FORMATTING_RULES.filter(r => r.pipelineUsage > 0).length,
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

export async function fetchDateFormattingRuleById(id) {
  try {
    const res = await apiFetch(`/api/date-formatting-rules/${id}`);
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }
  return MOCK_DATE_FORMATTING_RULES.find(r => r.id === id) || null;
}

export async function createDateFormattingRule(payload) {
  try {
    const res = await apiFetch('/api/date-formatting-rules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }

  const newRule = {
    id: 'dfr-' + Date.now(),
    ...payload,
    status: payload.status || 'draft',
    version: 'v1.0.0',
    pipelineUsage: 0,
    pipelines: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'Current User'
  };
  MOCK_DATE_FORMATTING_RULES.unshift(newRule);
  return newRule;
}

export async function updateDateFormattingRule(id, updates) {
  try {
    const res = await apiFetch(`/api/date-formatting-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }

  const idx = MOCK_DATE_FORMATTING_RULES.findIndex(r => r.id === id);
  if (idx !== -1) {
    MOCK_DATE_FORMATTING_RULES[idx] = {
      ...MOCK_DATE_FORMATTING_RULES[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return MOCK_DATE_FORMATTING_RULES[idx];
  }

  return {
    id,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

export async function deleteDateFormattingRule(id) {
  try {
    await apiFetch(`/api/date-formatting-rules/${id}`, {
      method: 'DELETE'
    });
    const idx = MOCK_DATE_FORMATTING_RULES.findIndex(r => r.id === id);
    if (idx !== -1) {
      MOCK_DATE_FORMATTING_RULES.splice(idx, 1);
    }
    return true;
  } catch (_err) {
    const idx = MOCK_DATE_FORMATTING_RULES.findIndex(r => r.id === id);
    if (idx !== -1) {
      MOCK_DATE_FORMATTING_RULES.splice(idx, 1);
    }
    return true;
  }
}

export async function toggleDateFormattingRuleStatus(id, status) {
  try {
    await apiFetch(`/api/date-formatting-rules/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const item = MOCK_DATE_FORMATTING_RULES.find(r => r.id === id);
    if (item) item.status = status;
    return true;
  } catch (_err) {
    const item = MOCK_DATE_FORMATTING_RULES.find(r => r.id === id);
    if (item) item.status = status;
    return true;
  }
}

export async function duplicateDateFormattingRule(id) {
  try {
    await apiFetch(`/api/date-formatting-rules/${id}/duplicate`, {
      method: 'POST'
    });
    const orig = MOCK_DATE_FORMATTING_RULES.find(r => r.id === id);
    if (orig) {
      const dup = {
        ...orig,
        id: 'dfr-' + Date.now(),
        ruleName: `${orig.ruleName} (Copy)`,
        status: 'draft',
        pipelineUsage: 0,
        updatedAt: new Date().toISOString()
      };
      MOCK_DATE_FORMATTING_RULES.unshift(dup);
    }
    return true;
  } catch (_err) {
    const orig = MOCK_DATE_FORMATTING_RULES.find(r => r.id === id);
    if (orig) {
      const dup = {
        ...orig,
        id: 'dfr-' + Date.now(),
        ruleName: `${orig.ruleName} (Copy)`,
        status: 'draft',
        pipelineUsage: 0,
        updatedAt: new Date().toISOString()
      };
      MOCK_DATE_FORMATTING_RULES.unshift(dup);
    }
    return true;
  }
}

export async function testDateFormattingRule(payload) {
  try {
    const res = await apiFetch('/api/date-formatting-rules/test', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && res.data && res.data.results) {
      return res.data;
    }
  } catch (_err) {
    // Fallback client simulation parser/formatter
  }

  const sampleValues = payload.sampleValues || [];
  const results = sampleValues.map((val, idx) => {
    let parsedValue = null;
    let outputValue = null;
    let status = 'success';
    let errorMessage = null;

    try {
      if (val === null || val === undefined || val === '') {
        if (payload.nullDateBehavior === 'replace') {
          outputValue = payload.defaultValue || '1970-01-01';
          parsedValue = 'Null (Default applied)';
        } else if (payload.nullDateBehavior === 'reject') {
          status = 'failed';
          errorMessage = 'Null date rejected by rule policy';
        } else {
          outputValue = null;
          parsedValue = 'Null';
        }
      } else {
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          throw new Error(`Unable to parse "${val}" using configured format`);
        }
        parsedValue = d.toUTCString();

        // Output format simulation
        if (payload.outputFormat === 'YYYY-MM-DD') {
          outputValue = d.toISOString().split('T')[0];
        } else if (payload.outputFormat === 'YYYY-MM-DD HH:mm:ss') {
          outputValue = d.toISOString().replace('T', ' ').substring(0, 19);
        } else if (payload.outputFormat === 'MMMM DD, YYYY') {
          outputValue = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
          outputValue = d.toISOString();
        }
      }
    } catch (e) {
      status = 'failed';
      errorMessage = e.message;
      if (payload.invalidDateBehavior === 'default') {
        outputValue = payload.defaultValue || '1970-01-01';
        status = 'warning';
        errorMessage = `Fallback to default: ${e.message}`;
      } else if (payload.invalidDateBehavior === 'null') {
        outputValue = null;
        status = 'warning';
        errorMessage = `Fallback to null: ${e.message}`;
      } else if (payload.invalidDateBehavior === 'preserve') {
        outputValue = val;
        status = 'warning';
        errorMessage = `Preserved original: ${e.message}`;
      }
    }

    return {
      index: idx + 1,
      inputValue: val,
      parsedValue: parsedValue || '-',
      sourceTimezone: payload.sourceTimezone || 'UTC',
      targetTimezone: payload.targetTimezone || 'UTC',
      outputValue: outputValue !== null ? String(outputValue) : 'null',
      status,
      errorMessage
    };
  });

  const totalTested = results.length;
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const nullValues = results.filter(r => r.outputValue === 'null' || r.inputValue === null || r.inputValue === '').length;

  return {
    results,
    statistics: {
      valuesTested: totalTested,
      successful,
      failed,
      warnings,
      nullValues,
      invalidValues: failed,
      successRate: totalTested > 0 ? ((successful / totalTested) * 100).toFixed(1) : '100.0'
    }
  };
}