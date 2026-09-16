import { useMemo, useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconCircleCheck from '../../../assets/icons/system-health/icon-circle-check.svg';
import iconShield from '../../../assets/icons/system-health/icon-shield.svg';
import iconServer from '../../../assets/icons/system-health/icon-server.svg';
import iconWave from '../../../assets/icons/system-health/icon-wave.svg';
import iconCpu from '../../../assets/icons/system-health/icon-cpu.svg';
import iconActivity from '../../../assets/icons/system-health/icon-activity.svg';
import iconHardDrive from '../../../assets/icons/system-health/icon-hard-drive.svg';
import iconBell from '../../../assets/icons/system-health/icon-bell.svg';
import iconAlertSm from '../../../assets/icons/executive-dashboard/icon-alert-sm.svg';
import iconGearSm from '../../../assets/icons/pipeline-overview/icon-gear-sm.svg';
import iconColumns from '../../../assets/icons/pipeline-overview/icon-columns.svg';
import iconFilter from '../../../assets/icons/pipeline-overview/icon-filter.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconSortUp from '../../../assets/icons/system-health/icon-sort-up.svg';
import iconChevronLeft from '../../../assets/icons/system-health/icon-chevron-left.svg';
import iconChevronRight from '../../../assets/icons/system-health/icon-chevron-right.svg';

const TIME_RANGES = ['Live', '1h', '24h', '7d'];
const PAGE_SIZE = 10;

const KPI_ICON = {
  'circle-check': iconCircleCheck,
  shield: iconShield,
  server: iconServer,
  wave: iconWave,
  cpu: iconCpu,
  activity: iconActivity,
  'hard-drive': iconHardDrive,
  bell: iconBell,
};

const KPI_TONE = {
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg', badge: 'bg-success-bg text-success-strong' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-shell-accent-wash', badge: 'bg-surface-muted text-text-secondary-alt' },
};

const TREND_TONE = {
  up: 'text-success-strong',
  down: 'text-danger-strong',
  flat: 'text-text-secondary-alt',
};

const STATUS_BADGE = {
  Operational: { dot: 'bg-success', text: 'text-success', bg: 'bg-success-bg border-success-border', label: 'Operational' },
  Degraded: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg border-warning-border', label: 'Degraded' },
  Healthy: { dot: 'bg-success', text: 'text-success', bg: 'bg-success-bg border-success-border', label: 'Healthy' },
  Warning: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg border-warning-border', label: 'Warning' },
};

