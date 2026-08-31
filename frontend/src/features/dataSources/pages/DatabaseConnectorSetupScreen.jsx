import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  DATABASE_ENGINES,
  ENGINES_BY_ID,
  DATABASE_OPTIONS,
  DB_AUTH_FIELD_MAP,
  ORG_ID,
  createDatabaseSource,
  testDatabaseConnection,
} from '../services/databaseConnector.api';

/* Field styling — mirrors SCR-046 AddDataSourceScreen so the data-source
   forms read identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const HOSTNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;
/* Loose mongodb+srv / mongodb URI check for the document-engine option. */
const MONGO_URI_PATTERN = /^mongodb(\+srv)?:\/\/[^\s]+$/i;

/** Empty form — seeded with the PostgreSQL example. */
const INITIAL_FORM = {
  // 1. General
  name: '',
  engineId: 'postgresql',
  environment: 'Production',
  // 2. Connection
  useConnectionString: false,
  connectionString: '',
  host: '',
  port: '5432',
  database: 'postgres',
  // MongoDB-specific
  replicaSet: '',
  authSource: 'admin',
  readPreference: 'primary',
  // 3. Authentication
  authMethod: 'Username & Password',
  username: '',
  password: '',
  iamRole: '',
  clientCert: '',
  // 4. Security & options
  useSsl: true,
  sslMode: 'require',
  verifyServerCert: true,
  connectionTimeout: '30',
  maxPoolSize: '10',
  readOnly: true,
};

