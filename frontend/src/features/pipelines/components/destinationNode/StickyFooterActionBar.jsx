import React from 'react';
import {
  CheckCircle,
  Eye,
  FileCheck,
  Loader2,
  Clock,
} from 'lucide-react';

export default function StickyFooterActionBar({
  isDirty,
  lastSaved,
  onCancel,
  onSaveDraft,
  onValidate,
  onPreviewData,
  onApplyConfig,
  isSaving,
  isValidating,
  isPreviewing,
}) {
  return (
    <footer className="sticky bottom-0 z-20 bg-white border-t border-slate-200 py-3 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Status matching Figma 157:4454 */}
        <div className="flex items-center gap-3 text-xs">
          {isDirty ? (
            <div className="flex items-center gap-1.5 font-medium text-amber-800">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>All changes saved</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400 pl-3 border-l border-slate-200">
            <Clock className="size-3 text-slate-400" />
            <span>Last saved: {lastSaved || '2026-08-07 14:22:04'}</span>
          </div>
        </div>

        {/* Right Actions matching Figma 157:4461 */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50"
          >
            {isValidating ? (
              <Loader2 className="size-3.5 animate-spin text-slate-600" />
            ) : (
              <CheckCircle className="size-3.5 text-slate-600" />
            )}
            Validate
          </button>

          <button
            type="button"
            onClick={onPreviewData}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition shadow-2xs disabled:opacity-50"
          >
            {isPreviewing ? (
              <Loader2 className="size-3.5 animate-spin text-blue-600" />
            ) : (
              <Eye className="size-3.5 text-blue-600" />
            )}
            Preview Data
          </button>

          <button
            type="button"
            onClick={onApplyConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin text-white" />
            ) : (
              <FileCheck className="size-3.5" />
            )}
            Apply Configuration
          </button>
        </div>
      </div>
    </footer>
  );
}
