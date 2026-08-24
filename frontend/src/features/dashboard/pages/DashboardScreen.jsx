import AppShell from '../../shell/components/AppShell';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import iconExport from '../../../assets/icons/icon-export.svg';
import iconRefresh from '../../../assets/icons/icon-refresh.svg';
import iconActivity from '../../../assets/icons/icon-activity.svg';
import iconAlertTriangle from '../../../assets/icons/icon-alert-triangle.svg';
import iconCheckCircle from '../../../assets/icons/icon-check-circle.svg';
import iconTrendUp from '../../../assets/icons/icon-trend-up.svg';

const KPI_ICON = {
  running: iconActivity,
  failed: iconAlertTriangle,
  completed: iconCheckCircle,
  'success-rate': iconTrendUp,
};

const KPI_VALUE_TONE = {
  primary: 'text-primary',
  danger: 'text-danger',
  success: 'text-success',
  default: 'text-text-primary-alt',
};

const KPI_BAR_TONE = {
  primary: 'bg-primary',
  danger: 'bg-danger',
  success: 'bg-success',
  default: 'bg-text-primary-alt',
};

const KPI_ICON_WRAP_TONE = {
  primary: 'bg-surface-hover',
  danger: 'bg-danger-bg',
  success: 'bg-success-bg',
  default: 'bg-surface-hover',
};

const TREND_TONE = {
  success: 'bg-success-bg text-success-strong',
  danger: 'bg-danger-bg text-danger-strong',
};

const PIPELINE_STATUS = {
  running: { label: 'Running', dot: 'bg-primary', badge: 'border-border bg-surface-muted text-primary' },
  failed: { label: 'Failed', dot: 'bg-danger', badge: 'border-danger-border bg-danger-bg text-danger' },
  completed: { label: 'Completed', dot: 'bg-success', badge: 'border-border bg-success-bg text-success-strong' },
  queued: { label: 'Queued', dot: 'bg-decorative-muted', badge: 'border-border bg-surface-muted-alt text-text-secondary-alt' },
};

const HEALTH_DOT_TONE = {
  healthy: 'bg-success',
  operational: 'bg-success',
  normal: 'bg-success',
  warning: 'bg-warning',
  degraded: 'bg-warning',
  down: 'bg-danger',
};

const HEALTH_BAR_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  down: 'bg-danger',
};

function healthBarTone(percent) {
  if (percent >= 85) return HEALTH_BAR_TONE.down;
  if (percent >= 65) return HEALTH_BAR_TONE.warning;
  return HEALTH_BAR_TONE.healthy;
}

