import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useEditableOrganization } from '../hooks/useEditableOrganization';
import { ORG_FORM_OPTIONS, PLAN_CATALOG, SUBSCRIPTION_PLANS, updateOrganization } from '../services/editOrganization.api';

/* Field styling — mirrors CreateOrganizationScreen so the two org forms
   stay visually consistent without coupling features. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Editable fields tracked for dirty-state + Change Summary. `code` is
   read-only (auto-generated, "Cannot be changed after creation.") so it
   is intentionally excluded. */
const EDITABLE_KEYS = [
  'name', 'displayName', 'industry', 'organizationType', 'description',
  'country', 'region', 'timeZone', 'language', 'dateFormat', 'currency',
  'adminFirstName', 'adminLastName', 'adminEmail', 'adminPhone', 'adminJobTitle', 'initialRole',
  'plan', 'billingModel', 'licenseLimit', 'storage',
  'requireMfa', 'enableSso', 'passwordPolicy', 'sessionTimeout', 'apiAccess', 'ipRestrictions',
  'defaultEnvironment', 'dataRetention', 'auditLogging', 'notificationPreferences', 'connectorPermissions',
];

/* Human labels + value formatters for the Change Summary diff card. */
const CHANGE_LABELS = {
  name: 'Organization Name',
  displayName: 'Display Name',
  industry: 'Industry',
  organizationType: 'Organization Type',
  description: 'Description',
  country: 'Country',
  region: 'Region / Data Center',
  timeZone: 'Time Zone',
  language: 'Default Language',
  dateFormat: 'Date Format',
  currency: 'Currency',
  adminFirstName: 'Admin First Name',
  adminLastName: 'Admin Last Name',
  adminEmail: 'Admin Email',
  adminPhone: 'Admin Phone',
  adminJobTitle: 'Admin Job Title',
  initialRole: 'Admin Role',
  plan: 'Subscription Plan',
  billingModel: 'Billing Model',
  licenseLimit: 'License Limit',
  storage: 'Storage Allocation',
  requireMfa: 'Require MFA',
  enableSso: 'SSO',
  passwordPolicy: 'Password Policy',
  sessionTimeout: 'Session Timeout',
  apiAccess: 'API Access',
  ipRestrictions: 'IP Restrictions',
  defaultEnvironment: 'Default Environment',
  dataRetention: 'Data Retention',
  auditLogging: 'Audit Logging',
  notificationPreferences: 'Notification Preferences',
  connectorPermissions: 'Connector Permissions',
};

function displayValue(key, value) {
  if (key === 'requireMfa' || key === 'auditLogging') {
    return value ? 'Enabled' : 'Disabled';
  }
  // SSO "on" is provisioned against the configured Okta provider — the
  // Figma Change Summary labels the after-value "Enabled (Okta SAML)".
  if (key === 'enableSso') return value ? 'Enabled (Okta SAML)' : 'Disabled';
  if (key === 'licenseLimit') return value ? `${value} seats` : '—';
  const str = String(value ?? '').trim();
  return str || '—';
}

/* Required-field validation — mirrors the Create screen's rules for the
   fields the edit form still exposes as required (marked * in Figma). */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Organization name is required.';
  if (!form.organizationType) errors.organizationType = 'Select an organization type.';
  if (!form.country) errors.country = 'Select a country.';
  if (!form.timeZone) errors.timeZone = 'Select a time zone.';
  if (!form.adminFirstName.trim()) errors.adminFirstName = 'First name is required.';
  if (!form.adminLastName.trim()) errors.adminLastName = 'Last name is required.';
  if (!form.adminEmail.trim()) errors.adminEmail = 'Work email is required.';
  else if (!EMAIL_PATTERN.test(form.adminEmail.trim())) errors.adminEmail = 'Enter a valid email address.';
  if (!form.plan) errors.plan = 'Select a subscription plan.';
  if (!form.licenseLimit.toString().trim()) errors.licenseLimit = 'License limit is required.';
  else if (!/^\d+$/.test(form.licenseLimit.toString().trim()) || Number(form.licenseLimit) < 1)
    errors.licenseLimit = 'Enter a whole number of seats.';
  if (!form.defaultEnvironment) errors.defaultEnvironment = 'Select a default environment.';
  return errors;
}

