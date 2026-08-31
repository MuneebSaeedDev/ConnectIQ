import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useSourceHealth } from '../hooks/useSourceHealth';
import { TIME_RANGE_OPTIONS, MOCK_TITLE } from '../services/sourceHealthMonitoring.api';

const HEALTH_FILTERS = ['All', 'Healthy', 'Degraded', 'Critical'];

const KPI_TONE = {
  default: { value: 'text-text-primary-alt', bar: 'bg-border' },
  info: { value: 'text-primary', bar: 'bg-primary' },
  success: { value: 'text-success', bar: 'bg-success' },
  warning: { value: 'text-text-primary-alt', bar: 'bg-warning' },
  danger: { value: 'text-danger', bar: 'bg-danger' },
};

// Health status → token utilities only (verified Figma tones, node
// 125:47806): Healthy → success, Degraded → warning, Critical → danger.
// `text` uses the AA-safe -strong variants for meaningful small text
// (see tokens.css: text-warning-strong ~4.9:1; SCR-036 review precedent).
const HEALTH_TONE = {
  Healthy: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong', bar: 'bg-success', text: 'text-success-strong' },
  Degraded: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning-strong', bar: 'bg-warning', text: 'text-warning-strong' },
  Critical: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong', bar: 'bg-danger', text: 'text-danger-strong' },
};

const SEVERITY_TONE = {
  high: 'bg-danger-bg text-danger-strong',
  medium: 'bg-warning-bg text-warning-strong',
  low: 'bg-surface-muted text-text-secondary-alt',
};

const TIMELINE_TONE = {
  critical: { dot: 'bg-danger', text: 'text-danger-strong' },
  warning: { dot: 'bg-warning', text: 'text-warning-strong' },
  success: { dot: 'bg-success', text: 'text-success-strong' },
};

const TREND_TONE = {
  improving: 'text-success',
  stable: 'text-text-secondary-alt',
  degrading: 'text-danger',
};

const POSTURE_TONE = {
  healthy: 'bg-success-bg text-success-strong',
  warning: 'bg-warning-bg text-warning-strong',
  critical: 'bg-danger-bg text-danger-strong',
};

