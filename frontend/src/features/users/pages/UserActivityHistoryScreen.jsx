import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useUserActivityHistory } from '../hooks/useUserActivityHistory';
import {
  SAVED_VIEWS,
  ACTIVITY_TYPES,
  STATUSES,
  SEVERITIES,
} from '../services/userActivityHistory.api';

/* Scope this view to the caller's organization. MOD-005 has no live
   "current org" endpoint, so this mirrors the id used by the sibling
   user screens (SCR-035/036) until org context ships. */
const ORG_ID = 'current';
const MOD005_TITLE = 'Requires the MOD-005 user backend, which is not deployed yet.';
const PAGE_SIZE = 10;

const STATUS_TONE = {
  Success: 'bg-success-bg text-success-strong',
  Failed: 'bg-danger-bg text-danger-strong',
  Warning: 'bg-warning-bg text-warning-strong',
};

const SEVERITY_TONE = {
  Info: 'bg-shell-accent-wash text-primary',
  Low: 'bg-surface-muted text-text-secondary-alt',
  Medium: 'bg-warning-bg text-warning-strong',
  High: 'bg-danger-bg text-danger-strong',
  Critical: 'bg-danger-bg text-danger-strong',
};

const STAT_TONE = {
  default: 'text-text-primary-alt',
  warning: 'text-warning',
  danger: 'text-danger-strong',
};

/* Account-status indicator dot — mapped from the status value so a real
   backend's suspended/locked user isn't shown a misleading green dot. */
const ACCOUNT_STATUS_DOT = {
  Active: 'bg-success',
  Pending: 'bg-primary',
  Locked: 'bg-warning',
  Suspended: 'bg-danger-strong',
  Inactive: 'bg-text-faint',
};

/** SCR-037 — User Activity History Screen. Node 109:13321, page "Page 1". */
export default function UserActivityHistoryScreen() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useUserActivityHistory(ORG_ID, id);

  const displayName = data?.user?.name ?? id;

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users', displayName, 'Activity History']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading activity history'
            : isError
              ? 'Couldn’t load activity history'
              : data
                ? `Activity history for ${displayName} loaded`
                : ''}
        </span>

        <BackLink userId={id} />

        {isLoading && <ActivitySkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load activity history</p>
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
          <ActivityView data={data} userId={id} onRefresh={() => refetch()} isFetching={isFetching} />
        )}
      </div>
    </AppShell>
  );
}

function BackLink({ userId }) {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to={userId ? `/users/${encodeURIComponent(userId)}` : '/users'}
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to User Details
      </Link>
    </div>
  );
}

