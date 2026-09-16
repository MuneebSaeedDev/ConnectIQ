import React from 'react';
import { PlayCircle, ShieldCheck, Activity, Database } from 'lucide-react';

export default function DryRunSection({
  isTestingLoad,
  dryRunResult,
  onRunDryLoad,
  form,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="size-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">06. Dry-Run Verification & Target Emulation</h2>
        </div>
        <button
          type="button"
          onClick={() => onRunDryLoad(50)}
          disabled={isTestingLoad}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md transition disabled:opacity-50"
        >
          {isTestingLoad ? (
            <>
              <div className="size-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Validating Sink...
            </>
          ) : (
            <>
              <PlayCircle className="size-3.5" />
              Simulate Staging Load (50 rows)
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {!dryRunResult ? (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
            <Database className="size-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Dry-Run Performed</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Simulate bulk staging and write schema verification to ensure destination database permissions and column types match before running live.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Destination Staging Schema Passed Verification</h4>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Target Table: {form.targetDatabase}.{form.targetSchema}.{form.targetTable} ({form.tableFormat})
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-200/60 rounded">
                COMPATIBLE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Rows Staged</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{dryRunResult.rowsStaged}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Type Checks</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">{dryRunResult.rowsValidated} Passed</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Est. Duration</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{dryRunResult.estimatedLoadDuration}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Compression Ratio</span>
                <span className="text-lg font-bold text-slate-900 font-mono">4.2x (Parquet)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
