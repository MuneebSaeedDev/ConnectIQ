import { useEffect, useId, useRef, useState } from 'react';
import searchIcon from '../../../assets/icons/shell/search.svg';
import helpIcon from '../../../assets/icons/shell/help.svg';
import bellIcon from '../../../assets/icons/shell/notification-bell.svg';
import orgChevron from '../../../assets/icons/shell/org-switch-chevron.svg';
import NotificationPanel from '../../notifications/components/NotificationPanel';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import UserProfileMenu from './UserProfileMenu';

/**
 * Global top bar (Figma node 211:1981, "Header"). Shared across every
 * authenticated role — the task requires identical Header/Footer/
 * Sidebar visual structure for every role, so this component takes no
 * role prop and renders unconditionally; only the Sidebar's menu
 * content varies by role.
 *
 * `breadcrumb` lets the page tell the shell which section it's in
 * (Figma shows "ConnectIQ › Pipelines › Monitoring" as static content
 * for one screen — this shell generalizes it to a prop rather than
 * hardcoding "Monitoring" everywhere the shell is reused). Defaults to
 * the app name alone so a screen that hasn't wired a breadcrumb yet
 * still renders a valid header instead of an empty one.
 *
 * MOCK BOUNDARY: the org switcher's "Acme Corp" label is static per
 * the Figma frame — no MOD-004 (Organization Management) backend
 * exists yet to source a real organization list. It renders as a
 * real, focusable button (not a fabricated dropdown) so its eventual
 * wiring doesn't require restructuring the markup.
 *
 * The notification bell opens the real SCR-012 Notification Panel
 * (see features/notifications/) — its unread badge and panel content
 * are live client state (React Query + a mock-fallback API), not
 * static Figma content; see notifications.api.js for that mock
 * boundary.
 */
export default function Header({ breadcrumb = ['ConnectIQ'], currentUser, roleLabel, onOpenMobileNav }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const bellButtonRef = useRef(null);
  const panelId = useId();
  const panelTitleId = useId();
  const notifications = useNotifications();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef(null);
  const profileMenuId = useId();
  const profileMenuTitleId = useId();

  useEffect(() => {
    if (!notificationsOpen) return;

    // Focus moves into the dialog on open (mirrors the SCR-008 logout
    // dialog's focus-on-mount fix) — without this, aria-haspopup/
    // role="dialog" announce a dialog opened but leave focus stranded
    // on the bell button.
    const panel = notificationsRef.current?.querySelector(`#${panelId}`);
    const focusable = panel?.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function getFocusable() {
      return notificationsRef.current
        ? Array.from(
            notificationsRef.current.querySelectorAll(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
    }

    function handlePointerDown(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        bellButtonRef.current?.focus();
        return;
      }
      // Focus trap: while the dialog is open, Tab/Shift+Tab cycle only
      // within its focusable elements rather than escaping into the
      // rest of the header/page (a role="dialog" must trap focus).
      if (event.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen, panelId]);

  return (
    <div
      className="flex h-12 shrink-0 items-center gap-token-3 border-b border-border bg-surface-card px-token-4 sm:gap-token-5 sm:px-token-6"
      data-node-id="211:1981"
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden lg:flex-[547]">
        {breadcrumb.map((crumb, index) => {
          const isLast = index === breadcrumb.length - 1;
          // On narrow screens, collapse everything but the final
          // (current-page) crumb — the full trail still exists for
          // larger screens where there's room to show it.
          if (!isLast && breadcrumb.length > 1) {
            return (
              <span key={`${crumb}-${index}`} className="hidden items-center gap-1.5 sm:flex">
                <span
                  className="whitespace-nowrap text-token-base text-decorative-muted"
                >
                  {crumb}
                </span>
                <span aria-hidden="true" className="text-decorative-faint">›</span>
              </span>
            );
          }
          return (
            <span key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-1.5">
              <span
                className="truncate text-token-base font-medium text-text-primary"
                aria-current="page"
              >
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>

      <label className="hidden h-8 shrink-0 items-center gap-token-3 rounded-md border border-border bg-surface-page px-token-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary md:flex">
        <img src={searchIcon} alt="" className="block h-3.5 w-2.5" />
        <input
          type="search"
          placeholder="Search pipelines, executions…"
          aria-label="Search pipelines, executions"
          className="w-32 bg-transparent text-token-base text-text-primary placeholder:text-text-primary/50 focus:outline-none lg:w-48"
        />
        <kbd className="hidden rounded-sm bg-border-subtle px-1 py-px font-mono text-[10px] text-decorative-faint lg:inline-block">⌘K</kbd>
      </label>

      <button
        type="button"
        aria-label="Search pipelines, executions"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-page text-text-secondary md:hidden"
      >
        <img src={searchIcon} alt="" className="block h-3.5 w-2.5" />
      </button>

      <div className="flex shrink-0 items-center gap-token-2">
        <button
          type="button"
          aria-label="Help"
          className="hidden h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex"
        >
          <img src={helpIcon} alt="" className="block h-[15px] w-[15px]" />
        </button>

        <div ref={notificationsRef} className="relative">
          <button
            ref={bellButtonRef}
            type="button"
            aria-label={notifications.unreadCount > 0 ? `Notifications, ${notifications.unreadCount} unread` : 'Notifications'}
            aria-haspopup="dialog"
            aria-expanded={notificationsOpen}
            aria-controls={notificationsOpen ? panelId : undefined}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src={bellIcon} alt="" className="block h-[15px] w-[15px]" />
            {notifications.unreadCount > 0 && (
              <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-sm border border-surface-card bg-danger" aria-hidden="true" />
            )}
          </button>
          {notificationsOpen && (
            <NotificationPanel
              panelId={panelId}
              titleId={panelTitleId}
              items={notifications.items}
              unreadCount={notifications.unreadCount}
              isLoading={notifications.isLoading}
              isError={notifications.isError}
              onRetry={notifications.refetch}
              onMarkAllRead={notifications.markAllRead}
              isMarkingAllRead={notifications.isMarkingAllRead}
              markAllReadFailed={notifications.markAllReadFailed}
              mocked={notifications.mocked}
              onRequestClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        <span className="hidden h-5 w-px bg-border-subtle sm:block" aria-hidden="true" />

        <button
          type="button"
          className="hidden h-8 items-center gap-1.5 rounded-md border border-border bg-surface-page px-token-3 text-token-base font-medium text-text-primary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-shell-accent text-[9px] font-bold tracking-tight text-text-on-primary">
            AC
          </span>
          Acme Corp
          <img src={orgChevron} alt="" className="block h-3 w-3" />
        </button>

        <div className="relative">
          <button
            ref={profileButtonRef}
            type="button"
            aria-label={`User menu — ${currentUser?.name ?? 'Account'}`}
            aria-haspopup="dialog"
            aria-expanded={profileMenuOpen}
            aria-controls={profileMenuOpen ? profileMenuId : undefined}
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-shell-accent-border bg-shell-accent-wash text-[10px] font-bold text-shell-accent shadow-sm transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {currentUser?.initials ?? 'U'}
          </button>
          {profileMenuOpen && (
            <UserProfileMenu
              menuId={profileMenuId}
              titleId={profileMenuTitleId}
              currentUser={currentUser}
              roleLabel={roleLabel}
              triggerRef={profileButtonRef}
              onRequestClose={() => setProfileMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
