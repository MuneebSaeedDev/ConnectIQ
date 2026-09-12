import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

export default function ValidationSection({
  validation = {},
  onOpenFix,
}) {
  const items = validation.items || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Validation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Continuous configuration validation</p>
      </div>

      <div className="p-4 space-y-3">
        {items.map((item) => {
          let icon = null;
          let borderColor = 'border-slate-200';
          let bgColor = 'bg-white';

          if (item.severity === 'Error') {
            icon = <XCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />;
            borderColor = 'border-rose-200';
            bgColor = 'bg-rose-50/40';
          } else if (item.severity === 'Warning') {
            icon = <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />;
            borderColor = 'border-amber-200';
            bgColor = 'bg-amber-50/40';
          } else if (item.severity === 'Info') {
            icon = <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />;
            borderColor = 'border-blue-200';
            bgColor = 'bg-blue-50/40';
          } else {
            icon = <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />;
            borderColor = 'border-emerald-200';
            bgColor = 'bg-emerald-50/40';
          }

          return (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${borderColor} ${bgColor} transition`}
            >
              <div className="flex items-start gap-2.5">
                {icon}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.target}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  {item.action && (
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>↳</span>
                      <span>{item.action}</span>
                    </div>
                  )}
                </div>
              </div>

              {item.fixable && (
                <button
                  type="button"
                  onClick={() => onOpenFix(item)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 transition shrink-0 shadow-2xs"
                >
                  <Wrench className="size-2.5" />
                  Fix Recommendation
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
