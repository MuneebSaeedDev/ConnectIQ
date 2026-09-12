import React from 'react';
import {
  Table,
  RefreshCw,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function DataPreviewSection({
  previewData,
  previewTab,
  setPreviewTab,
  sampleLimit,
  setSampleLimit,
  onRefreshPreview,
  isPreviewing,
}) {
  const data = previewData || {};
  const rows = data.sampleRows || [];

  // Filter rows based on active view tab
  const displayedRows = rows.filter((r) => {
    if (previewTab === 'after') return r.match;
    if (previewTab === 'diff') return true; // show all with diff tags
    return true; // 'before' shows all rows
  });

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-data-preview"
    >
      {/* Section Header matching Figma 157:4037 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Table className="size-4 text-slate-600" />
          <h2 id="section-data-preview" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Data Preview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sampleLimit}
            onChange={(e) => setSampleLimit(Number(e.target.value))}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            aria-label="Select preview sample size"
          >
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={250}>250 rows</option>
            <option value={500}>500 rows</option>
          </select>

          <button
            type="button"
            onClick={onRefreshPreview}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50"
          >
            {isPreviewing ? (
              <Loader2 className="size-3 animate-spin text-slate-600" />
            ) : (
              <RefreshCw className="size-3 text-slate-500" />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* 4 KPI Stat Cards matching Figma 157:4049 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Records
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-slate-900">
                {data.totalRecords ?? 100}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">sample</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
              Matching Records
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-emerald-700">
                {data.matchingRecords ?? 4}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                {data.matchingPct ?? '67% match'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-rose-800 uppercase tracking-wider">
              Excluded Records
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-rose-700">
                {data.excludedRecords ?? 2}
              </span>
              <span className="text-[11px] text-rose-600 font-medium">
                {data.excludedPct ?? '33% rejected'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg">
            <span className="block text-[11px] font-medium text-blue-800 uppercase tracking-wider">
              Match Percentage
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-blue-700">
                {data.matchPercentage ?? '67%'}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">of sample</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs matching Figma 157:4077 */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-1 -mb-px">
            <button
              type="button"
              onClick={() => setPreviewTab('before')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                previewTab === 'before'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Before Filter ({rows.length})
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('after')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                previewTab === 'after'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              After Filter ({data.matchingRecords ?? 4})
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('diff')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
                previewTab === 'diff'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Differences ({rows.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing {displayedRows.length} of {rows.length} sample records
          </span>
        </div>

        {/* Preview Data Table matching Figma 157:4086 */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[640px]">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2.5 px-3">Order ID</th>
                <th scope="col" className="py-2.5 px-3">Customer</th>
                <th scope="col" className="py-2.5 px-3">Date</th>
                <th scope="col" className="py-2.5 px-3">Revenue</th>
                <th scope="col" className="py-2.5 px-3">Country</th>
                <th scope="col" className="py-2.5 px-3">Status</th>
                <th scope="col" className="py-2.5 px-3 text-right">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {displayedRows.map((row) => (
                <tr
                  key={row.orderId}
                  className={`transition ${
                    !row.match && previewTab === 'diff'
                      ? 'bg-rose-50/40 hover:bg-rose-50/70 text-slate-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-slate-900">{row.orderId}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">{row.customer}</td>
                  <td className="py-2 px-3 text-slate-600">{row.date}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{row.revenue}</td>
                  <td className="py-2 px-3 font-bold text-slate-700">{row.country}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {row.match ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        title={row.reason}
                      >
                        <Check className="size-3 text-emerald-600" />
                        PASS
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                        title={row.reason}
                      >
                        <X className="size-3 text-rose-600" />
                        FAIL
                      </span>
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
