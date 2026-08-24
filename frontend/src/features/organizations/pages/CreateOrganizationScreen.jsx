import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  ORG_FORM_OPTIONS,
  PLAN_CATALOG,
  SUBSCRIPTION_PLANS,
  createOrganization,
} from '../services/createOrganization.api';

/* Field styling — mirrors auth's inputBase but scoped to this form so
   the create screen doesn't couple to the auth feature. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Empty form — mirrors Figma node 92:2 field set across all 6 sections. */
const INITIAL_FORM = {
  // Organization Information
  name: '',
  code: '',
  displayName: '',
  industry: '',
  organizationType: '',
  description: '',
  // Regional Settings
  country: '',
  region: 'US East (us-east-1)',
  timeZone: '',
  language: 'English (US)',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD — US Dollar',
  // Primary Administrator
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminJobTitle: '',
  initialRole: 'Organization Admin',
  // Subscription & Licensing
  plan: 'Enterprise',
  billingModel: 'Annual — Invoiced',
  licenseLimit: '300',
  storage: '5 TB',
  trialPeriod: false,
  expirationDate: '',
  // Security Configuration
  requireMfa: true,
  enableSso: false,
  passwordPolicy: 'Strong (12+ chars, complexity required)',
  sessionTimeout: '8 hours',
  apiAccess: 'Full Access',
  ipRestrictions: '',
  // Default Platform Configuration
  defaultEnvironment: 'Production',
  dataRetention: '90 days',
  auditLogging: true,
  notificationPreferences: 'Email + In-App',
  connectorPermissions: 'Org Admin only',
};

/* Auto-generate an org code slug from the organization name, e.g.
   "Acme Data Corp" → "ACME-DATA-CORP". */
function slugifyCode(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/* Required fields per Figma (marked with *). Validation Status list in
   the sidebar tracks completion of these logical groups. */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Organization name is required.';
  if (!form.code.trim()) errors.code = 'Organization code is required.';
  if (!form.organizationType) errors.organizationType = 'Select an organization type.';
  if (!form.country) errors.country = 'Select a country.';
  if (!form.timeZone) errors.timeZone = 'Select a time zone.';
  if (!form.adminFirstName.trim()) errors.adminFirstName = 'First name is required.';
  if (!form.adminLastName.trim()) errors.adminLastName = 'Last name is required.';
  if (!form.adminEmail.trim()) errors.adminEmail = 'Work email is required.';
  else if (!EMAIL_PATTERN.test(form.adminEmail.trim())) errors.adminEmail = 'Enter a valid email address.';
  if (!form.plan) errors.plan = 'Select a subscription plan.';
  if (!form.licenseLimit.trim()) errors.licenseLimit = 'License limit is required.';
  else if (!/^\d+$/.test(form.licenseLimit.trim()) || Number(form.licenseLimit) < 1)
    errors.licenseLimit = 'Enter a whole number of seats.';
  if (!form.defaultEnvironment) errors.defaultEnvironment = 'Select a default environment.';
  return errors;
}

/* The 7 Validation Status checklist items from the Figma sidebar, each a
   predicate over the current form. Item 7 ("Platform config set") maps to
   the Default Platform Configuration section. */
function computeChecklist(form) {
  return [
    { key: 'name', label: 'Organization name provided', done: !!form.name.trim() },
    { key: 'code', label: 'Organization code generated', done: !!form.code.trim() },
    { key: 'type', label: 'Organization type selected', done: !!form.organizationType },
    { key: 'region', label: 'Region & time zone set', done: !!form.country && !!form.timeZone },
    {
      key: 'admin',
      label: 'Primary administrator complete',
      done:
        !!form.adminFirstName.trim() &&
        !!form.adminLastName.trim() &&
        EMAIL_PATTERN.test(form.adminEmail.trim()),
    },
    {
      key: 'plan',
      label: 'Subscription plan configured',
      done: !!form.plan && /^\d+$/.test(form.licenseLimit.trim()) && Number(form.licenseLimit) >= 1,
    },
    { key: 'platform', label: 'Platform configuration set', done: !!form.defaultEnvironment },
  ];
}

