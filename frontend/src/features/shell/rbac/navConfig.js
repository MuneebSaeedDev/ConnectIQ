import { PERMISSIONS } from './permissions';

/**
 * Sidebar navigation tree, sourced from the Figma Sidebar frames
 * (expanded: node 213:5159, collapsed: node 213:5708 — both render the
 * identical item set, only the chrome differs). Every leaf item
 * declares the permission(s) that make it visible; a group is visible
 * only if at least one of its children is visible, so an empty
 * section never renders (per the task requirement that inapplicable
 * items are hidden, not disabled).
 *
 * Route paths marked `unbuilt: true` don't have a real screen behind
 * them yet — every module below Data Sources/Destinations is still
 * `PLANNED` per docs/modules/module-plan.md. Per agent-rules.md §5/§9,
 * this shell must not fabricate destination screens, so those items
 * render as real nav links to their (currently placeholder) route
 * rather than being invented away — `RoutePlaceholder` already exists
 * in the router for exactly this purpose.
 */
export const NAV_TREE = [
  {
    key: 'overview',
    label: 'Overview',
    icon: 'overview',
    href: '/dashboard',
    permissions: [],
  },
  {
    key: 'data',
    label: 'Data',
    icon: 'data',
    collapsible: true,
    permissions: [PERMISSIONS.DATA_SOURCE_READ, PERMISSIONS.DESTINATION_READ],
    items: [
      { key: 'data-sources', label: 'Data Sources', href: '/data-sources', permissions: [PERMISSIONS.DATA_SOURCE_READ] },
      { key: 'destinations', label: 'Destinations', href: '/destinations', permissions: [PERMISSIONS.DESTINATION_READ] },
    ],
  },
  {
    key: 'pipelines',
    label: 'Pipelines',
    icon: 'pipeline',
    collapsible: true,
    permissions: [PERMISSIONS.PIPELINE_READ],
    items: [
      { key: 'pipeline-library', label: 'Pipeline Library', href: '/pipelines', permissions: [PERMISSIONS.PIPELINE_READ] },
      {
        key: 'pipeline-builder',
        label: 'Pipeline Builder',
        collapsible: true,
        permissions: [PERMISSIONS.PIPELINE_CREATE],
        items: [
          { key: 'pipeline-builder-overview', label: 'Overview', href: '/pipelines/new', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-source', label: 'Source', href: '/pipelines/new/source', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-destination', label: 'Destination', href: '/pipelines/new/destination', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-transformations', label: 'Transformations', href: '/pipelines/new/transformations', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-schedule', label: 'Schedule', href: '/pipelines/new/schedule', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-parameters', label: 'Parameters', href: '/pipelines/new/parameters', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-review', label: 'Review', href: '/pipelines/new/review', permissions: [PERMISSIONS.PIPELINE_CREATE] },
          { key: 'pipeline-builder-run', label: 'Run', href: '/pipelines/new/run', permissions: [PERMISSIONS.PIPELINE_EXECUTE] },
        ],
      },
      { key: 'executions', label: 'Executions', href: '/dashboard/executions', permissions: [PERMISSIONS.PIPELINE_READ] },
      { key: 'monitoring', label: 'Monitoring', href: '/dashboard/realtime', permissions: [PERMISSIONS.PIPELINE_READ] },
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: 'operations',
    collapsible: true,
    permissions: [PERMISSIONS.OPERATIONS_READ],
    items: [
      { key: 'workers', label: 'Workers', href: '/operations/workers', permissions: [PERMISSIONS.OPERATIONS_READ] },
      { key: 'queues', label: 'Queues', href: '/operations/queues', permissions: [PERMISSIONS.OPERATIONS_READ] },
      { key: 'errors', label: 'Errors', href: '/dashboard/errors', permissions: [PERMISSIONS.OPERATIONS_READ], badgeKey: 'errors' },
      { key: 'logs', label: 'Logs', href: '/operations/logs', permissions: [PERMISSIONS.OPERATIONS_READ] },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'analytics',
    collapsible: true,
    permissions: [PERMISSIONS.ANALYTICS_READ],
    items: [
      { key: 'analytics-dashboard', label: 'Dashboard', href: '/dashboard/executive', permissions: [PERMISSIONS.ANALYTICS_READ] },
      { key: 'reports', label: 'Reports', href: '/dashboard/performance', permissions: [PERMISSIONS.ANALYTICS_READ] },
      { key: 'data-quality', label: 'Data Quality', href: '/dashboard/data-quality', permissions: [PERMISSIONS.ANALYTICS_READ] },
      { key: 'system-health', label: 'System Health', href: '/dashboard/system-health', permissions: [PERMISSIONS.ANALYTICS_READ] },
      { key: 'source-health', label: 'Source Health', href: '/dashboard/source-health', permissions: [PERMISSIONS.ANALYTICS_READ] },
      { key: 'destination-health', label: 'Destination Health', href: '/dashboard/destination-health', permissions: [PERMISSIONS.ANALYTICS_READ] },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    permissions: [PERMISSIONS.USER_MANAGE, PERMISSIONS.TEAM_MANAGE, PERMISSIONS.ORGANIZATION_MANAGE, PERMISSIONS.ROLE_MANAGE, PERMISSIONS.AUDIT_READ, PERMISSIONS.SETTINGS_MANAGE],
    items: [
      { key: 'organizations', label: 'Organizations', icon: 'organizations', href: '/organizations', permissions: [PERMISSIONS.ORGANIZATION_MANAGE] },
      { key: 'users', label: 'Users', icon: 'users', href: '/users', permissions: [PERMISSIONS.USER_MANAGE] },
      { key: 'teams', label: 'Teams', icon: 'teams', href: '/organizations/current/teams', permissions: [PERMISSIONS.TEAM_MANAGE] },
      { key: 'roles', label: 'Roles', icon: 'roles', href: '/roles', permissions: [PERMISSIONS.ROLE_MANAGE] },
      { key: 'audit-logs', label: 'Audit Logs', icon: 'audit', href: '/organizations/current/activity', permissions: [PERMISSIONS.AUDIT_READ] },
      { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings/access-control', permissions: [PERMISSIONS.SETTINGS_MANAGE] },
    ],
  },
];
