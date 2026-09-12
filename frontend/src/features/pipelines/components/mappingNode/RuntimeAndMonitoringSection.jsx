import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Clock,
  Zap,
} from 'lucide-react';
import {
  RETRY_POLICY_OPTIONS,
  ERROR_HANDLING_OPTIONS,
} from '../../services/mappingNodeConfig.api';

export default function RuntimeAndMonitoringSection({
  runtimeConfig = {},
  monitoring = {},
  updateRuntimeConfig,
  updateMonitoring,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* 13 RUNTIME CONFIGURATION */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="runtime-config-heading"
      >
        {/* Header matching Figma 170:2621 */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              13
            </span>
            <h2 id="runtime-config-heading" className="text-sm font-bold text-slate-900">
              Runtime Configuration
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Batch Size */}
            <div>
              <label htmlFor="batchSize" className="block font-semibold text-slate-700 mb-1">
                Batch Size
              </label>
              <input
                id="batchSize"
                type="number"
                value={runtimeConfig.batchSize || 5000}
                onChange={(e) => updateRuntimeConfig('batchSize', Number(e.target.value))}
                className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Parallelism */}
            <div>
              <label htmlFor="parallelism" className="block font-semibold text-slate-700 mb-1">
                Parallelism
              </label>
              <input
                id="parallelism"
                type="number"
                value={runtimeConfig.parallelism || 4}
                onChange={(e) => updateRuntimeConfig('parallelism', Number(e.target.value))}
                className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Timeout */}
            <div>
              <label htmlFor="timeoutSec" className="block font-semibold text-slate-700 mb-1">
                Timeout (s)
              </label>
              <input
                id="timeoutSec"
                type="number"
                value={runtimeConfig.timeoutSeconds || 300}
                onChange={(e) => updateRuntimeConfig('timeoutSeconds', Number(e.target.value))}
                className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Error Handling */}
            <div>
              <label htmlFor="errHandling" className="block font-semibold text-slate-700 mb-1">
                Error Handling
              </label>
              <select
                id="errHandling"
                value={runtimeConfig.errorHandling || 'Skip Invalid Records'}
                onChange={(e) => updateRuntimeConfig('errorHandling', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ERROR_HANDLING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Retry Policy */}
            <div>
              <label htmlFor="retryPol" className="block font-semibold text-slate-700 mb-1">
                Retry Policy
              </label>
              <select
                id="retryPol"
                value={runtimeConfig.retryPolicy || 'Exponential Backoff (3x)'}
                onChange={(e) => updateRuntimeConfig('retryPolicy', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {RETRY_POLICY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 14 MONITORING */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="monitoring-heading"
      >
        {/* Header matching Figma 170:2658 */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              14
            </span>
            <h2 id="monitoring-heading" className="text-sm font-bold text-slate-900">
              Monitoring
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Toggles Strip */}
          <div>
            <span className="block font-semibold text-slate-700 mb-2">
              Options
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!monitoring.enableMappingMetrics}
                  onChange={(e) => updateMonitoring('enableMappingMetrics', e.target.checked)}
                  className="size-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Enable Mapping Metrics</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!monitoring.enableTransformationLogs}
                  onChange={(e) => updateMonitoring('enableTransformationLogs', e.target.checked)}
                  className="size-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Enable Transformation Logs</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!monitoring.trackRejectedRecords}
                  onChange={(e) => updateMonitoring('trackRejectedRecords', e.target.checked)}
                  className="size-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Track Rejected Records</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!monitoring.trackTransformationErrors}
                  onChange={(e) => updateMonitoring('trackTransformationErrors', e.target.checked)}
                  className="size-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Track Transformation Errors</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={!!monitoring.alertOnFailures}
                  onChange={(e) => updateMonitoring('alertOnFailures', e.target.checked)}
                  className="size-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Alert on Mapping Failures</span>
              </label>
            </div>
          </div>

          {/* Telemetry Stats Grid matching Figma 170:2689 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 font-mono text-[11px]">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                Processed
              </span>
              <span className="text-slate-800 font-bold text-xs">
                {monitoring.stats?.recordsProcessed || '4,200,000'}
              </span>
            </div>

            <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded">
              <span className="text-[10px] font-sans font-bold uppercase text-emerald-700 block">
                Mapped
              </span>
              <span className="text-emerald-900 font-bold text-xs">
                {monitoring.stats?.recordsMapped || '4,183,421'}
              </span>
            </div>

            <div className="p-2 bg-rose-50/60 border border-rose-200 rounded">
              <span className="text-[10px] font-sans font-bold uppercase text-rose-700 block">
                Rejected
              </span>
              <span className="text-rose-900 font-bold text-xs">
                {monitoring.stats?.recordsRejected || '16,579'}
              </span>
            </div>

            <div className="p-2 bg-amber-50/60 border border-amber-200 rounded">
              <span className="text-[10px] font-sans font-bold uppercase text-amber-700 block">
                Transform Errors
              </span>
              <span className="text-amber-900 font-bold text-xs">
                {monitoring.stats?.transformErrors || '142'}
              </span>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded col-span-2 sm:col-span-2">
              <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                Processing Duration
              </span>
              <span className="text-slate-800 font-bold text-xs">
                {monitoring.stats?.processingDuration || '8m 24s'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
