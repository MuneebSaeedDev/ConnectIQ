import React from 'react';
import { Save, CheckCircle2, Play, AlertCircle, FileText } from 'lucide-react';

export default function StickyFooterActionBar({
  form,
  isDirty,
  isSaving,
  isValidating,
  isTesting,
  onCancel,
  onSaveDraft,
  onValidate,
  onTestValidation,
  onApplyConfig,
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3"
      role="region"
      aria-label="Footer Actions Bar"
    >
      {/* Left state info */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-500">
            Node ID: <strong className="text-slate-800">{form.nodeId || 'val_node_0052'}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500">
            Pipeline: <strong className="text-slate-800">{form.pipelineDisplay || 'customer-etl-v2'}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500">
            Stage: <strong className="text-slate-800">4 of 7</strong>
          </span>
        </div>

        {isDirty ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            Last saved: {form.lastSaved || '2026-08-09 11:18 UTC'}
          </span>
        )}
      </div>

      {/* Right Action buttons matching Figma: Cancel / Save Draft / Validate / Test Validation / Apply Configuration */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <FileText className="size-3.5 text-slate-500" />
          Save Draft
        </button>

        <button
          type="button"
          onClick={onValidate}
          disabled={isValidating}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <CheckCircle2 className="size-3.5 text-blue-600" />
          {isValidating ? 'Validating…' : 'Validate'}
        </button>

        <button
          type="button"
          onClick={onTestValidation}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <Play className="size-3.5 fill-purple-600 text-purple-600" />
          {isTesting ? 'Testing…' : 'Test Validation'}
        </button>

        <button
          type="button"
          onClick={onApplyConfig}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {isSaving ? 'Applying…' : 'Apply Configuration'}
        </button>
      </div>
    </div>
  );
}
