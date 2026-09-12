import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Info,
  Terminal,
} from 'lucide-react';

export default function BottomTelemetryPanel({
  summaries = {},
  validationItems = [],
  testResults = [],
  bottomTab = 'validation',
  onSelectTab,
  onOpenFix,
}) {
  return (
    <div className="space-y-4">
      {/* 1. Quick Stats Strip matching Figma 220:7271 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs overflow-x-auto">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 min-w-[700px] text-center divide-x divide-slate-100">
          <div className="px-2">
            <span className="text-base font-bold text-slate-900 block font-mono">{summaries.totalRules || 5}</span>
            <span className="text-[11px] text-slate-500 font-medium">Total Rules</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-emerald-700 block font-mono">{summaries.activeRules || 4}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Active Rules</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-slate-500 block font-mono">{summaries.disabledRules || 1}</span>
            <span className="text-[11px] text-slate-500 font-medium">Disabled</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-blue-700 block font-mono">{summaries.fieldsTransformed || 5}</span>
            <span className="text-[11px] text-slate-500 font-medium">Fields Transformed</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-slate-800 block font-mono">{summaries.typeConversions || 1}</span>
            <span className="text-[11px] text-slate-500 font-medium">Type Conversions</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-slate-800 block font-mono">{summaries.cleaningOps || 2}</span>
            <span className="text-[11px] text-slate-500 font-medium">Cleaning Ops</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-slate-800 block font-mono">{summaries.lookupOps || 1}</span>
            <span className="text-[11px] text-slate-500 font-medium">Lookup Ops</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-slate-800 block font-mono">{summaries.expressionOps || 1}</span>
            <span className="text-[11px] text-slate-500 font-medium">Expressions</span>
          </div>

          <div className="px-2">
            <span className="text-base font-bold text-rose-700 block font-mono">{summaries.validationErrors || 1}</span>
            <span className="text-[11px] text-rose-600 font-medium">Validation Errors</span>
          </div>
        </div>
      </div>

      {/* 2. Bottom Tabbed Diagnostics Panel matching Figma 220:7320 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectTab('validation')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                bottomTab === 'validation'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Validation ({validationItems.length})
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('tests')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                bottomTab === 'tests'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test Results ({testResults.length})
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('logs')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                bottomTab === 'logs'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logs
            </button>
          </div>
        </div>

        {/* Tab 1: Validation Table matching Figma 220:7328 */}
        {bottomTab === 'validation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Field / Rule</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Suggested Resolution</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {validationItems.map((item) => {
                  let badge = null;
                  if (item.severity === 'Error') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="size-3 text-rose-600" />
                        Error
                      </span>
                    );
                  } else if (item.severity === 'Warning') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="size-3 text-amber-600" />
                        Warning
                      </span>
                    );
                  } else {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Info className="size-3 text-blue-600" />
                        Info
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-4">{badge}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{item.target}</td>
                      <td className="py-2.5 px-4 text-slate-700">{item.description}</td>
                      <td className="py-2.5 px-4 text-slate-500">{item.resolution}</td>
                      <td className="py-2.5 px-4 text-right">
                        {item.fixable && (
                          <button
                            type="button"
                            onClick={() => onOpenFix(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition shadow-2xs"
                          >
                            Fix
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Test Results */}
        {bottomTab === 'tests' && (
          <div className="p-4 space-y-2">
            {testResults.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  {t.status === 'Passed' ? (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-rose-600 shrink-0" />
                  )}
                  <span className="text-slate-800">{t.testInput}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-blue-700">{t.actualOutput}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-sans">{t.duration}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Logs */}
        {bottomTab === 'logs' && (
          <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs space-y-1.5 rounded-b">
            <p className="text-slate-500">[2026-08-07 14:20:01] [INFO] Transformation compiler initialized v1.0.0</p>
            <p className="text-slate-300">[2026-08-07 14:20:02] [INFO] Loaded input schema orders_filtered (14 columns)</p>
            <p className="text-emerald-400">[2026-08-07 14:20:03] [SUCCESS] Rule #1 email normalize case validated</p>
            <p className="text-emerald-400">[2026-08-07 14:20:03] [SUCCESS] Rule #2 total_amount typecast String → Decimal</p>
            <p className="text-amber-400">[2026-08-07 14:20:04] [WARN] Rule #4 customer_id is disabled (no effect)</p>
            <p className="text-rose-400">[2026-08-07 14:20:05] [ERROR] Rule #5 lookup table status_map_v2 returned 404 NOT_FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
