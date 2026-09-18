import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineOverview } from '../hooks/usePipelineOverview';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconPlus from '../../../assets/icons/pipeline-overview/icon-plus.svg';
import iconImport from '../../../assets/icons/pipeline-overview/icon-import.svg';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconRefresh from '../../../assets/icons/pipeline-overview/icon-refresh.svg';
import iconPipeline from '../../../assets/icons/pipeline-overview/icon-pipeline.svg';
import iconWave from '../../../assets/icons/pipeline-overview/icon-wave.svg';
import iconTriangle from '../../../assets/icons/pipeline-overview/icon-triangle.svg';
import iconCircleCheck from '../../../assets/icons/pipeline-overview/icon-circle-check.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconPlay from '../../../assets/icons/pipeline-overview/icon-play.svg';
import iconDatabase from '../../../assets/icons/pipeline-overview/icon-database.svg';
import iconShield from '../../../assets/icons/pipeline-overview/icon-shield.svg';
import iconX from '../../../assets/icons/pipeline-overview/icon-x.svg';
import iconGearSm from '../../../assets/icons/pipeline-overview/icon-gear-sm.svg';
import iconColumns from '../../../assets/icons/pipeline-overview/icon-columns.svg';
import iconFilter from '../../../assets/icons/pipeline-overview/icon-filter.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconPlay2 from '../../../assets/icons/pipeline-overview/icon-play2.svg';
import iconAlertTriangle from '../../../assets/icons/icon-alert-triangle.svg';

const DATE_RANGES = ['Today', '7d', '30d'];
const PAGE_SIZE = 5;

const KPI_ICON = {
  pipeline: iconPipeline,
  wave: iconWave,
  triangle: iconTriangle,
  'circle-check': iconCircleCheck,
  clock: iconClock,
  play: iconPlay,
  database: iconDatabase,
  shield: iconShield,
};

const KPI_TONE = {
  primary: { value: 'text-primary', bar: 'bg-primary', iconWrap: 'bg-shell-accent-wash' },
  danger: { value: 'text-danger', bar: 'bg-danger', iconWrap: 'bg-danger-bg' },
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning', iconWrap: 'bg-warning-bg' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-surface-muted' },
};

const TREND_TONE = {
  up: 'bg-success-bg text-success-strong',
  down: 'bg-danger-bg text-danger-strong',
  flat: 'bg-surface-muted text-text-secondary-alt',
};

const HEALTH_DOT_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  failed: 'bg-danger',
  paused: 'bg-text-faint',
  disabled: 'bg-border',
};

const HEALTH_BAR_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  failed: 'bg-danger',
  paused: 'bg-text-faint',
  disabled: 'bg-border',
};

