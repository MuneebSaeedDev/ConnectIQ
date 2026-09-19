import React, { useState } from 'react';
import { Database, X, Search, Key } from 'lucide-react';

export default function ViewSourceSchemaModal({
  isOpen,
  onClose,
  inputDataset = {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const columns = inputDataset?.fields || [];

  if (!isOpen) return null;

  const filteredColumns = columns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Database className="size-4 text-blue-600" />
            <div>
              <h3 id="schema-modal-title" className="text-sm font-bold text-slate-900">
                Source Stream Schema
              </h3>
              <p className="text-[11px] text-slate-500">
                {inputDataset.nodeName || 'Stream'} ({inputDataset.alias || 'alias'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search fields or types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-bold text-slate-700">Column Name</th>
                  <th className="px-4 py-2 font-bold text-slate-700">Type</th>
                  <th className="px-4 py-2 font-bold text-slate-700">Nullable</th>
                  <th className="px-4 py-2 font-bold text-slate-700 w-1/3">Sample Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredColumns.length > 0 ? (
                  filteredColumns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {col.isKey && <Key className="size-3 text-amber-500" title="Key field"/>}
                          {col.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase border border-slate-200">
                          {col.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-slate-500">
                        {col.nullable ? 'Yes' : <span className="font-semibold text-slate-700">No</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px] truncate max-w-[150px]" title={col.sample}>
                        {col.sample || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No matching fields found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
