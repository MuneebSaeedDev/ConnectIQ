import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsShellScaffold from '../components/SettingsShellScaffold';
import { useChangePassword } from '../hooks/useChangePassword';
import { PASSWORD_REQUIREMENTS, evaluatePasswordStrength } from '../../../hooks/usePasswordStrength';
import eyeIcon from '../../../assets/icons/eye.svg';
import alertCircleIcon from '../../../assets/icons/alert-circle.svg';
import checkIcon from '../../../assets/icons/check.svg';

const fieldInput =
  'h-[34px] w-full rounded-md border border-border bg-surface-card px-3 pr-9 font-sans text-token-base text-text-primary placeholder:text-decorative-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';

/**
 * SCR-007 — Change Password Screen. Node 19:5237, Figma page "Page 1".
 *
 * This Figma frame renders inside the full authenticated app shell
 * (top bar + settings side-nav), which MOD-001 (Shell/Bootstrap) has
 * not built yet — SCR-009/010/011 are still PLANNED per
 * docs/modules/module-plan.md. Per the user's explicit decision
 * (recorded here rather than silently built), this screen wraps its
 * real form content in `SettingsShellScaffold`, a temporary local
 * layout scoped to this screen only — not the canonical shared
 * AppShell. See that component's doc comment for the replacement plan.
 *
 * Known deferred gap (per SCR-007 UI review, non-blocking): the three
 * password show/hide fields are near-identical copy-pasted blocks;
 * worth extracting to a local PasswordField sub-component in a future
 * pass, but not required for this screen's correctness.
 */
