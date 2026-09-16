import { useEffect, useState } from 'react';
import AccountSettingsLayout from '../components/AccountSettingsLayout';
import { getIntegrations, toggleIntegration } from '../services/settings.api';

export default function IntegrationsSettingsScreen() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getIntegrations();
      setIntegrations(res.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleToggle(id, currentStatus) {
    setBusyId(id);
    const connect = currentStatus !== 'connected';
    await toggleIntegration(id, connect);
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: connect ? 'connected' : 'disconnected' } : item))
    );
    setBusyId(null);
  }

  return (
    <AccountSettingsLayout activeItem="integrations" breadcrumbTail="Integrations">
      <div className="mb-token-7 max-w-[800px]">
        <h1 className="m-0 text-token-xl font-semibold tracking-[-0.02em] text-text-primary">Integrations</h1>
        <p className="mt-token-2 text-token-base text-text-secondary">
          Connect third-party developer tools, alerting channels, and metrics backends.
        </p>
      </div>

      {loading ? (
        <div className="max-w-[800px] rounded-md border border-border bg-surface-card p-token-6">
          <p className="text-token-sm text-text-muted">Loading integrations…</p>
        </div>
      ) : (
        <div className="max-w-[800px] grid grid-cols-1 gap-token-4 sm:grid-cols-2">
          {integrations.map((item) => {
            const isConnected = item.status === 'connected';
            const isBusy = busyId === item.id;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-md border border-border bg-surface-card p-token-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-token-3">
                    <div className="flex items-center gap-token-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-xl">
                        {item.icon}
                      </span>
                      <div>
                        <h2 className="text-token-base font-semibold text-text-primary">{item.name}</h2>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isConnected ? 'bg-success/10 text-success' : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <p className="mt-token-3 text-token-xs leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                </div>

                <div className="mt-token-5 flex items-center justify-between border-t border-border-subtle pt-token-3">
                  <span className="text-[11px] text-text-muted">
                    {isConnected && item.connectedAt ? `Active since ${item.connectedAt}` : 'Not configured'}
                  </span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggle(item.id, item.status)}
                    className={`h-8 rounded-md px-token-3 text-token-xs font-semibold transition-colors ${
                      isConnected
                        ? 'border border-danger/30 text-danger hover:bg-danger/10'
                        : 'bg-primary text-text-on-primary hover:opacity-90'
                    }`}
                  >
                    {isBusy ? 'Processing…' : isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountSettingsLayout>
  );
}
