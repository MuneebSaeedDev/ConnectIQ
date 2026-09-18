import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useOrganizationSettings } from '../hooks/useOrganizationSettings';
import { SETTINGS_OPTIONS, updateOrganizationSettings } from '../services/organizationSettings.api';
import { downloadJson, downloadCsv } from '../../../utils/exportHelper';

/* Field styling — mirrors CreateOrganizationScreen / EditOrganizationScreen
   so the three org forms stay visually consistent without coupling. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

/* Editable settings tracked for dirty-state + Save-confirmation diff.
   Grouped by card for readability; order drives the Change Summary. */
const EDITABLE_KEYS = [
  // General
  'displayName', 'language', 'timeZone', 'dateFormat', 'numberFormat', 'currency',
  'businessHoursStart', 'businessHoursEnd', 'businessDays', 'defaultDashboard',
  // Security
  'requireMfa', 'enableSso', 'passwordPolicy', 'passwordExpiration', 'sessionTimeout',
  'concurrentSessions', 'apiAccess', 'allowedIpRanges',
  // Notifications
  'notifyPlatformAlerts', 'notifyPipelineFailures', 'notifyConnectorFailures', 'notifyScheduledMaintenance',
  'notifyInvitationEmails', 'notifyPasswordReset', 'notifyUserActivity',
  'channelEmail', 'channelInApp', 'channelWebhooks', 'notificationWebhookUrl',
  // Branding
  'portalDisplayName', 'primaryBrandColor', 'emailBrandingTemplate', 'loginWelcomeMessage',
  // Integration
  'webhookEndpointUrl', 'eventSignatureMethod', 'retryPolicy', 'connectorPermissions', 'outboundTimeout',
  // Operational
  'defaultEnvironment', 'pipelineRetention', 'logRetention', 'defaultRetryPolicy', 'executionTimeout', 'workerAssignment',
  // Compliance
  'auditLogging', 'enhancedCompliance', 'dataRetention', 'dataResidency', 'privacySettings',
];

/* Human labels for the Save-confirmation diff card. */
const CHANGE_LABELS = {
  displayName: 'Organization Display Name',
  language: 'Default Language',
  timeZone: 'Time Zone',
  dateFormat: 'Date Format',
  numberFormat: 'Number Format',
  currency: 'Currency',
  businessHoursStart: 'Business Hours (start)',
  businessHoursEnd: 'Business Hours (end)',
  businessDays: 'Business Days',
  defaultDashboard: 'Default Dashboard',
  requireMfa: 'Require MFA',
  enableSso: 'Single Sign-On (SSO)',
  passwordPolicy: 'Password Complexity Policy',
  passwordExpiration: 'Password Expiration',
  sessionTimeout: 'Session Timeout',
  concurrentSessions: 'Concurrent Session Limit',
  apiAccess: 'API Access',
  allowedIpRanges: 'Allowed IP Ranges',
  notifyPlatformAlerts: 'Platform Alerts',
  notifyPipelineFailures: 'Pipeline Failures',
  notifyConnectorFailures: 'Connector Failures',
  notifyScheduledMaintenance: 'Scheduled Maintenance',
  notifyInvitationEmails: 'Invitation Emails',
  notifyPasswordReset: 'Password Reset Emails',
  notifyUserActivity: 'User Activity Alerts',
  channelEmail: 'Email Delivery',
  channelInApp: 'In-App Delivery',
  channelWebhooks: 'Webhook Delivery',
  notificationWebhookUrl: 'Notification Webhook URL',
  portalDisplayName: 'Display Name (Portal Header)',
  primaryBrandColor: 'Primary Brand Color',
  emailBrandingTemplate: 'Email Branding Template',
  loginWelcomeMessage: 'Login Welcome Message',
  webhookEndpointUrl: 'Webhook Endpoint URL',
  eventSignatureMethod: 'Event Signature Method',
  retryPolicy: 'Retry Policy',
  connectorPermissions: 'Default Connector Permissions',
  outboundTimeout: 'Outbound Connection Timeout',
  defaultEnvironment: 'Default Environment',
  pipelineRetention: 'Pipeline Retention Policy',
  logRetention: 'Log Retention',
  defaultRetryPolicy: 'Default Retry Policy',
  executionTimeout: 'Default Execution Timeout',
  workerAssignment: 'Default Worker Assignment',
  auditLogging: 'Enable Audit Logging',
  enhancedCompliance: 'Enhanced Compliance Mode',
  dataRetention: 'Data Retention Policy',
  dataResidency: 'Data Residency',
  privacySettings: 'Privacy Settings',
};

/* Keys rendered as on/off toggles — formatted "Enabled"/"Disabled" in the diff. */
const BOOLEAN_KEYS = new Set([
  'requireMfa', 'enableSso', 'notifyPlatformAlerts', 'notifyPipelineFailures',
  'notifyConnectorFailures', 'notifyScheduledMaintenance', 'notifyInvitationEmails',
  'notifyPasswordReset', 'notifyUserActivity', 'channelEmail', 'channelInApp',
  'channelWebhooks', 'auditLogging', 'enhancedCompliance',
]);

const IP_CIDR_ITEM = /^(\d{1,3})(\.\d{1,3}){3}(\/\d{1,2})?$/;
const URL_PATTERN = /^https:\/\/[^\s]+$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function displayValue(key, value) {
  if (BOOLEAN_KEYS.has(key)) {
    if (key === 'enableSso') return value ? 'Enabled (Okta SAML)' : 'Disabled';
    return value ? 'Enabled' : 'Disabled';
  }
  const str = String(value ?? '').trim();
  return str || '—';
}

/* Validation — the settings form is largely selects (always valid), so
   only the free-text fields with format constraints are checked. These
   feed both inline errors and the Validation Status checklist. */
