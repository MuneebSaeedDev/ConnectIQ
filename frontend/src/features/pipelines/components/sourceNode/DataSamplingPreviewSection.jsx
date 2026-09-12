import React from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Play,
  Database,
  Type,
  ToggleLeft,
  Key,
} from 'lucide-react';

export default function DataSamplingPreviewSection({
  form,
  onPreviewData,
}) {
  const metrics = form.samplingMetrics || {
    totalRecords: '1,284,301',
    estimatedSize: '2.4 GB',
    lastSample: 'Just now',
    sampledRows: '100',
  };

  const previewRows = form.previewRows || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="data-sampling-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
            6
          </div>
          <div>
            <h2 id="data-sampling-heading" className="text-sm font-semibold text-slate-900 leading-tight">
              Data Sampling & Preview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live field preview and schema validation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <CheckCircle2 className="size-3.5 text-slate-500" />
            Validate Schema
          </button>
          <button
            type="button"
            onClick={onPreviewData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors shrink-0"
          >
            <Play className="size-3.5" />
            Preview Data
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Records
            </span>
            <span className="text-lg font-bold text-slate-800">
              {metrics.totalRecords}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Estimated Size
            </span>
            <span className="text-lg font-bold text-slate-800">
              {metrics.estimatedSize}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Last Sample
            </span>
            <span className="text-lg font-bold text-slate-800">
              {metrics.lastSample}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Sampled Rows
            </span>
            <span className="text-lg font-bold text-slate-800">
              {metrics.sampledRows}
            </span>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap" role="table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Database className="size-3.5 text-slate-400" />
                    Field Name
                  </div>
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Type className="size-3.5 text-slate-400" />
                    Data Type
                  </div>
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">
                  Sample Value
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <ToggleLeft className="size-3.5 text-slate-400" />
                    Nullable
                  </div>
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Key className="size-3.5 text-slate-400" />
                    Primary Key
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 font-mono font-medium text-slate-800">
                    {row.field_name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {row.data_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-500">
                    {row.sample_value}
                  </td>
                  <td className="px-4 py-2 text-center font-medium">
                    {row.nullable ? (
                      <span className="text-slate-500">Yes</span>
                    ) : (
                      <span className="text-rose-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {row.primary_key ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
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
