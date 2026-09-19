/**
 * transformationRules.api.js
 * API Client and data service for Transformation Rules List (Screen #78)
 */
import { apiFetch } from '../../../services/api/client';

export const TRANSFORMATION_CATEGORIES = [
  'All',
  'Data Cleaning',
  'Type Conversion',
  'Date Formatting',
  'Duplicate Removal',
  'Lookup & Enrichment',
  'Custom Expression',
  'Field Mapping',
  'Normalization',
];

export const TRANSFORMATION_STATUSES = [
  'All',
  'Active',
  'Draft',
  'Disabled',
  'Archived',
];

export const MOCK_TRANSFORMATION_RULES = [
  {
    _id: 'rule_1',
    ruleId: 'RULE-TR-001',
    name: 'Email Normalization & Sanitization',
    description: 'Trims leading/trailing whitespace and converts string to lowercase for RFC standard.',
    category: 'Data Cleaning',
    type: 'rule_based',
    status: 'Active',
    version: 'v1.2.0',
    inputField: 'customer_email',
    outputField: 'email_clean',
    sourceType: 'String',
    targetType: 'String',
    operation: 'Normalize Case + Trim',
    parameters: { case: 'lowercase', trim: true },
    pipelinesCount: 14,
    usageCount: 14820,
    lastExecuted: '2026-09-18T10:30:00Z',
    createdBy: 'D. Engineer',
    updatedBy: 'D. Engineer',
    tags: ['customer', 'pii', 'clean'],
    isGlobal: true,
  },
  {
    _id: 'rule_2',
    ruleId: 'RULE-TR-002',
    name: 'Currency String to Decimal Casting',
    description: 'Parses formatted currency strings ($1,499.99) into precise decimal precision format.',
    category: 'Type Conversion',
    type: 'rule_based',
    status: 'Active',
    version: 'v2.0.1',
    inputField: 'total_amount',
    outputField: 'amount',
    sourceType: 'String',
    targetType: 'Decimal',
    operation: 'String → Decimal',
    parameters: { format: '0.00', removeSymbols: ['$', ','] },
    pipelinesCount: 8,
    usageCount: 8940,
    lastExecuted: '2026-09-18T11:15:00Z',
    createdBy: 'J. Doe',
    updatedBy: 'J. Doe',
    tags: ['finance', 'casting', 'orders'],
    isGlobal: false,
  },
  {
    _id: 'rule_3',
    ruleId: 'RULE-TR-003',
    name: 'ISO Timestamp to UTC Standard',
    description: 'Parses varied datetime inputs and normalizes to standard ISO-8601 UTC timestamp.',
    category: 'Date Formatting',
    type: 'rule_based',
    status: 'Active',
    version: 'v1.0.0',
    inputField: 'order_date',
    outputField: 'order_ts',
    sourceType: 'String',
    targetType: 'Timestamp',
    operation: 'Parse Date / Timezone Cast',
    parameters: { sourceFormat: 'auto', targetTz: 'UTC' },
    pipelinesCount: 22,
    usageCount: 34120,
    lastExecuted: '2026-09-18T11:45:00Z',
    createdBy: 'A. Weber',
    updatedBy: 'A. Weber',
    tags: ['dates', 'timestamps', 'core'],
    isGlobal: true,
  },
  {
    _id: 'rule_4',
    ruleId: 'RULE-TR-004',
    name: 'Address Whitespace Cleanup',
    description: 'Removes double spaces, tabs, and excess line breaks from street address lines.',
    category: 'Data Cleaning',
    type: 'rule_based',
    status: 'Draft',
    version: 'v0.9.0',
    inputField: 'street_address',
    outputField: 'street_address_clean',
    sourceType: 'String',
    targetType: 'String',
    operation: 'Regex Multi-space Strip',
    parameters: { regex: '\\s+', replacement: ' ' },
    pipelinesCount: 3,
    usageCount: 420,
    lastExecuted: '2026-09-17T18:00:00Z',
    createdBy: 'D. Engineer',
    updatedBy: 'D. Engineer',
    tags: ['address', 'geo'],
    isGlobal: false,
  },
  {
    _id: 'rule_5',
    ruleId: 'RULE-TR-005',
    name: 'Order Status Code to Label Lookup',
    description: 'Maps integer status codes (1, 2, 3) to descriptive business status string labels.',
    category: 'Lookup & Enrichment',
    type: 'rule_based',
    status: 'Active',
    version: 'v3.1.0',
    inputField: 'status_code',
    outputField: 'status_label',
    sourceType: 'Integer',
    targetType: 'String',
    operation: 'Dictionary Map / Fallback',
    parameters: { lookupTable: 'status_map_v2', defaultValue: 'UNKNOWN' },
    pipelinesCount: 19,
    usageCount: 22100,
    lastExecuted: '2026-09-18T12:00:00Z',
    createdBy: 'M. Chen',
    updatedBy: 'M. Chen',
    tags: ['orders', 'dictionary', 'lookup'],
    isGlobal: false,
  },
  {
    _id: 'rule_6',
    ruleId: 'RULE-TR-006',
    name: 'Tax Calculation Custom Expression',
    description: 'Calculates subtotal * (1 + tax_rate) using mathematical safe expression builder.',
    category: 'Custom Expression',
    type: 'rule_based',
    status: 'Active',
    version: 'v1.1.0',
    inputField: 'subtotal, tax_rate',
    outputField: 'total_with_tax',
    sourceType: 'Decimal',
    targetType: 'Decimal',
    operation: 'Expression Formula',
    parameters: { formula: 'subtotal * (1 + tax_rate)' },
    pipelinesCount: 6,
    usageCount: 5120,
    lastExecuted: '2026-09-18T09:12:00Z',
    createdBy: 'Finance Team',
    updatedBy: 'Finance Team',
    tags: ['tax', 'math', 'billing'],
    isGlobal: false,
  },
  {
    _id: 'rule_7',
    ruleId: 'RULE-TR-007',
    name: 'Legacy Phone Number Standardizer',
    description: 'Strips non-digit punctuation and ensures E.164 international country code prefix.',
    category: 'Data Cleaning',
    type: 'rule_based',
    status: 'Disabled',
    version: 'v1.0.0',
    inputField: 'phone_number',
    outputField: 'phone_e164',
    sourceType: 'String',
    targetType: 'String',
    operation: 'Regex Strip & Format',
    parameters: { countryCode: '+1' },
    pipelinesCount: 0,
    usageCount: 0,
    lastExecuted: null,
    createdBy: 'A. Weber',
    updatedBy: 'A. Weber',
    tags: ['phone', 'contact'],
    isGlobal: false,
  },
];

