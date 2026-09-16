import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import icoGear from '../../../assets/icons/notifications/ico-gear.svg';
import icoFail from '../../../assets/icons/notifications/ico-notif-fail.svg';
import icoWarn from '../../../assets/icons/notifications/ico-notif-warn.svg';
import icoCheck from '../../../assets/icons/notifications/ico-notif-check.svg';
import icoWorker from '../../../assets/icons/notifications/ico-notif-worker.svg';
import icoShield from '../../../assets/icons/notifications/ico-drop-shield.svg';
import icoSettings from '../../../assets/icons/notifications/ico-drop-settings.svg';

const ICONS = {
  fail: icoFail,
  warn: icoWarn,
  check: icoCheck,
  worker: icoWorker,
  shield: icoShield,
  settings: icoSettings,
};

const SEVERITY_WASH = {
  critical: 'bg-danger-bg',
  warning: 'bg-warning-bg',
  success: 'bg-success-bg',
  neutral: 'bg-surface-muted-alt border border-border',
};

const SEVERITY_BADGE = {
  critical: 'bg-danger-bg text-danger',
  warning: 'bg-warning-bg text-warning',
  success: 'bg-success-bg text-success-strong',
  neutral: 'bg-surface-muted-alt border border-border text-text-secondary-alt',
};

const TABS = [
  { key: 'all', label: 'All', predicate: () => true },
  { key: 'unread', label: 'Unread', predicate: (item) => item.unread },
  { key: 'alerts', label: 'Alerts', predicate: (item) => item.severity === 'critical' || item.severity === 'warning' },
  { key: 'system', label: 'System', predicate: (item) => item.category === 'system' || item.category === 'security' },
];

/**
 * SCR-012 Notification Panel Screen (Figma node 36:5210's "Dialog -
 * Notifications panel"). Rendered as Header's bell-button dropdown
 * (real overlay content, not a second routed page — the inventory
 * lists this as a "shell overlay", same treatment as SCR-013's user
 * menu). Reuses the project's existing severity/status color tokens
 * (--color-danger/-warning/-success) rather than inventing new ones.
 *
 * Real behavior beyond the Figma happy-path snapshot: loading
 * skeleton, error+retry, and empty-per-tab states were added per
 * agent-rules.md §5's real-state requirement — same extrapolation
 * precedent as SCR-001/SCR-009's added states, since Figma only
 * models one populated "All" tab.
 */
