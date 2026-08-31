import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  FTP_PROTOCOLS,
  PROTOCOLS_BY_ID,
  FTP_OPTIONS,
  FTP_AUTH_FIELD_MAP,
  authMethodsFor,
  ORG_ID,
  browseDirectories,
  createFtpSource,
  testFtpConnection,
} from '../services/ftpConnection.api';

/* Field styling — mirrors SCR-046/SCR-048 so the data-source forms read
   identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const HOSTNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

/** Empty form — seeded with the SFTP example from the Figma frame. */
const INITIAL_FORM = {
  // 1. Connection Configuration
  name: '',
  environment: 'Production',
  protocolId: 'sftp',
  description: '',
  // 2. Server Configuration
  host: '',
  port: '22',
  transferMode: 'Passive',
  remoteRoot: '',
  workingDirectory: '',
  connectionTimeout: '30',
  transferTimeout: '300',
  keepAliveInterval: '60',
  // 3. Authentication
  authMethod: 'SSH Private Key',
  username: '',
  password: '',
  privateKey: '',
  passphrase: '',
  publicKeyFingerprint: '',
  clientCert: '',
  keyFormat: 'OpenSSH',
  // 4. File Selection Rules
  filePattern: '*.{csv,xlsx,json}',
  recursive: false,
  ignoreHidden: true,
  ignoreSystemFiles: true,
  includeZeroByte: false,
  // 5. Transfer Configuration
  transferDirection: 'Download',
  overwritePolicy: 'Skip Existing',
  fileEncoding: 'UTF-8',
  resumeTransfers: true,
  useTempFile: true,
  archiveAfterTransfer: false,
  deleteSourceAfterTransfer: false,
  // 6. Security
  hostKeyVerification: true,
  strictHostKeyChecking: true,
  requireEncryptedTransport: true,
  // scheduling
  triggerType: 'Scheduled',
};

