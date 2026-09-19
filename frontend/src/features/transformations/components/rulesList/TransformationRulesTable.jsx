import React from 'react';
import { Power, Trash2, Edit2, Play, Activity, Link as LinkIcon, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TransformationRulesTable({
  rules,
  isLoading,
  onToggleStatus,
  onDelete
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="size-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading Transformation Rules...</p>
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
        <div className="mx-auto size-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
          <Database className="size-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No Rules Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No transformation rules match your current filters. Adjust your search or create a new rule.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="size-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
      case 'Disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500"></span>
            Disabled
          </span>
        );
      case 'Invalid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500"></span>
            Invalid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">
        {category}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Operation
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Mapping
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-[13px]">{rule.name}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{rule.ruleId} • v{rule.version}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-[13px] font-medium text-slate-700">
                    {rule.operation}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {rule.inputField}
                    </span>
                    <span className="text-slate-400 text-[10px]">→</span>
                    <span className="text-[11px] font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {rule.outputField}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {getCategoryBadge(rule.category)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 text-[12px] text-slate-500">
                    <div className="flex items-center gap-1.5" title="Pipelines using this rule">
                      <LinkIcon className="size-3.5 text-slate-400" />
                      {rule.pipelinesCount || 0}
                    </div>
                    <div className="flex items-center gap-1.5" title="Total executions">
                      <Activity className="size-3.5 text-slate-400" />
                      {(rule.usageCount || 0).toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {getStatusBadge(rule.status)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/transformations/rules/${rule._id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 className="size-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(rule._id || rule.ruleId)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title={rule.status === 'Active' ? 'Disable Rule' : 'Enable Rule'}
                    >
                      <Power className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Test Rule"
                    >
                      <Play className="size-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => onDelete(rule)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