function ActivityView({ data, userId, onRefresh, isFetching }) {
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [resource, setResource] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(() => data.activities[0]?.id ?? null);

  const resourceOptions = useMemo(
    () => Array.from(new Set(data.activities.map((a) => a.resource))).sort(),
    [data.activities],
  );

  const activeView = SAVED_VIEWS.find((v) => v.id === view) ?? SAVED_VIEWS[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data.activities.filter((a) => {
      if (activeView.category && a.category !== activeView.category) return false;
      if (activeView.status && a.status !== activeView.status) return false;
      if (type && a.category !== type) return false;
      if (resource && a.resource !== resource) return false;
      if (status && a.status !== status) return false;
      if (severity && a.severity !== severity) return false;
      if (q) {
        const hay = `${a.activity} ${a.resource} ${a.action} ${a.source} ${a.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    rows.sort((a, b) =>
      sortNewest
        ? b.timestamp.localeCompare(a.timestamp)
        : a.timestamp.localeCompare(b.timestamp),
    );
    return rows;
  }, [data.activities, activeView, search, type, resource, status, severity, sortNewest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // `selectedId === null` means the user explicitly closed the inspector →
  // show its empty state. Otherwise resolve to the chosen row, or the first
  // row still in the current filter set. When filters match nothing, fall to
  // null (no cross-filter leak) so the inspector's empty state agrees with the
  // empty table instead of showing an out-of-filter activity.
  const selected =
    selectedId === null ? null : (filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null);

  const resetFilters = () => {
    setSearch('');
    setType('');
    setResource('');
    setStatus('');
    setSeverity('');
    setPage(1);
  };

  const applyView = (id) => {
    setView(id);
    setPage(1);
  };

  const hasFilters = Boolean(search || type || resource || status || severity || view !== 'all');

  return (
    <div className="flex flex-col gap-token-6">
      {data.mocked && (
        <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <IconInfo className="mt-0.5 block h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-sm text-warning-strong">
            <span className="font-semibold">Sample data.</span> The MOD-005 user backend is not
            deployed yet, so this activity log is design-sourced and read-only. No live events were loaded.
          </p>
        </div>
      )}

      <Header onRefresh={onRefresh} isFetching={isFetching} />
      <UserContextStrip user={data.user} userId={userId} />
      <StatGrid stats={data.stats} />
      <SavedViews activeView={view} onSelect={applyView} />
      <FilterBar
        search={search}
        setSearch={(v) => { setSearch(v); setPage(1); }}
        type={type}
        setType={(v) => { setType(v); setPage(1); }}
        resource={resource}
        setResource={(v) => { setResource(v); setPage(1); }}
        resourceOptions={resourceOptions}
        status={status}
        setStatus={(v) => { setStatus(v); setPage(1); }}
        severity={severity}
        setSeverity={(v) => { setSeverity(v); setPage(1); }}
        sortNewest={sortNewest}
        setSortNewest={setSortNewest}
        onClear={resetFilters}
        hasFilters={hasFilters}
      />

      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ActivityTable
          rows={pageRows}
          totalFiltered={filtered.length}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          page={safePage}
          totalPages={totalPages}
          setPage={setPage}
          hasFilters={hasFilters}
          onClear={resetFilters}
        />
        <ActivityDetails activity={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}

/* ---- Header --------------------------------------------------------- */

function Header({ onRefresh, isFetching }) {
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-token-xl font-bold text-text-primary-alt">User Activity History</h1>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Review authentication events, operational activity, administrative changes, resource
          access, and audit records for this user.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="flex h-9 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-progress disabled:opacity-70"
        >
          <IconRefresh className={`block h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
        <button
          type="button"
          disabled
          title={MOD005_TITLE}
          className="flex h-9 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconSave className="block h-3.5 w-3.5" />
          Save Filter
        </button>
        <button
          type="button"
          disabled
          title={MOD005_TITLE}
          className="flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconExport className="block h-3.5 w-3.5" />
          Export Activity History
        </button>
      </div>
    </div>
  );
}

/* ---- User context strip --------------------------------------------- */

function UserContextStrip({ user, userId }) {
  const fields = [
    ['Department', user.department],
    ['Team', user.team],
    ['Role', user.role],
    ['Account Status', user.accountStatus],
    ['Last Login', user.lastLogin],
    ['Member Since', user.memberSince],
  ];
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-token-4">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-base font-semibold text-primary">
          {user.initials}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-base font-semibold text-text-primary-alt">{user.name}</p>
          <p className="m-0 truncate text-token-sm text-text-secondary-alt">{user.jobTitle}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{user.email}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-token-6 gap-y-token-2 sm:grid-cols-3">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-token-meta uppercase tracking-[0.04em] text-text-faint">{label}</dt>
            <dd className="m-0 text-token-sm font-medium text-text-primary-alt">
              {label === 'Account Status' ? (
                <span className="inline-flex items-center gap-token-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${ACCOUNT_STATUS_DOT[value] ?? 'bg-text-faint'}`} aria-hidden="true" />
                  {value}
                </span>
              ) : value}
            </dd>
          </div>
        ))}
      </dl>
      <Link
        to={userId ? `/users/${encodeURIComponent(userId)}` : '/users'}
        className="flex h-9 shrink-0 items-center gap-token-1 self-start rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:self-center"
      >
        View User Details
        <IconArrow className="block h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ---- Stat grid ------------------------------------------------------ */

function StatGrid({ stats }) {
  return (
    <ul className="grid grid-cols-2 gap-token-4 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((s) => (
        <li key={s.key} className="rounded-md border border-border bg-surface-card p-token-4 shadow-sm">
          <p className="m-0 text-token-meta uppercase tracking-[0.04em] text-text-faint">{s.label}</p>
          <p className={`m-0 mt-token-1 text-token-xl font-bold ${STAT_TONE[s.tone] ?? STAT_TONE.default}`}>{s.value}</p>
          <p className="m-0 mt-token-1 text-token-meta text-text-faint">{s.hint}</p>
        </li>
      ))}
    </ul>
  );
}

/* ---- Saved views ---------------------------------------------------- */

