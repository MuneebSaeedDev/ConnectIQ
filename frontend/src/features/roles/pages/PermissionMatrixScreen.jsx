import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import {
  ROLE_TYPE_OPTIONS,
  STATE_OPTIONS,
  LEVEL_OPTIONS,
  SOURCE_OPTIONS,
  SAVED_VIEWS,
  STATE_ORDER,
  buildCellDetail,
} from '../services/permissionMatrix.api';

const MOCK_TITLE =
  'MOD-003 (RBAC & Permissions) has no backend deployed yet — showing sample data, not live records.';

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  info: { value: 'text-primary', bar: 'bg-primary' },
  accent: { value: 'text-primary', bar: 'bg-shell-accent-border' },
  success: { value: 'text-success-strong', bar: 'bg-success' },
  warning: { value: 'text-warning-strong', bar: 'bg-warning' },
  danger: { value: 'text-danger-strong', bar: 'bg-danger' },
};

// Per-cell state → glyph + token tones (no new palette). Each maps to the
// verified 6-state legend on node 113:22359.
const CELL_STATE = {
  granted: { glyph: '✓', label: 'Granted', cell: 'text-success-strong', chip: 'bg-success-bg text-success-strong' },
  inherited: { glyph: '↑', label: 'Inherited', cell: 'text-primary', chip: 'bg-shell-accent-wash text-primary' },
  conditional: { glyph: '?', label: 'Conditional', cell: 'text-warning-strong', chip: 'bg-warning-bg text-warning-strong' },
  restricted: { glyph: '!', label: 'Restricted', cell: 'text-danger-strong', chip: 'border border-danger-border bg-danger-bg text-danger-strong' },
  denied: { glyph: '✕', label: 'Denied', cell: 'text-danger-strong', chip: 'bg-danger-strong text-text-on-primary' },
  na: { glyph: '–', label: 'N/A', cell: 'text-text-faint', chip: 'bg-surface-muted text-text-secondary-alt' },
};

const PRIVILEGE_TONE = {
  'Full Admin': 'bg-danger-bg text-danger-strong',
  Admin: 'bg-warning-bg text-warning-strong',
  Elevated: 'bg-shell-accent-wash text-primary',
  Standard: 'bg-surface-muted text-text-secondary-alt',
  'Read Only': 'bg-surface-muted text-text-faint',
};

// Saved views map to derived filter presets applied in MatrixPanel.applyView.

