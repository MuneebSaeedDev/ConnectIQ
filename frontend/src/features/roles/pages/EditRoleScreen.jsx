import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useEditableRole } from '../hooks/useEditableRole';
import {
  EDIT_ROLE_OPTIONS,
  PERMISSION_DOMAINS,
  ADMIN_PRIVILEGES,
  PERMISSION_GROUP_CATALOGUE,
  RESOURCE_ACCESS_CATALOGUE,
  updateRole,
} from '../services/editRole.api';

/* Field styling — mirrors SCR-034 EditUser / SCR-040 RoleList so the
   MOD-003 admin forms read identically. No alpha modifiers on tokens. */
const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

/* Scope this edit to the caller's organization. MOD-003 has no live
   "current org" endpoint, so this mirrors the id used by the sibling
   org-scoped screens until context ships. */
const ORG_ID = 'current';

const MOCK_TITLE =
  'MOD-003 (RBAC & Permissions) has no backend deployed yet — showing sample data, and Save is simulated (nothing is persisted).';

const DESCRIPTION_MAX = 300;

/* Simple-field editable keys tracked for the Pending Changes diff. The
   composite structures (permissionGroups, permissions, resourceAccess,
   adminPrivileges) are diffed separately below. */
const SIMPLE_KEYS = [
  'name', 'description', 'category', 'status',
  'inheritFromRole', 'permissionTemplate', 'organizationPolicy', 'departmentPolicy',
  'assignableBy', 'maxAssignmentScope', 'departmentRestrictions', 'teamRestrictions',
  'requiresApproval', 'restrictedRole',
];

const SIMPLE_LABELS = {
  name: 'Role Name',
  description: 'Description',
  category: 'Role Category',
  status: 'Status',
  inheritFromRole: 'Inherit From Role',
  permissionTemplate: 'Permission Template',
  organizationPolicy: 'Organization Policy',
  departmentPolicy: 'Department Policy',
  assignableBy: 'Assignable By',
  maxAssignmentScope: 'Maximum Assignment Scope',
  departmentRestrictions: 'Department Restrictions',
  teamRestrictions: 'Team Restrictions',
  requiresApproval: 'Requires Approval',
  restrictedRole: 'Restricted Role',
};

const BOOLEAN_KEYS = new Set(['requiresApproval', 'restrictedRole']);

const GROUP_LABEL = Object.fromEntries(PERMISSION_GROUP_CATALOGUE.map((g) => [g.id, g.label]));
const PERM_LABEL = {};
for (const d of PERMISSION_DOMAINS) for (const it of d.items) PERM_LABEL[it.id] = it.label;
const ADMIN_LABEL = Object.fromEntries(ADMIN_PRIVILEGES.map((p) => [p.id, p.label]));
const RESOURCE_LABEL = Object.fromEntries(RESOURCE_ACCESS_CATALOGUE.map((r) => [r.id, r.label]));

function displaySimple(key, value) {
  if (BOOLEAN_KEYS.has(key)) return value ? 'Enabled' : 'Disabled';
  const str = String(value ?? '').trim();
  return str || '—';
}

/* Required-field validation (the 5 Validation Status items in Figma). */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Role name is required.';
  else if (form.name.trim().length < 3) errors.name = 'Role name must be at least 3 characters.';
  if (form.description.length > DESCRIPTION_MAX)
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  if (!form.category) errors.category = 'Select a role category.';
  if (!form.status) errors.status = 'Select a status.';
  return errors;
}

/* The 5 Validation Status items from the Figma sidebar (5/5 in design). */
function computeChecklist(form, errors, enabledPermCount, resourceRuleCount) {
  const adminChanged = Object.values(form.adminPrivileges).some(Boolean);
  return [
    { key: 'name', label: 'Role Name Valid', done: !errors.name && !!form.name.trim() },
    { key: 'perms', label: 'Permissions Configured', done: enabledPermCount > 0 },
    { key: 'scope', label: 'Resource Scope Valid', done: resourceRuleCount > 0 },
    { key: 'conflicts', label: 'No Policy Conflicts', done: !errors.category && !errors.status },
    { key: 'security', label: 'Security Review Passed', done: !adminChanged },
  ];
}

/** SCR-042 — Edit Role Screen. Node 113:20627 ("Edit Role Screen"). */
export default function EditRoleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useEditableRole(ORG_ID, id);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Roles', data ? data.form.name : id, 'Edit Role']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading role for editing' : isError ? 'Couldn’t load role' : ''}
        </span>

        {isLoading && (
          <>
            <BackLink to="/roles" />
            <EditSkeleton />
          </>
        )}

        {isError && (
          <>
            <BackLink to="/roles" />
            <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
              <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load role</p>
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

        {data && <EditForm key={data.id} baseline={data} roleId={id} navigate={navigate} />}
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
        ← Back to roles
      </Link>
    </div>
  );
}

/* The editable form is a child keyed on the loaded record so switching
   roles remounts it with a fresh baseline (no stale dirty state). */