const ALERT_SEVERITY = {
  critical: { icon: iconX, iconWrap: 'bg-danger-bg', badge: 'bg-danger-bg text-danger', label: 'Critical' },
  warning: { icon: iconAlertTriangle, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning', label: 'Warning' },
  info: { icon: iconGearSm, iconWrap: 'bg-surface-muted', badge: 'bg-shell-accent-wash text-primary', label: 'Info' },
};

const RUN_STATUS_DOT = {
  running: 'bg-primary',
  scheduled: 'bg-text-faint',
  manual: 'bg-text-faint',
};

const TABLE_STATUS = {
  running: { label: 'Running', dot: 'bg-primary', text: 'text-primary' },
  failed: { label: 'Failed', dot: 'bg-danger', text: 'text-danger' },
  warning: { label: 'Warning', dot: 'bg-warning', text: 'text-warning' },
  paused: { label: 'Paused', dot: 'bg-text-faint', text: 'text-text-secondary-alt' },
  scheduled: { label: 'Scheduled', dot: 'bg-border', text: 'text-text-secondary-alt' },
};

/** SCR-015 — Pipeline Overview Dashboard Screen. Node 49:1793, Figma page "Page 1". */
export default function PipelineOverviewScreen() {
  const [dateRange, setDateRange] = useState('Today');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = usePipelineOverview(dateRange);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-pipeline-overview-${dateRange.toLowerCase()}`);
    showToast('Pipeline overview telemetry exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Overview']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Pipeline Overview</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-008 has no backend deployed yet — showing sample data, not live metrics."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Monitor health, execution status, performance, and operational metrics of all ETL pipelines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <Link
              to="/pipelines/new"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconPlus} alt="" className="block h-3 w-3" />
              Create Pipeline
            </Link>
            <button
              type="button"
              onClick={() => showToast('Import pipeline definitions dialog opened')}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconImport} alt="" className="block h-3.5 w-3.5" />
              Import
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Pipeline Overview JSON Report"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export
            </button>
            <div className="flex gap-0.5 rounded-md border border-border bg-surface-muted p-0.5">
              {DATE_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  aria-pressed={dateRange === range}
                  className={`rounded-sm px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    dateRange === range
                      ? 'bg-surface-card font-semibold text-text-primary-alt shadow-sm'
                      : 'text-text-secondary-alt hover:text-text-primary-alt'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label={isFetching ? 'Refreshing' : 'Refresh'}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Refresh"
            >
              <img src={iconRefresh} alt="" className={`block h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading pipeline overview'
            : isError
              ? 'Couldn’t load pipeline overview data'
              : isFetching
                ? 'Refreshing pipeline overview'
                : data
                  ? 'Pipeline overview updated'
                  : ''}
        </span>

        {isLoading && <PipelineOverviewSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the pipeline overview</p>
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
            <SummaryStrip items={data.summary} />
            <KpiGrid kpis={data.kpis} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <PipelineHealthCard health={data.pipelineHealth} />
              <AlertsCard alerts={data.alerts} />
            </div>

            <ActivePipelinesTable pipelines={data.activePipelines} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <ExecutionVolumeCard data={data.executionVolume24h} />
              <SuccessRateTrendCard data={data.successRateTrend7d} />
            </div>

            <AllPipelinesTable table={data.pipelinesTable} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function ScreenFooter({ data, isFetching }) {
  const criticalAlerts = data.alerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.executionVolume24h.stats.totalToday} executions today</span>
        <FooterDivider />
        <span className={criticalAlerts > 0 ? 'font-semibold text-danger' : ''}>
          {criticalAlerts} critical alert{criticalAlerts === 1 ? '' : 's'}
        </span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-008 has no backend deployed yet — showing sample data, not live metrics.">
          Sample data
        </span>
      )}
    </div>
  );
}

function FooterDivider() {
  return <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />;
}

function SummaryStrip({ items }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm sm:flex">
      {items.map((item, i) => (
        <div
          key={item.key}
          className={`flex flex-col items-center justify-center gap-token-1 border-b border-border-subtle px-token-4 py-token-4 sm:flex-1 sm:border-b-0 ${
            i < items.length - 1 ? 'sm:border-r sm:border-border-subtle' : ''
          } ${i % 2 === 0 ? 'border-r border-border-subtle sm:border-r-0' : ''}`}
        >
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{item.label}</p>
          <p className="m-0 text-token-xl font-extrabold tracking-[-0.03em] text-text-primary-alt">{item.value}</p>
          <p className="m-0 text-token-meta text-text-faint">{item.helper}</p>
        </div>
      ))}
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
            <p className={`m-0 mt-token-2 text-token-xl font-extrabold tracking-[-0.03em] ${tone.value}`}>{kpi.value}</p>
            <span className={`mt-token-2 inline-flex rounded-sm px-token-3 py-0.5 text-token-meta font-semibold ${TREND_TONE[kpi.trendTone]}`}>
              {kpi.trend}
            </span>
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

function CardHeader({ title, subtitle, linkLabel, linkHref }) {
  const targetHref =
    linkHref ||
    (linkLabel?.toLowerCase().includes('execution')
      ? '/dashboard/executions'
      : '/pipelines');

  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
      <div>
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">{subtitle}</p>
      </div>
      {linkLabel && (
        <Link
          to={targetHref}
          className="whitespace-nowrap text-token-sm font-medium text-primary hover:underline transition"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function PipelineHealthCard({ health }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Pipeline Health" subtitle={`${health.total} total · status breakdown`} linkLabel="View all" />
      <div className="flex flex-col">
        {health.breakdown.map((row) => (
          <div key={row.key} className="flex items-center gap-token-3 px-token-5 py-token-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT_TONE[row.key]}`} aria-hidden="true" />
            <span className="w-16 shrink-0 text-token-sm text-text-secondary-alt">{row.label}</span>
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className={`h-1.5 rounded-full ${HEALTH_BAR_TONE[row.key]}`} style={{ width: `${row.percent}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right font-mono text-token-xs text-text-secondary-alt">{row.count}</span>
            <span className="w-9 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.percent}%</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 border-t border-border-subtle">
        <div className="px-token-5 py-token-4">
          <p className="m-0 text-token-sm text-text-faint">Healthy trend</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold text-success">{health.healthyTrend}</p>
        </div>
        <div className="border-l border-border-subtle px-token-5 py-token-4">
          <p className="m-0 text-token-sm text-text-faint">Avg uptime</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold text-text-primary-alt">{health.avgUptime}</p>
        </div>
      </div>
    </div>
  );
}

function AlertsCard({ alerts }) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="min-w-0 flex-[1.8] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Operational Alerts" subtitle="Sorted by severity · actionable only" linkLabel="View all" />
      {alerts.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">No active alerts.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {alerts.map((alert, i) => {
            const severity = ALERT_SEVERITY[alert.severity];
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
      <p className="sr-only">{criticalCount} critical alerts</p>
    </div>
  );
}

function ActivePipelinesTable({ pipelines }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Active Pipelines" subtitle={`${pipelines.length} currently running`} linkLabel="View all running" />
      {pipelines.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">No pipelines are currently running.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Pipeline', 'Progress', 'Stage', 'Runtime', 'Trigger', 'Worker', ''].map((col) => (
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
              {pipelines.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-5 py-token-3">
                    <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{p.name}</p>
                    <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{p.route}</p>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <div className="flex items-center gap-token-2">
                      <div className="h-1 w-24 rounded-full bg-surface-hover">
                        <div className="h-1 rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="font-mono text-token-xs text-text-secondary-alt">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{p.stage}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{p.runtime}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
                      <span className={`h-1.5 w-1.5 rounded-full ${RUN_STATUS_DOT[p.trigger.toLowerCase()] ?? 'bg-border'}`} aria-hidden="true" />
                      {p.trigger}
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{p.worker}</td>
                  <td className="px-token-5 py-token-3 text-right">
                    <button
                      type="button"
                      className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                      disabled
                      title="Pipeline detail view requires MOD-008's builder (still PLANNED)."
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const CHART_HEIGHT = 140;
const CHART_WIDTH = 640;

function chartPoints(values, min, max) {
  const range = max - min || 1;
  const stepX = CHART_WIDTH / Math.max(values.length - 1, 1);
  return values.map((v, i) => {
    const x = i * stepX;
    const y = CHART_HEIGHT - ((v - min) / range) * CHART_HEIGHT;
    return [x, y];
  });
}

function linePath(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** Real chart data rendered as inline SVG — no charting library is a
 * project dependency yet (agent-rules.md §4), and Figma's own chart
 * regions (e.g. node 49:3307) are hand-drawn static vector art with
 * no live-render contract — same precedent as ExecutiveDashboardScreen's
 * SlaTrendChart/ExecutionVolumeChart. */
function ExecutionVolumeChart({ series }) {
  const max = Math.max(...series.map((d) => d.successful + d.failed));
  const barWidth = CHART_WIDTH / series.length;
  const tickIndices = [0, 6, 12, 18];
  return (
    <div>
      <div className="mb-token-3 flex justify-end gap-token-4">
        <Legend swatchClass="bg-primary" label="Successful" />
        <Legend swatchClass="bg-danger" label="Failed" />
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-36 w-full" role="img" aria-label="Hourly execution volume over the last 24 hours, successful vs failed">
        {series.map((d, i) => {
          const total = d.successful + d.failed;
          const totalHeight = (total / max) * CHART_HEIGHT;
          const failedHeight = (d.failed / max) * CHART_HEIGHT;
          const successHeight = totalHeight - failedHeight;
          const x = i * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          return (
            <g key={d.label}>
              <rect x={x} y={CHART_HEIGHT - totalHeight} width={w} height={successHeight} fill="#0f5699" />
              <rect x={x} y={CHART_HEIGHT - failedHeight} width={w} height={failedHeight} fill="#dc2626" />
            </g>
          );
        })}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        {tickIndices.map((i) => <span key={series[i].label}>{series[i].label}</span>)}
      </div>
    </div>
  );
}

function SuccessRateChart({ series }) {
  const values = series.map((p) => p.rate);
  const min = Math.min(...values) - 0.5;
  const max = 100;
  const points = chartPoints(values, min, max);
  return (
    <div>
      <div className="mb-token-3 flex justify-end">
        <Legend swatchClass="bg-primary" label="Success %" />
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-36 w-full" role="img" aria-label="Daily pipeline success rate over the last 7 days">
        <path d={linePath(points)} fill="none" stroke="#0f5699" strokeWidth="2" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="#0f5699" />
        ))}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        {series.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

function Legend({ swatchClass, label }) {
  return (
    <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
      <span className={`h-2 w-2 rounded-sm ${swatchClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function ExecutionVolumeCard({ data }) {
  return (
    <div className="min-w-0 flex-[1.8] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Execution Volume" subtitle={data.subtitle} linkLabel="View executions" />
      <div className="px-token-5 py-token-5">
        <ExecutionVolumeChart series={data.series} />
      </div>
      <div className="grid grid-cols-2 border-t border-border-subtle sm:grid-cols-4">
        {[
          { label: 'Total today', value: data.stats.totalToday, tone: 'text-text-primary-alt' },
          { label: 'Successful', value: data.stats.successful, tone: 'text-success' },
          { label: 'Failed', value: data.stats.failed, tone: 'text-danger' },
          { label: 'Peak hour', value: data.stats.peakHour, tone: 'text-text-primary-alt' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`border-b border-border-subtle px-token-5 py-token-4 sm:border-b-0 ${
              i % 2 === 0 ? 'border-r border-border-subtle sm:border-r-0' : ''
            } ${i < 3 ? 'sm:border-r sm:border-border-subtle' : ''}`}
          >
            <p className="m-0 text-token-sm text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessRateTrendCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Success Rate Trend" subtitle={data.subtitle} />
      <div className="px-token-5 py-token-5">
        <p className="m-0 mb-token-2 text-token-sm text-text-secondary-alt">Daily pipeline success rate</p>
        <SuccessRateChart series={data.series} />
      </div>
      <div className="grid grid-cols-2 border-t border-border-subtle">
        <div className="px-token-5 py-token-4">
          <p className="m-0 text-token-sm text-text-faint">7-day avg</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold text-text-primary-alt">{data.stats.avg7d}</p>
        </div>
        <div className="border-l border-border-subtle px-token-5 py-token-4">
          <p className="m-0 text-token-sm text-text-faint">Best day</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold text-success">{data.stats.bestDay}</p>
        </div>
      </div>
    </div>
  );
}

function AllPipelinesTable({ table }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q) ||
        row.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [table.rows, search, statusFilter]);

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

  function updateStatusFilter(key) {
    setStatusFilter(key);
    setPage(1);
    setSelected(new Set());
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">All Pipelines</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{table.totalCount} pipelines · sorted by last run</p>
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
            title="Advanced filtering is not yet available beyond the status tabs below."
          >
            <img src={iconFilter} alt="" className="block h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search pipelines, owners, tags</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search pipelines, owners, tags…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap gap-token-1" role="group" aria-label="Filter by status">
          {table.statusFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => updateStatusFilter(f.key)}
              aria-pressed={statusFilter === f.key}
              className={`flex items-center gap-token-1 rounded-full px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                statusFilter === f.key ? 'bg-shell-accent-wash text-primary' : 'text-text-secondary-alt hover:bg-surface-hover'
              }`}
            >
              {f.label}
              <span className="font-mono text-token-xs text-text-faint">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">{selected.size} pipeline{selected.size === 1 ? '' : 's'} selected</p>
          <button
            type="button"
            className="flex h-7 items-center gap-token-1 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk run requires MOD-008's execution endpoint (still PLANNED)."
          >
            <img src={iconPlay2} alt="" className="block h-2.5 w-2.5" />
            Run Now
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk pause requires MOD-008's execution endpoint (still PLANNED)."
          >
            Pause
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk clone requires MOD-008's builder (still PLANNED)."
          >
            Clone
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk disable requires MOD-008's execution endpoint (still PLANNED)."
          >
            Disable
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No pipelines match your search or filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3">
                  <input
                    type="checkbox"
                    aria-label="Select all pipelines on this page"
                    checked={pageRows.length > 0 && selected.size === pageRows.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                </th>
                {['Pipeline', 'Status', 'Owner', 'Schedule', 'Last Run', 'Next Run', 'Runtime', 'Success Rate', 'Tags', ''].map((col) => (
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
                const status = TABLE_STATUS[row.status];
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
                      <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{row.name}</p>
                      <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{row.route}</p>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className={`flex items-center gap-token-2 text-token-sm font-medium ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <span className="flex items-center gap-token-2">
                        <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-xs font-semibold text-primary">
                          {row.ownerInitials}
                        </span>
                        <span className="text-token-sm text-text-secondary-alt">{row.owner}</span>
                      </span>
                    </td>
                    <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.schedule}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.lastRun}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.nextRun}</td>
                    <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.runtime}</td>
                    <td className="px-token-5 py-token-3">
                      <div className="flex items-center gap-token-2">
                        <div className="h-1 w-11 rounded-full bg-surface-hover">
                          <div className="h-1 rounded-full bg-primary" style={{ width: `${row.successRate}%` }} />
                        </div>
                        <span className="font-mono text-token-xs text-text-secondary-alt">{row.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-token-5 py-token-3">
                      <div className="flex flex-wrap gap-token-1">
                        {row.tags.map((tag) => (
                          <span key={tag} className="rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs text-text-secondary-alt">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-token-5 py-token-3 text-right">
                      <button
                        type="button"
                        className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
                        disabled
                        title="Pipeline detail view requires MOD-008's builder (still PLANNED)."
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
          Showing {(clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {filtered.length}
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

function PipelineOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-20 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-[1.8]" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-[1.8]" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
