/**
 * Data + submit for the CSV Upload Screen (SCR-050, node 117:35049,
 * Figma page "Page 1", frame "CSV Upload Screen"). This is the CSV
 * file-upload branch of the "add source" wizard: SCR-047 Source
 * Connection Setup → (SCR-048 Database / SCR-049 API / SCR-050 CSV /
 * SCR-051 Excel / …) → SCR-055 Connection Test Result. Unlike the
 * database/API connector screens it uploads a delimited file, auto-
 * detects its parsing profile + column schema, previews parsed rows,
 * runs data-quality validation, and configures a destination import.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — there is no file-upload, CSV-parse,
 * schema-detection, data-quality, or import endpoint yet (see
 * docs/modules/module-plan.md). `uploadCsvFile` and `startCsvImport`
 * attempt a real request first and only fall back to a simulated result
 * when the endpoint is unreachable / returns non-JSON (defends against
 * the Vite dev server's own 200-OK HTML SPA fallback), mirroring the
 * sibling databaseConnector.api.js / apiConnectorSetup.api.js
 * real-request-first / `mocked: true` patterns. The auto-detected file
 * profile, column schema, preview rows, and data-quality figures below
 * are DESIGN-SOURCED sample data (transcribed from the frame's text
 * nodes) so the screen renders real, computed values instead of a static
 * mock — disclosed on-screen via "Sample data" badges + a mock note.
 *
 * FIGMA VERIFICATION: node 117:35049 was inspected this session via
 * get_screenshot (rendered PNG) + get_metadata (full frame tree, ~470
 * text nodes read in order). Layout/content is transcribed from those
 * text nodes; pixel fidelity is `verified` against the screenshot for
 * structure/section-order/content, not re-pulled per-node for exact
 * spacing. See docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class CsvUploadError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/* ---- Upload constraints (Figma "File Upload" card) ------------------ */
export const UPLOAD_LIMITS = {
  maxSizeLabel: '1 GB',
  maxSizeBytes: 1_073_741_824,
  maxRows: 10_000_000,
  maxRowsLabel: '10,000,000',
  maxColumns: 500,
  encodings: ['UTF-8', 'UTF-16', 'Latin-1'],
  compression: ['None', 'GZIP'],
  accept: '.csv,.csv.gz,text/csv,application/gzip',
  acceptLabel: '.csv, .csv.gz',
};

/**
 * Design-sourced "already uploaded" file the frame shows. In mock mode
 * the screen boots pre-populated with this file (matching the Figma
 * default state); a real upload would replace it with the parsed
 * response. Kept in one place so the file card, File Information card,
 * schema, preview, quality, and summary all read a single source.
 */
export const SAMPLE_FILE = {
  name: 'q4_sales_report_2024.csv',
  sizeLabel: '12.4 MB',
  sizeBytes: 13_003_918,
  format: 'CSV',
  totalRows: 284_192,
  totalColumns: 22,
  uploadedAt: '2024-01-15 · 14:32 UTC',
  throughput: '4.1 MB/s',
  mocked: true,
};

/* ---- Auto-detected file information (Figma "File Information") ------- */
export const DETECTED_FILE_INFO = [
  { key: 'fileName', label: 'File Name', value: 'q4_sales_report_2024.csv' },
  { key: 'fileSize', label: 'File Size', value: '12.4 MB (13,003,918 bytes)' },
  { key: 'encoding', label: 'Encoding', value: 'UTF-8', ok: true },
  { key: 'delimiter', label: 'Delimiter', value: 'Comma ( , )', ok: true },
  { key: 'quote', label: 'Quote Character', value: 'Double Quote ( " )', ok: true },
  { key: 'escape', label: 'Escape Character', value: 'Backslash ( \\ )', ok: true },
  { key: 'lineEnding', label: 'Line Ending', value: 'LF (\\n) Unix' },
  { key: 'headerRow', label: 'Header Row', value: 'Row 1 — Detected', ok: true },
  { key: 'totalRows', label: 'Total Rows', value: '284,192 (excl. header)' },
  { key: 'totalColumns', label: 'Total Columns', value: '22' },
  { key: 'nullRep', label: 'Null Representation', value: 'empty, "NULL", "N/A"' },
  { key: 'compression', label: 'Compression', value: 'None' },
];