function validate(form) {
  const errors = {};
  if (!form.displayName.trim()) errors.displayName = 'Display name is required.';
  if (form.allowedIpRanges.trim()) {
    const bad = form.allowedIpRanges
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .some((item) => !IP_CIDR_ITEM.test(item));
    if (bad) errors.allowedIpRanges = 'Enter comma-separated IPv4 CIDR ranges (e.g. 10.0.0.0/8).';
  }
  if (form.channelWebhooks && !form.notificationWebhookUrl.trim()) {
    errors.notificationWebhookUrl = 'A webhook URL is required when webhook delivery is on.';
  }
  if (form.notificationWebhookUrl.trim() && !URL_PATTERN.test(form.notificationWebhookUrl.trim())) {
    errors.notificationWebhookUrl = 'Enter a valid https:// URL.';
  }
  if (form.webhookEndpointUrl.trim() && !URL_PATTERN.test(form.webhookEndpointUrl.trim())) {
    errors.webhookEndpointUrl = 'Enter a valid https:// URL.';
  }
  if (form.portalDisplayName.trim() && form.portalDisplayName.trim().length > 60) {
    errors.portalDisplayName = 'Keep the portal header under 60 characters.';
  }
  if (form.primaryBrandColor.trim() && !HEX_COLOR.test(form.primaryBrandColor.trim())) {
    errors.primaryBrandColor = 'Enter a 6-digit hex color (e.g. #0F5699).';
  }
  return errors;
}

/* The 6 Validation Status items from the Figma sidebar (4/6 in design). */
function computeChecklist(form, errors) {
  return [
    { key: 'required', label: 'Required settings configured', done: !!form.displayName.trim() && !errors.displayName },
    { key: 'security', label: 'Security configuration valid', done: !!form.passwordPolicy && !!form.sessionTimeout && !errors.allowedIpRanges },
    { key: 'notifications', label: 'Notification channels set', done: form.channelEmail || form.channelInApp || form.channelWebhooks },
    { key: 'branding', label: 'Branding complete', done: !!form.portalDisplayName.trim() && !!form.primaryBrandColor && !errors.portalDisplayName && !errors.primaryBrandColor },
    { key: 'audit', label: 'Audit logging enabled', done: !!form.auditLogging },
    { key: 'webhook', label: 'Webhook URL validated', done: !form.webhookEndpointUrl.trim() || !errors.webhookEndpointUrl },
  ];
}

