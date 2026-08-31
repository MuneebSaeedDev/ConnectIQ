/**
 * Data + submit for the Excel Upload Screen (SCR-051, node 119:37214,
 * Figma page "Page 1", frame "Excel Upload Screen"). This is the
 * per-type file-upload setup screen reached from SCR-047 Source
 * Connection Setup → Excel Upload. The user uploads an .xlsx/.xls/.xlsm
 * workbook, picks worksheets, tunes parsing, reviews the auto-detected
 * schema / preview / quality report, maps a destination, and imports.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — there is no workbook-upload endpoint,
 * worksheet-introspection, schema-detection, quality-validation, or
 * import action yet (see docs/modules/module-plan.md). So the workbook
 * catalogue below is DESIGN-SOURCED static config transcribed from the
 * frame's own populated example (FY2024_Financial_Report.xlsx), exactly
 * as SCR-046/048/049 transcribe their controls. A real MOD-006 backend
 * would parse the uploaded file and serve worksheets/schema/preview/
 * quality from an endpoint. `importWorkbook` follows the sibling
 * real-request-first / `mocked: true` pattern (addDataSource.api.js,
 * databaseConnector.api.js): a real POST is attempted first and only
 * falls back to a simulated result when the endpoint is unreachable or
 * returns non-JSON (defends against the Vite dev-server HTML SPA
 * fallback). The boundary is disclosed on-screen (a "Sample data" badge
 * + a role="alert" notice on the simulated import).
 *
 * FIGMA VERIFICATION: node 119:37214 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata, 5407px-tall frame). The
 * eleven sections (Workbook Upload, Workbook Information, Worksheet
 * Selection, Parsing Configuration, Schema Detection, Workbook Preview,
 * Data Quality Validation, Destination Configuration, Import
 * Configuration, Metadata & Governance) and the right-rail (Workbook
 * Summary, Validation Status 5/6, Worksheet Information, Data Quality
 * Overview, Import Readiness) are transcribed from the frame's text
 * nodes, so layout/content fidelity is `verified`. See
 * docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ExcelUploadError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/** Accepted workbook types + platform limits (Figma limits strip). */
export const WORKBOOK_LIMITS = [
  { key: 'size', label: 'Max Workbook Size', value: '500 MB' },
  { key: 'sheets', label: 'Max Worksheets', value: '50' },
  { key: 'rows', label: 'Max Rows / Sheet', value: '1,048,576' },
  { key: 'cols', label: 'Max Columns', value: '16,384' },
  { key: 'formats', label: 'Formats', value: '.xlsx, .xls, .xlsm' },
];

export const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.xlsm'];

/**
 * The example workbook the Figma frame is populated with. A real
 * MOD-006 upload would replace this with the parsed file's real
 * metadata; here it is the design-sourced sample used before a backend
 * exists (mirrors SCR-046's SCHEMA_TREE / SCR-049's SAMPLE_RESPONSE).
 */
export const SAMPLE_WORKBOOK = {
  name: 'FY2024_Financial_Report.xlsx',
  sizeLabel: '8.7 MB',
  sizeBytes: 9_126_912,
  format: 'XLSX',
  version: 'Excel 2016+ (OOXML)',
  uploadedAt: '2024-01-15 · 15:04 UTC',
  author: 'Finance Team — acme.corp',
  lastModified: '2024-01-14 · 09:22 UTC',
};

/**
 * Auto-detected workbook metadata (Figma "Workbook Information"). Each
 * row carries a status so the panel's check / warn icons are data-driven
 * rather than hardcoded per row.
 */
