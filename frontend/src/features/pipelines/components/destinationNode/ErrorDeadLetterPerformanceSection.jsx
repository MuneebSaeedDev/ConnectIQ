import React from 'react';
import { AlertOctagon, Cpu, ShieldAlert, Zap } from 'lucide-react';

export default function ErrorDeadLetterPerformanceSection({
  form,
  updateField,
  updateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">05. Dead-Letter Queue & Sink Resilience</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Error & DLQ Policy */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
              <ShieldAlert className="size-3.5 text-rose-600" />
              Write Failure & DLQ Policy
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">On Record Write Error</label>
              <select
                value={form.errorPolicy || 'ROUTE_TO_DLQ'}
                onChange={(e) => updateField('errorPolicy', e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ROUTE_TO_DLQ">Route to Dead Letter Queue (Safe, Lossless)</option>
                <option value="ABORT">Abort Pipeline Immediately (Strict Transactional)</option>
                <option value="IGNORE">Ignore & Continue (Best Effort)</option>
              </select>
            </div>

            {form.errorPolicy === 'ROUTE_TO_DLQ' && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Dead Letter Destination Storage (S3 / Kafka)
                </label>
                <input
                  type="text"
                  value={form.deadLetterTarget || ''}
                  onChange={(e) => updateField('deadLetterTarget', e.target.value)}
                  placeholder="s3://dead-letter-bucket/errors/"
                  className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">
                Max Allowed Error Rate Before Pipeline Halt (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.maxAllowedErrorPercent || 1.0}
                onChange={(e) => updateField('maxAllowedErrorPercent', parseFloat(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Performance & Flush Tuning */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
              <Zap className="size-3.5 text-amber-500" />
              Ingestion Throughput & Concurrency
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Batch Record Chunk Size</label>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  value={form.batchSize || 25000}
                  onChange={(e) => updateField('batchSize', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Concurrent Workers</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={form.maxConcurrency || 8}
                  onChange={(e) => updateField('maxConcurrency', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Retry Attempts</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.performance?.retryAttempts || 3}
                  onChange={(e) => updateNestedField('performance', 'retryAttempts', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Flush Interval (ms)</label>
                <input
                  type="number"
                  min="500"
                  max="60000"
                  value={form.performance?.flushIntervalMs || 5000}
                  onChange={(e) => updateNestedField('performance', 'flushIntervalMs', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