const ALERT_SEVERITY = {
  warning: { icon: iconAlertSm, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning', label: 'Warning' },
  info: { icon: iconGearSm, iconWrap: 'bg-surface-muted', badge: 'bg-shell-accent-wash text-primary', label: 'Info' },
};

/** SCR-017 — System Health Dashboard Screen. Node 51:6763, Figma page "Page 1". */
export default function SystemHealthScreen() {
  const [timeRange, setTimeRange] = useState('Live');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useSystemHealth(timeRange);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-system-health-${timeRange.toLowerCase()}`);
    showToast('System health operational report exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Analytics', 'System Health']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">System Health</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-009 has no backend deployed yet — showing sample data, not live metrics."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Monitor infrastructure availability, service health, resource utilization, and operational performance across the ETL ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              onClick={() => {
                refetch();
                showToast('System telemetry refreshed');
              }}
              disabled={isFetching}
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconRefreshCw} alt="" className={`block h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export System Health Report as JSON"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export Report
            </button>
            <div className="flex gap-0.5 rounded-md border border-border bg-surface-muted p-0.5">
              {TIME_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  aria-pressed={timeRange === range}
                  className={`rounded-sm px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    timeRange === range
                      ? 'bg-surface-card font-semibold text-text-primary-alt shadow-sm'
                      : 'text-text-secondary-alt hover:text-text-primary-alt'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading system health dashboard'
            : isError
              ? 'Couldn’t load system health dashboard data'
              : isFetching
                ? 'Refreshing system health dashboard'
                : data
                  ? 'System health dashboard updated'
                  : ''}
        </span>

        {isLoading && <SystemHealthSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the system health dashboard</p>
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
            <GlobalStatusBanner status={data.globalStatus} />

            <KpiGrid kpis={data.kpis} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <ServiceHealthCard data={data.serviceHealth} />
              <SystemAlertsCard alerts={data.alerts} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <UtilizationTrendCard title="CPU Utilization" swatchClass="bg-primary" data={data.cpuTrend} lineColor="#0f5699" />
              <UtilizationTrendCard title="Memory Utilization" swatchClass="bg-[#7c3aed]" data={data.memoryTrend} lineColor="#7c3aed" />
            </div>

            <div className="grid grid-cols-1 gap-token-4 xl:grid-cols-3">
              <QueueWorkersCard data={data.queueWorkers} />
              <DatabaseHealthCard data={data.databaseHealth} />
              <ApiPerformanceCard data={data.apiPerformance} />
            </div>

            <InfrastructureComponentsTable table={data.infrastructureComponents} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
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
        <span>{data.globalStatus.openIncidents} open incidents</span>
        <FooterDivider />
        <span className={data.globalStatus.warningEvents > 0 ? 'font-semibold text-warning' : ''}>
          {data.globalStatus.warningEvents} warning event{data.globalStatus.warningEvents === 1 ? '' : 's'}
        </span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-009 has no backend deployed yet — showing sample data, not live metrics.">
          Sample data
        </span>
      )}
    </div>
  );
}

function FooterDivider() {
  return <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />;
}

function GlobalStatusBanner({ status }) {
  const stats = [
    { key: 'availability', label: 'Availability (30d)', value: status.availability30d, tone: 'text-text-primary-alt' },
    { key: 'active-services', label: 'Active Services', value: status.activeServices, tone: 'text-success' },
    { key: 'running-workers', label: 'Running Workers', value: status.runningWorkers, tone: 'text-success' },
    { key: 'open-incidents', label: 'Open Incidents', value: status.openIncidents, tone: 'text-text-primary-alt' },
    { key: 'warning-events', label: 'Warning Events', value: status.warningEvents, tone: 'text-warning' },
    { key: 'uptime', label: 'Uptime', value: status.uptime, tone: 'text-text-primary-alt' },
  ];
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card px-token-6 py-token-4 shadow-sm md:flex-row md:items-center">
      <div className="flex items-center gap-token-3 border-border-subtle pr-token-6 md:border-r">
        <span className="h-3 w-3 shrink-0 rounded-full bg-success" aria-hidden="true" />
        <div>
          <p className="m-0 text-token-base font-bold text-text-primary-alt">{status.label}</p>
          <p className="m-0 mt-0.5 text-token-xs text-text-faint">Last checked {status.updatedAt ?? '12 seconds ago'} · Auto-refresh on</p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-token-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.key}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-0.5 font-mono text-token-base font-bold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
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
            {kpi.badge && (
              <span className={`mt-token-2 inline-flex rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.badge}`}>{kpi.badge}</span>
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

function CardHeader({ title, subtitle, linkLabel }) {
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
          title={`${linkLabel} requires MOD-009's system health endpoint (still PLANNED).`}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.Operational;
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-full border px-token-3 py-0.5 font-semibold text-token-xs ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

function ServiceHealthCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Service Health" subtitle={data.subtitle} linkLabel="View logs" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Service', 'Status', 'Uptime', 'Response', 'Error Rate', 'Last Restart'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.name}</td>
                <td className="px-token-5 py-token-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className={`px-token-5 py-token-3 font-mono text-token-xs ${row.warn ? 'text-warning' : 'text-text-faint'}`}>{row.uptime}</td>
                <td className={`px-token-5 py-token-3 font-mono text-token-xs ${row.warn ? 'text-warning' : 'text-text-faint'}`}>{row.response}</td>
                <td className={`px-token-5 py-token-3 font-mono text-token-xs ${row.danger ? 'text-danger' : 'text-text-faint'}`}>{row.errorRate}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.lastRestart}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemAlertsCard({ alerts }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="System Alerts" subtitle="Actionable · severity sorted" />
      {alerts.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">No active alerts.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {alerts.map((alert, i) => {
            const severity = ALERT_SEVERITY[alert.severity] ?? ALERT_SEVERITY.info;
            return (
              <li key={alert.id} className={`px-token-5 py-token-3 ${i < alerts.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                <div className="flex items-start gap-token-3">
                  <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${severity.iconWrap}`}>
                    <img src={severity.icon} alt="" className="block h-2.5 w-2.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{alert.title}</p>
                    <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{alert.description}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${severity.badge}`}>
                    {severity.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const CHART_HEIGHT = 76;
const CHART_WIDTH = 579;

function chartPoints(values, min, max) {
  const range = max - min || 1;
  const stepX = CHART_WIDTH / Math.max(values.length - 1, 1);
  return values.map((v, i) => [i * stepX, CHART_HEIGHT - ((v - min) / range) * CHART_HEIGHT]);
}

function linePath(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** Real chart data rendered as inline SVG — no charting library is a
 * project dependency yet (agent-rules.md §4), and Figma's own CPU/
 * memory trend chart regions (nodes 51:8560, 51:8637) are static
 * hand-drawn vector art with no live-render contract — same precedent
 * as DataQualityScreen's QualityScoreTrendCard and
 * PipelineOverviewScreen's ExecutionVolumeChart. */
function UtilizationTrendCard({ title, swatchClass, data, lineColor }) {
  const points = chartPoints(data.series, 0, 100);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{data.subtitle}</p>
        </div>
        <div className="flex items-center gap-token-2">
          <span className="text-token-xl font-bold tracking-[-0.02em] text-text-primary-alt">{data.current}</span>
          <span className={`rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${data.tone === 'success' ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-secondary-alt'}`}>
            {data.toneLabel}
          </span>
        </div>
      </div>
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-center justify-between">
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
            Avg {title.split(' ')[0]} % — last 24h
          </p>
          <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
            <span className={`h-2 w-2 rounded-sm ${swatchClass}`} aria-hidden="true" />
            {title.split(' ')[0]} %
          </span>
        </div>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-20 w-full" role="img" aria-label={`${title} over the last 24 hours`}>
          {data.threshold != null && (
            <line
              x1="0"
              x2={CHART_WIDTH}
              y1={CHART_HEIGHT - (data.threshold / 100) * CHART_HEIGHT}
              y2={CHART_HEIGHT - (data.threshold / 100) * CHART_HEIGHT}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )}
          <path d={linePath(points)} fill="none" stroke={lineColor} strokeWidth="2" />
        </svg>
        <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
          <span>12a</span>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>Now</span>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-border-subtle">
        <div className="border-r border-border-subtle px-token-5 py-token-4">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Current</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.current}</p>
        </div>
        <div className="border-r border-border-subtle px-token-5 py-token-4">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Peak (24h)</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.peak24h}</p>
        </div>
        <div className="px-token-5 py-token-4">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{data.used ? 'Used' : 'Avg (24h)'}</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.used ?? data.avg24h}</p>
        </div>
      </div>
    </div>
  );
}

function QueueWorkersCard({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Queue & Workers" subtitle="Real-time status" />
      <div className="flex flex-col gap-token-2 px-token-5 pb-token-3 pt-token-1">
        <p className="m-0 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">Workers</p>
        {data.workers.map((w) => (
          <div key={w.id} className="flex items-center gap-token-2">
            <span className="w-24 shrink-0 font-mono text-token-xs text-text-secondary-alt">{w.name}</span>
            <div className="h-1 flex-1 rounded-full bg-surface-hover">
              <div className={`h-1 rounded-full ${w.tone === 'danger' ? 'bg-danger' : 'bg-success'}`} style={{ width: `${w.load}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-token-xs text-text-secondary-alt">{w.load}%</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 mb-token-2 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">Queue Metrics</p>
        <div className="flex flex-col">
          {data.metrics.map((m, i) => (
            <div key={m.key} className={`flex items-center justify-between py-token-1 ${i < data.metrics.length - 1 ? 'border-b border-border-subtle' : ''}`}>
              <span className="text-token-sm text-text-secondary-alt">{m.label}</span>
              <span className="font-mono text-token-xs text-text-primary-alt">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseHealthCard({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Database Health" subtitle={data.subtitle} />
      <div className="flex flex-col px-token-5 pb-token-4 pt-token-1">
        {data.instances.map((db, i) => (
          <div key={db.id} className={`py-token-3 ${i < data.instances.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <div className="flex items-center gap-token-2">
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-success" aria-hidden="true" />
              <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{db.name}</p>
            </div>
            <div className="mt-token-2 flex flex-col gap-0.5">
              {[
                ['Connections', db.connections],
                ['Query Latency', db.queryLatency],
                ['Storage', db.storage],
                ['Slow Queries', db.slowQueries],
                ['Backup', db.backup],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-border-subtle py-token-1 last:border-b-0">
                  <span className="text-token-sm text-text-secondary-alt">{label}</span>
                  <span className="font-mono text-token-xs text-text-primary-alt">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiPerformanceCard({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="API Performance" subtitle={data.subtitle} />
      <div className="flex flex-col px-token-5 pb-token-4 pt-token-1">
        <div className="grid grid-cols-3 gap-token-3 py-token-2">
          <div>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Availability</p>
            <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-success">{data.availability}</p>
          </div>
          <div>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Avg Response</p>
            <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.avgResponse}</p>
          </div>
          <div>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Req / min</p>
            <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.reqPerMin}</p>
          </div>
        </div>
        <p className="m-0 mb-token-1 mt-token-3 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">Endpoints</p>
        <div className="flex flex-col">
          {data.endpoints.map((ep) => (
            <div key={ep.path} className="flex items-center gap-token-3 py-token-1">
              <span className="min-w-0 flex-1 truncate font-mono text-token-xs text-text-secondary-alt">{ep.path}</span>
              <span className="w-9 shrink-0 text-right font-mono text-token-xs text-text-faint">{ep.reqPerMin}</span>
              <span className="w-11 shrink-0 text-right font-mono text-token-xs text-text-secondary-alt">{ep.latency}</span>
              <span className={`w-10 shrink-0 text-right font-mono text-token-xs ${ep.danger ? 'text-danger' : ep.warn ? 'text-warning' : 'text-text-faint'}`}>{ep.errorRate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function healthBarTone(health, healthTone) {
  if (healthTone === 'danger') return 'bg-danger';
  if (health >= 99.5) return 'bg-success';
  return 'bg-warning';
}

function InfrastructureComponentsTable({ table }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (categoryFilter === 'healthy' && row.status !== 'Healthy') return false;
      if (categoryFilter === 'warning' && row.status !== 'Warning') return false;
      if (!['all', 'healthy', 'warning'].includes(categoryFilter) && row.category.toLowerCase() !== categoryFilter) return false;
      if (!q) return true;
      return row.name.toLowerCase().includes(q) || row.category.toLowerCase().includes(q);
    });
  }, [table.rows, search, categoryFilter]);

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
    setSelected((prev) => (prev.size === pageRows.length ? new Set() : new Set(pageRows.map((r) => r.id))));
  }

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateCategoryFilter(key) {
    setCategoryFilter(key);
    setPage(1);
    setSelected(new Set());
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Infrastructure Components</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{table.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-token-2">
          <button
            type="button"
            className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled
            title="Column customization is not yet available."
          >
            <img src={iconColumns} alt="" className="block h-3.5 w-3.5" />
            Columns
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled
            title="Advanced filtering is not yet available beyond the category tabs below."
          >
            <img src={iconFilter} alt="" className="block h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search components, services, workers</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search components, services, workers…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap gap-token-1" role="group" aria-label="Filter by category">
          {table.categoryFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => updateCategoryFilter(f.key)}
              aria-pressed={categoryFilter === f.key}
              className={`flex items-center gap-token-1 rounded-full px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                categoryFilter === f.key ? 'bg-shell-accent-wash text-primary' : 'text-text-secondary-alt hover:bg-surface-hover'
              }`}
            >
              {f.dot && <span className={`h-1.5 w-1.5 rounded-full ${f.dot === 'success' ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />}
              {f.label}
              <span className="font-mono text-token-xs text-text-faint">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">{selected.size} component{selected.size === 1 ? '' : 's'} selected</p>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk acknowledge requires MOD-009's system health endpoint (still PLANNED)."
          >
            Acknowledge
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk restart requires MOD-009's system health endpoint (still PLANNED)."
          >
            Restart
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No infrastructure components match your search or filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3">
                  <input
                    type="checkbox"
                    aria-label="Select all infrastructure components on this page"
                    checked={pageRows.length > 0 && selected.size === pageRows.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                </th>
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  <span className="inline-flex items-center gap-token-1">
                    Component
                    <img src={iconSortUp} alt="" className="block h-2 w-2" />
                  </span>
                </th>
                {['Category', 'Status', 'Availability', 'Health', 'Response', 'Uptime', 'Heartbeat', 'Env'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
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
                  <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.name}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="rounded-full bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold text-text-secondary-alt">{row.category}</span>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.availability}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="flex items-center gap-token-2">
                      <span className="h-1 w-11 rounded-full bg-surface-hover">
                        <span className={`block h-1 rounded-full ${healthBarTone(row.health, row.healthTone)}`} style={{ width: `${Math.min(row.health, 100)}%` }} />
                      </span>
                      <span className={`font-mono text-token-xs font-bold ${row.healthTone === 'danger' ? 'text-danger' : 'text-text-primary-alt'}`}>{row.health}%</span>
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.response}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.uptime}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.heartbeat}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="rounded-full bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase text-text-secondary-alt">{row.env}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {(clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {filtered.length} components
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

function SystemHealthSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-16 animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="grid grid-cols-1 gap-token-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-md bg-surface-hover" />
        <div className="h-80 animate-pulse rounded-md bg-surface-hover" />
        <div className="h-80 animate-pulse rounded-md bg-surface-hover" />
      </div>
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
