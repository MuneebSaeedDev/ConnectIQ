import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useMyProfile } from '../hooks/useUserProfile';
import { PROFILE_OPTIONS, saveMyProfile } from '../services/userProfile.api';

/* Field styling — mirrors SCR-034 EditUserScreen so the MOD-005 forms
   read identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const MOD005_TITLE = 'Requires the MOD-005 user backend, which is not deployed yet.';

/* Editable fields tracked for dirty-state. Read-only identifiers and the
   managed work email are excluded. */
const EDITABLE_KEYS = [
  'firstName', 'lastName', 'displayName', 'phone', 'jobTitle', 'officeLocation', 'pronouns',
  'language', 'timeZone', 'dateFormat', 'timeFormat', 'numberFormat', 'landingPage', 'dashboardPreference',
  'pipelineNotifications', 'connectorAlerts', 'approvalRequests', 'securityAlerts', 'weeklySummary',
  'mentions', 'comments', 'workflowUpdates', 'systemNotifications',
];

const CHANGE_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  displayName: 'Display Name',
  phone: 'Phone Number',
  jobTitle: 'Job Title',
  officeLocation: 'Office Location',
  pronouns: 'Preferred Pronouns',
  language: 'Language',
  timeZone: 'Time Zone',
  dateFormat: 'Date Format',
  timeFormat: 'Time Format',
  numberFormat: 'Number Format',
  landingPage: 'Default Landing Page',
  dashboardPreference: 'Dashboard Preference',
  pipelineNotifications: 'Pipeline Notifications',
  connectorAlerts: 'Connector Alerts',
  approvalRequests: 'Approval Requests',
  securityAlerts: 'Security Alerts',
  weeklySummary: 'Weekly Summary',
  mentions: 'Mentions',
  comments: 'Comments',
  workflowUpdates: 'Workflow Updates',
  systemNotifications: 'System Notifications',
};

const BOOLEAN_KEYS = new Set([
  'pipelineNotifications', 'connectorAlerts', 'approvalRequests', 'securityAlerts', 'weeklySummary',
  'mentions', 'comments', 'workflowUpdates', 'systemNotifications',
]);

function displayValue(key, value) {
  if (BOOLEAN_KEYS.has(key)) return value ? 'On' : 'Off';
  const str = String(value ?? '').trim();
  return str || '—';
}

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.displayName.trim()) errors.displayName = 'Display name is required.';
  return errors;
}

