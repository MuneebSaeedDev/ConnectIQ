import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  UPLOAD_LIMITS,
  SAMPLE_FILE,
  DETECTED_FILE_INFO,
  PARSE_OPTIONS,
  DEFAULT_PARSE_CONFIG,
  DETECTED_SCHEMA,
  TOTAL_DETECTED_COLUMNS,
  COLUMN_TYPE_OPTIONS,
  PREVIEW_COLUMNS,
  PREVIEW_ROWS,
  PREVIEW_TOTAL_ROWS,
  QUALITY_METRICS,
  QUALITY_CHECKS,
  DUPLICATE_KEY_COLUMN,
  DESTINATION_OPTIONS,
  WRITE_MODES,
  DUPLICATE_STRATEGIES,
  DEFAULT_DESTINATION,
  GOVERNANCE_OPTIONS,
  COMPLIANCE_FRAMEWORKS,
  DEFAULT_GOVERNANCE,
  ORG_ID,
  startCsvImport,
  uploadCsvFile,
} from '../services/csvUpload.api';

/* Field styling — shared with SCR-046/048 so the data-source forms read
   identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* Required-field validation for the destination + governance sections. */
function validate(form) {
  const errors = {};
  if (!form.file) errors.file = 'Upload a CSV file to continue.';
  if (!form.targetDataSource) errors.targetDataSource = 'Select a target data source.';
  if (!form.targetSchema.trim()) errors.targetSchema = 'Select a target schema.';
  if (!form.tableName.trim()) errors.tableName = 'Table name is required.';
  else if (!IDENTIFIER_PATTERN.test(form.tableName.trim())) {
    errors.tableName = 'Use letters, numbers, and underscores; start with a letter or underscore.';
  }
  if (!form.owner) errors.owner = 'A dataset owner is required.';

  const batch = Number(form.batchSize);
  if (!Number.isInteger(batch) || batch < 1) errors.batchSize = 'Enter a positive batch size.';
  const commit = Number(form.commitInterval);
  if (!Number.isInteger(commit) || commit < 1) errors.commitInterval = 'Enter a positive commit interval.';
  const threshold = Number(form.errorThreshold);
  if (!Number.isInteger(threshold) || threshold < 0) errors.errorThreshold = 'Enter zero or more.';
  return errors;
}

/* Import Readiness checklist. "Validation Passed" stays pending while the
   design's two data-quality warnings are unresolved — mirroring the frame's
   5/6 "Mostly Ready" state. */
function computeChecklist(form, hasFile) {
  const warnings = QUALITY_CHECKS.filter((c) => c.status === 'Warning').length;
  const destinationOk = !!form.targetDataSource && !!form.targetSchema.trim() && !!form.tableName.trim();
  return [
    { key: 'uploaded', label: 'File Uploaded', done: hasFile },
    { key: 'parsed', label: 'CSV Parsed', done: hasFile },
    { key: 'schema', label: 'Schema Detected', done: hasFile },
    {
      key: 'validated',
      label: 'Validation Passed',
      done: hasFile && warnings === 0,
      pending: hasFile && warnings > 0 ? `Review ${warnings} data quality warning${warnings === 1 ? '' : 's'}` : null,
    },
    { key: 'destination', label: 'Destination Configured', done: destinationOk },
    { key: 'ready', label: 'Ready for Import', done: hasFile && destinationOk },
  ];
}

