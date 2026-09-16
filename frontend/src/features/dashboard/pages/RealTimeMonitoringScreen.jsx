import { useMemo, useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useRealTimeMonitoring } from '../hooks/useRealTimeMonitoring';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconChevronLeft from '../../../assets/icons/system-health/icon-chevron-left.svg';
import iconChevronRight from '../../../assets/icons/system-health/icon-chevron-right.svg';
import iconTriangle from '../../../assets/icons/pipeline-overview/icon-triangle.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconTrendUp from '../../../assets/icons/executive-dashboard/icon-trend-up.svg';
import iconRefresh from '../../../assets/icons/icon-refresh.svg';
import iconCircleCheck from '../../../assets/icons/system-health/icon-circle-check.svg';
import iconWave from '../../../assets/icons/system-health/icon-wave.svg';
import iconActivity from '../../../assets/icons/system-health/icon-activity.svg';
import iconPipeline from '../../../assets/icons/pipeline-overview/icon-pipeline.svg';
import iconBarChart from '../../../assets/icons/data-quality/icon-bar-chart2.svg';
import iconServer from '../../../assets/icons/system-health/icon-server.svg';

const RANGES = ['30s', '7d', '30d'];
const PAGE_SIZE = 10;

/** Node 72:45894 was inspected via Figma MCP this session — icons are
 * reused from the shared glyph set (no per-node export needed for this
 * screen's monochrome KPI icons). See realTimeMonitoring.api.js. */
const KPI_ICON = {
  pipeline: iconPipeline,
  activity: iconActivity,
  clock: iconClock,
  server: iconServer,
  'bar-chart': iconBarChart,
  refresh: iconRefresh,
  'trend-up': iconTrendUp,
  wave: iconWave,
  'circle-check': iconCircleCheck,
  triangle: iconTriangle,
};

const KPI_TONE = {
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  warning: { value: 'text-warning', bar: 'bg-warning', iconWrap: 'bg-warning-bg' },
  danger: { value: 'text-danger', bar: 'bg-danger', iconWrap: 'bg-danger-bg' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-shell-accent-wash' },
};

const TREND_TONE = {
  up: 'text-success-strong',
  down: 'text-danger-strong',
  flat: 'text-text-secondary-alt',
};

const STATUS_METRIC_TONE = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  default: 'text-text-primary-alt',
};

const ACTIVITY_BADGE = {
  Running: { dot: 'bg-primary', bg: 'bg-shell-accent-wash border-primary', text: 'text-primary', bar: 'bg-primary' },
  Completed: { dot: 'bg-success', bg: 'bg-success-bg border-success-border', text: 'text-success', bar: 'bg-success' },
  Failed: { dot: 'bg-danger', bg: 'bg-danger-bg border-danger-border', text: 'text-danger', bar: 'bg-danger' },
  Queued: { dot: 'bg-warning', bg: 'bg-warning-bg border-warning-border', text: 'text-warning', bar: 'bg-warning' },
};

const PIPELINE_STATUS_TONE = {
  Running: { text: 'text-primary', bar: 'bg-primary' },
  Slow: { text: 'text-warning', bar: 'bg-warning' },
  Retrying: { text: 'text-warning', bar: 'bg-warning' },
  Failed: { text: 'text-danger', bar: 'bg-danger' },
};

const UTIL_TONE = {
  Busy: 'bg-primary',
  Idle: 'bg-text-faint',
};

const INFRA_TONE = {
  success: { bar: 'bg-success', badge: 'bg-success-bg text-success-strong' },
  warning: { bar: 'bg-warning', badge: 'bg-warning-bg text-warning' },
  danger: { bar: 'bg-danger', badge: 'bg-danger-bg text-danger' },
};

const CONN_TONE = {
  success: 'bg-success-bg text-success-strong',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
};

