/**
 * Data + save for the Access Control Settings Screen (SCR-044, node
 * 114:25163, Figma page "Page 1", frame "Access Control Settings").
 *
 * MOCK BOUNDARY: MOD-003 (RBAC & Permissions) is still `PLANNED` with no
 * backend deployed — there is no org-level access-control / security-policy
 * endpoint yet (see docs/modules/module-plan.md). `getAccessControlSettings`
 * attempts a real GET first and only falls back to the design-sourced
 * baseline (flagged `mocked: true`) when the endpoint is unreachable /
 * returns non-JSON (defends against the Vite dev server's own 200-OK HTML
 * SPA fallback). `updateAccessControlSettings` mirrors it on the write side
 * (real PATCH first → simulated success). This is the same shape as the
 * sibling settings module organizations/organizationSettings.api.js.
 *
 * SAVED-BASELINE DECISION: the Figma frame is captured mid-edit (amber
 * "Modified"/"Changed" badges, a populated Pending Changes rail, Security
 * Impact copy). Per docs/agent-rules.md §5 and the org-settings precedent,
 * the loaded baseline is the *saved* configuration, NOT the mid-edit state:
 *   - MFA for All Users is OFF in the baseline (design toggles it on),
 *   - Idle Timeout is 60 minutes (design edits to 30),
 *   - API Token Expiration is 180 days (design edits to 90),
 *   - Allowed Countries omit Singapore (design adds it).
 * Dirty-state, the Pending Changes list, and Security Impact are then
 * computed live as the user reproduces those edits — nothing is seeded
 * dirty.
 *
 * FIGMA VERIFICATION: node 114:25163 was inspected this session via the
 * Figma MCP (get_screenshot + get_metadata; 304 text nodes extracted). The
 * eight policy sections (Authentication, MFA, Password, Session, Network/IP,
 * Access Restrictions, Privileged Access, API/Token) and the right rail
 * (Security Overview 82/100, Active Policy Summary, Validation Status 5/6,
 * Compliance Requirements, Security Impact, Pending Changes) are transcribed
 * from the actual frame's text nodes, so content fidelity is `verified`.
 * See docs/reviews/review-log.md.
 *
 * The option catalogues below are design-sourced; a real MOD-003 backend
 * would serve them from a security-policy config endpoint.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class AccessControlSettingsError extends Error {}

/** Select option catalogues (node 114:25163). */
export const ACCESS_CONTROL_OPTIONS = {
  defaultAuthMethod: ['SSO (SAML 2.0)', 'Local Authentication', 'LDAP / Active Directory', 'OAuth 2.0', 'OpenID Connect'],
  authPriority: ['SSO first, local fallback', 'SSO only', 'Local first, SSO fallback', 'Local only'],
  mfaGracePeriod: ['0 days (immediate)', '3 days', '7 days', '14 days', '30 days'],
  rememberTrustedDevice: ['0 days (always MFA)', '7 days', '14 days', '30 days', '90 days'],
  passwordStrength: ['Basic', 'Moderate', 'Strong', 'Very Strong'],
  sessionTimeout: ['1 hour', '2 hours', '4 hours', '8 hours', '12 hours', '24 hours'],
  idleTimeout: ['15 minutes', '30 minutes', '60 minutes', '120 minutes', 'No idle timeout'],
  vpnDetection: ['Allow VPN access', 'Warn on VPN access', 'Block VPN access'],
  proxyTorDetection: ['Allow', 'Warn and log', 'Block proxy / Tor'],
  deviceRestriction: ['No restriction', 'Managed devices only', 'Registered devices only'],
  apiAccessRestriction: ['Unrestricted', 'IP-restricted', 'Token + IP restricted', 'Disabled'],
  remoteAccess: ['Allow all remote access', 'VPN required', 'Trusted networks only'],
  privilegedApprovalBy: ['Organization Admins', 'Security Admins', 'Two-admin quorum', 'Designated approver group'],
  jitMaxDuration: ['1 hour', '2 hours', '4 hours', '8 hours'],
  adminSessionTimeout: ['30 minutes', '1 hour', '2 hours', '4 hours'],
  approvalExpiry: ['15 minutes', '30 minutes', '60 minutes', '120 minutes'],
  ipRangeType: ['Trusted', 'VPN', 'Service', 'Restricted'],
};