/** SCR-056 — Source Health Monitoring Screen. Node 125:47806. */
export default function SourceHealthMonitoringScreen() {
  const { id } = useParams();
  const orgId = 'current';
  const [range, setRange] = useState('Last 30 Days');
  const [health, setHealth] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useSourceHealth(orgId, id, {
    range,
    health,
  });

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Monitoring', 'Source Health', 'Source Health Monitoring']}>
      <div className="flex flex-col gap-token-6">
        <Header data={data} range={range} onRange={setRange} refetch={refetch} isFetching={isFetching} />

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading source health'
            : isError
              ? 'Couldn’t load source health'
              : isFetching
                ? 'Refreshing source health'
                : data
                  ? 'Source health updated'
                  : ''}
        </span>

        {isLoading && <HealthSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load source health</p>
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
            <OverviewGrid overview={data.overview} />
            <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex min-w-0 flex-col gap-token-6">
                <SourceHealthGrid
                  sources={data.sources}
                  health={health}
                  onHealth={setHealth}
                  search={search}
                  onSearch={setSearch}
                />
                <HealthTimeline events={data.timeline} />
                <MonitoringTable
                  title="Availability Monitoring"
                  subtitle="Rolling availability vs. SLA target"
                  columns={['Source', 'Current', 'SLA Target', 'Downtime', 'SLA']}
                  rows={data.availability}
                  render={(r) => [
                    <span key="name" className="font-medium text-text-primary-alt">{r.name}</span>,
                    r.current,
                    r.slaTarget,
                    r.downtime,
                    <StatusPill key="sla" ok={r.met} okLabel="Met" failLabel="Breached" />,
                  ]}
                />
                <MonitoringTable
                  title="Performance Monitoring"
                  subtitle="Latency percentiles and throughput"
                  columns={['Source', 'p50', 'p95', 'p99', 'Throughput', 'Trend']}
                  rows={data.performance}
                  render={(r) => [
                    <span key="name" className="font-medium text-text-primary-alt">{r.name}</span>,
                    r.p50,
                    r.p95,
                    r.p99,
                    r.throughput,
                    <span key="trend" className={`font-medium capitalize ${TREND_TONE[r.trend] ?? 'text-text-secondary-alt'}`}>{r.trend}</span>,
                  ]}
                />
                <MonitoringTable
                  title="Auth & Security Health"
                  subtitle="Authentication method, transport, and credential posture"
                  columns={['Source', 'Auth Method', 'TLS', 'Credential', 'Posture']}
                  rows={data.authSecurity}
                  render={(r) => [
                    <span key="name" className="font-medium text-text-primary-alt">{r.name}</span>,
                    r.authMethod,
                    r.tls,
                    <span key="credential" className="flex flex-col">
                      <span className="text-text-secondary-alt">{r.credentialStatus}</span>
                      <span className="text-token-xs text-text-faint">{r.credentialDetail}</span>
                    </span>,
                    <span key="posture" className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold capitalize ${POSTURE_TONE[r.posture] ?? POSTURE_TONE.healthy}`}>{r.posture}</span>,
                  ]}
                />
                <MonitoringTable
                  title="Data Freshness Monitoring"
                  subtitle="Last sync vs. expected cadence"
                  columns={['Source', 'Last Sync', 'Expected', 'Lag', 'State']}
                  rows={data.freshness}
                  render={(r) => [
                    <span key="name" className="font-medium text-text-primary-alt">{r.name}</span>,
                    r.lastSync,
                    r.expected,
                    <span key="lag" className={r.stale ? 'text-warning-strong' : 'text-text-secondary-alt'}>{r.lag}</span>,
                    <StatusPill key="state" ok={!r.stale} okLabel="Fresh" failLabel="Stale" />,
                  ]}
                />
                <ActiveAlerts alerts={data.alerts} />
                <IncidentHistory incidents={data.incidents} />
                <ScheduledMaintenance maintenance={data.maintenance} />
              </div>
              <RightRail data={data} />
            </div>
            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function Header({ data, range, onRange, refetch, isFetching }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Source Health Monitoring</h1>
          {data?.mocked && (
            <span
              className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
              title={MOCK_TITLE}
            >
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Live availability, performance, security, and freshness telemetry across every connected data source.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <label className="flex items-center gap-token-2">
          <span className="sr-only">Time range</span>
          <select
            value={range}
            onChange={(e) => onRange(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm text-text-secondary-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {TIME_RANGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Alert configuration requires MOD-006’s monitoring endpoint (still PLANNED)."
        >
          <IconBell />
          Configure Alerts
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Report export is not yet available — no MOD-006 health-report endpoint exists."
        >
          <IconExport />
          Export Report
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled
          title="Running an on-demand health check requires MOD-006’s health-check endpoint (still PLANNED)."
        >
          <IconPulse />
          Run Health Check
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label={isFetching ? 'Refreshing' : 'Refresh'}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          title="Refresh"
        >
          <IconRefresh spinning={isFetching} />
        </button>
      </div>
    </div>
  );
}

function OverviewGrid({ overview }) {
  return (
    <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
      {(overview ?? []).map((kpi) => {
        const tone = KPI_TONE[kpi.tone] ?? KPI_TONE.default;
        return (
          <div key={kpi.key} className="relative overflow-hidden rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
            <span className={`absolute inset-x-0 top-0 h-[3px] ${tone.bar}`} aria-hidden="true" />
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{kpi.label}</p>
            <p className={`m-0 mt-token-2 text-token-xl font-extrabold tracking-[-0.03em] ${tone.value}`}>{kpi.value}</p>
            {kpi.hint && <p className="m-0 mt-token-1 text-token-xs text-text-faint">{kpi.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}

function Card({ title, subtitle, actions, children }) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-3">
        <div>
          <h2 className="m-0 text-token-base font-bold text-text-primary-alt">{title}</h2>
          {subtitle && <p className="m-0 mt-0.5 text-token-xs text-text-faint">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function SourceHealthGrid({ sources, health, onHealth, search, onSearch }) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (sources ?? []).filter((s) => {
      if (health !== 'All' && s.health !== health) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.sourceType.toLowerCase().includes(q);
    });
  }, [sources, health, search]);

  return (
    <Card
      title="Source Health Grid"
      subtitle="Per-source health score, availability, latency, and error rate"
      actions={
        <div className="flex flex-wrap items-center gap-token-2">
          <label className="relative w-full sm:w-56">
            <span className="sr-only">Search sources by name or type</span>
            <IconSearch className="pointer-events-none absolute left-token-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-faint" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search sources…"
              className="h-8 w-full rounded-md border border-border bg-surface-muted pl-token-8 pr-token-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <div className="flex items-center gap-token-1" role="tablist" aria-label="Filter by health">
            {HEALTH_FILTERS.map((f) => {
              const active = f === health;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onHealth(f)}
                  className={`h-8 rounded-full border px-token-3 text-token-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? 'border-shell-accent-border bg-shell-accent-wash text-primary'
                      : 'border-border bg-surface-card text-text-secondary-alt hover:bg-surface-hover'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <EmptyRow message="No sources match your search or health filter." />
      ) : (
        <div className="grid grid-cols-1 gap-token-4 p-token-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const tone = HEALTH_TONE[s.health] ?? HEALTH_TONE.Healthy;
            return (
              <div key={s.id} className="flex flex-col gap-token-3 rounded-md border border-border-subtle bg-surface-muted p-token-4">
                <div className="flex items-start justify-between gap-token-2">
                  <div className="min-w-0">
                    <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{s.name}</p>
                    <p className="m-0 text-token-xs text-text-faint">{s.sourceType} · {s.environment}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                    {s.health}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-token-xs">
                    <span className="text-text-faint">Health score</span>
                    <span className="font-semibold text-text-primary-alt">{s.healthScore}/100</span>
                  </div>
                  <div className="mt-token-1 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle" role="progressbar" aria-valuenow={s.healthScore} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} health score`}>
                    <span className={`block h-full ${tone.bar}`} style={{ width: `${s.healthScore}%` }} />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-token-2 text-token-xs">
                  <Metric label="Availability" value={s.availability} />
                  <Metric label="Latency" value={s.latency} />
                  <Metric label="Error rate" value={s.errorRate} />
                  <Metric label="Uptime" value={s.uptime} />
                </dl>
                <p className="m-0 text-token-xs text-text-faint">Last check {s.lastCheck}</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="m-0 text-text-faint">{label}</dt>
      <dd className="m-0 font-medium text-text-secondary-alt">{value}</dd>
    </div>
  );
}

function HealthTimeline({ events }) {
  return (
    <Card title="Health Timeline" subtitle="Most recent availability and health events">
      {(events ?? []).length === 0 ? (
        <EmptyRow message="No health events in this time range." />
      ) : (
        <ol className="m-0 flex flex-col gap-token-4 px-token-5 py-token-5">
          {events.map((e) => {
            const tone = TIMELINE_TONE[e.kind] ?? TIMELINE_TONE.warning;
            return (
              <li key={e.id} className="flex gap-token-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                  <span className="mt-1 w-px flex-1 bg-border-subtle" aria-hidden="true" />
                </div>
                <div className="pb-token-1">
                  <div className="flex flex-wrap items-center gap-token-2">
                    <span className={`text-token-sm font-semibold ${tone.text}`}>{e.title}</span>
                    <span className="text-token-xs text-text-faint">{e.source} · {e.time}</span>
                  </div>
                  <p className="m-0 mt-0.5 text-token-sm text-text-secondary-alt">{e.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function MonitoringTable({ title, subtitle, columns, rows, render }) {
  return (
    <Card title={title} subtitle={subtitle}>
      {(rows ?? []).length === 0 ? (
        <EmptyRow message="No data available for this section." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {columns.map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  {render(row).map((cell, i) => (
                    <td key={i} className="px-token-5 py-token-3 align-top text-token-sm text-text-secondary-alt">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function ActiveAlerts({ alerts }) {
  return (
    <Card
      title="Active Alerts"
      subtitle="Alerts currently firing across monitored sources"
      actions={
        <button
          type="button"
          className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled
          title="Acknowledging alerts requires MOD-006’s monitoring endpoint (still PLANNED)."
        >
          Acknowledge All
        </button>
      }
    >
      {(alerts ?? []).length === 0 ? (
        <EmptyRow message="No active alerts — all monitored sources are within threshold." />
      ) : (
        <ul className="m-0 flex flex-col">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-token-3 border-b border-border-subtle px-token-5 py-token-3 last:border-b-0">
              <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold uppercase ${SEVERITY_TONE[a.severity] ?? SEVERITY_TONE.low}`}>
                {a.severity}
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-token-sm font-medium text-text-primary-alt">{a.title}</p>
                <p className="m-0 text-token-xs text-text-faint">{a.source} · Rule: {a.rule}</p>
              </div>
              <span className="text-token-xs text-text-faint">{a.triggered}</span>
              <button
                type="button"
                className="h-7 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                disabled
                title="Acknowledging an alert requires MOD-006’s monitoring endpoint (still PLANNED)."
              >
                Acknowledge
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function IncidentHistory({ incidents }) {
  const STATUS_TONE = {
    Investigating: 'bg-danger-bg text-danger-strong',
    Identified: 'bg-warning-bg text-warning-strong',
    Monitoring: 'bg-shell-accent-wash text-primary',
    Resolved: 'bg-success-bg text-success-strong',
  };
  return (
    <Card title="Incident History" subtitle="Recent incidents and their current status">
      {(incidents ?? []).length === 0 ? (
        <EmptyRow message="No incidents recorded in this time range." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-muted">
                {['Incident', 'Source', 'Severity', 'Status', 'Opened', 'Duration'].map((col) => (
                  <th key={col} scope="col" className="border-b border-border-subtle px-token-5 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-5 py-token-3 align-top">
                    <span className="flex flex-col">
                      <span className="font-mono text-token-xs font-semibold text-primary">{inc.ref}</span>
                      <span className="max-w-md text-token-xs text-text-faint">{inc.summary}</span>
                    </span>
                  </td>
                  <td className="px-token-5 py-token-3 align-top text-token-sm text-text-secondary-alt">{inc.source}</td>
                  <td className="px-token-5 py-token-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold uppercase ${SEVERITY_TONE[inc.severity] ?? SEVERITY_TONE.low}`}>{inc.severity}</span>
                  </td>
                  <td className="px-token-5 py-token-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${STATUS_TONE[inc.status] ?? 'bg-surface-muted text-text-secondary-alt'}`}>{inc.status}</span>
                  </td>
                  <td className="px-token-5 py-token-3 align-top text-token-sm text-text-secondary-alt">{inc.opened}</td>
                  <td className="px-token-5 py-token-3 align-top text-token-sm text-text-secondary-alt">{inc.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function ScheduledMaintenance({ maintenance }) {
  return (
    <Card title="Scheduled Maintenance" subtitle="Upcoming maintenance windows affecting sources">
      {(maintenance ?? []).length === 0 ? (
        <EmptyRow message="No scheduled maintenance windows." />
      ) : (
        <ul className="m-0 flex flex-col">
          {maintenance.map((m) => (
            <li key={m.id} className="flex flex-wrap items-start gap-token-3 border-b border-border-subtle px-token-5 py-token-3 last:border-b-0">
              <IconCalendar />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-token-sm font-medium text-text-primary-alt">{m.source} — {m.kind}</p>
                <p className="m-0 text-token-xs text-text-faint">{m.window} · {m.impact}</p>
              </div>
              <span className="text-token-xs text-text-faint">Owner: {m.owner}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RightRail({ data }) {
  const overall = data.overall ?? {};
  const sla = data.sla ?? {};
  const overallTone = overall.score >= 90 ? HEALTH_TONE.Healthy : overall.score >= 70 ? HEALTH_TONE.Degraded : HEALTH_TONE.Critical;
  return (
    <aside className="flex flex-col gap-token-6">
      <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
        <h2 className="m-0 text-token-base font-bold text-text-primary-alt">Overall Health</h2>
        <div className="mt-token-4 flex items-center gap-token-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-border-subtle" aria-hidden="true" />
            <span
              className={`absolute inset-0 rounded-full ${overallTone.bar}`}
              style={{ clipPath: `inset(${100 - (overall.score ?? 0)}% 0 0 0)` }}
              aria-hidden="true"
            />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-card text-token-lg font-extrabold text-text-primary-alt">
              {overall.score ?? '—'}
            </span>
          </div>
          <div>
            <p className={`m-0 text-token-base font-bold ${overallTone.text}`}>{overall.label}</p>
            <p className="m-0 mt-token-1 text-token-xs text-text-secondary-alt">{overall.description}</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
        <h2 className="m-0 text-token-base font-bold text-text-primary-alt">SLA Status</h2>
        <dl className="m-0 mt-token-4 flex flex-col gap-token-3">
          <SlaRow label="Sources meeting SLA" value={`${sla.met ?? 0} / ${sla.total ?? 0}`} />
          <SlaRow label="Active breaches" value={String(sla.breaches ?? 0)} tone={sla.breaches ? 'text-danger' : 'text-success'} />
          <SlaRow label="Month-to-date target" value={sla.monthTarget ?? '—'} />
          <SlaRow label="Month-to-date actual" value={sla.monthActual ?? '—'} />
        </dl>
      </section>

      <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
        <h2 className="m-0 text-token-base font-bold text-text-primary-alt">Recommendations</h2>
        <ul className="m-0 mt-token-4 flex flex-col gap-token-3">
          {(data.recommendations ?? []).map((r) => (
            <li key={r.id} className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
              <div className="flex items-center gap-token-2">
                <span className={`inline-flex items-center rounded-full px-token-2 py-0.5 text-token-meta font-semibold uppercase ${SEVERITY_TONE[r.priority] ?? SEVERITY_TONE.low}`}>{r.priority}</span>
                <span className="text-token-sm font-medium text-text-primary-alt">{r.title}</span>
              </div>
              <p className="m-0 mt-token-1 text-token-xs text-text-secondary-alt">{r.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function SlaRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-token-3">
      <dt className="m-0 text-token-sm text-text-secondary-alt">{label}</dt>
      <dd className={`m-0 text-token-sm font-semibold ${tone ?? 'text-text-primary-alt'}`}>{value}</dd>
    </div>
  );
}

function StatusPill({ ok, okLabel, failLabel }) {
  return (
    <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${ok ? 'bg-success-bg text-success-strong' : 'bg-danger-bg text-danger-strong'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-success' : 'bg-danger'}`} aria-hidden="true" />
      {ok ? okLabel : failLabel}
    </span>
  );
}

function EmptyRow({ message }) {
  return (
    <div className="px-token-5 py-token-8 text-center">
      <p className="m-0 text-token-sm text-text-secondary-alt">{message}</p>
    </div>
  );
}

function ScreenFooter({ data, isFetching }) {
  const total = data.sources?.length ?? 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <div className="flex flex-wrap items-center gap-token-4">
        <span className="flex items-center gap-token-2">
          <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
          {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
        </span>
        <span className="h-3 w-px shrink-0 bg-border-subtle" aria-hidden="true" />
        <span>{total.toLocaleString()} sources shown</span>
      </div>
      {data.mocked && (
        <span className="font-semibold uppercase tracking-[0.04em] text-warning" title={MOCK_TITLE}>
          Sample data
        </span>
      )}
    </div>
  );
}

function HealthSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-token-6">
          <div className="h-72 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-96 w-full animate-pulse rounded-md bg-surface-hover" />
        </div>
        <div className="flex flex-col gap-token-6">
          <div className="h-40 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-52 w-full animate-pulse rounded-md bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}

/* Inline icons — currentColor SVGs matching the Figma toolbar glyphs. */
function IconRefresh({ spinning }) {
  return (
    <svg viewBox="0 0 16 16" className={`block h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" />
    </svg>
  );
}

function IconExport() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10V2m0 0 3 3M8 2 5 5M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2a4 4 0 0 0-4 4c0 3-1.5 4-1.5 4h11S12 9 12 6a4 4 0 0 0-4-4ZM6.5 13a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function IconPulse() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 8h3l1.5-4 3 8 1.5-4h3" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className ?? 'block h-3 w-3'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="m11 11 3 3" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 block h-3.5 w-3.5 shrink-0 text-text-faint" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
    </svg>
  );
}
