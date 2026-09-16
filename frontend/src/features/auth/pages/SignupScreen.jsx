import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import { inputBase } from '../../../utils/formStyles';

export default function SignupScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    return errors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    // Simulate signup completion & pass credentials/redirect to login
    setTimeout(() => {
      setSubmitting(false);
      navigate('/login', {
        replace: true,
        state: { prefillEmail: email.trim() }
      });
    }, 600);
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

            <h1 className="mt-token-7 text-token-lg font-semibold tracking-[-0.02em] text-text-primary">Create an account</h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              Sign up for your ConnectIQ organization account.
            </p>

            <form className="mt-token-7 flex flex-col gap-token-5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-token-2">
                <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className={`${inputBase} ${fieldErrors.fullName ? 'border-danger' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  disabled={submitting}
                />
                {fieldErrors.fullName && (
                  <p className="m-0 text-token-sm text-danger">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="flex flex-col gap-token-2">
                <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane.doe@company.com"
                  className={`${inputBase} ${fieldErrors.email ? 'border-danger' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  disabled={submitting}
                />
                {fieldErrors.email && (
                  <p className="m-0 text-token-sm text-danger">{fieldErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-token-2">
                <label className="text-token-sm font-medium tracking-[-0.01em] text-text-primary" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputBase} pr-10 ${fieldErrors.password ? 'border-danger' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
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

              <button
                type="submit"
                className="mt-2 h-9 w-full rounded-md bg-primary text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating account…' : 'Create Account'}
              </button>

              <div className="text-center">
                <p className="text-token-sm text-text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
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