export async function fetchTransformationRules(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = `/api/transformation-rules${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch(endpoint);
    if (res && res.data && Array.isArray(res.data.rules)) {
      return res.data;
    }
  } catch (_err) {
    // Graceful fallback to client-side filtered mock data
  }

  // Filter client-side if fallback
  let filtered = [...MOCK_TRANSFORMATION_RULES];
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter(r => r.category === params.category);
  }
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter(r => r.status === params.status);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.inputField.toLowerCase().includes(s) ||
      r.outputField.toLowerCase().includes(s) ||
      r.ruleId.toLowerCase().includes(s) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(s)))
    );
  }

  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 10;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    rules: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function fetchTransformationRuleById(id) {
  try {
    const res = await apiFetch(`/api/transformation-rules/${id}`);
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback
  }
  return MOCK_TRANSFORMATION_RULES.find(r => r._id === id || r.ruleId === id) || null;
}

export async function createTransformationRule(payload) {
  try {
    const res = await apiFetch('/api/transformation-rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    _id: `rule_${Date.now()}`,
    ruleId: `RULE-TR-${Math.floor(100 + Math.random() * 900)}`,
    ...payload,
    status: payload.status || 'Active',
    version: 'v1.0.0',
    pipelinesCount: 0,
    usageCount: 0,
    createdBy: 'You',
    updatedBy: 'You',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateTransformationRule(id, updates) {
  try {
    const res = await apiFetch(`/api/transformation-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res && res.data && res.data.rule) {
      return res.data.rule;
    }
  } catch (_err) {
    // Fallback simulation
  }
  return {
    _id: id,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

export async function toggleTransformationRuleStatus(id) {
  try {
    const res = await apiFetch(`/api/transformation-rules/${id}/toggle`, {
      method: 'PATCH',
    });
    if (res && res.data) {
      return res.data;
    }
  } catch (_err) {
    // Fallback simulation
  }
  return { success: true };
}

export async function deleteTransformationRule(id) {
  try {
    await apiFetch(`/api/transformation-rules/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (_err) {
    // Fallback simulation
    return true;
  }
}
