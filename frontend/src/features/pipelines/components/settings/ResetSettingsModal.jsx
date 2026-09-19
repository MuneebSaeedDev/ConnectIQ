import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

export default function ResetSettingsModal({
  isOpen,
  onClose,
  onConfirmReset,
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
      aria-labelledby="reset-settings-title"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-700">
            <RotateCcw className="size-5 text-slate-600" />
            <h3 id="reset-settings-title" className="text-sm font-bold text-slate-900">
              Reset to Last Saved Configuration?
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
            Are you sure you want to reset all pipeline settings? This will revert any modified fields across all tabs back to the last saved state.
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-xs transition-colors"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
}
