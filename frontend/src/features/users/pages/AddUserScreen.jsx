import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  ADD_USER_OPTIONS,
  ROLE_ACCESS_SCOPE,
  FEATURE_ACCESS_BY_LICENSE,
  LICENSE_POOL,
  TAKEN_EMPLOYEE_IDS,
  inviteUser,
} from '../services/addUser.api';

/* Field styling — mirrors SCR-026's CreateOrganizationScreen so the two
   admin forms read identically. No alpha modifiers on CSS-var tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMP_ID_PATTERN = /^EMP-\d{5}$/;
// Optional CIDR list, e.g. "192.168.1.0/24, 10.0.0.0/8". Octets bounded
// to 0-255 and the prefix to 0-32 so 999.999.999.999/99 is rejected.
const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const PREFIX = '(3[0-2]|[12]?\\d)';
const CIDR = `${OCTET}(\\.${OCTET}){3}/${PREFIX}`;
const CIDR_LIST_PATTERN = new RegExp(`^\\s*${CIDR}\\s*(,\\s*${CIDR}\\s*)*$`);

/* Scope this invite to the caller's organization. MOD-004/MOD-005 have
   no live "current org" endpoint, so this mirrors the id used by the
   sibling org-scoped screens (activity/teams) until context ships. */
const ORG_ID = 'current';

/** Empty form — mirrors Figma node 103:6282 field set across 6 sections. */
const INITIAL_FORM = {
  // Basic Information
  firstName: '',
  lastName: '',
  email: '',
  employeeId: '',
  jobTitle: '',
  phone: '',
  // Organization Assignment
  department: '',
  team: '',
  manager: '',
  officeLocation: '',
  costCenter: '',
  // Role & Permissions
  primaryRole: '',
  permissionGroup: '',
  additionalRoles: '',
  administrativePrivileges: 'None — Standard Access',
  resourceAccessProfile: '',
  // License Assignment
  licenseType: '',
  licenseExpiration: 'No expiration (perpetual)',
  // Authentication & Security
  requireMfa: true,
  enableSso: true,
  temporaryPassword: false,
  passwordResetFirstLogin: true,
  accountExpiration: false,
  allowedIpRange: '',
  // Notifications
  sendInvitationEmail: true,
  notifyManager: true,
  sendWelcomeGuide: true,
  productNotifications: false,
};

/* Required fields per Figma (marked with *). Employee ID is optional but
   must be unique + well-formed if supplied — reproduces the frame's
   "already in use" error state. */
function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Work email is required.';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  const empId = form.employeeId.trim();
  if (empId) {
    if (!EMP_ID_PATTERN.test(empId)) errors.employeeId = 'Use the format EMP-00000.';
    else if (TAKEN_EMPLOYEE_IDS.includes(empId)) errors.employeeId = 'This Employee ID is already in use.';
  }
  if (!form.department) errors.department = 'Select a department.';
  if (!form.primaryRole) errors.primaryRole = 'Select a primary role.';
  if (!form.licenseType) errors.licenseType = 'Select a license type.';
  if (form.allowedIpRange.trim() && !CIDR_LIST_PATTERN.test(form.allowedIpRange.trim()))
    errors.allowedIpRange = 'Enter comma-separated CIDR ranges, e.g. 192.168.1.0/24.';
  return errors;
}

/* The 6 Validation Status checklist items from the Figma sidebar. Item
   2 ("Employee ID unique") is the one shown failing in the design; it is
   satisfied when the field is blank or a unique, well-formed id. */
function computeChecklist(form) {
  const empId = form.employeeId.trim();
  const employeeIdOk = !empId || (EMP_ID_PATTERN.test(empId) && !TAKEN_EMPLOYEE_IDS.includes(empId));
  return [
    {
      key: 'basic',
      label: 'Basic Information',
      done: !!form.firstName.trim() && !!form.lastName.trim() && EMAIL_PATTERN.test(form.email.trim()),
    },
    { key: 'employeeId', label: 'Employee ID unique', done: employeeIdOk },
    { key: 'org', label: 'Organization Assigned', done: !!form.department },
    { key: 'role', label: 'Role Selected', done: !!form.primaryRole },
    { key: 'license', label: 'License Assigned', done: !!form.licenseType },
    {
      key: 'security',
      label: 'Security Configured',
      done: form.requireMfa || form.enableSso,
    },
  ];
}

