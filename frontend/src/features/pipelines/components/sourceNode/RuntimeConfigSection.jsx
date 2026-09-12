import React from 'react';
import {
  RETRY_POLICIES,
} from '../../services/sourceNodeConfig.api';

export default function RuntimeConfigSection({
  form,
  updateField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="runtime-config-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          9
        </div>
        <div>
          <h2 id="runtime-config-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Runtime Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch size, parallelism, timeouts, retries, and error handling
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Row 1: Batch Size, Parallelism, Fetch Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source-batch-size" className="block text-xs font-medium text-slate-700 mb-1">
              Batch Size
            </label>
            <div className="relative">
              <input
                id="source-batch-size"
                type="text"
                value={form.batchSize || '10,000'}
                onChange={(e) => updateField('batchSize', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 pointer-events-none">
                rows
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="source-parallelism" className="block text-xs font-medium text-slate-700 mb-1">
              Parallelism
            </label>
            <input
              id="source-parallelism"
              type="number"
              min="1"
              max="32"
              value={form.parallelism || 4}
              onChange={(e) => updateField('parallelism', parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Concurrent worker threads.
            </p>
          </div>

          <div>
            <label htmlFor="source-fetch-size" className="block text-xs font-medium text-slate-700 mb-1">
              Fetch Size
            </label>
            <input
              id="source-fetch-size"
              type="text"
              value={form.fetchSize || '1,000'}
              onChange={(e) => updateField('fetchSize', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 2: Timeout, Retry Policy, Buffer Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source-timeout" className="block text-xs font-medium text-slate-700 mb-1">
              Timeout
            </label>
            <div className="flex">
              <input
                id="source-timeout"
                type="number"
                min="1"
                value={form.timeout || 30}
                onChange={(e) => updateField('timeout', parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs font-mono rounded-l-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 z-10"
              />
              <select
                value={form.timeoutUnit || 'sec'}
                onChange={(e) => updateField('timeoutUnit', e.target.value)}
                className="w-20 px-2 py-2 text-xs rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:z-20"
                aria-label="Timeout unit"
              >
                <option value="sec">sec</option>
                <option value="min">min</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="source-retry-policy" className="block text-xs font-medium text-slate-700 mb-1">
              Retry Policy
            </label>
            <select
              id="source-retry-policy"
              value={form.retryPolicy || 'exponential'}
              onChange={(e) => updateField('retryPolicy', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {RETRY_POLICIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-buffer-size" className="block text-xs font-medium text-slate-700 mb-1">
              Buffer Size
            </label>
            <input
              id="source-buffer-size"
              type="text"
              value={form.bufferSize || '64 MB'}
              onChange={(e) => updateField('bufferSize', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: 4 Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Fail on Error</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.failOnError}
              aria-label="Toggle fail on error"
              onClick={() => updateField('failOnError', !form.failOnError)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.failOnError ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.failOnError ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Skip Invalid Records</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.skipInvalid}
              aria-label="Toggle skip invalid records"
              onClick={() => updateField('skipInvalid', !form.skipInvalid)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.skipInvalid ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.skipInvalid ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Continue Processing</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.continueProcessing}
              aria-label="Toggle continue processing"
              onClick={() => updateField('continueProcessing', !form.continueProcessing)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.continueProcessing ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.continueProcessing ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Compression</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.compression}
              aria-label="Toggle compression"
              onClick={() => updateField('compression', !form.compression)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.compression ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.compression ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
