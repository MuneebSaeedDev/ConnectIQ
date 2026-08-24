import { useMemo } from 'react';
import { NAV_TREE } from './navConfig';
import { hasAnyPermission } from './permissions';

/**
 * Filters `NAV_TREE` down to the items the given role can see.
 * Recursive: a group is kept only if at least one child survives
 * filtering, so an empty group (every child hidden) never renders —
 * the task requirement is that inapplicable items are hidden
 * entirely, not shown disabled.
 */
function filterNode(node, role) {
  if (!hasAnyPermission(role, node.permissions)) return null;

  if (!node.items) {
    return node;
  }

  const visibleChildren = node.items.map((child) => filterNode(child, role)).filter(Boolean);

  if (visibleChildren.length === 0) return null;

  return { ...node, items: visibleChildren };
}

export function useVisibleNav(role) {
  return useMemo(() => NAV_TREE.map((node) => filterNode(node, role)).filter(Boolean), [role]);
}
