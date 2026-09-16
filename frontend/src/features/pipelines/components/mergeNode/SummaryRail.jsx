import React from 'react';
import { Activity, Play, Settings2 } from 'lucide-react';

export default function SummaryRail({
  form,
  isTesting,
  onRunTest,
  isValidating,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sticky top-24 shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Activity className="size-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-800">Node Configuration Summary</h3>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Operation Topology
          </span>
          <div className="font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2 rounded shadow-2xs">
            {form.strategy === 'inner_join' ? 'Standard Inner Join' :
             form.strategy === 'left_join' ? 'Left Outer Enrichment' :
             form.strategy === 'right_join' ? 'Right Outer Enrichment' :
             form.strategy === 'full_outer_join' ? 'Federated Full Outer' :
             form.strategy === 'union_all' ? 'Vertical Concat (Append)' :
             form.strategy === 'union_distinct' ? 'Vertical Deduped' :
             form.strategy === 'lookup_enrich' ? 'In-Memory Lookup' : form.strategy}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Join Conditions
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {form.joinConditions?.length || 0} Rule(s)
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Projected Output
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {(form.fieldMappings || []).filter(m => m.include).length} Fields
            </span>
          </div>
        </div>

        <div>
           <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Stream Buffering Limit
          </span>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 flex overflow-hidden">
             <div className="bg-blue-500 h-1.5" style={{ width: '40%' }}></div>
             <div className="bg-indigo-400 h-1.5" style={{ width: '15%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Primary: {(form.primaryStream?.totalRecords || 0).toLocaleString()}</span>
            <span>Sec: {(form.secondaryStream?.totalRecords || 0).toLocaleString()}</span>
          </div>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-2">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Collision Policy
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
              {form.conflictResolution?.replace('_', ' ') || 'None'}
            </span>
            {form.deduplication?.enabled && (
               <span className="inline-flex items-center px-2 py-1 ml-2 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                 Post-Deduplication
               </span>
            )}
        </div>
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={() => onRunTest(100)}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition disabled:opacity-50"
        >
          {isTesting ? (
            <div className="flex items-center gap-2">
              <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Simulation...
            </div>
          ) : (
            <>
              <Play className="size-3.5" />
              Simulate Join (100 rows)
            </>
          )}
        </button>
      </div>

    </div>
  );
}
