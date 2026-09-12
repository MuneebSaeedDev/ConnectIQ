import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DiscardChangesModal({
  isOpen,
  onClose,
  onDiscard,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <h3 id="discard-modal-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Discard Unsaved Changes?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            You have unsaved changes in this validation node configuration. Discarding will revert all edits back to the last saved state.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition cursor-pointer shadow-xs"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
