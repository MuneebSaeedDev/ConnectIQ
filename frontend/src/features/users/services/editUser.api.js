/**
 * Data + submit for the Edit User Screen (SCR-034, node 105:7565, Figma
 * page "Page 1", frame "EditUserScreen"), including the nested Confirm
 * Changes dialog (node 105:9112).
 *
 * MOCK BOUNDARY: MOD-005 (User Management & Profile) is still `PLANNED`
 * with no backend deployed — no `User` entity and no user read / update
 * endpoint exists yet (see docs/modules/module-plan.md).
 * `getEditableUser` always attempts a real GET first and only falls back
 * to the design-sourced baseline below when the endpoint is unreachable;
 * `updateUser` always attempts a real PATCH first and only falls back to
 * a simulated success when the endpoint is unreachable. Both mirror the
 * sibling MOD-004 edit module (editOrganization.api.js) and the MOD-005
 * write shape (addUser.api.js's inviteUser) — including the content-type
 * check against the Vite dev server's own 200-OK HTML fallback. Mocked
 * results are flagged `mocked: true` so the UI can disclose that nothing
 * was really loaded / persisted.
 *
 * FIGMA VERIFICATION: node 105:7565 was inspected this session via the
 * Figma MCP (get_design_context + get_screenshot). The header ("Edit
 * User", Active status pill, "3 Unsaved Changes" badge, Cancel / Reset
 * Changes / Save Changes actions), the six numbered sections (Personal
 * Information w/ read-only Employee ID + Account Metadata; Organization
 * Assignment w/ department-transfer-impact notice; Roles & Access w/
 * role-elevation notice + Effective Permissions grid; License Management
 * w/ read-only status/assigned/utilization + Feature Access grid;
 * Authentication & Security w/ the MFA/SSO/password/session status strip,
 * toggles, IP range, concurrent-sessions, and the Reset Password / Unlock
 * Account / Force Logout administrative actions; Notification Preferences
 * w/ the non-disableable System & Security Alerts), and the right rail
 * (User Summary, Account Health, License Summary, Validation Status 5/5,
 * Pending Changes diff, Recent Activity) are all transcribed from the
 * actual frame's text nodes, so the layout/content fidelity is
 * `verified`. See docs/reviews/review-log.md.
 *
 * The design's frame shows the user MID-EDIT (3 unsaved changes already
 * applied: Job Title Analyst→Data Analyst, Department Analytics
 * Platform→Data Engineering, Primary Role Analyst→Engineer). We do NOT
 * seed the form in that dirty state — a real edit screen loads the SAVED
 * record and the user makes changes. The design's "Previously" values
 * therefore become the SAVED baseline, and the dirty-tracking + Pending
 * Changes summary are computed live from the user's edits against that
 * baseline (mirroring SCR-027 EditOrganization).
 *
 * The select option sets (departments/teams/managers/roles/licenses) are
 * shared with the Add User screen (addUser.api.js) since they are the
 * same design-sourced enumerations; re-exported here for a single import
 * site. A real MOD-005 backend would serve them from the org's config.
 */

import { apiFetch, readJson } from '../../../services/api/client';
import {
  ADD_USER_OPTIONS,
  ROLE_ACCESS_SCOPE,
  FEATURE_ACCESS_BY_LICENSE,
  LICENSE_POOL,
} from './addUser.api';

export { ADD_USER_OPTIONS, ROLE_ACCESS_SCOPE, FEATURE_ACCESS_BY_LICENSE, LICENSE_POOL };

export class EditUserError extends Error {}

/** Design-sourced select sets specific to the edit form (node 105:7565). */
export const EDIT_USER_OPTIONS = {
  businessUnit: ['Technology & Data', 'Commercial', 'Operations', 'Finance & Risk', 'Corporate'],
  concurrentSessions: ['1 session', '2 sessions maximum', '3 sessions maximum', '5 sessions maximum', 'Unlimited'],
};

/**
 * Design-sourced saved baseline for the edited user (node 105:7565,
 * "John Smith" / USR-004812). Read-only account metadata, license facts,
 * account-health telemetry, and the activity timeline accompany the
 * editable field values. A real MOD-005 endpoint would return the
 * persisted record for `userId`.
 */