/* Credential field metadata for the auth section. */
const CRED_META = {
  username: { label: 'Username', type: 'text', placeholder: 'service_account', autoComplete: 'username' },
  password: { label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  iamRole: { label: 'IAM Role ARN', type: 'text', placeholder: 'arn:aws:iam::123456789012:role/…', autoComplete: 'off' },
  clientCert: { label: 'Client Certificate', type: 'text', placeholder: '-----BEGIN CERTIFICATE-----', autoComplete: 'off' },
};

/* Connector-aware required-field validation. */
function validate(form) {
  const errors = {};
  const engine = ENGINES_BY_ID[form.engineId] ?? null;
  if (!form.name.trim()) errors.name = 'Connection name is required.';
  if (!form.engineId) errors.engineId = 'Select a database engine.';

  const usingUri = form.useConnectionString;
  if (usingUri) {
    if (!form.connectionString.trim()) {
      errors.connectionString = 'Connection string is required.';
    } else if (engine?.kind === 'document' && !MONGO_URI_PATTERN.test(form.connectionString.trim())) {
      errors.connectionString = 'Enter a valid mongodb:// or mongodb+srv:// URI.';
    }
  } else {
    if (!form.host.trim()) errors.host = 'Host is required.';
    else if (!HOSTNAME_PATTERN.test(form.host.trim())) errors.host = 'Enter a valid hostname or IP.';

    const port = Number(form.port);
    if (!form.port.trim()) errors.port = 'Port is required.';
    else if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = 'Port must be 1–65535.';

    if (!form.database.trim()) errors.database = `${engine?.databaseLabel ?? 'Database'} name is required.`;
  }

  // Credentials required for the selected auth method (unless a full URI
  // is provided, which may embed credentials for the document engine).
  const authFields = DB_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const uriMayEmbedCreds = usingUri && engine?.kind === 'document';
  if (!uriMayEmbedCreds) {
    for (const f of authFields) {
      if (!String(form[f] ?? '').trim()) {
        errors[f] = 'This credential is required for the selected authentication method.';
      }
    }
  }

  const timeout = Number(form.connectionTimeout);
  if (!Number.isInteger(timeout) || timeout < 1) errors.connectionTimeout = 'Enter a positive timeout in seconds.';
  const pool = Number(form.maxPoolSize);
  if (!Number.isInteger(pool) || pool < 1) errors.maxPoolSize = 'Enter a positive pool size.';
  return errors;
}

/* Validation Status checklist. "Connection Verified" is satisfied only
   once a test succeeds — the one item shown pending in the pattern. */
function computeChecklist(form, connectionTested) {
  const engine = ENGINES_BY_ID[form.engineId] ?? null;
  const usingUri = form.useConnectionString;
  const connectionOk = usingUri
    ? !!form.connectionString.trim()
    : !!form.host.trim() && !!form.port.trim() && !!form.database.trim();
  const authFields = DB_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const authOk = (usingUri && engine?.kind === 'document') || authFields.every((f) => String(form[f] ?? '').trim());
  return [
    { key: 'general', label: 'Connection Named', done: !!form.name.trim() && !!form.engineId },
    { key: 'connection', label: 'Connection Details', done: connectionOk },
    { key: 'auth', label: 'Credentials Provided', done: authOk },
    { key: 'security', label: 'Encryption Configured', done: form.useSsl },
    { key: 'verified', label: 'Connection Verified', done: connectionTested },
  ];
}

/** SCR-048 — Database Connector Setup Screen. Node 116:31212. */
export default function DatabaseConnectorSetupScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [testState, setTestState] = useState({ status: 'idle', result: null, mocked: false });

  const errors = useMemo(() => validate(form), [form]);
  const connectionTested = testState.status === 'success';
  const checklist = useMemo(() => computeChecklist(form, connectionTested), [form, connectionTested]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  const engine = ENGINES_BY_ID[form.engineId] ?? null;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  /* Switching engine resets port / default database / SSL mode to that
     engine's defaults and invalidates any prior connection test. */
  function setEngine(id) {
    const next = ENGINES_BY_ID[id];
    setForm((prev) => ({
      ...prev,
      engineId: id,
      port: next?.defaultPort != null ? String(next.defaultPort) : prev.port,
      database: next?.defaultDatabase ?? prev.database,
      sslMode: next?.defaultSslMode ?? prev.sslMode,
      // Connection-string mode is a document-engine convenience; drop it
      // when switching to a relational engine.
      useConnectionString: next?.kind === 'document' ? prev.useConnectionString : false,
    }));
    setTestState({ status: 'idle', result: null, mocked: false });
  }

  async function handleTestConnection() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await testDatabaseConnection(ORG_ID, buildPayload(form));
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
    const result = await createDatabaseSource(ORG_ID, buildPayload(form));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the database connector, verify connectivity, and continue to schema discovery.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Database source created.' });
      navigate('/data-sources');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'Database Connector']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/data-sources/new')} isValid={isValid} submitted={submitState.status === 'mocked'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating database source'
            : submitState.status === 'mocked'
              ? 'Database source simulated — no backend available'
              : testState.status === 'testing'
                ? 'Testing connection'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated database source (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <GeneralInformation form={form} setField={setField} setEngine={setEngine} showError={showError} markTouched={markTouched} errors={errors} />
            <ConnectionConfiguration form={form} engine={engine} setField={setField} showError={showError} markTouched={markTouched} errors={errors} testState={testState} onTest={handleTestConnection} />
            <Authentication form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <ConnectionOptions form={form} engine={engine} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <ConnectionSummary form={form} engine={engine} />
            <ConnectionStatus testState={testState} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <PendingConfiguration checklist={checklist} testState={testState} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources/new')} submitted={submitState.status === 'mocked'} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          engine={engine}
          connectionTested={connectionTested}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </AppShell>
  );
}

