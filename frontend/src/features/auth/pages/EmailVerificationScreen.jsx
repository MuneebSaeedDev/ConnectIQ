import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmailVerification } from '../hooks/useEmailVerification';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import mailIcon from '../../../assets/icons/mail.svg';
import resendIcon from '../../../assets/icons/resend.svg';
import arrowLeftIcon from '../../../assets/icons/arrow-left.svg';

/**
 * SCR-005 — Email_Verification Screen. Node 18:5023, Figma page "Page 1".
 *
 * Figma models one "pending" happy-path state (masked email, resend
 * button, countdown). Two states beyond that are extrapolated per
 * agent-rules.md §5 (real success/error feedback), same precedent as
 * SCR-001 through SCR-004's added states:
 * - `verified`: reached when the emailed link's `?token=` confirms
 *   successfully — no Figma variant exists for this, styled to match
 *   SCR-004's `done` success panel.
 * - error (invalid/expired token, or resend failure): styled to match
 *   the danger banner used on every other auth screen in this feature.
 *
 * MOCK BOUNDARY: `frontend/src/features/auth/emailVerificationApi.js`
 * attempts real `/api/auth/verify-email/resend` and
 * `/api/auth/verify-email/confirm` requests first, falling back to a
 * mocked outcome only when the endpoint is unreachable (no MOD-002
 * backend deployed yet) — mirrors the rest of the auth feature's
 * mock-fallback shape.
 */
export default function EmailVerificationScreen() {
  const navigate = useNavigate();
  const {
    hasToken,
    maskedEmail,
    resending,
    resendSent,
    resendError,
    cooldown,
    resend,
    confirming,
    verified,
    confirmError,
  } = useEmailVerification();
  const confirmingHeadingRef = useRef(null);
  const verifiedHeadingRef = useRef(null);
  const errorHeadingRef = useRef(null);

  useEffect(() => {
    if (confirming) confirmingHeadingRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (verified) verifiedHeadingRef.current?.focus();
  }, [verified]);

  useEffect(() => {
    if (confirmError) errorHeadingRef.current?.focus();
  }, [confirmError]);

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
        <div className="w-[400px] max-w-full overflow-hidden rounded-sm border border-border bg-surface-card">
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

            {hasToken ? (
              confirming ? (
                <div className="mt-token-7 flex flex-col items-center gap-token-3 pb-token-8 text-center" role="status">
                  <h1
                    ref={confirmingHeadingRef}
                    tabIndex={-1}
                    className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                  >
                    Verifying your email…
                  </h1>
                </div>
              ) : verified ? (
                <div className="mt-token-7 flex flex-col gap-token-5 pb-token-8" role="status">
                  <h1
                    ref={verifiedHeadingRef}
                    tabIndex={-1}
                    className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                  >
                    Email verified
                  </h1>
                  <p className="m-0 text-token-base text-text-secondary">
                    Your email address has been verified. You can now sign in to your account.
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
                <div className="mt-token-7 flex flex-col gap-token-5 pb-token-8" role="alert">
                  <h1
                    ref={errorHeadingRef}
                    tabIndex={-1}
                    className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                  >
                    Verification link invalid or expired
                  </h1>
                  <p className="m-0 text-token-base text-text-secondary">{confirmError}</p>
                  <button
                    type="button"
                    className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => navigate('/login')}
                  >
                    Back to Sign In
                  </button>
                </div>
              )
            ) : (
              <div className="mt-token-7 flex flex-col gap-token-5 pb-token-8">
                <div className="flex gap-token-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-page">
                    <img src={mailIcon} alt="" className="block h-4 w-4" />
                  </span>
                  <div>
                    <h1 className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary">Verify your email</h1>
                    <p className="mt-token-2 text-token-base text-text-secondary">
                      We&rsquo;ve sent a verification link to your email address.
                    </p>
                  </div>
                </div>

                {resendError && (
                  <p className="m-0 rounded-md border border-danger-border bg-danger-bg p-token-4 text-token-base text-danger-strong" role="alert">
                    {resendError}
                  </p>
                )}

                <div className="flex items-center gap-token-2 rounded-md border border-border bg-surface-page px-token-3 py-token-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary opacity-70" aria-hidden="true" />
                  <span className="font-mono text-token-sm text-text-primary tracking-[0.01em]">{maskedEmail}</span>
                </div>

                <p className="m-0 text-token-sm text-text-secondary">
                  Check your inbox and click the link to verify your email address and access your account.
                </p>
                <p className="m-0 text-token-sm text-text-faint">
                  Check your spam or junk folder if you don&rsquo;t see it within a few minutes.
                </p>

                <div className="border-t border-border-subtle" />

                <div>
                  <p className="m-0 text-token-sm font-medium text-text-secondary-strong">Didn&rsquo;t receive the email?</p>

                  <button
                    type="button"
                    className="mt-token-3 flex h-9 w-full items-center justify-center gap-token-2 rounded-md border border-primary bg-surface-card text-token-base font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={resend}
                    disabled={resending || cooldown > 0}
                  >
                    <img src={resendIcon} alt="" className="block h-3.5 w-3.5" />
                    {resending ? 'Sending…' : 'Resend Verification Email'}
                  </button>

                  <p className="mt-token-2 m-0 text-center font-mono text-token-meta tracking-[0.01em] text-text-faint" aria-live="polite">
                    {cooldown > 0
                      ? `Resend available in ${cooldown}s`
                      : resendSent
                        ? 'Verification email resent.'
                        : ''}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-token-3 pt-token-2">
                  <button
                    type="button"
                    className="text-token-sm text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => navigate('/login')}
                  >
                    Change email address
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-token-sm text-text-secondary-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => navigate('/login')}
                  >
                    <img src={arrowLeftIcon} alt="" className="block h-[13px] w-[13px]" />
                    Back to Sign In
                  </button>
                </div>
              </div>
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
