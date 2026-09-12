import React from 'react';
import { Sparkles, RotateCcw, Copy, Zap, Save, X, AlertCircle } from 'lucide-react';

export default function TransformationNodeHeader({
  form,
  isDirty,
  unsavedChangesCount,
  isSaving,
  isTesting,
  onCancel,
  onReset,
  onDuplicate,
  onTest,
  onSave,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 shadow-xs">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Transformation Node Configuration
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  form.status === 'Configured'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                ● {form.status}
              </span>
              {isDirty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                  <AlertCircle className="size-3" />
                  {unsavedChangesCount} Unsaved Change{unsavedChangesCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Configure transformation rules, expressions, type conversions, cleaning operations, and reusable logic.
            </p>
          </div>
        </div>

        {/* Right Header Action Buttons matching Figma nodes 220:6016 - 220:6025 */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X className="size-3.5 text-slate-500" />
            Cancel
          </button>

          <button
            type="button"
            disabled={!isDirty}
            onClick={onReset}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition active:scale-98 focus:outline-none focus:ring-2 ${
              isDirty
                ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 focus:ring-slate-300'
                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <Copy className="size-3.5 text-slate-500" />
            Duplicate Node
          </button>

          <button
            type="button"
            disabled={isTesting}
            onClick={onTest}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Zap className={`size-3.5 ${isTesting ? 'animate-bounce' : 'text-amber-500'}`} />
            {isTesting ? 'Testing...' : '⚡ Test Transformation'}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg shadow-xs transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </header>
  );
}
