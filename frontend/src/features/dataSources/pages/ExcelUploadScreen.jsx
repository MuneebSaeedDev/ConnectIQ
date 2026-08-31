import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  ORG_ID,
  WORKBOOK_LIMITS,
  ACCEPTED_EXTENSIONS,
  SAMPLE_WORKBOOK,
  WORKBOOK_INFO,
  WORKSHEETS,
  PARSING_OPTIONS,
  PARSING_DEFAULTS,
  FORMULA_STRATEGIES,
  PARSE_TOGGLES,
  DETECTED_SCHEMA,
  SCHEMA_TOTAL_COLUMNS,
  PREVIEW_SHEET_TABS,
  PREVIEW_COLUMNS,
  PREVIEW_ROWS,
  PREVIEW_TOTAL_ROWS,
  QUALITY_BY_WORKSHEET,
  QUALITY_CHECKS,
  IMPORT_STRATEGIES,
  DESTINATION_OPTIONS,
  DUPLICATE_STRATEGIES,
  IMPORT_PRIORITY_OPTIONS,
  SCHEDULING_OPTIONS,
  GOVERNANCE_OPTIONS,
  DEFAULT_TAGS,
  COMPLIANCE_FRAMEWORKS,
  buildWorksheetMapping,
  computeImportEstimate,
  importWorkbook,
} from '../services/excelUpload.api';

/* Field styling — mirrors SCR-046/048/049 so the data-source forms read
   identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const nf = new Intl.NumberFormat('en-US');

/** Initial form — seeded with the frame's populated defaults. */
const INITIAL_FORM = {
  selected: Object.fromEntries(WORKSHEETS.map((w) => [w.id, w.defaultSelected])),
  parsing: { ...PARSING_DEFAULTS },
  formulaStrategy: 'calculated',
  toggles: Object.fromEntries(PARSE_TOGGLES.map((t) => [t.id, t.default])),
  targetDataSource: 'Analytics Warehouse (PostgreSQL)',
  targetSchema: 'staging',
  importStrategy: 'per-worksheet',
  batchSize: '5000',
  commitInterval: '1000',
  errorThreshold: '50',
  duplicateStrategy: 'Skip (Recommended)',
  importPriority: 'Normal',
  scheduling: 'Immediate (on Import)',
  owner: 'Michael Torres — Finance',
  businessDomain: 'Finance',
  department: 'Finance & Accounting',
  dataClassification: 'Confidential',
  sensitivityLevel: 'High',
  retentionPolicy: '7 years (Financial Standard)',
  frameworks: ['SOX'],
  notes: '',
  warningsAcknowledged: false,
};

/** SCR-051 — Excel Upload Screen. Node 119:37214. */
export default function ExcelUploadScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [activeSheet, setActiveSheet] = useState(PREVIEW_SHEET_TABS[0]);
  const [worksheetQuery, setWorksheetQuery] = useState('');
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '', result: null });

  const selectedWorksheets = useMemo(
    () => WORKSHEETS.filter((w) => form.selected[w.id]),
    [form.selected],
  );
  const errors = useMemo(() => validate(form, selectedWorksheets), [form, selectedWorksheets]);
  const isValid = Object.keys(errors).length === 0;

  const mapping = useMemo(
    () => buildWorksheetMapping(selectedWorksheets, form.targetSchema),
    [selectedWorksheets, form.targetSchema],
  );
  const estimate = useMemo(
    () => computeImportEstimate(selectedWorksheets, form.batchSize),
    [selectedWorksheets, form.batchSize],
  );
  const checklist = useMemo(
    () => computeChecklist(form, selectedWorksheets),
    [form, selectedWorksheets],
  );
  const completedCount = checklist.filter((c) => c.done).length;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function setParsing(key, value) {
    setForm((prev) => ({ ...prev, parsing: { ...prev.parsing, [key]: value } }));
  }
  function setToggle(key, value) {
    setForm((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: value } }));
  }
  function toggleWorksheet(id) {
    setForm((prev) => ({ ...prev, selected: { ...prev.selected, [id]: !prev.selected[id] } }));
  }
  function setAllWorksheets(value) {
    setForm((prev) => ({
      ...prev,
      selected: Object.fromEntries(WORKSHEETS.map((w) => [w.id, w.selectable ? value : false])),
    }));
  }
  function toggleFramework(fw) {
    setForm((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(fw)
        ? prev.frameworks.filter((f) => f !== fw)
        : [...prev.frameworks, fw],
    }));
  }

  function handleImportSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      // The worksheet requirement has no `field-worksheets` input; its
      // focusable proxy is the Worksheet Selection search box.
      const focusId = firstKey === 'worksheets' ? 'worksheet-search' : `field-${firstKey}`;
      const el = document.getElementById(focusId) ?? document.getElementById(firstKey);
      if (el) el.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmImport() {
    setSubmitState({ status: 'submitting', message: '', result: null });
    const payload = buildPayload(form, selectedWorksheets, mapping, estimate, tags);
    const result = await importWorkbook(ORG_ID, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        result,
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would parse the workbook, create the destination tables, and stream the selected worksheets into them.',
      });
    } else {
      setSubmitState({ status: 'success', result, message: 'Workbook import started.' });
      navigate('/data-sources');
    }
  }

  const submitted = submitState.status === 'mocked';

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'Excel Upload']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleImportSubmit} noValidate>
        <Header onCancel={() => navigate(submitted ? '/data-sources' : '/data-sources/new/connection')} isValid={isValid} submitted={submitted} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Starting workbook import'
            : submitted
              ? 'Workbook import simulated — no backend available'
              : `${selectedWorksheets.length} of ${WORKSHEETS.length} worksheets selected · ${completedCount} of ${checklist.length} steps ready`}
        </span>

        {submitted && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated import (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <WorkbookUpload />
            <WorkbookInformation />
            <WorksheetSelection
              form={form}
              selectedWorksheets={selectedWorksheets}
              query={worksheetQuery}
              onQuery={setWorksheetQuery}
              onToggle={toggleWorksheet}
              onSelectAll={() => setAllWorksheets(true)}
              onClear={() => setAllWorksheets(false)}
              error={submitAttempted ? errors.worksheets : null}
            />
            <ParsingConfiguration form={form} setParsing={setParsing} setField={setField} setToggle={setToggle} />
            <SchemaDetection activeSheet={activeSheet} onSheet={setActiveSheet} showAll={showAllColumns} onShowAll={setShowAllColumns} />
            <WorkbookPreview activeSheet={activeSheet} onSheet={setActiveSheet} />
            <DataQualityValidation form={form} setField={setField} />
            <DestinationConfiguration form={form} setField={setField} mapping={mapping} errors={errors} submitAttempted={submitAttempted} estimate={estimate} />
            <ImportConfiguration form={form} setField={setField} errors={errors} submitAttempted={submitAttempted} />
            <MetadataGovernance form={form} setField={setField} tags={tags} setTags={setTags} toggleFramework={toggleFramework} errors={errors} submitAttempted={submitAttempted} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <WorkbookSummary selectedWorksheets={selectedWorksheets} estimate={estimate} form={form} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <WorksheetInformation selectedWorksheets={selectedWorksheets} />
            <DataQualityOverview />
            <ImportReadiness checklist={checklist} completedCount={completedCount} />
          </aside>
        </div>

        <ActionBar
          isValid={isValid}
          selectedCount={selectedWorksheets.length}
          onCancel={() => navigate(submitted ? '/data-sources' : '/data-sources/new/connection')}
          submitted={submitted}
        />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          selectedWorksheets={selectedWorksheets}
          estimate={estimate}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmImport}
        />
      )}
    </AppShell>
  );
}

