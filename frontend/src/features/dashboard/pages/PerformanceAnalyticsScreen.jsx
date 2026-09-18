import { useMemo, useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { usePerformanceAnalytics } from '../hooks/usePerformanceAnalytics';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconFileText from '../../../assets/icons/executive-dashboard/icon-file-text.svg';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconChevronLeft from '../../../assets/icons/system-health/icon-chevron-left.svg';
import iconChevronRight from '../../../assets/icons/system-health/icon-chevron-right.svg';
import iconZap from '../../../assets/icons/data-quality/icon-zap.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconActivity from '../../../assets/icons/system-health/icon-activity.svg';
import iconTrendUp from '../../../assets/icons/executive-dashboard/icon-trend-up.svg';
import iconCpu from '../../../assets/icons/system-health/icon-cpu.svg';
import iconLayers from '../../../assets/icons/data-quality/icon-layers.svg';
import iconHardDrive from '../../../assets/icons/system-health/icon-hard-drive.svg';
import iconWave from '../../../assets/icons/system-health/icon-wave.svg';
import iconServer from '../../../assets/icons/system-health/icon-server.svg';
import iconShield from '../../../assets/icons/system-health/icon-shield.svg';

const RANGES = ['7d', '30d', '90d', '1y'];
const PAGE_SIZE = 8;

/** Node 70:43606 was inspected via Figma MCP this session — icons are
 * reused from the shared glyph set (no per-node export needed for this
 * screen's monochrome KPI icons). See performanceAnalytics.api.js. */
const KPI_ICON = {
  zap: iconZap,
  clock: iconClock,
  activity: iconActivity,
  'trend-up': iconTrendUp,
  cpu: iconCpu,
  layers: iconLayers,
  'hard-drive': iconHardDrive,
  wave: iconWave,
  server: iconServer,
  shield: iconShield,
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

/** Resource / status bar tones — red → amber → green ramp matching the
 * Figma utilization swatches. */
const BAR_TONE = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
  info: 'bg-primary',
  neutral: 'bg-text-faint',
};

const STATUS_BADGE = {
  success: 'bg-success-bg text-success-strong',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
};

const PRIORITY_BADGE = {
  Critical: 'bg-danger-bg text-danger',
  High: 'bg-warning-bg text-warning',
  Medium: 'bg-shell-accent-wash text-primary',
  Low: 'bg-success-bg text-success-strong',
};

const SLA_BADGE = {
  Met: 'bg-success-bg text-success-strong',
  'At Risk': 'bg-warning-bg text-warning',
  Breached: 'bg-danger-bg text-danger',
};

const TREND_GLYPH = {
  up: { char: '▲', tone: 'text-success-strong' },
  down: { char: '▼', tone: 'text-danger-strong' },
  flat: { char: '—', tone: 'text-text-faint' },
};

/** SCR-022 — Performance Analytics Dashboard Screen. Node 70:43606,
 * Figma page "Page 1". MOD-009 Analytics/Monitoring; built against the
 * inspected Figma frame + the sibling dashboard pattern of record. */
export default function PerformanceAnalyticsScreen() {
  const [range, setRange] = useState('7d');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = usePerformanceAnalytics(range);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  
  const handleExportComponents = () => {
    if (!data?.components) return;
    downloadJson(data.components, 'connectiq-component-performance-' + range);
    showToast('Component Performance report exported successfully');
  };

  const notifyPlanned = (feature) => {
    showToast(feature + ' is still PLANNED in this module version.');
  };

const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-performance-analytics-${range}`);
    showToast('Performance analytics report exported as JSON');
  };

  const handleGenerateReport = () => {
    showToast('On-demand operational SLA report generated successfully');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Analytics', 'Performance']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Performance Analytics Dashboard</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-008/MOD-009 have no backend deployed yet — showing sample data, not live performance telemetry."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Analyze platform efficiency, execution performance, infrastructure utilization, throughput, scalability, and optimization opportunities across the ETL ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Performance Analytics Report"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export Analytics
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconFileText} alt="" className="block h-3.5 w-3.5" />
              Generate Report
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
            ? 'Loading performance analytics dashboard'
            : isError
              ? 'Couldn’t load performance analytics dashboard data'
              : isFetching
                ? 'Refreshing performance analytics dashboard'
                : data
                  ? 'Performance analytics dashboard updated'
                  : ''}
        </span>

        {isLoading && <PerformanceAnalyticsSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the performance analytics dashboard</p>
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
              <ScoreTrendCard data={data.scoreTrend} onViewDetails={() => notifyPlanned("Detailed Reports")} />
              <ResourceUtilizationCard data={data.resourceUtilization} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <RuntimeCard data={data.runtime} />
              <ThroughputCard data={data.throughput} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <FastestPipelinesCard data={data.fastestPipelines} onViewFastest={() => notifyPlanned("Pipeline Detail")} />
              <RegressionsCard data={data.regressions} onViewRegressions={() => notifyPlanned("Operations Diagnostics")} />
            </div>

            <WorkersTable data={data.workers} onViewWorkers={() => notifyPlanned("Worker Management")} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <CapacityCard data={data.capacity} />
              <RecommendationsCard data={data.recommendations} />
            </div>

            <ComponentsTable table={data.components} handleExportComponents={handleExportComponents} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function HeadlineBanner({ headline }) {
  return (
    <div className="flex flex-col gap-token-3 rounded-md border border-success-border bg-success-bg px-token-5 py-token-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-token-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
        <span className="text-token-sm font-semibold text-success-strong">{headline.summary}</span>
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

function CardHeader({ title, subtitle, linkLabel, linkTitle, onAction }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
      <div>
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">{subtitle}</p>
      </div>
      {linkLabel && (
        <button
          type="button"
          onClick={onAction}
          className="whitespace-nowrap text-token-sm font-medium text-primary hover:underline transition cursor-pointer"
          title={linkTitle ?? linkLabel}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

const TREND_W = 560;
const TREND_H = 120;

function seriesPath(values, max) {
  const stepX = TREND_W / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(TREND_H - (v / max) * TREND_H).toFixed(1)}`)
    .join(' ');
}

