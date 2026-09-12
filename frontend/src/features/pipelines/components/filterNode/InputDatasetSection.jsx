import React from 'react';
import { Database, RefreshCw, Eye, Layers } from 'lucide-react';

export default function InputDatasetSection({
  inputDataset,
  onRefreshMetadata,
  onViewSourceSchema,
}) {
  const data = inputDataset || {};

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-input-dataset"
    >
      {/* Section Header matching Figma 157:3804 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-slate-600" />
          <h2 id="section-input-dataset" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Input Dataset
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshMetadata}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            title="Refresh schema and record count from upstream source"
          >
            <RefreshCw className="size-3 text-slate-500" />
            Refresh Metadata
          </button>

          <button
            type="button"
            onClick={onViewSourceSchema}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-md transition"
            title="Inspect full list of upstream columns and types"
          >
            <Eye className="size-3 text-blue-600" />
            View Source Schema
          </button>
        </div>
      </div>

      {/* Metadata Grid matching Figma 157:3814 */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Previous Node</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
              <Layers className="size-3 text-purple-600 shrink-0" />
              <span className="truncate">{data.previousNode || 'crm_join_node'}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Source Connector</span>
            <span className="font-semibold text-slate-800 block truncate">{data.sourceConnector || 'Snowflake (prod)'}</span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Schema Version</span>
            <span className="font-mono font-semibold text-slate-800 block">{data.schemaVersion || 'v14'}</span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Dataset Name</span>
            <span className="font-mono font-semibold text-blue-700 block truncate">{data.datasetName || 'crm_orders_enriched'}</span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Columns</span>
            <span className="font-mono font-semibold text-slate-800 block">{data.totalColumns || 34}</span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Last Schema Refresh</span>
            <span className="font-semibold text-slate-800 block">{data.lastSchemaRefresh || '2026-08-07 09:00'}</span>
          </div>

          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-md space-y-1 col-span-2 sm:col-span-1">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Estimated Records</span>
            <span className="font-mono font-bold text-emerald-700 block">{data.estimatedRecords || '4,218,902'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