/** SCR-043 — Permission Matrix Screen. Node 113:22359. */
export default function PermissionMatrixScreen() {
  const orgId = 'current';
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = usePermissionMatrix(orgId);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, 'connectiq-permission-matrix');
    showToast('Permission matrix schema exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Roles', 'Permission Matrix']}>
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
            ? 'Loading permission matrix'
            : isError
              ? 'Couldn’t load the permission matrix'
              : isFetching
                ? 'Refreshing permission matrix'
                : data
                  ? 'Permission matrix updated'
                  : ''}
        </span>

        {isLoading && <MatrixSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the permission matrix</p>
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
            <MatrixPanel data={data} />
            <InsightsPanel insights={data.insights} />
            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

// HEADER-MARKER

function Header({ data, refetch, isFetching, onExport }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Permission Matrix</h1>
          {data?.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning-strong"
              title={MOCK_TITLE}
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Analyze, compare, and manage role permissions across the organization.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconRefresh spinning={isFetching} />
          Refresh
        </button>
        <Link
          to="/roles"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconCompare />
          Compare Roles
        </Link>
        <button
          type="button"
          onClick={onExport}
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          title="Export Permission Matrix JSON"
        >
          <IconExport />
          Export Matrix
        </button>
      </div>
    </div>
  );
}

function ScreenFooter({ data, isFetching }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.roleCount} roles</span>
        <FooterDivider />
        <span>{data.permissionCount} permissions</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning-strong" title={MOCK_TITLE}>
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
            <p className="m-0 mt-token-1 text-token-xs text-text-faint">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

// MATRIX-MARKER

function MatrixPanel({ data }) {
  const [savedView, setSavedView] = useState('All Roles');
  const [permSearch, setPermSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [roleType, setRoleType] = useState('All Role Types');
  const [stateFilter, setStateFilter] = useState('All States');
  const [level, setLevel] = useState('All Levels');
  const [source, setSource] = useState('All Sources');
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [activeCell, setActiveCell] = useState(null); // { groupId, permId, roleId }

  // Saved view → derived filter presets (real behavior: selecting a view
  // sets the underlying filters, node 113:22359 "Saved Views").
  function applyView(view) {
    setSavedView(view);
    setRoleType(view === 'System Roles' ? 'System' : view === 'Custom Roles' ? 'Custom' : 'All Role Types');
    // 'Administrative' scopes to admin-tier roles via the rank>=4 clause in
    // the role filter below (keeps Super Admin), so it must NOT also pin the
    // stricter 'Administrative' level select — that would drop Super Admin.
    setLevel(view === 'Read-Only Roles' ? 'Read Only' : 'All Levels');
    setRoleSearch('');
    setPermSearch('');
  }

  const stateCode = stateFilter === 'All States'
    ? null
    : STATE_ORDER.find((c) => CELL_STATE[c].label === stateFilter);

  // Visible role columns after role-search / type / level / view filters.
  const roles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return data.roles.filter((role) => {
      if (roleType !== 'All Role Types' && role.type !== roleType) return false;
      if (level !== 'All Levels' && role.privilegeLevel !== level) return false;
      if (savedView === 'Read-Only Roles' && role.privilegeLevel !== 'Read Only') return false;
      if (savedView === 'Administrative' && role.rank < 4) return false;
      if (q && !role.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.roles, roleSearch, roleType, level, savedView]);

  // Category filter options are derived from the actual group names in data.
  const categoryOptions = useMemo(
    () => ['All Categories', ...data.groups.map((g) => g.name)],
    [data.groups],
  );

  // Visible permission groups + rows after category / permission-search /
  // state / source / differences-only / saved-view filters.
  const groups = useMemo(() => {
    const q = permSearch.trim().toLowerCase();
    return data.groups
      .filter((g) => {
        if (category !== 'All Categories' && g.name !== category) return false;
        if (savedView === 'Security Perms' && g.id !== 'grp_security') return false;
        if (savedView === 'Pipeline Access' && g.id !== 'grp_pipelines') return false;
        return true;
      })
      .map((g) => {
        const permissions = g.permissions.filter((p) => {
          if (q && !p.label.toLowerCase().includes(q)) return false;
          const visibleStates = roles.map((r) => p.states[r.id]);
          if (stateCode && !visibleStates.includes(stateCode)) return false;
          if (source !== 'All Sources') {
            // Source maps to state families: Group→inherited, Policy→
            // conditional/restricted, Inheritance→inherited, Direct→granted.
            const wanted = {
              'Direct Assignment': ['granted'],
              Group: ['inherited'],
              Inheritance: ['inherited'],
              Policy: ['conditional', 'restricted'],
            }[source] ?? [];
            if (!visibleStates.some((s) => wanted.includes(s))) return false;
          }
          if (differencesOnly) {
            const uniq = new Set(visibleStates);
            if (uniq.size <= 1) return false;
          }
          return true;
        });
        // Coverage is recomputed over the *visible* roles + filtered
        // permissions so the % never contradicts the row count rendered
        // beside it (ui-reviewer finding). Falls back to 0 for empty groups.
        const cells = permissions.length * roles.length;
        const active = permissions.reduce(
          (sum, p) => sum + roles.filter((r) => p.states[r.id] === 'granted' || p.states[r.id] === 'inherited').length,
          0,
        );
        const coverage = cells === 0 ? 0 : Math.round((active / cells) * 100);
        return { ...g, permissions, coverage };
      })
      .filter((g) => g.permissions.length > 0);
  }, [data.groups, permSearch, category, savedView, roles, stateCode, source, differencesOnly]);

  const visiblePermCount = groups.reduce((n, g) => n + g.permissions.length, 0);

  const hasActiveFilters =
    permSearch.trim() !== '' ||
    roleSearch.trim() !== '' ||
    category !== 'All Categories' ||
    roleType !== 'All Role Types' ||
    stateFilter !== 'All States' ||
    level !== 'All Levels' ||
    source !== 'All Sources' ||
    differencesOnly ||
    savedView !== 'All Roles';

  function clearAll() {
    setSavedView('All Roles');
    setPermSearch('');
    setRoleSearch('');
    setCategory('All Categories');
    setRoleType('All Role Types');
    setStateFilter('All States');
    setLevel('All Levels');
    setSource('All Sources');
    setDifferencesOnly(false);
  }

  function toggleGroup(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allGroupIds = groups.map((g) => g.id);
  const allCollapsed = allGroupIds.length > 0 && allGroupIds.every((id) => collapsed.has(id));

  const activeDetail = useMemo(() => {
    if (!activeCell) return null;
    const g = data.groups.find((x) => x.id === activeCell.groupId);
    const p = g?.permissions.find((x) => x.id === activeCell.permId);
    const r = data.roles.find((x) => x.id === activeCell.roleId);
    if (!g || !p || !r) return null;
    return buildCellDetail(g, p, r);
  }, [activeCell, data.groups, data.roles]);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <SavedViews active={savedView} onSelect={applyView} />
      <Toolbar
        permSearch={permSearch}
        roleSearch={roleSearch}
        category={category}
        categoryOptions={categoryOptions}
        roleType={roleType}
        stateFilter={stateFilter}
        level={level}
        source={source}
        differencesOnly={differencesOnly}
        hasActiveFilters={hasActiveFilters}
        onPermSearch={setPermSearch}
        onRoleSearch={setRoleSearch}
        onCategory={setCategory}
        onRoleType={setRoleType}
        onState={setStateFilter}
        onLevel={setLevel}
        onSource={setSource}
        onDifferencesOnly={setDifferencesOnly}
        onClearAll={clearAll}
      />
      <Legend
        visiblePermCount={visiblePermCount}
        roleCount={roles.length}
        allCollapsed={allCollapsed}
        onCollapseAll={() => setCollapsed(new Set(allGroupIds))}
        onExpandAll={() => setCollapsed(new Set())}
      />

      <div className="lg:flex">
        <div className="min-w-0 flex-1 overflow-x-auto">
          {roles.length === 0 || groups.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} onClearAll={clearAll} noRoles={roles.length === 0} />
          ) : (
            <MatrixTable
              groups={groups}
              roles={roles}
              collapsed={collapsed}
              onToggleGroup={toggleGroup}
              activeCell={activeCell}
              onCellSelect={setActiveCell}
            />
          )}
        </div>
        <DetailPanel detail={activeDetail} onClose={() => setActiveCell(null)} />
      </div>
    </div>
  );
}

// SAVED-VIEWS-MARKER

function SavedViews({ active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-token-2 border-b border-border-subtle px-token-5 py-token-3">
      <span className="mr-token-1 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
        Saved Views
      </span>
      {SAVED_VIEWS.map((view) => {
        const isActive = view === active;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(view)}
            className={`h-7 rounded-full px-token-3 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
              isActive
                ? 'bg-primary text-text-on-primary'
                : 'border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'
            }`}
          >
            {view}
          </button>
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

function Toolbar({
  permSearch,
  roleSearch,
  category,
  categoryOptions,
  roleType,
  stateFilter,
  level,
  source,
  differencesOnly,
  hasActiveFilters,
  onPermSearch,
  onRoleSearch,
  onCategory,
  onRoleType,
  onState,
  onLevel,
  onSource,
  onDifferencesOnly,
  onClearAll,
}) {
  return (
    <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
      <label className="relative w-full sm:w-56">
        <span className="sr-only">Search permissions</span>
        <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
        <input
          type="search"
          value={permSearch}
          onChange={(e) => onPermSearch(e.target.value)}
          placeholder="Search permissions…"
          className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <label className="relative w-full sm:w-48">
        <span className="sr-only">Search roles</span>
        <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
        <input
          type="search"
          value={roleSearch}
          onChange={(e) => onRoleSearch(e.target.value)}
          placeholder="Search roles…"
          className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <div className="flex flex-wrap items-center gap-token-2">
        <FilterSelect label="Filter by category" value={category} options={categoryOptions} onChange={onCategory} />
        <FilterSelect label="Filter by role type" value={roleType} options={ROLE_TYPE_OPTIONS} onChange={onRoleType} />
        <FilterSelect label="Filter by permission state" value={stateFilter} options={STATE_OPTIONS} onChange={onState} />
        <FilterSelect label="Filter by privilege level" value={level} options={LEVEL_OPTIONS} onChange={onLevel} />
        <FilterSelect label="Filter by source" value={source} options={SOURCE_OPTIONS} onChange={onSource} />
        <label className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt">
          <input
            type="checkbox"
            checked={differencesOnly}
            onChange={(e) => onDifferencesOnly(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Differences only
        </label>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

// LEGEND-MARKER

function Legend({ visiblePermCount, roleCount, allCollapsed, onCollapseAll, onExpandAll }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle bg-surface-muted px-token-5 py-token-3">
      <div className="flex flex-wrap items-center gap-token-4">
        {STATE_ORDER.map((code) => {
          const s = CELL_STATE[code];
          return (
            <span key={code} className="flex items-center gap-token-2 text-token-xs text-text-secondary-alt">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-sm font-mono text-token-xs font-bold ${s.chip}`}
                aria-hidden="true"
              >
                {s.glyph}
              </span>
              {s.label}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-token-3">
        <span className="font-mono text-token-xs text-text-faint">
          Showing {visiblePermCount} permission{visiblePermCount === 1 ? '' : 's'} × {roleCount} role{roleCount === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={allCollapsed ? onExpandAll : onCollapseAll}
          className="text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        >
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasActiveFilters, onClearAll, noRoles }) {
  return (
    <div className="px-token-5 py-token-8 text-center">
      <p className="m-0 text-token-sm font-medium text-text-primary-alt">
        {noRoles ? 'No roles match your filters' : 'No permissions match your filters'}
      </p>
      <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
        Try adjusting your search or clearing the active filters.
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="mt-token-4 h-8 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// TABLE-MARKER

function MatrixTable({ groups, roles, collapsed, onToggleGroup, activeCell, onCellSelect }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="bg-surface-muted">
          <th
            scope="col"
            className="sticky left-0 z-10 min-w-[220px] border-b border-border-subtle bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint"
          >
            Permission
          </th>
          {roles.map((role) => (
            <th
              key={role.id}
              scope="col"
              className="border-b border-l border-border-subtle px-token-3 py-token-3 align-bottom"
            >
              <span className="flex min-w-[92px] flex-col">
                <span className="text-token-sm font-semibold text-text-primary-alt">{role.short}</span>
                <span className="mt-0.5 text-token-meta text-text-faint">
                  {role.type} · {role.assignedUsers.toLocaleString()}
                </span>
                <span
                  className={`mt-token-1 inline-flex w-fit items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${
                    PRIVILEGE_TONE[role.privilege] ?? PRIVILEGE_TONE.Standard
                  }`}
                >
                  {role.privilege}
                </span>
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.id);
          return (
            <GroupRows
              key={group.id}
              group={group}
              roles={roles}
              isCollapsed={isCollapsed}
              onToggle={() => onToggleGroup(group.id)}
              activeCell={activeCell}
              onCellSelect={onCellSelect}
            />
          );
        })}
      </tbody>
    </table>
  );
}

function GroupRows({ group, roles, isCollapsed, onToggle, activeCell, onCellSelect }) {
  const coverageTone =
    group.coverage >= 66 ? 'text-success-strong' : group.coverage >= 33 ? 'text-warning-strong' : 'text-text-faint';
  return (
    <>
      <tr className="bg-surface-muted/60">
        <th
          scope="colgroup"
          colSpan={roles.length + 1}
          className="sticky left-0 border-b border-t border-border-subtle bg-surface-muted px-token-5 py-token-2"
        >
          <span className="flex items-center gap-token-3">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!isCollapsed}
              className="flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <IconChevron collapsed={isCollapsed} />
              {group.name}
              <span className="font-normal text-text-faint">({group.permissions.length})</span>
            </button>
            <span className="flex items-center gap-token-2">
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <span
                  className={`block h-full rounded-full ${
                    group.coverage >= 66 ? 'bg-success' : group.coverage >= 33 ? 'bg-warning' : 'bg-border'
                  }`}
                  style={{ width: `${group.coverage}%` }}
                />
              </span>
              <span className={`font-mono text-token-xs font-semibold ${coverageTone}`}>{group.coverage}% coverage</span>
            </span>
          </span>
        </th>
      </tr>
      {!isCollapsed &&
        group.permissions.map((perm) => (
          <tr key={perm.id} className="border-b border-border-subtle last:border-b-0 hover:bg-surface-hover">
            <th
              scope="row"
              className="sticky left-0 z-10 min-w-[220px] bg-surface-card px-token-5 py-token-2 text-left font-normal"
            >
              <span className="flex flex-col">
                <span className="text-token-sm font-medium text-text-primary-alt">{perm.label}</span>
                <span className="text-token-meta uppercase tracking-[0.04em] text-text-faint">{perm.sensitivity}</span>
              </span>
            </th>
            {roles.map((role) => {
              const code = perm.states[role.id] ?? 'na';
              const s = CELL_STATE[code];
              const isActive =
                activeCell &&
                activeCell.groupId === group.id &&
                activeCell.permId === perm.id &&
                activeCell.roleId === role.id;
              return (
                <td key={role.id} className="border-l border-border-subtle px-token-2 py-token-2 text-center">
                  <button
                    type="button"
                    onClick={() => onCellSelect({ groupId: group.id, permId: perm.id, roleId: role.id })}
                    aria-label={`${perm.label} for ${role.name}: ${s.label}. View details.`}
                    aria-pressed={!!isActive}
                    title={`${s.label} — ${perm.label} · ${role.short}`}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-sm font-mono text-token-sm font-bold ${s.chip} ${
                      isActive ? 'outline outline-2 outline-offset-1 outline-primary' : ''
                    } hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary`}
                  >
                    {s.glyph}
                    <span className="sr-only">{s.label}</span>
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
    </>
  );
}

// DETAIL-MARKER

function DetailPanel({ detail, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(null);

  // The overlay drawer + focus-trap only apply below the lg breakpoint; on
  // desktop the panel is a non-modal inline aside (no trap, no focus steal).
  const isModal = typeof window !== 'undefined' && window.matchMedia
    ? !window.matchMedia('(min-width: 1024px)').matches
    : false;

  useEffect(() => {
    // Move focus into the modal drawer on open and restore to the trigger on
    // close — mobile only. Keyed on `detail` so a background refetch can't
    // yank focus mid-interaction.
    if (!detail || !isModal) return undefined;
    triggerRef.current = typeof document !== 'undefined' ? document.activeElement : null;
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    return () => {
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [detail, isModal]);

  useEffect(() => {
    // Escape closes the panel in both modes; the Tab-trap only runs for the
    // modal (mobile) drawer.
    if (!detail) return undefined;
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
        onClose();
        return;
      }
      if (event.key === 'Tab' && isModal) {
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
  }, [detail, isModal, onClose]);

  if (!detail) {
    return (
      <aside className="hidden w-72 shrink-0 border-l border-border-subtle bg-surface-muted p-token-5 lg:block">
        <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
          Permission Details
        </p>
        <p className="m-0 mt-token-3 text-token-sm text-text-secondary-alt">
          Select any cell in the matrix to inspect its permission, role context, source, and affected resources.
        </p>
      </aside>
    );
  }

  const stateTone =
    detail.active
      ? 'bg-success-bg text-success-strong'
      : detail.currentState === 'Conditional'
        ? 'bg-warning-bg text-warning-strong'
        : detail.currentState === 'N/A'
          ? 'bg-surface-muted text-text-secondary-alt'
          : 'bg-danger-bg text-danger-strong';

  return (
    <>
      {/* Mobile: overlay drawer. Desktop: inline side panel. */}
      <div
        className="fixed inset-0 z-50 flex justify-end bg-overlay-scrim lg:hidden"
        role="presentation"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cell-detail-title-mobile"
          onClick={(e) => e.stopPropagation()}
          className="flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-surface-card shadow-lg"
        >
          <DetailBody detail={detail} stateTone={stateTone} titleId="cell-detail-title-mobile" closeRef={closeRef} onClose={onClose} />
        </div>
      </div>
      <aside className="hidden w-72 shrink-0 border-l border-border-subtle bg-surface-card lg:block" aria-label="Permission details">
        <DetailBody detail={detail} stateTone={stateTone} titleId="cell-detail-title-desktop" closeRef={null} onClose={onClose} />
      </aside>
    </>
  );
}

function DetailBody({ detail, stateTone, titleId, closeRef, onClose }) {
  return (
    <div className="flex flex-col gap-token-5 p-token-5">
      <div className="flex items-start justify-between gap-token-3">
        <div>
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
            Permission Details
          </p>
          <h2 id={titleId} className="m-0 mt-token-1 text-token-base font-bold text-text-primary-alt">
            {detail.permission}
          </h2>
          <p className="m-0 mt-0.5 text-token-xs text-text-faint">{detail.category}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close permission details"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <IconX />
        </button>
      </div>

      <div>
        <span className={`inline-flex items-center rounded-full px-token-3 py-0.5 text-token-sm font-semibold ${stateTone}`}>
          {detail.currentState}
        </span>
      </div>

      <section>
        <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Role Context</h3>
        <dl className="mt-token-2 grid grid-cols-2 gap-token-2">
          {[
            { label: 'Role', value: detail.role.name },
            { label: 'Type', value: detail.role.type },
            { label: 'Privilege', value: detail.role.privilegeLevel },
            { label: 'Assigned', value: detail.role.assignedUsers },
          ].map((row) => (
            <div key={row.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
              <dt className="m-0 text-token-xs text-text-faint">{row.label}</dt>
              <dd className="m-0 mt-0.5 text-token-sm font-semibold text-text-primary-alt">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Permission Source</h3>
        <ul className="m-0 mt-token-2 flex list-none flex-col gap-token-2 p-0">
          {detail.sources.map((src) => (
            <li key={src.label} className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
              <span
                className={`h-1.5 w-1.5 rounded-full ${src.active ? 'bg-success' : 'bg-border'}`}
                aria-hidden="true"
              />
              <span className={src.active ? 'text-text-primary-alt' : 'text-text-faint'}>{src.label}</span>
              {!src.active && <span className="text-token-xs text-text-faint">(inactive)</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Affected Resources</h3>
        <dl className="m-0 mt-token-2 flex flex-col gap-token-2">
          {detail.resources.map((res) => (
            <div key={res.label} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2 last:border-b-0">
              <dt className="m-0 text-token-sm text-text-faint">{res.label}</dt>
              <dd className="m-0 text-token-sm font-medium text-text-primary-alt">{res.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="m-0 rounded-md border border-warning bg-warning-bg px-token-3 py-token-2 text-token-xs font-medium text-warning-strong">
        Editing this grant requires MOD-003&rsquo;s permission endpoint (still PLANNED).
      </p>
    </div>
  );
}

// INSIGHTS-MARKER

function InsightsPanel({ insights }) {
  if (!insights) return null;
  const maxDensity = Math.max(1, ...(insights.densityRows ?? []).map((r) => r.value));
  return (
    <div className="flex flex-col gap-token-3">
      <div className="flex items-baseline justify-between gap-token-3">
        <h2 className="m-0 text-token-base font-bold text-text-primary-alt">Permission Coverage Insights</h2>
        <span className="font-mono text-token-xs text-text-faint">Across all roles — not affected by column filters</span>
      </div>
      <div className="grid grid-cols-1 gap-token-4 lg:grid-cols-2 xl:grid-cols-4">
      <InsightCard title="Most Assigned" subtitle="Permissions held by the most roles" rows={insights.mostAssigned} />
      <InsightCard title="Administrative" subtitle="Privileged admin permissions" rows={insights.administrative} />
      <InsightCard title="Least Assigned" subtitle="Candidates for review or cleanup" rows={insights.unused} />
      <div className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
        <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Density by Privilege Level</p>
        <p className="m-0 mt-0.5 text-token-xs text-text-faint">Granted or inherited grants per privilege tier</p>
        <ul className="m-0 mt-token-4 flex list-none flex-col gap-token-3 p-0">
          {(insights.densityRows ?? []).map((row) => (
            <li key={row.label} className="flex flex-col gap-token-1">
              <span className="flex items-center justify-between text-token-xs">
                <span className="text-text-secondary-alt">{row.label}</span>
                <span className="font-mono font-semibold text-text-primary-alt">{row.value}</span>
              </span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.round((row.value / maxDensity) * 100)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}

function InsightCard({ title, subtitle, rows }) {
  const max = Math.max(1, ...(rows ?? []).map((r) => r.total ?? r.value ?? 1));
  return (
    <div className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</p>
      <p className="m-0 mt-0.5 text-token-xs text-text-faint">{subtitle}</p>
      <ul className="m-0 mt-token-4 flex list-none flex-col gap-token-3 p-0">
        {(rows ?? []).map((row) => {
          const total = row.total ?? max;
          const pct = total === 0 ? 0 : Math.round((row.value / total) * 100);
          const bar =
            row.tone === 'danger' ? 'bg-danger' : row.tone === 'warning' ? 'bg-warning' : 'bg-primary';
          return (
            <li key={row.label} className="flex flex-col gap-token-1">
              <span className="flex items-center justify-between text-token-xs">
                <span className="truncate text-text-secondary-alt" title={row.label}>{row.label}</span>
                <span className="ml-token-2 shrink-0 font-mono font-semibold text-text-primary-alt">
                  {row.value}/{total}
                </span>
              </span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
                <span className={`block h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MatrixSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-[520px] w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
    </div>
  );
}

// ICONS-MARKER

/* Inline icons — currentColor SVGs matching the Figma toolbar glyphs. */
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

function IconChevron({ collapsed }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`block h-3 w-3 transition-transform ${collapsed ? '-rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" />
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

function IconBookmark() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2.5h8v11l-4-3-4 3v-11Z" />
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

function IconExport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10V2m0 0 3 3M8 2 5 5M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}







