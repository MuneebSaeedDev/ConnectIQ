import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  SFTP_TRANSPORT,
  SFTP_OPTIONS,
  SFTP_AUTH_METHODS,
  SFTP_AUTH_FIELD_MAP,
  SFTP_TRIGGER_TYPES,
  NEGOTIATED_SUITE,
  SAMPLE_MATCHES,
  ORG_ID,
  browseSftpDirectories,
  createSftpSource,
  testSftpConnection,
} from '../services/sftpConnection.api';

/* Field styling — mirrors SCR-052 so the data-source forms read
   identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const HOSTNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

/** Empty form — seeded with the GlobalBank example from the Figma frame. */
const INITIAL_FORM = {
  // 1. Connection Configuration
  name: '',
  environment: 'Production',
  connectionProfile: 'High-Security Profile',
  description: '',
  // 2. Server Configuration
  host: '',
  port: '22',
  remoteRoot: '',
  workingDirectory: '',
  connectionTimeout: '30',
  sessionTimeout: '3600',
  keepAliveInterval: '60',
  sshCompression: false,
  ipv6Preferred: false,
  // 3. SSH Authentication
  authMethod: 'SSH Private Key',
  username: '',
  password: '',
  privateKey: '',
  passphrase: '',
  publicKeyFingerprint: '',
  keyAlgorithm: 'ed25519',
  keyFormat: 'OpenSSH',
  keySource: 'Enterprise Vault (Active)',
  // 4. SSH Security
  strictHostKeyVerification: true,
  knownHostsValidation: true,
  hostFingerprintPinning: true,
  requireStrongHostKey: true,
  fipsRestriction: false,
  mutualAuthRequired: false,
  // 5. File Discovery Rules
  filePattern: '*.{csv,json,xml,gz}',
  regexOverride: '',
  minFileSize: '1',
  maxFileSize: '2048',
  recursive: false,
  ignoreHidden: true,
  ignoreTempFiles: true,
  includeSymlinks: false,
  includeZeroByte: false,
  sortOrder: 'Modified Descending (Newest First)',
  // 6. Transfer Configuration
  transferDirection: 'Download Only',
  overwritePolicy: 'Skip Existing',
  concurrentTransfers: '4',
  fileEncoding: 'Auto-detect',
  resumeTransfers: true,
  atomicWrite: true,
  archiveAfterTransfer: false,
  deleteSourceAfterTransfer: false,
  checksumVerification: true,
  archiveDirectory: '',
  tempFileSuffix: '.etl.tmp',
  // 7. Scheduling and Automation
  triggerType: 'Scheduled',
  scheduleFrequency: 'Daily',
  cronExpression: '0 6 * * *',
  pollingInterval: '5',
  startTime: '',
  timezone: 'UTC',
  maxRetries: '5',
  retryDelay: '60',
  retryStrategy: 'Exponential Backoff',
  autoReconnect: true,
  reconnectOnHostKeyChange: false,
  // 8. Failure Notifications / Monitoring
  notificationEmail: '',
  alertThreshold: '3',
  securityAlertOnAuthFailure: true,
  pagerDutyEscalation: false,
  connectionMonitoring: true,
  transferMonitoring: true,
  auditLogging: true,
  securityEventLogging: true,
  failedAuthAlerts: true,
  failedTransferAlerts: true,
  performanceMetrics: true,
  activityRetention: true,
};

/* Credential field metadata for the auth section. */
const CRED_META = {
  username: { label: 'Username', type: 'text', placeholder: 'etl_svc_gb', autoComplete: 'username', span: false },
  password: { label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password', span: false },
  privateKey: { label: 'Private Key', type: 'textarea', placeholder: '-----BEGIN OPENSSH PRIVATE KEY-----', autoComplete: 'off', span: true },
  passphrase: { label: 'Key Passphrase', type: 'password', placeholder: '••••••••', autoComplete: 'off', span: false },
  publicKeyFingerprint: { label: 'Public Key Fingerprint (SHA-256)', type: 'text', placeholder: 'SHA256:…', autoComplete: 'off', span: true },
};

/* Required-field validation. */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Connection name is required.';

  if (!form.host.trim()) errors.host = 'Server host is required.';
  else if (!HOSTNAME_PATTERN.test(form.host.trim())) errors.host = 'Enter a valid hostname or IP.';

  const port = Number(form.port);
  if (!form.port.trim()) errors.port = 'Port is required.';
  else if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = 'Port must be 1–65535.';

  const authFields = SFTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  for (const f of authFields) {
    if (!String(form[f] ?? '').trim()) {
      errors[f] = 'This credential is required for the selected authentication method.';
    }
  }

  for (const [key, label] of [
    ['connectionTimeout', 'connection timeout'],
    ['sessionTimeout', 'session timeout'],
    ['keepAliveInterval', 'keep-alive interval'],
  ]) {
    const n = Number(form[key]);
    if (!Number.isInteger(n) || n < 1) errors[key] = `Enter a positive ${label} in seconds.`;
  }

  const streams = Number(form.concurrentTransfers);
  if (!Number.isInteger(streams) || streams < 1 || streams > 32) {
    errors.concurrentTransfers = 'Concurrent transfers must be 1–32.';
  }

  if (form.notificationEmail.trim()) {
    const emails = form.notificationEmail.split(',').map((e) => e.trim()).filter(Boolean);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emails.every((e) => emailRe.test(e))) {
      errors.notificationEmail = 'Enter valid comma-separated email addresses.';
    }
  }
  return errors;
}

/* Validation checklist mirroring the Figma right-rail. Where a connection
   test has run, its reported checks are the source of truth (so the
   checklist and the test-result panel never disagree); otherwise the
   items are derived from the form state gathered so far. */
function computeChecklist(form, testState) {
  const connectionTested = testState.status === 'success';
  const testChecks = testState.result?.checks ?? [];
  const testCheck = (key) => testChecks.find((c) => c.key === key);
  const authFields = SFTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const authOk = authFields.every((f) => String(form[f] ?? '').trim());
  // Write permission is only meaningful when the transfer writes to the
  // remote; a Download-Only source neither needs nor tests it.
  const writeRelevant = form.transferDirection !== 'Download Only';
  const writeVerified = connectionTested
    ? (writeRelevant ? testCheck('write')?.ok === true : true)
    : false;
  return [
    { key: 'reachable', label: 'Server Reachable', done: connectionTested ? testCheck('reachable')?.ok === true : (!!form.host.trim() && !!form.port.trim()) },
    { key: 'handshake', label: 'SSH Handshake Successful', done: connectionTested ? testCheck('handshake')?.ok !== false : false },
    { key: 'hostkey', label: 'Host Key Verified', done: connectionTested ? testCheck('hostkey')?.ok !== false : false },
    { key: 'auth', label: 'Authentication Successful', done: connectionTested ? testCheck('auth')?.ok !== false : authOk },
    { key: 'directory', label: 'Directory Accessible', done: connectionTested ? testCheck('directory')?.ok !== false : !!form.remoteRoot.trim() },
    { key: 'read', label: 'Read Permission Verified', done: connectionTested ? testCheck('read')?.ok !== false : false },
    { key: 'write', label: writeRelevant ? 'Write Permission Verified' : 'Write Permission (not required)', done: writeVerified },
    { key: 'ready', label: 'Ready for Production Use', done: connectionTested && authOk && !!form.remoteRoot.trim() && writeVerified },
  ];
}