function SavedViews({ activeView, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-token-2">
      <span className="text-token-meta font-medium text-text-faint">Saved views:</span>
      {SAVED_VIEWS.map((v) => {
        const active = v.id === activeView;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            aria-pressed={active}
            className={`h-7 rounded-full border px-token-3 text-token-meta font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active
                ? 'border-primary bg-shell-accent-wash text-primary'
                : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Filter bar ----------------------------------------------------- */

function Select({ label, value, onChange, options, allLabel, noPlaceholder }) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-primary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {!noPlaceholder && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function FilterBar({
  search, setSearch, type, setType, resource, setResource, resourceOptions,
  status, setStatus, severity, setSeverity, sortNewest, setSortNewest, onClear, hasFilters,
}) {
  return (
    <div className="flex flex-col gap-token-3 rounded-md border border-border bg-surface-card p-token-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-center">
      <label className="relative min-w-0 flex-1 lg:max-w-xs">
        <span className="sr-only">Search activities</span>
        <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 block h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities…"
          className="h-9 w-full rounded-md border border-border bg-surface-card pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <Select label="Activity type" value={type} onChange={setType} options={ACTIVITY_TYPES} allLabel="All Activity Types" />
      <Select label="Resource" value={resource} onChange={setResource} options={resourceOptions} allLabel="All Resources" />
      <Select label="Status" value={status} onChange={setStatus} options={STATUSES} allLabel="All Statuses" />
      <Select label="Severity" value={severity} onChange={setSeverity} options={SEVERITIES} allLabel="All Severities" />
      <Select
        label="Sort order"
        value={sortNewest ? 'Newest First' : 'Oldest First'}
        onChange={(v) => setSortNewest(v === 'Newest First')}
        options={['Newest First', 'Oldest First']}
        noPlaceholder
      />
      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        className="flex h-9 shrink-0 items-center gap-token-1 rounded-md px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconX className="block h-3 w-3" />
        Clear
      </button>
    </div>
  );
}

/* ---- Activity table ------------------------------------------------- */

function ActivityTable({ rows, totalFiltered, selectedId, onSelect, page, totalPages, setPage, hasFilters, onClear }) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between gap-token-3 border-b border-border-subtle px-token-4 py-token-3">
        <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">
          {totalFiltered.toLocaleString()} {totalFiltered === 1 ? 'activity' : 'activities'}
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-token-2 px-token-6 py-token-9 text-center">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No activities match your filters</p>
          <p className="m-0 text-token-sm text-text-secondary-alt">Try broadening or clearing the filters above.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="mt-token-2 h-8 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-token-sm" role="grid">
            <thead>
              <tr role="row" className="border-b border-border-subtle text-token-meta uppercase tracking-[0.04em] text-text-faint">
                <Th>Timestamp</Th>
                <Th>Activity</Th>
                <Th>Category</Th>
                <Th>Resource</Th>
                <Th>Action</Th>
                <Th>Status</Th>
                <Th>Severity</Th>
                <Th>Source</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const active = a.id === selectedId;
                return (
                  <tr
                    key={a.id}
                    role="row"
                    onClick={() => onSelect(a.id)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(a.id); } }}
                    aria-selected={active}
                    className={`cursor-pointer border-b border-border-subtle last:border-b-0 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary ${
                      active ? 'bg-shell-accent-wash' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <Td className="whitespace-nowrap font-mono text-token-meta text-text-secondary-alt">{a.timestamp}</Td>
                    <Td className="font-medium text-text-primary-alt">{a.activity}</Td>
                    <Td><Pill className="bg-surface-muted text-text-secondary-alt">{a.category}</Pill></Td>
                    <Td className="text-text-secondary-alt">{a.resource}</Td>
                    <Td className="text-text-secondary-alt">{a.action}</Td>
                    <Td><Pill className={STATUS_TONE[a.status] ?? 'bg-surface-muted text-text-secondary-alt'}>{a.status}</Pill></Td>
                    <Td><Pill className={SEVERITY_TONE[a.severity] ?? 'bg-surface-muted text-text-secondary-alt'}>{a.severity}</Pill></Td>
                    <Td className="whitespace-nowrap text-token-meta text-text-faint">{a.source}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-4 py-token-3 text-token-meta text-text-faint">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalFiltered)} of{' '}
            {totalFiltered.toLocaleString()}
          </span>
          <div className="flex items-center gap-token-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="px-token-2 font-medium text-text-secondary-alt">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Th({ children }) {
  return <th scope="col" role="columnheader" className="px-token-4 py-token-3 font-semibold">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td role="gridcell" className={`px-token-4 py-token-3 align-middle ${className}`}>{children}</td>;
}
function Pill({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${className}`}>
      {children}
    </span>
  );
}

/* ---- Activity details inspector ------------------------------------ */

function ActivityDetails({ activity, onClose }) {
  if (!activity) {
    return (
      <aside className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
        <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Activity Details</p>
        <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">
          Select an activity from the table to inspect its full event record.
        </p>
      </aside>
    );
  }

  const d = activity.detail;

  return (
    <aside className="flex flex-col gap-token-5 self-start rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="min-w-0">
          <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Activity Details</p>
          <p className="m-0 mt-0.5 truncate font-mono text-token-meta text-text-faint">Event ID: {activity.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close activity details"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconX className="block h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-token-2">
        <Pill className={STATUS_TONE[activity.status] ?? 'bg-surface-muted text-text-secondary-alt'}>{activity.status}</Pill>
        <Pill className={SEVERITY_TONE[activity.severity] ?? 'bg-surface-muted text-text-secondary-alt'}>{activity.severity}</Pill>
        <Pill className="bg-surface-muted text-text-secondary-alt">{activity.category}</Pill>
      </div>

      {d ? (
        <>
          <DetailBlock title="Event Summary" rows={d.summary} />
          <DetailBlock title="User Context" rows={d.userContext} />
          <DetailBlock title="Resource Information" rows={d.resource} mono={['Resource ID']} />
          <Timeline title="Activity Timeline" steps={d.timeline} />
          <DetailBlock title="Technical Metadata" rows={d.metadata} muted mono={['Correlation ID', 'Session ID', 'Request ID', 'IP Address']} />
          <div className="flex flex-col gap-token-2 border-t border-border-subtle pt-token-4">
            <button type="button" disabled title={MOD005_TITLE} className="flex h-9 items-center justify-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
              <IconClock className="block h-3.5 w-3.5" />
              View Audit Record
            </button>
            <CopyEventIdButton eventId={activity.id} />
            <button type="button" disabled title={MOD005_TITLE} className="h-9 rounded-md px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
              Export Event
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
          <dl className="flex flex-col gap-token-3">
            <DetailRow label="Activity" value={activity.activity} />
            <DetailRow label="Timestamp" value={activity.timestamp} mono />
            <DetailRow label="Category" value={activity.category} />
            <DetailRow label="Action" value={activity.action} />
            <DetailRow label="Resource" value={activity.resource} />
            <DetailRow label="Source" value={activity.source} />
          </dl>
          <p className="m-0 mt-token-3 text-token-meta text-text-faint">
            A full event record for this activity ships with the MOD-005 backend.
          </p>
        </div>
      )}
    </aside>
  );
}

/* Copy Event ID is a pure client action (no MOD-005 backend needed), so
   unlike the sibling audit/export actions it stays live. Falls back
   gracefully if the Clipboard API is unavailable (insecure context). */
function CopyEventIdButton({ eventId }) {
  const [copied, setCopied] = useState(false);
  const canCopy = typeof navigator !== 'undefined' && navigator.clipboard?.writeText;

  const onCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(eventId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={!canCopy}
      className="h-9 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {copied ? 'Copied ✓' : 'Copy Event ID'}
    </button>
  );
}

function DetailBlock({ title, rows, muted, mono = [] }) {
  return (
    <div>
      <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">{title}</p>
      <dl className={`mt-token-2 flex flex-col gap-token-2 ${muted ? 'text-text-faint' : ''}`}>
        {rows.map(([label, value]) => (
          <DetailRow key={label} label={label} value={value} mono={mono.includes(label)} muted={muted} />
        ))}
      </dl>
    </div>
  );
}

function DetailRow({ label, value, mono, muted }) {
  return (
    <div className="flex items-start justify-between gap-token-4">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 text-right text-token-meta font-medium ${muted ? 'text-text-secondary-alt' : 'text-text-primary-alt'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function Timeline({ title, steps }) {
  return (
    <div>
      <p className="m-0 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">{title}</p>
      <ol className="mt-token-3 flex flex-col gap-token-3">
        {steps.map(([label, time], i) => (
          <li key={label} className="flex items-start gap-token-3">
            <span className="relative flex flex-col items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-text-on-primary" aria-hidden="true">
                <IconCheck className="block h-2.5 w-2.5" />
              </span>
              {i < steps.length - 1 && <span className="mt-0.5 h-4 w-px bg-border" aria-hidden="true" />}
            </span>
            <span className="min-w-0 -mt-0.5">
              <span className="block text-token-meta font-medium text-text-primary-alt">{label}</span>
              <span className="block font-mono text-token-meta text-text-faint">{time}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---- Loading skeleton ----------------------------------------------- */

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="h-20 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="grid grid-cols-2 gap-token-4 md:grid-cols-3 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-md border border-border bg-surface-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-md border border-border bg-surface-muted" />
        <div className="h-96 animate-pulse rounded-md border border-border bg-surface-muted" />
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor) ------------------------------------ */

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
function IconArrow({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
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
function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="m11 11 3 3" />
    </svg>
  );
}
function IconRefresh({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2.5V5H11" />
    </svg>
  );
}
function IconSave({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2h8l2 2v10H3z" />
      <path d="M5 2v4h5V2M5 14v-4h6v4" />
    </svg>
  );
}
function IconExport({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10V2M5 5l3-3 3 3" />
      <path d="M3 10v3.5h10V10" />
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
