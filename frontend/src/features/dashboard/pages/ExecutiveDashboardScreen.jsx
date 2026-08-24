import { useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useExecutiveDashboard } from '../hooks/useExecutiveDashboard';
import iconExport from '../../../assets/icons/executive-dashboard/icon-export.svg';
import iconRefresh from '../../../assets/icons/executive-dashboard/icon-refresh.svg';
import iconCircleCheck from '../../../assets/icons/executive-dashboard/icon-circle-check.svg';
import iconShield from '../../../assets/icons/executive-dashboard/icon-shield.svg';
import iconPipeline from '../../../assets/icons/executive-dashboard/icon-pipeline.svg';
import iconWave from '../../../assets/icons/executive-dashboard/icon-wave.svg';
import iconDatabase from '../../../assets/icons/executive-dashboard/icon-database.svg';
import iconUsers from '../../../assets/icons/executive-dashboard/icon-users.svg';
import iconTrendUp from '../../../assets/icons/executive-dashboard/icon-trend-up.svg';
import iconTriangle from '../../../assets/icons/executive-dashboard/icon-triangle.svg';
import iconX from '../../../assets/icons/executive-dashboard/icon-x.svg';
import iconAlertSm from '../../../assets/icons/executive-dashboard/icon-alert-sm.svg';
import iconDropShield from '../../../assets/icons/executive-dashboard/icon-drop-shield.svg';
import iconFileText from '../../../assets/icons/executive-dashboard/icon-file-text.svg';
import iconChevronRight from '../../../assets/icons/executive-dashboard/icon-chevron-right.svg';
import iconActivity from '../../../assets/icons/executive-dashboard/icon-activity.svg';

const DATE_RANGES = ['7d', '30d', '90d', '1yr'];

const KPI_ICON = {
  'circle-check': iconCircleCheck,
  shield: iconShield,
  pipeline: iconPipeline,
  wave: iconWave,
  database: iconDatabase,
  users: iconUsers,
  'trend-up': iconTrendUp,
  triangle: iconTriangle,
};

const KPI_TONE = {
  primary: { value: 'text-primary', bar: 'bg-primary', iconWrap: 'bg-shell-accent-wash' },
  danger: { value: 'text-danger', bar: 'bg-danger', iconWrap: 'bg-danger-bg' },
  success: { value: 'text-success', bar: 'bg-success', iconWrap: 'bg-success-bg' },
  default: { value: 'text-text-primary-alt', bar: 'bg-border', iconWrap: 'bg-surface-muted' },
};

const TREND_TONE = {
  up: 'bg-success-bg text-success-strong',
  down: 'bg-danger-bg text-danger-strong',
  flat: 'bg-surface-muted text-text-secondary-alt',
};

const SUMMARY_VALUE_TONE = {
  primary: 'text-primary',
  danger: 'text-danger',
  success: 'text-success',
  default: 'text-text-primary-alt',
};

const SUMMARY_STATUS_TONE = {
  healthy: { pill: 'bg-success-bg text-success-strong', dot: 'bg-success' },
  warning: { pill: 'bg-warning-bg text-warning', dot: 'bg-warning' },
  down: { pill: 'bg-danger-bg text-danger-strong', dot: 'bg-danger' },
};

const ALERT_SEVERITY = {
  critical: { icon: iconX, iconWrap: 'bg-danger-bg', badge: 'bg-danger-bg text-danger', label: 'Critical' },
  warning: { icon: iconAlertSm, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning', label: 'Warning' },
  security: { icon: iconDropShield, iconWrap: 'bg-surface-muted', badge: 'bg-shell-accent-wash text-primary', label: 'Security' },
};

const HEALTH_DOT_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  down: 'bg-danger',
};

const HEALTH_VALUE_TONE = {
  healthy: 'text-success',
  warning: 'text-warning',
  down: 'text-danger',
};

const HEALTH_BAR_TONE = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  down: 'bg-danger',
};

const REPORT_ICON = {
  'file-text': iconFileText,
  shield: iconShield,
  users: iconUsers,
  'trend-up': iconTrendUp,
  activity: iconActivity,
};

const REPORT_TONE = {
  primary: 'bg-shell-accent-wash',
  success: 'bg-success-bg',
  'success-alt': 'bg-success-bg',
  warning: 'bg-warning-bg',
  neutral: 'bg-surface-muted',
};

