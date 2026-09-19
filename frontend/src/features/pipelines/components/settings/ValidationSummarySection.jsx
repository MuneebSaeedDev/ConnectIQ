import React from 'react';
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function ValidationSummarySection({ validation }) {
  if (!validation || (!validation.errors && !validation.warnings)) {
    return null;
  }

  const errors = Object.values(validation.errors || {});
  const warnings = validation.warnings || [];

  if (errors.length === 0 && warnings.length === 0) {
    return (
       <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 mt-8">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
             <h3 className="text-sm font-semibold text-emerald-900">Configuration Validated</h3>
             <p className="text-xs text-emerald-700">All execution resources, alert triggers, and policies adhere to enterprise thresholds.</p>
          </div>
       </div>
    );
  }

  return (
    <div className={`mt-8 border rounded-lg p-5 ${errors.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className={`size-5 ${errors.length > 0 ? 'text-rose-600' : 'text-amber-600'}`} />
        <h3 className={`text-sm font-semibold ${errors.length > 0 ? 'text-rose-900' : 'text-amber-900'}`}>
          Review Required Before Saving
        </h3>
      </div>

      <div className="space-y-4 ml-7">
        {(errors.length > 0) && (
          <div className="space-y-1">
             <h4 className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Errors ({errors.length})</h4>
             <ul className="space-y-1 list-disc list-inside">
               {errors.map((err, i) => (
                 <li key={`e-${i}`} className="text-xs text-rose-700 font-medium">{err}</li>
               ))}
             </ul>
          </div>
        )}

        {(warnings.length > 0) && (
          <div className="space-y-1">
             <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Warnings ({warnings.length})</h4>
             <ul className="space-y-1 list-disc list-inside">
               {warnings.map((warn, i) => (
                 <li key={`w-${i}`} className="text-xs text-amber-700">{warn}</li>
               ))}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
}
