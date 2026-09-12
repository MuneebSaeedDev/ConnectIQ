import React from 'react';
import {
  RefreshCw,
  Download,
  FolderTree,
  Upload,
  Plus,
  Layers,
} from 'lucide-react';

export default function NodeLibraryHeader({
  onRefresh,
  isRefreshing,
  onExport,
  onManageCategories,
  onImportPackage,
  onCreateCustomNode,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Node Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Browse, organize, and manage reusable pipeline components for building enterprise ETL workflows.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-60 shadow-xs"
            title="Refresh Node Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Catalog */}
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xs"
            title="Export Catalog Definitions"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Catalog</span>
          </button>

          {/* Manage Categories */}
          <button
            type="button"
            onClick={onManageCategories}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xs"
            title="Manage Category Taxonomy"
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Categories</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Import Package */}
          <button
            type="button"
            onClick={onImportPackage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-medium text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 active:bg-indigo-100 transition-colors shadow-xs"
            title="Import Node Package archive"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import Node Package</span>
          </button>

          {/* Create Custom Node */}
          <button
            type="button"
            onClick={onCreateCustomNode}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Node</span>
          </button>
        </div>
      </div>
    </header>
  );
}
