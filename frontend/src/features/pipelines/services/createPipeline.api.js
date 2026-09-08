import { apiFetch } from '../../../services/api/client';

export const ENVIRONMENTS = [
  { id: 'Development', label: 'Development' },
  { id: 'Staging', label: 'Staging' },
  { id: 'Production', label: 'Production' },
];

export const CATEGORIES = [
  'eCommerce & Retail',
  'Customer Analytics',
  'Financial Data',
  'Marketing & Attribution',
  'Supply Chain & Operations',
  'Logistics & Fulfillment',
  'Core Infrastructure',
  'Security & Compliance',
];

export const BUSINESS_DOMAINS = [
  'Orders & Transactions',
  'Customer 360',
  'Inventory & Stock',
  'Billing & Invoicing',
  'User Tracking & Telemetry',
  'Product Catalog & Pricing',
];

export const TEAMS = [
  'Data Engineering',
  'Core Platform',
  'Analytics & BI',
  'Infrastructure',
  'Operations',
];

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Pipeline',
    subtitle: 'Start from scratch',
    icon: '◻',
    description: 'Empty canvas with no pre-configured source, destination, or transform nodes.',
    defaultCategory: '',
    defaultDomain: '',
    defaultTags: ['etl', 'custom'],
  },
  {
    id: 'db_sync',
    name: 'Database Sync',
    subtitle: 'DB → DB replication',
    icon: '⇄',
    description: 'High-throughput relational or NoSQL database sync with CDC and table mapping.',
    defaultCategory: 'Core Infrastructure',
    defaultDomain: 'Orders & Transactions',
    defaultTags: ['database', 'replication', 'cdc'],
  },
  {
    id: 'api_ingestion',
    name: 'API Ingestion',
    subtitle: 'REST/GraphQL source',
    icon: '⬇',
    description: 'Scheduled batch or paginated ingestion from third-party REST and GraphQL APIs.',
    defaultCategory: 'Marketing & Attribution',
    defaultDomain: 'Customer 360',
    defaultTags: ['api', 'rest', 'ingestion'],
  },
  {
    id: 'file_import',
    name: 'File Import',
    subtitle: 'CSV/JSON/Parquet',
    icon: '📄',
    description: 'Automated ingestion pipeline from S3, GCS, SFTP, or FTP object stores.',
    defaultCategory: 'eCommerce & Retail',
    defaultDomain: 'Inventory & Stock',
    defaultTags: ['file', 'csv', 'parquet'],
  },
  {
    id: 'cdc',
    name: 'CDC Pipeline',
    subtitle: 'Change data capture',
    icon: '△',
    description: 'Real-time database log tailing via Debezium connectors with low latency.',
    defaultCategory: 'Core Infrastructure',
    defaultDomain: 'Orders & Transactions',
    defaultTags: ['cdc', 'debezium', 'realtime'],
  },
  {
    id: 'stream',
    name: 'Stream Processor',
    subtitle: 'Kafka/Kinesis',
    icon: '⟳',
    description: 'Continuous event stream processing with windowing and schema validation.',
    defaultCategory: 'Core Infrastructure',
    defaultDomain: 'User Tracking & Telemetry',
    defaultTags: ['streaming', 'kafka', 'kinesis'],
  },
];

export const WIZARD_STEPS = [
  {
    id: 1,
    name: 'General Information',
    route: '/pipelines/new',
    description: 'Configure pipeline identity, environment, tags, ownership, and template.',
  },
  {
    id: 2,
    name: 'Source Configuration',
    route: '/pipelines/new/source',
    description: 'Select connector, dataset, authentication, and query settings.',
  },
  {
    id: 3,
    name: 'Destination Configuration',
    route: '/pipelines/new/destination',
    description: 'Configure target system, write mode, and output settings.',
  },
  {
    id: 4,
    name: 'Scheduling',
    route: '/pipelines/new/schedule',
    description: 'Set trigger type, cron expression, timezone, and retry policy.',
  },
  {
    id: 5,
    name: 'Execution Settings',
    route: '/pipelines/new/parameters',
    description: 'Parallelism, worker pool, failure handling, monitoring, and validation rules.',
  },
  {
    id: 6,
    name: 'Validation',
    route: '/pipelines/new/review',
    description: 'Run pre-publish checks across configuration, connectivity, and data flow.',
  },
  {
    id: 7,
    name: 'Review & Publish',
    route: '/pipelines/new/run',
    description: 'Final review of all settings before publishing the pipeline.',
  },
];

export const INITIAL_PIPELINE_FORM = {
  name: '',
  description: '',
  category: '',
  businessDomain: '',
  environment: 'Development',
  version: '1.0.0',
  tags: ['etl', 'orders', 'warehouse'],
  owner: 'Maya Chen',
  team: 'Data Engineering',
  template: 'blank',
};

const NAME_PATTERN = /^[a-z0-9-]+$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;

export function validatePipelineForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = 'Pipeline name is required.';
  } else if (!NAME_PATTERN.test(form.name.trim())) {
    errors.name = 'Pipeline name must use only lowercase letters, numbers, and hyphens (no spaces or underscores).';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Pipeline name must be at least 3 characters long.';
  } else if (form.name.trim().length > 64) {
    errors.name = 'Pipeline name must be at most 64 characters long.';
  }

  if (form.version && !VERSION_PATTERN.test(form.version.trim())) {
    errors.version = 'Version must follow semantic versioning (e.g. 1.0.0).';
  }

  if (!form.owner || !form.owner.trim()) {
    errors.owner = 'Pipeline owner is required.';
  }

  if (!form.environment) {
    errors.environment = 'Environment selection is required.';
  }

  return errors;
}

/**
 * Creates or initiates a pipeline against MOD-008's backend.
 * Falls back to a mock response with `mocked: true` when backend is not deployed.
 */
export async function createPipeline(payload) {
  try {
    const response = await apiFetch('/api/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response && typeof response === 'object' && response.id) {
      return { ...response, mocked: false };
    }
  } catch {
    // Backend endpoint still PLANNED in MOD-008
  }

  // Realistic mock response
  const id = `pipe_${Math.random().toString(36).substring(2, 10)}`;
  return {
    id,
    ...payload,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mocked: true,
  };
}

/**
 * Saves a pipeline draft to session/storage or server.
 */
export async function savePipelineDraft(payload) {
  try {
    const response = await apiFetch('/api/pipelines/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response && typeof response === 'object') {
      return { ...response, mocked: false };
    }
  } catch {
    // Backend endpoint still PLANNED in MOD-008
  }

  return {
    success: true,
    savedAt: new Date().toISOString(),
    mocked: true,
  };
}