export const WORKBOOK_INFO = [
  { key: 'name', label: 'Workbook Name', value: 'FY2024_Financial_Report.xlsx', status: 'ok' },
  { key: 'version', label: 'Workbook Version', value: 'Excel 2016+ (OOXML)', status: 'ok' },
  { key: 'size', label: 'File Size', value: '8.7 MB (9,126,912 bytes)', status: 'ok' },
  { key: 'sheets', label: 'Total Worksheets', value: '7 worksheets detected', status: 'ok' },
  { key: 'visible', label: 'Visible Sheets', value: '6', status: 'ok' },
  { key: 'hidden', label: 'Hidden Sheets', value: '1 (Config)', status: 'warn' },
  { key: 'named', label: 'Named Ranges', value: '12 named ranges', status: 'ok' },
  { key: 'external', label: 'External References', value: '0 (None)', status: 'ok' },
  { key: 'formulas', label: 'Formula Cells', value: '3,841', status: 'warn' },
  { key: 'merged', label: 'Merged Cells', value: '128 (Pivot_Analysis sheet)', status: 'warn' },
  { key: 'modified', label: 'Last Modified', value: '2024-01-14 · 09:22 UTC', status: 'ok' },
  { key: 'author', label: 'Author', value: 'Finance Team — acme.corp', status: 'ok' },
];

/**
 * Worksheets detected in the workbook (Figma "Worksheet Selection"
 * table). `selectable` is false for empty/hidden sheets so they cannot
 * be imported; `defaultSelected` seeds the 3-of-7 selection shown in the
 * frame. Row/column/formula counts drive the live selection totals.
 */
export const WORKSHEETS = [
  { id: 'q1', name: 'Q1_Revenue', rows: 12_482, columns: 18, header: 'Row 1', formulas: 0, status: 'ready', selectable: true, defaultSelected: true },
  { id: 'q2', name: 'Q2_Revenue', rows: 11_908, columns: 18, header: 'Row 1', formulas: 0, status: 'ready', selectable: true, defaultSelected: true },
  { id: 'q3', name: 'Q3_Revenue', rows: 13_215, columns: 18, header: 'Row 1', formulas: 142, status: 'warning', selectable: true, defaultSelected: true },
  { id: 'q4', name: 'Q4_Revenue', rows: 0, columns: 18, header: 'None', formulas: 0, status: 'empty', selectable: false, defaultSelected: false },
  { id: 'annual', name: 'Annual_Summary', rows: 284, columns: 24, header: 'Row 1', formulas: 3_699, status: 'warning', selectable: true, defaultSelected: false },
  { id: 'pivot', name: 'Pivot_Analysis', rows: 156, columns: 31, header: 'Row 1', formulas: 0, status: 'warning', selectable: true, defaultSelected: false },
  { id: 'config', name: 'Config', rows: 0, columns: 0, header: 'None', formulas: 0, status: 'hidden', selectable: false, defaultSelected: false },
];

/** Parsing-configuration select option sets (Figma "Parsing Configuration"). */
export const PARSING_OPTIONS = {
  headerRow: ['Row 1', 'Row 2', 'Row 3', 'No header row'],
  startingDataRow: ['Row 2', 'Row 3', 'Row 4'],
  encoding: ['UTF-8', 'UTF-16', 'Windows-1252', 'ISO-8859-1'],
  dateFormat: ['Auto-detect', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'DD-MMM-YYYY'],
  decimalSeparator: ['Period (.)', 'Comma (,)'],
  thousandsSeparator: ['Comma (,)', 'Period (.)', 'Space', 'None'],
};

/** Default parsing form (matches the frame's selected values). */
export const PARSING_DEFAULTS = {
  headerRow: 'Row 1',
  startingDataRow: 'Row 2',
  encoding: 'UTF-8',
  dateFormat: 'Auto-detect',
  decimalSeparator: 'Period (.)',
  thousandsSeparator: 'Comma (,)',
};

/**
 * Formula-handling strategies (Figma radio group). `id` drives the
 * import payload; the frame defaults to importing calculated values.
 */
