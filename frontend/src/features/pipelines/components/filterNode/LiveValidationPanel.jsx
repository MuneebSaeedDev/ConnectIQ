import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export default function LiveValidationPanel({
  validationSummary = {},
  onOpenFix,
}) {
  const checks = validationSummary.checks || [];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-validation-panel"
    >
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-blue-600" />
          <h2 id="section-validation-panel" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Validation Panel
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="size-3" />
            {validationSummary.passed ?? 3} Passed
          </span>
          {(validationSummary.warnings ?? 1) > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertTriangle className="size-3" />
              {validationSummary.warnings} Warning
            </span>
          )}
          {(validationSummary.errors ?? 1) > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <XCircle className="size-3" />
              {validationSummary.errors} Error
            </span>
          )}
        </div>
      </div>

      <div className="p-5 divide-y divide-slate-100">
        {checks.map((check) => {
          const isPassed = check.status === 'passed';
          const isWarning = check.status === 'warning';
          const isError = check.status === 'error';

          return (
            <div
              key={check.id}
              className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isPassed && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {isWarning && <AlertTriangle className="size-4 text-amber-500" />}
                  {isError && <XCircle className="size-4 text-rose-600" />}
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-semibold text-slate-900">{check.title}</h3>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isPassed
                        ? 'text-slate-500'
                        : isWarning
                        ? 'text-amber-800 font-medium'
                        : 'text-rose-700 font-medium'
                    }`}
                  >
                    {check.description}
                  </p>
                </div>
              </div>

              {check.fixAction && (
                <button
                  type="button"
                  onClick={() => onOpenFix(check)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 rounded-md border border-blue-200 transition shrink-0"
                >
                  Fix
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
