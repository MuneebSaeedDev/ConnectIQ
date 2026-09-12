import React from 'react';
import {
  GitFork,
  RotateCcw,
  Copy,
  CheckCircle2,
  Save,
  Loader2,
  Layers,
} from 'lucide-react';

export default function MappingNodeHeader({
  nodeName,
  version = 'v2.4.1',
  status = 'Draft',
  isDirty = false,
  unsavedChangesCount = 0,
  onReset,
  onDuplicate,
  onCancel,
  onValidate,
  onSave,
  isSaving = false,
  isValidating = false,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Top breadcrumb navigation */}
      <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Layers className="size-3.5 text-blue-600" />
            Pipeline Builder
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 hover:text-blue-600 cursor-pointer font-mono transition-colors">
            customer-etl-pipeline
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 font-medium">Mapping Node</span>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-900">Configuration</span>
        </nav>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              {unsavedChangesCount} Unsaved Changes
            </span>
          )}
          <span className="text-slate-500 font-mono text-[11px]">
            customer-etl-pipeline
          </span>
          <span className="size-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
            DE
          </span>
        </div>
      </div>

      {/* Main header toolbar matching Figma 170:1575 */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
            <GitFork className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 leading-6">
                Mapping Node Configuration
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  status === 'Configured'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    status === 'Configured' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {status}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {version}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Map source fields to target fields and apply transformations before data reaches the next pipeline stage.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Reset
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Copy className="size-3.5 text-slate-500" />
            Duplicate Node
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isValidating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5 text-blue-600" />
            )}
            Validate Mapping
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save Configuration
          </button>
        </div>
      </div>
    </header>
  );
}
