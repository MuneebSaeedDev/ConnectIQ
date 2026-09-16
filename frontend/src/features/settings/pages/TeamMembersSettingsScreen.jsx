import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getTeamMembers } from '../services/settings.api';

export default function TeamMembersSettingsScreen() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getTeamMembers();
      setMembers(res.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AccountSettingsLayout activeItem="team-members" breadcrumbTail="Team members">
      <div className="mb-token-7 max-w-[800px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Team Members</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Colleagues and collaborators in your organization who share workspace access.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[800px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading team members…</p>
        </div>
      ) : (
        <div className="max-w-[800px] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
          <table className="w-full text-left text-token-sm">
            <thead className="border-b border-border bg-surface-muted/50 font-mono text-token-xs uppercase tracking-[0.05em] text-text-muted">
              <tr>
                <th className="px-token-4 py-token-3">Member</th>
                <th className="px-token-4 py-token-3">Role</th>
                <th className="px-token-4 py-token-3">Department / Team</th>
                <th className="px-token-4 py-token-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-hover/30">
                  <td className="px-token-4 py-token-3">
                    <div className="flex items-center gap-token-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-shell-avatar text-token-xs font-bold text-text-on-primary">
                        {m.avatar || m.name?.[0] || 'U'}
                      </span>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {m.name} {m.isCurrent && <span className="text-primary text-xs font-normal">(You)</span>}
                        </p>
                        <p className="text-token-xs text-text-muted">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-token-4 py-token-3 font-medium text-text-secondary">
                    {m.role}
                  </td>
                  <td className="px-token-4 py-token-3 text-text-secondary">
                    <p>{m.department}</p>
                    <p className="text-token-xs text-text-muted">{m.team}</p>
                  </td>
                  <td className="px-token-4 py-token-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {m.status}
                    </span>
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
