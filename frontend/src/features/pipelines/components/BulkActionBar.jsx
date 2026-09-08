import React from 'react';
import { Play, Pause, PlayCircle, Ban, CheckCircle, Copy, Download, UserCheck, Tag, Trash2, X } from 'lucide-react';

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  isLoading,
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white border border-slate-700/60 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2 max-w-5xl w-[92vw] overflow-x-auto backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
      role="region"
      aria-label="Bulk actions"
    >
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700/80 whitespace-nowrap">
        <span className="flex size-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-sm font-semibold tracking-tight text-slate-100">
          {selectedCount} pipeline{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => onBulkAction('run')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Play className="size-3.5 text-blue-400" />
          <span>Run</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('pause')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Pause className="size-3.5 text-amber-400" />
          <span>Pause</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('resume')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <PlayCircle className="size-3.5 text-emerald-400" />
          <span>Resume</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('disable')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Ban className="size-3.5 text-slate-400" />
          <span>Disable</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('enable')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <CheckCircle className="size-3.5 text-emerald-400" />
          <span>Enable</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('duplicate')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Copy className="size-3.5 text-purple-400" />
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('export')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Download className="size-3.5 text-sky-400" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('assign_owner')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <UserCheck className="size-3.5 text-indigo-400" />
          <span>Assign Owner</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('add_tags')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
        >
          <Tag className="size-3.5 text-pink-400" />
          <span>Add Tags</span>
        </button>

        <button
          type="button"
          onClick={() => onBulkAction('delete')}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-950/60 transition active:scale-95 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <div className="pl-2 border-l border-slate-700/80 ml-auto">
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Clear selection"
          title="Clear selection"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