/* Credential field metadata for the auth section. */
const CRED_META = {
  username: { label: 'Username', type: 'text', placeholder: 'etl_svc_acme', autoComplete: 'username', span: false },
  password: { label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password', span: false },
  privateKey: { label: 'Private Key', type: 'textarea', placeholder: '-----BEGIN OPENSSH PRIVATE KEY-----', autoComplete: 'off', span: true },
  passphrase: { label: 'Key Passphrase', type: 'password', placeholder: '••••••••', autoComplete: 'off', span: false },
  publicKeyFingerprint: { label: 'Public Key Fingerprint', type: 'text', placeholder: 'SHA256:…', autoComplete: 'off', span: true },
  clientCert: { label: 'Client Certificate', type: 'textarea', placeholder: '-----BEGIN CERTIFICATE-----', autoComplete: 'off', span: true },
};

/* Protocol-aware required-field validation. */
function validate(form) {
  const errors = {};
  const protocol = PROTOCOLS_BY_ID[form.protocolId] ?? null;
  if (!form.name.trim()) errors.name = 'Connection name is required.';
  if (!form.protocolId) errors.protocolId = 'Select a transfer protocol.';

  if (!form.host.trim()) errors.host = 'Server host is required.';
  else if (!HOSTNAME_PATTERN.test(form.host.trim())) errors.host = 'Enter a valid hostname or IP.';

  const port = Number(form.port);
  if (!form.port.trim()) errors.port = 'Port is required.';
  else if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = 'Port must be 1–65535.';

  // Credentials required for the selected auth method.
  const authFields = FTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  for (const f of authFields) {
    if (!String(form[f] ?? '').trim()) {
      errors[f] = 'This credential is required for the selected authentication method.';
    }
  }

  for (const [key, label] of [
    ['connectionTimeout', 'connection timeout'],
    ['transferTimeout', 'transfer timeout'],
    ['keepAliveInterval', 'keep-alive interval'],
  ]) {
    const n = Number(form[key]);
    if (!Number.isInteger(n) || n < 1) errors[key] = `Enter a positive ${label} in seconds.`;
  }

  // Plain FTP transmits credentials in the clear — surface as an error the
  // user must consciously accept by switching to a secure transport, unless
  // they have explicitly waived encrypted transport.
  if (protocol && !protocol.secure && form.requireEncryptedTransport) {
    errors.protocolId = 'Plain FTP is unencrypted. Choose a secure transport or disable “Require Encrypted Transport”.';
  }
  return errors;
}

/* Validation Status checklist. "Connection Verified" is satisfied only
   once a test succeeds — the one item shown pending in the pattern. */
function computeChecklist(form, connectionTested) {
  const authFields = FTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const authOk = authFields.every((f) => String(form[f] ?? '').trim());
  const protocol = PROTOCOLS_BY_ID[form.protocolId] ?? null;
  return [
    { key: 'general', label: 'Connection Named', done: !!form.name.trim() && !!form.protocolId },
    { key: 'server', label: 'Server Reachable', done: !!form.host.trim() && !!form.port.trim() },
    { key: 'auth', label: 'Authentication Successful', done: authOk },
    { key: 'security', label: 'Security Validated', done: !!protocol?.secure },
    { key: 'directory', label: 'Directory Accessible', done: !!form.remoteRoot.trim() },
    { key: 'verified', label: 'Transfer Permissions Verified', done: connectionTested },
  ];
}

/** SCR-052 — FTP Connection Screen. Node 121:39854. */
export default function FtpConnectionScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [testState, setTestState] = useState({ status: 'idle', result: null, mocked: false });
  const [browseState, setBrowseState] = useState({ status: 'idle', entries: [], mocked: false });

  const errors = useMemo(() => validate(form), [form]);
  const connectionTested = testState.status === 'success';
  const checklist = useMemo(() => computeChecklist(form, connectionTested), [form, connectionTested]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  const protocol = PROTOCOLS_BY_ID[form.protocolId] ?? null;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  /* Switching protocol resets port to that transport's default, chooses a
     valid auth method for the new transport, and invalidates any prior
     connection test / directory browse. */
  function setProtocol(id) {
    const next = PROTOCOLS_BY_ID[id];
    const methods = authMethodsFor(id);
    setForm((prev) => ({
      ...prev,
      protocolId: id,
      port: next?.defaultPort != null ? String(next.defaultPort) : prev.port,
      authMethod: methods.includes(prev.authMethod) ? prev.authMethod : methods[0],
      // Transfer mode is N/A for SSH; keep the value but the UI disables it.
    }));
    setTestState({ status: 'idle', result: null, mocked: false });
    setBrowseState({ status: 'idle', entries: [], mocked: false });
  }

  async function handleTestConnection() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await testFtpConnection(ORG_ID, buildPayload(form));
    setTestState({ status: result.success ? 'success' : 'error', result, mocked: !!result.mocked });
  }

  async function handleBrowse() {
    setBrowseState({ status: 'loading', entries: [], mocked: false });
    const result = await browseDirectories(ORG_ID, buildPayload(form));
    setBrowseState({ status: 'ready', entries: result.entries ?? [], mocked: !!result.mocked });
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      // `protocolId` has no `field-*` input — it's a radiogroup keyed by
      // data-protocol-id — so fall back to focusing the checked/first radio.
      const el =
        document.getElementById(`field-${firstKey}`) ??
        (firstKey === 'protocolId'
          ? document.querySelector('[data-protocol-id][aria-checked="true"], [data-protocol-id]')
          : null);
      if (el) el.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmCreate() {
    setSubmitState({ status: 'submitting', message: '' });
    const result = await createFtpSource(ORG_ID, buildPayload(form));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the file-transfer connector, verify connectivity, and continue to directory discovery.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'File-transfer source created.' });
      navigate('/data-sources');
    }
  }

  const submitted = submitState.status === 'mocked';

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'FTP Connection']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/data-sources/new')} isValid={isValid} submitted={submitted} onBrowse={handleBrowse} browsing={browseState.status === 'loading'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating file-transfer source'
            : submitted
              ? 'File-transfer source simulated — no backend available'
              : testState.status === 'testing'
                ? 'Testing connection'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitted && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated file-transfer source (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <ConnectionConfiguration form={form} setField={setField} setProtocol={setProtocol} showError={showError} markTouched={markTouched} errors={errors} />
            <ServerConfiguration form={form} protocol={protocol} setField={setField} showError={showError} markTouched={markTouched} errors={errors} testState={testState} onTest={handleTestConnection} />
            <Authentication form={form} protocol={protocol} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <DirectoryDiscovery form={form} setField={setField} browseState={browseState} onBrowse={handleBrowse} />
            <FileSelectionRules form={form} setField={setField} />
            <TransferConfiguration form={form} setField={setField} />
            <SecurityConfiguration form={form} protocol={protocol} setField={setField} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <ConnectionSummary form={form} protocol={protocol} />
            <ConnectionStatus testState={testState} protocol={protocol} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <PendingConfiguration checklist={checklist} testState={testState} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources/new')} submitted={submitted} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          protocol={protocol}
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
  const protocol = PROTOCOLS_BY_ID[form.protocolId] ?? null;
  const authFields = FTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const credentials = Object.fromEntries(authFields.map((f) => [f, String(form[f] ?? '').trim()]));
  return {
    connectorId: form.protocolId,
    protocolId: form.protocolId,
    general: {
      name: form.name.trim(),
      protocol: protocol?.name ?? form.protocolId,
      environment: form.environment,
      description: form.description.trim() || null,
    },
    server: {
      host: form.host.trim() || null,
      port: form.port ? Number(form.port) : null,
      transferMode: protocol?.ssh ? null : form.transferMode,
      remoteRoot: form.remoteRoot.trim() || null,
      workingDirectory: form.workingDirectory.trim() || null,
      connectionTimeout: Number(form.connectionTimeout) || null,
      transferTimeout: Number(form.transferTimeout) || null,
      keepAliveInterval: Number(form.keepAliveInterval) || null,
    },
    authentication: { method: form.authMethod, keyFormat: protocol?.ssh ? form.keyFormat : null, credentials },
    fileSelection: {
      pattern: form.filePattern.trim() || null,
      recursive: form.recursive,
      ignoreHidden: form.ignoreHidden,
      ignoreSystemFiles: form.ignoreSystemFiles,
      includeZeroByte: form.includeZeroByte,
    },
    transfer: {
      direction: form.transferDirection,
      overwritePolicy: form.overwritePolicy,
      encoding: form.fileEncoding,
      resume: form.resumeTransfers,
      useTempFile: form.useTempFile,
      archiveAfterTransfer: form.archiveAfterTransfer,
      deleteSourceAfterTransfer: form.deleteSourceAfterTransfer,
    },
    security: {
      hostKeyVerification: form.hostKeyVerification,
      strictHostKeyChecking: form.strictHostKeyChecking,
      requireEncryptedTransport: form.requireEncryptedTransport,
    },
    scheduling: { triggerType: form.triggerType },
  };
}

