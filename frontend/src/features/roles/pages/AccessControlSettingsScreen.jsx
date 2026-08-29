import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useAccessControlSettings } from '../hooks/useAccessControlSettings';
import {
  ACCESS_CONTROL_OPTIONS,
  AUTH_PROVIDERS,
  MFA_FACTORS,
  COMPLEXITY_REQUIREMENTS,
  COUNTRY_OPTIONS,
  updateAccessControlSettings,
} from '../services/accessControlSettings.api';

/* MOD-003 (RBAC) has no backend deployed, so — like the Organization
   Settings screen — the org id is the `'current'` placeholder a real
   authenticated session would resolve. */
const ORG_ID = 'current';

/* Field styling — mirrors CreateRoleScreen / OrganizationSettingsScreen so
   the RBAC + settings forms stay visually consistent without coupling. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

/* Editable keys tracked for dirty-state + Save-confirmation diff.
   Grouped by section; order drives the Pending Changes list. Nested maps
   (providers, factors) are diffed per sub-key with the `group.sub` syntax
   below via PROVIDER_KEYS / FACTOR_KEYS + the country list handled apart. */
const EDITABLE_KEYS = [
  // Authentication
  'defaultAuthMethod', 'authPriority', 'maxLoginAttempts', 'lockoutDuration', 'loginAttemptWindow',
  // MFA
  'mfaAllUsers', 'mfaAdministrators', 'mfaPrivilegedRoles', 'mfaTrustedDevices', 'mfaBackupCodes',
  'mfaGracePeriod', 'rememberTrustedDevice',
  // Password
  'passwordMinLength', 'passwordMaxAge', 'passwordHistory', 'passwordLockoutThreshold',
  'passwordLockoutDuration', 'resetTokenExpiry',
  'reqUppercase', 'reqLowercase', 'reqNumbers', 'reqSpecial', 'reqNoUsername', 'reqNoDictionary',
  // Session
  'sessionTimeout', 'idleTimeout', 'maxConcurrentSessions', 'sessionRenewal',
  'forceLogoutOnPasswordChange', 'rememberMe', 'revokeOnSuspicious',
  // Network
  'vpnDetection', 'proxyTorDetection',
  // Access Restrictions
  'businessHoursAccess', 'deviceRestriction', 'apiAccessRestriction', 'remoteAccess',
  'departmentRestrictions', 'geoRestriction', 'maintenanceModeAccess',
  // Privileged Access
  'jitAccess', 'privilegedApproval', 'elevatedApprovalWorkflow', 'breakGlassAccess',
  'jitMaxDuration', 'adminSessionTimeout', 'approvalExpiry', 'privilegedApprovalBy',
  // API / Token
  'apiTokenExpiration', 'tokenRotationPeriod', 'maxTokensPerUser', 'allowPersonalTokens',
  'allowServiceTokens', 'enforceTokenRotation', 'revokeTokensOnPasswordChange',
  'restrictOAuthClients', 'serviceTokenMaxExpiry', 'oauthClientTokenLifetime',
];

const PROVIDER_KEYS = AUTH_PROVIDERS.map((p) => p.id);
const FACTOR_KEYS = MFA_FACTORS.map((f) => f.id);

/* Human labels for the Pending Changes / confirmation diff. */
const CHANGE_LABELS = {
  defaultAuthMethod: 'Default Authentication Method',
  authPriority: 'Authentication Priority',
  maxLoginAttempts: 'Max Login Attempts',
  lockoutDuration: 'Lockout Duration',
  loginAttemptWindow: 'Login Attempt Window',
  mfaAllUsers: 'Require MFA for All Users',
  mfaAdministrators: 'Require MFA for Administrators',
  mfaPrivilegedRoles: 'Require MFA for Privileged Roles',
  mfaTrustedDevices: 'Allow Trusted Devices',
  mfaBackupCodes: 'Backup Codes',
  mfaGracePeriod: 'MFA Enrollment Grace Period',
  rememberTrustedDevice: 'Remember Trusted Device',
  passwordMinLength: 'Minimum Length',
  passwordMaxAge: 'Maximum Password Age',
  passwordHistory: 'Password History',
  passwordLockoutThreshold: 'Password Lockout Threshold',
  passwordLockoutDuration: 'Password Lockout Duration',
  resetTokenExpiry: 'Reset Token Expiry',
  reqUppercase: 'Require Uppercase',
  reqLowercase: 'Require Lowercase',
  reqNumbers: 'Require Numbers',
  reqSpecial: 'Require Special Characters',
  reqNoUsername: 'Disallow Username in Password',
  reqNoDictionary: 'Disallow Dictionary Words',
  sessionTimeout: 'Session Timeout',
  idleTimeout: 'Idle Timeout',
  maxConcurrentSessions: 'Max Concurrent Sessions',
  sessionRenewal: 'Session Renewal on Activity',
  forceLogoutOnPasswordChange: 'Force Logout After Password Change',
  rememberMe: 'Remember Me',
  revokeOnSuspicious: 'Revoke Sessions on Suspicious Activity',
  vpnDetection: 'VPN Detection Policy',
  proxyTorDetection: 'Proxy / Tor Detection',
  businessHoursAccess: 'Business Hours Access Control',
  deviceRestriction: 'Device Restriction Policy',
  apiAccessRestriction: 'API Access Restriction',
  remoteAccess: 'Remote Access Policy',
  departmentRestrictions: 'Enforce Department-Level Restrictions',
  geoRestriction: 'Geographic Restriction Enforcement',
  maintenanceModeAccess: 'Maintenance Mode Access Control',
  jitAccess: 'Just-In-Time (JIT) Access',
  privilegedApproval: 'Privileged Session Approval Required',
  elevatedApprovalWorkflow: 'Elevated Access Approval Workflow',
  breakGlassAccess: 'Break Glass Emergency Access',
  jitMaxDuration: 'JIT Access Max Duration',
  adminSessionTimeout: 'Admin Session Timeout',
  approvalExpiry: 'Approval Request Expiry',
  privilegedApprovalBy: 'Privileged Session Approval By',
  apiTokenExpiration: 'API Token Expiration',
  tokenRotationPeriod: 'Token Rotation Period',
  maxTokensPerUser: 'Max Tokens Per User',
  allowPersonalTokens: 'Allow Personal Access Tokens',
  allowServiceTokens: 'Allow Service Account Tokens',
  enforceTokenRotation: 'Enforce Token Rotation Policy',
  revokeTokensOnPasswordChange: 'Revoke Tokens on Password Change',
  restrictOAuthClients: 'Restrict OAuth Clients to Trusted Apps',
  serviceTokenMaxExpiry: 'Service Account Token Max Expiry',
  oauthClientTokenLifetime: 'OAuth Client Token Lifetime',
};

