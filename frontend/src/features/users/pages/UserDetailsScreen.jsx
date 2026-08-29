import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useUserDetails } from '../hooks/useUserDetails';
import { ROLE_ACCESS_SCOPE, FEATURE_ACCESS_BY_LICENSE } from '../services/userDetails.api';

/* Scope this view to the caller's organization. MOD-004/MOD-005 have no
   live "current org" endpoint, so this mirrors the id used by the sibling
   org-scoped screens (SCR-032/033/034) until org context ships. */
const ORG_ID = 'current';

const STATUS_TONE = {
  Active: 'bg-success-bg text-success-strong',
  Locked: 'bg-warning-bg text-warning',
  Pending: 'bg-shell-accent-wash text-primary',
  Suspended: 'bg-danger-bg text-danger-strong',
};

/* Recent-activity tag → token tone (reuses existing utilities only). */
const TAG_TONE = {
  Auth: 'bg-shell-accent-wash text-primary',
  Pipeline: 'bg-success-bg text-success-strong',
  Connector: 'bg-warning-bg text-warning',
  Profile: 'bg-surface-muted text-text-secondary-alt',
  Role: 'bg-danger-bg text-danger-strong',
  'Data Quality': 'bg-shell-accent-wash text-primary',
};

const MOD005_TITLE = 'Requires the MOD-005 user backend, which is not deployed yet.';

/** SCR-035 — User Details Screen. Node 105:9208, Figma page "Page 1". */
export default function UserDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useUserDetails(ORG_ID, id);

  const displayName = data ? data.name : id;

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Administration', 'Users', displayName]}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Loading user details' : isError ? 'Couldn’t load user' : data ? `${displayName} details loaded` : ''}
        </span>

        <BackLink />

        {isLoading && <DetailSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load user</p>
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

        {data && <DetailView user={data} userId={id} navigate={navigate} />}
      </div>
    </AppShell>
  );
}

function BackLink() {
  return (
    <div className="flex items-center gap-token-2 text-token-sm text-text-faint">
      <Link
        to="/users"
        className="font-medium text-text-secondary-alt hover:text-text-primary-alt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ← Back to Users
      </Link>
    </div>
  );
}

