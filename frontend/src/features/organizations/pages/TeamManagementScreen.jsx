import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useTeamManagement } from '../hooks/useTeamManagement';

const PAGE_SIZE = 14;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Colored team/department code-badge tones. Reuses existing token
// utilities only (no new palette) — the Figma dots resolve to the
// nearest available accent: blue→primary, green/teal→success,
// purple→shell-accent, orange→warning, red→danger, gray→muted.
const CODE_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  purple: 'bg-shell-accent-wash text-primary',
  green: 'bg-success-bg text-success-strong',
  teal: 'bg-success-bg text-success-strong',
  orange: 'bg-warning-bg text-warning',
  red: 'bg-danger-bg text-danger-strong',
  gray: 'bg-surface-muted text-text-faint',
};

// Small colored dot next to the department label in each row.
const DOT_TONE = {
  blue: 'bg-primary',
  purple: 'bg-shell-accent',
  green: 'bg-success',
  teal: 'bg-success',
  orange: 'bg-warning',
  red: 'bg-danger',
  gray: 'bg-text-faint',
};

// Status pill tones. Pending Setup is an "info" tone; Archived is muted.
const STATUS_TONE = {
  Active: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Inactive: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  'Pending Setup': { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Archived: { dot: 'bg-text-faint', pill: 'bg-surface-muted text-text-secondary-alt' },
};

const PIPELINE_TONE = {
  Running: 'bg-shell-accent-wash text-primary',
  Success: 'bg-success-bg text-success-strong',
  Failed: 'bg-danger-bg text-danger-strong',
};

/** SCR-030 — Team Management Screen. Node 95:6572, drawer 95:8111. */
export default function TeamManagementScreen() {
  const { id } = useParams();
  // The Administration → Teams nav item routes to the literal
  // `/organizations/current/teams`; the org-scoped route supplies a
  // real `:id`. Fall back to 'current' so the (org-scoped) query is
  // always enabled and a real MOD-004 endpoint could resolve the
  // caller's active organization server-side.
  const orgId = id ?? 'current';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Active');
  const [department, setDepartment] = useState('All departments');
  const [teamLead, setTeamLead] = useState('All team leads');
  const [sort, setSort] = useState('Name');

  const { data, isLoading, isError, error, refetch, isFetching } = useTeamManagement(orgId, {
    search,
    status,
    department,
    teamLead,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    status !== 'All statuses' ||
    department !== 'All departments' ||
    teamLead !== 'All team leads';

  function clearAll() {
    setSearch('');
    setStatus('All statuses');
    setDepartment('All departments');
    setTeamLead('All team leads');
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Teams']}>
      <div className="flex flex-col gap-token-6">
        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Team Management</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not live records."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Manage organizational teams, assign ownership, organize members, and monitor operational responsibilities across departments
              {data?.organizationName ? ` in ${data.organizationName}.` : '.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Import is not yet available — no MOD-004 team import endpoint exists."
            >
              <IconImport />
              Import
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-004 team export endpoint exists."
            >
              <IconExport />
              Export
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Creating a team requires MOD-004’s team endpoint (still PLANNED)."
            >
              <IconPlus />
              Create Team
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

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading teams'
            : isError
              ? 'Couldn’t load teams'
              : isFetching
                ? 'Refreshing teams'
                : data
                  ? 'Teams updated'
                  : ''}
        </span>

        {isLoading && <TeamSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load teams</p>
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
            <TeamsTable
              data={data}
              search={search}
              status={status}
              department={department}
              teamLead={teamLead}
              sort={sort}
              onSearch={setSearch}
              onStatus={setStatus}
              onDepartment={setDepartment}
              onTeamLead={setTeamLead}
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

function ScreenFooter({ data, isFetching }) {
  const attention = data.kpis.find((k) => k.key === 'attention')?.value ?? '0';
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.total.toLocaleString()} teams</span>
        <FooterDivider />
        <span>{attention} requiring attention</span>
      </div>
      {data.mocked && (
        <span
          className="font-semibold uppercase tracking-[0.04em] text-warning"
          title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not live records."
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
      {kpis.map((kpi) => {
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
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function TeamsTable({
  data,
  search,
  status,
  department,
  teamLead,
  sort,
  onSearch,
  onStatus,
  onDepartment,
  onTeamLead,
  onSort,
  hasActiveFilters,
  onClearAll,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data.rows.filter((row) => {
      if (status !== 'All statuses' && row.status !== status) return false;
      if (department !== 'All departments' && row.department !== department) return false;
      if (teamLead === 'Assigned' && !row.leadName) return false;
      if (teamLead === 'Unassigned' && row.leadName) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        (row.leadName?.toLowerCase().includes(q) ?? false)
      );
    });
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'Members': return b.members - a.members;
        case 'Pipelines': return b.pipelines - a.pipelines;
        case 'Created': return Date.parse(b.created) - Date.parse(a.created);
        case 'Last Activity': return (a.activityMinutes ?? Infinity) - (b.activityMinutes ?? Infinity);
        default: return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [data.rows, search, status, department, teamLead, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeTeam = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

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
    status !== 'All statuses' && { key: 'status', label: `Status: ${status}`, clear: () => { onStatus('All statuses'); resetToFirstPage(); } },
    department !== 'All departments' && { key: 'dept', label: `Dept: ${department}`, clear: () => { onDepartment('All departments'); resetToFirstPage(); } },
    teamLead !== 'All team leads' && { key: 'lead', label: `Lead: ${teamLead}`, clear: () => { onTeamLead('All team leads'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search teams by name, code, department, or team lead</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search teams…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by department" value={department} options={data.departmentFilters} onChange={(v) => { onDepartment(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by team lead" value={teamLead} options={data.teamLeadFilters} onChange={(v) => { onTeamLead(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by status" value={status} options={data.statusFilters} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <label className="flex items-center gap-token-2">
            <span className="text-token-sm text-text-faint">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { onSort(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {data.sortOptions.map((opt) => (
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
              Clear filters
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
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
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
            {selected.size} team{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Activate', title: 'Bulk activate requires MOD-004’s team lifecycle endpoint (still PLANNED).' },
            { label: 'Archive', title: 'Bulk archive requires MOD-004’s team lifecycle endpoint (still PLANNED).' },
            { label: 'Assign Department', title: 'Assigning a department requires MOD-004’s team endpoint (still PLANNED).' },
            { label: 'Assign Team Lead', title: 'Assigning a team lead requires MOD-004’s team endpoint (still PLANNED).' },
            { label: 'Export', title: 'Export is not yet available — no MOD-004 team export endpoint exists.' },
            { label: 'Delete', title: 'Bulk delete requires MOD-004’s team lifecycle endpoint (still PLANNED).' },
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No teams match your filters</p>
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
                    aria-label="Select all teams on this page"
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
                {['Team', 'Code', 'Department', 'Team Lead', 'Members', 'Pipelines', 'Connectors', 'Status', 'Last Activity', 'Created', ''].map((col) => (
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
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-token-sm font-semibold ${CODE_TONE[row.tone] ?? CODE_TONE.gray}`}>
                          {row.code}
                        </span>
                        <span className="flex items-center gap-token-2">
                          <span className="text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                          {row.favorite && (
                            <span className="text-warning" title="Favorited team" aria-label="Favorited team">
                              <IconStar />
                            </span>
                          )}
                          {row.attention && (
                            <span
                              className="rounded-sm bg-danger-bg px-token-1 py-0.5 text-token-meta font-semibold text-danger-strong"
                              title="This team requires attention (team-lead or activity issue)."
                            >
                              Requires attention
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-meta text-text-faint">{row.code}</td>
                    <td className="px-token-5 py-token-3">
                      <span className="flex items-center gap-token-2">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONE[row.departmentTone] ?? DOT_TONE.gray}`} aria-hidden="true" />
                        <span className="flex flex-col">
                          <span className="text-token-sm text-text-primary-alt">{row.department}</span>
                          <span className="font-mono text-token-meta text-text-faint">{row.departmentCode}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      {row.leadName ? (
                        <span className="flex items-center gap-token-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-meta font-semibold text-primary">
                            {row.leadInitials}
                          </span>
                          <span className="text-token-sm text-text-primary-alt">{row.leadName}</span>
                        </span>
                      ) : (
                        <span className="text-token-sm font-medium text-danger-strong">Unassigned</span>
                      )}
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.members}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.pipelines}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.connectors}</td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.lastActivity}</td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.created}</td>
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
          {hasActiveFilters ? `${filtered.length.toLocaleString()} (filtered from ${data.total.toLocaleString()})` : `${data.total.toLocaleString()} teams`}
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

      {activeTeam && (
        <TeamDrawer
          team={activeTeam}
          detail={data.details?.[activeTeam.id] ?? null}
          mocked={data.mocked}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

function TeamDrawer({ team, detail, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const statusTone = STATUS_TONE[team.status] ?? STATUS_TONE.Active;

  useEffect(() => {
    closeRef.current?.focus();

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
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [onClose]);

  const teamInfo = [
    { label: 'Team Code', value: team.code },
    { label: 'Department', value: team.department },
    { label: 'Team Lead', value: team.leadName ?? 'Unassigned' },
    { label: 'Created', value: team.created },
    { label: 'Last Activity', value: team.lastActivity },
  ];

  const ownership = [
    { label: 'Department', value: team.department },
    { label: 'Team Lead', value: team.leadName ?? 'Unassigned' },
    { label: 'Created By', value: team.createdBy },
    { label: 'Created', value: team.created },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div className="flex items-center gap-token-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-token-sm font-semibold ${CODE_TONE[team.tone] ?? CODE_TONE.gray}`}>
              {team.code}
            </span>
            <div>
              <h2 id="team-drawer-title" className="m-0 flex items-center gap-token-2 text-token-base font-bold text-text-primary-alt">
                {team.name}
                {team.favorite && (
                  <span className="text-warning" title="Favorited team" aria-label="Favorited team">
                    <IconStar />
                  </span>
                )}
              </h2>
              <span className={`mt-token-1 inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                {team.status}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close team details"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          {[
            { label: 'View Details', title: 'The full team detail view requires MOD-004 (still PLANNED).' },
            { label: 'Edit Team', title: 'Editing a team requires MOD-004’s team endpoint (still PLANNED).' },
            { label: 'Manage Members', title: 'Member management requires MOD-004’s team endpoint (still PLANNED).' },
            { label: 'Pipelines', title: 'The team pipelines view requires MOD-004 (still PLANNED).' },
            { label: 'Connectors', title: 'The team connectors view requires MOD-004 (still PLANNED).' },
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
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Operational Summary</h3>
            <div className="mt-token-3 grid grid-cols-3 gap-token-3">
              {[
                { value: team.members, label: 'Members', tone: 'text-text-primary-alt' },
                { value: team.pipelines, label: 'Pipelines', tone: 'text-primary' },
                { value: team.connectors, label: 'Connectors', tone: 'text-primary' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3 text-center">
                  <p className={`m-0 text-token-lg font-extrabold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
                  <p className="m-0 mt-token-1 text-token-xs text-text-faint">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-token-3 grid grid-cols-2 gap-token-3">
              <div className="rounded-md border border-border-subtle bg-surface-muted p-token-3 text-center">
                <p className="m-0 text-token-lg font-extrabold tracking-[-0.02em] text-warning">{team.executions7d}</p>
                <p className="m-0 mt-token-1 text-token-xs text-text-faint">Executions (7d)</p>
              </div>
              <div className="rounded-md border border-border-subtle bg-surface-muted p-token-3 text-center">
                <p className="m-0 text-token-lg font-extrabold tracking-[-0.02em] text-success">{team.successRate}</p>
                <p className="m-0 mt-token-1 text-token-xs text-text-faint">Success rate</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Team Information</h3>
            <dl className="mt-token-3 flex flex-col gap-token-2">
              {teamInfo.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
                  <dt className="text-token-sm text-text-faint">{row.label}</dt>
                  <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
                </div>
              ))}
            </dl>
            {team.description && (
              <p className="m-0 mt-token-3 rounded-md bg-surface-muted px-token-3 py-token-2 text-token-sm text-text-secondary-alt">
                {team.description}
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Members</h3>
              <span className="text-token-xs font-medium text-text-faint" aria-hidden="true">View all {team.members} →</span>
            </div>
            {detail?.members?.length ? (
              <ul className="mt-token-3 flex flex-col gap-token-1">
                {detail.members.map((m) => (
                  <li key={m.initials + m.name} className="flex items-center gap-token-3 rounded-md px-token-2 py-token-2 hover:bg-surface-hover">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-meta font-semibold text-primary">{m.initials}</span>
                    <span className="flex-1">
                      <span className="block text-token-sm font-medium text-text-primary-alt">{m.name}</span>
                      <span className="block text-token-xs text-text-faint">{m.role}</span>
                    </span>
                    <IconChevronRight />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-token-sm text-text-faint">
                The per-member breakdown loads from the MOD-004 team service, which is not deployed yet. This team has {team.members} member{team.members === 1 ? '' : 's'}.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Recent Pipelines</h3>
              <span className="text-token-xs font-medium text-text-faint" aria-hidden="true">View all {team.pipelines} →</span>
            </div>
            {detail?.pipelines?.length ? (
              <ul className="mt-token-3 flex flex-col gap-token-2">
                {detail.pipelines.map((p) => (
                  <li key={p.name} className="flex items-center justify-between gap-token-3 rounded-md border border-border-subtle px-token-3 py-token-2">
                    <span>
                      <span className="block text-token-sm font-medium text-text-primary-alt">{p.name}</span>
                      <span className="block font-mono text-token-xs text-text-faint">{p.volume}</span>
                    </span>
                    <span className={`inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${PIPELINE_TONE[p.status] ?? PIPELINE_TONE.Success}`}>
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-token-sm text-text-faint">
                The recent-pipeline breakdown loads from the MOD-004 team service, which is not deployed yet. This team runs {team.pipelines} pipeline{team.pipelines === 1 ? '' : 's'}.
              </p>
            )}
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Ownership</h3>
            <dl className="mt-token-3 flex flex-col gap-token-2">
              {ownership.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
                  <dt className="text-token-sm text-text-faint">{row.label}</dt>
                  <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {mocked && (
            <p className="m-0 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-xs font-medium text-warning">
              Sample data — MOD-004 (Organization Management) has no backend deployed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-[560px] w-full animate-pulse rounded-md bg-surface-hover" />
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

function IconStar() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.4 4.3 13.4l.8-4.2L2 6.4l4.2-.5L8 1.5z" />
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

function IconChevronRight() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5 shrink-0 text-text-faint" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}
