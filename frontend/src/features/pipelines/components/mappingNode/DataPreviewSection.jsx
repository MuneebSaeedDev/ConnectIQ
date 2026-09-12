import React from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export default function DataPreviewSection({
  dataPreview = {},
  previewTab = 'mapped',
  setPreviewTab,
  previewLimit = 10,
  setPreviewLimit,
  onRefresh,
  onRunPreview,
  isPreviewing = false,
}) {
  const stats = dataPreview.stats || {
    recordsPreviewed: 10,
    successfulMappings: 9,
    failedTransformations: 1,
    nullValues: 3,
    rejectedRecords: 0,
  };

  const mappedRows = dataPreview.mappedRows || [];
  const sourceRows = dataPreview.sourceRows || [];

  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="data-preview-heading"
    >
      {/* Header matching Figma 170:2487 */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            12
          </span>
          <h2 id="data-preview-heading" className="text-sm font-bold text-slate-900">
            Data Preview
          </h2>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-2">
          <select
            value={previewLimit}
            onChange={(e) => setPreviewLimit(Number(e.target.value))}
            className="h-7 text-xs bg-white border border-slate-300 rounded px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Sample row count limit"
          >
            <option value={10}>10 records</option>
            <option value={50}>50 records</option>
            <option value={100}>100 records</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors"
          >
            <RotateCcw className="size-3 text-slate-400" />
            Refresh
          </button>

          <button
            type="button"
            onClick={onRunPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
          >
            <Play className="size-3 fill-current" />
            Preview
          </button>
        </div>
      </div>

      {/* Tabs & KPI metric summary strip matching Figma 170:2500 */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Preview Modes">
          <button
            type="button"
            role="tab"
            aria-selected={previewTab === 'source'}
            onClick={() => setPreviewTab('source')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              previewTab === 'source'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Source Data
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={previewTab === 'mapped'}
            onClick={() => setPreviewTab('mapped')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              previewTab === 'mapped'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Mapped Data
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={previewTab === 'diff'}
            onClick={() => setPreviewTab('diff')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              previewTab === 'diff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Differences
          </button>
        </div>

        {/* 5 KPI Stat Chips */}
        <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Records:</span>
            <span className="font-bold text-slate-800">{stats.recordsPreviewed}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-emerald-700">
            <span className="font-sans">Successful:</span>
            <span className="font-bold">{stats.successfulMappings}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-rose-700">
            <span className="font-sans">Failed:</span>
            <span className="font-bold">{stats.failedTransformations}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-amber-700">
            <span className="font-sans">Nulls:</span>
            <span className="font-bold">{stats.nullValues}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="font-sans">Rejected:</span>
            <span className="font-bold">{stats.rejectedRecords}</span>
          </div>
        </div>
      </div>

      {/* Preview Data Table matching Figma 170:2534 */}
      <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
        {previewTab === 'mapped' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2 px-3">#</th>
                <th scope="col" className="py-2 px-3">customer_id</th>
                <th scope="col" className="py-2 px-3">full_name</th>
                <th scope="col" className="py-2 px-3">email</th>
                <th scope="col" className="py-2 px-3">created_date</th>
                <th scope="col" className="py-2 px-3">balance_usd</th>
                <th scope="col" className="py-2 px-3">region</th>
                <th scope="col" className="py-2 px-3">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {mappedRows.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400 font-sans">{i + 1}</td>
                  <td className="py-2 px-3 text-slate-900 font-medium">{r.customer_id}</td>
                  <td className="py-2 px-3 text-slate-800 font-sans">{r.full_name}</td>
                  <td className="py-2 px-3 text-slate-600">{r.email}</td>
                  <td className="py-2 px-3 text-slate-600">{r.created_date}</td>
                  <td className="py-2 px-3 text-slate-800">{r.balance_usd}</td>
                  <td className="py-2 px-3 text-slate-700">{r.region}</td>
                  <td className="py-2 px-3">
                    {r.status === 'NULL' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200">
                        NULL
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">{r.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {previewTab === 'source' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2 px-3">#</th>
                <th scope="col" className="py-2 px-3">customer_id</th>
                <th scope="col" className="py-2 px-3">first_name</th>
                <th scope="col" className="py-2 px-3">last_name</th>
                <th scope="col" className="py-2 px-3">email_address</th>
                <th scope="col" className="py-2 px-3">created_at</th>
                <th scope="col" className="py-2 px-3">account_balance</th>
                <th scope="col" className="py-2 px-3">country_code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {sourceRows.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400 font-sans">{i + 1}</td>
                  <td className="py-2 px-3 text-slate-900 font-medium">{r.customer_id}</td>
                  <td className="py-2 px-3 text-slate-700 font-sans">{r.first_name}</td>
                  <td className="py-2 px-3 text-slate-700 font-sans">{r.last_name}</td>
                  <td className="py-2 px-3 text-slate-600">{r.email_address}</td>
                  <td className="py-2 px-3 text-slate-600">{r.created_at}</td>
                  <td className="py-2 px-3 text-slate-800">{r.account_balance}</td>
                  <td className="py-2 px-3 text-slate-700">{r.country_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {previewTab === 'diff' && (
          <div className="p-6 text-center text-xs text-slate-500 font-sans">
            <p className="font-semibold text-slate-700">Schema &amp; Value Transformations Diff</p>
            <p className="mt-1 text-[11px]">
              All 10 sample records successfully parsed. 1 field (<code className="text-rose-600">status</code>) emitted NULL due to missing mapping rule.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
