import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  changePasswordSubmitted,
  changePasswordSucceeded,
  changePasswordFailed,
  changePasswordReset,
} from '../state/changePasswordSlice';
import { changePassword, ChangePasswordError } from '../services/settings.api';
import { PASSWORD_REQUIREMENTS } from '../../../hooks/usePasswordStrength';

/**
 * Drives the Change Password Screen's (SCR-007) submit flow: current-
 * password field, new-password validation against the same
 * requirement list SCR-004's checklist uses, confirm-match check, and
 * request submission via changePasswordApi. Mirrors
 * useResetPasswordConfirm's shape (this screen's new-password rules
 * are the same product requirement, just entered by an already-
 * authenticated user instead of via a reset-link token).
 */
export function useChangePassword() {
  const dispatch = useAppDispatch();
  const { status, error, errorField } = useAppSelector((state) => state.changePassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // App-level slice — clear on unmount so a later visit doesn't inherit
  // this visit's 'done'/'error' status, same rationale as the other
  // auth-feature hooks (useResetPasswordConfirm, useTwoFactor).
  useEffect(() => {
    return () => {
      dispatch(changePasswordReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only cleanup
  }, []);

  function validate() {
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Enter your current password.';
    const unmet = PASSWORD_REQUIREMENTS.filter((req) => !req.test(newPassword));
    if (!newPassword) errors.newPassword = 'New password is required.';
    else if (unmet.length > 0) errors.newPassword = 'Password does not meet all requirements below.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.';
    else if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  }

  async function submit() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    dispatch(changePasswordSubmitted());
    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[settings] password change "succeeded" via mock fallback — MOD-002 backend not reachable.');
      }
      dispatch(changePasswordSucceeded());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return true;
    } catch (err) {
      if (err instanceof ChangePasswordError) {
        dispatch(changePasswordFailed({ message: err.message, field: err.field }));
      } else {
        dispatch(changePasswordFailed({ message: 'Unable to change your password right now. Please try again.' }));
      }
      return false;
    }
  }

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    submitting: status === 'submitting',
    done: status === 'done',
    error,
    errorField,
    submit,
  };
}
