import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getProfile, updateProfile } from '../services/settings.api';

const fieldBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';

export default function ProfileSettingsScreen() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getProfile();
      setProfile(res.data);
      setForm(res.data);
      setLoading(false);
    }
    load();
  }, []);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSavedMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSavedMessage('Profile updated successfully.');
  }

  return (
    <AccountSettingsLayout activeItem="profile" breadcrumbTail="Profile">
      <div className="mb-token-7 max-w-[700px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Profile</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Manage your personal details, public profile, and identity information.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[700px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading profile…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-[700px] space-y-token-6">
          {savedMessage && (
            <div className="rounded-md border border-success/30 bg-success/10 p-token-4 text-token-sm font-medium text-success">
              {savedMessage}
            </div>
          )}

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">Avatar & Bio</h2>
            <div className="mt-token-4 flex items-center gap-token-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-token-xl font-bold text-text-on-primary">
                {form.displayName?.[0] || 'U'}
              </span>
              <div>
                <p className="text-token-base font-semibold text-text-primary">{form.displayName || 'User'}</p>
                <p className="text-token-sm text-text-muted">{form.jobTitle} · {form.department}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">Personal Details</h2>
            <div className="mt-token-4 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-first">
                  First Name
                </label>
                <input
                  id="prof-first"
                  className={fieldBase}
                  value={form.firstName || ''}
                  onChange={(e) => setField('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-last">
                  Last Name
                </label>
                <input
                  id="prof-last"
                  className={fieldBase}
                  value={form.lastName || ''}
                  onChange={(e) => setField('lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-display">
                  Display Name
                </label>
                <input
                  id="prof-display"
                  className={fieldBase}
                  value={form.displayName || ''}
                  onChange={(e) => setField('displayName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-email">
                  Email (Managed)
                </label>
                <input
                  id="prof-email"
                  className={fieldBase}
                  value={form.email || ''}
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-phone">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  className={fieldBase}
                  value={form.phone || ''}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-job">
                  Job Title
                </label>
                <input
                  id="prof-job"
                  className={fieldBase}
                  value={form.jobTitle || ''}
                  onChange={(e) => setField('jobTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-location">
                  Office Location
                </label>
                <input
                  id="prof-location"
                  className={fieldBase}
                  value={form.officeLocation || ''}
                  onChange={(e) => setField('officeLocation', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="prof-pronouns">
                  Preferred Pronouns
                </label>
                <input
                  id="prof-pronouns"
                  className={fieldBase}
                  value={form.pronouns || ''}
                  onChange={(e) => setField('pronouns', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-token-3">
            <button
              type="submit"
              disabled={saving}
              className="flex h-9 items-center rounded-md bg-primary px-token-5 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </AccountSettingsLayout>
  );
}
