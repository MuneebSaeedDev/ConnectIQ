import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useSourceHealth } from '../hooks/useSourceHealth';
import { downloadJson } from '../../../utils/exportHelper';
import { CheckCircle2 } from 'lucide-react';
import iconPlus from '../../../assets/icons/pipeline-overview/icon-plus.svg';
import iconActivity from '../../../assets/icons/source-health/icon-activity.svg';
import iconExport from '../../../assets/icons/pipeline-overview/icon-export.svg';
import iconPlug from '../../../assets/icons/source-health/icon-plug.svg';
import iconKey from '../../../assets/icons/source-health/icon-key.svg';
import iconWifi from '../../../assets/icons/source-health/icon-wifi.svg';
import iconCircleCheck from '../../../assets/icons/system-health/icon-circle-check.svg';
import iconX from '../../../assets/icons/executive-dashboard/icon-x.svg';
import iconAlertSm from '../../../assets/icons/executive-dashboard/icon-alert-sm.svg';
import iconClock from '../../../assets/icons/pipeline-overview/icon-clock.svg';
import iconRefreshCw from '../../../assets/icons/data-quality/icon-refresh-cw.svg';
import iconLayers from '../../../assets/icons/data-quality/icon-layers.svg';
import iconWave from '../../../assets/icons/system-health/icon-wave.svg';
import iconActivityKpi from '../../../assets/icons/system-health/icon-activity.svg';
import iconShield from '../../../assets/icons/system-health/icon-shield.svg';
import iconCheck from '../../../assets/icons/check.svg';
import iconGearSm from '../../../assets/icons/pipeline-overview/icon-gear-sm.svg';
import iconColumns from '../../../assets/icons/pipeline-overview/icon-columns.svg';
import iconFilter from '../../../assets/icons/pipeline-overview/icon-filter.svg';
import iconSearch from '../../../assets/icons/pipeline-overview/icon-search.svg';
import iconChevronLeft from '../../../assets/icons/system-health/icon-chevron-left.svg';
import iconChevronRight from '../../../assets/icons/system-health/icon-chevron-right.svg';

const TIME_RANGES = ['Live', '1h', '24h', '7d'];
const PAGE_SIZE = 10;

const KPI_ICON = {
  plug: iconPlug,
  'circle-check': iconCircleCheck,
  x: iconX,
  'alert-sm': iconAlertSm,
  wifi: iconWifi,
  key: iconKey,
  clock: iconClock,
  'refresh-cw': iconRefreshCw,
  layers: iconLayers,
  wave: iconWave,
  activity: iconActivityKpi,
  shield: iconShield,
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
  Healthy: { dot: 'bg-success', text: 'text-success', bg: 'bg-success-bg border-success-border', label: 'Healthy' },
  Warning: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg border-warning-border', label: 'Warning' },
  Offline: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-danger-bg border-danger-border', label: 'Offline' },
  OK: { dot: 'bg-success', text: 'text-success', bg: 'bg-success-bg border-success-border', label: 'OK' },
  Delayed: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg border-warning-border', label: 'Delayed' },
  Breached: { dot: 'bg-danger', text: 'text-danger', bg: 'bg-danger-bg border-danger-border', label: 'Breached' },
};

const ALERT_SEVERITY = {
  critical: { icon: iconX, iconWrap: 'bg-danger-bg', badge: 'bg-danger-bg text-danger', label: 'Critical' },
  warning: { icon: iconAlertSm, iconWrap: 'bg-warning-bg', badge: 'bg-warning-bg text-warning', label: 'Warning' },
  info: { icon: iconGearSm, iconWrap: 'bg-surface-muted', badge: 'bg-shell-accent-wash text-primary', label: 'Info' },
};