/** SCR-033 — Add User Screen. Node 103:6282, Figma page "Page 1". */
export default function AddUserScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form), [form]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  const featureAccess = FEATURE_ACCESS_BY_LICENSE[form.licenseType] ?? null;
  const remainingAfter = Math.max(0, LICENSE_POOL.remaining - 1);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
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

  async function handleConfirmInvite() {
    setSubmitState({ status: 'submitting', message: '' });
    const payload = buildPayload(form);
    const result = await inviteUser(ORG_ID, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-005 has no user-provisioning backend yet, so nothing was persisted. In a live environment this would provision the account and send an invitation email to the address above.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Invitation sent.' });
      navigate('/users');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users', 'Add User']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header onCancel={() => navigate('/users')} isValid={isValid} submitted={submitState.status === 'mocked'} />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Sending invitation'
            : submitState.status === 'mocked'
              ? 'Invitation simulated — no backend available'
              : submitState.status === 'success'
                ? 'Invitation sent'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning">Simulated invitation (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <BasicInformation form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <OrganizationAssignment form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <RolePermissions form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <LicenseAssignment form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} featureAccess={featureAccess} remainingAfter={remainingAfter} />
            <AuthenticationSecurity form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <Notifications form={form} setField={setField} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <UserSummary form={form} />
            <LicenseAvailability />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <SecurityChecklist form={form} />
            <QuickHelp />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/users')} submitted={submitState.status === 'mocked'} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmInvite}
        />
      )}
    </AppShell>
  );
}

