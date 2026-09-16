import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getPreferences, updatePreferences } from '../services/settings.api';

const selectBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary';

export default function PreferencesSettingsScreen() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getPreferences();
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
    await updatePreferences(form);
    setSaving(false);
    setSavedMessage('Preferences updated successfully.');
  }

  return (
    <AccountSettingsLayout activeItem="preferences" breadcrumbTail="Preferences">
      <div className="mb-token-7 max-w-[700px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Preferences</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Configure localization, interface themes, and default application views.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[700px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading preferences…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-[700px] space-y-token-6">
          {savedMessage && (
            <div className="rounded-md border border-success/30 bg-success/10 p-token-4 text-token-sm font-medium text-success">
              {savedMessage}
            </div>
          )}

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">Localization & Region</h2>
            <div className="mt-token-4 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-lang">
                  Language
                </label>
                <select
                  id="pref-lang"
                  className={selectBase}
                  value={form.language || 'English (US)'}
                  onChange={(e) => setField('language', e.target.value)}
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-tz">
                  Timezone
                </label>
                <select
                  id="pref-tz"
                  className={selectBase}
                  value={form.timezone || 'UTC-8 (Pacific Time)'}
                  onChange={(e) => setField('timezone', e.target.value)}
                >
                  <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                  <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                  <option value="UTC+0 (GMT/UTC)">UTC+0 (GMT/UTC)</option>
                  <option value="UTC+1 (Central European)">UTC+1 (Central European)</option>
                  <option value="UTC+8 (Singapore/Perth)">UTC+8 (Singapore/Perth)</option>
                </select>
              </div>

              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-date">
                  Date Format
                </label>
                <select
                  id="pref-date"
                  className={selectBase}
                  value={form.dateFormat || 'YYYY-MM-DD'}
                  onChange={(e) => setField('dateFormat', e.target.value)}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-05-10)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (05/10/2025)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (10/05/2025)</option>
                </select>
              </div>

              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-time">
                  Time Format
                </label>
                <select
                  id="pref-time"
                  className={selectBase}
                  value={form.timeFormat || '12-hour (AM/PM)'}
                  onChange={(e) => setField('timeFormat', e.target.value)}
                >
                  <option value="12-hour (AM/PM)">12-hour (02:30 PM)</option>
                  <option value="24-hour">24-hour (14:30)</option>
                </select>
              </div>

              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-num">
                  Number Format
                </label>
                <select
                  id="pref-num"
                  className={selectBase}
                  value={form.numberFormat || '1,234.56 (US)'}
                  onChange={(e) => setField('numberFormat', e.target.value)}
                >
                  <option value="1,234.56 (US)">1,234.56 (US/Standard)</option>
                  <option value="1.234,56 (EU)">1.234,56 (European)</option>
                  <option value="1 234,56 (FR)">1 234,56 (SI/French)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">Interface & Navigation</h2>
            <div className="mt-token-4 grid grid-cols-1 gap-token-4 sm:grid-cols-2">
              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-theme">
                  Color Theme
                </label>
                <select
                  id="pref-theme"
                  className={selectBase}
                  value={form.theme || 'System Default'}
                  onChange={(e) => setField('theme', e.target.value)}
                >
                  <option value="System Default">System Default</option>
                  <option value="Light">Light Mode</option>
                  <option value="Dark">Dark Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-token-sm font-medium text-text-secondary" htmlFor="pref-landing">
                  Default Landing Page
                </label>
                <select
                  id="pref-landing"
                  className={selectBase}
                  value={form.defaultLandingPage || 'Pipelines Dashboard'}
                  onChange={(e) => setField('defaultLandingPage', e.target.value)}
                >
                  <option value="Pipelines Dashboard">Pipelines Overview</option>
                  <option value="Executive Dashboard">Executive Dashboard</option>
                  <option value="System Health">System Health</option>
                  <option value="Data Sources">Data Sources</option>
                  <option value="Destinations">Destinations</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-token-3">
            <button
              type="submit"
              disabled={saving}
              className="flex h-9 items-center rounded-md bg-primary px-token-5 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </form>
      )}
    </AccountSettingsLayout>
  );
}
