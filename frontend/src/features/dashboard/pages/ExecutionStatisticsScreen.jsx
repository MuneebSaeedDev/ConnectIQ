import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useExecutionStatistics } from '../hooks/useExecutionStatistics';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconPlus from '../../../assets/icons/pipeline-overview/icon-plus.svg';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconChevronLeft from '../../../assets/icons/system-health/icon-chevron-left.svg';
import iconChevronRight from '../../../assets/icons/system-health/icon-chevron-right.svg';
import iconTriangle from '../../../assets/icons/pipeline-overview/icon-triangle.svg';
import iconShield from '../../../assets/icons/system-health/icon-shield.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconTrendUp from '../../../assets/icons/executive-dashboard/icon-trend-up.svg';
import iconRefresh from '../../../assets/icons/icon-refresh.svg';
import iconCircleCheck from '../../../assets/icons/system-health/icon-circle-check.svg';
import iconWave from '../../../assets/icons/system-health/icon-wave.svg';
import iconActivity from '../../../assets/icons/system-health/icon-activity.svg';
import iconPipeline from '../../../assets/icons/pipeline-overview/icon-pipeline.svg';
import iconCheckSquare from '../../../assets/icons/data-quality/icon-check-square.svg';
import iconBarChart from '../../../assets/icons/data-quality/icon-bar-chart2.svg';
import iconServer from '../../../assets/icons/system-health/icon-server.svg';

const RANGES = ['7d', '30d', '90d', '1y'];
const PAGE_SIZE = 10;

/** Node 84:5098 was inspected via Figma MCP this session — icons are
 * reused from the shared glyph set (no per-node export needed for this
 * screen's monochrome KPI icons). See executionStatistics.api.js. */
const KPI_ICON = {
  triangle: iconTriangle,
  shield: iconShield,
  clock: iconClock,
  'trend-up': iconTrendUp,
  refresh: iconRefresh,
  'circle-check': iconCircleCheck,
  wave: iconWave,
  activity: iconActivity,
  pipeline: iconPipeline,
  'check-square': iconCheckSquare,
  'bar-chart': iconBarChart,
  server: iconServer,
};

const KPI_TONE = {
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-shell-accent-wash' },
};

const TREND_TONE = {
  up: 'text-success-strong',
  down: 'text-danger-strong',
  flat: 'text-text-secondary-alt',
};

const SUMMARY_TONE = {
  success: 'text-success',
  danger: 'text-danger',
  default: 'text-text-primary-alt',
};

const OUTCOME_TONE = {
  success: 'bg-success',
  danger: 'bg-danger',
  info: 'bg-primary',
  warning: 'bg-warning',
  neutral: 'bg-text-faint',
  purple: 'bg-shell-accent',
};

const ENV_TONE = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const SEVERITY_BADGE = {
  critical: 'bg-danger-bg text-danger',
  high: 'bg-danger-bg text-danger-strong',
  medium: 'bg-warning-bg text-warning',
  low: 'bg-success-bg text-success-strong',
};

