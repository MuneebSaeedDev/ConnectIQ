/**
 * Auth feature's network calls (login, logout, password reset, email
 * verification, two-factor). Merged from the screen-per-file api
 * modules into one domain file per agent rules §4 (`<domain>.api.js`)
 * and routed through the centralized `services/api/client.js` wrapper
 * (§9) instead of calling `fetch` directly.
 *
 * MOCK BOUNDARY: MOD-002's backend does not exist yet (docs/modules/
 * module-plan.md, MOD-002 status PLANNED). Every function here attempts
 * a real request first; only when the endpoint is unreachable (no
 * backend deployed) does it fall back to a documented mock outcome, so
 * each screen exercises real request/response handling wherever a
 * backend actually exists. Replace each catch-fallback with a hard
 * failure once MOD-002's backend is live.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class LoginError extends Error {}
export class PasswordResetError extends Error {}
export class PasswordResetConfirmError extends Error {}
export class EmailVerificationError extends Error {}
export class TwoFactorError extends Error {}

const MIN_PLAUSIBLE_TOKEN_LENGTH = 16;

export async function login({ email, password, keepSignedIn }) {
  try {
    const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password, keepSignedIn } });

    if (res.status === 401 || res.status === 400) {
      const body = await readJson(res);
      throw new LoginError(body?.message ?? 'Invalid email or password.');
    }
    if (!res.ok) {
      throw new LoginError('Unable to sign in right now. Please try again.');
    }

    const data = await readJson(res);
    if (!data) {
      // A real 2xx response with a malformed/non-JSON body is a genuine
      // backend bug — must surface as an error, not fall through to the
      // catch block below and get silently reported as a mock success.
      throw new LoginError('Received an unexpected response from the server.');
    }
    if (!data.accessToken || !data.refreshToken) {
      throw new LoginError('Received an unexpected response from the server.');
    }
    return { accessToken: data.accessToken, refreshToken: data.refreshToken, mocked: false };
  } catch (err) {
    if (err instanceof LoginError) throw err;

    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only, e.g. connection refused or DNS failure).
    // Any non-empty credential pair "succeeds" so the rest of the app
    // (routing into the authenticated shell) can be exercised; a
    // clearly-wrong sentinel still demonstrates the error path.
    if (email === 'invalid@meridian.test') {
      throw new LoginError('Invalid email or password.');
    }
    return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', mocked: true };
  }
}

export async function logout({ accessToken }) {
  try {
    const res = await apiFetch('/auth/logout', { method: 'POST', auth: accessToken });

    if (!res.ok && res.status !== 401) {
      // A real backend rejected the request for a reason other than
      // "already signed out" — surfaced as a diagnostic only, since
      // the UI always proceeds with local teardown regardless (a
      // failed server-side logout must not trap the user in the app).
      // eslint-disable-next-line no-console -- non-blocking diagnostic, mirrors useLogin.js's mock-boundary logging
      console.warn('[auth] server rejected logout request; local session was still cleared.');
    }
    return { mocked: false };
  } catch {
    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only, e.g. connection refused or DNS failure).
    return { mocked: true };
  }
}

export async function requestPasswordReset({ email }) {
  try {
    const res = await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });

    if (res.status === 400) {
      const body = await readJson(res);
      throw new PasswordResetError(body?.message ?? 'Enter a valid email address.');
    }
    if (!res.ok) {
      throw new PasswordResetError('Unable to send the reset link right now. Please try again.');
    }

    // The endpoint must respond 2xx regardless of whether the email
    // matches an account, to avoid leaking account existence — so a
    // successful response carries no body contract to validate beyond
    // status, matching the documented reset-link flow.
    return { mocked: false };
  } catch (err) {
    if (err instanceof PasswordResetError) throw err;

    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only, e.g. connection refused or DNS failure).
    return { mocked: true };
  }
}

export async function confirmPasswordReset({ token, password }) {
  try {
    const res = await apiFetch('/auth/reset-password', { method: 'POST', body: { token, password } });

    if (res.status === 400 || res.status === 401) {
      const body = await readJson(res);
      throw new PasswordResetConfirmError(
        body?.message ?? 'This reset link is invalid or has expired. Request a new one.'
      );
    }
    if (!res.ok) {
      throw new PasswordResetConfirmError('Unable to reset your password right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof PasswordResetConfirmError) throw err;

    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only, e.g. connection refused or DNS failure).
    // Any token that isn't at least plausibly opaque-token-shaped
    // demonstrates the invalid/expired-link error path without a real
    // backend. Not real token validation — replace once MOD-002's
    // backend is live.
    if (!token || token.length < MIN_PLAUSIBLE_TOKEN_LENGTH) {
      throw new PasswordResetConfirmError('This reset link is invalid or has expired. Request a new one.');
    }
    return { mocked: true };
  }
}

export async function resendVerificationEmail({ email }) {
  try {
    const res = await apiFetch('/auth/verify-email/resend', { method: 'POST', body: { email } });

    if (res.status === 429) {
      const body = await readJson(res);
      throw new EmailVerificationError(body?.message ?? 'Please wait before requesting another email.');
    }
    if (!res.ok) {
      throw new EmailVerificationError('Unable to resend the verification email right now. Please try again.');
    }

    // Must respond 2xx without leaking whether the email is registered
    // (same non-enumeration rule as requestPasswordReset) — no body
    // contract to validate beyond status.
    return { mocked: false };
  } catch (err) {
    if (err instanceof EmailVerificationError) throw err;
    return { mocked: true };
  }
}

export async function confirmEmailVerification({ token }) {
  try {
    const res = await apiFetch('/auth/verify-email/confirm', { method: 'POST', body: { token } });

    if (res.status === 400 || res.status === 410) {
      throw new EmailVerificationError('This verification link is invalid or has expired.');
    }
    if (!res.ok) {
      throw new EmailVerificationError('Unable to verify your email right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof EmailVerificationError) throw err;

    // Backend not deployed yet — documented mock fallback. Mirrors
    // confirmPasswordReset's heuristic: a token shorter than 16
    // characters is treated as invalid/expired so the error path stays
    // exercisable in mock mode; anything longer "succeeds". Not real
    // token validation — must be replaced once MOD-002's backend is live.
    if (!token || token.length < MIN_PLAUSIBLE_TOKEN_LENGTH) {
      throw new EmailVerificationError('This verification link is invalid or has expired.');
    }
    return { mocked: true };
  }
}

export async function verifyTwoFactorCode({ code, trustDevice }) {
  try {
    const res = await apiFetch('/auth/2fa/verify', { method: 'POST', body: { code, trustDevice } });

    if (res.status === 400 || res.status === 401) {
      const body = await readJson(res);
      throw new TwoFactorError(body?.message ?? 'Incorrect verification code. Please try again.');
    }
    if (res.status === 429) {
      throw new TwoFactorError('Too many attempts. Please wait before trying again.');
    }
    if (!res.ok) {
      throw new TwoFactorError('Unable to verify the code right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof TwoFactorError) throw err;

    // Backend not deployed yet — documented mock fallback (network/
    // fetch failure only). Since there is no real backend to check the
    // code against, treat any 6-digit numeric code as valid and
    // anything else as incorrect, so both the success and error paths
    // stay exercisable in mock mode. Not real code validation — must be
    // replaced once MOD-002's backend is live.
    if (!/^\d{6}$/.test(code)) {
      throw new TwoFactorError('Incorrect verification code. Please try again.');
    }
    return { mocked: true };
  }
}

export async function resendTwoFactorCode() {
  try {
    const res = await apiFetch('/auth/2fa/resend', { method: 'POST' });

    if (res.status === 429) {
      const body = await readJson(res);
      throw new TwoFactorError(body?.message ?? 'Please wait before requesting another code.');
    }
    if (!res.ok) {
      throw new TwoFactorError('Unable to resend a code right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof TwoFactorError) throw err;
    return { mocked: true };
  }
}
