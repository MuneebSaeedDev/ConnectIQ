import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDepartmentManagement } from '../hooks/useDepartmentManagement';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';

const PAGE_SIZE = 12;

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Colored department code-badge tones (Figma: blue/purple/green/gray).
const DEPT_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  purple: 'bg-warning-bg text-warning',
  green: 'bg-success-bg text-success-strong',
  gray: 'bg-surface-muted text-text-faint',
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

/** SCR-029 — Department Management Screen. Node 94:5039, drawer 94:6298. */
export default function DepartmentManagementScreen() {
  const { id: orgId } = useParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [businessUnit, setBusinessUnit] = useState('All business units');
  const [sort, setSort] = useState('Name');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useDepartmentManagement(orgId, {
    search,
    status,
    businessUnit,
  });

  const hasActiveFilters =
    search.trim() !== '' ||
    status !== 'All statuses' ||
    businessUnit !== 'All business units';

  function clearAll() {
    setSearch('');
    setStatus('All statuses');
    setBusinessUnit('All business units');
  }

  const handleExport = () => {
    if (!data?.items) return;
    downloadJson(data.items, `connectiq-departments-${orgId}`);
    showToast('Department directory exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Departments']}>
      <div className="flex flex-col gap-token-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Department Management</h1>
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
              Manage departments, administrators, resources, and organizational ownership
              {data?.organizationName ? ` across ${data.organizationName}.` : '.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              onClick={() => showToast('Import departments dialog opened')}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <IconImport />
              Import
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Departments JSON"
            >
              <IconExport />
              Export
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Creating a department requires MOD-004’s department endpoint (still PLANNED)."
            >
              <IconPlus />
              Create Department
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
            ? 'Loading departments'
            : isError
              ? 'Couldn’t load departments'
              : isFetching
                ? 'Refreshing departments'
                : data
                  ? 'Departments updated'
                  : ''}
        </span>

        {isLoading && <DepartmentSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load departments</p>
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
            <DepartmentsTable
              data={data}
              search={search}
              status={status}
              businessUnit={businessUnit}
              sort={sort}
              onSearch={setSearch}
              onStatus={setStatus}
              onBusinessUnit={setBusinessUnit}
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
        <span>{data.total.toLocaleString()} departments</span>
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
function DepartmentsTable({
  data,
  search,
  status,
  businessUnit,
  sort,
  onSearch,
  onStatus,
  onBusinessUnit,
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
      if (businessUnit !== 'All business units' && row.businessUnit !== businessUnit) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        (row.managerName?.toLowerCase().includes(q) ?? false)
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
  }, [data.rows, search, status, businessUnit, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const activeDept = activeId ? data.rows.find((r) => r.id === activeId) ?? null : null;

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
    businessUnit !== 'All business units' && { key: 'bu', label: `Unit: ${businessUnit}`, clear: () => { onBusinessUnit('All business units'); resetToFirstPage(); } },
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search departments by name, code, or manager</span>
          <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => { onSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Search departments…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-token-2">
          <FilterSelect label="Filter by status" value={status} options={data.statusFilters} onChange={(v) => { onStatus(v); resetToFirstPage(); }} />
          <FilterSelect label="Filter by business unit" value={businessUnit} options={data.businessUnitFilters} onChange={(v) => { onBusinessUnit(v); resetToFirstPage(); }} />
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
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">
            {selected.size} department{selected.size === 1 ? '' : 's'} selected
          </p>
          {[
            { label: 'Activate', title: 'Bulk activate requires MOD-004’s department lifecycle endpoint (still PLANNED).' },
            { label: 'Archive', title: 'Bulk archive requires MOD-004’s department lifecycle endpoint (still PLANNED).' },
            { label: 'Assign Manager', title: 'Assigning a manager requires MOD-004’s department endpoint (still PLANNED).' },
            { label: 'Export', title: 'Export is not yet available — no MOD-004 department export endpoint exists.' },
            { label: 'Delete', title: 'Bulk delete requires MOD-004’s department lifecycle endpoint (still PLANNED).' },
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">No departments match your filters</p>
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
                    aria-label="Select all departments on this page"
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
                {['Department', 'Code', 'Manager', 'Members', 'Pipelines', 'Connectors', 'Status', 'Last Activity', 'Created', ''].map((col) => (
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
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-token-sm font-semibold ${DEPT_TONE[row.tone] ?? DEPT_TONE.gray}`}>
                          {row.code}
                        </span>
                        <span className="flex items-center gap-token-2">
                          <span className="text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                          {row.attention && (
                            <span
                              className="rounded-sm bg-danger-bg px-token-1 py-0.5 text-token-meta font-semibold text-danger-strong"
                              title="This department requires attention (manager or activity issue)."
                            >
                              Requires attention
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-meta text-text-faint">{row.code}</td>
                    <td className="px-token-5 py-token-3">
                      {row.managerName ? (
                        <span className="flex items-center gap-token-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-meta font-semibold text-primary">
                            {row.managerInitials}
                          </span>
                          <span className="text-token-sm text-text-primary-alt">{row.managerName}</span>
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
          {hasActiveFilters ? `${filtered.length.toLocaleString()} (filtered from ${data.total.toLocaleString()})` : `${data.total.toLocaleString()} departments`}
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

      {activeDept && (
        <DepartmentDrawer
          dept={activeDept}
          detail={data.details?.[activeDept.id] ?? null}
          mocked={data.mocked}
          onClose={() => setActiveId(null)}
        />
      )}
      {/* end table body */}
    </div>
  );
}
function DepartmentDrawer({ dept, detail, mocked, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const statusTone = STATUS_TONE[dept.status] ?? STATUS_TONE.Active;

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

  const info = [
    { label: 'Code', value: dept.code },
    { label: 'Manager', value: dept.managerName ?? 'Unassigned' },
    { label: 'Business Unit', value: dept.businessUnit },
    { label: 'Created', value: dept.created },
    { label: 'Last Activity', value: dept.lastActivity },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dept-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
          <div className="flex items-center gap-token-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-token-sm font-semibold ${DEPT_TONE[dept.tone] ?? DEPT_TONE.gray}`}>
              {dept.code}
            </span>
            <div>
              <h2 id="dept-drawer-title" className="m-0 text-token-base font-bold text-text-primary-alt">{dept.name}</h2>
              <span className={`mt-token-1 inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${statusTone.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
                {dept.status}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close department details"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <IconX />
          </button>
        </div>

        <div className="flex flex-wrap gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
          {[
            { label: 'View Details', title: 'The full department detail view requires MOD-004 (still PLANNED).' },
            { label: 'Edit', title: 'Editing a department requires MOD-004’s department endpoint (still PLANNED).' },
            { label: 'Manage Members', title: 'Member management requires MOD-004’s department endpoint (still PLANNED).' },
            { label: 'Pipelines', title: 'The department pipelines view requires MOD-004 (still PLANNED).' },
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
                { value: dept.members, label: 'Members' },
                { value: dept.pipelines, label: 'Pipelines' },
                { value: dept.connectors, label: 'Connectors' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3 text-center">
                  <p className="m-0 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{stat.value}</p>
                  <p className="m-0 mt-token-1 text-token-xs text-text-faint">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Department Information</h3>
            <dl className="mt-token-3 flex flex-col gap-token-2">
              {info.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
                  <dt className="text-token-sm text-text-faint">{row.label}</dt>
                  <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{row.value}</dd>
                </div>
              ))}
            </dl>
            {dept.description && (
              <p className="m-0 mt-token-3 rounded-md bg-surface-muted px-token-3 py-token-2 text-token-sm text-text-secondary-alt">
                {dept.description}
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Members</h3>
              <span className="text-token-xs font-medium text-text-faint" aria-hidden="true">View all {dept.members} →</span>
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
                The per-member breakdown loads from the MOD-004 department service, which is not deployed yet. This department has {dept.members} member{dept.members === 1 ? '' : 's'}.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Recent Pipelines</h3>
              <span className="text-token-xs font-medium text-text-faint" aria-hidden="true">View all {dept.pipelines} →</span>
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
                The recent-pipeline breakdown loads from the MOD-004 department service, which is not deployed yet. This department runs {dept.pipelines} pipeline{dept.pipelines === 1 ? '' : 's'}.
              </p>
            )}
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

function DepartmentSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-[520px] w-full animate-pulse rounded-md bg-surface-hover" />
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

function IconColumns() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M6.5 2.5v11M9.5 2.5v11" />
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
