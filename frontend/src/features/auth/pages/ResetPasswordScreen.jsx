import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResetPasswordRequest } from '../hooks/useResetPasswordRequest';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import arrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { inputBase } from '../../../utils/formStyles';

/**
 * SCR-003 — Reset Password Screen. Node 14:4162, Figma page "Page 1".
 *
 * Figma naming conflict (documented per agent-rules.md §3, not silently
 * resolved): the Figma frame at this node is titled "Reset Password
 * Screen" but its actual content is the email-entry "Forgot password?"
 * request form; the token-based new-password form lives at node
 * 16:4495, which the Figma source instead titles "Forget Password
 * Scren". This build follows docs/figma/screen-inventory.md's SCR-003
 * mapping literally (per explicit product decision) — SCR-003 renders
 * node 14:4162's content at the `/reset-password` route. See
 * screen-inventory.md's Figma Notes for the full conflict record.
 */
export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { email, setEmail, fieldErrors, submitting, sent, error, submit } = useResetPasswordRequest();
  const successHeadingRef = useRef(null);

  // Move focus to the confirmation heading when the form is replaced
  // by the success state, so keyboard/AT users get a clear signal the
  // view changed (the submit button they were focused on just left
  // the DOM).
  useEffect(() => {
    if (sent) successHeadingRef.current?.focus();
  }, [sent]);

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

            {sent ? (
              <div className="mt-token-7 flex flex-col gap-token-5" role="status">
                <h1
                  ref={successHeadingRef}
                  tabIndex={-1}
                  className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
                >
                  Check your email
                </h1>
                <p className="m-0 text-token-base text-text-secondary">
                  If an account exists for <span className="font-medium text-text-primary">{email}</span>, we&rsquo;ve sent
                  instructions to reset your password.
                </p>
              </div>
            ) : (
              <>
                <h1 className="mt-token-7 text-token-lg font-semibold tracking-[-0.02em] text-text-primary">Forgot password?</h1>
                <p className="mt-token-2 text-token-base text-text-secondary">
                  Enter the email address associated with your account and we&rsquo;ll send you instructions to reset your
                  password.
                </p>

                <form className="mt-token-7 flex flex-col gap-token-5" onSubmit={handleSubmit} noValidate>
                  {error && (
                    <p className="m-0 rounded-md border border-danger-border bg-danger-bg p-token-4 text-token-base text-danger-strong" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-token-2">
                    <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="reset-email">
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      className={`${inputBase} ${fieldErrors.email ? 'border-danger' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'reset-email-error' : 'reset-email-hint'}
                      disabled={submitting}
                    />
                    {fieldErrors.email ? (
                      <p className="m-0 text-token-sm text-danger" id="reset-email-error">
                        {fieldErrors.email}
                      </p>
                    ) : (
                      <p className="m-0 text-token-sm text-text-muted" id="reset-email-hint">
                        Use the email address registered with your ConnectIQ account.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-token-6 flex items-center justify-center pb-token-8">
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
