import React from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Copy,
  Play,
  Save,
  ChevronRight,
} from 'lucide-react';

export default function ValidationNodeHeader({
  form,
  isDirty,
  unsavedChangesCount,
  isSaving,
  isTesting,
  isValidating,
  onCancel,
  onReset,
  onDuplicate,
  onRunTest,
  onSave,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      {/* Top Breadcrumb row */}
      <div className="px-6 py-2 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-medium">
          <span className="text-slate-600 hover:text-slate-900 cursor-pointer">Pipeline Builder</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-600 hover:text-slate-900 cursor-pointer font-mono">
            {form.pipelineId || 'customer-etl-pipeline'}
          </span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-600 hover:text-slate-900 cursor-pointer">Validation Node</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">Configuration</span>
        </nav>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-mono text-slate-500">
            Pipeline: <strong className="text-slate-700">{form.pipelineDisplay || form.pipelineId}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500">
            Stage <strong className="text-slate-700">{form.stageNumber || 4} of {form.stageTotal || 7}</strong>
          </span>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Validation Node Configuration
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                ● {form.status || 'Draft'}
              </span>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                v{form.version || '1.2.0'}
              </span>
              {isDirty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                  Unsaved changes ({unsavedChangesCount})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {form.description ||
                'Define validation rules, business constraints, data-quality checks, and failure handling for incoming records.'}
            </p>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-400/20 transition cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-slate-400/20 transition cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Reset
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-400/20 transition cursor-pointer shadow-2xs"
          >
            <Copy className="size-3.5 text-slate-500" />
            Duplicate Node
          </button>
          <button
            type="button"
            onClick={onRunTest}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-blue-400/20 transition cursor-pointer shadow-2xs"
          >
            <Play className="size-3.5 text-blue-600 fill-blue-600" />
            {isTesting ? 'Testing…' : 'Test Validation'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition cursor-pointer shadow-xs"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </header>
  );
}
