import React from 'react';
import { Layers, CheckCircle2, FileText, Ban, Zap, Clock } from 'lucide-react';

export default function TransformationRulesSummaryCards({ rules = [] }) {
  const total = rules.length;
  const active = rules.filter(r => r.status === 'Active').length;
  const drafts = rules.filter(r => r.status === 'Draft').length;
  const disabled = rules.filter(r => r.status === 'Disabled' || r.status === 'Invalid').length;
  const totalExecs = rules.reduce((acc, r) => acc + (r.usageCount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Rules
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {total}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 inline-block">
            Across 9 categories
          </span>
        </div>
        <div className="size-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
          <Layers className="size-5" />
        </div>
      </div>

      {/* Active Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Rules
          </p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {active}
          </p>
          <span className="text-[11px] text-emerald-700/80 font-medium mt-0.5 inline-block">
            {total > 0 ? Math.round((active / total) * 100) : 0}% production ready
          </span>
        </div>
        <div className="size-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
          <CheckCircle2 className="size-5" />
        </div>
      </div>

      {/* Draft Rules */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Draft Rules
          </p>
          <p className="text-xl font-bold text-slate-700 mt-1">
            {drafts}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">
            Under development
          </span>
        </div>
        <div className="size-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-200">
          <FileText className="size-5" />
        </div>
      </div>

      {/* Total Executions */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Executions
          </p>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            {totalExecs.toLocaleString()}
          </p>
          <span className="text-[11px] text-indigo-700/80 font-medium mt-0.5 inline-block">
            All-time transformed
          </span>
        </div>
        <div className="size-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
          <Zap className="size-5" />
        </div>
      </div>
    </div>
  );
}