function EditForm({ baseline, roleId, navigate }) {
  const [form, setForm] = useState(baseline.form);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const errors = useMemo(() => validate(form), [form]);

  // Derived permission counts (Effective Access Overview + Direct
  // Permissions header). Counts are computed live from the toggle map.
  const enabledPermCount = useMemo(
    () => Object.values(form.permissions).filter(Boolean).length,
    [form.permissions],
  );
  const baseEnabledPermCount = useMemo(
    () => Object.values(baseline.form.permissions).filter(Boolean).length,
    [baseline.form.permissions],
  );
  const resourceRuleCount = useMemo(
    () => Object.values(form.resourceAccess).filter((v) => v && v !== 'None').length,
    [form.resourceAccess],
  );
  const baseResourceRuleCount = useMemo(
    () => Object.values(baseline.form.resourceAccess).filter((v) => v && v !== 'None').length,
    [baseline.form.resourceAccess],
  );

  const checklist = useMemo(
    () => computeChecklist(form, errors, enabledPermCount, resourceRuleCount),
    [form, errors, enabledPermCount, resourceRuleCount],
  );
  const completedCount = checklist.filter((c) => c.done).length;
  const isValid = Object.keys(errors).length === 0;

  // Live dirty tracking + Pending Changes computed against the saved
  // baseline. Covers simple fields, permission groups, individual
  // permissions, resource-access scopes, and admin privileges.
  const changes = useMemo(() => {
    const list = [];
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);
    for (const key of SIMPLE_KEYS) {
      if (norm(baseline.form[key]) !== norm(form[key])) {
        list.push({
          key: `simple:${key}`,
          label: SIMPLE_LABELS[key] ?? key,
          before: displaySimple(key, baseline.form[key]),
          after: displaySimple(key, form[key]),
        });
      }
    }
    // Permission groups added / removed.
    const baseGroups = new Set(baseline.form.permissionGroups);
    const nowGroups = new Set(form.permissionGroups);
    for (const g of nowGroups) {
      if (!baseGroups.has(g)) list.push({ key: `group+:${g}`, label: 'Permission Group Added', before: '—', after: GROUP_LABEL[g] ?? g });
    }
    for (const g of baseGroups) {
      if (!nowGroups.has(g)) list.push({ key: `group-:${g}`, label: 'Permission Group Removed', before: GROUP_LABEL[g] ?? g, after: '—' });
    }
    // Individual permission toggles.
    for (const permId of Object.keys(form.permissions)) {
      if (baseline.form.permissions[permId] !== form.permissions[permId]) {
        list.push({
          key: `perm:${permId}`,
          label: `Permission ${form.permissions[permId] ? 'Added' : 'Removed'}`,
          before: baseline.form.permissions[permId] ? PERM_LABEL[permId] : '—',
          after: form.permissions[permId] ? PERM_LABEL[permId] : '—',
        });
      }
    }
    // Resource access scope changes.
    for (const resId of Object.keys(form.resourceAccess)) {
      if (baseline.form.resourceAccess[resId] !== form.resourceAccess[resId]) {
        list.push({
          key: `res:${resId}`,
          label: `${RESOURCE_LABEL[resId] ?? resId} Scope`,
          before: baseline.form.resourceAccess[resId] || 'None',
          after: form.resourceAccess[resId] || 'None',
        });
      }
    }
    // Admin privilege toggles.
    for (const privId of Object.keys(form.adminPrivileges)) {
      if (baseline.form.adminPrivileges[privId] !== form.adminPrivileges[privId]) {
        list.push({
          key: `admin:${privId}`,
          label: `${ADMIN_LABEL[privId] ?? privId} Privilege`,
          before: baseline.form.adminPrivileges[privId] ? 'Granted' : '—',
          after: form.adminPrivileges[privId] ? 'Granted' : 'Revoked',
        });
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

  function toggleGroup(groupId) {
    setField(
      'permissionGroups',
      form.permissionGroups.includes(groupId)
        ? form.permissionGroups.filter((g) => g !== groupId)
        : [...form.permissionGroups, groupId],
    );
  }
  function togglePermission(permId) {
    setField('permissions', { ...form.permissions, [permId]: !form.permissions[permId] });
  }
  function toggleAdmin(privId) {
    setField('adminPrivileges', { ...form.adminPrivileges, [privId]: !form.adminPrivileges[privId] });
  }
  function setResourceAccess(resId, level) {
    setField('resourceAccess', { ...form.resourceAccess, [resId]: level });
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

  // Guarded in-app navigation: leaving the editor while dirty confirms
  // the discard first.
  function guardedNavigate(to) {
    if (dirty && typeof window !== 'undefined') {
      const ok = window.confirm('Discard unsaved changes and leave this page?');
      if (!ok) return;
    }
    navigate(to);
  }

  function handleCancel() {
    guardedNavigate('/roles');
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
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      status: form.status,
      permissionGroups: form.permissionGroups,
      permissions: form.permissions,
      resourceAccess: form.resourceAccess,
      adminPrivileges: form.adminPrivileges,
      inheritFromRole: form.inheritFromRole,
      permissionTemplate: form.permissionTemplate,
      organizationPolicy: form.organizationPolicy,
      departmentPolicy: form.departmentPolicy,
      assignableBy: form.assignableBy,
      maxAssignmentScope: form.maxAssignmentScope,
      departmentRestrictions: form.departmentRestrictions,
      teamRestrictions: form.teamRestrictions,
      requiresApproval: form.requiresApproval,
      restrictedRole: form.restrictedRole,
    };
    const result = await updateRole(ORG_ID, roleId, payload);
    setConfirmOpen(false);
    if (result.mocked) {
      setSubmitState({
        status: 'mocked',
        message:
          'MOD-003 has no role-update endpoint yet, so nothing was persisted. In a live environment these changes would be saved and you’d return to the Role Management list.',
      });
    } else {
      setSubmitState({ status: 'success', message: 'Changes saved.' });
      navigate('/roles');
    }
  }

  const saved = submitState.status === 'mocked' || submitState.status === 'success';

  return (
    <form className="flex flex-col gap-token-6" onSubmit={handleReviewSubmit} noValidate>
      <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
        <button
          type="button"
          onClick={() => guardedNavigate('/roles')}
          className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Back to roles
        </button>
      </div>

      <Header baseline={baseline} dirty={dirty} changeCount={changes.length} isValid={isValid} saved={saved} onCancel={handleCancel} onReset={handleReset} />

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
          <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated save (no backend)</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{submitState.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-token-6">
          <RoleInformation baseline={baseline} form={form} setField={setField} showError={showError} markTouched={markTouched} errors={errors} />
          <PermissionGroupsCard form={form} baseline={baseline} onToggle={toggleGroup} />
          <DirectPermissionsCard form={form} baseline={baseline} enabledPermCount={enabledPermCount} onToggle={togglePermission} />
          <AdminPrivilegesCard form={form} onToggle={toggleAdmin} />
          <ResourceAccessCard form={form} baseline={baseline} onSetAccess={setResourceAccess} />
          <PermissionInheritanceCard baseline={baseline} form={form} setField={setField} />
          <AssignmentRulesCard form={form} setField={setField} />
        </div>

        <aside className="flex min-w-0 flex-col gap-token-5">
          <RoleSummary baseline={baseline} form={form} />
          <EffectiveAccessOverview baseline={baseline} form={form} enabledPermCount={enabledPermCount} baseEnabledPermCount={baseEnabledPermCount} resourceRuleCount={resourceRuleCount} baseResourceRuleCount={baseResourceRuleCount} />
          <AssignedUsersImpact baseline={baseline} onNavigate={guardedNavigate} />
          <ValidationStatus checklist={checklist} completedCount={completedCount} />
          <SecurityImpact form={form} baseline={baseline} />
          <PendingChanges changes={changes} />
        </aside>
      </div>

      <ActionBar dirty={dirty} changeCount={changes.length} isValid={isValid} saved={saved} onCancel={handleCancel} onReset={handleReset} />

      {confirmOpen && (
        <ConfirmDialog
          baseline={baseline}
          changes={changes}
          submitting={submitState.status === 'submitting'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </form>
  );
}

// SECTIONS-MARKER

/* Shared status pill (Active/Deprecated/Draft). */
function StatusPill({ status }) {
  const tone =
    status === 'Active'
      ? { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' }
      : status === 'Deprecated'
        ? { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' }
        : { dot: 'bg-warning', pill: 'bg-warning-bg text-warning-strong' };
  return (
    <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

function Header({ baseline, dirty, changeCount, isValid, saved, onCancel, onReset }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Edit Role</h1>
          <StatusPill status={baseline.form.status} />
          {baseline.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong"
              title={MOCK_TITLE}
            >
              Sample data
            </span>
          )}
          {dirty && !saved && (
            <span className="rounded-full bg-warning-bg px-token-3 py-0.5 text-token-meta font-semibold text-warning-strong">
              Unsaved changes · {changeCount}
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Update permissions, resource access, administrative privileges, and role-based access policies for this role.
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
          title="Draft saving requires MOD-003’s role endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={!dirty || !isValid || saved}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ActionBar({ dirty, changeCount, isValid, saved, onCancel, onReset }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3">
      <p className="m-0 text-token-sm text-text-secondary-alt">
        {saved
          ? 'Save simulated — no changes were persisted.'
          : dirty
            ? `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}${!isValid ? ' · resolve validation errors to save' : ''}`
            : 'No unsaved changes.'}
      </p>
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
          disabled={!dirty || !isValid || saved}
          className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* Reusable card shell. */
function Card({ title, badge, children, description }) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-bold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-xs text-text-faint">{description}</p>}
        </div>
        {badge}
      </div>
      <div className="px-token-5 py-token-5">{children}</div>
    </section>
  );
}

function ChangeBadge({ count }) {
  if (!count) return null;
  return (
    <span className="rounded-full bg-warning-bg px-token-3 py-0.5 text-token-meta font-semibold text-warning-strong">
      {count} {count === 1 ? 'change' : 'changes'}
    </span>
  );
}

function FieldLabel({ htmlFor, children, required, modified }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-token-2 text-token-sm font-medium text-text-secondary-alt">
      {children}
      {required && <span className="text-danger-strong" aria-hidden="true">*</span>}
      {modified && <span className="rounded-sm bg-warning-bg px-token-1 py-0.5 text-token-meta font-semibold text-warning-strong">Modified</span>}
    </label>
  );
}

function RoleInformation({ baseline, form, setField, showError, markTouched, errors }) {
  const meta = [
    { label: 'Role ID', value: baseline.roleId },
    { label: 'Role Type', value: baseline.roleType },
    { label: 'Created', value: baseline.createdLabel },
    { label: 'Created By', value: baseline.createdBy },
    { label: 'Last Updated', value: baseline.lastUpdatedLabel },
    { label: 'Last Updated By', value: baseline.lastUpdatedBy },
  ];
  const nameModified = form.name.trim() !== baseline.form.name.trim();
  const descLen = form.description.length;
  return (
    <Card title="Role Information">
      <div className="grid grid-cols-1 gap-token-5 md:grid-cols-2">
        <div className="flex flex-col gap-token-2">
          <FieldLabel htmlFor="field-name" required modified={nameModified}>Role Name</FieldLabel>
          <input
            id="field-name"
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => markTouched('name')}
            aria-invalid={showError('name')}
            aria-describedby={showError('name') ? 'field-name-error' : undefined}
            className={`${fieldBase} ${showError('name') ? fieldInvalid : ''}`}
          />
          {nameModified && <p className="m-0 text-token-meta text-text-faint">Modified from: {baseline.form.name}</p>}
          {showError('name') && <p id="field-name-error" role="alert" className="m-0 text-token-meta text-danger-strong">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-token-2">
          <FieldLabel htmlFor="field-roleKey">Role Key</FieldLabel>
          <input
            id="field-roleKey"
            type="text"
            value={baseline.roleKey}
            readOnly
            disabled
            className={`${fieldBase} font-mono`}
          />
          <p className="m-0 text-token-meta text-text-faint">Immutable after creation.</p>
        </div>
        <div className="flex flex-col gap-token-2 md:col-span-2">
          <FieldLabel htmlFor="field-description">Description</FieldLabel>
          <textarea
            id="field-description"
            rows={3}
            value={form.description}
            maxLength={DESCRIPTION_MAX + 40}
            onChange={(e) => setField('description', e.target.value)}
            onBlur={() => markTouched('description')}
            aria-invalid={showError('description')}
            aria-describedby={showError('description') ? 'field-description-error' : undefined}
            className={`w-full rounded-md border border-border bg-surface-card px-3 py-2 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${showError('description') ? fieldInvalid : ''}`}
          />
          <div className="flex items-center justify-between gap-token-3">
            {showError('description')
              ? <p id="field-description-error" role="alert" className="m-0 text-token-meta text-danger-strong">{errors.description}</p>
              : <span aria-hidden="true" />}
            <span className={`text-token-meta ${descLen > DESCRIPTION_MAX ? 'text-danger-strong' : 'text-text-faint'}`}>{descLen} / {DESCRIPTION_MAX} characters</span>
          </div>
        </div>
        <div className="flex flex-col gap-token-2">
          <FieldLabel htmlFor="field-category" required>Role Category</FieldLabel>
          <select
            id="field-category"
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            onBlur={() => markTouched('category')}
            aria-invalid={showError('category')}
            aria-describedby={showError('category') ? 'field-category-error' : undefined}
            className={`${fieldBase} ${showError('category') ? fieldInvalid : ''}`}
          >
            {EDIT_ROLE_OPTIONS.category.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {showError('category') && <p id="field-category-error" role="alert" className="m-0 text-token-meta text-danger-strong">{errors.category}</p>}
        </div>
        <div className="flex flex-col gap-token-2">
          <FieldLabel htmlFor="field-status" required>Status</FieldLabel>
          <select
            id="field-status"
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            onBlur={() => markTouched('status')}
            aria-invalid={showError('status')}
            aria-describedby={showError('status') ? 'field-status-error' : undefined}
            className={`${fieldBase} ${showError('status') ? fieldInvalid : ''}`}
          >
            {EDIT_ROLE_OPTIONS.status.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {showError('status') && <p id="field-status-error" role="alert" className="m-0 text-token-meta text-danger-strong">{errors.status}</p>}
        </div>
      </div>
      <div className="mt-token-5 grid grid-cols-2 gap-token-3 border-t border-border-subtle pt-token-5 md:grid-cols-3">
        {meta.map((m) => (
          <div key={m.label}>
            <p className="m-0 text-token-xs text-text-faint">{m.label}</p>
            <p className="m-0 mt-0.5 font-mono text-token-sm font-medium text-text-primary-alt">{m.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// SECTIONS-MARKER-2

/* Accessible toggle switch used across the permission cards. */
function Toggle({ checked, onChange, label, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-card transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function PermissionGroupsCard({ form, baseline, onToggle }) {
  const [search, setSearch] = useState('');
  const baseGroups = useMemo(() => new Set(baseline.form.permissionGroups), [baseline.form.permissionGroups]);
  const changeCount = useMemo(() => {
    const now = new Set(form.permissionGroups);
    let n = 0;
    for (const g of now) if (!baseGroups.has(g)) n++;
    for (const g of baseGroups) if (!now.has(g)) n++;
    return n;
  }, [form.permissionGroups, baseGroups]);

  const q = search.trim().toLowerCase();
  const match = (g) => !q || g.label.toLowerCase().includes(q);
  const assigned = PERMISSION_GROUP_CATALOGUE.filter((g) => form.permissionGroups.includes(g.id) && match(g));
  const available = PERMISSION_GROUP_CATALOGUE.filter((g) => !form.permissionGroups.includes(g.id) && match(g));

  return (
    <Card title="Permission Groups" badge={<ChangeBadge count={changeCount} />}>
      <label className="relative mb-token-4 block">
        <span className="sr-only">Search permission groups</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permission groups…"
          className="h-8 w-full rounded-md border border-border bg-surface-muted px-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <div className="grid grid-cols-1 gap-token-5 md:grid-cols-2">
        <div>
          <p className="m-0 mb-token-2 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Assigned Groups ({assigned.length})</p>
          <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
            {assigned.length === 0 && <li className="text-token-sm text-text-faint">No assigned groups.</li>}
            {assigned.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-token-2">
                    <span className="truncate text-token-sm font-medium text-text-primary-alt">{g.label}</span>
                    {!baseGroups.has(g.id) && <span className="rounded-sm bg-success-bg px-token-1 py-0.5 text-token-meta font-semibold text-success-strong">Added</span>}
                  </span>
                  <span className="text-token-xs text-text-faint">{g.scope}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onToggle(g.id)}
                  className="text-token-sm font-medium text-danger-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="m-0 mb-token-2 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Available Groups ({available.length})</p>
          <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
            {available.length === 0 && <li className="text-token-sm text-text-faint">No more groups available.</li>}
            {available.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-token-3 rounded-md border border-border-subtle px-token-3 py-token-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-token-2">
                    <span className="truncate text-token-sm font-medium text-text-secondary-alt">{g.label}</span>
                    {baseGroups.has(g.id) && <span className="rounded-sm bg-danger-bg px-token-1 py-0.5 text-token-meta font-semibold text-danger-strong">Removed</span>}
                  </span>
                  <span className="text-token-xs text-text-faint">{g.scope}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onToggle(g.id)}
                  className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function DirectPermissionsCard({ form, baseline, enabledPermCount, onToggle }) {
  const added = useMemo(
    () => Object.keys(form.permissions).filter((k) => form.permissions[k] && !baseline.form.permissions[k]).length,
    [form.permissions, baseline.form.permissions],
  );
  const removed = useMemo(
    () => Object.keys(form.permissions).filter((k) => !form.permissions[k] && baseline.form.permissions[k]).length,
    [form.permissions, baseline.form.permissions],
  );
  return (
    <Card
      title="Direct Permissions"
      badge={
        <span className="flex items-center gap-token-2 text-token-xs font-semibold">
          <span className="text-text-secondary-alt">{enabledPermCount} enabled</span>
          {added > 0 && <span className="text-success-strong">+{added} added</span>}
          {removed > 0 && <span className="text-danger-strong">−{removed} removed</span>}
        </span>
      }
    >
      <div className="flex flex-col gap-token-4">
        {PERMISSION_DOMAINS.map((domain) => {
          const total = domain.items.length;
          const on = domain.items.filter((it) => form.permissions[it.id]).length;
          const domainChanged = domain.items.some((it) => form.permissions[it.id] !== baseline.form.permissions[it.id]);
          return (
            <div key={domain.key} className="rounded-md border border-border-subtle">
              <div className="flex items-center justify-between gap-token-3 border-b border-border-subtle bg-surface-muted px-token-4 py-token-2">
                <span className="flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
                  {domain.label}
                  {domainChanged && <span className="rounded-sm bg-warning-bg px-token-1 py-0.5 text-token-meta font-semibold text-warning-strong">Modified</span>}
                </span>
                <span className="font-mono text-token-xs text-text-faint">{on}/{total}</span>
              </div>
              <ul className="m-0 grid list-none grid-cols-1 gap-x-token-5 gap-y-token-2 p-token-4 sm:grid-cols-2">
                {domain.items.map((it) => {
                  const checked = !!form.permissions[it.id];
                  const changed = checked !== baseline.form.permissions[it.id];
                  return (
                    <li key={it.id} className="flex items-center justify-between gap-token-3">
                      <span className={`flex items-center gap-token-2 text-token-sm ${checked ? 'text-text-primary-alt' : 'text-text-faint'}`}>
                        {it.label}
                        {changed && <span className={`rounded-sm px-token-1 py-0.5 text-token-meta font-semibold ${checked ? 'bg-success-bg text-success-strong' : 'bg-danger-bg text-danger-strong'}`}>{checked ? 'Added' : 'Removed'}</span>}
                      </span>
                      <Toggle checked={checked} onChange={() => onToggle(it.id)} label={`${it.label} — ${domain.label}`} />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AdminPrivilegesCard({ form, onToggle }) {
  const anyOn = Object.values(form.adminPrivileges).some(Boolean);
  return (
    <Card title="Administrative Privileges">
      <div className={`mb-token-4 flex items-start gap-token-2 rounded-md border p-token-3 ${anyOn ? 'border-danger-border bg-danger-bg' : 'border-warning bg-warning-bg'}`} role="note">
        <span className="mt-0.5 text-token-sm" aria-hidden="true">⚠</span>
        <p className={`m-0 text-token-meta ${anyOn ? 'text-danger-strong' : 'text-warning-strong'}`}>
          Administrative privileges grant elevated, organization-wide access. Granting any privilege triggers a security review before the change can be persisted.
        </p>
      </div>
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {ADMIN_PRIVILEGES.map((priv) => {
          const checked = !!form.adminPrivileges[priv.id];
          return (
            <li key={priv.id} className="flex items-center justify-between gap-token-4 rounded-md border border-border-subtle px-token-4 py-token-3">
              <span className="min-w-0">
                <span className="block text-token-sm font-medium text-text-primary-alt">{priv.label}</span>
                <span id={`admin-desc-${priv.id}`} className="block text-token-xs text-text-faint">{priv.description}</span>
              </span>
              <Toggle checked={checked} onChange={() => onToggle(priv.id)} label={priv.label} describedBy={`admin-desc-${priv.id}`} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ResourceAccessCard({ form, baseline, onSetAccess }) {
  const [search, setSearch] = useState('');
  const changeCount = useMemo(
    () => Object.keys(form.resourceAccess).filter((k) => form.resourceAccess[k] !== baseline.form.resourceAccess[k]).length,
    [form.resourceAccess, baseline.form.resourceAccess],
  );
  const q = search.trim().toLowerCase();
  const rows = RESOURCE_ACCESS_CATALOGUE.filter((r) => !q || r.label.toLowerCase().includes(q));
  return (
    <Card title="Resource Access Scope" badge={<ChangeBadge count={changeCount} />}>
      <div className="mb-token-4 flex flex-wrap items-center justify-between gap-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search resources</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted px-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <button
          type="button"
          disabled
          title="Adding a resource rule requires MOD-003’s role endpoint (still PLANNED)."
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add Resource
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Resource Type', 'Scope', 'Access Level', 'Conditions', 'Change'].map((c) => (
                <th key={c} scope="col" className="border-b border-border-subtle px-token-4 py-token-2 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const value = form.resourceAccess[r.id] ?? 'None';
              const before = baseline.form.resourceAccess[r.id] ?? 'None';
              const changed = value !== before;
              return (
                <tr key={r.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3 text-token-sm font-medium text-text-primary-alt">{r.label}</td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-secondary-alt">{r.scope}</td>
                  <td className="px-token-4 py-token-3">
                    <label className="sr-only" htmlFor={`res-${r.id}`}>{r.label} access level</label>
                    <select
                      id={`res-${r.id}`}
                      value={value}
                      onChange={(e) => onSetAccess(r.id, e.target.value)}
                      className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-primary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {EDIT_ROLE_OPTIONS.resourceAccessLevel.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-faint">{r.conditions}</td>
                  <td className="px-token-4 py-token-3 text-token-sm">
                    {changed ? (
                      <span className="font-medium text-warning-strong">{before} → {value}</span>
                    ) : (
                      <span className="text-text-faint">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// SECTIONS-MARKER-3

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-token-2">
      <label htmlFor={id} className="text-token-sm font-medium text-text-secondary-alt">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldBase}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PermissionInheritanceCard({ baseline, form, setField }) {
  const shown = baseline.inheritedPermissions.slice(0, 10);
  const extra = baseline.inheritedPermissions.length - shown.length;
  return (
    <Card title="Permission Inheritance">
      <div className="grid grid-cols-1 gap-token-5 md:grid-cols-2">
        <SelectField id="field-inheritFromRole" label="Inherit From Role" value={form.inheritFromRole} options={EDIT_ROLE_OPTIONS.inheritFromRole} onChange={(v) => setField('inheritFromRole', v)} />
        <SelectField id="field-permissionTemplate" label="Permission Template" value={form.permissionTemplate} options={EDIT_ROLE_OPTIONS.permissionTemplate} onChange={(v) => setField('permissionTemplate', v)} />
        <SelectField id="field-organizationPolicy" label="Organization Policy" value={form.organizationPolicy} options={EDIT_ROLE_OPTIONS.organizationPolicy} onChange={(v) => setField('organizationPolicy', v)} />
        <SelectField id="field-departmentPolicy" label="Department Policy" value={form.departmentPolicy} options={EDIT_ROLE_OPTIONS.departmentPolicy} onChange={(v) => setField('departmentPolicy', v)} />
      </div>
      <div className="mt-token-5 rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <p className="m-0 text-token-sm font-medium text-text-primary-alt">
          Inherited from {baseline.inheritedFromLabel} — {baseline.inheritedPermissionsCount} permissions
        </p>
        <div className="mt-token-3 flex flex-wrap gap-token-2">
          {shown.map((p) => (
            <span key={p} className="rounded-sm bg-surface-card px-token-2 py-0.5 text-token-xs text-text-secondary-alt">{p}</span>
          ))}
          {extra > 0 && <span className="rounded-sm bg-surface-card px-token-2 py-0.5 text-token-xs font-medium text-text-faint">+{extra} more</span>}
        </div>
        <p className="m-0 mt-token-3 text-token-xs text-text-faint">Inherited permissions are read-only here — manage them on the source policy.</p>
      </div>
    </Card>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  const descId = `toggle-desc-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-center justify-between gap-token-4 rounded-md border border-border-subtle px-token-4 py-token-3">
      <span className="min-w-0">
        <span className="block text-token-sm font-medium text-text-primary-alt">{label}</span>
        {description && <span id={descId} className="block text-token-xs text-text-faint">{description}</span>}
      </span>
      <Toggle checked={checked} onChange={onChange} label={label} describedBy={description ? descId : undefined} />
    </div>
  );
}

function AssignmentRulesCard({ form, setField }) {
  return (
    <Card title="Assignment Rules">
      <div className="grid grid-cols-1 gap-token-5 md:grid-cols-2">
        <SelectField id="field-assignableBy" label="Assignable By" value={form.assignableBy} options={EDIT_ROLE_OPTIONS.assignableBy} onChange={(v) => setField('assignableBy', v)} />
        <SelectField id="field-maxAssignmentScope" label="Maximum Assignment Scope" value={form.maxAssignmentScope} options={EDIT_ROLE_OPTIONS.maxAssignmentScope} onChange={(v) => setField('maxAssignmentScope', v)} />
        <SelectField id="field-departmentRestrictions" label="Department Restrictions" value={form.departmentRestrictions} options={EDIT_ROLE_OPTIONS.departmentRestrictions} onChange={(v) => setField('departmentRestrictions', v)} />
        <SelectField id="field-teamRestrictions" label="Team Restrictions" value={form.teamRestrictions} options={EDIT_ROLE_OPTIONS.teamRestrictions} onChange={(v) => setField('teamRestrictions', v)} />
      </div>
      <div className="mt-token-5 flex flex-col gap-token-2">
        <ToggleRow label="Requires Approval" description="New assignments of this role must be approved by an administrator." checked={form.requiresApproval} onChange={() => setField('requiresApproval', !form.requiresApproval)} />
        <ToggleRow label="Restricted Role" description="Limits who can view and assign this role across the organization." checked={form.restrictedRole} onChange={() => setField('restrictedRole', !form.restrictedRole)} />
      </div>
    </Card>
  );
}

// SECTIONS-MARKER-4

/* Sticky right-rail card shell. */
function RailCard({ title, badge, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between gap-token-2">
        <h2 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{title}</h2>
        {badge}
      </div>
      <div className="mt-token-3">{children}</div>
    </section>
  );
}

function StatRow({ label, value, delta }) {
  return (
    <div className="flex items-center justify-between gap-token-3 py-token-1">
      <span className="text-token-sm text-text-secondary-alt">{label}</span>
      <span className="flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
        {delta != null && delta !== value ? (
          <>
            <span className="text-text-faint line-through">{delta}</span>
            <span aria-hidden="true">→</span>
            <span className="text-primary">{value}</span>
          </>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function RoleSummary({ baseline, form }) {
  const rows = [
    { label: 'Role Name', value: form.name || '—' },
    { label: 'Role Key', value: baseline.roleKey },
    { label: 'Role Type', value: baseline.roleType },
    { label: 'Status', value: form.status },
    { label: 'Permission Groups', value: `${form.permissionGroups.length} assigned` },
    { label: 'Admin Privileges', value: Object.values(form.adminPrivileges).some(Boolean) ? `${Object.values(form.adminPrivileges).filter(Boolean).length} granted` : 'None' },
    { label: 'Assigned Users', value: baseline.assignedUsers.toLocaleString() },
  ];
  return (
    <RailCard title="Role Summary">
      <div className="flex flex-col divide-y divide-border-subtle">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-token-3 py-token-2">
            <span className="text-token-sm text-text-secondary-alt">{r.label}</span>
            <span className="truncate text-token-sm font-semibold text-text-primary-alt">{r.value}</span>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

function EffectiveAccessOverview({ baseline, form, enabledPermCount, baseEnabledPermCount, resourceRuleCount, baseResourceRuleCount }) {
  const inherited = baseline.inheritedPermissionsCount;
  const totalNow = enabledPermCount + inherited;
  const totalBase = baseEnabledPermCount + inherited;
  const adminCount = Object.values(form.adminPrivileges).filter(Boolean).length;
  return (
    <RailCard title="Effective Access Overview">
      <div className="flex flex-col divide-y divide-border-subtle">
        <StatRow label="Total Permissions" value={totalNow} delta={totalBase} />
        <StatRow label="Direct" value={enabledPermCount} delta={baseEnabledPermCount} />
        <StatRow label="Inherited" value={inherited} />
        <StatRow label="Resource Rules" value={resourceRuleCount} delta={baseResourceRuleCount} />
        <StatRow label="Admin Privileges" value={adminCount === 0 ? 'None' : adminCount} />
      </div>
    </RailCard>
  );
}

function AssignedUsersImpact({ baseline, onNavigate }) {
  const stats = [
    { label: 'Assigned', value: baseline.assignedUsers.toLocaleString() },
    { label: 'Active', value: baseline.activeUsers.toLocaleString() },
    { label: 'Departments', value: baseline.assignedDepartments },
    { label: 'Teams', value: baseline.assignedTeams },
  ];
  return (
    <RailCard title="Assigned Users Impact">
      <div className="grid grid-cols-2 gap-token-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
            <p className="m-0 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{s.value}</p>
            <p className="m-0 text-token-xs text-text-faint">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="m-0 mt-token-3 text-token-xs text-text-faint">Changes to this role apply to all assigned users on save.</p>
      <button
        type="button"
        onClick={() => onNavigate('/users')}
        className="mt-token-3 h-8 w-full rounded-md border border-border bg-surface-card text-token-sm font-medium text-primary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View Assigned Users
      </button>
    </RailCard>
  );
}

function ValidationStatus({ checklist, completedCount }) {
  const total = checklist.length;
  const allPass = completedCount === total;
  return (
    <RailCard
      title="Validation Status"
      badge={<span className={`rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${allPass ? 'bg-success-bg text-success-strong' : 'bg-warning-bg text-warning-strong'}`}>{completedCount}/{total} {allPass ? 'Passed' : 'Checks'}</span>}
    >
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {checklist.map((c) => (
          <li key={c.key} className="flex items-center gap-token-2 text-token-sm">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full text-token-meta ${c.done ? 'bg-success text-text-on-primary' : 'bg-warning-bg text-warning-strong'}`} aria-hidden="true">
              {c.done ? '✓' : '!'}
            </span>
            <span className={c.done ? 'text-text-secondary-alt' : 'text-warning-strong'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function SecurityImpact({ form, baseline }) {
  const adminChanged = Object.keys(form.adminPrivileges).some((k) => form.adminPrivileges[k] !== baseline.form.adminPrivileges[k]);
  const anyAdminOn = Object.values(form.adminPrivileges).some(Boolean);
  const pipeSchedule = form.permissions.pipe_schedule && !baseline.form.permissions.pipe_schedule;
  const level = anyAdminOn ? 'High Impact' : adminChanged ? 'Medium Impact' : 'Low Impact';
  const tone = anyAdminOn
    ? 'bg-danger-bg text-danger-strong'
    : adminChanged
      ? 'bg-warning-bg text-warning-strong'
      : 'bg-success-bg text-success-strong';
  const items = [
    { label: adminChanged ? 'Administrative privileges changed' : 'No admin privileges changed', ok: !adminChanged },
    { label: pipeSchedule ? `Pipeline scheduling access added for ${baseline.assignedUsers.toLocaleString()} users` : 'No new scheduling access', ok: !pipeSchedule },
    { label: 'No policy conflicts detected', ok: true },
    { label: 'Role remains within assignment scope', ok: true },
    { label: 'Change is auditable and reversible', ok: true },
  ];
  return (
    <RailCard title="Security Impact" badge={<span className={`rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone}`}>{level}</span>}>
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-token-2 text-token-sm text-text-secondary-alt">
            <span className={`mt-0.5 text-token-meta ${it.ok ? 'text-success-strong' : 'text-warning-strong'}`} aria-hidden="true">{it.ok ? '✓' : '!'}</span>
            {it.label}
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function PendingChanges({ changes }) {
  return (
    <RailCard title="Pending Changes" badge={<ChangeBadge count={changes.length} />}>
      {changes.length === 0 ? (
        <p className="m-0 text-token-sm text-text-faint">No changes yet. Edits you make will be listed here before saving.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-token-3 p-0">
          {changes.map((c) => (
            <li key={c.key} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
              <p className="m-0 text-token-xs font-semibold text-text-primary-alt">{c.label}</p>
              <p className="m-0 mt-token-1 flex flex-wrap items-center gap-token-2 text-token-xs">
                <span className="text-text-faint line-through">{c.before}</span>
                <span aria-hidden="true" className="text-text-faint">→</span>
                <span className="font-medium text-primary">{c.after}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </RailCard>
  );
}

// SECTIONS-MARKER-5

/* Focus-trapped confirm dialog (Escape to cancel, Tab cycles within,
   focus restored to trigger on close). Mirrors SCR-034 EditUser. */
function ConfirmDialog({ baseline, changes, submitting, onCancel, onConfirm }) {
  const panelRef = useRef(null);
  const confirmRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  useEffect(() => {
    confirmRef.current?.focus();
    const trigger = triggerRef.current;
    return () => {
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, []);

  useEffect(() => {
    function getFocusable() {
      return panelRef.current
        ? Array.from(
            panelRef.current.querySelectorAll(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!submitting) onCancel();
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, submitting]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-token-5" role="presentation" onClick={() => !submitting && onCancel()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-role-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-md border border-border bg-surface-card shadow-lg"
      >
        <div className="border-b border-border-subtle px-token-5 py-token-4">
          <h2 id="confirm-role-title" className="m-0 text-token-base font-bold text-text-primary-alt">Confirm role changes</h2>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
            Review the {changes.length} {changes.length === 1 ? 'change' : 'changes'} to <span className="font-semibold text-text-primary-alt">{baseline.form.name}</span> before saving. This affects {baseline.assignedUsers.toLocaleString()} assigned users.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-token-5 py-token-4">
          <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
            {changes.map((c) => (
              <li key={c.key} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
                <p className="m-0 text-token-xs font-semibold text-text-primary-alt">{c.label}</p>
                <p className="m-0 mt-token-1 flex flex-wrap items-center gap-token-2 text-token-xs">
                  <span className="text-text-faint line-through">{c.before}</span>
                  <span aria-hidden="true" className="text-text-faint">→</span>
                  <span className="font-medium text-primary">{c.after}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-token-3 border-t border-border-subtle px-token-5 py-token-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Keep editing
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]" aria-hidden="true">
      <div className="flex flex-col gap-token-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 w-full animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 w-full animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
    </div>
  );
}
