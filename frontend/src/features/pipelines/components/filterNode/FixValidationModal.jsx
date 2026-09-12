import React from 'react';
import { Wrench, X, Check, Zap, Eye } from 'lucide-react';

export default function FixValidationModal({
  isOpen,
  onClose,
  checkItem,
  onApplyFix,
}) {
  if (!isOpen || !checkItem) return null;

  const fixType = checkItem.fixAction;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fix-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-blue-50">
          <div className="flex items-center gap-2 text-blue-900">
            <Wrench className="size-4 text-blue-600" />
            <h3 id="fix-modal-title" className="text-sm font-bold">
              Automated Validation Remedy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block font-semibold text-slate-900">{checkItem.title}</span>
            <p className="text-slate-600 mt-1">{checkItem.description}</p>
          </div>

          {fixType === 'index_fix' && (
            <div className="space-y-2">
              <p className="text-slate-700 font-medium">Recommended Action:</p>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-md space-y-1 text-purple-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Zap className="size-3.5 text-purple-600" />
                  Enable Index Hinting &amp; Predicate Pushdown
                </div>
                <p className="text-[11px] text-purple-700">
                  Activates Snowflake search optimization service and passes partition key filters directly to the remote source connector.
                </p>
              </div>
            </div>
          )}

          {fixType === 'preview_fix' && (
            <div className="space-y-2">
              <p className="text-slate-700 font-medium">Recommended Action:</p>
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md space-y-1 text-blue-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Eye className="size-3.5 text-blue-600" />
                  Bound Real-time Sample Size
                </div>
                <p className="text-[11px] text-blue-700">
                  Caps interactive in-memory preview sampling to 100 records while retaining full stream throughput in production.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApplyFix(fixType)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs"
            >
              <Check className="size-3.5" />
              Apply Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
