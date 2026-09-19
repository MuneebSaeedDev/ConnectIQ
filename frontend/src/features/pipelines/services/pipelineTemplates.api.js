/**
 * pipelineTemplates.api.js
 * API client and Figma-verified mock baseline for SCR-076: Pipeline Template Library
 */

import { apiFetch, readJson } from '../../../services/api/client';

export const TEMPLATE_CATEGORIES = [
  'Data Ingestion',
  'Data Synchronization',
  'ETL',
  'Data Transformation',
  'Data Validation',
  'Data Migration',
  'API Integration',
  'Reporting'
];

export const MOCK_TEMPLATES = [
  {
    id: 'tmpl_sys_001',
    title: 'PostgreSQL to Snowflake Data Mart',
    category: 'ETL',
    description: 'Complete pipeline topology including relational source extraction, active filter stage, column casting, and upsert load to Snowflake marts.',
    nodesCount: 6,
    complexity: 'Intermediate',
    estimatedSetupTime: '5 mins',
    author: 'ConnectIQ Official',
    ownership: 'system',
    status: 'active',
    version: '2.1.0',
    usageCount: 1405,
    lastUpdated: '2026-09-10T14:30:00Z',
    featured: true,
    tags: ['PostgreSQL', 'Snowflake', 'Upsert'],
    sourceTypes: ['Database'],
    destinationTypes: ['Warehouse'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'PostgreSQL Source', icon: 'Database' },
      { id: 'n2', type: 'filter', label: 'Change Data Capture (CDC)', icon: 'Filter' },
      { id: 'n3', type: 'mapping', label: 'Column Standardizer', icon: 'Map' },
      { id: 'n4', type: 'destination', label: 'Snowflake Upsert', icon: 'Warehouse' }
    ]
  },
  {
    id: 'tmpl_sys_002',
    title: 'Stripe Billing & Ledger Reconciliation',
    category: 'API Integration',
    description: 'Real-time webhook capture pipeline with currency standardizer, fee calculation expression, and BigQuery financial partition store.',
    nodesCount: 8,
    complexity: 'Advanced',
    estimatedSetupTime: '10 mins',
    author: 'ConnectIQ Official',
    ownership: 'system',
    status: 'active',
    version: '1.4.2',
    usageCount: 890,
    lastUpdated: '2026-09-15T09:00:00Z',
    featured: true,
    tags: ['Stripe', 'BigQuery', 'Webhooks'],
    sourceTypes: ['API'],
    destinationTypes: ['Warehouse'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'Stripe Webhook', icon: 'Webhook' },
      { id: 'n2', type: 'transformation', label: 'Currency Conversion', icon: 'Code' },
      { id: 'n3', type: 'validation', label: 'Financial Rules Validation', icon: 'CheckSquare' },
      { id: 'n4', type: 'destination', label: 'BigQuery Partition', icon: 'Warehouse' }
    ]
  },
  {
    id: 'tmpl_org_001',
    title: 'Customer Data Standardization (EMEA)',
    category: 'Data Validation',
    description: 'Internal organization template for normalizing EMEA customer records. Validates GDPR consent flags and hashes PII before loading to operational datastore.',
    nodesCount: 5,
    complexity: 'Advanced',
    estimatedSetupTime: '15 mins',
    author: 'Data Platform Team',
    ownership: 'organization',
    status: 'active',
    version: '1.0.5',
    usageCount: 24,
    lastUpdated: '2026-08-20T11:20:00Z',
    featured: false,
    tags: ['GDPR', 'PII', 'Validation'],
    sourceTypes: ['Database', 'API'],
    destinationTypes: ['Database'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'Multi-region CRM', icon: 'Database' },
      { id: 'n2', type: 'validation', label: 'GDPR Consent Check', icon: 'Shield' },
      { id: 'n3', type: 'transformation', label: 'PII Hashing', icon: 'Lock' },
      { id: 'n4', type: 'destination', label: 'Normalized CRM Datastore', icon: 'Database' }
    ]
  },
  {
    id: 'tmpl_sys_003',
    title: 'S3 Parquet Lake to Redshift Cluster',
    category: 'Data Migration',
    description: 'High-throughput bulk ingestion using manifest-based S3 scanning and concurrent Redshift COPY command execution.',
    nodesCount: 3,
    complexity: 'Beginner',
    estimatedSetupTime: '3 mins',
    author: 'ConnectIQ Official',
    ownership: 'system',
    status: 'active',
    version: '3.0.0',
    usageCount: 3410,
    lastUpdated: '2026-09-01T08:15:00Z',
    featured: false,
    tags: ['S3', 'Redshift', 'Bulk'],
    sourceTypes: ['Cloud Storage'],
    destinationTypes: ['Warehouse'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'Amazon S3 Bucket', icon: 'Cloud' },
      { id: 'n2', type: 'mapping', label: 'Parquet Schema Map', icon: 'Map' },
      { id: 'n3', type: 'destination', label: 'Redshift Cluster', icon: 'Warehouse' }
    ]
  },
  {
    id: 'tmpl_org_002',
    title: 'Legacy FTP Order Synchronization',
    category: 'Data Synchronization',
    description: 'Daily batch process picking up flat files from vendor FTP, converting to JSON, and syncing to the modern order management API.',
    nodesCount: 7,
    complexity: 'Intermediate',
    estimatedSetupTime: '8 mins',
    author: 'Integration Wizards (Org)',
    ownership: 'organization',
    status: 'archived',
    version: '0.9.1',
    usageCount: 4,
    lastUpdated: '2025-11-12T16:45:00Z',
    featured: false,
    tags: ['FTP', 'Batch', 'Legacy'],
    sourceTypes: ['File'],
    destinationTypes: ['API'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'Vendor FTP Server', icon: 'FileText' },
      { id: 'n2', type: 'transformation', label: 'CSV to JSON Parser', icon: 'Code' },
      { id: 'n3', type: 'validation', label: 'Order Schema Check', icon: 'CheckSquare' },
      { id: 'n4', type: 'destination', label: 'Order Management API', icon: 'Globe' }
    ]
  },
  {
    id: 'tmpl_prs_001',
    title: 'My Custom CSV to Hubspot Loader',
    category: 'Data Ingestion',
    description: 'Personal draft template for loading the weekly marketing metrics CSV into Hubspot custom objects.',
    nodesCount: 4,
    complexity: 'Beginner',
    estimatedSetupTime: '2 mins',
    author: 'Alice (You)',
    ownership: 'personal',
    status: 'draft',
    version: '-',
    usageCount: 0,
    lastUpdated: '2026-09-19T10:05:00Z',
    featured: false,
    tags: ['CSV', 'HubSpot'],
    sourceTypes: ['File'],
    destinationTypes: ['API'],
    pipelinePreview: [
      { id: 'n1', type: 'source', label: 'CSV Upload', icon: 'FileText' },
      { id: 'n2', type: 'mapping', label: 'Hubspot Field Map', icon: 'Map' },
      { id: 'n3', type: 'destination', label: 'HubSpot API', icon: 'Globe' }
    ]
  }
];

