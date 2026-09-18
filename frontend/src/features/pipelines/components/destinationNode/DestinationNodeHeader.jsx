import React from 'react';
import {
  RotateCcw,
  Copy,
  X,
  CheckCircle2,
  Save,
  Loader2,
  ChevronRight,
  DatabaseZap,
  PlugZap,
} from 'lucide-react';

export default function DestinationNodeHeader({
  form,
  isDirty,
  unsavedChangesCount,
  isSaving,
  isTestingConn,
  onCancel,
  onReset,
  onDuplicate,
  onTestConnection,
  onSave,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div className="max-w-[1920px] mx-auto px-6 py-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <span className="hover:text-slate-800 transition cursor-pointer">ConnectIQ</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="hover:text-slate-800 transition cursor-pointer">Pipelines</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="hover:text-slate-800 transition cursor-pointer">Pipeline Builder</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">Destination Node Configuration</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <DatabaseZap className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {form.nodeName || 'Destination Node Configuration'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {form.status || 'Configured'}
              </span>

              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {unsavedChangesCount} unsaved change{unsavedChangesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Configure data sink loading strategies, bulk staging buckets, schema mappings, and dead-letter error routing.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Reset
            </button>

            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
            >
              <Copy className="size-3.5 text-slate-500" />
              Duplicate
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
            >
              <X className="size-3.5 text-slate-500" />
              Cancel
            </button>

            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onTestConnection(); }}
              disabled={isTestingConn}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50"
            >
              {isTestingConn ? (
                <Loader2 className="size-3.5 animate-spin text-slate-600" />
              ) : (
                <PlugZap className="size-3.5 text-emerald-600" />
              )}
              Test Target Sink
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin text-white" />
              ) : (
                <Save className="size-3.5" />
              )}
              Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
