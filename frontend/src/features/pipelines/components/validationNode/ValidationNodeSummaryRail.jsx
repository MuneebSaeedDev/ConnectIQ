import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function ValidationNodeSummaryRail({
  form,
  onRunTest,
  isTesting,
}) {
  const rules = form.rules || [];
  const activeRules = rules.filter((r) => r.active !== false).length;
  const disabledRules = rules.filter((r) => r.active === false).length;
  const errorCount = rules.filter((r) => r.severity === 'Error').length;
  const warningCount = rules.filter((r) => r.severity === 'Warning').length;

  const testResults = form.validationTest?.lastExecution || {};
  const dq = form.dataQualityMetrics || {};

  return (
    <aside
      className="space-y-4 text-xs"
      aria-label="Validation Node Summary Rail"
    >
      {/* Live Node Status Card matching Figma 221:7477 */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
            Validation Summary
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="size-2.5" /> 8 passed
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="size-2.5" /> 1 warning
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <XCircle className="size-2.5" /> 2 errors
            </span>
          </div>
        </div>

        {/* Live checklist items matching Figma right rail */}
        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-2 bg-rose-50/70 border border-rose-200 rounded flex items-start gap-2">
            <XCircle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900 block">ERROR · email_not_null</span>
              <span className="text-[10px] text-rose-700 font-sans block">
                email IS NULL — required field not populated.
              </span>
            </div>
          </div>

          <div className="p-2 bg-rose-50/70 border border-rose-200 rounded flex items-start gap-2">
            <XCircle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900 block">ERROR · status_enum_check</span>
              <span className="text-[10px] text-rose-700 font-sans block">
                'DELETED' is not a valid status enum value.
              </span>
            </div>
          </div>

          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block">WARN · balance_range</span>
              <span className="text-[10px] text-amber-700 font-sans block">
                balance_usd 99999.99 near upper bound of range.
              </span>
            </div>
          </div>

          <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block">PASS · required_customer_id</span>
              <span className="text-[10px] text-emerald-700 font-sans block">
                IS NOT NULL check passed for all sampled records.
              </span>
            </div>
          </div>

          <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block">PASS · id_positive</span>
              <span className="text-[10px] text-emerald-700 font-sans block">
                All customer IDs &gt; 0 confirmed.
              </span>
            </div>
          </div>

          <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded flex items-start gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block">PASS · date_not_future</span>
              <span className="text-[10px] text-emerald-700 font-sans block">
                All dates are on or before today.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-3">
        <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide pb-2 border-b border-slate-200">
          Node Summary
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Configuration Status</span>
            <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
              {form.status || 'Draft'}
            </span>
          </div>
          <p className="text-[11px] text-rose-600 leading-tight">
            2 errors must be resolved before applying.
          </p>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-700 block">Rule Summary</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Total Rules</span>
              <strong className="font-mono text-slate-800">{rules.length || 12}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Active Rules</span>
              <strong className="font-mono text-emerald-700">{activeRules || 10}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Disabled Rules</span>
              <strong className="font-mono text-slate-500">{disabledRules || 2}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Errors</span>
              <strong className="font-mono text-rose-600">{errorCount || 2}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Warnings</span>
              <strong className="font-mono text-amber-600">{warningCount || 1}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality & Coverage Summary */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-3">
        <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide pb-2 border-b border-slate-200">
          Data Quality
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Quality Score</span>
            <strong className="text-base font-bold font-mono text-blue-700">
              {dq.qualityScore || 87.3}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Records Checked</span>
            <strong className="font-mono text-slate-800">4,200,000</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Valid</span>
            <strong className="font-mono text-emerald-700">4,175,203</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Invalid</span>
            <strong className="font-mono text-rose-600">24,797</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Warning</span>
            <strong className="font-mono text-amber-600">1,241</strong>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-700 block mb-1">
              Validation Coverage
            </span>
            {['Required Fields', 'Data Types', 'Business Rules', 'Duplicate Checks', 'Referential Checks'].map((item) => (
              <div key={item} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{item}</span>
                <CheckCircle2 className="size-3 text-emerald-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last Test Summary */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
            Last Test
          </h3>
          <span className="font-mono text-xs font-bold text-rose-600">
            {testResults.status || 'FAILED'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-sans">Records Tested</span>
            <strong className="text-slate-800">25</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-sans">Failed Records</span>
            <strong className="text-rose-600">4</strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-sans">Test Time</span>
            <strong className="text-slate-800">0.84ms</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunTest}
          disabled={isTesting}
          className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`size-3 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Running test…' : '↻ Re-run Test'}
        </button>
      </div>

      {/* Security & Node Identity Badge */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-500 space-y-1">
        <div>Node ID: <strong className="text-slate-800">{form.nodeId || 'val_node_0052'}</strong></div>
        <div>Pipeline: <strong className="text-slate-800">{form.pipelineDisplay || 'customer-etl-v2'}</strong></div>
        <div>Stage: <strong className="text-slate-800">4 of 7</strong></div>
      </div>
    </aside>
  );
}
