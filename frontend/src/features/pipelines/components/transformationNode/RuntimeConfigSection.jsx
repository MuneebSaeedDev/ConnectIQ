import React from 'react';
import {
  RETRY_POLICY_OPTIONS,
  ERROR_HANDLING_OPTIONS,
} from '../../services/transformationNodeConfig.api';
import { Settings2 } from 'lucide-react';

export default function RuntimeConfigSection({
  runtimeConfig = {},
  onUpdateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Runtime Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Execution behavior and error handling</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls Grid matching Figma 220:6984 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Batch Size */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Batch Size</label>
            <input
              type="number"
              value={runtimeConfig.batchSize || 10000}
              onChange={(e) => onUpdateNestedField('runtimeConfig', 'batchSize', parseInt(e.target.value, 10))}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Parallelism */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Parallelism</label>
            <input
              type="number"
              value={runtimeConfig.parallelism || 4}
              onChange={(e) => onUpdateNestedField('runtimeConfig', 'parallelism', parseInt(e.target.value, 10))}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Timeout (sec) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Timeout (sec)</label>
            <input
              type="number"
              value={runtimeConfig.timeoutSeconds || 60}
              onChange={(e) => onUpdateNestedField('runtimeConfig', 'timeoutSeconds', parseInt(e.target.value, 10))}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Retry Policy */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Retry Policy</label>
            <select
              value={runtimeConfig.retryPolicy || 'Exponential Backoff'}
              onChange={(e) => onUpdateNestedField('runtimeConfig', 'retryPolicy', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {RETRY_POLICY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Error Handling */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Error Handling</label>
            <select
              value={runtimeConfig.errorHandling || 'Send Invalid Records to Error Output'}
              onChange={(e) => onUpdateNestedField('runtimeConfig', 'errorHandling', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {ERROR_HANDLING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
