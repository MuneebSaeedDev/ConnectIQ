import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DiscardChangesModal({
  isOpen,
  onClose,
  onConfirm,
  unsavedCount = 1,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="size-4 text-amber-600" />
            <h3 id="discard-modal-title" className="text-sm font-bold">
              Discard Unsaved Changes?
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

        <div className="p-5 space-y-3 text-xs text-slate-600">
          <p>
            You have <strong>{unsavedCount} unsaved change{unsavedCount !== 1 ? 's' : ''}</strong> on this filter node configuration.
          </p>
          <p>
            If you leave now, your modifications to filtering rules and runtime parameters will be lost.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition shadow-xs"
            >
              Discard &amp; Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
