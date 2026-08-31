import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  WEBHOOK_OPTIONS,
  WEBHOOK_STATUSES,
  WEBHOOK_AUTH_METHODS,
  AUTH_METHODS_BY_ID,
  EVENT_CATEGORIES,
  EVENTS_BY_ID,
  DEFAULT_SUBSCRIBED_EVENT_IDS,
  TOTAL_EVENT_COUNT,
  DEFAULT_IP_ALLOWLIST,
  DEFAULT_JSON_SCHEMA,
  ORG_ID,
  validate,
  computeChecklist,
  buildPayload,
  generateEndpoint,
  testWebhook,
  createWebhookSource,
} from '../services/webhookConfiguration.api';

/* Field styling — mirrors the sibling data-source forms (SCR-046/048/052)
   so every "add source" step reads identically. No alpha modifiers on
   CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

/* Empty form — seeded with the salesforce-crm-events example from the
   Figma frame so the screen renders with realistic content. */
const INITIAL_FORM = {
  // 1. Webhook Configuration
  name: 'salesforce-crm-events',
  environment: 'Production',
  version: 'v2 (Current)',
  endpointAlias: '',
  status: 'Active',
  organization: 'Acme Corp',
  description: 'Inbound Salesforce CRM outbound-messaging events for the customer 360 pipeline.',
  // 2. Endpoint Configuration
  customPath: '',
  httpMethod: 'POST',
  contentType: 'JSON',
  maxPayloadSize: '10',
  requestTimeout: '30',
  rateLimit: '1000',
  enforceHttps: true,
  // 3. Authentication & Security
  authMethodId: 'hmac',
  hmacAlgorithm: 'HMAC-SHA256',
  signatureHeader: 'X-Salesforce-Signature-256',
  signaturePrefix: 'sha256=',
  secretProvisioned: false,
  replayProtection: true,
  timestampValidation: true,
  signatureVerification: true,
  tlsCertPinning: false,
  timestampTolerance: '300',
  requestExpiration: '900',
  ipAllowlist: DEFAULT_IP_ALLOWLIST,
  // 4. Event Subscription
  subscribedEventIds: DEFAULT_SUBSCRIBED_EVENT_IDS,
  // 5. Payload Validation
  validationMode: 'JSON Schema',
  jsonSchema: DEFAULT_JSON_SCHEMA,
  payloadVersionField: '$.version',
  maxNestedDepth: '8',
  nullHandling: 'Reject null values',
  duplicateDetection: true,
  strictAdditionalProperties: true,
  payloadVersionEnforcement: false,
  // 6. Event Processing Rules
  transformationProfile: 'Salesforce CRM v2',
  processingPriority: 'High',
  queueMode: 'Async Queue',
  duplicateHandling: 'Reject duplicates',
  eventOrdering: true,
  deadLetterQueue: true,
  eventDeduplication: true,
  schemaVersionRouting: false,
  dlqName: 'etl.dlq.salesforce-crm-events',
  dedupWindow: '60',
  // 7. Retry and Failure Policies
  maxRetries: '5',
  retryInterval: '30',
  maxRetryWindow: '24',
  retryStrategy: 'Exponential Backoff',
  jitter: 'Full Jitter',
  alertThreshold: '10',
  autoDisableThreshold: '100',
  failureQueue: 'etl.failures.sfdc-crm',
  autoPause: true,
  pagerDutyEscalation: true,
  // 8. Monitoring and Audit
  deliveryMonitoring: true,
  failureMonitoring: true,
  auditLogging: true,
  payloadLogging: false,
  securityEventLogging: true,
  performanceMetrics: true,
  alertNotifications: true,
  activityRetention: true,
  alertEmail: 'etl-alerts@acme.corp, integration-ops@acme.corp',
  slackChannel: '#etl-alerts-prod',
};

/* Retry-schedule preview rows (exponential backoff), from the Figma frame. */
const RETRY_SCHEDULE = [
  { attempt: '1st', min: '30 s', max: '60 s' },
  { attempt: '2nd', min: '60 s', max: '120 s' },
  { attempt: '3rd', min: '120 s', max: '300 s' },
  { attempt: '4th', min: '300 s', max: '600 s' },
  { attempt: '5th', min: '600 s', max: '1800 s' },
  { attempt: '→ DLQ', min: 'route to dead-letter queue', max: '' },
];

/** SCR-054 — Webhook Configuration Screen. Node 123:43915. */
export default function WebhookConfigurationScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [testState, setTestState] = useState({ status: 'idle', result: null, mocked: false });
  const [endpointState, setEndpointState] = useState({ status: 'idle', endpoint: null, mocked: false });

  const errors = useMemo(() => validate(form), [form]);
  const endpoint = endpointState.endpoint;
  const webhookTested = testState.status === 'success';
  const checklist = useMemo(() => computeChecklist(form, endpoint, webhookTested), [form, endpoint, webhookTested]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  const authMethod = AUTH_METHODS_BY_ID[form.authMethodId] ?? null;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  /* Selecting an auth method invalidates any prior webhook test, since the
     signing contract changed. */
  function setAuthMethod(id) {
    setForm((prev) => ({ ...prev, authMethodId: id }));
    setTestState({ status: 'idle', result: null, mocked: false });
  }

  function toggleEvent(eventId) {
    setForm((prev) => {
      const has = prev.subscribedEventIds.includes(eventId);
      return {
        ...prev,
        subscribedEventIds: has
          ? prev.subscribedEventIds.filter((id) => id !== eventId)
          : [...prev.subscribedEventIds, eventId],
      };
    });
  }

  async function handleGenerateEndpoint() {
    setEndpointState({ status: 'generating', endpoint: null, mocked: false });
    const result = await generateEndpoint(ORG_ID, buildPayload(form, null));
    setEndpointState({ status: 'ready', endpoint: result, mocked: !!result.mocked });
    // The secret is provisioned into Vault as part of endpoint generation.
    setForm((prev) => ({ ...prev, secretProvisioned: true }));
    setSecretRevealed(false);
  }

  async function handleTestWebhook() {
    setTestState({ status: 'testing', result: null, mocked: false });
    const result = await testWebhook(ORG_ID, buildPayload(form, endpoint));
    setTestState({ status: result.success ? 'success' : 'error', result, mocked: !!result.mocked });
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      const el =
        document.getElementById(`field-${firstKey}`) ??
        (firstKey === 'events'
          ? document.querySelector('[data-event-id]')
          : firstKey === 'webhookSecret'
            ? document.getElementById('generate-endpoint')
            : null);
      if (el) el.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmCreate() {
    setSubmitState({ status: 'submitting', message: '' });
    const result = await createWebhookSource(ORG_ID, buildPayload(form, endpoint));
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would register the webhook connector, provision the signing secret in Vault, and begin accepting inbound events.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Webhook source created.' });
      navigate('/data-sources');
    }
  }

  const submitted = submitState.status === 'mocked';

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'Webhook Configuration']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header
          onCancel={() => navigate('/data-sources/new')}
          isValid={isValid}
          submitted={submitted}
          onTest={handleTestWebhook}
          testing={testState.status === 'testing'}
          endpointReady={!!endpoint}
        />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating webhook source'
            : submitted
              ? 'Webhook source simulated — no backend available'
              : endpointState.status === 'generating'
                ? 'Generating endpoint'
                : testState.status === 'testing'
                  ? 'Sending test event'
                  : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitted && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated webhook source (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <WebhookConfigurationSection form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <EndpointConfigurationSection form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} endpointState={endpointState} onGenerate={handleGenerateEndpoint} />
            <AuthenticationSecuritySection form={form} authMethod={authMethod} setField={setField} setAuthMethod={setAuthMethod} showError={showError} markTouched={markTouched} errors={errors} secretRevealed={secretRevealed} onToggleReveal={() => setSecretRevealed((v) => !v)} onRotate={handleGenerateEndpoint} />
            <EventSubscriptionSection form={form} setField={setField} toggleEvent={toggleEvent} errors={errors} showError={showError} />
            <PayloadValidationSection form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <EventProcessingSection form={form} setField={setField} />
            <RetryPolicySection form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <MonitoringAuditSection form={form} setField={setField} />
            <SamplePayloadSection testState={testState} onTest={handleTestWebhook} endpointReady={!!endpoint} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <WebhookSummary form={form} authMethod={authMethod} endpoint={endpoint} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <SecurityReview form={form} authMethod={authMethod} />
            <EventOverview form={form} />
            <WebhookHealth testState={testState} isValid={isValid} submitted={submitted} />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/data-sources/new')} submitted={submitted} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          authMethod={authMethod}
          endpoint={endpoint}
          webhookTested={webhookTested}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </AppShell>
  );
}

