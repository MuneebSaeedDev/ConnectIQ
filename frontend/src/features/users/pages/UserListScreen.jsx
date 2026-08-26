import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useUserList } from '../hooks/useUserList';

const PAGE_SIZE = 16;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Avatar tones reuse existing token utilities only (no new palette):
// blue/purple→primary wash, green/teal→success, orange→warning,
// red→danger, gray→muted.
const AVATAR_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  purple: 'bg-shell-accent-wash text-primary',
  green: 'bg-success-bg text-success-strong',
  teal: 'bg-success-bg text-success-strong',
  orange: 'bg-warning-bg text-warning',
  red: 'bg-danger-bg text-danger-strong',
  gray: 'bg-surface-muted text-text-faint',
};

const ROLE_TONE = {
  Administrator: 'bg-danger-bg text-danger-strong',
  Manager: 'bg-shell-accent-wash text-primary',
  Engineer: 'bg-success-bg text-success-strong',
  Analyst: 'bg-warning-bg text-warning',
  Viewer: 'bg-surface-muted text-text-secondary-alt',
};

const STATUS_TONE = {
  Active: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Locked: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Pending: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Suspended: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
};

/** SCR-032 — User List Screen. Node 101:4147, drawer 101:5921. */
export default function UserListScreen() {
  const orgId = 'current';
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All roles');
  const [department, setDepartment] = useState('All departments');
  const [team, setTeam] = useState('All teams');
  const [status, setStatus] = useState('All statuses');
  const [accountType, setAccountType] = useState('All account types');
  const [lastLogin, setLastLogin] = useState('Any time');
  const [sort, setSort] = useState('Name');

  const { data, isLoading, isError, error, refetch, isFetching } = useUserList(orgId, {
    search,
    role,
    department,
    team,
    status,
    accountType,
    lastLogin,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    role !== 'All roles' ||
    department !== 'All departments' ||
    team !== 'All teams' ||
    status !== 'All statuses' ||
    accountType !== 'All account types' ||
    lastLogin !== 'Any time';

  function clearAll() {
    setSearch('');
    setRole('All roles');
    setDepartment('All departments');
    setTeam('All teams');
    setStatus('All statuses');
    setAccountType('All account types');
    setLastLogin('Any time');
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users']}>
      <div className="flex flex-col gap-token-6">
        <Header data={data} refetch={refetch} isFetching={isFetching} />

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading users'
            : isError
              ? 'Couldn’t load users'
              : isFetching
                ? 'Refreshing users'
                : data
                  ? 'Users updated'
                  : ''}
        </span>

        {isLoading && <UserSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load users</p>
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

        {data && (
          <>
            <KpiGrid kpis={data.kpis} />
            {data.license && data.license.percent >= data.license.threshold && <LicenseBanner license={data.license} />}
            <UsersTable
              data={data}
              search={search}
              role={role}
              department={department}
              team={team}
              status={status}
              accountType={accountType}
              lastLogin={lastLogin}
              sort={sort}
              onSearch={setSearch}
              onRole={setRole}
              onDepartment={setDepartment}
              onTeam={setTeam}
              onStatus={setStatus}
              onAccountType={setAccountType}
              onLastLogin={setLastLogin}
              onSort={setSort}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAll}
            />
            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function Header({ data, refetch, isFetching }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">User Management</h1>
          {data?.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
              title="MOD-005 (User Management) has no backend deployed yet — showing sample data, not live records."
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Manage user accounts, roles, licenses, and access across
          {data?.organizationName ? ` ${data.organizationName}.` : ' your organization.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Importing users requires MOD-005’s user endpoint (still PLANNED)."
        >
          <IconImport />
          Import Users
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Export is not yet available — no MOD-005 user export endpoint exists."
        >
          <IconExport />
          Export Users
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Inviting a user requires MOD-005’s invitation endpoint (still PLANNED). User creation is invitation-driven, not self-registration."
        >
          <IconPlus />
          Invite User
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label={isFetching ? 'Refreshing' : 'Refresh'}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          title="Refresh"
        >
          <IconRefresh spinning={isFetching} />
        </button>
      </div>
    </div>
  );
}

function LicenseBanner({ license }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-warning bg-warning-bg px-token-5 py-token-3" role="status">
      <div className="flex items-center gap-token-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning text-text-on-primary" aria-hidden="true">
          <IconWarning />
        </span>
        <div>
          <p className="m-0 text-token-sm font-semibold text-warning">Approaching license limit</p>
          <p className="m-0 mt-0.5 text-token-sm text-text-secondary-alt">
            {license.used} of {license.total} seats in use ({license.percent}%). {license.remaining} licenses remaining.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="h-8 rounded-md border border-warning bg-surface-card px-token-4 text-token-sm font-medium text-warning hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled
        title="License management requires MOD-005’s licensing endpoint (still PLANNED)."
      >
        Manage Licenses
      </button>
    </div>
  );
}

function ScreenFooter({ data, isFetching }) {
  const pending = data.kpis?.find((k) => k.key === 'pending')?.value ?? '0';
  const total = data.total ?? data.rows?.length ?? 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{total.toLocaleString()} users</span>
        <FooterDivider />
        <span>{pending} pending invitations</span>
      </div>
      {data.mocked && (
        <span
          className="font-semibold uppercase tracking-[0.04em] text-warning"
          title="MOD-005 (User Management) has no backend deployed yet — showing sample data, not live records."
        >
          Sample data
        </span>
      )}
    </div>
  );
}

function FooterDivider() {
  return <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />;
}

function KpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
      {(kpis ?? []).map((kpi) => {
        const tone = KPI_TONE[kpi.tone] ?? KPI_TONE.default;
        return (
          <div key={kpi.key} className="relative overflow-hidden rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
            <span className={`absolute inset-x-0 top-0 h-[3px] ${tone.bar}`} aria-hidden="true" />
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{kpi.label}</p>
            <p className={`m-0 mt-token-2 text-token-xl font-extrabold tracking-[-0.03em] ${tone.value}`}>{kpi.value}</p>
            <p className="m-0 mt-token-2 text-token-sm text-text-faint">{kpi.helper}</p>
          </div>
        );
      })}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {(options ?? []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

// APPEND-MARKER

function UsersTable({
  data,
  search,
  role,
  department,
  team,
  status,
  accountType,
  lastLogin,
  sort,
  onSearch,
  onRole,
  onDepartment,
  onTeam,
  onStatus,
  onAccountType,
  onLastLogin,
  onSort,
  hasActiveFilters,
  onClearAll,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Defensive default: the mock always supplies `rows`, and the
    // service only returns mocked:false for a valid JSON body, but a
    // real MOD-005 endpoint could return valid JSON without `rows`.
    const rows = (data.rows ?? []).filter((row) => {
      if (role !== 'All roles' && row.role !== role) return false;
      if (department !== 'All departments' && row.department !== department) return false;
      if (team !== 'All teams' && row.team !== team) return false;
      if (status !== 'All statuses' && row.status !== status) return false;
      if (accountType !== 'All account types' && row.accountType !== accountType) return false;
      if (lastLogin === 'Never' && row.lastLogin !== 'Never') return false;
      // Never-logged-in users (loginMinutes = MAX_SAFE_INTEGER) are
      // surfaced only by the explicit "Never" option, not the elapsed-
      // time windows below — including "Over 30 days".
      if (lastLogin !== 'Any time' && lastLogin !== 'Never' && row.lastLogin === 'Never') return false;
      if (lastLogin === 'Today' && row.loginMinutes > 1440) return false;
      if (lastLogin === 'Last 7 days' && row.loginMinutes > 7 * 1440) return false;
      if (lastLogin === 'Last 30 days' && row.loginMinutes > 30 * 1440) return false;
      if (lastLogin === 'Over 30 days' && row.loginMinutes <= 30 * 1440) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.team.toLowerCase().includes(q)
      );
    });
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'Role': return a.role.localeCompare(b.role) || a.name.localeCompare(b.name);
        case 'Last Login': return (a.loginMinutes ?? Infinity) - (b.loginMinutes ?? Infinity);
        case 'Created': return Date.parse(b.created) - Date.parse(a.created);
        case 'Status': return a.status.localeCompare(b.status) || a.name.localeCompare(b.name);
        default: return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [data.rows, search, role, department, team, status, accountType, lastLogin, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeUser = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => prev.has(r.id));
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function resetToFirstPage() {
    setPage(1);
    setSelected(new Set());
  }

  const chips = [
    role !== 'All roles' && { key: 'role', label: `Role: ${role}`, clear: () => { onRole('All roles'); resetToFirstPage(); } },
    department !== 'All departments' && { key: 'dept', label: `Dept: ${department}`, clear: () => { onDepartment('All departments'); resetToFirstPage(); } },
    team !== 'All teams' && { key: 'team', label: `Team: ${team}`, clear: () => { onTeam('All teams'); resetToFirstPage(); } },
    status !== 'All statuses' && { key: 'status', label: `Status: ${status}`, clear: () => { onStatus('All statuses'); resetToFirstPage(); } },
    accountType !== 'All account types' && { key: 'type', label: `Type: ${accountType}`, clear: () => { onAccountType('All account types'); resetToFirstPage(); } },
    lastLogin !== 'Any time' && { key: 'login', label: `Login: ${lastLogin}`, clear: () => { onLastLogin('Any time'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search users by name, email, title, department, or team</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search users…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by role" value={role} options={data.roleFilters} onChange={(v) => { onRole(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by department" value={department} options={data.departmentFilters} onChange={(v) => { onDepartment(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by team" value={team} options={data.teamFilters} onChange={(v) => { onTeam(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by status" value={status} options={data.statusFilters} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by account type" value={accountType} options={data.accountTypeFilters} onChange={(v) => { onAccountType(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by last login" value={lastLogin} options={data.lastLoginFilters} onChange={(v) => { onLastLogin(v); resetToFirstPage(); }} />
          <label className="flex items-center gap-token-2">
            <span className="text-token-sm text-text-faint">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { onSort(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {(data.sortOptions ?? ['Name']).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { onClearAll(); resetToFirstPage(); }}
              className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-token-2 border-b border-border-subtle px-token-5 py-token-2">
          {chips.map((chip) => (
            <span key={chip.key} className="flex items-center gap-token-1 rounded-full bg-shell-accent-wash px-token-3 py-0.5 text-token-xs font-medium text-primary">
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-shell-accent-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">
            {selected.size} user{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Assign Role', title: 'Assigning a role requires MOD-005’s user endpoint (still PLANNED).' },
            { label: 'Assign Department', title: 'Assigning a department requires MOD-005’s user endpoint (still PLANNED).' },
            { label: 'Assign Team', title: 'Assigning a team requires MOD-005’s user endpoint (still PLANNED).' },
            { label: 'Activate', title: 'Bulk activate requires MOD-005’s user lifecycle endpoint (still PLANNED).' },
            { label: 'Suspend', title: 'Bulk suspend requires MOD-005’s user lifecycle endpoint (still PLANNED).' },
            { label: 'Resend Invite', title: 'Resending invitations requires MOD-005’s invitation endpoint (still PLANNED).' },
            { label: 'Export', title: 'Export is not yet available — no MOD-005 user export endpoint exists.' },
            { label: 'Delete', title: 'Bulk delete requires MOD-005’s user lifecycle endpoint (still PLANNED).' },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              title={action.title}
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-token-sm font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            Clear selection
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <div className="px-token-5 py-token-8 text-center">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No users match your filters</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Try adjusting your search or clearing the active filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { onClearAll(); resetToFirstPage(); }}
              className="mt-token-4 h-8 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3">
                  <input
                    type="checkbox"
                    aria-label="Select all users on this page"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                    ref={(el) => {
                      if (el) {
                        const onPage = pageRows.filter((r) => selected.has(r.id)).length;
                        el.indeterminate = onPage > 0 && onPage < pageRows.length;
                      }
                    }}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                </th>
                {['User', 'Email', 'Role', 'Department / Team', 'Status', 'Last Login', 'Security', ''].map((col) => (
                  <th
                    key={col || 'actions'}
                    scope="col"
                    className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint"
                  >
                    {col || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const statusTone = STATUS_TONE[row.status] ?? STATUS_TONE.Active;
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-surface-hover"
                    onClick={() => setActiveId(row.id)}
                  >
                    <td className="px-token-5 py-token-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.name}`}
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className="flex items-center gap-token-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-token-sm font-semibold ${AVATAR_TONE[row.tone] ?? AVATAR_TONE.gray}`}>
                          {row.initials}
                        </span>
                        <span className="flex flex-col">
                          <span className="text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                          <span className="text-token-xs text-text-faint">{row.title}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.email}</td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${ROLE_TONE[row.role] ?? ROLE_TONE.Viewer}`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className="flex flex-col">
                        <span className="text-token-sm text-text-primary-alt">{row.department}</span>
                        <span className="text-token-xs text-text-faint">{row.team}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.lastLogin}</td>
                    <td className="px-token-5 py-token-3">
                      <span className="flex items-center gap-token-1">
                        {row.mfa && (
                          <span className="rounded-sm bg-success-bg px-token-1 py-0.5 text-token-meta font-semibold text-success-strong" title="Multi-factor authentication enabled">MFA</span>
                        )}
                        {row.sso && (
                          <span className="rounded-sm bg-shell-accent-wash px-token-1 py-0.5 text-token-meta font-semibold text-primary" title="Single sign-on enabled">SSO</span>
                        )}
                        {!row.mfa && !row.sso && (
                          <span className="text-token-meta text-text-faint" title="No MFA or SSO configured">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveId(row.id)}
                        aria-label={`View ${row.name} details`}
                        className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1}–
          {Math.min(clampedPage * PAGE_SIZE, filtered.length)} of{' '}
          {hasActiveFilters ? `${filtered.length.toLocaleString()} (filtered from ${(data.total ?? filtered.length).toLocaleString()})` : `${(data.total ?? filtered.length).toLocaleString()} users`}
        </p>
        <div className="flex items-center gap-token-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage <= 1}
            className="h-7 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Previous
          </button>
          <span className="text-token-sm text-text-secondary-alt">
            Page {clampedPage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={clampedPage >= pageCount}
            className="h-7 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Next
          </button>
        </div>
      </div>

      {activeUser && (
        <UserDrawer
          user={activeUser}
          detail={data.details?.[activeUser.id] ?? null}
          mocked={data.mocked}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

function UserDrawer({ user, detail, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const statusTone = STATUS_TONE[user.status] ?? STATUS_TONE.Active;

  useEffect(() => {
    // One-time focus management: focus the close button on open and
    // restore focus to the trigger on close. Kept in its own []-deps
    // effect so a background refetch (30s refetchInterval / isFetching
    // toggle) re-rendering the parent can't tear this down and yank
    // focus back to the close button mid-interaction.
    closeRef.current?.focus();
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
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const userInfo = [
    { label: 'Full Name', value: user.name },
    { label: 'Job Title', value: user.title },
    { label: 'Employee ID', value: user.employeeId },
    { label: 'Department', value: user.department },
    { label: 'Team', value: user.team },
    { label: 'Account Type', value: user.accountType },
  ];

  const account = detail?.account ?? [
    { label: 'Role', value: user.role },
    { label: 'Status', value: user.status },
    { label: 'Last Login', value: user.lastLogin },
    { label: 'License', value: user.license },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div className="flex items-center gap-token-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-token-base font-semibold ${AVATAR_TONE[user.tone] ?? AVATAR_TONE.gray}`}>
              {user.initials}
            </span>
            <div>
              <h2 id="user-drawer-title" className="m-0 text-token-base font-bold text-text-primary-alt">{user.name}</h2>
              <p className="m-0 mt-0.5 text-token-xs text-text-faint">{user.email}</p>
              <span className={`mt-token-1 inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                {user.status}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close user details"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          {[
            { label: 'Edit User', title: 'Editing a user requires MOD-005’s user endpoint (still PLANNED).' },
            { label: 'Manage Roles', title: 'Role management requires MOD-005’s user endpoint (still PLANNED).' },
            { label: 'Reset Password', title: 'Password resets require MOD-005’s auth endpoint (still PLANNED).' },
            { label: user.status === 'Suspended' ? 'Reactivate' : 'Suspend', title: 'User lifecycle actions require MOD-005’s user endpoint (still PLANNED).' },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              title={action.title}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-token-6 px-token-5 py-token-5">
          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">User Information</h3>
            <dl className="mt-token-3 flex flex-col gap-token-2">
              {userInfo.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
                  <dt className="text-token-sm text-text-faint">{r.label}</dt>
                  <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Account Summary</h3>
            <div className="mt-token-3 grid grid-cols-2 gap-token-3">
              {account.map((r) => (
                <div key={r.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
                  <p className="m-0 text-token-xs text-text-faint">{r.label}</p>
                  <p className="m-0 mt-token-1 text-token-sm font-semibold text-text-primary-alt">{r.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-token-3 flex items-center gap-token-3">
              <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${user.mfa ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-faint'}`}>
                MFA {user.mfa ? 'Enabled' : 'Disabled'}
              </span>
              <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${user.sso ? 'bg-shell-accent-wash text-primary' : 'bg-surface-muted text-text-faint'}`}>
                SSO {user.sso ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Activity Summary</h3>
            {detail?.events?.length ? (
              <ul className="mt-token-3 flex flex-col gap-token-2">
                {detail.events.map((e, i) => (
                  <li key={i} className="flex items-start justify-between gap-token-3 rounded-md border border-border-subtle px-token-3 py-token-2">
                    <span>
                      <span className="block text-token-sm font-medium text-text-primary-alt">{e.action}</span>
                      <span className="block text-token-xs text-text-faint">{e.detail}</span>
                    </span>
                    <span className="shrink-0 text-token-xs text-text-faint">{e.when}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-token-sm text-text-faint">
                The full activity and login-history breakdown loads from the MOD-005 user service, which is not deployed yet. This user last signed in {user.lastLogin.toLowerCase()}.
              </p>
            )}
          </section>

          {mocked && (
            <p className="m-0 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-xs font-medium text-warning">
              Sample data — MOD-005 (User Management) has no backend deployed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-[620px] w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}

/* Inline icons — currentColor SVGs matching the Figma toolbar glyphs. */
function IconPlus() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function IconImport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8m0 0 3-3m-3 3L5 7M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

function IconExport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10V2m0 0 3 3M8 2 5 5M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

function IconRefresh({ spinning }) {
  return (
    <svg viewBox="0 0 16 16" className={`block h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className ?? 'block h-3 w-3'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="m11 11 3 3" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 16 16" className="block h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6v3m0 2.5h.01M6.9 2.6 1.5 12a1.2 1.2 0 0 0 1 1.8h11a1.2 1.2 0 0 0 1-1.8L9.1 2.6a1.2 1.2 0 0 0-2.2 0Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