/**
 * Allowed authentication providers (node 114:25163 "Allowed Authentication
 * Providers"). `recommended` drives the amber "Recommended" tag.
 */
export const AUTH_PROVIDERS = [
  { id: 'local', label: 'Local Authentication', recommended: false, description: 'Username and password authentication against the platform directory.' },
  { id: 'ldap', label: 'LDAP / Active Directory', recommended: true, description: 'Authenticate users against your organization LDAP or Active Directory.' },
  { id: 'saml', label: 'SAML 2.0', recommended: true, description: 'Enterprise SSO via Security Assertion Markup Language.' },
  { id: 'oauth', label: 'OAuth 2.0', recommended: true, description: 'Token-based authentication using OAuth 2.0 authorization.' },
  { id: 'oidc', label: 'OpenID Connect', recommended: true, description: 'Identity layer on top of OAuth 2.0 for federated identity.' },
  { id: 'hwkey', label: 'Hardware Security Keys', recommended: true, description: 'FIDO2/WebAuthn physical security key authentication.' },
];

/**
 * Allowed MFA factors (node 114:25163 "Allowed Authentication Factors").
 * `strength` drives the coloured strength tag.
 */
export const MFA_FACTORS = [
  { id: 'totp', label: 'Authenticator App (TOTP)', strength: 'Strong', description: 'Time-based one-time passwords via apps like Authy or Google Authenticator.' },
  { id: 'fido2', label: 'Security Key (FIDO2/WebAuthn)', strength: 'Strongest', description: 'Physical hardware security keys. Highest phishing resistance.' },
  { id: 'hwtoken', label: 'Hardware Token', strength: 'Strong', description: 'Dedicated hardware TOTP or HOTP devices managed by IT.' },
  { id: 'email', label: 'Email Verification', strength: 'Moderate', description: 'One-time code delivered via email. Fallback method only.' },
  { id: 'sms', label: 'SMS Verification', strength: 'Weak', notRecommended: true, description: 'One-time code via SMS. Not recommended for high-security roles.' },
];

/**
 * Password complexity requirements (node 114:25163 "Complexity
 * Requirements"). Rendered as a checklist; each maps to a boolean field.
 */
export const COMPLEXITY_REQUIREMENTS = [
  { id: 'reqUppercase', label: 'Uppercase letters (A–Z)' },
  { id: 'reqLowercase', label: 'Lowercase letters (a–z)' },
  { id: 'reqNumbers', label: 'Numbers (0–9)' },
  { id: 'reqSpecial', label: 'Special characters (!@#$…)' },
  { id: 'reqNoUsername', label: 'Cannot contain username' },
  { id: 'reqNoDictionary', label: 'Cannot contain dictionary words' },
];

/** Allowed-country catalogue for the Network section chips (node 114:25163). */
export const COUNTRY_OPTIONS = [
  'United States', 'United Kingdom', 'Germany', 'Netherlands', 'Canada',
  'Australia', 'Singapore', 'France', 'Japan', 'Ireland', 'Sweden', 'Switzerland',
];

/**
 * Design-sourced SAVED security-policy baseline (node 114:25163). The
 * `form` block is the editable saved configuration; `ipRanges`,
 * `blockedRanges`, `emergencyAccounts`, and the summary context accompany
 * it. See the SAVED-BASELINE DECISION note above for the four fields whose
 * saved values intentionally differ from the frame's mid-edit rendering.
 */