/* Keys rendered as on/off toggles — formatted "On"/"Off" in the diff. */
const BOOLEAN_KEYS = new Set([
  'mfaAllUsers', 'mfaAdministrators', 'mfaPrivilegedRoles', 'mfaTrustedDevices', 'mfaBackupCodes',
  'reqUppercase', 'reqLowercase', 'reqNumbers', 'reqSpecial', 'reqNoUsername', 'reqNoDictionary',
  'sessionRenewal', 'forceLogoutOnPasswordChange', 'rememberMe', 'revokeOnSuspicious',
  'businessHoursAccess', 'departmentRestrictions', 'geoRestriction', 'maintenanceModeAccess',
  'jitAccess', 'privilegedApproval', 'elevatedApprovalWorkflow', 'breakGlassAccess',
  'allowPersonalTokens', 'allowServiceTokens', 'enforceTokenRotation',
  'revokeTokensOnPasswordChange', 'restrictOAuthClients',
]);

/* Numeric fields with min/max bounds (drives validation + the diff format). */
const NUMBER_FIELDS = {
  maxLoginAttempts: { min: 1, max: 20, unit: 'attempts' },
  lockoutDuration: { min: 1, max: 1440, unit: 'minutes' },
  loginAttemptWindow: { min: 1, max: 1440, unit: 'minutes' },
  passwordMinLength: { min: 8, max: 128, unit: 'characters' },
  passwordMaxAge: { min: 0, max: 365, unit: 'days' },
  passwordHistory: { min: 0, max: 24, unit: 'previous' },
  passwordLockoutThreshold: { min: 1, max: 20, unit: 'attempts' },
  passwordLockoutDuration: { min: 1, max: 1440, unit: 'minutes' },
  resetTokenExpiry: { min: 5, max: 1440, unit: 'minutes' },
  maxConcurrentSessions: { min: 0, max: 100, unit: 'sessions' },
  apiTokenExpiration: { min: 1, max: 365, unit: 'days' },
  tokenRotationPeriod: { min: 1, max: 365, unit: 'days' },
  maxTokensPerUser: { min: 1, max: 100, unit: 'tokens' },
  serviceTokenMaxExpiry: { min: 1, max: 730, unit: 'days' },
  oauthClientTokenLifetime: { min: 5, max: 1440, unit: 'minutes' },
};

function displayValue(key, value) {
  if (BOOLEAN_KEYS.has(key)) return value ? 'On' : 'Off';
  if (NUMBER_FIELDS[key]) return `${value} ${NUMBER_FIELDS[key].unit}`;
  const str = String(value ?? '').trim();
  return str || '—';
}

/* Password policy strength derived from complexity requirements + length. */
function passwordStrength(form) {
  const checks = [
    form.reqUppercase, form.reqLowercase, form.reqNumbers, form.reqSpecial,
    form.reqNoUsername, form.reqNoDictionary,
  ].filter(Boolean).length;
  const longEnough = Number(form.passwordMinLength) >= 12;
  if (checks >= 6 && longEnough) return 'Very Strong';
  if (checks >= 5 && longEnough) return 'Strong';
  if (checks >= 3) return 'Moderate';
  return 'Basic';
}

/* Validation — numeric bounds + at least one auth provider / MFA factor. */
function validate(form) {
  const errors = {};
  for (const [key, cfg] of Object.entries(NUMBER_FIELDS)) {
    const n = Number(form[key]);
    if (form[key] === '' || Number.isNaN(n)) {
      errors[key] = 'Enter a number.';
    } else if (n < cfg.min || n > cfg.max) {
      errors[key] = `Must be between ${cfg.min} and ${cfg.max}.`;
    }
  }
  if (!PROVIDER_KEYS.some((k) => form.providers[k])) {
    errors.providers = 'At least one authentication provider must be enabled.';
  }
  if (!FACTOR_KEYS.some((k) => form.factors[k])) {
    errors.factors = 'At least one MFA factor must be allowed.';
  }
  if (form.allowedCountries.length === 0 && form.geoRestriction) {
    errors.allowedCountries = 'Add at least one allowed country while geographic restriction is on.';
  }
  return errors;
}

/* The 6 Validation Status items from the Figma sidebar (5/6 in design). */
function computeChecklist(form, errors) {
  const numOk = (keys) => keys.every((k) => !errors[k]);
  return [
    { key: 'auth', label: 'Authentication Configured', done: PROVIDER_KEYS.some((k) => form.providers[k]) && numOk(['maxLoginAttempts', 'lockoutDuration', 'loginAttemptWindow']) },
    { key: 'mfa', label: 'MFA Policy Valid', done: FACTOR_KEYS.some((k) => form.factors[k]) && (form.mfaAllUsers || form.mfaAdministrators || form.mfaPrivilegedRoles) },
    { key: 'password', label: 'Password Policy Valid', done: numOk(['passwordMinLength', 'passwordMaxAge', 'passwordHistory']) && Number(form.passwordMinLength) >= 12 },
    { key: 'session', label: 'Session Policy Valid', done: numOk(['maxConcurrentSessions']) && !!form.sessionTimeout && !!form.idleTimeout },
    { key: 'network', label: 'Network Restrictions Valid', done: !errors.allowedCountries },
    { key: 'token', label: 'API Token Policy Valid', done: numOk(['apiTokenExpiration', 'tokenRotationPeriod', 'maxTokensPerUser']) && form.enforceTokenRotation },
  ];
}

/* Security-impact severity derived live from the pending changes. */
function computeImpact(changes) {
  if (changes.length === 0) return null;
  const keys = new Set(changes.map((c) => c.key));
  const highImpact = ['mfaAllUsers', 'defaultAuthMethod', 'apiAccessRestriction', 'breakGlassAccess', 'remoteAccess'];
  const level = highImpact.some((k) => keys.has(k)) ? (keys.size > 3 ? 'High' : 'Medium') : keys.size > 4 ? 'Medium' : 'Low';
  return level;
}