/* Assemble the create/test payload from flat form state. */
function buildPayload(form) {
  const engine = ENGINES_BY_ID[form.engineId] ?? null;
  const authFields = DB_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const credentials = Object.fromEntries(authFields.map((f) => [f, String(form[f] ?? '').trim()]));
  return {
    // shared shape with addDataSource.api.js so a real MOD-006 endpoint
    // can accept either wizard path.
    connectorId: form.engineId,
    engineId: form.engineId,
    general: {
      name: form.name.trim(),
      connector: engine?.name ?? form.engineId,
      environment: form.environment,
      driver: engine?.driver ?? null,
    },
    connection: form.useConnectionString
      ? { connectionString: form.connectionString.trim(), useSsl: form.useSsl }
      : {
          host: form.host.trim() || null,
          port: form.port ? Number(form.port) : null,
          database: form.database.trim() || null,
          replicaSet: engine?.kind === 'document' ? form.replicaSet.trim() || null : null,
          authSource: engine?.kind === 'document' ? form.authSource.trim() || null : null,
          readPreference: engine?.kind === 'document' ? form.readPreference : null,
          useSsl: form.useSsl,
        },
    authentication: { method: form.authMethod, credentials },
    security: {
      useSsl: form.useSsl,
      sslMode: form.sslMode,
      verifyServerCert: form.verifyServerCert,
    },
    options: {
      connectionTimeout: Number(form.connectionTimeout) || null,
      maxPoolSize: Number(form.maxPoolSize) || null,
      readOnly: form.readOnly,
    },
  };
}

/* ---- Shared field primitives (mirrors SCR-046) ---------------------- */
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
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Database Connector Setup</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Connect a MySQL, PostgreSQL, or MongoDB database. Configure the connection, authenticate, verify connectivity, then register the source.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Database source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Database Source
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
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Database source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Database Source
        </button>
      </div>
    </div>
  );
}

/* Flat engine order for the radiogroup roving focus / arrow-key nav. */
const ENGINE_ORDER = DATABASE_ENGINES.map((e) => e.id);

