import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  ROLE_CATEGORY_OPTIONS,
  ROLE_TYPE_OPTIONS,
  PRIVILEGE_LEVEL_OPTIONS,
  DESCRIPTION_MAX,
  PERMISSION_GROUPS,
  PERMISSION_CATALOG,
  ADMIN_PRIVILEGES,
  RESOURCE_SCOPE_OPTIONS,
  ACCESS_LEVEL_OPTIONS,
  INHERIT_ROLE_OPTIONS,
  PERMISSION_TEMPLATE_OPTIONS,
  ASSIGNABLE_BY_OPTIONS,
  MAX_ASSIGNMENT_SCOPE_OPTIONS,
  INITIAL_FORM,
  slugifyKey,
  createRole,
} from '../services/createRole.api';

/* Org scope — mirrors RoleListScreen's `orgId = 'current'` convention.
   A real MOD-003 backend resolves this from the authenticated session. */
const ORG_ID = 'current';

/* Field styling — mirrors CreateOrganizationScreen's fieldBase so the
   two admin create screens stay visually consistent. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

/* Required fields per Figma (marked with *). */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Role name is required.';
  if (!form.key.trim()) errors.key = 'Role key is required.';
  else if (!KEY_PATTERN.test(form.key.trim()))
    errors.key = 'Lowercase letters, numbers, and underscores only.';
  if (!form.description.trim()) errors.description = 'A description is required.';
  else if (form.description.length > DESCRIPTION_MAX)
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  return errors;
}

/* Count granted / denied permissions across the catalogue. */
function countPermissions(permissions) {
  let enabled = 0;
  let denied = 0;
  for (const grp of PERMISSION_CATALOG) {
    for (const p of grp.permissions) {
      if (permissions[p.id]) enabled += 1;
      else denied += 1;
    }
  }
  return { enabled, denied };
}

/* Inherited permission count is design-sourced per inherit-from role. */
const INHERITED_COUNTS = {
  None: 0,
  'Data Engineer': 17,
  'Data Analyst': 14,
  'Team Lead': 12,
  'Operations Engineer': 15,
};

/* The 6-item Validation Status checklist from the Figma right rail, each
   a predicate over the current form. "Security Review Passed" is the one
   the design shows failing (5/6) — it depends on a MOD-003 security review
   that has no backend yet, so it stays pending. */
function computeChecklist(form, counts) {
  return [
    { key: 'name', label: 'Role Name Valid', done: !!form.name.trim() },
    { key: 'key', label: 'Unique Role Key', done: !!form.key.trim() && KEY_PATTERN.test(form.key.trim()) },
    { key: 'perms', label: 'Permissions Configured', done: counts.enabled > 0 },
    { key: 'conflicts', label: 'No Policy Conflicts', done: false, pending: true },
    { key: 'scope', label: 'Resource Scope Valid', done: form.resourceScope.length > 0 },
    { key: 'review', label: 'Security Review Passed', done: false, pending: true },
  ];
}

