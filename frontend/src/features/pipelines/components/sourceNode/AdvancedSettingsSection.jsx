import React from 'react';
import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdvancedSettingsSection({
  form,
  updateNestedField,
  advancedOpen,
  setAdvancedOpen,
}) {
  const adv = form.advancedSettings || {};

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden" aria-labelledby="advanced-settings-heading">
      {/* Section Header Accordion Trigger */}
      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        aria-expanded={advancedOpen}
        aria-controls="advanced-settings-panel"
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
            11
          </div>
          <div>
            <h2 id="advanced-settings-heading" className="text-sm font-semibold text-slate-900 leading-tight">
              Advanced Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Custom params, env vars, SSL, proxy — collapsed by default
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>{advancedOpen ? 'Hide options' : '7 options hidden'}</span>
          {advancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {/* Expanded Accordion Panel */}
      {advancedOpen && (
        <div id="advanced-settings-panel" className="p-5 pt-0 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="adv-jdbc-params" className="block text-xs font-medium text-slate-700 mb-1">
                Custom Connection Parameters
              </label>
              <input
                id="adv-jdbc-params"
                type="text"
                value={adv.customJdbcParams || ''}
                onChange={(e) => updateNestedField('advancedSettings', 'customJdbcParams', e.target.value)}
                placeholder="sslmode=verify-full&connectTimeout=10"
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Appended as query parameters to JDBC connection string.
              </p>
            </div>

            <div>
              <label htmlFor="adv-env-vars" className="block text-xs font-medium text-slate-700 mb-1">
                Environment Variable Overrides
              </label>
              <input
                id="adv-env-vars"
                type="text"
                value={adv.envVarOverrides || ''}
                onChange={(e) => updateNestedField('advancedSettings', 'envVarOverrides', e.target.value)}
                placeholder="PGTZ=UTC"
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="adv-tls-version" className="block text-xs font-medium text-slate-700 mb-1">
                Minimum TLS Version
              </label>
              <select
                id="adv-tls-version"
                value={adv.tlsVersion || 'TLS 1.3'}
                onChange={(e) => updateNestedField('advancedSettings', 'tlsVersion', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="TLS 1.3">TLS 1.3 (Recommended)</option>
                <option value="TLS 1.2">TLS 1.2</option>
              </select>
            </div>

            <div>
              <label htmlFor="adv-ca-bundle" className="block text-xs font-medium text-slate-700 mb-1">
                CA Certificate Bundle
              </label>
              <input
                id="adv-ca-bundle"
                type="text"
                value={adv.caBundle || ''}
                onChange={(e) => updateNestedField('advancedSettings', 'caBundle', e.target.value)}
                placeholder="Enterprise-Root-CA-2026"
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="adv-pool-size" className="block text-xs font-medium text-slate-700 mb-1">
                Max Pool Size
              </label>
              <input
                id="adv-pool-size"
                type="number"
                min="1"
                max="100"
                value={adv.maxPoolSize || 20}
                onChange={(e) => updateNestedField('advancedSettings', 'maxPoolSize', parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
