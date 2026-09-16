/**
 * pipelineTemplates.api.js
 * API client and Figma-verified mock baseline for SCR-076: Pipeline Template Library
 */

import { apiFetch, readJson } from '../../../services/api/client';

export const TEMPLATE_CATEGORIES = [
  'All Templates',
  'Customer 360',
  'Financial Analytics',
  'Marketing & CRM',
  'E-Commerce & Retail',
  'Compliance & Audit',
  'Cloud Migration'
];

export const MOCK_TEMPLATES = [
  {
    id: 'tmpl_001',
    title: 'PostgreSQL to Snowflake Data Mart',
    category: 'Customer 360',
    description: 'Complete pipeline topology including relational source extraction, active filter stage, column casting, and upsert load to Snowflake marts.',
    nodesCount: 6,
    complexity: 'Intermediate',
    estimatedSetupTime: '5 mins',
    author: 'ConnectIQ Official',
    featured: true,
    tags: ['PostgreSQL', 'Snowflake', 'Upsert', 'ETL']
  },
  {
    id: 'tmpl_002',
    title: 'Stripe Billing & Ledger Reconciliation',
    category: 'Financial Analytics',
    description: 'Real-time webhook capture pipeline with currency standardizer, fee calculation expression, and BigQuery financial partition store.',
    nodesCount: 8,
    complexity: 'Advanced',
    estimatedSetupTime: '10 mins',
    author: 'ConnectIQ Official',
    featured: true,
    tags: ['Stripe', 'BigQuery', 'Webhooks', 'Real-time']
  },
  {
    id: 'tmpl_003',
    title: 'HubSpot & Salesforce Multi-Stream Merge',
    category: 'Marketing & CRM',
    description: 'Fuses leads and opportunity pipelines using in-memory left outer hash join and automated email deduplication rules.',
    nodesCount: 7,
    complexity: 'Advanced',
    estimatedSetupTime: '8 mins',
    author: 'DataOps Guild',
    featured: false,
    tags: ['HubSpot', 'Salesforce', 'Merge Node', 'Dedup']
  },
  {
    id: 'tmpl_004',
    title: 'S3 Parquet Lake to Redshift Cluster',
    category: 'Cloud Migration',
    description: 'High-throughput bulk ingestion using manifest-based S3 scanning and concurrent Redshift COPY command execution.',
    nodesCount: 4,
    complexity: 'Beginner',
    estimatedSetupTime: '3 mins',
    author: 'AWS Solutions',
    featured: false,
    tags: ['S3', 'Redshift', 'Bulk Copy', 'Parquet']
  },
  {
    id: 'tmpl_005',
    title: 'Shopify Orders with Address Quality Cleansing',
    category: 'E-Commerce & Retail',
    description: 'Pulls retail transactions, standardizes postal codes, parses datetime stamps, and validates tax ID referential constraints.',
    nodesCount: 9,
    complexity: 'Intermediate',
    estimatedSetupTime: '6 mins',
    author: 'ConnectIQ Official',
    featured: false,
    tags: ['Shopify', 'Data Quality', 'Validation', 'Cleanse']
  }
];

export async function getPipelineTemplates(category = 'All Templates', search = '') {
  try {
    const res = await apiFetch(`/pipelines/templates?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.data) return data.data;
    }
  } catch (e) {
    console.info('[PipelineTemplates] Fallback mock active:', e.message);
  }

  let filtered = MOCK_TEMPLATES;
  if (category && category !== 'All Templates') {
    filtered = filtered.filter(t => t.category === category);
  }
  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  return filtered;
}

export async function instantiateTemplate(templateId, pipelineName) {
  try {
    const res = await apiFetch(`/pipelines/templates/${templateId}/instantiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pipelineName })
    });
    if (res.ok) {
      return await readJson(res);
    }
  } catch (e) {
    console.info('[PipelineTemplates] Instantiate mock:', e.message);
  }
  return {
    pipelineId: `pip_${Date.now()}`,
    name: pipelineName || 'New Pipeline from Template',
    status: 'Draft'
  };
}
