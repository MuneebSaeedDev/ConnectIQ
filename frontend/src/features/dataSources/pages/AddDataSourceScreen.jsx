import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  CONNECTOR_GROUPS,
  CONNECTORS_BY_ID,
  DATA_SOURCE_OPTIONS,
  AUTH_FIELD_MAP,
  SCHEMA_TREE,
  NOTIFICATION_CHANNELS,
  SYNC_FREQUENCY_OPTIONS,
  RETRY_POLICY_OPTIONS,
  ORG_ID,
  createDataSource,
  testConnection,
} from '../services/addDataSource.api';

/* Field styling — mirrors SCR-033's AddUserScreen so the admin forms read
   identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const HOSTNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

/* All schema-table ids selected by default (the design shows the full
   analytics_db catalogue checked). */
const ALL_TABLE_IDS = SCHEMA_TREE.flatMap((s) => s.tables.map((t) => `${s.id}.${t.id}`));

/** Empty form — seeded with the PostgreSQL example the Figma frame shows. */
const INITIAL_FORM = {
  // 1. General Information
  name: '',
  connectorId: 'postgresql',
  environment: 'Production',
  category: 'Analytics',
  description: '',
  // 2. Connection Configuration (connector-aware)
  host: '',
  port: '5432',
  database: '',
  bucket: '',
  region: 'us-east-1',
  endpointUrl: '',
  bootstrapServers: '',
  useSsl: true,
  // 3. Authentication
  authMethod: 'Username & Password',
  username: '',
  password: '',
  clientId: '',
  clientSecret: '',
  apiKey: '',
  serviceAccount: '',
  iamRole: '',
  clientCert: '',
  // 4. Security Configuration
  encryptInTransit: true,
  encryptAtRest: true,
  minTlsVersion: 'TLS 1.2',
  certificateAuthority: 'Corporate PKI (Internal CA)',
  verifyServerCert: true,
  ipAllowlist: '',
  // 5. Schema Discovery
  autoDiscoverSchema: true,
  selectedTables: ALL_TABLE_IDS,
  // 6. Operational Configuration
  connectionPoolSize: '10',
  queryTimeout: '30',
  syncFrequency: 'Every 15 minutes',
  retryPolicy: 'Exponential backoff (3 retries)',
  readOnly: true,
  // 7. Metadata & Governance
  owner: 'alice.chen@company.com',
  department: 'Data Engineering',
  dataClassification: 'Confidential',
  sensitivityLevel: 'High',
  lifecycleStatus: 'Active',
  businessDomain: 'Data Analytics',
  tags: '',
  // 8. Monitoring & Alerts
  enableHealthChecks: true,
  alertOnFailure: true,
  alertOnLatency: true,
  latencyThresholdMs: '500',
  notificationChannels: ['email', 'slack'],
};

/* Which Connection Configuration fields a connector kind needs. */
function connectionFieldsFor(kind) {
  switch (kind) {
    case 'database':
    case 'warehouse':
      return ['host', 'port', 'database'];
    case 'storage':
      return ['bucket', 'region'];
    case 'api':
      return ['endpointUrl'];
    case 'streaming':
      return ['bootstrapServers'];
    case 'file':
      return ['host', 'port'];
    default:
      return ['host', 'port'];
  }
}

/* Required fields per Figma (marked with *), plus connector-aware
   connection + auth requirements. */
