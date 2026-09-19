import React from 'react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function RetryConfigSection({ form, updateNestedField, validation }) {
  const isEnabled = form.retryConfig?.enabled ?? true;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Retry Policies</h3>
          <p className="text-xs text-slate-500 mt-0.5">Automated resilience policies for transient errors and socket disconnections.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => updateNestedField('retryConfig', 'enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-xs font-semibold text-slate-900">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      <div className={`space-y-6 ${!isEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strategy */}
          <div>
            <label htmlFor="retry-strategy" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Backoff Algorithm
            </label>
            <select
              id="retry-strategy"
              value={form.retryConfig?.strategy || 'exponential_backoff'}
              onChange={(e) => updateNestedField('retryConfig', 'strategy', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {PIPELINE_SETTINGS_OPTIONS.retryStrategies.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Max Retries */}
          <div>
            <label htmlFor="retry-max-attempts" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Max Retry Attempts
            </label>
            <input
              id="retry-max-attempts"
              type="number"
              min="0"
              max="10"
              value={form.retryConfig?.maxRetries ?? 3}
              onChange={(e) => updateNestedField('retryConfig', 'maxRetries', parseInt(e.target.value, 10))}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validation?.errors?.maxRetries ? 'border-rose-300 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:border-blue-500 text-slate-900'
                }`}
              aria-invalid={!!validation?.errors?.maxRetries}
            />
            {validation?.errors?.maxRetries && (
              <p className="mt-1.5 text-[11px] font-medium text-rose-600">{validation.errors.maxRetries}</p>
            )}
          </div>

          {/* Initial Delay */}
          <div>
            <label htmlFor="retry-initial-delay" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Initial Retry Delay</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">Seconds</span>
            </label>
            <input
              id="retry-initial-delay"
              type="number"
              min="5"
              value={form.retryConfig?.initialDelaySeconds ?? 30}
              onChange={(e) => updateNestedField('retryConfig', 'initialDelaySeconds', parseInt(e.target.value, 10))}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validation?.errors?.initialDelaySeconds ? 'border-rose-300 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:border-blue-500 text-slate-900'
                }`}
              aria-invalid={!!validation?.errors?.initialDelaySeconds}
            />
            {validation?.errors?.initialDelaySeconds && (
              <p className="mt-1.5 text-[11px] font-medium text-rose-600">{validation.errors.initialDelaySeconds}</p>
            )}
          </div>

          {/* Backoff Multiplier */}
          <div>
            <label htmlFor="retry-multiplier" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Backoff Multiplier (Exponential)
            </label>
            <input
              id="retry-multiplier"
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={form.retryConfig?.backoffMultiplier ?? 2.0}
              onChange={(e) => updateNestedField('retryConfig', 'backoffMultiplier', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-900 mb-3">Automatic Retry Conditions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition shadow-2xs">
              <input
                type="checkbox"
                checked={form.retryConfig?.retryOnNetworkTimeout ?? true}
                onChange={(e) => updateNestedField('retryConfig', 'retryOnNetworkTimeout', e.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">Network Timeouts</span>
            </label>

            <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition shadow-2xs">
              <input
                type="checkbox"
                checked={form.retryConfig?.retryOnSourceUnavailable ?? true}
                onChange={(e) => updateNestedField('retryConfig', 'retryOnSourceUnavailable', e.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">Upstream 503 Outage</span>
            </label>

            <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition shadow-2xs">
              <input
                type="checkbox"
                checked={form.retryConfig?.retryOnRateLimit ?? true}
                onChange={(e) => updateNestedField('retryConfig', 'retryOnRateLimit', e.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">API 429 Rate Limit</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
