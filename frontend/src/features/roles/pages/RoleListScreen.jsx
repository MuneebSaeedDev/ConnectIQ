import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useRoleList } from '../hooks/useRoleList';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import {
  ROLE_TYPE_OPTIONS,
  ROLE_STATUS_OPTIONS,
  PRIVILEGE_LEVEL_OPTIONS,
  PERMISSION_GROUP_OPTIONS,
  ROLE_SORT_OPTIONS,
} from '../services/roleList.api';

const PAGE_SIZE = 25;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  info: { value: 'text-primary', bar: 'bg-primary' },
  accent: { value: 'text-primary', bar: 'bg-shell-accent-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

const TYPE_TONE = {
  System: 'bg-shell-accent-wash text-primary',
  Custom: 'bg-success-bg text-success-strong',
};

// Privilege level → token utilities only (no new palette), mapped to the
// verified Figma tones (node 113:17935): Full Administrative → danger,
// Administrative → warning, Elevated/Standard → primary wash, Read Only →
// muted.
const PRIVILEGE_TONE = {
  'Full Administrative': 'bg-danger-bg text-danger-strong',
  Administrative: 'bg-warning-bg text-warning',
  Elevated: 'bg-shell-accent-wash text-primary',
  Standard: 'bg-shell-accent-wash text-primary',
  'Read Only': 'bg-surface-muted text-text-secondary-alt',
};

const STATUS_TONE = {
  Active: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Deprecated: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
};

const MOCK_TITLE =
  'MOD-003 (RBAC & Permissions) has no backend deployed yet — showing sample data, not live records.';

/** SCR-040 — Role List Screen. Node 113:17935 ("Role Management"). */
export default function RoleListScreen() {
  const orgId = 'current';
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [level, setLevel] = useState('All Levels');
  const [permissionGroup, setPermissionGroup] = useState('All Groups');
  const [sort, setSort] = useState('Role Name');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useRoleList(orgId, {
    search,
    type,
    status,
    level,
    permissionGroup,
    sort,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    type !== 'All Types' ||
    status !== 'All Status' ||
    level !== 'All Levels' ||
    permissionGroup !== 'All Groups';

  function clearAll() {
    setSearch('');
    setType('All Types');
    setStatus('All Status');
    setLevel('All Levels');
    setPermissionGroup('All Groups');
  }

  const handleExport = () => {
    if (!data?.rows) return;
    downloadJson(data.rows, 'connectiq-roles');
    showToast('Role directory exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Roles']}>
      <div className="flex flex-col gap-token-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <Header data={data} refetch={refetch} isFetching={isFetching} onExport={handleExport} />

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading roles'
            : isError
              ? 'Couldn’t load roles'
              : isFetching
                ? 'Refreshing roles'
                : data
                  ? 'Roles updated'
                  : ''}
        </span>

        {isLoading && <RoleSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load roles</p>
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
            <RolesTable
              data={data}
              search={search}
              type={type}
              status={status}
              level={level}
              permissionGroup={permissionGroup}
              sort={sort}
              onSearch={setSearch}
              onType={setType}
              onStatus={setStatus}
              onLevel={setLevel}
              onPermissionGroup={setPermissionGroup}
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

function Header({ data, refetch, isFetching, onExport }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Role Management</h1>
          {data?.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
              title={MOCK_TITLE}
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Manage platform roles, permission assignments, administrative privileges, and role-based access policies.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <Link
          to="/roles/permissions"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconGrid />
          Permission Matrix
        </Link>
        <button
          type="button"
          onClick={onExport}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          title="Export Roles JSON"
        >
          <IconExport />
          Export Roles
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Comparing roles requires MOD-003’s role endpoint (still PLANNED)."
        >
          <IconCompare />
          Compare Roles
        </button>
        <Link
          to="/roles/new"
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconPlus />
          Create Role
        </Link>
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

function ScreenFooter({ data, isFetching }) {
  const total = data.total ?? data.rows?.length ?? 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{total.toLocaleString()} roles</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title={MOCK_TITLE}>
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

// TABLE-MARKER

function RolesTable({
  data,
  search,
  type,
  status,
  level,
  permissionGroup,
  sort,
  onSearch,
  onType,
  onStatus,
  onLevel,
  onPermissionGroup,
  onSort,
  hasActiveFilters,
  onClearAll,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Defensive default: the mock always supplies `rows`; a real MOD-003
    // endpoint could return valid JSON without `rows`.
    const rows = (data.rows ?? []).filter((row) => {
      if (type !== 'All Types' && row.type !== type) return false;
      if (status !== 'All Status' && row.status !== status) return false;
      if (level !== 'All Levels' && row.privilegeLevel !== level) return false;
      if (permissionGroup !== 'All Groups' && !(row.permissionGroups ?? []).includes(permissionGroup)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        (row.permissionGroups ?? []).some((g) => g.toLowerCase().includes(q))
      );
    });
    const PRIVILEGE_RANK = {
      'Full Administrative': 5,
      Administrative: 4,
      Elevated: 3,
      Standard: 2,
      'Read Only': 1,
    };
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'Assigned Users': return (b.assignedUsers ?? 0) - (a.assignedUsers ?? 0) || a.name.localeCompare(b.name);
        case 'Privilege Level': return (PRIVILEGE_RANK[b.privilegeLevel] ?? 0) - (PRIVILEGE_RANK[a.privilegeLevel] ?? 0) || a.name.localeCompare(b.name);
        case 'Last Updated': return Date.parse(b.lastUpdated) - Date.parse(a.lastUpdated);
        default: return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [data.rows, search, type, status, level, permissionGroup, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeRole = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

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
    type !== 'All Types' && { key: 'type', label: `Type: ${type}`, clear: () => { onType('All Types'); resetToFirstPage(); } },
    status !== 'All Status' && { key: 'status', label: `Status: ${status}`, clear: () => { onStatus('All Status'); resetToFirstPage(); } },
    level !== 'All Levels' && { key: 'level', label: `Level: ${level}`, clear: () => { onLevel('All Levels'); resetToFirstPage(); } },
    permissionGroup !== 'All Groups' && { key: 'group', label: `Group: ${permissionGroup}`, clear: () => { onPermissionGroup('All Groups'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search roles by name, description, or permission group</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search roles…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by role type" value={type} options={ROLE_TYPE_OPTIONS} onChange={(v) => { onType(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by status" value={status} options={ROLE_STATUS_OPTIONS} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by privilege level" value={level} options={PRIVILEGE_LEVEL_OPTIONS} onChange={(v) => { onLevel(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by permission group" value={permissionGroup} options={PERMISSION_GROUP_OPTIONS} onChange={(v) => { onPermissionGroup(v); resetToFirstPage(); }} />
          <label className="flex items-center gap-token-2">
            <span className="text-token-sm text-text-faint">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { onSort(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {ROLE_SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled
            title="Column customization requires MOD-003’s role endpoint (still PLANNED)."
          >
            <IconColumns />
            Columns
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { onClearAll(); resetToFirstPage(); }}
              className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            >
              Clear Filters
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
            {selected.size} role{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Export Selected', title: 'Export is not yet available — no MOD-003 role export endpoint exists.' },
            { label: 'Compare Selected', title: 'Comparing roles requires MOD-003’s role endpoint (still PLANNED).' },
            { label: 'Activate Selected', title: 'Bulk activate requires MOD-003’s role lifecycle endpoint (still PLANNED).' },
            { label: 'Archive Selected', title: 'Bulk archive requires MOD-003’s role lifecycle endpoint (still PLANNED).' },
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No roles match your filters</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Try adjusting your search or clearing the active filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { onClearAll(); resetToFirstPage(); }}
              className="mt-token-4 h-8 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Clear Filters
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
                    aria-label="Select all roles on this page"
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
                {['Role Name', 'Role Type', 'Permission Groups', 'Assigned Users', 'Privilege Level', 'Status', 'Last Updated', ''].map((col) => (
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
                const groups = row.permissionGroups ?? [];
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-surface-hover"
                    onClick={() => setActiveId(row.id)}
                  >
                    <td className="px-token-5 py-token-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.name}`}
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="flex flex-col">
                        <span className="flex items-center gap-token-2">
                          <span className="text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                          {row.type === 'System' && <IconLock />}
                          {row.unused && (
                            <span className="rounded-sm bg-warning-bg px-token-1 py-0.5 text-token-meta font-semibold text-warning" title="No active assignments">Unused</span>
                          )}
                        </span>
                        <span className="mt-0.5 max-w-md text-token-xs text-text-faint">{row.description}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${TYPE_TONE[row.type] ?? TYPE_TONE.System}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="flex flex-wrap gap-token-1">
                        {groups.slice(0, 2).map((g) => (
                          <span key={g} className="rounded-sm bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">{g}</span>
                        ))}
                        {groups.length > 2 && (
                          <span className="rounded-sm bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-faint" title={groups.join(', ')}>
                            +{groups.length - 2}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="flex flex-col">
                        <span className="text-token-sm font-medium text-text-primary-alt">{row.assignedUsers.toLocaleString()} active</span>
                        <span className="text-token-xs text-text-faint">{row.assignedDepartments}d / {row.assignedTeams}t</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${PRIVILEGE_TONE[row.privilegeLevel] ?? PRIVILEGE_TONE.Standard}`}>
                        {row.privilegeLevel}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="flex flex-col">
                        <span className="text-token-sm text-text-secondary-alt">{row.lastUpdated}</span>
                        <span className="text-token-xs text-text-faint">{row.updatedBy}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 text-right align-top" onClick={(e) => e.stopPropagation()}>
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
          {hasActiveFilters ? `${filtered.length.toLocaleString()} (filtered from ${(data.total ?? filtered.length).toLocaleString()})` : `${(data.total ?? filtered.length).toLocaleString()} roles`}
        </p>
        <div className="flex items-center gap-token-3">
          <span className="text-token-sm text-text-faint">{PAGE_SIZE} per page</span>
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
      </div>

      {activeRole && (
        <RoleDrawer role={activeRole} mocked={data.mocked} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}

// DRAWER-MARKER

function RoleDrawer({ role, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const statusTone = STATUS_TONE[role.status] ?? STATUS_TONE.Active;

  useEffect(() => {
    // One-time focus management: focus the close button on open, restore
    // to the trigger on close. Isolated []-deps effect so a background
    // refetch re-rendering the parent can't yank focus mid-interaction.
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const meta = [
    { label: 'Role Type', value: role.type },
    { label: 'Privilege Level', value: role.privilegeLevel },
    { label: 'Assigned Users', value: `${role.assignedUsers.toLocaleString()} active` },
    { label: 'Departments / Teams', value: `${role.assignedDepartments}d / ${role.assignedTeams}t` },
    { label: 'Last Updated', value: role.lastUpdated },
    { label: 'Updated By', value: role.updatedBy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div>
            <div className="flex items-center gap-token-2">
              <h2 id="role-drawer-title" className="m-0 text-token-base font-bold text-text-primary-alt">{role.name}</h2>
              <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${TYPE_TONE[role.type] ?? TYPE_TONE.System}`}>
                {role.type}
              </span>
            </div>
            <span className={`mt-token-1 inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
              {role.status}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close role details"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          <Link
            to={`/roles/${encodeURIComponent(role.id)}/edit`}
            className="flex h-7 items-center rounded-md bg-primary px-token-3 text-token-sm font-semibold text-text-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Edit Role
          </Link>
          {[
            { label: 'Manage Permissions', title: 'Permission management requires MOD-003’s permission endpoint (still PLANNED).' },
            { label: 'Clone Role', title: 'Cloning a role requires MOD-003’s role endpoint (still PLANNED).' },
            { label: role.status === 'Deprecated' ? 'Restore' : 'Archive', title: 'Role lifecycle actions require MOD-003’s role endpoint (still PLANNED).' },
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
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Description</h3>
            <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">{role.description}</p>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Role Details</h3>
            <div className="mt-token-3 grid grid-cols-2 gap-token-3">
              {meta.map((r) => (
                <div key={r.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
                  <p className="m-0 text-token-xs text-text-faint">{r.label}</p>
                  <p className="m-0 mt-token-1 text-token-sm font-semibold text-text-primary-alt">{r.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Permission Groups</h3>
            <div className="mt-token-3 flex flex-wrap gap-token-2">
              {(role.permissionGroups ?? []).map((g) => (
                <span key={g} className="rounded-sm bg-shell-accent-wash px-token-3 py-0.5 text-token-xs font-medium text-primary">{g}</span>
              ))}
            </div>
            <p className="m-0 mt-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-token-sm text-text-faint">
              The full permission matrix and per-resource grants load from the MOD-003 permission service, which is not deployed yet.
            </p>
          </section>

          {mocked && (
            <p className="m-0 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-xs font-medium text-warning">
              Sample data — MOD-003 (RBAC &amp; Permissions) has no backend deployed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleSkeleton() {
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

function IconExport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10V2m0 0 3 3M8 2 5 5M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

function IconCompare() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v12M12 2v12M4 5H1.5M14.5 5H12M4 11H1.5M14.5 11H12" />
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

function IconX() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function IconColumns() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="1" />
      <path d="M6.5 2.5v11M10 2.5v11" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3 w-3 text-text-faint" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}




