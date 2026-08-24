/**
 * Data + submit for the Organization Setting Screen (SCR-028, node
 * 93:3192, Figma page "Page 1", frame "OrganizationSettingsScreen").
 *
 * MOCK BOUNDARY: MOD-004 (Organization Management) is still `PLANNED`
 * with no backend deployed — no organization settings endpoint exists
 * yet (see docs/modules/module-plan.md). `getOrganizationSettings`
 * always attempts a real GET first and only falls back to the design-
 * sourced baseline below when the endpoint is unreachable;
 * `updateOrganizationSettings` always attempts a real PATCH first and
 * only falls back to a simulated success when the endpoint is
 * unreachable. Both mirror the sibling MOD-004 write modules
 * (editOrganization.api.js / createOrganization.api.js) — including the
 * content-type check against the Vite dev server's own 200-OK HTML
 * fallback. Mocked results are flagged `mocked: true` so the UI can
 * disclose that nothing was really loaded/persisted.
 *
 * FIGMA VERIFICATION: node 93:3192 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata full text-node transcription).
 * The seven setting cards (General Settings, Security & Authentication,
 * Notification Settings, Branding, Integration Settings, Operational
 * Defaults, Compliance & Audit), the right-rail cards (Organization
 * Summary, Validation Status 4/6, Security Health, Recent Configuration
 * Activity, Quick Actions), the API-key table, and every field value are
 * transcribed from the actual frame's text nodes, so the layout/content
 * fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * DESIGN-INTENT DECISION (mirrors SCR-027): the Figma frame shows the
 * settings MID-EDIT ("2 Unsaved Changes": Organization Display Name and
 * SSO both badged "Modified"). We do NOT seed the form dirty — a real
 * settings page loads the SAVED configuration and the user makes changes.
 * The dirty-tracking, "Modified" badges, unsaved-change counter, and
 * Save-confirmation diff are computed live from the user's edits against
 * this saved baseline.
 *
 * Select option sets are design-sourced enumerations (from the frame's
 * select values); a real MOD-004 config endpoint would serve these.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class OrganizationSettingsError extends Error {}

/** Design-sourced select option sets (Figma node 93:3192). */
export const SETTINGS_OPTIONS = {
  language: ['English (US)', 'English (UK)', 'French', 'German', 'Spanish', 'Japanese'],
  timeZone: [
    'America/New_York (UTC−5)',
    'America/Chicago (UTC−6)',
    'America/Denver (UTC−7)',
    'America/Los_Angeles (UTC−8)',
    'Europe/London (UTC+0)',
    'Europe/Berlin (UTC+1)',
    'Asia/Singapore (UTC+8)',
  ],
  dateFormat: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
  numberFormat: ['1,234,567.89 (US)', '1.234.567,89 (EU)', '1 234 567,89 (FR)'],
  currency: ['USD — US Dollar', 'EUR — Euro', 'GBP — British Pound', 'CAD — Canadian Dollar', 'JPY — Japanese Yen'],
  businessDays: ['Mon – Fri', 'Sun – Thu', 'Mon – Sat', 'All week'],
  defaultDashboard: ['Platform Overview', 'Executive Dashboard', 'Pipeline Overview', 'System Health'],
  passwordPolicy: [
    'Strong (12+ chars, mixed case, symbols)',
    'Standard (8+ chars)',
    'Custom',
  ],
  passwordExpiration: ['30 days', '60 days', '90 days', '180 days', 'Never'],
  sessionTimeout: ['1 hour', '4 hours', '8 hours', '24 hours'],
  concurrentSessions: ['1 session per user', '3 sessions per user', '5 sessions per user', 'Unlimited'],
  apiAccess: ['Full Access', 'Read Only', 'Disabled'],
  emailBrandingTemplate: ['Enterprise — Logo + Footer', 'Standard — Logo only', 'Minimal — Text only'],
  eventSignatureMethod: ['HMAC-SHA256', 'HMAC-SHA512', 'None'],
  retryPolicy: ['3 attempts · exponential backoff', '5 attempts · exponential backoff', '3 attempts · fixed interval', 'No retries'],
  connectorPermissions: ['Org Admin only', 'Admins + Editors', 'All members'],
  outboundTimeout: ['15 seconds', '30 seconds', '60 seconds', '120 seconds'],
  defaultEnvironment: ['Production', 'Staging', 'Development'],
  pipelineRetention: ['30 days', '90 days', '180 days', '1 year', 'Unlimited'],
  logRetention: ['30 days', '90 days', '180 days', '1 year'],
  defaultRetryPolicy: ['3 retries · 60s interval', '5 retries · 30s interval', '3 retries · exponential backoff', 'No retries'],
  executionTimeout: ['1 hour', '2 hours', '4 hours', '8 hours', 'No limit'],
  workerAssignment: ['Auto (platform managed)', 'Dedicated pool', 'Manual assignment'],
  dataRetention: ['30 days (minimal)', '90 days (standard)', '180 days (extended)', '1 year', '7 years (compliance)'],
  dataResidency: ['US East — us-east-1', 'US West — us-west-2', 'EU West — eu-west-1', 'EU Central — eu-central-1', 'Asia Pacific — ap-southeast-1'],
  privacySettings: ['GDPR + CCPA compliant', 'GDPR only', 'CCPA only', 'Standard'],
};