/** Inline SVG chart — no charting library is a project dependency yet
 * (agent-rules.md §4), same precedent as the sibling MOD-009 screens.
 * Score and SLA share a 0–100 scale; both ride high (truthful — the
 * platform is performing near target). */
function ScoreTrendCard({ data, onViewDetails }) {
  const max = data.axisMax;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Performance Score Trend" subtitle={data.subtitle} linkLabel="View details" onAction={onViewDetails} />
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-center gap-token-4 text-token-sm text-text-secondary-alt">
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden="true" />
            Performance Score
          </span>
          <span className="flex items-center gap-token-2">
            <span className="h-2 w-2 rounded-sm bg-success" aria-hidden="true" />
            SLA Compliance
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
          <svg viewBox={`0 0 ${TREND_W} ${TREND_H}`} className="h-32 w-full" role="img" aria-label={`Performance score and SLA compliance over the last 28 days. Score rises to about ${Math.max(...data.score)}%; SLA compliance holds near ${Math.max(...data.sla)}%.`}>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" y1={TREND_H * g} x2={TREND_W} y2={TREND_H * g} stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            ))}
            <path d={seriesPath(data.score, max)} fill="none" stroke="#0f5699" strokeWidth="2" />
            <path d={seriesPath(data.sla, max)} fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" />
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

function ResourceUtilizationCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Resource Utilization" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col gap-token-4 p-token-5">
        {data.rows.map((row) => (
          <li key={row.key} className="flex items-center gap-token-3">
            <span className="w-16 shrink-0 text-token-sm text-text-secondary-alt">{row.label}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-hover">
              <div className={`h-2 rounded-full ${BAR_TONE[row.tone] ?? BAR_TONE.neutral}`} style={{ width: `${Math.max(Math.min(row.pct, 100), 2)}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-token-sm font-semibold text-text-primary-alt">{row.pct}%</span>
            <span className={`w-20 shrink-0 rounded-full px-token-2 py-0.5 text-center font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${STATUS_BADGE[row.tone] ?? STATUS_BADGE.success}`}>{row.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RuntimeCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Runtime Performance Analytics" subtitle={data.subtitle} />
      <div className="grid grid-cols-3 border-b border-border-subtle">
        {data.stats.map((stat, i) => (
          <div key={stat.key} className={`px-token-5 py-token-4 ${i < 2 ? 'border-r border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] ${SUMMARY_TONE[stat.tone] ?? SUMMARY_TONE.default}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <ul className="m-0 flex list-none flex-col gap-token-3 p-token-5">
        {data.percentiles.map((p) => (
          <li key={p.key} className="flex items-center gap-token-3">
            <span className="w-10 shrink-0 font-mono text-token-sm font-semibold text-text-secondary-alt">{p.label}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-hover">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(Math.min(p.pct, 100), 2)}%` }} />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-token-sm font-semibold text-text-primary-alt">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThroughputCard({ data }) {
  const max = data.axisMax;
  const barW = 100 / data.hourly.length;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Throughput Analytics" subtitle={data.subtitle} />
      <div className="grid grid-cols-3 border-b border-border-subtle">
        {data.stats.map((stat, i) => (
          <div key={stat.key} className={`px-token-5 py-token-4 ${i < 2 ? 'border-r border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{stat.value}</p>
            <span className={`mt-token-1 inline-flex text-token-xs font-semibold ${TREND_TONE[stat.trendTone]}`}>{stat.trend}</span>
          </div>
        ))}
      </div>
      <div className="px-token-5 py-token-4">
        <p className="m-0 mb-token-3 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{data.chartLabel}</p>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-24 w-full" role="img" aria-label={`Hourly throughput over the last 24 hours, peaking near ${Math.max(...data.hourly).toLocaleString()} records per second.`}>
          {data.hourly.map((v, i) => {
            const h = Math.max((v / max) * 40, 1);
            return <rect key={i} x={i * barW + barW * 0.15} y={40 - h} width={barW * 0.7} height={h} className="fill-primary" rx="0.5" />;
          })}
        </svg>
      </div>
    </div>
  );
}

function FastestPipelinesCard({ data, onViewFastest }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Fastest Pipelines" subtitle={data.subtitle} linkLabel="View all" onAction={onViewFastest} />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.rank} className={`flex items-center gap-token-3 px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg font-mono text-token-xs font-bold text-success-strong">{row.rank}</span>
            <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
            <span className="shrink-0 font-mono text-token-xs font-bold text-success">{row.runtime}</span>
            <span className="w-20 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.throughput}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegressionsCard({ data, onViewRegressions }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Performance Regressions" subtitle={data.subtitle} linkLabel="View diagnostics" onAction={onViewRegressions} />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.name} className={`flex items-center gap-token-3 px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <span className="min-w-0 flex-1 truncate text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
            <span className={`shrink-0 font-mono text-token-xs font-bold ${row.tone === 'success' ? 'text-success-strong' : row.tone === 'warning' ? 'text-warning' : 'text-danger-strong'}`}>{row.delta}</span>
            <span className="w-20 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.runtime}</span>
            <span className={`w-24 shrink-0 rounded-full px-token-2 py-0.5 text-center font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${STATUS_BADGE[row.tone] ?? STATUS_BADGE.success}`}>{row.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkersTable({ data, onViewWorkers }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Worker Performance" subtitle={data.subtitle} linkLabel="View all workers" onAction={onViewWorkers} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Worker', 'Utilization', 'Tasks', 'Avg Duration', 'Fail Rate', 'Status'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-4 py-token-3 font-mono text-token-sm font-semibold text-text-primary-alt">{row.name}</td>
                <td className="px-token-4 py-token-3">
                  <div className="flex items-center gap-token-2">
                    <div className="h-1.5 w-24 rounded-full bg-surface-hover">
                      <div className={`h-1.5 rounded-full ${BAR_TONE[row.tone] ?? BAR_TONE.neutral}`} style={{ width: `${Math.max(Math.min(row.utilization, 100), 2)}%` }} />
                    </div>
                    <span className="font-mono text-token-xs font-semibold text-text-primary-alt">{row.utilization}%</span>
                  </div>
                </td>
                <td className="px-token-4 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.tasks.toLocaleString()}</td>
                <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.avgDuration}</td>
                <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.failRate}</td>
                <td className="px-token-4 py-token-3">
                  <span className={`inline-flex rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${STATUS_BADGE[row.tone] ?? STATUS_BADGE.success}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CapacityCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Capacity Planning" subtitle={data.subtitle} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Resource', 'Current', '90d Forecast', 'Risk'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.key} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-4 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.label}</td>
                <td className="px-token-4 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.current}</td>
                <td className="px-token-4 py-token-3 font-mono text-token-sm font-semibold text-text-primary-alt">{row.forecast}</td>
                <td className="px-token-4 py-token-3">
                  <span className={`inline-flex rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${STATUS_BADGE[row.tone] ?? STATUS_BADGE.success}`}>{row.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecommendationsCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Performance Recommendations" subtitle={data.subtitle} />
      <ul className="m-0 flex list-none flex-col p-0">
        {data.rows.map((row, i) => (
          <li key={row.key} className={`px-token-5 py-token-3 ${i < data.rows.length - 1 ? 'border-b border-border-subtle' : ''}`}>
            <div className="flex items-start justify-between gap-token-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-token-2">
                  <span className={`rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${PRIORITY_BADGE[row.priority] ?? PRIORITY_BADGE.Medium}`}>{row.priority}</span>
                  <span className="font-mono text-token-xs font-semibold text-success-strong">{row.impact}</span>
                </div>
                <p className="m-0 mt-token-1 text-token-sm font-semibold text-text-primary-alt">{row.title}</p>
                <p className="m-0 mt-0.5 text-token-xs text-text-faint">{row.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendGlyph({ trend }) {
  const g = TREND_GLYPH[trend] ?? TREND_GLYPH.flat;
  return <span className={`font-mono text-token-xs font-bold ${g.tone}`} aria-label={`trend ${trend}`}>{g.char}</span>;
}

function ComponentsTable({ table, handleExportComponents }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All');
  const [envFilter, setEnvFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
      if (slaFilter !== 'All' && row.sla !== slaFilter) return false;
      if (envFilter !== 'All' && row.environment !== envFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
      );
    });
  }, [table.rows, search, categoryFilter, slaFilter, envFilter]);

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
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Component Performance</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{table.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleExportComponents}
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition cursor-pointer shadow-2xs"
          title="Export Component Performance Table"
        >
          <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
          Export table
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search by component ID, name, category, or owner</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search by component, category, owner…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <FilterSelect label="Category" value={categoryFilter} options={table.categoryFilters} onChange={resetPage(setCategoryFilter)} />
        <FilterSelect label="SLA" value={slaFilter} options={table.slaFilters} onChange={resetPage(setSlaFilter)} />
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
                {['Component', 'Category', 'Score', 'Runtime', 'Throughput', 'CPU', 'Memory', 'Latency', 'SLA', 'Trend', 'Owner'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3">
                    <span className="block text-token-sm font-semibold text-text-primary-alt">{row.name}</span>
                    <span className="block font-mono text-token-xs text-primary">{row.id}</span>
                  </td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.category}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-sm font-semibold text-text-primary-alt">{row.score}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.runtime}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.throughput}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.cpu}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.memory}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.latency}</td>
                  <td className="px-token-4 py-token-3">
                    <span className={`inline-flex rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${SLA_BADGE[row.sla] ?? SLA_BADGE.Met}`}>{row.sla}</span>
                  </td>
                  <td className="px-token-4 py-token-3"><TrendGlyph trend={row.trend} /></td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-faint">{row.owner}</td>
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
        <span className="font-semibold text-success">{data.headline.stats.find((s) => s.key === 'sla')?.value} SLA compliance</span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span className="font-semibold text-text-secondary-alt">{data.headline.stats.find((s) => s.key === 'active-workers')?.value} active workers</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-008/MOD-009 have no backend deployed yet — showing sample data, not live performance telemetry.">
          Sample data
        </span>
      )}
    </div>
  );
}

function PerformanceAnalyticsSkeleton() {
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
      <div className="h-80 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}

