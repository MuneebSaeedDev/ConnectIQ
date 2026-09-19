import React from 'react';
import {
  RotateCcw,
  Save,
  Sliders,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';

export default function PipelineSettingsHeader({
  form = {},
  isDirty,
  unsavedChangesCount,
  onReset,
  onSave,
  isSaving,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
          <span className="hover:text-slate-800 transition cursor-pointer">Pipelines</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="hover:text-slate-800 transition cursor-pointer">Pipeline Library</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">
            {form.name || 'Pipeline Settings'}
          </span>
        </nav>

        {/* Title & Action Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Sliders className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Pipeline Settings
              </h1>
              {/* Status Pill */}
              {form.status === 'Active' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  {form.status || 'Draft'}
                </span>
              )}

              {/* Version */}
              {form.version && (
                <span className="inline-flex py-0.5 px-2 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono font-medium text-slate-600 shadow-2xs">
                  {form.version}
                </span>
              )}

              {/* Unsaved Badge */}
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {unsavedChangesCount} unsaved change{unsavedChangesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Configure universal pipeline behaviors, distributed cluster requirements, error handling strategies, and operational notification rules.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(form, null, 2))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
              title="Copy settings JSON"
            >
              <Copy className="size-3.5 text-slate-500" />
              Copy JSON
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={onReset}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-200 rounded-md transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 disabled:text-slate-500"
              title="Discard unsaved changes"
            >
              <RotateCcw className="size-3.5" />
              Discard Changes
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || (!isDirty && form.pipelineId)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed
                ${isDirty
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm shadow-blue-600/20 shadow-sm'
                    : 'bg-slate-800 text-white hover:bg-slate-900 border border-transparent'
                }`}
            >
              {isSaving ? (
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              ) : (
                <Save className={`size-3.5 ${isDirty ? 'text-blue-100' : 'text-slate-300'}`} />
              )}
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
