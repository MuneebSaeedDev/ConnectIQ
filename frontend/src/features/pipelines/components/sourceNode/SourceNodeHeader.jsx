import React from 'react';
import {
  RotateCcw,
  Copy,
  Activity,
  Check,
  Clock,
} from 'lucide-react';

export default function SourceNodeHeader({
  nodeName,
  isDirty,
  unsavedChangesCount,
  onCancel,
  onReset,
  onDuplicate,
  onTestConnection,
  onSave,
  isSaving,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Source Node Configuration
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Draft
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure source connectivity, extraction settings, schema selection, and runtime behavior.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {isDirty && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
              role="status"
              aria-live="polite"
            >
              <Clock className="size-3.5 text-amber-600" />
              {unsavedChangesCount} Unsaved {unsavedChangesCount === 1 ? 'change' : 'changes'}
            </span>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            title={isDirty ? 'Reset form to baseline' : 'No changes to reset'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Reset
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <Copy className="size-3.5 text-slate-500" />
            Duplicate Node
          </button>

          <button
            type="button"
            onClick={onTestConnection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <Activity className="size-3.5 text-blue-600" />
            Test Connection
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !nodeName?.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
          >
            <Check className="size-4" />
            {isSaving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </header>
  );
}