/** SCR-026 — Create Organization Screen. Node 92:2, Figma page "Page 1". */
export default function CreateOrganizationScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [codeEdited, setCodeEdited] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const checklist = useMemo(() => computeChecklist(form), [form]);
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;
  const plan = PLAN_CATALOG[form.plan] ?? PLAN_CATALOG.Enterprise;

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate the code from the name until the user edits it directly.
      if (key === 'name' && !codeEdited) next.code = slugifyCode(value);
      // Selecting a plan seeds the design-default seat/storage limits.
      if (key === 'plan') {
        const cat = PLAN_CATALOG[value];
        if (cat) {
          next.licenseLimit = cat.defaultLicenseLimit;
          next.storage = cat.defaultStorage;
        }
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

  function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      // Focus the first invalid field for keyboard/AT users.
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirmCreate() {
    setSubmitState({ status: 'submitting', message: '' });
    const payload = buildPayload(form);
    const result = await createOrganization(payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-004 has no provisioning backend yet, so nothing was persisted. In a live environment this would create the organization and route to its detail page.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Organization created.' });
      navigate(`/organizations/${encodeURIComponent(result.id)}`);
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Organizations', 'Create Organization']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header
          onCancel={() => navigate('/organizations')}
          isValid={isValid}
        />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating organization'
            : submitState.status === 'mocked'
              ? 'Organization creation simulated — no backend available'
              : submitState.status === 'success'
                ? 'Organization created'
                : `${completedCount} of ${checklist.length} configuration steps complete`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning">Simulated creation (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <OrganizationInformation form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} onCodeEdit={() => setCodeEdited(true)} />
            <RegionalSettings form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <PrimaryAdministrator form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
            <SubscriptionLicensing form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} plan={plan} />
            <SecurityConfiguration form={form} setField={setField} />
            <PlatformConfiguration form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <OrganizationSummary form={form} plan={plan} />
            <ValidationStatus checklist={checklist} completedCount={completedCount} />
            <SecurityChecklist form={form} />
            <QuickHelp />
          </aside>
        </div>

        <ActionBar isValid={isValid} completedCount={completedCount} total={checklist.length} onCancel={() => navigate('/organizations')} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </AppShell>
  );
}

/* Assemble the API payload from the flat form state. */
function buildPayload(form) {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    displayName: form.displayName.trim() || form.name.trim(),
    industry: form.industry || null,
    organizationType: form.organizationType,
    description: form.description.trim() || null,
    region: {
      country: form.country,
      dataCenter: form.region,
      timeZone: form.timeZone,
      language: form.language,
      dateFormat: form.dateFormat,
      currency: form.currency,
    },
    primaryAdmin: {
      firstName: form.adminFirstName.trim(),
      lastName: form.adminLastName.trim(),
      email: form.adminEmail.trim(),
      phone: form.adminPhone.trim() || null,
      jobTitle: form.adminJobTitle.trim() || null,
      role: form.initialRole,
    },
    subscription: {
      plan: form.plan,
      billingModel: form.billingModel,
      licenseLimit: Number(form.licenseLimit),
      storage: form.storage,
      trialPeriod: form.trialPeriod,
      expirationDate: form.expirationDate || null,
    },
    security: {
      requireMfa: form.requireMfa,
      enableSso: form.enableSso,
      passwordPolicy: form.passwordPolicy,
      sessionTimeout: form.sessionTimeout,
      apiAccess: form.apiAccess,
      ipRestrictions: form.ipRestrictions.trim() || null,
    },
    platform: {
      defaultEnvironment: form.defaultEnvironment,
      dataRetention: form.dataRetention,
      auditLogging: form.auditLogging,
      notificationPreferences: form.notificationPreferences,
      connectorPermissions: form.connectorPermissions,
    },
  };
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

