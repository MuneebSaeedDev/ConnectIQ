import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDestinationList } from '../hooks/useDestinationList';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import {
  DESTINATION_TYPE_OPTIONS,
  STATUS_OPTIONS,
  ENVIRONMENT_OPTIONS,
  AUTH_OPTIONS,
  SORT_OPTIONS,
  SAVED_VIEWS,
  MOCK_TITLE,
} from '../services/destinationList.api';

const PAGE_SIZE = 25;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  info: { value: 'text-primary', bar: 'bg-primary' },
  accent: { value: 'text-primary', bar: 'bg-shell-accent-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Connection status → token utilities only, mapped to the verified Figma
// tones (node 115:26755): Connected → success, Warning → warning, Failed →
// danger, Maintenance → primary wash, Disconnected → muted.
const STATUS_TONE = {
  Connected: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Warning: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Failed: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
  Maintenance: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Disconnected: { dot: 'bg-text-faint', pill: 'bg-surface-muted text-text-secondary-alt' },
};

/** SCR-045 — Destination List Screen. Node 115:26755 ("Destinations"). */
export default function DestinationListScreen() {
  const orgId = 'current';
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [environment, setEnvironment] = useState('All Environments');
  const [authType, setAuthType] = useState('All Auth Types');
  const [sort, setSort] = useState('Updated');
  const [view, setView] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useDestinationList(orgId, {
    search,
    type,
    status,
    environment,
    authType,
    sort,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    type !== 'All Types' ||
    status !== 'All Statuses' ||
    environment !== 'All Environments' ||
    authType !== 'All Auth Types';

  function clearAll() {
    setSearch('');
    setType('All Types');
    setStatus('All Statuses');
    setEnvironment('All Environments');
    setAuthType('All Auth Types');
  }

  const handleExport = () => {
    if (!data?.rows) return;
    downloadJson(data.rows, 'connectiq-destinations');
    showToast('Destinations exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data Management', 'Destinations']}>
      <div className="flex flex-col gap-token-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <Header data={data} refetch={refetch} isFetching={isFetching} onExport={handleExport} showToast={showToast} />

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading destinations'
            : isError
              ? 'Couldn’t load destinations'
              : isFetching
                ? 'Refreshing destinations'
                : data
                  ? 'Destinations updated'
                  : ''}
        </span>

        {isLoading && <DestinationSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load destinations</p>
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
            <SavedViews view={view} onView={setView} />
            <DestinationsTable
              data={data}
              view={view}
              search={search}
              type={type}
              status={status}
              environment={environment}
              authType={authType}
              sort={sort}
              onSearch={setSearch}
              onType={setType}
              onStatus={setStatus}
              onEnvironment={setEnvironment}
              onAuthType={setAuthType}
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

function Header({ data, refetch, isFetching, onExport, showToast }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Destinations</h1>
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
          Manage database, warehouse, storage, streaming, and API connections powering your data pipelines.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button
          type="button"
          onClick={onExport}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          title="Export Destinations JSON"
        >
          <IconExport />
          Export Destinations
        </button>
        <button
          type="button"
          onClick={() => showToast && showToast('Configuration import dialog opened')}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconImport />
          Import Configuration
        </button>
        <Link
          to="/destinations/new/connection"
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconPlus />
          Add Destination
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

function SavedViews({ view, onView }) {
  return (
    <div className="flex flex-wrap items-center gap-token-2" role="tablist" aria-label="Saved views">
      {SAVED_VIEWS.map((v) => {
        const active = v.key === view;
        return (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onView(v.key)}
            className={`flex h-8 items-center gap-token-2 rounded-full border px-token-4 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              active
                ? 'border-shell-accent-border bg-shell-accent-wash text-primary'
                : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'
            }`}
          >
            {v.label}
            {v.badge != null && (
              <span className="rounded-full bg-danger-bg px-token-2 py-0.5 text-token-meta font-semibold text-danger-strong">
                {v.badge}
              </span>
            )}
          </button>
        );
      })}
      <button
        type="button"
        className="flex h-8 items-center gap-token-2 rounded-full border border-dashed border-border px-token-4 text-token-sm font-medium text-text-faint hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        disabled
        title="Saving custom views requires MOD-006’s data-source endpoint (still PLANNED)."
      >
        <IconPlus />
        Save Current View
      </button>
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
        <span>{total.toLocaleString()} destinations</span>
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
            {kpi.hint && <p className="m-0 mt-token-1 text-token-xs text-text-faint">{kpi.hint}</p>}
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

function DestinationsTable({
  data,
  view,
  search,
  type,
  status,
  environment,
  authType,
  sort,
  onSearch,
  onType,
  onStatus,
  onEnvironment,
  onAuthType,
  onSort,
  hasActiveFilters,
  onClearAll,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Defensive default: the mock always supplies `rows`; a real MOD-006
    // endpoint could return valid JSON without `rows`.
    const rows = (data.rows ?? []).filter((row) => {
      // Saved-view predicate (node 115:26755 Saved Views row).
      if (view === 'databases' && row.category !== 'database') return false;
      if (view === 'warehouses' && row.category !== 'warehouse') return false;
      if (view === 'apis' && row.category !== 'api') return false;
      if (view === 'production' && row.environment !== 'Production') return false;
      if (view === 'failed' && row.status !== 'Failed') return false;
      if (view === 'unused' && !row.unused) return false;
      if (type !== 'All Types' && row.sourceType !== type) return false;
      if (status !== 'All Statuses' && row.status !== status) return false;
      if (environment !== 'All Environments' && row.environment !== environment) return false;
      if (authType !== 'All Auth Types' && row.authMethod !== authType) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.sourceType.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q) ||
        (row.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
    const STATUS_RANK = { Failed: 5, Warning: 4, Maintenance: 3, Disconnected: 2, Connected: 1 };
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'Destination Name': return a.name.localeCompare(b.name);
        case 'Source Type': return a.sourceType.localeCompare(b.sourceType) || a.name.localeCompare(b.name);
        case 'Connection Status': return (STATUS_RANK[b.status] ?? 0) - (STATUS_RANK[a.status] ?? 0) || a.name.localeCompare(b.name);
        case 'Pipelines': return (b.pipelines ?? 0) - (a.pipelines ?? 0) || a.name.localeCompare(b.name);
        case 'Last Checked': return a.name.localeCompare(b.name);
        case 'Updated': return Date.parse(b.lastModified) - Date.parse(a.lastModified) || a.name.localeCompare(b.name);
        default: return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [data.rows, view, search, type, status, environment, authType, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeSource = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

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
    status !== 'All Statuses' && { key: 'status', label: `Status: ${status}`, clear: () => { onStatus('All Statuses'); resetToFirstPage(); } },
    environment !== 'All Environments' && { key: 'env', label: `Environment: ${environment}`, clear: () => { onEnvironment('All Environments'); resetToFirstPage(); } },
    authType !== 'All Auth Types' && { key: 'auth', label: `Auth: ${authType}`, clear: () => { onAuthType('All Auth Types'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search destinations by name, type, owner, or tag</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search destinations…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by source type" value={type} options={DESTINATION_TYPE_OPTIONS} onChange={(v) => { onType(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by connection status" value={status} options={STATUS_OPTIONS} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by environment" value={environment} options={ENVIRONMENT_OPTIONS} onChange={(v) => { onEnvironment(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by authentication" value={authType} options={AUTH_OPTIONS} onChange={(v) => { onAuthType(v); resetToFirstPage(); }} />
          <label className="flex items-center gap-token-2">
            <span className="text-token-sm text-text-faint">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { onSort(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled
            title="Column customization requires MOD-006’s data-source endpoint (still PLANNED)."
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
            {selected.size} destination{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Test Connections', title: 'Connection testing requires MOD-006’s test-connection endpoint (still PLANNED).' },
            { label: 'Archive Selected', title: 'Bulk archive requires MOD-006’s data-source lifecycle endpoint (still PLANNED).' },
            { label: 'Export Selected', title: 'Export is not yet available — no MOD-006 data-source export endpoint exists.' },
            { label: 'Assign Tags', title: 'Tag assignment requires MOD-006’s data-source endpoint (still PLANNED).' },
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No destinations match your filters</p>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">Try adjusting your search, saved view, or clearing the active filters.</p>
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
                    aria-label="Select all destinations on this page"
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
                {['Destination Name', 'Type', 'Status', 'Environment', 'Authentication', 'Last Checked', 'Pipelines', 'Health', 'Owner', 'Updated', ''].map((col) => (
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
                const statusTone = STATUS_TONE[row.status] ?? STATUS_TONE.Connected;
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
                          {row.unused && (
                            <span className="rounded-sm bg-warning-bg px-token-1 py-0.5 text-token-meta font-semibold text-warning" title="No active pipelines">Unused</span>
                          )}
                        </span>
                        <span className="mt-0.5 max-w-md text-token-xs text-text-faint">{row.description}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm text-text-secondary-alt">{row.sourceType}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="inline-flex items-center rounded-sm bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">
                        {row.environment}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm text-text-secondary-alt">{row.authMethod}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className={`text-token-sm ${row.lastConnectionWarning ? 'text-warning' : 'text-text-secondary-alt'}`}>{row.lastConnection}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm font-medium text-text-primary-alt">{(row.pipelines ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm text-text-secondary-alt">{row.operational?.avgResponse || '—'}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm text-text-secondary-alt">{row.owner}</span>
                    </td>
                    <td className="px-token-5 py-token-3 align-top">
                      <span className="text-token-sm text-text-secondary-alt">{row.lastModified}</span>
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
          {hasActiveFilters || view !== 'all' ? `${filtered.length.toLocaleString()} (filtered from ${(data.total ?? filtered.length).toLocaleString()})` : `${(data.total ?? filtered.length).toLocaleString()} destinations`}
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

      {activeSource && (
        <SourceDrawer source={activeSource} mocked={data.mocked} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}

function SourceDrawer({ source, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const statusTone = STATUS_TONE[source.status] ?? STATUS_TONE.Connected;

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

  const general = [
    { label: 'Source ID', value: source.sourceId },
    { label: 'Source Type', value: source.sourceType },
    { label: 'Environment', value: source.environment },
    { label: 'Owner', value: source.ownerEmail ?? source.owner },
  ];
  const connection = [
    { label: 'Host', value: source.connection?.host ?? '—' },
    { label: 'Port', value: source.connection?.port ?? '—' },
    { label: 'Database', value: source.connection?.database ?? '—' },
    { label: 'SSL/TLS', value: source.sslTls ?? '—' },
  ];
  const operational = [
    { label: 'Last Success', value: source.operational?.lastSuccess ?? '—' },
    { label: 'Last Failure', value: source.operational?.lastFailure ?? '—' },
    { label: 'Avg Response', value: source.operational?.avgResponse ?? '—' },
    { label: 'Scheduled Jobs', value: source.operational?.scheduledJobs ?? '—' },
  ];
  const technical = [
    { label: 'Created By', value: source.createdBy ?? '—' },
    { label: 'Created', value: source.created ?? '—' },
    { label: 'Config Version', value: source.configVersion ?? '—' },
    { label: 'Auth Method', value: source.authMethod },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div>
            <div className="flex items-center gap-token-2">
              <h2 id="source-drawer-title" className="m-0 text-token-base font-bold text-text-primary-alt">{source.name}</h2>
              <span className="inline-flex items-center rounded-sm bg-surface-muted px-token-2 py-0.5 text-token-meta font-medium text-text-secondary-alt">
                {source.environment}
              </span>
            </div>
            <span className={`mt-token-1 inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
              {source.status}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close destination details"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          <Link
            to={`/destinations/${encodeURIComponent(source.id)}/health`}
            className="flex h-7 items-center rounded-md bg-primary px-token-3 text-token-sm font-semibold text-text-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View Health
          </Link>
          <Link
            to={`/destinations/${encodeURIComponent(source.id)}/configure`}
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Configure
          </Link>
          {[
            { label: 'Test Connection', title: 'Connection testing requires MOD-007’s test-connection endpoint (still PLANNED).' },
            { label: 'Clone Destination', title: 'Cloning a destination requires MOD-007’s destination endpoint (still PLANNED).' },
            { label: 'Archive', title: 'Destination lifecycle actions require MOD-007’s destination endpoint (still PLANNED).' },
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
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">General Information</h3>
            <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">{source.detailDescription ?? source.description}</p>
            <MetaGrid items={general} />
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Connection Information</h3>
            <MetaGrid items={connection} />
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Credential Status</h3>
            <p className={`m-0 mt-token-2 flex items-center gap-token-2 text-token-sm ${source.credentialExpiring ? 'text-warning' : 'text-text-secondary-alt'}`}>
              {source.credentialExpiring && <IconWarning />}
              {source.credentialStatus ?? '—'}
            </p>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Operational Status</h3>
            <MetaGrid items={operational} />
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Usage Summary</h3>
            <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">
              Used by <span className="font-semibold text-text-primary-alt">{(source.pipelines ?? 0).toLocaleString()}</span> pipeline{source.pipelines === 1 ? '' : 's'}. Last connection {source.lastConnection}.
            </p>
            <div className="mt-token-3 flex flex-wrap gap-token-2">
              {(source.tags ?? []).map((t) => (
                <span key={t} className="rounded-sm bg-shell-accent-wash px-token-3 py-0.5 text-token-xs font-medium text-primary">{t}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Technical Metadata</h3>
            <MetaGrid items={technical} />
          </section>

          {mocked && (
            <p className="m-0 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-xs font-medium text-warning">
              Sample data — MOD-006 (Destinations &amp; Connectors) has no backend deployed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaGrid({ items }) {
  return (
    <div className="mt-token-3 grid grid-cols-2 gap-token-3">
      {items.map((r) => (
        <div key={r.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
          <p className="m-0 text-token-xs text-text-faint">{r.label}</p>
          <p className="m-0 mt-token-1 break-words text-token-sm font-semibold text-text-primary-alt">{r.value}</p>
        </div>
      ))}
    </div>
  );
}

function DestinationSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-9 w-full max-w-2xl animate-pulse rounded-full bg-surface-hover" />
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

function IconImport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8m0 0 3-3M8 10 5 7M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
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

function IconWarning() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}
