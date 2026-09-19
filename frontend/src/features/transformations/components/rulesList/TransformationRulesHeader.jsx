import React from 'react';
import { Plus, Download, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TransformationRulesHeader({ totalRules = 0, onExport, onOpenCreateModal }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Transformation Rules
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {totalRules} {totalRules === 1 ? 'Rule' : 'Rules'} Available
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Manage, configure, and reuse standard transformation operations across data pipelines.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs"
        >
          <Download className="size-3.5 text-slate-500" />
          Export Schema
        </button>

        <Link
          to="/transformations/rules/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <Plus className="size-3.5" />
          Create Rule
        </Link>
      </div>
    </div>
  );
}
