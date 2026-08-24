import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginSubmitted, loginSucceeded, loginFailed, loginErrorCleared } from '../state/authSlice';
import { login, LoginError } from '../services/auth.api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Drives the Login Screen's real submit flow: client-side validation,
 * request submission via authApi, and session persistence on success.
 * Mirrors the bootstrap feature's split between UI and behavior.
 */
export function useLogin() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    return errors;
  }

  async function submit() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    dispatch(loginSubmitted());
    try {
      const result = await login({ email: email.trim(), password, keepSignedIn });
      if (result.mocked) {
        // eslint-disable-next-line no-console -- mock boundary must stay traceable, not silent
        console.info('[auth] signed in via mock fallback — MOD-002 backend not reachable.');
      }
      const storage = keepSignedIn ? window.localStorage : window.sessionStorage;
      storage.setItem('meridian.refreshToken', result.refreshToken);
      storage.setItem('meridian.accessToken', result.accessToken);
      dispatch(loginSucceeded());
      return true;
    } catch (err) {
      const message = err instanceof LoginError ? err.message : 'Unable to sign in right now. Please try again.';
      dispatch(loginFailed(message));
      return false;
    }
  }

  function clearError() {
    dispatch(loginErrorCleared());
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    keepSignedIn,
    setKeepSignedIn,
    fieldErrors,
    submitting: status === 'submitting',
    error,
    submit,
    clearError,
  };
}
