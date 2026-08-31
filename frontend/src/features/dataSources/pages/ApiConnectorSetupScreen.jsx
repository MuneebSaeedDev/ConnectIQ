import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  HTTP_METHODS,
  RESPONSE_FORMATS,
  API_CONNECTOR_OPTIONS,
  API_AUTH_METHODS,
  API_AUTH_FIELD_MAP,
  API_KEY_LOCATIONS,
  PAGINATION_STRATEGIES,
  PAGINATION_FIELD_MAP,
  RETRY_POLICY_OPTIONS,
  SAMPLE_RECORD_PATHS,
  ORG_ID,
  createApiConnector,
  sendTestRequest,
} from '../services/apiConnectorSetup.api';

/* Field styling — mirrors SCR-046's AddDataSourceScreen so the MOD-006
   forms read identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

/** Empty form — seeded with a representative REST example (mirrors the frame). */
const INITIAL_FORM = {
  // 1. General Information
  name: '',
  environment: 'Production',
  category: 'Analytics',
  description: '',
  // 2. Request Configuration
  baseUrl: '',
  method: 'GET',
  path: '/v2/records',
  responseFormat: 'JSON',
  headers: [{ key: 'Accept', value: 'application/json' }],
  queryParams: [{ key: '', value: '' }],
  // 3. Authentication
  authMethod: 'API Key',
  apiKeyName: 'X-API-Key',
  apiKeyValue: '',
  apiKeyLocation: 'Header',
  bearerToken: '',
  basicUsername: '',
  basicPassword: '',
  oauthTokenUrl: '',
  oauthClientId: '',
  oauthClientSecret: '',
  oauthScope: '',
  // 4. Pagination
  pagination: 'offset',
  offsetParam: 'offset',
  limitParam: 'limit',
  pageParam: 'page',
  pageSizeParam: 'pageSize',
  cursorParam: 'cursor',
  cursorPath: 'meta.next_cursor',
  pageSize: '100',
  // 5. Rate Limiting & Reliability
  requestsPerMinute: '600',
  concurrency: '4',
  timeoutSeconds: '30',
  retryPolicy: 'Exponential backoff (3 retries)',
  respectRetryAfter: true,
  // 6. Response Mapping
  recordPath: 'data',
  incrementalSync: true,
  incrementalField: 'created_at',
  primaryKeyField: 'id',
  // 7. Metadata & Governance
  owner: 'alice.chen@company.com',
  dataClassification: 'Confidential',
  tags: '',
  verifyTls: true,
};

/* Which pagination fields the selected strategy needs. */
function paginationFieldsFor(strategy) {
  return PAGINATION_FIELD_MAP[strategy] ?? [];
}

/* Required fields per the REST-connector contract, plus auth- and
   pagination-strategy-aware requirements. */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Connector name is required.';

  if (!form.baseUrl.trim()) errors.baseUrl = 'Base URL is required.';
  else if (!URL_PATTERN.test(form.baseUrl.trim())) errors.baseUrl = 'Enter a valid http(s) URL.';

  const authFields = API_AUTH_FIELD_MAP[form.authMethod] ?? [];
  for (const f of authFields) {
    if (f === 'apiKeyLocation' || f === 'oauthScope') continue; // have safe defaults / optional
    if (!String(form[f] ?? '').trim()) {
      errors[f] = 'This credential is required for the selected authentication method.';
    }
  }

  const pageFields = paginationFieldsFor(form.pagination);
  if (pageFields.includes('pageSize')) {
    const size = Number(form.pageSize);
    if (!form.pageSize.trim()) errors.pageSize = 'Page size is required.';
    else if (!Number.isInteger(size) || size < 1 || size > 10000) errors.pageSize = 'Page size must be 1–10000.';
  }

  const rpm = Number(form.requestsPerMinute);
  if (!form.requestsPerMinute.trim()) errors.requestsPerMinute = 'Set a request rate limit.';
  else if (!Number.isInteger(rpm) || rpm < 1) errors.requestsPerMinute = 'Enter a positive requests-per-minute value.';

  const timeout = Number(form.timeoutSeconds);
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 600) errors.timeoutSeconds = 'Timeout must be 1–600 seconds.';

  if (!form.recordPath.trim()) errors.recordPath = 'A record path is required to extract rows.';

  if (form.incrementalSync && !form.incrementalField.trim()) {
    errors.incrementalField = 'Provide the cursor field for incremental sync.';
  }
  return errors;
}

