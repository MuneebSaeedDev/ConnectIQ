import React from 'react';
import { Database, AlertTriangle, AlertCircle, FileCog, CheckCircle } from 'lucide-react';

export default function TransformationRulesSummary({ summaryMetrics }) {
  const { total = 0, active = 0, drafts = 0, deprecated = 0 } = summaryMetrics || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 pb-4">
      {/* Total Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Total Rules
          </p>
          <p className="text-xl font-bold text-slate-900 leading-none">
            {total}
          </p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
          <Database className="size-4.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>

      {/* Active Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Active
          </p>
          <p className="text-xl font-bold text-slate-900 leading-none">
            {active}
          </p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
          <CheckCircle className="size-4.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>

      {/* Draft Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Drafts
          </p>
          <p className="text-xl font-bold text-slate-900 leading-none">
            {drafts}
          </p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-colors">
          <FileCog className="size-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>

      {/* Deprecated/Disabled Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Disabled
          </p>
          <p className="text-xl font-bold text-slate-900 leading-none">
            {deprecated}
          </p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
          <AlertCircle className="size-4.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
