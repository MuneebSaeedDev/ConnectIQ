import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getAuditLogs } from '../services/settings.api';

const SEVERITY_BADGE = {
  low: 'bg-surface-muted text-text-secondary',
  medium: 'bg-warning/10 text-warning-strong',
  high: 'bg-danger/10 text-danger',
  critical: 'bg-danger text-text-on-primary',
};

export default function AuditLogsSettingsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAuditLogs();
      setLogs(res.data?.logs || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AccountSettingsLayout activeItem="audit-logs" breadcrumbTail="Audit logs">
      <div className="mb-token-7 max-w-[850px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Audit Logs</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Immutable history of security, authentication, and administrative actions performed on this account.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[850px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading audit records…</p>
        </div>
      ) : (
        <div className="max-w-[850px] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
          <table className="w-full text-left text-token-sm">
            <thead className="border-b border-border bg-surface-muted/50 font-mono text-token-xs uppercase tracking-[0.05em] text-text-muted">
              <tr>
                <th className="px-token-4 py-token-3">Event / Action</th>
                <th className="px-token-4 py-token-3">Details</th>
                <th className="px-token-4 py-token-3">Actor & IP</th>
                <th className="px-token-4 py-token-3">Severity</th>
                <th className="px-token-4 py-token-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-hover/30">
                  <td className="px-token-4 py-token-3">
                    <p className="font-semibold text-text-primary">{log.action}</p>
                    <span className="font-mono text-[10px] uppercase text-text-muted">{log.category}</span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-xs text-text-secondary leading-relaxed">
                    {log.details}
                  </td>
                  <td className="px-token-4 py-token-3">
                    <p className="text-token-xs font-medium text-text-primary">{log.actor}</p>
                    <p className="font-mono text-[10px] text-text-muted">{log.ip}</p>
                  </td>
                  <td className="px-token-4 py-token-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] ${
                        SEVERITY_BADGE[log.severity] || 'bg-surface-muted text-text-secondary'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountSettingsLayout>
  );
}
