import React from 'react';
import { Activity, Bell, ShieldAlert, Check } from 'lucide-react';

export default function MonitoringSection({
  monitoring = {},
  onToggleOption,
}) {
  const telemetry = monitoring.telemetry || {};

  const toggleOptions = [
    { key: 'enableMetrics', label: 'Enable Transformation Metrics' },
    { key: 'enableLogs', label: 'Enable Transformation Logs' },
    { key: 'trackErrors', label: 'Track Transformation Errors' },
    { key: 'trackRejected', label: 'Track Rejected Records' },
    { key: 'trackDuration', label: 'Track Processing Time' },
    { key: 'alertOnErrorRate', label: 'Alert on High Error Rate' },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Monitoring</h2>
        <p className="text-xs text-slate-500 mt-0.5">Operational visibility and alerting</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle options grid matching Figma 220:7027 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {toggleOptions.map((opt) => {
            const isChecked = !!monitoring[opt.key];

            return (
              <label
                key={opt.key}
                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleOption(opt.key)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4"
                />
                <span className="text-xs font-medium text-slate-800">{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Real-time Telemetry Stats Grid matching Figma 220:7058 - 220:7088 */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">
            Live Execution Telemetry
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Records Processed</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.recordsProcessed || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Records Transformed</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.recordsTransformed || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Records Rejected</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.recordsRejected || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Transformation Errors</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.transformationErrors || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Processing Duration</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.processingDuration || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block font-medium">Throughput</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {telemetry.throughput || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
