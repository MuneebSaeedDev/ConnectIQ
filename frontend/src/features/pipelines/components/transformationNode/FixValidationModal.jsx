import React from 'react';
import { Wrench, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function FixValidationModal({
  isOpen,
  valItem = null,
  onClose,
  onApplyFix,
}) {
  if (!isOpen || !valItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Resolve Validation Issue</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <span>{valItem.target}</span>
              <span className="text-[10px] uppercase font-bold text-rose-600">[{valItem.severity}]</span>
            </div>
            <p className="text-xs text-slate-600">{valItem.description}</p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <span className="text-xs font-bold text-blue-900 block">Recommended Action:</span>
            <div className="flex items-start gap-2 text-xs text-blue-800">
              <ArrowRight className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{valItem.resolution}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApplyFix(valItem.id, 'Recommended Auto-Fix')}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
          >
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
}
