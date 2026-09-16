import React from 'react';
import { Activity, Play, Database, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SummaryRail({
  form,
  isTestingConn,
  isTestingLoad,
  onTestConnection,
  onRunDryLoad,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sticky top-24 shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Database className="size-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-800">Destination Sink Summary</h3>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Target Platform
          </span>
          <div className="font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded shadow-2xs flex items-center justify-between">
            <span className="capitalize">{form.destinationType}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded">
              {form.tableFormat}
            </span>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Destination Table
          </span>
          <div className="font-mono text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded shadow-2xs truncate" title={`${form.targetDatabase}.${form.targetSchema}.${form.targetTable}`}>
            {form.targetDatabase}.{form.targetSchema}.{form.targetTable}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Write Mode
            </span>
            <span className="font-semibold text-slate-800 text-sm uppercase">
              {form.writeMode}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Batch Chunk
            </span>
            <span className="font-semibold text-slate-800 text-sm font-mono">
              {(form.batchSize || 0).toLocaleString()} rows
            </span>
          </div>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Resilience & Routing
          </span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-700">Error Policy:</span>
            <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {form.errorPolicy}
            </span>
          </div>
          {form.useStaging && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>S3 Staging Bucket Active</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 space-y-2">
        <button
          type="button"
          onClick={onTestConnection}
          disabled={isTestingConn}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md shadow-2xs transition disabled:opacity-50"
        >
          {isTestingConn ? 'Testing Sink...' : 'Test Target Connection'}
        </button>

        <button
          type="button"
          onClick={() => onRunDryLoad(50)}
          disabled={isTestingLoad}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition disabled:opacity-50"
        >
          <Play className="size-3.5" />
          Simulate Staging (50 rows)
        </button>
      </div>
    </div>
  );
}