function validate(form) {
  const errors = {};
  const connector = CONNECTORS_BY_ID[form.connectorId] ?? null;
  if (!form.name.trim()) errors.name = 'Data source name is required.';
  if (!form.connectorId) errors.connectorId = 'Select a source type.';

  const fields = connectionFieldsFor(connector?.kind);
  if (fields.includes('host')) {
    if (!form.host.trim()) errors.host = 'Host is required.';
    else if (!HOSTNAME_PATTERN.test(form.host.trim())) errors.host = 'Enter a valid hostname or IP.';
  }
  if (fields.includes('port')) {
    const port = Number(form.port);
    if (!form.port.trim()) errors.port = 'Port is required.';
    else if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = 'Port must be 1–65535.';
  }
  if (fields.includes('database') && !form.database.trim()) errors.database = 'Database name is required.';
  if (fields.includes('bucket') && !form.bucket.trim()) errors.bucket = 'Bucket / container is required.';
  if (fields.includes('endpointUrl')) {
    if (!form.endpointUrl.trim()) errors.endpointUrl = 'Endpoint URL is required.';
    else if (!URL_PATTERN.test(form.endpointUrl.trim())) errors.endpointUrl = 'Enter a valid http(s) URL.';
  }
  if (fields.includes('bootstrapServers') && !form.bootstrapServers.trim())
    errors.bootstrapServers = 'Bootstrap servers are required.';

  const authFields = AUTH_FIELD_MAP[form.authMethod] ?? [];
  for (const f of authFields) {
    if (!String(form[f] ?? '').trim()) {
      errors[f] = 'This credential is required for the selected authentication method.';
    }
  }

  const latency = Number(form.latencyThresholdMs);
  if (form.alertOnLatency && (!Number.isInteger(latency) || latency < 1)) {
    errors.latencyThresholdMs = 'Enter a positive latency threshold in milliseconds.';
  }
  return errors;
}

/* The 6 Validation Status checklist items from the Figma sidebar. Item 5
   ("Schema Discovery Complete") is the one shown failing in the design —
   satisfied once a connection has been successfully tested. */
function computeChecklist(form, connectionTested) {
  const connector = CONNECTORS_BY_ID[form.connectorId] ?? null;
  const fields = connectionFieldsFor(connector?.kind);
  const connectionOk = fields.every((f) => String(form[f] ?? '').trim());
  const authFields = AUTH_FIELD_MAP[form.authMethod] ?? [];
  const authOk = authFields.every((f) => String(form[f] ?? '').trim());
  return [
    { key: 'general', label: 'General Information', done: !!form.name.trim() && !!form.connectorId },
    { key: 'connection', label: 'Connection Configured', done: connectionOk },
    { key: 'auth', label: 'Authentication Provided', done: authOk },
    { key: 'security', label: 'Security Configured', done: form.encryptInTransit },
    { key: 'schema', label: 'Schema Discovery Complete', done: connectionTested && form.selectedTables.length > 0 },
    { key: 'governance', label: 'Metadata & Governance', done: !!form.owner && !!form.dataClassification },
  ];
}

