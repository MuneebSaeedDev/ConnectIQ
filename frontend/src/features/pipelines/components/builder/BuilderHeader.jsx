import React from 'react';
import { Link } from 'react-router-dom';
import {
  Undo2,
  Redo2,
  Download,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function BuilderHeader({
  meta,
  isDirty,
  lastSavedTime,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onValidate,
  isValidating,
  onRun,
  onSaveDraft,
  isSaving,
  onPublish,
  isPublishing,
  onExport,
}) {
  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 select-none z-20">
      {/* Left: Brand Mark & Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/pipelines"
          className="flex items-center gap-2 pr-3 border-r border-slate-200 group"
          title="Back to Pipeline Library"
        >
          <div className="size-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:opacity-90 transition">
            <Layers className="size-3.5" />
          </div>
          <span className="font-semibold text-[13px] text-slate-900 tracking-tight">
            ConnectIQ
          </span>
        </Link>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-600">
          <Link to="/pipelines" className="text-blue-600 hover:text-blue-700 font-medium transition">
            Pipelines
          </Link>
          <span className="text-slate-500">/</span>
          <Link to="/pipelines" className="text-slate-600 hover:text-slate-900 transition">
            Pipeline Library
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px]" title={meta.name}>
            Visual Pipeline Builder
          </span>
        </nav>
      </div>

      {/* Right: Status Pill, Meta, Actions & CTAs */}
      <div className="flex items-center gap-2 text-xs">
        {/* Draft status pill */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
            meta.status === 'Published'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <span className="text-[10px]">●</span> {meta.status || 'Draft'}
        </span>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <span className="text-slate-500 text-[11px]">
          {isDirty ? 'Unsaved changes' : `Saved ${lastSavedTime}`}
        </span>

        <span className="text-slate-500 text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {meta.version || 'v1.2.0'}
        </span>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Action icons: Undo, Redo, Export */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo canvas change"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo canvas change"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Redo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onExport}
            title="Export Pipeline JSON"
            aria-label="Export pipeline definition"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Download className="size-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Validate button */}
        <button
          type="button"
          onClick={onValidate}
          disabled={isValidating}
          className="px-3 py-1.5 rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1"
        >
          {isValidating ? (
            <span className="animate-spin text-xs">↻</span>
          ) : (
            <ShieldCheck className="size-3.5 text-slate-500" />
          )}
          <span>Validate</span>
        </button>

        {/* Run button */}
        <button
          type="button"
          onClick={onRun}
          className="px-3 py-1.5 rounded-md font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm inline-flex items-center gap-1.5"
        >
          <Play className="size-3 fill-emerald-700 text-emerald-700" />
          <span>Run</span>
        </button>

        {/* Save Draft button */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </button>

        {/* Publish Pipeline primary CTA */}
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="px-3.5 py-1.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm shadow-blue-500/20 inline-flex items-center gap-1"
        >
          <Sparkles className="size-3.5 text-blue-200" />
          <span>{isPublishing ? 'Publishing…' : 'Publish Pipeline'}</span>
        </button>
      </div>
    </header>
  );
}