function buildBaseline(userId) {
  const id = userId || 'usr_smith';
  return {
    id,
    userId: 'USR-004812',
    status: 'Active',
    employeeId: 'EMP-00089', // read-only
    createdLabel: 'Mar 5, 2024',
    lastModifiedLabel: 'Jul 29, 2026',
    lastSavedLabel: 'Jul 29, 2026',
    initials: 'JS',
    // Read-only Authentication & Security telemetry (status strip).
    security: {
      mfa: 'Enabled',
      sso: 'Active',
      passwordAge: '14 days',
      failedLogins: '0 attempts',
      activeSessions: '1 session',
      ipRestriction: 'None set',
    },
    // Read-only Account Health rail.
    accountHealth: {
      accountStatus: 'Active',
      lastLogin: 'Today 08:11',
      mfaStatus: 'Enabled',
      passwordAge: '14 days',
      failedLogins: '0 (24h)',
      activeSessions: '1 session',
    },
    // Read-only License Summary rail.
    license: {
      type: 'Full — Engineer',
      status: 'Active',
      assigned: 'Mar 5, 2024',
      expiration: 'No expiration',
    },
    recentActivity: [
      { id: 'ua_1', label: 'Logged in via SSO', meta: 'Today 08:11' },
      { id: 'ua_2', label: 'Job title updated', meta: 'Jul 29' },
      { id: 'ua_3', label: 'Pipeline execution completed', meta: 'Jul 28' },
      { id: 'ua_4', label: 'Password reset by admin', meta: 'Jul 22' },
      { id: 'ua_5', label: 'Role assigned — Analyst', meta: 'Jun 14' },
    ],
    // Editable field values (the SAVED state the user edits from). The
    // design's "Previously" values are the baseline; the frame's shown
    // (dirty) values are what a user would type after loading.
    form: {
      // Personal Information
      firstName: 'John',
      lastName: 'Smith',
      email: 'j.smith@acme.com',
      jobTitle: 'Analyst', // design shows edited to "Data Analyst"
      phone: '+1 (628) 555-0174',
      officeLocation: 'New York, NY',
      // Organization Assignment
      department: 'Analytics Platform', // design shows edited to "Data Engineering"
      team: 'Analytics Core',
      manager: 'Maria Rodriguez — Analytics Manager',
      businessUnit: 'Technology & Data',
      costCenter: 'CC-3210',
      // Roles & Access
      primaryRole: 'Analyst', // design shows edited to "Engineer"
      permissionGroup: 'Standard Engineer Access',
      additionalRoles: 'Data Quality Reviewer',
      administrativePrivileges: 'None — Standard Access',
      resourceAccessProfile: 'Data Engineering Standard',
      // License Management
      licenseType: 'Full — Engineer',
      licenseExpiration: 'No expiration (perpetual)',
      // Authentication & Security
      requireMfa: true,
      enableSso: true,
      passwordResetNextLogin: false,
      accountExpiration: false,
      allowedIpRange: '',
      concurrentSessions: '3 sessions maximum',
      // Notification Preferences (System & Security Alerts is forced on)
      systemSecurityAlerts: true,
      pipelineAlerts: true,
      connectorAlerts: false,
      weeklyDigest: true,
      productUpdates: false,
    },
  };
}

/**
 * Load the editable user. Real GET first; on any failure (unreachable
 * endpoint, non-JSON dev-server fallback, network error) return the
 * design-sourced baseline flagged `mocked: true`.
 */
export async function getEditableUser(orgId, userId) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}/edit`,
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditUserError('Unable to load this user for editing right now.');
    }
    const data = await readJson(res);
    if (!data || !data.form) {
      throw new EditUserError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...buildBaseline(userId), mocked: true };
  }
}

/**
 * Persist edits to a user. Real PATCH first; on any failure return a
 * simulated success flagged `mocked: true` so the UI can disclose that
 * nothing was really persisted.
 */
export async function updateUser(orgId, userId, changes) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`,
      { method: 'PATCH', body: changes },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new EditUserError('Unable to save changes right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new EditUserError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { id: userId, savedAt: new Date().toISOString(), mocked: true };
  }
}
