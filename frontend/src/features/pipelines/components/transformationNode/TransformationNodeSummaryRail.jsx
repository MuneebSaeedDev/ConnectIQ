import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function TransformationNodeSummaryRail({
  form = {},
  summaries = {},
}) {
  return (
    <aside className="w-full xl:w-56 shrink-0 space-y-3">
      {/* 1. Configuration Status Card matching Figma 220:7099 */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Configuration Status
        </h3>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
              form.status === 'Draft'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                form.status === 'Draft' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {form.status}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Not yet saved</span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Validation</span>
            <span className="font-bold text-slate-900">{summaries.validationPercent || 60}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${summaries.validationPercent || 60}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Transformation Summary Card matching Figma 220:7117 */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Transformation Summary
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total Rules</span>
            <span className="font-bold text-slate-900 font-mono">{summaries.totalRules || 5}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Active Rules</span>
            <span className="font-bold text-emerald-700 font-mono">{summaries.activeRules || 4}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Disabled Rules</span>
            <span className="font-bold text-slate-500 font-mono">{summaries.disabledRules || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Fields Transformed</span>
            <span className="font-bold text-blue-700 font-mono">{summaries.fieldsTransformed || 5}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Type Conversions</span>
            <span className="font-bold text-slate-800 font-mono">{summaries.typeConversions || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Cleaning Ops</span>
            <span className="font-bold text-slate-800 font-mono">{summaries.cleaningOps || 2}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lookup Ops</span>
            <span className="font-bold text-slate-800 font-mono">{summaries.lookupOps || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Expression Rules</span>
            <span className="font-bold text-slate-800 font-mono">{summaries.expressionOps || 1}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-rose-600 font-medium">Validation Errors</span>
            <span className="font-bold text-rose-700 font-mono">{summaries.validationErrors || 1}</span>
          </div>
        </div>
      </div>

      {/* 3. Operation Breakdown Card matching Figma 220:7167 */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Operation Breakdown
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Cleaning</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.cleaningOps || 2}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Type Conversion</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.typeConversions || 1}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Date Formatting</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.dateFormattingOps || 1}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Deduplication</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.deduplicationOps || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Lookup</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.lookupOps || 1}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Expressions</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {summaries.expressionOps || 1}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Test Summary Card matching Figma 220:7219 */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Test Summary
        </h3>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200">
            <span className="text-sm font-bold text-emerald-800 block font-mono">
              {summaries.testPassed || 3}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Passed</span>
          </div>
          <div className="p-1.5 bg-rose-50 rounded border border-rose-200">
            <span className="text-sm font-bold text-rose-800 block font-mono">
              {summaries.testFailed || 1}
            </span>
            <span className="text-[10px] text-rose-700 font-medium">Failed</span>
          </div>
          <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-sm font-bold text-slate-700 block font-mono">
              {summaries.testWarn || 0}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Warn</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center pt-1">Last test: 2 min ago</p>
      </div>

      {/* 5. Validation Summary Card matching Figma 220:7242 */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Validation Summary
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Passed
            </span>
            <span className="font-bold font-mono">{summaries.validationPassed || 3}</span>
          </div>
          <div className="flex items-center justify-between text-amber-700 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-amber-500" />
              Warnings
            </span>
            <span className="font-bold font-mono">{summaries.validationWarnings || 1}</span>
          </div>
          <div className="flex items-center justify-between text-rose-700 font-medium">
            <span className="flex items-center gap-1.5">
              <XCircle className="size-3.5 text-rose-600" />
              Errors
            </span>
            <span className="font-bold font-mono">{summaries.validationErrors || 1}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
