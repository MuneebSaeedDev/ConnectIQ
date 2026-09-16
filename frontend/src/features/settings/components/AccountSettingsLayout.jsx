import { NavLink, useNavigate } from 'react-router-dom';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import bellIcon from '../../../assets/icons/bell.svg';

export default function AccountSettingsLayout({ activeItem, breadcrumbTail = '', children }) {
  const navigate = useNavigate();

  const accountNav = [
    { key: 'profile', label: 'Profile', href: '/account/profile' },
    { key: 'preferences', label: 'Preferences', href: '/account/preferences' },
    { key: 'notifications', label: 'Notifications', href: '/account/notifications' },
  ];

  const securityNav = [
    { key: 'change-password', label: 'Change password', href: '/account/change-password' },
    { key: 'two-factor', label: 'Two-factor auth', href: '/account/two-factor' },
    { key: 'active-sessions', label: 'Active sessions', href: '/account/active-sessions' },
  ];

  const orgNav = [
    { key: 'team-members', label: 'Team members', href: '/account/team-members' },
    { key: 'integrations', label: 'Integrations', href: '/account/integrations' },
    { key: 'api-keys', label: 'API keys', href: '/account/api-keys' },
    { key: 'audit-logs', label: 'Audit logs', href: '/account/audit-logs' },
  ];

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex h-12 items-center justify-between border-b border-border bg-surface-card px-token-6">
        <div
          className="flex cursor-pointer items-center gap-3.5"
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}
        >
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
            onClick={() => navigate('/account/notifications')}
          >
            <img src={bellIcon} alt="" className="block h-[15px] w-[15px]" />
          </button>
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <div
            className="flex cursor-pointer items-center gap-token-3 rounded-md py-1 pl-1 pr-token-3 hover:bg-surface-hover"
            onClick={() => navigate('/account/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/account/profile')}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-token-meta font-semibold text-text-on-primary">
              MC
            </span>
            <span className="text-token-base font-medium text-text-primary">M. Chen</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <nav aria-label="Settings" className="shrink-0 overflow-x-auto border-b border-border bg-surface-card py-token-3 lg:min-h-[calc(100vh-48px)] lg:w-56 lg:overflow-x-visible lg:border-b-0 lg:border-r lg:py-token-5">
          <p className="m-0 px-token-5 pb-token-2 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Account
          </p>
          {accountNav.map((item) => (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                `block border-l-2 py-2 pl-[18px] pr-token-5 text-token-sm transition-colors ${
                  isActive || activeItem === item.key
                    ? 'border-primary bg-primary/[0.06] font-medium text-primary'
                    : 'border-transparent text-text-secondary-strong hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <p className="m-0 px-token-5 pb-token-2 pt-token-5 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Security
          </p>
          <span className="block border-l-2 border-transparent py-1.5 pl-[18px] pr-token-5 text-token-sm font-medium text-text-primary">
            Security Overview
          </span>
          {securityNav.map((item) => (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                `block border-l-2 py-2 pl-[38px] pr-token-5 text-token-sm transition-colors ${
                  isActive || activeItem === item.key
                    ? 'border-primary bg-primary/[0.06] font-medium text-primary'
                    : 'border-transparent text-text-secondary-strong hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <p className="m-0 px-token-5 pb-token-2 pt-token-5 font-mono text-token-meta font-semibold uppercase tracking-[0.08em] text-text-muted">
            Organization
          </p>
          {orgNav.map((item) => (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                `block border-l-2 py-2 pl-[18px] pr-token-5 text-token-sm transition-colors ${
                  isActive || activeItem === item.key
                    ? 'border-primary bg-primary/[0.06] font-medium text-primary'
                    : 'border-transparent text-text-secondary-strong hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-token-5 py-token-6 sm:px-6 sm:py-7 lg:px-9 lg:py-8">
          <nav aria-label="Breadcrumb" className="mb-token-6 flex items-center gap-1.5 text-token-sm text-text-muted">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate('/dashboard')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}
            >
              Settings
            </span>
            <span aria-hidden="true" className="text-text-faint">
              ›
            </span>
            <span className="font-medium text-text-secondary-strong">{breadcrumbTail || activeItem}</span>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
