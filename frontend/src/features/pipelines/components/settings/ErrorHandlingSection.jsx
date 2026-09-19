import React from 'react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function ErrorHandlingSection({ form, updateNestedField, validation }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Error Handling & Recovery</h3>
        <p className="text-xs text-slate-500 mt-0.5">Determine how the pipeline reacts to corrupted records, node failures, and schema violations.</p>
      </div>

      {/* Error Strategy */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-900">Primary Failure Strategy</label>
        {PIPELINE_SETTINGS_OPTIONS.errorStrategies.map((strategy) => {
          const isSelected = form.errorHandling?.strategy === strategy.value;
          return (
            <label
              key={strategy.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-2xs focus:outline-none transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <div className={`flex size-4 items-center justify-center rounded-full border ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {strategy.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="error-strategy"
                value={strategy.value}
                className="sr-only"
                checked={isSelected}
                onChange={(e) => updateNestedField('errorHandling', 'strategy', e.target.value)}
              />
            </label>
          );
        })}
      </div>

      {/* Threshold configuration (visible only if fail_on_threshold is selected) */}
      {form.errorHandling?.strategy === 'fail_on_threshold' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="error-threshold-pct" className="block text-xs font-semibold text-amber-900 mb-1.5">
                Maximum Error Threshold (%)
              </label>
              <div className="relative">
                <input
                  id="error-threshold-pct"
                  type="number"
                  min="1"
                  max="100"
                  value={form.errorHandling?.maxErrorThresholdPct || 5}
                  onChange={(e) => updateNestedField('errorHandling', 'maxErrorThresholdPct', parseInt(e.target.value, 10))}
                  className={`w-full pl-3 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white ${
                    validation?.errors?.maxErrorThresholdPct ? 'border-rose-300 text-rose-900' : 'border-amber-300 text-amber-900'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-500">%</span>
              </div>
              {validation?.errors?.maxErrorThresholdPct && (
                <p className="mt-1-5 text-[11px] font-medium text-rose-600">{validation.errors.maxErrorThresholdPct}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="error-threshold-abs" className="block text-xs font-semibold text-amber-900 mb-1.5">
                Absolute Error Ceiling
              </label>
              <input
                id="error-threshold-abs"
                type="number"
                min="0"
                value={form.errorHandling?.maxAbsoluteErrors || 1000}
                onChange={(e) => updateNestedField('errorHandling', 'maxAbsoluteErrors', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-amber-300 bg-white text-amber-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Unlimited if 0"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-amber-700">
            Pipeline will continue processing until either the percentage or the absolute record failure ceiling is reached.
          </p>
        </div>
      )}

      {/* Secondary toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-2xs">
          <div className="flex h-5 items-center mt-0.5">
            <input
              type="checkbox"
              checked={form.errorHandling?.quarantineInvalidRecords ?? true}
              onChange={(e) => updateNestedField('errorHandling', 'quarantineInvalidRecords', e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Quarantine Invalid Records</span>
            <span className="text-xs text-slate-500 mt-1">Isolate failed records to a system quarantine table for manual replay instead of discarding.</span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-2xs">
          <div className="flex h-5 items-center mt-0.5">
            <input
              type="checkbox"
              checked={form.errorHandling?.notifyOnFirstError ?? false}
              onChange={(e) => updateNestedField('errorHandling', 'notifyOnFirstError', e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Alert on First Failure</span>
            <span className="text-xs text-slate-500 mt-1">Trigger immediate operational notification as soon as the first record fails, rather than waiting for completion.</span>
          </div>
        </label>

        {/* Dead Letter Queue configuration */}
        <div className="col-span-1 md:col-span-2 mt-2">
          <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-2xs">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Enable External Dead-Letter Queue (DLQ)</span>
              <span className="text-xs text-slate-500 mt-1">Publish unprocessable payloads to a dedicated Kafka/Events stream.</span>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 border-2 border-transparent transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
               <input
                  type="checkbox"
                  checked={form.errorHandling?.enableDeadLetterQueue ?? false}
                  onChange={(e) => updateNestedField('errorHandling', 'enableDeadLetterQueue', e.target.checked)}
                  className="peer sr-only"
                />
               <span
                 className={`inline-block size-5 transform rounded-full bg-white transition-transform ${
                   form.errorHandling?.enableDeadLetterQueue ? 'translate-x-5' : 'translate-x-0'
                 }`}
               />
               {/* Decorative background overlay triggered by peer checked */}
               <div className={`absolute inset-0 rounded-full transition-colors ${form.errorHandling?.enableDeadLetterQueue ? 'bg-blue-600 -z-10' : ''}`} />
            </div>
          </label>

          {form.errorHandling?.enableDeadLetterQueue && (
            <div className="mt-3 pl-4 border-l-2 border-blue-200 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="dlq-target" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Topic Pattern
              </label>
              <input
                id="dlq-target"
                type="text"
                value={form.errorHandling?.dlqTargetTopic || ''}
                onChange={(e) => updateNestedField('errorHandling', 'dlqTargetTopic', e.target.value)}
                placeholder="e.g., connectiq.dlq.customer360"
                className="w-full max-w-md px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
