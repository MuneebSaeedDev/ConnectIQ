import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getTwoFactorStatus, toggleTwoFactor } from '../services/settings.api';

export default function TwoFactorSettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getTwoFactorStatus();
      setEnabled(!!res.data?.enabled);
      setLoading(false);
    }
    load();
  }, []);

  async function handleToggle() {
    setBusy(true);
    const target = !enabled;
    const res = await toggleTwoFactor(target);
    setEnabled(!!res.data?.enabled);
    setBusy(false);
    setMessage(target ? 'Two-factor authentication has been enabled.' : 'Two-factor authentication has been disabled.');
  }

  return (
    <AccountSettingsLayout activeItem="two-factor" breadcrumbTail="Two-factor auth">
      <div className="mb-token-7 max-w-[650px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">
          Two-Factor Authentication
        </h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Add an extra layer of security to your account with time-based one-time passcodes (TOTP).
        </p>
      </div>

      {loading ? (
        <div className="max-w-[650px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading security status…</p>
        </div>
      ) : (
        <div className="max-w-[650px] space-y-token-6">
          {message && (
            <div className="rounded-md border border-success/30 bg-success/10 p-token-4 text-token-sm font-medium text-success">
              {message}
            </div>
          )}

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <div className="flex items-start justify-between gap-token-4">
              <div>
                <div className="flex items-center gap-token-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${enabled ? 'bg-success' : 'bg-warning'}`}
                  />
                  <h2 className="text-token-base font-semibold text-text-primary">
                    Authenticator App (TOTP)
                  </h2>
                </div>
                <p className="mt-token-2 text-token-sm text-text-secondary">
                  Use applications like Google Authenticator, Authy, or 1Password to generate 6-digit verification
                  codes during sign in.
                </p>
              </div>

              <span
                className={`rounded-full px-token-3 py-1 font-mono text-token-xs font-semibold uppercase tracking-[0.05em] ${
                  enabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning-strong'
                }`}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="mt-token-6 flex items-center justify-between border-t border-border-subtle pt-token-5">
              <div>
                <p className="text-token-sm font-medium text-text-primary">
                  Status: {enabled ? 'Active protection' : 'Not configured'}
                </p>
                <p className="text-token-xs text-text-muted">
                  {enabled
                    ? 'Your account requires an OTP code on every new device login.'
                    : 'We strongly recommend enabling 2FA for production accounts.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggle}
                disabled={busy}
                className={`h-9 rounded-md px-token-4 text-token-sm font-medium transition-colors ${
                  enabled
                    ? 'border border-danger/30 text-danger hover:bg-danger/10'
                    : 'bg-primary text-text-on-primary hover:opacity-90'
                }`}
              >
                {busy ? 'Updating…' : enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h3 className="text-token-sm font-semibold text-text-primary">Backup & Recovery</h3>
            <p className="mt-token-1 text-token-xs text-text-secondary">
              Backup recovery codes allow you to regain access if you lose your authentication device.
            </p>
            <div className="mt-token-4">
              <button
                type="button"
                disabled={!enabled}
                className="h-8 rounded-md border border-border bg-surface-card px-token-3 text-token-xs font-medium text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate New Recovery Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountSettingsLayout>
  );
}
