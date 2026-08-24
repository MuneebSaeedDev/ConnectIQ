/**
 * Change-password submission for the Change Password Screen (SCR-007).
 *
 * MOCK BOUNDARY: MOD-002's backend does not exist yet (docs/modules/
 * module-plan.md, MOD-002 status PLANNED). `changePassword` always
 * attempts a real request against the platform auth endpoint first;
 * only when that endpoint is unreachable (no backend deployed) does it
 * fall back to a documented mock outcome. Mirrors the auth feature's
 * mock-fallback shape (features/auth/services/auth.api.js).
 *
 * KNOWN LIMITATION: without a real backend there is no stored password
 * to check the "current password" against, so the mock fallback cannot
 * genuinely verify it — it treats the literal value `wrong-password` as
 * an incorrect-current-password error (to exercise the Figma-specified
 * error state) and anything else as a mocked success. Not real
 * credential verification — replace once MOD-002's backend is live.
 */

import { apiFetch, readJson } from '../../../services/api/client';

const MOCK_INCORRECT_CURRENT_PASSWORD = 'wrong-password';

export class ChangePasswordError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field ?? null;
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const res = await apiFetch('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });

    if (res.status === 401 || res.status === 400) {
      const body = await readJson(res);
      throw new ChangePasswordError(
        body?.message ?? 'Current password is incorrect.',
        body?.field ?? 'currentPassword'
      );
    }
    if (!res.ok) {
      throw new ChangePasswordError('Unable to change your password right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof ChangePasswordError) throw err;

    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only, e.g. connection refused or DNS failure).
    if (currentPassword === MOCK_INCORRECT_CURRENT_PASSWORD) {
      throw new ChangePasswordError('Current password is incorrect.', 'currentPassword');
    }
    return { mocked: true };
  }
}
