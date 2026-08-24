import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { confirmSubmitted, confirmSucceeded, confirmFailed, confirmReset } from '../state/passwordResetConfirmSlice';
import { confirmPasswordReset, PasswordResetConfirmError } from '../services/auth.api';
import { PASSWORD_REQUIREMENTS } from '../../../hooks/usePasswordStrength';

/**
 * Drives the Forget Password Screen's (SCR-004) token-based
 * new-password submit flow: reads the reset token from the URL,
 * client-side validation against the same requirement list the
 * checklist renders, request submission via passwordResetConfirmApi,
 * and the done-confirmation state. Mirrors useResetPasswordRequest's
 * split between UI and behavior.
 */
export function useResetPasswordConfirm() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { status, error } = useAppSelector((state) => state.passwordResetConfirm);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // App-level slice — clear on unmount so a later visit doesn't inherit
  // this visit's 'done'/'error' status. Same rationale as
  // useResetPasswordRequest's cleanup.
  useEffect(() => {
    return () => {
      dispatch(confirmReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  function validate() {
    const errors = {};
    const unmet = PASSWORD_REQUIREMENTS.filter((req) => !req.test(password));
    if (!password) errors.password = 'New password is required.';
    else if (unmet.length > 0) errors.password = 'Password does not meet all requirements below.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  }

  async function submit() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    dispatch(confirmSubmitted());
    try {
      const result = await confirmPasswordReset({ token, password });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] password reset "confirmed" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(confirmSucceeded());
      return true;
    } catch (err) {
      const message =
        err instanceof PasswordResetConfirmError ? err.message : 'Unable to reset your password right now. Please try again.';
      dispatch(confirmFailed(message));
      return false;
    }
  }

  return {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    submitting: status === 'submitting',
    done: status === 'done',
    error,
    submit,
  };
}