/* The 6 Validation Status items from the Figma sidebar (5/6 in design). */
function computeChecklist(form, errors) {
  return [
    { key: 'required', label: 'Required fields complete', done: Object.keys(errors).length === 0 },
    { key: 'unique', label: 'Organization name unique', done: !!form.name.trim() },
    { key: 'email', label: 'Administrator email valid', done: EMAIL_PATTERN.test(form.adminEmail.trim()) },
    { key: 'license', label: 'License limit valid', done: /^\d+$/.test(form.licenseLimit.toString().trim()) && Number(form.licenseLimit) >= 1 },
    { key: 'security', label: 'Security config complete', done: !!form.passwordPolicy && !!form.sessionTimeout && !!form.apiAccess },
    { key: 'platform', label: 'Platform config complete', done: !!form.defaultEnvironment && !!form.dataRetention },
  ];
}

/** SCR-027 — Edit Organization Screen. Node 93:1566, Figma page "Page 1". */
export default function EditOrganizationScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useEditableOrganization(id);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Organizations', data?.form?.name ?? id, 'Edit']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading organization for editing' : isError ? 'Couldn’t load organization' : ''}
        </span>

        {isLoading && (
          <>
            <BackLink to={`/organizations/${encodeURIComponent(id)}`} />
            <EditSkeleton />
          </>
        )}

        {isError && (
          <>
            <BackLink to={`/organizations/${encodeURIComponent(id)}`} />
            <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
              <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load organization</p>
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

        {data && <EditForm key={data.id} baseline={data} orgId={id} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

/* Plain back link used for the loading/error states (no dirty form yet).
   Inside the loaded form a *guarded* button is used instead. */
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
function EditForm({ baseline, orgId, navigate }) {
  const [form, setForm] = useState(baseline.form);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form, errors), [form, errors]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  // Live dirty tracking + Change Summary computed against the saved baseline.
  const changes = useMemo(() => {
    const list = [];
    for (const key of EDITABLE_KEYS) {
      const before = baseline.form[key];
      const after = form[key];
      const norm = (v) => (typeof v === 'string' ? v.trim() : v);
      if (norm(before) !== norm(after)) {
        list.push({ key, label: CHANGE_LABELS[key] ?? key, before: displayValue(key, before), after: displayValue(key, after) });
      }
    }
    return list;
  }, [form, baseline.form]);
  const dirty = changes.length > 0;

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'plan') {
        const cat = PLAN_CATALOG[value];
        if (cat) next.storage = cat.defaultStorage;
      }
      return next;
    });
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }
  function isModified(key) {
    const before = baseline.form[key];
    const after = form[key];
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    return norm(before) !== norm(after);
  }

  function handleReset() {
    setForm(baseline.form);
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

  // Guarded in-app navigation: any link that leaves the editor while
  // dirty must confirm the discard first (Cancel, ← Back, View Audit Log).
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
    const result = await updateOrganization(orgId, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-004 has no update endpoint yet, so nothing was persisted. In a live environment these changes would be saved and you’d return to the organization detail page.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Changes saved.' });
      navigate(`/organizations/${encodeURIComponent(orgId)}`);
    }
  }

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
          ? 'Saving changes'
          : submitState.status === 'mocked'
            ? 'Save simulated — no backend available'
            : submitState.status === 'success'
              ? 'Changes saved'
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

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <OrganizationInformation baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <RegionalSettings form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <PrimaryAdministrator form={form} baseline={baseline} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <SubscriptionLicensing form={form} baseline={baseline} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <SecurityConfiguration form={form} baseline={baseline} setField={setField} isModified={isModified} />
          <PlatformConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <OrganizationSummary baseline={baseline} form={form} />
          <ChangeSummary changes={changes} />
          <ValidationStatus checklist={checklist} completedCount={completedCount} />
          <RecentActivity items={baseline.recentActivity} orgId={orgId} onNavigate={guardedNavigate} />
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

