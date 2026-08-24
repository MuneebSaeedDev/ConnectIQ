import AppShell from '../../shell/components/AppShell';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrganizationDetails } from '../hooks/useOrganizationDetails';

// Colored avatar tones — shared with SCR-024 Organization List.
const ORG_TONE = {
  blue: 'bg-shell-accent-wash text-primary',
  purple: 'bg-warning-bg text-warning',
  green: 'bg-success-bg text-success-strong',
  gray: 'bg-surface-muted text-text-faint',
};

const STATUS_TONE = {
  Active: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Trial: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Suspended: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
  Inactive: { dot: 'bg-text-faint', pill: 'bg-surface-muted text-text-secondary-alt' },
  Invited: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Pending: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Expired: { dot: 'bg-text-faint', pill: 'bg-surface-muted text-text-secondary-alt' },
};

// Pipeline / connector row status tones.
const RUN_TONE = {
  Running: { dot: 'bg-primary', pill: 'bg-shell-accent-wash text-primary' },
  Success: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Failed: { dot: 'bg-danger', pill: 'bg-danger-bg text-danger-strong' },
  Paused: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
  Connected: { dot: 'bg-success', pill: 'bg-success-bg text-success-strong' },
  Warning: { dot: 'bg-warning', pill: 'bg-warning-bg text-warning' },
};

const TEXT_TONE = {
  default: 'text-text-secondary-alt',
  primary: 'text-primary',
  success: 'text-success-strong',
  warning: 'text-warning',
  danger: 'text-danger-strong',
};

const DOT_TONE = {
  default: 'bg-text-faint',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const KPI_ACCENT = {
  default: 'bg-border',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/** SCR-025 — Organization Details Screen. Node 91:9827, Figma page "Page 1". */
export default function OrganizationDetailsScreen() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch, isFetching } = useOrganizationDetails(id);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Organizations', data?.name ?? id]}>
      <div className="flex flex-col gap-token-6">
        <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
          <Link
            to="/organizations"
            className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Back to Organizations
          </Link>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading organization'
            : isError
              ? 'Couldn’t load organization'
              : isFetching
                ? 'Refreshing organization'
                : data
                  ? 'Organization updated'
                  : ''}
        </span>

        {isLoading && <DetailsSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load organization</p>
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
            <PageHeader data={data} />
            <KpiStrip kpis={data.kpis} />
            <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-w-0 flex-col gap-token-6">
                <OverviewCard overview={data.overview} />
                <PipelineActivityCard activity={data.pipelineActivity} />
                <UsersCard users={data.users} />
                <ConnectorsCard connectors={data.connectors} />
                <AuditActivityCard items={data.auditActivity} />
              </div>
              <aside className="flex min-w-0 flex-col gap-token-6">
                <InfoCard info={data.info} />
                <SubscriptionCard subscription={data.subscription} />
                <PlatformHealthCard items={data.platformHealth} />
                <QuickActionsCard actions={data.quickActions} />
                <SecurityStatusCard items={data.securityStatus} />
              </aside>
            </div>
            <ScreenFooter data={data} isFetching={isFetching} />
          </>
        )}
      </div>
    </AppShell>
  );
}

const HEADER_ACTIONS = [
  { key: 'edit', label: 'Edit Organization', variant: 'secondary', to: 'edit' },
  { key: 'settings', label: 'Settings', variant: 'secondary', to: 'settings' },
  { key: 'departments', label: 'Departments', variant: 'secondary', to: 'departments' },
  { key: 'manage-subscription', label: 'Manage Subscription', variant: 'primary', title: 'Managing a subscription requires MOD-004’s subscription endpoint (still PLANNED).' },
  { key: 'more', label: 'More Actions', variant: 'secondary', title: 'Lifecycle actions require MOD-004’s organization endpoints (still PLANNED).' },
];