/** SCR-041 — Create Role Screen. Node 113:19063, Figma page "Page 1". */
export default function CreateRoleScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [keyEdited, setKeyEdited] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);
  const counts = useMemo(() => countPermissions(form.permissions), [form.permissions]);
  const checklist = useMemo(() => computeChecklist(form, counts), [form, counts]);
  const passedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;
  const inherited = INHERITED_COUNTS[form.inheritFrom] ?? 0;
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM),
    [form],
  );

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate the key from the name until the user edits it directly.
      if (key === 'name' && !keyEdited) next.key = slugifyKey(value);
      return next;
    });
  }

  function toggleGroup(id) {
    setForm((prev) => {
      const assigned = prev.assignedGroups.includes(id)
        ? prev.assignedGroups.filter((g) => g !== id)
        : [...prev.assignedGroups, id];
      return { ...prev, assignedGroups: assigned };
    });
  }

  function togglePermission(id) {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [id]: !prev.permissions[id] },
    }));
  }

  function toggleGroupPermissions(groupId, granted) {
    const group = PERMISSION_CATALOG.find((g) => g.id === groupId);
    if (!group) return;
    setForm((prev) => {
      const permissions = { ...prev.permissions };
      for (const p of group.permissions) permissions[p.id] = granted;
      return { ...prev, permissions };
    });
  }

  function toggleAdmin(id) {
    setForm((prev) => ({
      ...prev,
      adminPrivileges: { ...prev.adminPrivileges, [id]: !prev.adminPrivileges[id] },
    }));
  }

  function updateResourceRow(id, patch) {
    setForm((prev) => ({
      ...prev,
      resourceScope: prev.resourceScope.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function removeResourceRow(id) {
    setForm((prev) => ({
      ...prev,
      resourceScope: prev.resourceScope.filter((row) => row.id !== id),
    }));
  }

  function addResourceRow() {
    setForm((prev) => ({
      ...prev,
      resourceScope: [
        ...prev.resourceScope,
        {
          id: `rs_${Math.random().toString(36).slice(2, 8)}`,
          resourceType: 'Pipelines',
          scope: 'Department',
          accessLevel: 'Read Only',
          conditions: '—',
        },
      ],
    }));
  }

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function showError(key) {
    return (submitAttempted || touched[key]) && !!errors[key];
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setKeyEdited(false);
    setTouched({});
    setSubmitAttempted(false);
    setSubmitState({ status: 'idle', message: '' });
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
    const payload = buildPayload(form, counts, inherited);
    const result = await createRole(ORG_ID, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-003 (RBAC & Permissions) has no backend yet, so nothing was persisted. In a live environment this would create the role and return to the role list.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Role created.' });
      navigate('/roles');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Roles', 'Create Role']}>
      <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
        <Header
          isDirty={isDirty}
          isValid={isValid}
          onCancel={() => navigate('/roles')}
          onReset={handleReset}
        />

        <span className="sr-only" role="status" aria-live="polite">
          {submitState.status === 'submitting'
            ? 'Creating role'
            : submitState.status === 'mocked'
              ? 'Role creation simulated — no backend available'
              : submitState.status === 'success'
                ? 'Role created'
                : `${passedCount} of ${checklist.length} validation checks passed`}
        </span>

        {submitState.status === 'mocked' && (
          <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
            <p className="m-0 text-token-base font-semibold text-warning">Simulated creation (no backend)</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-token-6">
            <RoleInformation form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} onKeyEdit={() => setKeyEdited(true)} />
            <PermissionGroups form={form} toggleGroup={toggleGroup} />
            <DirectPermissions form={form} counts={counts} togglePermission={togglePermission} toggleGroupPermissions={toggleGroupPermissions} />
            <AdministrativePrivileges form={form} toggleAdmin={toggleAdmin} />
            <ResourceAccessScope form={form} updateResourceRow={updateResourceRow} removeResourceRow={removeResourceRow} addResourceRow={addResourceRow} />
            <PermissionInheritance form={form} setField={setField} inherited={inherited} />
            <RoleAssignmentRules form={form} setField={setField} />
          </div>

          <aside className="flex min-w-0 flex-col gap-token-5">
            <RoleSummary form={form} counts={counts} inherited={inherited} />
            <EffectiveAccessOverview counts={counts} inherited={inherited} resourceRules={form.resourceScope.length} />
            <ValidationStatus checklist={checklist} passedCount={passedCount} />
            <SecurityImpact counts={counts} form={form} />
          </aside>
        </div>

        <ActionBar isDirty={isDirty} isValid={isValid} passedCount={passedCount} total={checklist.length} onCancel={() => navigate('/roles')} onReset={handleReset} />
      </form>

      {confirmOpen && (
        <ConfirmDialog
          form={form}
          counts={counts}
          inherited={inherited}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}
    </AppShell>
  );
}

/* Assemble the API payload from the form state. */
function buildPayload(form, counts, inherited) {
  return {
    name: form.name.trim(),
    key: form.key.trim(),
    description: form.description.trim(),
    category: form.category,
    type: form.type,
    privilegeLevel: form.privilegeLevel,
    permissionGroups: form.assignedGroups,
    permissions: Object.entries(form.permissions)
      .filter(([, granted]) => granted)
      .map(([id]) => id),
    deniedPermissions: Object.entries(form.permissions)
      .filter(([, granted]) => !granted)
      .map(([id]) => id),
    adminPrivileges: Object.entries(form.adminPrivileges)
      .filter(([, on]) => on)
      .map(([id]) => id),
    resourceScope: form.resourceScope,
    inheritance: {
      inheritFrom: form.inheritFrom,
      template: form.permissionTemplate,
      inheritedCount: inherited,
    },
    assignmentRules: {
      assignableBy: form.assignableBy,
      maxAssignmentScope: form.maxAssignmentScope,
      departmentRestrictions: form.departmentRestrictions.trim() || null,
      teamRestrictions: form.teamRestrictions.trim() || null,
      requiresApproval: form.requiresApproval,
      restrictedRole: form.restrictedRole,
    },
    effectivePermissionCount: counts.enabled + inherited,
  };
}

/* ---- Layout primitives ---------------------------------------------- */

function Section({ title, description, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-token-3">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-token-5">{children}</div>
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

function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className={`flex items-start justify-between gap-token-4 rounded-md border px-token-4 py-token-3 transition-colors ${checked ? 'border-primary/40 bg-shell-accent-wash' : 'border-border-subtle bg-surface-muted'}`}>
      <span className="flex flex-col">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary-alt">{label}</label>
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

function Header({ isDirty, isValid, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Create Role</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Define permissions, access boundaries, and administrative capabilities for this custom role.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        {isDirty && (
          <span className="flex items-center gap-token-2 text-token-xs font-medium text-warning-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
            Unsaved changes
          </span>
        )}
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
          disabled={!isDirty}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="button"
          disabled
          title="Saving drafts requires MOD-003's role endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Create Role
        </button>
      </div>
    </div>
  );
}

function ActionBar({ isDirty, isValid, passedCount, total, onCancel, onReset }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${isValid ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
        {isValid
          ? `Ready to create · ${passedCount} of ${total} validation checks passed`
          : `${passedCount} of ${total} validation checks passed`}
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
          disabled={!isDirty}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Create Role
        </button>
      </div>
    </div>
  );
}

/* ---- Section 1: Role Information ------------------------------------- */
function RoleInformation({ form, setField, showError, markTouched, errors, onKeyEdit }) {
  const remaining = DESCRIPTION_MAX - form.description.length;
  return (
    <Section title="Role Information" description="Core identity and classification for the new role.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-name" label="Role Name" required error={showError('name') ? errors.name : null} hint="Must be unique across all roles in this organization.">
          {(db) => (
            <TextInput id="field-name" required value={form.name} onChange={(v) => setField('name', v)} onBlur={() => markTouched('name')} invalid={showError('name')} describedBy={db} placeholder="Senior Data Engineer" />
          )}
        </Field>
        <Field id="field-key" label="Role Key" required error={showError('key') ? errors.key : null} hint="Lowercase, underscores only — auto-generated from the name.">
          {(db) => (
            <TextInput id="field-key" required value={form.key} onChange={(v) => { onKeyEdit(); setField('key', v.toLowerCase()); }} onBlur={() => markTouched('key')} invalid={showError('key')} describedBy={db} placeholder="senior_data_engineer" />
          )}
        </Field>
        <Field id="field-description" label="Description" required error={showError('description') ? errors.description : null} className="sm:col-span-2">
          {(db) => (
            <textarea
              id="field-description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              onBlur={() => markTouched('description')}
              aria-invalid={showError('description') || undefined}
              aria-required
              aria-describedby={db}
              rows={3}
              maxLength={DESCRIPTION_MAX}
              placeholder="Describe the responsibilities and access this role grants…"
              className={`${fieldBase} h-auto py-token-2 ${showError('description') ? fieldInvalid : ''}`}
            />
          )}
        </Field>
        <div className="sm:col-span-2 -mt-token-1 flex justify-end">
          <span className={`text-token-xs ${remaining < 0 ? 'text-danger' : 'text-text-faint'}`}>
            {form.description.length} / {DESCRIPTION_MAX} characters
          </span>
        </div>
        <Field id="field-category" label="Role Category">
          {(db) => (
            <SelectInput id="field-category" value={form.category} onChange={(v) => setField('category', v)} describedBy={db} options={ROLE_CATEGORY_OPTIONS} />
          )}
        </Field>
        <Field id="field-type" label="Role Type">
          {(db) => (
            <SelectInput id="field-type" value={form.type} onChange={(v) => setField('type', v)} describedBy={db} options={ROLE_TYPE_OPTIONS} />
          )}
        </Field>
        <Field id="field-privilegeLevel" label="Privilege Level">
          {(db) => (
            <SelectInput id="field-privilegeLevel" value={form.privilegeLevel} onChange={(v) => setField('privilegeLevel', v)} describedBy={db} options={PRIVILEGE_LEVEL_OPTIONS} />
          )}
        </Field>
      </div>
    </Section>
  );
}

/* ---- Section 2: Permission Groups ----------------------------------- */
function PermissionGroups({ form, toggleGroup }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const match = (g) => !query || g.name.toLowerCase().includes(query) || g.description.toLowerCase().includes(query);
  const assigned = PERMISSION_GROUPS.filter((g) => form.assignedGroups.includes(g.id) && match(g));
  const available = PERMISSION_GROUPS.filter((g) => !form.assignedGroups.includes(g.id) && match(g));

  return (
    <Section title="Permission Groups" description="Bundle related permissions by assigning permission groups to this role.">
      <div className="relative mb-token-4">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permission groups…"
          aria-label="Search permission groups"
          className={`${fieldBase} pl-9`}
        />
      </div>
      <div className="grid grid-cols-1 gap-token-5 lg:grid-cols-2">
        <GroupColumn title="Assigned Groups" count={assigned.length} tone="assigned" groups={assigned} onToggle={toggleGroup} />
        <GroupColumn title="Available Groups" count={available.length} tone="available" groups={available} onToggle={toggleGroup} />
      </div>
    </Section>
  );
}

function GroupColumn({ title, count, tone, groups, onToggle }) {
  const assigned = tone === 'assigned';
  return (
    <div className="flex flex-col gap-token-2">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h3>
        <span className="rounded-full bg-surface-muted px-token-2 py-0.5 text-token-xs font-medium text-text-secondary-alt">{count}</span>
      </div>
      <ul className="flex min-h-[80px] flex-col gap-token-2 rounded-md border border-border-subtle bg-surface-muted p-token-3">
        {groups.length === 0 ? (
          <li className="py-token-4 text-center text-token-xs text-text-faint">
            {assigned ? 'No groups assigned yet.' : 'No available groups.'}
          </li>
        ) : (
          groups.map((g) => (
            <li key={g.id} className="rounded-md border border-border bg-surface-card p-token-3">
              <div className="flex items-start justify-between gap-token-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-token-2">
                    <span className="truncate text-token-sm font-medium text-text-primary-alt">{g.name}</span>
                    <span className="shrink-0 rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-xs font-medium text-primary">{g.scope}</span>
                  </div>
                  <p className="m-0 mt-0.5 text-token-xs text-text-secondary-alt">{g.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(g.id)}
                  aria-label={`${assigned ? 'Remove' : 'Add'} ${g.name}`}
                  className={`flex h-7 shrink-0 items-center gap-token-1 rounded-md border px-token-2 text-token-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${assigned ? 'border-border text-text-secondary-alt hover:bg-surface-hover' : 'border-primary/40 bg-shell-accent-wash text-primary hover:opacity-90'}`}
                >
                  {assigned ? <><IconX className="h-3 w-3" /> Remove</> : <><IconPlus className="h-3 w-3" /> Add</>}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/* ---- Section 3: Direct Permissions ---------------------------------- */
function DirectPermissions({ form, counts, togglePermission, toggleGroupPermissions }) {
  return (
    <Section
      title="Direct Permissions"
      description="Fine-tune individual permissions granted directly by this role."
      action={
        <div className="flex items-center gap-token-3 text-token-xs font-medium">
          <span className="flex items-center gap-token-1 text-success-strong"><span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />{counts.enabled} enabled</span>
          <span className="flex items-center gap-token-1 text-text-faint"><span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />{counts.denied} denied</span>
        </div>
      }
    >
      <div className="flex flex-col gap-token-4">
        {PERMISSION_CATALOG.map((group) => {
          const enabled = group.permissions.filter((p) => form.permissions[p.id]).length;
          const total = group.permissions.length;
          const allOn = enabled === total;
          return (
            <div key={group.id} className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
              <div className="flex flex-wrap items-center justify-between gap-token-2">
                <div className="flex items-center gap-token-2">
                  <h3 className="m-0 text-token-sm font-semibold text-text-primary-alt">{group.label}</h3>
                  <span className="rounded-full bg-surface-card px-token-2 py-0.5 text-token-xs font-medium text-text-secondary-alt">{enabled}/{total}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroupPermissions(group.id, !allOn)}
                  className="text-token-xs font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {allOn ? 'Deny all' : 'Grant all'}
                </button>
              </div>
              <div className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-2">
                {group.permissions.map((p) => {
                  const granted = !!form.permissions[p.id];
                  return (
                    <label key={p.id} className="flex cursor-pointer items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 py-token-2 text-token-sm text-text-primary-alt hover:bg-surface-hover">
                      <input
                        type="checkbox"
                        checked={granted}
                        onChange={() => togglePermission(p.id)}
                        className="h-3.5 w-3.5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      />
                      <span className="flex-1">{p.label}</span>
                      <span className={`text-token-xs font-medium ${granted ? 'text-success-strong' : 'text-text-faint'}`}>{granted ? 'Allow' : 'Deny'}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ---- Section 4: Administrative Privileges --------------------------- */
function AdministrativePrivileges({ form, toggleAdmin }) {
  const active = ADMIN_PRIVILEGES.filter((p) => form.adminPrivileges[p.id]).length;
  return (
    <Section
      title="Administrative Privileges"
      description="Elevated capabilities that override standard permission boundaries. Grant with caution."
      action={active > 0 ? <span className="flex items-center gap-token-1 rounded-full bg-warning-bg px-token-2 py-0.5 text-token-xs font-medium text-warning-strong"><IconLock className="h-3 w-3" />{active} elevated</span> : null}
    >
      <div className="grid grid-cols-1 gap-token-3 sm:grid-cols-2">
        {ADMIN_PRIVILEGES.map((p) => (
          <Toggle key={p.id} id={`field-${p.id}`} checked={!!form.adminPrivileges[p.id]} onChange={() => toggleAdmin(p.id)} label={p.label} description={p.description} />
        ))}
      </div>
    </Section>
  );
}

/* ---- Section 5: Resource Access Scope ------------------------------- */
function ResourceAccessScope({ form, updateResourceRow, removeResourceRow, addResourceRow }) {
  return (
    <Section
      title="Resource Access Scope"
      description="Constrain which resources this role can reach and at what access level."
      action={
        <button
          type="button"
          onClick={addResourceRow}
          className="flex h-8 items-center gap-token-1 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconPlus className="h-3.5 w-3.5" /> Add Resource
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-token-sm">
          <thead>
            <tr className="border-b border-border text-left text-token-xs uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="py-token-2 pr-token-3 font-medium">Resource Type</th>
              <th scope="col" className="py-token-2 pr-token-3 font-medium">Scope</th>
              <th scope="col" className="py-token-2 pr-token-3 font-medium">Access Level</th>
              <th scope="col" className="py-token-2 pr-token-3 font-medium">Conditions</th>
              <th scope="col" className="py-token-2 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {form.resourceScope.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-token-5 text-center text-token-xs text-text-faint">No resource scopes defined. Add one to constrain access.</td>
              </tr>
            ) : (
              form.resourceScope.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="py-token-2 pr-token-3">
                    <span className="font-medium text-text-primary-alt">{row.resourceType}</span>
                  </td>
                  <td className="py-token-2 pr-token-3">
                    <select
                      value={row.scope}
                      onChange={(e) => updateResourceRow(row.id, { scope: e.target.value })}
                      aria-label={`Scope for ${row.resourceType}`}
                      className={`${fieldBase} h-8`}
                    >
                      {RESOURCE_SCOPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="py-token-2 pr-token-3">
                    <select
                      value={row.accessLevel}
                      onChange={(e) => updateResourceRow(row.id, { accessLevel: e.target.value })}
                      aria-label={`Access level for ${row.resourceType}`}
                      className={`${fieldBase} h-8`}
                    >
                      {ACCESS_LEVEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="py-token-2 pr-token-3">
                    <input
                      value={row.conditions}
                      onChange={(e) => updateResourceRow(row.id, { conditions: e.target.value })}
                      aria-label={`Conditions for ${row.resourceType}`}
                      className={`${fieldBase} h-8`}
                    />
                  </td>
                  <td className="py-token-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeResourceRow(row.id)}
                      aria-label={`Remove ${row.resourceType} scope`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ---- Section 6: Permission Inheritance ------------------------------ */
function PermissionInheritance({ form, setField, inherited }) {
  return (
    <Section title="Permission Inheritance" description="Optionally inherit a baseline permission set from an existing role or policy template.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-inheritFrom" label="Inherit From Role">
          {(db) => (
            <SelectInput id="field-inheritFrom" value={form.inheritFrom} onChange={(v) => setField('inheritFrom', v)} describedBy={db} options={INHERIT_ROLE_OPTIONS} />
          )}
        </Field>
        <Field id="field-permissionTemplate" label="Permission Template">
          {(db) => (
            <SelectInput id="field-permissionTemplate" value={form.permissionTemplate} onChange={(v) => setField('permissionTemplate', v)} describedBy={db} options={PERMISSION_TEMPLATE_OPTIONS} />
          )}
        </Field>
      </div>
      {form.inheritFrom !== 'None' && (
        <p className="m-0 mt-token-4 flex items-center gap-token-2 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-xs text-primary">
          <IconInfo className="h-3.5 w-3.5 shrink-0" />
          Inherited from {form.inheritFrom} role — {inherited} permissions
        </p>
      )}
    </Section>
  );
}

/* ---- Section 7: Role Assignment Rules ------------------------------- */
function RoleAssignmentRules({ form, setField }) {
  return (
    <Section title="Role Assignment Rules" description="Control who can assign this role and any approval requirements.">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
        <Field id="field-assignableBy" label="Assignable By">
          {(db) => (
            <SelectInput id="field-assignableBy" value={form.assignableBy} onChange={(v) => setField('assignableBy', v)} describedBy={db} options={ASSIGNABLE_BY_OPTIONS} />
          )}
        </Field>
        <Field id="field-maxAssignmentScope" label="Maximum Assignment Scope">
          {(db) => (
            <SelectInput id="field-maxAssignmentScope" value={form.maxAssignmentScope} onChange={(v) => setField('maxAssignmentScope', v)} describedBy={db} options={MAX_ASSIGNMENT_SCOPE_OPTIONS} />
          )}
        </Field>
        <Field id="field-departmentRestrictions" label="Department Restrictions" hint="Optional — comma-separated departments this role is limited to.">
          {(db) => (
            <TextInput id="field-departmentRestrictions" value={form.departmentRestrictions} onChange={(v) => setField('departmentRestrictions', v)} describedBy={db} placeholder="Engineering, Data Platform" />
          )}
        </Field>
        <Field id="field-teamRestrictions" label="Team Restrictions" hint="Optional — comma-separated teams this role is limited to.">
          {(db) => (
            <TextInput id="field-teamRestrictions" value={form.teamRestrictions} onChange={(v) => setField('teamRestrictions', v)} describedBy={db} placeholder="Pipeline Ops, Connectors" />
          )}
        </Field>
        <div className="sm:col-span-2 flex flex-col gap-token-3">
          <Toggle id="field-requiresApproval" checked={form.requiresApproval} onChange={(v) => setField('requiresApproval', v)} label="Requires approval" description="Assignments must be approved by an organization admin before taking effect." />
          <Toggle id="field-restrictedRole" checked={form.restrictedRole} onChange={(v) => setField('restrictedRole', v)} label="Restricted role" description="Flag this role for heightened audit and periodic access review." />
        </div>
      </div>
    </Section>
  );
}

/* ---- Sidebar: live Role Summary ------------------------------------- */
function RoleSummary({ form, counts, inherited }) {
  const rows = [
    { label: 'Role', value: form.name || '—' },
    { label: 'Key', value: form.key || '—' },
    { label: 'Category', value: form.category },
    { label: 'Type', value: form.type },
    { label: 'Privilege', value: form.privilegeLevel },
    { label: 'Groups', value: `${form.assignedGroups.length} assigned` },
    { label: 'Direct', value: `${counts.enabled} permissions` },
    { label: 'Inherited', value: `${inherited} permissions` },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Role Summary</h2>
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

/* ---- Sidebar: Effective Access Overview ----------------------------- */
function EffectiveAccessOverview({ counts, inherited, resourceRules }) {
  const total = counts.enabled + inherited;
  const stats = [
    { label: 'Total Permissions', value: total, tone: 'text-text-primary-alt' },
    { label: 'Direct', value: counts.enabled, tone: 'text-success-strong' },
    { label: 'Inherited', value: inherited, tone: 'text-primary' },
    { label: 'Resource Access Rules', value: resourceRules, tone: 'text-text-primary-alt' },
  ];
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Effective Access Overview</h2>
      <dl className="mt-token-4 grid grid-cols-2 gap-token-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
            <dt className="text-token-xs text-text-faint">{s.label}</dt>
            <dd className={`m-0 mt-0.5 text-token-lg font-bold ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---- Sidebar: Validation Status ------------------------------------- */
function ValidationStatus({ checklist, passedCount }) {
  const total = checklist.length;
  const pct = Math.round((passedCount / total) * 100);
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Validation Status</h2>
        <span className="text-token-xs font-medium text-text-secondary-alt">{passedCount}/{total} Passed</span>
      </div>
      <div className="mt-token-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={passedCount} aria-valuemin={0} aria-valuemax={total} aria-label="Validation checks passed">
        <span className={`block h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-token-4 flex flex-col gap-token-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-token-2 text-token-sm">
            {item.done ? (
              <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" />
            ) : item.pending ? (
              <IconClock className="h-3.5 w-3.5 shrink-0 text-warning-strong" />
            ) : (
              <IconCircle className="h-3.5 w-3.5 shrink-0 text-text-faint" />
            )}
            <span className={item.done ? 'text-text-primary-alt' : item.pending ? 'text-warning-strong' : 'text-text-secondary-alt'}>{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-token-3 text-token-xs text-text-faint">
        Security review is completed by an organization admin after the role is created.
      </p>
    </section>
  );
}

/* ---- Sidebar: Security Impact --------------------------------------- */
function SecurityImpact({ counts, form }) {
  const adminActive = Object.values(form.adminPrivileges).filter(Boolean).length;
  // Impact scales with granted permissions and elevated admin privileges.
  const level = adminActive >= 2 || counts.enabled >= 40
    ? { label: 'High Impact', tone: 'danger' }
    : adminActive >= 1 || counts.enabled >= 20
      ? { label: 'Medium Impact', tone: 'warning' }
      : { label: 'Low Impact', tone: 'success' };
  const toneClass = {
    danger: 'border-danger-border bg-danger-bg text-danger',
    warning: 'border-warning bg-warning-bg text-warning-strong',
    success: 'border-success bg-success-bg text-success',
  }[level.tone];
  const pending = [];
  if (!form.name.trim()) pending.push('Provide a role name');
  if (!form.key.trim()) pending.push('Provide a role key');
  if (!form.description.trim()) pending.push('Add a description');
  if (counts.enabled === 0) pending.push('Grant at least one permission');
  pending.push('Complete security review');

  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Security Impact</h2>
      <div className={`mt-token-3 flex items-center gap-token-2 rounded-md border px-token-3 py-token-2 ${toneClass}`}>
        <IconShield className="h-4 w-4 shrink-0" />
        <span className="text-token-sm font-semibold">{level.label}</span>
      </div>
      <h3 className="m-0 mt-token-4 text-token-sm font-semibold text-text-primary-alt">Pending Configuration</h3>
      <ul className="mt-token-2 flex flex-col gap-token-1">
        {pending.map((item) => (
          <li key={item} className="flex items-start gap-token-2 text-token-xs text-text-secondary-alt">
            <IconCircle className="mt-0.5 h-3 w-3 shrink-0 text-text-faint" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Confirm Role Creation dialog ----------------------------------- */
function ConfirmDialog({ form, counts, inherited, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => {
    cancelRef.current?.focus();

    function getFocusable() {
      return dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
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
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [onCancel]);

  const rows = [
    { label: 'Role', value: form.name },
    { label: 'Key', value: form.key },
    { label: 'Category', value: form.category },
    { label: 'Privilege Level', value: form.privilegeLevel },
    { label: 'Permission Groups', value: `${form.assignedGroups.length} assigned` },
    { label: 'Effective Permissions', value: `${counts.enabled + inherited} (${counts.enabled} direct · ${inherited} inherited)` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div ref={dialogRef} className="w-full max-w-md rounded-md border border-border bg-surface-card p-token-6 shadow-lg">
        <h2 id="confirm-title" className="m-0 text-token-lg font-bold text-text-primary-alt">Confirm Role Creation</h2>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Review the role configuration below before creating it.</p>
        <dl className="mt-token-5 flex flex-col gap-token-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
              <dt className="text-token-xs text-text-faint">{row.label}</dt>
              <dd className="m-0 max-w-[60%] text-right text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="m-0 mt-token-4 rounded-md bg-shell-accent-wash px-token-3 py-token-2 text-token-xs text-primary">
          The role becomes available for assignment once an organization admin completes the security review.
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
            className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting && <IconSpinner />}
            {submitting ? 'Creating…' : 'Create Role'}
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

function IconCircle({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

function IconClock({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}

function IconPlus({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.5 8h5l.5-8" />
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

function IconShield({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.5 3 3.5v4c0 3 2.2 5.3 5 6.5 2.8-1.2 5-3.5 5-6.5v-4L8 1.5Z" />
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

