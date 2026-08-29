import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { saveUserPermissions, ACCESS_LEVEL_OPTIONS } from '../services/userPermissions.api';

/* Scope to the caller's organization — mirrors the sibling user screens
   (SCR-035) until a live "current org" endpoint ships. */
const ORG_ID = 'current';

const MOD_TITLE =
  'Requires the MOD-003 RBAC / MOD-005 user backend, which is not deployed yet.';

const STATE_TONE = {
  Granted: 'bg-success-bg text-success-strong',
  Inherited: 'bg-shell-accent-wash text-primary',
  Denied: 'bg-surface-muted text-text-faint',
};

/** SCR-039 — User Permission Management Screen. Node 109:16386. */
export default function UserPermissionManagementScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useUserPermissions(ORG_ID, id);

  const displayName = data ? data.name : id;

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users', displayName, 'Permission Management']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading user permissions'
            : isError
              ? 'Couldn’t load permissions'
              : data
                ? `${displayName} permissions loaded`
                : ''}
        </span>

        <BackLink userId={id} />

        {isLoading && <PermissionsSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load permissions</p>
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

        {data && <PermissionView record={data} userId={id} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

function BackLink({ userId }) {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to={`/users/${encodeURIComponent(userId ?? '')}`}
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to User Details
      </Link>
    </div>
  );
}

function PermissionView({ record, userId, navigate }) {
  // Local editable slices of the record. A real MOD-003 backend would
  // persist these; here they drive the "Unsaved changes" / Pending
  // Changes / Save state machine entirely client-side.
  const [assignedGroups, setAssignedGroups] = useState(record.assignedGroups);
  const [availableGroups, setAvailableGroups] = useState(record.availableGroups);
  const [resources, setResources] = useState(record.resources);
  const [adminPrivileges, setAdminPrivileges] = useState(record.adminPrivileges);
  const [groupQuery, setGroupQuery] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveMessage, setSaveMessage] = useState('');

  const pending = useMemo(() => {
    const changes = [];
    const baseGroupIds = new Set(record.assignedGroups.map((g) => g.id));
    assignedGroups.forEach((g) => {
      if (!baseGroupIds.has(g.id)) changes.push(`${g.name} group added`);
    });
    record.assignedGroups.forEach((g) => {
      if (!assignedGroups.some((x) => x.id === g.id)) changes.push(`${g.name} group removed`);
    });
    resources.forEach((r) => {
      const orig = record.resources.find((x) => x.id === r.id);
      if (orig && orig.accessLevel !== r.accessLevel) {
        changes.push(`${r.resource} → ${r.accessLevel}`);
      }
    });
    adminPrivileges.forEach((a) => {
      const orig = record.adminPrivileges.find((x) => x.key === a.key);
      if (orig && orig.enabled !== a.enabled) {
        changes.push(`${a.label} ${a.enabled ? 'enabled' : 'disabled'}`);
      }
    });
    return changes;
  }, [assignedGroups, resources, adminPrivileges, record]);

  const dirty = pending.length > 0;

  const filteredAvailable = availableGroups.filter((g) =>
    g.name.toLowerCase().includes(groupQuery.trim().toLowerCase()),
  );

  function addGroup(group) {
    setAssignedGroups((prev) => [...prev, group]);
    setAvailableGroups((prev) => prev.filter((g) => g.id !== group.id));
  }
  function removeGroup(group) {
    setAssignedGroups((prev) => prev.filter((g) => g.id !== group.id));
    setAvailableGroups((prev) => [...prev, group]);
  }
  function setResourceAccess(resId, level) {
    setResources((prev) => prev.map((r) => (r.id === resId ? { ...r, accessLevel: level } : r)));
  }
  function toggleAdmin(key) {
    setAdminPrivileges((prev) =>
      prev.map((a) => (a.key === key ? { ...a, enabled: !a.enabled } : a)),
    );
  }
  function resetChanges() {
    setAssignedGroups(record.assignedGroups);
    setAvailableGroups(record.availableGroups);
    setResources(record.resources);
    setAdminPrivileges(record.adminPrivileges);
    setSaveState('idle');
    setSaveMessage('');
  }

  async function handleSave() {
    setSaveState('saving');
    setSaveMessage('');
    const result = await saveUserPermissions(ORG_ID, userId, {
      assignedGroupIds: assignedGroups.map((g) => g.id),
      resourceAccess: resources.map((r) => ({ id: r.id, accessLevel: r.accessLevel })),
      adminPrivileges: adminPrivileges.map((a) => ({ key: a.key, enabled: a.enabled })),
    });
    if (result.mocked) {
      setSaveState('saved');
      setSaveMessage(
        'Changes captured locally. The MOD-003/MOD-005 backend is not deployed, so nothing was persisted.',
      );
    } else {
      setSaveState('saved');
      setSaveMessage('Permission changes saved.');
    }
  }

  const grantedCount = record.effectivePermissions
    .flatMap((c) => c.rows)
    .filter((r) => r.state === 'Granted').length;
  const inheritedCount = record.effectivePermissions
    .flatMap((c) => c.rows)
    .filter((r) => r.state === 'Inherited').length;

  return (
    <div className="flex flex-col gap-token-6">
      {record.mocked && (
        <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <IconInfo className="mt-0.5 block h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-sm text-warning">
            <span className="font-semibold">Sample data.</span> The MOD-003 RBAC / MOD-005 user
            backend is not deployed yet, so this permission record is design-sourced. Edits are held
            locally and cannot be persisted.
          </p>
        </div>
      )}

      <Header
        dirty={dirty}
        saveState={saveState}
        onCancel={() => navigate(`/users/${encodeURIComponent(userId)}`)}
        onReset={resetChanges}
        onSave={handleSave}
      />

      {saveMessage && (
        <div className="rounded-md border border-shell-accent-wash bg-shell-accent-wash p-token-4" role="status">
          <p className="m-0 text-token-sm text-primary">{saveMessage}</p>
        </div>
      )}

      <UserBanner record={record} userId={userId} navigate={navigate} />

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-token-6">
          <RolesSection record={record} />
          <PermissionGroupsSection
            assigned={assignedGroups}
            available={filteredAvailable}
            query={groupQuery}
            onQuery={setGroupQuery}
            onAdd={addGroup}
            onRemove={removeGroup}
          />
          <EffectivePermissionsSection categories={record.effectivePermissions} />
          <ResourceAccessSection resources={resources} onAccess={setResourceAccess} />
          <AdminPrivilegesSection privileges={adminPrivileges} onToggle={toggleAdmin} />
          <InheritedAccessSection sources={record.inheritedAccess} />
        </div>

        <aside className="flex flex-col gap-token-5">
          <EffectiveAccessSummary
            granted={grantedCount}
            inherited={inheritedCount}
            resources={resources.length}
            groups={assignedGroups.length}
          />
          <SecurityImpactCard adminPrivileges={adminPrivileges} />
          <ValidationStatusCard />
          <PendingChangesCard pending={pending} />
          <PermissionAuditCard audit={record.audit} />
        </aside>
      </div>
    </div>
  );
}

