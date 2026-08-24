import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResetPasswordConfirm } from '../hooks/useResetPasswordConfirm';
import { PASSWORD_REQUIREMENTS, evaluatePasswordStrength } from '../../../hooks/usePasswordStrength';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import arrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { inputBase } from '../../../utils/formStyles';

/**
 * SCR-004 — Forget Password Screen. Node 16:4495, Figma page "Page 1"
 * (Figma frame name has a typo: "Forget Password Scren").
 *
 * Figma naming/content swap (documented per agent-rules.md §3 and
 * escalated to the user during SCR-003's build, see
 * screen-inventory.md's SCR-003 build notes): this node's actual
 * content is the token-based "Reset your password" form (new
 * password + confirm password, requirements checklist, strength
 * meter) — not a second "forgot password" email-entry form. Per the
 * user's decision at SCR-003 time, this screen keeps its inventory ID
 * (SCR-004) and route (`/forgot-password`) while rendering node
 * 16:4495's real content.
 *
 * The reset token arrives as a `?token=` query param (the email link
 * MOD-002's forgot-password flow would send). No Figma variant exists
 * for a missing/invalid token, so the missing-token guard below is an
 * extrapolation per agent-rules.md §5 (must handle real error states),
 * same precedent as SCR-001/002/003's added error states.
 */
