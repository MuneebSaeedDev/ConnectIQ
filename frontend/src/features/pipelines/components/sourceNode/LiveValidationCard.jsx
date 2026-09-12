import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function LiveValidationCard({
  form,
  validationSummary,
  onReRunValidation,
}) {
  const validations = form.validations || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="live-validation-heading">
      {/* Header with summary counters and Re-run */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 id="live-validation-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Live Validation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time configuration checks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {validationSummary.passed} passed
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {validationSummary.warning} warning
          </span>
          {validationSummary.pending > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="size-1.5 rounded-full bg-slate-400" />
              {validationSummary.pending} pending
            </span>
          )}

          <button
            type="button"
            onClick={onReRunValidation}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <RotateCcw className="size-3 text-slate-500" />
            Re-run
          </button>
        </div>
      </div>

      {/* Validation Checklist Items matching Figma node 155:3313 */}
      <div className="mt-4 space-y-2.5">
        {validations.map((item) => {
          const isPassed = item.status === 'passed';
          const isWarning = item.status === 'warning';
          const isPending = item.status === 'pending';
          const isFailed = item.status === 'failed';

          return (
            <div
              key={item.id}
              className={`p-3 rounded-md border transition-all ${
                isWarning
                  ? 'border-amber-200 bg-amber-50/20'
                  : isFailed
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isPassed && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {isWarning && <AlertTriangle className="size-4 text-amber-600" />}
                  {isPending && <Clock className="size-4 text-slate-400" />}
                  {isFailed && <AlertCircle className="size-4 text-rose-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isPassed
                          ? 'text-emerald-700 bg-emerald-50'
                          : isWarning
                          ? 'text-amber-700 bg-amber-50'
                          : isFailed
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                    {item.message}
                  </p>

                  {item.note && (
                    <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded px-2.5 py-1 mt-1.5 leading-snug flex items-center gap-1.5">
                      <Info className="size-3.5 text-amber-700 shrink-0" />
                      <span>{item.note}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
