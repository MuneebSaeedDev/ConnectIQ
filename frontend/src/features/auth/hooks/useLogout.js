import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logoutSubmitted, logoutSucceeded, logoutReset } from '../state/logoutSlice';
import { logout } from '../services/auth.api';

/**
 * Drives the Logout Confirmation Screen's (SCR-008) real confirm flow:
 * best-effort server-side logout, then unconditional local session
 * teardown (both storages, since login persists the token pair to
 * either localStorage or sessionStorage depending on "keep me signed
 * in" — see useLogin.js).
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.logout);

  async function confirm() {
    dispatch(logoutSubmitted());
    const accessToken =
      window.localStorage.getItem('meridian.accessToken') ?? window.sessionStorage.getItem('meridian.accessToken');

    try {
      await logout({ accessToken });
    } finally {
      window.localStorage.removeItem('meridian.accessToken');
      window.localStorage.removeItem('meridian.refreshToken');
      window.sessionStorage.removeItem('meridian.accessToken');
      window.sessionStorage.removeItem('meridian.refreshToken');
      dispatch(logoutSucceeded());
    }
  }

  function reset() {
    dispatch(logoutReset());
  }

  return {
    submitting: status === 'submitting',
    done: status === 'done',
    confirm,
    reset,
  };
}