/* ---- Validation ----------------------------------------------------- */
function validate(form, selectedWorksheets) {
  const errors = {};
  if (selectedWorksheets.length === 0) errors.worksheets = 'Select at least one worksheet to import.';
  if (!form.targetDataSource) errors.targetDataSource = 'Choose a target data source.';
  if (!form.targetSchema.trim()) errors.targetSchema = 'Choose a target schema.';
  const batch = Number(form.batchSize);
  if (!Number.isInteger(batch) || batch < 1) errors.batchSize = 'Enter a positive batch size.';
  const commit = Number(form.commitInterval);
  if (!Number.isInteger(commit) || commit < 1) errors.commitInterval = 'Enter a positive commit interval.';
  const threshold = Number(form.errorThreshold);
  if (!Number.isInteger(threshold) || threshold < 0) errors.errorThreshold = 'Enter a non-negative error threshold.';
  if (!form.owner) errors.owner = 'A dataset owner is required.';
  return errors;
}

/* Right-rail readiness checklist. "Quality warnings acknowledged" is the
   one item the frame shows pending (5/6). */
function computeChecklist(form, selectedWorksheets) {
  return [
    { key: 'uploaded', label: 'Workbook uploaded', done: true },
    { key: 'selected', label: `${selectedWorksheets.length} worksheet${selectedWorksheets.length === 1 ? '' : 's'} selected`, done: selectedWorksheets.length > 0 },
    { key: 'schema', label: 'Schema detected (18 cols)', done: selectedWorksheets.length > 0 },
    { key: 'destination', label: 'Destination configured', done: !!form.targetDataSource && !!form.targetSchema.trim() },
    { key: 'governance', label: 'Governance metadata set', done: !!form.owner },
    { key: 'warnings', label: 'Quality warnings acknowledged', done: form.warningsAcknowledged },
  ];
}

/* Assemble the import payload from form state. */
function buildPayload(form, selectedWorksheets, mapping, estimate, tags) {
  return {
    connectorId: 'excel',
    workbook: { name: SAMPLE_WORKBOOK.name, sizeBytes: SAMPLE_WORKBOOK.sizeBytes, format: SAMPLE_WORKBOOK.format },
    worksheets: selectedWorksheets.map((w) => ({ id: w.id, name: w.name, rows: w.rows })),
    parsing: { ...form.parsing, formulaStrategy: form.formulaStrategy, ...form.toggles },
    destination: {
      targetDataSource: form.targetDataSource,
      targetSchema: form.targetSchema.trim(),
      importStrategy: form.importStrategy,
    },
    mapping,
    importOptions: {
      batchSize: Number(form.batchSize) || null,
      commitInterval: Number(form.commitInterval) || null,
      errorThreshold: Number(form.errorThreshold) || 0,
      duplicateStrategy: form.duplicateStrategy,
      priority: form.importPriority,
      scheduling: form.scheduling,
    },
    governance: {
      owner: form.owner,
      businessDomain: form.businessDomain,
      department: form.department,
      dataClassification: form.dataClassification,
      sensitivityLevel: form.sensitivityLevel,
      retentionPolicy: form.retentionPolicy,
      frameworks: form.frameworks,
      tags,
      notes: form.notes.trim() || null,
    },
    estimate,
  };
}

/* ---- Shared field primitives (mirrors SCR-048) ---------------------- */
function Section({ index, title, description, children, actions }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="flex items-start gap-token-3">
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-token-meta font-semibold text-primary">
            {index}
          </span>
          <div>
            <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
            {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="mt-token-5">{children}</div>
    </section>
  );
}

function Field({ id, label, required, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {typeof children === 'function' ? children(describedBy) : children}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-token-meta text-text-faint">{hint}</p>}
      {error && <p id={`${id}-error`} className="m-0 text-token-meta text-danger" role="alert">{error}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, invalid, describedBy, required, ...rest }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`${fieldBase} ${invalid ? fieldInvalid : ''}`}
      {...rest}
    />
  );
}

