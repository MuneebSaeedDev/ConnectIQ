import React from 'react';
import { Table, RefreshCw, Loader2, PlayCircle } from 'lucide-react';

export default function DataPreviewSection({
  dataPreview,
  previewTab,
  setPreviewTab,
  previewLimit,
  setPreviewLimit,
  onRefresh,
  onRunPreview,
  isPreviewing,
}) {
  const data = dataPreview || {};
  const stats = data.stats || {};

  let displayedColumns = [];
  let displayedRows = [];

  if (previewTab === 'source') {
    displayedRows = data.sourceRows || [];
    if (displayedRows.length > 0) {
      displayedColumns = Object.keys(displayedRows[0]);
    }
  } else if (previewTab === 'mapped') {
    displayedRows = data.mappedRows || [];
    if (displayedRows.length > 0) {
      displayedColumns = Object.keys(displayedRows[0]);
    }
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden" aria-labelledby="section-data-preview">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Table className="size-4 text-slate-600" />
          <h2 id="section-data-preview" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Data Preview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={previewLimit}
            onChange={(e) => setPreviewLimit(Number(e.target.value))}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            aria-label="Select preview sample size"
          >
            <option value={10}>10 records</option>
            <option value={50}>50 records</option>
            <option value={100}>100 records</option>
          </select>

          <button
            type="button"
            onClick={onRunPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {isPreviewing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <PlayCircle className="size-3.5" />
            )}
            Run Preview
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Previewed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-slate-900">{stats.recordsPreviewed ?? 0}</span>
              <span className="text-[11px] text-slate-400 font-medium">records</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Successful</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-emerald-700">{stats.successfulMappings ?? 0}</span>
              <span className="text-[11px] text-emerald-600 font-medium">mapped</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-rose-800 uppercase tracking-wider">Failed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-rose-700">{stats.failedTransformations ?? 0}</span>
              <span className="text-[11px] text-rose-600 font-medium">errors</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-amber-800 uppercase tracking-wider">Null Values</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-amber-700">{stats.nullValues ?? 0}</span>
              <span className="text-[11px] text-amber-600 font-medium">detected</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-1 -mb-px">
            <button
              type="button"
              onClick={() => setPreviewTab('source')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                previewTab === 'source' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Source Schema
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('mapped')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                previewTab === 'mapped' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Mapped Target Schema (Output)
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {displayedRows.length} records
          </span>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-96 relative">
          {isPreviewing && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
               <Loader2 className="size-6 animate-spin text-slate-500" />
             </div>
          )}
          <table className="w-full text-left text-xs whitespace-nowrap min-w-max">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 shadow-sm">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center text-slate-400 font-medium">#</th>
                {displayedColumns.map((col) => (
                  <th key={col} className="py-2.5 px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {displayedRows.length > 0 ? (
                displayedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">{idx + 1}</td>
                    {displayedColumns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === 'NULL';
                      return (
                        <td key={col} className={`py-2 px-3 ${isNull ? 'text-amber-500 font-semibold' : 'text-slate-700'}`}>
                          {isNull ? 'NULL' : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={displayedColumns.length + 1} className="py-8 text-center text-slate-500 font-sans">
                    No data to display. Click Run Preview.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