const INSIGHT_TONE = {
  success: { icon: iconTrendUp, iconWrap: 'bg-success-bg', badge: 'bg-success-bg text-success-strong' },
  info: { icon: iconActivity, iconWrap: 'bg-shell-accent-wash', badge: 'bg-shell-accent-wash text-primary' },
  warning: { icon: iconTriangle, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning' },
  purple: { icon: iconTrendUp, iconWrap: 'bg-shell-accent-wash', badge: 'bg-shell-accent-wash text-primary' },
};

const STATUS_BADGE = {
  Success: { dot: 'bg-success', bg: 'bg-success-bg border-success-border', text: 'text-success' },
  Failed: { dot: 'bg-danger', bg: 'bg-danger-bg border-danger-border', text: 'text-danger' },
  Running: { dot: 'bg-primary', bg: 'bg-shell-accent-wash border-primary', text: 'text-primary' },
  Queued: { dot: 'bg-warning', bg: 'bg-warning-bg border-warning-border', text: 'text-warning' },
  Cancelled: { dot: 'bg-text-faint', bg: 'bg-surface-muted border-border', text: 'text-text-secondary-alt' },
};

/** SCR-020 — Execution Statistics Dashboard Screen. Node 84:5098,
 * Figma page "Page 1". MOD-009 Analytics/Monitoring; built against the
 * inspected Figma frame + the sibling dashboard pattern of record. */
export default function ExecutionStatisticsScreen() {
  const [range, setRange] = useState('7d');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useExecutionStatistics(range);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-execution-statistics-${range}`);
    showToast('Execution statistics report exported as JSON');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Executions']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Execution Statistics Dashboard</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-006/MOD-009 have no backend deployed yet — showing sample data, not live execution telemetry."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Execution telemetry across all pipelines, environments, and triggers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <Link
              to="/dashboard/performance"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconPlus} alt="" className="block h-3.5 w-3.5" />
              Generate Report
            </Link>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Execution Statistics Report"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export
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
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconRefreshCw} alt="" className={`block h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading execution statistics dashboard'
            : isError
              ? 'Couldn’t load execution statistics dashboard data'
              : isFetching
                ? 'Refreshing execution statistics dashboard'
                : data
                  ? 'Execution statistics dashboard updated'
                  : ''}
        </span>

        {isLoading && <ExecutionStatsSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the execution statistics dashboard</p>
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
            <HeadlineBanner headline={data.headline} />

            <KpiGrid kpis={data.kpis} />

            <SummaryStrip summary={data.summary} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <VolumeTrendCard data={data.volumeTrend} />
              <OutcomeBreakdownCard data={data.outcomeBreakdown} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <RuntimePerformanceCard data={data.runtimePerformance} />
              <EnvironmentStatsCard data={data.environmentStats} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <RankedListCard title="Most Executed Pipelines" data={data.mostExecuted} variant="runs" />
              <RankedListCard title="Highest Failure Rate" data={data.highestFailure} variant="failure" />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <ScheduleAnalyticsCard data={data.scheduleAnalytics} />
              <InsightsCard data={data.insights} />
            </div>

            <ExecutionsTable table={data.executions} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function HeadlineBanner({ headline }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-success-border bg-success-bg px-token-5 py-token-3">
      <div className="flex flex-wrap items-center gap-token-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
        <span className="text-token-sm font-semibold text-success-strong">{headline.growth} · {headline.successRate}</span>
        <span className="font-mono text-token-xs text-text-secondary-alt">{headline.context}</span>
      </div>
      <div className="font-mono text-token-xs text-text-secondary-alt">
        <span className="font-semibold text-success">Successful: {headline.successful}</span>
        <span className="mx-token-2" aria-hidden="true">·</span>
        <span className="font-semibold text-danger">Failed: {headline.failed}</span>
        <span className="mx-token-2" aria-hidden="true">·</span>
        <span className="font-semibold text-warning">At-Risk Now: {headline.atRisk}</span>
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

function SummaryStrip({ summary }) {
  return (
    <div className="flex flex-wrap items-center gap-token-6 rounded-md border border-border bg-surface-card px-token-5 py-token-4 shadow-sm">
      <div className="flex items-center gap-token-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
        <div>
          <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{summary.growthLabel}</p>
          <p className="m-0 font-mono text-token-meta text-text-faint">{summary.context}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-token-6">
        {summary.stats.map((stat) => (
          <div key={stat.key} className="text-right">
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-0.5 text-token-base font-extrabold tracking-[-0.02em] ${SUMMARY_TONE[stat.tone] ?? SUMMARY_TONE.default}`}>{stat.value}</p>
          </div>
        ))}
      </div>
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

const TREND_W = 560;
const TREND_H = 120;

function trendPath(values, max) {
  const stepX = TREND_W / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(TREND_H - (v / max) * TREND_H).toFixed(1)}`)
    .join(' ');
}

/** Inline SVG chart — no charting library is a project dependency yet
 * (agent-rules.md §4), same precedent as the sibling MOD-009 screens.
 * Both series share the real 0–axisMax scale (Failed rides low, which
 * is truthful); the Failed line is drawn at a fixed floor thickness so
 * it stays visible without being rescaled onto an invented axis. */
function VolumeTrendCard({ data }) {
  const successMax = data.axisMax;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Execution Volume Trend" subtitle={data.subtitle} linkLabel="View details" linkTitle="Detailed trend view requires MOD-009's Reports module (still PLANNED)." />
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-center gap-token-4 text-token-sm text-text-secondary-alt">
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden="true" />
            Successful
          </span>
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-danger" aria-hidden="true" />
            Failed
          </span>
        </div>
        <div className="flex gap-token-3">
          <div className="flex w-8 flex-col justify-between py-1 text-right font-mono text-token-xs text-text-faint" aria-hidden="true">
            <span>{successMax}</span>
            <span>{Math.round(successMax * 0.75)}</span>
            <span>{Math.round(successMax * 0.5)}</span>
            <span>{Math.round(successMax * 0.25)}</span>
            <span>0</span>
          </div>
          <svg viewBox={`0 0 ${TREND_W} ${TREND_H}`} className="h-32 w-full" role="img" aria-label={`Daily executions over the last 30 days. Successful peaks near ${Math.max(...data.successful).toLocaleString()} per day; failed stays below ${Math.max(...data.failed)} per day.`}>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" y1={TREND_H * g} x2={TREND_W} y2={TREND_H * g} stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            ))}
            <path d={trendPath(data.successful, successMax)} fill="none" stroke="#0f5699" strokeWidth="2" />
            <path d={trendPath(data.failed, successMax)} fill="none" stroke="#dc2626" strokeWidth="2" />
          </svg>
        </div>
        <div className="ml-11 mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
          {data.ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutcomeBreakdownCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Success vs Failure Analysis" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col gap-token-4 p-token-5">
        {data.rows.map((row) => (
          <li key={row.key}>
            <div className="mb-token-1 flex items-center justify-between text-token-sm">
              <span className="flex items-center gap-token-2 text-text-secondary-alt">
                <span className={`h-2.5 w-2.5 rounded-sm ${OUTCOME_TONE[row.tone] ?? OUTCOME_TONE.neutral}`} aria-hidden="true" />
                {row.label}
              </span>
              <span className="flex items-center gap-token-3">
                <span className="font-mono font-semibold text-text-primary-alt">{row.value}</span>
                <span className="w-14 text-right font-mono text-token-xs text-text-faint">{row.pct}%</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-hover">
              <div className={`h-1.5 rounded-full ${OUTCOME_TONE[row.tone] ?? OUTCOME_TONE.neutral}`} style={{ width: `${Math.max(row.pct, 0.5)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RuntimePerformanceCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Runtime Performance" subtitle={data.subtitle} />
      <div className="grid grid-cols-3 border-b border-border-subtle">
        {[['Average', data.average], ['Median', data.median], ['Longest', data.longest]].map(([label, value], i) => (
          <div key={label} className={`px-token-5 py-token-4 ${i < 2 ? 'border-r border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{label}</p>
            <p className={`m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] ${label === 'Longest' ? 'text-danger' : 'text-text-primary-alt'}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-token-3 px-token-5 py-token-4">
        {data.percentiles.map((p) => (
          <div key={p.key} className="flex items-center gap-token-3">
            <span className="w-8 shrink-0 font-mono text-token-xs font-semibold text-text-secondary-alt">{p.label}</span>
            <div className="h-3 flex-1 rounded-sm bg-surface-hover">
              <div className={`h-3 rounded-sm ${p.tone === 'danger' ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min((p.value / data.axisMax) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
        <div className="ml-11 flex justify-between font-mono text-token-xs text-text-faint" aria-hidden="true">
          {data.axisTicks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnvironmentStatsCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Environment Statistics" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col gap-token-4 p-token-5">
        {data.rows.map((row) => (
          <li key={row.key}>
            <div className="mb-token-1 flex items-center justify-between text-token-sm">
              <span className="font-medium text-text-primary-alt">{row.label}</span>
              <span className="font-mono font-semibold text-text-primary-alt">{row.pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-hover">
              <div className={`h-1.5 rounded-full ${ENV_TONE[row.tone] ?? ENV_TONE.success}`} style={{ width: `${Math.max(row.pct, 0)}%` }} />
            </div>
            <p className="m-0 mt-token-1 font-mono text-token-xs text-text-faint">{row.total}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankedListCard({ title, data, variant }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title={title} subtitle={data.subtitle} linkLabel="View all" linkTitle={`${title} detail requires MOD-006's Pipelines module (still PLANNED).`} />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.rank} className={`flex items-center gap-token-3 px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted font-mono text-token-xs font-bold text-text-secondary-alt">{row.rank}</span>
            <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
            {variant === 'runs' ? (
              <>
                <span className="shrink-0 font-mono text-token-xs text-text-faint">{row.runs}</span>
                <span className="w-16 shrink-0 text-right font-mono text-token-xs font-bold text-success">{row.rate}</span>
              </>
            ) : (
              <>
                <span className="shrink-0 font-mono text-token-xs font-bold text-danger">{row.rate}</span>
                <span className={`w-16 shrink-0 rounded-full px-token-2 py-0.5 text-center font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${SEVERITY_BADGE[row.severity] ?? SEVERITY_BADGE.low}`}>{row.severity}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScheduleAnalyticsCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Schedule Analytics" subtitle={data.subtitle} />
      <div className="grid grid-cols-1 gap-token-6 px-token-5 py-token-4 md:grid-cols-2">
        <div>
          <p className="m-0 mb-token-3 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">By Trigger Type</p>
          <div className="flex flex-col gap-token-3">
            {data.triggerTypes.map((t) => (
              <div key={t.key}>
                <div className="mb-token-1 flex items-center justify-between text-token-sm">
                  <span className="text-text-secondary-alt">{t.label}</span>
                  <span className="flex items-center gap-token-2">
                    <span className="font-mono font-semibold text-text-primary-alt">{t.value}</span>
                    <span className="w-12 text-right font-mono text-token-xs text-text-faint">{t.pct}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-hover">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(t.pct, 0.5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 mb-token-3 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">Schedule Reliability</p>
          <div className="flex flex-col gap-token-3">
            {data.reliability.map((r) => (
              <div key={r.key}>
                <div className="mb-token-1 flex items-center justify-between text-token-sm">
                  <span className="flex items-center gap-token-2 text-text-secondary-alt">
                    <span className={`h-1.5 w-1.5 rounded-full ${ENV_TONE[r.tone] ?? ENV_TONE.success}`} aria-hidden="true" />
                    {r.label}
                  </span>
                  <span className="flex items-center gap-token-2">
                    <span className="font-mono font-semibold text-text-primary-alt">{r.value}</span>
                    <span className="w-12 text-right font-mono text-token-xs text-text-faint">{r.pct}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-hover">
                  <div className={`h-1.5 rounded-full ${ENV_TONE[r.tone] ?? ENV_TONE.success}`} style={{ width: `${Math.max(r.pct, 0.5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Recent Execution Insights" subtitle={data.subtitle} linkLabel="View all insights" linkTitle="Full insights feed requires MOD-009's Analytics module (still PLANNED)." />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => {
          const tone = INSIGHT_TONE[row.tone] ?? INSIGHT_TONE.info;
          return (
            <li key={row.id} className={`px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
              <div className="flex items-start gap-token-3">
                <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}>
                  <img src={tone.icon} alt="" className="block h-2.5 w-2.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{row.title}</p>
                  <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{row.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${tone.badge}`}>{row.badge}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.Success;
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-full border px-token-3 py-0.5 font-semibold text-token-xs ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

function ExecutionsTable({ table }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [envFilter, setEnvFilter] = useState('All');
  const [triggerFilter, setTriggerFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (envFilter !== 'All' && row.environment !== envFilter) return false;
      if (triggerFilter !== 'All' && row.trigger !== triggerFilter) return false;
      if (!q) return true;
      return row.id.toLowerCase().includes(q) || row.pipeline.toLowerCase().includes(q);
    });
  }, [table.rows, search, statusFilter, envFilter, triggerFilter]);

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
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Execution Statistics</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{table.subtitle}</p>
        </div>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Export is not yet available — no MOD-009 export endpoint exists."
        >
          <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
          Export table
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search by execution ID or pipeline name</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search by execution ID, pipeline name…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <FilterSelect label="Status" value={statusFilter} options={table.statusFilters} onChange={resetPage(setStatusFilter)} />
        <FilterSelect label="Environment" value={envFilter} options={table.environmentFilters} onChange={resetPage(setEnvFilter)} />
        <FilterSelect label="Trigger" value={triggerFilter} options={table.triggerFilters} onChange={resetPage(setTriggerFilter)} />
      </div>

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No executions match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Execution ID', 'Pipeline', 'Trigger', 'Environment', 'Status', 'Runtime', 'Queue Time', 'Started', 'Worker', 'Data', 'SLA'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-5 py-token-3 font-mono text-token-xs font-semibold text-primary">{row.id}</td>
                  <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.pipeline}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.trigger}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.environment}</td>
                  <td className="px-token-5 py-token-3"><StatusBadge status={row.status} /></td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.runtime}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.queueTime}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.startedAt}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.worker}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.data}</td>
                  <td className="px-token-5 py-token-3">
                    <span className={`inline-flex items-center gap-token-1 font-mono text-token-xs font-bold ${row.sla === 'Breached' ? 'text-danger' : 'text-success'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${row.sla === 'Breached' ? 'bg-danger' : 'bg-success'}`} aria-hidden="true" />
                      {row.sla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {table.total.toLocaleString()} executions
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

function ScreenFooter({ data, isFetching }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-danger">{data.headline.failed} failed this period</span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-warning">{data.headline.atRisk} at-risk now</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-006/MOD-009 have no backend deployed yet — showing sample data, not live execution telemetry.">
          Sample data
        </span>
      )}
    </div>
  );
}

function ExecutionStatsSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