function Header({ dirty, saveState, onCancel, onReset, onSave }) {
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-xl font-bold text-text-primary-alt">User Permission Management</h1>
          {dirty && (
            <span className="inline-flex items-center gap-token-2 rounded-full bg-warning-bg px-token-3 py-0.5 text-token-meta font-semibold text-warning-strong">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Assign roles and permission groups, review effective access, and manage resource-level grants.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled
          title={MOD_TITLE}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Compare Permissions
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reset Changes
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saveState === 'saving'}
          className="flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {saveState === 'saving' ? 'Saving…' : 'Save Permission Changes'}
        </button>
      </div>
    </div>
  );
}

function UserBanner({ record, userId, navigate }) {
  const fields = [
    ['Current Role', record.banner.currentRole],
    ['Department', record.banner.department],
    ['Team', record.banner.team],
    ['Account Status', record.banner.accountStatus],
    ['License', record.banner.license],
  ];
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-token-4">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-base font-semibold text-primary">
          {record.initials}
        </span>
        <div className="min-w-0">
          <p className="m-0 text-token-lg font-semibold text-text-primary-alt">{record.name}</p>
          <p className="m-0 text-token-sm text-text-secondary-alt">{record.email}</p>
          <dl className="mt-token-3 grid grid-cols-2 gap-x-token-6 gap-y-token-2 sm:grid-cols-3 lg:grid-cols-5">
            {fields.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-token-1">
                <dt className="text-token-meta text-text-faint">{label}</dt>
                <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-token-2">
        <button
          type="button"
          onClick={() => navigate(`/users/${encodeURIComponent(userId)}`)}
          className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View User Details
        </button>
        <button
          type="button"
          onClick={() => navigate(`/users/${encodeURIComponent(userId)}/activity`)}
          className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View Activity
        </button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="min-w-0">
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {subtitle && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-token-5">{children}</div>
    </section>
  );
}

function RolesSection({ record }) {
  return (
    <Section
      title="Roles"
      action={
        <button type="button" disabled title={MOD_TITLE} className="h-8 shrink-0 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          + Add Role
        </button>
      }
    >
      <div className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <div className="flex items-center justify-between gap-token-3">
          <div className="flex items-center gap-token-2">
            <span className="rounded-full bg-shell-accent-wash px-token-3 py-0.5 text-token-meta font-semibold text-primary">Primary</span>
            <span className="text-token-sm font-semibold text-text-primary-alt">{record.primaryRole}</span>
          </div>
        </div>
        <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">{record.primaryRoleDescription}</p>
      </div>

      <div className="mt-token-4">
        <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Additional Roles</p>
        <ul className="mt-token-2 flex flex-wrap gap-token-2">
          {record.additionalRoles.map((r) => (
            <li key={r.id} className="flex items-center gap-token-2 rounded-full border border-border bg-surface-card px-token-3 py-0.5 text-token-sm font-medium text-text-primary-alt">
              {r.label}
              <button type="button" disabled title={MOD_TITLE} aria-label={`Remove ${r.label}`} className="text-text-faint disabled:cursor-not-allowed disabled:opacity-60">
                <IconX className="block h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-token-4 flex items-center gap-token-2 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3">
        <IconInfo className="block h-4 w-4 shrink-0 text-text-faint" />
        <span className="text-token-sm text-text-secondary-alt">{record.administrativePrivilegesSummary}</span>
      </div>
    </Section>
  );
}

function PermissionGroupsSection({ assigned, available, query, onQuery, onAdd, onRemove }) {
  return (
    <Section title="Permission Groups" subtitle="Groups bundle related permissions and can be scoped to a department or the whole organization.">
      <div className="grid grid-cols-1 gap-token-5 lg:grid-cols-2">
        <div>
          <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Assigned ({assigned.length})</p>
          <ul className="mt-token-3 flex flex-col gap-token-2">
            {assigned.length === 0 && (
              <li className="rounded-md border border-dashed border-border-subtle px-token-4 py-token-4 text-center text-token-sm text-text-faint">
                No groups assigned.
              </li>
            )}
            {assigned.map((g) => (
              <li key={g.id} className="rounded-md border border-border-subtle bg-surface-card p-token-4">
                <div className="flex items-start justify-between gap-token-3">
                  <div className="min-w-0">
                    <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
                      {g.name}
                      <span className="rounded-full bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">{g.scope}</span>
                    </p>
                    <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{g.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(g)}
                    className="h-7 shrink-0 rounded-md border border-border px-token-2 text-token-meta font-medium text-danger-strong hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Available</p>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search groups…"
            aria-label="Search available permission groups"
            className="mt-token-3 h-9 w-full rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <ul className="mt-token-3 flex flex-col gap-token-2">
            {available.length === 0 && (
              <li className="rounded-md border border-dashed border-border-subtle px-token-4 py-token-4 text-center text-token-sm text-text-faint">
                No matching groups.
              </li>
            )}
            {available.map((g) => (
              <li key={g.id} className="rounded-md border border-border-subtle bg-surface-card p-token-4">
                <div className="flex items-start justify-between gap-token-3">
                  <div className="min-w-0">
                    <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
                      {g.name}
                      <span className="rounded-full bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">{g.scope}</span>
                    </p>
                    <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{g.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAdd(g)}
                    className="h-7 shrink-0 rounded-md border border-border px-token-2 text-token-meta font-medium text-primary hover:bg-shell-accent-wash focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    + Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function StateBadge({ state }) {
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${STATE_TONE[state] ?? STATE_TONE.Denied}`}>
      {state === 'Granted' && <IconCheck className="block h-3 w-3" />}
      {state === 'Denied' && <IconX className="block h-3 w-3" />}
      {state}
    </span>
  );
}

function EffectivePermissionsSection({ categories }) {
  return (
    <Section
      title="Effective Permissions"
      subtitle="The computed result of role, group, department, and team membership."
    >
      <div className="mb-token-4 flex flex-wrap gap-token-3">
        {['Granted', 'Inherited', 'Denied'].map((s) => (
          <span key={s} className="flex items-center gap-token-2 text-token-meta text-text-secondary-alt">
            <span className={`h-2.5 w-2.5 rounded-full ${s === 'Granted' ? 'bg-success' : s === 'Inherited' ? 'bg-primary' : 'bg-text-faint'}`} aria-hidden="true" />
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-token-4">
        {categories.map((cat) => (
          <div key={cat.category}>
            <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">{cat.category}</p>
            <ul className="mt-token-2 divide-y divide-border-subtle rounded-md border border-border-subtle">
              {cat.rows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-token-3 px-token-4 py-token-2">
                  <span className="min-w-0 truncate text-token-sm text-text-primary-alt">{row.label}</span>
                  <span className="flex shrink-0 items-center gap-token-3">
                    <span className="text-token-meta text-text-faint">{row.source}</span>
                    <StateBadge state={row.state} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ResourceAccessSection({ resources, onAccess }) {
  return (
    <Section
      title="Resource-Level Access"
      subtitle="Direct and group-derived grants on individual resources."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-token-sm">
          <thead>
            <tr className="border-b border-border text-left text-token-meta uppercase tracking-[0.04em] text-text-faint">
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Resource</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Type</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Access Level</th>
              <th scope="col" className="py-token-2 pr-token-3 font-semibold">Source</th>
              <th scope="col" className="py-token-2 font-semibold">Expires</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => {
              const direct = r.source === 'Direct';
              return (
                <tr key={r.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="py-token-3 pr-token-3 font-mono text-token-sm text-text-primary-alt">{r.resource}</td>
                  <td className="py-token-3 pr-token-3 text-text-secondary-alt">{r.type}</td>
                  <td className="py-token-3 pr-token-3">
                    {direct ? (
                      <label className="sr-only" htmlFor={`access-${r.id}`}>{`Access level for ${r.resource}`}</label>
                    ) : null}
                    {direct ? (
                      <select
                        id={`access-${r.id}`}
                        value={r.accessLevel}
                        onChange={(e) => onAccess(r.id, e.target.value)}
                        className="h-8 rounded-md border border-border bg-surface-card px-token-2 text-token-sm text-text-primary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {ACCESS_LEVEL_OPTIONS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-text-primary-alt">{r.accessLevel}</span>
                    )}
                  </td>
                  <td className="py-token-3 pr-token-3 text-text-secondary-alt">{r.source}</td>
                  <td className="py-token-3 text-text-faint">{r.expires}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function AdminPrivilegesSection({ privileges, onToggle }) {
  return (
    <Section
      title="Administrative Privileges"
      subtitle="High-impact privileges are granted individually and audited."
    >
      <ul className="flex flex-col gap-token-3">
        {privileges.map((p) => (
          <li key={p.key} className="flex items-start justify-between gap-token-4 rounded-md border border-border-subtle p-token-4">
            <div className="min-w-0">
              <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{p.label}</p>
              <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{p.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={p.enabled}
              aria-label={`${p.label}: ${p.enabled ? 'enabled' : 'disabled'}`}
              onClick={() => onToggle(p.key)}
              className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${p.enabled ? 'bg-primary' : 'bg-surface-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-card shadow transition-transform ${p.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function InheritedAccessSection({ sources }) {
  return (
    <Section
      title="Inherited Access"
      subtitle="Permissions granted through roles, memberships, and groups — not editable here."
    >
      <ul className="flex flex-col gap-token-3">
        {sources.map((s) => (
          <li key={s.id} className="rounded-md border border-border-subtle p-token-4">
            <div className="flex items-center justify-between gap-token-3">
              <p className="m-0 text-token-sm font-semibold text-text-primary-alt">
                {s.kind} <span className="text-text-secondary-alt">· {s.via}</span>
              </p>
              <span className="shrink-0 rounded-full bg-shell-accent-wash px-token-2 py-0.5 text-token-meta font-semibold text-primary">
                {s.count} permissions
              </span>
            </div>
            <div className="mt-token-2 flex flex-wrap gap-token-2">
              {s.sample.map((label) => (
                <span key={label} className="rounded-full bg-surface-muted px-token-2 py-0.5 text-token-meta text-text-secondary-alt">{label}</span>
              ))}
              {s.more > 0 && (
                <span className="rounded-full bg-surface-muted px-token-2 py-0.5 text-token-meta text-text-faint">+{s.more} more</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function RailCard({ title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>
      <div className="mt-token-4">{children}</div>
    </section>
  );
}

function RailRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-token-3">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 text-token-sm font-semibold ${tone ?? 'text-text-primary-alt'}`}>{value}</dd>
    </div>
  );
}

function EffectiveAccessSummary({ granted, inherited, resources, groups }) {
  return (
    <RailCard title="Effective Access Summary">
      <div className="rounded-md bg-shell-accent-wash p-token-4 text-center">
        <p className="m-0 text-token-xl font-bold text-primary">{granted + inherited}</p>
        <p className="m-0 text-token-meta text-text-secondary-alt">Total effective permissions</p>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        <RailRow label="Granted" value={granted} tone="text-success-strong" />
        <RailRow label="Inherited" value={inherited} tone="text-primary" />
        <RailRow label="Resources" value={resources} />
        <RailRow label="Groups" value={groups} />
      </dl>
    </RailCard>
  );
}

function SecurityImpactCard({ adminPrivileges }) {
  const adminOn = adminPrivileges.filter((a) => a.enabled).length;
  const level = adminOn === 0 ? 'Low' : adminOn <= 2 ? 'Moderate' : 'High';
  const tone =
    level === 'Low'
      ? 'bg-success-bg text-success-strong'
      : level === 'Moderate'
        ? 'bg-warning-bg text-warning-strong'
        : 'bg-danger-bg text-danger-strong';
  return (
    <RailCard title="Security Impact">
      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${tone}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {level} Impact
      </span>
      <ul className="mt-token-3 flex flex-col gap-token-2 text-token-sm text-text-secondary-alt">
        <li>{adminOn} administrative privilege{adminOn === 1 ? '' : 's'} enabled</li>
        <li>No organization-wide write access</li>
        <li>Scoped to Engineering department</li>
        <li>Standard data-access footprint</li>
        <li>All grants are auditable</li>
      </ul>
    </RailCard>
  );
}

function ValidationStatusCard() {
  const checks = [
    { label: 'No conflicting role assignments', ok: true },
    { label: 'License covers assigned features', ok: true },
    { label: 'No orphaned resource grants', ok: true },
    { label: 'Group scopes are consistent', ok: true },
    { label: 'Separation-of-duties review', ok: false },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return (
    <RailCard title="Validation Status">
      <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{passed}/{checks.length} passed</p>
      <ul className="mt-token-3 flex flex-col gap-token-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-token-2 text-token-sm text-text-secondary-alt">
            {c.ok
              ? <IconCheck className="mt-0.5 block h-3.5 w-3.5 shrink-0 text-success" />
              : <IconAlert className="mt-0.5 block h-3.5 w-3.5 shrink-0 text-warning" />}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function PendingChangesCard({ pending }) {
  return (
    <RailCard title={`Pending Changes (${pending.length})`}>
      {pending.length === 0 ? (
        <p className="m-0 text-token-sm text-text-faint">No unsaved changes.</p>
      ) : (
        <ul className="flex flex-col gap-token-2">
          {pending.map((c, i) => (
            <li key={i} className="flex items-start gap-token-2 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-2 text-token-sm text-text-primary-alt">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      )}
    </RailCard>
  );
}

function PermissionAuditCard({ audit }) {
  const rows = [
    ['Last Updated', audit.lastUpdated],
    ['Updated By', audit.updatedBy],
    ['Audit Ref', audit.auditRef],
    ['Security Review', audit.securityReview],
    ['Review Status', audit.reviewStatus],
  ];
  return (
    <RailCard title="Permission Audit">
      <dl className="flex flex-col gap-token-2">
        {rows.map(([label, value]) => (
          <RailRow key={label} label={label} value={value} tone={label === 'Review Status' ? 'text-success-strong' : undefined} />
        ))}
      </dl>
    </RailCard>
  );
}

function PermissionsSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="h-28 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-md border border-border bg-surface-muted" />
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

/* ---- Inline icons (currentColor) ------------------------------------ */

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
