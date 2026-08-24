import { useMemo, useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useErrorAnalytics } from '../hooks/useErrorAnalytics';
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
import iconServer from '../../../assets/icons/system-health/icon-server.svg';
import iconBarChart from '../../../assets/icons/data-quality/icon-bar-chart2.svg';
import iconAlert from '../../../assets/icons/data-quality/icon-alert-circle.svg';

const RANGES = ['7d', '30d', '90d', '1y'];
const PAGE_SIZE = 8;

/** Node 69:37077 was inspected via Figma MCP this session — icons are
 * reused from the shared glyph set (no per-node export needed for this
 * screen's monochrome KPI icons). See errorAnalytics.api.js. */
const KPI_ICON = {
  alert: iconAlert,
  triangle: iconTriangle,
  wave: iconWave,
  'circle-check': iconCircleCheck,
  activity: iconActivity,
  'bar-chart': iconBarChart,
  shield: iconShield,
  clock: iconClock,
  'trend-up': iconTrendUp,
  refresh: iconRefresh,
  server: iconServer,
};

const KPI_TONE = {
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  danger: { value: 'text-danger', bar: 'bg-danger', iconWrap: 'bg-danger-bg' },
  warning: { value: 'text-warning', bar: 'bg-warning', iconWrap: 'bg-warning-bg' },
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
  warning: 'text-warning',
  default: 'text-text-primary-alt',
};

/** Severity/root-cause bar tones. `warning-strong` renders as the
 * amber-600 danger-strong swatch to distinguish High from Medium; no
 * distinct token exists between warning and danger, matching the Figma
 * ramp (red → orange → amber → blue → grey). */
const BAR_TONE = {
  danger: 'bg-danger',
  'warning-strong': 'bg-danger-strong',
  warning: 'bg-warning',
  info: 'bg-primary',
  primary: 'bg-shell-accent',
  neutral: 'bg-text-faint',
};

const SEVERITY_BADGE = {
  critical: 'bg-danger-bg text-danger',
  Critical: 'bg-danger-bg text-danger',
  high: 'bg-danger-bg text-danger-strong',
  High: 'bg-danger-bg text-danger-strong',
  medium: 'bg-warning-bg text-warning',
  Medium: 'bg-warning-bg text-warning',
  low: 'bg-success-bg text-success-strong',
  Low: 'bg-success-bg text-success-strong',
};

const INCIDENT_STATUS = {
  Investigating: 'bg-shell-accent-wash text-primary',
  Mitigating: 'bg-warning-bg text-warning',
  Escalated: 'bg-danger-bg text-danger',
};

const ERROR_STATUS = {
  Investigating: { dot: 'bg-primary', text: 'text-primary' },
  Escalated: { dot: 'bg-danger', text: 'text-danger' },
  Open: { dot: 'bg-warning', text: 'text-warning' },
  Mitigating: { dot: 'bg-warning', text: 'text-warning' },
  Resolved: { dot: 'bg-success', text: 'text-success' },
};

const DELTA_TONE = {
  up: 'text-danger-strong',
  down: 'text-success-strong',
};

/** SCR-021 — Error Analytics Dashboard Screen. Node 69:37077, Figma
 * page "Page 1". MOD-009 Analytics/Monitoring; built against the
 * inspected Figma frame + the sibling dashboard pattern of record. */