export default function NotificationPanel({
  items,
  unreadCount,
  isLoading,
  isError,
  onRetry,
  onMarkAllRead,
  isMarkingAllRead,
  markAllReadFailed,
  mocked,
  panelId,
  titleId,
  onRequestClose,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const counts = useMemo(() => {
    return TABS.reduce((acc, tab) => {
      acc[tab.key] = items.filter(tab.predicate).length;
      return acc;
    }, {});
  }, [items]);

  const filtered = useMemo(() => {
    const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
    return items.filter(tab.predicate);
  }, [items, activeTab]);

  const grouped = useMemo(() => {
    const groups = [];
    for (const item of filtered) {
      const last = groups[groups.length - 1];
      if (last && last.group === item.group) {
        last.items.push(item);
      } else {
        groups.push({ group: item.group, items: [item] });
      }
    }
    return groups;
  }, [filtered]);

  return (
    <div
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-x-token-4 top-14 z-30 flex max-h-[70svh] w-auto flex-col overflow-hidden rounded-md border border-border bg-surface-card shadow-[0px_4px_20px_0px_rgba(15,23,42,0.1),0px_1px_4px_0px_rgba(15,23,42,0.06)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] sm:max-h-[560px] sm:w-[400px]"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-token-4 pb-[13px] pt-[14px]">
        <div className="flex items-center gap-2">
          <h2 id={titleId} className="text-[14px] font-bold tracking-[-0.2px] text-text-primary-alt">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="flex min-w-[18px] items-center justify-center rounded-full bg-danger px-[5px] py-px font-mono text-[10px] font-bold text-text-on-primary">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link
            to="/account/notifications"
            onClick={onRequestClose}
            aria-label="Notification settings"
            title="Notification settings"
            className="flex h-7 w-7 items-center justify-center rounded-sm text-text-secondary-alt hover:text-text-primary-alt hover:bg-surface-hover transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src={icoGear} alt="" className="block h-[15px] w-[15px]" />
          </Link>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAllRead}
            className="rounded-sm px-1.5 py-1 text-[11.5px] font-semibold text-primary transition-colors duration-150 hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-text-secondary-alt disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {isMarkingAllRead ? 'Marking…' : 'Mark all read'}
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter notifications"
        className="flex items-end gap-1 border-b border-border-subtle px-3.5"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const currentIndex = TABS.findIndex((tab) => tab.key === activeTab);
          let nextIndex = currentIndex;
          if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
          if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = TABS.length - 1;
          const nextTab = TABS[nextIndex];
          setActiveTab(nextTab.key);
          document.getElementById(`${panelId}-tab-${nextTab.key}`)?.focus();
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              id={`${panelId}-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${panelId}-tabpanel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-2.5 pb-[11px] pt-2 text-[12.5px] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent font-medium text-text-secondary-alt hover:text-text-primary-alt'
              }`}
            >
              {tab.label}
              <span
                className={`flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 font-mono text-[9.5px] font-bold ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-surface-muted-alt text-decorative-muted'
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <p role="status" className="sr-only">
        {isLoading
          ? 'Loading notifications'
          : isError
            ? "Couldn't load notifications"
            : `Showing ${filtered.length} of ${items.length} notifications, ${unreadCount} unread`}
      </p>

      <div
        id={`${panelId}-tabpanel`}
        role="tabpanel"
        aria-labelledby={`${panelId}-tab-${activeTab}`}
        className="max-h-[432px] flex-1 overflow-y-auto"
      >
        {markAllReadFailed && (
          <p role="alert" className="border-b border-danger-border bg-danger-bg px-token-4 py-2 text-[11.5px] text-danger-strong">
            Couldn't mark notifications as read. Try again.
          </p>
        )}
        {mocked && (
          <p className="border-b border-border-subtle bg-surface-muted px-token-4 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.6px] text-decorative-muted">
            Sample data
          </p>
        )}

        {isLoading && <NotificationSkeleton />}

        {!isLoading && isError && (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-[12.5px] text-text-secondary-alt">Couldn't load notifications.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-sm border border-border px-3 py-1.5 text-[12px] font-semibold text-primary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="px-6 py-10 text-center text-[12.5px] text-text-secondary-alt">
            {activeTab === 'unread' ? "You're all caught up." : 'No notifications here yet.'}
          </p>
        )}

        {!isLoading &&
          !isError &&
          grouped.map((section) => (
            <section key={section.group}>
              <h3 className="border-b border-border-subtle bg-surface-card px-token-4 pb-1.5 pt-[7px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.95px] text-decorative-muted">
                {section.group}
              </h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`relative flex w-full gap-2.5 border-b border-border-subtle py-3 pl-[18px] pr-4 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        item.unread ? 'bg-primary/[0.02]' : ''
                      }`}
                    >
                      {item.unread && (
                        <span className="absolute left-0 top-0 h-full w-[3px] bg-current text-danger-strong" aria-hidden="true" />
                      )}
                      <span className="mt-1.5 shrink-0" aria-hidden="true">
                        <span className={`block h-1.5 w-1.5 rounded-sm ${item.unread ? 'bg-primary' : 'bg-transparent'}`} />
                      </span>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${SEVERITY_WASH[item.severity]}`}>
                        <img src={ICONS[item.icon]} alt="" className="block h-[11px] w-[11px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`text-[12.5px] leading-[17.5px] ${item.unread ? 'font-semibold text-text-primary-alt' : 'text-text-secondary-alt'}`}>
                            {item.title}
                          </span>
                          <span className="shrink-0 whitespace-nowrap pt-px font-mono text-[10.5px] text-decorative-muted">{item.time}</span>
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-[18px] text-text-secondary-alt">{item.detail}</span>
                        {item.categoryLabel && (
                          <span className="mt-1.5 inline-flex items-center gap-1">
                            <span className={`rounded-full px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-[0.45px] ${SEVERITY_BADGE[item.severity]}`}>
                              {item.categoryLabel}
                            </span>
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>

      <div className="flex items-center justify-center border-t border-border-subtle px-token-4 py-3">
        <Link
          to="/notifications"
          className="text-[12.5px] font-semibold text-primary hover:underline transition"
          onClick={onRequestClose}
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-token-4 py-4" aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex gap-2.5">
          <div className="h-7 w-7 shrink-0 rounded-full bg-surface-muted-alt" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 rounded-sm bg-surface-muted-alt" />
            <div className="h-2.5 w-full rounded-sm bg-surface-muted-alt" />
          </div>
        </div>
      ))}
    </div>
  );
}