export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    submitting,
    done,
    error,
    errorField,
    submit,
  } = useChangePassword();
  const doneHeadingRef = useRef(null);
  const strength = evaluatePasswordStrength(newPassword);

  // Move focus to the confirmation heading on success, matching the
  // focus-management precedent set by SCR-003/004/005/006's terminal
  // states (agent-rules.md §5 success-feedback requirement).
  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  async function handleSubmit(e) {
    e.preventDefault();
    await submit();
  }

  return (
    <SettingsShellScaffold activeItem="change-password">
      <div className="mb-token-7 max-w-[520px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Change password</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">Update your password to keep your account secure.</p>
      </div>

      <div className="max-w-[520px] overflow-hidden rounded-md border border-border bg-surface-card">
        {done ? (
          <div className="flex flex-col gap-token-5 p-token-7" role="status">
            <h2
              ref={doneHeadingRef}
              tabIndex={-1}
              className="m-0 text-token-lg font-semibold tracking-[-0.02em] text-text-primary focus-visible:outline-none"
            >
              Password changed
            </h2>
            <p className="m-0 text-token-base text-text-secondary">
              Your password has been updated. Use your new password next time you sign in.
            </p>
            <button
              type="button"
              className="h-9 w-fit rounded-md border border-border bg-surface-card px-token-5 text-token-base font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => navigate('/profile')}
            >
              Back to profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="border-b border-border-subtle px-token-7 py-token-6">
              <p className="m-0 text-token-sm font-semibold tracking-[-0.01em] text-text-primary">Current password</p>
              <div className="mt-token-5 flex flex-col gap-token-2">
                <label className="text-token-sm font-medium text-text-primary" htmlFor="current-password">
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`${fieldInput} ${
                      fieldErrors.currentPassword || errorField === 'currentPassword' ? 'border-danger' : ''
                    }`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.currentPassword || errorField === 'currentPassword')}
                    aria-describedby={
                      fieldErrors.currentPassword || errorField === 'currentPassword' ? 'current-password-error' : undefined
                    }
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 flex h-[34px] w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                    aria-pressed={showCurrent}
                  >
                    <img src={eyeIcon} alt="" className={`block h-3.5 w-3.5 ${showCurrent ? 'opacity-100' : 'opacity-55'}`} />
                  </button>
                </div>
                {(fieldErrors.currentPassword || (error && errorField === 'currentPassword')) && (
                  <p className="m-0 flex items-center gap-1.5 text-token-meta text-danger" id="current-password-error" role="alert">
                    <img src={alertCircleIcon} alt="" className="block h-3 w-3" />
                    {fieldErrors.currentPassword || error}
                  </p>
                )}
              </div>
            </div>

            <div className="border-b border-border-subtle px-token-7 py-token-6">
              <p className="m-0 text-token-sm font-semibold tracking-[-0.01em] text-text-primary">New password</p>
              <div className="mt-token-5 flex flex-col gap-token-2">
                <label className="text-token-sm font-medium text-text-primary" htmlFor="new-password">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${fieldInput} ${
                      fieldErrors.newPassword || errorField === 'newPassword' ? 'border-danger' : ''
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.newPassword || errorField === 'newPassword')}
                    aria-describedby={`password-requirements${
                      fieldErrors.newPassword || errorField === 'newPassword' ? ' new-password-error' : ''
                    }`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 flex h-[34px] w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                    aria-pressed={showNew}
                  >
                    <img src={eyeIcon} alt="" className={`block h-3.5 w-3.5 ${showNew ? 'opacity-100' : 'opacity-55'}`} />
                  </button>
                </div>
                {(fieldErrors.newPassword || (error && errorField === 'newPassword')) && (
                  <p className="m-0 flex items-center gap-1.5 text-token-meta text-danger" id="new-password-error" role="alert">
                    <img src={alertCircleIcon} alt="" className="block h-3 w-3" />
                    {fieldErrors.newPassword || error}
                  </p>
                )}
              </div>

              <div
                id="password-requirements"
                className="mt-token-4 flex flex-col gap-1.5 rounded-md border border-border bg-surface-page px-token-4 py-token-3"
              >
                <p className="m-0 pb-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-text-muted">
                  Requirements
                </p>
                {PASSWORD_REQUIREMENTS.map((req, i) => {
                  const met = strength.met[i];
                  return (
                    <div key={req.key} className="flex items-center gap-1.5">
                      {met ? (
                        <span className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full border border-success bg-success">
                          <img src={checkIcon} alt="" className="block h-2 w-2" />
                        </span>
                      ) : (
                        <span className="h-[13px] w-[13px] shrink-0 rounded-full border border-decorative-faint" aria-hidden="true" />
                      )}
                      <span className={`text-[11.5px] ${met ? 'text-success-strong' : 'text-text-secondary'}`}>{req.label}</span>
                    </div>
                  );
                })}
              </div>

              {newPassword && (
                <div className="mt-token-3 flex items-center gap-token-3">
                  <span className="text-token-meta text-text-muted">Strength</span>
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="h-[3px] flex-1 rounded-full"
                        style={{ backgroundColor: i < strength.filledBars ? strength.color : 'var(--color-border)' }}
                      />
                    ))}
                  </div>
                  <span className="text-token-meta font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              <div className="mt-token-5 flex flex-col gap-token-2">
                <label className="text-token-sm font-medium text-text-primary" htmlFor="confirm-new-password">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${fieldInput} ${
                      fieldErrors.confirmPassword || errorField === 'confirmPassword' ? 'border-danger' : ''
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirmPassword || errorField === 'confirmPassword')}
                    aria-describedby={
                      fieldErrors.confirmPassword || errorField === 'confirmPassword' ? 'confirm-new-password-error' : undefined
                    }
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 flex h-[34px] w-9 items-center justify-center rounded-r-md text-text-secondary focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirm}
                  >
                    <img src={eyeIcon} alt="" className={`block h-3.5 w-3.5 ${showConfirm ? 'opacity-100' : 'opacity-55'}`} />
                  </button>
                </div>
                {(fieldErrors.confirmPassword || (error && errorField === 'confirmPassword')) && (
                  <p className="m-0 flex items-center gap-1.5 text-token-meta text-danger" id="confirm-new-password-error" role="alert">
                    <img src={alertCircleIcon} alt="" className="block h-3 w-3" />
                    {fieldErrors.confirmPassword || error}
                  </p>
                )}
              </div>
            </div>

            {error && !['currentPassword', 'newPassword', 'confirmPassword'].includes(errorField) && (
              <p className="m-0 border-b border-border-subtle bg-danger-bg px-token-7 py-token-4 text-token-base text-danger-strong" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center gap-token-4 p-token-7">
              <button
                type="submit"
                className="h-[34px] rounded-md bg-primary px-token-5 text-token-base font-medium text-text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                disabled={submitting}
              >
                {submitting ? 'Changing…' : 'Change password'}
              </button>
              <button
                type="button"
                className="h-[34px] rounded-md border border-border bg-surface-card px-token-4 text-token-base font-medium text-text-secondary-strong hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => navigate('/profile')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </SettingsShellScaffold>
  );
}
