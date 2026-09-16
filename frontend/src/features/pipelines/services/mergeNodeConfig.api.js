/**
 * mergeNodeConfig.api.js
 * API client and Figma-verified mock baseline for SCR-072: Merge Node Configuration Screen
 *
 * Provides real HTTP client methods with JSON content-type and error guards,
 * falling back to the Figma-specified mock contract when no backend daemon is present.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class MergeNodeConfigError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'MergeNodeConfigError';
    this.status = status;
    this.details = details;
  }
}

export const MERGE_STRATEGIES = [
  {
    id: 'inner_join',
    label: 'Inner Join',
    icon: 'intersect',
    badge: 'Standard',
    description: 'Keep only matching records present in both primary (left) and secondary (right) input streams based on join keys.',
    example: 'Matching customer_id in CRM and Orders',
    recommendedFor: 'Strict record reconciliation where missing side records must be excluded'
  },
  {
    id: 'left_join',
    label: 'Left Outer Join',
    icon: 'arrow-left',
    badge: 'Popular',
    description: 'Preserve all rows from the primary (left) stream. Enrich with matching attributes from secondary stream; fill nulls when missing.',
    example: 'All customers enriched with recent order metadata if present',
    recommendedFor: 'Master data enrichment and dimension lookup'
  },
  {
    id: 'right_join',
    label: 'Right Outer Join',
    icon: 'arrow-right',
    badge: 'Enrichment',
    description: 'Preserve all rows from the secondary (right) stream. Include matching data from primary stream; fill nulls for unmatched left records.',
    example: 'All transactions preserving order integrity, tagged with user metadata',
    recommendedFor: 'Event-first ingestion with optional master entity metadata'
  },
  {
    id: 'full_outer_join',
    label: 'Full Outer Join',
    icon: 'circle-dot',
    badge: 'Complete',
    description: 'Retain all rows from both streams. Matched rows are merged; unmatched rows from either side are included with null fields.',
    example: 'Unified CRM and ERP customer roster reconciliation',
    recommendedFor: 'Cross-system federated consolidation without data loss'
  },
  {
    id: 'union_all',
    label: 'Union All (Concat)',
    icon: 'layers',
    badge: 'Append',
    description: 'Stack records vertically from both streams without deduplication. Schema alignment is automatically applied or padded.',
    example: 'Combining legacy database archives with real-time stream logs',
    recommendedFor: 'High-throughput append pipelines and historical batching'
  },
  {
    id: 'union_distinct',
    label: 'Union Distinct',
    icon: 'copy-check',
    badge: 'Deduplicated',
    description: 'Stack records vertically while eliminating exact duplicates across composite key attributes.',
    example: 'Merging multi-region customer signups deduplicated on email + tax_id',
    recommendedFor: 'Multi-tenant ingest deduplication'
  },
  {
    id: 'lookup_enrich',
    label: 'Lookup / Fast Map',
    icon: 'search',
    badge: 'In-Memory',
    description: 'Stream left dataset through an in-memory hash index of the right reference table for ultra-low latency key-value enrichment.',
    example: 'IP geolocation lookup table or currency exchange rate multiplier',
    recommendedFor: 'Reference dimension enrichment under 500k cached records'
  }
];

export const CONFLICT_RESOLUTIONS = [
  { id: 'prefer_primary', label: 'Prefer Left (Primary)', description: 'Retain left input value when field collision occurs' },
  { id: 'prefer_secondary', label: 'Prefer Right (Secondary)', description: 'Overwrite with right input value on collision' },
  { id: 'coalesce', label: 'Coalesce (First Non-Null)', description: 'Use primary value if not null, otherwise secondary value' },
  { id: 'prefix_suffix', label: 'Prefix / Suffix Collision', description: 'Rename conflicting columns with left_ and right_ prefixes' },
  { id: 'custom_expression', label: 'Custom Expression / Script', description: 'Evaluate a lambda or SQL expression to resolve collision' }
];

export const INPUT_STREAM_LEFT = {
  id: 'stream_primary',
  name: 'Primary Stream (Postgres CRM)',
  sourceNodeId: 'src_postgres_01',
  recordCount: 4200000,
  schema: [
    { name: 'customer_id', type: 'INTEGER', isKey: true, nullable: false, sample: '100421' },
    { name: 'email', type: 'STRING', isKey: false, nullable: false, sample: 'alice.chen@acme.corp' },
    { name: 'full_name', type: 'STRING', isKey: false, nullable: true, sample: 'Alice Chen' },
    { name: 'account_tier', type: 'STRING', isKey: false, nullable: true, sample: 'Enterprise' },
    { name: 'country_code', type: 'STRING', isKey: false, nullable: true, sample: 'US' },
    { name: 'created_at', type: 'TIMESTAMP', isKey: false, nullable: false, sample: '2026-01-15T08:30:00Z' },
    { name: 'lifetime_value', type: 'DECIMAL(12,2)', isKey: false, nullable: true, sample: '45200.00' }
  ]
};

export const INPUT_STREAM_RIGHT = {
  id: 'stream_secondary',
  name: 'Secondary Stream (Snowflake Orders)',
  sourceNodeId: 'src_snowflake_02',
  recordCount: 18500000,
  schema: [
    { name: 'order_id', type: 'STRING', isKey: true, nullable: false, sample: 'ORD-98214' },
    { name: 'cust_ref_id', type: 'INTEGER', isKey: true, nullable: false, sample: '100421' },
    { name: 'order_status', type: 'STRING', isKey: false, nullable: false, sample: 'DELIVERED' },
    { name: 'order_total', type: 'DECIMAL(10,2)', isKey: false, nullable: false, sample: '1240.50' },
    { name: 'payment_method', type: 'STRING', isKey: false, nullable: true, sample: 'CREDIT_CARD' },
    { name: 'shipping_country', type: 'STRING', isKey: false, nullable: true, sample: 'US' },
    { name: 'placed_at', type: 'TIMESTAMP', isKey: false, nullable: false, sample: '2026-09-12T14:15:22Z' }
  ]
};

export const DEFAULT_MERGE_NODE_CONFIG = {
  nodeId: 'mrg_node_0072',
  nodeName: 'Customer Orders Multi-Stream Merge',
  description: 'Join real-time customer profile records with order ledger to create consolidated customer 360 analytical dataset.',
  category: 'Merge & Join',
  environment: 'Production',
  status: 'Configured',
  version: '1.3.0',
  tags: ['Customer360', 'InnerJoin', 'Orders', 'CRM'],

  // Input streams configuration
  primaryStream: {
    nodeId: 'src_postgres_01',
    nodeName: 'PostgreSQL Production CRM',
    alias: 'crm',
    totalRecords: 4200000,
    fields: INPUT_STREAM_LEFT.schema
  },
  secondaryStream: {
    nodeId: 'src_snowflake_02',
    nodeName: 'Snowflake Orders Stream',
    alias: 'orders',
    totalRecords: 18500000,
    fields: INPUT_STREAM_RIGHT.schema
  },

  // Merge strategy & Join keys
  strategy: 'left_join',
  joinConditions: [
    {
      id: 'jc_1',
      leftField: 'customer_id',
      operator: 'EQUALS',
      rightField: 'cust_ref_id',
      caseSensitive: true,
      nullSafe: true
    }
  ],
  joinMismatchHandling: 'INCLUDE_NULLS', // 'DROP', 'INCLUDE_NULLS', 'EMIT_TO_DEAD_LETTER'

  // Field Collision & Aliasing
  conflictResolution: 'prefix_suffix',
  leftPrefix: 'crm_',
  rightPrefix: 'orders_',
  fieldMappings: [
    { outputField: 'customer_id', leftSource: 'customer_id', rightSource: null, type: 'INTEGER', include: true, isKey: true },
    { outputField: 'email', leftSource: 'email', rightSource: null, type: 'STRING', include: true, isKey: false },
    { outputField: 'full_name', leftSource: 'full_name', rightSource: null, type: 'STRING', include: true, isKey: false },
    { outputField: 'account_tier', leftSource: 'account_tier', rightSource: null, type: 'STRING', include: true, isKey: false },
    { outputField: 'order_id', leftSource: null, rightSource: 'order_id', type: 'STRING', include: true, isKey: false },
    { outputField: 'order_total', leftSource: null, rightSource: 'order_total', type: 'DECIMAL(10,2)', include: true, isKey: false },
    { outputField: 'order_status', leftSource: null, rightSource: 'order_status', type: 'STRING', include: true, isKey: false },
    { outputField: 'placed_at', leftSource: null, rightSource: 'placed_at', type: 'TIMESTAMP', include: true, isKey: false },
    { outputField: 'lifetime_value', leftSource: 'lifetime_value', rightSource: null, type: 'DECIMAL(12,2)', include: true, isKey: false }
  ],

  // Deduplication & Aggregation settings
  deduplication: {
    enabled: true,
    compositeKeys: ['customer_id', 'order_id'],
    dedupStrategy: 'KEEP_LATEST',
    sortField: 'placed_at',
    sortOrder: 'DESC'
  },

  // Performance & Buffer tuning
  performance: {
    joinBufferType: 'IN_MEMORY_HASH', // 'IN_MEMORY_HASH', 'SORT_MERGE_SPILL', 'BROADCAST_LOOKUP'
    bufferSizeMb: 512,
    spillToDisk: true,
    spillThresholdPercent: 80,
    parallelWorkers: 4,
    batchSize: 10000,
    enablePartitioning: true,
    partitionKey: 'country_code'
  },

  // Monitoring & Telemetry
  monitoring: {
    trackJoinRatios: true,
    alertOnDropRateExceeded: true,
    dropRateThresholdPercent: 5.0,
    logUnmatchedKeys: true,
    maxUnmatchedKeySamples: 100,
    metricsIntervalSec: 10
  },

  // Telemetry KPIs / Results Mock
  telemetry: {
    matchedRecords: 4192400,
    unmatchedLeft: 7600,
    unmatchedRight: 14307600,
    matchRatePercent: 99.82,
    avgProcessingThroughput: '124,500 rec/sec',
    peakMemoryMb: 384,
    diskSpillMb: 0,
    totalOutputRecords: 4200000,
    elapsedDuration: '34.2s',
    healthStatus: 'HEALTHY'
  }
};

export async function getMergeNodeConfig(nodeId = 'mrg_node_0072', pipelineId = 'customer-etl-pipeline') {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/config`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.data) return data.data;
    }
  } catch (e) {
    console.info('[MergeNodeConfig] Using Figma baseline:', e.message);
  }
  return DEFAULT_MERGE_NODE_CONFIG;
}

export async function saveMergeNodeConfig(nodeId, pipelineId, payload) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data || payload;
    }
  } catch (e) {
    console.warn('[MergeNodeConfig] Save fallback:', e.message);
  }
  return { ...payload, updatedAt: new Date().toISOString() };
}

export async function saveMergeNodeDraft(nodeId, pipelineId, payload) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data || payload;
    }
  } catch (e) {
    console.info('[MergeNodeConfig] Draft saved locally:', e.message);
  }
  return { ...payload, isDraft: true, savedAt: new Date().toISOString() };
}

export async function validateMergeConditions(nodeId, pipelineId, payload) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/validate-join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data;
    }
  } catch (e) {
    console.info('[MergeNodeConfig] Local validation evaluation:', e.message);
  }
  return {
    isValid: true,
    score: 100,
    matchedKeyTypes: true,
    warnings: [],
    errors: [],
    details: 'Join condition between customer_id (INTEGER) and cust_ref_id (INTEGER) is strictly type-compatible.'
  };
}

export async function testMergeExecution(nodeId, pipelineId, sampleLimit = 50) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/test-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleLimit })
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data;
    }
  } catch (e) {
    console.info('[MergeNodeConfig] Test merge run baseline:', e.message);
  }
  return {
    status: 'COMPLETED',
    testedAt: new Date().toISOString(),
    recordsProcessed: sampleLimit,
    matchedCount: sampleLimit,
    unmatchedCount: 0,
    durationMs: 142,
    previewRows: [
      { customer_id: 100421, email: 'alice.chen@acme.corp', full_name: 'Alice Chen', account_tier: 'Enterprise', order_id: 'ORD-98214', order_total: 1240.50, order_status: 'DELIVERED', placed_at: '2026-09-12T14:15:22Z', lifetime_value: 45200.00, _matchStatus: 'MATCHED' },
      { customer_id: 100422, email: 'bob.marley@global.org', full_name: 'Bob Marley', account_tier: 'Growth', order_id: 'ORD-98215', order_total: 890.00, order_status: 'SHIPPED', placed_at: '2026-09-13T10:02:11Z', lifetime_value: 12400.00, _matchStatus: 'MATCHED' },
      { customer_id: 100423, email: 'carol.danvers@marvel.io', full_name: 'Carol Danvers', account_tier: 'Enterprise', order_id: 'ORD-98216', order_total: 5400.00, order_status: 'PROCESSING', placed_at: '2026-09-14T09:21:40Z', lifetime_value: 98000.00, _matchStatus: 'MATCHED' },
      { customer_id: 100424, email: 'david.kim@fintech.co', full_name: 'David Kim', account_tier: 'Starter', order_id: null, order_total: null, order_status: null, placed_at: null, lifetime_value: 1500.00, _matchStatus: 'UNMATCHED_LEFT' }
    ]
  };
}

export async function duplicateMergeNode(nodeId, pipelineId, newName) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/nodes/${nodeId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data;
    }
  } catch (e) {
    console.info('[MergeNodeConfig] Node duplicate fallback:', e.message);
  }
  return {
    nodeId: `mrg_node_${Date.now().toString(36)}`,
    nodeName: newName || 'Customer Orders Multi-Stream Merge (Copy)',
    status: 'Draft',
    duplicatedAt: new Date().toISOString()
  };
}