/** SCR-036 — User Profile Screen (self-service). Node 109:12114. */
export default function UserProfileScreen() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useMyProfile();

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Settings', 'My Profile']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading your profile' : isError ? 'Couldn’t load your profile' : ''}
        </span>

        {isLoading && <ProfileSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load your profile</p>
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
        )}

        {data && <ProfileForm key={data.id} baseline={data} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

function ProfileForm({ baseline, navigate }) {
  const [form, setForm] = useState(baseline.form);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

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
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitState((prev) => (prev.status === 'idle' ? prev : { status: 'idle', message: '' }));
  }
  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }
  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }
  function isModified(key) {
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    return norm(baseline.form[key]) !== norm(form[key]);
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

  function guardedNavigate(to) {
    if (dirty && typeof window !== 'undefined') {
      const ok = window.confirm('Discard unsaved changes and leave this page?');
      if (!ok) return;
    }
    navigate(to);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }
    if (!dirty) return;
    setSubmitState({ status: 'submitting', message: '' });
    const payload = Object.fromEntries(changes.map((c) => [c.key, form[c.key]]));
    const result = await saveMyProfile(payload);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-005 has no profile-update endpoint yet, so nothing was persisted. In a live environment these changes would be saved to your account.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Your changes have been saved.' });
    }
  }

  const saved = submitState.status === 'mocked' || submitState.status === 'success';

  return (
    <form className="flex flex-col gap-token-6" onSubmit={handleSubmit} noValidate>
      <Header
        baseline={baseline}
        dirty={dirty}
        changeCount={changes.length}
        isValid={isValid}
        saved={saved}
        onCancel={() => guardedNavigate('/dashboard')}
        onReset={handleReset}
      />

      <span className="sr-only" role="status" aria-live="polite">
        {submitState.status === 'submitting'
          ? 'Saving your changes'
          : submitState.status === 'mocked'
            ? 'Save simulated — no backend available'
            : submitState.status === 'success'
              ? 'Your changes have been saved'
              : dirty
                ? `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}`
                : 'No unsaved changes'}
      </span>

      {baseline.mocked && (
        <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <IconInfo className="mt-0.5 block h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-sm text-warning-strong">
            <span className="font-semibold">Sample data.</span> The MOD-005 user backend is not
            deployed yet, so this profile is design-sourced. Edits can be made and validated, but
            saving is simulated — nothing is persisted.
          </p>
        </div>
      )}

      {submitState.status === 'mocked' && (
        <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
          <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated save (no backend)</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <PersonalInformation baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <PersonalPreferences form={form} setField={setField} isModified={isModified} />
          <NotificationPreferences form={form} setField={setField} isModified={isModified} />
          <SecuritySection baseline={baseline} />
          <ActiveSessions baseline={baseline} />
          <ApiTokens baseline={baseline} />
          <RecentActivity items={baseline.recentActivity} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <ProfileSummaryCard baseline={baseline} form={form} />
          <AccountStatusCard status={baseline.accountStatus} />
          <SecurityHealthCard health={baseline.securityHealth} />
          <QuickActionsCard onNavigate={guardedNavigate} />
          <HelpSupportCard />
        </aside>
      </div>
    </form>
  );
}

/* ---- Header --------------------------------------------------------- */

function Header({ baseline, dirty, changeCount, isValid, saved, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">My Profile</h1>
          {dirty && (
            <span className="rounded-full bg-warning-bg px-token-3 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong">
              {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          {baseline.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong"
              title="MOD-005 (User Management) has no backend deployed yet — showing sample data, not a live record."
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Manage your account information, security settings, personal preferences, and notification options.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Cancel
        </button>
        <button type="button" onClick={onReset} disabled={!dirty} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Reset Changes
        </button>
        <button type="submit" disabled={!isValid || !dirty || saved} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconSave />
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---- Layout primitives ---------------------------------------------- */

function Section({ icon, title, description, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="flex items-start gap-token-3">
          <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary">
            {icon}
          </span>
          <div>
            <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
            {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-token-5">{children}</div>
    </section>
  );
}

function Field({ id, label, required, optional, modified, managed, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="flex items-center text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        {optional && <span className="ml-token-2 text-token-meta font-normal text-text-faint">(optional)</span>}
        {modified && <ModifiedBadge />}
      </label>
      {typeof children === 'function' ? children(describedBy) : children}
      {managed && !hint && !error && <p id={`${id}-hint`} className="m-0 text-token-meta text-text-faint">Managed by your organization</p>}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-token-meta text-text-faint">{hint}</p>}
      {error && <p id={`${id}-error`} className="m-0 text-token-meta text-danger" role="alert">{error}</p>}
    </div>
  );
}

function ModifiedBadge() {
  return (
    <span className="ml-token-2 rounded-sm bg-warning-bg px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong">
      Modified
    </span>
  );
}

function TextInput({ id, value, onChange, onBlur, invalid, describedBy, required, disabled, ...rest }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
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
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

function Toggle({ id, checked, onChange, label, description, modified, disabled, required }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <span className="flex items-center">
          <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
          {required && <span className="ml-token-2 rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Required</span>}
          {modified && <ModifiedBadge />}
        </span>
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
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'bg-primary' : 'bg-border'}`}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/* ---- Section 1: Personal Information --------------------------------- */

function PersonalInformation({ baseline, form, setField, showError, markTouched, errors, isModified }) {
  return (
    <Section icon={<IconUser className="h-4 w-4" />} title="Personal Information" description="Basic profile details and identity.">
      <div className="flex flex-col gap-token-4 rounded-md border border-border-subtle bg-surface-muted p-token-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-token-4">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash text-token-lg font-semibold text-primary">
            {baseline.initials}
          </span>
          <div>
            <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{form.displayName || `${form.firstName} ${form.lastName}`.trim()}</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{form.jobTitle} · {baseline.profileSummary.teamName}</p>
            <p className="m-0 mt-0.5 text-token-meta text-text-faint">{baseline.avatarMeta}</p>
          </div>
        </div>
        <div className="flex items-center gap-token-2">
          <button type="button" disabled title={MOD005_TITLE} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
            Upload Photo
          </button>
          <button type="button" disabled title={MOD005_TITLE} className="flex h-8 items-center rounded-md px-token-2 text-token-sm font-medium text-text-faint disabled:cursor-not-allowed disabled:opacity-60">
            Remove
          </button>
        </div>
      </div>

      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-firstName" label="First Name" required modified={isModified('firstName')} error={showError('firstName') ? errors.firstName : null}>
          {(db) => <TextInput id="field-firstName" required value={form.firstName} onChange={(v) => setField('firstName', v)} onBlur={() => markTouched('firstName')} invalid={showError('firstName')} describedBy={db} autoComplete="given-name" />}
        </Field>
        <Field id="field-lastName" label="Last Name" required modified={isModified('lastName')} error={showError('lastName') ? errors.lastName : null}>
          {(db) => <TextInput id="field-lastName" required value={form.lastName} onChange={(v) => setField('lastName', v)} onBlur={() => markTouched('lastName')} invalid={showError('lastName')} describedBy={db} autoComplete="family-name" />}
        </Field>
        <Field id="field-displayName" label="Display Name" required modified={isModified('displayName')} error={showError('displayName') ? errors.displayName : null}>
          {(db) => <TextInput id="field-displayName" required value={form.displayName} onChange={(v) => setField('displayName', v)} onBlur={() => markTouched('displayName')} invalid={showError('displayName')} describedBy={db} />}
        </Field>
        <Field id="field-email" label="Work Email" managed>
          <TextInput id="field-email" value={form.email} onChange={() => {}} disabled readOnly aria-describedby="field-email-hint" />
        </Field>
        <Field id="field-phone" label="Phone Number" modified={isModified('phone')}>
          {(db) => <TextInput id="field-phone" type="tel" value={form.phone} onChange={(v) => setField('phone', v)} describedBy={db} autoComplete="tel" />}
        </Field>
        <Field id="field-jobTitle" label="Job Title" modified={isModified('jobTitle')}>
          {(db) => <TextInput id="field-jobTitle" value={form.jobTitle} onChange={(v) => setField('jobTitle', v)} describedBy={db} autoComplete="organization-title" />}
        </Field>
        <Field id="field-officeLocation" label="Office Location" modified={isModified('officeLocation')}>
          {(db) => <SelectInput id="field-officeLocation" value={form.officeLocation} onChange={(v) => setField('officeLocation', v)} describedBy={db} options={PROFILE_OPTIONS.officeLocation} placeholder="Select location…" />}
        </Field>
        <Field id="field-pronouns" label="Preferred Pronouns" optional modified={isModified('pronouns')}>
          {(db) => <SelectInput id="field-pronouns" value={form.pronouns} onChange={(v) => setField('pronouns', v)} describedBy={db} options={PROFILE_OPTIONS.pronouns} placeholder="Select…" />}
        </Field>
      </div>

      <div className="mt-token-5">
        <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Read-only Identifiers</p>
        <dl className="mt-token-3 grid grid-cols-1 gap-token-3 sm:grid-cols-3">
          <ReadOnlyId label="User ID" value={baseline.userId} mono />
          <ReadOnlyId label="Employee ID" value={baseline.employeeId} mono />
          <ReadOnlyId label="Organization" value={baseline.organization} />
        </dl>
      </div>
    </Section>
  );
}

function ReadOnlyId({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-token-1 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 text-token-sm font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

/* ---- Section 2: Personal Preferences --------------------------------- */

function PersonalPreferences({ form, setField, isModified }) {
  const rows = [
    ['language', 'Language', PROFILE_OPTIONS.language],
    ['timeZone', 'Time Zone', PROFILE_OPTIONS.timeZone],
    ['dateFormat', 'Date Format', PROFILE_OPTIONS.dateFormat],
    ['timeFormat', 'Time Format', PROFILE_OPTIONS.timeFormat],
    ['numberFormat', 'Number Format', PROFILE_OPTIONS.numberFormat],
    ['landingPage', 'Default Landing Page', PROFILE_OPTIONS.landingPage],
    ['dashboardPreference', 'Dashboard Preference', PROFILE_OPTIONS.dashboardPreference],
  ];
  return (
    <Section icon={<IconSliders className="h-4 w-4" />} title="Personal Preferences" description="Localization and display defaults.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        {rows.map(([key, label, options]) => (
          <Field key={key} id={`field-${key}`} label={label} modified={isModified(key)}>
            {(db) => <SelectInput id={`field-${key}`} value={form[key]} onChange={(v) => setField(key, v)} describedBy={db} options={options} />}
          </Field>
        ))}
      </div>
    </Section>
  );
}

/* ---- Section 3: Notification Preferences ----------------------------- */

function NotificationPreferences({ form, setField, isModified }) {
  const email = [
    ['pipelineNotifications', 'Pipeline Notifications', 'Job completions, failures, and retries.'],
    ['connectorAlerts', 'Connector Alerts', 'Source and destination connectivity issues.'],
    ['approvalRequests', 'Approval Requests', 'Pending actions requiring your review.'],
    ['securityAlerts', 'Security Alerts', 'Unusual sign-in or access events.'],
    ['weeklySummary', 'Weekly Summary', 'Digest of activity sent every Monday.'],
  ];
  const inApp = [
    ['mentions', 'Mentions', 'When someone tags you in a comment.'],
    ['comments', 'Comments', 'Replies and new threads on your work.'],
    ['workflowUpdates', 'Workflow Updates', 'Status changes in pipelines you own.'],
    ['systemNotifications', 'System Notifications', 'Maintenance windows, upgrades, and outages.'],
  ];
  return (
    <Section icon={<IconBell className="h-4 w-4" />} title="Notification Preferences" description="Control how and when you receive alerts.">
      <div className="flex flex-col gap-token-5">
        <div>
          <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Email Notifications</p>
          <div className="mt-token-3 flex flex-col gap-token-3">
            {email.map(([key, label, description]) => (
              <Toggle key={key} id={`field-${key}`} checked={form[key]} onChange={(v) => setField(key, v)} label={label} description={description} modified={isModified(key)} />
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">In-app Notifications</p>
          <div className="mt-token-3 flex flex-col gap-token-3">
            {inApp.map(([key, label, description]) => (
              <Toggle key={key} id={`field-${key}`} checked={form[key]} onChange={(v) => setField(key, v)} label={label} description={description} modified={isModified(key)} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---- Section 4: Security (read-only) --------------------------------- */

const SECURITY_TONE = {
  Enabled: 'text-success-strong',
  Available: 'text-success-strong',
  Expiring: 'text-warning-strong',
  'Not configured': 'text-danger-strong',
};

function SecurityRow({ icon, title, detail, status, action }) {
  const tone = SECURITY_TONE[status] ?? 'text-text-secondary-alt';
  return (
    <li className="flex items-start justify-between gap-token-4 rounded-md border border-border-subtle px-token-4 py-token-3">
      <div className="flex min-w-0 items-start gap-token-3">
        <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-text-secondary-alt">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">{title}</p>
          <p className="m-0 mt-0.5 text-token-meta text-text-faint">{detail}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-token-3">
        <span className={`flex items-center gap-token-1 text-token-meta font-semibold ${tone}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {status}
        </span>
        {action}
      </div>
    </li>
  );
}

function SecuritySection({ baseline }) {
  const s = baseline.security;
  const disabledBtn = 'flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60';
  return (
    <Section icon={<IconShield className="h-4 w-4" />} title="Security" description="Authentication and access controls.">
      <ul className="flex flex-col gap-token-3">
        <SecurityRow icon={<IconShield className="h-4 w-4" />} title="Multi-Factor Authentication" detail={s.mfa.detail} status={s.mfa.status} action={<button type="button" disabled title={MOD005_TITLE} className={disabledBtn}>Configure</button>} />
        <SecurityRow icon={<IconLock className="h-4 w-4" />} title="Password" detail={s.password.detail} status={s.password.status} action={<button type="button" disabled title={MOD005_TITLE} className={disabledBtn}>Change Password</button>} />
        <SecurityRow icon={<IconKey className="h-4 w-4" />} title="Backup Recovery Codes" detail={s.recoveryCodes.detail} status={s.recoveryCodes.status} action={<button type="button" disabled title={MOD005_TITLE} className={disabledBtn}>Download</button>} />
        <SecurityRow icon={<IconHelp className="h-4 w-4" />} title="Security Questions" detail={s.securityQuestions.detail} status={s.securityQuestions.status} action={<button type="button" disabled title={MOD005_TITLE} className={disabledBtn}>Set Up</button>} />
      </ul>
      {s.password.expiresInDays <= 7 && (
        <div className="mt-token-4 flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <IconAlert className="mt-0.5 block h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-sm text-warning-strong">
            Your password expires in <span className="font-semibold">{s.password.expiresInDays} days</span>. Change it now to avoid disruption to your access.
          </p>
        </div>
      )}
    </Section>
  );
}

/* ---- Section 5: Active Sessions (read-only) -------------------------- */

function ActiveSessions({ baseline }) {
  return (
    <Section
      icon={<IconMonitor className="h-4 w-4" />}
      title="Active Sessions"
      description="Devices currently signed in to your account."
      action={
        <button type="button" disabled title={MOD005_TITLE} className="flex h-8 items-center rounded-md border border-danger-border bg-surface-card px-token-3 text-token-sm font-medium text-danger-strong disabled:cursor-not-allowed disabled:opacity-60">
          Sign Out Other Sessions
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-token-sm">
          <thead>
            <tr className="border-b border-border-subtle text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Device / Browser</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">OS</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">IP Address</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Login Time</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Status</th>
              <th scope="col" className="py-token-2 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {baseline.sessions.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="py-token-3 pr-token-3">
                  <span className="flex items-center gap-token-2 font-medium text-text-primary-alt">
                    {row.device}
                    {row.current && <span className="rounded-sm bg-shell-accent-wash px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-primary">Current</span>}
                  </span>
                </td>
                <td className="py-token-3 pr-token-3 text-text-secondary-alt">{row.os}</td>
                <td className="py-token-3 pr-token-3 font-mono text-token-meta text-text-secondary-alt">{row.ip}</td>
                <td className="py-token-3 pr-token-3 text-text-secondary-alt">{row.loginTime}</td>
                <td className="py-token-3 pr-token-3">
                  <span className={`inline-flex items-center gap-token-1 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${row.status === 'Active' ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-secondary-alt'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-token-3">
                  {row.current ? (
                    <span className="text-token-meta text-text-faint">—</span>
                  ) : (
                    <button type="button" disabled title={MOD005_TITLE} className="text-token-sm font-medium text-danger-strong disabled:cursor-not-allowed disabled:opacity-60">
                      End
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ---- Section 6: Personal API Tokens (read-only) ---------------------- */

function ApiTokens({ baseline }) {
  return (
    <Section
      icon={<IconKey className="h-4 w-4" />}
      title="Personal API Tokens"
      description="Programmatic access credentials for data engineering workflows."
      action={
        <button type="button" disabled title={MOD005_TITLE} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Generate Token
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-token-sm">
          <thead>
            <tr className="border-b border-border-subtle text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Token Name</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Token</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Scope</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Last Used</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Expires</th>
              <th scope="col" className="py-token-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {baseline.tokens.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="py-token-3 pr-token-3 font-medium text-text-primary-alt">{row.name}</td>
                <td className="py-token-3 pr-token-3 font-mono text-token-meta text-text-secondary-alt">{row.prefix}••••••••</td>
                <td className="py-token-3 pr-token-3">
                  <span className={`inline-flex items-center rounded-sm px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] ${row.scope === 'Read only' ? 'bg-surface-muted text-text-secondary-alt' : 'bg-shell-accent-wash text-primary'}`}>
                    {row.scope}
                  </span>
                </td>
                <td className="py-token-3 pr-token-3 text-text-secondary-alt">{row.lastUsed}</td>
                <td className={`py-token-3 pr-token-3 ${row.expiringSoon ? 'font-medium text-danger-strong' : 'text-text-secondary-alt'}`}>{row.expires}</td>
                <td className="py-token-3">
                  <span className="flex items-center gap-token-3">
                    <button type="button" disabled title={MOD005_TITLE} className="text-token-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60">Rotate</button>
                    <button type="button" disabled title={MOD005_TITLE} className="text-token-sm font-medium text-danger-strong disabled:cursor-not-allowed disabled:opacity-60">Revoke</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ---- Section 7: Recent Account Activity (read-only) ------------------ */

const ACTIVITY_ICON_TONE = {
  success: 'text-success',
  failed: 'text-danger-strong',
  security: 'text-primary',
  info: 'text-text-secondary-alt',
};
const ACTIVITY_TAG_TONE = {
  Success: 'bg-success-bg text-success-strong',
  Failed: 'bg-danger-bg text-danger-strong',
  Security: 'bg-shell-accent-wash text-primary',
  Info: 'bg-surface-muted text-text-secondary-alt',
};

function RecentActivity({ items }) {
  return (
    <Section
      icon={<IconActivity className="h-4 w-4" />}
      title="Recent Account Activity"
      description="Last 30 days of security events."
      action={
        <button type="button" disabled title={MOD005_TITLE} className="text-token-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60">
          View Full Activity
        </button>
      }
    >
      <ul className="flex flex-col gap-token-2">
        {items.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-token-3 rounded-md border border-border-subtle px-token-4 py-token-3">
            <span className="flex min-w-0 items-start gap-token-3">
              <span aria-hidden="true" className={`mt-0.5 shrink-0 ${ACTIVITY_ICON_TONE[a.type] ?? 'text-text-faint'}`}>
                {a.type === 'failed' ? <IconX className="h-4 w-4" /> : a.type === 'security' ? <IconLock className="h-4 w-4" /> : a.type === 'info' ? <IconInfo className="h-4 w-4" /> : <IconCheck className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-token-sm font-medium text-text-primary-alt">{a.label}</span>
                <span className="block truncate text-token-meta text-text-faint">{a.detail} · {a.meta}</span>
              </span>
            </span>
            <span className={`shrink-0 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${ACTIVITY_TAG_TONE[a.tag] ?? 'bg-surface-muted text-text-secondary-alt'}`}>
              {a.tag}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---- Right rail ------------------------------------------------------ */

function SidebarCard({ title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      {title && <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>}
      <div className={title ? 'mt-token-4' : ''}>{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, mono, tone }) {
  return (
    <div className="flex items-center justify-between gap-token-3">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 truncate text-right text-token-meta font-medium ${tone ?? 'text-text-primary-alt'} ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function ProfileSummaryCard({ baseline, form }) {
  const s = baseline.profileSummary;
  const name = form.displayName || `${form.firstName} ${form.lastName}`.trim();
  return (
    <SidebarCard title="Profile Summary">
      <div className="flex flex-col items-center gap-token-2 text-center">
        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-shell-accent-wash text-token-lg font-semibold text-primary">
          {baseline.initials}
        </span>
        <div>
          <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{name}</p>
          <p className="m-0 mt-0.5 text-token-meta text-primary">{s.jobTitle}</p>
          <p className="m-0 mt-0.5 text-token-meta text-text-faint">{s.team}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-token-2">
          {s.chips.map((c) => (
            <span key={c} className={`rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${c === 'Active' ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-secondary-alt'}`}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2 border-t border-border-subtle pt-token-4">
        <SummaryRow label="Department" value={s.department} />
        <SummaryRow label="Team" value={s.teamName} />
        <SummaryRow label="Organization" value={s.organization} />
      </dl>
    </SidebarCard>
  );
}

function AccountStatusCard({ status }) {
  return (
    <SidebarCard title="Account Status">
      <div className="mb-token-3 flex items-center justify-between">
        <span className="text-token-meta text-text-faint">Account Status</span>
        <span className="inline-flex items-center gap-token-1 rounded-full bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {status.status}
        </span>
      </div>
      <dl className="flex flex-col gap-token-2">
        <SummaryRow label="Last Login" value={status.lastLogin} />
        <SummaryRow label="Account Created" value={status.accountCreated} />
        <SummaryRow label="Password Age" value={`${status.passwordAge} · ${status.passwordExpires}`} tone="text-warning-strong" />
        <SummaryRow label="License" value={status.license} />
      </dl>
    </SidebarCard>
  );
}

function SecurityHealthCard({ health }) {
  return (
    <SidebarCard title="Security Health">
      <div className="flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-bg font-mono text-token-base font-bold text-success-strong">
          {health.score}
        </span>
        <div>
          <p className="m-0 text-token-sm font-semibold text-success-strong">{health.label}</p>
          <p className="m-0 mt-0.5 text-token-meta text-text-faint">{health.hint}</p>
        </div>
      </div>
      <ul className="mt-token-4 flex flex-col gap-token-2 border-t border-border-subtle pt-token-3">
        {health.checklist.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-token-3">
            <span className="flex items-center gap-token-2 text-token-meta text-text-secondary-alt">
              {c.ok ? <IconCheck className="h-3.5 w-3.5 text-success" /> : <IconAlert className="h-3.5 w-3.5 text-warning" />}
              {c.label}
            </span>
            <span className={`text-token-meta font-semibold ${c.ok ? 'text-success-strong' : 'text-warning-strong'}`}>{c.value}</span>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}

function QuickActionsCard({ onNavigate }) {
  const actions = [
    { label: 'View Activity Log', onClick: () => onNavigate('/organizations/current/activity') },
  ];
  const disabled = ['Change Password', 'Configure MFA', 'Download Recovery Codes'];
  return (
    <SidebarCard title="Quick Actions">
      <div className="flex flex-col gap-token-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {a.label}
            <IconArrow className="block h-3.5 w-3.5 text-text-faint" />
          </button>
        ))}
        {disabled.map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title={MOD005_TITLE}
            className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {label}
            <IconArrow className="block h-3.5 w-3.5 text-text-faint" />
          </button>
        ))}
        <button
          type="button"
          disabled
          title={MOD005_TITLE}
          className="flex h-9 items-center justify-between rounded-md border border-danger-border bg-surface-card px-token-3 text-token-sm font-medium text-danger-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign Out All Devices
          <IconArrow className="block h-3.5 w-3.5" />
        </button>
      </div>
    </SidebarCard>
  );
}

function HelpSupportCard() {
  const links = [
    { label: 'Account Security Guide', to: '/settings/access-control' },
    { label: 'MFA Setup Guide', to: '/settings/access-control' },
    { label: 'Privacy Policy', to: '/settings/access-control' },
    { label: 'Contact Administrator', to: '/organizations' },
  ];
  return (
    <SidebarCard title="Help & Support">
      <ul className="flex flex-col gap-token-2">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.to} className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}

/* ---- Loading skeleton ------------------------------------------------ */

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-md border border-border bg-surface-muted" />
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

/* ---- Inline icons (currentColor SVGs) ------------------------------- */

function IconSave() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2.5h8L13.5 5v8.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" />
      <path d="M5 2.5v3h5v-3M5 14.5V10h6v4.5" />
    </svg>
  );
}

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

function IconAlert({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4" />
    </svg>
  );
}

function IconSliders({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 5h7M11 5h3M2 11h3M7 11h7" />
      <circle cx="10" cy="5" r="1.5" />
      <circle cx="6" cy="11" r="1.5" />
    </svg>
  );
}

function IconBell({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6.5a4 4 0 0 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" />
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.5 13 3.5v4c0 3.5-2.3 6-5 7-2.7-1-5-3.5-5-7v-4Z" />
      <path d="m5.5 8 1.8 1.8L11 6" />
    </svg>
  );
}

function IconLock({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

function IconKey({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="3" />
      <path d="m7.8 7.8 5 5M11 11l1.5-1.5M12.5 12.5 14 11" />
    </svg>
  );
}

function IconHelp({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M6.2 6a1.8 1.8 0 0 1 3.3 1c0 1.2-1.5 1.5-1.5 2.5M8 12h.01" />
    </svg>
  );
}

function IconMonitor({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="12" height="8" rx="1" />
      <path d="M6 14h4M8 11v3" />
    </svg>
  );
}

function IconActivity({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 8h3l2-5 3 10 2-5h3" />
    </svg>
  );
}