export default function ForgetPasswordScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    submitting,
    done,
    error,
    submit,
  } = useResetPasswordConfirm();
  const doneHeadingRef = useRef(null);
  const invalidHeadingRef = useRef(null);
  const strength = evaluatePasswordStrength(password);
  const missingToken = !token;

  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (missingToken) invalidHeadingRef.current?.focus();
  }, [missingToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    await submit();
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(148, 163, 184, 0.14), transparent 55%), var(--color-surface-page)',
      }}
    >
      <p className="absolute left-token-5 top-token-6 m-0 hidden font-mono text-token-meta tracking-[0.03em] text-text-faint sm:block">
        Licensed to: Acme Corp · 500 pipeline nodes
      </p>
      <div className="absolute right-token-5 top-token-6 flex items-center gap-token-2">
        <span className="h-[5px] w-[5px] rounded-full bg-success" aria-hidden="true" />
        <span className="font-mono text-token-meta tracking-[0.07em] text-text-muted">PRODUCTION</span>
      </div>

      <main className="flex min-h-screen items-center justify-center px-token-5 py-9">
        <div className="w-[420px] max-w-full overflow-hidden rounded-sm border border-border bg-surface-card">
          <div className="h-[3px] bg-primary" />
          <div className="px-token-7 pt-token-8">
            <div className="flex items-center gap-3.5">
              <span className="h-7 w-9 shrink-0">
                <img src={meridianLogomark} alt="" className="block h-full w-full" />
              </span>
              <div>
                <p className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">ConnectIQ</p>
                <p className="mt-token-2 font-mono text-token-xs font-medium uppercase tracking-[0.05em] text-text-muted">
                  Enterprise Data Integration
                </p>
              </div>
            </div>

            <div className="mt-token-6 border-t border-border" />

            {missingToken ? (
              <div className="mt-token-7 flex flex-col gap-token-5 pb-token-8" role="alert">
                <h1
                  ref={invalidHeadingRef}
                  tabIndex={-1}
                  className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                >
                  Reset link invalid or expired
                </h1>
                <p className="m-0 text-token-base text-text-secondary">
                  This password reset link is missing or no longer valid. Request a new one to continue.
                </p>
                <button
                  type="button"
                  className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => navigate('/reset-password')}
                >
                  Request a new link
                </button>
              </div>
            ) : done ? (
              <div className="mt-token-7 flex flex-col gap-token-5 pb-token-8" role="status">
                <h1
                  ref={doneHeadingRef}
                  tabIndex={-1}
                  className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                >
                  Password reset
                </h1>
                <p className="m-0 text-token-base text-text-secondary">
                  Your password has been reset. Sign in with your new password to continue.
                </p>
                <button
                  type="button"
                  className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => navigate('/login')}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <h1 className="mt-token-7 text-token-lg font-semibold tracking-[-0.02em] text-text-primary">Reset your password</h1>
                <p className="mt-token-2 text-token-base text-text-secondary">
                  Create a strong new password for your ConnectIQ account.
                </p>

                <form className="mt-token-7 flex flex-col gap-token-5 pb-token-8" onSubmit={handleSubmit} noValidate>
                  {error && (
                    <p className="m-0 rounded-md border border-danger-border bg-danger-bg p-token-4 text-token-base text-danger-strong" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-token-2">
                    <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="new-password">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        className={`${inputBase} pr-10 ${fieldErrors.password ? 'border-danger' : ''}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby="password-requirements"
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        <img src={eyeIcon} alt="" className={`block h-4 w-4 ${showPassword ? 'opacity-100' : 'opacity-55'}`} />
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="m-0 text-token-sm text-danger">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div
                    id="password-requirements"
                    className="flex flex-col gap-token-2 rounded-md border border-border bg-surface-page p-token-4"
                  >
                    <p className="m-0 font-mono text-token-meta font-medium uppercase tracking-[0.05em] text-text-muted">
                      Requirements
                    </p>
                    {PASSWORD_REQUIREMENTS.map((req, i) => {
                      const met = strength.met[i];
                      // On a failed submit (fieldErrors.password set), the
                      // still-unmet rows are the reason the generic banner
                      // fired — call those out in danger color instead of
                      // leaving the user to compare the vague message
                      // against a plain gray/green list by eye.
                      const flagged = Boolean(fieldErrors.password) && !met;
                      return (
                        <div key={req.key} className="flex items-center gap-token-2">
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                              met ? 'border-success bg-success' : flagged ? 'border-danger' : 'border-decorative-faint'
                            }`}
                            aria-hidden="true"
                          >
                            {met && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span
                            className={`text-token-sm ${met ? 'text-text-primary' : flagged ? 'text-danger' : 'text-text-secondary'}`}
                          >
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-token-3" aria-live="polite">
                    <span className="text-token-sm text-text-muted">Strength</span>
                    <div className="flex flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="h-[3px] flex-1 rounded-full"
                          style={{ backgroundColor: i < strength.filledBars ? strength.color : 'var(--color-border)' }}
                        />
                      ))}
                    </div>
                    <span className="text-token-sm font-medium" style={{ color: password ? strength.color : 'var(--color-text-muted)' }}>
                      {strength.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-token-2">
                    <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="confirm-password">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        className={`${inputBase} pr-10 ${fieldErrors.confirmPassword ? 'border-danger' : ''}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                        aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : 'confirm-password-hint'}
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showConfirmPassword}
                      >
                        <img src={eyeIcon} alt="" className={`block h-4 w-4 ${showConfirmPassword ? 'opacity-100' : 'opacity-55'}`} />
                      </button>
                    </div>
                    {fieldErrors.confirmPassword ? (
                      <p className="m-0 text-token-sm text-danger" id="confirm-password-error">
                        {fieldErrors.confirmPassword}
                      </p>
                    ) : (
                      <p className="m-0 text-token-sm text-text-muted" id="confirm-password-hint">
                        Re-enter your new password to confirm.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>

                <div className="flex items-center justify-center pb-token-8">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-token-sm text-text-secondary-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => navigate('/login')}
                  >
                    <img src={arrowLeftIcon} alt="" className="block h-[13px] w-[13px]" />
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle bg-surface-muted px-token-7 py-2.5">
            <span className="font-mono text-token-meta tracking-[0.03em] text-text-faint">Protected by ConnectIQ Enterprise Auth</span>
            <span className="font-mono text-token-meta tracking-[0.03em] text-text-faint">TLS 1.3 · v7.2.1</span>
          </div>
        </div>
      </main>

      <p className="absolute inset-x-0 bottom-token-6 m-0 text-center font-mono text-token-meta tracking-[0.02em] text-text-faint">
        © 2025 ConnectIQ Technologies, Inc. All rights reserved.
      </p>
    </div>
  );
}
