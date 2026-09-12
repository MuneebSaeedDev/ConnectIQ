import React from 'react';

export default function MonitoringSection({
  form,
  updateField,
  toggleNotificationChannel,
}) {
  const channels = form.notificationChannels || {};

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="monitoring-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          10
        </div>
        <div>
          <h2 id="monitoring-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Metrics, logging, alerts, and notification channels
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Monitoring Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <span className="text-xs font-medium text-slate-800">Enable Metrics</span>
              <p className="text-[10px] text-slate-400">Prometheus telemetry collection</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.enableMetrics}
              aria-label="Toggle enable metrics"
              onClick={() => updateField('enableMetrics', !form.enableMetrics)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.enableMetrics ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.enableMetrics ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <span className="text-xs font-medium text-slate-800">Enable Logs</span>
              <p className="text-[10px] text-slate-400">Structured JSON execution logs</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.enableLogs}
              aria-label="Toggle enable logs"
              onClick={() => updateField('enableLogs', !form.enableLogs)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.enableLogs ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.enableLogs ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <span className="text-xs font-medium text-slate-800">Enable Alerts</span>
              <p className="text-[10px] text-slate-400">Trigger on lag or error spikes</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.enableAlerts}
              aria-label="Toggle enable alerts"
              onClick={() => updateField('enableAlerts', !form.enableAlerts)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.enableAlerts ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.enableAlerts ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <span className="text-xs font-medium text-slate-800">Performance Monitoring</span>
              <p className="text-[10px] text-slate-400">Detailed throughput & latency profiling</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.performanceMonitoring}
              aria-label="Toggle performance monitoring"
              onClick={() => updateField('performanceMonitoring', !form.performanceMonitoring)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.performanceMonitoring ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.performanceMonitoring ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 sm:col-span-2 md:col-span-1">
            <div>
              <span className="text-xs font-medium text-slate-800">Data Profiling</span>
              <p className="text-[10px] text-slate-400">Statistical distribution analysis</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.dataProfiling}
              aria-label="Toggle data profiling"
              onClick={() => updateField('dataProfiling', !form.dataProfiling)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                form.dataProfiling ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  form.dataProfiling ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Notification Channels
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {['email', 'slack', 'teams', 'webhook'].map((ch) => (
              <label key={ch} className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(channels[ch])}
                  onChange={() => toggleNotificationChannel(ch)}
                  className="size-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="capitalize">{ch}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