export const FORMULA_STRATEGIES = [
  { id: 'calculated', name: 'Import Calculated Values', description: 'Use the last calculated cell value. Recommended for most imports.' },
  { id: 'expression', name: 'Import Formula Expressions', description: 'Store the formula expression as a string. Useful for auditing.' },
  { id: 'ignore', name: 'Ignore Formula Cells', description: 'Skip formula cells and treat them as empty.' },
];

/** Boolean parse toggles (Figma "ParseToggle" switches). */
export const PARSE_TOGGLES = [
  { id: 'trimWhitespace', label: 'Trim Whitespace', description: 'Strip leading and trailing whitespace from all cell values.', default: true },
  { id: 'skipEmptyRows', label: 'Skip Empty Rows', description: 'Ignore rows where all cells are empty.', default: true },
  { id: 'importHiddenRows', label: 'Import Hidden Rows', description: 'Include rows hidden by row grouping or row height.', default: false },
  { id: 'importHiddenColumns', label: 'Import Hidden Columns', description: 'Include columns hidden by column grouping or width.', default: false },
  { id: 'treatEmptyAsNull', label: 'Treat Empty Cells as Null', description: 'Convert empty cells to NULL in the target dataset.', default: true },
];

/**
 * Auto-detected schema for the active worksheet (Figma "Schema
 * Detection" table, Q1_Revenue active). A real backend would infer this
 * from the parsed sheet; here it reproduces the frame's 18-column
 * catalogue (12 shown, "Show all 18 columns"). `status` is Detected /
 * Review / Error.
 */
export const DETECTED_SCHEMA = [
  { index: 1, name: 'period_id', type: 'String', confidence: 100, nullable: false, default: '—', status: 'detected' },
  { index: 2, name: 'account_code', type: 'String', confidence: 100, nullable: false, default: '—', status: 'detected' },
  { index: 3, name: 'account_name', type: 'String', confidence: 100, nullable: false, default: '—', status: 'detected' },
  { index: 4, name: 'region', type: 'String', confidence: 100, nullable: false, default: '—', status: 'detected' },
  { index: 5, name: 'country', type: 'String', confidence: 99, nullable: false, default: '—', status: 'detected' },
  { index: 6, name: 'revenue_usd', type: 'Decimal', confidence: 98, nullable: false, default: '0.00', status: 'detected' },
  { index: 7, name: 'cost_usd', type: 'Decimal', confidence: 97, nullable: false, default: '0.00', status: 'detected' },
  { index: 8, name: 'gross_margin', type: 'Decimal', confidence: 94, nullable: true, default: '—', status: 'review' },
  { index: 9, name: 'transaction_date', type: 'Date', confidence: 96, nullable: false, default: '—', status: 'detected' },
  { index: 10, name: 'currency', type: 'String', confidence: 100, nullable: false, default: 'USD', status: 'detected' },
  { index: 11, name: 'budget_usd', type: 'Decimal', confidence: 95, nullable: true, default: '—', status: 'detected' },
  { index: 12, name: 'forecast_usd', type: 'Decimal', confidence: 93, nullable: true, default: '—', status: 'review' },
];

export const SCHEMA_TOTAL_COLUMNS = 18;

/** Worksheet tabs offered by the Schema Detection + Preview panels. */
export const PREVIEW_SHEET_TABS = ['Q1_Revenue', 'Q2_Revenue', 'Q3_Revenue'];

/**
 * First preview rows for the active worksheet (Figma "Workbook Preview",
 * 100 / 12,482 rows · Q1_Revenue). Design-sourced sample; a real backend
 * would stream the parsed rows.
 */
export const PREVIEW_COLUMNS = [
  { key: 'period_id', label: 'period_id', type: 'String' },
  { key: 'account_code', label: 'account_code', type: 'String' },
  { key: 'account_name', label: 'account_name', type: 'String' },
  { key: 'region', label: 'region', type: 'String' },
  { key: 'revenue_usd', label: 'revenue_usd', type: 'Decimal' },
  { key: 'cost_usd', label: 'cost_usd', type: 'Decimal' },
  { key: 'gross_margin', label: 'gross_margin', type: 'Decimal' },
  { key: 'transaction_date', label: 'transaction_date', type: 'Date' },
  { key: 'currency', label: 'currency', type: 'String' },
];