/** SCR-044 — Access Control Settings Screen. Node 114:25163, Figma page "Page 1". */
export default function AccessControlSettingsScreen() {
  const { data, isLoading, isError, error, refetch } = useAccessControlSettings(ORG_ID);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Security', 'Access Control']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading access-control settings' : isError ? 'Couldn’t load access-control settings' : ''}
        </span>

        {isLoading && (
          <>
            <BackLink />
            <SettingsSkeleton />
          </>
        )}

        {isError && (
          <>
            <BackLink />
            <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
              <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load access-control settings</p>
              <p className="m-0 mt-token-1 text-token-sm text-danger">{error?.message ?? 'Something went wrong. Please try again.'}</p>
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

        {data && <SettingsForm key={data.id} baseline={data} />}
      </div>
    </AppShell>
  );
}

/* Plain back link for loading/error states (no dirty form yet). */
function BackLink() {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to="/roles"
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to Roles
      </Link>
    </div>
  );
}

/* Editable form is keyed on the loaded record so a fresh load remounts it
   with a clean baseline (no stale dirty state). */
function SettingsForm({ baseline }) {
  const navigate = useNavigate();
  // `saved` is the working saved snapshot the form diffs against; there is
  // no live MOD-003 endpoint to refetch from, so after a (real or
  // simulated) save the edits are folded into it and the form settles clean.
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

  // Live dirty tracking + Pending Changes computed against the saved snapshot.
  const changes = useMemo(() => {
    const list = [];
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    for (const key of EDITABLE_KEYS) {
      if (norm(saved[key]) !== norm(form[key])) {
        list.push({ key, label: CHANGE_LABELS[key] ?? key, before: displayValue(key, saved[key]), after: displayValue(key, form[key]) });
      }
    }
    // Nested provider / factor maps.
    for (const k of PROVIDER_KEYS) {
      if (saved.providers[k] !== form.providers[k]) {
        const label = AUTH_PROVIDERS.find((p) => p.id === k)?.label ?? k;
        list.push({ key: `providers.${k}`, label: `Provider — ${label}`, before: saved.providers[k] ? 'Enabled' : 'Disabled', after: form.providers[k] ? 'Enabled' : 'Disabled' });
      }
    }
    for (const k of FACTOR_KEYS) {
      if (saved.factors[k] !== form.factors[k]) {
        const label = MFA_FACTORS.find((f) => f.id === k)?.label ?? k;
        list.push({ key: `factors.${k}`, label: `MFA Factor — ${label}`, before: saved.factors[k] ? 'Allowed' : 'Blocked', after: form.factors[k] ? 'Allowed' : 'Blocked' });
      }
    }
    // Allowed countries (order-insensitive set diff).
    const savedC = [...saved.allowedCountries].sort().join(',');
    const formC = [...form.allowedCountries].sort().join(',');
    if (savedC !== formC) {
      list.push({ key: 'allowedCountries', label: 'Allowed Countries', before: `${saved.allowedCountries.length} countries`, after: `${form.allowedCountries.length} countries` });
    }
    return list;
  }, [form, saved]);
  const dirty = changes.length > 0;
  const impact = useMemo(() => computeImpact(changes), [changes]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitState.status !== 'idle' && submitState.status !== 'submitting') setSubmitState({ status: 'idle', message: '' });
  }
  function setProvider(k, v) { setForm((prev) => ({ ...prev, providers: { ...prev.providers, [k]: v } })); }
  function setFactor(k, v) { setForm((prev) => ({ ...prev, factors: { ...prev.factors, [k]: v } })); }
  function toggleCountry(c) {
    setForm((prev) => ({
      ...prev,
      allowedCountries: prev.allowedCountries.includes(c)
        ? prev.allowedCountries.filter((x) => x !== c)
        : [...prev.allowedCountries, c],
    }));
  }
  function markTouched(key) { setTouched((prev) => ({ ...prev, [key]: true })); }
  function showError(key) { return (submitAttempted || touched[key]) && !!errors[key]; }
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
    function warn(e) { e.preventDefault(); e.returnValue = ''; }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Guarded in-app navigation: confirm discard while dirty.
  function guardedNavigate(to) {
    if (dirty && typeof window !== 'undefined') {
      const ok = window.confirm('Discard unsaved changes and leave this page?');
      if (!ok) return;
    }
    navigate(to);
  }

  function handleCancel() { guardedNavigate('/roles'); }

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
    const payload = {};
    for (const c of changes) {
      if (c.key.startsWith('providers.') || c.key.startsWith('factors.')) continue;
      if (c.key === 'allowedCountries') { payload.allowedCountries = form.allowedCountries; continue; }
      payload[c.key] = form[c.key];
    }
    payload.providers = form.providers;
    payload.factors = form.factors;
    const result = await updateAccessControlSettings(ORG_ID, payload);
    setConfirmOpen(false);
    setSaved(form);
    setTouched({});
    setSubmitAttempted(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-003 (RBAC & Permissions) has no security-policy endpoint yet, so nothing was persisted server-side. In a live environment these changes would be saved to this organization’s access-control configuration.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Access-control settings saved.' });
    }
  }

  const shared = { form, saved, errors, setField, markTouched, showError, isModified };

  return (
    <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
      <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
        <button
          type="button"
          onClick={() => guardedNavigate('/roles')}
          className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Back to Roles
        </button>
      </div>

      <Header baseline={baseline} dirty={dirty} changeCount={changes.length} isValid={isValid} onCancel={handleCancel} onReset={handleReset} />

      <span className="sr-only" role="status" aria-live="polite">
        {submitState.status === 'submitting'
          ? 'Saving access-control settings'
          : submitState.status === 'mocked'
            ? 'Save simulated — no backend available'
            : submitState.status === 'success'
              ? 'Access-control settings saved'
              : dirty
                ? `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}`
                : 'No unsaved changes'}
      </span>

      {baseline.mocked && submitState.status === 'idle' && (
        <div className="flex items-start gap-token-2 rounded-md border border-warning bg-warning-bg px-token-5 py-token-3" role="note">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-xs text-text-secondary-alt">
            MOD-003 (RBAC &amp; Permissions) has no backend deployed yet, so these are sample security policies — not a live configuration. Saving is simulated.
          </p>
        </div>
      )}
      {submitState.status === 'mocked' && (
        <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
          <p className="m-0 text-token-base font-semibold text-warning">Simulated save (no backend)</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
        </div>
      )}
      {submitState.status === 'success' && (
        <div className="rounded-md border border-success bg-success-bg p-token-5" role="status">
          <p className="m-0 text-token-base font-semibold text-success-strong">Access-control settings saved</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Your security-policy changes have been applied to this organization.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <AuthenticationPolicies {...shared} setProvider={setProvider} />
          <MfaPolicies {...shared} setFactor={setFactor} totalUsers={baseline.totalUsers} />
          <PasswordPolicy {...shared} />
          <SessionManagement {...shared} />
          <NetworkRestrictions {...shared} baseline={baseline} toggleCountry={toggleCountry} />
          <AccessRestrictions {...shared} />
          <PrivilegedAccess {...shared} emergencyAccounts={baseline.emergencyAccounts} />
          <ApiTokenPolicies {...shared} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <SecurityOverview score={baseline.securityScore} form={form} />
          <ActivePolicySummary form={form} />
          <ValidationStatus checklist={checklist} completedCount={completedCount} />
          <ComplianceRequirements form={form} />
          <SecurityImpactCard impact={impact} changes={changes} totalUsers={baseline.totalUsers} form={form} saved={saved} />
          <PendingChanges changes={changes} />
        </aside>
      </div>

      <ActionBar baseline={baseline} dirty={dirty} changeCount={changes.length} isValid={isValid} onCancel={handleCancel} onReset={handleReset} />

      {confirmOpen && (
        <ConfirmDialog
          changes={changes}
          impact={impact}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </form>
  );
}

/* ---- Inline icons (stroke uses currentColor) ---------------------------- */
function IconInfo({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShieldLock({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l6 2.5v4.5c0 4-2.8 7-6 8.5-3.2-1.5-6-4.5-6-8.5V4.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="7.5" y="9" width="5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.8 9V7.8a1.2 1.2 0 012.4 0V9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function IconWarning({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3l7.5 13H2.5L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  );
}
function IconX({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---- Layout primitives -------------------------------------------------- */

/* A titled policy section card. */
function Section({ icon, title, description, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface-card">
      <div className="flex items-start gap-token-3 border-b border-border-subtle px-token-6 py-token-4">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-token-5 px-token-6 py-token-5">{children}</div>
    </section>
  );
}

/* Amber "Modified" badge shown next to a field whose value differs from saved. */
function ModifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-token-xs font-medium text-warning">
      <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
      Modified
    </span>
  );
}

/* Labelled field wrapper with modified badge + inline error slot. */
function Field({ id, label, hint, modified, error, children }) {
  return (
    <div className="flex flex-col gap-token-1">
      <div className="flex items-center justify-between gap-token-2">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
        {modified && <ModifiedBadge />}
      </div>
      {children}
      {hint && !error && <p className="m-0 text-token-xs text-text-faint">{hint}</p>}
      {error && <p className="m-0 text-token-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}

/* Two-column responsive grid for grouping fields inside a section. */
function FieldGrid({ children }) {
  return <div className="grid grid-cols-1 gap-token-5 sm:grid-cols-2">{children}</div>;
}

/* Select bound to a shared-form key. */
function SelectField({ shared, keyName, label, options, hint }) {
  const { form, errors, setField, markTouched, showError, isModified } = shared;
  const invalid = showError(keyName);
  return (
    <Field id={`field-${keyName}`} label={label} hint={hint} modified={isModified(keyName)} error={invalid ? errors[keyName] : undefined}>
      <select
        id={`field-${keyName}`}
        value={form[keyName]}
        onChange={(e) => setField(keyName, e.target.value)}
        onBlur={() => markTouched(keyName)}
        className={`${fieldBase} pr-8 ${invalid ? fieldInvalid : ''}`}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

/* Numeric input bound to a shared-form key. */
function NumberField({ shared, keyName, label, hint }) {
  const { form, errors, setField, markTouched, showError, isModified } = shared;
  const cfg = NUMBER_FIELDS[keyName] ?? {};
  const invalid = showError(keyName);
  return (
    <Field id={`field-${keyName}`} label={label} hint={hint ?? (cfg.unit ? `${cfg.min}–${cfg.max} ${cfg.unit}` : undefined)} modified={isModified(keyName)} error={invalid ? errors[keyName] : undefined}>
      <input
        id={`field-${keyName}`}
        type="number"
        inputMode="numeric"
        min={cfg.min}
        max={cfg.max}
        value={form[keyName]}
        onChange={(e) => setField(keyName, e.target.value === '' ? '' : Number(e.target.value))}
        onBlur={() => markTouched(keyName)}
        className={`${fieldBase} ${invalid ? fieldInvalid : ''}`}
      />
    </Field>
  );
}

/* A single on/off toggle row (label + description + switch). */
function Toggle({ label, description, checked, onChange, modified, strength, recommended, notRecommended, disabled }) {
  return (
    <div className="flex items-start justify-between gap-token-4 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-token-2">
          <span className="text-token-sm font-medium text-text-primary-alt">{label}</span>
          {modified && <ModifiedBadge />}
          {strength && <StrengthTag strength={strength} />}
          {recommended && (
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-token-xs font-medium text-warning">Recommended</span>
          )}
          {notRecommended && (
            <span className="rounded-full bg-danger-bg px-2 py-0.5 text-token-xs font-medium text-danger">Not recommended</span>
          )}
        </div>
        {description && <p className="m-0 mt-token-1 text-token-xs text-text-secondary-alt">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-text-on-primary shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

/* MFA-factor strength tag with severity colour. */
function StrengthTag({ strength }) {
  const tone =
    strength === 'Strongest' || strength === 'Very Strong'
      ? 'bg-success-bg text-success-strong'
      : strength === 'Strong'
        ? 'bg-shell-accent-wash text-primary'
        : strength === 'Moderate'
          ? 'bg-warning-bg text-warning'
          : 'bg-danger-bg text-danger';
  return <span className={`rounded-full px-2 py-0.5 text-token-xs font-medium ${tone}`}>{strength}</span>;
}

/* Toggle bound directly to a boolean shared-form key. */
function ToggleField({ shared, keyName, label, description }) {
  const { form, setField, isModified } = shared;
  return (
    <Toggle
      label={label}
      description={description}
      checked={!!form[keyName]}
      onChange={(v) => setField(keyName, v)}
      modified={isModified(keyName)}
    />
  );
}

/* Page header — title, saved metadata, and (mirrored) action buttons. */
function Header({ baseline, dirty, changeCount, isValid, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-4 rounded-lg border border-border bg-surface-card px-token-6 py-token-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-token-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
          <IconShieldLock className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="m-0 text-token-xl font-semibold text-text-primary-alt">Access Control Settings</h1>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
            Organization-wide authentication, MFA, session, network, and privileged-access security policies.
          </p>
          <p className="m-0 mt-token-2 text-token-xs text-text-faint">
            {baseline.organizationName} · {baseline.organizationId} · Last saved {baseline.lastSavedLabel} by {baseline.lastSavedBy}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-token-2">
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!dirty || !isValid}
          className="inline-flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-5 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save Changes{changeCount > 0 ? ` (${changeCount})` : ''}
        </button>
      </div>
    </div>
  );
}

/* Sticky bottom action bar (mirrors header actions, always reachable). */
function ActionBar({ dirty, changeCount, isValid, onCancel, onReset }) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-token-4 rounded-lg border border-border bg-surface-card px-token-6 py-token-4 shadow-sm">
      <p className="m-0 text-token-sm text-text-secondary-alt" aria-live="polite">
        {dirty ? `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}` : 'No unsaved changes'}
        {dirty && !isValid && <span className="ml-token-2 text-danger">· fix validation errors to save</span>}
      </p>
      <div className="flex items-center gap-token-2">
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!dirty || !isValid}
          className="inline-flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-5 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save Changes{changeCount > 0 ? ` (${changeCount})` : ''}
        </button>
      </div>
    </div>
  );
}

/* ---- Policy sections ---------------------------------------------------- */

function AuthenticationPolicies({ setProvider, ...shared }) {
  const { form, errors } = shared;
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Authentication Policies"
      description="Default sign-in method, provider priority, and login lockout thresholds."
    >
      <FieldGrid>
        <SelectField shared={shared} keyName="defaultAuthMethod" label="Default Authentication Method" options={ACCESS_CONTROL_OPTIONS.defaultAuthMethod} />
        <SelectField shared={shared} keyName="authPriority" label="Authentication Priority" options={ACCESS_CONTROL_OPTIONS.authPriority} />
      </FieldGrid>

      <div className="flex flex-col gap-token-2">
        <p className="m-0 text-token-sm font-medium text-text-primary-alt">Allowed Authentication Providers</p>
        {errors.providers && (
          <p className="m-0 text-token-xs text-danger" role="alert">{errors.providers}</p>
        )}
        <div className="flex flex-col gap-token-2">
          {AUTH_PROVIDERS.map((p) => (
            <Toggle
              key={p.id}
              label={p.label}
              description={p.description}
              recommended={p.recommended}
              checked={!!form.providers[p.id]}
              onChange={(v) => setProvider(p.id, v)}
              modified={shared.saved.providers[p.id] !== form.providers[p.id]}
            />
          ))}
        </div>
      </div>

      <FieldGrid>
        <NumberField shared={shared} keyName="maxLoginAttempts" label="Max Login Attempts" />
        <NumberField shared={shared} keyName="lockoutDuration" label="Lockout Duration" />
        <NumberField shared={shared} keyName="loginAttemptWindow" label="Login Attempt Window" />
      </FieldGrid>
    </Section>
  );
}

function MfaPolicies({ setFactor, totalUsers, ...shared }) {
  const { form, errors } = shared;
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Multi-Factor Authentication"
      description={`MFA enforcement and allowed factors across ${totalUsers.toLocaleString()} users.`}
    >
      <div className="flex flex-col gap-token-2">
        <ToggleField shared={shared} keyName="mfaAllUsers" label="Require MFA for All Users" description="Every user must complete multi-factor authentication at sign-in." />
        <ToggleField shared={shared} keyName="mfaAdministrators" label="Require MFA for Administrators" description="Enforce MFA for all administrative roles." />
        <ToggleField shared={shared} keyName="mfaPrivilegedRoles" label="Require MFA for Privileged Roles" description="Enforce MFA for roles with elevated permissions." />
        <ToggleField shared={shared} keyName="mfaTrustedDevices" label="Allow Trusted Devices" description="Let users skip MFA on remembered devices for a limited period." />
        <ToggleField shared={shared} keyName="mfaBackupCodes" label="Backup Codes" description="Allow single-use recovery codes as a fallback factor." />
      </div>

      <div className="flex flex-col gap-token-2">
        <p className="m-0 text-token-sm font-medium text-text-primary-alt">Allowed Authentication Factors</p>
        {errors.factors && <p className="m-0 text-token-xs text-danger" role="alert">{errors.factors}</p>}
        <div className="flex flex-col gap-token-2">
          {MFA_FACTORS.map((f) => (
            <Toggle
              key={f.id}
              label={f.label}
              description={f.description}
              strength={f.strength}
              notRecommended={f.notRecommended}
              checked={!!form.factors[f.id]}
              onChange={(v) => setFactor(f.id, v)}
              modified={shared.saved.factors[f.id] !== form.factors[f.id]}
            />
          ))}
        </div>
      </div>

      <FieldGrid>
        <SelectField shared={shared} keyName="mfaGracePeriod" label="MFA Enrollment Grace Period" options={ACCESS_CONTROL_OPTIONS.mfaGracePeriod} />
        <SelectField shared={shared} keyName="rememberTrustedDevice" label="Remember Trusted Device" options={ACCESS_CONTROL_OPTIONS.rememberTrustedDevice} />
      </FieldGrid>
    </Section>
  );
}

function PasswordPolicy({ ...shared }) {
  const { form, setField } = shared;
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Password Policy"
      description="Length, ageing, history, and complexity requirements."
    >
      <FieldGrid>
        <NumberField shared={shared} keyName="passwordMinLength" label="Minimum Length" />
        <NumberField shared={shared} keyName="passwordMaxAge" label="Maximum Password Age" />
        <NumberField shared={shared} keyName="passwordHistory" label="Password History" />
        <NumberField shared={shared} keyName="passwordLockoutThreshold" label="Password Lockout Threshold" />
        <NumberField shared={shared} keyName="passwordLockoutDuration" label="Password Lockout Duration" />
        <NumberField shared={shared} keyName="resetTokenExpiry" label="Reset Token Expiry" />
      </FieldGrid>

      <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3">
        <span className="text-token-sm font-medium text-text-primary-alt">Derived Password Strength</span>
        <StrengthTag strength={passwordStrength(form)} />
      </div>

      <div className="flex flex-col gap-token-2">
        <p className="m-0 text-token-sm font-medium text-text-primary-alt">Complexity Requirements</p>
        <div className="grid grid-cols-1 gap-token-2 sm:grid-cols-2">
          {COMPLEXITY_REQUIREMENTS.map((r) => (
            <label key={r.id} className="flex items-center gap-token-2 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2 text-token-sm text-text-primary-alt">
              <input
                type="checkbox"
                checked={!!form[r.id]}
                onChange={(e) => setField(r.id, e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              />
              <span>{r.label}</span>
              {shared.isModified(r.id) && <ModifiedBadge />}
            </label>
          ))}
        </div>
      </div>
    </Section>
  );
}

function SessionManagement({ ...shared }) {
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Session Management"
      description="Session lifetime, idle timeout, and concurrency controls."
    >
      <FieldGrid>
        <SelectField shared={shared} keyName="sessionTimeout" label="Session Timeout" options={ACCESS_CONTROL_OPTIONS.sessionTimeout} />
        <SelectField shared={shared} keyName="idleTimeout" label="Idle Timeout" options={ACCESS_CONTROL_OPTIONS.idleTimeout} />
        <NumberField shared={shared} keyName="maxConcurrentSessions" label="Max Concurrent Sessions" />
      </FieldGrid>
      <div className="flex flex-col gap-token-2">
        <ToggleField shared={shared} keyName="sessionRenewal" label="Session Renewal on Activity" description="Extend the session window while the user is active." />
        <ToggleField shared={shared} keyName="forceLogoutOnPasswordChange" label="Force Logout After Password Change" description="Invalidate all sessions when a password changes." />
        <ToggleField shared={shared} keyName="rememberMe" label="Remember Me" description="Allow long-lived sessions on trusted devices." />
        <ToggleField shared={shared} keyName="revokeOnSuspicious" label="Revoke Sessions on Suspicious Activity" description="Automatically end sessions flagged by risk detection." />
      </div>
    </Section>
  );
}

function NetworkRestrictions({ baseline, toggleCountry, ...shared }) {
  const { form, errors } = shared;
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Network &amp; IP Restrictions"
      description="VPN/proxy handling, allowed IP ranges, and geographic access."
    >
      <FieldGrid>
        <SelectField shared={shared} keyName="vpnDetection" label="VPN Detection Policy" options={ACCESS_CONTROL_OPTIONS.vpnDetection} />
        <SelectField shared={shared} keyName="proxyTorDetection" label="Proxy / Tor Detection" options={ACCESS_CONTROL_OPTIONS.proxyTorDetection} />
      </FieldGrid>

      <div className="flex flex-col gap-token-2">
        <p className="m-0 text-token-sm font-medium text-text-primary-alt">Allowed IP Ranges</p>
        <div className="overflow-hidden rounded-md border border-border-subtle">
          <table className="w-full border-collapse text-token-sm">
            <thead>
              <tr className="bg-surface-muted text-left text-token-xs text-text-secondary-alt">
                <th className="px-token-3 py-token-2 font-medium">Label</th>
                <th className="px-token-3 py-token-2 font-medium">CIDR</th>
                <th className="px-token-3 py-token-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {baseline.ipRanges.map((r) => (
                <tr key={r.id} className="border-t border-border-subtle">
                  <td className="px-token-3 py-token-2 text-text-primary-alt">{r.label}</td>
                  <td className="px-token-3 py-token-2 font-mono text-token-xs text-text-secondary-alt">{r.cidr}</td>
                  <td className="px-token-3 py-token-2 text-text-secondary-alt">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 text-token-xs text-text-faint">{baseline.blockedRanges.length} blocked ranges are also enforced from the threat feed.</p>
      </div>

      <div className="flex flex-col gap-token-2">
        <div className="flex items-center justify-between">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">Allowed Countries</p>
          <span className="text-token-xs text-text-faint">{form.allowedCountries.length} selected</span>
        </div>
        {errors.allowedCountries && <p className="m-0 text-token-xs text-danger" role="alert">{errors.allowedCountries}</p>}
        <div className="flex flex-wrap gap-token-2">
          {COUNTRY_OPTIONS.map((c) => {
            const on = form.allowedCountries.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggleCountry(c)}
                className={`inline-flex items-center gap-1 rounded-full border px-token-3 py-1 text-token-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? 'border-primary bg-shell-accent-wash text-primary' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-muted'}`}
              >
                {on && <IconCheck className="h-3 w-3" />}
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function AccessRestrictions({ ...shared }) {
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Access Restrictions"
      description="Device, API, remote, and contextual access controls."
    >
      <FieldGrid>
        <SelectField shared={shared} keyName="deviceRestriction" label="Device Restriction Policy" options={ACCESS_CONTROL_OPTIONS.deviceRestriction} />
        <SelectField shared={shared} keyName="apiAccessRestriction" label="API Access Restriction" options={ACCESS_CONTROL_OPTIONS.apiAccessRestriction} />
        <SelectField shared={shared} keyName="remoteAccess" label="Remote Access Policy" options={ACCESS_CONTROL_OPTIONS.remoteAccess} />
      </FieldGrid>
      <div className="flex flex-col gap-token-2">
        <ToggleField shared={shared} keyName="businessHoursAccess" label="Business Hours Access Control" description="Restrict sign-in to configured business hours." />
        <ToggleField shared={shared} keyName="departmentRestrictions" label="Enforce Department-Level Restrictions" description="Limit access to resources by department." />
        <ToggleField shared={shared} keyName="geoRestriction" label="Geographic Restriction Enforcement" description="Block access from countries outside the allowed list." />
        <ToggleField shared={shared} keyName="maintenanceModeAccess" label="Maintenance Mode Access Control" description="Allow only administrators during maintenance windows." />
      </div>
    </Section>
  );
}

function PrivilegedAccess({ emergencyAccounts, ...shared }) {
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="Privileged Access Policies"
      description={`Just-in-time elevation, approval workflows, and ${emergencyAccounts} emergency accounts.`}
    >
      <div className="flex flex-col gap-token-2">
        <ToggleField shared={shared} keyName="jitAccess" label="Just-In-Time (JIT) Access" description="Grant elevated permissions only for a bounded duration." />
        <ToggleField shared={shared} keyName="privilegedApproval" label="Privileged Session Approval Required" description="Require approval before a privileged session starts." />
        <ToggleField shared={shared} keyName="elevatedApprovalWorkflow" label="Elevated Access Approval Workflow" description="Route elevation requests through a review workflow." />
        <ToggleField shared={shared} keyName="breakGlassAccess" label="Break Glass Emergency Access" description="Allow emergency accounts to bypass controls, fully audited." />
      </div>
      <FieldGrid>
        <SelectField shared={shared} keyName="jitMaxDuration" label="JIT Access Max Duration" options={ACCESS_CONTROL_OPTIONS.jitMaxDuration} />
        <SelectField shared={shared} keyName="adminSessionTimeout" label="Admin Session Timeout" options={ACCESS_CONTROL_OPTIONS.adminSessionTimeout} />
        <SelectField shared={shared} keyName="approvalExpiry" label="Approval Request Expiry" options={ACCESS_CONTROL_OPTIONS.approvalExpiry} />
        <SelectField shared={shared} keyName="privilegedApprovalBy" label="Privileged Session Approval By" options={ACCESS_CONTROL_OPTIONS.privilegedApprovalBy} />
      </FieldGrid>
    </Section>
  );
}

function ApiTokenPolicies({ ...shared }) {
  return (
    <Section
      icon={<IconShieldLock className="h-5 w-5" />}
      title="API &amp; Token Policies"
      description="Token lifetime, rotation, and OAuth client controls."
    >
      <FieldGrid>
        <NumberField shared={shared} keyName="apiTokenExpiration" label="API Token Expiration" />
        <NumberField shared={shared} keyName="tokenRotationPeriod" label="Token Rotation Period" />
        <NumberField shared={shared} keyName="maxTokensPerUser" label="Max Tokens Per User" />
        <NumberField shared={shared} keyName="serviceTokenMaxExpiry" label="Service Account Token Max Expiry" />
        <NumberField shared={shared} keyName="oauthClientTokenLifetime" label="OAuth Client Token Lifetime" />
      </FieldGrid>
      <div className="flex flex-col gap-token-2">
        <ToggleField shared={shared} keyName="allowPersonalTokens" label="Allow Personal Access Tokens" description="Let users create personal API tokens." />
        <ToggleField shared={shared} keyName="allowServiceTokens" label="Allow Service Account Tokens" description="Permit non-interactive service account tokens." />
        <ToggleField shared={shared} keyName="enforceTokenRotation" label="Enforce Token Rotation Policy" description="Require tokens to rotate on the configured period." />
        <ToggleField shared={shared} keyName="revokeTokensOnPasswordChange" label="Revoke Tokens on Password Change" description="Invalidate tokens when a password changes." />
        <ToggleField shared={shared} keyName="restrictOAuthClients" label="Restrict OAuth Clients to Trusted Apps" description="Only allow approved OAuth client applications." />
      </div>
    </Section>
  );
}

/* ---- Sidebar cards ------------------------------------------------------ */

function SideCard({ title, children, action }) {
  return (
    <section className="rounded-lg border border-border bg-surface-card">
      <div className="flex items-center justify-between gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
        <h3 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h3>
        {action}
      </div>
      <div className="px-token-5 py-token-4">{children}</div>
    </section>
  );
}

/* Live security score — starts from the saved baseline and nudges with the
   most impactful live toggles so the number reacts to edits. */
function SecurityOverview({ score, form }) {
  const live = useMemo(() => {
    let s = score;
    s += form.mfaAllUsers ? 6 : 0;
    s += form.enforceTokenRotation ? 2 : 0;
    s += form.geoRestriction ? 2 : 0;
    s -= form.factors?.sms ? 3 : 0;
    s -= form.breakGlassAccess ? 2 : 0;
    return Math.max(0, Math.min(100, s));
  }, [score, form]);
  const tone = live >= 85 ? 'text-success-strong' : live >= 70 ? 'text-warning' : 'text-danger';
  const barTone = live >= 85 ? 'bg-success' : live >= 70 ? 'bg-warning' : 'bg-danger';
  return (
    <SideCard title="Security Overview">
      <div className="flex items-end justify-between">
        <div>
          <p className={`m-0 text-token-xl font-semibold ${tone}`}>{live}<span className="text-token-lg text-text-faint">/100</span></p>
          <p className="m-0 text-token-xs text-text-secondary-alt">Security posture score</p>
        </div>
        {live !== score && (
          <span className="rounded-full bg-shell-accent-wash px-2 py-0.5 text-token-xs font-medium text-primary">
            {live > score ? '+' : ''}{live - score} live
          </span>
        )}
      </div>
      <div className="mt-token-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={live} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${live}%` }} />
      </div>
    </SideCard>
  );
}

function ActivePolicySummary({ form }) {
  const rows = [
    ['Default Auth', form.defaultAuthMethod],
    ['MFA (All Users)', form.mfaAllUsers ? 'Required' : 'Not required'],
    ['Session Timeout', form.sessionTimeout],
    ['Idle Timeout', form.idleTimeout],
    ['API Access', form.apiAccessRestriction],
    ['Token Expiration', `${form.apiTokenExpiration} days`],
  ];
  return (
    <SideCard title="Active Policy Summary">
      <dl className="m-0 flex flex-col gap-token-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-token-3 text-token-sm">
            <dt className="text-text-secondary-alt">{k}</dt>
            <dd className="m-0 text-right font-medium text-text-primary-alt">{v}</dd>
          </div>
        ))}
      </dl>
    </SideCard>
  );
}

function ValidationStatus({ checklist, completedCount }) {
  return (
    <SideCard
      title="Validation Status"
      action={<span className="text-token-xs font-medium text-text-secondary-alt">{completedCount}/{checklist.length}</span>}
    >
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {checklist.map((c) => (
          <li key={c.key} className="flex items-center gap-token-2 text-token-sm">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${c.done ? 'bg-success text-text-on-primary' : 'bg-surface-muted text-text-faint'}`}>
              {c.done ? <IconCheck className="h-3 w-3" /> : <IconX className="h-2.5 w-2.5" />}
            </span>
            <span className={c.done ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function ComplianceRequirements({ form }) {
  const items = [
    { label: 'SOC 2 — MFA enforced', ok: form.mfaAdministrators && form.mfaPrivilegedRoles },
    { label: 'ISO 27001 — Password ≥ 12 chars', ok: Number(form.passwordMinLength) >= 12 },
    { label: 'GDPR — Geographic restriction', ok: form.geoRestriction },
    { label: 'PCI DSS — Token rotation enforced', ok: form.enforceTokenRotation },
    { label: 'NIST — No SMS as primary factor', ok: !form.factors?.sms },
  ];
  return (
    <SideCard title="Compliance Requirements">
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-token-2 text-token-sm">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${it.ok ? 'bg-success text-text-on-primary' : 'bg-warning-bg text-warning'}`}>
              {it.ok ? <IconCheck className="h-3 w-3" /> : <IconWarning className="h-3 w-3" />}
            </span>
            <span className={it.ok ? 'text-text-primary-alt' : 'text-text-secondary-alt'}>{it.label}</span>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function SecurityImpactCard({ impact, changes, totalUsers, form, saved }) {
  if (!impact) {
    return (
      <SideCard title="Security Impact">
        <p className="m-0 text-token-sm text-text-secondary-alt">No pending changes. Adjust a policy to preview its security impact.</p>
      </SideCard>
    );
  }
  const tone = impact === 'High' ? 'text-danger' : impact === 'Medium' ? 'text-warning' : 'text-success-strong';
  const bg = impact === 'High' ? 'bg-danger-bg' : impact === 'Medium' ? 'bg-warning-bg' : 'bg-success-bg';
  const notes = [];
  if (!saved.mfaAllUsers && form.mfaAllUsers) notes.push(`Requiring MFA affects all ${totalUsers.toLocaleString()} users.`);
  if (saved.idleTimeout !== form.idleTimeout) notes.push(`Idle timeout changes to ${form.idleTimeout}.`);
  if (saved.apiTokenExpiration !== form.apiTokenExpiration) notes.push(`API tokens will expire after ${form.apiTokenExpiration} days.`);
  if (notes.length === 0) notes.push(`${changes.length} policy ${changes.length === 1 ? 'change' : 'changes'} pending review.`);
  return (
    <SideCard title="Security Impact">
      <div className={`mb-token-3 inline-flex items-center gap-token-2 rounded-full px-token-3 py-1 text-token-xs font-semibold ${bg} ${tone}`}>
        <IconWarning className="h-3.5 w-3.5" />
        {impact} impact
      </div>
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {notes.map((n, i) => (
          <li key={i} className="flex items-start gap-token-2 text-token-sm text-text-secondary-alt">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-faint" aria-hidden="true" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function PendingChanges({ changes }) {
  return (
    <SideCard
      title="Pending Changes"
      action={<span className="rounded-full bg-shell-accent-wash px-2 py-0.5 text-token-xs font-medium text-primary">{changes.length}</span>}
    >
      {changes.length === 0 ? (
        <p className="m-0 text-token-sm text-text-secondary-alt">No unsaved changes.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
          {changes.map((c) => (
            <li key={c.key} className="flex flex-col gap-1 border-b border-border-subtle pb-token-2 last:border-0 last:pb-0">
              <span className="text-token-sm font-medium text-text-primary-alt">{c.label}</span>
              <span className="flex items-center gap-token-2 text-token-xs">
                <span className="text-text-faint line-through">{c.before}</span>
                <span aria-hidden="true" className="text-text-faint">→</span>
                <span className="font-medium text-primary">{c.after}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SideCard>
  );
}

/* ---- Save confirmation dialog (focus-trapped) --------------------------- */
function ConfirmDialog({ changes, impact, submitting, onCancel, onConfirm }) {
  const ref = useRef(null);
  const titleId = 'ac-confirm-title';

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const node = ref.current;
    const focusable = node?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();
    function onKey(e) {
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab' || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onCancel]);

  const tone = impact === 'High' ? 'text-danger' : impact === 'Medium' ? 'text-warning' : 'text-success-strong';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="presentation" onMouseDown={onCancel}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start gap-token-3 border-b border-border-subtle px-token-6 py-token-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary">
            <IconShieldLock className="h-5 w-5" />
          </span>
          <div>
            <h2 id={titleId} className="m-0 text-token-lg font-semibold text-text-primary-alt">Apply security-policy changes?</h2>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              {changes.length} {changes.length === 1 ? 'change' : 'changes'} will be applied.
              {impact && <> Estimated impact: <span className={`font-semibold ${tone}`}>{impact}</span>.</>}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-token-6 py-token-4">
          <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
            {changes.map((c) => (
              <li key={c.key} className="flex flex-col gap-1">
                <span className="text-token-sm font-medium text-text-primary-alt">{c.label}</span>
                <span className="flex items-center gap-token-2 text-token-xs">
                  <span className="text-text-faint line-through">{c.before}</span>
                  <span aria-hidden="true" className="text-text-faint">→</span>
                  <span className="font-medium text-primary">{c.after}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-token-2 border-t border-border-subtle px-token-6 py-token-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-muted disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-5 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting ? 'Saving…' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Loading skeleton --------------------------------------------------- */
function SettingsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-token-6" aria-hidden="true">
      <div className="h-24 rounded-lg border border-border bg-surface-card" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-lg border border-border bg-surface-card" />
          ))}
        </div>
        <div className="flex flex-col gap-token-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-lg border border-border bg-surface-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

