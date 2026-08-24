/**
 * Data for the Department Management Screen (SCR-029, node 94:5039,
 * Figma page "Page 1"), including the per-department DetailDrawer
 * (node 94:6298).
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no `Department` entity and no department
 * list / create / archive / activate / assign-manager endpoints exist
 * yet (see docs/modules/module-plan.md). `getDepartmentManagement`
 * always attempts a real request first (scoped to the organization in
 * the route) and only falls back to the mock snapshot below when the
 * endpoint is unreachable, mirroring the SCR-024 organization-list api
 * module's dev-proxy-aware mock-fallback shape (including the
 * SCR-014-discovered content-type check against the Vite dev server's
 * own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 94:5039 was inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). The 6 KPI cards, the 12
 * department rows (code, manager, members, pipelines, connectors,
 * status, last activity, created, and the "Requires attention" flag),
 * the toolbar filters, the bulk-action set, the "Showing 12 of 24
 * departments" footer, and the full Data Engineering (DE) drawer —
 * operational summary (32/48/12), department information, description,
 * the five previewed members, and the four recent pipelines — are all
 * transcribed from the actual frame's text nodes, so that content's
 * fidelity is `verified`.
 *
 * KNOWN LIMITATION: the Figma table renders each department by its code
 * initials + avatar only (no spelled-out name column), and only the DE
 * drawer exposes a member/pipeline breakdown. Full department names and
 * business units for the other rows, plus the description field, are
 * derived sample values consistent with each row's Figma-verified
 * stats; they are clearly labeled as sample data in the UI. Member and
 * recent-pipeline previews are Figma-verified for DE only — the other
 * drawers show their (real) operational counts and a labeled note that
 * the detailed breakdown loads from the MOD-004 department service. A
 * real endpoint would accept the org id + query params (search, status,
 * manager, businessUnit, sort, page) and return matching rows plus
 * per-department members and pipelines.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DepartmentManagementError extends Error {}

const MOCK_DEPARTMENT_MANAGEMENT = {
  updatedAt: 'just now',
  organizationName: 'Acme Corporation',
  kpis: [
    { key: 'total', label: 'Total Departments', value: '24', helper: 'Across all business units', tone: 'default' },
    { key: 'active', label: 'Active Departments', value: '21', helper: '3 inactive or archived', tone: 'success' },
    { key: 'managers', label: 'Department Managers', value: '18', helper: '6 departments unassigned', tone: 'default' },
    { key: 'members', label: 'Total Members', value: '247', helper: 'Across 24 departments', tone: 'default' },
    { key: 'pipelines', label: 'Active Pipelines', value: '183', helper: '14 currently running', tone: 'success' },
    { key: 'attention', label: 'Requiring Attention', value: '3', helper: 'Manager or activity issues', tone: 'danger' },
  ],
  statusFilters: ['All statuses', 'Active', 'Inactive', 'Pending Setup', 'Archived'],
  businessUnitFilters: ['All business units', 'Technology', 'Data & Analytics', 'Operations', 'Corporate'],
  sortOptions: ['Name', 'Members', 'Pipelines', 'Created', 'Last Activity'],
  total: 24,
  rows: [
    { id: 'dept_de', name: 'Data Engineering', code: 'DE', tone: 'blue', managerName: 'Sarah Chen', managerInitials: 'SC', members: 32, pipelines: 48, connectors: 12, status: 'Active', lastActivity: '2 min ago', activityMinutes: 2, created: 'Jan 14, 2023', businessUnit: 'Technology', attention: false, description: 'Responsible for all production ETL pipelines, data warehouse management, and platform infrastructure across the enterprise.' },
    { id: 'dept_ap', name: 'Analytics Platform', code: 'AP', tone: 'purple', managerName: 'James Park', managerInitials: 'JP', members: 18, pipelines: 29, connectors: 8, status: 'Active', lastActivity: '1 hr ago', activityMinutes: 60, created: 'Jan 14, 2023', businessUnit: 'Data & Analytics', attention: false, description: 'Owns the shared analytics platform, self-serve dashboards, and downstream reporting datasets.' },
    { id: 'dept_do', name: 'Data Operations', code: 'DO', tone: 'green', managerName: 'Maria Santos', managerInitials: 'MS', members: 24, pipelines: 35, connectors: 14, status: 'Active', lastActivity: '3 hr ago', activityMinutes: 180, created: 'Feb 8, 2023', businessUnit: 'Operations', attention: false, description: 'Runs day-to-day data operations, monitoring, and incident response for production pipelines.' },
    { id: 'dept_ml', name: 'Machine Learning', code: 'ML', tone: 'blue', managerName: 'Tom Hughes', managerInitials: 'TH', members: 11, pipelines: 21, connectors: 6, status: 'Active', lastActivity: 'Yesterday', activityMinutes: 1440, created: 'Mar 1, 2023', businessUnit: 'Technology', attention: false, description: 'Builds and serves machine-learning feature pipelines and model-training data workflows.' },
    { id: 'dept_bi', name: 'Business Intelligence', code: 'BI', tone: 'green', managerName: 'Linda Kim', managerInitials: 'LK', members: 9, pipelines: 17, connectors: 5, status: 'Active', lastActivity: 'Yesterday', activityMinutes: 1500, created: 'Mar 1, 2023', businessUnit: 'Data & Analytics', attention: false, description: 'Maintains executive reporting, KPI models, and curated business-intelligence marts.' },
    { id: 'dept_fs', name: 'Field Services', code: 'FS', tone: 'gray', managerName: null, managerInitials: null, members: 14, pipelines: 22, connectors: 9, status: 'Active', lastActivity: '2 days ago', activityMinutes: 2880, created: 'Apr 5, 2023', businessUnit: 'Operations', attention: true, description: 'Ingests field-service telemetry and dispatch records; currently has no assigned manager.' },
    { id: 'dept_rc', name: 'Revenue & Commerce', code: 'RC', tone: 'purple', managerName: 'Alan Brooks', managerInitials: 'AB', members: 8, pipelines: 11, connectors: 4, status: 'Active', lastActivity: '2 days ago', activityMinutes: 2940, created: 'Apr 5, 2023', businessUnit: 'Corporate', attention: false, description: 'Consolidates billing, orders, and commerce events into revenue-reporting datasets.' },
    { id: 'dept_cd', name: 'Customer Data', code: 'CD', tone: 'blue', managerName: 'Priya Nair', managerInitials: 'PN', members: 16, pipelines: 18, connectors: 7, status: 'Inactive', lastActivity: '14 days ago', activityMinutes: 20160, created: 'May 2, 2023', businessUnit: 'Data & Analytics', attention: true, description: 'Unifies customer profiles and consent records; flagged for prolonged inactivity.' },
    { id: 'dept_hr', name: 'Human Resources', code: 'HR', tone: 'gray', managerName: null, managerInitials: null, members: 5, pipelines: 6, connectors: 2, status: 'Pending Setup', lastActivity: 'Never', activityMinutes: Number.MAX_SAFE_INTEGER, created: 'Jul 10, 2026', businessUnit: 'Corporate', attention: true, description: 'Newly created department awaiting manager assignment and initial pipeline configuration.' },
    { id: 'dept_pa', name: 'Platform Analytics', code: 'PA', tone: 'green', managerName: 'Kim Tanaka', managerInitials: 'KT', members: 7, pipelines: 13, connectors: 5, status: 'Active', lastActivity: '4 days ago', activityMinutes: 5760, created: 'Jun 15, 2023', businessUnit: 'Technology', attention: false, description: 'Tracks platform usage, adoption, and cost-attribution analytics across teams.' },
    { id: 'dept_sc', name: 'Supply Chain', code: 'SC', tone: 'blue', managerName: 'Omar Hassan', managerInitials: 'OH', members: 13, pipelines: 19, connectors: 8, status: 'Active', lastActivity: '1 wk ago', activityMinutes: 10080, created: 'Jun 15, 2023', businessUnit: 'Operations', attention: false, description: 'Integrates logistics, inventory, and supplier feeds for supply-chain reporting.' },
    { id: 'dept_li', name: 'Legacy Integrations', code: 'LI', tone: 'gray', managerName: 'Eva Rossi', managerInitials: 'ER', members: 3, pipelines: 2, connectors: 1, status: 'Archived', lastActivity: '3 mo ago', activityMinutes: 129600, created: 'Jan 14, 2023', businessUnit: 'Technology', attention: false, description: 'Deprecated integration workflows retained for historical reference; archived.' },
  ],
  // Figma-verified member + pipeline preview for the Data Engineering
  // (DE) drawer only (node 94:6298). Other departments expose their
  // real operational counts but no per-member breakdown until MOD-004
  // ships — the drawer labels that boundary.
  details: {
    dept_de: {
      members: [
        { initials: 'SC', name: 'Sarah Chen', role: 'Manager' },
        { initials: 'LR', name: 'Luca Ricci', role: 'Senior Engineer' },
        { initials: 'WZ', name: 'Wei Zhang', role: 'Data Engineer' },
        { initials: 'FA', name: 'Fatima Al-Aziz', role: 'Data Engineer' },
        { initials: 'CT', name: 'Carlos Torres', role: 'Analyst' },
      ],
      pipelines: [
        { name: 'Customer ETL Daily', volume: '1.2M records', status: 'Running' },
        { name: 'Finance Reconciliation', volume: '84K records', status: 'Success' },
        { name: 'Product Events', volume: '4.7M records', status: 'Running' },
        { name: 'Salesforce Sync', volume: '— records', status: 'Failed' },
      ],
    },
  },
};

export async function getDepartmentManagement(orgId, { search, status, businessUnit } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'All statuses') params.set('status', status);
    if (businessUnit && businessUnit !== 'All business units') params.set('businessUnit', businessUnit);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/departments${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DepartmentManagementError('Unable to load departments right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new DepartmentManagementError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_DEPARTMENT_MANAGEMENT, mocked: true };
  }
}
