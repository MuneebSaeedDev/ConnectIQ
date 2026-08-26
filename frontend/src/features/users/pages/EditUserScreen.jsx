import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useEditableUser } from '../hooks/useEditableUser';
import {
  ADD_USER_OPTIONS,
  ROLE_ACCESS_SCOPE,
  FEATURE_ACCESS_BY_LICENSE,
  LICENSE_POOL,
  EDIT_USER_OPTIONS,
  updateUser,
} from '../services/editUser.api';

/* Field styling — mirrors SCR-033 AddUserScreen / SCR-027
   EditOrganizationScreen so the MOD-005 admin forms read identically.
   No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Optional CIDR list, e.g. "192.168.1.0/24, 10.0.0.0/8". Octets bounded
// to 0-255 and the prefix to 0-32 so 999.999.999.999/99 is rejected.
const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const PREFIX = '(3[0-2]|[12]?\\d)';
const CIDR = `${OCTET}(\\.${OCTET}){3}/${PREFIX}`;
const CIDR_LIST_PATTERN = new RegExp(`^\\s*${CIDR}\\s*(,\\s*${CIDR}\\s*)*$`);

/* Scope this edit to the caller's organization. MOD-004/MOD-005 have no
   live "current org" endpoint, so this mirrors the id used by the sibling
   org-scoped screens until context ships. */
const ORG_ID = 'current';

/* Editable fields tracked for dirty-state + Pending Changes. Read-only
   fields (employeeId, userId, account metadata) are excluded. */
const EDITABLE_KEYS = [
  'firstName', 'lastName', 'email', 'jobTitle', 'phone', 'officeLocation',
  'department', 'team', 'manager', 'businessUnit', 'costCenter',
  'primaryRole', 'permissionGroup', 'additionalRoles', 'administrativePrivileges', 'resourceAccessProfile',
  'licenseType', 'licenseExpiration',
  'requireMfa', 'enableSso', 'passwordResetNextLogin', 'accountExpiration', 'allowedIpRange', 'concurrentSessions',
  'systemSecurityAlerts', 'pipelineAlerts', 'connectorAlerts', 'weeklyDigest', 'productUpdates',
];

/* Human labels + value formatters for the Pending Changes diff card. */
const CHANGE_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Work Email',
  jobTitle: 'Job Title',
  phone: 'Phone Number',
  officeLocation: 'Office Location',
  department: 'Department',
  team: 'Team',
  manager: 'Reporting Manager',
  businessUnit: 'Business Unit',
  costCenter: 'Cost Center',
  primaryRole: 'Primary Role',
  permissionGroup: 'Permission Group',
  additionalRoles: 'Additional Roles',
  administrativePrivileges: 'Administrative Privileges',
  resourceAccessProfile: 'Resource Access Profile',
  licenseType: 'License Type',
  licenseExpiration: 'License Expiration',
  requireMfa: 'Multi-Factor Authentication',
  enableSso: 'Single Sign-On',
  passwordResetNextLogin: 'Password Reset on Next Login',
  accountExpiration: 'Account Expiration',
  allowedIpRange: 'Allowed IP Range',
  concurrentSessions: 'Concurrent Sessions',
  systemSecurityAlerts: 'System & Security Alerts',
  pipelineAlerts: 'Pipeline Alerts',
  connectorAlerts: 'Connector Alerts',
  weeklyDigest: 'Weekly Digest',
  productUpdates: 'Product Updates',
};

const BOOLEAN_KEYS = new Set([
  'requireMfa', 'enableSso', 'passwordResetNextLogin', 'accountExpiration',
  'systemSecurityAlerts', 'pipelineAlerts', 'connectorAlerts', 'weeklyDigest', 'productUpdates',
]);

function displayValue(key, value) {
  if (BOOLEAN_KEYS.has(key)) return value ? 'Enabled' : 'Disabled';
  const str = String(value ?? '').trim();
  return str || '—';
}