/**
 * Design-sourced saved settings baseline (node 93:3192, "Acme
 * Corporation" / ORG-00142). The `form` block is the editable saved
 * configuration; `apiKeys`, `recentActivity`, `securityHealth`, and the
 * summary/read-only context accompany it. A real MOD-004 settings
 * endpoint would return the persisted configuration for `orgId`.
 */
function buildBaseline(orgId) {
  const id = orgId || 'ORG-00142';
  return {
    id,
    organizationId: 'ORG-00142',
    name: 'Acme Corporation',
    status: 'Active',
    plan: 'Enterprise',
    administrator: 'James Park',
    region: 'US East (us-east-1)',
    sinceLabel: 'Since Jan 2023',
    lastSavedLabel: 'Jul 25, 2026',
    ssoProvider: 'Okta SAML 2.0 · Configured Jan 14, 2023',
    recentActivity: [
      { id: 'ca_1', label: 'SSO configuration updated', meta: 'Super Admin · Jul 28 · 14:32 UTC' },
      { id: 'ca_2', label: 'Notification settings modified', meta: 'Super Admin · Jul 28 · 11:05 UTC' },
      { id: 'ca_3', label: 'API key rotated', meta: 'Super Admin · Jul 27 · 09:11 UTC' },
      { id: 'ca_4', label: 'Compliance mode reviewed', meta: 'Super Admin · Jul 25 · 16:45 UTC' },
      { id: 'ca_5', label: 'Branding updated', meta: 'J. Park · Jul 20 · 10:00 UTC' },
    ],
    // API keys — read-only inventory; Rotate/Revoke/Generate are gated on
    // MOD-004's key-management endpoint (still PLANNED).
    apiKeys: [
      { id: 'key_prod', name: 'Production Key', created: 'Jan 14, 2023', status: 'Active' },
      { id: 'key_analytics', name: 'Analytics Service', created: 'Mar 28, 2024', status: 'Active' },
      { id: 'key_legacy', name: 'Legacy Integration', created: 'Jan 14, 2023', status: 'Revoked' },
    ],
    // Security Health posture (read-only sidebar reference).
    securityHealth: [
      { label: 'MFA', value: 'Enforced', tone: 'good' },
      { label: 'SSO', value: 'Enabled', tone: 'good' },
      { label: 'Password Policy', value: 'Strong', tone: 'good' },
      { label: 'API Security', value: 'Full Access', tone: 'warn' },
      { label: 'Security Alerts', value: '0 active', tone: 'good' },
    ],
    // Editable saved settings (the state the user edits from).
    form: {
      // General Settings
      displayName: 'Acme Corporation',
      language: 'English (US)',
      timeZone: 'America/New_York (UTC−5)',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: '1,234,567.89 (US)',
      currency: 'USD — US Dollar',
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
      businessDays: 'Mon – Fri',
      defaultDashboard: 'Platform Overview',
      // Security & Authentication
      requireMfa: true,
      enableSso: false, // design shows edited to on; off is the saved baseline
      passwordPolicy: 'Strong (12+ chars, mixed case, symbols)',
      passwordExpiration: '90 days',
      sessionTimeout: '8 hours',
      concurrentSessions: '3 sessions per user',
      apiAccess: 'Full Access',
      allowedIpRanges: '',
      // Notification Settings — System
      notifyPlatformAlerts: true,
      notifyPipelineFailures: true,
      notifyConnectorFailures: true,
      notifyScheduledMaintenance: false,
      // Notification Settings — User
      notifyInvitationEmails: true,
      notifyPasswordReset: true,
      notifyUserActivity: false,
      // Delivery channels
      channelEmail: true,
      channelInApp: true,
      channelWebhooks: false,
      notificationWebhookUrl: '',
      // Branding
      portalDisplayName: 'Acme Corporation',
      primaryBrandColor: '#0F5699',
      emailBrandingTemplate: 'Enterprise — Logo + Footer',
      loginWelcomeMessage: 'Welcome to Acme Corporation’s data platform. Sign in to continue.',
      // Integration Settings
      webhookEndpointUrl: 'https://hooks.acme.com/meridian/events',
      eventSignatureMethod: 'HMAC-SHA256',
      retryPolicy: '3 attempts · exponential backoff',
      connectorPermissions: 'Org Admin only',
      outboundTimeout: '30 seconds',
      // Operational Defaults
      defaultEnvironment: 'Production',
      pipelineRetention: '90 days',
      logRetention: '180 days',
      defaultRetryPolicy: '3 retries · 60s interval',
      executionTimeout: '4 hours',
      workerAssignment: 'Auto (platform managed)',
      // Compliance & Audit
      auditLogging: true,
      enhancedCompliance: false,
      dataRetention: '90 days (standard)',
      dataResidency: 'US East — us-east-1',
      privacySettings: 'GDPR + CCPA compliant',
    },
  };
}

/**
 * Load the saved organization settings. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getOrganizationSettings(orgId) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/settings`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new OrganizationSettingsError('Unable to load organization settings right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new OrganizationSettingsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(orgId), mocked: true };
  }
}

/**
 * Persist organization settings. Real PATCH first; on any failure return
 * a simulated success flagged `mocked: true` so the UI can disclose that
 * nothing was really persisted.
 */
export async function updateOrganizationSettings(orgId, changes) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/settings`, {
      method: 'PATCH',
      body: changes,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new OrganizationSettingsError('Unable to save settings right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new OrganizationSettingsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: orgId, savedAt: new Date().toISOString(), mocked: true };
  }
}
