import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import icoUser from '../../../assets/icons/profile-menu/ico-drop-user.svg';
import icoSettings from '../../../assets/icons/profile-menu/ico-drop-settings.svg';
import icoShield from '../../../assets/icons/profile-menu/ico-drop-shield.svg';
import icoSliders from '../../../assets/icons/profile-menu/ico-sliders.svg';
import icoBuilding from '../../../assets/icons/profile-menu/ico-building.svg';
import icoExternalLink from '../../../assets/icons/profile-menu/ico-external-link.svg';
import icoUsers from '../../../assets/icons/profile-menu/ico-users.svg';
import icoCreditCard from '../../../assets/icons/profile-menu/ico-credit-card.svg';
import icoBook from '../../../assets/icons/profile-menu/ico-book.svg';
import icoHelp from '../../../assets/icons/profile-menu/ico-drop-help.svg';
import icoMessageSquare from '../../../assets/icons/profile-menu/ico-message-square.svg';
import icoFileText2 from '../../../assets/icons/profile-menu/ico-file-text2.svg';
import icoLogout from '../../../assets/icons/profile-menu/ico-drop-logout.svg';

/**
 * SCR-013 User Profile Menu Screen (Figma node 39:6447, dropdown
 * content at 39:6826) — a Header-anchored shell overlay, same
 * treatment as SCR-012's NotificationPanel (real stateful dropdown,
 * not a routed page). Reuses NotificationPanel's dialog/focus-trap/
 * click-outside/Escape conventions from Header.jsx.
 *
 * MOCK BOUNDARY: "Switch/Manage Organization" and "Billing" (with its
 * "Pro" plan badge) require MOD-004 (Organization Management), which
 * has no backend yet — the org card and those two items render the
 * literal Figma content (Acme Corporation / Enterprise · US East /
 * Pro) as static display, not a fabricated org-switch flow.
 * "Documentation"/"Help Center"/"Release Notes" have no destination
 * anywhere in the project (no external docs/help URLs are defined) —
 * rendered `disabled` with an explanatory `title`, mirroring the
 * project's established disabled-with-title precedent (LoginScreen's
 * SSO button, DashboardScreen's unbuilt row actions) rather than
 * linking to a fabricated URL. "Contact Support" has the same gap and
 * the same treatment.
 *
 * Real navigation: "View Profile" → /profile (SCR-036), "Account
 * Settings"/"Preferences" → /account/change-password (the only real
 * account-settings screen built so far, MOD-002's Change Password),
 * "Security" → /account/change-password as well (no separate security
 * screen exists in the 71-screen inventory; the Figma "Alt+S" shortcut
 * hint is decorative-only since no keyboard-shortcut system exists in
 * this codebase — rendered as static hint text, not wired to a real
 * key handler, to avoid fabricating shortcut behavior). "Sign Out"
 * navigates to /logout (SCR-008's real confirm-before-logout screen)
 * rather than calling useLogout().confirm() directly from the
 * dropdown, so the user always sees the existing confirmation step.
 */
