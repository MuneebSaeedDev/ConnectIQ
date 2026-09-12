import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export default function TransformationPreviewSection({
  preview = {},
  previewTab = 'differences',
  onSelectTab,
}) {
  const rows = preview.rows || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header with View Tabs */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Transformation Preview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Before-and-after record comparison</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectTab('input')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
              previewTab === 'input'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Input Data
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('transformed')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
              previewTab === 'transformed'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transformed Data
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('differences')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
              previewTab === 'differences'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Differences
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Top 5 KPI Stats Cards matching Figma 220:6779 - 220:6801 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-lg font-bold text-slate-900 block font-mono">
              {preview.recordsTested || 500}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Records Tested</span>
          </div>

          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-center">
            <span className="text-lg font-bold text-emerald-800 block font-mono">
              {preview.transformedCount || 498}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Transformed</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-lg font-bold text-slate-700 block font-mono">
              {preview.unchangedCount || 1}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Unchanged</span>
          </div>

          <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg text-center">
            <span className="text-lg font-bold text-rose-800 block font-mono">
              {preview.errorCount || 1}
            </span>
            <span className="text-[11px] text-rose-700 font-medium">Errors</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center col-span-2 sm:col-span-1">
            <span className="text-lg font-bold text-slate-700 block font-mono">
              {preview.nullCount || 0}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Null Results</span>
          </div>
        </div>

        {/* Preview Data Comparison Table matching Figma 220:6802 */}
        <div className="border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Input Value</th>
                <th className="py-2.5 px-3">Transformation Applied</th>
                <th className="py-2.5 px-3">Output Value</th>
                <th className="py-2.5 px-3 text-right">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {rows.map((row) => {
                let icon = null;
                if (row.validation === 'valid') {
                  icon = <CheckCircle2 className="size-4 text-emerald-600 ml-auto" />;
                } else if (row.validation === 'warning') {
                  icon = <AlertTriangle className="size-4 text-amber-500 ml-auto" />;
                } else {
                  icon = <XCircle className="size-4 text-rose-600 ml-auto" />;
                }

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{row.inputValue}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{row.transformation}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">{row.outputValue}</td>
                    <td className="py-2.5 px-3 text-right">{icon}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