/* ---- Shared field primitives (mirrors SCR-046/048) ------------------ */
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

function TextArea({ id, value, onChange, onBlur, invalid, describedBy, required, rows = 3, ...rest }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`w-full rounded-md border border-border bg-surface-card px-3 py-2 font-mono text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${invalid ? fieldInvalid : ''}`}
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

function Toggle({ id, checked, onChange, label, description, disabled }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'} ${disabled ? 'opacity-60' : ''}`}>
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
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${checked ? 'bg-primary' : 'bg-border'}`}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/* Segmented button group (Transfer Mode, Transfer Direction, Trigger Type). */
function SegmentedControl({ label, value, options, onChange, disabled, note }) {
  return (
    <div className="flex flex-col gap-token-1">
      {label && <span className="text-token-sm font-medium text-text-secondary-alt">{label}</span>}
      <div role="group" aria-label={label} className="inline-flex flex-wrap gap-token-1 rounded-md border border-border bg-surface-muted p-0.5">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`rounded-[5px] px-token-3 py-1 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'bg-surface-card text-primary shadow-sm' : 'text-text-secondary-alt hover:text-text-primary-alt'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {note && <p className="m-0 text-token-meta text-text-faint">{note}</p>}
    </div>
  );
}

/* ---- Header & action bar -------------------------------------------- */
function Header({ onCancel, isValid, submitted, onBrowse, browsing }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">FTP Connection</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Configure, validate, and manage a secure enterprise file-transfer source — FTP, FTPS, or SFTP.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="button" onClick={onBrowse} disabled={browsing} className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconFolder />
          {browsing ? 'Browsing…' : 'Browse Directories'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'File-transfer source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconCheck className="h-3.5 w-3.5" />
          Validate &amp; Save Connection
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
        {isValid ? 'All required fields completed · Ready to save' : `${completedCount} of ${total} configuration steps complete`}
      </span>
      <div className="flex items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'File-transfer source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconCheck className="h-3.5 w-3.5" />
          Validate &amp; Save Connection
        </button>
      </div>
    </div>
  );
}