function PageHeader({ data }) {
  const navigate = useNavigate();
  const tone = STATUS_TONE[data.status] ?? STATUS_TONE.Pending;
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-token-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-mono text-token-lg font-semibold ${ORG_TONE[data.tone] ?? ORG_TONE.gray}`}>
          {data.initials}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-token-3">
            <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">{data.name}</h1>
            <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
              {data.status}
            </span>
            {data.mocked && (
              <span
                className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning"
                title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not live records."
              >
                Sample data
              </span>
            )}
          </div>
          <p className="m-0 mt-token-2 flex flex-wrap items-center gap-x-token-4 gap-y-token-1 font-mono text-token-meta text-text-faint">
            <span>ID {data.id}</span>
            <span>Plan {data.plan}</span>
            <span>Region {data.region}</span>
            <span>Created {data.created}</span>
            <span>Admin {data.adminName}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        {HEADER_ACTIONS.map((action) => {
          const cls =
            action.variant === 'primary'
              ? 'flex h-8 items-center rounded-md bg-primary px-token-4 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              : 'flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
          // The Edit action navigates to the real SCR-027 edit screen; the
          // rest stay disabled pending their own MOD-004 endpoints.
          if (action.to) {
            return (
              <button
                key={action.key}
                type="button"
                onClick={() => navigate(`/organizations/${encodeURIComponent(data.id)}/${action.to}`)}
                className={cls}
              >
                {action.label}
              </button>
            );
          }
          return (
            <button key={action.key} type="button" disabled title={action.title} className={cls}>
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KpiStrip({ kpis }) {
  return (
    <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <div key={kpi.key} className="relative overflow-hidden rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
          <span className={`absolute inset-x-0 top-0 h-[3px] ${KPI_ACCENT[kpi.tone] ?? KPI_ACCENT.default}`} aria-hidden="true" />
          <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{kpi.label}</p>
          <p className={`m-0 mt-token-2 text-token-xl font-extrabold tracking-[-0.03em] ${kpi.tone === 'success' ? 'text-success' : 'text-text-primary-alt'}`}>{kpi.value}</p>
          <p className="m-0 mt-token-2 text-token-sm text-text-faint">{kpi.helper}</p>
        </div>
      ))}
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card shadow-sm">
      <div className="flex items-center justify-between gap-token-3 border-b border-border-subtle px-token-5 py-token-4">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
        {action}
      </div>
      <div className="p-token-5">{children}</div>
    </section>
  );
}

function DisabledLink({ label, title }) {
  return (
    <button
      type="button"
      disabled
      title={title}
      className="text-token-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-faint disabled:no-underline"
    >
      {label}
    </button>
  );
}

function OverviewField({ label, value }) {
  return (
    <div>
      <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{label}</p>
      <p className="m-0 mt-token-1 text-token-sm text-text-primary-alt">{value}</p>
    </div>
  );
}

function OverviewCard({ overview }) {
  const statusTone = STATUS_TONE[overview.currentStatus] ?? STATUS_TONE.Pending;
  return (
    <Card title="Organization Overview">
      <div className="grid grid-cols-1 gap-token-5 sm:grid-cols-2">
        <OverviewField label="Organization Name" value={overview.organizationName} />
        <OverviewField label="Organization ID" value={overview.organizationId} />
        <OverviewField label="Primary Admin" value={overview.primaryAdmin} />
        <OverviewField label="Region" value={overview.region} />
        <OverviewField label="Time Zone" value={overview.timeZone} />
        <OverviewField label="Industry" value={overview.industry} />
        <OverviewField label="Created Date" value={overview.createdDate} />
        <OverviewField label="Last Activity" value={overview.lastActivity} />
      </div>
      <div className="mt-token-5">
        <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">Current Status</p>
        <div className={`mt-token-2 flex items-center gap-token-2 rounded-md px-token-3 py-token-2 ${statusTone.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} aria-hidden="true" />
          <span className="text-token-sm font-medium">{overview.currentStatus}</span>
        </div>
      </div>
    </Card>
  );
}