/** SCR-028 — Organization Setting Screen. Node 93:3192, Figma page "Page 1". */
export default function OrganizationSettingsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useOrganizationSettings(id);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Organizations', data?.name ?? id, 'Settings']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading organization settings' : isError ? 'Couldn’t load settings' : ''}
        </span>

        {isLoading && (
          <>
            <BackLink to={`/organizations/${encodeURIComponent(id)}`} />
            <SettingsSkeleton />
          </>
        )}

        {isError && (
          <>
            <BackLink to={`/organizations/${encodeURIComponent(id)}`} />
            <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
              <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load settings</p>
              <p className="m-0 mt-token-1 text-token-sm text-danger">
                {error?.message ?? 'Something went wrong. Please try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-token-4 h-8 rounded-md border border-danger-border bg-surface-card px-token-4 text-token-sm font-medium text-danger-strong hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Retry
              </button>
            </div>
          </>
        )}

        {data && <SettingsForm key={data.id} baseline={data} orgId={id} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

/* Plain back link for loading/error states (no dirty form yet). */
function BackLink({ to }) {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to={to}
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to organization
      </Link>
    </div>
  );
}

/* The editable form is a child keyed on the loaded record so switching
   organizations remounts it with a fresh baseline (no stale dirty state). */
function SettingsForm({ baseline, orgId, navigate }) {
  // `saved` is the working "saved" snapshot the form diffs against. It
  // starts as the server baseline and is replaced by the edited values
  // after a (real or simulated) save so the form settles to a clean
  // state — there is no live endpoint to refetch from (MOD-004 PLANNED).
  const [saved, setSaved] = useState(baseline.form);
  const [form, setForm] = useState(baseline.form);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form, errors), [form, errors]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  // Live dirty tracking + Change Summary computed against the saved snapshot.
  const changes = useMemo(() => {
    const list = [];
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    for (const key of EDITABLE_KEYS) {
      if (norm(saved[key]) !== norm(form[key])) {
        list.push({
          key,
          label: CHANGE_LABELS[key] ?? key,
          before: displayValue(key, saved[key]),
          after: displayValue(key, form[key]),
        });
      }
    }
    return list;
  }, [form, saved]);
  const dirty = changes.length > 0;

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitState.status !== 'idle' && submitState.status !== 'submitting') {
      setSubmitState({ status: 'idle', message: '' });
    }
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }
  function isModified(key) {
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    return norm(saved[key]) !== norm(form[key]);
  }

  function handleReset() {
    setForm(saved);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitState({ status: 'idle', message: '' });
  }

  // Warn on tab close / refresh while there are unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    function warn(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Guarded in-app navigation: any link leaving the editor while dirty
  // must confirm the discard first (Cancel, ← Back, Quick Actions).
  function guardedNavigate(to) {
    if (dirty && typeof window !== 'undefined') {
      const ok = window.confirm('Discard unsaved changes and leave this page?');
      if (!ok) return;
    }
    navigate(to);
  }

  function handleCancel() {
    guardedNavigate(`/organizations/${encodeURIComponent(orgId)}`);
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
    if (!dirty) return;
    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    setSubmitState({ status: 'submitting', message: '' });
    const payload = Object.fromEntries(changes.map((c) => [c.key, form[c.key]]));
    const result = await updateOrganizationSettings(orgId, payload);
    setConfirmOpen(false);
    // Fold the edits into the saved snapshot so the form reads clean after
    // save (no dirty counter, empty Change Summary) — matches what a real
    // persisted save would produce on the next load.
    setSaved(form);
    setTouched({});
    setSubmitAttempted(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-004 has no settings endpoint yet, so nothing was persisted server-side. In a live environment these changes would be saved to this organization’s configuration.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Settings saved.' });
    }
  }

  const shared = {
    form, saved, errors, setField, markTouched, showError, isModified,
  };

  return (
    <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
      <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
        <button
          type="button"
          onClick={() => guardedNavigate(`/organizations/${encodeURIComponent(orgId)}`)}
          className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Back to organization
        </button>
      </div>

      <Header
        baseline={baseline}
        dirty={dirty}
        changeCount={changes.length}
        isValid={isValid}
        onCancel={handleCancel}
        onReset={handleReset}
      />

      <span className="sr-only" role="status" aria-live="polite">
        {submitState.status === 'submitting'
          ? 'Saving settings'
          : submitState.status === 'mocked'
            ? 'Save simulated — no backend available'
            : submitState.status === 'success'
              ? 'Settings saved'
              : dirty
                ? `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}`
                : 'No unsaved changes'}
      </span>

      {submitState.status === 'mocked' && (
        <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
          <p className="m-0 text-token-base font-semibold text-warning">Simulated save (no backend)</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
        </div>
      )}
      {submitState.status === 'success' && (
        <div className="rounded-md border border-success bg-success-bg p-token-5" role="status">
          <p className="m-0 text-token-base font-semibold text-success-strong">Settings saved</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Your changes to this organization’s configuration have been applied.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <GeneralSettings {...shared} />
          <SecurityAuthentication {...shared} ssoProvider={baseline.ssoProvider} />
          <NotificationSettings {...shared} />
          <BrandingSettings {...shared} orgName={baseline.name} />
          <IntegrationSettings {...shared} apiKeys={baseline.apiKeys} onGuardedTest={guardedNavigate} orgId={orgId} />
          <OperationalDefaults {...shared} />
          <ComplianceAudit {...shared} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <OrganizationSummary baseline={baseline} form={form} />
          <ValidationStatus checklist={checklist} completedCount={completedCount} />
          <SecurityHealth items={baseline.securityHealth} form={form} />
          <RecentActivity items={baseline.recentActivity} orgId={orgId} onNavigate={guardedNavigate} />
          <QuickActions orgId={orgId} onNavigate={guardedNavigate} />
        </aside>
      </div>

      <ActionBar
        baseline={baseline}
        dirty={dirty}
        changeCount={changes.length}
        isValid={isValid}
        onCancel={handleCancel}
        onReset={handleReset}
      />

      {confirmOpen && (
        <ConfirmDialog
          changes={changes}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </form>
  );
}

/* ---- Layout primitives ---------------------------------------------- */

function Section({ title, description, icon, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start gap-token-3">
        {icon && <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary">{icon}</span>}
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
        </div>
      </div>
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/* "Modified" pill shown next to a field label when its value differs
   from the saved snapshot (mirrors the Figma amber "Modified" badges). */
function ModifiedBadge() {
  return (
    <span className="ml-token-2 rounded-sm bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning">
      Modified
    </span>
  );
}

function Field({ id, label, required, modified, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="flex items-center text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        {modified && <ModifiedBadge />}
      </label>
      {typeof children === 'function' ? children(describedBy) : children}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-token-xs text-text-faint">{hint}</p>}
      {error && <p id={`${id}-error`} className="m-0 text-token-xs text-danger" role="alert">{error}</p>}
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

function Toggle({ id, checked, onChange, label, description, modified }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary/40 bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <span className="flex items-center">
          <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
          {modified && <ModifiedBadge />}
        </span>
        {description && <span className="mt-0.5 text-token-xs text-text-faint">{description}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-token-2">
        <span aria-hidden="true" className={`w-6 text-right font-mono text-token-xs font-semibold uppercase tracking-[0.04em] ${checked ? 'text-primary' : 'text-text-faint'}`}>
          {checked ? 'On' : 'Off'}
        </span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
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

function Header({ baseline, dirty, changeCount, isValid, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-token-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-shell-accent-wash text-primary" aria-hidden="true"><IconGear className="h-4 w-4" /></span>
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Organization Settings</h1>
          {dirty && (
            <span className="rounded-full bg-warning-bg px-token-3 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning">
              {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          {baseline.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
              title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not a live configuration."
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          {baseline.name} · Configure operational preferences, security policies, integrations, branding, and platform behavior.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={!isValid || !dirty}
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconCheck className="h-3.5 w-3.5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ActionBar({ baseline, dirty, changeCount, isValid, onCancel, onReset }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
        {dirty
          ? `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'} · Last saved ${baseline.lastSavedLabel}`
          : `No unsaved changes · Last saved ${baseline.lastSavedLabel}`}
      </span>
      <div className="flex items-center gap-token-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={!isValid || !dirty}
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconCheck className="h-3.5 w-3.5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}





/* ---- Card 1: General Settings ---------------------------------------- */
function GeneralSettings({ form, errors, setField, markTouched, showError, isModified }) {
  return (
    <Section title="General Settings" description="Locale, display, and default platform preferences." icon={<IconSliders className="h-4 w-4" />}>
      <Field id="field-displayName" label="Organization Display Name" required modified={isModified('displayName')} error={showError('displayName') ? errors.displayName : null}>
        {(db) => (
          <TextInput id="field-displayName" required value={form.displayName} onChange={(v) => setField('displayName', v)} onBlur={() => markTouched('displayName')} invalid={showError('displayName')} describedBy={db} autoComplete="organization" />
        )}
      </Field>
      <Field id="field-language" label="Default Language" modified={isModified('language')}>
        {(db) => (
          <SelectInput id="field-language" value={form.language} onChange={(v) => setField('language', v)} describedBy={db} options={SETTINGS_OPTIONS.language} />
        )}
      </Field>
      <Field id="field-timeZone" label="Time Zone" modified={isModified('timeZone')}>
        {(db) => (
          <SelectInput id="field-timeZone" value={form.timeZone} onChange={(v) => setField('timeZone', v)} describedBy={db} options={SETTINGS_OPTIONS.timeZone} />
        )}
      </Field>
      <Field id="field-dateFormat" label="Date Format" modified={isModified('dateFormat')}>
        {(db) => (
          <SelectInput id="field-dateFormat" value={form.dateFormat} onChange={(v) => setField('dateFormat', v)} describedBy={db} options={SETTINGS_OPTIONS.dateFormat} />
        )}
      </Field>
      <Field id="field-numberFormat" label="Number Format" modified={isModified('numberFormat')}>
        {(db) => (
          <SelectInput id="field-numberFormat" value={form.numberFormat} onChange={(v) => setField('numberFormat', v)} describedBy={db} options={SETTINGS_OPTIONS.numberFormat} />
        )}
      </Field>
      <Field id="field-currency" label="Currency" modified={isModified('currency')}>
        {(db) => (
          <SelectInput id="field-currency" value={form.currency} onChange={(v) => setField('currency', v)} describedBy={db} options={SETTINGS_OPTIONS.currency} />
        )}
      </Field>
      <div className="flex flex-col gap-token-1">
        <span className="flex items-center text-token-sm font-medium text-text-secondary-alt">
          Business Hours
          {(isModified('businessHoursStart') || isModified('businessHoursEnd') || isModified('businessDays')) && <ModifiedBadge />}
        </span>
        <div className="flex items-center gap-token-2">
          <input type="time" aria-label="Business hours start" value={form.businessHoursStart} onChange={(e) => setField('businessHoursStart', e.target.value)} className={`${fieldBase} px-2`} />
          <span className="text-token-xs text-text-faint">to</span>
          <input type="time" aria-label="Business hours end" value={form.businessHoursEnd} onChange={(e) => setField('businessHoursEnd', e.target.value)} className={`${fieldBase} px-2`} />
          <select aria-label="Business days" value={form.businessDays} onChange={(e) => setField('businessDays', e.target.value)} className={`${fieldBase} px-2`}>
            {SETTINGS_OPTIONS.businessDays.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      <Field id="field-defaultDashboard" label="Default Dashboard" modified={isModified('defaultDashboard')}>
        {(db) => (
          <SelectInput id="field-defaultDashboard" value={form.defaultDashboard} onChange={(v) => setField('defaultDashboard', v)} describedBy={db} options={SETTINGS_OPTIONS.defaultDashboard} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Card 2: Security & Authentication ------------------------------- */
function SecurityAuthentication({ form, errors, setField, markTouched, showError, isModified, ssoProvider }) {
  return (
    <Section title="Security & Authentication" description="Access controls, session policy, and API exposure." icon={<IconShield className="h-4 w-4" />}>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-requireMfa" checked={form.requireMfa} onChange={(v) => setField('requireMfa', v)} label="Require Multi-Factor Authentication" description="All members must complete MFA at sign-in." modified={isModified('requireMfa')} />
        <Toggle id="field-enableSso" checked={form.enableSso} onChange={(v) => setField('enableSso', v)} label="Enable Single Sign-On (SSO)" description={ssoProvider ? `Provider: ${ssoProvider}` : 'Delegate authentication to your identity provider.'} modified={isModified('enableSso')} />
        {form.enableSso && (
          <div className="flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-4 py-token-3" role="note">
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="m-0 text-token-xs text-text-secondary-alt">
              Enabling SSO changes how members authenticate. Confirm the identity-provider configuration before saving to avoid locking users out.
            </p>
          </div>
        )}
      </div>
      <Field id="field-passwordPolicy" label="Password Complexity Policy" modified={isModified('passwordPolicy')}>
        {(db) => (
          <SelectInput id="field-passwordPolicy" value={form.passwordPolicy} onChange={(v) => setField('passwordPolicy', v)} describedBy={db} options={SETTINGS_OPTIONS.passwordPolicy} />
        )}
      </Field>
      <Field id="field-passwordExpiration" label="Password Expiration" modified={isModified('passwordExpiration')}>
        {(db) => (
          <SelectInput id="field-passwordExpiration" value={form.passwordExpiration} onChange={(v) => setField('passwordExpiration', v)} describedBy={db} options={SETTINGS_OPTIONS.passwordExpiration} />
        )}
      </Field>
      <Field id="field-sessionTimeout" label="Session Timeout" modified={isModified('sessionTimeout')}>
        {(db) => (
          <SelectInput id="field-sessionTimeout" value={form.sessionTimeout} onChange={(v) => setField('sessionTimeout', v)} describedBy={db} options={SETTINGS_OPTIONS.sessionTimeout} />
        )}
      </Field>
      <Field id="field-concurrentSessions" label="Concurrent Session Limit" modified={isModified('concurrentSessions')}>
        {(db) => (
          <SelectInput id="field-concurrentSessions" value={form.concurrentSessions} onChange={(v) => setField('concurrentSessions', v)} describedBy={db} options={SETTINGS_OPTIONS.concurrentSessions} />
        )}
      </Field>
      <fieldset className="sm:col-span-2 m-0 flex flex-col gap-token-2 border-0 p-0">
        <legend className="flex items-center p-0 text-token-sm font-medium text-text-secondary-alt">
          API Access
          {isModified('apiAccess') && <ModifiedBadge />}
        </legend>
        <div className="flex flex-wrap gap-token-2">
          {SETTINGS_OPTIONS.apiAccess.map((opt) => {
            const checked = form.apiAccess === opt;
            return (
              <label key={opt} className={`flex cursor-pointer items-center gap-token-2 rounded-md border px-token-4 py-token-2 text-token-sm transition-colors ${checked ? 'border-primary bg-shell-accent-wash text-text-primary-alt' : 'border-border-subtle bg-surface-muted text-text-secondary-alt hover:bg-surface-hover'}`}>
                <input type="radio" name="apiAccess" value={opt} checked={checked} onChange={() => setField('apiAccess', opt)} className="accent-primary" />
                {opt}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field id="field-allowedIpRanges" label="Allowed IP Ranges" className="sm:col-span-2" modified={isModified('allowedIpRanges')} hint="Comma-separated IPv4 CIDR ranges. Leave blank to allow all addresses." error={showError('allowedIpRanges') ? errors.allowedIpRanges : null}>
        {(db) => (
          <TextInput id="field-allowedIpRanges" value={form.allowedIpRanges} onChange={(v) => setField('allowedIpRanges', v)} onBlur={() => markTouched('allowedIpRanges')} invalid={showError('allowedIpRanges')} describedBy={db} placeholder="10.0.0.0/8, 192.168.1.0/24" />
        )}
      </Field>
    </Section>
  );
}

/* ---- Card 3: Notification Settings ----------------------------------- */
function NotificationSettings({ form, errors, setField, markTouched, showError, isModified }) {
  return (
    <Section title="Notification Settings" description="System and user event notifications and their delivery channels." icon={<IconBell className="h-4 w-4" />}>
      <div className="sm:col-span-2 flex flex-col gap-token-4">
        <div className="flex flex-col gap-token-2">
          <h3 className="m-0 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">System Notifications</h3>
          <Toggle id="field-notifyPlatformAlerts" checked={form.notifyPlatformAlerts} onChange={(v) => setField('notifyPlatformAlerts', v)} label="Platform Alerts" description="Critical platform-wide status and incident alerts." modified={isModified('notifyPlatformAlerts')} />
          <Toggle id="field-notifyPipelineFailures" checked={form.notifyPipelineFailures} onChange={(v) => setField('notifyPipelineFailures', v)} label="Pipeline Failures" description="Notify when a data pipeline run fails." modified={isModified('notifyPipelineFailures')} />
          <Toggle id="field-notifyConnectorFailures" checked={form.notifyConnectorFailures} onChange={(v) => setField('notifyConnectorFailures', v)} label="Connector Failures" description="Notify when a connector loses connectivity." modified={isModified('notifyConnectorFailures')} />
          <Toggle id="field-notifyScheduledMaintenance" checked={form.notifyScheduledMaintenance} onChange={(v) => setField('notifyScheduledMaintenance', v)} label="Scheduled Maintenance" description="Advance notice of planned maintenance windows." modified={isModified('notifyScheduledMaintenance')} />
        </div>
        <div className="flex flex-col gap-token-2">
          <h3 className="m-0 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">User Notifications</h3>
          <Toggle id="field-notifyInvitationEmails" checked={form.notifyInvitationEmails} onChange={(v) => setField('notifyInvitationEmails', v)} label="Invitation Emails" description="Send email when a user is invited to the organization." modified={isModified('notifyInvitationEmails')} />
          <Toggle id="field-notifyPasswordReset" checked={form.notifyPasswordReset} onChange={(v) => setField('notifyPasswordReset', v)} label="Password Reset Emails" description="Send password-reset instructions by email." modified={isModified('notifyPasswordReset')} />
          <Toggle id="field-notifyUserActivity" checked={form.notifyUserActivity} onChange={(v) => setField('notifyUserActivity', v)} label="User Activity Alerts" description="Notify admins of notable user activity." modified={isModified('notifyUserActivity')} />
        </div>
        <div className="flex flex-col gap-token-2">
          <h3 className="m-0 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">Delivery Channels</h3>
          <Toggle id="field-channelEmail" checked={form.channelEmail} onChange={(v) => setField('channelEmail', v)} label="Email" description="Deliver notifications by email." modified={isModified('channelEmail')} />
          <Toggle id="field-channelInApp" checked={form.channelInApp} onChange={(v) => setField('channelInApp', v)} label="In-App" description="Show notifications in the platform notification center." modified={isModified('channelInApp')} />
          <Toggle id="field-channelWebhooks" checked={form.channelWebhooks} onChange={(v) => setField('channelWebhooks', v)} label="Webhooks" description="POST notification events to an external endpoint." modified={isModified('channelWebhooks')} />
        </div>
      </div>
      {form.channelWebhooks && (
        <Field id="field-notificationWebhookUrl" label="Notification Webhook URL" className="sm:col-span-2" required modified={isModified('notificationWebhookUrl')} error={showError('notificationWebhookUrl') ? errors.notificationWebhookUrl : null} hint="Events are POSTed here as JSON. Must be an https:// endpoint.">
          {(db) => (
            <TextInput id="field-notificationWebhookUrl" required value={form.notificationWebhookUrl} onChange={(v) => setField('notificationWebhookUrl', v)} onBlur={() => markTouched('notificationWebhookUrl')} invalid={showError('notificationWebhookUrl')} describedBy={db} placeholder="https://hooks.example.com/notifications" inputMode="url" />
          )}
        </Field>
      )}
    </Section>
  );
}

/* ---- Card 4: Branding ------------------------------------------------ */
function BrandingSettings({ form, errors, setField, markTouched, showError, isModified, orgName }) {
  return (
    <Section title="Branding" description="Customer-facing portal identity and email presentation." icon={<IconPalette className="h-4 w-4" />}>
      <div className="sm:col-span-2 flex items-center gap-token-4 rounded-md border border-dashed border-border-subtle bg-surface-muted p-token-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-card text-token-base font-bold text-primary ring-1 ring-border" aria-hidden="true">
          {(orgName || 'Org').slice(0, 2).toUpperCase()}
        </span>
        <div className="flex flex-col">
          <span className="text-token-sm font-medium text-text-primary-alt">Organization Logo</span>
          <span className="text-token-xs text-text-faint">Recommended 256x256px PNG or SVG.</span>
        </div>
        <button
          type="button"
          disabled
          title="Logo upload requires MOD-004 (Organization Management) asset storage, which is not deployed yet."
          className="ml-auto flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Upload Logo
        </button>
      </div>
      <Field id="field-portalDisplayName" label="Display Name (Portal Header)" modified={isModified('portalDisplayName')} error={showError('portalDisplayName') ? errors.portalDisplayName : null} hint="Shown in the customer portal header. Max 60 characters.">
        {(db) => (
          <TextInput id="field-portalDisplayName" value={form.portalDisplayName} onChange={(v) => setField('portalDisplayName', v)} onBlur={() => markTouched('portalDisplayName')} invalid={showError('portalDisplayName')} describedBy={db} maxLength={80} />
        )}
      </Field>
      <Field id="field-primaryBrandColor" label="Primary Brand Color" modified={isModified('primaryBrandColor')} error={showError('primaryBrandColor') ? errors.primaryBrandColor : null}>
        {(db) => (
          <div className="flex items-center gap-token-2">
            <input type="color" aria-label="Primary brand color picker" value={/^#[0-9a-fA-F]{6}$/.test(form.primaryBrandColor) ? form.primaryBrandColor : '#0F5699'} onChange={(e) => setField('primaryBrandColor', e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-surface-card p-1" />
            <input id="field-primaryBrandColor" value={form.primaryBrandColor} onChange={(e) => setField('primaryBrandColor', e.target.value)} onBlur={() => markTouched('primaryBrandColor')} aria-invalid={showError('primaryBrandColor') || undefined} aria-describedby={db} className={`${fieldBase} font-mono`} placeholder="#0F5699" />
          </div>
        )}
      </Field>
      <Field id="field-emailBrandingTemplate" label="Email Branding Template" modified={isModified('emailBrandingTemplate')}>
        {(db) => (
          <SelectInput id="field-emailBrandingTemplate" value={form.emailBrandingTemplate} onChange={(v) => setField('emailBrandingTemplate', v)} describedBy={db} options={SETTINGS_OPTIONS.emailBrandingTemplate} />
        )}
      </Field>
      <Field id="field-loginWelcomeMessage" label="Login Welcome Message" className="sm:col-span-2" modified={isModified('loginWelcomeMessage')}>
        {(db) => (
          <textarea id="field-loginWelcomeMessage" value={form.loginWelcomeMessage} onChange={(e) => setField('loginWelcomeMessage', e.target.value)} aria-describedby={db} rows={2} className={`${fieldBase} h-auto resize-y py-2`} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Card 5: Integration Settings ------------------------------------ */
function IntegrationSettings({ form, errors, setField, markTouched, showError, isModified, apiKeys }) {
  return (
    <Section title="Integration Settings" description="Outbound webhooks, event signing, and connector defaults." icon={<IconPlug className="h-4 w-4" />}>
      <Field id="field-webhookEndpointUrl" label="Webhook Endpoint URL" className="sm:col-span-2" modified={isModified('webhookEndpointUrl')} error={showError('webhookEndpointUrl') ? errors.webhookEndpointUrl : null} hint="Platform events are delivered here. Must be an https:// endpoint.">
        {(db) => (
          <div className="flex items-center gap-token-2">
            <TextInput id="field-webhookEndpointUrl" value={form.webhookEndpointUrl} onChange={(v) => setField('webhookEndpointUrl', v)} onBlur={() => markTouched('webhookEndpointUrl')} invalid={showError('webhookEndpointUrl')} describedBy={db} placeholder="https://hooks.example.com/events" inputMode="url" />
            <button
              type="button"
              disabled
              title="Sending a test event requires MOD-004 (Organization Management) webhook delivery, which is not deployed yet."
              className="flex h-9 shrink-0 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
            >
              Test
            </button>
          </div>
        )}
      </Field>
      <Field id="field-eventSignatureMethod" label="Event Signature Method" modified={isModified('eventSignatureMethod')}>
        {(db) => (
          <SelectInput id="field-eventSignatureMethod" value={form.eventSignatureMethod} onChange={(v) => setField('eventSignatureMethod', v)} describedBy={db} options={SETTINGS_OPTIONS.eventSignatureMethod} />
        )}
      </Field>
      <Field id="field-retryPolicy" label="Retry Policy" modified={isModified('retryPolicy')}>
        {(db) => (
          <SelectInput id="field-retryPolicy" value={form.retryPolicy} onChange={(v) => setField('retryPolicy', v)} describedBy={db} options={SETTINGS_OPTIONS.retryPolicy} />
        )}
      </Field>
      <Field id="field-connectorPermissions" label="Default Connector Permissions" modified={isModified('connectorPermissions')}>
        {(db) => (
          <SelectInput id="field-connectorPermissions" value={form.connectorPermissions} onChange={(v) => setField('connectorPermissions', v)} describedBy={db} options={SETTINGS_OPTIONS.connectorPermissions} />
        )}
      </Field>
      <Field id="field-outboundTimeout" label="Outbound Connection Timeout" modified={isModified('outboundTimeout')}>
        {(db) => (
          <SelectInput id="field-outboundTimeout" value={form.outboundTimeout} onChange={(v) => setField('outboundTimeout', v)} describedBy={db} options={SETTINGS_OPTIONS.outboundTimeout} />
        )}
      </Field>
      <div className="sm:col-span-2 flex flex-col gap-token-2">
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">API Keys</h3>
          <button
            type="button"
            disabled
            title="Generating API keys requires MOD-004 (Organization Management) key management, which is not deployed yet."
            className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-xs font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate New Key
          </button>
        </div>
        <div className="overflow-hidden rounded-md border border-border-subtle">
          <table className="w-full border-collapse text-left text-token-sm">
            <thead>
              <tr className="bg-surface-muted text-token-xs uppercase tracking-[0.04em] text-text-faint">
                <th scope="col" className="px-token-4 py-token-2 font-semibold">Name</th>
                <th scope="col" className="px-token-4 py-token-2 font-semibold">Created</th>
                <th scope="col" className="px-token-4 py-token-2 font-semibold">Status</th>
                <th scope="col" className="px-token-4 py-token-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => {
                const active = key.status === 'Active';
                return (
                  <tr key={key.id} className="border-t border-border-subtle">
                    <td className="px-token-4 py-token-3 font-medium text-text-primary-alt">{key.name}</td>
                    <td className="px-token-4 py-token-3 text-text-secondary-alt">{key.created}</td>
                    <td className="px-token-4 py-token-3">
                      <span className={`rounded-sm px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] ${active ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-faint'}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-token-4 py-token-3">
                      <div className="flex items-center justify-end gap-token-2">
                        <button type="button" disabled title="API key rotation requires MOD-004 key management, which is not deployed yet." className="text-token-xs font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-50">Rotate</button>
                        <button type="button" disabled title="API key revocation requires MOD-004 key management, which is not deployed yet." className="text-token-xs font-medium text-danger disabled:cursor-not-allowed disabled:opacity-50">Revoke</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="m-0 text-token-xs text-text-faint">Key management actions are unavailable until MOD-004 (Organization Management) is deployed.</p>
      </div>
    </Section>
  );
}

/* ---- Card 6: Operational Defaults ------------------------------------ */
function OperationalDefaults({ form, setField, isModified }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  return (
    <Section title="Operational Defaults" description="Default environment, retention, and execution behavior for new work." icon={<IconCog className="h-4 w-4" />}>
      <Field id="field-defaultEnvironment" label="Default Environment" modified={isModified('defaultEnvironment')}>
        {(db) => (
          <SelectInput id="field-defaultEnvironment" value={form.defaultEnvironment} onChange={(v) => setField('defaultEnvironment', v)} describedBy={db} options={SETTINGS_OPTIONS.defaultEnvironment} />
        )}
      </Field>
      <Field id="field-pipelineRetention" label="Pipeline Retention Policy" modified={isModified('pipelineRetention')}>
        {(db) => (
          <SelectInput id="field-pipelineRetention" value={form.pipelineRetention} onChange={(v) => setField('pipelineRetention', v)} describedBy={db} options={SETTINGS_OPTIONS.pipelineRetention} />
        )}
      </Field>
      <Field id="field-logRetention" label="Log Retention" modified={isModified('logRetention')}>
        {(db) => (
          <SelectInput id="field-logRetention" value={form.logRetention} onChange={(v) => setField('logRetention', v)} describedBy={db} options={SETTINGS_OPTIONS.logRetention} />
        )}
      </Field>
      <div className="sm:col-span-2 mt-token-1 rounded-md border border-border-subtle">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={advancedOpen}
          aria-controls="advanced-execution-panel"
          className="flex w-full items-center justify-between px-token-4 py-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex items-center gap-token-2">
            Advanced Execution Settings
            {(isModified('defaultRetryPolicy') || isModified('executionTimeout') || isModified('workerAssignment')) && <ModifiedBadge />}
          </span>
          <IconChevron className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        </button>
        {advancedOpen && (
          <div id="advanced-execution-panel" className="grid grid-cols-1 gap-token-4 border-t border-border-subtle p-token-4 sm:grid-cols-2">
            <Field id="field-defaultRetryPolicy" label="Default Retry Policy" modified={isModified('defaultRetryPolicy')}>
              {(db) => (
                <SelectInput id="field-defaultRetryPolicy" value={form.defaultRetryPolicy} onChange={(v) => setField('defaultRetryPolicy', v)} describedBy={db} options={SETTINGS_OPTIONS.defaultRetryPolicy} />
              )}
            </Field>
            <Field id="field-executionTimeout" label="Default Execution Timeout" modified={isModified('executionTimeout')}>
              {(db) => (
                <SelectInput id="field-executionTimeout" value={form.executionTimeout} onChange={(v) => setField('executionTimeout', v)} describedBy={db} options={SETTINGS_OPTIONS.executionTimeout} />
              )}
            </Field>
            <Field id="field-workerAssignment" label="Default Worker Assignment" className="sm:col-span-2" modified={isModified('workerAssignment')}>
              {(db) => (
                <SelectInput id="field-workerAssignment" value={form.workerAssignment} onChange={(v) => setField('workerAssignment', v)} describedBy={db} options={SETTINGS_OPTIONS.workerAssignment} />
              )}
            </Field>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ---- Card 7: Compliance & Audit -------------------------------------- */
function ComplianceAudit({ form, setField, isModified }) {
  return (
    <Section title="Compliance & Audit" description="Audit logging, compliance posture, and data governance." icon={<IconClipboard className="h-4 w-4" />}>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-auditLogging" checked={form.auditLogging} onChange={(v) => setField('auditLogging', v)} label="Enable Audit Logging" description="Record configuration and access events for this organization." modified={isModified('auditLogging')} />
        <Toggle id="field-enhancedCompliance" checked={form.enhancedCompliance} onChange={(v) => setField('enhancedCompliance', v)} label="Enhanced Compliance Mode" description="Enforce stricter data-handling and retention controls." modified={isModified('enhancedCompliance')} />
        {form.enhancedCompliance && (
          <div className="flex items-start gap-token-2 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3" role="note">
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="m-0 text-token-xs text-text-secondary-alt">
              Enhanced compliance applies stricter retention floors and audit requirements. Some retention options below may be constrained once enabled.
            </p>
          </div>
        )}
      </div>
      <Field id="field-dataRetention" label="Data Retention Policy" modified={isModified('dataRetention')}>
        {(db) => (
          <SelectInput id="field-dataRetention" value={form.dataRetention} onChange={(v) => setField('dataRetention', v)} describedBy={db} options={SETTINGS_OPTIONS.dataRetention} />
        )}
      </Field>
      <Field id="field-dataResidency" label="Data Residency" modified={isModified('dataResidency')}>
        {(db) => (
          <SelectInput id="field-dataResidency" value={form.dataResidency} onChange={(v) => setField('dataResidency', v)} describedBy={db} options={SETTINGS_OPTIONS.dataResidency} />
        )}
      </Field>
      <Field id="field-privacySettings" label="Privacy Settings" className="sm:col-span-2" modified={isModified('privacySettings')}>
        {(db) => (
          <SelectInput id="field-privacySettings" value={form.privacySettings} onChange={(v) => setField('privacySettings', v)} describedBy={db} options={SETTINGS_OPTIONS.privacySettings} />
        )}
      </Field>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-token-2">
        <button
          type="button"
          onClick={() => {
            const auditData = [
              ['Timestamp', 'Actor', 'Action', 'Target', 'Status'],
              [new Date().toISOString(), 'System Admin', 'UPDATE_SETTINGS', 'Compliance Policy', 'SUCCESS'],
              [new Date(Date.now() - 3600000).toISOString(), 'A. Chen', 'ROTATE_KEYS', 'Production API', 'SUCCESS'],
            ];
            downloadCsv(auditData[0], auditData.slice(1), 'connectiq-organization-audit');
          }}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Export Audit Logs (CSV)
        </button>
        <button
          type="button"
          onClick={() => {
            downloadJson(form, 'connectiq-organization-settings');
          }}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Export Audit Logs (JSON)
        </button>
      </div>
    </Section>
  );
}

/* ---- Sidebar: Organization Summary ----------------------------------- */
function OrganizationSummary({ baseline, form }) {
  const rows = [
    { label: 'Organization ID', value: baseline.organizationId },
    { label: 'Status', value: baseline.status },
    { label: 'Plan', value: baseline.plan },
    { label: 'Administrator', value: baseline.administrator },
    { label: 'Region', value: form.dataResidency || baseline.region },
    { label: 'Time Zone', value: form.timeZone },
  ];
  return (
    <SideCard title="Organization Summary">
      <dl className="m-0 flex flex-col gap-token-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-token-3">
            <dt className="m-0 text-token-xs text-text-faint">{r.label}</dt>
            <dd className="m-0 text-right text-token-sm font-medium text-text-primary-alt">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-token-3 border-t border-border-subtle pt-token-3 text-token-xs text-text-faint">{baseline.sinceLabel} · Last saved {baseline.lastSavedLabel}</p>
    </SideCard>
  );
}

/* ---- Sidebar: Validation Status -------------------------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  const pct = Math.round((completedCount / total) * 100);
  return (
    <SideCard title="Validation Status" trailing={<span className="font-mono text-token-xs font-semibold text-text-secondary-alt">{completedCount}/{total}</span>}>
      <div className="mb-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={total} aria-label="Validation items complete">
        <div className={`h-full rounded-full ${completedCount === total ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-sm">
            {item.done
              ? <IconCheckCircle className="h-4 w-4 shrink-0 text-success-strong" />
              : <IconCircleOpen className="h-4 w-4 shrink-0 text-text-faint" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-faint'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

/* ---- Sidebar: Security Health ---------------------------------------- */
function SecurityHealth({ items, form }) {
  // The MFA / SSO / API rows reflect the live form so the posture updates
  // as the user edits, rather than staying pinned to the saved baseline.
  const live = items.map((it) => {
    if (it.label === 'MFA') return { ...it, value: form.requireMfa ? 'Enforced' : 'Optional', tone: form.requireMfa ? 'good' : 'warn' };
    if (it.label === 'SSO') return { ...it, value: form.enableSso ? 'Enabled' : 'Disabled', tone: form.enableSso ? 'good' : 'warn' };
    if (it.label === 'API Security') return { ...it, value: form.apiAccess, tone: form.apiAccess === 'Disabled' ? 'good' : form.apiAccess === 'Read Only' ? 'good' : 'warn' };
    return it;
  });
  const toneClass = (tone) => (tone === 'good' ? 'text-success-strong' : tone === 'warn' ? 'text-warning' : 'text-text-secondary-alt');
  const dotClass = (tone) => (tone === 'good' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : 'bg-border');
  return (
    <SideCard title="Security Health">
      <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
        {live.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-token-3 text-token-sm">
            <span className="flex items-center gap-token-2 text-text-secondary-alt">
              <span className={`h-1.5 w-1.5 rounded-full ${dotClass(it.tone)}`} aria-hidden="true" />
              {it.label}
            </span>
            <span className={`font-medium ${toneClass(it.tone)}`}>{it.value}</span>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

/* ---- Sidebar: Recent Configuration Activity -------------------------- */
function RecentActivity({ items, orgId, onNavigate }) {
  return (
    <SideCard title="Recent Configuration Activity">
      <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-0.5 border-l-2 border-border-subtle pl-token-3">
            <span className="text-token-sm font-medium text-text-primary-alt">{a.label}</span>
            <span className="text-token-xs text-text-faint">{a.meta}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onNavigate(`/organizations/${encodeURIComponent(orgId)}`)}
        className="mt-token-3 flex items-center gap-token-1 text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View Configuration History
        <IconArrowRight className="h-3.5 w-3.5" />
      </button>
    </SideCard>
  );
}

/* ---- Sidebar: Quick Actions ------------------------------------------ */
function QuickActions({ orgId, onNavigate }) {
  return (
    <SideCard title="Quick Actions">
      <div className="flex flex-col gap-token-2">
        <button
          type="button"
          onClick={() => onNavigate(`/organizations/${encodeURIComponent(orgId)}/edit`)}
          className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Edit Organization Profile
          <IconArrowRight className="h-3.5 w-3.5" />
        </button>
        <button type="button" disabled title="Member management requires MOD-005 (User Management), which is not deployed yet." className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Manage Members
        </button>
        <button type="button" disabled title="SSO configuration requires MOD-002 (Authentication), which is not deployed yet." className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Configure SSO Provider
        </button>
        <button type="button" disabled title="Deactivating an organization requires MOD-004 (Organization Management), which is not deployed yet." className="flex h-9 items-center justify-between rounded-md border border-danger-border bg-surface-card px-token-4 text-token-sm font-medium text-danger disabled:cursor-not-allowed disabled:opacity-60">
          Deactivate Organization
        </button>
      </div>
    </SideCard>
  );
}

function SideCard({ title, trailing, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="mb-token-3 flex items-center justify-between">
        <h2 className="m-0 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-faint">{title}</h2>
        {trailing}
      </div>
      {children}
    </section>
  );
}

/* ---- Save-confirmation dialog (focus-trapped) ------------------------ */
function ConfirmDialog({ changes, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    confirmRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll('button:not([disabled])');
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
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-md border border-border bg-surface-card shadow-lg"
      >
        <div className="border-b border-border-subtle px-token-6 py-token-4">
          <h2 id="confirm-title" className="m-0 text-token-base font-semibold text-text-primary-alt">Save configuration changes?</h2>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
            Review the {changes.length} {changes.length === 1 ? 'change' : 'changes'} below before applying them to this organization.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-token-6 py-token-4">
          <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
            {changes.map((c) => (
              <li key={c.key} className="flex flex-col gap-0.5 border-b border-border-subtle pb-token-3 last:border-0 last:pb-0">
                <span className="text-token-sm font-medium text-text-primary-alt">{c.label}</span>
                <span className="flex flex-wrap items-center gap-token-2 text-token-xs">
                  <span className="rounded-sm bg-surface-muted px-token-2 py-0.5 text-text-faint line-through">{c.before}</span>
                  <IconArrowRight className="h-3 w-3 text-text-faint" />
                  <span className="rounded-sm bg-success-bg px-token-2 py-0.5 font-medium text-success-strong">{c.after}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-token-3 border-t border-border-subtle px-token-6 py-token-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex h-9 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-5 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting ? <><IconSpinner className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><IconCheck className="h-3.5 w-3.5" /> Confirm & Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Loading skeleton ------------------------------------------------ */
function SettingsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-token-6" aria-hidden="true">
      <div className="h-10 w-1/2 rounded-md bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-border bg-surface-card p-token-6">
              <div className="h-5 w-1/3 rounded bg-surface-muted" />
              <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((j) => <div key={j} className="h-9 rounded-md bg-surface-muted" />)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-token-5">
          {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-md border border-border bg-surface-card p-token-5" />)}
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor, stroke-based) ----------------------- */
function svgProps(extra) {
  return { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', ...extra };
}
function IconGear({ className }) {
  return (
    <svg {...svgProps({ className })}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconCheck({ className }) {
  return <svg {...svgProps({ className })}><path d="M20 6 9 17l-5-5" /></svg>;
}
function IconSliders({ className }) {
  return <svg {...svgProps({ className })}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>;
}
function IconShield({ className }) {
  return <svg {...svgProps({ className })}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconInfo({ className }) {
  return <svg {...svgProps({ className })}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
}
function IconBell({ className }) {
  return <svg {...svgProps({ className })}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconPalette({ className }) {
  return <svg {...svgProps({ className })}><circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.7 0 2-1.3 1-2.2-.9-.9-1-2.3 0-3.3.5-.5 1.2-.5 2-.5h1.5c2.5 0 4.5-2 4.5-4.5C21 5.8 16.9 2 12 2z" /></svg>;
}
function IconPlug({ className }) {
  return <svg {...svgProps({ className })}><path d="M9 2v6" /><path d="M15 2v6" /><path d="M6 8h12v3a6 6 0 0 1-12 0z" /><path d="M12 17v5" /></svg>;
}
function IconCog({ className }) {
  return <svg {...svgProps({ className })}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>;
}
function IconChevron({ className }) {
  return <svg {...svgProps({ className })}><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconClipboard({ className }) {
  return <svg {...svgProps({ className })}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>;
}
function IconCheckCircle({ className }) {
  return <svg {...svgProps({ className })}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function IconCircleOpen({ className }) {
  return <svg {...svgProps({ className })}><circle cx="12" cy="12" r="9" /></svg>;
}
function IconArrowRight({ className }) {
  return <svg {...svgProps({ className })}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function IconSpinner({ className }) {
  return <svg {...svgProps({ className })}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}
