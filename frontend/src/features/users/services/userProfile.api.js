/**
 * Data + save for the User Profile Screen (SCR-036, node 109:12114,
 * Figma page "Page 1", frame "UserProfile"). This is the SELF-SERVICE
 * profile — the signed-in user managing their own account — distinct
 * from the admin-viewed User Details screen (SCR-035, node 105:9208).
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity, no `me` endpoint, and no
 * profile-update endpoint exist yet (see docs/modules/module-plan.md).
 * `getMyProfile` always attempts a real GET `/me` first and only falls
 * back to the design-sourced baseline below when the endpoint is
 * unreachable / returns non-JSON (defends against the Vite dev server's
 * own 200-OK HTML SPA fallback, mirroring the sibling userDetails.api.js
 * / editUser.api.js / addUser.api.js modules). `saveMyProfile` attempts
 * a real PUT first and otherwise returns a simulated success. Both flag
 * `mocked: true` so the UI can disclose that nothing was really loaded
 * or persisted.
 *
 * FIGMA VERIFICATION: node 109:12114 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The header ("My
 * Profile" + subtitle + Unsaved changes / Cancel / Reset Changes / Save
 * Changes), the editable sections (Personal Information w/ avatar +
 * read-only identifiers, Personal Preferences, Notification Preferences
 * split into Email / In-app groups), the read-only sections (Security w/
 * MFA / Password / Backup Recovery Codes / Security Questions + password-
 * expiry banner, Active Sessions table, Personal API Tokens table,
 * Recent Account Activity), and the right rail (Profile Summary, Account
 * Status, Security Health score, Quick Actions, Help & Support) are all
 * transcribed from the actual frame's text nodes, so layout/content
 * fidelity is `verified`. See docs/reviews/review-log.md.
 *
 * A real MOD-005 backend would serve the signed-in user's own record;
 * the option lists are design-sourced from the frame's select values.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class UserProfileError extends Error {}

/** Design-sourced select option sets (Figma node 109:12114). */
export const PROFILE_OPTIONS = {
  officeLocation: [
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'London, UK',
    'Remote',
  ],
  pronouns: ['He / Him', 'She / Her', 'They / Them', 'Prefer not to say'],
  language: ['English (US)', 'English (UK)', 'Spanish', 'French', 'German'],
  timeZone: [
    'America/Los_Angeles (UTC-8)',
    'America/New_York (UTC-5)',
    'Europe/London (UTC+0)',
    'Asia/Tokyo (UTC+9)',
    'UTC',
  ],
  dateFormat: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
  timeFormat: ['12-hour (AM/PM)', '24-hour'],
  numberFormat: ['1,234,567.89', '1.234.567,89', '1 234 567,89'],
  landingPage: ['Dashboard', 'Pipelines', 'Data Sources', 'Analytics'],
  dashboardPreference: [
    'Pipeline Overview (default)',
    'Executive Dashboard',
    'Data Quality',
    'System Health',
  ],
};

/**
 * Design-sourced baseline for the signed-in user (node 109:12114,
 * "Marcus Chen"). `form` holds the editable fields; the remaining keys
 * are read-only context surfaced across the page. A real MOD-005 `/me`
 * endpoint would return the persisted record for the authenticated user.
 */
