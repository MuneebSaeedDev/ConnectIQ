/**
 * Data for the Team Management Screen (SCR-030, node 95:6572, Figma
 * page "Page 1"), including the per-team DetailDrawer (node 95:8111).
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no `Team` entity and no team list /
 * create / archive / activate / assign-department / assign-lead
 * endpoints exist yet (see docs/modules/module-plan.md).
 * `getTeamManagement` always attempts a real request first (scoped to
 * the organization in the route) and only falls back to the mock
 * snapshot below when the endpoint is unreachable, mirroring the
 * SCR-029 department-management api module's dev-proxy-aware
 * mock-fallback shape (including the SCR-014-discovered content-type
 * check against the Vite dev server's own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 95:6572 was inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). The 6 KPI cards, the 14
 * visible team rows (code, department, team lead, members, pipelines,
 * connectors, status, last activity, the favorite star on Pipeline
 * Core, and the "Requires attention" flag), the toolbar filters, the bulk-action set, the "Showing 14 of
 * 41 teams" footer, and the full Pipeline Core (PC) drawer —
 * operational summary (8/24/7 + 342 executions / 98.7% success),
 * team information, description, and ownership — are all transcribed
 * from the actual frame's text nodes, so that content's fidelity is
 * `verified`.
 *
 * KNOWN LIMITATION: the Figma table renders each team by its code
 * initials + avatar only (the "Team" cell shows the code, not a
 * spelled-out name), and only the PC drawer exposes a member /
 * pipeline breakdown. Full team names (shown in the table for
 * readability, matching the accepted SCR-029 pattern), plus each
 * team's description and per-row ownership (createdBy), are derived
 * sample values consistent with each row's Figma-verified stats and
 * are clearly labeled as sample data in the UI. Member and
 * recent-pipeline previews are Figma-verified for PC only — the other
 * drawers show their (real) operational counts and a labeled note that
 * the detailed breakdown loads from the MOD-004 team service. A real
 * endpoint would accept the org id + query params (search, status,
 * department, teamLead, sort, page) and return matching rows plus
 * per-team members and pipelines.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class TeamManagementError extends Error {}

const MOCK_TEAM_MANAGEMENT = {
  updatedAt: 'just now',
  organizationName: 'Acme Corporation',
  kpis: [
    { key: 'total', label: 'Total Teams', value: '41', helper: 'Across 24 departments', tone: 'default' },
    { key: 'active', label: 'Active Teams', value: '37', helper: '4 inactive or archived', tone: 'success' },
    { key: 'leads', label: 'Team Leads', value: '34', helper: '7 teams without a lead', tone: 'default' },
    { key: 'members', label: 'Total Members', value: '247', helper: 'Avg 6 per team', tone: 'default' },
    { key: 'pipelines', label: 'Active Pipelines', value: '183', helper: 'Avg 4.5 per active team', tone: 'success' },
    { key: 'attention', label: 'Requiring Attention', value: '5', helper: 'Lead or activity issues', tone: 'danger' },
  ],
  statusFilters: ['All statuses', 'Active', 'Inactive', 'Pending Setup', 'Archived'],
  departmentFilters: ['All departments', 'Data Engineering', 'BI & Reporting', 'ML Infrastructure', 'Analytics Platform', 'Finance Systems', 'Risk & Compliance', 'Customer Data', 'HR Analytics', 'Legacy Integration'],
  teamLeadFilters: ['All team leads', 'Assigned', 'Unassigned'],
  sortOptions: ['Name', 'Members', 'Pipelines', 'Created', 'Last Activity'],
  total: 41,
  rows: [
    { id: 'team_pc', name: 'Pipeline Core', code: 'PC', tone: 'blue', favorite: true, department: 'Data Engineering', departmentCode: 'DE', departmentTone: 'blue', leadName: 'Sarah Chen', leadInitials: 'SC', members: 8, pipelines: 24, connectors: 7, status: 'Active', lastActivity: 'Just now', activityMinutes: 0, created: 'Jan 14, 2023', createdBy: 'M. Patterson', attention: false, executions7d: '342', successRate: '98.7%', description: 'Owns and operates all production-grade ETL pipelines, orchestration workflows, and data movement tasks across the enterprise platform.' },
    { id: 'team_pi', name: 'Pipeline Integrations', code: 'PI', tone: 'blue', favorite: false, department: 'Data Engineering', departmentCode: 'DE', departmentTone: 'blue', leadName: 'Luca Ricci', leadInitials: 'LR', members: 6, pipelines: 12, connectors: 5, status: 'Active', lastActivity: '5 min ago', activityMinutes: 5, created: 'Jan 22, 2023', createdBy: 'M. Patterson', attention: false, executions7d: '188', successRate: '97.4%', description: 'Builds and maintains inbound connector integrations feeding the core data-engineering pipelines.' },
    { id: 'team_dq', name: 'Data Quality', code: 'DQ', tone: 'blue', favorite: false, department: 'Data Engineering', departmentCode: 'DE', departmentTone: 'blue', leadName: null, leadInitials: null, members: 4, pipelines: 8, connectors: 3, status: 'Active', lastActivity: '1 hr ago', activityMinutes: 60, created: 'Mar 3, 2023', createdBy: 'S. Chen', attention: true, executions7d: '96', successRate: '95.1%', description: 'Monitors data-quality checks and validation pipelines; currently has no assigned team lead.' },
    { id: 'team_rs', name: 'Reporting & Statements', code: 'RS', tone: 'green', favorite: false, department: 'BI & Reporting', departmentCode: 'BI', departmentTone: 'green', leadName: 'Linda Kim', leadInitials: 'LK', members: 5, pipelines: 11, connectors: 4, status: 'Active', lastActivity: '2 hr ago', activityMinutes: 120, created: 'Mar 12, 2023', createdBy: 'L. Kim', attention: false, executions7d: '133', successRate: '99.0%', description: 'Delivers scheduled reporting, statements, and curated BI extracts for downstream consumers.' },
    { id: 'team_db', name: 'Dashboards', code: 'DB', tone: 'green', favorite: false, department: 'BI & Reporting', departmentCode: 'BI', departmentTone: 'green', leadName: 'Omar Hassan', leadInitials: 'OH', members: 4, pipelines: 9, connectors: 2, status: 'Active', lastActivity: '4 hr ago', activityMinutes: 240, created: 'Apr 4, 2023', createdBy: 'L. Kim', attention: false, executions7d: '77', successRate: '98.2%', description: 'Owns executive and operational dashboards backed by the BI & Reporting datasets.' },
    { id: 'team_ms', name: 'Model Serving', code: 'MS', tone: 'orange', favorite: false, department: 'ML Infrastructure', departmentCode: 'ML', departmentTone: 'orange', leadName: 'Tom Hughes', leadInitials: 'TH', members: 5, pipelines: 14, connectors: 5, status: 'Active', lastActivity: 'Yesterday', activityMinutes: 1440, created: 'Mar 20, 2023', createdBy: 'T. Hughes', attention: false, executions7d: '204', successRate: '96.8%', description: 'Serves production machine-learning models and manages inference-serving pipelines.' },
    { id: 'team_fe', name: 'Feature Engineering', code: 'FE', tone: 'orange', favorite: false, department: 'ML Infrastructure', departmentCode: 'ML', departmentTone: 'orange', leadName: 'Wei Zhang', leadInitials: 'WZ', members: 3, pipelines: 7, connectors: 2, status: 'Active', lastActivity: '2 days ago', activityMinutes: 2880, created: 'Jun 6, 2023', createdBy: 'T. Hughes', attention: false, executions7d: '58', successRate: '97.9%', description: 'Builds and maintains reusable feature-engineering pipelines for model-training datasets.' },
    { id: 'team_ac', name: 'Analytics Core', code: 'AC', tone: 'purple', favorite: false, department: 'Analytics Platform', departmentCode: 'AP', departmentTone: 'purple', leadName: 'James Park', leadInitials: 'JP', members: 7, pipelines: 16, connectors: 6, status: 'Active', lastActivity: '3 hr ago', activityMinutes: 180, created: 'Jan 30, 2023', createdBy: 'J. Park', attention: false, executions7d: '219', successRate: '98.5%', description: 'Runs the shared self-serve analytics platform and downstream reporting datasets.' },
    { id: 'team_es', name: 'Event Streaming', code: 'ES', tone: 'purple', favorite: false, department: 'Analytics Platform', departmentCode: 'AP', departmentTone: 'purple', leadName: 'Priya Nair', leadInitials: 'PN', members: 4, pipelines: 13, connectors: 5, status: 'Active', lastActivity: 'Yesterday', activityMinutes: 1500, created: 'Apr 18, 2023', createdBy: 'J. Park', attention: false, executions7d: '164', successRate: '97.1%', description: 'Ingests and processes real-time event streams feeding the analytics platform.' },
    { id: 'team_ft', name: 'Financial Transforms', code: 'FT', tone: 'gray', favorite: false, department: 'Finance Systems', departmentCode: 'FS', departmentTone: 'gray', leadName: null, leadInitials: null, members: 5, pipelines: 9, connectors: 4, status: 'Inactive', lastActivity: '12 days ago', activityMinutes: 17280, created: 'May 9, 2023', createdBy: 'A. Brooks', attention: true, executions7d: '0', successRate: '—', description: 'Runs finance data transforms; flagged as inactive with no assigned team lead.' },
    { id: 'team_co', name: 'Compliance Ops', code: 'CO', tone: 'red', favorite: false, department: 'Risk & Compliance', departmentCode: 'RC', departmentTone: 'red', leadName: 'Alan Brooks', leadInitials: 'AB', members: 3, pipelines: 6, connectors: 2, status: 'Active', lastActivity: '3 days ago', activityMinutes: 4320, created: 'May 22, 2023', createdBy: 'A. Brooks', attention: false, executions7d: '44', successRate: '99.3%', description: 'Operates compliance and risk-monitoring pipelines for regulatory reporting.' },
    { id: 'team_c3', name: 'Customer 360', code: 'C3', tone: 'red', favorite: false, department: 'Customer Data', departmentCode: 'CD', departmentTone: 'red', leadName: 'Kim Tanaka', leadInitials: 'KT', members: 6, pipelines: 11, connectors: 5, status: 'Inactive', lastActivity: '18 days ago', activityMinutes: 25920, created: 'Jun 27, 2023', createdBy: 'K. Tanaka', attention: true, executions7d: '0', successRate: '—', description: 'Unifies customer profiles into a 360 view; flagged inactive for prolonged idle time.' },
    { id: 'team_hi', name: 'HR Insights', code: 'HI', tone: 'teal', favorite: false, department: 'HR Analytics', departmentCode: 'HR', departmentTone: 'teal', leadName: null, leadInitials: null, members: 2, pipelines: 0, connectors: 0, status: 'Pending Setup', lastActivity: 'Never', activityMinutes: Number.MAX_SAFE_INTEGER, created: 'Jul 15, 2026', createdBy: 'M. Patterson', attention: true, executions7d: '0', successRate: '—', description: 'Newly created team awaiting team-lead assignment and initial pipeline configuration.' },
    { id: 'team_lp', name: 'Legacy Pipelines', code: 'LP', tone: 'gray', favorite: false, department: 'Legacy Integration', departmentCode: 'LI', departmentTone: 'gray', leadName: 'Eva Rossi', leadInitials: 'ER', members: 2, pipelines: 2, connectors: 1, status: 'Archived', lastActivity: '4 mo ago', activityMinutes: 172800, created: 'Jan 14, 2023', createdBy: 'E. Rossi', attention: false, executions7d: '0', successRate: '—', description: 'Deprecated integration pipelines retained for historical reference; archived.' },
  ],
  // Figma-verified member + pipeline preview for the Pipeline Core (PC)
  // drawer only (node 95:8111). Other teams expose their real
  // operational counts but no per-member breakdown until MOD-004 ships
  // — the drawer labels that boundary.
  details: {
    team_pc: {
      members: [
        { initials: 'SC', name: 'Sarah Chen', role: 'Team Lead' },
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

export async function getTeamManagement(orgId, { search, status, department, teamLead } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'All statuses') params.set('status', status);
    if (department && department !== 'All departments') params.set('department', department);
    if (teamLead && teamLead !== 'All team leads') params.set('teamLead', teamLead);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/teams${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new TeamManagementError('Unable to load teams right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new TeamManagementError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_TEAM_MANAGEMENT, mocked: true };
  }
}
