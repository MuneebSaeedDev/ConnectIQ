import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBootstrap } from '../hooks/useBootstrap';
import meridianLogomark from '../../../assets/brand/meridian-logomark.svg';

// Bootstrap checks resolve near-instantly with no real backend
// deployed (mock-fallback path), so without a floor the splash
// flashes and redirects before it visibly renders.
const MIN_DISPLAY_MS = 1200;

/** SCR-001 — Splash Screen. Node 13:3982, Figma page "Page 1". */
export default function SplashScreen() {
  const navigate = useNavigate();
  const { steps, error, complete, progress, activeStep, config, hasSession } = useBootstrap();
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!complete) return;
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const timer = setTimeout(() => {
      // MOD-002 (Auth) owns /login and the authenticated dashboard
      // shell owns /dashboard; route based on whether a session was
      // restored.
      navigate(hasSession ? '/dashboard' : '/login', { replace: true });
    }, remaining);
    return () => clearTimeout(timer);
  }, [complete, hasSession, navigate]);

  const hasError = Boolean(error);

  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center p-token-6"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(148, 163, 184, 0.12), transparent 60%), var(--color-surface-page)',
      }}
    >
      <p className="absolute left-token-6 top-token-6 font-mono text-token-meta tracking-[0.3px] text-text-faint">
        Licensed to: Acme Corp · 500 pipeline nodes
      </p>
      <div className="absolute right-token-6 top-token-6 flex items-center gap-token-2">
        <span className="h-[5px] w-[5px] rounded-full bg-success" aria-hidden="true" />
        <span className="font-mono text-token-meta tracking-[0.7px] text-text-muted">
          {(config?.environment ?? 'production').toUpperCase()}
        </span>
      </div>

      <div className="w-[400px] max-w-full overflow-hidden rounded-sm border-[0.667px] border-border bg-surface-card">
        <div className="h-[3px] bg-primary" />
        <div className="px-9 pb-7 pt-8">
          <div className="flex items-center gap-token-5">
            <span className="h-8 w-10 shrink-0">
              {/* Decorative: brand name is already rendered as adjacent
                  visible text, so the mark doesn't need its own alt text. */}
              <img src={meridianLogomark} alt="" className="block h-full w-full" />
            </span>
            <div>
              <p className="m-0 text-token-xl font-semibold tracking-[-0.4px] text-text-primary">ConnectIQ</p>
              <p className="mt-[5px] font-mono text-token-meta font-medium uppercase tracking-[0.765px] text-text-muted">
                Enterprise Data Integration
              </p>
            </div>
          </div>

          <p className="mt-5 text-token-sm leading-[18.6px] tracking-[-0.12px] text-text-secondary">
            The unified control center for your organization&rsquo;s data ecosystem.
          </p>

          <div className="mt-7 h-px bg-border" />

          <div
            className="mt-7"
            role="status"
            aria-live="polite"
            aria-busy={!complete && !hasError}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-mono text-token-meta font-medium uppercase tracking-[0.63px] ${
                  hasError ? 'text-danger' : 'text-text-muted'
                }`}
              >
                {hasError ? '⚠ Initialization Failed' : 'System Initialization'}
              </span>
              <span className="font-mono text-token-meta tracking-[0.36px] text-text-faint">
                {config?.version ?? 'v7.2.1'}
              </span>
            </div>

            <div className="mt-[10px] h-[2px] overflow-hidden rounded-[1px] bg-border-subtle">
              <div
                className={`h-full rounded-[1px] transition-[width] duration-300 ease-in-out ${
                  hasError ? 'bg-danger' : 'bg-primary'
                }`}
                style={{ width: `${hasError ? 100 : progress}%` }}
              />
            </div>

            <div className="mt-[10px] flex min-h-[15.75px] items-center gap-token-3">
              <span
                className={`h-1 w-1 shrink-0 rounded-full ${
                  hasError ? 'bg-danger opacity-100' : 'bg-primary opacity-75'
                }`}
                aria-hidden="true"
              />
              <span className={`font-mono text-token-meta tracking-[0.105px] ${hasError ? 'text-danger-strong' : 'text-text-secondary'}`}>
                {hasError ? error : activeStep?.label ?? 'Initializing platform'}
              </span>
            </div>

            {hasError && (
              <button
                type="button"
                className="mt-token-4 cursor-pointer rounded-sm border border-danger bg-surface-card px-3.5 py-1.5 font-sans text-token-sm font-medium text-danger-strong hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            )}
          </div>

          <div className="mt-token-6 flex items-center justify-between border-t-[0.667px] border-border-faint pt-[16.667px]">
            <span className="font-mono text-token-meta tracking-[0.27px] text-text-faint">
              build {config?.buildId ?? '20250731.1'}
            </span>
            <span className="font-mono text-token-meta tracking-[0.27px] text-text-faint">
              cluster: {config?.clusterId ?? 'prod-01'} · {config?.region ?? 'us-east-1'}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-token-6 font-mono text-token-meta tracking-[0.18px] text-text-faint">
        © 2025 ConnectIQ Technologies, Inc. All rights reserved.
      </p>

      {/* Visually hidden step list — gives assistive tech the full
          sequence, not just the single active line shown visually. */}
      <ul className="absolute h-px w-px overflow-hidden [clip:rect(0,0,0,0)]">
        {steps.map((step) => (
          <li key={step.id}>
            {step.label}: {step.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
