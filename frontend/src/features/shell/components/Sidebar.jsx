import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import chevronDown from '../../../assets/icons/shell/chevron-down.svg';
import arrowRight from '../../../assets/icons/shell/arrow-right.svg';
import { NAV_ICONS } from './navIcons';
import { useVisibleNav } from '../rbac/useVisibleNav';
import SidebarToggleIcon from './SidebarToggleIcon';

/**
 * Global left navigation (Figma "Sidebar" — expanded node 213:5159,
 * 224px, collapsed/rail node 213:5708, 56px). Both are the SAME
 * component here (not two components) so the structural chrome (logo
 * header, nav groups, footer user card) never drifts between the two
 * states — only the expanded/collapsed layout of each item differs,
 * matching how Figma models them as companion variants of one
 * Sidebar, not two different designs.
 *
 * The menu content itself comes from `useVisibleNav(role)` — every
 * role sees the identical Sidebar shell, only the filtered item list
 * differs, per the task's explicit requirement that structure stay
 * identical across roles while only menu content varies.
 *
 * `badges` optionally supplies live counts for items that declare a
 * `badgeKey` (currently just Operations → Errors, shown as "3" in the
 * Figma design). MOCK BOUNDARY: no MOD-008/MOD-009 backend exists to
 * source a real error count yet, so the default reproduces the
 * Figma-shown literal value; a real count should be passed in once
 * that backend exists rather than hardcoded here.
 */
const DEFAULT_BADGES = { errors: 3 };

export default function Sidebar({ role, collapsed, onToggleCollapsed, currentUser, roleLabel, badges = DEFAULT_BADGES }) {
  const visibleNav = useVisibleNav(role);

  if (collapsed) {
    return (
      <CollapsedSidebar
        visibleNav={visibleNav}
        onToggleCollapsed={onToggleCollapsed}
        currentUser={currentUser}
        roleLabel={roleLabel}
      />
    );
  }

  return (
    <ExpandedSidebar
      visibleNav={visibleNav}
      onToggleCollapsed={onToggleCollapsed}
      currentUser={currentUser}
      roleLabel={roleLabel}
      badges={badges}
    />
  );
}