function DetailView({ user, userId, navigate }) {
  const statusTone = STATUS_TONE[user.status] ?? STATUS_TONE.Active;
  const scope = ROLE_ACCESS_SCOPE[user.roles.primaryRole] ?? null;
  const featureAccess = FEATURE_ACCESS_BY_LICENSE[user.licenseInfo.type] ?? null;

  return (
    <div className="flex flex-col gap-token-6">
      {user.mocked && (
        <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="status">
          <IconInfo className="mt-0.5 block h-4 w-4 shrink-0 text-warning" />
          <p className="m-0 text-token-sm text-warning">
            <span className="font-semibold">Sample data.</span> The MOD-005 user backend is not
            deployed yet, so this record is design-sourced and read-only. No live user was loaded.
          </p>
        </div>
      )}

      {/* Hero header */}
      <Hero user={user} statusTone={statusTone} userId={userId} navigate={navigate} />

      <div className="grid grid-cols-1 gap-token-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="flex flex-col gap-token-5">
          <UserSummaryCard user={user} />
          <AccountStatusCard status={user.accountStatus} />
          <SecurityHealthCard health={user.securityHealth} />
          <LicenseSummaryCard license={user.license} />
          <QuickActionsCard userId={userId} navigate={navigate} />
        </aside>

        {/* Main content — 8 numbered sections */}
        <div className="flex flex-col gap-token-6">
          <Section index={1} title="User Profile">
            <dl className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              {user.profile.map((f) => (
                <DetailField key={f.label} label={f.label} value={f.value} mono={f.mono} />
              ))}
            </dl>
          </Section>

          <Section index={2} title="Organization Assignment">
            <dl className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <LinkField label="Department" item={user.organization.department} navigate={navigate} />
              <LinkField label="Team" item={user.organization.team} navigate={navigate} />
              <LinkField label="Reporting Manager" item={user.organization.manager} navigate={navigate} />
              <DetailField label="Business Unit" value={user.organization.businessUnit} />
              <DetailField label="Cost Center" value={user.organization.costCenter} mono />
              <DetailField label="Reporting Line" value={user.organization.reportingLine} />
            </dl>
          </Section>

          <Section index={3} title="Roles & Permissions">
            <dl className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <DetailField label="Primary Role" value={user.roles.primaryRole} />
              <DetailField label="Permission Group" value={user.roles.permissionGroup} />
              <DetailField label="Additional Roles" value={user.roles.additionalRoles} />
              <DetailField label="Administrative Privileges" value={user.roles.administrativePrivileges} />
              <DetailField label="Resource Access Profile" value={user.roles.resourceAccessProfile} />
            </dl>
            {scope && (
              <div className="mt-token-5 rounded-md border border-border-subtle bg-surface-muted p-token-4">
                <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-text-primary-alt">
                  <IconInfo className="block h-4 w-4 shrink-0 text-primary" />
                  {user.roles.primaryRole} Effective Access Scope
                </p>
                <p className="m-0 mt-token-2 text-token-sm text-text-secondary-alt">{scope}</p>
              </div>
            )}
            <div className="mt-token-4">
              <ViewLink label="View Permission Details" onClick={() => navigate(`/users/${encodeURIComponent(userId)}/permissions`)} />
            </div>
          </Section>

          <Section index={4} title="License Information">
            <dl className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <DetailField label="License Type" value={user.licenseInfo.type} />
              <DetailField label="Status" value={user.licenseInfo.status} />
              <DetailField label="Assigned" value={user.licenseInfo.assigned} />
              <DetailField label="Expiration" value={user.licenseInfo.expiration} />
              <DetailField label="Seat Number" value={user.licenseInfo.seatNumber} mono />
              <DetailField label="Last Verified" value={user.licenseInfo.lastVerified} />
            </dl>
            {featureAccess && (
              <div className="mt-token-5">
                <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Enabled Features</p>
                <ul className="mt-token-3 grid grid-cols-1 gap-token-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(featureAccess).map(([feature, enabled]) => (
                    <li
                      key={feature}
                      className={`flex items-center gap-token-2 rounded-md border px-token-3 py-token-2 text-token-sm ${enabled ? 'border-success bg-success-bg text-success-strong' : 'border-border-subtle bg-surface-muted text-text-faint'}`}
                    >
                      {enabled ? <IconCheck className="block h-3.5 w-3.5 shrink-0" /> : <IconX className="block h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section index={5} title="Authentication & Security">
            <dl className="grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              {user.security.map((f) => (
                <DetailField key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
            <div className="mt-token-5 rounded-md border border-border-subtle bg-surface-muted p-token-4">
              <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Administrative Actions</p>
              <p className="m-0 mt-token-1 text-token-meta text-text-faint">
                These actions require the MOD-005 user backend, which is not deployed yet.
              </p>
              <div className="mt-token-3 flex flex-wrap gap-token-2">
                {['Reset Password', 'Unlock Account', 'Force Logout'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    title={MOD005_TITLE}
                    className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section index={6} title="Assigned Resources">
            <ul className="grid grid-cols-2 gap-token-3 sm:grid-cols-3">
              {user.resources.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => navigate(r.to)}
                    className="flex w-full flex-col items-start gap-token-1 rounded-md border border-border-subtle bg-surface-card p-token-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="text-token-lg font-semibold text-text-primary-alt">{r.count}</span>
                    <span className="flex items-center gap-token-1 text-token-sm text-text-secondary-alt">
                      {r.label}
                      <IconArrow className="block h-3.5 w-3.5 text-text-faint" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section index={7} title="Recent Activity">
            <ul className="flex flex-col gap-token-2">
              {user.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-token-3 rounded-md border border-border-subtle px-token-4 py-token-3">
                  <span className="flex min-w-0 items-start gap-token-3">
                    <span className={`mt-0.5 shrink-0 rounded-sm px-token-2 py-0.5 font-mono text-token-meta font-semibold uppercase tracking-[0.04em] ${TAG_TONE[a.tag] ?? 'bg-surface-muted text-text-faint'}`}>
                      {a.tag}
                    </span>
                    <span className="truncate text-token-sm text-text-primary-alt">{a.label}</span>
                  </span>
                  <span className="shrink-0 text-token-meta text-text-faint">{a.meta}</span>
                </li>
              ))}
            </ul>
            <div className="mt-token-4">
              <ViewLink label="View Full Activity History" onClick={() => navigate(`/users/${encodeURIComponent(userId)}/activity`)} />
            </div>
          </Section>

          <Section index={8} title="Audit History">
            <ul className="flex flex-col gap-token-2">
              {user.auditHistory.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-token-3 rounded-md border border-border-subtle px-token-4 py-token-3">
                  <span className="min-w-0">
                    <span className="block truncate text-token-sm font-medium text-text-primary-alt">{a.action}</span>
                    <span className="block text-token-meta text-text-faint">by {a.actor}</span>
                  </span>
                  <span className="shrink-0 text-token-meta text-text-faint">{a.meta}</span>
                </li>
              ))}
            </ul>
            <div className="mt-token-4">
              <ViewLink label="View Audit Log" onClick={() => navigate('/organizations/current/activity')} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---- Hero header ---------------------------------------------------- */

function Hero({ user, statusTone, userId, navigate }) {
  const chips = [
    { label: user.primaryRole, tone: 'bg-shell-accent-wash text-primary' },
    { label: `MFA ${user.mfa ? 'On' : 'Off'}`, tone: user.mfa ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-faint' },
    { label: `SSO ${user.sso ? 'On' : 'Off'}`, tone: user.sso ? 'bg-success-bg text-success-strong' : 'bg-surface-muted text-text-faint' },
    { label: user.licenseType, tone: 'bg-surface-muted text-text-secondary-alt' },
  ];
  return (
    <div className="flex flex-col gap-token-4 rounded-md border border-border bg-surface-card p-token-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-token-4">
        <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash font-mono text-token-lg font-semibold text-primary">
          {user.initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-token-3">
            <h1 className="m-0 text-token-xl font-bold text-text-primary-alt">{user.name}</h1>
            <span className={`inline-flex items-center gap-token-2 rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${statusTone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {user.status}
            </span>
          </div>
          <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{user.subtitle}</p>
          <div className="mt-token-3 flex flex-wrap gap-token-2">
            {chips.map((c) => (
              <span key={c.label} className={`rounded-full px-token-3 py-0.5 text-token-meta font-semibold ${c.tone}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-token-2">
        <button type="button" disabled title={MOD005_TITLE} className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Reset Password
        </button>
        <button type="button" disabled title={MOD005_TITLE} className="h-9 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          Suspend User
        </button>
        <button type="button" disabled title={MOD005_TITLE} className="h-9 rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60">
          More ▾
        </button>
        <button
          type="button"
          onClick={() => navigate(`/users/${encodeURIComponent(userId)}/edit`)}
          className="flex h-9 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Edit User
        </button>
      </div>
    </div>
  );
}

/* ---- Section + field primitives ------------------------------------- */

function Section({ index, title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-token-meta font-semibold text-primary">
          {index}
        </span>
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
      </div>
      <div className="mt-token-5">{children}</div>
    </section>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-token-1 border-b border-border-subtle pb-token-3 last:border-b-0 sm:border-b-0 sm:pb-0">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 text-token-sm font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function LinkField({ label, item, navigate }) {
  return (
    <div className="flex flex-col gap-token-1">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className="m-0">
        <button
          type="button"
          onClick={() => navigate(item.to)}
          className="inline-flex items-center gap-token-1 text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {item.label}
          <IconArrow className="block h-3.5 w-3.5" />
        </button>
      </dd>
    </div>
  );
}

function ViewLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-token-1 text-token-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {label}
      <IconArrow className="block h-3.5 w-3.5" />
    </button>
  );
}

/* ---- Left rail cards ------------------------------------------------- */

function SidebarCard({ title, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>
      <div className="mt-token-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-token-3">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 truncate text-right text-token-meta font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function UserSummaryCard({ user }) {
  return (
    <SidebarCard title="User Summary">
      <div className="flex items-center gap-token-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shell-accent-wash text-token-sm font-semibold text-primary">
          {user.initials}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-token-sm font-semibold text-text-primary-alt">{user.name}</p>
          <p className="m-0 truncate text-token-meta text-text-faint">{user.email}</p>
        </div>
      </div>
      <dl className="mt-token-4 flex flex-col gap-token-2">
        <SummaryRow label="User ID" value={user.userId} mono />
        <SummaryRow label="Employee ID" value={user.employeeId} mono />
        <SummaryRow label="Job Title" value={user.jobTitle} />
        <SummaryRow label="Primary Role" value={user.primaryRole} />
      </dl>
    </SidebarCard>
  );
}

function AccountStatusCard({ status }) {
  const rows = [
    ['Status', status.status],
    ['Last Login', status.lastLogin],
    ['Login Method', status.loginMethod],
    ['Invitation Accepted', status.invitationAccepted],
    ['Account Age', status.accountAge],
    ['Member Since', status.memberSince],
  ];
  return (
    <SidebarCard title="Account Status">
      <dl className="flex flex-col gap-token-2">
        {rows.map(([label, value]) => <SummaryRow key={label} label={label} value={value} />)}
      </dl>
    </SidebarCard>
  );
}

function SecurityHealthCard({ health }) {
  return (
    <SidebarCard title="Security Health">
      <ul className="flex flex-col gap-token-2">
        {health.checklist.map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-token-3">
            <span className="flex items-center gap-token-2 text-token-meta text-text-secondary-alt">
              {c.ok
                ? <IconCheck className="block h-3.5 w-3.5 text-success" />
                : <IconAlert className="block h-3.5 w-3.5 text-warning" />}
              {c.label}
            </span>
            <span className={`text-token-meta font-semibold ${c.ok ? 'text-success-strong' : 'text-warning'}`}>
              {c.ok ? 'OK' : 'Review'}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-token-4 flex flex-col gap-token-2 border-t border-border-subtle pt-token-3">
        <SummaryRow label="Password Age" value={health.passwordAge} />
        <SummaryRow label="Active Sessions" value={health.activeSessions} />
        <SummaryRow label="Failed (24h)" value={health.failedLogins24h} />
      </dl>
    </SidebarCard>
  );
}

function LicenseSummaryCard({ license }) {
  const rows = [
    ['Type', license.type],
    ['Status', license.status],
    ['Assigned', license.assigned],
    ['Expiration', license.expiration],
    ['Seat', license.seat],
    ['Features', license.featuresLabel],
  ];
  return (
    <SidebarCard title="License Summary">
      <dl className="flex flex-col gap-token-2">
        {rows.map(([label, value]) => <SummaryRow key={label} label={label} value={value} mono={label === 'Seat'} />)}
      </dl>
    </SidebarCard>
  );
}

function QuickActionsCard({ userId, navigate }) {
  const actions = [
    { label: 'Edit User', onClick: () => navigate(`/users/${encodeURIComponent(userId)}/edit`) },
    { label: 'Manage Permissions', onClick: () => navigate(`/users/${encodeURIComponent(userId)}/permissions`) },
    { label: 'View Activity', onClick: () => navigate(`/users/${encodeURIComponent(userId)}/activity`) },
    { label: 'View Audit Log', onClick: () => navigate('/organizations/current/activity') },
  ];
  const disabledActions = [
    { label: 'Reset Password', title: MOD005_TITLE },
    { label: 'Suspend User', title: MOD005_TITLE },
  ];
  return (
    <SidebarCard title="Quick Actions">
      <div className="flex flex-col gap-token-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {a.label}
            <IconArrow className="block h-3.5 w-3.5 text-text-faint" />
          </button>
        ))}
        {disabledActions.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled
            title={a.title}
            className="flex h-9 items-center rounded-md border border-border bg-surface-card px-token-3 text-token-sm font-medium text-text-secondary-alt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {a.label}
          </button>
        ))}
      </div>
    </SidebarCard>
  );
}

/* ---- Loading skeleton ----------------------------------------------- */

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-28 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-token-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-md border border-border bg-surface-muted" />
          ))}
        </div>
        <div className="flex flex-col gap-token-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-md border border-border bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor) ------------------------------------ */

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function IconArrow({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3M8 5.5h.01" />
    </svg>
  );
}

function IconAlert({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}
