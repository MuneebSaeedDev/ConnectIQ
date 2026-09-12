import React from 'react';
import {
  Plus,
  Upload,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MinusCircle,
} from 'lucide-react';

export default function ValidationRuleBuilderSection({
  rules,
  onAddRule,
  onImportRules,
  onEditRule,
  onToggleActive,
  onDeleteRule,
}) {
  const activeCount = rules.filter((r) => r.active !== false).length;
  const warningCount = rules.filter((r) => r.severity === 'Warning' && r.active !== false).length;
  const errorCount = rules.filter((r) => r.severity === 'Error' && r.active !== false).length;
  const disabledCount = rules.filter((r) => r.active === false).length;

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-04-rule-builder"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              04
            </span>
            <h2 id="section-04-rule-builder" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Validation Rule Builder
            </h2>
          </div>
          {/* Status counts pills matching Figma */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              {activeCount} active
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
              {warningCount} warning
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
              {errorCount} errors
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              {disabledCount} disabled
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onImportRules}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Upload className="size-3 text-slate-500" />
            Import Rules
          </button>
          <button
            type="button"
            onClick={onAddRule}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs"
          >
            <Plus className="size-3" />
            + Add Rule
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th scope="col" className="px-3.5 py-2.5">Rule Name</th>
              <th scope="col" className="px-3.5 py-2.5">Field</th>
              <th scope="col" className="px-3.5 py-2.5">Validation Type</th>
              <th scope="col" className="px-3.5 py-2.5">Operator / Condition</th>
              <th scope="col" className="px-3.5 py-2.5">Expected Value</th>
              <th scope="col" className="px-3.5 py-2.5">Severity</th>
              <th scope="col" className="px-3.5 py-2.5">Failure Behavior</th>
              <th scope="col" className="px-3.5 py-2.5">Status</th>
              <th scope="col" className="px-3.5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
            {rules.map((rule) => {
              const isError = rule.severity === 'Error';
              const isWarn = rule.severity === 'Warning';
              const isInfo = rule.severity === 'Info';

              return (
                <tr
                  key={rule.id}
                  className={`hover:bg-slate-50/80 transition ${
                    rule.active === false ? 'opacity-50 bg-slate-50/30' : ''
                  }`}
                >
                  <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                    {rule.ruleName}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-slate-700">
                    {rule.field}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600 font-sans">
                    {rule.validationType}
                  </td>
                  <td className="px-3.5 py-2.5 text-blue-700 font-semibold">
                    {rule.condition || rule.operator}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600">
                    {rule.expectedValue}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isWarn
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isError ? '✗ Error' : isWarn ? '! Warning' : 'i Info'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600 font-sans">
                    {rule.failureBehavior}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {rule.active === false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                        <MinusCircle className="size-2.5" />
                        Disabled
                      </span>
                    ) : rule.status === 'Pass' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="size-2.5" />
                        ✓ Pass
                      </span>
                    ) : rule.status === 'Warn' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="size-2.5" />
                        ⚠ Warn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        <AlertCircle className="size-2.5" />
                        ✗ Fail
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleActive(rule.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                        title={rule.active !== false ? 'Disable rule' : 'Enable rule'}
                        aria-label={rule.active !== false ? 'Disable rule' : 'Enable rule'}
                      >
                        <Play className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditRule(rule)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title="Edit rule"
                        aria-label="Edit rule"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete rule"
                        aria-label="Delete rule"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
