import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DiscardChangesModal({
  isOpen,
  onClose,
  onConfirmDiscard,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-changes-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="p-5 text-center space-y-3">
          <div className="size-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-5" />
          </div>
          <h3 id="discard-changes-modal-title" className="text-sm font-bold text-slate-900">
            Discard Unsaved Changes?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have unsaved changes in this mapping node configuration. Leaving now will discard all edits made since your last save.
          </p>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirmDiscard}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-sm"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