export default function ErrorAnalyticsScreen() {
  const [range, setRange] = useState('7d');
  const { data, isLoading, isError, error, refetch, isFetching } = useErrorAnalytics(range);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Operations', 'Errors']}>
      <div className="flex flex-col gap-token-6">
        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Error Analytics Dashboard</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-008/MOD-009 have no backend deployed yet — showing sample data, not live error telemetry."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Analyze platform failures, error trends, incident patterns, root causes, and operational reliability across the ETL ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md bg-danger px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Creating an incident requires MOD-008's Operations module (still PLANNED)."
            >
              <img src={iconPlus} alt="" className="block h-3.5 w-3.5" />
              Create Incident
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-009 export endpoint exists."
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export Analysis
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
            ? 'Loading error analytics dashboard'
            : isError
              ? 'Couldn’t load error analytics dashboard data'
              : isFetching
                ? 'Refreshing error analytics dashboard'
                : data
                  ? 'Error analytics dashboard updated'
                  : ''}
        </span>

        {isLoading && <ErrorAnalyticsSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the error analytics dashboard</p>
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

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <VolumeTrendCard data={data.volumeTrend} />
              <SeverityBreakdownCard data={data.severityBreakdown} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <RootCauseCard data={data.rootCause} />
              <ReliabilityCard data={data.reliability} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <MostAffectedCard data={data.mostAffected} />
              <ActiveCriticalCard data={data.activeCritical} />
            </div>

            <CategoriesCard data={data.categories} />

            <ErrorsTable table={data.errors} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function HeadlineBanner({ headline }) {
  return (
    <div className="flex flex-col gap-token-3 rounded-md border border-danger-border bg-danger-bg px-token-5 py-token-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-token-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-danger" aria-hidden="true" />
        <span className="text-token-sm font-semibold text-danger-strong">{headline.alert}</span>
        <span className="font-mono text-token-xs text-text-secondary-alt">{headline.context}</span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-token-5 font-mono text-token-xs">
        {headline.stats.map((stat) => (
          <div key={stat.key} className="text-right">
            <p className="m-0 uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-0.5 text-token-base font-extrabold tracking-[-0.02em] ${SUMMARY_TONE[stat.tone] ?? SUMMARY_TONE.default}`}>{stat.value}</p>
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
 * Both series share the real 0–axisMax scale (Critical rides low, which
 * is truthful). */
function VolumeTrendCard({ data }) {
  const max = data.axisMax;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Error Volume Trend" subtitle={data.subtitle} linkLabel="View details" linkTitle="Detailed trend view requires MOD-009's Reports module (still PLANNED)." />
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-center gap-token-4 text-token-sm text-text-secondary-alt">
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-danger" aria-hidden="true" />
            Total Errors
          </span>
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-danger-strong" aria-hidden="true" />
            Critical
          </span>
        </div>
        <div className="flex gap-token-3">
          <div className="flex w-8 flex-col justify-between py-1 text-right font-mono text-token-xs text-text-faint" aria-hidden="true">
            <span>{max}</span>
            <span>{Math.round(max * 0.75)}</span>
            <span>{Math.round(max * 0.5)}</span>
            <span>{Math.round(max * 0.25)}</span>
            <span>0</span>
          </div>
          <svg viewBox={`0 0 ${TREND_W} ${TREND_H}`} className="h-32 w-full" role="img" aria-label={`Daily error counts over the last 28 days. Total errors peak near ${Math.max(...data.total)} per day; critical stays below ${Math.max(...data.critical)} per day.`}>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" y1={TREND_H * g} x2={TREND_W} y2={TREND_H * g} stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            ))}
            <path d={trendPath(data.total, max)} fill="none" stroke="#dc2626" strokeWidth="2" />
            <path d={trendPath(data.critical, max)} fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 3" />
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

function SeverityBreakdownCard({ data }) {
  const max = Math.max(...data.rows.map((r) => r.count), 1);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Severity Breakdown" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col gap-token-4 p-token-5">
        {data.rows.map((row) => (
          <li key={row.key} className="flex items-center gap-token-3">
            <span className="flex w-16 shrink-0 items-center gap-token-2 text-token-sm text-text-secondary-alt">
              <span className={`h-2.5 w-2.5 rounded-sm ${BAR_TONE[row.tone] ?? BAR_TONE.neutral}`} aria-hidden="true" />
              {row.label}
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-token-sm font-semibold text-text-primary-alt">{row.count}</span>
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className={`h-1.5 rounded-full ${BAR_TONE[row.tone] ?? BAR_TONE.neutral}`} style={{ width: `${Math.max((row.count / max) * 100, 2)}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.pct}%</span>
            <span className="w-14 shrink-0 text-right font-mono text-token-xs font-semibold text-success">{row.recovery}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RootCauseCard({ data }) {
  const max = Math.max(...data.rows.map((r) => r.count), 1);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Root Cause Analysis" subtitle={data.subtitle} linkLabel="View diagnostics" linkTitle="Diagnostics require MOD-008's Operations module (still PLANNED)." />
      <ul className="m-0 flex list-none flex-col gap-token-3 p-token-5">
        {data.rows.map((row) => (
          <li key={row.key} className="flex items-center gap-token-3">
            <span className="w-32 shrink-0 truncate text-token-sm text-text-secondary-alt">{row.label}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-hover">
              <div className={`h-2 rounded-full ${BAR_TONE[row.tone] ?? BAR_TONE.neutral}`} style={{ width: `${Math.max((row.count / max) * 100, 2)}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-token-sm font-semibold text-text-primary-alt">{row.count}</span>
            <span className="w-12 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReliabilityCard({ data }) {
  const max = data.axisMax;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="MTTR / MTBF Analytics" subtitle={data.subtitle} />
      <div className="grid grid-cols-3 border-b border-border-subtle">
        {data.stats.map((stat, i) => (
          <div key={stat.key} className={`px-token-5 py-token-4 ${i < 2 ? 'border-r border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{stat.value}</p>
            <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{stat.context}</p>
            {stat.trend && (
              <span className={`mt-token-1 inline-flex text-token-xs font-semibold ${TREND_TONE[stat.trendTone]}`}>{stat.trend}</span>
            )}
          </div>
        ))}
      </div>
      <div className="px-token-5 py-token-4">
        <p className="m-0 mb-token-3 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{data.trendLabel}</p>
        <svg viewBox={`0 0 ${TREND_W} ${TREND_H}`} className="h-24 w-full" role="img" aria-label={`Mean time to recovery trend over the last 7 days, ranging roughly ${Math.min(...data.trend)} to ${Math.max(...data.trend)} minutes.`}>
          {[0.5].map((g) => (
            <line key={g} x1="0" y1={TREND_H * g} x2={TREND_W} y2={TREND_H * g} stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
          ))}
          <path d={trendPath(data.trend, max)} fill="none" stroke="#0f5699" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function MostAffectedCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Most Affected Pipelines" subtitle={data.subtitle} linkLabel="View all" linkTitle="Pipeline detail requires MOD-006's Pipelines module (still PLANNED)." />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.rank} className={`flex items-center gap-token-3 px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted font-mono text-token-xs font-bold text-text-secondary-alt">{row.rank}</span>
            <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
            <span className="shrink-0 font-mono text-token-xs font-bold text-danger">{row.count}</span>
            <span className="w-12 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.rate}</span>
            <span className={`w-16 shrink-0 rounded-full px-token-2 py-0.5 text-center font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${SEVERITY_BADGE[row.severity] ?? SEVERITY_BADGE.low}`}>{row.severity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActiveCriticalCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Active Critical Errors" subtitle={data.subtitle} linkLabel="View all incidents" linkTitle="Incident management requires MOD-008's Operations module (still PLANNED)." />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.id} className={`px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <div className="flex items-start justify-between gap-token-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-token-2">
                  <span className="font-mono text-token-xs font-semibold text-primary">{row.id}</span>
                  <span className={`rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${INCIDENT_STATUS[row.status] ?? INCIDENT_STATUS.Investigating}`}>{row.status}</span>
                </div>
                <p className="m-0 mt-token-1 text-token-sm font-semibold text-text-primary-alt">{row.title}</p>
                <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{row.pipeline} · {row.owner}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="m-0 font-mono text-token-sm font-bold text-danger">{row.duration}</p>
                <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{row.since}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoriesCard({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Top Error Categories" subtitle={data.subtitle} linkLabel="View trends" linkTitle="Category trends require MOD-009's Analytics module (still PLANNED)." />
      <div className="grid grid-cols-1 gap-x-token-6 gap-y-token-3 px-token-5 py-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-token-3 border-b border-border-subtle pb-token-2">
            <span className="min-w-0 flex-1 truncate text-token-sm text-text-secondary-alt">{row.label}</span>
            <span className="font-mono text-token-sm font-bold text-text-primary-alt">{row.count}</span>
            <span className={`w-12 text-right font-mono text-token-xs font-semibold ${DELTA_TONE[row.deltaTone]}`}>{row.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorStatusBadge({ status }) {
  const s = ERROR_STATUS[status] ?? ERROR_STATUS.Open;
  return (
    <span className={`inline-flex items-center gap-token-1 font-mono text-token-xs font-semibold ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

function ErrorsTable({ table }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [envFilter, setEnvFilter] = useState('All');
  const [rootCauseFilter, setRootCauseFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (severityFilter !== 'All' && row.severity !== severityFilter) return false;
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (envFilter !== 'All' && row.environment !== envFilter) return false;
      if (rootCauseFilter !== 'All' && row.rootCause !== rootCauseFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.pipeline.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.rootCause.toLowerCase().includes(q)
      );
    });
  }, [table.rows, search, severityFilter, statusFilter, envFilter, rootCauseFilter]);

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
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Error Analytics</h2>
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
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search by error ID, pipeline, service, or root cause</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search by error ID, pipeline, service, root cause…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <FilterSelect label="Severity" value={severityFilter} options={table.severityFilters} onChange={resetPage(setSeverityFilter)} />
        <FilterSelect label="Status" value={statusFilter} options={table.statusFilters} onChange={resetPage(setStatusFilter)} />
        <FilterSelect label="Environment" value={envFilter} options={table.environmentFilters} onChange={resetPage(setEnvFilter)} />
        <FilterSelect label="Root Cause" value={rootCauseFilter} options={table.rootCauseFilters} onChange={resetPage(setRootCauseFilter)} />
      </div>

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No errors match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Error ID', 'Category', 'Severity', 'Status', 'Pipeline', 'Environment', 'Root Cause', 'First Seen', 'Last Seen', 'Count', 'MTTR', 'Owner'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3 font-mono text-token-xs font-semibold text-primary">{row.id}</td>
                  <td className="px-token-4 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.category}</td>
                  <td className="px-token-4 py-token-3">
                    <span className={`inline-flex rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${SEVERITY_BADGE[row.severity] ?? SEVERITY_BADGE.Low}`}>{row.severity}</span>
                  </td>
                  <td className="px-token-4 py-token-3"><ErrorStatusBadge status={row.status} /></td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-primary-alt">{row.pipeline}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.environment}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.rootCause}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.firstSeen}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.lastSeen}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-sm font-semibold text-text-primary-alt">{row.count}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.mttr}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {filtered.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {table.total.toLocaleString()} errors
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
        <span className="font-semibold text-danger">{data.headline.stats.find((s) => s.key === 'critical')?.value} critical incidents</span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-warning">{data.headline.stats.find((s) => s.key === 'open')?.value} open incidents</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-008/MOD-009 have no backend deployed yet — showing sample data, not live error telemetry.">
          Sample data
        </span>
      )}
    </div>
  );
}

function ErrorAnalyticsSkeleton() {
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

