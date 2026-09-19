import React from 'react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function ExecutionSettingsSection({ form, updateNestedField, validation }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Execution Profile</h3>
        <p className="text-xs text-slate-500 mt-0.5">Configure engine capabilities, execution limits, and cluster resource allocations.</p>
      </div>

      {/* Primary Engine */}
      <div>
        <label className="block text-xs font-semibold text-slate-900 mb-3">Processing Engine</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PIPELINE_SETTINGS_OPTIONS.executionEngines.map((engine) => {
            const isSelected = form.execution?.engine === engine.value;
            return (
              <label
                key={engine.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-2xs focus:outline-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
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
                        {engine.label.split('(')[0].trim()}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                        {engine.description}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="execution-engine"
                  value={engine.value}
                  className="sr-only"
                  checked={isSelected}
                  onChange={(e) => updateNestedField('execution', 'engine', e.target.value)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4 border-t border-slate-100">
        {/* Execution Mode */}
        <div>
          <label htmlFor="exec-mode" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Execution Mode
          </label>
          <select
            id="exec-mode"
            value={form.execution?.mode || 'batch'}
            onChange={(e) => updateNestedField('execution', 'mode', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PIPELINE_SETTINGS_OPTIONS.executionModes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="exec-priority" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Queue Priority
          </label>
          <select
            id="exec-priority"
            value={form.execution?.priority || 'normal'}
            onChange={(e) => updateNestedField('execution', 'priority', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="critical">Critical (P0 - Immediate Scheduling)</option>
            <option value="high">High (P1 - Priority Pool)</option>
            <option value="normal">Normal (P2 - Default FIFO)</option>
            <option value="low">Low (P3 - Background / Idle Capacity)</option>
          </select>
        </div>

        {/* Concurrency */}
        <div>
          <label htmlFor="exec-concurrency" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Max Concurrency</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">Tasks</span>
          </label>
          <input
            id="exec-concurrency"
            type="number"
            min="1"
            max="100"
            value={form.execution?.concurrencyLimit || 1}
            onChange={(e) => updateNestedField('execution', 'concurrencyLimit', parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p className="mt-1.5 text-[11px] text-slate-500">Maximum simultaneous active runs of this pipeline.</p>
        </div>

        {/* Timeout */}
        <div>
          <label htmlFor="exec-timeout" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Global Execution Timeout</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">Minutes</span>
          </label>
          <input
            id="exec-timeout"
            type="number"
            min="1"
            value={form.execution?.timeoutMinutes || 120}
            onChange={(e) => updateNestedField('execution', 'timeoutMinutes', parseInt(e.target.value, 10) || 120)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validation?.errors?.timeoutMinutes ? 'border-rose-300 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:border-blue-500 text-slate-900'
              }`}
            aria-invalid={!!validation?.errors?.timeoutMinutes}
          />
          {validation?.errors?.timeoutMinutes ? (
            <p className="mt-1.5 text-[11px] font-medium text-rose-600">{validation.errors.timeoutMinutes}</p>
          ) : (
            <p className="mt-1.5 text-[11px] text-slate-500">Pipeline is forcibly terminated and marked failed if it exceeds this duration.</p>
          )}
        </div>
      </div>
    </div>
  );
}
