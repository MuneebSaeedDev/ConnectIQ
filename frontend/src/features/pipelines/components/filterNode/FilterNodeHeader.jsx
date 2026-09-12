import React from 'react';
import {
  RotateCcw,
  Copy,
  X,
  CheckCircle,
  Save,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export default function FilterNodeHeader({
  nodeName: _nodeName,
  isDirty,
  unsavedChangesCount,
  onReset,
  onDuplicate,
  onCancel,
  onValidate,
  onSave,
  isSaving,
  isValidating,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="px-6 py-3">
        {/* Breadcrumb matching Figma 157:3695 */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <span className="hover:text-slate-800 transition">Pipeline Builder</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="hover:text-slate-800 transition">Filter Node</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">Configuration</span>
        </nav>

        {/* Title & Action Toolbar matching Figma 157:3701 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Filter Node Configuration
              </h1>
              {/* Status Pill matching Figma 157:3706 */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Configured
              </span>

              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {unsavedChangesCount} unsaved change{unsavedChangesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Configure filtering rules to determine which records continue through the pipeline.
            </p>
          </div>

          {/* Action Buttons matching Figma 157:3711 */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset to last saved configuration"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Reset
            </button>

            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
              title="Duplicate this filter node"
            >
              <Copy className="size-3.5 text-slate-500" />
              Duplicate Node
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
              title="Cancel and return to pipeline"
            >
              <X className="size-3.5 text-slate-500" />
              Cancel
            </button>

            <button
              type="button"
              onClick={onValidate}
              disabled={isValidating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition shadow-2xs"
              title="Validate filter expressions and conditions"
            >
              {isValidating ? (
                <Loader2 className="size-3.5 animate-spin text-slate-600" />
              ) : (
                <CheckCircle className="size-3.5 text-slate-600" />
              )}
              Validate Filter
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin text-white" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
