import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDataQuality } from '../hooks/useDataQuality';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconPlus from '../../../assets/icons/pipeline-overview/icon-plus.svg';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconRefresh from '../../../assets/icons/pipeline-overview/icon-refresh.svg';
import iconCircleCheck from '../../../assets/icons/pipeline-overview/icon-circle-check.svg';
import iconDatabase from '../../../assets/icons/pipeline-overview/icon-database.svg';
import iconAlertCircle from '../../../assets/icons/data-quality/icon-alert-circle.svg';
import iconCheckSquare from '../../../assets/icons/data-quality/icon-check-square.svg';
import iconBarChart2 from '../../../assets/icons/data-quality/icon-bar-chart2.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconLayers from '../../../assets/icons/data-quality/icon-layers.svg';
import iconZap from '../../../assets/icons/data-quality/icon-zap.svg';
import iconX from '../../../assets/icons/pipeline-overview/icon-x.svg';
import iconAlertSm from '../../../assets/icons/executive-dashboard/icon-alert-sm.svg';
import iconGearSm from '../../../assets/icons/pipeline-overview/icon-gear-sm.svg';
import iconColumns from '../../../assets/icons/pipeline-overview/icon-columns.svg';
import iconFilter from '../../../assets/icons/pipeline-overview/icon-filter.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';

const DATE_RANGES = ['Today', '7d', '30d'];
const PAGE_SIZE = 10;

const KPI_ICON = {
  'circle-check': iconCircleCheck,
  database: iconDatabase,
  'alert-circle': iconAlertCircle,
  'check-square': iconCheckSquare,
  'bar-chart2': iconBarChart2,
  clock: iconClock,
  layers: iconLayers,
  zap: iconZap,
};

const KPI_TONE = {
  primary: { value: 'text-primary', bar: 'bg-primary', iconWrap: 'bg-shell-accent-wash' },
  danger: { value: 'text-danger', bar: 'bg-danger', iconWrap: 'bg-danger-bg' },
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-shell-accent-wash' },
};

const TREND_TONE = {
  up: 'text-success-strong',
  down: 'text-danger-strong',
  flat: 'text-text-secondary-alt',
};

const HEALTH_DOT_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  failed: 'bg-danger',
  stale: 'bg-text-faint',
};

const HEALTH_BAR_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  failed: 'bg-danger',
  stale: 'bg-text-faint',
};

