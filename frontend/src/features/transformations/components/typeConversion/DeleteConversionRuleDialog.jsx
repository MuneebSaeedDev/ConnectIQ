import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const DeleteConversionRuleDialog = ({ isOpen, onClose, onConfirm, rule }) => {
  if (!isOpen || !rule) return null;

  const isInUse = rule.pipelineUsage > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Delete Conversion Rule</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete the type conversion rule <span className="font-semibold text-slate-900">"{rule.ruleName}"</span>?
          </p>

          {isInUse && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-semibold text-amber-800">Warning: Rule is currently in use</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    This conversion rule is actively used in <span className="font-bold">{rule.pipelineUsage} pipeline{rule.pipelineUsage !== 1 ? 's' : ''}</span>. Deleting it will cause these pipelines to fail during execution if they depend on this specific rule.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            This action cannot be undone. All configuration tied to this rule will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Yes, Delete Rule
          </button>
        </div>
      </div>
    </div>
  );
};