/* ---- Section 1: General Information --------------------------------- */
function GeneralInformation({ form, setField, setEngine, showError, markTouched, errors }) {
  const radiogroupRef = useRef(null);
  const selectEngine = (id) => {
    setEngine(id);
    // Move focus to the newly selected radio for roving-tabindex a11y.
    const el = radiogroupRef.current?.querySelector(`[data-engine-id="${id}"]`);
    if (el) el.focus();
  };
  const onEngineKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = ENGINE_ORDER.indexOf(form.engineId);
    const base = current === -1 ? 0 : current;
    const next = (base + delta + ENGINE_ORDER.length) % ENGINE_ORDER.length;
    selectEngine(ENGINE_ORDER[next]);
  };
  return (
    <Section index={1} title="General Information" description="Name the connection and choose the database engine.">
      <Field id="field-name" label="Connection Name" required error={showError('name') ? errors.name : null} hint="A unique, human-readable name for this database source.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="Analytics Warehouse — Production" />}
      </Field>
      <Field id="field-environment" label="Environment">
        {(db) => <SelectInput id="field-environment" value={form.environment} onChange={(v) => setField('environment', v)} describedBy={db} options={DATABASE_OPTIONS.environment} />}
      </Field>
      <fieldset className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">
          Database Engine<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
        </legend>
        <div
          ref={radiogroupRef}
          role="radiogroup"
          aria-label="Database engine"
          aria-required="true"
          onKeyDown={onEngineKeyDown}
          className="grid grid-cols-1 gap-token-2 sm:grid-cols-3"
        >
          {DATABASE_ENGINES.map((eng) => {
            const selected = form.engineId === eng.id;
            return (
              <button
                key={eng.id}
                type="button"
                role="radio"
                data-engine-id={eng.id}
                aria-checked={selected}
                tabIndex={selected || (!form.engineId && eng.id === ENGINE_ORDER[0]) ? 0 : -1}
                onClick={() => selectEngine(eng.id)}
                className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
              >
                <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{eng.name}</span>
                <span className="text-token-meta text-text-faint">{eng.subtitle}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </Section>
  );
}

/* ---- Section 2: Connection Configuration ---------------------------- */
function ConnectionConfiguration({ form, engine, setField, showError, markTouched, errors, testState, onTest }) {
  const testing = testState.status === 'testing';
  const isDocument = engine?.kind === 'document';
  const usingUri = form.useConnectionString;
  const testAction = (
    <button
      type="button"
      onClick={onTest}
      disabled={testing}
      className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {testing ? <IconSpinner /> : <IconPlug />}
      {testing ? 'Testing…' : 'Test Connection'}
    </button>
  );
  return (
    <Section index={2} title="Connection Configuration" description={`Endpoint details for ${engine?.name ?? 'the selected engine'}.`} actions={testAction}>
      {isDocument && (
        <div className="sm:col-span-2">
          <Toggle id="field-useConnectionString" checked={form.useConnectionString} onChange={(v) => setField('useConnectionString', v)} label="Use connection string (URI)" description="Provide a single mongodb:// or mongodb+srv:// URI instead of discrete fields." />
        </div>
      )}

      {usingUri ? (
        <Field id="field-connectionString" label="Connection String" required error={showError('connectionString') ? errors.connectionString : null} className="sm:col-span-2" hint="mongodb+srv://user:pass@cluster.example.net/analytics?retryWrites=true">
          {(db) => <TextInput id="field-connectionString" required value={form.connectionString} onChange={(v) => setField('connectionString', v)} onBlur={() => markTouched('connectionString')} invalid={showError('connectionString')} describedBy={db} placeholder="mongodb+srv://cluster.example.net/analytics" autoComplete="off" />}
        </Field>
      ) : (
        <>
          <Field id="field-host" label="Host" required error={showError('host') ? errors.host : null}>
            {(db) => <TextInput id="field-host" required value={form.host} onChange={(v) => setField('host', v)} onBlur={() => markTouched('host')} invalid={showError('host')} describedBy={db} placeholder={engine?.hostPlaceholder ?? 'db.internal.company.com'} />}
          </Field>
          <Field id="field-port" label="Port" required error={showError('port') ? errors.port : null}>
            {(db) => <TextInput id="field-port" required inputMode="numeric" value={form.port} onChange={(v) => setField('port', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('port')} invalid={showError('port')} describedBy={db} placeholder={engine?.defaultPort != null ? String(engine.defaultPort) : '5432'} />}
          </Field>
          <Field id="field-database" label={engine?.databaseLabel ?? 'Database'} required error={showError('database') ? errors.database : null} className="sm:col-span-2">
            {(db) => <TextInput id="field-database" required value={form.database} onChange={(v) => setField('database', v)} onBlur={() => markTouched('database')} invalid={showError('database')} describedBy={db} placeholder={engine?.databasePlaceholder ?? 'analytics_db'} />}
          </Field>
        </>
      )}

      {isDocument && (
        <>
          <Field id="field-replicaSet" label="Replica Set" hint="Optional — the replica-set name, if the cluster uses one.">
            {(db) => <TextInput id="field-replicaSet" value={form.replicaSet} onChange={(v) => setField('replicaSet', v)} describedBy={db} placeholder="rs0" />}
          </Field>
          <Field id="field-authSource" label="Auth Source" hint="Database that holds the user's credentials.">
            {(db) => <TextInput id="field-authSource" value={form.authSource} onChange={(v) => setField('authSource', v)} describedBy={db} placeholder="admin" />}
          </Field>
          <Field id="field-readPreference" label="Read Preference" className="sm:col-span-2">
            {(db) => <SelectInput id="field-readPreference" value={form.readPreference} onChange={(v) => setField('readPreference', v)} describedBy={db} options={DATABASE_OPTIONS.readPreference} />}
          </Field>
        </>
      )}

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
          {ok ? 'Connection successful' : 'Connection failed'}
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
        <dl className="mt-token-3 grid grid-cols-1 gap-token-1 sm:grid-cols-3">
          <div><dt className="text-token-meta text-text-faint">Server</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.serverVersion ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Latency</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.latencyMs != null ? `${result.latencyMs} ms` : '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Permissions</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.permissions ?? '—'}</dd></div>
        </dl>
      )}
      {mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no connection-test backend yet — this is a simulated result.</p>}
    </div>
  );
}

/* ---- Section 3: Authentication -------------------------------------- */
function Authentication({ form, setField, showError, markTouched, errors }) {
  const fields = DB_AUTH_FIELD_MAP[form.authMethod] ?? [];
  return (
    <Section index={3} title="Authentication" description="Credentials used to connect to the database.">
      <Field id="field-authMethod" label="Authentication Method" className="sm:col-span-2">
        {(db) => <SelectInput id="field-authMethod" value={form.authMethod} onChange={(v) => setField('authMethod', v)} describedBy={db} options={DATABASE_OPTIONS.authMethod} />}
      </Field>
      {fields.map((f) => {
        const meta = CRED_META[f];
        return (
          <Field key={f} id={`field-${f}`} label={meta.label} required error={showError(f) ? errors[f] : null} className={f === 'clientCert' ? 'sm:col-span-2' : ''}>
            {(db) => <TextInput id={`field-${f}`} required type={meta.type} value={form[f]} onChange={(v) => setField(f, v)} onBlur={() => markTouched(f)} invalid={showError(f)} describedBy={db} placeholder={meta.placeholder} autoComplete={meta.autoComplete} />}
          </Field>
        );
      })}
      <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
        <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
        Credentials are encrypted at rest and never displayed after saving. Rotate them from the source's settings.
      </p>
    </Section>
  );
}

/* ---- Section 4: Connection Options / Security ----------------------- */
function ConnectionOptions({ form, engine, setField, showError, markTouched, errors }) {
  const sslModes = engine?.sslModes ?? ['require'];
  return (
    <Section index={4} title="Security & Options" description="Encryption, verification, and runtime behaviour.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-useSsl" checked={form.useSsl} onChange={(v) => setField('useSsl', v)} label="Use SSL / TLS for connection" description="Encrypt the transport channel to the database." />
        <Toggle id="field-verifyServerCert" checked={form.verifyServerCert} onChange={(v) => setField('verifyServerCert', v)} label="Verify Server Certificate" description="Reject connections whose certificate cannot be validated." />
        <Toggle id="field-readOnly" checked={form.readOnly} onChange={(v) => setField('readOnly', v)} label="Read-only Access" description="Connect with a read-only role — no writes to the source." />
      </div>
      <Field id="field-sslMode" label="SSL Mode" hint={form.useSsl ? undefined : 'Enable SSL / TLS to configure a mode.'}>
        {(db) => <SelectInput id="field-sslMode" value={sslModes.includes(form.sslMode) ? form.sslMode : sslModes[0]} onChange={(v) => setField('sslMode', v)} describedBy={db} options={sslModes} disabled={!form.useSsl} />}
      </Field>
      <Field id="field-connectionTimeout" label="Connection Timeout (seconds)" error={showError('connectionTimeout') ? errors.connectionTimeout : null}>
        {(db) => <TextInput id="field-connectionTimeout" inputMode="numeric" value={form.connectionTimeout} onChange={(v) => setField('connectionTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('connectionTimeout')} invalid={showError('connectionTimeout')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-maxPoolSize" label="Max Pool Size" error={showError('maxPoolSize') ? errors.maxPoolSize : null}>
        {(db) => <TextInput id="field-maxPoolSize" inputMode="numeric" value={form.maxPoolSize} onChange={(v) => setField('maxPoolSize', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('maxPoolSize')} invalid={showError('maxPoolSize')} describedBy={db} placeholder="10" />}
      </Field>
    </Section>
  );
}

/* ---- Sidebar: live Connection Summary ------------------------------- */
function ConnectionSummary({ form, engine }) {
  const target = form.useConnectionString
    ? (form.connectionString.trim() || '—')
    : `${form.host.trim() || '—'}${form.port ? `:${form.port}` : ''}`;
  const rows = [
    { label: 'Engine', value: engine?.name ?? '—' },
    { label: 'Environment', value: form.environment },
    { label: 'Target', value: target },
    { label: 'Database', value: form.useConnectionString ? '(in URI)' : (form.database.trim() || '—') },
    { label: 'Auth', value: form.authMethod },
    { label: 'SSL', value: form.useSsl ? form.sslMode : 'Disabled' },
  ];
  const initials = engine?.name?.slice(0, 2).toUpperCase() ?? 'DB';
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connection Summary</h2>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled connection'}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{engine?.subtitle ?? '—'}</p>
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

/* ---- Sidebar: Connection Status ------------------------------------- */
function ConnectionStatus({ testState }) {
  const map = {
    idle: { dot: 'bg-text-faint', label: 'Not tested', text: 'text-text-secondary-alt' },
    testing: { dot: 'bg-warning', label: 'Testing…', text: 'text-warning-strong' },
    success: { dot: 'bg-success', label: 'Connected', text: 'text-success' },
    error: { dot: 'bg-danger', label: 'Failed', text: 'text-danger' },
  };
  const s = map[testState.status] ?? map.idle;
  const r = testState.result;
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connection Status</h2>
      <div className="mt-token-3 flex items-center gap-token-2">
        <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
        <span className={`text-token-sm font-medium ${s.text}`}>{s.label}</span>
        {testState.mocked && <span className="ml-auto rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample</span>}
      </div>
      {testState.status === 'success' && r && (
        <dl className="mt-token-3 flex flex-col gap-token-2">
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Latency</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.latencyMs} ms</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Server</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.serverVersion}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Permissions</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.permissions}</dd></div>
        </dl>
      )}
      {testState.status === 'idle' && <p className="m-0 mt-token-2 text-token-meta text-text-faint">Run “Test Connection” to verify reachability before creating the source.</p>}
    </section>
  );
}

/* ---- Sidebar: live Validation Status -------------------------------- */
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
  if (testState.status === 'idle') pending.push({ key: 'test', label: 'Test the connection' });
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

/* ---- Confirm dialog (focus-trapped) --------------------------------- */
function ConfirmDialog({ form, engine, connectionTested, submitting, onCancel, onConfirm }) {
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

  const initials = engine?.name?.slice(0, 2).toUpperCase() ?? 'DB';
  const target = form.useConnectionString
    ? (form.connectionString.trim() || '—')
    : `${form.host.trim() || '—'}${form.port ? `:${form.port}` : ''}`;
  const rows = [
    { label: 'Engine', value: engine?.name ?? '—' },
    { label: 'Environment', value: form.environment },
    { label: 'Target', value: target },
    { label: 'Database', value: form.useConnectionString ? '(in URI)' : (form.database.trim() || '—') },
    { label: 'Auth', value: form.authMethod },
    { label: 'Verified', value: connectionTested ? 'Yes' : 'Not tested' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-db-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-db-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Database Source</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the configuration before registering the connector.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-token-5 flex items-center gap-token-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled connection'}</p>
            <p className="m-0 truncate text-token-meta text-text-faint">{engine?.subtitle ?? '—'}</p>
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
        {!connectionTested && (
          <div className="mt-token-4 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-3" role="status">
            <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-strong" />
            <p className="m-0 text-token-meta text-warning-strong">The connection has not been verified. You can still register it, but connectivity will be checked at first sync.</p>
          </div>
        )}
        <div className="mt-token-4 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-3">
          <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            <p className="m-0 text-token-meta font-semibold text-primary">What happens next</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
              The database connector is registered, connectivity is verified, and schema discovery runs to catalogue its tables and collections.
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconPlug />}
            {submitting ? 'Creating…' : 'Create Database Source'}
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
