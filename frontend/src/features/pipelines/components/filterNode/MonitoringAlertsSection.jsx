import React from 'react';
import { Bell, ChevronDown, ChevronRight, Activity, Mail, MessageSquare, Radio } from 'lucide-react';

export default function MonitoringAlertsSection({
  monitoring = {},
  updateNestedField,
  toggleMonitoringChannel,
  isOpen,
  onToggleOpen,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-monitoring"
    >
      <button
        type="button"
        id="section-monitoring"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className="w-full px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Monitoring &amp; Alerts
          </h2>
          <span className="text-[11px] text-slate-500 font-normal ml-2">
            Execution telemetry, anomaly alerts, and notification channels
          </span>
        </div>
        {isOpen ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <label className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold text-slate-800">Record Throughput</span>
              <input
                type="checkbox"
                checked={monitoring.enableMetrics ?? true}
                onChange={(e) => updateNestedField('monitoring', 'enableMetrics', e.target.checked)}
                className="size-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold text-slate-800">Detailed Logs</span>
              <input
                type="checkbox"
                checked={monitoring.enableLogs ?? true}
                onChange={(e) => updateNestedField('monitoring', 'enableLogs', e.target.checked)}
                className="size-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold text-slate-800">Anomaly Alerts</span>
              <input
                type="checkbox"
                checked={monitoring.enableAlerts ?? true}
                onChange={(e) => updateNestedField('monitoring', 'enableAlerts', e.target.checked)}
                className="size-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-semibold text-slate-800">CPU/Memory Profiling</span>
              <input
                type="checkbox"
                checked={monitoring.enableProfiling ?? false}
                onChange={(e) => updateNestedField('monitoring', 'enableProfiling', e.target.checked)}
                className="size-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="block text-xs font-semibold text-slate-700">Notification Channels</span>
            <div className="flex items-center flex-wrap gap-3">
              {[
                { key: 'email', label: 'Email (data-eng-team@acme.io)', icon: Mail },
                { key: 'slack', label: 'Slack (#pipeline-alerts)', icon: MessageSquare },
                { key: 'teams', label: 'Microsoft Teams', icon: Radio },
                { key: 'webhook', label: 'Custom PagerDuty Webhook', icon: Activity },
              ].map((ch) => {
                const Icon = ch.icon;
                const isChecked = !!monitoring.channels?.[ch.key];
                return (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => toggleMonitoringChannel(ch.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                      isChecked
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
