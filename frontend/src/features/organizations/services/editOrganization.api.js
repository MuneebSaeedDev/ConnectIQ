/**
 * Data + submit for the Edit Organization Screen (SCR-027, node 93:1566,
 * Figma page "Page 1", frame "EditOrganizationScreen").
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no organization update endpoint exists yet
 * (see docs/modules/module-plan.md). `getEditableOrganization` always
 * attempts a real GET first and only falls back to the design-sourced
 * baseline below when the endpoint is unreachable; `updateOrganization`
 * always attempts a real PATCH first and only falls back to a simulated
 * success when the endpoint is unreachable. Both mirror the read-side
 * MOD-004 modules (organizationList.api.js / organizationDetails.api.js)
 * and the sibling createOrganization.api.js write shape — including the
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback. Mocked results are flagged `mocked: true` so the UI can
 * disclose that nothing was really loaded/persisted.
 *
 * FIGMA VERIFICATION: node 93:1566 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The baseline values,
 * the pre-modified field set (Organization Name, Description,
 * Subscription Plan, License Limit, SSO shown with "Modified" badges),
 * the read-only fields (Organization Code, Renewal Date, Trial
 * Expiration), the Change Summary diffs, the 6-item Validation Status
 * list, and the Recent Activity timeline are all transcribed from the
 * actual frame's text nodes, so the layout/content fidelity is
 * `verified`. See docs/reviews/review-log.md.
 *
 * The design's frame shows the org MID-EDIT (3 unsaved changes already
 * applied: name Acme Corp→Acme Corporation, license 300→500, SSO
 * off→on). We do NOT seed the form in that dirty state — a real edit
 * screen loads the SAVED record and the user makes changes. The
 * design's "Previously" / Change Summary values therefore become the
 * SAVED baseline, and the dirty-tracking + Change Summary are computed
 * live from the user's edits against that baseline.
 *
 * The select option sets and plan catalog are shared with the Create
 * screen (createOrganization.api.js) since they are the same design-
 * sourced enumerations; re-exported here for a single import site.
 */

import { apiFetch, readJson } from '../../../services/api/client';
import { ORG_FORM_OPTIONS, PLAN_CATALOG, SUBSCRIPTION_PLANS } from './createOrganization.api';

export { ORG_FORM_OPTIONS, PLAN_CATALOG, SUBSCRIPTION_PLANS };

export class EditOrganizationError extends Error {}

/**
 * Design-sourced saved baseline for the edited organization (node
 * 93:1566, "Acme Corporation" / ORG-00142). Read-only, activity, and
 * administrator context accompany the editable field values. A real
 * MOD-004 endpoint would return the persisted record for `orgId`.
 */
function buildBaseline(orgId) {
  const id = orgId || 'ORG-00142';
  return {
    id,
    organizationId: 'ORG-00142',
    status: 'Active',
    createdLabel: 'Jan 14, 2023',
    lastUpdatedLabel: 'Jul 28, 2026 · 14:32 UTC',
    lastSavedLabel: 'Jan 14, 2023',
    admin: {
      initials: 'JP',
      name: 'James Park',
      meta: 'j.park@acme.com · VP of Data Engineering',
      status: 'Active',
    },
    recentActivity: [
      { id: 'ra_1', label: 'Subscription upgraded', meta: 'Super Admin · Jul 28 · 14:28 UTC' },
      { id: 'ra_2', label: 'License limit modified', meta: 'Super Admin · Jul 28 · 14:20 UTC' },
      { id: 'ra_3', label: 'API key rotated', meta: 'J. Park · Jul 27 · 09:11 UTC' },
      { id: 'ra_4', label: 'Security policy updated', meta: 'Super Admin · Jul 25 · 16:45 UTC' },
      { id: 'ra_5', label: 'Organization activated', meta: 'Super Admin · Jan 14 · 10:00 UTC' },
    ],
    // Editable field values (the SAVED state the user edits from).
    form: {
      // Organization Information
      name: 'Acme Corporation',
      code: 'ACME', // read-only, auto-generated
      displayName: 'Acme Corp',
      industry: 'Financial Services',
      organizationType: 'Enterprise',
      description:
        'Global enterprise operating in financial services, with data pipelines spanning CRM, warehouse, and analytics workloads.',
      // Regional Settings
      country: 'United States',
      region: 'US East (us-east-1)',
      timeZone: 'America/New_York (UTC-5)',
      language: 'English (US)',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD — US Dollar',
      // Primary Administrator
      adminFirstName: 'James',
      adminLastName: 'Park',
      adminEmail: 'j.park@acme.com',
      adminPhone: '+1 (415) 555-0198',
      adminJobTitle: 'VP of Data Engineering',
      initialRole: 'Organization Admin',
      // Subscription & Licensing
      plan: 'Enterprise',
      billingModel: 'Annual — Invoiced',
      licenseLimit: '300', // design shows edited to 500; 300 is the saved baseline
      storage: '5 TB',
      // Security Configuration
      requireMfa: true,
      enableSso: false, // design shows edited to on; off is the saved baseline
      passwordPolicy: 'Strong (12+ chars, complexity required)',
      sessionTimeout: '8 hours',
      apiAccess: 'Full Access',
      ipRestrictions: '',
      // Default Platform Configuration
      defaultEnvironment: 'Production',
      dataRetention: '90 days',
      auditLogging: true,
      notificationPreferences: 'Email + In-App',
      connectorPermissions: 'Org Admin only',
    },
    // Read-only subscription facts shown alongside the editable fields.
    readOnly: {
      renewalDate: 'Jan 14, 2027',
      trialExpiration: 'N/A — Full subscription',
      ssoProvider: 'Okta SAML 2.0 · Configured Jan 14, 2023',
      // Seats currently in use — the denominator is driven live off the
      // edited License Limit (SCR-027 review Medium #3) so editing the
      // limit updates both the "/ N seats" text and the percentage.
      licenseUsedSeats: 247,
      storageUsageLabel: '2.1 TB / 5 TB (42%)',
      storageUsagePct: 42,
    },
  };
}

/**
 * Load the editable organization. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getEditableOrganization(orgId) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/edit`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditOrganizationError('Unable to load this organization for editing right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new EditOrganizationError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(orgId), mocked: true };
  }
}

/**
 * Persist edits to an organization. Real PATCH first; on any failure
 * return a simulated success flagged `mocked: true` so the UI can
 * disclose that nothing was really persisted.
 */
export async function updateOrganization(orgId, changes) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}`, {
      method: 'PATCH',
      body: changes,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditOrganizationError('Unable to save changes right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new EditOrganizationError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: orgId, savedAt: new Date().toISOString(), mocked: true };
  }
}