export const PREVIEW_ROWS = [
  { period_id: 'Q1-2024', account_code: '4100', account_name: 'Revenue — Software', region: 'North America', revenue_usd: '$2,841,200', cost_usd: '$987,440', gross_margin: '34.76%', transaction_date: '2024-01-31', currency: 'USD' },
  { period_id: 'Q1-2024', account_code: '4110', account_name: 'Revenue — Professional Services', region: 'North America', revenue_usd: '$1,204,800', cost_usd: '$601,200', gross_margin: '50.10%', transaction_date: '2024-01-31', currency: 'USD' },
  { period_id: 'Q1-2024', account_code: '4100', account_name: 'Revenue — Software', region: 'Europe', revenue_usd: '$1,892,600', cost_usd: '$740,320', gross_margin: '60.90%', transaction_date: '2024-01-31', currency: 'EUR' },
  { period_id: 'Q1-2024', account_code: '4120', account_name: 'Revenue — Maintenance', region: 'APAC', revenue_usd: '$418,900', cost_usd: '$125,670', gross_margin: '70.00%', transaction_date: '2024-01-31', currency: 'USD' },
  { period_id: 'Q1-2024', account_code: '4200', account_name: 'Other Revenue', region: 'North America', revenue_usd: '$89,400', cost_usd: '$31,290', gross_margin: '65.00%', transaction_date: '2024-01-31', currency: 'USD' },
];

export const PREVIEW_TOTAL_ROWS = 12_482;

/** Per-worksheet quality rollup (Figma "Quality by Worksheet"). */
export const QUALITY_BY_WORKSHEET = [
  { sheet: 'Q1_Revenue', rows: 12_482, valid: 12_482, formulaCells: 0, missing: 284, status: 'passed' },
  { sheet: 'Q2_Revenue', rows: 11_908, valid: 11_908, formulaCells: 0, missing: 312, status: 'passed' },
  { sheet: 'Q3_Revenue', rows: 13_215, valid: 13_215, formulaCells: 142, missing: 245, status: 'warning' },
];

/** Quality checks (Figma "Quality Check" table). status: passed / warning. */
export const QUALITY_CHECKS = [
  { key: 'integrity', label: 'Workbook Integrity', status: 'passed', count: '—', impact: 'None' },
  { key: 'structure', label: 'Worksheet Structure', status: 'passed', count: '3', impact: 'None' },
  { key: 'dupHeaders', label: 'Duplicate Headers', status: 'passed', count: '0', impact: 'None' },
  { key: 'formulaCells', label: 'Formula Cells', status: 'warning', count: '142', impact: 'Low' },
  { key: 'missing', label: 'Missing Values', status: 'warning', count: '841', impact: 'Low' },
  { key: 'typeErrors', label: 'Type Errors', status: 'passed', count: '0', impact: 'None' },
  { key: 'invalidDates', label: 'Invalid Dates', status: 'passed', count: '0', impact: 'None' },
  { key: 'emptySheets', label: 'Empty Worksheets', status: 'passed', count: '0', impact: 'None' },
  { key: 'dupRows', label: 'Duplicate Rows', status: 'passed', count: '0', impact: 'None' },
  { key: 'hiddenData', label: 'Hidden Data Detected', status: 'passed', count: '—', impact: 'None' },
];

/** Import strategies (Figma "Import Strategy" radio group). */
export const IMPORT_STRATEGIES = [
  { id: 'per-worksheet', name: 'One Table per Worksheet', description: 'Each worksheet is imported into a separate destination table.' },
  { id: 'merge', name: 'Merge All Worksheets', description: 'Combine all selected worksheets into a single destination table.' },
  { id: 'append', name: 'Append to Existing Tables', description: 'Append worksheet data to existing tables with matching schemas.' },
];

