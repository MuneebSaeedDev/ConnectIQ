import React from 'react';
import { Play, TrendingUp, AlertTriangle } from 'lucide-react';

export default function TestExecutionSection({
  isTesting,
  testResults,
  onRunTest
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">08. Dry Run & Live Simulation</h2>
        </div>
        <button
          type="button"
          onClick={() => onRunTest(100)}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md transition disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <div className="size-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="size-3" />
              Run Join Simulation (100 rows)
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {!testResults ? (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700">No Simulation Data</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run a dry simulation to view live match rates, performance metrics, and a sample of the resulting output schema.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-md shadow-2xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Records Evaluated</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{testResults.recordsProcessed}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md shadow-2xs">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Matches Found</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">{testResults.matchedCount}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md shadow-2xs">
                <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Unmatched (Dropped)</span>
                <span className="text-lg font-bold text-rose-800 font-mono">{testResults.unmatchedCount}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-md shadow-2xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compute Time</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{testResults.durationMs}ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                <TrendingUp className="size-3.5 text-blue-600" /> Output Preview Sample
              </h3>
              <div className="border border-slate-200 rounded-md overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-bold text-slate-600 w-8">#</th>
                      <th className="px-3 py-2 font-bold text-slate-600">Match Status</th>
                      {Object.keys(testResults.previewRows[0] || {}).filter(k => k !== '_matchStatus').map(col => (
                        <th key={col} className="px-3 py-2 font-bold text-slate-600 font-mono text-[10px]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {testResults.previewRows.map((row, idx) => (
                      <tr key={idx} className={row._matchStatus === 'MATCHED' ? 'hover:bg-slate-50' : 'bg-rose-50/30'}>
                        <td className="px-3 py-1.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-1.5">
                          {row._matchStatus === 'MATCHED' ? (
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Matched</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded flex items-center gap-1 w-max">
                              <AlertTriangle className="size-2.5" /> Unmatched
                            </span>
                          )}
                        </td>
                        {Object.entries(row).filter(([k]) => k !== '_matchStatus').map(([k, v], cellIdx) => (
                          <td key={cellIdx} className={`px-3 py-1.5 font-mono ${v === null ? 'text-slate-300 italic' : 'text-slate-700'}`}>
                            {v === null ? 'null' : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