/** SCR-050 — CSV Upload Screen. Node 117:35049. */
export default function CsvUploadScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    // File — boots pre-populated with the design's sample file (mock mode).
    file: { ...SAMPLE_FILE },
    fileMocked: true,
    // Parsing configuration
    ...DEFAULT_PARSE_CONFIG,
    // Destination + import configuration
    ...DEFAULT_DESTINATION,
    // Metadata & governance
    ...DEFAULT_GOVERNANCE,
  }));
  const [schema, setSchema] = useState(() => DETECTED_SCHEMA.map((c) => ({ ...c })));
  const [previewQuery, setPreviewQuery] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [uploadState, setUploadState] = useState({ status: 'idle' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '', result: null });
  const fileInputRef = useRef(null);

  const hasFile = !!form.file;
  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form, hasFile), [form, hasFile]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;
  const readinessPct = Math.round((completedCount / checklist.length) * 100);

  const filteredPreview = useMemo(() => {
    const q = previewQuery.trim().toLowerCase();
    if (!q) return PREVIEW_ROWS;
    return PREVIEW_ROWS.filter((row) =>
      PREVIEW_COLUMNS.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q)),
    );
  }, [previewQuery]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  async function handleFileSelected(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setUploadState({ status: 'uploading' });
    const result = await uploadCsvFile(ORG_ID, file);
    setForm((prev) => ({
      ...prev,
      file: {
        name: result.name ?? result.fileName ?? file.name,
        sizeLabel: result.sizeLabel ?? formatBytes(file.size),
        sizeBytes: result.sizeBytes ?? file.size,
        format: result.format ?? 'CSV',
        totalRows: result.totalRows ?? SAMPLE_FILE.totalRows,
        totalColumns: result.totalColumns ?? SAMPLE_FILE.totalColumns,
        uploadedAt: result.uploadedAt ?? SAMPLE_FILE.uploadedAt,
        throughput: result.throughput ?? SAMPLE_FILE.throughput,
      },
      fileMocked: !!result.mocked,
      tableName: prev.tableName || deriveTableName(result.name ?? file.name),
    }));
    setUploadState({ status: result.mocked ? 'mocked' : 'success' });
  }

  function handleRemoveFile() {
    setForm((prev) => ({ ...prev, file: null, fileMocked: false }));
    setUploadState({ status: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function setColumnType(idx, type) {
    setSchema((prev) => prev.map((c) => (c.idx === idx ? { ...c, type, status: 'Detected' } : c)));
  }
  function toggleNullable(idx) {
    setSchema((prev) => prev.map((c) => (c.idx === idx ? { ...c, nullable: !c.nullable } : c)));
  }

  function addTag() {
    const tag = tagDraft.trim().toLowerCase();
    if (!tag) return;
    setForm((prev) => (prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }));
    setTagDraft('');
  }
  function removeTag(tag) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }
  function toggleCompliance(framework) {
    setForm((prev) => ({
      ...prev,
      compliance: prev.compliance.includes(framework)
        ? prev.compliance.filter((f) => f !== framework)
        : [...prev.compliance, framework],
    }));
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmImport() {
    setSubmitState({ status: 'submitting', message: '', result: null });
    const result = await startCsvImport(ORG_ID, buildPayload(form, schema));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        result,
        message:
          'MOD-006 has no data-source backend yet, so nothing was imported. In a live environment this would stream the parsed rows into the destination table, applying the parsing profile, duplicate strategy, and governance metadata below.',
      });
    } else {
      setSubmitState({ status: 'success', result, message: 'Import queued.' });
      navigate('/data-sources');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'CSV Upload']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/data-sources/new')} isValid={isValid} submitted={submitState.status === 'mocked'} />

        <span className="sr-only" role="status" aria-live="polite">
          {uploadState.status === 'uploading'
            ? 'Uploading and parsing file'
            : submitState.status === 'submitting'
              ? 'Starting import'
              : submitState.status === 'mocked'
                ? 'Import simulated — no backend available'
                : `${completedCount} of ${checklist.length} import readiness steps complete`}
        </span>

        <div className="rounded-md border border-warning bg-warning-bg p-token-4" role="note">
          <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-warning-strong">
            <IconAlert className="h-3.5 w-3.5 shrink-0" />
            Sample data — MOD-006 backend not deployed
          </p>
          <p className="m-0 mt-token-1 text-token-meta text-text-secondary-alt">
            The file profile, detected schema, preview rows, and data-quality figures are design-sourced sample data. Uploading a file or starting an import attempts a real request first and falls back to a simulated result until the CSV endpoints ship.
          </p>
        </div>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated import (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
            {submitState.result?.id && (
              <p className="m-0 mt-token-2 text-token-meta text-text-faint">Simulated job id: <span className="font-mono">{submitState.result.id}</span></p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <FileUpload form={form} uploadState={uploadState} fileInputRef={fileInputRef} onSelect={handleFileSelected} onRemove={handleRemoveFile} error={showError('file') ? errors.file : null} />
            {hasFile && <FileInformation />}
            {hasFile && <ParsingConfiguration form={form} setField={setField} />}
            {hasFile && <SchemaDetection schema={schema} onSetType={setColumnType} onToggleNullable={toggleNullable} />}
            {hasFile && <DataPreview query={previewQuery} setQuery={setPreviewQuery} rows={filteredPreview} />}
            {hasFile && <DataQuality />}
            <DestinationConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <ImportConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <Governance form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} tagDraft={tagDraft} setTagDraft={setTagDraft} onAddTag={addTag} onRemoveTag={removeTag} onToggleCompliance={toggleCompliance} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <UploadSummary form={form} />
            <DataQualityOverview />
            <ImportReadiness pct={readinessPct} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <ImportEstimate form={form} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources/new')} submitted={submitState.status === 'mocked'} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmImport}
        />
      )}
    </AppShell>
  );
}