function ExpandedSidebar({ visibleNav, onToggleCollapsed, currentUser, roleLabel, badges }) {
  return (
    <nav
      aria-label="Main"
      className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface-card"
      data-node-id="213:5159"
    >
      <div className="flex h-[47px] shrink-0 items-center gap-token-3 border-b border-border pl-token-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Collapse sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <SidebarToggleIcon collapsed={false} />
        </button>
        <div className="flex items-center gap-token-3">
          <img src={meridianLogomark} alt="" className="block h-[21px] w-[26px]" />
          <div>
            <p className="m-0 text-token-sm font-bold tracking-[-0.02em] text-text-primary">ConnectIQ</p>
            <p className="m-0 font-mono text-[9px] font-medium uppercase tracking-[0.036em] text-decorative-muted">
              ETL Platform
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-token-3 py-token-2">
        {visibleNav.map((node) => (
          <NavSection key={node.key} node={node} badges={badges} />
        ))}
      </div>

      <div className="shrink-0 border-t border-border-subtle">
        <button
          type="button"
          className="flex w-full items-center gap-token-3 px-token-5 py-token-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-shell-accent-border bg-shell-accent-wash text-[10px] font-bold text-shell-accent shadow-sm">
            {currentUser?.initials ?? 'U'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-token-sm font-semibold text-text-primary">{currentUser?.name ?? 'Account'}</p>
            <p className="m-0 truncate text-token-meta text-decorative-muted">{roleLabel}</p>
          </div>
          <img src={arrowRight} alt="" className="block h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    </nav>
  );
}

function NavSection({ node, badges }) {
  // Top-level groups (Data, Pipelines, Operations, Analytics,
  // Administration) default open, matching the Figma screenshot
  // (node 213:5159) where every section is expanded at rest — only
  // the nested "Pipeline Builder" sub-group (NestedNavGroup below)
  // defaults closed there.
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(node.items);
  const icon = node.icon ? NAV_ICONS[node.icon] : null;

  if (!hasChildren) {
    return <SidebarLink item={node} icon={icon} depth={0} badges={badges} />;
  }

  return (
    <div className="pt-1 first:pt-0">
      {node.label && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-[30px] w-full items-center gap-token-3 rounded-md pl-token-4 pr-token-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex-1 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.07em] text-shell-nav-heading">
            {node.label}
          </span>
          {icon && <img src={icon} alt="" className="block h-[15px] w-[15px]" />}
          <img src={chevronDown} alt="" className={`block h-3 w-3 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
      )}
      {open && (
        <div>
          {node.items.map((child) =>
            child.items ? (
              <NestedNavGroup key={child.key} node={child} badges={badges} />
            ) : (
              <SidebarLink key={child.key} item={child} depth={1} badges={badges} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function NestedNavGroup({ node, badges }) {
  // Nested groups (e.g. "Pipeline Builder") default closed, matching
  // the Figma screenshot's collapsed sub-group state.
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-[30px] w-full items-center gap-1.5 rounded-md pl-token-5 pr-token-3 text-left text-token-base text-text-secondary-strong transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex-1 truncate">{node.label}</span>
        <img src={chevronDown} alt="" className={`block h-[11px] w-[11px] transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div>
          {node.items.map((child) => (
            <SidebarLink key={child.key} item={child} depth={2} badges={badges} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLink({ item, icon, depth, badges }) {
  const paddingLeft = depth === 0 ? 'pl-token-4' : depth === 1 ? 'pl-token-6' : 'pl-[32px]';
  const badgeValue = item.badgeKey ? badges?.[item.badgeKey] : undefined;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `relative flex h-[30px] items-center gap-token-3 rounded-md ${paddingLeft} pr-token-3 text-token-base transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          isActive
            ? 'bg-shell-nav-active-bg font-semibold text-shell-accent before:absolute before:inset-y-1 before:left-0 before:w-[2.5px] before:rounded-full before:bg-shell-accent'
            : 'text-shell-nav-text hover:bg-surface-hover'
        }`
      }
    >
      {icon && <img src={icon} alt="" className="block h-[15px] w-[15px]" />}
      <span className="flex-1 truncate">{item.label}</span>
      {badgeValue != null && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-shell-badge-bg px-1 text-[10px] font-semibold text-danger">
          {badgeValue}
        </span>
      )}
    </NavLink>
  );
}

function CollapsedSidebar({ visibleNav, onToggleCollapsed, currentUser, roleLabel }) {
  // The collapsed rail (node 213:5708) shows only top-level/section
  // icons — no nested items, no labels, no footer nav-group text —
  // matching the Figma frame exactly. Items without an icon (e.g.
  // "Overview" uses one; deeply nested pipeline-builder steps have
  // none) are skipped in this rail rather than rendered as an
  // unlabeled icon-less button.
  const railItems = visibleNav
    .map((node) => ({ key: node.key, label: node.label, href: node.href, icon: node.icon ? NAV_ICONS[node.icon] : null }))
    .filter((node) => node.icon);

  return (
    <nav
      aria-label="Main"
      className="flex h-full w-14 shrink-0 flex-col items-center border-r border-border bg-surface-card"
      data-node-id="213:5708"
    >
      <div className="flex h-[47px] w-full shrink-0 items-center justify-center border-b border-border">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <SidebarToggleIcon collapsed={true} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto py-token-2">
        {railItems.map((node) =>
          node.href ? (
            <NavLink
              key={node.key}
              to={node.href}
              aria-label={node.label}
              title={node.label}
              className={({ isActive }) =>
                `relative flex h-[30px] w-10 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isActive
                    ? 'bg-shell-nav-active-bg text-shell-accent before:absolute before:inset-y-1 before:left-0 before:w-[2.5px] before:rounded-full before:bg-shell-accent'
                    : 'text-shell-nav-text hover:bg-surface-hover'
                }`
              }
            >
              <img src={node.icon} alt="" className="block h-[15px] w-[15px]" />
            </NavLink>
          ) : (
            <span
              key={node.key}
              aria-label={node.label}
              title={node.label}
              className="flex h-[30px] w-10 items-center justify-center rounded-md text-shell-nav-text"
            >
              <img src={node.icon} alt="" className="block h-[15px] w-[15px]" />
            </span>
          ),
        )}
      </div>

      <div className="flex w-full shrink-0 items-center justify-center border-t border-border-subtle py-token-4">
        <span
          aria-label={`${currentUser?.name ?? 'Account'}, ${roleLabel}`}
          title={`${currentUser?.name ?? 'Account'} — ${roleLabel}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-shell-accent-border bg-shell-accent-wash text-[10px] font-bold text-shell-accent shadow-sm"
        >
          {currentUser?.initials ?? 'U'}
        </span>
      </div>
    </nav>
  );
}
