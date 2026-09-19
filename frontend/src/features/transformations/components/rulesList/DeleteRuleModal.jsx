import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteRuleModal({ isOpen, rule, onClose, onConfirm, isDeleting }) {
  if (!isOpen || !rule) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-xl z-50 overflow-hidden outline-none border border-slate-200">
        
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Delete Rule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm text-slate-700">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{rule.name}</span>?
            <div className="mt-2 text-xs text-rose-700 bg-rose-50/50 p-2 rounded border border-rose-100">
              <span className="font-semibold">Warning:</span> If this rule is used in active pipelines, those pipelines may fail or behave incorrectly.
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700 transition-colors shadow-xs focus:ring-2 focus:ring-offset-1 focus:ring-rose-500 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Delete Rule
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
