import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  resetRequestSubmitted,
  resetRequestSucceeded,
  resetRequestFailed,
  resetRequestReset,
} from '../state/passwordResetSlice';
import { requestPasswordReset, PasswordResetError } from '../services/auth.api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Drives the Reset Password Screen's (SCR-003) submit flow: client-side
 * validation, request submission via passwordResetApi, and the
 * sent-confirmation state. Mirrors useLogin's split between UI and
 * behavior.
 */
export function useResetPasswordRequest() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.passwordReset);
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // This slice is app-level (not screen-scoped), so a prior visit's
  // 'sent'/'error' status would otherwise survive into a fresh mount
  // of this screen with local (email/fieldErrors) state already
  // reset — clear it on unmount so the next visit starts from 'idle'.
  useEffect(() => {
    return () => {
      dispatch(resetRequestReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
    return errors;
  }

  async function submit() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    dispatch(resetRequestSubmitted());
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] reset link "sent" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(resetRequestSucceeded());
      return true;
    } catch (err) {
      const message = err instanceof PasswordResetError ? err.message : 'Unable to send the reset link right now. Please try again.';
      dispatch(resetRequestFailed(message));
      return false;
    }
  }

  return {
    email,
    setEmail,
    fieldErrors,
    submitting: status === 'submitting',
    sent: status === 'sent',
    error,
    submit,
  };
}