/* Flat protocol order for the radiogroup roving focus / arrow-key nav. */
const PROTOCOL_ORDER = FTP_PROTOCOLS.map((p) => p.id);

/* ---- Section 1: Connection Configuration ---------------------------- */
function ConnectionConfiguration({ form, setField, setProtocol, showError, markTouched, errors }) {
  const radiogroupRef = useRef(null);
  const selectProtocol = (id) => {
    setProtocol(id);
    const el = radiogroupRef.current?.querySelector(`[data-protocol-id="${id}"]`);
    if (el) el.focus();
  };
  const onProtocolKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = PROTOCOL_ORDER.indexOf(form.protocolId);
    const base = current === -1 ? 0 : current;
    const next = (base + delta + PROTOCOL_ORDER.length) % PROTOCOL_ORDER.length;
    selectProtocol(PROTOCOL_ORDER[next]);
  };
  return (
    <Section index={1} title="Connection Configuration" description="Define the connection identity, protocol, and target environment.">
      <Field id="field-name" label="Connection Name" required error={showError('name') ? errors.name : null} hint="A unique, human-readable name for this file-transfer source.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="acme-sftp-prod" />}
      </Field>
      <Field id="field-environment" label="Environment" required>
        {(db) => <SelectInput id="field-environment" value={form.environment} onChange={(v) => setField('environment', v)} describedBy={db} options={FTP_OPTIONS.environment} />}
      </Field>
      <fieldset className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">
          Protocol<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
        </legend>
        <div
          ref={radiogroupRef}
          role="radiogroup"
          aria-label="Transfer protocol"
          aria-required="true"
          onKeyDown={onProtocolKeyDown}
          className="grid grid-cols-1 gap-token-2 sm:grid-cols-2"
        >
          {FTP_PROTOCOLS.map((p) => {
            const selected = form.protocolId === p.id;
            const insecure = !p.secure;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                data-protocol-id={p.id}
                aria-checked={selected}
                tabIndex={selected || (!form.protocolId && p.id === PROTOCOL_ORDER[0]) ? 0 : -1}
                onClick={() => selectProtocol(p.id)}
                className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
              >
                <span className="flex w-full items-center justify-between gap-token-2">
                  <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{p.name}</span>
                  <span className={`rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${insecure ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success'}`}>{p.subtitle}</span>
                </span>
                <span className="text-token-meta text-text-faint">{p.description}</span>
              </button>
            );
          })}
        </div>
        {showError('protocolId') && <p className="mt-token-1 m-0 text-token-meta text-danger" role="alert">{errors.protocolId}</p>}
      </fieldset>
      <Field id="field-description" label="Description" className="sm:col-span-2" hint="Optional — describe what this transfer source is used for.">
        {(db) => <TextArea id="field-description" value={form.description} onChange={(v) => setField('description', v)} describedBy={db} rows={2} placeholder="Nightly partner ETL drop — finance & sales exports." />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Server Configuration -------------------------------- */
function ServerConfiguration({ form, protocol, setField, showError, markTouched, errors, testState, onTest }) {
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
    <Section index={2} title="Server Configuration" description="Remote server host, port, directory paths, and connection timeouts." actions={testAction}>
      <Field id="field-host" label="Server Host" required error={showError('host') ? errors.host : null}>
        {(db) => <TextInput id="field-host" required value={form.host} onChange={(v) => setField('host', v)} onBlur={() => markTouched('host')} invalid={showError('host')} describedBy={db} placeholder="sftp.acme-partners.com" />}
      </Field>
      <Field id="field-port" label="Port" required error={showError('port') ? errors.port : null}>
        {(db) => <TextInput id="field-port" required inputMode="numeric" value={form.port} onChange={(v) => setField('port', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('port')} invalid={showError('port')} describedBy={db} placeholder={protocol?.defaultPort != null ? String(protocol.defaultPort) : '22'} />}
      </Field>
      <div className="sm:col-span-2">
        <SegmentedControl
          label="Transfer Mode"
          value={form.transferMode}
          options={['Active', 'Passive']}
          onChange={(v) => setField('transferMode', v)}
          disabled={protocol?.ssh}
          note={protocol?.ssh ? 'N/A — SSH protocol' : 'Passive mode is recommended behind firewalls / NAT.'}
        />
      </div>
      <Field id="field-remoteRoot" label="Remote Root Directory" hint="Base path the connector treats as the source root.">
        {(db) => <TextInput id="field-remoteRoot" value={form.remoteRoot} onChange={(v) => setField('remoteRoot', v)} describedBy={db} placeholder="/data/inbound/etl" />}
      </Field>
      <Field id="field-workingDirectory" label="Default Working Directory" hint="Optional — directory selected after connect.">
        {(db) => <TextInput id="field-workingDirectory" value={form.workingDirectory} onChange={(v) => setField('workingDirectory', v)} describedBy={db} placeholder="/data/inbound/etl/staging" />}
      </Field>
      <Field id="field-connectionTimeout" label="Connection Timeout (seconds)" error={showError('connectionTimeout') ? errors.connectionTimeout : null}>
        {(db) => <TextInput id="field-connectionTimeout" inputMode="numeric" value={form.connectionTimeout} onChange={(v) => setField('connectionTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('connectionTimeout')} invalid={showError('connectionTimeout')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-transferTimeout" label="Transfer Timeout (seconds)" error={showError('transferTimeout') ? errors.transferTimeout : null}>
        {(db) => <TextInput id="field-transferTimeout" inputMode="numeric" value={form.transferTimeout} onChange={(v) => setField('transferTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('transferTimeout')} invalid={showError('transferTimeout')} describedBy={db} placeholder="300" />}
      </Field>
      <Field id="field-keepAliveInterval" label="Keep-Alive Interval (seconds)" error={showError('keepAliveInterval') ? errors.keepAliveInterval : null}>
        {(db) => <TextInput id="field-keepAliveInterval" inputMode="numeric" value={form.keepAliveInterval} onChange={(v) => setField('keepAliveInterval', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('keepAliveInterval')} invalid={showError('keepAliveInterval')} describedBy={db} placeholder="60" />}
      </Field>

      {testState.status !== 'idle' && testState.status !== 'testing' && (
        <div className="sm:col-span-2">
          <TestResultPanel testState={testState} protocol={protocol} />
        </div>
      )}
    </Section>
  );
}

function TestResultPanel({ testState, protocol }) {
  const { result, status, mocked } = testState;
  const ok = status === 'success';
  const checks = result?.checks ?? [];
  const server = result?.server ?? {};
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
        <dl className="mt-token-3 grid grid-cols-1 gap-token-1 sm:grid-cols-4">
          <div><dt className="text-token-meta text-text-faint">Server</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.software ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Encryption</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.encryption ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Connection</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.latencyMs != null ? `${result.latencyMs} ms` : '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Transfer</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{result?.transferSpeed ?? '—'}</dd></div>
        </dl>
      )}
      {mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no connection-test backend yet — this is a simulated {protocol?.name ?? ''} result.</p>}
    </div>
  );
}

/* ---- Section 3: Authentication -------------------------------------- */
function Authentication({ form, protocol, setField, showError, markTouched, errors }) {
  const methods = authMethodsFor(form.protocolId);
  const fields = FTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const radiogroupRef = useRef(null);
  const selectMethod = (m) => {
    setField('authMethod', m);
    const el = radiogroupRef.current?.querySelector(`[data-auth-method="${CSS.escape(m)}"]`);
    if (el) el.focus();
  };
  const onMethodKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (delta) {
      e.preventDefault();
      const current = methods.indexOf(form.authMethod);
      const base = current === -1 ? 0 : current;
      selectMethod(methods[(base + delta + methods.length) % methods.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectMethod(methods[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectMethod(methods[methods.length - 1]);
    }
  };
  return (
    <Section index={3} title="Authentication" description="Secure credential configuration — sensitive values are encrypted at rest.">
      <fieldset className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">Authentication Method</legend>
        <div ref={radiogroupRef} role="radiogroup" aria-label="Authentication method" onKeyDown={onMethodKeyDown} className="flex flex-wrap gap-token-2">
          {methods.map((m) => {
            const selected = form.authMethod === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                data-auth-method={m}
                aria-checked={selected}
                tabIndex={selected || (methods.indexOf(form.authMethod) === -1 && m === methods[0]) ? 0 : -1}
                onClick={() => selectMethod(m)}
                className={`rounded-md border px-token-3 py-token-2 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash text-primary' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'}`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </fieldset>
      {protocol?.ssh && (form.authMethod !== 'Username & Password') && (
        <Field id="field-keyFormat" label="Key Format">
          {(db) => <SelectInput id="field-keyFormat" value={form.keyFormat} onChange={(v) => setField('keyFormat', v)} describedBy={db} options={FTP_OPTIONS.keyFormat} />}
        </Field>
      )}
      {fields.map((f) => {
        const meta = CRED_META[f];
        return (
          <Field key={f} id={`field-${f}`} label={meta.label} required error={showError(f) ? errors[f] : null} className={meta.span ? 'sm:col-span-2' : ''}>
            {(db) =>
              meta.type === 'textarea' ? (
                <TextArea id={`field-${f}`} required value={form[f]} onChange={(v) => setField(f, v)} onBlur={() => markTouched(f)} invalid={showError(f)} describedBy={db} placeholder={meta.placeholder} rows={4} />
              ) : (
                <TextInput id={`field-${f}`} required type={meta.type} value={form[f]} onChange={(v) => setField(f, v)} onBlur={() => markTouched(f)} invalid={showError(f)} describedBy={db} placeholder={meta.placeholder} autoComplete={meta.autoComplete} />
              )
            }
          </Field>
        );
      })}
      <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
        <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
        Credentials and keys are encrypted at rest and never displayed after saving. Rotate them from the source's settings.
      </p>
    </Section>
  );
}

/* ---- Section 4: Directory Discovery --------------------------------- */
function DirectoryDiscovery({ form, setField, browseState, onBrowse }) {
  const loading = browseState.status === 'loading';
  const browseAction = (
    <button
      type="button"
      onClick={onBrowse}
      disabled={loading}
      className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {loading ? <IconSpinner /> : <IconFolder />}
      {loading ? 'Browsing…' : 'Refresh'}
    </button>
  );
  return (
    <Section index={4} title="Directory Discovery" description="Browse the remote directory tree and select the target directory." actions={browseAction}>
      {browseState.status === 'idle' ? (
        <p className="sm:col-span-2 m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-4 text-token-sm text-text-secondary-alt">
          Use <span className="font-medium text-text-primary-alt">Browse Directories</span> to list the remote tree and choose a target directory. Testing the connection first confirms the credentials the browse will use.
        </p>
      ) : (
        <div className="sm:col-span-2">
          {browseState.mocked && (
            <div className="mb-token-3 flex items-center gap-token-2 text-token-meta text-warning-strong">
              <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-semibold">Sample data</span>
              MOD-006 has no directory-browse backend yet — this is a simulated remote tree.
            </div>
          )}
          <ul className="flex flex-col gap-token-1">
            {browseState.entries.map((entry) => {
              const selected = form.remoteRoot.trim() === entry.path;
              return (
                <li key={entry.path}>
                  <button
                    type="button"
                    onClick={() => setField('remoteRoot', entry.path)}
                    aria-pressed={selected}
                    className={`flex w-full items-center justify-between gap-token-3 rounded-md border px-token-3 py-token-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
                  >
                    <span className="flex items-center gap-token-2 min-w-0">
                      <IconFolder />
                      <span className={`truncate font-mono text-token-sm ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{entry.path}</span>
                    </span>
                    <span className="shrink-0 text-token-meta text-text-faint">
                      {entry.files} files · {entry.dirs} dirs
                      {selected && <span className="ml-token-2 font-semibold text-primary">Selected</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* ---- Section 5: File Selection Rules -------------------------------- */
function FileSelectionRules({ form, setField }) {
  return (
    <Section index={5} title="File Selection Rules" description="Pattern matching and filters that decide which files are transferred.">
      <Field id="field-filePattern" label="File Pattern / Glob" className="sm:col-span-2" hint="Glob matched against filenames in the selected directory.">
        {(db) => <TextInput id="field-filePattern" value={form.filePattern} onChange={(v) => setField('filePattern', v)} describedBy={db} placeholder="*.{csv,xlsx,json}" />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-recursive" checked={form.recursive} onChange={(v) => setField('recursive', v)} label="Recursive Directory Search" description="Search all subdirectories under the selected root directory." />
        <Toggle id="field-ignoreHidden" checked={form.ignoreHidden} onChange={(v) => setField('ignoreHidden', v)} label="Ignore Hidden Files" description="Skip files and directories beginning with a dot (.)." />
        <Toggle id="field-ignoreSystemFiles" checked={form.ignoreSystemFiles} onChange={(v) => setField('ignoreSystemFiles', v)} label="Ignore System Files" description="Exclude OS-generated files (.DS_Store, Thumbs.db)." />
        <Toggle id="field-includeZeroByte" checked={form.includeZeroByte} onChange={(v) => setField('includeZeroByte', v)} label="Include Zero-Byte Files" description="Process empty files during directory polling. Usually left off." />
      </div>
    </Section>
  );
}

/* ---- Section 6: Transfer Configuration ------------------------------ */
function TransferConfiguration({ form, setField }) {
  return (
    <Section index={6} title="Transfer Configuration" description="Data-transfer direction, overwrite policy, and resume behaviour.">
      <div className="sm:col-span-2">
        <SegmentedControl label="Transfer Direction" value={form.transferDirection} options={FTP_OPTIONS.transferDirection} onChange={(v) => setField('transferDirection', v)} />
      </div>
      <Field id="field-overwritePolicy" label="Overwrite Policy">
        {(db) => <SelectInput id="field-overwritePolicy" value={form.overwritePolicy} onChange={(v) => setField('overwritePolicy', v)} describedBy={db} options={FTP_OPTIONS.overwritePolicy} />}
      </Field>
      <Field id="field-fileEncoding" label="File Encoding">
        {(db) => <SelectInput id="field-fileEncoding" value={form.fileEncoding} onChange={(v) => setField('fileEncoding', v)} describedBy={db} options={FTP_OPTIONS.fileEncoding} />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-resumeTransfers" checked={form.resumeTransfers} onChange={(v) => setField('resumeTransfers', v)} label="Resume Interrupted Transfers" description="Automatically resume partially transferred files after a failure." />
        <Toggle id="field-useTempFile" checked={form.useTempFile} onChange={(v) => setField('useTempFile', v)} label="Use Temporary File During Transfer" description="Write to a .tmp file and rename atomically on completion." />
        <Toggle id="field-archiveAfterTransfer" checked={form.archiveAfterTransfer} onChange={(v) => setField('archiveAfterTransfer', v)} label="Archive Files After Transfer" description="Move successfully ingested files to an archive subdirectory." />
        <Toggle id="field-deleteSourceAfterTransfer" checked={form.deleteSourceAfterTransfer} onChange={(v) => setField('deleteSourceAfterTransfer', v)} label="Delete Source After Transfer" description="Delete source files from the remote server after a successful transfer." />
      </div>
    </Section>
  );
}

/* ---- Section 7: Security Configuration ------------------------------ */
function SecurityConfiguration({ form, protocol, setField }) {
  return (
    <Section index={7} title="Security Configuration" description="SSH/TLS security policies and host-key verification.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-hostKeyVerification" checked={form.hostKeyVerification} onChange={(v) => setField('hostKeyVerification', v)} disabled={!protocol?.ssh} label="SSH Host Key Verification" description={protocol?.ssh ? 'Verify the remote server host-key fingerprint against a known value.' : 'Applies to SSH transports only.'} />
        <Toggle id="field-strictHostKeyChecking" checked={form.strictHostKeyChecking} onChange={(v) => setField('strictHostKeyChecking', v)} disabled={!protocol?.ssh} label="Strict Host Key Checking" description={protocol?.ssh ? 'Reject connections to hosts not present in the known-hosts store.' : 'Applies to SSH transports only.'} />
        <Toggle id="field-requireEncryptedTransport" checked={form.requireEncryptedTransport} onChange={(v) => setField('requireEncryptedTransport', v)} label="Require Encrypted Transport" description="Reject unencrypted connections. SFTP and FTPS are always encrypted." />
      </div>
    </Section>
  );
}

/* ---- Sidebar: live Connection Summary ------------------------------- */
function ConnectionSummary({ form, protocol }) {
  const authFields = FTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const rows = [
    { label: 'Protocol', value: protocol?.name ?? '—' },
    { label: 'Server', value: form.host.trim() || '—' },
    { label: 'Port', value: form.port || '—' },
    { label: 'Auth Method', value: form.authMethod },
    { label: 'Username', value: authFields.includes('username') ? (form.username.trim() || '—') : 'N/A' },
    { label: 'Directory', value: form.remoteRoot.trim() || '—' },
    { label: 'Environment', value: form.environment },
    { label: 'Direction', value: form.transferDirection },
  ];
  const initials = protocol?.ssh ? 'SF' : (protocol?.name?.slice(0, 2).toUpperCase() ?? 'FT');
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connection Summary</h2>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled connection'}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{protocol?.name ?? '—'} · {form.environment}</p>
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
function ConnectionStatus({ testState, protocol }) {
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
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Connection Time</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.latencyMs} ms</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Network Latency</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.networkLatencyMs} ms</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Transfer Speed</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.transferSpeed}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Server Software</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.server?.software ?? '—'}</dd></div>
          {protocol?.ssh && r.server?.hostKey && <div className="flex items-center justify-between"><dt className="text-token-meta text-text-faint">Host Key</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.server.hostKey}</dd></div>}
        </dl>
      )}
      {testState.status === 'idle' && <p className="m-0 mt-token-2 text-token-meta text-text-faint">Run “Test Connection” to verify reachability before saving the source.</p>}
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
          Everything looks ready to save.
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
function ConfirmDialog({ form, protocol, connectionTested, submitting, onCancel, onConfirm }) {
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

  const initials = protocol?.ssh ? 'SF' : (protocol?.name?.slice(0, 2).toUpperCase() ?? 'FT');
  const rows = [
    { label: 'Protocol', value: protocol?.name ?? '—' },
    { label: 'Server', value: `${form.host.trim() || '—'}${form.port ? `:${form.port}` : ''}` },
    { label: 'Auth', value: form.authMethod },
    { label: 'Directory', value: form.remoteRoot.trim() || '—' },
    { label: 'Direction', value: form.transferDirection },
    { label: 'Verified', value: connectionTested ? 'Yes' : 'Not tested' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-ftp-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-ftp-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm File-Transfer Source</h2>
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
            <p className="m-0 truncate text-token-meta text-text-faint">{protocol?.name ?? '—'} · {form.environment}</p>
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
              The file-transfer connector is registered, connectivity is verified, and the remote directory is scanned to catalogue matching files.
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconCheck className="h-3.5 w-3.5" />}
            {submitting ? 'Saving…' : 'Validate & Save Connection'}
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

function IconFolder() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h3l1.5 1.5H13a1.5 1.5 0 0 1 1.5 1.5v5.5A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5V4.5Z" />
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