function Field({ id, label, required, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {typeof children === 'function' ? children(describedBy) : children}
      {hint && !error && (
        <p id={`${id}-hint`} className="m-0 text-token-xs text-text-faint">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 text-token-xs text-danger" role="alert">{error}</p>
      )}
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
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary/40 bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
        {description && <span className="mt-0.5 text-token-xs text-text-faint">{description}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-token-2">
        <span
          aria-hidden="true"
          className={`w-6 text-right font-mono text-token-xs font-semibold uppercase tracking-[0.04em] ${checked ? 'text-primary' : 'text-text-faint'}`}
        >
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
          <span
            className={`h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
            aria-hidden="true"
          />
        </button>
      </span>
    </div>
  );
}

/* ---- Header & action bar -------------------------------------------- */

function Header({ onCancel, isValid }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Create Organization</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Provision a new organization, its primary administrator, subscription, and platform defaults.
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
          disabled
          title="Saving drafts requires MOD-004's organization endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Create Organization
        </button>
      </div>
    </div>
  );
}

function ActionBar({ isValid, completedCount, total, onCancel }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${isValid ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
        {isValid
          ? 'All required fields completed · Ready to provision'
          : `${completedCount} of ${total} configuration steps complete`}
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
          disabled
          title="Saving drafts requires MOD-004's organization endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Create Organization
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Organization Information ----------------------------- */
function OrganizationInformation({ form, setField, showError, markTouched, errors, onCodeEdit }) {
  return (
    <Section title="Organization Information" description="Core identity for the new organization.">
      <Field id="field-name" label="Organization Name" required error={showError('name') ? errors.name : null}>
        {(db) => (
          <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="Acme Data Corporation" autoComplete="organization" />
        )}
      </Field>
      <Field id="field-code" label="Organization Code" required error={showError('code') ? errors.code : null} hint="Auto-generated from the name — edit to override.">
        {(db) => (
          <TextInput id="field-code" required value={form.code} onChange={(v) => { onCodeEdit(); setField('code', v.toUpperCase()); }} onBlur={() => markTouched('code')} invalid={showError('code')} describedBy={db} placeholder="ACME-DATA-CORP" />
        )}
      </Field>
      <Field id="field-displayName" label="Display Name" hint="Shown in the UI — defaults to the organization name.">
        {(db) => (
          <TextInput id="field-displayName" value={form.displayName} onChange={(v) => setField('displayName', v)} describedBy={db} placeholder="Acme" />
        )}
      </Field>
      <Field id="field-industry" label="Industry">
        {(db) => (
          <SelectInput id="field-industry" value={form.industry} onChange={(v) => setField('industry', v)} describedBy={db} options={ORG_FORM_OPTIONS.industry} placeholder="Select industry…" />
        )}
      </Field>
      <Field id="field-organizationType" label="Organization Type" required error={showError('organizationType') ? errors.organizationType : null}>
        {(db) => (
          <SelectInput id="field-organizationType" required value={form.organizationType} onChange={(v) => setField('organizationType', v)} onBlur={() => markTouched('organizationType')} invalid={showError('organizationType')} describedBy={db} options={ORG_FORM_OPTIONS.organizationType} placeholder="Select type…" />
        )}
      </Field>
      <Field id="field-description" label="Description" className="sm:col-span-2">
        {(db) => (
          <textarea id="field-description" value={form.description} onChange={(e) => setField('description', e.target.value)} aria-describedby={db} rows={3} placeholder="Brief description of the organization…" className={`${fieldBase} h-auto py-token-2`} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 2: Regional Settings ------------------------------------ */
function RegionalSettings({ form, setField, showError, markTouched, errors }) {
  return (
    <Section title="Regional Settings" description="Where the organization's data lives and how it's localized.">
      <Field id="field-country" label="Country" required error={showError('country') ? errors.country : null}>
        {(db) => (
          <SelectInput id="field-country" required value={form.country} onChange={(v) => setField('country', v)} onBlur={() => markTouched('country')} invalid={showError('country')} describedBy={db} options={ORG_FORM_OPTIONS.country} placeholder="Select country…" />
        )}
      </Field>
      <Field id="field-region" label="Region / Data Center">
        {(db) => (
          <SelectInput id="field-region" value={form.region} onChange={(v) => setField('region', v)} describedBy={db} options={ORG_FORM_OPTIONS.region} />
        )}
      </Field>
      <Field id="field-timeZone" label="Time Zone" required error={showError('timeZone') ? errors.timeZone : null}>
        {(db) => (
          <SelectInput id="field-timeZone" required value={form.timeZone} onChange={(v) => setField('timeZone', v)} onBlur={() => markTouched('timeZone')} invalid={showError('timeZone')} describedBy={db} options={ORG_FORM_OPTIONS.timeZone} placeholder="Select time zone…" />
        )}
      </Field>
      <Field id="field-language" label="Default Language">
        {(db) => (
          <SelectInput id="field-language" value={form.language} onChange={(v) => setField('language', v)} describedBy={db} options={ORG_FORM_OPTIONS.language} />
        )}
      </Field>
      <Field id="field-dateFormat" label="Date Format">
        {(db) => (
          <SelectInput id="field-dateFormat" value={form.dateFormat} onChange={(v) => setField('dateFormat', v)} describedBy={db} options={ORG_FORM_OPTIONS.dateFormat} />
        )}
      </Field>
      <Field id="field-currency" label="Currency">
        {(db) => (
          <SelectInput id="field-currency" value={form.currency} onChange={(v) => setField('currency', v)} describedBy={db} options={ORG_FORM_OPTIONS.currency} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 3: Primary Administrator -------------------------------- */
function PrimaryAdministrator({ form, setField, showError, markTouched, errors }) {
  return (
    <Section title="Primary Administrator" description="The first admin invited to the organization.">
      <Field id="field-adminFirstName" label="First Name" required error={showError('adminFirstName') ? errors.adminFirstName : null}>
        {(db) => (
          <TextInput id="field-adminFirstName" required value={form.adminFirstName} onChange={(v) => setField('adminFirstName', v)} onBlur={() => markTouched('adminFirstName')} invalid={showError('adminFirstName')} describedBy={db} autoComplete="given-name" />
        )}
      </Field>
      <Field id="field-adminLastName" label="Last Name" required error={showError('adminLastName') ? errors.adminLastName : null}>
        {(db) => (
          <TextInput id="field-adminLastName" required value={form.adminLastName} onChange={(v) => setField('adminLastName', v)} onBlur={() => markTouched('adminLastName')} invalid={showError('adminLastName')} describedBy={db} autoComplete="family-name" />
        )}
      </Field>
      <Field id="field-adminEmail" label="Work Email" required error={showError('adminEmail') ? errors.adminEmail : null}>
        {(db) => (
          <TextInput id="field-adminEmail" required type="email" value={form.adminEmail} onChange={(v) => setField('adminEmail', v)} onBlur={() => markTouched('adminEmail')} invalid={showError('adminEmail')} describedBy={db} placeholder="admin@acme.com" autoComplete="email" />
        )}
      </Field>
      <Field id="field-adminPhone" label="Phone Number">
        {(db) => (
          <TextInput id="field-adminPhone" type="tel" value={form.adminPhone} onChange={(v) => setField('adminPhone', v)} describedBy={db} placeholder="+1 (555) 000-0000" autoComplete="tel" />
        )}
      </Field>
      <Field id="field-adminJobTitle" label="Job Title">
        {(db) => (
          <TextInput id="field-adminJobTitle" value={form.adminJobTitle} onChange={(v) => setField('adminJobTitle', v)} describedBy={db} placeholder="Head of Data Platform" autoComplete="organization-title" />
        )}
      </Field>
      <Field id="field-initialRole" label="Initial Role" required hint="An activation email is sent to the administrator on creation.">
        {(db) => (
          <SelectInput id="field-initialRole" value={form.initialRole} onChange={(v) => setField('initialRole', v)} describedBy={db} options={ORG_FORM_OPTIONS.initialRole} />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 4: Subscription & Licensing ----------------------------- */
function SubscriptionLicensing({ form, setField, showError, markTouched, errors, plan }) {
  return (
    <Section title="Subscription & Licensing" description="Choose a plan and set seat and storage limits.">
      <Field id="field-plan" label="Subscription Plan" required error={showError('plan') ? errors.plan : null}>
        {(db) => (
          <SelectInput id="field-plan" required value={form.plan} onChange={(v) => setField('plan', v)} onBlur={() => markTouched('plan')} invalid={showError('plan')} describedBy={db} options={SUBSCRIPTION_PLANS} />
        )}
      </Field>
      <Field id="field-billingModel" label="Billing Model">
        {(db) => (
          <SelectInput id="field-billingModel" value={form.billingModel} onChange={(v) => setField('billingModel', v)} describedBy={db} options={ORG_FORM_OPTIONS.billingModel} />
        )}
      </Field>
      <Field id="field-licenseLimit" label="License Limit (seats)" required error={showError('licenseLimit') ? errors.licenseLimit : null}>
        {(db) => (
          <TextInput id="field-licenseLimit" required type="number" min="1" value={form.licenseLimit} onChange={(v) => setField('licenseLimit', v)} onBlur={() => markTouched('licenseLimit')} invalid={showError('licenseLimit')} describedBy={db} />
        )}
      </Field>
      <Field id="field-storage" label="Storage Allocation">
        {(db) => (
          <TextInput id="field-storage" value={form.storage} onChange={(v) => setField('storage', v)} describedBy={db} />
        )}
      </Field>
      <Field id="field-expirationDate" label="Expiration Date" hint="Leave blank for an open-ended subscription.">
        {(db) => (
          <TextInput id="field-expirationDate" type="date" value={form.expirationDate} onChange={(v) => setField('expirationDate', v)} describedBy={db} />
        )}
      </Field>
      <div className="flex flex-col justify-end">
        <label className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
          <input type="checkbox" checked={form.trialPeriod} onChange={(e) => setField('trialPeriod', e.target.checked)} className="h-3.5 w-3.5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
          Start with a trial period
        </label>
      </div>
      <div className="sm:col-span-2 rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <div className="flex flex-wrap items-center gap-token-4">
          <span className="rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-xs font-semibold text-primary">{form.plan}</span>
          <span className="text-token-xs text-text-faint">{plan.userLimit}</span>
          <span className="text-token-xs text-text-faint">{plan.storage} storage</span>
          <span className="text-token-xs text-text-faint">{plan.support} support</span>
        </div>
        <ul className="mt-token-3 grid grid-cols-1 gap-token-1 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-token-2 text-token-xs text-text-secondary-alt">
              <IconCheck className="h-3 w-3 shrink-0 text-success" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---- Section 5: Security Configuration ------------------------------- */
function SecurityConfiguration({ form, setField }) {
  return (
    <Section title="Security Configuration" description="Authentication and access controls for the organization.">
      <div className="sm:col-span-2 flex flex-col gap-token-3">
        <Toggle id="field-requireMfa" checked={form.requireMfa} onChange={(v) => setField('requireMfa', v)} label="Require multi-factor authentication" description="All members must set up MFA before accessing the platform." />
        <Toggle id="field-enableSso" checked={form.enableSso} onChange={(v) => setField('enableSso', v)} label="Enable single sign-on (SSO)" description="Allow members to authenticate through your identity provider." />
      </div>
      <Field id="field-passwordPolicy" label="Password Policy">
        {(db) => (
          <SelectInput id="field-passwordPolicy" value={form.passwordPolicy} onChange={(v) => setField('passwordPolicy', v)} describedBy={db} options={ORG_FORM_OPTIONS.passwordPolicy} />
        )}
      </Field>
      <Field id="field-sessionTimeout" label="Session Timeout">
        {(db) => (
          <SelectInput id="field-sessionTimeout" value={form.sessionTimeout} onChange={(v) => setField('sessionTimeout', v)} describedBy={db} options={ORG_FORM_OPTIONS.sessionTimeout} />
        )}
      </Field>
      <fieldset className="sm:col-span-2 m-0 flex flex-col gap-token-2 border-0 p-0">
        <legend className="p-0 text-token-sm font-medium text-text-secondary-alt">API Access</legend>
        <div className="flex flex-wrap gap-token-4">
          {ORG_FORM_OPTIONS.apiAccess.map((opt) => (
            <label key={opt} className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
              <input type="radio" name="apiAccess" value={opt} checked={form.apiAccess === opt} onChange={() => setField('apiAccess', opt)} className="h-3.5 w-3.5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="field-ipRestrictions" label="IP Restrictions" className="sm:col-span-2" hint="Optional — comma-separated CIDR ranges, e.g. 203.0.113.0/24.">
        {(db) => (
          <TextInput id="field-ipRestrictions" value={form.ipRestrictions} onChange={(v) => setField('ipRestrictions', v)} describedBy={db} placeholder="203.0.113.0/24, 198.51.100.0/24" />
        )}
      </Field>
    </Section>
  );
}

/* ---- Section 6: Default Platform Configuration ----------------------- */
function PlatformConfiguration({ form, setField, showError, markTouched, errors }) {
  return (
    <Section title="Default Platform Configuration" description="Defaults applied to new pipelines and connectors.">
      <Field id="field-defaultEnvironment" label="Default Environment" required error={showError('defaultEnvironment') ? errors.defaultEnvironment : null}>
        {(db) => (
          <SelectInput id="field-defaultEnvironment" required value={form.defaultEnvironment} onChange={(v) => setField('defaultEnvironment', v)} onBlur={() => markTouched('defaultEnvironment')} invalid={showError('defaultEnvironment')} describedBy={db} options={ORG_FORM_OPTIONS.defaultEnvironment} />
        )}
      </Field>
      <Field id="field-dataRetention" label="Data Retention Policy">
        {(db) => (
          <SelectInput id="field-dataRetention" value={form.dataRetention} onChange={(v) => setField('dataRetention', v)} describedBy={db} options={ORG_FORM_OPTIONS.dataRetention} />
        )}
      </Field>
      <Field id="field-notificationPreferences" label="Notification Preferences">
        {(db) => (
          <SelectInput id="field-notificationPreferences" value={form.notificationPreferences} onChange={(v) => setField('notificationPreferences', v)} describedBy={db} options={ORG_FORM_OPTIONS.notificationPreferences} />
        )}
      </Field>
      <Field id="field-connectorPermissions" label="Default Connector Permissions">
        {(db) => (
          <SelectInput id="field-connectorPermissions" value={form.connectorPermissions} onChange={(v) => setField('connectorPermissions', v)} describedBy={db} options={ORG_FORM_OPTIONS.connectorPermissions} />
        )}
      </Field>
      <div className="sm:col-span-2">
        <Toggle id="field-auditLogging" checked={form.auditLogging} onChange={(v) => setField('auditLogging', v)} label="Enable audit logging" description="Record administrative and data-access events for compliance." />
      </div>
    </Section>
  );
}

/* ---- Sidebar: live Organization Summary ------------------------------ */
function OrganizationSummary({ form, plan }) {
  const rows = [
    { label: 'Organization', value: form.name || '—' },
    { label: 'Code', value: form.code || '—' },
    { label: 'Type', value: form.organizationType || '—' },
    { label: 'Region', value: form.region },
    { label: 'Administrator', value: [form.adminFirstName, form.adminLastName].filter(Boolean).join(' ') || '—' },
    { label: 'Admin email', value: form.adminEmail || '—' },
    { label: 'Plan', value: form.plan },
    { label: 'Licenses', value: form.licenseLimit ? `${form.licenseLimit} seats` : '—' },
    { label: 'Storage', value: form.storage || plan.storage },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Organization Summary</h2>
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
      <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={total} aria-label="Configuration completeness">
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

/* ---- Sidebar: Security Checklist ------------------------------------- */
function SecurityChecklist({ form }) {
  const items = [
    { label: 'Multi-factor authentication', done: form.requireMfa },
    { label: 'Single sign-on (SSO)', done: form.enableSso },
    { label: 'Strong password policy', done: form.passwordPolicy.startsWith('Strong') },
    { label: 'Audit logging enabled', done: form.auditLogging },
    { label: 'IP restrictions configured', done: !!form.ipRestrictions.trim() },
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

/* ---- Sidebar: Quick Help --------------------------------------------- */
function QuickHelp() {
  const tips = [
    'The organization code is auto-generated from the name but can be overridden.',
    'The primary administrator receives an activation email on creation.',
    'Region and data center cannot be changed after provisioning.',
    'Seat and storage limits follow the selected plan but can be adjusted.',
    'Enable MFA and audit logging for compliance-sensitive organizations.',
  ];
  return (
    <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Quick Help</h2>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-token-2 text-token-xs text-text-secondary-alt">
            <IconInfo className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Confirm Organization Creation dialog (node 92:1477) ------------- */
function ConfirmDialog({ form, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  // Capture the element that had focus before the dialog opened so it can
  // be restored on close (mirrors UserProfileMenu's focus-management).
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => {
    cancelRef.current?.focus();

    function getFocusable() {
      return dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
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
      // Restore focus to the button that opened the dialog.
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [onCancel]);

  const rows = [
    { label: 'Organization', value: form.name },
    { label: 'Administrator', value: `${form.adminFirstName} ${form.adminLastName} · ${form.adminEmail}` },
    { label: 'Subscription Plan', value: form.plan },
    { label: 'License Count', value: `${form.licenseLimit} seats` },
    { label: 'Region', value: form.region },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <h2 id="confirm-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Organization Creation</h2>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the details below before provisioning the organization.</p>
        <dl className="mt-token-5 flex flex-col gap-token-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
              <dt className="text-token-xs text-text-faint">{row.label}</dt>
              <dd className="m-0 max-w-[60%] text-right text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="m-0 mt-token-4 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-xs text-primary">
          Provisioning takes a few moments. The administrator will receive an activation email once complete.
        </p>
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
            {submitting ? 'Creating…' : 'Create Organization'}
          </button>
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

function IconSpinner() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 2a6 6 0 1 0 6 6" />
    </svg>
  );
}
