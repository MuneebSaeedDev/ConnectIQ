import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getSessions, terminateSession, terminateAllOtherSessions } from '../services/settings.api';

export default function ActiveSessionsSettingsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const res = await getSessions();
    setSessions(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleTerminate(id) {
    await terminateSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setMessage('Session terminated.');
  }

  async function handleTerminateAll() {
    await terminateAllOtherSessions();
    setSessions((prev) => prev.filter((s) => s.current));
    setMessage('All other sessions terminated.');
  }

  return (
    <AccountSettingsLayout activeItem="active-sessions" breadcrumbTail="Active sessions">
      <div className="mb-token-7 max-w-[800px]">
        <div className="flex flex-col gap-token-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Active Sessions</h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              Review and manage devices currently signed in to your ConnectIQ account.
            </p>
          </div>
          {sessions.filter((s) => !s.current).length > 0 && (
            <button
              type="button"
              onClick={handleTerminateAll}
              className="h-8 rounded-md border border-danger/40 bg-surface-card px-token-3 text-token-xs font-semibold text-danger hover:bg-danger/10"
            >
              Sign Out Other Sessions
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="max-w-[800px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading active sessions…</p>
        </div>
      ) : (
        <div className="max-w-[800px] space-y-token-6">
          {message && (
            <div className="rounded-md border border-success/30 bg-success/10 p-token-4 text-token-sm font-medium text-success">
              {message}
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
            <table className="w-full text-left text-token-sm">
              <thead className="border-b border-border bg-surface-muted/50 font-mono text-token-xs uppercase tracking-[0.05em] text-text-muted">
                <tr>
                  <th className="px-token-4 py-token-3">Device / Browser</th>
                  <th className="px-token-4 py-token-3">IP & Location</th>
                  <th className="px-token-4 py-token-3">Last Active</th>
                  <th className="px-token-4 py-token-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-surface-hover/30">
                    <td className="px-token-4 py-token-4">
                      <div className="flex items-center gap-token-2">
                        <span className="font-semibold text-text-primary">{sess.device}</span>
                        {sess.current && (
                          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-token-xs text-text-muted">
                        {sess.browser} · {sess.os}
                      </p>
                    </td>
                    <td className="px-token-4 py-token-4">
                      <p className="font-mono text-token-xs text-text-secondary">{sess.ip}</p>
                      <p className="text-token-xs text-text-muted">{sess.location}</p>
                    </td>
                    <td className="px-token-4 py-token-4 text-token-sm text-text-secondary">
                      {sess.loginTime}
                    </td>
                    <td className="px-token-4 py-token-4 text-right">
                      {sess.current ? (
                        <span className="text-token-xs text-text-muted">This Device</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTerminate(sess.id)}
                          className="font-medium text-danger hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AccountSettingsLayout>
  );
}