function PipelineActivityCard({ activity }) {
  return (
    <Card title="Pipeline Activity" action={<DisabledLink label="View all pipelines" title="The pipeline library requires MOD-004 / pipeline endpoints (still PLANNED)." />}>
      <div className="mb-token-5 grid grid-cols-3 gap-token-4 sm:grid-cols-6">
        {activity.stats.map((stat) => (
          <div key={stat.key}>
            <p className="m-0 font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">{stat.label}</p>
            <p className={`m-0 mt-token-1 text-token-base font-bold ${TEXT_TONE[stat.tone] ?? TEXT_TONE.default}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Pipeline', 'Status', 'Records', 'Duration', 'Last Run'].map((col) => (
                <th key={col} scope="col" className="border-y border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activity.rows.map((row) => {
              const tone = RUN_TONE[row.status] ?? RUN_TONE.Paused;
              return (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3 text-token-sm font-medium text-text-primary-alt">{row.name}</td>
                  <td className="px-token-4 py-token-3">
                    <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-secondary-alt">{row.records}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-sm text-text-secondary-alt">{row.duration}</td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-faint">{row.lastRun}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function UsersCard({ users }) {
  return (
    <Card
      title="Users"
      action={
        <div className="flex items-center gap-token-3">
          <DisabledLink label={`View all ${users.total} users`} title="The users list requires MOD-005 (User Management) endpoints (still PLANNED)." />
          <button
            type="button"
            disabled
            title="Adding a user requires MOD-005 (User Management) endpoints (still PLANNED)."
            className="flex h-7 items-center gap-token-2 rounded-md bg-primary px-token-3 text-token-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Add User
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Name', 'Role', 'Email', 'Status', 'Last Login', 'Actions'].map((col) => (
                <th key={col} scope="col" className="border-y border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col === 'Actions' ? <span className="sr-only">Actions</span> : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.rows.map((row) => {
              const tone = STATUS_TONE[row.status] ?? STATUS_TONE.Inactive;
              return (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3">
                    <span className="flex items-center gap-token-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-token-meta font-semibold ${ORG_TONE[row.tone] ?? ORG_TONE.gray}`}>
                        {row.initials}
                      </span>
                      <span className="text-token-sm font-medium text-text-primary-alt">{row.name}</span>
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-secondary-alt">{row.role}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-meta text-text-faint">{row.email}</td>
                  <td className="px-token-4 py-token-3">
                    <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-faint">{row.lastLogin}</td>
                  <td className="px-token-4 py-token-3">
                    <span className="flex items-center gap-token-3">
                      <DisabledLink label="Edit" title="Editing a user requires MOD-005 (User Management) endpoints (still PLANNED)." />
                      <DisabledLink label="Deactivate" title="Deactivating a user requires MOD-005 (User Management) endpoints (still PLANNED)." />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ConnectorsCard({ connectors }) {
  return (
    <Card
      title="Connectors"
      action={<DisabledLink label="Manage connectors" title="Connector management requires MOD-006 (Connectors) endpoints (still PLANNED)." />}
    >
      <div className="mb-token-4 flex flex-wrap items-center justify-between gap-token-3">
        <div className="flex flex-wrap items-center gap-token-2">
          {connectors.summary.map((s) => {
            const tone = s.tone === 'success' ? 'bg-success-bg text-success-strong' : s.tone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger-strong';
            return (
              <span key={s.key} className={`inline-flex rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${tone}`}>{s.label}</span>
            );
          })}
        </div>
        <span className="text-token-sm text-text-faint">{connectors.total} total connectors</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-muted">
              {['Connector', 'Type', 'Health', 'Last Sync', 'Auth Status', 'Action'].map((col) => (
                <th key={col} scope="col" className="border-y border-border-subtle px-token-4 py-token-3 text-left font-mono text-token-xs font-semibold uppercase tracking-[0.06em] text-text-faint">
                  {col === 'Action' ? <span className="sr-only">Action</span> : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {connectors.rows.map((row) => {
              const tone = RUN_TONE[row.health] ?? RUN_TONE.Warning;
              return (
                <tr key={row.id} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-token-4 py-token-3 text-token-sm font-medium text-text-primary-alt">{row.name}</td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-secondary-alt">{row.type}</td>
                  <td className="px-token-4 py-token-3">
                    <span className={`inline-flex items-center gap-token-2 rounded-full px-token-2 py-0.5 text-token-meta font-semibold ${tone.pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                      {row.health}
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-sm text-text-faint">{row.lastSync}</td>
                  <td className={`px-token-4 py-token-3 font-mono text-token-meta ${TEXT_TONE[row.authTone] ?? TEXT_TONE.default}`}>{row.auth}</td>
                  <td className="px-token-4 py-token-3">
                    <DisabledLink label="Test Connection" title="Testing a connection requires MOD-006 (Connectors) endpoints (still PLANNED)." />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AuditActivityCard({ items }) {
  return (
    <Card title="Recent Audit Activity" action={<DisabledLink label="View full audit log" title="The audit log requires MOD-007 (Audit) endpoints (still PLANNED)." />}>
      <ol className="m-0 flex list-none flex-col gap-token-4 p-0">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-token-4">
            <span className="w-20 shrink-0 pt-0.5 text-token-meta text-text-faint">{item.when}</span>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
            <div>
              <p className="m-0 flex flex-wrap items-center gap-token-2">
                <span className="text-token-sm font-semibold text-text-primary-alt">{item.action}</span>
                <span className="inline-flex rounded-sm bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success-strong">{item.outcome}</span>
              </p>
              <p className="m-0 mt-0.5 text-token-meta text-text-faint">{item.actor} · {item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-token-3 py-token-2">
      <span className="text-token-sm text-text-faint">{label}</span>
      <span className={`text-token-sm font-medium text-text-primary-alt ${mono ? 'font-mono text-token-meta' : ''}`}>{value}</span>
    </div>
  );
}

function InfoCard({ info }) {
  return (
    <Card title="Organization Info">
      <div className="flex flex-col divide-y divide-border-subtle">
        {info.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
        ))}
      </div>
    </Card>
  );
}

function MeterBar({ label, valueLabel, pct, tone }) {
  const barTone = tone === 'warning' ? 'bg-warning' : tone === 'danger' ? 'bg-danger' : 'bg-primary';
  return (
    <div className="pt-token-2">
      <div className="flex items-center justify-between">
        <span className="text-token-sm text-text-faint">{label}</span>
        <span className={`text-token-sm font-medium ${tone === 'warning' ? 'text-warning' : 'text-text-primary-alt'}`}>{valueLabel}</span>
      </div>
      <div className="mt-token-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span className={`block h-full rounded-full ${barTone}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

function SubscriptionCard({ subscription }) {
  return (
    <Card title="Subscription & Licensing">
      <div className="flex flex-col divide-y divide-border-subtle">
        <div className="flex items-center justify-between py-token-2">
          <span className="text-token-sm text-text-faint">Plan</span>
          <span className="inline-flex rounded-sm bg-shell-accent-wash px-token-2 py-0.5 text-token-meta font-semibold text-primary">{subscription.plan}</span>
        </div>
        <div className="flex items-center justify-between py-token-2">
          <span className="text-token-sm text-text-faint">Billing Status</span>
          <span className="inline-flex items-center gap-token-2 rounded-full bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            {subscription.billingStatus}
          </span>
        </div>
        <InfoRow label="Renewal Date" value={subscription.renewalDate} />
        <InfoRow label="License Limit" value={subscription.licenseLimit} />
        <InfoRow label="Active Users" value={subscription.activeUsers} />
        <div className="flex items-center justify-between py-token-2">
          <span className="text-token-sm text-text-faint">Remaining</span>
          <span className="text-token-sm font-medium text-success-strong">{subscription.remaining}</span>
        </div>
      </div>
      <div className="mt-token-3 flex flex-col gap-token-4">
        <MeterBar label="License utilization" valueLabel={subscription.licenseUtilizationLabel} pct={subscription.licenseUtilizationPct} tone="warning" />
        <MeterBar label={`Storage (${subscription.storageLabel})`} valueLabel={`${subscription.storagePct}%`} pct={subscription.storagePct} tone="default" />
      </div>
    </Card>
  );
}

function PlatformHealthCard({ items }) {
  return (
    <Card title="Platform Health">
      <div className="flex flex-col divide-y divide-border-subtle">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-token-2">
            <span className="text-token-sm text-text-faint">{item.label}</span>
            <span className={`inline-flex items-center gap-token-2 text-token-sm font-medium ${TEXT_TONE[item.tone] ?? TEXT_TONE.default}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONE[item.tone] ?? DOT_TONE.default}`} aria-hidden="true" />
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsCard({ actions }) {
  return (
    <Card title="Quick Actions">
      <ul className="m-0 flex list-none flex-col gap-token-1 p-0">
        {actions.map((action) => (
          <li key={action.key}>
            <button
              type="button"
              disabled
              title={`“${action.label}” requires its MOD-004 / related module endpoint (still PLANNED).`}
              className="flex w-full items-center justify-between rounded-md px-token-3 py-token-3 text-left text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action.label}
              <span aria-hidden="true" className="text-text-faint">→</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SecurityStatusCard({ items }) {
  return (
    <Card title="Security Status">
      <div className="flex flex-col divide-y divide-border-subtle">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-token-2">
            <span className="text-token-sm text-text-faint">{item.label}</span>
            <span className="inline-flex items-center gap-token-2 text-token-sm font-medium text-success-strong">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m3 8 3.5 3.5L13 4" />
              </svg>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScreenFooter({ data, isFetching }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-muted px-token-5 py-token-3 font-mono text-token-xs text-text-faint">
      <span className="flex items-center gap-token-2">
        <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
        {isFetching ? 'Refreshing…' : `Updated ${data.updatedAt}`}
      </span>
      {data.mocked && (
        <span
          className="font-semibold uppercase tracking-[0.04em] text-warning"
          title="MOD-004 (Organization Management) has no backend deployed yet — showing sample data, not live records."
        >
          Sample data
        </span>
      )}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-24 w-full animate-pulse rounded-md bg-surface-hover" />
      <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[1fr_360px]">
        <div className="h-[600px] animate-pulse rounded-md bg-surface-hover" />
        <div className="h-[600px] animate-pulse rounded-md bg-surface-hover" />
      </div>
    </div>
  );
}
