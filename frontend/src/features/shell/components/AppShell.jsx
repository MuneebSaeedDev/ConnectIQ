import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { sidebarToggled } from '../state/sessionSlice';
import { ROLE_LABELS } from '../rbac/permissions';

/**
 * Real shared AppShell (MOD-001) — Header (211:1981), Sidebar
 * (expanded 213:5159 / collapsed 213:5708), and Footer (211:2024)
 * composed around routed page content. Structure/layout is identical
 * for every role; only the Sidebar's menu content is filtered by the
 * current session's role (see rbac/useVisibleNav.js). This replaces
 * the temporary `AppShellScaffold`/`SettingsShellScaffold` components
 * built for SCR-007/SCR-008/SCR-009 — those screens should migrate to
 * this component (tracked as follow-up work; not done in this pass,
 * see docs/figma/screen-inventory.md's MOD-001 build notes for the
 * migration record).
 *
 * `breadcrumb` is forwarded to Header so each page can describe its
 * own location without this shell hardcoding page titles.
 */
/**
 * Below the `lg` breakpoint the Sidebar can't sit permanently beside
 * the content column (no room at mobile/tablet widths) — it becomes an
 * off-canvas drawer toggled by Header's hamburger button, overlaid on
 * top of the page behind a scrim instead of pushing content. Desktop
 * keeps the original expanded/collapsed push-layout behavior
 * (`sidebarCollapsed`, unchanged) since that's real, deliberately
 * saved session state, not something the mobile drawer should affect.
 */
export default function AppShell({ breadcrumb, children }) {
  const dispatch = useDispatch();
  const { currentUser, role, sidebarCollapsed } = useSelector((state) => state.session);
  const roleLabel = ROLE_LABELS[role] ?? role;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileNavOpen(false);
  }

  return (
    <div className="flex h-full bg-surface-page overflow-hidden">
      {/* Sidebar spans the full viewport height and touches the top
          edge — it sits beside the Header/main/Footer column, not
          under a full-width Header (fixed per user report: the
          sidebar previously started below the Header instead of
          flush with the top). */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => dispatch(sidebarToggled())}
          currentUser={currentUser}
          roleLabel={roleLabel}
        />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-overlay-scrim"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar
              role={role}
              collapsed={false}
              onToggleCollapsed={() => setMobileNavOpen(false)}
              currentUser={currentUser}
              roleLabel={roleLabel}
            />
          </div>
        </div>
      )}

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          breadcrumb={breadcrumb}
          currentUser={currentUser}
          roleLabel={roleLabel}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        {/* The ONLY vertical scroll container in the app. `min-h-0`
            lets it shrink inside the flex column so it scrolls instead
            of expanding the shell; `overscroll-contain` stops wheel/
            trackpad scroll from chaining to the (locked) document once
            the top/bottom is reached. */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-token-5 py-token-6 sm:px-6 sm:py-7 lg:px-9 lg:py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