function Section({ title, description, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
      {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/* "Modified" pill shown next to a field label when its value differs
   from the saved baseline (mirrors the Figma amber "Modified" badges). */
function ModifiedBadge() {
  return (
    <span className="ml-token-2 rounded-sm bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning">
      Modified
    </span>
  );
}

function Field({ id, label, required, modified, readOnly, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="flex items-center text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        {readOnly && (
          <span className="ml-token-2 rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-text-faint">
            Read-only
          </span>
        )}
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

/* Read-only value display (for fields that "Cannot be changed"). */
function ReadOnlyValue({ value }) {
  return (
    <div className="flex h-9 w-full items-center rounded-md border border-border-subtle bg-surface-muted px-3 font-sans text-token-sm text-text-secondary-alt">
      {value}
    </div>
  );
}

/* ---- Header & action bar -------------------------------------------- */

function Header({ baseline, dirty, changeCount, isValid, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Edit Organization</h1>
          <span className="inline-flex items-center gap-token-2 rounded-full bg-success-bg px-token-3 py-0.5 text-token-meta font-semibold text-success-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            {baseline.status}
          </span>
          {dirty && (
            <span className="rounded-full bg-warning-bg px-token-3 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning">
              {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          {baseline.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
              title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not a live record."
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          {baseline.form.name} · Modify organization configuration and settings.
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
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="button"
          disabled
          title="Saving drafts requires MOD-004’s organization endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={!isValid || !dirty}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
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
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Organization Information ----------------------------- */
function OrganizationInformation({ baseline, form, setField, showError, markTouched, errors, isModified }) {
  return (
    <Section title="Organization Information" description="Core identity and classification details.">
      <dl className="sm:col-span-2 grid grid-cols-2 gap-token-4 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-xs text-text-faint">Organization ID</dt>
          <dd className="m-0 font-mono text-token-sm font-medium text-text-primary-alt">{baseline.organizationId}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-xs text-text-faint">Created</dt>
          <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{baseline.createdLabel}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-xs text-text-faint">Last Updated</dt>
          <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{baseline.lastUpdatedLabel}</dd>
        </div>
      </dl>
      <Field id="field-name" label="Organization Name" required modified={isModified('name')} error={showError('name') ? errors.name : null}>
        {(db) => (
          <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} autoComplete="organization" />
        )}
      </Field>
      <Field id="field-code" label="Organization Code" readOnly hint="Cannot be changed after creation.">
        <ReadOnlyValue value={form.code} />
      </Field>
      <Field id="field-displayName" label="Display Name" modified={isModified('displayName')}>
        {(db) => (
          <TextInput id="field-displayName" value={form.displayName} onChange={(v) => setField('displayName', v)} describedBy={db} />
        )}
      </Field>
      <Field id="field-industry" label="Industry" modified={isModified('industry')}>
        {(db) => (
          <SelectInput id="field-industry" value={form.industry} onChange={(v) => setField('industry', v)} describedBy={db} options={ORG_FORM_OPTIONS.industry} placeholder="Select industry…" />
        )}
      </Field>
      <Field id="field-organizationType" label="Organization Type" required modified={isModified('organizationType')} error={showError('organizationType') ? errors.organizationType : null}>
        {(db) => (
          <SelectInput id="field-organizationType" required value={form.organizationType} onChange={(v) => setField('organizationType', v)} onBlur={() => markTouched('organizationType')} invalid={showError('organizationType')} describedBy={db} options={ORG_FORM_OPTIONS.organizationType} placeholder="Select type…" />
        )}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2" modified={isModified('description')}>
        {(db) => (
          <textarea id="field-description" value={form.description} onChange={(e) => setField('description', e.target.value)} aria-describedby={db} rows={3} className={`${fieldBase} h-auto py-token-2`} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Regional Settings ------------------------------------ */
function RegionalSettings({ form, setField, showError, markTouched, errors, isModified }) {
  return (
    <Section title="Regional Settings" description="Locale and compliance region configuration.">
      <Field id="field-country" label="Country" required modified={isModified('country')} error={showError('country') ? errors.country : null}>
        {(db) => (
          <SelectInput id="field-country" required value={form.country} onChange={(v) => setField('country', v)} onBlur={() => markTouched('country')} invalid={showError('country')} describedBy={db} options={ORG_FORM_OPTIONS.country} placeholder="Select country…" />
        )}
      </Field>
      <Field id="field-region" label="Region / Data Center" modified={isModified('region')}>
        {(db) => (
          <SelectInput id="field-region" value={form.region} onChange={(v) => setField('region', v)} describedBy={db} options={ORG_FORM_OPTIONS.region} />
        )}
      </Field>
      <Field id="field-timeZone" label="Time Zone" required modified={isModified('timeZone')} error={showError('timeZone') ? errors.timeZone : null}>
        {(db) => (
          <SelectInput id="field-timeZone" required value={form.timeZone} onChange={(v) => setField('timeZone', v)} onBlur={() => markTouched('timeZone')} invalid={showError('timeZone')} describedBy={db} options={ORG_FORM_OPTIONS.timeZone} placeholder="Select time zone…" />
        )}
      </Field>
      <Field id="field-language" label="Default Language" modified={isModified('language')}>
        {(db) => (
          <SelectInput id="field-language" value={form.language} onChange={(v) => setField('language', v)} describedBy={db} options={ORG_FORM_OPTIONS.language} />
        )}
      </Field>
      <Field id="field-dateFormat" label="Date Format" modified={isModified('dateFormat')}>
        {(db) => (
          <SelectInput id="field-dateFormat" value={form.dateFormat} onChange={(v) => setField('dateFormat', v)} describedBy={db} options={ORG_FORM_OPTIONS.dateFormat} />
        )}
      </Field>
      <Field id="field-currency" label="Currency" modified={isModified('currency')}>
        {(db) => (
          <SelectInput id="field-currency" value={form.currency} onChange={(v) => setField('currency', v)} describedBy={db} options={ORG_FORM_OPTIONS.currency} />
        )}
      </Field>
      <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-warning-bg px-token-3 py-token-2 text-token-xs text-warning">
        <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
        Changing regional settings may affect scheduled pipelines and data residency.
      </p>
    </Section>
  );
}

/* ---- Section 3: Primary Administrator -------------------------------- */
function PrimaryAdministrator({ form, baseline, setField, showError, markTouched, errors, isModified }) {
  const admin = baseline.admin;
  return (
    <Section title="Primary Administrator" description="Organization&rsquo;s primary platform administrator.">
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-token-4 rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <div className="flex items-center gap-token-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash font-mono text-token-sm font-semibold text-primary">{admin.initials}</span>
          <div>
            <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{admin.name}</p>
            <p className="m-0 text-token-xs text-text-faint">{admin.meta}</p>
          </div>
          <span className="inline-flex items-center gap-token-2 rounded-full bg-success-bg px-token-3 py-0.5 text-token-meta font-semibold text-success-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            {admin.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-token-2">
          <button type="button" disabled title="Changing the administrator requires MOD-005 (User Management) endpoints (still PLANNED)." className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-xs font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">Change Administrator</button>
          <button type="button" disabled title="Sending a password reset requires MOD-002 (Authentication) endpoints (still PLANNED)." className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-xs font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">Send Password Reset</button>
          <button type="button" disabled title="Resending an invitation requires MOD-005 (User Management) endpoints (still PLANNED)." className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-xs font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">Resend Invitation</button>
        </div>
      </div>
      <Field id="field-adminFirstName" label="First Name" required modified={isModified('adminFirstName')} error={showError('adminFirstName') ? errors.adminFirstName : null}>
        {(db) => (
          <TextInput id="field-adminFirstName" required value={form.adminFirstName} onChange={(v) => setField('adminFirstName', v)} onBlur={() => markTouched('adminFirstName')} invalid={showError('adminFirstName')} describedBy={db} autoComplete="given-name" />
        )}
      </Field>
      <Field id="field-adminLastName" label="Last Name" required modified={isModified('adminLastName')} error={showError('adminLastName') ? errors.adminLastName : null}>
        {(db) => (
          <TextInput id="field-adminLastName" required value={form.adminLastName} onChange={(v) => setField('adminLastName', v)} onBlur={() => markTouched('adminLastName')} invalid={showError('adminLastName')} describedBy={db} autoComplete="family-name" />
        )}
      </Field>
      <Field id="field-adminEmail" label="Work Email" required modified={isModified('adminEmail')} error={showError('adminEmail') ? errors.adminEmail : null}>
        {(db) => (
          <TextInput id="field-adminEmail" required type="email" value={form.adminEmail} onChange={(v) => setField('adminEmail', v)} onBlur={() => markTouched('adminEmail')} invalid={showError('adminEmail')} describedBy={db} autoComplete="email" />
        )}
      </Field>
      <Field id="field-adminPhone" label="Phone Number" modified={isModified('adminPhone')}>
        {(db) => (
          <TextInput id="field-adminPhone" type="tel" value={form.adminPhone} onChange={(v) => setField('adminPhone', v)} describedBy={db} autoComplete="tel" />
        )}
      </Field>
      <Field id="field-adminJobTitle" label="Job Title" modified={isModified('adminJobTitle')}>
        {(db) => (
          <TextInput id="field-adminJobTitle" value={form.adminJobTitle} onChange={(v) => setField('adminJobTitle', v)} describedBy={db} autoComplete="organization-title" />
        )}
      </Field>
      <Field id="field-initialRole" label="Role" required modified={isModified('initialRole')}>
        {(db) => (
          <SelectInput id="field-initialRole" value={form.initialRole} onChange={(v) => setField('initialRole', v)} describedBy={db} options={ORG_FORM_OPTIONS.initialRole} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 4: Subscription & Licensing ----------------------------- */
function SubscriptionLicensing({ form, baseline, setField, showError, markTouched, errors, isModified }) {
  const ro = baseline.readOnly;
  const licenseUsagePct = Math.min(100, Math.round((ro.licenseUsedSeats / (Number(form.licenseLimit) || 1)) * 100) || 0);
  return (
    <Section title="Subscription &amp; Licensing" description="Plan, billing, and resource allocation.">
      <Field id="field-plan" label="Subscription Plan" required modified={isModified('plan')} error={showError('plan') ? errors.plan : null}>
        {(db) => (
          <SelectInput id="field-plan" required value={form.plan} onChange={(v) => setField('plan', v)} onBlur={() => markTouched('plan')} invalid={showError('plan')} describedBy={db} options={SUBSCRIPTION_PLANS} />
        )}
      </Field>
      <Field id="field-billingModel" label="Billing Model" modified={isModified('billingModel')}>
        {(db) => (
          <SelectInput id="field-billingModel" value={form.billingModel} onChange={(v) => setField('billingModel', v)} describedBy={db} options={ORG_FORM_OPTIONS.billingModel} />
        )}
      </Field>
      <Field
        id="field-licenseLimit"
        label="License Limit (seats)"
        required
        modified={isModified('licenseLimit')}
        error={showError('licenseLimit') ? errors.licenseLimit : null}
        hint={isModified('licenseLimit') ? `Previously: ${baseline.form.licenseLimit} seats` : null}
      >
        {(db) => (
          <TextInput id="field-licenseLimit" required type="number" min="1" value={form.licenseLimit} onChange={(v) => setField('licenseLimit', v)} onBlur={() => markTouched('licenseLimit')} invalid={showError('licenseLimit')} describedBy={db} />
        )}
      </Field>
      <Field id="field-storage" label="Storage Allocation" modified={isModified('storage')}>
        {(db) => (
          <TextInput id="field-storage" value={form.storage} onChange={(v) => setField('storage', v)} describedBy={db} />
        )}
      </Field>
      <Field id="field-renewalDate" label="Renewal Date" readOnly>
        <ReadOnlyValue value={ro.renewalDate} />
      </Field>
      <Field id="field-trialExpiration" label="Trial Expiration" readOnly>
        <ReadOnlyValue value={ro.trialExpiration} />
      </Field>
      <div className="sm:col-span-2 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <UsageBar
          label="License Usage"
          caption={`${ro.licenseUsedSeats} seats / ${Number(form.licenseLimit) || 0} seats (${licenseUsagePct}%)`}
          pct={licenseUsagePct}
        />
        <UsageBar label="Storage Usage" caption={ro.storageUsageLabel} pct={ro.storageUsagePct} />
      </div>
      {Number(form.licenseLimit) > Number(baseline.form.licenseLimit) && (
        <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-xs text-primary">
          <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
          Increasing the license limit from {baseline.form.licenseLimit} to {form.licenseLimit} seats may change your billing at the next renewal.
        </p>
      )}
    </Section>
  );
}

function UsageBar({ label, caption, pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
      <div className="flex items-center justify-between">
        <span className="text-token-xs font-medium text-text-secondary-alt">{label}</span>
        <span className="font-mono text-token-xs text-text-faint">{caption}</span>
      </div>
      <div className="mt-token-2 h-1.5 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span className={`block h-full rounded-full ${clamped >= 90 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

/* ---- Section 5: Security Configuration ------------------------------- */
function SecurityConfiguration({ form, baseline, setField, isModified }) {
  return (
    <Section title="Security Configuration" description="Authentication and access control policies.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-requireMfa" checked={form.requireMfa} onChange={(v) => setField('requireMfa', v)} modified={isModified('requireMfa')} label="Require Multi-Factor Authentication" description="All users must enroll in MFA to access the platform." />
        <Toggle id="field-enableSso" checked={form.enableSso} onChange={(v) => setField('enableSso', v)} modified={isModified('enableSso')} label="Enable Single Sign-On (SSO)" description={baseline.readOnly.ssoProvider} />
      </div>
      <Field id="field-passwordPolicy" label="Password Policy" modified={isModified('passwordPolicy')}>
        {(db) => (
          <SelectInput id="field-passwordPolicy" value={form.passwordPolicy} onChange={(v) => setField('passwordPolicy', v)} describedBy={db} options={ORG_FORM_OPTIONS.passwordPolicy} />
        )}
      </Field>
      <Field id="field-sessionTimeout" label="Session Timeout" modified={isModified('sessionTimeout')}>
        {(db) => (
          <SelectInput id="field-sessionTimeout" value={form.sessionTimeout} onChange={(v) => setField('sessionTimeout', v)} describedBy={db} options={ORG_FORM_OPTIONS.sessionTimeout} />
        )}
      </Field>
      <fieldset className="sm:col-span-2 m-0 flex flex-col gap-token-2 border-0 p-0">
        <legend className="flex items-center p-0 text-token-sm font-medium text-text-secondary-alt">
          API Access{isModified('apiAccess') && <ModifiedBadge />}
        </legend>
        <div className="flex flex-wrap gap-token-4">
          {ORG_FORM_OPTIONS.apiAccess.map((opt) => (
            <label key={opt} className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
              <input type="radio" name="apiAccess" value={opt} checked={form.apiAccess === opt} onChange={() => setField('apiAccess', opt)} className="h-3.5 w-3.5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="field-ipRestrictions" label="IP Restrictions" className="sm:col-span-2" modified={isModified('ipRestrictions')} hint="Optional — leave blank to allow all IP addresses. e.g. 192.168.1.0/24, 10.0.0.0/8">
        {(db) => (
          <TextInput id="field-ipRestrictions" value={form.ipRestrictions} onChange={(v) => setField('ipRestrictions', v)} describedBy={db} placeholder="192.168.1.0/24, 10.0.0.0/8" />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 6: Default Platform Configuration ----------------------- */
function PlatformConfiguration({ form, setField, showError, markTouched, errors, isModified }) {
  return (
    <Section title="Default Platform Configuration" description="Operating defaults for the organization&rsquo;s environments.">
      <Field id="field-defaultEnvironment" label="Default Environment" required modified={isModified('defaultEnvironment')} error={showError('defaultEnvironment') ? errors.defaultEnvironment : null}>
        {(db) => (
          <SelectInput id="field-defaultEnvironment" required value={form.defaultEnvironment} onChange={(v) => setField('defaultEnvironment', v)} onBlur={() => markTouched('defaultEnvironment')} invalid={showError('defaultEnvironment')} describedBy={db} options={ORG_FORM_OPTIONS.defaultEnvironment} />
        )}
      </Field>
      <Field id="field-dataRetention" label="Data Retention Policy" modified={isModified('dataRetention')}>
        {(db) => (
          <SelectInput id="field-dataRetention" value={form.dataRetention} onChange={(v) => setField('dataRetention', v)} describedBy={db} options={ORG_FORM_OPTIONS.dataRetention} />
        )}
      </Field>
      <Field id="field-notificationPreferences" label="Notification Preferences" modified={isModified('notificationPreferences')}>
        {(db) => (
          <SelectInput id="field-notificationPreferences" value={form.notificationPreferences} onChange={(v) => setField('notificationPreferences', v)} describedBy={db} options={ORG_FORM_OPTIONS.notificationPreferences} />
        )}
      </Field>
      <Field id="field-connectorPermissions" label="Default Connector Permissions" modified={isModified('connectorPermissions')}>
        {(db) => (
          <SelectInput id="field-connectorPermissions" value={form.connectorPermissions} onChange={(v) => setField('connectorPermissions', v)} describedBy={db} options={ORG_FORM_OPTIONS.connectorPermissions} />
        )}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-auditLogging" checked={form.auditLogging} onChange={(v) => setField('auditLogging', v)} modified={isModified('auditLogging')} label="Enable Audit Logging" description="All platform actions are captured in the audit log." />
      </div>
    </Section>
  );
}

/* ---- Sidebar: Organization Summary (read-only) ----------------------- */
function OrganizationSummary({ baseline, form }) {
  const rows = [
    { label: 'Organization', value: form.name || '—' },
    { label: 'Code', value: form.code || '—' },
    { label: 'Status', value: baseline.status },
    { label: 'Region', value: form.region },
    { label: 'Administrator', value: [form.adminFirstName, form.adminLastName].filter(Boolean).join(' ') || '—' },
    { label: 'Plan', value: form.plan },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Organization Summary</h2>
        <span className="rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-text-faint">Read-only</span>
      </div>
      <div className="mt-token-4 flex items-center gap-token-3 border-b border-border-subtle pb-token-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash font-mono text-token-base font-semibold text-primary">{baseline.form.name.charAt(0)}</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{baseline.form.name}</p>
          <p className="m-0 font-mono text-token-xs text-text-faint">{baseline.organizationId} · Since Jan 2023</p>
        </div>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-token-3">
            <dt className="text-token-xs text-text-faint">{row.label}</dt>
            <dd className="m-0 max-w-[60%] truncate text-right text-token-sm font-medium text-text-primary-alt" title={row.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Sidebar: live Change Summary ------------------------------------ */
function ChangeSummary({ changes }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Change Summary</h2>
        <span className={`rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${changes.length ? 'bg-warning-bg text-warning' : 'bg-surface-muted text-text-faint'}`}>
          {changes.length} pending
        </span>
      </div>
      {changes.length === 0 ? (
        <p className="m-0 mt-token-4 text-token-sm text-text-faint">No changes yet. Edit any field to see it tracked here.</p>
      ) : (
        <ul className="mt-token-4 flex flex-col gap-token-3">
          {changes.map((c) => (
            <li key={c.key} className="flex flex-col gap-token-1 border-b border-border-subtle pb-token-3 last:border-b-0 last:pb-0">
              <span className="text-token-xs font-medium text-text-secondary-alt">{c.label}</span>
              <span className="flex flex-wrap items-center gap-token-2 text-token-xs">
                <span className="max-w-[45%] truncate text-text-faint line-through" title={c.before}>{c.before}</span>
                <IconArrow className="h-3 w-3 shrink-0 text-text-faint" />
                <span className="max-w-[45%] truncate font-medium text-success-strong" title={c.after}>{c.after}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---- Sidebar: live Validation Status --------------------------------- */
function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  const pct = Math.round((completedCount / total) * 100);
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Validation Status</h2>
        <span className="text-token-xs font-medium text-text-secondary-alt">{completedCount}/{total}</span>
      </div>
      <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={total} aria-label="Validation completeness">
        <span className={`block h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-token-4 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-sm">
            {item.done ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" /> : <IconCircle className="h-3.5 w-3.5 shrink-0 text-text-faint" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Sidebar: Recent Activity ---------------------------------------- */
function RecentActivity({ items, orgId, onNavigate }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Recent Activity</h2>
      <ul className="mt-token-4 flex flex-col gap-token-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-token-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-token-sm font-medium text-text-primary-alt">{item.label}</span>
              <span className="font-mono text-token-xs text-text-faint">{item.meta}</span>
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onNavigate(`/organizations/${encodeURIComponent(orgId)}`)}
        className="mt-token-4 inline-flex items-center gap-token-1 text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View Full Audit Log →
      </button>
    </section>
  );
}

/* ---- Confirm Save Changes dialog (SaveConfirmationDialog) ------------- */
function ConfirmDialog({ changes, submitting, onCancel, onConfirm }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <h2 id="confirm-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Save Changes?</h2>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Review the {changes.length} {changes.length === 1 ? 'change' : 'changes'} below before applying them to this organization.
        </p>
        <dl className="mt-token-5 flex max-h-64 flex-col gap-token-3 overflow-y-auto">
          {changes.map((c) => (
            <div key={c.key} className="flex flex-col gap-token-1 border-b border-border-subtle pb-token-2 last:border-b-0">
              <dt className="text-token-xs text-text-faint">{c.label}</dt>
              <dd className="m-0 flex flex-wrap items-center gap-token-2 text-token-sm">
                <span className="text-text-faint line-through">{c.before}</span>
                <IconArrow className="h-3 w-3 shrink-0 text-text-faint" />
                <span className="font-medium text-success-strong">{c.after}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button
            type="button"
            ref={cancelRef}
            onClick={onCancel}
            disabled={submitting}
            className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting && <IconSpinner />}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Loading skeleton ------------------------------------------------ */
function EditSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-10 w-64 animate-pulse rounded-md bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-md border border-border bg-surface-muted" />
          ))}
        </div>
        <div className="flex flex-col gap-token-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-md border border-border bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor SVGs) -------------------------------- */
function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.5 3.5L13 4.5" />
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
function IconArrow({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
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
function IconSpinner() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 2a6 6 0 1 0 6 6" />
    </svg>
  );
}


