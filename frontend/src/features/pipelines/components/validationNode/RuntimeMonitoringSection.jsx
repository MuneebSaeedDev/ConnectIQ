import React from 'react';
import { Settings2, Sliders, Bell } from 'lucide-react';

export default function RuntimeMonitoringSection({
  runtimeConfig,
  monitoringConfig,
  updateNestedField,
  toggleMonitoringChannel,
  toggleMonitoringOption,
}) {
  const rc = runtimeConfig || {};
  const mc = monitoringConfig || {};
  const channels = mc.channels || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 20 Runtime Configuration */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-20-runtime-config"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              20
            </span>
            <h2 id="section-20-runtime-config" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Runtime Configuration
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="batch-size" className="block text-[11px] font-semibold text-slate-700">
                Batch Size
              </label>
              <input
                type="number"
                id="batch-size"
                value={rc.batchSize || 5000}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'batchSize', Number(e.target.value))
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label htmlFor="parallelism" className="block text-[11px] font-semibold text-slate-700">
                Parallelism
              </label>
              <input
                type="number"
                id="parallelism"
                value={rc.parallelism || 4}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'parallelism', Number(e.target.value))
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label htmlFor="timeout-seconds" className="block text-[11px] font-semibold text-slate-700">
                Timeout (s)
              </label>
              <input
                type="number"
                id="timeout-seconds"
                value={rc.timeoutSeconds || 120}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'timeoutSeconds', Number(e.target.value))
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="error-handling-select" className="block text-[11px] font-semibold text-slate-700">
              Error Handling
            </label>
            <select
              id="error-handling-select"
              value={rc.errorHandling || 'Validate All Records'}
              onChange={(e) =>
                updateNestedField('runtimeConfig', 'errorHandling', e.target.value)
              }
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white cursor-pointer"
            >
              <option value="Validate All Records">Validate All Records</option>
              <option value="Stop on First Error">Stop on First Error</option>
              <option value="Drop and Continue">Drop and Continue</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="max-error-threshold" className="block text-[11px] font-semibold text-slate-700">
              Maximum Error Threshold
            </label>
            <div className="flex items-center gap-2 font-mono">
              <input
                type="number"
                id="max-error-threshold"
                value={rc.maxErrorThreshold || 1000}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'maxErrorThreshold', Number(e.target.value))
                }
                className="w-28 px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              />
              <span className="text-[11px] font-sans text-slate-500">
                {rc.thresholdNotice ||
                  'records — pipeline stops if exceeded. Invalid pipeline configuration is non-recoverable.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 21 Monitoring */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-21-monitoring"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              21
            </span>
            <h2 id="section-21-monitoring" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Monitoring
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Enabled Options
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.enableMetrics ?? true}
                  onChange={() => toggleMonitoringOption('enableMetrics')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Enable Validation Metrics
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.enableLogs ?? true}
                  onChange={() => toggleMonitoringOption('enableLogs')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Enable Validation Logs
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.trackFailedRecords ?? true}
                  onChange={() => toggleMonitoringOption('trackFailedRecords')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Track Failed Records
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.trackRulePerformance ?? true}
                  onChange={() => toggleMonitoringOption('trackRulePerformance')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Track Rule Performance
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.trackDataQualityScore ?? true}
                  onChange={() => toggleMonitoringOption('trackDataQualityScore')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Track Data Quality Score
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mc.alertOnValidationFailure ?? true}
                  onChange={() => toggleMonitoringOption('alertOnValidationFailure')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Alert on Validation Failure
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={mc.alertOnQualityThreshold ?? false}
                  onChange={() => toggleMonitoringOption('alertOnQualityThreshold')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Alert on Quality Threshold
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Notification Channels
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.inApp ?? true}
                  onChange={() => toggleMonitoringChannel('inApp')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                In-App
              </label>

              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.email ?? true}
                  onChange={() => toggleMonitoringChannel('email')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Email
              </label>

              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.webhook ?? true}
                  onChange={() => toggleMonitoringChannel('webhook')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Webhook
              </label>

              <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms ?? false}
                  onChange={() => toggleMonitoringChannel('sms')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                SMS (Optional)
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