export default function UserProfileMenu({ currentUser, roleLabel, menuId, titleId, triggerRef, onRequestClose }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const menu = containerRef.current;
    const focusable = menu?.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function getFocusable() {
      return containerRef.current
        ? Array.from(
            containerRef.current.querySelectorAll(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
    }

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onRequestClose();
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onRequestClose();
        triggerRef.current?.focus();
        return;
      }
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
  }, [onRequestClose, triggerRef]);

  function goTo(path) {
    onRequestClose();
    navigate(path);
  }

  const initials = currentUser?.initials ?? 'U';
  const name = currentUser?.name ?? 'Account';
  const email = currentUser?.email ?? '';

  return (
    <div
      ref={containerRef}
      id={menuId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-x-token-4 top-14 z-30 max-h-[70svh] w-auto overflow-y-auto rounded-[10px] border border-border bg-surface-card shadow-[0px_4px_20px_0px_rgba(15,23,42,0.1),0px_1px_4px_0px_rgba(15,23,42,0.06)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] sm:max-h-none sm:w-[264px]"
    >
      <h2 id={titleId} className="sr-only">
        Account menu
      </h2>

      <div className="border-b border-border-subtle px-token-4 pb-[15px] pt-token-4">
        <div className="flex gap-token-4">
          <span
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-shell-avatar text-[14px] font-bold tracking-[0.42px] text-text-on-primary"
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold tracking-[-0.2px] text-text-primary-alt">{name}</p>
            {email && <p className="truncate font-mono text-[11.5px] text-decorative-muted">{email}</p>}
            <div className="mt-1.5 flex items-center gap-1.5">
              {roleLabel && (
                <span className="rounded-full bg-primary/[0.08] px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-[0.4px] text-primary">
                  {roleLabel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-sm bg-success" aria-hidden="true" />
                <span className="text-[11px] text-decorative-muted">Active</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-token-3 flex items-center gap-2 rounded-md border border-border-subtle bg-surface-muted-alt px-[11px] py-[9px]">
          <span
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-sm bg-shell-avatar text-[8px] font-extrabold tracking-[0.4px] text-text-on-primary"
            aria-hidden="true"
          >
            AC
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold text-text-primary-alt">Acme Corporation</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.4px] text-decorative-muted">
              Enterprise · US East
            </p>
          </div>
        </div>
      </div>

      <div className="p-[5px]">
        <MenuItem icon={icoUser} label="View Profile" onClick={() => goTo('/profile')} />
        <MenuItem icon={icoSettings} label="Account Settings" onClick={() => goTo('/account/change-password')} />
        <MenuItem
          icon={icoShield}
          label="Security"
          onClick={() => goTo('/account/change-password')}
          trailing={
            <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
              <kbd className="flex h-4 min-w-[16px] items-center justify-center rounded-sm border border-border bg-surface-muted-alt px-1 font-mono text-[9.5px] text-decorative-muted">
                ⌥
              </kbd>
              <kbd className="flex h-4 min-w-[16px] items-center justify-center rounded-sm border border-border bg-surface-muted-alt px-1 font-mono text-[9.5px] text-decorative-muted">
                S
              </kbd>
            </span>
          }
        />
        <MenuItem icon={icoSliders} label="Preferences" onClick={() => goTo('/account/change-password')} />
      </div>

      <div className="border-t border-border-subtle p-[5px]">
        <p className="px-token-3 pb-1 pt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.95px] text-decorative-muted">
          Organization
        </p>
        <MenuItem
          icon={icoBuilding}
          label="Switch Organization"
          disabled
          title="Organization switching — not yet available (no MOD-004 backend)"
          trailing={<img src={icoExternalLink} alt="" className="block h-2.5 w-2.5 opacity-35" />}
        />
        <MenuItem
          icon={icoUsers}
          label="Manage Organization"
          disabled
          title="Organization management — not yet available (no MOD-004 backend)"
        />
        <MenuItem
          icon={icoCreditCard}
          label="Billing"
          disabled
          title="Billing — not yet available (no MOD-004 backend)"
          trailing={
            <span className="rounded-full bg-primary/[0.08] px-1 font-mono text-[9.5px] font-bold text-primary">Pro</span>
          }
        />
      </div>

      <div className="border-t border-border-subtle p-[5px]">
        <p className="px-token-3 pb-1 pt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.95px] text-decorative-muted">
          Support
        </p>
        <MenuItem
          icon={icoBook}
          label="Documentation"
          disabled
          title="Documentation — no destination configured yet"
          trailing={<img src={icoExternalLink} alt="" className="block h-2.5 w-2.5 opacity-35" />}
        />
        <MenuItem
          icon={icoHelp}
          label="Help Center"
          disabled
          title="Help Center — no destination configured yet"
          trailing={<img src={icoExternalLink} alt="" className="block h-2.5 w-2.5 opacity-35" />}
        />
        <MenuItem icon={icoMessageSquare} label="Contact Support" disabled title="Contact Support — not yet available" />
        <MenuItem
          icon={icoFileText2}
          label="Release Notes"
          disabled
          title="Release Notes — no destination configured yet"
          trailing={<img src={icoExternalLink} alt="" className="block h-2.5 w-2.5 opacity-35" />}
        />
      </div>

      <div className="border-t border-border-subtle p-[5px]">
        <button
          type="button"
          onClick={() => goTo('/logout')}
          className="flex w-full items-center gap-[9px] rounded-md px-[10px] py-[7px] text-left text-[13px] text-danger transition-colors duration-150 hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <img src={icoLogout} alt="" className="block h-[13px] w-[13px]" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, disabled, title, trailing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex w-full items-center gap-[9px] rounded-md px-[10px] py-[7px] text-left text-[13px] text-text-tertiary transition-colors duration-150 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <img src={icon} alt="" className="block h-[13px] w-[13px] opacity-55" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}