function buildBaseline() {
  return {
    id: 'usr_mchen',
    userId: 'usr_8f3h2p9x',
    employeeId: 'EMP-00442',
    organization: 'Acme Corp',
    initials: 'MC',
    avatarMeta: 'JPG, PNG, GIF · Max 2 MB',

    // Editable form fields (dirty-tracked)
    form: {
      firstName: 'Marcus',
      lastName: 'Chen',
      displayName: 'Marcus Chen',
      email: 'm.chen@acmecorp.com',
      phone: '+1 (415) 555-0124',
      jobTitle: 'Senior Data Engineer',
      officeLocation: 'San Francisco, CA',
      pronouns: 'He / Him',

      // Personal Preferences
      language: 'English (US)',
      timeZone: 'America/Los_Angeles (UTC-8)',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12-hour (AM/PM)',
      numberFormat: '1,234,567.89',
      landingPage: 'Dashboard',
      dashboardPreference: 'Pipeline Overview (default)',

      // Email notification toggles
      pipelineNotifications: true,
      connectorAlerts: true,
      approvalRequests: true,
      securityAlerts: true,
      weeklySummary: false,

      // In-app notification toggles
      mentions: true,
      comments: true,
      workflowUpdates: true,
      systemNotifications: false,
    },

    // Right rail — Profile Summary
    profileSummary: {
      jobTitle: 'Senior Data Engineer',
      team: 'Platform Engineering · Acme Corp',
      chips: ['Data Engineer', 'Platform Infra', 'Active'],
      department: 'Engineering',
      teamName: 'Platform Infra',
      organization: 'Acme Corp',
    },

    // Right rail — Account Status
    accountStatus: {
      status: 'Active',
      lastLogin: 'Today 09:14 AM',
      accountCreated: '2023-04-11',
      passwordAge: '87 days',
      passwordExpires: 'expires soon',
      license: 'Enterprise Pro',
    },

    // Right rail — Security Health (score /100 + checklist)
    securityHealth: {
      score: 85,
      label: 'Good',
      hint: 'Update password to reach Excellent.',
      checklist: [
        { key: 'mfa', label: 'MFA Enabled', value: 'Yes', ok: true },
        { key: 'password', label: 'Password Strength', value: 'Good', ok: true },
        { key: 'sessions', label: 'Active Sessions', value: '3 devices', ok: true },
        { key: 'recovery', label: 'Recovery Codes', value: 'Generated', ok: true },
        { key: 'failed', label: 'Failed Logins (30d)', value: '1 attempt', ok: false },
      ],
    },

    // Security section — read-only auth controls
    security: {
      mfa: { status: 'Enabled', detail: 'TOTP via authenticator app — configured Jul 12, 2025' },
      password: { status: 'Expiring', detail: 'Last changed 87 days ago', expiresInDays: 3 },
      recoveryCodes: { status: 'Available', detail: '8 codes generated · 5 remaining' },
      securityQuestions: { status: 'Not configured', detail: 'Fallback verification for account recovery' },
    },

    // Active Sessions table
    sessions: [
      { id: 's_1', device: 'Chrome 126', current: true, os: 'macOS 14.5', ip: '198.51.100.***', loginTime: 'Today 09:14 AM', status: 'Active' },
      { id: 's_2', device: 'Safari 17', current: false, os: 'iOS 17.4', ip: '198.51.100.***', loginTime: 'Jul 31 07:52 AM', status: 'Active' },
      { id: 's_3', device: 'Firefox 127', current: false, os: 'Ubuntu 22.04', ip: '203.0.113.***', loginTime: 'Jul 28 11:40 AM', status: 'Idle' },
    ],

    // Personal API Tokens table
    tokens: [
      { id: 't_1', name: 'CI Pipeline Runner', prefix: 'dfet1_', scope: 'Read-Write', lastUsed: 'Today 06:12 AM', expires: '2025-12-31', expiringSoon: false },
      { id: 't_2', name: 'Monitoring Script', prefix: 'dfet1_', scope: 'Read only', lastUsed: 'Jul 29 10:55 PM', expires: '2026-05-15', expiringSoon: false },
      { id: 't_3', name: 'Local Dev', prefix: 'dfet1_', scope: 'Read-Write', lastUsed: 'Jul 15 02:50 PM', expires: '2025-08-19', expiringSoon: true },
    ],

    // Recent Account Activity
    recentActivity: [
      { id: 'a_1', type: 'success', label: 'Successful Login', detail: 'Chrome 126 · macOS · 198.51.100.***', meta: 'Today 09:14 AM PDT', tag: 'Success' },
      { id: 'a_2', type: 'info', label: 'Profile Updated', detail: 'Display name, phone number', meta: 'Jul 30, 2025 · 03:02 PM PDT', tag: 'Info' },
      { id: 'a_3', type: 'success', label: 'Successful Login', detail: 'Safari 17 · iOS · 198.51.100.***', meta: 'Jul 31, 2025 · 07:52 AM PDT', tag: 'Success' },
      { id: 'a_4', type: 'failed', label: 'Failed Login Attempt', detail: 'Unknown device · 203.0.113.***', meta: 'Jul 09, 2025 · 11:18 PM PDT', tag: 'Failed' },
      { id: 'a_5', type: 'security', label: 'Password Changed', detail: 'Initiated by user', meta: 'May 03, 2025 · 09:30 AM PDT', tag: 'Info' },
      { id: 'a_6', type: 'security', label: 'MFA Enabled', detail: 'TOTP authenticator app', meta: 'Jul 12, 2025 · 02:15 PM PDT', tag: 'Security' },
    ],
  };
}

/**
 * Load the signed-in user's own profile. Real GET `/me` first; on any
 * failure return the design-sourced baseline flagged `mocked: true`.
 */
export async function getMyProfile() {
  try {
    const res = await apiFetch('/me');
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserProfileError('Unable to load your profile right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form || !data.userId) {
      throw new UserProfileError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(), mocked: true };
  }
}

/**
 * Save profile edits. Real PUT `/me` first; on any failure return a
 * simulated success flagged `mocked: true` so the UI can disclose that
 * nothing was really persisted.
 */
export async function saveMyProfile(payload) {
  try {
    const res = await apiFetch('/me', { method: 'PUT', body: payload });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new UserProfileError('Unable to save your changes right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new UserProfileError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { form: payload, savedAt: new Date().toISOString(), mocked: true };
  }
}
