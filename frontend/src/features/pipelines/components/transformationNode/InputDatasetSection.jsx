import React from 'react';
import { RefreshCw, Eye } from 'lucide-react';

export default function InputDatasetSection({
  dataset = {},
  isRefreshing = false,
  onRefreshSchema,
  onViewInputData,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header matching Figma 220:6102 */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            Input Dataset
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schema inherited from the upstream node
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={onRefreshSchema}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <RefreshCw className={`size-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : '↻ Refresh Schema'}
          </button>
          <button
            type="button"
            onClick={onViewInputData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Eye className="size-3 text-blue-600" />
            View Input Data
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* 6 Key Metadata Cards matching Figma 220:6114 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Previous Node</span>
            <span className="text-xs font-bold text-slate-800 truncate block" title={dataset.previousNode}>
              {dataset.previousNode || 'Filter: Valid Orders'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Dataset</span>
            <span className="text-xs font-bold text-slate-800 truncate block font-mono" title={dataset.dataset}>
              {dataset.dataset || 'orders_filtered'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Schema Version</span>
            <span className="text-xs font-bold text-slate-800 block">
              {dataset.schemaVersion || 'v3.2'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Total Fields</span>
            <span className="text-xs font-bold text-slate-800 block">
              {dataset.totalFields || 14} fields
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Estimated Records</span>
            <span className="text-xs font-bold text-slate-800 block">
              {dataset.estimatedRecords ? dataset.estimatedRecords.toLocaleString() : '284,590'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[11px] text-slate-400 block font-medium">Last Schema Refresh</span>
            <span className="text-xs font-bold text-slate-800 block">
              {dataset.lastSchemaRefresh || '4 min ago'}
            </span>
          </div>
        </div>

        {/* 5 Field Schema Table matching Figma 220:6145 */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-2.5">Field Name</th>
                <th scope="col" className="px-4 py-2.5">Data Type</th>
                <th scope="col" className="px-4 py-2.5">Nullable</th>
                <th scope="col" className="px-4 py-2.5">Sample Value</th>
                <th scope="col" className="px-4 py-2.5">Source Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {(dataset.fields || []).map((f) => (
                <tr key={f.name} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                    {f.name}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-medium">
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {f.nullable ? (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-medium border border-amber-200">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {f.sample}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">
                    {f.sourcePath}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
