import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useOrganizationActivity } from '../hooks/useOrganizationActivity';

const PAGE_SIZE = 16;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-warning', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Category badge tones. Reuses existing token utilities only (no new
// palette): pipeline/connector→primary, auth→success, config/permission
// →warning, user-management→success-strong, data-access→shell-accent.
const CATEGORY_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  green: 'bg-success-bg text-success-strong',
  orange: 'bg-warning-bg text-warning',
  teal: 'bg-success-bg text-success-strong',
  purple: 'bg-shell-accent-wash text-primary',
};

// Result pill tones (the "Result" column + drawer status badge).
const RESULT_TONE = {
  Success: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Failed: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
  Warning: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Info: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
};

// Severity pill tones.
const SEVERITY_TONE = {
  Critical: 'bg-danger-bg text-danger-strong',
  High: 'bg-warning-bg text-warning',
  Medium: 'bg-shell-accent-wash text-primary',
  Low: 'bg-surface-muted text-text-secondary-alt',
  Info: 'bg-surface-muted text-text-faint',
};

// Rank used by the "Severity" sort option (highest severity first).
const SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };

// Maps each saved-view tab to a row predicate. `all` matches everything.
const SAVED_VIEW_MATCH = {
  all: () => true,
  security: (r) => r.category === 'Authentication' || r.category === 'Permission Change',
  failed: (r) => r.result === 'Failed',
  pipeline: (r) => r.category === 'Pipeline Execution' || r.category === 'Connector Sync',
  users: (r) => r.category === 'User Management',
  admin: (r) => r.category === 'Configuration Change' || r.category === 'Permission Change',
};

