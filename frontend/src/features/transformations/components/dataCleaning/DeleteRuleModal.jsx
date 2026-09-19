import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteRuleModal({
  isOpen,
  rule,
  isDeleting,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
              <Trash2 className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-base leading-6 font-semibold text-slate-900" id="modal-title">
                Delete Cleaning Rule
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete the rule <span className="font-semibold text-slate-900">{rule.name}</span>?
                  This action cannot be undone.
                </p>
                {rule.pipelinesCount > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <strong>Warning:</strong> This rule is currently used in <strong>{rule.pipelinesCount} active pipeline(s)</strong>.
                      Deleting it will cause the corresponding pipeline cleaning nodes to fail or fall back to bypass mode.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
            <button
              type="button"
              disabled={isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-xs px-4 py-2 bg-rose-600 text-base font-medium text-white hover:bg-rose-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              onClick={onConfirm}
            >
              {isDeleting ? 'Deleting...' : 'Delete Rule'}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-xs px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