function SelectInput({ id, value, onChange, invalid, describedBy, options, placeholder, required, disabled }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`${fieldBase} ${invalid ? fieldInvalid : ''} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
        {description && <span id={`${id}-desc`} className="mt-0.5 text-token-meta text-text-faint">{description}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-token-2">
        <span aria-hidden="true" className={`w-6 text-right font-mono text-token-meta font-semibold uppercase tracking-[0.04em] ${checked ? 'text-primary' : 'text-text-faint'}`}>
          {checked ? 'On' : 'Off'}
        </span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-describedby={description ? `${id}-desc` : undefined}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${checked ? 'bg-primary' : 'bg-border'}`}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/* Radiogroup with WAI-ARIA roving tabindex (mirrors SCR-047/049). */
function RadioCardGroup({ label, options, value, onChange }) {
  const ref = useRef(null);
  const order = options.map((o) => o.id);
  const select = (id) => {
    onChange(id);
    const el = ref.current?.querySelector(`[data-radio-id="${id}"]`);
    if (el) el.focus();
  };
  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const cur = order.indexOf(value);
    const base = cur === -1 ? 0 : cur;
    select(order[(base + delta + order.length) % order.length]);
  };
  return (
    <div ref={ref} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="flex flex-col gap-token-3">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            data-radio-id={opt.id}
            aria-checked={selected}
            tabIndex={selected || (!value && opt.id === order[0]) ? 0 : -1}
            onClick={() => select(opt.id)}
            className={`flex items-start gap-token-3 rounded-md border p-token-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
          >
            <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary' : 'border-border'}`}>
              {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{opt.name}</span>
              <span className="mt-0.5 block text-token-meta text-text-faint">{opt.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* Status pill used across worksheet/quality/schema tables. */
function StatusPill({ status }) {
  const map = {
    ready: { cls: 'border-success bg-success-bg text-success', label: 'Ready' },
    passed: { cls: 'border-success bg-success-bg text-success', label: 'Passed' },
    detected: { cls: 'border-success bg-success-bg text-success', label: 'Detected' },
    warning: { cls: 'border-warning bg-warning-bg text-warning-strong', label: 'Warning' },
    warn: { cls: 'border-warning bg-warning-bg text-warning-strong', label: 'Warning' },
    review: { cls: 'border-warning bg-warning-bg text-warning-strong', label: 'Review' },
    empty: { cls: 'border-border-subtle bg-surface-muted text-text-faint', label: 'Empty' },
    hidden: { cls: 'border-border-subtle bg-surface-muted text-text-faint', label: 'Hidden' },
    error: { cls: 'border-danger-border bg-danger-bg text-danger', label: 'Error' },
  };
  const s = map[status] ?? map.detected;
  return (
    <span className={`inline-flex items-center rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ---- Header & action bar -------------------------------------------- */
function Header({ onCancel, isValid, submitted }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Excel Upload</h1>
        <p className="m-0 mt-token-1 max-w-2xl text-token-sm text-text-secondary-alt">
          Upload, validate, preview, and import Microsoft Excel workbooks. Choose worksheets, tune parsing, review the
          detected schema and quality report, then map a destination and import.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <span className="flex items-center gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-1 text-token-meta font-semibold text-warning-strong">
          <IconDot /> Unsaved changes
        </span>
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Import already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconImport />
          Validate &amp; Import
        </button>
      </div>
    </div>
  );
}

function ActionBar({ isValid, selectedCount, onCancel, submitted }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${isValid ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
        {isValid ? `Ready to import · ${selectedCount} worksheet${selectedCount === 1 ? '' : 's'} selected` : 'Complete the required fields to import'}
      </span>
      <div className="flex items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Import already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconImport />
          Validate &amp; Import
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Workbook Upload ------------------------------------- */
function WorkbookUpload() {
  const wb = SAMPLE_WORKBOOK;
  const meta = [wb.format, '7 worksheets', wb.version, `Uploaded ${wb.uploadedAt}`];
  return (
    <Section index={1} title="Workbook Upload" description="Upload an Excel workbook (.xlsx, .xls, .xlsm) for validation and import.">
      <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="note">
        <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-warning-strong" />
        <div>
          <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-warning-strong">
            Sample workbook
            <span className="rounded-sm border border-warning bg-surface-card px-token-2 py-0.5 text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong">No backend</span>
          </p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
            MOD-006 has no workbook-parsing backend yet. This screen is populated with a design-sourced example so the
            full validate-and-import flow is reviewable. Uploading a real file and importing are simulated.
          </p>
        </div>
      </div>

      <div className="mt-token-5 rounded-md border border-success bg-success-bg p-token-4">
        <div className="flex flex-wrap items-start justify-between gap-token-3">
          <div className="flex items-start gap-token-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success text-text-on-primary">
              <IconSheet />
            </span>
            <div className="min-w-0">
              <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
                {wb.name}
                <span className="rounded-sm border border-success bg-surface-card px-token-2 py-0.5 text-token-meta font-semibold uppercase text-success">Uploaded</span>
              </p>
              <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{meta.join(' · ')}</p>
              <p className="m-0 mt-0.5 text-token-meta text-text-faint">100% · {wb.sizeLabel} / {wb.sizeLabel} · 2.9 MB/s</p>
            </div>
          </div>
          <div className="flex items-center gap-token-2">
            <button type="button" disabled title="Replacing the workbook needs the MOD-006 upload backend (not yet available)." className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Replace</button>
            <button type="button" disabled title="Removing the workbook needs the MOD-006 upload backend (not yet available)." className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-danger disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Remove</button>
          </div>
        </div>
        <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-card" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <span className="block h-full rounded-full bg-success" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="mt-token-4 flex flex-col items-center justify-center gap-token-2 rounded-md border border-dashed border-border bg-surface-muted p-token-6 text-center">
        <IconUpload className="h-6 w-6 text-text-faint" />
        <p className="m-0 text-token-sm text-text-secondary-alt">
          Drag &amp; drop a replacement workbook here, or{' '}
          <button type="button" disabled title="File selection needs the MOD-006 upload backend (not yet available)." className="font-semibold text-primary underline disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">browse files</button>
        </p>
        <p className="m-0 text-token-meta text-text-faint">Supported: {ACCEPTED_EXTENSIONS.join(', ')} · Max size: 500 MB</p>
      </div>

      <dl className="mt-token-4 grid grid-cols-2 gap-token-3 sm:grid-cols-5">
        {WORKBOOK_LIMITS.map((lim) => (
          <div key={lim.key} className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
            <dt className="text-token-meta text-text-faint">{lim.label}</dt>
            <dd className="m-0 mt-0.5 text-token-sm font-semibold text-text-primary-alt">{lim.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---- Section 2: Workbook Information -------------------------------- */
function WorkbookInformation() {
  return (
    <Section index={2} title="Workbook Information" description="Auto-detected workbook metadata and structural properties.">
      <dl className="grid grid-cols-1 gap-token-3 sm:grid-cols-2">
        {WORKBOOK_INFO.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3">
            <div className="min-w-0">
              <dt className="text-token-meta text-text-faint">{row.label}</dt>
              <dd className="m-0 mt-0.5 text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
            </div>
            {row.status === 'warn'
              ? <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-strong" />
              : <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />}
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---- Section 3: Worksheet Selection --------------------------------- */
function WorksheetSelection({ form, selectedWorksheets, query, onQuery, onToggle, onSelectAll, onClear, error }) {
  const q = query.trim().toLowerCase();
  const visible = q ? WORKSHEETS.filter((w) => w.name.toLowerCase().includes(q)) : WORKSHEETS;
  const totalRows = selectedWorksheets.reduce((s, w) => s + w.rows, 0);
  const totalFormulas = selectedWorksheets.reduce((s, w) => s + w.formulas, 0);
  const maxCols = selectedWorksheets.reduce((m, w) => Math.max(m, w.columns), 0);
  const totals = [
    { label: 'Total rows selected', value: nf.format(totalRows) },
    { label: 'Sheets selected', value: String(selectedWorksheets.length) },
    { label: 'Formula cells', value: nf.format(totalFormulas) },
    { label: 'Columns detected', value: maxCols ? String(maxCols) : '—' },
  ];
  const actions = (
    <div className="flex items-center gap-token-2">
      <button type="button" onClick={onSelectAll} className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Select All</button>
      <span aria-hidden="true" className="text-text-faint">·</span>
      <button type="button" onClick={onClear} className="text-token-sm font-medium text-text-secondary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Clear</button>
    </div>
  );
  return (
    <Section index={3} title="Worksheet Selection" description={`Select worksheets to include in the import — ${selectedWorksheets.length} / ${WORKSHEETS.length} selected.`} actions={actions}>
      <div className="mb-token-3">
        <label htmlFor="worksheet-search" className="sr-only">Search worksheets</label>
        <input id="worksheet-search" type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search worksheets..." className={fieldBase} />
      </div>
      {error && <p className="m-0 mb-token-2 text-token-meta text-danger" role="alert">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="w-10 px-token-3 py-token-2"><span className="sr-only">Selected</span></th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Worksheet Name</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Rows</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Columns</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Header</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Formulas</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((w) => {
              const checked = !!form.selected[w.id];
              return (
                <tr key={w.id} className={`border-b border-border-subtle last:border-0 ${checked ? 'bg-shell-accent-wash' : ''} ${w.selectable ? '' : 'opacity-70'}`}>
                  <td className="px-token-3 py-token-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!w.selectable}
                      onChange={() => onToggle(w.id)}
                      aria-label={`Include ${w.name}`}
                      className="h-4 w-4 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </td>
                  <td className="px-token-3 py-token-2 text-token-sm font-medium text-text-primary-alt">{w.name}</td>
                  <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{w.rows > 0 ? nf.format(w.rows) : 'Empty'}</td>
                  <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{w.columns || '—'}</td>
                  <td className="px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{w.header}</td>
                  <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{w.formulas ? nf.format(w.formulas) : '0'}</td>
                  <td className="px-token-3 py-token-2"><StatusPill status={w.status} /></td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={7} className="px-token-3 py-token-5 text-center text-token-sm text-text-faint">No worksheets match “{query}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <dl className="mt-token-4 grid grid-cols-2 gap-token-3 sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-center">
            <dd className="m-0 text-token-lg font-bold text-text-primary-alt">{t.value}</dd>
            <dt className="mt-0.5 text-token-meta text-text-faint">{t.label}</dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---- Section 4: Parsing Configuration ------------------------------- */
function ParsingConfiguration({ form, setParsing, setField, setToggle }) {
  return (
    <Section index={4} title="Parsing Configuration" description="Configure worksheet parsing parameters applied to every selected sheet.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="field-headerRow" label="Header Row">
          {(db) => <SelectInput id="field-headerRow" value={form.parsing.headerRow} onChange={(v) => setParsing('headerRow', v)} describedBy={db} options={PARSING_OPTIONS.headerRow} />}
        </Field>
        <Field id="field-startingDataRow" label="Starting Data Row">
          {(db) => <SelectInput id="field-startingDataRow" value={form.parsing.startingDataRow} onChange={(v) => setParsing('startingDataRow', v)} describedBy={db} options={PARSING_OPTIONS.startingDataRow} />}
        </Field>
        <Field id="field-encoding" label="Character Encoding">
          {(db) => <SelectInput id="field-encoding" value={form.parsing.encoding} onChange={(v) => setParsing('encoding', v)} describedBy={db} options={PARSING_OPTIONS.encoding} />}
        </Field>
        <Field id="field-dateFormat" label="Date Format">
          {(db) => <SelectInput id="field-dateFormat" value={form.parsing.dateFormat} onChange={(v) => setParsing('dateFormat', v)} describedBy={db} options={PARSING_OPTIONS.dateFormat} />}
        </Field>
        <Field id="field-decimalSeparator" label="Decimal Separator">
          {(db) => <SelectInput id="field-decimalSeparator" value={form.parsing.decimalSeparator} onChange={(v) => setParsing('decimalSeparator', v)} describedBy={db} options={PARSING_OPTIONS.decimalSeparator} />}
        </Field>
        <Field id="field-thousandsSeparator" label="Thousands Separator">
          {(db) => <SelectInput id="field-thousandsSeparator" value={form.parsing.thousandsSeparator} onChange={(v) => setParsing('thousandsSeparator', v)} describedBy={db} options={PARSING_OPTIONS.thousandsSeparator} />}
        </Field>
      </div>

      <div className="mt-token-5">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Formula Handling</p>
        <RadioCardGroup label="Formula handling" options={FORMULA_STRATEGIES} value={form.formulaStrategy} onChange={(v) => setField('formulaStrategy', v)} />
      </div>

      <div className="mt-token-5 flex flex-col gap-token-3">
        {PARSE_TOGGLES.map((t) => (
          <Toggle key={t.id} id={`toggle-${t.id}`} checked={form.toggles[t.id]} onChange={(v) => setToggle(t.id, v)} label={t.label} description={t.description} />
        ))}
      </div>
    </Section>
  );
}

/* ---- Section 5: Schema Detection ------------------------------------ */
function SchemaDetection({ activeSheet, onSheet, showAll, onShowAll }) {
  const rows = showAll ? DETECTED_SCHEMA : DETECTED_SCHEMA.slice(0, 12);
  return (
    <Section index={5} title="Schema Detection" description="Auto-detected schema from selected worksheets — switch worksheets to inspect each.">
      <SheetTabs activeSheet={activeSheet} onSheet={onSheet} trailing={`${SCHEMA_TOTAL_COLUMNS} columns`} label="Worksheet for schema detection" />
      <div className="mt-token-3 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="w-10 px-token-3 py-token-2 font-semibold">#</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Column Name</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Detected Type</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Confidence</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Nullable</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Default</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.index} className="border-b border-border-subtle last:border-0">
                <td className="px-token-3 py-token-2 text-token-sm text-text-faint">{c.index}</td>
                <td className="px-token-3 py-token-2 font-mono text-token-sm font-medium text-text-primary-alt">{c.name}</td>
                <td className="px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{c.type}</td>
                <td className="px-token-3 py-token-2">
                  <span className="flex items-center gap-token-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                      <span className={`block h-full rounded-full ${c.confidence >= 95 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${c.confidence}%` }} />
                    </span>
                    <span className="text-token-meta text-text-secondary-alt">{c.confidence}%</span>
                  </span>
                </td>
                <td className="px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{c.nullable ? 'Yes' : '—'}</td>
                <td className="px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{c.default}</td>
                <td className="px-token-3 py-token-2"><StatusPill status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-token-3 flex items-center justify-between">
        <p className="m-0 text-token-meta text-text-faint">Showing {rows.length} of {SCHEMA_TOTAL_COLUMNS} columns</p>
        <button type="button" onClick={() => onShowAll(!showAll)} className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {showAll ? 'Show fewer columns' : `Show all ${SCHEMA_TOTAL_COLUMNS} columns`}
        </button>
      </div>
    </Section>
  );
}

/* Worksheet selector strip reused by Schema Detection + Preview. It is a
   labeled group of toggle buttons (aria-pressed) rather than a WAI-ARIA
   tablist: the same strip drives two separate panels off one shared
   `activeSheet`, so the tablist/tabpanel relationship (single owned
   panel, arrow-key roving) does not cleanly apply. */
function SheetTabs({ activeSheet, onSheet, trailing, label = 'Worksheet' }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-2">
      <div role="group" aria-label={label} className="flex flex-wrap gap-token-1">
        {PREVIEW_SHEET_TABS.map((sheet) => {
          const active = sheet === activeSheet;
          return (
            <button
              key={sheet}
              type="button"
              aria-pressed={active}
              onClick={() => onSheet(sheet)}
              className={`rounded-md px-token-3 py-token-1 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? 'bg-primary text-text-on-primary' : 'bg-surface-muted text-text-secondary-alt hover:bg-surface-hover'}`}
            >
              {sheet}
            </button>
          );
        })}
      </div>
      {trailing && <span className="text-token-meta text-text-faint">{trailing}</span>}
    </div>
  );
}

/* ---- Section 6: Workbook Preview ------------------------------------ */
function WorkbookPreview({ activeSheet, onSheet }) {
  return (
    <Section index={6} title="Workbook Preview" description="First 100 rows of the selected worksheet — switch worksheets to preview each.">
      <SheetTabs activeSheet={activeSheet} onSheet={onSheet} trailing={`100 / ${nf.format(PREVIEW_TOTAL_ROWS)} rows · ${activeSheet}`} label="Worksheet to preview" />
      <div className="mt-token-3 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th scope="col" className="w-10 px-token-3 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">#</th>
              {PREVIEW_COLUMNS.map((col) => (
                <th key={col.key} scope="col" className="px-token-3 py-token-2">
                  <span className="block font-mono text-token-sm font-medium text-text-primary-alt">{col.label}</span>
                  <span className="block text-token-meta text-text-faint">{col.type}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-border-subtle last:border-0">
                <td className="px-token-3 py-token-2 text-token-meta text-text-faint">{i + 1}</td>
                {PREVIEW_COLUMNS.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-token-3 flex flex-wrap items-center gap-token-4 text-token-meta text-text-faint">
        <span className="flex items-center gap-token-2"><span className="h-2.5 w-2.5 rounded-sm bg-shell-accent-wash ring-1 ring-primary" aria-hidden="true" /> Formula cell</span>
        <span className="flex items-center gap-token-2"><span className="h-2.5 w-2.5 rounded-sm bg-surface-muted ring-1 ring-border" aria-hidden="true" /> Empty cell</span>
        <span className="flex items-center gap-token-2"><span className="h-2.5 w-2.5 rounded-sm bg-warning-bg ring-1 ring-warning" aria-hidden="true" /> Merged cell (not in this sheet)</span>
      </div>
    </Section>
  );
}

/* ---- Section 7: Data Quality Validation ----------------------------- */
function DataQualityValidation({ form, setField }) {
  const warnings = QUALITY_CHECKS.filter((c) => c.status === 'warning').length;
  return (
    <Section index={7} title="Data Quality Validation" description="Automated validation checks run against the selected worksheets.">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Worksheet</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Rows</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Valid</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Formula Cells</th>
              <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Missing</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {QUALITY_BY_WORKSHEET.map((r) => (
              <tr key={r.sheet} className="border-b border-border-subtle last:border-0">
                <td className="px-token-3 py-token-2 text-token-sm font-medium text-text-primary-alt">{r.sheet}</td>
                <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{nf.format(r.rows)}</td>
                <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{nf.format(r.valid)}</td>
                <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{nf.format(r.formulaCells)}</td>
                <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{nf.format(r.missing)}</td>
                <td className="px-token-3 py-token-2"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-token-4 grid grid-cols-1 gap-token-2 sm:grid-cols-2">
        {QUALITY_CHECKS.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
            <span className="flex items-center gap-token-2 text-token-sm text-text-primary-alt">
              {c.status === 'warning'
                ? <IconAlert className="h-3.5 w-3.5 shrink-0 text-warning-strong" />
                : <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
              {c.label}
            </span>
            <span className="flex items-center gap-token-2 text-token-meta text-text-faint">
              <span>{c.count}</span>
              <span aria-hidden="true">·</span>
              <span>{c.impact}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-token-4">
        <Toggle
          id="toggle-warningsAcknowledged"
          checked={form.warningsAcknowledged}
          onChange={(v) => setField('warningsAcknowledged', v)}
          label={`Acknowledge ${warnings} quality warning${warnings === 1 ? '' : 's'}`}
          description="Confirm you have reviewed the warnings above and want to proceed with the import."
        />
      </div>
    </Section>
  );
}

/* ---- Section 8: Destination Configuration --------------------------- */
function DestinationConfiguration({ form, setField, mapping, errors, submitAttempted, estimate }) {
  return (
    <Section index={8} title="Destination Configuration" description="Choose where the imported worksheets are written and how tables are created.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-targetDataSource" label="Target Data Source" required error={submitAttempted ? errors.targetDataSource : null}>
          {(db) => (
            <SelectInput
              id="field-targetDataSource"
              value={form.targetDataSource}
              onChange={(v) => setField('targetDataSource', v)}
              options={DESTINATION_OPTIONS.targetDataSource}
              placeholder="Select a data source…"
              describedBy={db}
              required
              invalid={submitAttempted && !!errors.targetDataSource}
            />
          )}
        </Field>
        <Field id="field-targetSchema" label="Target Schema" required error={submitAttempted ? errors.targetSchema : null}>
          {(db) => (
            <SelectInput
              id="field-targetSchema"
              value={form.targetSchema}
              onChange={(v) => setField('targetSchema', v)}
              options={DESTINATION_OPTIONS.targetSchema}
              describedBy={db}
              required
              invalid={submitAttempted && !!errors.targetSchema}
            />
          )}
        </Field>
      </div>

      <div className="mt-token-5">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Import Strategy</p>
        <RadioCardGroup label="Import strategy" options={IMPORT_STRATEGIES} value={form.importStrategy} onChange={(v) => setField('importStrategy', v)} />
      </div>

      <div className="mt-token-5">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Worksheet → Table Mapping</p>
        {mapping.length === 0 ? (
          <p className="m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-3 text-token-sm text-text-faint">
            Select at least one worksheet to preview the destination table mapping.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-token-meta uppercase tracking-[0.04em] text-text-faint">
                  <th scope="col" className="px-token-3 py-token-2 font-semibold">Worksheet</th>
                  <th scope="col" className="px-token-3 py-token-2 font-semibold">Destination Table</th>
                  <th scope="col" className="px-token-3 py-token-2 text-right font-semibold">Rows</th>
                  <th scope="col" className="px-token-3 py-token-2 font-semibold">Mode</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m) => (
                  <tr key={m.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-token-3 py-token-2 text-token-sm font-medium text-text-primary-alt">{m.worksheet}</td>
                    <td className="px-token-3 py-token-2 font-mono text-token-sm text-text-secondary-alt">{m.table}</td>
                    <td className="px-token-3 py-token-2 text-right text-token-sm text-text-secondary-alt">{nf.format(m.rows)}</td>
                    <td className="px-token-3 py-token-2 text-token-sm text-text-secondary-alt">{m.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {mapping.length > 0 && (
          <p className="m-0 mt-token-2 text-token-meta text-text-faint">
            {estimate.tablesCreated} table{estimate.tablesCreated === 1 ? '' : 's'} · {nf.format(estimate.totalRecords)} records total
          </p>
        )}
      </div>
    </Section>
  );
}

/* ---- Section 9: Import Configuration -------------------------------- */
function ImportConfiguration({ form, setField, errors, submitAttempted }) {
  return (
    <Section index={9} title="Import Configuration" description="Tune batching, error handling, and scheduling for the import job.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="field-batchSize" label="Batch Size (rows)" required error={submitAttempted ? errors.batchSize : null} hint="Rows written per batch.">
          {(db) => <TextInput id="field-batchSize" type="number" min="1" value={form.batchSize} onChange={(v) => setField('batchSize', v)} describedBy={db} required invalid={submitAttempted && !!errors.batchSize} />}
        </Field>
        <Field id="field-commitInterval" label="Commit Interval (rows)" required error={submitAttempted ? errors.commitInterval : null} hint="Rows between commits.">
          {(db) => <TextInput id="field-commitInterval" type="number" min="1" value={form.commitInterval} onChange={(v) => setField('commitInterval', v)} describedBy={db} required invalid={submitAttempted && !!errors.commitInterval} />}
        </Field>
        <Field id="field-errorThreshold" label="Error Threshold" required error={submitAttempted ? errors.errorThreshold : null} hint="Abort after this many row errors.">
          {(db) => <TextInput id="field-errorThreshold" type="number" min="0" value={form.errorThreshold} onChange={(v) => setField('errorThreshold', v)} describedBy={db} required invalid={submitAttempted && !!errors.errorThreshold} />}
        </Field>
        <Field id="field-duplicateStrategy" label="Duplicate Handling Strategy">
          {(db) => <SelectInput id="field-duplicateStrategy" value={form.duplicateStrategy} onChange={(v) => setField('duplicateStrategy', v)} options={DUPLICATE_STRATEGIES} describedBy={db} />}
        </Field>
        <Field id="field-importPriority" label="Import Priority">
          {(db) => <SelectInput id="field-importPriority" value={form.importPriority} onChange={(v) => setField('importPriority', v)} options={IMPORT_PRIORITY_OPTIONS} describedBy={db} />}
        </Field>
        <Field id="field-scheduling" label="Scheduling">
          {(db) => <SelectInput id="field-scheduling" value={form.scheduling} onChange={(v) => setField('scheduling', v)} options={SCHEDULING_OPTIONS} describedBy={db} />}
        </Field>
      </div>
    </Section>
  );
}

/* ---- Section 10: Metadata & Governance ------------------------------ */
function MetadataGovernance({ form, setField, tags, setTags, toggleFramework, errors, submitAttempted }) {
  const [tagDraft, setTagDraft] = useState('');
  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft('');
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));
  const onTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };
  return (
    <Section index={10} title="Metadata &amp; Governance" description="Ownership, classification, retention, and compliance metadata for the imported dataset.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-owner" label="Dataset Owner" required error={submitAttempted ? errors.owner : null}>
          {(db) => (
            <SelectInput id="field-owner" value={form.owner} onChange={(v) => setField('owner', v)} options={GOVERNANCE_OPTIONS.owner} describedBy={db} required invalid={submitAttempted && !!errors.owner} />
          )}
        </Field>
        <Field id="field-businessDomain" label="Business Domain">
          {(db) => <SelectInput id="field-businessDomain" value={form.businessDomain} onChange={(v) => setField('businessDomain', v)} options={GOVERNANCE_OPTIONS.businessDomain} describedBy={db} />}
        </Field>
        <Field id="field-department" label="Department">
          {(db) => <SelectInput id="field-department" value={form.department} onChange={(v) => setField('department', v)} options={GOVERNANCE_OPTIONS.department} describedBy={db} />}
        </Field>
        <Field id="field-dataClassification" label="Data Classification">
          {(db) => <SelectInput id="field-dataClassification" value={form.dataClassification} onChange={(v) => setField('dataClassification', v)} options={GOVERNANCE_OPTIONS.dataClassification} describedBy={db} />}
        </Field>
        <Field id="field-sensitivityLevel" label="Sensitivity Level">
          {(db) => <SelectInput id="field-sensitivityLevel" value={form.sensitivityLevel} onChange={(v) => setField('sensitivityLevel', v)} options={GOVERNANCE_OPTIONS.sensitivityLevel} describedBy={db} />}
        </Field>
        <Field id="field-retentionPolicy" label="Retention Policy">
          {(db) => <SelectInput id="field-retentionPolicy" value={form.retentionPolicy} onChange={(v) => setField('retentionPolicy', v)} options={GOVERNANCE_OPTIONS.retentionPolicy} describedBy={db} />}
        </Field>
      </div>

      <fieldset className="mt-token-5 border-0 p-0">
        <legend className="mb-token-2 text-token-sm font-medium text-text-secondary-alt">Compliance Frameworks</legend>
        <div className="flex flex-wrap gap-token-2">
          {COMPLIANCE_FRAMEWORKS.map((fw) => {
            const on = form.frameworks.includes(fw);
            return (
              <button
                key={fw}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFramework(fw)}
                className={`rounded-md border px-token-3 py-token-1 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? 'border-primary bg-shell-accent-wash text-primary' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'}`}
              >
                {fw}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-token-5">
        <label htmlFor="field-tagDraft" className="text-token-sm font-medium text-text-secondary-alt">Tags</label>
        <div className="mt-token-1 flex flex-wrap items-center gap-token-2 rounded-md border border-border bg-surface-card p-token-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-token-1 rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-meta font-medium text-primary">
              {t}
              <button type="button" onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`} className="flex items-center rounded-sm text-primary hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary">
                <IconX className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id="field-tagDraft"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={addTag}
            placeholder="Add a tag…"
            className="h-7 min-w-[120px] flex-1 bg-transparent px-token-1 text-token-sm text-text-primary-alt placeholder:text-text-faint focus:outline-none"
          />
        </div>
        <p className="m-0 mt-token-1 text-token-meta text-text-faint">Press Enter or comma to add a tag.</p>
      </div>

      <div className="mt-token-5">
        <Field id="field-notes" label="Notes">
          {(db) => (
            <textarea
              id="field-notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              aria-describedby={db}
              rows={3}
              placeholder="Optional description or import context…"
              className={`${fieldBase} h-auto py-token-2`}
            />
          )}
        </Field>
      </div>
    </Section>
  );
}

/* ---- Aside: Workbook Summary ---------------------------------------- */
function AsidePanel({ title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 mb-token-3 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">{title}</h2>
      {children}
    </section>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-token-3 py-token-1">
      <dt className="text-token-sm text-text-secondary-alt">{label}</dt>
      <dd className="m-0 text-token-sm font-semibold text-text-primary-alt">{value}</dd>
    </div>
  );
}

function WorkbookSummary({ selectedWorksheets, estimate, form }) {
  return (
    <AsidePanel title="Workbook Summary">
      <dl className="flex flex-col divide-y divide-border-subtle">
        <StatRow label="Workbook" value={SAMPLE_WORKBOOK.name} />
        <StatRow label="Size" value={SAMPLE_WORKBOOK.sizeLabel} />
        <StatRow label="Worksheets selected" value={`${selectedWorksheets.length} / ${WORKSHEETS.length}`} />
        <StatRow label="Records to import" value={nf.format(estimate.totalRecords)} />
        <StatRow label="Tables created" value={String(estimate.tablesCreated)} />
        <StatRow label="Target schema" value={form.targetSchema || '—'} />
      </dl>
    </AsidePanel>
  );
}

/* ---- Aside: Validation Status --------------------------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const pct = Math.round((completedCount / checklist.length) * 100);
  return (
    <AsidePanel title="Validation Status">
      <div className="flex items-center justify-between text-token-sm">
        <span className="text-text-secondary-alt">{completedCount} of {checklist.length} ready</span>
        <span className="font-semibold text-text-primary-alt">{pct}%</span>
      </div>
      <div className="mt-token-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Validation progress">
        <span className={`block h-full rounded-full ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-sm">
            {item.done
              ? <IconCheck className="h-4 w-4 shrink-0 text-success" />
              : <IconCircle className="h-4 w-4 shrink-0 text-text-faint" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </AsidePanel>
  );
}

/* ---- Aside: Worksheet Information ------------------------------------ */
function WorksheetInformation({ selectedWorksheets }) {
  if (selectedWorksheets.length === 0) {
    return (
      <AsidePanel title="Worksheet Information">
        <p className="m-0 text-token-sm text-text-faint">No worksheets selected.</p>
      </AsidePanel>
    );
  }
  return (
    <AsidePanel title="Worksheet Information">
      <ul className="flex flex-col gap-token-2">
        {selectedWorksheets.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
            <span className="min-w-0">
              <span className="block text-token-sm font-medium text-text-primary-alt">{w.name}</span>
              <span className="block text-token-meta text-text-faint">{nf.format(w.rows)} rows · {w.columns} cols</span>
            </span>
            <StatusPill status={w.status} />
          </li>
        ))}
      </ul>
    </AsidePanel>
  );
}

/* ---- Aside: Data Quality Overview ----------------------------------- */
function DataQualityOverview() {
  const passed = QUALITY_CHECKS.filter((c) => c.status === 'passed').length;
  const warnings = QUALITY_CHECKS.filter((c) => c.status === 'warning').length;
  const stats = [
    { label: 'Checks passed', value: String(passed), cls: 'text-success' },
    { label: 'Warnings', value: String(warnings), cls: 'text-warning-strong' },
    { label: 'Errors', value: '0', cls: 'text-text-primary-alt' },
  ];
  return (
    <AsidePanel title="Data Quality Overview">
      <div className="grid grid-cols-3 gap-token-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border-subtle bg-surface-muted px-token-2 py-token-3 text-center">
            <p className={`m-0 text-token-lg font-bold ${s.cls}`}>{s.value}</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-faint">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="m-0 mt-token-3 text-token-meta text-text-secondary-alt">
        {warnings} low-impact warning{warnings === 1 ? '' : 's'} detected (formula cells, missing values). Review and acknowledge before importing.
      </p>
    </AsidePanel>
  );
}

/* ---- Aside: Import Readiness ---------------------------------------- */
function ImportReadiness({ checklist, completedCount }) {
  const ready = completedCount === checklist.length;
  return (
    <AsidePanel title="Import Readiness">
      <div className={`flex items-center gap-token-3 rounded-md border p-token-4 ${ready ? 'border-success bg-success-bg' : 'border-warning bg-warning-bg'}`}>
        {ready ? <IconCheck className="h-5 w-5 shrink-0 text-success" /> : <IconAlert className="h-5 w-5 shrink-0 text-warning-strong" />}
        <div>
          <p className={`m-0 text-token-sm font-semibold ${ready ? 'text-success' : 'text-warning-strong'}`}>
            {ready ? 'Ready to import' : 'Almost ready'}
          </p>
          <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
            {ready ? 'All checks complete. You can start the import.' : `${checklist.length - completedCount} step${checklist.length - completedCount === 1 ? '' : 's'} remaining before import.`}
          </p>
        </div>
      </div>
    </AsidePanel>
  );
}

/* ---- Confirm dialog (focus-trapped, mirrors SCR-048) ---------------- */
function ConfirmDialog({ form, selectedWorksheets, estimate, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => {
    const trigger = triggerRef.current;
    cancelRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg"
      >
        <h2 id="confirm-title" className="m-0 text-token-base font-semibold text-text-primary-alt">Start workbook import?</h2>
        <p id="confirm-body" className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">
          Import <strong>{selectedWorksheets.length}</strong> worksheet{selectedWorksheets.length === 1 ? '' : 's'}
          {' '}(<strong>{nf.format(estimate.totalRecords)}</strong> records) into{' '}
          <strong>{form.targetSchema}</strong> on <strong>{form.targetDataSource || 'the selected data source'}</strong>.
          This creates {estimate.tablesCreated} table{estimate.tablesCreated === 1 ? '' : 's'} in {estimate.batches} batch{estimate.batches === 1 ? '' : 'es'}.
        </p>
        <div className="mt-token-6 flex justify-end gap-token-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={submitting} className="flex h-9 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <><IconSpinner /> Starting…</> : <><IconImport /> Start import</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline SVG icons (currentColor) -------------------------------- */
function IconCheck({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
function IconX({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
function IconCircle({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6" strokeDasharray="2 2" />
    </svg>
  );
}
function IconInfo({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v3M8 5.25v.5" />
    </svg>
  );
}
function IconAlert({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2l6 11H2L8 2z" />
      <path d="M8 6.5v3M8 11.25v.25" />
    </svg>
  );
}
function IconDot({ className = 'h-2 w-2' }) {
  return (
    <svg className={className} viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
function IconImport({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v7M5 6.5L8 9.5l3-3" />
      <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" />
    </svg>
  );
}
function IconSheet({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="2.5" width="13" height="15" rx="1.5" />
      <path d="M3.5 8h13M3.5 12.5h13M8 8v9.5" />
    </svg>
  );
}
function IconUpload({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}
function IconSpinner({ className = 'h-4 w-4 animate-spin' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 1.5a6.5 6.5 0 106.5 6.5" />
    </svg>
  );
}
