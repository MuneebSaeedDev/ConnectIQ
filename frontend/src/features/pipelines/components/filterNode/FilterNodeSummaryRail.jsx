import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function FilterNodeSummaryRail({
  form = {},
  validationSummary = {},
}) {
  const nodeSum = form.nodeSummary || {};
  const rulesCount = form.basicRules?.rules?.length || 3;
  const filterModeLabel =
    form.filterMode === 'basic'
      ? 'Basic Filter'
      : form.filterMode === 'advanced'
      ? 'Advanced Expression'
      : form.filterMode === 'sql'
      ? 'SQL WHERE Clause'
      : 'Custom Script';

  const passRate = nodeSum.passRate || '35.2%';
  const passRateNum = parseFloat(passRate) || 35.2;

  return (
    <aside
      className="w-full xl:w-72 shrink-0 space-y-4"
      aria-labelledby="aside-node-summary"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header matching Figma 157:4348 */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200">
          <h2 id="aside-node-summary" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Node Summary
          </h2>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Configuration Status matching Figma 157:4352 */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Configuration Status
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {nodeSum.configurationStatus || 'Configured'}
            </span>
          </div>

          {/* Filter Summary matching Figma 157:4358 */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
              Filter Summary
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Filter Mode</span>
                <span className="font-semibold text-slate-800">{filterModeLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Rules</span>
                <span className="font-mono font-semibold text-slate-800">{rulesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Condition Groups</span>
                <span className="font-semibold text-slate-800">
                  {form.basicRules?.notGroup ? '1 (NOT)' : `1 (${form.basicRules?.logic || 'AND'})`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Functions</span>
                <span className="font-mono font-semibold text-slate-800">0</span>
              </div>
            </div>
          </div>

          {/* Data Impact matching Figma 157:4382 */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Data Impact</span>
              <BarChart3 className="size-3 text-slate-400" />
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Input Records</span>
                <span className="font-mono font-semibold text-slate-800">{form.inputDataset?.estimatedRecords || '4,218,902'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Est. Output Records</span>
                <span className="font-mono font-semibold text-emerald-700">{nodeSum.estOutputRecords || '~1,486,702'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Filter Percentage</span>
                <span className="font-mono font-bold text-blue-700">{nodeSum.filterPercentage || '35.2%'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Est. Processing</span>
                <span className="font-mono font-semibold text-slate-800">{nodeSum.estProcessing || '4m 12s'}</span>
              </div>
            </div>

            {/* Pass Rate Progress Bar matching Figma 157:4407 */}
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Pass rate</span>
                <span className="font-mono font-bold text-slate-800">{passRate}</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={passRateNum}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Filter pass rate"
                className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${passRateNum}%` }}
                />
              </div>
            </div>
          </div>

          {/* Runtime Summary matching Figma 157:4414 */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
              Runtime Summary
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Parallelism</span>
                <span className="font-mono font-semibold text-slate-800">
                  {form.runtimeConfig?.parallelism || 8} threads
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timeout</span>
                <span className="font-mono font-semibold text-slate-800">
                  {form.runtimeConfig?.timeoutSeconds || 300}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Retry Policy</span>
                <span className="font-semibold text-slate-800">{nodeSum.retryPolicy || '3× exp. backoff'}</span>
              </div>
            </div>
          </div>

          {/* Validation Summary matching Figma 157:4433 */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
              Validation Summary
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-emerald-50/70 border border-emerald-200">
                <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Passed
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {validationSummary.passed ?? 3}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-md bg-amber-50/70 border border-amber-200">
                <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Warnings
                </span>
                <span className="font-mono font-bold text-amber-700">
                  {validationSummary.warnings ?? 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-md bg-rose-50/70 border border-rose-200">
                <span className="flex items-center gap-1.5 text-rose-800 font-medium">
                  <span className="size-2 rounded-full bg-rose-500" />
                  Errors
                </span>
                <span className="font-mono font-bold text-rose-700">
                  {validationSummary.errors ?? 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
