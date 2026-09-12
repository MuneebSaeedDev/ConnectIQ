import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ValidationSummaryRail({
  form,
  onRunTest,
  isTesting,
  onOpenFix,
}) {
  const rules = form.rules || [];
  const activeRules = rules.filter((r) => r.active !== false).length;
  const disabledRules = rules.filter((r) => r.active === false).length;
  const errorsCount = rules.filter((r) => r.severity === 'Error' && r.status === 'Fail').length || 2;
  const warningsCount = rules.filter((r) => r.severity === 'Warning' || r.status === 'Warn').length || 1;
  const passedCount = rules.filter((r) => r.status === 'Pass').length || 8;

  const testExec = form.validationTest?.lastExecution || {};
  const isFailed = testExec.status === 'FAILED';

  return (
    <aside className="w-full xl:w-80 space-y-4 shrink-0" aria-label="Validation Node Summary">
      {/* 1. Live Validation Status Card matching Figma 221:7477 */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Validation Status
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            {passedCount} passed · {warningsCount} warn · {errorsCount} err
          </span>
        </div>

        <div className="p-4 space-y-3 text-xs">
          {/* Active / Warning / Error list items with fix buttons */}
          <div className="space-y-2">
            <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <div>
                    <span className="font-mono font-bold text-rose-900 text-[11px] block">
                      email_not_null
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      email IS NULL — required field not populated.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <div>
                    <span className="font-mono font-bold text-rose-900 text-[11px] block">
                      status_enum_check
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      &apos;DELETED&apos; is not a valid status enum value.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">!</span>
                  <div>
                    <span className="font-mono font-bold text-amber-900 text-[11px] block">
                      balance_range
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      balance_usd 99999.99 near upper bound of range.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-md text-[11px]">
              <div className="flex items-start gap-1.5 text-emerald-800">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong className="font-mono block">required_customer_id</strong>
                  <span className="text-slate-500">IS NOT NULL check passed for all sampled records.</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-md text-[11px]">
              <div className="flex items-start gap-1.5 text-emerald-800">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong className="font-mono block">id_positive</strong>
                  <span className="text-slate-500">All customer IDs &gt; 0 confirmed.</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-md text-[11px]">
              <div className="flex items-start gap-1.5 text-emerald-800">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong className="font-mono block">date_not_future</strong>
                  <span className="text-slate-500">All dates are on or before today.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Node Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Node Summary
          </h3>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Configuration Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                ● {form.status || 'Draft'}
              </span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1 font-medium">
              2 errors must be resolved before applying.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
              Rule Summary
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Total Rules</span>
                <strong className="text-slate-900">{rules.length || 12}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Active Rules</span>
                <strong className="text-emerald-700">{activeRules || 10}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Disabled Rules</span>
                <strong className="text-slate-500">{disabledRules || 2}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Errors</span>
                <strong className="text-rose-600">{errorsCount}</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
              Data Quality
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Quality Score</span>
                <strong className="text-blue-700">{form.dataQualityMetrics?.qualityScore || 87.3}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Records Checked</span>
                <span>4,200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Valid</span>
                <span className="text-emerald-700 font-bold">4,175,203</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Invalid</span>
                <span className="text-rose-600 font-bold">24,797</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Warning</span>
                <span className="text-amber-700 font-bold">1,241</span>
              </div>
            </div>
          </div>

          {/* Validation Coverage Checklist */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
              Validation Coverage
            </span>
            <div className="space-y-1 text-xs">
              {[
                'Required Fields',
                'Data Types',
                'Business Rules',
                'Duplicate Checks',
                'Referential Checks',
              ].map((cov) => (
                <div key={cov} className="flex items-center justify-between text-slate-700">
                  <span>{cov}</span>
                  <span className="text-emerald-600 font-bold">✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Test Summary */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Last Test
              </span>
              <button
                type="button"
                onClick={onRunTest}
                disabled={isTesting}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-2.5" />
                Re-run Test
              </button>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Status</span>
                <span className="font-bold text-rose-600">{testExec.status || 'FAILED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Records Tested</span>
                <span>25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Failed Records</span>
                <span className="text-rose-600 font-bold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Test Time</span>
                <span>{testExec.execTime || '0.84ms'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
