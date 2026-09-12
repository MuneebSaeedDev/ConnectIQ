import React, { useState } from 'react';
import { X, Download, FileJson, FileSpreadsheet, FileCode } from 'lucide-react';

export default function ExportCatalogModal({
  isOpen,
  onClose,
  onExport,
  filteredCount,
}) {
  const [format, setFormat] = useState('json');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(format);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-catalog-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-catalog-title" className="text-base font-bold text-slate-900">
                Export Node Catalog
              </h2>
              <p className="text-xs text-slate-500">
                Download component specifications and schemas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-6 space-y-4 text-xs">
          <span className="font-semibold text-slate-700 block">Select Export Format</span>

          <div className="grid grid-cols-3 gap-3">
            {/* JSON */}
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'json'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileJson className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-xs">JSON</span>
              <span className="text-[10px] text-slate-400">Full Schemas</span>
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'csv'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <span className="font-bold text-xs">CSV</span>
              <span className="text-[10px] text-slate-400">Inventory Table</span>
            </button>

            {/* YAML */}
            <button
              type="button"
              onClick={() => setFormat('yaml')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'yaml'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileCode className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-xs">YAML</span>
              <span className="text-[10px] text-slate-400">Manifests</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
            Exporting <strong>{filteredCount}</strong> node definitions matching active catalog filters.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