function buildBaseline(orgId) {
  const id = orgId || 'current';
  return {
    id,
    organizationId: 'ORG-00142',
    organizationName: 'Acme Corporation',
    lastSavedLabel: 'Aug 26, 2026 · 14:32 UTC',
    lastSavedBy: 'Security Admin',
    securityScore: 82,
    totalUsers: 1284,
    // Allowed IP ranges (read-only table with add/remove; node 114:25163).
    ipRanges: [
      { id: 'ip_hq', label: 'HQ Office', cidr: '203.0.113.0/24', type: 'Trusted', description: 'New York headquarters' },
      { id: 'ip_london', label: 'London Office', cidr: '198.51.100.0/24', type: 'Trusted', description: 'London engineering office' },
      { id: 'ip_vpn', label: 'VPN Range', cidr: '10.0.0.0/8', type: 'VPN', description: 'Corporate VPN egress IPs' },
      { id: 'ip_aws', label: 'AWS Prod', cidr: '52.20.0.0/16', type: 'Service', description: 'Production AWS infrastructure' },
    ],
    blockedRanges: [
      { id: 'bl_1', cidr: '192.0.2.0/24', reason: 'Flagged by threat feed' },
      { id: 'bl_2', cidr: '198.51.100.100/32', reason: 'Brute force source' },
    ],
    emergencyAccounts: 2,
    // Editable saved settings (the state the user edits from).
    form: {
      // Authentication Policies
      defaultAuthMethod: 'SSO (SAML 2.0)',
      authPriority: 'SSO first, local fallback',
      providers: { local: true, ldap: true, saml: true, oauth: true, oidc: false, hwkey: false },
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      loginAttemptWindow: 15,
      // MFA — saved baseline has All-Users MFA OFF (design toggles it on).
      mfaAllUsers: false,
      mfaAdministrators: true,
      mfaPrivilegedRoles: true,
      mfaTrustedDevices: true,
      mfaBackupCodes: true,
      mfaGracePeriod: '7 days',
      rememberTrustedDevice: '30 days',
      factors: { totp: true, fido2: true, hwtoken: true, email: true, sms: false },
      // Password Policy
      passwordMinLength: 12,
      passwordMaxAge: 90,
      passwordHistory: 12,
      passwordLockoutThreshold: 5,
      passwordLockoutDuration: 30,
      resetTokenExpiry: 60,
      reqUppercase: true,
      reqLowercase: true,
      reqNumbers: true,
      reqSpecial: true,
      reqNoUsername: true,
      reqNoDictionary: false,
      // Session Management — saved Idle Timeout is 60m (design edits to 30m).
      sessionTimeout: '8 hours',
      idleTimeout: '60 minutes',
      maxConcurrentSessions: 3,
      sessionRenewal: true,
      forceLogoutOnPasswordChange: true,
      rememberMe: false,
      revokeOnSuspicious: true,
      // Network and IP Restrictions
      vpnDetection: 'Allow VPN access',
      proxyTorDetection: 'Block proxy / Tor',
      // Allowed Countries — saved set omits Singapore (design adds it).
      allowedCountries: ['United States', 'United Kingdom', 'Germany', 'Netherlands', 'Canada', 'Australia'],
      // Access Restrictions
      businessHoursAccess: false,
      deviceRestriction: 'No restriction',
      apiAccessRestriction: 'Token + IP restricted',
      remoteAccess: 'VPN required',
      departmentRestrictions: false,
      geoRestriction: true,
      maintenanceModeAccess: true,
      // Privileged Access Policies
      jitAccess: true,
      privilegedApproval: true,
      elevatedApprovalWorkflow: true,
      breakGlassAccess: false,
      jitMaxDuration: '4 hours',
      adminSessionTimeout: '2 hours',
      approvalExpiry: '60 minutes',
      privilegedApprovalBy: 'Security Admins',
      // API and Token Policies — saved API Token Expiration 180d (design 90d).
      apiTokenExpiration: 180,
      tokenRotationPeriod: 30,
      maxTokensPerUser: 5,
      allowPersonalTokens: true,
      allowServiceTokens: true,
      enforceTokenRotation: true,
      revokeTokensOnPasswordChange: true,
      restrictOAuthClients: true,
      serviceTokenMaxExpiry: 365,
      oauthClientTokenLifetime: 60,
    },
  };
}

/**
 * Load saved access-control settings. Real GET first; on any failure
 * (unreachable endpoint, non-JSON dev-server fallback, network error)
 * return the design-sourced baseline flagged `mocked: true`.
 */
export async function getAccessControlSettings(orgId) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/access-control`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new AccessControlSettingsError('Unable to load access-control settings right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new AccessControlSettingsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(orgId), mocked: true };
  }
}

/**
 * Persist access-control settings. Real PATCH first; on any failure return
 * a simulated success flagged `mocked: true` so the UI can disclose that
 * nothing was really persisted.
 */
export async function updateAccessControlSettings(orgId, changes) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/access-control`, {
      method: 'PATCH',
      body: changes,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new AccessControlSettingsError('Unable to save access-control settings right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new AccessControlSettingsError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: orgId, savedAt: new Date().toISOString(), mocked: true };
  }
}