/** SCR-009 — Main Dashboard Layout Screen. Node 27:2238, Figma page "Page 1". */
export default function DashboardScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardSummary();

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Dashboard']}>
      <div className="flex flex-col gap-token-4">
        <div className="flex flex-col gap-token-3 pb-token-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Dashboard</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-008/MOD-009 have no backend deployed yet — showing sample data, not live metrics."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Monitor your ETL platform and pipeline operations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <span className="font-mono text-token-meta text-text-faint">
              {data ? `Updated ${data.updatedAt}` : ' '}
            </span>
            <button
              type="button"
              className="flex h-7 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-009 export endpoint exists."
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-7 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconRefresh} alt="" className={`block h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading dashboard'
            : isError
              ? 'Couldn’t load dashboard data'
              : isFetching
                ? 'Refreshing dashboard'
                : data
                  ? 'Dashboard updated'
                  : ''}
        </span>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load dashboard data</p>
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
            <StatusBanner status={data.systemStatus} />
            <KpiGrid kpis={data.kpis} />
            <div className="flex flex-col gap-token-4 xl:flex-row">
              <PipelineActivityCard pipelines={data.pipelineActivity} />
              <SystemHealthCard health={data.systemHealth} />
            </div>
            <ExecutionPerformanceCard performance={data.executionPerformance} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatusBanner({ status }) {
  const isOperational = status.state === 'operational';
  return (
    <div
      className={`flex items-center gap-token-3 rounded-md border px-token-5 py-token-3 ${
        isOperational ? 'border-border bg-success-bg' : 'border-danger-border bg-danger-bg'
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isOperational ? 'bg-success' : 'bg-danger'}`} aria-hidden="true" />
      <span className="text-token-sm font-semibold text-text-primary-alt">{status.headline}</span>
      <span className="flex-1 text-token-sm text-text-secondary-alt">{status.detail}</span>
      <button
        type="button"
        className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
        disabled
        title="System status detail view requires MOD-009's analytics endpoint (still PLANNED)."
      >
        View Details →
      </button>
    </div>
  );
}

function KpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.key} className="relative overflow-hidden rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
          <span className={`absolute inset-x-0 top-0 h-[3px] ${KPI_BAR_TONE[kpi.tone]}`} aria-hidden="true" />
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{kpi.label}</p>
          <p className={`m-0 mt-token-2 text-token-xl font-bold tracking-[-0.03em] ${KPI_VALUE_TONE[kpi.tone]}`}>{kpi.value}</p>
          <p className="m-0 mt-token-4 text-token-sm text-text-faint">{kpi.helper}</p>
          <span className={`mt-token-2 inline-flex rounded-sm px-token-3 py-0.5 text-token-meta font-semibold ${TREND_TONE[kpi.trendTone]}`}>
            {kpi.trend}
          </span>
          <span className={`absolute right-token-4 top-token-5 flex h-6 w-6 items-center justify-center rounded-md ${KPI_ICON_WRAP_TONE[kpi.tone]}`}>
            <img src={KPI_ICON[kpi.key]} alt="" className="block h-3 w-3" />
          </span>
        </div>
      ))}
    </div>
  );
}

function PipelineActivityCard({ pipelines }) {
  return (
    <div className="min-w-0 flex-[1.9] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Pipeline Activity</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">Running, queued, and recent executions</p>
        </div>
        <button
          type="button"
          className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
          disabled
          title="Full pipeline list requires MOD-008 (still PLANNED)."
        >
          View all →
        </button>
      </div>

      {pipelines.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No pipeline activity yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Pipeline', 'Status', 'Progress', 'Duration', 'Started', ''].map((col) => (
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
            {pipelines.map((pipeline) => {
              const status = PIPELINE_STATUS[pipeline.status];
              return (
                <tr key={pipeline.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-5 py-token-3">
                    <p className="m-0 text-token-sm font-medium text-text-primary-alt">{pipeline.name}</p>
                    <p className="m-0 font-mono text-token-xs text-text-faint">{pipeline.route}</p>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <span className={`inline-flex items-center gap-token-2 rounded-full border px-token-3 py-0.5 text-token-meta font-medium ${status.badge}`}>
                      <span className={`h-1 w-1 rounded-full ${status.dot}`} aria-hidden="true" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3">
                    {pipeline.progress != null ? (
                      <div className="flex items-center gap-token-2">
                        <div className="h-1 w-16 rounded-full bg-surface-hover">
                          <div className={`h-1 rounded-full ${status.dot}`} style={{ width: `${pipeline.progress}%` }} />
                        </div>
                        <span className="font-mono text-token-xs text-text-faint">{pipeline.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-token-sm text-text-secondary-alt">—</span>
                    )}
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">
                    {pipeline.duration ?? '—'}
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">
                    {pipeline.started ?? '—'}
                  </td>
                  <td className="px-token-5 py-token-3 text-right">
                    {pipeline.status === 'failed' ? (
                      <button
                        type="button"
                        className="text-token-sm font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                        disabled
                        title="Retry requires MOD-008's execution endpoint (still PLANNED)."
                      >
                        Retry
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                        disabled
                        title="Pipeline detail view requires MOD-008 (still PLANNED)."
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

function SystemHealthCard({ health }) {
  return (
    <div className="flex-1 rounded-md border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border-subtle px-token-5 py-token-4">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">System Health</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">{health.headline}</p>
      </div>
      <div className="flex flex-col">
        <HealthRow label="Workers" value={health.workers.value} state={health.workers.state} />
        <HealthRow label="Queue" value={health.queue.value} state={health.queue.state} />
        <HealthMeterRow label="CPU" percent={health.cpu.percent} />
        <HealthMeterRow label="Memory" percent={health.memory.percent} />
        <HealthMeterRow label="Disk" percent={health.disk.percent} />
        <HealthRow label="Database" state={health.database.state} />
        <HealthRow label="API" state={health.api.state} />
        <HealthRow label="Network" state={health.network.state} last />
      </div>
    </div>
  );
}

function HealthRow({ label, value, state, last }) {
  return (
    <div className={`flex items-center gap-token-3 px-token-5 py-token-2 ${last ? '' : 'border-b border-border-subtle'}`}>
      <span className="w-16 shrink-0 text-token-sm text-text-secondary-alt">{label}</span>
      {value && <span className="flex-1 text-token-sm font-medium text-text-primary-alt">{value}</span>}
      {!value && <span className="flex-1" />}
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${HEALTH_DOT_TONE[state] ?? 'bg-decorative-muted'}`} aria-hidden="true" />
      <span className="font-mono text-token-xs capitalize text-text-secondary-alt">{state}</span>
    </div>
  );
}

function HealthMeterRow({ label, percent }) {
  return (
    <div className="flex items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-2">
      <span className="w-16 shrink-0 text-token-sm text-text-secondary-alt">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-surface-hover">
        <div className={`h-1 rounded-full ${healthBarTone(percent)}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-token-xs text-text-secondary-alt">{percent}%</span>
    </div>
  );
}

function ExecutionPerformanceCard({ performance }) {
  const stats = [
    { label: 'Total today', value: performance.totalToday, tone: 'text-text-primary-alt' },
    { label: 'Successful', value: performance.successful, tone: 'text-success' },
    { label: 'Failed', value: performance.failed, tone: 'text-danger' },
    { label: 'Avg duration', value: performance.avgDuration, tone: 'text-text-primary-alt' },
  ];
  return (
    <div className="rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Execution Performance</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">7-day execution trend</p>
        </div>
        <button
          type="button"
          className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
          disabled
          title="Execution history requires MOD-008/MOD-009 (still PLANNED)."
        >
          View executions →
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`border-b border-border-subtle px-token-5 py-token-4 sm:border-b-0 ${
              i % 2 === 0 ? 'border-r border-border-subtle sm:border-r-0' : ''
            } ${i < stats.length - 1 ? 'sm:border-r sm:border-border-subtle' : ''}`}
          >
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-2 text-token-lg font-bold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Figma's trend chart region (node 27:2626 onward) renders only a
          static image in the design with no data contract for an
          interactive chart library — extrapolated as a placeholder note
          per agent-rules.md §5, not a fabricated chart. */}
      <div className="border-t border-border-subtle px-token-5 py-token-4">
        <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">7-day trend</p>
        <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">
          Trend chart requires MOD-009&rsquo;s analytics endpoint (still PLANNED) — not rendered until real time-series data exists.
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-token-4" aria-hidden="true">
      <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-48 animate-pulse rounded-md bg-surface-hover xl:flex-[1.9]" />
        <div className="h-48 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
    </div>
  );
}