const EVENT_TONE = {
  success: { dot: 'bg-success', badge: 'bg-success-bg text-success-strong' },
  danger: { dot: 'bg-danger', badge: 'bg-danger-bg text-danger' },
  warning: { dot: 'bg-warning', badge: 'bg-warning-bg text-warning' },
  info: { dot: 'bg-primary', badge: 'bg-shell-accent-wash text-primary' },
};

const ALERT_TONE = {
  danger: { border: 'border-danger-border', bg: 'bg-danger-bg', badge: 'bg-danger text-white', title: 'text-danger-strong' },
  warning: { border: 'border-warning-border', bg: 'bg-warning-bg', badge: 'bg-warning text-white', title: 'text-warning' },
  info: { border: 'border-primary', bg: 'bg-shell-accent-wash', badge: 'bg-primary text-white', title: 'text-primary' },
};

const TABLE_STATUS_TONE = {
  Running: 'bg-shell-accent-wash text-primary',
  Busy: 'bg-shell-accent-wash text-primary',
  'High CPU': 'bg-danger-bg text-danger',
  Failed: 'bg-danger-bg text-danger',
  Warning: 'bg-warning-bg text-warning',
  Idle: 'bg-surface-muted text-text-secondary-alt',
};

/** SCR-023 — Real-Time Monitoring Dashboard Screen. Node 72:45894,
 * Figma page "Page 1". MOD-009 Analytics/Monitoring; built against the
 * inspected Figma frame + the sibling dashboard pattern of record. The
 * "live" surface polls every 15s while `live` is on and can be paused
 * with the Pause updates toggle. */
