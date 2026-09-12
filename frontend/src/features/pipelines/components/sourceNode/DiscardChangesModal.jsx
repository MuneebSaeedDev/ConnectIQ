import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DiscardChangesModal({
  isOpen,
  onClose,
  onConfirmDiscard,
  unsavedChangesCount,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-changes-title"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="size-5" />
            <h3 id="discard-changes-title" className="text-sm font-bold text-slate-900">
              Discard Unsaved Changes?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            You have <span className="font-semibold text-slate-900">{unsavedChangesCount}</span> unsaved {unsavedChangesCount === 1 ? 'change' : 'changes'} in this source node configuration. Leaving now will discard all modified extraction, schema, and runtime settings.
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirmDiscard}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
