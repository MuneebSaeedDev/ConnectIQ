import React from 'react';
import { Plus, Download, Upload, RefreshCw, ShieldCheck } from 'lucide-react';

export default function CleaningRulesHeader({
  onCreateRule,
  onImportRules,
  onExportRules,
  onRefresh,
  isRefreshing,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Data Cleaning Rules
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
            ETL Quality Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Create, configure, test, and manage reusable data-quality and sanitization rules executed across pipeline transformation and cleaning nodes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          title="Refresh rules list"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          onClick={onImportRules}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Import</span>
        </button>

        <button
          type="button"
          onClick={onExportRules}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onCreateRule}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Cleaning Rule</span>
        </button>
      </div>
    </div>
  );
}
