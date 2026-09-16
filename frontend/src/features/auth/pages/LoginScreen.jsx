import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import buildingIcon from '../../../assets/icons/building.svg';
import { inputBase } from '../../../utils/formStyles';

/** SCR-002 — Login Screen. Node 14:4055, Figma page "Page 1". */
export default function LoginScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    email,
    setEmail,
    password,
    setPassword,
    keepSignedIn,
    setKeepSignedIn,
    fieldErrors,
    submitting,
    error,
    submit,
  } = useLogin();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefillEmail && !email) {
      setEmail(location.state.prefillEmail);
    }
  }, [location.state, email, setEmail]);

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await submit();
    if (ok) navigate('/dashboard', { replace: true });
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

            <h1 className="mt-token-7 text-token-lg font-semibold tracking-[-0.02em] text-text-primary">Welcome back</h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              Sign in to your ConnectIQ account to continue.
            </p>

            <form className="mt-token-7 flex flex-col gap-token-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <p className="m-0 rounded-md border border-danger-border bg-danger-bg p-token-4 text-token-base text-danger-strong" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-token-2">
                <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`${inputBase} ${fieldErrors.email ? 'border-danger' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                  disabled={submitting}
                />
                {fieldErrors.email && (
                  <p className="m-0 text-token-sm text-danger" id="login-email-error">
                    {fieldErrors.email}
                  </p>
                )}
                {/* No persistent hint here (unlike ResetPasswordScreen's email field):
                    LoginScreen's Figma design has no such hint text for this field,
                    and inventing one isn't warranted for an already-DONE screen. */}
              </div>

              <div className="flex flex-col gap-token-2">
                <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`${inputBase} pr-10 ${fieldErrors.password ? 'border-danger' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {/* Password currently visible: darken the icon so the
                        toggle's state is perceivable to sighted users
                        too, not only via aria-pressed. */}
                    <img src={eyeIcon} alt="" className={`block h-4 w-4 ${showPassword ? 'opacity-100' : 'opacity-55'}`} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="m-0 text-token-sm text-danger" id="login-password-error">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-token-base text-text-secondary-strong cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-[15px] w-[15px] rounded-sm accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    disabled={submitting}
                  />
                  Keep me signed in
                </label>
                <button
                  type="button"
                  className="text-token-base text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-token-6 flex items-center gap-token-4">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-token-meta tracking-[0.04em] text-text-muted">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              className="mt-token-6 flex h-9 w-full items-center justify-center gap-token-3 rounded-md border border-border bg-surface-card text-token-base font-medium text-text-tertiary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled
              title="SSO is not yet available — MOD-002 has not implemented an SSO provider integration."
            >
              <img src={buildingIcon} alt="" className="block h-3.5 w-3.5" />
              Continue with SSO
            </button>
          </div>

          <div className="mt-token-8 flex items-center justify-between border-t border-border-subtle bg-surface-muted px-token-7 py-2.5">
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
