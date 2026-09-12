import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DiscardChangesModal({
  isOpen,
  unsavedCount = 1,
  onClose,
  onConfirmDiscard,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Discard Unsaved Changes?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            You have <strong className="text-slate-900">{unsavedCount} unsaved modification{unsavedCount > 1 ? 's' : ''}</strong> in this transformation node configuration. If you navigate away, all uncommitted changes will be permanently discarded.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              Keep Editing
            </button>
            <button
              type="button"
              onClick={onConfirmDiscard}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
