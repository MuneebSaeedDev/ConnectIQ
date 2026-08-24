/**
 * Global status footer (Figma node 211:2024, "Footer"). Shared across
 * every authenticated role, identical structure regardless of role.
 *
 * MOCK BOUNDARY: every stat here (active pipelines, workers, queue
 * depth, throughput, system status, app version) reproduces the Figma
 * frame's literal values. No MOD-008 (Pipeline Builder & Execution)
 * or MOD-009 (Analytics/Monitoring Dashboards) backend exists to
 * source real-time figures yet — same precedent as SCR-009's
 * dashboardApi.js mock boundary. `stats` is a prop so a real data
 * source can replace `DEFAULT_STATS` without touching this
 * component's markup once that backend exists.
 */
const DEFAULT_STATS = {
  systemStatus: 'All systems operational',
  activePipelines: 24,
  workers: '8 / 10',
  queueDepth: 142,
  throughput: '48.2K rec/min',
  version: 'v2.14.1',
};

export default function Footer({ stats = DEFAULT_STATS }) {
  return (
    <div
      className="flex h-9 shrink-0 items-center gap-token-4 overflow-x-auto border-t border-border bg-surface-card px-token-4 font-mono sm:gap-token-5 sm:px-token-6"
      data-node-id="211:2024"
    >
      <div className="flex flex-1 items-center gap-token-4">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-sm bg-success" aria-hidden="true" />
          <span className="whitespace-nowrap font-sans text-token-meta font-medium text-text-secondary-strong">
            {stats.systemStatus}
          </span>
        </div>

        <FooterDivider />
        <FooterStat label="Active Pipelines" value={stats.activePipelines} />
        <FooterDivider />
        <FooterStat label="Workers" value={stats.workers} />
        <span className="hidden items-center gap-token-4 md:flex">
          <FooterDivider />
          <FooterStat label="Queue Depth" value={stats.queueDepth} />
          <FooterDivider />
          <FooterStat label="Throughput" value={stats.throughput} />
        </span>
      </div>

      <div className="hidden shrink-0 items-center gap-token-4 lg:flex">
        <span className="whitespace-nowrap text-token-meta text-decorative-faint">{stats.version}</span>
        <FooterDivider />
        <a href="/status" className="whitespace-nowrap font-sans text-token-meta text-decorative-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Status
        </a>
        <a href="/docs" className="whitespace-nowrap font-sans text-token-meta text-decorative-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Docs
        </a>
        <a href="/support" className="whitespace-nowrap font-sans text-token-meta text-decorative-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Support
        </a>
        <span className="whitespace-nowrap font-sans text-token-meta text-decorative-faint">© 2026 ConnectIQ</span>
      </div>
    </div>
  );
}

function FooterDivider() {
  return <span className="h-3.5 w-px shrink-0 bg-border-subtle" aria-hidden="true" />;
}

function FooterStat({ label, value }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="whitespace-nowrap font-sans text-token-meta text-decorative-faint">{label}</span>
      <span className="whitespace-nowrap text-token-meta font-semibold text-text-secondary-strong">{value}</span>
    </div>
  );
}