/* The Validation Status checklist. "Response Mapped" is satisfied once a
   test request has succeeded (the mapping is proven against a real body). */
function computeChecklist(form, tested) {
  const authFields = (API_AUTH_FIELD_MAP[form.authMethod] ?? []).filter((f) => f !== 'apiKeyLocation' && f !== 'oauthScope');
  const authOk = form.authMethod === 'None' || authFields.every((f) => String(form[f] ?? '').trim());
  return [
    { key: 'general', label: 'General Information', done: !!form.name.trim() },
    { key: 'request', label: 'Request Configured', done: !!form.baseUrl.trim() && URL_PATTERN.test(form.baseUrl.trim()) },
    { key: 'auth', label: 'Authentication Provided', done: authOk },
    { key: 'pagination', label: 'Pagination Set', done: form.pagination === 'none' || !!form.pageSize.trim() },
    { key: 'tested', label: 'Test Request Succeeded', done: tested },
    { key: 'mapping', label: 'Response Mapped', done: tested && !!form.recordPath.trim() },
    { key: 'governance', label: 'Metadata & Governance', done: !!form.owner && !!form.dataClassification },
  ];
}

/** SCR-049 — API Connector Setup Screen. Node 116:33009, Figma page "Page 1". */
export default function ApiConnectorSetupScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [testState, setTestState] = useState({ status: 'idle', result: null, mocked: false });

  const errors = useMemo(() => validate(form), [form]);
  const tested = testState.status === 'success';
  const checklist = useMemo(() => computeChecklist(form, tested), [form, tested]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  /* Any change to the request shape (URL, auth, pagination, headers, query
     params) invalidates a prior test result — the proven body no longer
     matches what the connector would now send. */
  function invalidateTest() {
    if (testState.status !== 'idle') setTestState({ status: 'idle', result: null, mocked: false });
  }
  function setFieldInvalidatingTest(key, value) {
    setField(key, value);
    invalidateTest();
  }

  function updatePair(listKey, index, field, value) {
    setForm((prev) => {
      const next = prev[listKey].map((row, i) => (i === index ? { ...row, [field]: value } : row));
      return { ...prev, [listKey]: next };
    });
    invalidateTest();
  }
  function addPair(listKey) {
    setForm((prev) => ({ ...prev, [listKey]: [...prev[listKey], { key: '', value: '' }] }));
    invalidateTest();
  }
  function removePair(listKey, index) {
    setForm((prev) => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
    invalidateTest();
  }

  async function handleTestRequest() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await sendTestRequest(ORG_ID, buildPayload(form));
    setTestState({ status: result.success ? 'success' : 'error', result, mocked: !!result.mocked });
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

  async function handleConfirmCreate() {
    setSubmitState({ status: 'submitting', message: '' });
    const result = await createApiConnector(ORG_ID, buildPayload(form));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the API connector, validate the endpoint, and begin scheduled ingestion.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'API connector created.' });
      navigate('/data-sources');
    }
  }

  const recordPathOptions = useMemo(() => {
    const detected = testState.result?.body ? SAMPLE_RECORD_PATHS : [];
    return Array.from(new Set([form.recordPath, 'data', ...detected].filter(Boolean)));
  }, [testState.result, form.recordPath]);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'API Connector Setup']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/data-sources/new')} isValid={isValid} submitted={submitState.status === 'mocked'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating API connector'
            : submitState.status === 'mocked'
              ? 'API connector simulated — no backend available'
              : testState.status === 'testing'
                ? 'Sending test request'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated API connector (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <GeneralInformation form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <RequestConfiguration
              form={form}
              setField={setFieldInvalidatingTest}
              showError={showError}
              markTouched={markTouched}
              errors={errors}
              testState={testState}
              onTest={handleTestRequest}
              updatePair={updatePair}
              addPair={addPair}
              removePair={removePair}
            />
            <Authentication form={form} setField={setFieldInvalidatingTest} showError={showError} markTouched={markTouched} errors={errors} />
            <Pagination form={form} setField={setFieldInvalidatingTest} showError={showError} markTouched={markTouched} errors={errors} />
            <RateLimiting form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <ResponseMapping form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} tested={tested} recordPathOptions={recordPathOptions} />
            <MetadataGovernance form={form} setField={setField} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <ConnectorSummary form={form} />
            <RequestStatus testState={testState} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <PendingConfiguration checklist={checklist} testState={testState} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources/new')} submitted={submitState.status === 'mocked'} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </AppShell>
  );
}

