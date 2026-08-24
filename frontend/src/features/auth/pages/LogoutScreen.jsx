import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';

/**
 * SCR-008 — Logout Confirmation Screen. Node 20:5458, Figma page "Page 1".
 *
 * The Figma frame contains two sibling `App` instances (`20:5461`,
 * `20:5675`) layered as background + overlay: the background instance
 * renders the (unrelated) Change Password screen's full authenticated
 * shell bleeding through behind a dimmed backdrop, and the overlay
 * instance is the actual "Log out?" confirm dialog — documented as an
 * ambiguity, not assumed, in screen-inventory.md's Figma Notes. This
 * screen's real content is the dialog only: the background shell is
 * incidental Figma-canvas composition (another screen's frame reused
 * as a backdrop mock), not part of this screen's design intent, so it
 * is not reproduced here. Per the same precedent as SCR-007 (MOD-001's
 * shared AppShell not yet built), no attempt is made to render a real
 * authenticated background behind the dialog. The card itself uses
 * only tokens already established by sibling auth cards (`rounded-sm`,
 * `border-border`) rather than one-off radius/shadow values with no
 * token backing this session's Figma access could not re-verify (per
 * UI review finding on `not-verified` fidelity, agent-rules.md §2).
 *
 * A transient "signed out" confirmation state was added beyond the
 * single static Figma state per agent-rules.md §5's success-feedback
 * requirement — same extrapolation precedent as SCR-001 through
 * SCR-007's added states — since the dialog's own copy promises the
 * user "will be...returned to the login screen" and silently
 * redirecting without feedback would contradict that promise if the
 * network round-trip is slow. The 1200ms delay before redirect is an
 * arbitrary "long enough to read, short enough not to stall" choice,
 * not a sourced design value.
 *
 * MOCK BOUNDARY: `frontend/src/features/auth/logoutApi.js` attempts a
 * real `POST /api/auth/logout` first, falling back to a mocked
 * acknowledgement only when the endpoint is unreachable (no MOD-002
 * backend deployed yet) — mirrors the rest of the auth feature's
 * mock-fallback shape. Local session teardown (clearing both storages)
 * always happens regardless of server outcome, since a failed
 * server-side logout must not trap the user in the app.
 */
export default function LogoutScreen() {
  const navigate = useNavigate();
  const { submitting, done, confirm, reset } = useLogout();
  const headingRef = useRef(null);
  const doneHeadingRef = useRef(null);

  // logoutSlice is app-level state (like passwordReset — see SCR-003
  // build notes), so a prior visit's `done` status could survive into
  // a fresh mount (e.g. browser back button before the redirect timer
  // fired) and render the "signed out" panel without a real confirm.
  // Reset on mount to guarantee this screen always starts at the
  // confirm step, mirroring useResetPasswordRequest.js's precedent.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  // Move focus into the dialog on mount so screen-reader/keyboard
  // users land on it immediately, matching the `done` state's own
  // focus-management precedent below.
  useEffect(() => {
    if (!done) headingRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (!done) return undefined;
    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    return () => window.clearTimeout(timer);
  }, [done, navigate]);

  function handleCancel() {
    // history.state.idx > 0 means this route was reached via in-app
    // navigation and a real prior entry exists to go back to. Reaching
    // /logout directly (bookmark, typed URL, new tab) has no safe
    // history to return to, so fall back to a known destination rather
    // than risk navigate(-1) leaving the SPA entirely.
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/dashboard', { replace: true });
  }

  async function handleConfirm() {
    await confirm();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-overlay-scrim p-token-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={done ? 'logout-done-heading' : 'logout-confirm-heading'}
        className="w-full max-w-[368px] rounded-sm border border-border bg-surface-card p-token-7"
      >
        {done ? (
          <div role="status">
            <h1
              id="logout-done-heading"
              ref={doneHeadingRef}
              tabIndex={-1}
              className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
            >
              Signed out
            </h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              You have been signed out. Returning you to the login screen…
            </p>
          </div>
        ) : (
          <>
            <h1
              id="logout-confirm-heading"
              ref={headingRef}
              tabIndex={-1}
              className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
            >
              Log out?
            </h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              You will be signed out of your account and returned to the login screen.
            </p>
            <div className="mt-token-6 flex items-center justify-end gap-token-3">
              <button
                type="button"
                className="h-[34px] rounded-md border border-border bg-surface-card px-token-4 text-token-base font-medium text-text-secondary-strong hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-[34px] rounded-md bg-danger px-token-5 text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Logging out…' : 'Log Out'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
