import React from 'react';
import { Database, X } from 'lucide-react';

export default function ViewSourceSchemaModal({
  isOpen,
  onClose,
  dataset,
}) {
  if (!isOpen) return null;

  const fields = dataset?.fields || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-schema-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-blue-600" />
            <h3 id="view-schema-modal-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Input Dataset Schema — {dataset?.datasetName || 'customers_mapped'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px]">
            <div>Previous Node: <strong className="text-slate-800">{dataset?.previousNode}</strong></div>
            <div>Schema Version: <strong className="text-slate-800">{dataset?.schemaVersion}</strong></div>
            <div>Total Columns: <strong className="text-slate-800">{fields.length}</strong></div>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 font-sans text-slate-600 text-[11px] sticky top-0">
                <tr>
                  <th scope="col" className="px-3.5 py-2">Field Name</th>
                  <th scope="col" className="px-3.5 py-2">Type</th>
                  <th scope="col" className="px-3.5 py-2">Nullable</th>
                  <th scope="col" className="px-3.5 py-2">Sample</th>
                  <th scope="col" className="px-3.5 py-2">Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] bg-white">
                {fields.map((f) => (
                  <tr key={f.name} className="hover:bg-slate-50">
                    <td className="px-3.5 py-2 font-bold text-slate-900">{f.name}</td>
                    <td className="px-3.5 py-2 text-blue-700 font-semibold">{f.type}</td>
                    <td className="px-3.5 py-2 text-slate-600">{f.nullable}</td>
                    <td className="px-3.5 py-2 text-slate-600">{f.sample}</td>
                    <td className="px-3.5 py-2 text-slate-400">{f.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