/* Assemble the create payload from the flat form state. */
function buildPayload(form) {
  const authFields = API_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const credentials = Object.fromEntries(authFields.map((f) => [f, String(form[f] ?? '').trim()]));
  const headers = Object.fromEntries(form.headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value]));
  const queryParams = Object.fromEntries(form.queryParams.filter((q) => q.key.trim()).map((q) => [q.key.trim(), q.value]));
  const pageFields = paginationFieldsFor(form.pagination);
  const pagination = { strategy: form.pagination };
  for (const f of pageFields) pagination[f] = form[f];
  return {
    general: {
      name: form.name.trim(),
      environment: form.environment,
      category: form.category,
      description: form.description.trim() || null,
    },
    request: {
      baseUrl: form.baseUrl.trim(),
      method: form.method,
      path: form.path.trim() || null,
      responseFormat: form.responseFormat,
      headers,
      queryParams,
    },
    authentication: { method: form.authMethod, credentials },
    pagination,
    reliability: {
      requestsPerMinute: Number(form.requestsPerMinute) || null,
      concurrency: Number(form.concurrency) || null,
      timeoutSeconds: Number(form.timeoutSeconds) || null,
      retryPolicy: form.retryPolicy,
      respectRetryAfter: form.respectRetryAfter,
    },
    mapping: {
      recordPath: form.recordPath.trim(),
      incrementalSync: form.incrementalSync,
      incrementalField: form.incrementalSync ? form.incrementalField.trim() || null : null,
      primaryKeyField: form.primaryKeyField.trim() || null,
    },
    governance: {
      owner: form.owner,
      dataClassification: form.dataClassification,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      verifyTls: form.verifyTls,
    },
  };
}

/* ---- Layout primitives (shared vocabulary with SCR-046) ------------- */

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
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
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

function SelectInput({ id, value, onChange, onBlur, invalid, describedBy, options, required }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`${fieldBase} ${invalid ? fieldInvalid : ''}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function TextArea({ id, value, onChange, describedBy, rows = 3, ...rest }) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={describedBy}
      className={`${fieldBase} h-auto py-token-2 leading-snug`}
      {...rest}
    />
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

/* Key/value editor for headers and query params. `fieldLabel` names a single
   row's subject (e.g. "Header") for readable control accessible names, while
   `addLabel` labels the add button (e.g. "Add header"). */
function KeyValueEditor({ listKey, rows, onUpdate, onAdd, onRemove, addLabel, fieldLabel, keyPlaceholder, valuePlaceholder }) {
  return (
    <div className="flex flex-col gap-token-2">
      {rows.map((row, i) => (
        <div key={`${listKey}-${i}`} className="flex items-center gap-token-2">
          <input
            aria-label={`${fieldLabel} ${i + 1} name`}
            value={row.key}
            onChange={(e) => onUpdate(listKey, i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className={`${fieldBase} flex-1`}
          />
          <input
            aria-label={`${fieldLabel} ${i + 1} value`}
            value={row.value}
            onChange={(e) => onUpdate(listKey, i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className={`${fieldBase} flex-1`}
          />
          <button
            type="button"
            onClick={() => onRemove(listKey, i)}
            aria-label={`Remove ${fieldLabel.toLowerCase()} ${i + 1}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-card text-text-faint hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd(listKey)}
        className="flex h-8 w-fit items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-primary hover:bg-shell-accent-wash focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <IconPlus /> {addLabel}
      </button>
    </div>
  );
}

/* ---- Header & action bar -------------------------------------------- */