/* ---- Shared field primitives (mirrors SCR-046/048/052) -------------- */
function Section({ index, title, description, children, actions, badge }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="flex items-start gap-token-3">
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-token-meta font-semibold text-primary">
            {index}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-token-2">
              <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
              {badge && <span className="rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-meta font-semibold text-primary">{badge}</span>}
            </div>
            {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ id, label, required, error, hint, className = '', children, labelAsText }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  const labelClass = 'text-token-sm font-medium text-text-secondary-alt';
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      {labelAsText ? (
        <span className={labelClass}>
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        </span>
      ) : (
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        </label>
      )}
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

function TextArea({ id, value, onChange, onBlur, invalid, describedBy, required, rows = 3, mono = false, ...rest }) {
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
      className={`w-full rounded-md border border-border bg-surface-card px-3 py-2 ${mono ? 'font-mono' : 'font-sans'} text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${invalid ? fieldInvalid : ''}`}
      {...rest}
    />
  );
}

function SelectInput({ id, value, onChange, onBlur, invalid, describedBy, options, placeholder, required, disabled, ariaLabel }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={`${fieldBase} ${invalid ? fieldInvalid : ''} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

function Toggle({ id, checked, onChange, label, description, disabled, warning }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'} ${disabled ? 'opacity-60' : ''}`}>
      <span className="flex flex-col">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
        {description && <span id={`${id}-desc`} className={`mt-0.5 text-token-meta ${warning ? 'text-warning-strong' : 'text-text-faint'}`}>{description}</span>}
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

/* Segmented button group. */
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
function Header({ onCancel, isValid, submitted, onTest, testing, endpointReady }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Webhook Configuration</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Configure a secure inbound webhook source — endpoint, HMAC signing, event subscription, payload validation, and delivery policy.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Data Sources' : 'Cancel'}
        </button>
        <button type="button" onClick={onTest} disabled={testing || !endpointReady} title={!endpointReady ? 'Generate the endpoint before sending a test event.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {testing ? <IconSpinner /> : <IconPlug />}
          {testing ? 'Testing…' : 'Send Test Event'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Webhook source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconCheck className="h-3.5 w-3.5" />
          Validate &amp; Save Webhook
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
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Webhook source already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconCheck className="h-3.5 w-3.5" />
          Validate &amp; Save Webhook
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Webhook Configuration ------------------------------- */
function WebhookConfigurationSection({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={1} title="Webhook Configuration" description="Identity, environment, and lifecycle status for this inbound webhook.">
      <Field id="field-name" label="Webhook Name" required error={showError('name') ? errors.name : null} hint="Lowercase, hyphenated — used to derive the endpoint path.">
        {(db) => <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="salesforce-crm-events" />}
      </Field>
      <Field id="field-environment" label="Environment" required error={showError('environment') ? errors.environment : null}>
        {(db) => <SelectInput id="field-environment" required value={form.environment} onChange={(v) => setField('environment', v)} onBlur={() => markTouched('environment')} invalid={showError('environment')} describedBy={db} options={WEBHOOK_OPTIONS.environment} />}
      </Field>
      <Field id="field-version" label="Payload Version">
        {(db) => <SelectInput id="field-version" value={form.version} onChange={(v) => setField('version', v)} describedBy={db} options={WEBHOOK_OPTIONS.version} />}
      </Field>
      <Field id="field-endpointAlias" label="Endpoint Alias" hint="Optional — a friendly alias shown in dashboards.">
        {(db) => <TextInput id="field-endpointAlias" value={form.endpointAlias} onChange={(v) => setField('endpointAlias', v)} describedBy={db} placeholder="sfdc-crm" />}
      </Field>
      <div className="sm:col-span-2">
        <SegmentedControl label="Status" value={form.status} options={WEBHOOK_STATUSES} onChange={(v) => setField('status', v)} note="Paused endpoints return 503; Disabled endpoints reject all deliveries." />
      </div>
      <Field id="field-organization" label="Organization" required error={showError('organization') ? errors.organization : null}>
        {(db) => <SelectInput id="field-organization" required value={form.organization} onChange={(v) => setField('organization', v)} onBlur={() => markTouched('organization')} invalid={showError('organization')} describedBy={db} options={WEBHOOK_OPTIONS.organization} />}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2" hint="Optional — describe what this webhook ingests.">
        {(db) => <TextArea id="field-description" value={form.description} onChange={(v) => setField('description', v)} describedBy={db} rows={2} placeholder="Inbound Salesforce CRM outbound-messaging events." />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Endpoint Configuration ------------------------------ */
function EndpointConfigurationSection({ form, setField, showError, markTouched, errors, endpointState, onGenerate }) {
  const generating = endpointState.status === 'generating';
  const endpoint = endpointState.endpoint;
  const [copied, setCopied] = useState(false);
  const generateAction = (
    <button
      type="button"
      id="generate-endpoint"
      onClick={onGenerate}
      disabled={generating}
      className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {generating ? <IconSpinner /> : <IconPlug />}
      {generating ? 'Generating…' : endpoint ? 'Regenerate' : 'Generate Endpoint'}
    </button>
  );
  async function copyUrl() {
    try {
      await navigator.clipboard?.writeText(endpoint.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }
  return (
    <Section index={2} title="Endpoint Configuration" description="Generate the inbound HTTPS endpoint and tune request limits." actions={generateAction}>
      <div className="sm:col-span-2">
        {endpoint ? (
          <div className="rounded-md border border-success bg-success-bg p-token-4" role="status">
            <div className="flex flex-wrap items-center justify-between gap-token-2">
              <span className="flex items-center gap-token-2 text-token-sm font-semibold text-success">
                <IconCheck className="h-3.5 w-3.5 shrink-0" /> Endpoint generated
              </span>
              <div className="flex items-center gap-token-2">
                {endpointState.mocked && <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample</span>}
                <button type="button" onClick={copyUrl} className="rounded-sm border border-border bg-surface-card px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="m-0 mt-token-2 break-all font-mono text-token-sm text-text-primary-alt">{endpoint.url}</p>
            <dl className="mt-token-3 grid grid-cols-1 gap-token-1 sm:grid-cols-3">
              <div><dt className="text-token-meta text-text-faint">Endpoint ID</dt><dd className="m-0 truncate font-mono text-token-meta font-medium text-text-primary-alt" title={endpoint.endpointId}>{endpoint.endpointId}</dd></div>
              <div><dt className="text-token-meta text-text-faint">TLS</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{endpoint.tls ?? 'TLS 1.3'}</dd></div>
              <div><dt className="text-token-meta text-text-faint">Availability</dt><dd className="m-0 text-token-meta font-medium text-text-primary-alt">{endpoint.availability ?? 'Available'}</dd></div>
            </dl>
            {endpointState.mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no endpoint-generation backend yet — this is a simulated endpoint.</p>}
          </div>
        ) : (
          <p className="m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-4 text-token-sm text-text-secondary-alt">
            Use <span className="font-medium text-text-primary-alt">Generate Endpoint</span> to provision a unique inbound HTTPS URL and its Vault-backed signing secret. Regenerating rotates both.
          </p>
        )}
      </div>
      <Field id="field-customPath" label="Custom Path Segment" hint="Optional — overrides the auto-derived path.">
        {(db) => <TextInput id="field-customPath" value={form.customPath} onChange={(v) => setField('customPath', v)} describedBy={db} placeholder="salesforce/crm" />}
      </Field>
      <Field id="field-httpMethod" label="HTTP Method">
        {(db) => <SelectInput id="field-httpMethod" value={form.httpMethod} onChange={(v) => setField('httpMethod', v)} describedBy={db} options={WEBHOOK_OPTIONS.httpMethod} />}
      </Field>
      <Field id="field-contentType" label="Content Type">
        {(db) => <SelectInput id="field-contentType" value={form.contentType} onChange={(v) => setField('contentType', v)} describedBy={db} options={WEBHOOK_OPTIONS.contentType} />}
      </Field>
      <Field id="field-maxPayloadSize" label="Max Payload Size (MB)" error={showError('maxPayloadSize') ? errors.maxPayloadSize : null}>
        {(db) => <TextInput id="field-maxPayloadSize" inputMode="numeric" value={form.maxPayloadSize} onChange={(v) => setField('maxPayloadSize', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('maxPayloadSize')} invalid={showError('maxPayloadSize')} describedBy={db} placeholder="10" />}
      </Field>
      <Field id="field-requestTimeout" label="Request Timeout (seconds)" error={showError('requestTimeout') ? errors.requestTimeout : null}>
        {(db) => <TextInput id="field-requestTimeout" inputMode="numeric" value={form.requestTimeout} onChange={(v) => setField('requestTimeout', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('requestTimeout')} invalid={showError('requestTimeout')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-rateLimit" label="Rate Limit (req/min)" error={showError('rateLimit') ? errors.rateLimit : null}>
        {(db) => <TextInput id="field-rateLimit" inputMode="numeric" value={form.rateLimit} onChange={(v) => setField('rateLimit', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('rateLimit')} invalid={showError('rateLimit')} describedBy={db} placeholder="1000" />}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-enforceHttps" checked={form.enforceHttps} onChange={(v) => setField('enforceHttps', v)} label="Enforce HTTPS" description="Reject plaintext HTTP deliveries. Strongly recommended." />
      </div>
    </Section>
  );
}

/* ---- Section 3: Authentication & Security --------------------------- */
const AUTH_ORDER = WEBHOOK_AUTH_METHODS.map((m) => m.id);

function AuthenticationSecuritySection({ form, authMethod, setField, setAuthMethod, showError, markTouched, errors, secretRevealed, onToggleReveal, onRotate }) {
  const radiogroupRef = useRef(null);
  const isHmac = authMethod?.id === 'hmac';
  const selectMethod = (id) => {
    setAuthMethod(id);
    const el = radiogroupRef.current?.querySelector(`[data-auth-method="${id}"]`);
    if (el) el.focus();
  };
  const onMethodKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (delta) {
      e.preventDefault();
      const current = AUTH_ORDER.indexOf(form.authMethodId);
      const base = current === -1 ? 0 : current;
      selectMethod(AUTH_ORDER[(base + delta + AUTH_ORDER.length) % AUTH_ORDER.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectMethod(AUTH_ORDER[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectMethod(AUTH_ORDER[AUTH_ORDER.length - 1]);
    }
  };

  function addCidr() {
    setField('ipAllowlist', [...form.ipAllowlist, { cidr: '', label: '' }]);
  }
  function updateCidr(idx, value) {
    setField('ipAllowlist', form.ipAllowlist.map((r, i) => (i === idx ? { ...r, cidr: value } : r)));
  }
  function removeCidr(idx) {
    setField('ipAllowlist', form.ipAllowlist.filter((_, i) => i !== idx));
  }

  return (
    <Section index={3} title="Authentication & Security" description="Verify the caller's identity and protect against replay and tampering." badge={authMethod?.name ?? 'No auth'}>
      <fieldset className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <legend className="mb-token-2 p-0 text-token-sm font-medium text-text-secondary-alt">Authentication Method</legend>
        <div ref={radiogroupRef} role="radiogroup" aria-label="Authentication method" onKeyDown={onMethodKeyDown} className="grid grid-cols-1 gap-token-2 sm:grid-cols-2">
          {WEBHOOK_AUTH_METHODS.map((m) => {
            const selected = form.authMethodId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                data-auth-method={m.id}
                aria-checked={selected}
                tabIndex={selected || (AUTH_ORDER.indexOf(form.authMethodId) === -1 && m.id === AUTH_ORDER[0]) ? 0 : -1}
                onClick={() => selectMethod(m.id)}
                className={`flex flex-col items-start gap-0.5 rounded-md border px-token-3 py-token-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}
              >
                <span className="flex w-full items-center justify-between gap-token-2">
                  <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>{m.name}</span>
                  <span className={`rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${m.secure ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{m.secure ? 'Secure' : 'Open'}</span>
                </span>
                <span className="text-token-meta text-text-faint">{m.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {isHmac && (
        <>
          <Field id="field-hmacAlgorithm" label="HMAC Algorithm">
            {(db) => <SelectInput id="field-hmacAlgorithm" value={form.hmacAlgorithm} onChange={(v) => setField('hmacAlgorithm', v)} describedBy={db} options={WEBHOOK_OPTIONS.hmacAlgorithm} />}
          </Field>
          <Field id="field-signatureHeader" label="Signature Header" required error={showError('signatureHeader') ? errors.signatureHeader : null}>
            {(db) => <TextInput id="field-signatureHeader" required value={form.signatureHeader} onChange={(v) => setField('signatureHeader', v)} onBlur={() => markTouched('signatureHeader')} invalid={showError('signatureHeader')} describedBy={db} placeholder="X-Salesforce-Signature-256" />}
          </Field>
          <Field id="field-signaturePrefix" label="Signature Prefix" hint="Prepended to the hex digest (e.g. sha256=).">
            {(db) => <TextInput id="field-signaturePrefix" value={form.signaturePrefix} onChange={(v) => setField('signaturePrefix', v)} describedBy={db} placeholder="sha256=" />}
          </Field>

          {/* Vault-backed signing secret — always masked, never rendered in clear text. */}
          <Field id="field-webhookSecret" labelAsText label="Webhook Signing Secret" required error={showError('webhookSecret') ? errors.webhookSecret : null} className="sm:col-span-2" hint="Vault-backed. Provisioned when the endpoint is generated and never displayed in full.">
            {(db) => (
              <div className="flex flex-wrap items-center gap-token-2">
                <span
                  id="field-webhookSecret"
                  aria-describedby={db}
                  className={`flex h-9 min-w-0 flex-1 items-center rounded-md border ${showError('webhookSecret') ? fieldInvalid : 'border-border'} bg-surface-muted px-3 font-mono text-token-sm ${form.secretProvisioned ? 'text-text-primary-alt' : 'text-text-faint'}`}
                >
                  {form.secretProvisioned ? (secretRevealed ? 'whsec_•••• (revealed server-side only)' : 'whsec_••••••••••••••••') : 'Not provisioned yet'}
                </span>
                <button type="button" onClick={onToggleReveal} disabled={!form.secretProvisioned} className="flex h-9 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {secretRevealed ? 'Hide' : 'Reveal'}
                </button>
                <button type="button" onClick={onRotate} className="flex h-9 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  Rotate
                </button>
              </div>
            )}
          </Field>
          <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
            <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
            The signing secret is stored in Vault and never leaves the server in clear text. Reveal shows only a masked reference; rotate re-provisions it and regenerates the endpoint.
          </p>
        </>
      )}

      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-signatureVerification" checked={form.signatureVerification} onChange={(v) => setField('signatureVerification', v)} label="Signature Verification" description="Reject any request whose signature does not match the computed digest." />
        <Toggle id="field-replayProtection" checked={form.replayProtection} onChange={(v) => setField('replayProtection', v)} label="Replay Attack Protection" description="Reject requests whose signature/nonce has already been seen." />
        <Toggle id="field-timestampValidation" checked={form.timestampValidation} onChange={(v) => setField('timestampValidation', v)} label="Timestamp Validation" description="Reject requests outside the timestamp tolerance window." />
        <Toggle id="field-tlsCertPinning" checked={form.tlsCertPinning} onChange={(v) => setField('tlsCertPinning', v)} label="TLS Certificate Pinning" description="Pin the expected client certificate chain for mutual TLS." />
      </div>
      <Field id="field-timestampTolerance" label="Timestamp Tolerance (seconds)" error={showError('timestampTolerance') ? errors.timestampTolerance : null}>
        {(db) => <TextInput id="field-timestampTolerance" inputMode="numeric" value={form.timestampTolerance} onChange={(v) => setField('timestampTolerance', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('timestampTolerance')} invalid={showError('timestampTolerance')} describedBy={db} placeholder="300" />}
      </Field>
      <Field id="field-requestExpiration" label="Request Expiration (seconds)" error={showError('requestExpiration') ? errors.requestExpiration : null}>
        {(db) => <TextInput id="field-requestExpiration" inputMode="numeric" value={form.requestExpiration} onChange={(v) => setField('requestExpiration', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('requestExpiration')} invalid={showError('requestExpiration')} describedBy={db} placeholder="900" />}
      </Field>

      <fieldset className="sm:col-span-2 m-0 min-w-0 border-0 p-0">
        <div className="mb-token-2 flex items-center justify-between">
          <legend className="p-0 text-token-sm font-medium text-text-secondary-alt">IP Allowlist (CIDR)</legend>
          <button type="button" onClick={addCidr} className="flex h-7 items-center gap-token-1 rounded-md border border-border bg-surface-card px-token-2 text-token-meta font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary">
            + Add range
          </button>
        </div>
        <ul className="flex flex-col gap-token-2">
          {form.ipAllowlist.map((row, idx) => (
            <li key={idx} className="flex items-center gap-token-2">
              <input
                aria-label={`CIDR range ${idx + 1}`}
                value={row.cidr}
                onChange={(e) => updateCidr(idx, e.target.value)}
                placeholder="96.43.144.0/20"
                className={`${fieldBase} font-mono`}
              />
              <span className="hidden shrink-0 text-token-meta text-text-faint sm:block">{row.label}</span>
              <button type="button" onClick={() => removeCidr(idx)} aria-label={`Remove range ${idx + 1}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-text-faint hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary">
                <IconX className="h-3 w-3" />
              </button>
            </li>
          ))}
          {form.ipAllowlist.length === 0 && <li className="text-token-meta text-text-faint">No ranges — the endpoint accepts callers from any IP.</li>}
        </ul>
      </fieldset>
    </Section>
  );
}

/* ---- Section 4: Event Subscription ---------------------------------- */
function EventSubscriptionSection({ form, setField, toggleEvent, errors, showError }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const subscribed = form.subscribedEventIds;
  const subscribedSet = new Set(subscribed);

  const q = query.trim().toLowerCase();
  const visibleCategories = EVENT_CATEGORIES.map((cat) => ({
    ...cat,
    events: cat.events.filter(
      (e) =>
        (categoryFilter === 'all' || categoryFilter === cat.id) &&
        (!q || e.label.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    ),
  })).filter((cat) => cat.events.length > 0);

  const activeCategories = EVENT_CATEGORIES.filter((c) => c.events.some((e) => subscribedSet.has(e.id))).length;
  const unsubscribed = TOTAL_EVENT_COUNT - subscribed.length;
  // Derived from the subscribed categories' seeded per-category volumes so
  // the figure actually moves as events are toggled. Non-numeric volumes
  // (e.g. "Variable") contribute 0 to the sum but still count as active.
  const estVolumePerHr = EVENT_CATEGORIES
    .filter((c) => c.events.some((e) => subscribedSet.has(e.id)))
    .reduce((sum, c) => sum + (parseInt(String(c.volume).replace(/[^0-9]/g, ''), 10) || 0), 0);
  const estVolume = estVolumePerHr > 0 ? `~${estVolumePerHr.toLocaleString()}/hr` : '—';

  function selectAll() {
    setField('subscribedEventIds', Object.keys(EVENTS_BY_ID));
  }
  function clearAll() {
    setField('subscribedEventIds', []);
  }

  const badge = `${activeCategories} categories · ${subscribed.length} events`;
  const actions = (
    <div className="flex items-center gap-token-2">
      <button type="button" onClick={selectAll} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Select All</button>
      <button type="button" onClick={clearAll} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Clear All</button>
    </div>
  );

  return (
    <Section index={4} title="Event Subscription" description="Choose which events this webhook delivers." badge={badge} actions={actions}>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        {showError('events') && <p className="m-0 text-token-meta text-danger" role="alert">{errors.events}</p>}
        <div className="flex flex-wrap items-center gap-token-2">
          <input
            aria-label="Search events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className={`${fieldBase} sm:max-w-xs`}
          />
          <SelectInput
            id="field-eventCategoryFilter"
            ariaLabel="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 'all', label: 'All categories' }, ...EVENT_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>

        <div className="flex flex-col gap-token-4">
          {visibleCategories.map((cat) => (
            <fieldset key={cat.id} className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-token-2 flex w-full items-center justify-between p-0">
                <span className="text-token-sm font-semibold text-text-primary-alt">{cat.name}</span>
                <span className="text-token-meta text-text-faint">{cat.volume}</span>
              </legend>
              <ul className="flex flex-col gap-token-1">
                {cat.events.map((e) => {
                  const checked = subscribedSet.has(e.id);
                  return (
                    <li key={e.id}>
                      <label className={`flex cursor-pointer items-start gap-token-3 rounded-md border px-token-3 py-token-2 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'}`}>
                        <input
                          type="checkbox"
                          data-event-id={e.id}
                          checked={checked}
                          onChange={() => toggleEvent(e.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className={`font-mono text-token-sm ${checked ? 'text-primary' : 'text-text-primary-alt'}`}>{e.label}</span>
                          <span className="text-token-meta text-text-faint">{e.description}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
          {visibleCategories.length === 0 && (
            <p className="m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-4 text-token-sm text-text-secondary-alt">No events match “{query}”.</p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-token-2 sm:grid-cols-4">
          {[
            ['Subscribed', String(subscribed.length)],
            ['Est. Volume', estVolume],
            ['Categories', String(activeCategories)],
            ['Unsubscribed', String(unsubscribed)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
              <dt className="text-token-meta text-text-faint">{label}</dt>
              <dd className="m-0 text-token-base font-semibold text-text-primary-alt">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* ---- Section 5: Payload Validation ---------------------------------- */
function PayloadValidationSection({ form, setField, showError, markTouched, errors }) {
  const showSchema = form.validationMode === 'JSON Schema';
  return (
    <Section index={5} title="Payload Validation" description="Validate each inbound payload before it enters the pipeline.">
      <div className="sm:col-span-2">
        <SegmentedControl label="Validation Mode" value={form.validationMode} options={WEBHOOK_OPTIONS.validationMode} onChange={(v) => setField('validationMode', v)} note="JSON Schema (Draft-07) is recommended for structured events." />
      </div>
      {showSchema && (
        <Field id="field-jsonSchema" label="JSON Schema (Draft-07)" required error={showError('jsonSchema') ? errors.jsonSchema : null} className="sm:col-span-2" hint="Inbound payloads are validated against this schema.">
          {(db) => <TextArea id="field-jsonSchema" mono required value={form.jsonSchema} onChange={(v) => setField('jsonSchema', v)} onBlur={() => markTouched('jsonSchema')} invalid={showError('jsonSchema')} describedBy={db} rows={10} />}
        </Field>
      )}
      <Field id="field-payloadVersionField" label="Payload Version Field" hint="JSONPath to the payload's version attribute.">
        {(db) => <TextInput id="field-payloadVersionField" value={form.payloadVersionField} onChange={(v) => setField('payloadVersionField', v)} describedBy={db} placeholder="$.version" />}
      </Field>
      <Field id="field-maxNestedDepth" label="Max Nested Depth" error={showError('maxNestedDepth') ? errors.maxNestedDepth : null}>
        {(db) => <TextInput id="field-maxNestedDepth" inputMode="numeric" value={form.maxNestedDepth} onChange={(v) => setField('maxNestedDepth', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('maxNestedDepth')} invalid={showError('maxNestedDepth')} describedBy={db} placeholder="8" />}
      </Field>
      <Field id="field-nullHandling" label="Null Handling" className="sm:col-span-2">
        {(db) => <SelectInput id="field-nullHandling" value={form.nullHandling} onChange={(v) => setField('nullHandling', v)} describedBy={db} options={WEBHOOK_OPTIONS.nullHandling} />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-strictAdditionalProperties" checked={form.strictAdditionalProperties} onChange={(v) => setField('strictAdditionalProperties', v)} label="Reject Additional Properties" description="Fail validation when the payload contains fields not in the schema." />
        <Toggle id="field-duplicateDetection" checked={form.duplicateDetection} onChange={(v) => setField('duplicateDetection', v)} label="Duplicate Detection" description="Detect and drop payloads with a repeated event_id." />
        <Toggle id="field-payloadVersionEnforcement" checked={form.payloadVersionEnforcement} onChange={(v) => setField('payloadVersionEnforcement', v)} label="Enforce Payload Version" description="Reject payloads whose version field falls outside the accepted range." />
      </div>
    </Section>
  );
}

/* ---- Section 6: Event Processing Rules ------------------------------ */
function EventProcessingSection({ form, setField }) {
  const metrics = [
    ['Queue Depth', '0 events'],
    ['Processing Rate', '312 events/min'],
    ['Avg Latency', '48 ms'],
    ['DLQ Depth', '2 events'],
  ];
  return (
    <Section index={6} title="Event Processing Rules" description="How delivered events are queued, transformed, ordered, and de-duplicated.">
      <Field id="field-transformationProfile" label="Transformation Profile">
        {(db) => <SelectInput id="field-transformationProfile" value={form.transformationProfile} onChange={(v) => setField('transformationProfile', v)} describedBy={db} options={WEBHOOK_OPTIONS.transformationProfile} />}
      </Field>
      <Field id="field-processingPriority" label="Processing Priority">
        {(db) => <SelectInput id="field-processingPriority" value={form.processingPriority} onChange={(v) => setField('processingPriority', v)} describedBy={db} options={WEBHOOK_OPTIONS.processingPriority} />}
      </Field>
      <Field id="field-queueMode" label="Queue Processing Mode">
        {(db) => <SelectInput id="field-queueMode" value={form.queueMode} onChange={(v) => setField('queueMode', v)} describedBy={db} options={WEBHOOK_OPTIONS.queueMode} />}
      </Field>
      <Field id="field-duplicateHandling" label="Duplicate Handling">
        {(db) => <SelectInput id="field-duplicateHandling" value={form.duplicateHandling} onChange={(v) => setField('duplicateHandling', v)} describedBy={db} options={WEBHOOK_OPTIONS.duplicateHandling} />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-eventOrdering" checked={form.eventOrdering} onChange={(v) => setField('eventOrdering', v)} label="Event Ordering Enforcement" description="Preserve per-key delivery order at the cost of throughput." />
        <Toggle id="field-deadLetterQueue" checked={form.deadLetterQueue} onChange={(v) => setField('deadLetterQueue', v)} label="Dead Letter Queue (DLQ)" description="Route events that exhaust retries to a dead-letter queue." />
        <Toggle id="field-eventDeduplication" checked={form.eventDeduplication} onChange={(v) => setField('eventDeduplication', v)} label="Event Deduplication Window" description="Collapse duplicate events seen within the window below." />
        <Toggle id="field-schemaVersionRouting" checked={form.schemaVersionRouting} onChange={(v) => setField('schemaVersionRouting', v)} label="Schema Version Routing" description="Route events to different consumers based on payload version." />
      </div>
      {form.deadLetterQueue && (
        <Field id="field-dlqName" label="Dead Letter Queue Name">
          {(db) => <TextInput id="field-dlqName" value={form.dlqName} onChange={(v) => setField('dlqName', v)} describedBy={db} placeholder="etl.dlq.salesforce-crm-events" />}
        </Field>
      )}
      {form.eventDeduplication && (
        <Field id="field-dedupWindow" label="Deduplication Window (minutes)">
          {(db) => <TextInput id="field-dedupWindow" inputMode="numeric" value={form.dedupWindow} onChange={(v) => setField('dedupWindow', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="60" />}
        </Field>
      )}
      <dl className="sm:col-span-2 grid grid-cols-2 gap-token-2 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
            <dt className="text-token-meta text-text-faint">{label}</dt>
            <dd className="m-0 text-token-base font-semibold text-text-primary-alt">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---- Section 7: Retry and Failure Policies -------------------------- */
function RetryPolicySection({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={7} title="Retry and Failure Policies" description="What happens when a delivery or downstream consumer fails.">
      <Field id="field-maxRetries" label="Max Retry Attempts" error={showError('maxRetries') ? errors.maxRetries : null} hint={`After ${form.maxRetries || 'N'} failures, route to the failure queue.`}>
        {(db) => <TextInput id="field-maxRetries" inputMode="numeric" value={form.maxRetries} onChange={(v) => setField('maxRetries', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('maxRetries')} invalid={showError('maxRetries')} describedBy={db} placeholder="5" />}
      </Field>
      <Field id="field-retryInterval" label="Initial Retry Interval (seconds)" error={showError('retryInterval') ? errors.retryInterval : null}>
        {(db) => <TextInput id="field-retryInterval" inputMode="numeric" value={form.retryInterval} onChange={(v) => setField('retryInterval', v.replace(/[^\d]/g, ''))} onBlur={() => markTouched('retryInterval')} invalid={showError('retryInterval')} describedBy={db} placeholder="30" />}
      </Field>
      <Field id="field-maxRetryWindow" label="Maximum Retry Window (hours)">
        {(db) => <TextInput id="field-maxRetryWindow" inputMode="numeric" value={form.maxRetryWindow} onChange={(v) => setField('maxRetryWindow', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="24" />}
      </Field>
      <Field id="field-retryStrategy" label="Retry Strategy">
        {(db) => <SelectInput id="field-retryStrategy" value={form.retryStrategy} onChange={(v) => setField('retryStrategy', v)} describedBy={db} options={WEBHOOK_OPTIONS.retryStrategy} />}
      </Field>
      <Field id="field-jitter" label="Jitter">
        {(db) => <SelectInput id="field-jitter" value={form.jitter} onChange={(v) => setField('jitter', v)} describedBy={db} options={WEBHOOK_OPTIONS.jitter} />}
      </Field>

      <div className="sm:col-span-2 overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-left text-token-meta">
          <caption className="sr-only">Exponential backoff retry schedule</caption>
          <thead>
            <tr className="bg-surface-muted text-text-secondary-alt">
              <th scope="col" className="px-token-3 py-token-2 font-medium">Attempt</th>
              <th scope="col" className="px-token-3 py-token-2 font-medium">Min delay</th>
              <th scope="col" className="px-token-3 py-token-2 font-medium">Max delay</th>
            </tr>
          </thead>
          <tbody>
            {RETRY_SCHEDULE.map((r) => (
              <tr key={r.attempt} className="border-t border-border-subtle">
                <td className="px-token-3 py-token-2 font-mono text-text-primary-alt">{r.attempt}</td>
                <td className="px-token-3 py-token-2 text-text-secondary-alt">{r.min}</td>
                <td className="px-token-3 py-token-2 text-text-secondary-alt">{r.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Field id="field-alertThreshold" label="Alert Threshold (failures)">
        {(db) => <TextInput id="field-alertThreshold" inputMode="numeric" value={form.alertThreshold} onChange={(v) => setField('alertThreshold', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="10" />}
      </Field>
      <Field id="field-autoDisableThreshold" label="Auto-Disable Threshold (failures)">
        {(db) => <TextInput id="field-autoDisableThreshold" inputMode="numeric" value={form.autoDisableThreshold} onChange={(v) => setField('autoDisableThreshold', v.replace(/[^\d]/g, ''))} describedBy={db} placeholder="100" />}
      </Field>
      <Field id="field-failureQueue" label="Failure Queue" className="sm:col-span-2">
        {(db) => <TextInput id="field-failureQueue" value={form.failureQueue} onChange={(v) => setField('failureQueue', v)} describedBy={db} placeholder="etl.failures.sfdc-crm" />}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-autoPause" checked={form.autoPause} onChange={(v) => setField('autoPause', v)} label="Automatic Endpoint Pause on Threshold" description="Pause the endpoint automatically once the auto-disable threshold is reached." />
        <Toggle id="field-pagerDutyEscalation" checked={form.pagerDutyEscalation} onChange={(v) => setField('pagerDutyEscalation', v)} label="Failure Notification — PagerDuty" description="Escalate sustained failures to the on-call PagerDuty service." />
      </div>
    </Section>
  );
}

/* ---- Section 8: Monitoring and Audit -------------------------------- */
function MonitoringAuditSection({ form, setField }) {
  return (
    <Section index={8} title="Monitoring and Audit" description="Observability, audit logging, and alerting for this webhook.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-deliveryMonitoring" checked={form.deliveryMonitoring} onChange={(v) => setField('deliveryMonitoring', v)} label="Delivery Monitoring" description="Track delivery success, latency, and throughput." />
        <Toggle id="field-failureMonitoring" checked={form.failureMonitoring} onChange={(v) => setField('failureMonitoring', v)} label="Failure Monitoring" description="Track and alert on delivery and processing failures." />
        <Toggle id="field-auditLogging" checked={form.auditLogging} onChange={(v) => setField('auditLogging', v)} label="Audit Logging" description="Record configuration changes and access to this webhook." />
        <Toggle id="field-payloadLogging" checked={form.payloadLogging} onChange={(v) => setField('payloadLogging', v)} label="Payload Logging" warning description="WARNING: payload bodies may contain PII. Keep disabled unless required for debugging." />
        <Toggle id="field-securityEventLogging" checked={form.securityEventLogging} onChange={(v) => setField('securityEventLogging', v)} label="Security Event Logging" description="Log signature failures, replay rejections, and IP blocks." />
        <Toggle id="field-performanceMetrics" checked={form.performanceMetrics} onChange={(v) => setField('performanceMetrics', v)} label="Performance Metrics Collection" description="Emit latency and throughput metrics to the metrics backend." />
        <Toggle id="field-alertNotifications" checked={form.alertNotifications} onChange={(v) => setField('alertNotifications', v)} label="Alert Notifications" description="Send alerts to the channels configured below." />
        <Toggle id="field-activityRetention" checked={form.activityRetention} onChange={(v) => setField('activityRetention', v)} label="Activity Retention (90 days)" description="Retain delivery and audit activity for 90 days." />
      </div>
      <Field id="field-alertEmail" label="Alert Email(s)" className="sm:col-span-2" hint="Comma-separated recipients for alert notifications.">
        {(db) => <TextInput id="field-alertEmail" type="text" value={form.alertEmail} onChange={(v) => setField('alertEmail', v)} describedBy={db} placeholder="etl-alerts@acme.corp" />}
      </Field>
      <Field id="field-slackChannel" label="Slack Channel">
        {(db) => <TextInput id="field-slackChannel" value={form.slackChannel} onChange={(v) => setField('slackChannel', v)} describedBy={db} placeholder="#etl-alerts-prod" />}
      </Field>
    </Section>
  );
}

/* ---- Section 9: Sample Payload -------------------------------------- */
const SAMPLE_HEADERS = [
  { name: 'Content-Type', value: 'application/json; charset=utf-8', required: true },
  { name: 'X-Salesforce-Signature-256', value: 'sha256=…', required: true },
  { name: 'X-Webhook-ID', value: 'evt_01HN4X9P2K7MQZB8RVFS3WDYCT', required: true },
  { name: 'X-Webhook-Timestamp', value: '1705334400', required: true },
  { name: 'X-Salesforce-Instance', value: 'na139.salesforce.com', required: false },
  { name: 'User-Agent', value: 'Salesforce-Outbound-Messaging/59.0', required: false },
];

const SAMPLE_BODY = `{
  "event_id": "a1b2c3d4-e5f6-11ee-8c99-0242ac120002",
  "event_type": "customer.updated",
  "occurred_at": "2024-01-15T14:20:00Z",
  "source": "salesforce",
  "data": {
    "customer_id": "0035g00000AbCdEfGHI",
    "email": "jane.doe@example.com",
    "tier": "enterprise"
  }
}`;

function SamplePayloadSection({ testState, onTest, endpointReady }) {
  const [tab, setTab] = useState('headers');
  const testing = testState.status === 'testing';
  const tabs = [
    ['headers', 'Request Headers'],
    ['body', 'Payload Body'],
    ['validation', 'Validation Result'],
  ];
  const action = (
    <button type="button" onClick={onTest} disabled={testing || !endpointReady} title={!endpointReady ? 'Generate the endpoint first' : undefined} className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {testing ? <IconSpinner /> : <IconPlug />}
      {testing ? 'Testing…' : 'Generate Example & Test'}
    </button>
  );
  const checks = testState.result?.checks ?? [];
  return (
    <Section index={9} title="Sample Payload" description="Preview the expected request and validate an example event." actions={action}>
      <div className="sm:col-span-2">
        <div role="tablist" aria-label="Sample payload" className="inline-flex flex-wrap gap-token-1 rounded-md border border-border bg-surface-muted p-0.5">
          {tabs.map(([id, label]) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={`rounded-[5px] px-token-3 py-1 text-token-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${selected ? 'bg-surface-card text-primary shadow-sm' : 'text-text-secondary-alt hover:text-text-primary-alt'}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-token-3">
          {tab === 'headers' && (
            <ul className="flex flex-col gap-token-1">
              {SAMPLE_HEADERS.map((h) => (
                <li key={h.name} className="flex flex-wrap items-center justify-between gap-token-2 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
                  <span className="flex items-center gap-token-2">
                    <span className="font-mono text-token-meta text-text-primary-alt">{h.name}</span>
                    <span className={`rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${h.required ? 'bg-shell-accent-wash text-primary' : 'bg-surface-card text-text-faint'}`}>{h.required ? 'Required' : 'Optional'}</span>
                  </span>
                  <span className="font-mono text-token-meta text-text-secondary-alt">{h.value}</span>
                </li>
              ))}
            </ul>
          )}
          {tab === 'body' && (
            <pre className="m-0 overflow-x-auto rounded-md border border-border-subtle bg-surface-muted p-token-3 font-mono text-token-meta text-text-primary-alt">{SAMPLE_BODY}</pre>
          )}
          {tab === 'validation' && (
            testState.status === 'success' ? (
              <div className="rounded-md border border-success bg-success-bg p-token-4" role="status">
                <div className="flex flex-wrap items-center justify-between gap-token-2">
                  <span className="flex items-center gap-token-2 text-token-sm font-semibold text-success"><IconCheck className="h-3.5 w-3.5 shrink-0" /> Payload valid — delivery succeeded ({testState.result.latencyMs} ms)</span>
                  {testState.mocked && <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">Sample data</span>}
                </div>
                <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-2">
                  {checks.map((c) => (
                    <li key={c.key} className="flex items-center justify-between gap-token-2 text-token-meta text-text-primary-alt">
                      <span className="flex items-center gap-token-2">
                        {c.ok ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconX className="h-3 w-3 shrink-0 text-danger" />}
                        {c.label}
                      </span>
                      <span className="text-text-secondary-alt">{c.value}</span>
                    </li>
                  ))}
                </ul>
                {testState.mocked && <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">MOD-006 has no webhook-test backend yet — this is a simulated validation result.</p>}
              </div>
            ) : (
              <p className="m-0 rounded-md border border-dashed border-border bg-surface-muted px-token-4 py-token-4 text-token-sm text-text-secondary-alt">
                Use <span className="font-medium text-text-primary-alt">Generate Example &amp; Test</span> to send a signed example event and see the payload-validation result here.
              </p>
            )
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---- Sidebar: Webhook Summary --------------------------------------- */
function WebhookSummary({ form, authMethod, endpoint }) {
  const statusDot = form.status === 'Active' ? 'bg-success' : form.status === 'Paused' ? 'bg-warning' : 'bg-text-faint';
  const rows = [
    { label: 'Environment', value: form.environment },
    { label: 'Auth Method', value: authMethod?.name ?? '—' },
    { label: 'Events', value: `${form.subscribedEventIds.length} subscribed` },
    { label: 'Version', value: form.version },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Webhook Summary</h2>
        <span className={`flex items-center gap-token-1 text-token-meta font-semibold ${form.status === 'Active' ? 'text-success' : 'text-text-secondary-alt'}`}>
          <span className={`h-2 w-2 rounded-full ${statusDot}`} aria-hidden="true" /> {form.status}
        </span>
      </div>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">WH</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled webhook'}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{authMethod?.name ?? '—'} · {form.environment}</p>
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
      {endpoint && (
        <p className="m-0 mt-token-3 break-all rounded-md bg-surface-muted px-token-3 py-token-2 font-mono text-token-meta text-text-secondary-alt">{endpoint.url}</p>
      )}
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
            {item.done ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <IconCircle className="h-3.5 w-3.5 shrink-0 text-warning" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{item.label}</span>
          </li>
        ))}
      </ul>
      {completedCount < total && (
        <p className="m-0 mt-token-3 text-token-meta text-text-faint">Review retry threshold and DLQ configuration before going to production.</p>
      )}
    </section>
  );
}

/* ---- Sidebar: Security Review --------------------------------------- */
function SecurityReview({ form, authMethod }) {
  const rows = [
    { label: 'HTTPS Enforced', value: form.enforceHttps ? 'TLS 1.3' : 'Disabled', ok: form.enforceHttps },
    { label: 'Signature Verify', value: authMethod?.id === 'hmac' ? form.hmacAlgorithm : (authMethod?.secure ? authMethod.name : 'None'), ok: !!authMethod?.secure },
    { label: 'Replay Protection', value: form.replayProtection ? 'Enabled' : 'Disabled', ok: form.replayProtection },
    { label: 'Timestamp Valid.', value: form.timestampValidation ? `±${form.timestampTolerance} s` : 'Disabled', ok: form.timestampValidation },
    { label: 'IP Allowlist', value: `${form.ipAllowlist.filter((r) => r.cidr.trim()).length} CIDR ranges`, ok: form.ipAllowlist.some((r) => r.cidr.trim()) },
    { label: 'Payload Logging', value: form.payloadLogging ? 'Enabled (PII)' : 'Disabled (PII safe)', ok: !form.payloadLogging },
  ];
  const secure = rows.every((r) => r.ok);
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Security Review</h2>
        <span className={`rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${secure ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning-strong'}`}>{secure ? 'Secure' : 'Review'}</span>
      </div>
      <dl className="mt-token-3 flex flex-col gap-token-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-token-2">
            <dt className="flex items-center gap-token-2 text-token-meta text-text-faint">
              {r.ok ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconAlert className="h-3 w-3 shrink-0 text-warning-strong" />}
              {r.label}
            </dt>
            <dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.value}</dd>
          </div>
        ))}
      </dl>
      {form.payloadLogging && (
        <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong">
          <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
          Payload logging is enabled — inbound bodies may contain PII. Disable it for production unless required.
        </p>
      )}
    </section>
  );
}

/* ---- Sidebar: Event Overview ---------------------------------------- */
function EventOverview({ form }) {
  const subscribedSet = new Set(form.subscribedEventIds);
  const perCategory = EVENT_CATEGORIES.map((c) => ({
    name: c.name,
    count: c.events.filter((e) => subscribedSet.has(e.id)).length,
  })).filter((c) => c.count > 0);
  const estVolumePerHr = EVENT_CATEGORIES
    .filter((c) => c.events.some((e) => subscribedSet.has(e.id)))
    .reduce((sum, c) => sum + (parseInt(String(c.volume).replace(/[^0-9]/g, ''), 10) || 0), 0);
  const rows = [
    ...perCategory.map((c) => ({ label: c.name, value: String(c.count) })),
    { label: 'Est. Volume', value: estVolumePerHr > 0 ? `~${estVolumePerHr.toLocaleString()}/hr` : '—' },
    { label: 'Processing Mode', value: form.queueMode },
    { label: 'Priority', value: form.processingPriority },
    { label: 'Retry Policy', value: `${form.maxRetries}× / ${form.retryStrategy.replace(' Backoff', '')}` },
    { label: 'DLQ', value: form.deadLetterQueue ? (form.dlqName || 'enabled') : 'disabled' },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Event Overview</h2>
      <dl className="mt-token-3 flex flex-col gap-token-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-token-3">
            <dt className="text-token-meta text-text-faint">{r.label}</dt>
            <dd className="m-0 max-w-[60%] truncate text-right text-token-meta font-medium text-text-primary-alt" title={r.value}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Sidebar: Webhook Health ---------------------------------------- */
function WebhookHealth({ testState, isValid, submitted }) {
  const rows = [
    { label: 'Endpoint Availability', value: '99.97%' },
    { label: 'Delivery Success Rate', value: '99.91%' },
    { label: 'Avg Response Time', value: testState.result?.latencyMs != null ? `${testState.result.latencyMs} ms` : '48 ms' },
    { label: 'Failure Rate', value: '0.09%' },
    { label: 'Events Today', value: '42,810' },
    { label: 'DLQ Depth', value: '2 events' },
    { label: 'Last Validated', value: testState.status === 'success' ? 'Just now' : '6 min ago' },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Webhook Health</h2>
        <span className="rounded-sm bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success">Healthy</span>
      </div>
      <dl className="mt-token-3 flex flex-col gap-token-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-token-2">
            <dt className="text-token-meta text-text-faint">{r.label}</dt>
            <dd className="m-0 text-token-meta font-medium text-text-primary-alt">{r.value}</dd>
          </div>
        ))}
      </dl>
      <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Webhook source already simulated — return to the list to add another.' : undefined} className="mt-token-4 flex h-9 w-full items-center justify-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <IconCheck className="h-3.5 w-3.5" /> Validate &amp; Save Webhook
      </button>
    </section>
  );
}

/* ---- Confirm dialog (focus-trapped) --------------------------------- */
function ConfirmDialog({ form, authMethod, endpoint, webhookTested, submitting, onCancel, onConfirm }) {
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

  const rows = [
    { label: 'Environment', value: form.environment },
    { label: 'Auth', value: authMethod?.name ?? '—' },
    { label: 'Events', value: `${form.subscribedEventIds.length} subscribed` },
    { label: 'Endpoint', value: endpoint ? 'Generated' : 'Not generated' },
    { label: 'Validation', value: form.validationMode },
    { label: 'Tested', value: webhookTested ? 'Yes' : 'Not tested' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-webhook-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-webhook-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Webhook Source</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the configuration before registering the webhook.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-token-5 flex items-center gap-token-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-shell-accent-wash text-token-sm font-semibold text-primary">WH</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{form.name || 'Untitled webhook'}</p>
            <p className="m-0 truncate text-token-meta text-text-faint">{authMethod?.name ?? '—'} · {form.environment}</p>
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
        {!webhookTested && (
          <div className="mt-token-4 flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-3 py-token-3" role="status">
            <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-strong" />
            <p className="m-0 text-token-meta text-warning-strong">The webhook has not been tested. You can still register it, but delivery will be verified on the first inbound event.</p>
          </div>
        )}
        <div className="mt-token-4 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-3">
          <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            <p className="m-0 text-token-meta font-semibold text-primary">What happens next</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
              The webhook connector is registered, the signing secret is provisioned in Vault, and the endpoint begins accepting inbound events for the subscribed types.
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconCheck className="h-3.5 w-3.5" />}
            {submitting ? 'Saving…' : 'Validate & Save Webhook'}
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