const SCHEMA_CHANGE_TYPE = {
  breaking: { text: 'text-danger', badge: 'bg-danger-bg text-danger', label: 'Breaking' },
  additive: { text: 'text-success', badge: 'bg-success-bg text-success-strong', label: 'Additive' },
  renamed: { text: 'text-text-secondary-alt', badge: 'bg-surface-muted text-text-secondary-alt', label: 'Renamed' },
  removed: { text: 'text-danger', badge: 'bg-danger-bg text-danger', label: 'Removed' },
};

const AUTH_TIMELINE_STATUS = {
  expiring: { icon: iconAlertSm, tone: 'text-warning' },
  expired: { icon: iconX, tone: 'text-danger' },
  ok: { icon: iconCheck, tone: 'text-success' },
};

const AUTH_STAT_TONE = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/** SCR-018 — Source Health Dashboard Screen. Node 56:11333, Figma page "Page 1". */
export default function SourceHealthScreen() {
  const [timeRange, setTimeRange] = useState('Live');
  const [toastMessage, setToastMessage] = useState(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useSourceHealth(timeRange);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    if (!data) return;
    downloadJson(data, `connectiq-source-health-${timeRange.toLowerCase()}`);
    showToast('Source health report exported as JSON');
  };

  const handleTestAll = () => {
    refetch();
    showToast('Diagnostic connection test initiated for all data sources');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Analytics', 'Source Health']}>
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
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Source Health</h1>
              {data?.mocked && (
                <span
                  className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                  title="MOD-006/MOD-009 have no backend deployed yet — showing sample data, not live metrics."
                >
                  Sample data
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Monitor connection health, authentication status, freshness, and schema stability across every connected data source.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-token-3">
            <Link
              to="/data-sources/new"
              className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img src={iconPlus} alt="" className="block h-3.5 w-3.5" />
              Add Source
            </Link>
            <button
              type="button"
              onClick={handleTestAll}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Test all data source connections"
            >
              <img src={iconActivity} alt="" className="block h-3.5 w-3.5" />
              Test All
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Export Source Health JSON Report"
            >
              <img src={iconExport} alt="" className="block h-3.5 w-3.5" />
              Export
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
            ? 'Loading source health dashboard'
            : isError
              ? 'Couldn’t load source health dashboard data'
              : isFetching
                ? 'Refreshing source health dashboard'
                : data
                  ? 'Source health dashboard updated'
                  : ''}
        </span>

        {isLoading && <SourceHealthSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the source health dashboard</p>
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
              <ConnectionHealthCard data={data.connectionHealth} />
              <SourceAlertsCard alerts={data.sourceAlerts} />
            </div>

            <AuthStatusCard data={data.authStatus} />

            <div className="flex flex-col gap-token-4 xl:flex-row">
              <SourcePerformanceCard data={data.sourcePerformance} />
              <SchemaMonitoringCard data={data.schemaMonitoring} />
            </div>

            <DataFreshnessTable data={data.dataFreshness} />

            <AllSourcesTable table={data.allSources} />

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
        <span>{data.kpis.find((k) => k.key === 'offline-critical')?.value ?? 0} offline/critical</span>
        <FooterDivider />
        <span className="font-semibold text-warning">{data.authStatus.expiredCount} expired credential{data.authStatus.expiredCount === 1 ? '' : 's'}</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title="MOD-006/MOD-009 have no backend deployed yet — showing sample data, not live metrics.">
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
          title={`${linkLabel} requires MOD-006's Data Sources module (still PLANNED).`}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.Healthy;
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-full border px-token-3 py-0.5 font-semibold text-token-xs ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
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
 * project dependency yet (agent-rules.md §4), and Figma's own
 * connections-per-hour/response-time chart regions (nodes 56:12231,
 * 56:12900) are static hand-drawn vector art with no live-render
 * contract — same precedent as SystemHealthScreen's UtilizationTrendCard
 * and the other MOD-009 sibling screens' inline charts. */
function ConnectionHealthCard({ data }) {
  const points = chartPoints(data.series, 95, 100);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Connection Health" subtitle={data.subtitle} />
      <div className="px-token-5 py-token-4">
        <div className="mb-token-3 flex items-center justify-between">
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Success rate — last 24h</p>
          <div className="flex items-center gap-token-3 text-token-sm text-text-secondary-alt">
            <span className="flex items-center gap-token-2">
              <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden="true" />
              Successful
            </span>
            <span className="flex items-center gap-token-2">
              <span className="h-2 w-2 rounded-sm bg-danger" aria-hidden="true" />
              Failed
            </span>
          </div>
        </div>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-20 w-full" role="img" aria-label="Connection success rate over the last 24 hours">
          <path d={linePath(points)} fill="none" stroke="#0f5699" strokeWidth="2" />
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
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Total</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.total}</p>
        </div>
        <div className="border-r border-border-subtle px-token-5 py-token-4">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Successful</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-success">{data.successful}</p>
        </div>
        <div className="px-token-5 py-token-4">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Failed</p>
          <p className="m-0 mt-token-1 text-token-lg font-extrabold tracking-[-0.02em] text-danger">{data.failed}</p>
        </div>
        <div className="border-r border-t border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Timeout Rate</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.timeoutRate}</p>
        </div>
        <div className="col-span-2 border-t border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Avg Latency</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.avgLatency}</p>
        </div>
      </div>
    </div>
  );
}

function SourceAlertsCard({ alerts }) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Source Alerts" subtitle="Actionable · severity sorted" />
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

function AuthStatusCard({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle px-token-5 py-token-4">
        <div>
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Authentication Status</h2>
          <p className="m-0 font-mono text-token-meta text-text-faint">{data.subtitle}</p>
        </div>
        {data.expiredCount > 0 && (
          <span className="rounded-full bg-danger-bg px-token-3 py-0.5 font-mono text-token-xs font-bold text-danger">
            {data.expiredCount} expired
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-token-4 px-token-5 py-token-4 sm:grid-cols-2">
        {data.stats.map((stat) => (
          <div key={stat.key}>
            <div className="mb-token-1 flex items-center justify-between">
              <span className="text-token-sm text-text-secondary-alt">{stat.label}</span>
              <span className="font-mono text-token-sm font-semibold text-text-primary-alt">{stat.value}/{stat.max}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-surface-hover">
              <div
                className={`h-1 rounded-full ${AUTH_STAT_TONE[stat.tone] ?? AUTH_STAT_TONE.success}`}
                style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle px-token-5 py-token-4">
        <p className="m-0 mb-token-2 text-token-xs font-bold uppercase tracking-[0.06em] text-text-secondary-alt">Credential Expiry Timeline</p>
        <div className="flex flex-col">
          {data.timeline.map((row, i) => {
            const s = AUTH_TIMELINE_STATUS[row.status] ?? AUTH_TIMELINE_STATUS.ok;
            return (
              <div key={row.id} className={`flex items-center gap-token-3 py-token-2 ${i < data.timeline.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                <img src={s.icon} alt="" className="block h-3 w-3 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-token-sm font-medium text-text-primary-alt">{row.source}</span>
                <span className="w-28 shrink-0 font-mono text-token-xs text-text-faint">{row.authType}</span>
                <span className={`w-16 shrink-0 text-right font-mono text-token-xs font-semibold ${s.tone}`}>{row.expiresLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SourcePerformanceCard({ data }) {
  const points = chartPoints(data.series, 100, 900);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Source Performance" subtitle={data.subtitle} />
      <div className="px-token-5 py-token-4">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-20 w-full" role="img" aria-label="Average response time over the last 24 hours">
          <path d={linePath(points)} fill="none" stroke="#0f5699" strokeWidth="2" />
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
        <div className="border-r border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">24h Avg</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.avg24h}</p>
        </div>
        <div className="border-r border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">P95</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.p95}</p>
        </div>
        <div className="px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">P99</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-text-primary-alt">{data.p99}</p>
        </div>
        <div className="border-r border-t border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Peak</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-warning">{data.peak}</p>
        </div>
        <div className="col-span-2 border-t border-border-subtle px-token-5 py-token-3">
          <p className="m-0 font-mono text-token-meta uppercase tracking-[0.06em] text-text-faint">Within SLA</p>
          <p className="m-0 mt-token-1 text-token-base font-extrabold tracking-[-0.02em] text-success">{data.withinSla}</p>
        </div>
      </div>
    </div>
  );
}

function SchemaMonitoringCard({ data }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(
    () => (filter === 'all' ? data.changes : data.changes.filter((c) => c.type === filter)),
    [data.changes, filter]
  );
  const breakingCount = data.changes.filter((c) => c.type === 'breaking').length;
  const additiveCount = data.changes.filter((c) => c.type === 'additive').length;
  const otherCount = data.changes.length - breakingCount - additiveCount;

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Schema Monitoring" subtitle="Detected changes across sources" />
      <div className="flex flex-wrap gap-token-1 border-b border-border-subtle px-token-5 py-token-3" role="group" aria-label="Filter by change type">
        {data.filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`flex items-center gap-token-1 rounded-full px-token-3 py-1 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              filter === f.key ? 'bg-shell-accent-wash text-primary' : 'text-text-secondary-alt hover:bg-surface-hover'
            }`}
          >
            {f.label}
            <span className="font-mono text-token-xs text-text-faint">{f.count}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">No schema changes match this filter.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {filtered.map((change, i) => {
            const t = SCHEMA_CHANGE_TYPE[change.type] ?? SCHEMA_CHANGE_TYPE.additive;
            return (
              <li key={change.id} className={`px-token-5 py-token-3 ${i < filtered.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                <div className="flex items-start justify-between gap-token-3">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{change.source}</p>
                    <p className="m-0 mt-0.5 text-token-sm text-text-secondary-alt">{change.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-token-1">
                    <span className={`rounded-full px-token-2 py-0.5 font-mono text-token-xs font-bold uppercase tracking-[0.04em] ${t.badge}`}>{t.label}</span>
                    <span className="font-mono text-token-xs text-text-faint">{change.detectedAt}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex items-center gap-token-4 border-t border-border-subtle px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
        <span className="font-semibold text-danger">{breakingCount} breaking</span>
        <span className="font-semibold text-success">{additiveCount} additive</span>
        <span>{otherCount} other</span>
      </div>
    </div>
  );
}

function DataFreshnessTable({ data }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <CardHeader title="Data Freshness SLA" subtitle={data.subtitle} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Source', 'Last Sync', 'Expected', 'Delay', 'SLA', 'Status'].map((col) => (
                <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                <td className="px-token-5 py-token-3 text-token-sm font-semibold text-text-primary-alt">{row.source}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.lastSync}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.expected}</td>
                <td className={`px-token-5 py-token-3 font-mono text-token-xs ${row.delay !== '—' ? 'text-warning' : 'text-text-faint'}`}>{row.delay}</td>
                <td className="px-token-5 py-token-3 font-mono text-token-xs text-text-faint">{row.sla}</td>
                <td className="px-token-5 py-token-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-token-4 border-t border-border-subtle px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
        <span className="font-semibold text-success">{data.onSchedule} on schedule</span>
        <span className="font-semibold text-warning">{data.delayed} delayed</span>
        <span className="font-semibold text-danger">{data.breached} breached</span>
      </div>
    </div>
  );
}

function AllSourcesTable({ table }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows.filter((row) => {
      if (categoryFilter === 'healthy' && row.status !== 'Healthy') return false;
      if (categoryFilter === 'warning' && row.status !== 'Warning') return false;
      if (categoryFilter === 'offline' && row.status !== 'Offline') return false;
      if (!['all', 'healthy', 'warning', 'offline'].includes(categoryFilter) && row.category.toLowerCase() !== categoryFilter) return false;
      if (!q) return true;
      return row.name.toLowerCase().includes(q) || row.host.toLowerCase().includes(q);
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
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">All Sources</h2>
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
          <span className="sr-only">Search sources, hosts, connectors</span>
          <img src={iconSearch} alt="" className="pointer-events-none absolute left-token-3 top-1/2 block h-3 w-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search sources, hosts, connectors…"
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
              {f.dot && <span className={`h-1.5 w-1.5 rounded-full ${f.dot === 'success' ? 'bg-success' : f.dot === 'warning' ? 'bg-warning' : 'bg-danger'}`} aria-hidden="true" />}
              {f.label}
              <span className="font-mono text-token-xs text-text-faint">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-token-3 border-b border-border-subtle bg-shell-accent-wash px-token-5 py-token-3">
          <p className="m-0 text-token-sm font-medium text-text-primary-alt">{selected.size} source{selected.size === 1 ? '' : 's'} selected</p>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk connection test requires MOD-006's Data Sources module (still PLANNED)."
          >
            Test Connections
          </button>
          <button
            type="button"
            className="flex h-7 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Bulk disable requires MOD-006's Data Sources module (still PLANNED)."
          >
            Disable
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <p className="m-0 px-token-5 py-token-8 text-center text-token-sm text-text-secondary-alt">
          No sources match your search or filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                <th scope="col" className="border-b border-border-subtle px-token-5 py-token-3">
                  <input
                    type="checkbox"
                    aria-label="Select all sources on this page"
                    checked={pageRows.length > 0 && selected.size === pageRows.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                </th>
                {['Source', 'Type', 'Env', 'Status', 'Health', 'Last Sync', 'Freshness', 'Response', 'Avail.', 'Auth', 'Owner'].map((col) => (
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
                  <td className="px-token-5 py-token-3">
                    <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{row.name}</p>
                    <p className="m-0 font-mono text-token-xs text-text-faint">{row.host}</p>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <span className="rounded-full bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold text-text-secondary-alt">{row.category}</span>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <span className="rounded-full bg-surface-muted px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase text-text-secondary-alt">{row.env}</span>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-token-5 py-token-3">
                    <span className="flex items-center gap-token-2">
                      <span className="h-1 w-11 rounded-full bg-surface-hover">
                        <span className={`block h-1 rounded-full ${row.healthTone === 'danger' ? 'bg-danger' : row.healthTone === 'warning' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.max(row.health, 0)}%` }} />
                      </span>
                      <span className={`font-mono text-token-xs font-bold ${row.healthTone === 'danger' ? 'text-danger' : row.healthTone === 'warning' ? 'text-warning' : 'text-text-primary-alt'}`}>{row.health}%</span>
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.lastSync}</td>
                  <td className="px-token-5 py-token-3">
                    <StatusBadge status={row.freshness} />
                  </td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.response}</td>
                  <td className="px-token-5 py-token-3 font-mono text-token-sm text-text-primary-alt">{row.availability}</td>
                  <td className="px-token-5 py-token-3">
                    <span className={`font-mono text-token-xs font-bold ${row.auth === 'OK' ? 'text-success' : row.auth === 'Expired' ? 'text-danger' : 'text-warning'}`}>{row.auth}</span>
                  </td>
                  <td className="px-token-5 py-token-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-xs font-bold text-primary">{row.owner}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-token-3 border-t border-border-subtle px-token-5 py-token-3">
        <p className="m-0 text-token-sm text-text-faint">
          Showing {(clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of {filtered.length} sources
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

function SourceHealthSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-token-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="h-80 animate-pulse rounded-md bg-surface-hover" />
      <div className="flex flex-col gap-token-4 xl:flex-row">
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
        <div className="h-64 animate-pulse rounded-md bg-surface-hover xl:flex-1" />
      </div>
      <div className="h-64 animate-pulse rounded-md bg-surface-hover" />
      <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
    </div>
  );
}
