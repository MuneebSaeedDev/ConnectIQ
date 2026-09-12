import React from 'react';
import { Database, RefreshCw, Eye, Layers } from 'lucide-react';

export default function InputDatasetSection({
  dataset,
  onRefreshSchema,
  onViewInputData,
}) {
  const fields = dataset.fields || [];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-02-input-dataset"
    >
      {/* Section Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            02
          </span>
          <h2 id="section-02-input-dataset" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Input Dataset
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshSchema}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-400 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="size-3 text-slate-500" />
            Refresh Schema
          </button>
          <button
            type="button"
            onClick={onViewInputData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-hidden focus:ring-1 focus:ring-blue-400 transition cursor-pointer shadow-2xs"
          >
            <Eye className="size-3 text-blue-600" />
            View Input Data
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Dataset metadata cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Previous Node</span>
            <span className="block text-xs font-mono font-semibold text-slate-900 mt-1 truncate" title={dataset.previousNode}>
              {dataset.previousNode || 'mapper_node_0041'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Dataset</span>
            <span className="block text-xs font-mono font-semibold text-slate-900 mt-1 truncate" title={dataset.datasetName}>
              {dataset.datasetName || 'customers_mapped'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Schema Version</span>
            <span className="block text-xs font-mono font-semibold text-slate-900 mt-1">
              v{dataset.schemaVersion || '2.1.0'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Total Fields</span>
            <span className="block text-xs font-mono font-bold text-slate-900 mt-1">
              {dataset.totalFields || fields.length || 10}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Est. Records</span>
            <span className="block text-xs font-mono font-bold text-emerald-700 mt-1">
              {dataset.estimatedRecords || '4.2M'}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Last Refreshed</span>
            <span className="block text-xs font-mono text-slate-600 mt-1">
              {dataset.lastRefreshed || '09:42 UTC'}
            </span>
          </div>
        </div>

        {/* Input schema fields table */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th scope="col" className="px-3.5 py-2.5">Field Name</th>
                  <th scope="col" className="px-3.5 py-2.5">Data Type</th>
                  <th scope="col" className="px-3.5 py-2.5">Nullable</th>
                  <th scope="col" className="px-3.5 py-2.5">Sample Value</th>
                  <th scope="col" className="px-3.5 py-2.5">Source Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                {fields.map((field) => (
                  <tr key={field.name} className="hover:bg-slate-50/70 transition">
                    <td className="px-3.5 py-2 font-semibold text-slate-900">
                      {field.name}
                    </td>
                    <td className="px-3.5 py-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          field.nullable === 'NO' || field.nullable === false
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {field.nullable === 'NO' || field.nullable === false ? 'NO' : 'YES'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">
                      {field.sample}
                    </td>
                    <td className="px-3.5 py-2 text-slate-400">
                      {field.path || field.sourcePath}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