/* Assemble the invite payload from the flat form state. */
function buildPayload(form) {
  return {
    basic: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      employeeId: form.employeeId.trim() || null,
      jobTitle: form.jobTitle.trim() || null,
      phone: form.phone.trim() || null,
    },
    organization: {
      department: form.department,
      team: form.team || null,
      manager: form.manager || null,
      officeLocation: form.officeLocation || null,
      costCenter: form.costCenter.trim() || null,
    },
    access: {
      primaryRole: form.primaryRole,
      permissionGroup: form.permissionGroup || null,
      additionalRoles: form.additionalRoles ? [form.additionalRoles] : [],
      administrativePrivileges: form.administrativePrivileges,
      resourceAccessProfile: form.resourceAccessProfile || null,
    },
    license: {
      type: form.licenseType,
      expiration: form.licenseExpiration,
    },
    security: {
      requireMfa: form.requireMfa,
      enableSso: form.enableSso,
      temporaryPassword: form.temporaryPassword,
      passwordResetFirstLogin: form.passwordResetFirstLogin,
      accountExpiration: form.accountExpiration,
      allowedIpRange: form.allowedIpRange.trim() || null,
    },
    notifications: {
      sendInvitationEmail: form.sendInvitationEmail,
      notifyManager: form.notifyManager,
      sendWelcomeGuide: form.sendWelcomeGuide,
      productNotifications: form.productNotifications,
    },
  };
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
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Add User</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Invite a new user, assign organizational access, configure permissions, and provision an enterprise account.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Users' : 'Cancel'}
        </button>
        <button type="button" disabled title="Saving drafts requires MOD-005's user endpoint (still PLANNED)." className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Save Draft
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Invitation already simulated — return to the user list to invite another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconSend />
          Send Invitation
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
        {isValid ? 'All required fields completed · Ready to invite' : `${completedCount} of ${total} configuration steps complete`}
      </span>
      <div className="flex items-center gap-token-3">
        <button type="button" onClick={onCancel} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {submitted ? 'Back to Users' : 'Cancel'}
        </button>
        <button type="submit" disabled={!isValid || submitted} title={submitted ? 'Invitation already simulated — return to the user list to invite another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconSend />
          Send Invitation
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Basic Information ----------------------------------- */
function BasicInformation({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={1} title="Basic Information" description="Identity and contact details for the new user.">
      <Field id="field-firstName" label="First Name" required error={showError('firstName') ? errors.firstName : null}>
        {(db) => <TextInput id="field-firstName" required value={form.firstName} onChange={(v) => setField('firstName', v)} onBlur={() => markTouched('firstName')} invalid={showError('firstName')} describedBy={db} autoComplete="given-name" />}
      </Field>
      <Field id="field-lastName" label="Last Name" required error={showError('lastName') ? errors.lastName : null}>
        {(db) => <TextInput id="field-lastName" required value={form.lastName} onChange={(v) => setField('lastName', v)} onBlur={() => markTouched('lastName')} invalid={showError('lastName')} describedBy={db} autoComplete="family-name" />}
      </Field>
      <Field id="field-email" label="Work Email" required error={showError('email') ? errors.email : null} hint="Must be a unique organizational email address.">
        {(db) => <TextInput id="field-email" required type="email" value={form.email} onChange={(v) => setField('email', v)} onBlur={() => markTouched('email')} invalid={showError('email')} describedBy={db} placeholder="m.chen@acme.com" autoComplete="email" />}
      </Field>
      <Field id="field-employeeId" label="Employee ID" error={showError('employeeId') ? errors.employeeId : null} hint="Optional — must be unique across the organization.">
        {(db) => <TextInput id="field-employeeId" value={form.employeeId} onChange={(v) => setField('employeeId', v.toUpperCase())} onBlur={() => markTouched('employeeId')} invalid={showError('employeeId')} describedBy={db} placeholder="EMP-00000" />}
      </Field>
      <Field id="field-jobTitle" label="Job Title">
        {(db) => <TextInput id="field-jobTitle" value={form.jobTitle} onChange={(v) => setField('jobTitle', v)} describedBy={db} placeholder="Data Engineer" autoComplete="organization-title" />}
      </Field>
      <Field id="field-phone" label="Phone Number">
        {(db) => <TextInput id="field-phone" type="tel" value={form.phone} onChange={(v) => setField('phone', v)} describedBy={db} placeholder="+1 (555) 000-0000" autoComplete="tel" />}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Organization Assignment ----------------------------- */
function OrganizationAssignment({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={2} title="Organization Assignment" description="Where this user sits in the organization.">
      <Field id="field-department" label="Department" required error={showError('department') ? errors.department : null} hint="Controls resource visibility and team membership scope.">
        {(db) => <SelectInput id="field-department" required value={form.department} onChange={(v) => setField('department', v)} onBlur={() => markTouched('department')} invalid={showError('department')} describedBy={db} options={ADD_USER_OPTIONS.department} placeholder="Select department…" />}
      </Field>
      <Field id="field-team" label="Team">
        {(db) => <SelectInput id="field-team" value={form.team} onChange={(v) => setField('team', v)} describedBy={db} options={ADD_USER_OPTIONS.team} placeholder="Select team…" />}
      </Field>
      <Field id="field-manager" label="Manager">
        {(db) => <SelectInput id="field-manager" value={form.manager} onChange={(v) => setField('manager', v)} describedBy={db} options={ADD_USER_OPTIONS.manager} placeholder="Select manager…" />}
      </Field>
      <Field id="field-officeLocation" label="Office Location">
        {(db) => <SelectInput id="field-officeLocation" value={form.officeLocation} onChange={(v) => setField('officeLocation', v)} describedBy={db} options={ADD_USER_OPTIONS.officeLocation} placeholder="Select location…" />}
      </Field>
      <Field id="field-costCenter" label="Cost Center" className="sm:col-span-2">
        {(db) => <TextInput id="field-costCenter" value={form.costCenter} onChange={(v) => setField('costCenter', v)} describedBy={db} placeholder="CC-0000" />}
      </Field>
    </Section>
  );
}

/* ---- Section 3: Role & Permissions ---------------------------------- */
function RolePermissions({ form, setField, showError, markTouched, errors }) {
  const scope = form.primaryRole ? ROLE_ACCESS_SCOPE[form.primaryRole] : null;
  return (
    <Section index={3} title="Role & Permissions" description="What this user can do across the platform.">
      <Field id="field-primaryRole" label="Primary Role" required error={showError('primaryRole') ? errors.primaryRole : null}>
        {(db) => <SelectInput id="field-primaryRole" required value={form.primaryRole} onChange={(v) => setField('primaryRole', v)} onBlur={() => markTouched('primaryRole')} invalid={showError('primaryRole')} describedBy={db} options={ADD_USER_OPTIONS.primaryRole} placeholder="Select role…" />}
      </Field>
      <Field id="field-permissionGroup" label="Permission Group">
        {(db) => <SelectInput id="field-permissionGroup" value={form.permissionGroup} onChange={(v) => setField('permissionGroup', v)} describedBy={db} options={ADD_USER_OPTIONS.permissionGroup} placeholder="Select group…" />}
      </Field>
      <Field id="field-additionalRoles" label="Additional Roles" className="sm:col-span-2">
        {(db) => <SelectInput id="field-additionalRoles" value={form.additionalRoles} onChange={(v) => setField('additionalRoles', v)} describedBy={db} options={ADD_USER_OPTIONS.additionalRoles} placeholder="None" />}
      </Field>
      {scope && (
        <div className="sm:col-span-2 rounded-md border border-primary bg-shell-accent-wash p-token-4">
          <p className="m-0 text-token-sm font-semibold text-primary">{form.primaryRole} — Access Scope</p>
          <p className="m-0 mt-token-1 text-token-meta text-text-secondary-alt">{scope}</p>
        </div>
      )}
      <Field id="field-administrativePrivileges" label="Administrative Privileges">
        {(db) => <SelectInput id="field-administrativePrivileges" value={form.administrativePrivileges} onChange={(v) => setField('administrativePrivileges', v)} describedBy={db} options={ADD_USER_OPTIONS.administrativePrivileges} />}
      </Field>
      <Field id="field-resourceAccessProfile" label="Resource Access Profile">
        {(db) => <SelectInput id="field-resourceAccessProfile" value={form.resourceAccessProfile} onChange={(v) => setField('resourceAccessProfile', v)} describedBy={db} options={ADD_USER_OPTIONS.resourceAccessProfile} placeholder="Select profile…" />}
      </Field>
    </Section>
  );
}

/* ---- Section 4: License Assignment ---------------------------------- */
function LicenseAssignment({ form, setField, showError, markTouched, errors, featureAccess, remainingAfter }) {
  const usedPct = Math.round((LICENSE_POOL.used / LICENSE_POOL.total) * 100);
  return (
    <Section index={4} title="License Assignment" description="Assign a license and review included capabilities.">
      <Field id="field-licenseType" label="License Type" required error={showError('licenseType') ? errors.licenseType : null}>
        {(db) => <SelectInput id="field-licenseType" required value={form.licenseType} onChange={(v) => setField('licenseType', v)} onBlur={() => markTouched('licenseType')} invalid={showError('licenseType')} describedBy={db} options={ADD_USER_OPTIONS.licenseType} placeholder="Select license…" />}
      </Field>
      <Field id="field-licenseExpiration" label="License Expiration">
        {(db) => <SelectInput id="field-licenseExpiration" value={form.licenseExpiration} onChange={(v) => setField('licenseExpiration', v)} describedBy={db} options={ADD_USER_OPTIONS.licenseExpiration} />}
      </Field>
      <div className="sm:col-span-2 rounded-md border border-warning bg-warning-bg p-token-4">
        <div className="flex flex-wrap items-center justify-between gap-token-2">
          <span className="flex items-center gap-token-2 text-token-sm font-semibold text-warning">
            <IconAlert className="h-3.5 w-3.5 shrink-0" />
            License availability is low
          </span>
          <span className="text-token-meta text-text-secondary-alt">{LICENSE_POOL.used} / {LICENSE_POOL.total} assigned</span>
        </div>
        <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={LICENSE_POOL.used} aria-valuemin={0} aria-valuemax={LICENSE_POOL.total} aria-label="License utilization">
          <span className="block h-full rounded-full bg-warning" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-token-2 flex flex-wrap items-center justify-between gap-token-2">
          <span className="text-token-meta text-text-secondary-alt">{remainingAfter} licenses remaining after this assignment</span>
          <button type="button" disabled title="License management requires MOD-005 (still PLANNED)." className="text-token-meta font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60">
            Manage Licenses →
          </button>
        </div>
      </div>
      <div className="sm:col-span-2">
        <p className="m-0 text-token-sm font-medium text-text-secondary-alt">Feature Access Included</p>
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
function AuthenticationSecurity({ form, setField, showError, markTouched, errors }) {
  return (
    <Section index={5} title="Authentication & Security" description="How this user signs in and how the account is secured.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-requireMfa" checked={form.requireMfa} onChange={(v) => setField('requireMfa', v)} label="Require Multi-Factor Authentication" description="User will be prompted to configure MFA on first login." />
        <Toggle id="field-enableSso" checked={form.enableSso} onChange={(v) => setField('enableSso', v)} label="Single Sign-On (SSO)" description="Use organization SSO provider — Google Workspace." />
        <Toggle id="field-temporaryPassword" checked={form.temporaryPassword} onChange={(v) => setField('temporaryPassword', v)} label="Temporary Password" description="Generate a temporary password for manual credential delivery." />
        <Toggle id="field-passwordResetFirstLogin" checked={form.passwordResetFirstLogin} onChange={(v) => setField('passwordResetFirstLogin', v)} label="Password Reset on First Login" description="Force the user to set a new password immediately after logging in." />
        <Toggle id="field-accountExpiration" checked={form.accountExpiration} onChange={(v) => setField('accountExpiration', v)} label="Account Expiration" description="Automatically deactivate the account after a specified date." />
      </div>
      <Field id="field-allowedIpRange" label="Allowed IP Range" className="sm:col-span-2" error={showError('allowedIpRange') ? errors.allowedIpRange : null} hint="Leave empty to allow access from any IP address.">
        {(db) => <TextInput id="field-allowedIpRange" value={form.allowedIpRange} onChange={(v) => setField('allowedIpRange', v)} onBlur={() => markTouched('allowedIpRange')} invalid={showError('allowedIpRange')} describedBy={db} placeholder="Optional — e.g. 192.168.1.0/24, 10.0.0.0/8" />}
      </Field>
    </Section>
  );
}

/* ---- Section 6: Notifications --------------------------------------- */
function Notifications({ form, setField }) {
  return (
    <Section index={6} title="Notifications" description="Messages sent when the account is provisioned.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-sendInvitationEmail" checked={form.sendInvitationEmail} onChange={(v) => setField('sendInvitationEmail', v)} label="Send Invitation Email" description="Deliver an invitation link to the user's work email upon provisioning." />
        <Toggle id="field-notifyManager" checked={form.notifyManager} onChange={(v) => setField('notifyManager', v)} label="Notify Manager" description="Send a notification to the assigned manager when the account is activated." />
        <Toggle id="field-sendWelcomeGuide" checked={form.sendWelcomeGuide} onChange={(v) => setField('sendWelcomeGuide', v)} label="Send Welcome Guide" description="Include an enterprise onboarding guide with the invitation email." />
        <Toggle id="field-productNotifications" checked={form.productNotifications} onChange={(v) => setField('productNotifications', v)} label="Enable Product Notifications" description="Allow the platform to send operational and feature-update notifications." />
      </div>
      <p className="sm:col-span-2 m-0 flex items-start gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-meta text-primary">
        <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
        Invitation emails are sent automatically after the account is successfully provisioned and all permissions are applied. Users have 7 days to accept the invitation before it expires.
      </p>
    </Section>
  );
}

/* ---- Sidebar: live User Summary ------------------------------------- */
function UserSummary({ form }) {
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || 'New User';
  const initials = [form.firstName, form.lastName].filter(Boolean).map((s) => s[0]?.toUpperCase()).join('') || 'NU';
  const rows = [
    { label: 'Department', value: form.department || '—' },
    { label: 'Team', value: form.team || '—' },
    { label: 'Role', value: form.primaryRole || '—' },
    { label: 'License', value: form.licenseType || '—' },
    { label: 'MFA', value: form.requireMfa ? 'Required' : 'Optional' },
    { label: 'SSO', value: form.enableSso ? 'Enabled' : 'Disabled' },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">User Summary</h2>
      <div className="mt-token-4 flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{fullName}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{form.email || '—'}</p>
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

/* ---- Sidebar: License Availability meter ---------------------------- */
function LicenseAvailability() {
  const usedPct = Math.round((LICENSE_POOL.used / LICENSE_POOL.total) * 100);
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">License Availability</h2>
      <div className="mt-token-4 flex items-center justify-between text-token-meta">
        <span className="text-text-secondary-alt">Full Engineer Licenses</span>
        <span className="font-medium text-text-primary-alt">{LICENSE_POOL.used} / {LICENSE_POOL.total}</span>
      </div>
      <div className="mt-token-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={LICENSE_POOL.used} aria-valuemin={0} aria-valuemax={LICENSE_POOL.total} aria-label="License utilization">
        <span className="block h-full rounded-full bg-warning" style={{ width: `${usedPct}%` }} />
      </div>
      <div className="mt-token-2 flex items-center justify-between text-token-meta">
        <span className="text-text-secondary-alt">Available</span>
        <span className="font-medium text-warning">{LICENSE_POOL.remaining} remaining</span>
      </div>
      <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning">
        <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
        Low availability — consider upgrading.
      </p>
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

/* ---- Sidebar: Security Checklist ------------------------------------ */
function SecurityChecklist({ form }) {
  const items = [
    { label: 'MFA Enabled', done: form.requireMfa },
    { label: 'SSO Configured', done: form.enableSso },
    { label: 'Invitation Email Active', done: form.sendInvitationEmail },
    { label: 'Password Reset Required', done: form.passwordResetFirstLogin },
    { label: 'IP Restriction', done: !!form.allowedIpRange.trim() },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Security Checklist</h2>
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

/* ---- Sidebar: Quick Help -------------------------------------------- */
function QuickHelp() {
  const tips = [
    'Work email must be unique across the organization.',
    'Roles determine access permissions and feature availability.',
    'Department assignment controls resource visibility and team scope.',
    'Invitations expire after 7 days — resend from the user list.',
    'MFA is required for all users with administrative privileges.',
  ];
  return (
    <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Quick Help</h2>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-token-2 text-token-meta text-text-secondary-alt">
            <IconInfo className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Confirm Invitation dialog (node 103:7455) ---------------------- */
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

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || 'New User';
  const initials = [form.firstName, form.lastName].filter(Boolean).map((s) => s[0]?.toUpperCase()).join('') || 'NU';
  const rows = [
    { label: 'Department', value: form.department || '—' },
    { label: 'Team', value: form.team || '—' },
    { label: 'Manager', value: form.manager ? form.manager.split(' — ')[0] : '—' },
    { label: 'MFA', value: form.requireMfa ? 'Required' : 'Optional' },
    { label: 'SSO', value: form.enableSso ? 'Enabled (Google)' : 'Disabled' },
    { label: 'IP Range', value: form.allowedIpRange.trim() || 'Unrestricted' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-invite-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <div className="flex items-start justify-between gap-token-3">
          <div>
            <h2 id="confirm-invite-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Invitation</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the provisioning details before sending the invitation.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} aria-label="Close" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-token-5 flex items-center gap-token-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-shell-accent-wash text-token-sm font-semibold text-primary">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{fullName}</p>
            <p className="m-0 truncate text-token-meta text-text-faint">{form.email || '—'}</p>
          </div>
          <div className="flex shrink-0 gap-token-2">
            {form.primaryRole && <span className="rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-meta font-semibold text-primary">{form.primaryRole}</span>}
            {form.licenseType && <span className="rounded-sm border border-border-subtle px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">{form.licenseType.replace('Full — ', 'Full ')}</span>}
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
              An enterprise account will be provisioned for {fullName}. An invitation email will be sent to {form.email || 'the user'}. All permissions will be applied immediately after account activation.
            </p>
          </div>
        </div>
        <div className="mt-token-5 flex items-center justify-end gap-token-3">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={submitting} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {submitting ? <IconSpinner /> : <IconSend />}
            {submitting ? 'Sending…' : 'Send Invitation'}
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

function IconSend() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2 7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2Z" />
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