export async function getPipelineTemplates(filters = {}) {
  try {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.categories?.length) query.append('categories', filters.categories.join(','));
    if (filters.ownership?.length) query.append('ownership', filters.ownership.join(','));
    if (filters.status?.length) query.append('status', filters.status.join(','));

    const res = await apiFetch(`/pipelines/templates?${query.toString()}`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.data) return data.data;
    }
  } catch (e) {
    console.info('[PipelineTemplates] Fallback mock active:', e.message);
  }

  // Frontend filtering applied to mocks
  let filtered = [...MOCK_TEMPLATES];

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(t => filters.categories.includes(t.category));
  }

  if (filters.ownership && filters.ownership.length > 0) {
    filtered = filtered.filter(t => filters.ownership.includes(t.ownership));
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(t => filters.status.includes(t.status));
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.tags.some(tag => tag.toLowerCase().includes(s))
    );
  }

  return filtered;
}

export async function instantiateTemplate(templateId, config) {
  try {
    const res = await apiFetch(`/pipelines/templates/${templateId}/instantiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      return await readJson(res);
    }
  } catch (e) {
    console.info('[PipelineTemplates] Instantiate mock:', e.message);
  }

  return {
    pipelineId: `pip_${Date.now()}`,
    name: config.name || 'New Pipeline from Template',
    status: 'Draft'
  };
}
