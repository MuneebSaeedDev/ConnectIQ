import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useOrganizationList } from '../hooks/useOrganizationList';

const PAGE_SIZE = 12;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Colored organization avatar tones (Figma: blue/purple/green/gray).
const ORG_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  purple: 'bg-warning-bg text-warning',
  green: 'bg-success-bg text-success-strong',
  gray: 'bg-surface-muted text-text-faint',
};

const PLAN_TONE = {
  Enterprise: 'bg-shell-accent-wash text-primary',
  Professional: 'bg-success-bg text-success-strong',
  Starter: 'bg-surface-muted text-text-secondary-alt',
};

// Status pill tones. Pending is a neutral "info" tone; Expired is muted.
const STATUS_TONE = {
  Active: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Trial: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Suspended: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
  Pending: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Expired: { dot: 'bg-text-faint', pill: 'bg-surface-muted text-text-secondary-alt' },
};

/** SCR-024 — Organization List Screen. Node 90:8293, Figma page "Page 1". */
export default function OrganizationListScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [plan, setPlan] = useState('All plans');
  const [region, setRegion] = useState('All regions');

  const { data, isLoading, isError, error, refetch, isFetching } = useOrganizationList({
    search,
    status,
    plan,
    region,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    status !== 'All statuses' ||
    plan !== 'All plans' ||
    region !== 'All regions';

  function clearAll() {
    setSearch('');
    setStatus('All statuses');
    setPlan('All plans');
    setRegion('All regions');
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Organizations']}>
      <div className="flex flex-col gap-token-6">
        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Organizations</h1>
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
              Manage organizations, subscriptions, administrators, and platform access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Import is not yet available — no MOD-004 organization import endpoint exists."
            >
              <IconImport />
              Import
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-004 organization export endpoint exists."
            >
              <IconExport />
              Export
            </button>
            <Link
              to="/organizations/new"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <IconPlus />
              Create Organization
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

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading organizations'
            : isError
              ? 'Couldn’t load organizations'
              : isFetching
                ? 'Refreshing organizations'
                : data
                  ? 'Organizations updated'
                  : ''}
        </span>

        {isLoading && <OrganizationListSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load organizations</p>
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
            <OrganizationsTable
              data={data}
              search={search}
              status={status}
              plan={plan}
              region={region}
              onSearch={setSearch}
              onStatus={setStatus}
              onPlan={setPlan}
              onRegion={setRegion}
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
  const suspended = data.kpis.find((k) => k.key === 'suspended')?.value ?? '0';
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.total.toLocaleString()} organizations</span>
        <FooterDivider />
        <span>{suspended} suspended</span>
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
    <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-5">
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

function OrganizationsTable({
  data,
  search,
  status,
  plan,
  region,
  onSearch,
  onStatus,
  onPlan,
  onRegion,
  hasActiveFilters,
  onClearAll,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.rows.filter((row) => {
      if (status !== 'All statuses' && row.status !== status) return false;
      if (plan !== 'All plans' && row.plan !== plan) return false;
      if (region !== 'All regions' && row.region !== region) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q) ||
        (row.adminName?.toLowerCase().includes(q) ?? false) ||
        (row.adminEmail?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data.rows, search, status, plan, region]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

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
    plan !== 'All plans' && { key: 'plan', label: `Plan: ${plan}`, clear: () => { onPlan('All plans'); resetToFirstPage(); } },
    region !== 'All regions' && { key: 'region', label: `Region: ${region}`, clear: () => { onRegion('All regions'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search organizations by name, ID, or administrator</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search by name, ID, or administrator…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by status" value={status} options={data.statusFilters} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by plan" value={plan} options={data.planFilters} onChange={(v) => { onPlan(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by region" value={region} options={data.regionFilters} onChange={(v) => { onRegion(v); resetToFirstPage(); }} />
          <button
            type="button"
            className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled
            title="Column customization is not yet available."
          >
            <IconColumns />
            Columns
          </button>
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
          <button
            type="button"
            onClick={() => { onClearAll(); resetToFirstPage(); }}
            className="text-token-xs font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            Clear all
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">
            {selected.size} organization{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Activate', title: 'Bulk activate requires MOD-004’s organization lifecycle endpoint (still PLANNED).' },
            { label: 'Suspend', title: 'Bulk suspend requires MOD-004’s organization lifecycle endpoint (still PLANNED).' },
            { label: 'Assign Plan', title: 'Assigning a plan requires MOD-004’s subscription endpoint (still PLANNED).' },
            { label: 'Export', title: 'Export is not yet available — no MOD-004 organization export endpoint exists.' },
            { label: 'Delete', title: 'Bulk delete requires MOD-004’s organization lifecycle endpoint (still PLANNED).' },
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No organizations match your filters</p>
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
                    aria-label="Select all organizations on this page"
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
                {['Organization', 'ID', 'Primary Admin', 'Plan', 'Status', 'Users', 'Pipelines', 'Last Activity', 'Created', 'Region', ''].map((col) => (
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
                const statusTone = STATUS_TONE[row.status] ?? STATUS_TONE.Pending;
                return (
                  <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                    <td className="px-token-5 py-token-3">
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
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-token-sm font-semibold ${ORG_TONE[row.tone] ?? ORG_TONE.gray}`}>
                          {row.initials}
                        </span>
                        <span className="text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-meta text-text-faint">{row.id}</td>
                    <td className="px-token-5 py-token-3">
                      {row.adminName ? (
                        <>
                          <p className="m-0 text-token-sm text-text-primary-alt">{row.adminName}</p>
                          <p className="m-0 mt-0.5 font-mono text-token-meta text-text-faint">{row.adminEmail}</p>
                        </>
                      ) : (
                        <span className="text-token-sm text-text-faint">No admin assigned</span>
                      )}
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex rounded-sm px-token-2 py-0.5 text-token-meta font-semibold ${PLAN_TONE[row.plan] ?? PLAN_TONE.Starter}`}>
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.users}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.pipelines}</td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.lastActivity}</td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.created}</td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.region}</td>
                    <td className="px-token-5 py-token-3 text-right">
                      <Link
                        to={`/organizations/${encodeURIComponent(row.id)}`}
                        className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        View
                      </Link>
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
          {hasActiveFilters ? filtered.length.toLocaleString() : data.total.toLocaleString()}
          {hasActiveFilters && ` (filtered from ${data.total.toLocaleString()})`}
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
    </div>
  );
}

function OrganizationListSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-[520px] w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}

/* Inline icons — the organizations feature has no dedicated asset set;
   these are simple currentColor SVGs matching the Figma toolbar glyphs. */
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

function IconColumns() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M6.5 2.5v11M9.5 2.5v11" />
    </svg>
  );
}