export default function RealTimeMonitoringScreen() {
  const [range, setRange] = useState('30s');
  const [live, setLive] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useRealTimeMonitoring(range, { live });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-realtime-monitoring-${range}`);
    showToast('Real-time monitoring telemetry exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Monitoring']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Real-Time Monitoring Dashboard</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-006/007/008/009 have no backend or websocket stream deployed yet — showing sample data, not live telemetry."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Monitor live operations, execution activity, infrastructure health, alerts, and platform performance in real time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <span
              className={`inline-flex items-center gap-token-2 rounded-full border px-token-3 py-1 text-token-xs font-semibold ${
                live ? 'border-success-border bg-success-bg text-success-strong' : 'border-border bg-surface-muted text-text-secondary-alt'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-success animate-pulse' : 'bg-text-faint'}`} aria-hidden="true" />
              {live ? 'Live' : 'Paused'}
            </span>
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              aria-pressed={!live}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {live ? 'Pause updates' : 'Resume updates'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Real-Time Telemetry Snapshot"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export Snapshot
            </button>
            <div className="flex gap-0.5 rounded-md border border-border bg-surface-muted p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={`rounded-sm px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    range === r
                      ? 'bg-surface-card font-semibold text-text-primary-alt shadow-sm'
                      : 'text-text-secondary-alt hover:text-text-primary-alt'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh now"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconRefreshCw} alt="" className={`block h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading real-time monitoring dashboard'
            : isError
              ? 'Couldn’t load real-time monitoring dashboard data'
              : isFetching
                ? 'Refreshing real-time monitoring dashboard'
                : data
                  ? 'Real-time monitoring dashboard updated'
                  : ''}
        </span>

        {isLoading && <MonitoringSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the real-time monitoring dashboard</p>
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
            <StatusBanner status={data.status} updatedAt={data.updatedAt} live={live} />

            <KpiGrid kpis={data.kpis} />

            <LiveActivityCard data={data.liveActivity} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <ActivePipelinesCard data={data.activePipelines} />
              <WorkerQueueCard data={data.workerQueue} />
            </div>

            <div className="grid grid-cols-1 gap-token-4 xl:grid-cols-3">
              <InfrastructureCard data={data.infrastructure} />
              <ThroughputCard data={data.throughput} />
              <ConnectivityCard data={data.connectivity} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <EventStreamCard data={data.eventStream} />
              <AlertsCard data={data.alerts} />
            </div>

            <MonitoringTable table={data.monitoringTable} />

            <ScreenFooter data={data} isFetching={isFetching} live={live} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatusBanner({ status, updatedAt, live }) {
  return (
    <div className="flex flex-wrap items-center gap-token-6 rounded-md border border-success-border bg-success-bg px-token-5 py-token-4">
      <div className="flex items-center gap-token-3">
        <span className={`h-2 w-2 shrink-0 rounded-full bg-success ${live ? 'animate-pulse' : ''}`} aria-hidden="true" />
        <div>
          <p className="m-0 text-token-sm font-semibold text-success-strong">{status.label}</p>
          <p className="m-0 font-mono text-token-meta text-text-secondary-alt">{status.context} · Updated {updatedAt}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-token-6">
        {status.metrics.map((m) => (
          <div key={m.key} className="text-right">
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{m.label}</p>
            <p className={`m-0 mt-0.5 text-token-base font-extrabold tracking-[-0.02em] ${STATUS_METRIC_TONE[m.tone] ?? STATUS_METRIC_TONE.default}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const tone = KPI_TONE[kpi.tone] ?? KPI_TONE.default;
        return (
          <div key={kpi.key} className="relative overflow-hidden rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
            <span className={`absolute inset-x-0 top-0 h-[3px] ${tone.bar}`} aria-hidden="true" />
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{kpi.label}</p>
            <p className={`m-0 mt-token-2 text-token-xl font-extrabold tracking-[-0.03em] ${tone.value}`}>
              {kpi.value}
              {kpi.suffix && <span className="text-token-base font-semibold">{kpi.suffix}</span>}
            </p>
            {kpi.trend && (
              <span className={`mt-token-2 inline-flex text-token-meta font-semibold ${TREND_TONE[kpi.trendTone]}`}>{kpi.trend}</span>
            )}
            <p className="m-0 mt-token-4 text-token-sm text-text-faint">{kpi.footer}</p>
            <span className={`absolute right-token-4 top-token-5 flex h-6 w-6 items-center justify-center rounded-md ${tone.iconWrap}`}>
              <img src={KPI_ICON[kpi.icon]} alt="" className="block h-3.5 w-3.5" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CardHeader({ title, subtitle, linkLabel, linkTitle }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
      <div>
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">{subtitle}</p>
      </div>
      {linkLabel && (
        <button
          type="button"
          className="whitespace-nowrap text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
          disabled
          title={linkTitle ?? `${linkLabel} is not yet available (module still PLANNED).`}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

function LiveActivityCard({ data }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const filtered = useMemo(
    () => data.rows.filter((row) => statusFilter === 'All' || row.status === statusFilter),
    [data.rows, statusFilter],
  );

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Live Execution Activity</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{data.subtitle}</p>
        </div>
        <div className="flex gap-0.5 rounded-md border border-border bg-surface-muted p-0.5">
          {data.statusFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              aria-pressed={statusFilter === f}
              className={`rounded-sm px-token-3 py-1 text-token-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                statusFilter === f
                  ? 'bg-surface-card font-semibold text-text-primary-alt shadow-sm'
                  : 'text-text-secondary-alt hover:text-text-primary-alt'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">No executions match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Pipeline', 'Status', 'Progress', 'Runtime', 'Worker', 'Environment', 'Actions'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const s = ACTIVITY_BADGE[row.status] ?? ACTIVITY_BADGE.Running;
                return (
                  <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                    <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.pipeline}</td>
                    <td className="px-token-5 py-token-3">
                      <span className={`inline-flex items-center gap-token-1 rounded-full border px-token-3 py-0.5 text-token-xs font-semibold ${s.bg} ${s.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${row.status === 'Running' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <div className="flex items-center gap-token-2">
                        <div className="h-1.5 w-24 rounded-full bg-surface-hover">
                          <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${row.progress}%` }} />
                        </div>
                        <span className="font-mono text-token-xs text-text-faint">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.runtime}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.worker}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.environment}</td>
                    <td className="px-token-5 py-token-3">
                      <button
                        type="button"
                        className="text-token-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                        disabled
                        title="Execution logs require MOD-008's Logs module (still PLANNED)."
                      >
                        Logs
                      </button>
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

function ActivePipelinesCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Active Pipelines" subtitle={data.subtitle} linkLabel="View all" linkTitle="Full pipeline list requires MOD-006's Pipelines module (still PLANNED)." />
      <ul className="m-0 grid list-none grid-cols-1 gap-token-3 p-token-5 md:grid-cols-2">
        {data.rows.map((row) => {
          const tone = PIPELINE_STATUS_TONE[row.status] ?? PIPELINE_STATUS_TONE.Running;
          return (
            <li key={row.key} className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
              <div className="mb-token-2 flex items-center justify-between">
                <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                <span className={`ml-token-2 shrink-0 text-token-xs font-bold ${tone.text}`}>{row.status}</span>
              </div>
              <p className="m-0 mb-token-2 font-mono text-token-xs text-text-faint">{row.stage}</p>
              <div className="h-1.5 w-full rounded-full bg-surface-hover">
                <div className={`h-1.5 rounded-full ${tone.bar}`} style={{ width: `${row.progress}%` }} />
              </div>
              <div className="mt-token-2 flex items-center justify-between font-mono text-token-xs text-text-faint">
                <span>{row.rows}</span>
                <span className="font-semibold text-text-secondary-alt">{row.progress}% {row.throughput}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WorkerQueueCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Worker & Queue Monitoring" subtitle={data.subtitle} />
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-muted px-token-5 py-token-3">
        <div>
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{data.queueDepth.label}</p>
          <p className="m-0 mt-0.5 text-token-lg font-extrabold tracking-[-0.02em] text-warning">{data.queueDepth.value}</p>
        </div>
        <div className="text-right font-mono text-token-xs text-text-faint">
          <p className="m-0">Latency {data.queueDepth.latency}</p>
          <p className="m-0">Processing {data.queueDepth.processing}</p>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-token-3 p-token-5">
        {data.workers.map((w) => (
          <li key={w.key} className="flex items-center gap-token-3">
            <span className="w-28 shrink-0 truncate font-mono text-token-xs text-text-secondary-alt">{w.name}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-hover">
              <div className={`h-2 rounded-full ${UTIL_TONE[w.state] ?? UTIL_TONE.Busy}`} style={{ width: `${w.util}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-token-xs font-semibold text-text-primary-alt">{w.util}%</span>
            <span className="w-14 shrink-0 text-right font-mono text-token-xs text-text-faint">{w.tasks}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfrastructureCard({ data }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Infrastructure Metrics" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col gap-token-4 p-token-5">
        {data.rows.map((row) => {
          const tone = INFRA_TONE[row.tone] ?? INFRA_TONE.success;
          return (
            <li key={row.key}>
              <div className="mb-token-1 flex items-center justify-between text-token-sm">
                <span className="font-medium text-text-primary-alt">{row.label}</span>
                <span className="flex items-center gap-token-2">
                  <span className="font-mono font-semibold text-text-primary-alt">{row.pct}%</span>
                  <span className={`rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${tone.badge}`}>{row.status}</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-hover">
                <div className={`h-1.5 rounded-full ${tone.bar}`} style={{ width: `${row.pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const TP_W = 320;
const TP_H = 90;

/** Inline SVG sparkline — no charting library is a project dependency
 * (agent-rules.md §4), same precedent as the sibling MOD-009 screens.
 * The area path uses the real 0–axisMax scale. */
function ThroughputCard({ data }) {
  const stepX = TP_W / Math.max(data.series.length - 1, 1);
  const line = data.series
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(TP_H - (v / data.axisMax) * TP_H).toFixed(1)}`)
    .join(' ');
  const area = `${line} L${TP_W},${TP_H} L0,${TP_H} Z`;
  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Throughput Monitor" subtitle={data.subtitle} />
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-end justify-between">
          <div>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Current</p>
            <p className="m-0 text-token-xl font-extrabold tracking-[-0.03em] text-text-primary-alt">{data.current}</p>
          </div>
          <div className="text-right font-mono text-token-xs text-text-faint">
            <p className="m-0">Processed {data.processed}</p>
            <p className="m-0">Peak {data.peak}</p>
          </div>
        </div>
        <svg viewBox={`0 0 ${TP_W} ${TP_H}`} className="h-24 w-full" role="img" aria-label={`Records processing over the last 10 minutes. Current ${data.current} per second, peak ${data.peak}.`}>
          <path d={area} fill="#0f5699" fillOpacity="0.12" />
          <path d={line} fill="none" stroke="#0f5699" strokeWidth="2" />
        </svg>
        <p className="m-0 mt-token-1 font-mono text-token-xs text-text-faint">{data.footer}</p>
      </div>
    </div>
  );
}

function ConnectivityCard({ data }) {
  const columns = [
    { key: 'remote', label: 'Remote Systems', rows: data.remote },
    { key: 'local', label: 'Data Warehouses', rows: data.local },
  ];
  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Source & Destination Connectivity" subtitle={data.subtitle} />
      <div className="grid grid-cols-1 gap-token-4 px-token-5 py-token-4 sm:grid-cols-2">
        {columns.map((col) => (
          <div key={col.key}>
            <p className="m-0 mb-token-2 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">{col.label}</p>
            <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
              {col.rows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-token-2">
                  <span className="min-w-0 flex-1 truncate text-token-sm text-text-primary-alt">{row.label}</span>
                  <span className="shrink-0 font-mono text-token-xs text-text-faint">{row.latency}</span>
                  <span className={`shrink-0 rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold ${CONN_TONE[row.tone] ?? CONN_TONE.success}`}>{row.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-token-4 border-t border-border-subtle px-token-5 py-token-3 font-mono text-token-xs">
        <span className="font-semibold text-success-strong">{data.connected} Connected</span>
        <span className="font-semibold text-warning">{data.reconnecting} Reconnecting</span>
        <span className="font-semibold text-danger">{data.failed} Failed</span>
      </div>
    </div>
  );
}

function EventStreamCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Live Event Stream" subtitle={data.subtitle} linkLabel="View all" linkTitle="Full event history requires MOD-008's Logs module (still PLANNED)." />
      <ul className="m-0 flex max-h-[420px] list-none flex-col overflow-y-auto p-0">
        {data.rows.map((row, i) => {
          const tone = EVENT_TONE[row.tone] ?? EVENT_TONE.info;
          return (
            <li key={row.id} className={`flex items-start gap-token-3 px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-token-2">
                  <span className={`shrink-0 rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${tone.badge}`}>{row.badge}</span>
                  <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.title}</span>
                </div>
                <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{row.description}</p>
              </div>
              <span className="shrink-0 font-mono text-token-xs text-text-faint">{row.time}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AlertsCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Active Alerts" subtitle={data.subtitle} linkLabel="View all alerts" linkTitle="Full alerts console requires MOD-009's Alerts module (still PLANNED)." />
      <ul className="m-0 flex list-none flex-col gap-token-3 p-token-5">
        {data.rows.map((row) => {
          const tone = ALERT_TONE[row.tone] ?? ALERT_TONE.info;
          return (
            <li key={row.id} className={`rounded-md border ${tone.border} ${tone.bg} p-token-4`}>
              <div className="flex items-start justify-between gap-token-3">
                <div className="flex items-center gap-token-2">
                  <span className={`rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${tone.badge}`}>{row.severity}</span>
                  <span className="font-mono text-token-xs text-text-faint">{row.context}</span>
                </div>
                <span className="shrink-0 font-mono text-token-xs text-text-faint">{row.ago}</span>
              </div>
              <p className={`m-0 mt-token-2 text-token-sm font-semibold ${tone.title}`}>{row.target}</p>
              <p className="m-0 mt-0.5 text-token-sm text-text-secondary-alt">{row.title}</p>
              <button
                type="button"
                className="mt-token-2 text-token-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                disabled
                title="Acknowledging alerts requires MOD-009's Alerts module (still PLANNED)."
              >
                Acknowledge
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex items-center gap-token-2">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt === 'All' ? `${label}: All` : opt}</option>
        ))}
      </select>
    </label>
  );
}

function MonitoringTable({ table }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [envFilter, setEnvFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (typeFilter !== 'All' && row.type !== typeFilter) return false;
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (envFilter !== 'All' && row.environment !== envFilter) return false;
      if (!q) return true;
      return row.name.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q);
    });
  }, [table.rows, search, typeFilter, statusFilter, envFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  function resetPage(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Live Monitoring Table</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{table.subtitle}</p>
        </div>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Export is not yet available — no MOD-009 export endpoint exists."
        >
          <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search by component name or owner</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search by component or owner…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <FilterSelect label="Type" value={typeFilter} options={table.typeFilters} onChange={resetPage(setTypeFilter)} />
        <FilterSelect label="Status" value={statusFilter} options={table.statusFilters} onChange={resetPage(setStatusFilter)} />
        <FilterSelect label="Environment" value={envFilter} options={table.environmentFilters} onChange={resetPage(setEnvFilter)} />
      </div>

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No components match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Component', 'Type', 'Status', 'Current Activity', 'Runtime', 'Throughput', 'CPU', 'Latency', 'Environment', 'Owner', 'Actions'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.name}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.type}</td>
                  <td className="px-token-5 py-token-3">
                    <span className={`inline-flex rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${TABLE_STATUS_TONE[row.status] ?? TABLE_STATUS_TONE.Idle}`}>{row.status}</span>
                  </td>
                  <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.activity}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.runtime}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.throughput}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.cpu}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.latency}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.environment}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.owner}</td>
                  <td className="px-token-5 py-token-3">
                    <button
                      type="button"
                      className="text-token-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                      disabled
                      title="Component logs require MOD-008's Logs module (still PLANNED)."
                    >
                      Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {table.total.toLocaleString()} components
        </p>
        <div className="flex items-center gap-token-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage <= 1}
            aria-label="Previous page"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src={iconChevronLeft} alt="" className="block h-3 w-3" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={clampedPage === p ? 'page' : undefined}
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-md border text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                clampedPage === p ? 'border-primary bg-primary text-white' : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={clampedPage >= pageCount}
            aria-label="Next page"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src={iconChevronRight} alt="" className="block h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenFooter({ data, isFetching, live }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : live ? 'bg-success animate-pulse' : 'bg-text-faint'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : live ? `Live · updated ${data.updatedAt}` : 'Updates paused'}
        </span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-danger">{data.alerts.rows.filter((a) => a.severity === 'Critical').length} critical alert(s)</span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-warning">Queue depth {data.workerQueue.queueDepth.value}</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-006/007/008/009 have no backend or websocket stream deployed yet — showing sample data, not live telemetry.">
          Sample data
        </span>
      )}
    </div>
  );
}

function MonitoringSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-16 animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="h-80 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="grid grid-cols-1 gap-token-4 xl:grid-cols-3">
        <div className="h-56 animate-pulse rounded-md bg-surface-hover" />
        <div className="h-56 animate-pulse rounded-md bg-surface-hover" />
        <div className="h-56 animate-pulse rounded-md bg-surface-hover" />
      </div>
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
