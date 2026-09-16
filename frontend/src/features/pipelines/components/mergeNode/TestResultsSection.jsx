import React from 'react';
import { PlayCircle, Download } from 'lucide-react';

export default function TestResultsSection({ testResults }) {
  if (!testResults) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden mt-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="size-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">Join Execution Telemetry</h2>
        </div>
        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-full tracking-wider">
          {testResults.status} (Sample)
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Processed Input</span>
            <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">{testResults.recordsProcessed}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Successful Matches</span>
            <span className="text-lg font-bold text-emerald-600 font-mono tracking-tight">{testResults.matchedCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Unmatched / Excluded</span>
            <span className="text-lg font-bold text-amber-600 font-mono tracking-tight">{testResults.unmatchedCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Engine Latency</span>
            <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">{testResults.durationMs}ms</span>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800">Sample Output Buffer Projection</h3>
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
              <Download className="size-3.5" /> Export JSON
            </button>
          </div>

          <div className="border border-slate-200 rounded-md overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-bold text-slate-600 uppercase text-[10px]">Status</th>
                  {testResults.previewRows && testResults.previewRows.length > 0 &&
                    Object.keys(testResults.previewRows[0])
                      .filter(k => !k.startsWith('_'))
                      .map(key => (
                        <th key={key} className="px-4 py-2 font-bold text-slate-600 font-mono text-[10px]">{key}</th>
                      ))
                  }
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                {testResults.previewRows && testResults.previewRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2">
                       <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                         row._matchStatus === 'MATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                       }`}>
                         {row._matchStatus}
                       </span>
                    </td>
                    {Object.entries(row)
                      .filter(([k]) => !k.startsWith('_'))
                      .map(([k, v], j) => (
                        <td key={j} className={`px-4 py-2 ${v === null ? 'text-slate-300 italic' : 'text-slate-700'}`}>
                          {v === null ? 'NULL' : String(v)}
                        </td>
                      ))
                    }
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