/* ---- helpers -------------------------------------------------------- */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function deriveTableName(fileName) {
  return String(fileName || '')
    .replace(/\.(csv|gz)$/gi, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'imported_table';
}

function buildPayload(form, schema) {
  return {
    file: form.file ? { name: form.file.name, sizeBytes: form.file.sizeBytes, totalRows: form.file.totalRows, totalColumns: form.file.totalColumns } : null,
    parsing: {
      delimiter: form.delimiter,
      encoding: form.encoding,
      headerRow: form.headerRow,
      quoteChar: form.quoteChar,
      escapeChar: form.escapeChar,
      nullRepresentation: form.nullRepresentation,
      dateFormat: form.dateFormat,
      decimalSeparator: form.decimalSeparator,
      thousandsSeparator: form.thousandsSeparator,
      skipEmptyRows: form.skipEmptyRows,
      trimWhitespace: form.trimWhitespace,
      skipInvalidRows: form.skipInvalidRows,
      treatEmptyAsNull: form.treatEmptyAsNull,
    },
    schema: schema.map((c) => ({ name: c.name, type: c.type, nullable: c.nullable, defaultValue: c.defaultValue })),
    destination: {
      targetDataSource: form.targetDataSource,
      targetSchema: form.targetSchema,
      tableName: form.tableName.trim(),
      dataset: form.dataset.trim() || null,
      writeMode: form.writeMode,
    },
    import: {
      batchSize: Number(form.batchSize) || null,
      commitInterval: Number(form.commitInterval) || null,
      errorThreshold: Number(form.errorThreshold),
      duplicateStrategy: form.duplicateStrategy,
      duplicateKey: DUPLICATE_KEY_COLUMN,
      importPriority: form.importPriority,
      scheduling: form.scheduling,
    },
    governance: {
      owner: form.owner,
      businessDomain: form.businessDomain,
      department: form.department,
      dataClassification: form.dataClassification,
      sensitivityLevel: form.sensitivityLevel,
      retentionPolicy: form.retentionPolicy,
      tags: form.tags,
      compliance: form.compliance,
      notes: form.notes.trim() || null,
    },
  };
}

/* ---- Shared field primitives (mirrors SCR-046/048) ------------------ */
function Section({ index, title, description, children, actions, badge }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="flex items-start gap-token-3">
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-token-meta font-semibold text-primary">
            {index}
          </span>
          <div>
            <h2 className="m-0 flex items-center gap-token-2 text-token-base font-semibold text-text-primary-alt">
              {title}
              {badge}
            </h2>
            {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function SampleBadge() {
  return (
    <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">
      Sample data
    </span>
  );
}

function FieldGrid({ children }) {
  return <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>;
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

function TextInput({ id, value, onChange, onBlur, invalid, describedBy, required, ...rest }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`${fieldBase} ${invalid ? fieldInvalid : ''}`}
      {...rest}
    />
  );
}

function SelectInput({ id, value, onChange, onBlur, invalid, describedBy, options, placeholder, required, disabled }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
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

/* ---- Header & action bar -------------------------------------------- */
function Header({ onCancel, isValid, submitted }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">CSV Upload</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Upload, validate, preview, and import CSV datasets. Auto-detect the parsing profile and column schema, review data quality, then configure a destination import.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
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

function ActionBar({ isValid, completedCount, total, onCancel, submitted }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${isValid ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
        {isValid ? 'All required fields completed · Ready to import' : `${completedCount} of ${total} readiness steps complete`}
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
/* ---- Section 1: File Upload ----------------------------------------- */
function FileUpload({ form, uploadState, fileInputRef, onSelect, onRemove, error }) {
  const [dragOver, setDragOver] = useState(false);
  const uploading = uploadState.status === 'uploading';
  const file = form.file;
  return (
    <Section index={1} title="File Upload" description="Upload a delimited text file to parse and import." badge={file && form.fileMocked ? <SampleBadge /> : null}>
      <input
        ref={fileInputRef}
        id="field-file"
        type="file"
        accept={UPLOAD_LIMITS.accept}
        className="sr-only"
        onChange={(e) => onSelect(e.target.files)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'field-file-error' : undefined}
      />
      {file ? (
        <div className="mt-token-5 flex flex-col gap-token-4">
          <div className="flex flex-wrap items-center gap-token-4 rounded-md border border-border bg-surface-muted p-token-4">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary">
              <IconFile />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{file.name}</p>
              <p className="m-0 mt-0.5 truncate text-token-meta text-text-faint">
                {file.sizeLabel} · {file.format} · {file.totalRows.toLocaleString()} rows · {file.totalColumns} columns
              </p>
            </div>
            <div className="flex items-center gap-token-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-meta font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                Replace
              </button>
              <button type="button" onClick={onRemove} className="flex h-8 items-center rounded-md border border-danger-border bg-surface-card px-token-3 text-token-meta font-medium text-danger hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger">
                Remove
              </button>
            </div>
          </div>
          <p className="m-0 text-token-meta text-text-faint">Uploaded {file.uploadedAt} · {file.throughput}</p>
        </div>
      ) : (
        <div
          className={`mt-token-5 flex flex-col items-center justify-center gap-token-3 rounded-md border-2 border-dashed p-token-8 text-center transition-colors ${dragOver ? 'border-primary bg-shell-accent-wash' : error ? 'border-danger-border bg-surface-card' : 'border-border bg-surface-muted'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onSelect(e.dataTransfer.files); }}
        >
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-shell-accent-wash text-primary">
            {uploading ? <IconSpinner /> : <IconUpload />}
          </span>
          <div>
            <p className="m-0 text-token-sm font-semibold text-text-primary-alt">
              {uploading ? 'Uploading and parsing…' : 'Drag and drop a CSV file here'}
            </p>
            <p className="m-0 mt-token-1 text-token-meta text-text-faint">or</p>
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconUpload />
            Browse files
          </button>
        </div>
      )}
      <dl className="mt-token-4 grid grid-cols-2 gap-token-3 sm:grid-cols-4">
        <SpecItem label="Accepted" value={UPLOAD_LIMITS.acceptLabel} />
        <SpecItem label="Max size" value={UPLOAD_LIMITS.maxSizeLabel} />
        <SpecItem label="Max rows" value={UPLOAD_LIMITS.maxRowsLabel} />
        <SpecItem label="Max columns" value={String(UPLOAD_LIMITS.maxColumns)} />
        <SpecItem label="Encodings" value={UPLOAD_LIMITS.encodings.join(', ')} />
        <SpecItem label="Compression" value={UPLOAD_LIMITS.compression.join(', ')} />
      </dl>
      {error && <p id="field-file-error" className="m-0 mt-token-3 text-token-meta text-danger" role="alert">{error}</p>}
    </Section>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className="m-0 mt-0.5 text-token-meta font-medium text-text-primary-alt">{value}</dd>
    </div>
  );
}

/* ---- Section 2: File Information ------------------------------------- */
function FileInformation() {
  return (
    <Section index={2} title="File Information" description="Auto-detected from the uploaded file." badge={<SampleBadge />}>
      <dl className="mt-token-5 grid grid-cols-1 gap-x-token-6 gap-y-token-3 sm:grid-cols-2">
        {DETECTED_FILE_INFO.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-token-3 border-b border-border-subtle pb-token-2">
            <dt className="text-token-sm text-text-secondary-alt">{row.label}</dt>
            <dd className="m-0 flex items-center gap-token-2 text-right text-token-sm font-medium text-text-primary-alt">
              {row.ok && <IconCheck className="h-3 w-3 shrink-0 text-success" />}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---- Section 3: Parsing Configuration ------------------------------- */
function ParsingConfiguration({ form, setField }) {
  return (
    <Section index={3} title="Parsing Configuration" description="Override the auto-detected parsing profile if needed.">
      <FieldGrid>
        <Field id="field-delimiter" label="Delimiter">
          {(db) => <SelectInput id="field-delimiter" value={form.delimiter} onChange={(v) => setField('delimiter', v)} describedBy={db} options={PARSE_OPTIONS.delimiter} />}
        </Field>
        <Field id="field-encoding" label="Character Encoding">
          {(db) => <SelectInput id="field-encoding" value={form.encoding} onChange={(v) => setField('encoding', v)} describedBy={db} options={PARSE_OPTIONS.encoding} />}
        </Field>
        <Field id="field-headerRow" label="Header Row">
          {(db) => <SelectInput id="field-headerRow" value={form.headerRow} onChange={(v) => setField('headerRow', v)} describedBy={db} options={PARSE_OPTIONS.headerRow} />}
        </Field>
        <Field id="field-quoteChar" label="Quote Character">
          {(db) => <SelectInput id="field-quoteChar" value={form.quoteChar} onChange={(v) => setField('quoteChar', v)} describedBy={db} options={PARSE_OPTIONS.quoteChar} />}
        </Field>
        <Field id="field-escapeChar" label="Escape Character">
          {(db) => <SelectInput id="field-escapeChar" value={form.escapeChar} onChange={(v) => setField('escapeChar', v)} describedBy={db} options={PARSE_OPTIONS.escapeChar} />}
        </Field>
        <Field id="field-nullRepresentation" label="Null Value Representation" hint="Comma-separated tokens treated as null.">
          {(db) => <TextInput id="field-nullRepresentation" value={form.nullRepresentation} onChange={(v) => setField('nullRepresentation', v)} describedBy={db} placeholder='empty, "NULL", "N/A"' />}
        </Field>
        <Field id="field-dateFormat" label="Date Format">
          {(db) => <SelectInput id="field-dateFormat" value={form.dateFormat} onChange={(v) => setField('dateFormat', v)} describedBy={db} options={PARSE_OPTIONS.dateFormat} />}
        </Field>
        <Field id="field-decimalSeparator" label="Decimal Separator">
          {(db) => <SelectInput id="field-decimalSeparator" value={form.decimalSeparator} onChange={(v) => setField('decimalSeparator', v)} describedBy={db} options={PARSE_OPTIONS.decimalSeparator} />}
        </Field>
        <Field id="field-thousandsSeparator" label="Thousands Separator">
          {(db) => <SelectInput id="field-thousandsSeparator" value={form.thousandsSeparator} onChange={(v) => setField('thousandsSeparator', v)} describedBy={db} options={PARSE_OPTIONS.thousandsSeparator} />}
        </Field>
      </FieldGrid>
      <div className="mt-token-4 grid grid-cols-1 gap-token-3 sm:grid-cols-2">
        <Toggle id="field-skipEmptyRows" checked={form.skipEmptyRows} onChange={(v) => setField('skipEmptyRows', v)} label="Skip Empty Rows" description="Ignore rows that contain no values." />
        <Toggle id="field-trimWhitespace" checked={form.trimWhitespace} onChange={(v) => setField('trimWhitespace', v)} label="Trim Whitespace" description="Strip leading/trailing spaces from each value." />
        <Toggle id="field-skipInvalidRows" checked={form.skipInvalidRows} onChange={(v) => setField('skipInvalidRows', v)} label="Skip Invalid Rows" description="Continue past rows that fail to parse." />
        <Toggle id="field-treatEmptyAsNull" checked={form.treatEmptyAsNull} onChange={(v) => setField('treatEmptyAsNull', v)} label="Treat Empty as Null" description="Store empty strings as null." />
      </div>
    </Section>
  );
}
/* ---- Section 4: Schema Detection ------------------------------------ */
function SchemaDetection({ schema, onSetType, onToggleNullable }) {
  return (
    <Section index={4} title="Schema Detection" description={`Auto-detected column types. Showing ${schema.length} of ${TOTAL_DETECTED_COLUMNS} columns.`} badge={<SampleBadge />}>
      <div className="mt-token-5 overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-token-sm">
          <caption className="sr-only">Detected column schema</caption>
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="px-token-3 py-token-2 font-semibold">#</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Column Name</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Detected Type</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Confidence</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Nullable</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Default</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {schema.map((col) => (
              <tr key={col.idx} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-3 py-token-2 text-text-faint">{col.idx}</td>
                <th scope="row" className="px-token-3 py-token-2 text-left font-mono font-medium text-text-primary-alt">{col.name}</th>
                <td className="px-token-3 py-token-2">
                  <label className="sr-only" htmlFor={`schema-type-${col.idx}`}>Type for {col.name}</label>
                  <select
                    id={`schema-type-${col.idx}`}
                    value={col.type}
                    onChange={(e) => onSetType(col.idx, e.target.value)}
                    className="h-7 rounded-md border border-border bg-surface-card px-token-2 text-token-meta text-text-primary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                  >
                    {COLUMN_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="px-token-3 py-token-2">
                  <span className="flex items-center gap-token-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                      <span className={`block h-full rounded-full ${col.confidence >= 95 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${col.confidence}%` }} />
                    </span>
                    <span className="text-token-meta text-text-secondary-alt">{col.confidence}%</span>
                  </span>
                </td>
                <td className="px-token-3 py-token-2">
                  <button type="button" role="switch" aria-checked={col.nullable} aria-label={`Nullable: ${col.name}`} onClick={() => onToggleNullable(col.idx)} className={`text-token-meta font-medium ${col.nullable ? 'text-primary' : 'text-text-faint'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>
                    {col.nullable ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-token-3 py-token-2 font-mono text-token-meta text-text-secondary-alt">{col.defaultValue}</td>
                <td className="px-token-3 py-token-2"><StatusPill status={col.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function StatusPill({ status }) {
  const map = {
    Detected: 'border-success bg-success-bg text-success',
    Review: 'border-warning bg-warning-bg text-warning-strong',
    Error: 'border-danger-border bg-danger-bg text-danger',
    Passed: 'border-success bg-success-bg text-success',
    Warning: 'border-warning bg-warning-bg text-warning-strong',
  };
  return (
    <span className={`inline-flex rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${map[status] ?? 'border-border bg-surface-muted text-text-secondary-alt'}`}>
      {status}
    </span>
  );
}

/* ---- Section 5: Data Preview ---------------------------------------- */
function DataPreview({ query, setQuery, rows }) {
  const searchAction = (
    <div className="flex items-center gap-token-2">
      <label htmlFor="preview-search" className="sr-only">Search preview rows</label>
      <input
        id="preview-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search rows…"
        className="h-8 w-40 rounded-md border border-border bg-surface-card px-token-3 text-token-meta text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      />
    </div>
  );
  return (
    <Section index={5} title="Data Preview" description={`Showing ${rows.length} of ${PREVIEW_TOTAL_ROWS.toLocaleString()} rows.`} badge={<SampleBadge />} actions={searchAction}>
      <div className="mt-token-5 overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-token-meta">
          <caption className="sr-only">Parsed data preview</caption>
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="px-token-3 py-token-2 font-semibold">#</th>
              {PREVIEW_COLUMNS.map((col) => (
                <th key={col.key} scope="col" className="whitespace-nowrap px-token-3 py-token-2 font-semibold">
                  {col.label}
                  <span className="ml-token-1 font-normal normal-case text-text-faint">{col.type}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={PREVIEW_COLUMNS.length + 1} className="px-token-3 py-token-6 text-center text-text-faint">
                  No preview rows match “{query}”.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._n} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-3 py-token-2 text-text-faint">{row._n}</td>
                  {PREVIEW_COLUMNS.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-token-3 py-token-2 font-mono text-text-primary-alt">
                      {row[col.key] ?? <span className="text-text-faint">—</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ---- Section 6: Data Quality Validation ----------------------------- */
function DataQuality() {
  return (
    <Section index={6} title="Data Quality Validation" description="Row-level checks run during parsing." badge={<SampleBadge />}>
      <div className="mt-token-5 grid grid-cols-2 gap-token-3 sm:grid-cols-3">
        {QUALITY_METRICS.map((m) => (
          <div key={m.key} className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3">
            <p className={`m-0 text-token-lg font-bold ${m.tone === 'success' ? 'text-success' : m.tone === 'warning' ? 'text-warning-strong' : 'text-text-primary-alt'}`}>
              {m.count.toLocaleString()}
            </p>
            <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{m.label}</p>
            <p className="m-0 text-token-meta text-text-faint">{m.pct}</p>
          </div>
        ))}
      </div>
      <div className="mt-token-4 overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-token-sm">
          <caption className="sr-only">Data quality checks</caption>
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Check</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Status</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Count</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Impact</th>
              <th scope="col" className="px-token-3 py-token-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {QUALITY_CHECKS.map((c) => (
              <tr key={c.key} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-3 py-token-2 font-medium text-text-primary-alt">{c.label}</td>
                <td className="px-token-3 py-token-2"><StatusPill status={c.status} /></td>
                <td className="px-token-3 py-token-2 text-text-secondary-alt">{c.count}</td>
                <td className="px-token-3 py-token-2 text-text-secondary-alt">{c.impact}</td>
                <td className="px-token-3 py-token-2">
                  {c.action ? (
                    <button type="button" aria-label={`${c.action}: ${c.label}`} className="text-token-meta font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      {c.action}
                    </button>
                  ) : (
                    <span className="text-token-meta text-text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong" role="status">
        <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
        Duplicate rows detected on key <span className="font-mono">{DUPLICATE_KEY_COLUMN}</span>. Choose a duplicate-handling strategy in Import Configuration.
      </p>
    </Section>
  );
}
/* ---- Radio-card group (Write Mode / Duplicate Handling) ------------- */
function RadioCards({ legend, name, options, value, onChange }) {
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
    const current = order.indexOf(value);
    const base = current === -1 ? 0 : current;
    select(order[(base + delta + order.length) % order.length]);
  };
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">{legend}</legend>
      <div ref={ref} role="radiogroup" aria-label={legend} onKeyDown={onKeyDown} className="grid grid-cols-1 gap-token-2 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              name={name}
              data-radio-id={opt.id}
              aria-checked={selected}
              tabIndex={selected || (value == null && opt.id === order[0]) ? 0 : -1}
              onClick={() => select(opt.id)}
              className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
            >
              <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{opt.title}</span>
              <span className="text-token-meta text-text-faint">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ---- Section 7: Destination Configuration --------------------------- */
function DestinationConfiguration({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={7} title="Destination Configuration" description="Where the parsed rows are written.">
      <FieldGrid>
        <Field id="field-targetDataSource" label="Target Data Source" required error={showError('targetDataSource') ? errors.targetDataSource : null}>
          {(db) => <SelectInput id="field-targetDataSource" required value={form.targetDataSource} onChange={(v) => setField('targetDataSource', v)} onBlur={() => markTouched('targetDataSource')} invalid={showError('targetDataSource')} describedBy={db} options={DESTINATION_OPTIONS.targetDataSource} placeholder="Select a destination…" />}
        </Field>
        <Field id="field-targetSchema" label="Target Schema" required error={showError('targetSchema') ? errors.targetSchema : null}>
          {(db) => <SelectInput id="field-targetSchema" required value={form.targetSchema} onChange={(v) => setField('targetSchema', v)} onBlur={() => markTouched('targetSchema')} invalid={showError('targetSchema')} describedBy={db} options={DESTINATION_OPTIONS.targetSchema} />}
        </Field>
        <Field id="field-tableName" label="Table Name" required error={showError('tableName') ? errors.tableName : null} hint="Destination table identifier.">
          {(db) => <TextInput id="field-tableName" required value={form.tableName} onChange={(v) => setField('tableName', v)} onBlur={() => markTouched('tableName')} invalid={showError('tableName')} describedBy={db} placeholder="q4_sales_report_2024" />}
        </Field>
        <Field id="field-dataset" label="Dataset / Collection" hint="Optional logical grouping.">
          {(db) => <TextInput id="field-dataset" value={form.dataset} onChange={(v) => setField('dataset', v)} describedBy={db} placeholder="sales_data_imports" />}
        </Field>
      </FieldGrid>
      <div className="mt-token-4">
        <RadioCards legend="Write Mode" name="writeMode" options={WRITE_MODES} value={form.writeMode} onChange={(v) => setField('writeMode', v)} />
      </div>
    </Section>
  );
}

/* ---- Section 8: Import Configuration -------------------------------- */
function ImportConfiguration({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={8} title="Import Configuration" description="Batching, error handling, duplicates, and scheduling.">
      <FieldGrid>
        <Field id="field-batchSize" label="Batch Size" error={showError('batchSize') ? errors.batchSize : null} hint="Rows per insert batch.">
          {(db) => <TextInput id="field-batchSize" inputMode="numeric" value={form.batchSize} onChange={(v) => setField('batchSize', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('batchSize')} invalid={showError('batchSize')} describedBy={db} placeholder="10000" />}
        </Field>
        <Field id="field-commitInterval" label="Commit Interval" error={showError('commitInterval') ? errors.commitInterval : null} hint="Rows between commits.">
          {(db) => <TextInput id="field-commitInterval" inputMode="numeric" value={form.commitInterval} onChange={(v) => setField('commitInterval', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('commitInterval')} invalid={showError('commitInterval')} describedBy={db} placeholder="5000" />}
        </Field>
        <Field id="field-errorThreshold" label="Error Threshold" error={showError('errorThreshold') ? errors.errorThreshold : null} hint="Abort after this many row errors.">
          {(db) => <TextInput id="field-errorThreshold" inputMode="numeric" value={form.errorThreshold} onChange={(v) => setField('errorThreshold', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('errorThreshold')} invalid={showError('errorThreshold')} describedBy={db} placeholder="100" />}
        </Field>
        <Field id="field-importPriority" label="Import Priority">
          {(db) => <SelectInput id="field-importPriority" value={form.importPriority} onChange={(v) => setField('importPriority', v)} describedBy={db} options={DESTINATION_OPTIONS.importPriority} />}
        </Field>
        <Field id="field-scheduling" label="Scheduling" className="sm:col-span-2">
          {(db) => <SelectInput id="field-scheduling" value={form.scheduling} onChange={(v) => setField('scheduling', v)} describedBy={db} options={DESTINATION_OPTIONS.scheduling} />}
        </Field>
      </FieldGrid>
      <div className="mt-token-4">
        <RadioCards legend={`Duplicate Handling (key: ${DUPLICATE_KEY_COLUMN})`} name="duplicateStrategy" options={DUPLICATE_STRATEGIES} value={form.duplicateStrategy} onChange={(v) => setField('duplicateStrategy', v)} />
      </div>
    </Section>
  );
}

/* ---- Section 9: Metadata & Governance ------------------------------- */
function Governance({ form, setField, showError, markTouched, errors, tagDraft, setTagDraft, onAddTag, onRemoveTag, onToggleCompliance }) {
  return (
    <Section index={9} title="Metadata &amp; Governance" description="Ownership, classification, retention, and compliance.">
      <FieldGrid>
        <Field id="field-owner" label="Dataset Owner" required error={showError('owner') ? errors.owner : null}>
          {(db) => <SelectInput id="field-owner" required value={form.owner} onChange={(v) => setField('owner', v)} onBlur={() => markTouched('owner')} invalid={showError('owner')} describedBy={db} options={GOVERNANCE_OPTIONS.owner} placeholder="Select an owner…" />}
        </Field>
        <Field id="field-businessDomain" label="Business Domain">
          {(db) => <SelectInput id="field-businessDomain" value={form.businessDomain} onChange={(v) => setField('businessDomain', v)} describedBy={db} options={GOVERNANCE_OPTIONS.businessDomain} />}
        </Field>
        <Field id="field-department" label="Department">
          {(db) => <SelectInput id="field-department" value={form.department} onChange={(v) => setField('department', v)} describedBy={db} options={GOVERNANCE_OPTIONS.department} />}
        </Field>
        <Field id="field-dataClassification" label="Data Classification">
          {(db) => <SelectInput id="field-dataClassification" value={form.dataClassification} onChange={(v) => setField('dataClassification', v)} describedBy={db} options={GOVERNANCE_OPTIONS.dataClassification} />}
        </Field>
        <Field id="field-sensitivityLevel" label="Sensitivity Level">
          {(db) => <SelectInput id="field-sensitivityLevel" value={form.sensitivityLevel} onChange={(v) => setField('sensitivityLevel', v)} describedBy={db} options={GOVERNANCE_OPTIONS.sensitivityLevel} />}
        </Field>
        <Field id="field-retentionPolicy" label="Retention Policy">
          {(db) => <SelectInput id="field-retentionPolicy" value={form.retentionPolicy} onChange={(v) => setField('retentionPolicy', v)} describedBy={db} options={GOVERNANCE_OPTIONS.retentionPolicy} />}
        </Field>
      </FieldGrid>

      <div className="mt-token-4 flex flex-col gap-token-1">
        <label htmlFor="field-tagDraft" className="text-token-sm font-medium text-text-secondary-alt">Tags</label>
        <div className="flex flex-wrap items-center gap-token-2">
          {form.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-token-1 rounded-sm border border-border bg-surface-muted px-token-2 py-0.5 text-token-meta text-text-primary-alt">
              {tag}
              <button type="button" onClick={() => onRemoveTag(tag)} aria-label={`Remove tag ${tag}`} className="text-text-faint hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary">
                <IconX className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-token-1 flex items-center gap-token-2">
          <input
            id="field-tagDraft"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
            placeholder="Add a tag and press Enter"
            className={fieldBase}
          />
          <button type="button" onClick={onAddTag} className="flex h-9 shrink-0 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Add
          </button>
        </div>
      </div>

      <fieldset className="mt-token-4 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">Compliance Frameworks</legend>
        <div className="flex flex-wrap gap-token-2">
          {COMPLIANCE_FRAMEWORKS.map((fw) => {
            const on = form.compliance.includes(fw);
            return (
              <button
                key={fw}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onToggleCompliance(fw)}
                className={`inline-flex items-center gap-token-2 rounded-md border px-token-3 py-token-2 text-token-meta font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? 'border-primary bg-shell-accent-wash text-primary' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'}`}
              >
                {on && <IconCheck className="h-3 w-3 shrink-0" />}
                {fw}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-token-4 flex flex-col gap-token-1">
        <label htmlFor="field-notes" className="text-token-sm font-medium text-text-secondary-alt">Documentation / Notes</label>
        <textarea
          id="field-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Describe the dataset, its source system, and any caveats."
          className="w-full rounded-md border border-border bg-surface-card px-3 py-2 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        />
      </div>
    </Section>
  );
}
/* ---- Sidebar: Upload Summary ---------------------------------------- */
function UploadSummary({ form }) {
  const file = form.file;
  const rows = [
    { label: 'File', value: file?.name ?? '—' },
    { label: 'Size', value: file?.sizeLabel ?? '—' },
    { label: 'Rows', value: file ? file.totalRows.toLocaleString() : '—' },
    { label: 'Columns', value: file ? String(file.totalColumns) : '—' },
    { label: 'Destination', value: form.targetDataSource || 'Not selected' },
    { label: 'Table', value: form.tableName.trim() || '—' },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Upload Summary</h2>
        <span className={`inline-flex items-center gap-token-1 rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${file ? 'border-success bg-success-bg text-success' : 'border-border bg-surface-muted text-text-secondary-alt'}`}>
          {file ? 'Ready' : 'No file'}
        </span>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-token-3">
            <dt className="text-token-meta text-text-faint">{row.label}</dt>
            <dd className="m-0 max-w-[60%] truncate text-right text-token-sm font-medium text-text-primary-alt" title={row.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Sidebar: Data Quality Overview --------------------------------- */
function DataQualityOverview() {
  const warnings = QUALITY_CHECKS.filter((c) => c.status === 'Warning').length;
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Data Quality Overview</h2>
        <span className={`rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${warnings > 0 ? 'border-warning bg-warning-bg text-warning-strong' : 'border-success bg-success-bg text-success'}`}>
          {warnings} warning{warnings === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {QUALITY_METRICS.map((m) => (
          <li key={m.key} className="flex items-center justify-between text-token-meta">
            <span className="text-text-secondary-alt">{m.label}</span>
            <span className={`font-medium ${m.tone === 'success' ? 'text-success' : m.tone === 'warning' ? 'text-warning-strong' : 'text-text-primary-alt'}`}>
              {m.count.toLocaleString()} · {m.pct}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Sidebar: Import Readiness -------------------------------------- */
function ImportReadiness({ pct }) {
  const label = pct === 100 ? 'Ready' : pct >= 80 ? 'Mostly Ready' : pct >= 40 ? 'In Progress' : 'Getting Started';
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Import Readiness</h2>
        <span className="text-token-sm font-bold text-primary">{pct}%</span>
      </div>
      <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Import readiness">
        <span className={`block h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">{label}</p>
    </section>
  );
}

/* ---- Sidebar: Validation Status ------------------------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Validation Status</h2>
        <span className="text-token-meta font-medium text-text-secondary-alt">{completedCount}/{total}</span>
      </div>
      <ul className="mt-token-4 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-start gap-token-2 text-token-sm">
            {item.done ? <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> : <IconCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />}
            <span className="flex flex-col">
              <span className={item.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{item.label}</span>
              {!item.done && item.pending && <span className="text-token-meta text-warning-strong">{item.pending}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Sidebar: Import Estimate --------------------------------------- */
function ImportEstimate({ form }) {
  const valid = QUALITY_METRICS.find((m) => m.key === 'valid')?.count ?? 0;
  const skipped = QUALITY_METRICS.find((m) => m.key === 'duplicate')?.count ?? 0;
  const batchSize = Number(form.batchSize) || 10000;
  const batches = Math.max(1, Math.ceil(valid / batchSize));
  const rows = [
    { label: 'Records to import', value: valid.toLocaleString() },
    { label: 'Rows skipped (duplicate)', value: skipped.toLocaleString() },
    { label: 'Batches', value: String(batches) },
    { label: 'Estimated time', value: '4–8 min' },
    { label: 'Estimated size', value: '~82 MB' },
    { label: 'Target', value: form.targetSchema && form.tableName.trim() ? `${form.targetSchema}.${form.tableName.trim()}` : '—' },
  ];
  return (
    <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Import Estimate</h2>
        <SampleBadge />
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-token-3">
            <dt className="text-token-meta text-text-faint">{row.label}</dt>
            <dd className="m-0 max-w-[55%] truncate text-right text-token-sm font-medium text-text-primary-alt" title={row.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Confirm dialog (focus-trapped) --------------------------------- */
function ConfirmDialog({ form, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => {
    cancelRef.current?.focus();

    function getFocusable() {
      return dialogRef.current
        ? Array.from(dialogRef.current.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        : [];
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [onCancel]);

  const valid = QUALITY_METRICS.find((m) => m.key === 'valid')?.count ?? 0;
  const skipped = QUALITY_METRICS.find((m) => m.key === 'duplicate')?.count ?? 0;
  const warningChecks = QUALITY_CHECKS.filter((c) => c.status === 'Warning');
  const warningLabels = warningChecks.map((c) => c.label.toLowerCase()).join(' + ');
  const rows = [
    { label: 'File', value: form.file?.name ?? '—' },
    { label: 'Target', value: form.targetDataSource || '—' },
    { label: 'Table', value: `${form.targetSchema}.${form.tableName.trim() || '—'}` },
    { label: 'Write mode', value: WRITE_MODES.find((w) => w.id === form.writeMode)?.title ?? form.writeMode },
    { label: 'Duplicates', value: DUPLICATE_STRATEGIES.find((d) => d.id === form.duplicateStrategy)?.title ?? form.duplicateStrategy },
    { label: 'Records', value: `${valid.toLocaleString()} (${skipped.toLocaleString()} skipped)` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-csv-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-csv-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Import</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the destination and import options before starting.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <dl className="mt-token-5 grid grid-cols-1 gap-token-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-token-2">
              <dt className="text-token-meta text-text-faint">{row.label}</dt>
              <dd className="m-0 max-w-[62%] truncate text-right text-token-meta font-medium text-text-primary-alt" title={row.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-token-4 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-3" role="status">
          <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-strong" />
          <p className="m-0 text-token-meta text-warning-strong">
            {warningChecks.length} data-quality warning{warningChecks.length === 1 ? '' : 's'} remain ({warningLabels}). The selected duplicate strategy will be applied during import.
          </p>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconImport />}
            {submitting ? 'Starting…' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor SVGs) ------------------------------- */
function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function IconCircle({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

function IconAlert({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg viewBox="0 0 16 16" className="block h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Z" />
      <path d="M9 1.5V5.5H13" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 16 16" className="block h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10.5V2.5M8 2.5 5 5.5M8 2.5l3 3M2.5 11v1.5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V11" />
    </svg>
  );
}

function IconImport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8M8 10 5 7M8 10l3-3M2.5 12.5h11" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 2a6 6 0 1 0 6 6" />
    </svg>
  );
}


