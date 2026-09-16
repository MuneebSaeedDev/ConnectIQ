import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/settings.api';

export default function NotificationsSettingsScreen() {
  const [prefs, setPrefs] = useState({ email: {}, inApp: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getNotificationPreferences();
      setPrefs(res.data);
      setLoading(false);
    }
    load();
  }, []);

  function toggle(type, key) {
    setPrefs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type]?.[key],
      },
    }));
    setSavedMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await updateNotificationPreferences(prefs);
    setSaving(false);
    setSavedMessage('Notification preferences updated successfully.');
  }

  return (
    <AccountSettingsLayout activeItem="notifications" breadcrumbTail="Notifications">
      <div className="mb-token-7 max-w-[700px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Notifications</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Choose what alerts and events you want to receive across email and in-app feeds.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[700px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading notifications…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-[700px] space-y-token-6">
          {savedMessage && (
            <div className="rounded-md border border-success/30 bg-success/10 p-token-4 text-token-sm font-medium text-success">
              {savedMessage}
            </div>
          )}

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">Email Notifications</h2>
            <p className="mt-1 text-token-xs text-text-muted">Direct emails dispatched to your verified address.</p>

            <div className="mt-token-4 divide-y divide-border-subtle">
              <ToggleRow
                label="Pipeline Failures & Interruptions"
                desc="Immediate alerts when any job fails, aborts, or exceeds timeout limits."
                checked={!!prefs.email?.pipelineFailures}
                onChange={() => toggle('email', 'pipelineFailures')}
              />
              <ToggleRow
                label="Connector Alerts & Degradation"
                desc="Notifications when source or destination connections encounter authentication or network drops."
                checked={!!prefs.email?.connectorAlerts}
                onChange={() => toggle('email', 'connectorAlerts')}
              />
              <ToggleRow
                label="Security & Access Warnings"
                desc="Alerts for unusual logins, role changes, or credential expirations."
                checked={!!prefs.email?.securityAlerts}
                onChange={() => toggle('email', 'securityAlerts')}
              />
              <ToggleRow
                label="Weekly Performance Digest"
                desc="Summary of throughput, uptime, and schema evolution delivered every Monday."
                checked={!!prefs.email?.weeklyDigest}
                onChange={() => toggle('email', 'weeklyDigest')}
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-card p-token-6">
            <h2 className="text-token-base font-semibold text-text-primary">In-App Notification Feed</h2>
            <p className="mt-1 text-token-xs text-text-muted">Events shown in the top navigation bell panel.</p>

            <div className="mt-token-4 divide-y divide-border-subtle">
              <ToggleRow
                label="Real-Time Execution Updates"
                desc="Live toasts and badges when pipeline runs start, finish, or retry."
                checked={!!prefs.inApp?.realTimeExecutions}
                onChange={() => toggle('inApp', 'realTimeExecutions')}
              />
              <ToggleRow
                label="Task Assignments & Mentions"
                desc="When you are assigned as pipeline owner or mentioned in comments."
                checked={!!prefs.inApp?.taskAssignments}
                onChange={() => toggle('inApp', 'taskAssignments')}
              />
              <ToggleRow
                label="System Announcements"
                desc="Platform maintenance schedules, feature updates, and release notes."
                checked={!!prefs.inApp?.systemAnnouncements}
                onChange={() => toggle('inApp', 'systemAnnouncements')}
              />
              <ToggleRow
                label="Team Activity Feed"
                desc="Edits to pipelines, sources, or destinations made by other team members."
                checked={!!prefs.inApp?.teamActivity}
                onChange={() => toggle('inApp', 'teamActivity')}
              />
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

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-token-4 py-token-3">
      <div>
        <p className="text-token-sm font-medium text-text-primary">{label}</p>
        <p className="text-token-xs text-text-muted">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
