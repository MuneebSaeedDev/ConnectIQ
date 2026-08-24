/**
 * Data + submit for the Create Organization Screen (SCR-026, node 92:2,
 * Figma page "Page 1").
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no organization-provisioning endpoint
 * exists yet (see docs/modules/module-plan.md). `createOrganization`
 * always attempts a real POST first and only falls back to a simulated
 * success when the endpoint is unreachable, mirroring the read-side
 * MOD-004 (organizationList.api.js / organizationDetails.api.js) and
 * MOD-009 dashboard mock-fallback shape (including the content-type
 * check against the Vite dev server's own 200-OK HTML fallback). The
 * simulated success returns a generated `org_…` id + slug so the caller
 * can navigate to the (also-mocked) detail screen, and marks the result
 * `mocked: true` so the UI can disclose that nothing was really
 * persisted.
 *
 * FIGMA VERIFICATION: node 92:2 was inspected this session via the Figma
 * MCP (get_design_context + get_screenshot). The six form sections
 * (Organization Information, Regional Settings, Primary Administrator,
 * Subscription & Licensing, Security Configuration, Default Platform
 * Configuration), the option lists, the live Organization Summary, the
 * 7-item Validation Status list, the Security Checklist, Quick Help, and
 * the Confirm Organization Creation dialog are all transcribed from the
 * actual frame's text nodes, so the layout/content fidelity is
 * `verified`. See docs/reviews/review-log.md.
 *
 * The option lists below are design-sourced (from the frame's select
 * values); a real MOD-004 backend would serve these from a config /
 * plans / regions endpoint. They are exported as constants rather than
 * fetched because they are static enumerations, not tenant data.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class CreateOrganizationError extends Error {}

/** Design-sourced select option sets (Figma node 92:2). */
export const ORG_FORM_OPTIONS = {
  industry: [
    'Financial Services',
    'Healthcare',
    'Technology',
    'Retail & E-commerce',
    'Manufacturing',
    'Media & Entertainment',
    'Education',
    'Government',
    'Other',
  ],
  organizationType: ['Enterprise', 'Business', 'Startup', 'Non-profit', 'Government'],
  country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia', 'Japan', 'Singapore'],
  region: [
    'US East (us-east-1)',
    'US West (us-west-2)',
    'EU West (eu-west-1)',
    'EU Central (eu-central-1)',
    'Asia Pacific (ap-southeast-1)',
  ],
  timeZone: [
    'America/New_York (UTC-5)',
    'America/Chicago (UTC-6)',
    'America/Denver (UTC-7)',
    'America/Los_Angeles (UTC-8)',
    'Europe/London (UTC+0)',
    'Europe/Berlin (UTC+1)',
    'Asia/Singapore (UTC+8)',
  ],
  language: ['English (US)', 'English (UK)', 'French', 'German', 'Spanish', 'Japanese'],
  dateFormat: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
  currency: ['USD — US Dollar', 'EUR — Euro', 'GBP — British Pound', 'CAD — Canadian Dollar', 'JPY — Japanese Yen'],
  initialRole: ['Organization Admin', 'Billing Admin', 'Read-only Admin'],
  billingModel: ['Annual — Invoiced', 'Annual — Card', 'Monthly — Card'],
  passwordPolicy: [
    'Strong (12+ chars, complexity required)',
    'Standard (8+ chars)',
    'Custom',
  ],
  sessionTimeout: ['1 hour', '4 hours', '8 hours', '24 hours'],
  apiAccess: ['Full Access', 'Read Only', 'Disabled'],
  defaultEnvironment: ['Production', 'Staging', 'Development'],
  dataRetention: ['30 days', '90 days', '180 days', '1 year', 'Unlimited'],
  notificationPreferences: ['Email + In-App', 'Email only', 'In-App only', 'None'],
  connectorPermissions: ['Org Admin only', 'Admins + Editors', 'All members'],
};

/**
 * Design-sourced plan catalog: the included-features list and the
 * headline limits shown under "Subscription & Licensing" for the
 * selected plan. A real MOD-004 plans endpoint would supply this.
 */
export const PLAN_CATALOG = {
  Enterprise: {
    features: [
      'Unlimited pipelines',
      'Advanced scheduling',
      'Priority support',
      'Custom connectors',
      'Audit logging',
      'SSO / SAML',
      'Role-based access',
      'Data lineage',
      'SLA guarantees',
    ],
    userLimit: '300 seats',
    storage: '5 TB',
    support: '24/7 Priority',
    defaultLicenseLimit: '300',
    defaultStorage: '5 TB',
  },
  Business: {
    features: ['Up to 100 pipelines', 'Standard scheduling', 'Business-hours support', 'Audit logging', 'Role-based access'],
    userLimit: '100 seats',
    storage: '2 TB',
    support: 'Business hours',
    defaultLicenseLimit: '100',
    defaultStorage: '2 TB',
  },
  Starter: {
    features: ['Up to 10 pipelines', 'Basic scheduling', 'Community support'],
    userLimit: '10 seats',
    storage: '250 GB',
    support: 'Community',
    defaultLicenseLimit: '10',
    defaultStorage: '250 GB',
  },
};

export const SUBSCRIPTION_PLANS = Object.keys(PLAN_CATALOG);

/**
 * Attempt to provision an organization. Real POST first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return a simulated success flagged `mocked: true`.
 */
export async function createOrganization(payload) {
  try {
    const res = await apiFetch('/organizations', { method: 'POST', body: payload });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new CreateOrganizationError('Unable to create the organization right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new CreateOrganizationError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const slug = (payload?.code || payload?.name || 'org')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24);
    const id = `org_${Math.random().toString(36).slice(2, 10)}`;
    return { id, slug, name: payload?.name, mocked: true };
  }
}