/** Destination select option sets (Figma "Destination Configuration"). */
export const DESTINATION_OPTIONS = {
  targetDataSource: ['Analytics Warehouse (PostgreSQL)', 'Reporting DB (Snowflake)', 'Data Lake (S3)'],
  targetSchema: ['staging', 'raw', 'analytics', 'reporting'],
};

/** Duplicate-handling strategies (Figma "Duplicate Handling Strategy"). */
export const DUPLICATE_STRATEGIES = ['Skip (Recommended)', 'Replace', 'Update', 'Stop Import'];

export const IMPORT_PRIORITY_OPTIONS = ['Normal', 'High', 'Low'];
export const SCHEDULING_OPTIONS = ['Immediate (on Import)', 'Scheduled', 'Manual trigger'];

/** Metadata & Governance select option sets (shared vocabulary w/ SCR-046). */
export const GOVERNANCE_OPTIONS = {
  owner: [
    'Michael Torres — Finance',
    'alice.chen@company.com',
    'james.park@company.com',
    'maria.rodriguez@company.com',
  ],
  businessDomain: ['Finance', 'Data Analytics', 'Sales & Revenue', 'Operations', 'Marketing'],
  department: ['Finance & Accounting', 'Data Engineering', 'Analytics Platform', 'BI & Reporting'],
  dataClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  sensitivityLevel: ['Low', 'Medium', 'High', 'Critical'],
  retentionPolicy: ['7 years (Financial Standard)', '3 years', '1 year', 'Indefinite'],
};

export const DEFAULT_TAGS = ['fy2024', 'finance', 'revenue', 'quarterly', 'excel-import', 'confidential', 'sox'];
export const COMPLIANCE_FRAMEWORKS = ['SOX', 'GAAP', 'IFRS', 'SOC 2'];

/**
 * Derive the destination table mapping for the selected worksheets.
 * Reproduces the frame's `staging.<sheet>_fy2024` naming so the mapping
 * table is computed from the live selection, not hardcoded.
 */
export function buildWorksheetMapping(selectedWorksheets, targetSchema) {
  const schema = (targetSchema || 'staging').trim() || 'staging';
  return selectedWorksheets.map((ws) => ({
    id: ws.id,
    worksheet: ws.name,
    table: `${schema}.${ws.name.toLowerCase()}_fy2024`,
    rows: ws.rows,
    mode: 'Create New',
  }));
}

/**
 * Compute the import estimate from the current selection (Figma "Import
 * Estimate — N Worksheets"). Batches / duration / storage scale with the
 * selected row count rather than being fixed.
 */
export function computeImportEstimate(selectedWorksheets, batchSize) {
  const totalRecords = selectedWorksheets.reduce((sum, ws) => sum + ws.rows, 0);
  const size = Number(batchSize) > 0 ? Number(batchSize) : 5000;
  const batches = totalRecords > 0 ? Math.max(1, Math.ceil(totalRecords / size)) : 0;
  const avgRows = batches > 0 ? Math.round(totalRecords / batches) : 0;
  const storageMb = Math.max(1, Math.round((totalRecords * 1600) / (1024 * 1024)));
  return {
    totalRecords,
    tablesCreated: selectedWorksheets.length,
    batches,
    avgRows,
    storageMb,
  };
}

/**
 * Attempt to import the workbook. Real POST first; on any failure
 * (including the Vite dev-server HTML SPA fallback) return a simulated
 * success flagged `mocked: true`, mirroring createDatabaseSource.
 */
export async function importWorkbook(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/excel/import`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ExcelUploadError('Unable to import the workbook right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new ExcelUploadError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return {
      id,
      status: 'importing',
      name: payload?.workbook?.name ?? null,
      tablesCreated: payload?.mapping?.length ?? 0,
      totalRecords: payload?.estimate?.totalRecords ?? 0,
      mocked: true,
    };
  }
}
