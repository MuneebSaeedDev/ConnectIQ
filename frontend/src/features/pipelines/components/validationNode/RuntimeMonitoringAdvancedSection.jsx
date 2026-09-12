import React from 'react';
import { Settings2, Sliders, Bell, ChevronDown, ChevronUp } from 'lucide-react';

export default function RuntimeMonitoringAdvancedSection({
  runtimeConfig,
  monitoringConfig,
  advancedConfig,
  monitoringOpen,
  setMonitoringOpen,
  advancedOpen,
  setAdvancedOpen,
  updateNestedField,
  toggleMonitoringOption,
  toggleMonitoringChannel,
}) {
  const rc = runtimeConfig || {};
  const mc = monitoringConfig || {};
  const ac = advancedConfig || {};
  const channels = mc.channels || {};

  return (
    <div className="space-y-4">
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

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label htmlFor="batchSize" className="block text-xs font-semibold text-slate-700">
                Batch Size
              </label>
              <input
                type="number"
                id="batchSize"
                value={rc.batchSize || 5000}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'batchSize', Number(e.target.value))
                }
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="parallelism" className="block text-xs font-semibold text-slate-700">
                Parallelism
              </label>
              <input
                type="number"
                id="parallelism"
                value={rc.parallelism || 4}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'parallelism', Number(e.target.value))
                }
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="timeoutSeconds" className="block text-xs font-semibold text-slate-700">
                Timeout (s)
              </label>
              <input
                type="number"
                id="timeoutSeconds"
                value={rc.timeoutSeconds || 120}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'timeoutSeconds', Number(e.target.value))
                }
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="errorHandling" className="block text-xs font-semibold text-slate-700">
                Error Handling
              </label>
              <select
                id="errorHandling"
                value={rc.errorHandling || 'Validate All Records'}
                onChange={(e) =>
                  updateNestedField('runtimeConfig', 'errorHandling', e.target.value)
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="Validate All Records">Validate All Records</option>
                <option value="Stop on First Failure">Stop on First Failure</option>
                <option value="Sample Error Threshold">Sample Error Threshold</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor="maxErrorThreshold" className="font-semibold text-slate-700">
              Maximum Error Threshold:
            </label>
            <input
              type="number"
              id="maxErrorThreshold"
              value={rc.maxErrorThreshold || 1000}
              onChange={(e) =>
                updateNestedField('runtimeConfig', 'maxErrorThreshold', Number(e.target.value))
              }
              className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-hidden"
            />
            <span className="text-slate-500">
              {rc.thresholdNotice ||
                'records — pipeline stops if exceeded. Invalid pipeline configuration is non-recoverable.'}
            </span>
          </div>
        </div>
      </section>

      {/* 21 Monitoring Section (Collapsible) */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-21-monitoring"
      >
        <div
          onClick={() => setMonitoringOpen(!monitoringOpen)}
          className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              21
            </span>
            <h2 id="section-21-monitoring" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Monitoring
            </h2>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label="Toggle monitoring section"
          >
            {monitoringOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {monitoringOpen && (
          <div className="p-5 space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                Enabled Options
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {[
                  { key: 'enableMetrics', label: 'Enable Validation Metrics' },
                  { key: 'enableLogs', label: 'Enable Validation Logs' },
                  { key: 'trackFailedRecords', label: 'Track Failed Records' },
                  { key: 'trackRulePerformance', label: 'Track Rule Performance' },
                  { key: 'trackDataQualityScore', label: 'Track Data Quality Score' },
                  { key: 'alertOnValidationFailure', label: 'Alert on Validation Failure' },
                  { key: 'alertOnQualityThreshold', label: 'Alert on Quality Threshold' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mc[item.key] ?? false}
                      onChange={() => toggleMonitoringOption(item.key)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                Notification Channels
              </span>
              <div className="flex flex-wrap gap-4 text-xs">
                {[
                  { key: 'inApp', label: 'In-App' },
                  { key: 'email', label: 'Email' },
                  { key: 'webhook', label: 'Webhook' },
                  { key: 'sms', label: 'SMS (Optional)' },
                ].map((ch) => (
                  <label key={ch.key} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels[ch.key] ?? false}
                      onChange={() => toggleMonitoringChannel(ch.key)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{ch.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 22 Advanced Configuration (Collapsible) */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-22-advanced-config"
      >
        <div
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              22
            </span>
            <h2 id="section-22-advanced-config" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Advanced Configuration
            </h2>
            <span className="text-[11px] text-slate-500 font-sans">
              — Runtime vars, custom expressions, quality thresholds
            </span>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label="Toggle advanced configuration section"
          >
            {advancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {advancedOpen && (
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="customEngineArgs" className="block text-xs font-semibold text-slate-700">
                  Custom Spark / Engine Arguments
                </label>
                <input
                  type="text"
                  id="customEngineArgs"
                  value={ac.customEngineArgs || ''}
                  onChange={(e) =>
                    updateNestedField('advancedConfig', 'customEngineArgs', e.target.value)
                  }
                  className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tempSpillPath" className="block text-xs font-semibold text-slate-700">
                  Temporary Spill Path
                </label>
                <input
                  type="text"
                  id="tempSpillPath"
                  value={ac.tempSpillPath || ''}
                  onChange={(e) =>
                    updateNestedField('advancedConfig', 'tempSpillPath', e.target.value)
                  }
                  className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="memoryLimitMb" className="block text-xs font-semibold text-slate-700">
                  Memory Limit (MB)
                </label>
                <input
                  type="number"
                  id="memoryLimitMb"
                  value={ac.memoryLimitMb || 8192}
                  onChange={(e) =>
                    updateNestedField('advancedConfig', 'memoryLimitMb', Number(e.target.value))
                  }
                  className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="qualityThresholds" className="block text-xs font-semibold text-slate-700">
                  Quality Threshold Expressions
                </label>
                <input
                  type="text"
                  id="qualityThresholds"
                  value={ac.qualityThresholds || ''}
                  onChange={(e) =>
                    updateNestedField('advancedConfig', 'qualityThresholds', e.target.value)
                  }
                  className="w-full px-3 py-1.5 font-mono text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
