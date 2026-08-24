import overviewIcon from '../../../assets/icons/shell/nav-overview.svg';
import dataIcon from '../../../assets/icons/shell/nav-data.svg';
import pipelineIcon from '../../../assets/icons/shell/nav-pipeline.svg';
import operationsIcon from '../../../assets/icons/shell/nav-operations.svg';
import analyticsIcon from '../../../assets/icons/shell/nav-analytics.svg';
import usersIcon from '../../../assets/icons/shell/nav-users.svg';
import organizationsIcon from '../../../assets/icons/shell/nav-organizations.svg';
import teamsIcon from '../../../assets/icons/shell/nav-teams.svg';
import rolesIcon from '../../../assets/icons/shell/nav-roles.svg';
import auditIcon from '../../../assets/icons/shell/nav-audit.svg';
import settingsIcon from '../../../assets/icons/shell/nav-settings-mask.svg';

// Maps navConfig.js's `icon` keys to their exported Figma asset
// (Sidebar frames 213:5159/213:5708). Only top-level/section items
// carry an icon in the Figma design — nested items render as plain
// indented text, matching the source frames exactly.
export const NAV_ICONS = {
  overview: overviewIcon,
  data: dataIcon,
  pipeline: pipelineIcon,
  operations: operationsIcon,
  analytics: analyticsIcon,
  users: usersIcon,
  organizations: organizationsIcon,
  teams: teamsIcon,
  roles: rolesIcon,
  audit: auditIcon,
  settings: settingsIcon,
};