/* ---- Parsing configuration select option sets ----------------------- */
export const PARSE_OPTIONS = {
  delimiter: ['Comma ( , )', 'Semicolon ( ; )', 'Tab ( \\t )', 'Pipe ( | )', 'Space (   )'],
  encoding: ['UTF-8', 'UTF-16', 'Latin-1 (ISO-8859-1)', 'Windows-1252'],
  headerRow: ['Row 1 (first row)', 'No header row', 'Row 2', 'Custom row…'],
  quoteChar: ['Double Quote ( " )', "Single Quote ( ' )", 'None'],
  escapeChar: ['Backslash ( \\ )', 'Double Quote ( "" )', 'None'],
  dateFormat: ['Auto-detect', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DDTHH:mm:ssZ'],
  decimalSeparator: ['Period ( . )', 'Comma ( , )'],
  thousandsSeparator: ['None', 'Comma ( , )', 'Period ( . )', 'Space (   )'],
};

/** The default parsing configuration the frame shows selected. */
export const DEFAULT_PARSE_CONFIG = {
  delimiter: 'Comma ( , )',
  encoding: 'UTF-8',
  headerRow: 'Row 1 (first row)',
  quoteChar: 'Double Quote ( " )',
  escapeChar: 'Backslash ( \\ )',
  nullRepresentation: 'empty, "NULL", "N/A"',
  dateFormat: 'Auto-detect',
  decimalSeparator: 'Period ( . )',
  thousandsSeparator: 'None',
  // Boolean parsing options (Figma toggles)
  skipEmptyRows: true,
  trimWhitespace: true,
  skipInvalidRows: false,
  treatEmptyAsNull: true,
};

/* ---- Auto-detected column schema (Figma "Schema Detection") --------- */
export const DETECTED_SCHEMA = [
  { idx: 1, name: 'order_id', type: 'UUID', confidence: 100, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 2, name: 'customer_id', type: 'String', confidence: 99, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 3, name: 'customer_name', type: 'String', confidence: 100, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 4, name: 'email', type: 'String', confidence: 98, nullable: true, defaultValue: '—', status: 'Detected' },
  { idx: 5, name: 'order_date', type: 'Date', confidence: 95, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 6, name: 'product_sku', type: 'String', confidence: 100, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 7, name: 'quantity', type: 'Integer', confidence: 99, nullable: false, defaultValue: '0', status: 'Detected' },
  { idx: 8, name: 'unit_price', type: 'Decimal', confidence: 97, nullable: false, defaultValue: '0.00', status: 'Detected' },
  { idx: 9, name: 'total_amount', type: 'Decimal', confidence: 97, nullable: false, defaultValue: '0.00', status: 'Detected' },
  { idx: 10, name: 'discount_pct', type: 'Decimal', confidence: 92, nullable: true, defaultValue: '0.00', status: 'Review' },
  { idx: 11, name: 'status', type: 'String', confidence: 100, nullable: false, defaultValue: '—', status: 'Detected' },
  { idx: 12, name: 'is_deleted', type: 'Boolean', confidence: 88, nullable: false, defaultValue: 'false', status: 'Review' },
];

/** Total detected columns (only the first 12 are enumerated in the frame). */
export const TOTAL_DETECTED_COLUMNS = 22;

/** Column data-type choices for the (client-side) schema override select. */
export const COLUMN_TYPE_OPTIONS = ['String', 'Integer', 'Decimal', 'Boolean', 'Date', 'Timestamp', 'UUID', 'JSON'];

/* ---- Data preview (Figma "Data Preview") ---------------------------- */
export const PREVIEW_COLUMNS = [
  { key: 'order_id', label: 'order_id', type: 'UUID' },
  { key: 'customer_name', label: 'customer_name', type: 'String' },
  { key: 'order_date', label: 'order_date', type: 'Date' },
  { key: 'product_sku', label: 'product_sku', type: 'String' },
  { key: 'quantity', label: 'quantity', type: 'Integer' },
  { key: 'unit_price', label: 'unit_price', type: 'Decimal' },
  { key: 'total_amount', label: 'total_amount', type: 'Decimal' },
  { key: 'discount_pct', label: 'discount_pct', type: 'Decimal' },
  { key: 'status', label: 'status', type: 'String' },
  { key: 'is_deleted', label: 'is_deleted', type: 'Boolean' },
  { key: 'region', label: 'region', type: 'String' },
];

export const PREVIEW_ROWS = [
  { _n: 1, order_id: '9f3a-8b2c', customer_name: 'Meridian Corp', order_date: '2024-01-02', product_sku: 'SKU-4421', quantity: '12', unit_price: '$249.99', total_amount: '$2,999.88', discount_pct: '5%', status: 'Completed', is_deleted: 'false', region: 'North America' },
  { _n: 2, order_id: '1d7e-3f9a', customer_name: 'Vantage Inc', order_date: '2024-01-03', product_sku: 'SKU-0891', quantity: '3', unit_price: '$89.50', total_amount: '$268.50', discount_pct: '—', status: 'Pending', is_deleted: 'false', region: 'Europe' },
  { _n: 3, order_id: '2c8b-5e1d', customer_name: 'Apex Systems', order_date: '2024-01-03', product_sku: 'SKU-1124', quantity: '1', unit_price: '$1,299.00', total_amount: '$1,299.00', discount_pct: '10%', status: 'Completed', is_deleted: 'false', region: 'North America' },
  { _n: 4, order_id: '7a2f-9c6e', customer_name: 'Nexus Global', order_date: '2024-01-04', product_sku: 'SKU-3302', quantity: '8', unit_price: '$45.00', total_amount: '$360.00', discount_pct: '—', status: 'Completed', is_deleted: 'false', region: 'APAC' },
  { _n: 5, order_id: '3e9d-1b7c', customer_name: 'Stratford LLC', order_date: '2024-01-04', product_sku: 'SKU-2210', quantity: '2', unit_price: '$599.00', total_amount: '$1,198.00', discount_pct: '15%', status: 'Cancelled', is_deleted: 'false', region: 'Europe' },
];

export const PREVIEW_TOTAL_ROWS = 284_192;
export const PREVIEW_SHOWN_ROWS = 100;

/* ---- Data quality validation (Figma "Data Quality Validation") ------ */
export const QUALITY_METRICS = [
  { key: 'valid', label: 'Valid Records', count: 277_651, pct: '97.7%', tone: 'success' },
  { key: 'duplicate', label: 'Duplicate Rows', count: 6_541, pct: '2.3%', tone: 'warning' },
  { key: 'missing', label: 'Missing Values', count: 1_204, pct: '0.4%', tone: 'warning' },
  { key: 'typeErrors', label: 'Type Errors', count: 0, pct: '0.0%', tone: 'neutral' },
  { key: 'encoding', label: 'Encoding Issues', count: 3, pct: '<0.1%', tone: 'warning' },
  { key: 'invalidDates', label: 'Invalid Dates', count: 0, pct: '0.0%', tone: 'neutral' },
];

export const QUALITY_CHECKS = [
  { key: 'fileIntegrity', label: 'File Integrity', status: 'Passed', count: '—', impact: 'None', action: null },
  { key: 'csvStructure', label: 'CSV Structure', status: 'Passed', count: '—', impact: 'None', action: null },
  { key: 'headerValidation', label: 'Header Validation', status: 'Passed', count: '22', impact: 'None', action: null },
  { key: 'duplicateRows', label: 'Duplicate Rows', status: 'Warning', count: '6,541', impact: 'Medium', action: 'Configure' },
  { key: 'missingValues', label: 'Missing Values', status: 'Warning', count: '1,204', impact: 'Low', action: 'Review' },
  { key: 'dataTypeErrors', label: 'Data Type Errors', status: 'Passed', count: '0', impact: 'None', action: null },
  { key: 'invalidDates', label: 'Invalid Dates', status: 'Passed', count: '0', impact: 'None', action: null },
  { key: 'encodingIssues', label: 'Encoding Issues', status: 'Warning', count: '3', impact: 'Low', action: 'Review' },
  { key: 'specialChars', label: 'Special Characters', status: 'Passed', count: '—', impact: 'None', action: null },
];

/** The dedupe key the "duplicate rows detected" callout references. */
export const DUPLICATE_KEY_COLUMN = 'order_id';

/* ---- Destination configuration select option sets ------------------- */
export const DESTINATION_OPTIONS = {
  // Target data sources the import can write into. In a live MOD-006/007
  // environment these would come from the destination catalogue.
  targetDataSource: [
    'Snowflake — Analytics Warehouse',
    'PostgreSQL — Reporting DB',
    'BigQuery — Data Lake',
    'Amazon Redshift — Prod',
  ],
  targetSchema: ['staging', 'public', 'analytics', 'reporting', 'raw'],
  writeMode: ['create', 'append', 'replace'],
  duplicateStrategy: ['skip', 'replace', 'update', 'stop'],
  importPriority: ['Low', 'Normal', 'High', 'Critical'],
  scheduling: ['Import immediately', 'Schedule for later', 'Add to import queue'],
};

/** Write-mode radio metadata (Figma "Write Mode"). */
export const WRITE_MODES = [
  { id: 'create', title: 'Create New Table', description: 'Create a new table and import all records.' },
  { id: 'append', title: 'Append to Existing', description: 'Append records to an existing table.' },
  { id: 'replace', title: 'Replace Existing Table', description: 'Drop and recreate the table with imported data.' },
];

/** Duplicate-handling strategy radio metadata (Figma "Duplicate Handling"). */
export const DUPLICATE_STRATEGIES = [
  { id: 'skip', title: 'Skip (Recommended)', description: 'Duplicate rows are silently skipped. Import continues.' },
  { id: 'replace', title: 'Replace', description: 'Replace existing rows that match the duplicate key.' },
  { id: 'update', title: 'Update', description: 'Merge non-key columns into existing rows.' },
  { id: 'stop', title: 'Stop Import', description: 'Abort the import when a duplicate is found.' },
];

/** Default destination + import configuration (Figma selected state). */
export const DEFAULT_DESTINATION = {
  targetDataSource: 'Snowflake — Analytics Warehouse',
  targetSchema: 'staging',
  tableName: 'q4_sales_report_2024',
  dataset: 'sales_data_imports',
  writeMode: 'create',
  batchSize: '10000',
  commitInterval: '5000',
  errorThreshold: '100',
  duplicateStrategy: 'skip',
  importPriority: 'Normal',
  scheduling: 'Import immediately',
};

/* ---- Metadata & governance select option sets ----------------------- */
export const GOVERNANCE_OPTIONS = {
  owner: [
    'Sarah Chen — Data Engineering',
    'James Park — Analytics Platform',
    'Maria Rodriguez — BI & Reporting',
    'David Lee — Customer Data',
  ],
  businessDomain: ['Sales & Revenue', 'Data Analytics', 'Customer Experience', 'Finance', 'Marketing', 'Operations'],
  department: ['Data Engineering', 'Analytics Platform', 'BI & Reporting', 'Customer Data', 'ML Infrastructure'],
  dataClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  sensitivityLevel: ['Low', 'Medium', 'High', 'Critical'],
  retentionPolicy: ['7 years (Financial records)', '3 years (Operational)', '1 year (Transient)', 'Indefinite'],
};

export const COMPLIANCE_FRAMEWORKS = ['GDPR', 'SOX', 'CCPA', 'HIPAA', 'PCI-DSS', 'ISO 27001'];

export const DEFAULT_GOVERNANCE = {
  owner: 'Sarah Chen — Data Engineering',
  businessDomain: 'Sales & Revenue',
  department: 'Data Engineering',
  dataClassification: 'Confidential',
  sensitivityLevel: 'Medium',
  retentionPolicy: '7 years (Financial records)',
  tags: ['sales', 'q4-2024', 'revenue', 'orders', 'crm', 'production'],
  compliance: ['GDPR', 'SOX', 'CCPA'],
  notes: '',
};

/**
 * Attempt to upload + parse a CSV file. Real POST first; on any failure
 * (including the Vite dev-server HTML SPA fallback) return a simulated
 * parse result flagged `mocked: true`. In a live MOD-006 environment
 * this would stream the file to the server, which would parse it and
 * return the detected profile + schema + preview + quality report.
 */
export async function uploadCsvFile(orgId, file) {
  try {
    const form = new FormData();
    form.append('file', file);
    // NOTE: apiFetch JSON-encodes bodies; a real upload endpoint needs a
    // multipart request. Until MOD-006 ships we do not have that path, so
    // we deliberately hit the (absent) endpoint and let it fall through to
    // the simulated result below.
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/csv/upload`,
      { method: 'POST', headers: { 'X-Upload-Name': file?.name ?? '' } },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new CsvUploadError('Unable to upload the file right now.');
    }
    const data = await readJson(res);
    if (!data || !data.fileName) {
      throw new CsvUploadError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      ...SAMPLE_FILE,
      name: file?.name || SAMPLE_FILE.name,
      sizeBytes: file?.size ?? SAMPLE_FILE.sizeBytes,
      mocked: true,
    };
  }
}

/**
 * Attempt to start the import job. Real POST first; on any failure return
 * a simulated success flagged `mocked: true`.
 */
export async function startCsvImport(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/csv/import`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new CsvUploadError('Unable to start the import right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new CsvUploadError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `imp_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'queued', mocked: true };
  }
}