/** SCR-031 — Organization Activity Screen. Node 99:2052, drawer 99:3801. */
export default function OrganizationActivityScreen() {
  const { id } = useParams();
  // The Administration → Audit Logs nav item routes to the literal
  // `/organizations/current/activity`; the org-scoped route supplies a
  // real `:id`. Fall back to 'current' so the (org-scoped) query is
  // always enabled and a real MOD-004 endpoint could resolve the
  // caller's active organization server-side.
  const orgId = id ?? 'current';

  const [search, setSearch] = useState('');
  const [savedView, setSavedView] = useState('all');
  const [eventType, setEventType] = useState('All event types');
  const [resourceType, setResourceType] = useState('All resources');
  const [user, setUser] = useState('All users');
  const [department, setDepartment] = useState('All departments');
  const [team, setTeam] = useState('All teams');
  const [status, setStatus] = useState('All statuses');
  const [severity, setSeverity] = useState('All severities');
  const [sort, setSort] = useState('Newest first');

  const { data, isLoading, isError, error, refetch, isFetching } = useOrganizationActivity(orgId, {
    search,
    eventType,
    resourceType,
    user,
    department,
    team,
    status,
    severity,
    savedView,
    sort,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    eventType !== 'All event types' ||
    resourceType !== 'All resources' ||
    user !== 'All users' ||
    department !== 'All departments' ||
    team !== 'All teams' ||
    status !== 'All statuses' ||
    severity !== 'All severities';

  function clearAll() {
    setSearch('');
    setEventType('All event types');
    setResourceType('All resources');
    setUser('All users');
    setDepartment('All departments');
    setTeam('All teams');
    setStatus('All statuses');
    setSeverity('All severities');
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Activity']}>
      <div className="flex flex-col gap-token-6">
        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Organization Activity</h1>
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
              Monitor operational events, administrative actions, user activity, security events, and platform changes across
              {data?.organizationName ? ` ${data.organizationName}.` : ' this organization.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Saving a filter view requires MOD-004’s activity endpoint (still PLANNED)."
            >
              <IconBookmark />
              Save Filter
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-004 activity export endpoint exists."
            >
              <IconExport />
              Export Activity Log
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
            ? 'Loading activity'
            : isError
              ? 'Couldn’t load activity'
              : isFetching
                ? 'Refreshing activity'
                : data
                  ? 'Activity updated'
                  : ''}
        </span>

        {isLoading && <ActivitySkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load activity</p>
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
            <ActivityTable
              data={data}
              search={search}
              savedView={savedView}
              eventType={eventType}
              resourceType={resourceType}
              user={user}
              department={department}
              team={team}
              status={status}
              severity={severity}
              sort={sort}
              onSearch={setSearch}
              onSavedView={setSavedView}
              onEventType={setEventType}
              onResourceType={setResourceType}
              onUser={setUser}
              onDepartment={setDepartment}
              onTeam={setTeam}
              onStatus={setStatus}
              onSeverity={setSeverity}
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
  const failed = data.kpis.find((k) => k.key === 'failed')?.value ?? '0';
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.total.toLocaleString()} events today</span>
        <FooterDivider />
        <span>{failed} failed operations</span>
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

function ActivityTable(props) {
  const {
    data, search, savedView, eventType, resourceType, user, department, team, status, severity, sort,
    onSearch, onSavedView, onEventType, onResourceType, onUser, onDepartment, onTeam, onStatus, onSeverity, onSort,
    hasActiveFilters, onClearAll,
  } = props;

  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const viewMatch = SAVED_VIEW_MATCH[savedView] ?? SAVED_VIEW_MATCH.all;
    const rows = data.rows.filter((row) => {
      if (!viewMatch(row)) return false;
      if (eventType !== 'All event types' && row.category !== eventType) return false;
      if (resourceType !== 'All resources' && row.resourceType !== resourceType) return false;
      if (user !== 'All users' && row.actorName !== user) return false;
      if (department !== 'All departments' && row.department !== department) return false;
      if (team !== 'All teams' && row.team !== team) return false;
      if (status !== 'All statuses' && row.result !== status) return false;
      if (severity !== 'All severities' && row.severity !== severity) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.actorName.toLowerCase().includes(q) ||
        row.resourceName.toLowerCase().includes(q) ||
        row.resourceId.toLowerCase().includes(q)
      );
    });
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'Oldest first': return a.epoch - b.epoch;
        case 'Severity': return (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
        case 'Category': return a.category.localeCompare(b.category);
        default: return b.epoch - a.epoch; // Newest first
      }
    });
    return sorted;
  }, [data.rows, search, savedView, eventType, resourceType, user, department, team, status, severity, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeEvent = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

  function resetToFirstPage() {
    setPage(1);
    setExpandedId(null);
  }

  const chips = [
    eventType !== 'All event types' && { key: 'type', label: `Type: ${eventType}`, clear: () => { onEventType('All event types'); resetToFirstPage(); } },
    resourceType !== 'All resources' && { key: 'res', label: `Resource: ${resourceType}`, clear: () => { onResourceType('All resources'); resetToFirstPage(); } },
    user !== 'All users' && { key: 'user', label: `User: ${user}`, clear: () => { onUser('All users'); resetToFirstPage(); } },
    department !== 'All departments' && { key: 'dept', label: `Dept: ${department}`, clear: () => { onDepartment('All departments'); resetToFirstPage(); } },
    team !== 'All teams' && { key: 'team', label: `Team: ${team}`, clear: () => { onTeam('All teams'); resetToFirstPage(); } },
    status !== 'All statuses' && { key: 'status', label: `Result: ${status}`, tone: RESULT_TONE[status]?.pill, clear: () => { onStatus('All statuses'); resetToFirstPage(); } },
    severity !== 'All severities' && { key: 'sev', label: `Severity: ${severity}`, tone: SEVERITY_TONE[severity], clear: () => { onSeverity('All severities'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      {/* Saved-view tabs */}
      <div className="flex flex-wrap items-center gap-token-1 border-b border-border-subtle px-token-5 py-token-2" role="tablist" aria-label="Saved activity views">
        {data.savedViews.map((view) => {
          const selected = savedView === view.key;
          return (
            <button
              key={view.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => { onSavedView(view.key); resetToFirstPage(); }}
              className={`h-7 rounded-md px-token-3 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                selected ? 'bg-shell-accent-wash text-primary' : 'text-text-secondary-alt hover:bg-surface-hover'
              }`}
            >
              {view.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled
          title="Saving a custom view requires MOD-004’s activity endpoint (still PLANNED)."
          className="ml-auto flex h-7 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconBookmark />
          Save current
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search activity by event, ID, actor, or resource</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search activity…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by event type" value={eventType} options={data.eventTypeFilters} onChange={(v) => { onEventType(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by resource type" value={resourceType} options={data.resourceTypeFilters} onChange={(v) => { onResourceType(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by user" value={user} options={data.userFilters} onChange={(v) => { onUser(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by department" value={department} options={data.departmentFilters} onChange={(v) => { onDepartment(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by team" value={team} options={data.teamFilters} onChange={(v) => { onTeam(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by status" value={status} options={data.statusFilters} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by severity" value={severity} options={data.severityFilters} onChange={(v) => { onSeverity(v); resetToFirstPage(); }} />
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
              Clear all
            </button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-token-2 border-b border-border-subtle px-token-5 py-token-2">
          {chips.map((chip) => (
            <span key={chip.key} className={`flex items-center gap-token-1 rounded-full px-token-3 py-0.5 text-token-xs font-medium ${chip.tone ?? 'bg-shell-accent-wash text-primary'}`}>
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-overlay-scrim/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {pageRows.length === 0 ? (
        <div className="px-token-5 py-token-8 text-center">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No activity matches your filters</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Try adjusting your search, saved view, or clearing the active filters.</p>
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
                <th scope="col" className="border-b border-border-subtle px-token-4 py-token-3" aria-hidden="true" />
                {['Time', 'ID', 'Event', 'Category', 'Performed By', 'Resource', 'Department', 'Result', 'Severity', 'Source', ''].map((col) => (
                  <th
                    key={col || 'actions'}
                    scope="col"
                    className="border-b border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint whitespace-nowrap"
                  >
                    {col || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <ActivityRow
                  key={row.id}
                  row={row}
                  expanded={expandedId === row.id}
                  onToggleExpand={() => setExpandedId((cur) => (cur === row.id ? null : row.id))}
                  onOpen={() => setActiveId(row.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Rows per page {PAGE_SIZE} · Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1}–
          {Math.min(clampedPage * PAGE_SIZE, filtered.length)} of{' '}
          {hasActiveFilters ? `${filtered.length.toLocaleString()} (filtered from ${data.total.toLocaleString()})` : `${data.total.toLocaleString()} events today`}
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

      {activeEvent && (
        <EventDrawer event={activeEvent} organizationName={data.organizationName} mocked={data.mocked} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}

function ActivityRow({ row, expanded, onToggleExpand, onOpen }) {
  const resultTone = RESULT_TONE[row.result] ?? RESULT_TONE.Info;
  const canExpand = !!row.detail;
  return (
    <>
      <tr
        className="cursor-pointer border-b border-border-subtle hover:bg-surface-hover"
        onClick={onOpen}
      >
        <td className="px-token-4 py-token-3 align-top" onClick={(e) => e.stopPropagation()}>
          {canExpand ? (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${row.id} timeline` : `Expand ${row.id} timeline`}
              className="flex h-5 w-5 items-center justify-center rounded text-text-faint hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            >
              <IconChevronRight rotated={expanded} />
            </button>
          ) : (
            <span className="block h-5 w-5" aria-hidden="true" />
          )}
        </td>
        <td className="px-token-4 py-token-3 align-top font-mono text-token-meta text-text-secondary-alt whitespace-nowrap">{row.time}</td>
        <td className="px-token-4 py-token-3 align-top font-mono text-token-meta text-text-faint whitespace-nowrap">{row.id}</td>
        <td className="px-token-4 py-token-3 align-top">
          <span className="text-token-sm font-semibold text-text-primary-alt">{row.title}</span>
        </td>
        <td className="px-token-4 py-token-3 align-top">
          <span className={`inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${CATEGORY_TONE[row.categoryTone] ?? CATEGORY_TONE.blue}`}>
            {row.category}
          </span>
        </td>
        <td className="px-token-4 py-token-3 align-top">
          <span className="flex items-center gap-token-2">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-token-meta font-semibold ${
                row.isSystem ? 'bg-surface-muted text-text-faint' : 'bg-shell-accent-wash text-primary'
              }`}
            >
              {row.actorInitials}
            </span>
            <span className="text-token-sm text-text-primary-alt whitespace-nowrap">{row.actorName}</span>
          </span>
        </td>
        <td className="px-token-4 py-token-3 align-top">
          <span className="flex flex-col">
            <span className="text-token-sm text-text-primary-alt">{row.resourceName}</span>
            <span className="font-mono text-token-meta text-text-faint">{row.resourceType} · {row.resourceId}</span>
          </span>
        </td>
        <td className="px-token-4 py-token-3 align-top text-token-sm text-text-secondary-alt whitespace-nowrap">{row.department}</td>
        <td className="px-token-4 py-token-3 align-top">
          <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${resultTone.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${resultTone.dot}`} aria-hidden="true" />
            {row.result}
          </span>
        </td>
        <td className="px-token-4 py-token-3 align-top">
          <span className={`inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${SEVERITY_TONE[row.severity] ?? SEVERITY_TONE.Info}`}>
            {row.severity}
          </span>
        </td>
        <td className="px-token-4 py-token-3 align-top font-mono text-token-meta text-text-faint whitespace-nowrap">{row.sourceIp}</td>
        <td className="px-token-4 py-token-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onOpen}
            aria-label={`View ${row.id} details`}
            className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View
          </button>
        </td>
      </tr>
      {expanded && canExpand && (
        <tr className="border-b border-border-subtle bg-surface-muted">
          <td />
          <td colSpan={10} className="px-token-5 py-token-4">
            <InlineTimeline detail={row.detail} eventId={row.id} />
          </td>
        </tr>
      )}
    </>
  );
}

function InlineTimeline({ detail, eventId }) {
  return (
    <div className="flex flex-col gap-token-3">
      <h4 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Event Timeline — {eventId}</h4>
      <ol className="m-0 flex flex-col gap-token-2 p-0">
        {detail.timeline.map((step, i) => (
          <li key={i} className="flex items-center gap-token-3">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.tone === 'error' ? 'bg-danger' : 'bg-success'}`}
              aria-hidden="true"
            >
              {step.tone === 'error' ? <IconClose /> : <IconCheck />}
            </span>
            <span className="flex-1 text-token-sm text-text-primary-alt">{step.label}</span>
            <span className="font-mono text-token-meta text-text-faint">{step.time}</span>
          </li>
        ))}
      </ol>
      {detail.errorTitle && (
        <div className="rounded-md border border-danger-border bg-danger-bg px-token-4 py-token-3" role="alert">
          <p className="m-0 text-token-sm font-semibold text-danger-strong">{detail.errorTitle}</p>
          {detail.errorDetail && <p className="m-0 mt-token-1 text-token-sm text-danger">{detail.errorDetail}</p>}
          {detail.errorHint && <p className="m-0 mt-token-2 font-mono text-token-xs text-danger-strong">{detail.errorHint}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-token-2">
        <button
          type="button"
          disabled
          title="The full audit record requires MOD-004’s activity endpoint (still PLANNED)."
          className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          View Full Audit Record
        </button>
        <button
          type="button"
          disabled
          title="Opening the linked resource requires MOD-004 (still PLANNED)."
          className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          View Resource
        </button>
      </div>
    </div>
  );
}

function EventDrawer({ event, organizationName, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const resultTone = RESULT_TONE[event.result] ?? RESULT_TONE.Info;
  const detail = event.detail ?? null;

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

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
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

  const summary = [
    { label: 'Event ID', value: event.id, mono: true },
    { label: 'Category', value: event.category },
    { label: 'Timestamp', value: event.timestamp, mono: true },
    detail?.durationLabel && { label: 'Duration', value: detail.durationLabel },
    { label: 'Status', value: event.result },
    { label: 'Severity', value: event.severity },
  ].filter(Boolean);

  const actor = [
    { label: 'Role', value: detail?.role ?? (event.isSystem ? 'System Process' : 'User') },
    { label: 'Department', value: event.department },
    { label: 'Team', value: event.team },
    { label: 'Source IP', value: event.sourceIp, mono: true },
    { label: 'Auth Method', value: event.authMethod },
  ];

  const resource = [
    { label: 'Type', value: event.resourceType },
    { label: 'Name', value: event.resourceName },
    { label: 'Resource ID', value: event.resourceId, mono: true },
    { label: 'Organization', value: organizationName ?? '—' },
    { label: 'Department', value: event.department },
    { label: 'Team', value: event.team },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div>
            <div className="flex flex-wrap items-center gap-token-2">
              <span className={`inline-flex items-center gap-token-1 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${resultTone.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${resultTone.dot}`} aria-hidden="true" />
                {event.result}
              </span>
              <span className={`inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${SEVERITY_TONE[event.severity] ?? SEVERITY_TONE.Info}`}>
                {event.severity}
              </span>
              <span className={`inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${CATEGORY_TONE[event.categoryTone] ?? CATEGORY_TONE.blue}`}>
                {event.category}
              </span>
            </div>
            <h2 id="event-drawer-title" className="m-0 mt-token-2 text-token-base font-bold text-text-primary-alt">{event.title}</h2>
            <p className="m-0 mt-token-1 font-mono text-token-xs text-text-faint">{event.id} · {event.timestamp}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          {[
            { label: 'View Resource', title: 'Opening the linked resource requires MOD-004 (still PLANNED).' },
            { label: 'View User', title: 'The user detail view is delivered by MOD-005 (User Management, still PLANNED).' },
            { label: 'View Audit Record', title: 'The full audit record requires MOD-004’s activity endpoint (still PLANNED).' },
            { label: 'Copy ID', title: 'Copying the event ID requires MOD-004’s activity endpoint (still PLANNED).' },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              disabled
              title={action.title}
              className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-token-6 px-token-5 py-token-5">
          <DrawerSection title="Event Summary" rows={summary} />

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Actor</h3>
            <div className="mt-token-3 flex items-center gap-token-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-token-sm font-semibold ${event.isSystem ? 'bg-surface-muted text-text-faint' : 'bg-shell-accent-wash text-primary'}`}>
                {event.actorInitials}
              </span>
              <div>
                <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{event.actorName}</p>
                {detail?.actorSubtitle && <p className="m-0 text-token-xs text-text-faint">{detail.actorSubtitle}</p>}
              </div>
            </div>
            <DefinitionList rows={actor} className="mt-token-3" />
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Resource</h3>
            <DefinitionList rows={resource} className="mt-token-3" />
          </section>

          {detail?.timeline?.length ? (
            <section>
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Event Timeline</h3>
              <div className="mt-token-3">
                <InlineTimelineSteps timeline={detail.timeline} />
              </div>
              {detail.errorTitle && (
                <div className="mt-token-3 rounded-md border border-danger-border bg-danger-bg px-token-4 py-token-3" role="alert">
                  <p className="m-0 text-token-sm font-semibold text-danger-strong">{detail.errorTitle}</p>
                  {detail.errorDetail && <p className="m-0 mt-token-1 text-token-sm text-danger">{detail.errorDetail}</p>}
                  {detail.errorHint && <p className="m-0 mt-token-2 font-mono text-token-xs text-danger-strong">{detail.errorHint}</p>}
                </div>
              )}
            </section>
          ) : (
            <section>
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Event Timeline</h3>
              <p className="m-0 mt-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-3 py-token-3 text-token-sm text-text-faint">
                The step-by-step timeline for this event loads from the MOD-004 activity service, which is not deployed yet.
              </p>
            </section>
          )}

          {detail?.metadata?.length ? (
            <section>
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Technical Metadata</h3>
              <dl className="mt-token-3 flex flex-col gap-token-2">
                {detail.metadata.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
                    <dt className="text-token-sm text-text-faint">{row.label}</dt>
                    <dd className="m-0 flex items-center gap-token-2 font-mono text-token-xs font-medium text-text-primary-alt">
                      {row.value}
                      <span className="text-text-faint" title="Copy requires MOD-004 (still PLANNED)." aria-hidden="true"><IconCopy /></span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

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

function DrawerSection({ title, rows }) {
  return (
    <section>
      <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{title}</h3>
      <DefinitionList rows={rows} className="mt-token-3" />
    </section>
  );
}

function DefinitionList({ rows, className }) {
  return (
    <dl className={`flex flex-col gap-token-2 ${className ?? ''}`}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
          <dt className="text-token-sm text-text-faint">{row.label}</dt>
          <dd className={`m-0 text-token-sm font-medium text-text-primary-alt ${row.mono ? 'font-mono text-token-xs' : ''}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function InlineTimelineSteps({ timeline }) {
  return (
    <ol className="m-0 flex flex-col gap-token-2 p-0">
      {timeline.map((step, i) => (
        <li key={i} className="flex items-center gap-token-3">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.tone === 'error' ? 'bg-danger' : 'bg-success'}`}
            aria-hidden="true"
          >
            {step.tone === 'error' ? <IconClose /> : <IconCheck />}
          </span>
          <span className="flex-1 text-token-sm text-text-primary-alt">{step.label}</span>
          <span className="font-mono text-token-meta text-text-faint">{step.time}</span>
        </li>
      ))}
    </ol>
  );
}

function ActivitySkeleton() {
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

/* Inline icons — currentColor SVGs matching the Figma glyphs. */
function IconBookmark() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2.5h8v11l-4-2.5-4 2.5v-11Z" />
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

function IconX() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function IconChevronRight({ rotated }) {
  return (
    <svg viewBox="0 0 16 16" className={`block h-3.5 w-3.5 transition-transform ${rotated ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" className="block h-2.5 w-2.5 text-on-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-6.5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" className="block h-2.5 w-2.5 text-on-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" />
    </svg>
  );
}