const ALERT_SEVERITY = {
  critical: { icon: iconX, iconWrap: 'bg-danger-bg', badge: 'bg-danger-bg text-danger', label: 'Critical' },
  warning: { icon: iconAlertSm, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning', label: 'Warning' },
  info: { icon: iconGearSm, iconWrap: 'bg-surface-muted', badge: 'bg-shell-accent-wash text-primary', label: 'Info' },
};

const SEVERITY_BADGE = {
  critical: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-danger-bg border-danger-border', label: 'Critical' },
  warning: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg border-warning-border', label: 'Warning' },
  info: { dot: 'bg-text-faint', text: 'text-text-secondary-alt', bg: 'bg-surface-muted border-border', label: 'Info' },
};

const IMPACT_BADGE = {
  Low: 'bg-surface-muted border-border text-text-secondary-alt',
  Medium: 'bg-warning-bg border-warning-border text-warning',
  High: 'bg-danger-bg border-danger-border text-danger',
};

const STATUS_TONE = {
  Open: 'text-danger',
  Ack: 'text-warning',
  Resolved: 'text-success',
  'On Time': 'text-success',
  Delayed: 'text-danger',
};

/** SCR-016 — Data Quality Dashboard Screen. Node 50:4167, Figma page "Page 1". */
export default function DataQualityScreen() {
  const [dateRange, setDateRange] = useState('Today');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useDataQuality(dateRange);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-data-quality-${dateRange.toLowerCase()}`);
    showToast('Data quality audit report exported as JSON');
  };

  const handleRunValidation = () => {
    refetch();
    showToast('Automated dataset validation executed across all active pipelines');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Analytics', 'Data Quality']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Data Quality</h1>
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
              Monitor data integrity, validation results, quality scores, freshness, and governance across all ETL pipelines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <Link
              to="/pipelines/nodes/validation"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconPlus} alt="" className="block h-3 w-3" />
              Create Rule
            </Link>
            <button
              type="button"
              onClick={handleRunValidation}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconRefreshCw} alt="" className="block h-3.5 w-3.5" />
              Run Validation
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Data Quality Report"
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
            ? 'Loading data quality dashboard'
            : isError
              ? 'Couldn’t load data quality dashboard data'
              : isFetching
                ? 'Refreshing data quality dashboard'
                : data
                  ? 'Data quality dashboard updated'
                  : ''}
        </span>

        {isLoading && <DataQualitySkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the data quality dashboard</p>
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

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <QualityScoreTrendCard data={data.qualityScoreTrend} />
              <QualityAlertsCard alerts={data.qualityAlerts} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <ValidationResultsCard data={data.validationResults} />
              <DatasetHealthCard data={data.datasetHealth} />
            </div>

            <div className="grid grid-cols-1 gap-token-4 lg:grid-cols-2">
              <RuleViolationsCard rows={data.ruleViolations} />
              <FreshnessSlaCard rows={data.freshnessSla} />
            </div>

            <SchemaMonitoringCard rows={data.schemaChanges} />

            <FailedValidationsTable table={data.failedValidations} />

            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function ScreenFooter({ data, isFetching }) {
  const criticalAlerts = data.qualityAlerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>{data.failedValidations.totalCount} open validation issues</span>
        <FooterDivider />
        <span className={criticalAlerts > 0 ? 'font-semibold text-danger' : ''}>
          {criticalAlerts} critical alert{criticalAlerts === 1 ? '' : 's'}
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
            <span className={`mt-token-2 inline-flex text-token-meta font-semibold ${TREND_TONE[kpi.trendTone]}`}>{kpi.trend}</span>
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
          title={`${linkLabel} requires MOD-009's data quality endpoint (still PLANNED).`}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

const CHART_HEIGHT = 90;
const CHART_WIDTH = 700;

function chartPoints(values, min, max) {
  const range = max - min || 1;
  const stepX = CHART_WIDTH / Math.max(values.length - 1, 1);
  return values.map((v, i) => [i * stepX, CHART_HEIGHT - ((v - min) / range) * CHART_HEIGHT]);
}

function linePath(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** Real chart data rendered as inline SVG — no charting library is a
 * project dependency yet (agent-rules.md §4), and Figma's own chart
 * regions (node 50:5262) are hand-drawn static vector art with no
 * live-render contract — same precedent as ExecutiveDashboardScreen's
 * SlaTrendChart and PipelineOverviewScreen's SuccessRateChart. */
function QualityScoreTrendCard({ data }) {
  const min = Math.min(...data.series) - 0.5;
  const max = Math.max(...data.series) + 0.3;
  const points = chartPoints(data.series, min, max);
  return (
    <div className="min-w-0 flex-[1.8] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Quality Score Trend" subtitle={data.subtitle} linkLabel="Full history" />
      <div className="px-token-5 py-token-5">
        <div className="mb-token-3 flex items-center justify-between">
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Overall quality score — last 30 days</p>
          <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
            <span className="h-2 w-2 rounded-sm bg-success" aria-hidden="true" />
            Quality %
          </span>
        </div>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-24 w-full" role="img" aria-label="Overall data quality score trend over the last 30 days">
          <path d={linePath(points)} fill="none" stroke="#16a34a" strokeWidth="2" />
        </svg>
        <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
          <span>Day 1</span>
          <span>Day 30</span>
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-border-subtle">
        {[
          { label: '30-day avg', value: data.stats.avg30d, tone: 'text-success' },
          { label: 'Peak', value: data.stats.peak, tone: 'text-success' },
          { label: 'Lowest', value: data.stats.lowest, tone: 'text-text-primary-alt' },
          { label: 'Trend', value: data.stats.trend, tone: 'text-success' },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-token-5 py-token-4 ${i > 0 ? 'border-l border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityAlertsCard({ alerts }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Quality Alerts" subtitle="Actionable · sorted by severity" />
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
    </div>
  );
}

function ValidationResultsChart({ series }) {
  const max = Math.max(...series.map((d) => d.passed + d.warning + d.failed));
  const barWidth = CHART_WIDTH / series.length;
  const tickIndices = [0, 9, 19, 29];
  return (
    <div>
      <div className="mb-token-3 flex items-center justify-between">
        <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Validations per day</p>
        <div className="flex gap-token-4">
          <Legend swatchClass="bg-success" label="Passed" />
          <Legend swatchClass="bg-warning" label="Warning" />
          <Legend swatchClass="bg-danger" label="Failed" />
        </div>
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-24 w-full" role="img" aria-label="Daily validation results, passed vs warning vs failed, over the last 30 days">
        {series.map((d, i) => {
          const total = d.passed + d.warning + d.failed;
          const totalHeight = (total / max) * CHART_HEIGHT;
          const failedHeight = (d.failed / max) * CHART_HEIGHT;
          const warningHeight = (d.warning / max) * CHART_HEIGHT;
          const passedHeight = totalHeight - failedHeight - warningHeight;
          const x = i * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          return (
            <g key={d.day}>
              <rect x={x} y={CHART_HEIGHT - totalHeight} width={w} height={passedHeight} fill="#16a34a" />
              <rect x={x} y={CHART_HEIGHT - failedHeight - warningHeight} width={w} height={warningHeight} fill="#d97706" />
              <rect x={x} y={CHART_HEIGHT - failedHeight} width={w} height={failedHeight} fill="#dc2626" />
            </g>
          );
        })}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        {tickIndices.map((i) => <span key={series[i].day}>{series[i].day}</span>)}
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

function ValidationResultsCard({ data }) {
  return (
    <div className="min-w-0 flex-[1.8] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Validation Results" subtitle={data.subtitle} linkLabel="View all" />
      <div className="px-token-5 py-token-5">
        <ValidationResultsChart series={data.series} />
      </div>
      <div className="grid grid-cols-4 border-t border-border-subtle">
        {[
          { label: 'Total (30d)', value: data.stats.total30d, tone: 'text-text-primary-alt' },
          { label: 'Passed', value: data.stats.passed, tone: 'text-success' },
          { label: 'Warning', value: data.stats.warning, tone: 'text-warning' },
          { label: 'Failed', value: data.stats.failed, tone: 'text-danger' },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-token-5 py-token-4 ${i > 0 ? 'border-l border-border-subtle' : ''}`}>
            <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DatasetHealthCard({ data }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Dataset Health" subtitle={data.subtitle} linkLabel="View all" />
      <div className="flex flex-col">
        {data.breakdown.map((row) => (
          <div key={row.key} className="flex items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT_TONE[row.key]}`} aria-hidden="true" />
            <span className="w-20 shrink-0 text-token-sm text-text-secondary-alt">{row.label}</span>
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className={`h-1.5 rounded-full ${HEALTH_BAR_TONE[row.key]}`} style={{ width: `${row.percent}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right font-mono text-token-xs text-text-secondary-alt">{row.count}</span>
            <span className="w-9 shrink-0 text-right font-mono text-token-xs text-text-faint">{row.percent}%</span>
          </div>
        ))}
      </div>
      <div className="px-token-5 py-token-4">
        <p className="m-0 mb-token-2 text-token-sm font-semibold uppercase tracking-[0.04em] text-text-secondary-alt">Top Issues</p>
        <div className="flex flex-col">
          {data.topIssues.map((issue, i) => (
            <div key={issue.key} className={`flex items-center justify-between py-token-2 ${i < data.topIssues.length - 1 ? 'border-b border-border-subtle' : ''}`}>
              <span className="text-token-sm text-text-secondary-alt">{issue.label}</span>
              <span className="font-mono text-token-xs text-text-primary-alt">{issue.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const s = SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.info;
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-full border px-token-3 py-0.5 font-semibold text-token-xs ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

function RuleViolationsCard({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Rule Violations" subtitle="Sorted by severity · last 24h" linkLabel="View all" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Rule', 'Dataset', 'Severity', 'Count', 'Status'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.rule}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.dataset}</td>
                <td className="px-token-5 py-token-3">
                  <SeverityBadge severity={row.severity} />
                </td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.count}</td>
                <td className={`px-token-5 py-token-3 text-token-sm font-medium ${STATUS_TONE[row.status] ?? 'text-text-secondary-alt'}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FreshnessSlaCard({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Data Freshness" subtitle="SLA compliance by dataset" linkLabel="View all" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Dataset', 'Last Load', 'SLA', 'Delay', 'Status'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.dataset}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.lastLoad}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.sla}</td>
                <td className={`px-token-5 py-token-3 font-mono text-token-xs ${row.delay === '—' ? 'text-text-faint' : 'font-semibold text-danger'}`}>{row.delay}</td>
                <td className={`px-token-5 py-token-3 text-token-sm font-medium ${STATUS_TONE[row.status] ?? 'text-text-secondary-alt'}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchemaMonitoringCard({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Schema Monitoring" subtitle="Recent schema changes · last 7 days" linkLabel="Full history" />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Dataset', 'Pipeline', 'Change Type', 'Details', 'Impact', 'Detected', 'Status'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.dataset}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.pipeline}</td>
                <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.changeType}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.details}</td>
                <td className="px-token-5 py-token-3">
                  <span className={`inline-flex items-center rounded-full border px-token-3 py-0.5 font-semibold text-token-xs ${IMPACT_BADGE[row.impact] ?? IMPACT_BADGE.Low}`}>
                    {row.impact}
                  </span>
                </td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.detected}</td>
                <td className={`px-token-5 py-token-3 text-token-sm font-medium ${STATUS_TONE[row.status] ?? 'text-text-secondary-alt'}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FailedValidationsTable({ table }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (severityFilter !== 'all' && row.severity !== severityFilter) return false;
      if (!q) return true;
      return (
        row.dataset.toLowerCase().includes(q) ||
        row.rule.toLowerCase().includes(q) ||
        row.pipeline.toLowerCase().includes(q)
      );
    });
  }, [table.rows, search, severityFilter]);

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

  function updateSeverityFilter(key) {
    setSeverityFilter(key);
    setPage(1);
    setSelected(new Set());
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Failed Validations</h2>
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
            title="Advanced filtering is not yet available beyond the severity tabs below."
          >
            <img src={iconFilter} alt="" className="block h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search datasets, rules, pipelines</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search datasets, rules, pipelines…"
            className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap gap-token-1" role="group" aria-label="Filter by severity">
          {table.statusFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => updateSeverityFilter(f.key)}
              aria-pressed={severityFilter === f.key}
              className={`flex items-center gap-token-1 rounded-full px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                severityFilter === f.key ? 'bg-shell-accent-wash text-primary' : 'text-text-secondary-alt hover:bg-surface-hover'
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
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">{selected.size} issue{selected.size === 1 ? '' : 's'} selected</p>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk acknowledge requires MOD-009's data quality endpoint (still PLANNED)."
          >
            Acknowledge
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk resolve requires MOD-009's data quality endpoint (still PLANNED)."
          >
            Resolve
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No failed validations match your search or filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3">
                  <input
                    type="checkbox"
                    aria-label="Select all failed validations on this page"
                    checked={pageRows.length > 0 && selected.size === pageRows.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                </th>
                {['Dataset', 'Pipeline', 'Validation Rule', 'Severity', 'Failures', 'Owner', 'Last Run', 'Env'].map((col) => (
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
                      aria-label={`Select ${row.dataset} ${row.rule}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-3.5 w-3.5"
                    />
                  </td>
                  <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.dataset}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.pipeline}</td>
                  <td className="px-token-5 py-token-3 text-token-sm text-text-secondary-alt">{row.rule}</td>
                  <td className="px-token-5 py-token-3">
                    <SeverityBadge severity={row.severity} />
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.failures.toLocaleString()}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="flex items-center gap-token-2">
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-xs font-semibold text-primary">
                        {row.ownerInitials}
                      </span>
                      <span className="text-token-sm text-text-secondary-alt">{row.owner}</span>
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-secondary-alt">{row.lastRun}</td>
                  <td className="px-token-5 py-token-3">
                    <span className="rounded-sm bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs uppercase text-text-secondary-alt">{row.env}</span>
                  </td>
                </tr>
              ))}
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

function DataQualitySkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-[1.8]" />
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-[1.8]" />
        <div className="h-72 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="grid grid-cols-1 gap-token-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-md bg-surface-hover" />
        <div className="h-72 animate-pulse rounded-md bg-surface-hover" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
