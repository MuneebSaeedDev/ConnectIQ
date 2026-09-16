import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getApiKeys, createApiKey, revokeApiKey } from '../services/settings.api';

export default function ApiKeysSettingsScreen() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [scope, setScope] = useState('read');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const res = await getApiKeys();
    setKeys(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!keyName) return;
    const res = await createApiKey({ name: keyName, scope });
    setGeneratedKey(res.data.key);
    setKeyName('');
    load();
  }

  async function handleRevoke(id) {
    await revokeApiKey(id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setMessage('API key revoked.');
  }

  return (
    <AccountSettingsLayout activeItem="api-keys" breadcrumbTail="API keys">
      <div className="mb-token-7 max-w-[800px]">
        <div className="flex flex-col gap-token-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Personal API Keys</h1>
            <p className="mt-token-2 text-token-base text-text-secondary">
              Generate personal access tokens to interact with ConnectIQ APIs programmatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setGeneratedKey(null);
              setModalOpen(true);
            }}
            className="h-9 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90"
          >
            Generate New Key
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-token-4 max-w-[800px] rounded-md border border-success/30 bg-success/10 p-token-3 text-token-sm font-medium text-success">
          {message}
        </div>
      )}

      {loading ? (
        <div className="max-w-[800px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading API keys…</p>
        </div>
      ) : (
        <div className="max-w-[800px] overflow-hidden rounded-md border border-border bg-surface-card shadow-sm">
          <table className="w-full text-left text-token-sm">
            <thead className="border-b border-border bg-surface-muted/50 font-mono text-token-xs uppercase tracking-[0.05em] text-text-muted">
              <tr>
                <th className="px-token-4 py-token-3">Name</th>
                <th className="px-token-4 py-token-3">Prefix</th>
                <th className="px-token-4 py-token-3">Scope</th>
                <th className="px-token-4 py-token-3">Last Used</th>
                <th className="px-token-4 py-token-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-surface-hover/30">
                  <td className="px-token-4 py-token-3 font-semibold text-text-primary">{k.name}</td>
                  <td className="px-token-4 py-token-3 font-mono text-token-xs text-text-secondary">
                    {k.prefix}••••••••
                  </td>
                  <td className="px-token-4 py-token-3">
                    <span className="rounded-sm bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-medium text-text-secondary">
                      {k.scope}
                    </span>
                  </td>
                  <td className="px-token-4 py-token-3 text-token-xs text-text-muted">{k.lastUsed || 'Never'}</td>
                  <td className="px-token-4 py-token-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="font-medium text-danger hover:underline"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-token-4">
          <div className="w-[450px] max-w-full rounded-md border border-border bg-surface-card p-token-6 shadow-xl">
            <h2 className="text-token-lg font-bold text-text-primary">Generate API Key</h2>
            <p className="mt-1 text-token-xs text-text-secondary">
              Create an authentication credential for automation and CLI scripts.
            </p>

            {generatedKey ? (
              <div className="mt-token-5 space-y-token-4">
                <div className="rounded-md border border-warning/30 bg-warning/10 p-token-4">
                  <p className="text-token-xs font-semibold text-warning-strong">
                    Copy this key now. It will never be shown again!
                  </p>
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="mt-token-2 h-9 w-full rounded-sm border border-border bg-surface-card px-2 font-mono text-token-xs text-text-primary"
                    onClick={(e) => e.target.select()}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setGeneratedKey(null);
                    }}
                    className="h-8 rounded-md bg-primary px-token-4 text-token-xs font-semibold text-text-on-primary"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="mt-token-4 space-y-token-4">
                <div>
                  <label className="block text-token-sm font-medium text-text-secondary">Key Description / Name</label>
                  <input
                    required
                    placeholder="e.g. Ingestion Pipeline Bot"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface-card px-3 text-token-sm"
                  />
                </div>

                <div>
                  <label className="block text-token-sm font-medium text-text-secondary">Permissions Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface-card px-3 text-token-sm"
                  >
                    <option value="read">Read Only</option>
                    <option value="read-write">Read & Write</option>
                    <option value="admin">Full Admin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-token-3 pt-token-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-8 rounded-md border border-border px-token-4 text-token-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 rounded-md bg-primary px-token-4 text-token-xs font-semibold text-text-on-primary"
                  >
                    Generate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AccountSettingsLayout>
  );
}