/* Format a row-count total into a compact human label. */
function formatRows(total) {
  if (total >= 1_000_000_000) return `${(total / 1_000_000_000).toFixed(1)}B rows`;
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M rows`;
  if (total >= 1_000) return `${Math.round(total / 1_000)}K rows`;
  return `${total} rows`;
}

/** SCR-046 — Add Data Source Screen. Node 115:28040, Figma page "Page 1". */
export default function AddDataSourceScreen() {
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

  const connector = CONNECTORS_BY_ID[form.connectorId] ?? null;
  const connFields = connectionFieldsFor(connector?.kind);

  const selectedTableMeta = useMemo(() => {
    let cols = 0;
    let rows = 0;
    for (const schema of SCHEMA_TREE) {
      for (const table of schema.tables) {
        if (form.selectedTables.includes(`${schema.id}.${table.id}`)) {
          cols += table.cols;
          rows += table.rows;
        }
      }
    }
    return { tableCount: form.selectedTables.length, cols, rows };
  }, [form.selectedTables]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  /* Changing the connector resets the port to its default and invalidates
     any prior connection test (different endpoint set). */
  function setConnector(id) {
    const next = CONNECTORS_BY_ID[id];
    setForm((prev) => ({
      ...prev,
      connectorId: id,
      port: next?.defaultPort != null ? String(next.defaultPort) : prev.port,
    }));
    setTestState({ status: 'idle', result: null, mocked: false });
  }

  function toggleTable(tableKey) {
    setForm((prev) => {
      const has = prev.selectedTables.includes(tableKey);
      return {
        ...prev,
        selectedTables: has
          ? prev.selectedTables.filter((t) => t !== tableKey)
          : [...prev.selectedTables, tableKey],
      };
    });
  }

  function toggleSchema(schema) {
    const keys = schema.tables.map((t) => `${schema.id}.${t.id}`);
    setForm((prev) => {
      const allSelected = keys.every((k) => prev.selectedTables.includes(k));
      return {
        ...prev,
        selectedTables: allSelected
          ? prev.selectedTables.filter((t) => !keys.includes(t))
          : [...new Set([...prev.selectedTables, ...keys])],
      };
    });
  }

  function toggleChannel(id) {
    setForm((prev) => {
      const has = prev.notificationChannels.includes(id);
      return {
        ...prev,
        notificationChannels: has
          ? prev.notificationChannels.filter((c) => c !== id)
          : [...prev.notificationChannels, id],
      };
    });
  }

  async function handleTestConnection() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await testConnection(ORG_ID, buildPayload(form));
    setTestState({
      status: result.success ? 'success' : 'error',
      result,
      mocked: !!result.mocked,
    });
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
    const result = await createDataSource(ORG_ID, buildPayload(form));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the connector, run schema discovery, and begin scheduled ingestion.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Data source created.' });
      navigate('/data-sources');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'Add Data Source']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/data-sources')} isValid={isValid} submitted={submitState.status === 'mocked'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating data source'
            : submitState.status === 'mocked'
              ? 'Data source simulated — no backend available'
              : testState.status === 'testing'
                ? 'Testing connection'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated data source (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <GeneralInformation form={form} setField={setField} setConnector={setConnector} showError={showError} markTouched={markTouched} errors={errors} />
            <ConnectionConfiguration form={form} connector={connector} connFields={connFields} setField={setField} showError={showError} markTouched={markTouched} errors={errors} testState={testState} onTest={handleTestConnection} />
            <Authentication form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <SecurityConfiguration form={form} setField={setField} />
            <SchemaDiscovery form={form} setField={setField} toggleTable={toggleTable} toggleSchema={toggleSchema} meta={selectedTableMeta} connectionTested={connectionTested} />
            <OperationalConfiguration form={form} setField={setField} />
            <MetadataGovernance form={form} setField={setField} />
            <MonitoringAlerts form={form} setField={setField} toggleChannel={toggleChannel} showError={showError} markTouched={markTouched} errors={errors} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <DataSourceSummary form={form} connector={connector} meta={selectedTableMeta} />
            <ConnectionStatus testState={testState} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <SecurityReview form={form} />
            <PendingConfiguration checklist={checklist} testState={testState} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources')} submitted={submitState.status === 'mocked'} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          connector={connector}
          meta={selectedTableMeta}
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
  const connector = CONNECTORS_BY_ID[form.connectorId] ?? null;
  const authFields = AUTH_FIELD_MAP[form.authMethod] ?? [];
  const credentials = Object.fromEntries(authFields.map((f) => [f, String(form[f] ?? '').trim()]));
  return {
    connectorId: form.connectorId,
    general: {
      name: form.name.trim(),
      connector: connector?.name ?? form.connectorId,
      environment: form.environment,
      category: form.category,
      description: form.description.trim() || null,
    },
    connection: {
      host: form.host.trim() || null,
      port: form.port ? Number(form.port) : null,
      database: form.database.trim() || null,
      bucket: form.bucket.trim() || null,
      region: form.region || null,
      endpointUrl: form.endpointUrl.trim() || null,
      bootstrapServers: form.bootstrapServers.trim() || null,
      useSsl: form.useSsl,
    },
    authentication: { method: form.authMethod, credentials },
    security: {
      encryptInTransit: form.encryptInTransit,
      encryptAtRest: form.encryptAtRest,
      minTlsVersion: form.minTlsVersion,
      certificateAuthority: form.certificateAuthority,
      verifyServerCert: form.verifyServerCert,
      ipAllowlist: form.ipAllowlist.trim() || null,
    },
    schema: {
      autoDiscover: form.autoDiscoverSchema,
      selectedTables: form.selectedTables,
    },
    operational: {
      connectionPoolSize: Number(form.connectionPoolSize) || null,
      queryTimeout: Number(form.queryTimeout) || null,
      syncFrequency: form.syncFrequency,
      retryPolicy: form.retryPolicy,
      readOnly: form.readOnly,
    },
    governance: {
      owner: form.owner,
      department: form.department,
      dataClassification: form.dataClassification,
      sensitivityLevel: form.sensitivityLevel,
      lifecycleStatus: form.lifecycleStatus,
      businessDomain: form.businessDomain,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    },
    monitoring: {
      enableHealthChecks: form.enableHealthChecks,
      alertOnFailure: form.alertOnFailure,
      alertOnLatency: form.alertOnLatency,
      latencyThresholdMs: Number(form.latencyThresholdMs) || null,
      notificationChannels: form.notificationChannels,
    },
  };
}

/* ---- Layout primitives ---------------------------------------------- */

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

function SelectInput({ id, value, onChange, onBlur, invalid, describedBy, options, placeholder, required }) {
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
      {placeholder && <option value="">{placeholder}</option>}
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

/* ---- Header & action bar -------------------------------------------- */

function Header({ onCancel, isValid, submitted }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Add Data Source</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Register a new data source, configure its connection and security, discover its schema, and set up monitoring.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="button" disabled title="Saving drafts requires MOD-006's data-source endpoint (still PLANNED)." className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Save Draft
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Data source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Data Source
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
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Data source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconPlug />
          Create Data Source
        </button>
      </div>
    </div>
  );
}

/* Flat connector order for radiogroup roving focus / arrow-key navigation. */
const CONNECTOR_ORDER = CONNECTOR_GROUPS.flatMap((g) => g.connectors.map((c) => c.id));

/* ---- Section 1: General Information --------------------------------- */
function GeneralInformation({ form, setField, setConnector, showError, markTouched, errors }) {
  const onConnectorKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = CONNECTOR_ORDER.indexOf(form.connectorId);
    const base = current === -1 ? 0 : current;
    const next = (base + delta + CONNECTOR_ORDER.length) % CONNECTOR_ORDER.length;
    setConnector(CONNECTOR_ORDER[next]);
  };
  return (
    <Section index={1} title="General Information" description="Name the source and choose the connector type.">
      <Field id="field-name" label="Data Source Name" required error={showError('name') ? errors.name : null} hint="A unique, human-readable name for this source.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="Analytics Warehouse — Production" />}
      </Field>
      <Field id="field-environment" label="Environment">
        {(db) => <SelectInput id="field-environment" value={form.environment} onChange={(v) => setField('environment', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.environment} />}
      </Field>
      <Field id="field-category" label="Category">
        {(db) => <SelectInput id="field-category" value={form.category} onChange={(v) => setField('category', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.category} />}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2">
        {(db) => <TextArea id="field-description" value={form.description} onChange={(v) => setField('description', v)} describedBy={db} placeholder="What this source contains and how it is used…" />}
      </Field>
      <fieldset className="sm:col-span-2 m-0 border-0 p-0">
        <legend id="connector-legend" className="mb-token-2 flex items-center gap-token-1 p-0 text-token-sm font-medium text-text-secondary-alt">
          Source Type<span className="text-danger" aria-hidden="true">*</span>
        </legend>
        {showError('connectorId') && <p className="m-0 mb-token-2 text-token-meta text-danger" role="alert">{errors.connectorId}</p>}
        <div
          role="radiogroup"
          aria-labelledby="connector-legend"
          aria-required="true"
          aria-invalid={showError('connectorId') || undefined}
          onKeyDown={onConnectorKeyDown}
          className="flex flex-col gap-token-4"
        >
          {CONNECTOR_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="m-0 mb-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">{group.group}</p>
              <div className="grid grid-cols-2 gap-token-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.connectors.map((c) => {
                  const selected = form.connectorId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected || (!form.connectorId && c.id === CONNECTOR_ORDER[0]) ? 0 : -1}
                      onClick={() => setConnector(c.id)}
                      className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
                    >
                      <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{c.name}</span>
                      <span className="text-token-meta text-text-faint">{c.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </Section>
  );
}

/* ---- Section 2: Connection Configuration ---------------------------- */
function ConnectionConfiguration({ form, connector, connFields, setField, showError, markTouched, errors, testState, onTest }) {
  const testing = testState.status === 'testing';
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
    <Section index={2} title="Connection Configuration" description={`Endpoint details for ${connector?.name ?? 'the selected connector'}.`} actions={testAction}>
      {connFields.includes('host') && (
        <Field id="field-host" label="Host" required error={showError('host') ? errors.host : null}>
          {(db) => <TextInput id="field-host" required value={form.host} onChange={(v) => setField('host', v)} onBlur={() => markTouched('host')} invalid={showError('host')} describedBy={db} placeholder="db.internal.company.com" />}
        </Field>
      )}
      {connFields.includes('port') && (
        <Field id="field-port" label="Port" required error={showError('port') ? errors.port : null}>
          {(db) => <TextInput id="field-port" required inputMode="numeric" value={form.port} onChange={(v) => setField('port', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('port')} invalid={showError('port')} describedBy={db} placeholder="5432" />}
        </Field>
      )}
      {connFields.includes('database') && (
        <Field id="field-database" label="Database" required error={showError('database') ? errors.database : null} className="sm:col-span-2">
          {(db) => <TextInput id="field-database" required value={form.database} onChange={(v) => setField('database', v)} onBlur={() => markTouched('database')} invalid={showError('database')} describedBy={db} placeholder="analytics_db" />}
        </Field>
      )}
      {connFields.includes('bucket') && (
        <Field id="field-bucket" label="Bucket / Container" required error={showError('bucket') ? errors.bucket : null}>
          {(db) => <TextInput id="field-bucket" required value={form.bucket} onChange={(v) => setField('bucket', v)} onBlur={() => markTouched('bucket')} invalid={showError('bucket')} describedBy={db} placeholder="my-data-bucket" />}
        </Field>
      )}
      {connFields.includes('region') && (
        <Field id="field-region" label="Region">
          {(db) => <TextInput id="field-region" value={form.region} onChange={(v) => setField('region', v)} describedBy={db} placeholder="us-east-1" />}
        </Field>
      )}
      {connFields.includes('endpointUrl') && (
        <Field id="field-endpointUrl" label="Endpoint URL" required error={showError('endpointUrl') ? errors.endpointUrl : null} className="sm:col-span-2">
          {(db) => <TextInput id="field-endpointUrl" required value={form.endpointUrl} onChange={(v) => setField('endpointUrl', v)} onBlur={() => markTouched('endpointUrl')} invalid={showError('endpointUrl')} describedBy={db} placeholder="https://api.company.com/v2" />}
        </Field>
      )}
      {connFields.includes('bootstrapServers') && (
        <Field id="field-bootstrapServers" label="Bootstrap Servers" required error={showError('bootstrapServers') ? errors.bootstrapServers : null} className="sm:col-span-2" hint="Comma-separated broker list, e.g. broker1:9092, broker2:9092.">
          {(db) => <TextInput id="field-bootstrapServers" required value={form.bootstrapServers} onChange={(v) => setField('bootstrapServers', v)} onBlur={() => markTouched('bootstrapServers')} invalid={showError('bootstrapServers')} describedBy={db} placeholder="broker1:9092, broker2:9092" />}
        </Field>
      )}
      <div className="sm:col-span-2">
        <Toggle id="field-useSsl" checked={form.useSsl} onChange={(v) => setField('useSsl', v)} label="Use SSL / TLS for connection" description="Encrypt the transport channel to the source." />
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
  const fields = AUTH_FIELD_MAP[form.authMethod] ?? [];
  const CRED_META = {
    username: { label: 'Username', type: 'text', placeholder: 'service_account', autoComplete: 'username' },
    password: { label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    clientId: { label: 'Client ID', type: 'text', placeholder: 'client-id', autoComplete: 'off' },
    clientSecret: { label: 'Client Secret', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    apiKey: { label: 'API Key', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    serviceAccount: { label: 'Service Account JSON', type: 'text', placeholder: '{ "type": "service_account", … }', autoComplete: 'off' },
    iamRole: { label: 'IAM Role ARN', type: 'text', placeholder: 'arn:aws:iam::123456789012:role/…', autoComplete: 'off' },
    clientCert: { label: 'Client Certificate', type: 'text', placeholder: '-----BEGIN CERTIFICATE-----', autoComplete: 'off' },
  };
  return (
    <Section index={3} title="Authentication" description="Credentials used to connect to the source.">
      <Field id="field-authMethod" label="Authentication Method" className="sm:col-span-2">
        {(db) => <SelectInput id="field-authMethod" value={form.authMethod} onChange={(v) => setField('authMethod', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.authMethod} />}
      </Field>
      {fields.map((f) => {
        const meta = CRED_META[f];
        return (
          <Field key={f} id={`field-${f}`} label={meta.label} required error={showError(f) ? errors[f] : null} className={f === 'serviceAccount' || f === 'clientCert' ? 'sm:col-span-2' : ''}>
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

/* ---- Section 4: Security Configuration ------------------------------ */
function SecurityConfiguration({ form, setField }) {
  return (
    <Section index={4} title="Security Configuration" description="Encryption and network-level protections.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-encryptInTransit" checked={form.encryptInTransit} onChange={(v) => setField('encryptInTransit', v)} label="Encrypt in Transit" description="Require TLS for all data transferred from this source." />
        <Toggle id="field-encryptAtRest" checked={form.encryptAtRest} onChange={(v) => setField('encryptAtRest', v)} label="Encrypt at Rest" description="Store ingested data using server-side encryption." />
        <Toggle id="field-verifyServerCert" checked={form.verifyServerCert} onChange={(v) => setField('verifyServerCert', v)} label="Verify Server Certificate" description="Reject connections whose certificate cannot be validated." />
      </div>
      <Field id="field-minTlsVersion" label="Minimum TLS Version">
        {(db) => <SelectInput id="field-minTlsVersion" value={form.minTlsVersion} onChange={(v) => setField('minTlsVersion', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.minTlsVersion} />}
      </Field>
      <Field id="field-certificateAuthority" label="Certificate Authority">
        {(db) => <SelectInput id="field-certificateAuthority" value={form.certificateAuthority} onChange={(v) => setField('certificateAuthority', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.certificateAuthority} />}
      </Field>
      <Field id="field-ipAllowlist" label="IP Allowlist" className="sm:col-span-2" hint="Optional — comma-separated CIDR ranges permitted to reach this source.">
        {(db) => <TextInput id="field-ipAllowlist" value={form.ipAllowlist} onChange={(v) => setField('ipAllowlist', v)} describedBy={db} placeholder="10.0.0.0/8, 192.168.1.0/24" />}
      </Field>
    </Section>
  );
}

/* ---- Section 5: Schema Discovery ------------------------------------ */
function SchemaDiscovery({ form, setField, toggleTable, toggleSchema, meta, connectionTested }) {
  return (
    <Section index={5} title="Schema Discovery" description="Choose which schemas and tables to ingest.">
      <div className="sm:col-span-2 flex flex-col gap-token-4">
        <Toggle id="field-autoDiscoverSchema" checked={form.autoDiscoverSchema} onChange={(v) => setField('autoDiscoverSchema', v)} label="Auto-discover Schema" description="Periodically re-introspect the source and surface new tables." />
        {!connectionTested && (
          <p className="m-0 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong" role="status">
            <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
            Test the connection to confirm live schema discovery. The catalogue below reflects the last known structure.
          </p>
        )}
        <div className="rounded-md border border-border-subtle">
          {SCHEMA_TREE.map((schema) => {
            const keys = schema.tables.map((t) => `${schema.id}.${t.id}`);
            const allSelected = keys.every((k) => form.selectedTables.includes(k));
            const someSelected = keys.some((k) => form.selectedTables.includes(k));
            return (
              <div key={schema.id} className="border-b border-border-subtle last:border-b-0">
                <label className="flex items-center gap-token-2 bg-surface-muted px-token-3 py-token-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={() => toggleSchema(schema)}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                  />
                  <span className="font-mono text-token-sm font-semibold text-text-primary-alt">{schema.name}</span>
                  <span className="text-token-meta text-text-faint">{schema.tables.length} tables</span>
                </label>
                <ul className="m-0 list-none p-0">
                  {schema.tables.map((t) => {
                    const key = `${schema.id}.${t.id}`;
                    const checked = form.selectedTables.includes(key);
                    return (
                      <li key={key}>
                        <label className="flex items-center justify-between gap-token-3 px-token-3 py-token-2 pl-token-6 hover:bg-surface-hover">
                          <span className="flex items-center gap-token-2">
                            <input type="checkbox" checked={checked} onChange={() => toggleTable(key)} className="h-3.5 w-3.5 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary" />
                            <span className="font-mono text-token-sm text-text-primary-alt">{t.id}</span>
                          </span>
                          <span className="text-token-meta text-text-faint">{t.cols} cols · {t.rowsLabel}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
          <span>{meta.tableCount} tables selected · {meta.cols} columns</span>
          <span className="font-semibold">Estimated volume: {formatRows(meta.rows)}</span>
        </div>
      </div>
    </Section>
  );
}

/* ---- Section 6: Operational Configuration --------------------------- */
function OperationalConfiguration({ form, setField }) {
  return (
    <Section index={6} title="Operational Configuration" description="Runtime behaviour for ingestion and querying.">
      <Field id="field-connectionPoolSize" label="Connection Pool Size">
        {(db) => <TextInput id="field-connectionPoolSize" inputMode="numeric" value={form.connectionPoolSize} onChange={(v) => setField('connectionPoolSize', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="10" />}
      </Field>
      <Field id="field-queryTimeout" label="Query Timeout (seconds)">
        {(db) => <TextInput id="field-queryTimeout" inputMode="numeric" value={form.queryTimeout} onChange={(v) => setField('queryTimeout', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-syncFrequency" label="Sync Frequency">
        {(db) => <SelectInput id="field-syncFrequency" value={form.syncFrequency} onChange={(v) => setField('syncFrequency', v)} describedBy={db} options={SYNC_FREQUENCY_OPTIONS} />}
      </Field>
      <Field id="field-retryPolicy" label="Retry Policy">
        {(db) => <SelectInput id="field-retryPolicy" value={form.retryPolicy} onChange={(v) => setField('retryPolicy', v)} describedBy={db} options={RETRY_POLICY_OPTIONS} />}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-readOnly" checked={form.readOnly} onChange={(v) => setField('readOnly', v)} label="Read-only Access" description="Connect with a read-only role — no writes are issued to the source." />
      </div>
    </Section>
  );
}

/* ---- Section 7: Metadata & Governance ------------------------------- */
function MetadataGovernance({ form, setField }) {
  return (
    <Section index={7} title="Metadata & Governance" description="Ownership, classification, and lifecycle.">
      <Field id="field-owner" label="Owner">
        {(db) => <SelectInput id="field-owner" value={form.owner} onChange={(v) => setField('owner', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.owner} />}
      </Field>
      <Field id="field-department" label="Department">
        {(db) => <SelectInput id="field-department" value={form.department} onChange={(v) => setField('department', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.department} />}
      </Field>
      <Field id="field-dataClassification" label="Data Classification">
        {(db) => <SelectInput id="field-dataClassification" value={form.dataClassification} onChange={(v) => setField('dataClassification', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.dataClassification} />}
      </Field>
      <Field id="field-sensitivityLevel" label="Sensitivity Level">
        {(db) => <SelectInput id="field-sensitivityLevel" value={form.sensitivityLevel} onChange={(v) => setField('sensitivityLevel', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.sensitivityLevel} />}
      </Field>
      <Field id="field-lifecycleStatus" label="Lifecycle Status">
        {(db) => <SelectInput id="field-lifecycleStatus" value={form.lifecycleStatus} onChange={(v) => setField('lifecycleStatus', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.lifecycleStatus} />}
      </Field>
      <Field id="field-businessDomain" label="Business Domain">
        {(db) => <SelectInput id="field-businessDomain" value={form.businessDomain} onChange={(v) => setField('businessDomain', v)} describedBy={db} options={DATA_SOURCE_OPTIONS.businessDomain} />}
      </Field>
      <Field id="field-tags" label="Tags" className="sm:col-span-2" hint="Comma-separated labels for search and grouping.">
        {(db) => <TextInput id="field-tags" value={form.tags} onChange={(v) => setField('tags', v)} describedBy={db} placeholder="analytics, warehouse, pii" />}
      </Field>
    </Section>
  );
}

/* ---- Section 8: Monitoring & Alerts --------------------------------- */
function MonitoringAlerts({ form, setField, toggleChannel, showError, markTouched, errors }) {
  return (
    <Section index={8} title="Monitoring & Alerts" description="Health checks and where alerts are delivered.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-enableHealthChecks" checked={form.enableHealthChecks} onChange={(v) => setField('enableHealthChecks', v)} label="Enable Health Checks" description="Periodically probe the source and record a health record." />
        <Toggle id="field-alertOnFailure" checked={form.alertOnFailure} onChange={(v) => setField('alertOnFailure', v)} label="Alert on Connection Failure" description="Notify configured channels when a health check or sync fails." />
        <Toggle id="field-alertOnLatency" checked={form.alertOnLatency} onChange={(v) => setField('alertOnLatency', v)} label="Alert on High Latency" description="Notify when query latency exceeds the threshold below." />
      </div>
      {form.alertOnLatency && (
        <Field id="field-latencyThresholdMs" label="Latency Threshold (ms)" error={showError('latencyThresholdMs') ? errors.latencyThresholdMs : null}>
          {(db) => <TextInput id="field-latencyThresholdMs" inputMode="numeric" value={form.latencyThresholdMs} onChange={(v) => setField('latencyThresholdMs', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('latencyThresholdMs')} invalid={showError('latencyThresholdMs')} describedBy={db} placeholder="500" />}
        </Field>
      )}
      <div className="sm:col-span-2">
        <p className="m-0 mb-token-2 text-token-sm font-medium text-text-secondary-alt">Notification Channels</p>
        <ul className="grid grid-cols-1 gap-token-2 sm:grid-cols-2">
          {NOTIFICATION_CHANNELS.map((ch) => {
            const active = form.notificationChannels.includes(ch.id);
            return (
              <li key={ch.id}>
                <label className={`flex items-center justify-between gap-token-3 rounded-md border px-token-3 py-token-2 transition-colors ${active ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'} ${ch.configured ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                  <span className="flex items-center gap-token-2">
                    <input type="checkbox" checked={active} disabled={!ch.configured} onChange={() => toggleChannel(ch.id)} className="h-3.5 w-3.5 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary" />
                    <span className="text-token-sm font-medium text-text-primary-alt">{ch.name}</span>
                  </span>
                  <span className="text-token-meta text-text-faint">{ch.target}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* ---- Sidebar: live Data Source Summary ------------------------------ */
function DataSourceSummary({ form, connector, meta }) {
  const rows = [
    { label: 'Type', value: connector?.name ?? '—' },
    { label: 'Environment', value: form.environment },
    { label: 'Category', value: form.category },
    { label: 'Owner', value: form.owner ? form.owner.split('@')[0] : '—' },
    { label: 'Classification', value: form.dataClassification },
    { label: 'Tables', value: `${meta.tableCount} selected` },
    { label: 'Sync', value: form.syncFrequency },
  ];
  const initials = connector?.name?.slice(0, 2).toUpperCase() ?? 'DS';
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Data Source Summary</h2>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled source'}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{connector?.subtitle ?? '—'}</p>
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

/* ---- Sidebar: Security Review --------------------------------------- */
function SecurityReview({ form }) {
  const items = [
    { label: 'Encryption in Transit', done: form.encryptInTransit },
    { label: 'Encryption at Rest', done: form.encryptAtRest },
    { label: 'Server Cert Verification', done: form.verifyServerCert },
    { label: 'Read-only Access', done: form.readOnly },
    { label: 'IP Allowlist', done: !!form.ipAllowlist.trim() },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Security Review</h2>
      <ul className="mt-token-4 flex flex-col gap-token-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-token-2 text-token-sm">
            {item.done ? <IconShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <IconCircle className="h-3.5 w-3.5 shrink-0 text-text-faint" />}
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

/* ---- Confirm Create dialog (node 115:28040) ------------------------- */
function ConfirmDialog({ form, connector, meta, submitting, onCancel, onConfirm }) {
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

  const initials = connector?.name?.slice(0, 2).toUpperCase() ?? 'DS';
  const rows = [
    { label: 'Type', value: connector?.name ?? '—' },
    { label: 'Environment', value: form.environment },
    { label: 'Classification', value: form.dataClassification },
    { label: 'Owner', value: form.owner || '—' },
    { label: 'Tables', value: `${meta.tableCount} selected` },
    { label: 'Est. Volume', value: formatRows(meta.rows) },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-ds-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-ds-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Data Source</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the configuration before registering the source.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-token-5 flex items-center gap-token-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled source'}</p>
            <p className="m-0 truncate text-token-meta text-text-faint">{connector?.subtitle ?? '—'}</p>
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
              The connector will be registered and, if auto-discovery is enabled, schema discovery runs immediately. Scheduled ingestion begins on the “{form.syncFrequency}” cadence.
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconPlug />}
            {submitting ? 'Creating…' : 'Create Data Source'}
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

function IconShieldCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.5 3 3.5v4c0 3 2.2 5.3 5 6.5 2.8-1.2 5-3.5 5-6.5v-4L8 1.5Z" />
      <path d="m6 7.5 1.5 1.5L10.5 6" />
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








