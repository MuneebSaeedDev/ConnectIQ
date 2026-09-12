import React from 'react';
import { Plus, Trash2, Power } from 'lucide-react';

export default function TransformationRulesSection({
  rules = [],
  onAddRuleClick,
  onRemoveRule,
  onToggleStatus,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Disabled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Disabled
          </span>
        );
      case 'Invalid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Invalid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header matching Figma 220:6241 */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            Transformation Rules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured rule builder
          </p>
        </div>
        <button
          type="button"
          onClick={onAddRuleClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Plus className="size-3.5" />
          + Add Rule
        </button>
      </div>

      {/* Rules Table matching Figma 220:6250 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-2.5">Input Field</th>
              <th scope="col" className="px-4 py-2.5">Transformation</th>
              <th scope="col" className="px-4 py-2.5">Parameters</th>
              <th scope="col" className="px-4 py-2.5">Output Field</th>
              <th scope="col" className="px-4 py-2.5">Output Type</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
              <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-3 font-mono font-medium text-slate-900">
                  {rule.inputField}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {rule.transformation}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                  {rule.parameters}
                </td>
                <td className="px-4 py-3 font-mono font-medium text-blue-600">
                  {rule.outputField}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-medium">
                    {rule.outputType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(rule.status)}
                </td>
                <td className="px-4 py-3 text-right relative">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(rule.id)}
                      title={rule.status === 'Active' ? 'Disable Rule' : 'Enable Rule'}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
                    >
                      <Power className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveRule(rule.id)}
                      title="Delete Rule"
                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition"
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
    </section>
  );
}
