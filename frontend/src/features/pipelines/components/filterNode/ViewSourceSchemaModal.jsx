import React, { useState } from 'react';
import { Database, X, Search } from 'lucide-react';

export default function ViewSourceSchemaModal({
  isOpen,
  onClose,
  inputDataset = {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const columns = inputDataset.columns || [];

  if (!isOpen) return null;

  const filteredColumns = columns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-purple-600" />
            <div>
              <h3 id="schema-modal-title" className="text-sm font-bold text-slate-900">
                Source Dataset Schema
              </h3>
              <p className="text-[11px] text-slate-500">
                {inputDataset.datasetName || 'crm_orders_enriched'} ({inputDataset.schemaVersion || 'v14'}) · {inputDataset.sourceConnector || 'Snowflake'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search columns, types, or descriptions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Schema Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Column Name</th>
                <th className="py-2 px-3">Data Type</th>
                <th className="py-2 px-3">Nullable</th>
                <th className="py-2 px-3">Sample Value</th>
                <th className="py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredColumns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-semibold text-slate-900">{col.name}</td>
                  <td className="py-2 px-3 text-purple-700 font-bold">{col.type}</td>
                  <td className="py-2 px-3 font-sans">
                    {col.nullable ? (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">YES</span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">NO</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">{col.sample || '—'}</td>
                  <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{col.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total Columns: <strong>{columns.length}</strong> (Filtered: {filteredColumns.length})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
