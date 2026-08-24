import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  resendSubmitted,
  resendSucceeded,
  resendFailed,
  confirmSubmitted,
  confirmSucceeded,
  confirmFailed,
  emailVerificationReset,
} from '../state/emailVerificationSlice';
import { resendVerificationEmail, confirmEmailVerification, EmailVerificationError } from '../services/auth.api';

const RESEND_COOLDOWN_SECONDS = 45;

/**
 * Drives the Email Verification Screen's (SCR-005) two states:
 *
 * - Pending: the account's email is unverified and the verification
 *   link was just (re)sent — this is the default state, reached after
 *   an admin-invited user's first login or from a "verify later"
 *   gate. The masked email and a resend action (with cooldown) render
 *   here. No `?token=` is present.
 * - Confirming: the user followed the emailed link back with a
 *   `?token=` query param, which this hook exchanges for a verified
 *   account via confirmEmailVerification. Mirrors SCR-004's
 *   useResetPasswordConfirm token-handling shape.
 *
 * The masked email is read from a `?email=` query param the inviting
 * flow is expected to pass (e.g. `/verify-email?email=user%40company.com`);
 * no Figma variant or module spec defines this contract explicitly, so
 * it's an extrapolation consistent with SCR-004's `?token=` precedent.
 */
export function useEmailVerification() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') ?? '';
  const { resendStatus, resendError, confirmStatus, confirmError } = useAppSelector((state) => state.emailVerification);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    return () => {
      dispatch(emailVerificationReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  // Auto-confirm as soon as a token is present — the user arrived by
  // clicking the emailed link, there's no form to submit.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      dispatch(confirmSubmitted());
      try {
        const result = await confirmEmailVerification({ token });
        if (cancelled) return;
        if (result.mocked) {
          // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
          console.info('[auth] email "verified" via mock fallback — MOD-002 backend not reachable.');
        }
        dispatch(confirmSucceeded());
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof EmailVerificationError ? err.message : 'Unable to verify your email right now. Please try again.';
        dispatch(confirmFailed(message));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token value
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function resend() {
    if (cooldown > 0 || resendStatus === 'submitting') return;
    dispatch(resendSubmitted());
    try {
      const result = await resendVerificationEmail({ email });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] verification email "resent" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(resendSucceeded());
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof EmailVerificationError ? err.message : 'Unable to resend the verification email right now. Please try again.';
      dispatch(resendFailed(message));
    }
  }

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  return {
    hasToken: Boolean(token),
    email,
    maskedEmail,
    resending: resendStatus === 'submitting',
    resendSent: resendStatus === 'sent',
    resendError,
    cooldown,
    resend,
    confirming: confirmStatus === 'submitting',
    verified: confirmStatus === 'verified',
    confirmError,
  };
}

/**
 * `user@company.com` -> `u••••@company.com`. Approximates the masking
 * shown in the Figma design (`u•••••@company.com` on the one captured
 * sample address) with a fixed minimum dot count rather than the
 * exact local-part length, since no rule for the mask's dot-count
 * behavior across different email lengths is defined in Figma or the
 * module spec.
 */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'your email';
  const visible = local.slice(0, 1);
  return `${visible}${'•'.repeat(Math.max(local.length - 1, 4))}@${domain}`;
}