/** SCR-053 — SFTP Connection Screen. Node 122:41785. */
export default function SftpConnectionScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [testState, setTestState] = useState({ status: 'idle', result: null, mocked: false });
  const [browseState, setBrowseState] = useState({ status: 'idle', entries: [], meta: null, mocked: false });

  const errors = useMemo(() => validate(form), [form]);
  const connectionTested = testState.status === 'success';
  const checklist = useMemo(() => computeChecklist(form, testState), [form, testState]);
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

  /* Switching auth method invalidates a prior connection test since the
     credentials that would be used have changed. */
  function setAuthMethod(method) {
    setField('authMethod', method);
    setTestState({ status: 'idle', result: null, mocked: false });
  }

  async function handleTestConnection() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await testSftpConnection(ORG_ID, buildPayload(form));
    setTestState({ status: result.success ? 'success' : 'error', result, mocked: !!result.mocked });
  }

  async function handleBrowse() {
    setBrowseState({ status: 'loading', entries: [], meta: null, mocked: false });
    const result = await browseSftpDirectories(ORG_ID, buildPayload(form));
    setBrowseState({
      status: 'ready',
      entries: result.entries ?? [],
      meta: { storage: result.storage ?? null, lastSync: result.lastSync ?? null },
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
    const result = await createSftpSource(ORG_ID, buildPayload(form));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the SFTP connector, verify the SSH handshake and host key, and continue to directory discovery.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'SFTP source created.' });
      navigate('/data-sources');
    }
  }

  const submitted = submitState.status === 'mocked';

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'SFTP Connection']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate(submitted ? '/data-sources' : '/data-sources/new/connection')} isValid={isValid} submitted={submitted} onBrowse={handleBrowse} browsing={browseState.status === 'loading'} onTest={handleTestConnection} testing={testState.status === 'testing'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating SFTP source'
            : submitted
              ? 'SFTP source simulated — no backend available'
              : testState.status === 'testing'
                ? 'Testing SSH connection'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitted && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated SFTP source (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <ConnectionConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <ServerConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} testState={testState} onTest={handleTestConnection} />
            <Authentication form={form} setField={setField} setAuthMethod={setAuthMethod} showError={showError} markTouched={markTouched} errors={errors} />
            <SshSecurity form={form} setField={setField} testState={testState} />
            <DirectoryDiscovery form={form} setField={setField} browseState={browseState} onBrowse={handleBrowse} />
            <FileDiscoveryRules form={form} setField={setField} />
            <TransferConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <SchedulingAutomation form={form} setField={setField} />
            <MonitoringAudit form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <ConnectionSummary form={form} testState={testState} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <SshSecurityReview form={form} testState={testState} />
            <TransferSummary form={form} />
            <ConnectionHealth testState={testState} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate(submitted ? '/data-sources' : '/data-sources/new/connection')} submitted={submitted} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
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
  const authFields = SFTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const credentials = Object.fromEntries(authFields.map((f) => [f, String(form[f] ?? '').trim()]));
  return {
    connectorId: SFTP_TRANSPORT.id,
    protocol: SFTP_TRANSPORT.protocol,
    general: {
      name: form.name.trim(),
      environment: form.environment,
      connectionProfile: form.connectionProfile,
      description: form.description.trim() || null,
    },
    server: {
      host: form.host.trim() || null,
      port: form.port ? Number(form.port) : null,
      remoteRoot: form.remoteRoot.trim() || null,
      workingDirectory: form.workingDirectory.trim() || null,
      connectionTimeout: Number(form.connectionTimeout) || null,
      sessionTimeout: Number(form.sessionTimeout) || null,
      keepAliveInterval: Number(form.keepAliveInterval) || null,
      sshCompression: form.sshCompression,
      ipv6Preferred: form.ipv6Preferred,
    },
    authentication: {
      method: form.authMethod,
      keyAlgorithm: form.keyAlgorithm,
      keyFormat: form.keyFormat,
      keySource: form.keySource,
      credentials,
    },
    security: {
      strictHostKeyVerification: form.strictHostKeyVerification,
      knownHostsValidation: form.knownHostsValidation,
      hostFingerprintPinning: form.hostFingerprintPinning,
      requireStrongHostKey: form.requireStrongHostKey,
      fipsRestriction: form.fipsRestriction,
      mutualAuthRequired: form.mutualAuthRequired,
    },
    fileDiscovery: {
      pattern: form.filePattern.trim() || null,
      regexOverride: form.regexOverride.trim() || null,
      minFileSizeKb: Number(form.minFileSize) || null,
      maxFileSizeMb: Number(form.maxFileSize) || null,
      recursive: form.recursive,
      ignoreHidden: form.ignoreHidden,
      ignoreTempFiles: form.ignoreTempFiles,
      includeSymlinks: form.includeSymlinks,
      includeZeroByte: form.includeZeroByte,
      sortOrder: form.sortOrder,
    },
    transfer: {
      direction: form.transferDirection,
      overwritePolicy: form.overwritePolicy,
      concurrentTransfers: Number(form.concurrentTransfers) || null,
      encoding: form.fileEncoding,
      resume: form.resumeTransfers,
      atomicWrite: form.atomicWrite,
      archiveAfterTransfer: form.archiveAfterTransfer,
      deleteSourceAfterTransfer: form.deleteSourceAfterTransfer,
      checksumVerification: form.checksumVerification,
      archiveDirectory: form.archiveDirectory.trim() || null,
      tempFileSuffix: form.tempFileSuffix.trim() || null,
    },
    scheduling: {
      triggerType: form.triggerType,
      scheduleFrequency: form.scheduleFrequency,
      cronExpression: form.cronExpression.trim() || null,
      pollingInterval: Number(form.pollingInterval) || null,
      startTime: form.startTime || null,
      timezone: form.timezone,
      maxRetries: Number(form.maxRetries) || null,
      retryDelay: Number(form.retryDelay) || null,
      retryStrategy: form.retryStrategy,
      autoReconnect: form.autoReconnect,
      reconnectOnHostKeyChange: form.reconnectOnHostKeyChange,
    },
    monitoring: {
      notificationEmail: form.notificationEmail.trim() || null,
      alertThreshold: Number(form.alertThreshold) || null,
      securityAlertOnAuthFailure: form.securityAlertOnAuthFailure,
      pagerDutyEscalation: form.pagerDutyEscalation,
      connectionMonitoring: form.connectionMonitoring,
      transferMonitoring: form.transferMonitoring,
      auditLogging: form.auditLogging,
      securityEventLogging: form.securityEventLogging,
      failedAuthAlerts: form.failedAuthAlerts,
      failedTransferAlerts: form.failedTransferAlerts,
      performanceMetrics: form.performanceMetrics,
      activityRetention: form.activityRetention,
    },
  };
}

