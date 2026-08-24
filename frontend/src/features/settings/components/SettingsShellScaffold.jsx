import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import bellIcon from '../../../assets/icons/bell.svg';

/**
 * TEMPORARY SCAFFOLD — scoped local layout, not the real shared app
 * shell. MOD-001 (Shell/Bootstrap) has not built the real AppShell /
 * Sidebar / Header components yet (SCR-009/010/011 all still PLANNED
 * in docs/modules/module-plan.md) — that module owns the canonical
 * authenticated chrome (real current-user data, real notification
 * panel, full nav tree) that every post-login screen will eventually
 * render inside.
 *
 * SCR-007's Figma frame (node 19:5237) is only reachable inside that
 * full shell, so this component reproduces just enough of its visual
 * structure (top bar + settings side-nav) to give the Change Password
 * form a faithful home now, per the user's explicit decision to build
 * a local scaffold rather than block on MOD-001 or fabricate the real
 * shell. It is intentionally static (hardcoded user initials/nav) and
 * MUST be deleted/replaced once MOD-001 ships the real AppShell —
 * tracked in docs/modules/module-plan.md's MOD-001 entry, not
 * reintroduced as permanent product chrome.
 *
 * Known deferred gaps (per SCR-007 UI review, non-blocking since this
 * whole component is temporary): the non-active nav labels have no
 * aria-disabled/visual cue distinguishing "not built yet" from a real
 * link; the active-item background uses an inline rgba() value rather
 * than a token — should become a `--color-primary-wash`-style token
 * if this pattern is ever carried into the real MOD-001 AppShell.
 */
export default function SettingsShellScaffold({ activeItem, children }) {
  const securityNav = [
    { key: 'security', label: 'Security', href: null },
    { key: 'change-password', label: 'Change password', indent: true },
    { key: 'two-factor', label: 'Two-factor auth', indent: true },
    { key: 'active-sessions', label: 'Active sessions', indent: true },
  ];

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex h-12 items-center justify-between border-b border-border bg-surface-card px-token-6">
        <div className="flex items-center gap-3.5">
          <img src={meridianLogomark} alt="" className="block h-[25px] w-8" />
          <div>
            <p className="m-0 text-token-sm font-semibold tracking-[-0.02em] text-text-primary">ConnectIQ</p>
            <p className="m-0 font-mono text-token-xs font-medium uppercase tracking-[0.08em] text-text-muted">Enterprise</p>
          </div>
        </div>
        <div className="flex items-center gap-token-4">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Notifications"
          >
            <img src={bellIcon} alt="" className="block h-[15px] w-[15px]" />
          </button>
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-token-3 rounded-md py-1 pl-1 pr-token-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-token-meta font-semibold text-text-on-primary">
              AC
            </span>
            <span className="text-token-base font-medium text-text-primary">A. Chen</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <nav aria-label="Settings" className="shrink-0 overflow-x-auto border-b border-border bg-surface-card py-token-3 lg:min-h-[calc(100vh-48px)] lg:w-56 lg:overflow-x-visible lg:border-b-0 lg:border-r lg:py-token-5">
          <p className="m-0 px-token-5 pb-token-2 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Account
          </p>
          {['Profile', 'Preferences', 'Notifications'].map((label) => (
            <span key={label} className="block border-l-2 border-transparent py-2 pl-[18px] pr-token-5 text-token-base text-text-secondary-strong">
              {label}
            </span>
          ))}

          <p className="m-0 px-token-5 pb-token-2 pt-token-5 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Security
          </p>
          {securityNav.map((item) => {
            const isActive = item.key === activeItem;
            return (
              <span
                key={item.key}
                className={`block border-l-2 py-2 pr-token-5 text-token-sm ${item.indent ? 'pl-[38px]' : 'pl-[18px]'} ${
                  isActive
                    ? 'border-primary font-medium text-primary'
                    : item.href === null && !item.indent
                      ? 'border-transparent font-medium text-text-primary'
                      : 'border-transparent text-text-secondary-strong'
                }`}
                style={isActive ? { backgroundColor: 'rgba(15, 86, 153, 0.06)' } : undefined}
              >
                {item.label}
              </span>
            );
          })}

          <p className="m-0 px-token-5 pb-token-2 pt-token-5 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Organization
          </p>
          {['Team members', 'Integrations', 'API keys', 'Audit logs'].map((label) => (
            <span key={label} className="block border-l-2 border-transparent py-2 pl-[18px] pr-token-5 text-token-base text-text-secondary-strong">
              {label}
            </span>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-token-5 py-token-6 sm:px-6 sm:py-7 lg:px-9 lg:py-8">
          <nav aria-label="Breadcrumb" className="mb-token-6 flex items-center gap-1.5 text-token-sm text-text-muted">
            <span>Settings</span>
            <span aria-hidden="true" className="text-text-faint">
              ›
            </span>
            <span>Security</span>
            <span aria-hidden="true" className="text-text-faint">
              ›
            </span>
            <span className="font-medium text-text-secondary-strong">Change password</span>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
