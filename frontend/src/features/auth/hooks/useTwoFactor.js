import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  verifySubmitted,
  verifySucceeded,
  verifyFailed,
  resendSubmitted,
  resendSucceeded,
  resendFailed,
  twoFactorReset,
} from '../state/twoFactorSlice';
import { verifyTwoFactorCode, resendTwoFactorCode, TwoFactorError } from '../services/auth.api';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 38; // matches the Figma sample's captured "Resend available in 38s"

/**
 * Drives the Two-Factor Authentication Screen (SCR-006): a 6-digit
 * authenticator code split across individual `OtpCell` inputs (per
 * Figma node 19:5127), a "trust this device" checkbox, and a resend
 * action with cooldown mirroring SCR-005's countdown pattern.
 *
 * The account this challenge belongs to is not re-collected here —
 * MOD-002's spec models 2FA as a step immediately after a successful
 * password login, so the session/challenge context is assumed to
 * live server-side (e.g. a short-lived challenge cookie/token set by
 * the login response). No Figma variant or module contract defines
 * how this screen would otherwise identify the in-flight login, so
 * this hook only submits the code itself — documented as an
 * extrapolation, not asserted as a confirmed API contract.
 */
export function useTwoFactor() {
  const dispatch = useAppDispatch();
  const { verifyStatus, verifyError, resendStatus, resendError } = useAppSelector((state) => state.twoFactor);
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [trustDevice, setTrustDevice] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    return () => {
      dispatch(twoFactorReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function setDigit(index, value) {
    // Keep the last digit typed, not the first: some mobile keyboards/
    // autofill can insert more than one character into a single cell
    // before `maxLength=1` clips the DOM value, and the most recently
    // typed digit is the one the user intended to land in this cell.
    const clean = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i += 1) next[i] = pasted[i] ?? next[i];
      return next;
    });
    const lastFilled = Math.min(pasted.length, CODE_LENGTH) - 1;
    inputRefs.current[lastFilled]?.focus();
  }

  const code = digits.join('');
  const codeComplete = code.length === CODE_LENGTH;

  async function submit() {
    if (!codeComplete || verifyStatus === 'submitting') return false;
    dispatch(verifySubmitted());
    try {
      const result = await verifyTwoFactorCode({ code, trustDevice });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] 2FA code "verified" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(verifySucceeded());
      return true;
    } catch (err) {
      const message = err instanceof TwoFactorError ? err.message : 'Unable to verify the code right now. Please try again.';
      dispatch(verifyFailed(message));
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return false;
    }
  }

  async function resend() {
    if (cooldown > 0 || resendStatus === 'submitting') return;
    dispatch(resendSubmitted());
    try {
      const result = await resendTwoFactorCode();
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] 2FA code "resent" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(resendSucceeded());
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof TwoFactorError ? err.message : 'Unable to resend a code right now. Please try again.';
      dispatch(resendFailed(message));
    }
  }

  return {
    digits,
    setDigit,
    handleKeyDown,
    handlePaste,
    inputRefs,
    trustDevice,
    setTrustDevice,
    codeComplete,
    submitting: verifyStatus === 'submitting',
    verifyError,
    resending: resendStatus === 'submitting',
    resendSent: resendStatus === 'sent',
    resendError,
    cooldown,
    resend,
    submit,
  };
}