function Header({ onCancel, isValid, submitted }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">API Connector Setup</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Configure a REST/HTTP API as a data source — request shape, authentication, pagination, rate limiting, and response mapping.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="button" disabled title="Saving drafts requires MOD-006's data-source endpoint (still PLANNED)." className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Save Draft
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Connector already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Connector
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
        {isValid ? 'All required fields completed · Ready to create' : `${completedCount} of ${total} configuration steps complete`}
      </span>
      <div className="flex items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Connector already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Connector
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: General Information --------------------------------- */
function GeneralInformation({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={1} title="General Information" description="Name the connector and classify it.">
      <Field id="field-name" label="Connector Name" required error={showError('name') ? errors.name : null} hint="A unique, human-readable name for this API source.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="Billing API — Production" />}
      </Field>
      <Field id="field-environment" label="Environment">
        {(db) => <SelectInput id="field-environment" value={form.environment} onChange={(v) => setField('environment', v)} describedBy={db} options={API_CONNECTOR_OPTIONS.environment} />}
      </Field>
      <Field id="field-category" label="Category">
        {(db) => <SelectInput id="field-category" value={form.category} onChange={(v) => setField('category', v)} describedBy={db} options={API_CONNECTOR_OPTIONS.category} />}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2">
        {(db) => <TextArea id="field-description" value={form.description} onChange={(v) => setField('description', v)} describedBy={db} placeholder="What this API returns and how it is used…" />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Request Configuration ------------------------------- */
function RequestConfiguration({ form, setField, showError, markTouched, errors, testState, onTest, updatePair, addPair, removePair }) {
  const testing = testState.status === 'testing';
  const testAction = (
    <button
      type="button"
      onClick={onTest}
      disabled={testing}
      className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {testing ? <IconSpinner /> : <IconPlug />}
      {testing ? 'Sending…' : 'Send Test Request'}
    </button>
  );
  return (
    <Section index={2} title="Request Configuration" description="The endpoint and HTTP request the connector issues." actions={testAction}>
      <Field id="field-baseUrl" label="Base URL" required error={showError('baseUrl') ? errors.baseUrl : null} className="sm:col-span-2">
        {(db) => <TextInput id="field-baseUrl" required value={form.baseUrl} onChange={(v) => setField('baseUrl', v)} onBlur={() => markTouched('baseUrl')} invalid={showError('baseUrl')} describedBy={db} placeholder="https://api.company.com" />}
      </Field>
      <Field id="field-method" label="Method">
        {(db) => <SelectInput id="field-method" value={form.method} onChange={(v) => setField('method', v)} describedBy={db} options={HTTP_METHODS} />}
      </Field>
      <Field id="field-responseFormat" label="Response Format">
        {(db) => <SelectInput id="field-responseFormat" value={form.responseFormat} onChange={(v) => setField('responseFormat', v)} describedBy={db} options={RESPONSE_FORMATS} />}
      </Field>
      <Field id="field-path" label="Resource Path" className="sm:col-span-2" hint="Appended to the base URL for the ingestion request.">
        {(db) => <TextInput id="field-path" value={form.path} onChange={(v) => setField('path', v)} describedBy={db} placeholder="/v2/records" />}
      </Field>
      <div className="sm:col-span-2">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Headers</p>
        <KeyValueEditor listKey="headers" rows={form.headers} onUpdate={updatePair} onAdd={addPair} onRemove={removePair} addLabel="Add header" fieldLabel="Header" keyPlaceholder="Header name" valuePlaceholder="Value" />
      </div>
      <div className="sm:col-span-2">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Query Parameters</p>
        <KeyValueEditor listKey="queryParams" rows={form.queryParams} onUpdate={updatePair} onAdd={addPair} onRemove={removePair} addLabel="Add parameter" fieldLabel="Query parameter" keyPlaceholder="Parameter" valuePlaceholder="Value" />
      </div>
      {testState.status !== 'idle' && testState.status !== 'testing' && (
        <div className="sm:col-span-2">
          <TestResultPanel testState={testState} />
        </div>
      )}
    </Section>
  );
}

function TestResultPanel({ testState }) {
  const { result, status, mocked } = testState;
  const ok = status === 'success';
  const checks = result?.checks ?? [];
  return (
    <div className={`rounded-md border p-token-4 ${ok ? 'border-success bg-success-bg' : 'border-danger-border bg-danger-bg'}`} role={ok ? 'status' : 'alert'}>
      <div className="flex flex-wrap items-center justify-between gap-token-2">
        <span className={`flex items-center gap-token-2 text-token-sm font-semibold ${ok ? 'text-success' : 'text-danger'}`}>
          {ok ? <IconCheck className="h-3.5 w-3.5 shrink-0" /> : <IconX className="h-3.5 w-3.5 shrink-0" />}
          {ok ? `Request succeeded${result?.statusCode ? ` · ${result.statusCode}` : ''}` : 'Request failed'}
        </span>
        {mocked && <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample data</span>}
      </div>
      <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center gap-token-2 text-token-meta text-text-primary-alt">
            {c.ok ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconX className="h-3 w-3 shrink-0 text-danger" />}
            {c.label}
          </li>
        ))}
      </ul>
      {ok && (
        <dl className="mt-token-3 grid grid-cols-1 gap-token-1 sm:grid-cols-4">
          <div><dt className="text-token-meta text-text-faint">Latency</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.latencyMs != null ? `${result.latencyMs} ms` : '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Records</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.recordCount ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Total</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.totalAvailable ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Rate left</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.rateLimitRemaining ?? '—'}</dd></div>
        </dl>
      )}
      {ok && result?.body && (
        <pre className="mt-token-3 max-h-56 overflow-auto rounded-md border border-border-subtle bg-surface-muted p-token-3 font-mono text-token-meta text-text-primary-alt">
          {JSON.stringify(result.body, null, 2)}
        </pre>
      )}
      {mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no request-test backend yet — this is a simulated response.</p>}
    </div>
  );
}

/* ---- Section 3: Authentication -------------------------------------- */
function Authentication({ form, setField, showError, markTouched, errors }) {
  const fields = API_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const CRED_META = {
    apiKeyName: { label: 'API Key Name', type: 'text', placeholder: 'X-API-Key', autoComplete: 'off' },
    apiKeyValue: { label: 'API Key Value', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    bearerToken: { label: 'Bearer Token', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    basicUsername: { label: 'Username', type: 'text', placeholder: 'api_user', autoComplete: 'username' },
    basicPassword: { label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    oauthTokenUrl: { label: 'Token URL', type: 'text', placeholder: 'https://auth.company.com/oauth/token', autoComplete: 'off' },
    oauthClientId: { label: 'Client ID', type: 'text', placeholder: 'client-id', autoComplete: 'off' },
    oauthClientSecret: { label: 'Client Secret', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    oauthScope: { label: 'Scope', type: 'text', placeholder: 'read:records', autoComplete: 'off' },
  };
  return (
    <Section index={3} title="Authentication" description="How requests to the API are authorized.">
      <Field id="field-authMethod" label="Authentication Method" className="sm:col-span-2">
        {(db) => <SelectInput id="field-authMethod" value={form.authMethod} onChange={(v) => setField('authMethod', v)} describedBy={db} options={API_AUTH_METHODS} />}
      </Field>
      {form.authMethod === 'API Key' && (
        <Field id="field-apiKeyLocation" label="Send Key In">
          {(db) => <SelectInput id="field-apiKeyLocation" value={form.apiKeyLocation} onChange={(v) => setField('apiKeyLocation', v)} describedBy={db} options={API_KEY_LOCATIONS} />}
        </Field>
      )}
      {fields.filter((f) => f !== 'apiKeyLocation').map((f) => {
        const meta = CRED_META[f];
        const optional = f === 'oauthScope';
        return (
          <Field key={f} id={`field-${f}`} label={meta.label} required={!optional} error={showError(f) ? errors[f] : null}>
            {(db) => <TextInput id={`field-${f}`} required={!optional} type={meta.type} value={form[f]} onChange={(v) => setField(f, v)} onBlur={() => markTouched(f)} invalid={showError(f)} describedBy={db} placeholder={meta.placeholder} autoComplete={meta.autoComplete} />}
          </Field>
        );
      })}
      <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
        <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
        Secrets are encrypted at rest and never displayed after saving. Rotate them from the connector's settings.
      </p>
    </Section>
  );
}

/* ---- Section 4: Pagination ------------------------------------------ */
function Pagination({ form, setField, showError, markTouched, errors }) {
  const fields = paginationFieldsFor(form.pagination);
  const radioRefs = useRef([]);
  const PAGE_META = {
    offsetParam: { label: 'Offset Parameter', placeholder: 'offset' },
    limitParam: { label: 'Limit Parameter', placeholder: 'limit' },
    pageParam: { label: 'Page Parameter', placeholder: 'page' },
    pageSizeParam: { label: 'Page Size Parameter', placeholder: 'pageSize' },
    cursorParam: { label: 'Cursor Parameter', placeholder: 'cursor' },
    cursorPath: { label: 'Next-cursor Path', placeholder: 'meta.next_cursor' },
  };
  const selectedIndex = Math.max(0, PAGINATION_STRATEGIES.findIndex((s) => s.id === form.pagination));

  /* Roving-focus radiogroup keyboard handling (WAI-ARIA APG), matching the
     connector radiogroup in SCR-046: one Tab stop, Arrow keys move + select. */
  function onRadioKeyDown(event) {
    const { key } = event;
    const last = PAGINATION_STRATEGIES.length - 1;
    let next = null;
    if (key === 'ArrowRight' || key === 'ArrowDown') next = selectedIndex >= last ? 0 : selectedIndex + 1;
    else if (key === 'ArrowLeft' || key === 'ArrowUp') next = selectedIndex <= 0 ? last : selectedIndex - 1;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setField('pagination', PAGINATION_STRATEGIES[next].id);
    radioRefs.current[next]?.focus();
  }
  return (
    <Section index={4} title="Pagination" description="How the connector walks multi-page responses.">
      <fieldset className="sm:col-span-2 m-0 border-0 p-0">
        <legend id="pagination-legend" className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">Strategy</legend>
        <div role="radiogroup" aria-labelledby="pagination-legend" className="grid grid-cols-1 gap-token-2 sm:grid-cols-2 lg:grid-cols-3">
          {PAGINATION_STRATEGIES.map((s, i) => {
            const selected = form.pagination === s.id;
            return (
              <button
                key={s.id}
                ref={(el) => { radioRefs.current[i] = el; }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onKeyDown={onRadioKeyDown}
                onClick={() => setField('pagination', s.id)}
                className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
              >
                <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{s.name}</span>
                <span className="text-token-meta text-text-faint">{s.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      {fields.filter((f) => f !== 'pageSize').map((f) => {
        const meta = PAGE_META[f];
        return (
          <Field key={f} id={`field-${f}`} label={meta.label}>
            {(db) => <TextInput id={`field-${f}`} value={form[f]} onChange={(v) => setField(f, v)} describedBy={db} placeholder={meta.placeholder} />}
          </Field>
        );
      })}
      {fields.includes('pageSize') && (
        <Field id="field-pageSize" label="Page Size" required error={showError('pageSize') ? errors.pageSize : null} hint="Records requested per page (1–10000).">
          {(db) => <TextInput id="field-pageSize" required inputMode="numeric" value={form.pageSize} onChange={(v) => setField('pageSize', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('pageSize')} invalid={showError('pageSize')} describedBy={db} placeholder="100" />}
        </Field>
      )}
    </Section>
  );
}

/* ---- Section 5: Rate Limiting & Reliability ------------------------- */
function RateLimiting({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={5} title="Rate Limiting & Reliability" description="Throttling, timeouts, and retry behaviour.">
      <Field id="field-requestsPerMinute" label="Requests / Minute" required error={showError('requestsPerMinute') ? errors.requestsPerMinute : null}>
        {(db) => <TextInput id="field-requestsPerMinute" required inputMode="numeric" value={form.requestsPerMinute} onChange={(v) => setField('requestsPerMinute', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('requestsPerMinute')} invalid={showError('requestsPerMinute')} describedBy={db} placeholder="600" />}
      </Field>
      <Field id="field-concurrency" label="Max Concurrency">
        {(db) => <TextInput id="field-concurrency" inputMode="numeric" value={form.concurrency} onChange={(v) => setField('concurrency', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="4" />}
      </Field>
      <Field id="field-timeoutSeconds" label="Request Timeout (seconds)" required error={showError('timeoutSeconds') ? errors.timeoutSeconds : null}>
        {(db) => <TextInput id="field-timeoutSeconds" required inputMode="numeric" value={form.timeoutSeconds} onChange={(v) => setField('timeoutSeconds', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('timeoutSeconds')} invalid={showError('timeoutSeconds')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-retryPolicy" label="Retry Policy">
        {(db) => <SelectInput id="field-retryPolicy" value={form.retryPolicy} onChange={(v) => setField('retryPolicy', v)} describedBy={db} options={RETRY_POLICY_OPTIONS} />}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-respectRetryAfter" checked={form.respectRetryAfter} onChange={(v) => setField('respectRetryAfter', v)} label="Respect Retry-After header" description="Pause requests for the interval the API's 429 response requests." />
      </div>
    </Section>
  );
}

/* ---- Section 6: Response Mapping ------------------------------------ */
function ResponseMapping({ form, setField, showError, markTouched, errors, tested, recordPathOptions }) {
  return (
    <Section index={6} title="Response Mapping" description="Which part of the payload becomes rows, and how syncs advance.">
      {!tested && (
        <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong" role="status">
          <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
          Send a test request to detect the payload shape. The record path can still be set manually below.
        </p>
      )}
      <Field id="field-recordPath" label="Record Path" required error={showError('recordPath') ? errors.recordPath : null} hint="JSON path to the array of records, e.g. data or result.items." className="sm:col-span-2">
        {(db) => (
          <>
            <TextInput id="field-recordPath" required value={form.recordPath} onChange={(v) => setField('recordPath', v)} onBlur={() => markTouched('recordPath')} invalid={showError('recordPath')} describedBy={db} placeholder="data" list="record-path-options" />
            <datalist id="record-path-options">
              {recordPathOptions.map((p) => <option key={p} value={p} />)}
            </datalist>
          </>
        )}
      </Field>
      <Field id="field-primaryKeyField" label="Primary Key Field" hint="Field uniquely identifying each record (dedupe / upsert).">
        {(db) => <TextInput id="field-primaryKeyField" value={form.primaryKeyField} onChange={(v) => setField('primaryKeyField', v)} describedBy={db} placeholder="id" />}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-incrementalSync" checked={form.incrementalSync} onChange={(v) => setField('incrementalSync', v)} label="Incremental Sync" description="Only fetch records changed since the last successful sync." />
      </div>
      {form.incrementalSync && (
        <Field id="field-incrementalField" label="Incremental Cursor Field" required error={showError('incrementalField') ? errors.incrementalField : null} hint="Timestamp/sequence field used as the high-water mark.">
          {(db) => <TextInput id="field-incrementalField" required value={form.incrementalField} onChange={(v) => setField('incrementalField', v)} onBlur={() => markTouched('incrementalField')} invalid={showError('incrementalField')} describedBy={db} placeholder="created_at" />}
        </Field>
      )}
    </Section>
  );
}

/* ---- Section 7: Metadata & Governance ------------------------------- */
function MetadataGovernance({ form, setField }) {
  return (
    <Section index={7} title="Metadata & Governance" description="Ownership, classification, and transport security.">
      <Field id="field-owner" label="Owner">
        {(db) => <SelectInput id="field-owner" value={form.owner} onChange={(v) => setField('owner', v)} describedBy={db} options={API_CONNECTOR_OPTIONS.owner} />}
      </Field>
      <Field id="field-dataClassification" label="Data Classification">
        {(db) => <SelectInput id="field-dataClassification" value={form.dataClassification} onChange={(v) => setField('dataClassification', v)} describedBy={db} options={API_CONNECTOR_OPTIONS.dataClassification} />}
      </Field>
      <Field id="field-tags" label="Tags" className="sm:col-span-2" hint="Comma-separated labels for search and grouping.">
        {(db) => <TextInput id="field-tags" value={form.tags} onChange={(v) => setField('tags', v)} describedBy={db} placeholder="billing, rest, external" />}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-verifyTls" checked={form.verifyTls} onChange={(v) => setField('verifyTls', v)} label="Verify TLS Certificate" description="Reject connections whose certificate cannot be validated." />
      </div>
    </Section>
  );
}

/* ---- Sidebar: Connector Summary ------------------------------------- */
function ConnectorSummary({ form }) {
  const rows = [
    { label: 'Method', value: form.method },
    { label: 'Format', value: form.responseFormat },
    { label: 'Auth', value: form.authMethod },
    { label: 'Pagination', value: PAGINATION_STRATEGIES.find((s) => s.id === form.pagination)?.name ?? '—' },
    { label: 'Rate limit', value: form.requestsPerMinute ? `${form.requestsPerMinute}/min` : '—' },
    { label: 'Owner', value: form.owner ? form.owner.split('@')[0] : '—' },
    { label: 'Classification', value: form.dataClassification },
  ];
  let host = '—';
  try {
    if (form.baseUrl.trim()) host = new URL(form.baseUrl.trim()).host;
  } catch {
    host = form.baseUrl.trim();
  }
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connector Summary</h2>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">API</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled connector'}</p>
          <p className="m-0 truncate text-token-meta text-text-faint" title={host}>{host}</p>
        </div>
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

/* ---- Sidebar: Request Status ---------------------------------------- */
function RequestStatus({ testState }) {
  const map = {
    idle: { dot: 'bg-text-faint', label: 'Not tested', text: 'text-text-secondary-alt' },
    testing: { dot: 'bg-warning', label: 'Sending…', text: 'text-warning-strong' },
    success: { dot: 'bg-success', label: 'Succeeded', text: 'text-success' },
    error: { dot: 'bg-danger', label: 'Failed', text: 'text-danger' },
  };
  const s = map[testState.status] ?? map.idle;
  const r = testState.result;
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Request Status</h2>
      <div className="mt-token-3 flex items-center gap-token-2">
        <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
        <span className={`text-token-sm font-medium ${s.text}`}>{s.label}</span>
        {testState.mocked && <span className="ml-auto rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample</span>}
      </div>
      {testState.status === 'success' && r && (
        <dl className="mt-token-3 flex flex-col gap-token-2">
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Status</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.statusCode ?? '—'}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Latency</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.latencyMs} ms</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Records</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.recordCount ?? '—'}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Rate left</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.rateLimitRemaining ?? '—'}</dd></div>
        </dl>
      )}
      {testState.status === 'idle' && <p className="m-0 mt-token-2 text-token-meta text-text-faint">Run “Send Test Request” to verify the endpoint before creating the connector.</p>}
    </section>
  );
}

/* ---- Sidebar: Validation Status ------------------------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  const pct = Math.round((completedCount / total) * 100);
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Validation Status</h2>
        <span className="text-token-meta font-medium text-text-secondary-alt">{completedCount}/{total}</span>
      </div>
      <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={total} aria-label="Configuration completeness">
        <span className={`block h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-token-4 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-sm">
            {item.done ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <IconX className="h-3.5 w-3.5 shrink-0 text-danger" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Sidebar: Pending Configuration --------------------------------- */
function PendingConfiguration({ checklist, testState }) {
  const pending = checklist.filter((c) => !c.done);
  if (testState.status === 'idle') pending.push({ key: 'test', label: 'Send a test request' });
  return (
    <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Pending Configuration</h2>
      {pending.length === 0 ? (
        <p className="m-0 mt-token-3 flex items-center gap-token-2 text-token-sm text-success">
          <IconCheck className="h-3.5 w-3.5 shrink-0" />
          Everything looks ready to create.
        </p>
      ) : (
        <ul className="mt-token-3 flex flex-col gap-token-2">
          {pending.map((item) => (
            <li key={item.key} className="flex items-start gap-token-2 text-token-meta text-text-secondary-alt">
              <IconCircle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---- Confirm Create dialog ------------------------------------------ */
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

  let host = '—';
  try {
    if (form.baseUrl.trim()) host = new URL(form.baseUrl.trim()).host;
  } catch {
    host = form.baseUrl.trim();
  }
  const rows = [
    { label: 'Method', value: `${form.method} ${form.path || ''}`.trim() },
    { label: 'Auth', value: form.authMethod },
    { label: 'Pagination', value: PAGINATION_STRATEGIES.find((s) => s.id === form.pagination)?.name ?? '—' },
    { label: 'Record path', value: form.recordPath || '—' },
    { label: 'Owner', value: form.owner || '—' },
    { label: 'Classification', value: form.dataClassification },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-api-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-api-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm API Connector</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the configuration before registering the connector.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-token-5 flex items-center gap-token-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">API</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled connector'}</p>
            <p className="m-0 truncate text-token-meta text-text-faint" title={host}>{host}</p>
          </div>
        </div>
        <dl className="mt-token-5 grid grid-cols-2 gap-x-token-4 gap-y-token-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-token-2">
              <dt className="text-token-meta text-text-faint">{row.label}</dt>
              <dd className="m-0 max-w-[60%] truncate text-right text-token-meta font-medium text-text-primary-alt" title={row.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-token-4 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-3">
          <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            <p className="m-0 text-token-meta font-semibold text-primary">What happens next</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
              The connector is registered and its endpoint validated. {form.incrementalSync ? 'Incremental syncs advance on the configured cursor field.' : 'Each sync performs a full fetch.'}
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconPlug />}
            {submitting ? 'Creating…' : 'Create Connector'}
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

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3M8 5.5h.01" />
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

function IconPlus() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

function IconPlug() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2v3M11 2v3M4 5h8v2a4 4 0 0 1-8 0V5ZM8 11v3" />
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
