import React from 'react';
import { Settings2 } from 'lucide-react';
import {
  RETRY_POLICY_OPTIONS,
  ERROR_HANDLING_OPTIONS,
} from '../../services/filterNodeConfig.api';

export default function RuntimeConfigSection({
  runtimeConfig = {},
  updateNestedField,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-runtime-config"
    >
      {/* Section Header matching Figma 157:4254 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-slate-600" />
          <h2 id="section-runtime-config" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Runtime Configuration
          </h2>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Timeout */}
          <div className="space-y-1.5">
            <label htmlFor="timeoutSeconds" className="block text-xs font-semibold text-slate-700">
              Timeout (seconds)
            </label>
            <input
              type="number"
              id="timeoutSeconds"
              min={10}
              max={3600}
              value={runtimeConfig.timeoutSeconds ?? 300}
              onChange={(e) => updateNestedField('runtimeConfig', 'timeoutSeconds', Number(e.target.value))}
              className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400">Execution deadline before pipeline abort</p>
          </div>

          {/* Parallelism */}
          <div className="space-y-1.5">
            <label htmlFor="parallelism" className="block text-xs font-semibold text-slate-700">
              Parallelism (threads)
            </label>
            <input
              type="number"
              id="parallelism"
              min={1}
              max={64}
              value={runtimeConfig.parallelism ?? 8}
              onChange={(e) => updateNestedField('runtimeConfig', 'parallelism', Number(e.target.value))}
              className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400">Worker execution concurrency</p>
          </div>

          {/* Batch Size */}
          <div className="space-y-1.5">
            <label htmlFor="batchSize" className="block text-xs font-semibold text-slate-700">
              Batch Size (records)
            </label>
            <input
              type="number"
              id="batchSize"
              min={100}
              max={100000}
              step={1000}
              value={runtimeConfig.batchSize ?? 10000}
              onChange={(e) => updateNestedField('runtimeConfig', 'batchSize', Number(e.target.value))}
              className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400">Chunk size evaluated in memory</p>
          </div>

          {/* Retry Policy */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1.5">
            <label htmlFor="retryPolicy" className="block text-xs font-semibold text-slate-700">
              Retry Policy
            </label>
            <select
              id="retryPolicy"
              value={runtimeConfig.retryPolicy || '3_exponential'}
              onChange={(e) => updateNestedField('runtimeConfig', 'retryPolicy', e.target.value)}
              className="w-full px-3 py-1.5 text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            >
              {RETRY_POLICY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Handling */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1.5">
            <label htmlFor="errorHandling" className="block text-xs font-semibold text-slate-700">
              Error Handling
            </label>
            <select
              id="errorHandling"
              value={runtimeConfig.errorHandling || 'skip_invalid'}
              onChange={(e) => updateNestedField('runtimeConfig', 'errorHandling', e.target.value)}
              className="w-full px-3 py-1.5 text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            >
              {ERROR_HANDLING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