/* Required-field validation (fields marked * in Figma). */
function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Work email is required.';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.department) errors.department = 'Select a department.';
  if (!form.primaryRole) errors.primaryRole = 'Select a primary role.';
  if (!form.licenseType) errors.licenseType = 'Select a license type.';
  if (form.allowedIpRange.trim() && !CIDR_LIST_PATTERN.test(form.allowedIpRange.trim()))
    errors.allowedIpRange = 'Enter comma-separated CIDR ranges, e.g. 192.168.1.0/24.';
  return errors;
}
/* The 5 Validation Status items from the Figma sidebar (5/5 in design). */
function computeChecklist(form, errors) {
  return [
    { key: 'required', label: 'Required Fields Complete', done: Object.keys(errors).length === 0 },
    { key: 'role', label: 'Role Configured', done: !!form.primaryRole },
    { key: 'department', label: 'Department Assigned', done: !!form.department },
    { key: 'security', label: 'Security Valid', done: (form.requireMfa || form.enableSso) && !errors.allowedIpRange },
    { key: 'license', label: 'License Assigned', done: !!form.licenseType },
  ];
}
/** SCR-034 — Edit User Screen. Node 105:7565, Figma page "Page 1". */
export default function EditUserScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useEditableUser(ORG_ID, id);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users', data ? `${data.form.firstName} ${data.form.lastName}` : id, 'Edit User']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading user for editing' : isError ? 'Couldn’t load user' : ''}
        </span>

        {isLoading && (
          <>
            <BackLink to={`/users/${encodeURIComponent(id)}`} />
            <EditSkeleton />
          </>
        )}

        {isError && (
          <>
            <BackLink to={`/users/${encodeURIComponent(id)}`} />
            <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
              <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load user</p>
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

        {data && <EditForm key={data.id} baseline={data} userId={id} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

/* Plain back link for the loading/error states (no dirty form yet). */
function BackLink({ to }) {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to={to}
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to user
      </Link>
    </div>
  );
}
/* The editable form is a child keyed on the loaded record so switching
   users remounts it with a fresh baseline (no stale dirty state). */
function EditForm({ baseline, userId, navigate }) {
  const [form, setForm] = useState(baseline.form);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [adminAction, setAdminAction] = useState('');

  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form, errors), [form, errors]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  const featureAccess = FEATURE_ACCESS_BY_LICENSE[form.licenseType] ?? null;
  const scope = form.primaryRole ? ROLE_ACCESS_SCOPE[form.primaryRole] : null;

  // Live dirty tracking + Pending Changes computed against the saved baseline.
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
    // A further edit after a simulated/successful save re-enables Save.
    setSubmitState((prev) => (prev.status === 'idle' ? prev : { status: 'idle', message: '' }));
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
  // dirty must confirm the discard first.
  function guardedNavigate(to) {
    if (dirty && typeof window !== 'undefined') {
      const ok = window.confirm('Discard unsaved changes and leave this page?');
      if (!ok) return;
    }
    navigate(to);
  }

  function handleCancel() {
    guardedNavigate(`/users/${encodeURIComponent(userId)}`);
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
    const result = await updateUser(ORG_ID, userId, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-005 has no user-update endpoint yet, so nothing was persisted. In a live environment these changes would be saved and you’d return to the user detail page.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Changes saved.' });
      navigate(`/users/${encodeURIComponent(userId)}`);
    }
  }

  return (
    <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
      <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
        <button
          type="button"
          onClick={() => guardedNavigate(`/users/${encodeURIComponent(userId)}`)}
          className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Back to user
        </button>
      </div>

      <Header baseline={baseline} dirty={dirty} changeCount={changes.length} isValid={isValid} saved={submitState.status === 'mocked' || submitState.status === 'success'} onCancel={handleCancel} onReset={handleReset} />

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

      {adminAction && (
        <div className="rounded-md border border-primary bg-shell-accent-wash p-token-4" role="status">
          <p className="m-0 text-token-sm text-primary">{adminAction}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <PersonalInformation baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <OrganizationAssignment baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} />
          <RolesAccess baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} scope={scope} />
          <LicenseManagement baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} featureAccess={featureAccess} />
          <AuthenticationSecurity baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} isModified={isModified} onAdminAction={setAdminAction} />
          <NotificationPreferences form={form} setField={setField} isModified={isModified} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <UserSummary baseline={baseline} form={form} />
          <AccountHealth baseline={baseline} />
          <LicenseSummary baseline={baseline} />
          <ValidationStatus checklist={checklist} completedCount={completedCount} />
          <PendingChanges changes={changes} />
          <RecentActivity items={baseline.recentActivity} userId={userId} onNavigate={guardedNavigate} />
        </aside>
      </div>

      <ActionBar baseline={baseline} dirty={dirty} changeCount={changes.length} isValid={isValid} saved={submitState.status === 'mocked' || submitState.status === 'success'} onCancel={handleCancel} onReset={handleReset} />

      {confirmOpen && (
        <ConfirmDialog
          baseline={baseline}
          form={form}
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

function Section({ index, title, description, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start gap-token-3">
        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-token-meta font-semibold text-primary">
          {index}
        </span>
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
        </div>
      </div>
      <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ModifiedBadge() {
  return (
    <span className="ml-token-2 rounded-sm bg-warning-bg px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning">
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
          <span className="ml-token-2 rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">
            Read-only
          </span>
        )}
        {modified && <ModifiedBadge />}
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

function ReadOnlyValue({ value }) {
  return (
    <div className="flex h-9 w-full items-center rounded-md border border-border-subtle bg-surface-muted px-3 font-sans text-token-sm text-text-secondary-alt">
      {value}
    </div>
  );
}

function Toggle({ id, checked, onChange, label, description, modified, disabled }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <span className="flex items-center">
          <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
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

/* Read-only status strip cell (MFA/SSO/etc.). */
function StatusChip({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
      <span className="text-token-meta text-text-faint">{label}</span>
      <span className="text-token-sm font-medium text-text-primary-alt">{value}</span>
    </div>
  );
}

/* ---- Header & action bar -------------------------------------------- */

function Header({ baseline, dirty, changeCount, isValid, saved, onCancel, onReset }) {
  const fullName = `${baseline.form.firstName} ${baseline.form.lastName}`.trim();
  const active = baseline.status === 'Active';
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Edit User</h1>
          <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${active ? 'bg-success-bg text-success-strong' : 'bg-warning-bg text-warning'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
            {baseline.status}
          </span>
          {dirty && (
            <span className="rounded-full bg-warning-bg px-token-3 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning">
              {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          {baseline.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning"
              title="MOD-005 (User Management) has no backend deployed yet — showing sample data, not a live record."
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          {fullName} · Modify user profile, organizational assignments, permissions, licensing, and security settings.
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

function ActionBar({ baseline, dirty, changeCount, isValid, saved, onCancel, onReset }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
        {dirty
          ? `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'} · Last saved ${baseline.lastSavedLabel}`
          : `No unsaved changes · Last saved ${baseline.lastSavedLabel}`}
      </span>
      <div className="flex items-center gap-token-3">
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

/* ---- Section 1: Personal Information -------------------------------- */
function PersonalInformation({ baseline, form, setField, showError, markTouched, errors, isModified }) {
  return (
    <Section index={1} title="Personal Information" description="Identity and contact details for this user.">
      <dl className="sm:col-span-2 grid grid-cols-2 gap-token-4 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-meta text-text-faint">User ID</dt>
          <dd className="m-0 font-mono text-token-sm font-medium text-text-primary-alt">{baseline.userId}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-meta text-text-faint">Created</dt>
          <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{baseline.createdLabel}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-token-meta text-text-faint">Last Modified</dt>
          <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{baseline.lastModifiedLabel}</dd>
        </div>
      </dl>
      <Field id="field-firstName" label="First Name" required modified={isModified('firstName')} error={showError('firstName') ? errors.firstName : null}>
        {(db) => <TextInput id="field-firstName" required value={form.firstName} onChange={(v) => setField('firstName', v)} onBlur={() => markTouched('firstName')} invalid={showError('firstName')} describedBy={db} autoComplete="given-name" />}
      </Field>
      <Field id="field-lastName" label="Last Name" required modified={isModified('lastName')} error={showError('lastName') ? errors.lastName : null}>
        {(db) => <TextInput id="field-lastName" required value={form.lastName} onChange={(v) => setField('lastName', v)} onBlur={() => markTouched('lastName')} invalid={showError('lastName')} describedBy={db} autoComplete="family-name" />}
      </Field>
      <Field id="field-email" label="Work Email" required modified={isModified('email')} error={showError('email') ? errors.email : null}>
        {(db) => <TextInput id="field-email" required type="email" value={form.email} onChange={(v) => setField('email', v)} onBlur={() => markTouched('email')} invalid={showError('email')} describedBy={db} autoComplete="email" />}
      </Field>
      <Field id="field-employeeId" label="Employee ID" readOnly hint="Assigned at provisioning — cannot be changed here.">
        <ReadOnlyValue value={baseline.employeeId} />
      </Field>
      <Field id="field-jobTitle" label="Job Title" modified={isModified('jobTitle')}>
        {(db) => <TextInput id="field-jobTitle" value={form.jobTitle} onChange={(v) => setField('jobTitle', v)} describedBy={db} autoComplete="organization-title" />}
      </Field>
      <Field id="field-phone" label="Phone Number" modified={isModified('phone')}>
        {(db) => <TextInput id="field-phone" type="tel" value={form.phone} onChange={(v) => setField('phone', v)} describedBy={db} autoComplete="tel" />}
      </Field>
      <Field id="field-officeLocation" label="Office Location" className="sm:col-span-2" modified={isModified('officeLocation')}>
        {(db) => <SelectInput id="field-officeLocation" value={form.officeLocation} onChange={(v) => setField('officeLocation', v)} describedBy={db} options={ADD_USER_OPTIONS.officeLocation} placeholder="Select location…" />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Organization Assignment ----------------------------- */
function OrganizationAssignment({ baseline, form, setField, showError, markTouched, errors, isModified }) {
  const deptChanged = isModified('department');
  return (
    <Section index={2} title="Organization Assignment" description="Where this user sits in the organization.">
      <Field id="field-department" label="Department" required modified={deptChanged} error={showError('department') ? errors.department : null} hint={deptChanged ? `Previously: ${baseline.form.department}. Changing department affects resource visibility.` : 'Controls resource visibility and team membership scope.'}>
        {(db) => <SelectInput id="field-department" required value={form.department} onChange={(v) => setField('department', v)} onBlur={() => markTouched('department')} invalid={showError('department')} describedBy={db} options={ADD_USER_OPTIONS.department} placeholder="Select department…" />}
      </Field>
      <Field id="field-team" label="Team" modified={isModified('team')} hint="Team membership may change after a department transfer.">
        {(db) => <SelectInput id="field-team" value={form.team} onChange={(v) => setField('team', v)} describedBy={db} options={ADD_USER_OPTIONS.team} placeholder="Select team…" />}
      </Field>
      <Field id="field-manager" label="Reporting Manager" modified={isModified('manager')}>
        {(db) => <SelectInput id="field-manager" value={form.manager} onChange={(v) => setField('manager', v)} describedBy={db} options={ADD_USER_OPTIONS.manager} placeholder="Select manager…" />}
      </Field>
      <Field id="field-businessUnit" label="Business Unit" modified={isModified('businessUnit')}>
        {(db) => <SelectInput id="field-businessUnit" value={form.businessUnit} onChange={(v) => setField('businessUnit', v)} describedBy={db} options={EDIT_USER_OPTIONS.businessUnit} placeholder="Select business unit…" />}
      </Field>
      <Field id="field-costCenter" label="Cost Center" className="sm:col-span-2" modified={isModified('costCenter')}>
        {(db) => <TextInput id="field-costCenter" value={form.costCenter} onChange={(v) => setField('costCenter', v)} describedBy={db} placeholder="CC-0000" />}
      </Field>
      {deptChanged && (
        <div className="sm:col-span-2 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-warning">
            <IconAlert className="h-3.5 w-3.5 shrink-0" />
            Department transfer impact
          </p>
          <p className="m-0 mt-token-1 text-token-meta text-text-secondary-alt">
            Moving {baseline.form.firstName} {baseline.form.lastName} to {form.department} will transfer pipeline and connector access to that department. Team assignment may be reset and will be reviewed by the department manager.
          </p>
        </div>
      )}
    </Section>
  );
}

/* ---- Section 3: Roles & Access -------------------------------------- */
function RolesAccess({ baseline, form, setField, showError, markTouched, errors, isModified, scope }) {
  const roleChanged = isModified('primaryRole');
  const featureAccess = FEATURE_ACCESS_BY_LICENSE[form.licenseType] ?? null;
  return (
    <Section index={3} title="Roles & Access" description="What this user can do across the platform.">
      <Field id="field-primaryRole" label="Primary Role" required modified={roleChanged} error={showError('primaryRole') ? errors.primaryRole : null} hint={roleChanged ? `Previously: ${baseline.form.primaryRole}. This changes the user's platform permissions.` : undefined}>
        {(db) => <SelectInput id="field-primaryRole" required value={form.primaryRole} onChange={(v) => setField('primaryRole', v)} onBlur={() => markTouched('primaryRole')} invalid={showError('primaryRole')} describedBy={db} options={ADD_USER_OPTIONS.primaryRole} placeholder="Select role…" />}
      </Field>
      <Field id="field-permissionGroup" label="Permission Group" modified={isModified('permissionGroup')}>
        {(db) => <SelectInput id="field-permissionGroup" value={form.permissionGroup} onChange={(v) => setField('permissionGroup', v)} describedBy={db} options={ADD_USER_OPTIONS.permissionGroup} placeholder="Select group…" />}
      </Field>
      <Field id="field-additionalRoles" label="Additional Roles" modified={isModified('additionalRoles')}>
        {(db) => <SelectInput id="field-additionalRoles" value={form.additionalRoles} onChange={(v) => setField('additionalRoles', v)} describedBy={db} options={ADD_USER_OPTIONS.additionalRoles} placeholder="None" />}
      </Field>
      <Field id="field-administrativePrivileges" label="Administrative Privileges" modified={isModified('administrativePrivileges')}>
        {(db) => <SelectInput id="field-administrativePrivileges" value={form.administrativePrivileges} onChange={(v) => setField('administrativePrivileges', v)} describedBy={db} options={ADD_USER_OPTIONS.administrativePrivileges} />}
      </Field>
      <Field id="field-resourceAccessProfile" label="Resource Access Profile" className="sm:col-span-2" modified={isModified('resourceAccessProfile')}>
        {(db) => <SelectInput id="field-resourceAccessProfile" value={form.resourceAccessProfile} onChange={(v) => setField('resourceAccessProfile', v)} describedBy={db} options={ADD_USER_OPTIONS.resourceAccessProfile} placeholder="Select profile…" />}
      </Field>
      {roleChanged && (
        <div className="sm:col-span-2 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-warning">
            <IconAlert className="h-3.5 w-3.5 shrink-0" />
            Role elevation notice
          </p>
          <p className="m-0 mt-token-1 text-token-meta text-text-secondary-alt">
            Changing to {form.primaryRole} grants additional permissions. This change will be logged in the audit log and applied immediately after saving.
          </p>
        </div>
      )}
      {scope && (
        <div className="sm:col-span-2 rounded-md border border-primary bg-shell-accent-wash p-token-4">
          <p className="m-0 text-token-sm font-semibold text-primary">{form.primaryRole} — Access Scope</p>
          <p className="m-0 mt-token-1 text-token-meta text-text-secondary-alt">{scope}</p>
        </div>
      )}
      {featureAccess && (
        <div className="sm:col-span-2">
          <p className="m-0 text-token-sm font-medium text-text-secondary-alt">Effective Permissions — {form.primaryRole}</p>
          <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-3">
            {Object.entries(featureAccess).map(([feature, included]) => (
              <li key={feature} className={`flex items-center gap-token-2 rounded-md border px-token-3 py-token-2 text-token-meta ${included ? 'border-success bg-success-bg text-text-primary-alt' : 'border-border-subtle bg-surface-muted text-text-faint'}`}>
                {included ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconX className="h-3 w-3 shrink-0 text-text-faint" />}
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* ---- Section 4: License Management ---------------------------------- */
function LicenseManagement({ baseline, form, setField, showError, markTouched, errors, isModified, featureAccess }) {
  const usedPct = Math.round((LICENSE_POOL.used / LICENSE_POOL.total) * 100);
  return (
    <Section index={4} title="License Management" description="License type, status, and included capabilities.">
      <Field id="field-licenseType" label="License Type" required modified={isModified('licenseType')} error={showError('licenseType') ? errors.licenseType : null}>
        {(db) => <SelectInput id="field-licenseType" required value={form.licenseType} onChange={(v) => setField('licenseType', v)} onBlur={() => markTouched('licenseType')} invalid={showError('licenseType')} describedBy={db} options={ADD_USER_OPTIONS.licenseType} placeholder="Select license…" />}
      </Field>
      <Field id="field-licenseStatus" label="License Status" readOnly>
        <ReadOnlyValue value={baseline.license.status} />
      </Field>
      <Field id="field-assignedDate" label="Assigned Date" readOnly>
        <ReadOnlyValue value={baseline.license.assigned} />
      </Field>
      <Field id="field-licenseExpiration" label="Expiration Date" modified={isModified('licenseExpiration')}>
        {(db) => <SelectInput id="field-licenseExpiration" value={form.licenseExpiration} onChange={(v) => setField('licenseExpiration', v)} describedBy={db} options={ADD_USER_OPTIONS.licenseExpiration} />}
      </Field>
      <div className="sm:col-span-2 rounded-md border border-warning bg-warning-bg p-token-4">
        <div className="flex flex-wrap items-center justify-between gap-token-2">
          <span className="flex items-center gap-token-2 text-token-sm font-semibold text-warning">
            <IconAlert className="h-3.5 w-3.5 shrink-0" />
            Organization License Utilization
          </span>
          <span className="text-token-meta text-text-secondary-alt">{LICENSE_POOL.used} / {LICENSE_POOL.total}</span>
        </div>
        <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={LICENSE_POOL.used} aria-valuemin={0} aria-valuemax={LICENSE_POOL.total} aria-label="Organization license utilization">
          <span className="block h-full rounded-full bg-warning" style={{ width: `${usedPct}%` }} />
        </div>
        <p className="m-0 mt-token-2 text-token-meta text-text-secondary-alt">{LICENSE_POOL.remaining} Full licenses remaining · Low availability</p>
      </div>
      <div className="sm:col-span-2">
        <p className="m-0 text-token-sm font-medium text-text-secondary-alt">Feature Access — {form.licenseType || 'No license'}</p>
        {featureAccess ? (
          <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-3">
            {Object.entries(featureAccess).map(([feature, included]) => (
              <li key={feature} className={`flex items-center gap-token-2 rounded-md border px-token-3 py-token-2 text-token-meta ${included ? 'border-success bg-success-bg text-text-primary-alt' : 'border-border-subtle bg-surface-muted text-text-faint'}`}>
                {included ? <IconCheck className="h-3 w-3 shrink-0 text-success" /> : <IconX className="h-3 w-3 shrink-0 text-text-faint" />}
                {feature}
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-token-2 text-token-meta text-text-faint">Select a license type to preview included capabilities.</p>
        )}
      </div>
    </Section>
  );
}

/* ---- Section 5: Authentication & Security --------------------------- */
function AuthenticationSecurity({ baseline, form, setField, showError, markTouched, errors, isModified, onAdminAction }) {
  const s = baseline.security;
  return (
    <Section index={5} title="Authentication & Security" description="Sign-in requirements and administrative controls.">
      <div className="sm:col-span-2 grid grid-cols-2 gap-token-3 sm:grid-cols-3">
        <StatusChip label="MFA" value={s.mfa} />
        <StatusChip label="SSO" value={s.sso} />
        <StatusChip label="Password Age" value={s.passwordAge} />
        <StatusChip label="Failed Logins" value={s.failedLogins} />
        <StatusChip label="Active Sessions" value={s.activeSessions} />
        <StatusChip label="IP Restriction" value={s.ipRestriction} />
      </div>
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-requireMfa" checked={form.requireMfa} onChange={(v) => setField('requireMfa', v)} label="Require Multi-Factor Authentication" description="User must verify with a second factor at every sign-in." modified={isModified('requireMfa')} />
        <Toggle id="field-enableSso" checked={form.enableSso} onChange={(v) => setField('enableSso', v)} label="Enable Single Sign-On" description="Allow this user to authenticate through the organization identity provider." modified={isModified('enableSso')} />
        <Toggle id="field-passwordResetNextLogin" checked={form.passwordResetNextLogin} onChange={(v) => setField('passwordResetNextLogin', v)} label="Require Password Reset on Next Login" description="Force the user to set a new password the next time they sign in." modified={isModified('passwordResetNextLogin')} />
        <Toggle id="field-accountExpiration" checked={form.accountExpiration} onChange={(v) => setField('accountExpiration', v)} label="Enable Account Expiration" description="Automatically disable this account on a set date." modified={isModified('accountExpiration')} />
      </div>
      <Field id="field-allowedIpRange" label="Allowed IP Range" className="sm:col-span-2" modified={isModified('allowedIpRange')} error={showError('allowedIpRange') ? errors.allowedIpRange : null} hint="Optional. Comma-separated CIDR ranges restrict where this user can sign in from. Leave blank for no restriction.">
        {(db) => <TextInput id="field-allowedIpRange" value={form.allowedIpRange} onChange={(v) => setField('allowedIpRange', v)} onBlur={() => markTouched('allowedIpRange')} invalid={showError('allowedIpRange')} describedBy={db} placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8" />}
      </Field>
      <Field id="field-concurrentSessions" label="Concurrent Sessions" className="sm:col-span-2" modified={isModified('concurrentSessions')}>
        {(db) => <SelectInput id="field-concurrentSessions" value={form.concurrentSessions} onChange={(v) => setField('concurrentSessions', v)} describedBy={db} options={EDIT_USER_OPTIONS.concurrentSessions} />}
      </Field>
      <div className="sm:col-span-2 rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Administrative Actions</p>
        <p className="m-0 mt-token-1 text-token-meta text-text-faint">
          These actions require the MOD-005 backend and are disabled while running on sample data.
        </p>
        <div className="mt-token-3 flex flex-wrap gap-token-3">
          <button type="button" disabled title="Requires the MOD-005 user backend, which is not deployed yet." onClick={() => onAdminAction('Password reset email would be sent to the user.')} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Reset Password
          </button>
          <button type="button" disabled title="Requires the MOD-005 user backend, which is not deployed yet." onClick={() => onAdminAction('Account would be unlocked.')} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Unlock Account
          </button>
          <button type="button" disabled title="Requires the MOD-005 user backend, which is not deployed yet." onClick={() => onAdminAction('All active sessions would be terminated.')} className="flex h-8 items-center rounded-md border border-danger-border bg-surface-card px-token-4 text-token-sm font-medium text-danger-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Force Logout
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ---- Section 6: Notification Preferences ---------------------------- */
function NotificationPreferences({ form, setField, isModified }) {
  return (
    <Section index={6} title="Notification Preferences" description="Which alerts and updates this user receives.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-systemSecurityAlerts" checked disabled label="System & Security Alerts" description="Critical security and system notifications. Required — cannot be disabled." />
        <Toggle id="field-pipelineAlerts" checked={form.pipelineAlerts} onChange={(v) => setField('pipelineAlerts', v)} label="Pipeline Alerts" description="Notify on pipeline failures, completions, and SLA breaches." modified={isModified('pipelineAlerts')} />
        <Toggle id="field-connectorAlerts" checked={form.connectorAlerts} onChange={(v) => setField('connectorAlerts', v)} label="Connector Alerts" description="Notify on connector sync errors and credential expirations." modified={isModified('connectorAlerts')} />
        <Toggle id="field-weeklyDigest" checked={form.weeklyDigest} onChange={(v) => setField('weeklyDigest', v)} label="Weekly Digest" description="A weekly summary of activity across the user's resources." modified={isModified('weeklyDigest')} />
        <Toggle id="field-productUpdates" checked={form.productUpdates} onChange={(v) => setField('productUpdates', v)} label="Product Updates" description="Occasional emails about new platform features." modified={isModified('productUpdates')} />
      </div>
    </Section>
  );
}

/* ---- Sidebar cards -------------------------------------------------- */
function SidebarCard({ title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>
      <div className="mt-token-4">{children}</div>
    </section>
  );
}

function UserSummary({ baseline, form }) {
  const fullName = `${form.firstName} ${form.lastName}`.trim();
  return (
    <SidebarCard title="User Summary">
      <div className="flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash text-token-sm font-semibold text-primary">
          {baseline.initials}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{fullName}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{form.email}</p>
        </div>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        <SummaryRow label="User ID" value={baseline.userId} mono />
        <SummaryRow label="Job Title" value={form.jobTitle || '—'} />
        <SummaryRow label="Department" value={form.department || '—'} />
        <SummaryRow label="Primary Role" value={form.primaryRole || '—'} />
        <SummaryRow label="License" value={form.licenseType || '—'} />
      </dl>
    </SidebarCard>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-token-3">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 truncate text-right text-token-meta font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function AccountHealth({ baseline }) {
  const h = baseline.accountHealth;
  const rows = [
    ['Account Status', h.accountStatus],
    ['Last Login', h.lastLogin],
    ['MFA Status', h.mfaStatus],
    ['Password Age', h.passwordAge],
    ['Failed Logins', h.failedLogins],
    ['Active Sessions', h.activeSessions],
  ];
  return (
    <SidebarCard title="Account Health">
      <dl className="flex flex-col gap-token-2">
        {rows.map(([label, value]) => (
          <SummaryRow key={label} label={label} value={value} />
        ))}
      </dl>
    </SidebarCard>
  );
}

function LicenseSummary({ baseline }) {
  const l = baseline.license;
  const rows = [
    ['Type', l.type],
    ['Status', l.status],
    ['Assigned', l.assigned],
    ['Expiration', l.expiration],
  ];
  return (
    <SidebarCard title="License Summary">
      <dl className="flex flex-col gap-token-2">
        {rows.map(([label, value]) => (
          <SummaryRow key={label} label={label} value={value} />
        ))}
      </dl>
    </SidebarCard>
  );
}

function ValidationStatus({ checklist, completedCount }) {
  return (
    <SidebarCard title="Validation Status">
      <div className="flex items-center justify-between">
        <span className="text-token-meta text-text-faint">Checks passed</span>
        <span className={`font-mono text-token-sm font-semibold ${completedCount === checklist.length ? 'text-success-strong' : 'text-warning'}`}>
          {completedCount}/{checklist.length}
        </span>
      </div>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-meta">
            {item.done
              ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" />
              : <IconCircle className="h-3.5 w-3.5 shrink-0 text-text-faint" />}
            <span className={item.done ? 'text-text-primary-alt' : 'text-text-faint'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}

function PendingChanges({ changes }) {
  return (
    <SidebarCard title={`Pending Changes${changes.length ? ` (${changes.length})` : ''}`}>
      {changes.length === 0 ? (
        <p className="m-0 text-token-meta text-text-faint">No unsaved changes. Edit any field to see a live diff here.</p>
      ) : (
        <ul className="flex flex-col gap-token-3">
          {changes.map((c) => (
            <li key={c.key} className="flex flex-col gap-0.5">
              <span className="text-token-meta font-medium text-text-secondary-alt">{c.label}</span>
              <span className="flex items-center gap-token-2 text-token-meta">
                <span className="truncate text-text-faint line-through">{c.before}</span>
                <IconArrow className="h-3 w-3 shrink-0 text-text-faint" />
                <span className="truncate font-medium text-text-primary-alt">{c.after}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SidebarCard>
  );
}

function RecentActivity({ items, userId, onNavigate }) {
  return (
    <SidebarCard title="Recent Activity">
      <ul className="flex flex-col gap-token-3">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-0.5">
            <span className="text-token-meta font-medium text-text-primary-alt">{a.label}</span>
            <span className="text-token-meta text-text-faint">{a.meta}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onNavigate(`/users/${encodeURIComponent(userId)}`)}
        className="mt-token-4 text-token-meta font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View full activity →
      </button>
    </SidebarCard>
  );
}

/* ---- Confirm Changes dialog (node 105:9112) ------------------------- */
function ConfirmDialog({ baseline, form, changes, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = 'confirm-changes-title';
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    confirmRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
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
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-md border border-border bg-surface-card shadow-lg"
      >
        <div className="border-b border-border-subtle px-token-6 py-token-4">
          <h2 id={titleId} className="m-0 text-token-base font-semibold text-text-primary-alt">Confirm Changes</h2>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
            Review the {changes.length} {changes.length === 1 ? 'change' : 'changes'} to {fullName} before saving.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-token-6 py-token-4">
          <ul className="flex flex-col gap-token-3">
            {changes.map((c) => (
              <li key={c.key} className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
                <span className="text-token-meta font-medium text-text-secondary-alt">{c.label}</span>
                <span className="flex items-center gap-token-2 text-token-sm">
                  <span className="truncate text-text-faint line-through">{c.before}</span>
                  <IconArrow className="h-3 w-3 shrink-0 text-text-faint" />
                  <span className="truncate font-medium text-text-primary-alt">{c.after}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-token-4 rounded-md border border-primary bg-shell-accent-wash p-token-4">
            <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-primary">
              <IconInfo className="h-3.5 w-3.5 shrink-0" />
              What happens next
            </p>
            <ul className="m-0 mt-token-2 flex list-disc flex-col gap-token-1 pl-token-5 text-token-meta text-text-secondary-alt">
              <li>Changes are applied to the user's account immediately after saving.</li>
              <li>Permission and role changes are recorded in the audit log.</li>
              <li>The user may need to sign in again if security settings changed.</li>
            </ul>
          </div>

          {baseline.mocked && (
            <p className="m-0 mt-token-3 text-token-meta text-warning">
              Note: MOD-005 has no backend yet, so saving is simulated — nothing will actually be persisted.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-token-3 border-t border-border-subtle px-token-6 py-token-4">
          <button type="button" onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconSave />}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Loading skeleton ----------------------------------------------- */
function EditSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
              <div className="h-5 w-48 animate-pulse rounded bg-surface-muted" />
              <div className="mt-token-5 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="flex flex-col gap-token-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                    <div className="h-9 w-full animate-pulse rounded-md bg-surface-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-token-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="mt-token-4 flex flex-col gap-token-2">
                {[0, 1, 2].map((j) => <div key={j} className="h-3 w-full animate-pulse rounded bg-surface-muted" />)}
              </div>
            </div>
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

function IconAlert({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
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
