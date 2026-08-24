/**
 * Data for the Organization List Screen (SCR-024, node 90:8293, Figma
 * page "Page 1").
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no `Organization` entity, no org CRUD /
 * list / activate / suspend / assign-plan endpoints exist yet (see
 * docs/modules/module-plan.md). `getOrganizationList` always attempts a
 * real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring the MOD-009 dashboard api
 * modules' dev-proxy-aware mock-fallback shape (including the
 * SCR-014-discovered content-type check against the Vite dev server's
 * own 200-OK HTML fallback).
 *
 * FIGMA VERIFICATION: node 90:8293 was inspected this session via the
 * Figma MCP (get_metadata + get_screenshot). Every KPI value, the 12
 * organization rows (name, id, primary admin, plan, status, users,
 * pipelines, last activity, created date, region), the toolbar
 * filters, the bulk-action set, and the "Showing 1–12 of 1,284" footer
 * are transcribed from the actual frame's text nodes, so the
 * layout/content fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * KNOWN LIMITATION: the mock snapshot is a single fixed page of 12 rows
 * against a declared total of 1,284. Server-side search/filter/sort/
 * pagination is not simulated across the full set — the screen applies
 * its search + status/plan/region filters client-side over the 12
 * mocked rows only. A real MOD-004 endpoint would accept query params
 * (search, status, plan, region, page, pageSize) and return the
 * matching page plus a real total. This is clearly labeled as sample
 * data in the UI.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class OrganizationListError extends Error {}

const MOCK_ORGANIZATION_LIST = {
  updatedAt: 'just now',
  kpis: [
    { key: 'total', label: 'Total Organizations', value: '1,284', helper: '+12 this month', tone: 'default' },
    { key: 'active', label: 'Active', value: '1,108', helper: '86.3% of total', tone: 'success' },
    { key: 'trial', label: 'Trial', value: '124', helper: 'Avg 8.2 days left', tone: 'warning' },
    { key: 'suspended', label: 'Suspended', value: '38', helper: '4 suspended this week', tone: 'danger' },
    { key: 'expiring', label: 'Expiring Soon', value: '14', helper: 'Within 30 days', tone: 'warning' },
  ],
  planFilters: ['All plans', 'Enterprise', 'Professional', 'Starter'],
  statusFilters: ['All statuses', 'Active', 'Trial', 'Suspended', 'Pending', 'Expired'],
  regionFilters: ['All regions', 'US East', 'US West', 'EU West', 'EU Central', 'EU North', 'AP South', 'AP East'],
  total: 1284,
  rows: [
    { id: 'org_8kx2n9q', name: 'Acme Corporation', initials: 'A', tone: 'blue', adminName: 'James Park', adminEmail: 'j.park@acme.com', plan: 'Enterprise', status: 'Active', users: '284', pipelines: '142', lastActivity: 'Just now', created: 'Jan 14, 2023', region: 'US East' },
    { id: 'org_3nj7g4r', name: 'GlobalTech Industries', initials: 'G', tone: 'purple', adminName: 'Sarah Mitchell', adminEmail: 's.mitchell@globaltech.io', plan: 'Enterprise', status: 'Active', users: '196', pipelines: '98', lastActivity: '4m ago', created: 'Mar 02, 2023', region: 'EU West' },
    { id: 'org_6mq1v8d', name: 'Nexus Analytics', initials: 'N', tone: 'green', adminName: 'Roberto Vega', adminEmail: 'r.vega@nexus.ai', plan: 'Professional', status: 'Active', users: '84', pipelines: '41', lastActivity: '18m ago', created: 'Jun 18, 2023', region: 'US West' },
    { id: 'org_2bt5k6f', name: 'Apex Data Systems', initials: 'A', tone: 'blue', adminName: 'Priya Sharma', adminEmail: 'p.sharma@apexdata.com', plan: 'Enterprise', status: 'Trial', users: '12', pipelines: '6', lastActivity: '2h ago', created: 'Jul 28, 2024', region: 'AP South' },
    { id: 'org_9yx4a3a', name: 'CloudSync Solutions', initials: 'C', tone: 'green', adminName: 'Tom Bradley', adminEmail: 't.bradley@cloudsync.io', plan: 'Starter', status: 'Active', users: '28', pipelines: '14', lastActivity: 'Yesterday', created: 'Feb 11, 2024', region: 'US East' },
    { id: 'org_1cr7z2p', name: 'DataBridge Corp', initials: 'D', tone: 'purple', adminName: 'Li Wei', adminEmail: 'l.wei@databridge.com', plan: 'Professional', status: 'Suspended', users: '56', pipelines: '22', lastActivity: '3 days ago', created: 'Sep 05, 2023', region: 'AP East' },
    { id: 'org_4uf8n1z', name: 'Hyperion Ventures', initials: 'H', tone: 'blue', adminName: 'Anna Kowalski', adminEmail: 'a.kowalski@hyperion.eu', plan: 'Enterprise', status: 'Active', users: '148', pipelines: '74', lastActivity: '1h ago', created: 'Nov 22, 2022', region: 'EU Central' },
    { id: 'org_7xo2e5b', name: 'StreamLab Technologies', initials: 'S', tone: 'purple', adminName: 'Daniel Osei', adminEmail: 'd.osei@streamlab.io', plan: 'Professional', status: 'Trial', users: '8', pipelines: '3', lastActivity: '6h ago', created: 'Aug 12, 2024', region: 'US West' },
    { id: 'org_5gs3s9c', name: 'Meridian Test Org', initials: 'M', tone: 'blue', adminName: 'Dev Team', adminEmail: 'dev@meridian.io', plan: 'Starter', status: 'Pending', users: '2', pipelines: '1', lastActivity: '2 weeks ago', created: 'Oct 01, 2024', region: 'US East' },
    { id: 'org_8hpsr7m', name: 'OldCo Legacy', initials: 'O', tone: 'gray', adminName: null, adminEmail: null, plan: 'Enterprise', status: 'Expired', users: '—', pipelines: '—', lastActivity: '6 months ago', created: 'Apr 14, 2021', region: 'EU West' },
    { id: 'org_3lv9t2u', name: 'Zenith Capital Group', initials: 'Z', tone: 'purple', adminName: 'Mei Lin', adminEmail: 'm.lin@zenithcapital.com', plan: 'Enterprise', status: 'Active', users: '312', pipelines: '158', lastActivity: '8m ago', created: 'Dec 08, 2022', region: 'US East' },
    { id: 'org_8kd1n6s', name: 'Atlas Manufacturing', initials: 'A', tone: 'green', adminName: 'Chris Andersen', adminEmail: 'c.andersen@atlas.com', plan: 'Professional', status: 'Active', users: '64', pipelines: '38', lastActivity: '3h ago', created: 'May 19, 2023', region: 'EU North' },
  ],
};

export async function getOrganizationList({ search, status, plan, region } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'All statuses') params.set('status', status);
    if (plan && plan !== 'All plans') params.set('plan', plan);
    if (region && region !== 'All regions') params.set('region', region);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/organizations${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new OrganizationListError('Unable to load organizations right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new OrganizationListError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_ORGANIZATION_LIST, mocked: true };
  }
}
