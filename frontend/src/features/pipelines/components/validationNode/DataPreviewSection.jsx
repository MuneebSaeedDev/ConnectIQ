import React from 'react';
import { RefreshCw, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function DataPreviewSection({
  dataPreview,
  previewTab,
  setPreviewTab,
  previewLimit,
  setPreviewLimit,
  onRefreshPreview,
  isPreviewing,
}) {
  const records = dataPreview?.records || [];
  const totalTested = dataPreview?.totalTested || 25;
  const valid = dataPreview?.valid || 21;
  const invalid = dataPreview?.invalid || 4;
  const warnings = dataPreview?.warnings || 1;
  const validationRate = dataPreview?.validationRate || '84.0%';

  const filteredRecords = records.filter((r) => {
    if (previewTab === 'valid') return r.validationStatus === 'Valid';
    if (previewTab === 'invalid') return r.validationStatus === 'Invalid';
    if (previewTab === 'warnings') return r.validationStatus === 'Warning';
    return true;
  });

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-16-data-preview"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            16
          </span>
          <h2 id="section-16-data-preview" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Data Preview
          </h2>
          <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            {totalTested} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className="size-3 text-slate-500" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onRefreshPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Play className="size-3 fill-white" />
            ▶ Preview
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Metric tiles & Filter tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2" role="tablist" aria-label="Preview Tabs">
            <button
              type="button"
              role="tab"
              aria-selected={previewTab === 'all'}
              onClick={() => setPreviewTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                previewTab === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Input Data
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewTab === 'valid'}
              onClick={() => setPreviewTab('valid')}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                previewTab === 'valid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Valid Records
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewTab === 'invalid'}
              onClick={() => setPreviewTab('invalid')}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                previewTab === 'invalid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Invalid Records (24,797)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewTab === 'warnings'}
              onClick={() => setPreviewTab('warnings')}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                previewTab === 'warnings'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Warnings
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span>Tested: <strong className="text-slate-900">{totalTested}</strong></span>
            <span>·</span>
            <span className="text-emerald-700">Valid: <strong>{valid}</strong></span>
            <span>·</span>
            <span className="text-rose-600">Invalid: <strong>{invalid}</strong></span>
            <span>·</span>
            <span className="text-amber-600">Warnings: <strong>{warnings}</strong></span>
            <span>·</span>
            <span className="text-blue-700 font-bold">Rate: <strong>{validationRate}</strong></span>
          </div>
        </div>

        {/* Preview Records Table */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th scope="col" className="px-3.5 py-2.5">#</th>
                  <th scope="col" className="px-3.5 py-2.5">customer_id</th>
                  <th scope="col" className="px-3.5 py-2.5">email</th>
                  <th scope="col" className="px-3.5 py-2.5">status</th>
                  <th scope="col" className="px-3.5 py-2.5">balance_usd</th>
                  <th scope="col" className="px-3.5 py-2.5">Validation Status</th>
                  <th scope="col" className="px-3.5 py-2.5">Failed Rule</th>
                  <th scope="col" className="px-3.5 py-2.5">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                {filteredRecords.map((rec) => {
                  const isValid = rec.validationStatus === 'Valid';
                  const isWarn = rec.validationStatus === 'Warning';
                  const isInvalid = rec.validationStatus === 'Invalid';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-3.5 py-2.5 text-slate-400">{rec.id}</td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{rec.customerId}</td>
                      <td className="px-3.5 py-2.5 text-slate-700">{rec.email}</td>
                      <td className="px-3.5 py-2.5 text-slate-700">{rec.status}</td>
                      <td className="px-3.5 py-2.5 text-slate-700">{rec.balanceUsd}</td>
                      <td className="px-3.5 py-2.5">
                        {isValid && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="size-2.5" /> ✓ Valid
                          </span>
                        )}
                        {isWarn && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                            <AlertTriangle className="size-2.5" /> ⚠ Warning
                          </span>
                        )}
                        {isInvalid && (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                            <XCircle className="size-2.5" /> ✗ Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 text-[10px]">{rec.failedRule}</td>
                      <td className="px-3.5 py-2.5 text-slate-500 text-[10px] font-sans">{rec.errorMessage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
