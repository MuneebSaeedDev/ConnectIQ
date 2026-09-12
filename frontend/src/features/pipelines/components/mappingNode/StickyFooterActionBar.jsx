import React from 'react';
import {
  Save,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function StickyFooterActionBar({
  isDirty = false,
  lastSaved = '2026-08-08 14:32 UTC',
  onCancel,
  onSaveDraft,
  onValidate,
  onPreview,
  onApplyConfiguration,
  isSaving = false,
  isValidating = false,
  isPreviewing = false,
}) {
  return (
    <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Status info matching Figma 170:2979 */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500" />
              All changes saved
            </span>
          )}
          <span>Last saved: {lastSaved}</span>
        </div>

        {/* Right Action buttons matching Figma 170:2984 */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
          >
            {isValidating ? (
              <Loader2 className="size-3.5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5 text-blue-600" />
            )}
            Validate
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            {isPreviewing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5 fill-current text-slate-600" />
            )}
            Preview
          </button>

          <button
            type="button"
            onClick={onApplyConfiguration}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-md shadow-sm transition-colors"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 text-white animate-spin" />
            ) : (
              <Save className="size-3.5 text-white" />
            )}
            Apply Configuration
          </button>
        </div>
      </div>
    </footer>
  );
}