/** SCR-014 — Executive Dashboard Screen. Node 45:7, Figma page "Page 1". */
export default function ExecutiveDashboardScreen() {
  const [dateRange, setDateRange] = useState('30d');
  const { data, isLoading, isError, error, refetch, isFetching } = useExecutiveDashboard(dateRange);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Analytics', 'Executive Dashboard']}>
      <div className="flex flex-col gap-token-6">
        <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Executive Dashboard</h1>
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
              Strategic performance, platform adoption, SLA compliance, and operational efficiency.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
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
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Export is not yet available — no MOD-009 export endpoint exists."
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Sharing is not yet available — no MOD-009 share endpoint exists."
            >
              Share
            </button>
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
            ? 'Loading executive dashboard'
            : isError
              ? 'Couldn’t load executive dashboard data'
              : isFetching
                ? 'Refreshing executive dashboard'
                : data
                  ? 'Executive dashboard updated'
                  : ''}
        </span>

        {isLoading && <ExecutiveDashboardSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the executive dashboard</p>
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
            <KpiGrid kpis={data.executiveKpis} />
            <KpiGrid kpis={data.businessKpis} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <TrendChartCard
                className="xl:flex-[1.7]"
                title="SLA Performance"
                subtitle={data.slaPerformance.subtitle}
                linkLabel="Full report"
                chart={<SlaTrendChart data={data.slaPerformance} />}
                stats={[
                  { label: 'Avg availability', value: data.slaPerformance.stats.avgAvailability, tone: 'text-success' },
                  { label: 'Incidents', value: data.slaPerformance.stats.incidents, tone: 'text-text-primary-alt' },
                  { label: 'Downtime', value: data.slaPerformance.stats.downtime, tone: 'text-text-primary-alt' },
                  { label: 'MTTR', value: data.slaPerformance.stats.mttr, tone: 'text-text-primary-alt' },
                ]}
              />
              <AlertsCard alerts={data.alerts} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <TrendChartCard
                className="xl:flex-[1.7]"
                title="Execution Volume"
                subtitle={data.executionVolume.subtitle}
                linkLabel="View executions"
                chart={<ExecutionVolumeChart data={data.executionVolume} />}
                stats={[
                  { label: 'Total this month', value: data.executionVolume.stats.totalThisMonth, tone: 'text-text-primary-alt' },
                  { label: 'Successful', value: data.executionVolume.stats.successful, tone: 'text-success' },
                  { label: 'Failed', value: data.executionVolume.stats.failed, tone: 'text-danger' },
                  { label: 'Avg duration', value: data.executionVolume.stats.avgDuration, tone: 'text-text-primary-alt' },
                ]}
              />
              <OperationalHealthCard health={data.operationalHealth} />
            </div>

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <TrendChartCard
                className="xl:flex-1"
                title="Platform Adoption"
                subtitle={data.platformAdoption.subtitle}
                linkLabel="Adoption report"
                chart={<AdoptionTrendChart data={data.platformAdoption} />}
                stats={[
                  { label: 'Current users', value: data.platformAdoption.stats.currentUsers, tone: 'text-text-primary-alt' },
                  { label: 'Growth (12 wk)', value: data.platformAdoption.stats.growth, tone: 'text-success' },
                  { label: 'New this month', value: data.platformAdoption.stats.newThisMonth, tone: 'text-text-primary-alt' },
                ]}
              />
              <ReportsCard reports={data.reports} />
            </div>

            <BusinessUnitAdoptionTable rows={data.businessUnitAdoption} />
            <ScreenFooter data={data} dateRange={dateRange} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

/**
 * Screen-local footer for SCR-014 — distinct from the global shell
 * `Footer` (AppShell) which shows fixed pipeline/worker/queue stats
 * on every screen. This one reflects this screen's own live query
 * data: last-updated time, active date range, the mock-data
 * disclosure, and a couple of at-a-glance totals already present in
 * the payload (not fabricated) so it updates on every refetch/range
 * change rather than being a static caption.
 */
function ScreenFooter({ data, dateRange, isFetching }) {
  const criticalAlerts = data.alerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <FooterDivider />
        <span>Range: {dateRange}</span>
        <FooterDivider />
        <span>{data.executionVolume.stats.totalThisMonth} executions this month</span>
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
          {item.kind === 'status' ? (
            <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-sm font-bold ${SUMMARY_STATUS_TONE[item.status].pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${SUMMARY_STATUS_TONE[item.status].dot}`} aria-hidden="true" />
              {item.statusLabel}
            </span>
          ) : (
            <p className={`m-0 text-token-xl font-extrabold tracking-[-0.03em] ${SUMMARY_VALUE_TONE[item.tone]}`}>{item.value}</p>
          )}
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

function TrendChartCard({ title, subtitle, linkLabel, chart, stats, className = '' }) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{subtitle}</p>
        </div>
        <button
          type="button"
          className="whitespace-nowrap text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
          disabled
          title={`${linkLabel} requires MOD-009's analytics endpoint (still PLANNED).`}
        >
          {linkLabel} →
        </button>
      </div>
      <div className="px-token-5 py-token-5">{chart}</div>
      <div
        className="grid border-t border-border-subtle"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`border-b border-r border-border-subtle px-token-5 py-token-4 last:border-r-0 ${
              i < stats.length - 1 ? '' : 'border-b-0'
            }`}
          >
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-2 text-token-lg font-extrabold tracking-[-0.02em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CHART_HEIGHT = 160;
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
 * project dependency yet (agent-rules.md §4: no new library without
 * explicit requirement), and Figma's own chart regions (e.g. node
 * 45:1110) are hand-drawn static vector art with no live-render
 * contract, same precedent as DashboardScreen's documented "trend
 * chart requires a real endpoint" placeholder. This renders the real
 * mock/API data shape as a lightweight line/bar primitive rather than
 * a static image or an unbuilt placeholder. */
function SlaTrendChart({ data }) {
  const values = data.series.map((p) => p.availability);
  const min = Math.min(data.slaThreshold, ...values) - 0.2;
  const max = 100;
  const points = chartPoints(values, min, max);
  const thresholdY = CHART_HEIGHT - ((data.slaThreshold - min) / (max - min)) * CHART_HEIGHT;
  const incidentIndex = values.indexOf(Math.min(...values));

  return (
    <div>
      <div className="mb-token-3 flex items-center justify-between">
        <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
          Platform availability — last 30 days
        </p>
        <div className="flex items-center gap-token-4">
          <Legend swatchClass="bg-primary" label="Availability" />
          <Legend swatchClass="bg-danger" label="SLA Threshold" dashed />
        </div>
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-40 w-full" role="img" aria-label="SLA availability trend over the last 30 days">
        <line x1="0" y1={thresholdY} x2={CHART_WIDTH} y2={thresholdY} stroke="#dc2626" strokeOpacity="0.5" strokeDasharray="4 4" strokeWidth="1.5" />
        <path d={linePath(points)} fill="none" stroke="#0f5699" strokeWidth="2" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === incidentIndex ? 4 : 2.5} fill={i === incidentIndex ? '#dc2626' : '#0f5699'} />
        ))}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        {data.series.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

function ExecutionVolumeChart({ data }) {
  const max = Math.max(...data.series.map((d) => d.successful + d.failed));
  const barWidth = CHART_WIDTH / data.series.length;
  return (
    <div>
      <div className="mb-token-3 flex justify-end gap-token-4">
        <Legend swatchClass="bg-primary" label="Successful" />
        <Legend swatchClass="bg-danger" label="Failed" />
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-40 w-full" role="img" aria-label="Daily execution volume, successful vs failed">
        {data.series.map((d, i) => {
          const total = d.successful + d.failed;
          const totalHeight = (total / max) * CHART_HEIGHT;
          const failedHeight = (d.failed / max) * CHART_HEIGHT;
          const successHeight = totalHeight - failedHeight;
          const x = i * barWidth + barWidth * 0.2;
          const w = barWidth * 0.6;
          return (
            <g key={d.label}>
              <rect x={x} y={CHART_HEIGHT - totalHeight} width={w} height={successHeight} fill="#0f5699" />
              <rect x={x} y={CHART_HEIGHT - failedHeight} width={w} height={failedHeight} fill="#dc2626" />
            </g>
          );
        })}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        {data.series.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function AdoptionTrendChart({ data }) {
  const min = Math.min(...data.series) * 0.9;
  const max = Math.max(...data.series) * 1.05;
  const points = chartPoints(data.series, min, max);
  return (
    <div>
      <div className="mb-token-3 flex justify-end">
        <Legend swatchClass="bg-primary" label="Active users" />
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-40 w-full" role="img" aria-label="Active users over the last 12 weeks">
        <path d={linePath(points)} fill="none" stroke="#0f5699" strokeWidth="2" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="#0f5699" />
        ))}
      </svg>
      <div className="mt-token-1 flex justify-between font-mono text-token-xs text-text-faint">
        <span>{data.weekLabels[0]}</span>
        <span>{data.weekLabels[1]}</span>
      </div>
    </div>
  );
}

function Legend({ swatchClass, label, dashed }) {
  return (
    <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
      <span className={`h-2 w-2 rounded-sm ${dashed ? 'border border-dashed border-danger' : swatchClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function AlertsCard({ alerts }) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border-subtle px-token-5 py-token-4">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Executive Alerts</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">Priority-sorted · {criticalCount} critical</p>
      </div>
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

function OperationalHealthCard({ health }) {
  return (
    <div className="flex-1 rounded-md border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border-subtle px-token-5 py-token-4">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Operational Health</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">Key infrastructure metrics</p>
      </div>
      <div className="flex flex-col">
        <HealthRow label="Worker Fleet" value={health.workerFleet.value} state={health.workerFleet.state} />
        <HealthRow label="Queue" value={health.queueStatus.value} state={health.queueStatus.state} />
        <HealthRow label="Connectors" value={health.connectorHealth.value} state={health.connectorHealth.state} />
        <HealthMeterRow label="CPU" percent={health.cpu.percent} state={health.cpu.state} />
        <HealthMeterRow label="Memory" percent={health.memory.percent} state={health.memory.state} />
        <HealthRow label="Database" value={health.database.value} state={health.database.state} />
        <HealthRow label="API Layer" value={health.apiLayer.value} state={health.apiLayer.state} />
        <HealthRow label="Avg Response" value={health.avgResponseTime} last />
      </div>
    </div>
  );
}

function HealthRow({ label, value, state, last }) {
  return (
    <div className={`flex items-center justify-between gap-token-3 px-token-5 py-token-2 ${last ? '' : 'border-b border-border-subtle'}`}>
      <span className="text-token-sm text-text-secondary-alt">{label}</span>
      <span className="flex items-center gap-token-2">
        <span className={`text-token-sm font-bold ${state ? HEALTH_VALUE_TONE[state] : 'text-text-primary-alt'}`}>{value}</span>
        {state && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${HEALTH_DOT_TONE[state]}`} aria-hidden="true" />}
      </span>
    </div>
  );
}

function HealthMeterRow({ label, percent, state }) {
  return (
    <div className="flex items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-2">
      <span className="text-token-sm text-text-secondary-alt">{label}</span>
      <span className="flex items-center gap-token-2">
        <div className="h-1 w-16 rounded-full bg-surface-hover">
          <div className={`h-1 rounded-full ${HEALTH_BAR_TONE[state]}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="w-9 text-right text-token-sm font-bold text-text-secondary-alt">{percent}%</span>
      </span>
    </div>
  );
}

function ReportsCard({ reports }) {
  return (
    <div className="flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="border-b border-border-subtle px-token-5 py-token-4">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Executive Reports</h2>
        <p className="m-0 font-mono text-token-meta text-text-faint">Monthly and on-demand reports</p>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {reports.map((report, i) => (
          <li key={report.id} className={i < reports.length - 1 ? 'border-b border-border-subtle' : ''}>
            <button
              type="button"
              className="flex w-full items-center gap-token-3 px-token-5 py-token-3 text-left hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="Report generation requires MOD-009's reporting endpoint (still PLANNED)."
            >
              <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md ${REPORT_TONE[report.tone]}`}>
                <img src={REPORT_ICON[report.icon]} alt="" className="block h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{report.title}</p>
                <p className="m-0 mt-0.5 font-mono text-token-xs text-text-faint">{report.subtitle}</p>
              </span>
              <img src={iconChevronRight} alt="" className="block h-3 w-3 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BusinessUnitAdoptionTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Adoption by Business Unit</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">Active users and pipeline usage across the organization</p>
        </div>
        <button
          type="button"
          className="whitespace-nowrap text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
          disabled
          title="Adoption report requires MOD-009's analytics endpoint (still PLANNED)."
        >
          Adoption report →
        </button>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-muted">
            {['Business Unit', 'Adoption', 'Users', 'Pipelines', '%'].map((col) => (
              <th
                key={col}
                scope="col"
                className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.unit} className="border-b border-border-subtle last:border-b-0">
              <td className="px-token-5 py-token-3 text-token-sm font-medium text-text-secondary-alt">{row.unit}</td>
              <td className="px-token-5 py-token-3">
                <div className="h-1.5 w-full min-w-[120px] rounded-full bg-surface-hover">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${row.adoptionPercent}%` }} />
                </div>
              </td>
              <td className="px-token-5 py-token-3 text-right font-mono text-token-xs text-text-faint">{row.users}</td>
              <td className="px-token-5 py-token-3 text-right font-mono text-token-xs font-bold text-text-secondary-alt">{row.pipelines}</td>
              <td className="px-token-5 py-token-3 text-right font-mono text-token-xs text-text-faint">{row.adoptionPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function ExecutiveDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-20 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-token-4 xl:flex-row">
          <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-[1.7]" />
          <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        </div>
      ))}
      <div className="h-56 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