/* ---- Shared field primitives (mirrors SCR-052) --------------------- */
function Section({ index, title, description, children, actions, status }) {
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
        <div className="flex shrink-0 items-center gap-token-2">
          {status}
          {actions}
        </div>
      </div>
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function StatusPill({ label, tone = 'success' }) {
  const tones = {
    success: 'border-success bg-success-bg text-success',
    neutral: 'border-border bg-surface-muted text-text-secondary-alt',
  };
  return <span className={`flex items-center gap-token-1 rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${tones[tone]}`}>{label}</span>;
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

/* ---- Header & action bar -------------------------------------------- */
function Header({ onCancel, isValid, submitted, onBrowse, browsing, onTest, testing }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">SFTP Connection</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Configure, validate, and manage a secure SSH-based file-transfer source over an encrypted SSH-2.0 channel.
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
        <button type="button" onClick={onTest} disabled={testing} className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {testing ? <IconSpinner /> : <IconPlug />}
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'SFTP source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'SFTP source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconCheck className="h-3.5 w-3.5" />
          Validate &amp; Save Connection
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Connection Configuration ---------------------------- */
function ConnectionConfiguration({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={1} title="Connection Configuration" description="Define the SFTP connection identity, environment, and organization.">
      <div className="sm:col-span-2 flex items-start gap-token-3 rounded-md border border-primary bg-shell-accent-wash px-token-4 py-token-3">
        <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-token-2">
            <span className="text-token-sm font-semibold text-primary">SSH File Transfer Protocol (SFTP)</span>
            <span className="rounded-sm border border-success bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success">{SFTP_TRANSPORT.protocol}</span>
          </span>
          <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
            All data is transferred over an encrypted SSH-2 channel. Supports password, public-key, and certificate authentication.
          </p>
        </div>
      </div>
      <Field id="field-name" label="Connection Name" required error={showError('name') ? errors.name : null} hint="A unique, human-readable name for this SFTP source.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="etl-sftp-globalbank" />}
      </Field>
      <Field id="field-environment" label="Environment" required>
        {(db) => <SelectInput id="field-environment" value={form.environment} onChange={(v) => setField('environment', v)} describedBy={db} options={SFTP_OPTIONS.environment} />}
      </Field>
      <Field id="field-connectionProfile" label="Connection Profile">
        {(db) => <SelectInput id="field-connectionProfile" value={form.connectionProfile} onChange={(v) => setField('connectionProfile', v)} describedBy={db} options={SFTP_OPTIONS.connectionProfile} />}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2" hint="Optional — describe what this transfer source is used for.">
        {(db) => <TextArea id="field-description" value={form.description} onChange={(v) => setField('description', v)} describedBy={db} rows={2} placeholder="Nightly GlobalBank settlement & compliance drop." />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Server Configuration -------------------------------- */
function ServerConfiguration({ form, setField, showError, markTouched, errors, testState, onTest }) {
  const testing = testState.status === 'testing';
  const validated = testState.status === 'success';
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
  const server = testState.result?.server ?? {};
  return (
    <Section index={2} title="Server Configuration" description="Remote SFTP server host, port, directory roots, session timeouts, and transport." actions={testAction} status={validated ? <StatusPill label="Validated" /> : null}>
      <Field id="field-host" label="Server Host" required error={showError('host') ? errors.host : null}>
        {(db) => <TextInput id="field-host" required value={form.host} onChange={(v) => setField('host', v)} onBlur={() => markTouched('host')} invalid={showError('host')} describedBy={db} placeholder="sftp.globalbank-exchange.com" />}
      </Field>
      <Field id="field-port" label="Port" required error={showError('port') ? errors.port : null} hint="Default SSH port is 22.">
        {(db) => <TextInput id="field-port" required inputMode="numeric" value={form.port} onChange={(v) => setField('port', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('port')} invalid={showError('port')} describedBy={db} placeholder="22" />}
      </Field>
      <Field id="field-remoteRoot" label="Remote Root Directory" hint="Base path the connector treats as the source root.">
        {(db) => <TextInput id="field-remoteRoot" value={form.remoteRoot} onChange={(v) => setField('remoteRoot', v)} describedBy={db} placeholder="/data/exchange/etl" />}
      </Field>
      <Field id="field-workingDirectory" label="Default Working Directory" hint="Optional — directory selected after connect.">
        {(db) => <TextInput id="field-workingDirectory" value={form.workingDirectory} onChange={(v) => setField('workingDirectory', v)} describedBy={db} placeholder="/data/exchange/etl/inbound" />}
      </Field>
      <Field id="field-connectionTimeout" label="Connection Timeout (seconds)" error={showError('connectionTimeout') ? errors.connectionTimeout : null}>
        {(db) => <TextInput id="field-connectionTimeout" inputMode="numeric" value={form.connectionTimeout} onChange={(v) => setField('connectionTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('connectionTimeout')} invalid={showError('connectionTimeout')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-sessionTimeout" label="Session Timeout (seconds)" error={showError('sessionTimeout') ? errors.sessionTimeout : null}>
        {(db) => <TextInput id="field-sessionTimeout" inputMode="numeric" value={form.sessionTimeout} onChange={(v) => setField('sessionTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('sessionTimeout')} invalid={showError('sessionTimeout')} describedBy={db} placeholder="3600" />}
      </Field>
      <Field id="field-keepAliveInterval" label="Keep-Alive Interval (seconds)" error={showError('keepAliveInterval') ? errors.keepAliveInterval : null}>
        {(db) => <TextInput id="field-keepAliveInterval" inputMode="numeric" value={form.keepAliveInterval} onChange={(v) => setField('keepAliveInterval', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('keepAliveInterval')} invalid={showError('keepAliveInterval')} describedBy={db} placeholder="60" />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-sshCompression" checked={form.sshCompression} onChange={(v) => setField('sshCompression', v)} label="SSH Transport Compression" description="Compress SSH channel payload using zlib. Reduces bandwidth on high-latency links; adds CPU usage on high-speed links." />
        <Toggle id="field-ipv6Preferred" checked={form.ipv6Preferred} onChange={(v) => setField('ipv6Preferred', v)} label="IPv6 Preferred" description="Prefer IPv6 address resolution when both A and AAAA DNS records are available for the server host." />
      </div>

      {validated && (
        <dl className="sm:col-span-2 grid grid-cols-2 gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3 sm:grid-cols-4">
          <div><dt className="text-token-meta text-text-faint">Server Software</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.software ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Host Key Type</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.hostKeyType ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Resolved IP</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.resolvedIp ?? '—'}</dd></div>
          <div><dt className="text-token-meta text-text-faint">Server OS</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{server.serverOs ?? '—'}</dd></div>
        </dl>
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
          {ok ? 'SSH connection successful' : 'Connection failed'}
        </span>
        {mocked && <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample data</span>}
      </div>
      <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center gap-token-2 text-token-meta text-text-primary-alt">
            {c.ok ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconCircle className="h-3 w-3 shrink-0 text-warning" />}
            {c.label}
          </li>
        ))}
      </ul>
      {mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no connection-test backend yet — this is a simulated SFTP handshake result.</p>}
    </div>
  );
}

/* ---- Section 3: SSH Authentication ---------------------------------- */
function Authentication({ form, setField, setAuthMethod, showError, markTouched, errors }) {
  const methods = SFTP_AUTH_METHODS;
  const fields = SFTP_AUTH_FIELD_MAP[form.authMethod] ?? [];
  const usesKey = form.authMethod !== 'Username & Password';
  const radiogroupRef = useRef(null);
  const selectMethod = (m) => {
    setAuthMethod(m);
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
    <Section index={3} title="SSH Authentication" description="Secure credential and SSH key material configuration — sensitive values are encrypted at rest." status={usesKey ? <StatusPill label={`${form.keyAlgorithm} Key`} tone="neutral" /> : null}>
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
      {usesKey && (
        <>
          <Field id="field-keyAlgorithm" label="Key Algorithm">
            {(db) => <SelectInput id="field-keyAlgorithm" value={form.keyAlgorithm} onChange={(v) => setField('keyAlgorithm', v)} describedBy={db} options={SFTP_OPTIONS.keyAlgorithm} />}
          </Field>
          <Field id="field-keyFormat" label="Key Format">
            {(db) => <SelectInput id="field-keyFormat" value={form.keyFormat} onChange={(v) => setField('keyFormat', v)} describedBy={db} options={SFTP_OPTIONS.keyFormat} />}
          </Field>
          <Field id="field-keySource" label="Key Source" className="sm:col-span-2">
            {(db) => <SelectInput id="field-keySource" value={form.keySource} onChange={(v) => setField('keySource', v)} describedBy={db} options={SFTP_OPTIONS.keySource} />}
          </Field>
        </>
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
        Credentials and keys are encrypted at rest and never displayed after saving. Key material can be sourced from the enterprise vault and rotated on a schedule from the source's settings.
      </p>
    </Section>
  );
}

/* ---- Section 4: SSH Security ---------------------------------------- */
function SshSecurity({ form, setField, testState }) {
  const validated = testState.status === 'success';
  const suite = testState.result?.suite ?? NEGOTIATED_SUITE;
  const hostKey = testState.result?.server?.hostKey ?? null;
  return (
    <Section index={4} title="SSH Security" description="Host-key verification, known-hosts policy, cipher suite, and compliance enforcement." status={validated ? <StatusPill label="Verified" /> : <StatusPill label="Not tested" tone="neutral" />}>
      {validated && hostKey && (
        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-token-2 rounded-md border border-success bg-success-bg px-token-4 py-token-2">
          <span className="flex items-center gap-token-2 text-token-meta font-medium text-success">
            <IconCheck className="h-3 w-3 shrink-0" />
            Host key verified
          </span>
          <span className="truncate font-mono text-token-meta text-text-primary-alt" title={hostKey}>{hostKey}</span>
        </div>
      )}
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-strictHostKeyVerification" checked={form.strictHostKeyVerification} onChange={(v) => setField('strictHostKeyVerification', v)} label="Strict Host Key Verification" description="Reject SSH connections to hosts not present in the known-hosts store. Recommended for production." />
        <Toggle id="field-knownHostsValidation" checked={form.knownHostsValidation} onChange={(v) => setField('knownHostsValidation', v)} label="Known Hosts Validation" description="Validate the server host key against the enterprise known-hosts registry before establishing the session." />
        <Toggle id="field-hostFingerprintPinning" checked={form.hostFingerprintPinning} onChange={(v) => setField('hostFingerprintPinning', v)} label="Host Fingerprint Pinning" description="Reject the session if the server host-key fingerprint does not match the pinned value." />
        <Toggle id="field-requireStrongHostKey" checked={form.requireStrongHostKey} onChange={(v) => setField('requireStrongHostKey', v)} label="Require ed25519 or ECDSA Host Key" description="Reject connections to servers advertising RSA-1024 or weaker host keys." />
        <Toggle id="field-fipsRestriction" checked={form.fipsRestriction} onChange={(v) => setField('fipsRestriction', v)} label="FIPS 140-2 Algorithm Restriction" description="Restrict all SSH algorithms to FIPS 140-2 approved selections. Required for FedRAMP, FISMA, and regulated workloads." />
        <Toggle id="field-mutualAuthRequired" checked={form.mutualAuthRequired} onChange={(v) => setField('mutualAuthRequired', v)} label="Mutual Authentication Required" description="Require the server to prove its identity using a pre-registered certificate in addition to standard host-key verification." />
      </div>
      <div className="sm:col-span-2">
        <div className="mb-token-2 flex flex-wrap items-center gap-token-2">
          <p className="m-0 text-token-sm font-medium text-text-secondary-alt">{validated ? 'Negotiated SSH Algorithm Suite' : 'Proposed SSH Algorithm Suite'}</p>
          {!validated && <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample data</span>}
        </div>
        {!validated && (
          <p className="m-0 mb-token-2 text-token-meta text-text-faint">These are the algorithms this security policy would prefer. The actual negotiated suite is confirmed once you run a connection test.</p>
        )}
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="px-token-3 py-token-2 text-token-meta font-semibold text-text-secondary-alt">Algorithm Type</th>
                <th scope="col" className="px-token-3 py-token-2 text-token-meta font-semibold text-text-secondary-alt">{validated ? 'Negotiated' : 'Preferred'}</th>
                <th scope="col" className="px-token-3 py-token-2 text-token-meta font-semibold text-text-secondary-alt">Policy</th>
                <th scope="col" className="px-token-3 py-token-2 text-right text-token-meta font-semibold text-text-secondary-alt">Grade</th>
              </tr>
            </thead>
            <tbody>
              {suite.map((row) => (
                <tr key={row.key} className="border-t border-border-subtle">
                  <td className="px-token-3 py-token-2 text-token-meta text-text-secondary-alt">{row.type}</td>
                  <td className="px-token-3 py-token-2 font-mono text-token-meta text-text-primary-alt">{row.negotiated}</td>
                  <td className="px-token-3 py-token-2 text-token-meta text-text-secondary-alt">{row.policy}</td>
                  <td className="px-token-3 py-token-2 text-right">
                    <span className={`inline-block rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${row.grade.startsWith('A') ? 'bg-success-bg text-success' : 'bg-surface-muted text-text-faint'}`}>{row.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

/* ---- Section 5: Directory Discovery --------------------------------- */
function DirectoryDiscovery({ form, setField, browseState, onBrowse }) {
  const [query, setQuery] = useState('');
  const loading = browseState.status === 'loading';
  const connected = browseState.status === 'ready';
  const filtered = browseState.entries.filter((e) => e.path.toLowerCase().includes(query.trim().toLowerCase()));
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
    <Section index={5} title="Directory Discovery" description="Remote directory tree — browse and select the target directory over the SSH session." actions={browseAction} status={connected ? <StatusPill label="Connected" /> : null}>
      {browseState.status === 'idle' ? (
        <p className="sm:col-span-2 m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-4 text-token-sm text-text-secondary-alt">
          Use <span className="font-medium text-text-primary-alt">Browse Directories</span> to list the remote tree over the SSH session and choose a target directory. Testing the connection first confirms the credentials the browse will use.
        </p>
      ) : (
        <div className="sm:col-span-2">
          {browseState.mocked && (
            <div className="mb-token-3 flex items-center gap-token-2 text-token-meta text-warning-strong">
              <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-semibold">Sample data</span>
              MOD-006 has no directory-browse backend yet — this is a simulated remote tree.
            </div>
          )}
          <div className="mb-token-3">
            <label htmlFor="field-dirSearch" className="sr-only">Search remote directories</label>
            <input
              id="field-dirSearch"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search remote directories…"
              className={fieldBase}
            />
          </div>
          <ul className="flex flex-col gap-token-1">
            {filtered.map((entry) => {
              const selected = form.remoteRoot.trim() === entry.path;
              const noAccess = entry.access === false;
              return (
                <li key={entry.path}>
                  <button
                    type="button"
                    onClick={() => !noAccess && setField('remoteRoot', entry.path)}
                    disabled={noAccess}
                    aria-pressed={selected}
                    className={`flex w-full items-center justify-between gap-token-3 rounded-md border px-token-3 py-token-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${noAccess ? 'border-danger-border bg-danger-bg opacity-80' : selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
                  >
                    <span className="flex min-w-0 items-center gap-token-2">
                      <IconFolder />
                      <span className={`truncate font-mono text-token-sm ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{entry.path}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-token-2 text-token-meta text-text-faint">
                      {noAccess ? (
                        <span className="font-semibold text-danger">No access</span>
                      ) : (
                        <>
                          {entry.files} files · {entry.dirs} dirs
                          {selected && <span className="font-semibold text-primary">Selected</span>}
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border bg-surface-muted px-token-3 py-token-3 text-token-meta text-text-secondary-alt">No directories match “{query}”.</li>
            )}
          </ul>
          <div className="mt-token-3 flex flex-wrap items-center justify-between gap-token-2 text-token-meta text-text-faint">
            <span>
              {form.remoteRoot.trim() ? <>Selected: <span className="font-mono text-text-primary-alt">{form.remoteRoot.trim()}</span></> : 'No target directory selected yet.'}
            </span>
            {browseState.meta?.storage && (
              <span>Storage: {browseState.meta.storage.used} used / {browseState.meta.storage.total} total{browseState.meta.lastSync ? ` · Last sync: ${browseState.meta.lastSync}` : ''}</span>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---- Section 6: File Discovery Rules -------------------------------- */
function FileDiscoveryRules({ form, setField }) {
  return (
    <Section index={6} title="File Discovery Rules" description="Pattern matching, extension filters, size limits, and recursive discovery.">
      <Field id="field-filePattern" label="File Glob Pattern" hint="Glob matched against filenames in the selected directory.">
        {(db) => <TextInput id="field-filePattern" value={form.filePattern} onChange={(v) => setField('filePattern', v)} describedBy={db} placeholder="*.{csv,json,xml,gz}" />}
      </Field>
      <Field id="field-regexOverride" label="Regular Expression Override" hint="Optional — takes precedence over the glob when set.">
        {(db) => <TextInput id="field-regexOverride" value={form.regexOverride} onChange={(v) => setField('regexOverride', v)} describedBy={db} placeholder="^[a-z0-9_]+_\d{8}\.(csv|json)$" />}
      </Field>
      <Field id="field-minFileSize" label="Min File Size (KB)">
        {(db) => <TextInput id="field-minFileSize" inputMode="numeric" value={form.minFileSize} onChange={(v) => setField('minFileSize', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="1" />}
      </Field>
      <Field id="field-maxFileSize" label="Max File Size (MB)">
        {(db) => <TextInput id="field-maxFileSize" inputMode="numeric" value={form.maxFileSize} onChange={(v) => setField('maxFileSize', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="2048" />}
      </Field>
      <Field id="field-sortOrder" label="Sort Order" className="sm:col-span-2">
        {(db) => <SelectInput id="field-sortOrder" value={form.sortOrder} onChange={(v) => setField('sortOrder', v)} describedBy={db} options={SFTP_OPTIONS.sortOrder} />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-recursive" checked={form.recursive} onChange={(v) => setField('recursive', v)} label="Recursive Directory Discovery" description="Search all subdirectories under the selected root directory." />
        <Toggle id="field-ignoreHidden" checked={form.ignoreHidden} onChange={(v) => setField('ignoreHidden', v)} label="Ignore Hidden Files" description="Skip files and directories starting with a dot (.)." />
        <Toggle id="field-ignoreTempFiles" checked={form.ignoreTempFiles} onChange={(v) => setField('ignoreTempFiles', v)} label="Ignore Temporary Files" description="Skip files with extensions .tmp, .part, .crdownload — typically incomplete uploads." />
        <Toggle id="field-includeSymlinks" checked={form.includeSymlinks} onChange={(v) => setField('includeSymlinks', v)} label="Include Symbolic Links" description="Follow symbolic links during directory listing. May expose directories outside the root." />
        <Toggle id="field-includeZeroByte" checked={form.includeZeroByte} onChange={(v) => setField('includeZeroByte', v)} label="Include Zero-Byte Files" description="Process empty files. Usually disabled to prevent ingesting partial writes." />
      </div>
      <div className="sm:col-span-2">
        <div className="mb-token-2 flex flex-wrap items-center gap-token-2">
          <p className="m-0 text-token-sm font-medium text-text-secondary-alt">Pattern Match Preview — {form.remoteRoot.trim() || '/data/exchange/etl/inbound'}</p>
          <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample data</span>
        </div>
        <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md border border-border">
          {SAMPLE_MATCHES.map((m) => (
            <li key={m.name} className="flex items-center justify-between gap-token-3 bg-surface-card px-token-3 py-token-2">
              <span className="flex min-w-0 items-center gap-token-2">
                <IconFile />
                <span className="truncate font-mono text-token-meta text-text-primary-alt">{m.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-token-3 text-token-meta text-text-faint">
                <span>{m.size}</span>
                <span className="hidden sm:inline">{m.modified}</span>
                <span className="rounded-sm bg-success-bg px-token-2 py-0.5 font-semibold text-success">Match</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-token-2 text-token-meta text-text-faint">MOD-006 has no directory-listing backend yet — this is a sample preview of how <span className="font-mono text-text-secondary-alt">{form.regexOverride.trim() || form.filePattern.trim() || '*'}</span> would match. A live listing populates it once you browse the remote directory.</p>
      </div>
    </Section>
  );
}

/* ---- Section 7: Transfer Configuration ------------------------------ */
const TRANSFER_DIRECTIONS = [
  { id: 'Download Only', label: 'Download Only', description: 'Ingest files from the remote SFTP server into the platform.' },
  { id: 'Upload Only', label: 'Upload Only', description: 'Distribute processed data from the platform to the remote SFTP server.' },
  { id: 'Bi-directional Sync', label: 'Bi-directional Sync', description: 'Full synchronization between the platform and the remote server.' },
];

function TransferConfiguration({ form, setField, showError, markTouched, errors }) {
  const radiogroupRef = useRef(null);
  const order = TRANSFER_DIRECTIONS.map((d) => d.id);
  const selectDirection = (id) => {
    setField('transferDirection', id);
    const el = radiogroupRef.current?.querySelector(`[data-direction="${CSS.escape(id)}"]`);
    if (el) el.focus();
  };
  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = order.indexOf(form.transferDirection);
    const base = current === -1 ? 0 : current;
    selectDirection(order[(base + delta + order.length) % order.length]);
  };
  return (
    <Section index={7} title="Transfer Configuration" description="Transfer direction, concurrency, overwrite policy, archive behaviour, and temporary-file handling.">
      <fieldset ref={radiogroupRef} role="radiogroup" aria-label="Transfer direction" onKeyDown={onKeyDown} className="sm:col-span-2 m-0 flex min-w-0 flex-col gap-token-2 border-0 p-0">
        <legend className="mb-token-1 p-0 text-token-sm font-medium text-text-secondary-alt">Transfer Direction</legend>
        {TRANSFER_DIRECTIONS.map((d, i) => {
          const selected = form.transferDirection === d.id;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              data-direction={d.id}
              aria-checked={selected}
              tabIndex={selected || (order.indexOf(form.transferDirection) === -1 && i === 0) ? 0 : -1}
              onClick={() => selectDirection(d.id)}
              className={`flex items-start gap-token-3 rounded-md border px-token-4 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
            >
              <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary' : 'border-border'}`}>
                {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="flex flex-col">
                <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{d.label}</span>
                <span className="text-token-meta text-text-faint">{d.description}</span>
              </span>
            </button>
          );
        })}
      </fieldset>
      <Field id="field-overwritePolicy" label="Overwrite Policy">
        {(db) => <SelectInput id="field-overwritePolicy" value={form.overwritePolicy} onChange={(v) => setField('overwritePolicy', v)} describedBy={db} options={SFTP_OPTIONS.overwritePolicy} />}
      </Field>
      <Field id="field-concurrentTransfers" label="Concurrent Transfers (streams)" error={showError('concurrentTransfers') ? errors.concurrentTransfers : null}>
        {(db) => <TextInput id="field-concurrentTransfers" inputMode="numeric" value={form.concurrentTransfers} onChange={(v) => setField('concurrentTransfers', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('concurrentTransfers')} invalid={showError('concurrentTransfers')} describedBy={db} placeholder="4" />}
      </Field>
      <Field id="field-fileEncoding" label="File Encoding">
        {(db) => <SelectInput id="field-fileEncoding" value={form.fileEncoding} onChange={(v) => setField('fileEncoding', v)} describedBy={db} options={SFTP_OPTIONS.fileEncoding} />}
      </Field>
      <Field id="field-archiveDirectory" label="Archive Directory" hint="Where ingested files are moved when archiving is enabled.">
        {(db) => <TextInput id="field-archiveDirectory" value={form.archiveDirectory} onChange={(v) => setField('archiveDirectory', v)} describedBy={db} placeholder="/data/exchange/etl/archive" />}
      </Field>
      <Field id="field-tempFileSuffix" label="Temp File Suffix" hint="Suffix used for the atomic-write temporary file.">
        {(db) => <TextInput id="field-tempFileSuffix" value={form.tempFileSuffix} onChange={(v) => setField('tempFileSuffix', v)} describedBy={db} placeholder=".etl.tmp" />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-resumeTransfers" checked={form.resumeTransfers} onChange={(v) => setField('resumeTransfers', v)} label="Resume Interrupted Transfers" description="Resume partially transferred files after a connection failure instead of restarting them." />
        <Toggle id="field-atomicWrite" checked={form.atomicWrite} onChange={(v) => setField('atomicWrite', v)} label="Atomic Write (Temp File Rename)" description="Write to a temp file and rename atomically on completion so consumers never see partial files." />
        <Toggle id="field-archiveAfterTransfer" checked={form.archiveAfterTransfer} onChange={(v) => setField('archiveAfterTransfer', v)} label="Archive Files After Download" description="Move successfully ingested files to the archive subdirectory. Preserves transfer history." />
        <Toggle id="field-deleteSourceAfterTransfer" checked={form.deleteSourceAfterTransfer} onChange={(v) => setField('deleteSourceAfterTransfer', v)} label="Delete Source After Download" description="Delete source files from the remote server after a successful transfer. Use with caution — requires write permission." />
        <Toggle id="field-checksumVerification" checked={form.checksumVerification} onChange={(v) => setField('checksumVerification', v)} label="Checksum Verification (SHA-256)" description="Verify file integrity by comparing SHA-256 checksums after each transfer." />
      </div>
    </Section>
  );
}

/* ---- Section 8: Scheduling and Automation --------------------------- */
function SchedulingAutomation({ form, setField }) {
  const scheduled = form.triggerType === 'Scheduled';
  const triggerRef = useRef(null);
  const selectTrigger = (t) => {
    setField('triggerType', t);
    const el = triggerRef.current?.querySelector(`[data-trigger="${CSS.escape(t)}"]`);
    if (el) el.focus();
  };
  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = SFTP_TRIGGER_TYPES.indexOf(form.triggerType);
    const base = current === -1 ? 0 : current;
    selectTrigger(SFTP_TRIGGER_TYPES[(base + delta + SFTP_TRIGGER_TYPES.length) % SFTP_TRIGGER_TYPES.length]);
  };
  return (
    <Section index={8} title="Scheduling and Automation" description="Trigger type, polling schedule, retry policy, auto-reconnect, and failure-notification routing.">
      <fieldset ref={triggerRef} role="radiogroup" aria-label="Trigger type" onKeyDown={onKeyDown} className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">Trigger Type</legend>
        <div className="flex flex-wrap gap-token-2">
          {SFTP_TRIGGER_TYPES.map((t) => {
            const selected = form.triggerType === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                data-trigger={t}
                aria-checked={selected}
                tabIndex={selected || (SFTP_TRIGGER_TYPES.indexOf(form.triggerType) === -1 && t === SFTP_TRIGGER_TYPES[0]) ? 0 : -1}
                onClick={() => selectTrigger(t)}
                className={`rounded-md border px-token-3 py-token-2 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash text-primary' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>
      {scheduled && (
        <>
          <Field id="field-scheduleFrequency" label="Schedule Frequency">
            {(db) => <SelectInput id="field-scheduleFrequency" value={form.scheduleFrequency} onChange={(v) => setField('scheduleFrequency', v)} describedBy={db} options={SFTP_OPTIONS.scheduleFrequency} />}
          </Field>
          <Field id="field-cronExpression" label="Cron Expression" hint={cronHint(form.cronExpression)}>
            {(db) => <TextInput id="field-cronExpression" value={form.cronExpression} onChange={(v) => setField('cronExpression', v)} describedBy={db} placeholder="0 6 * * *" />}
          </Field>
          <Field id="field-pollingInterval" label="Polling Interval (min)">
            {(db) => <TextInput id="field-pollingInterval" inputMode="numeric" value={form.pollingInterval} onChange={(v) => setField('pollingInterval', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="5" />}
          </Field>
          <Field id="field-timezone" label="Timezone">
            {(db) => <SelectInput id="field-timezone" value={form.timezone} onChange={(v) => setField('timezone', v)} describedBy={db} options={SFTP_OPTIONS.timezone} />}
          </Field>
        </>
      )}
      <Field id="field-maxRetries" label="Max Retries (attempts)">
        {(db) => <TextInput id="field-maxRetries" inputMode="numeric" value={form.maxRetries} onChange={(v) => setField('maxRetries', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="5" />}
      </Field>
      <Field id="field-retryDelay" label="Retry Delay (seconds)">
        {(db) => <TextInput id="field-retryDelay" inputMode="numeric" value={form.retryDelay} onChange={(v) => setField('retryDelay', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="60" />}
      </Field>
      <Field id="field-retryStrategy" label="Retry Strategy" className="sm:col-span-2">
        {(db) => <SelectInput id="field-retryStrategy" value={form.retryStrategy} onChange={(v) => setField('retryStrategy', v)} describedBy={db} options={SFTP_OPTIONS.retryStrategy} />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-autoReconnect" checked={form.autoReconnect} onChange={(v) => setField('autoReconnect', v)} label="Automatic SSH Reconnect" description="Automatically re-establish the SSH session after an unexpected disconnection during scheduled transfers." />
        <Toggle id="field-reconnectOnHostKeyChange" checked={form.reconnectOnHostKeyChange} onChange={(v) => setField('reconnectOnHostKeyChange', v)} label="Reconnect on Host Key Change" description="Alert the security team and halt operations when the server host key changes mid-session. Leaving this off is the secure default." />
      </div>
    </Section>
  );
}

function cronHint(cron) {
  const c = cron.trim();
  if (c === '0 6 * * *') return 'Every day at 06:00 UTC';
  if (/^\d+ \* \* \* \*$/.test(c)) return 'Every hour';
  if (c === '*/15 * * * *') return 'Every 15 minutes';
  return c ? 'Standard 5-field cron expression.' : 'Enter a 5-field cron expression.';
}

/* ---- Section 9: Monitoring and Audit -------------------------------- */
function MonitoringAudit({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={9} title="Monitoring and Audit" description="SSH session audit, transfer logging, security-event capture, and failure-notification routing.">
      <Field id="field-notificationEmail" label="Notification Email" error={showError('notificationEmail') ? errors.notificationEmail : null} hint="Comma-separated addresses alerted on connection or transfer failures.">
        {(db) => <TextInput id="field-notificationEmail" type="email" value={form.notificationEmail} onChange={(v) => setField('notificationEmail', v)} onBlur={() => markTouched('notificationEmail')} invalid={showError('notificationEmail')} describedBy={db} placeholder="etl-alerts@acme.corp, security-ops@acme.corp" autoComplete="off" />}
      </Field>
      <Field id="field-alertThreshold" label="Alert Threshold (consecutive failures)">
        {(db) => <TextInput id="field-alertThreshold" inputMode="numeric" value={form.alertThreshold} onChange={(v) => setField('alertThreshold', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="3" />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-securityAlertOnAuthFailure" checked={form.securityAlertOnAuthFailure} onChange={(v) => setField('securityAlertOnAuthFailure', v)} label="Security Alert on Auth Failure" description="Immediately notify the security team if SSH authentication fails — a potential credential or key-compromise signal." />
        <Toggle id="field-pagerDutyEscalation" checked={form.pagerDutyEscalation} onChange={(v) => setField('pagerDutyEscalation', v)} label="PagerDuty Escalation" description="Escalate critical SFTP failures to the on-call PagerDuty rotation once the alert threshold is exceeded." />
        <Toggle id="field-connectionMonitoring" checked={form.connectionMonitoring} onChange={(v) => setField('connectionMonitoring', v)} label="Connection Monitoring" description="Continuously monitor SSH session health and alert on latency spikes or host-key changes." />
        <Toggle id="field-transferMonitoring" checked={form.transferMonitoring} onChange={(v) => setField('transferMonitoring', v)} label="Transfer Monitoring" description="Track all file-transfer events — filename, size, duration, checksum result, and final status." />
        <Toggle id="field-auditLogging" checked={form.auditLogging} onChange={(v) => setField('auditLogging', v)} label="Audit Logging" description="Log all authentication events, directory access, file operations, and configuration changes for compliance." />
        <Toggle id="field-securityEventLogging" checked={form.securityEventLogging} onChange={(v) => setField('securityEventLogging', v)} label="Security Event Logging" description="Record SSH handshake details, algorithm negotiation, host-key fingerprints, and authentication outcomes." />
        <Toggle id="field-failedAuthAlerts" checked={form.failedAuthAlerts} onChange={(v) => setField('failedAuthAlerts', v)} label="Failed Authentication Alerts" description="Immediately alert security and platform teams on SSH authentication failures. Potential security indicator." />
        <Toggle id="field-failedTransferAlerts" checked={form.failedTransferAlerts} onChange={(v) => setField('failedTransferAlerts', v)} label="Failed Transfer Alerts" description="Send alerts when file transfers fail after exhausting all retries." />
        <Toggle id="field-performanceMetrics" checked={form.performanceMetrics} onChange={(v) => setField('performanceMetrics', v)} label="Performance Metrics Collection" description="Record transfer speed, session latency, and throughput over time for SLA reporting." />
        <Toggle id="field-activityRetention" checked={form.activityRetention} onChange={(v) => setField('activityRetention', v)} label="Activity Retention (90 days)" description="Retain transfer activity and audit records for 90 days to satisfy SOC 2 and financial-compliance requirements." />
      </div>
    </Section>
  );
}

/* ---- Sidebar: Connection Summary ------------------------------------ */
function SidebarCard({ title, children, action }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between gap-token-2">
        <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>
        {action}
      </div>
      <div className="mt-token-3">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-token-3 py-token-1">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 max-w-[60%] truncate text-right text-token-meta font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`} title={typeof value === 'string' ? value : undefined}>
        {value || '—'}
      </dd>
    </div>
  );
}

function ConnectionSummary({ form, testState }) {
  const validated = testState.status === 'success';
  return (
    <SidebarCard title="Connection Summary" action={validated ? <StatusPill label="Validated" /> : <StatusPill label="Draft" tone="neutral" />}>
      <dl className="m-0 flex flex-col divide-y divide-border-subtle">
        <SummaryRow label="Name" value={form.name.trim()} />
        <SummaryRow label="Environment" value={form.environment} />
        <SummaryRow label="Protocol" value={SFTP_TRANSPORT.protocol} />
        <SummaryRow label="Host" value={form.host.trim()} mono />
        <SummaryRow label="Port" value={form.port} mono />
        <SummaryRow label="Remote Root" value={form.remoteRoot.trim()} mono />
        <SummaryRow label="Auth Method" value={form.authMethod} />
      </dl>
    </SidebarCard>
  );
}

/* ---- Sidebar: Validation Status (progressbar) ----------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  return (
    <SidebarCard title="Validation Status">
      <div className="flex items-center justify-between text-token-meta text-text-secondary-alt">
        <span>{completedCount} of {total} complete</span>
        <span className="font-semibold text-text-primary-alt">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Configuration completeness"
        className="mt-token-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {checklist.map((c) => (
          <li key={c.key} className="flex items-center gap-token-2 text-token-meta">
            {c.done ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconCircle className="h-3 w-3 shrink-0 text-text-faint" />}
            <span className={c.done ? 'text-text-primary-alt' : 'text-text-faint'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}

/* ---- Sidebar: SSH Security Review ----------------------------------- */
function SshSecurityReview({ form, testState }) {
  const validated = testState.status === 'success';
  const suite = testState.result?.suite ?? NEGOTIATED_SUITE;
  const topGrade = suite.every((r) => r.grade.startsWith('A')) ? 'A+' : 'A';
  const controls = [
    { label: 'Strict Host Key Verification', on: form.strictHostKeyVerification },
    { label: 'Known Hosts Validation', on: form.knownHostsValidation },
    { label: 'Fingerprint Pinning', on: form.hostFingerprintPinning },
    { label: 'Strong Host Key Required', on: form.requireStrongHostKey },
    { label: 'FIPS 140-2 Restriction', on: form.fipsRestriction },
  ];
  return (
    <SidebarCard title="SSH Security Review" action={validated ? <span className="rounded-sm bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success">Grade {topGrade}</span> : <StatusPill label="Not tested" tone="neutral" />}>
      <ul className="flex flex-col gap-token-2">
        {controls.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-token-2 text-token-meta">
            <span className="text-text-secondary-alt">{c.label}</span>
            {c.on ? (
              <span className="flex items-center gap-token-1 font-semibold text-success"><IconCheck className="h-3 w-3" />Enabled</span>
            ) : (
              <span className="flex items-center gap-token-1 font-medium text-text-faint"><IconCircle className="h-3 w-3" />Off</span>
            )}
          </li>
        ))}
      </ul>
      <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
        <IconShield className="mt-0.5 h-3 w-3 shrink-0" />
        {validated ? 'Negotiated cipher' : 'Preferred cipher'}: {suite.find((r) => r.key === 'cipher-cs')?.negotiated ?? 'chacha20-poly1305@openssh'}
      </p>
    </SidebarCard>
  );
}

/* ---- Sidebar: Transfer Summary -------------------------------------- */
function TransferSummary({ form }) {
  return (
    <SidebarCard title="Transfer Summary">
      <dl className="m-0 flex flex-col divide-y divide-border-subtle">
        <SummaryRow label="Direction" value={form.transferDirection} />
        <SummaryRow label="Overwrite Policy" value={form.overwritePolicy} />
        <SummaryRow label="Concurrent Streams" value={form.concurrentTransfers} />
        <SummaryRow label="Trigger" value={form.triggerType} />
        <SummaryRow label="Schedule" value={form.triggerType === 'Scheduled' ? form.scheduleFrequency : 'On demand'} />
        <SummaryRow label="Checksum" value={form.checksumVerification ? 'SHA-256' : 'Disabled'} />
      </dl>
    </SidebarCard>
  );
}

/* ---- Sidebar: Connection Health ------------------------------------- */
function ConnectionHealth({ testState }) {
  if (testState.status !== 'success') {
    const failed = testState.status === 'error';
    return (
      <SidebarCard title="Connection Health" action={failed ? <span className="rounded-sm border border-danger-border bg-danger-bg px-token-2 py-0.5 text-token-meta font-semibold text-danger">Failed</span> : null}>
        <p className="m-0 flex items-start gap-token-2 text-token-meta text-text-secondary-alt">
          {failed ? <IconX className="mt-0.5 h-3 w-3 shrink-0 text-danger" /> : <IconPlug className="mt-0.5 h-3 w-3 shrink-0 text-text-faint" />}
          {failed
            ? <>The last connection test failed. Resolve the reported checks, then re-run <span className="font-medium text-text-primary-alt">Test Connection</span> to measure session health.</>
            : <>Run <span className="font-medium text-text-primary-alt">Test Connection</span> to measure SSH session latency, throughput, and transfer success rate.</>}
        </p>
      </SidebarCard>
    );
  }
  const r = testState.result ?? {};
  const metrics = [
    { label: 'Handshake Latency', value: r.latencyMs != null ? `${r.latencyMs} ms` : '—' },
    { label: 'Network Latency', value: r.networkLatencyMs != null ? `${r.networkLatencyMs} ms` : '—' },
    { label: 'Transfer Speed', value: r.transferSpeed ?? '—' },
    { label: 'Success Rate', value: r.transferSuccessRate ?? '—' },
    { label: 'Session Duration', value: r.sessionDuration ?? '—' },
    { label: 'Files Today', value: r.filesToday != null ? String(r.filesToday) : '—' },
  ];
  return (
    <SidebarCard title="Connection Health" action={testState.mocked ? <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample</span> : <StatusPill label="Live" />}>
      <dl className="m-0 grid grid-cols-2 gap-token-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="text-token-meta text-text-faint">{m.label}</dt>
            <dd className="m-0 text-token-sm font-semibold text-text-primary-alt">{m.value}</dd>
          </div>
        ))}
      </dl>
    </SidebarCard>
  );
}

/* ---- Confirm dialog (focus-trapped) --------------------------------- */
function ConfirmDialog({ form, connectionTested, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = 'sftp-confirm-title';
  const descId = 'sftp-confirm-desc';

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    confirmRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button:not([disabled])');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="w-full max-w-md rounded-lg border border-border bg-surface-card p-token-6 shadow-lg">
        <h2 id={titleId} className="m-0 text-token-base font-semibold text-text-primary-alt">Create SFTP Source</h2>
        <p id={descId} className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">
          You are about to register the SFTP connector <span className="font-semibold text-text-primary-alt">{form.name.trim() || 'this source'}</span> to <span className="font-mono text-text-primary-alt">{form.host.trim()}:{form.port}</span> over an encrypted SSH-2 channel.
        </p>
        {!connectionTested && (
          <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong">
            <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
            You have not run a successful connection test. You can still save, but the SSH handshake and host key will be verified on first sync.
          </p>
        )}
        <div className="mt-token-5 flex justify-end gap-token-3">
          <button type="button" onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconCheck className="h-3.5 w-3.5" />}
            {submitting ? 'Creating…' : 'Create Source'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor) ------------------------------------ */
function IconCheck({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 4.5 6 12 2.5 8.5" />
    </svg>
  );
}

function IconX({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4 4 12M4 4l8 8" />
    </svg>
  );
}

function IconCircle({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

function IconInfo({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5M8 5.25h.01" />
    </svg>
  );
}

function IconShield({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.75 2.75 4v3.5c0 3.2 2.1 5.5 5.25 6.75 3.15-1.25 5.25-3.55 5.25-6.75V4L8 1.75Z" />
      <path d="M5.75 8 7.5 9.75 10.75 6.5" />
    </svg>
  );
}

function IconPlug({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 8.5 4.5 12M6 4l1.5 1.5M12 6l-1.5-1.5M9.5 2.5l4 4-2 2a2.83 2.83 0 0 1-4-4l2-2Z" />
    </svg>
  );
}

function IconFolder({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.75 4.25c0-.55.45-1 1-1h3l1.5 1.5h5c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1h-9.5c-.55 0-1-.45-1-1v-7.5Z" />
    </svg>
  );
}

function IconFile({ className = 'h-4 w-4 text-text-faint' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 1.75h5L12.25 5v9.25a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V2.5a.75.75 0 0 1 .75-.75Z" />
      <path d="M9 1.75V5h3.25" />
    </svg>
  );
}

function IconSpinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
