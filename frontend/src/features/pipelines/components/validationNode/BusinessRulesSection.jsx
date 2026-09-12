import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BusinessRulesSection({
  businessRules,
  onAddBusinessRule,
  onEditBusinessRule,
  onDeleteBusinessRule,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-10-business-rules"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            10
          </span>
          <h2 id="section-10-business-rules" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Business Rules
          </h2>
        </div>
        <button
          type="button"
          onClick={onAddBusinessRule}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs"
        >
          <Plus className="size-3" />
          + Add Business Rule
        </button>
      </div>

      <div className="p-5 space-y-3.5">
        {/* Business Rule Cards matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {businessRules.map((br) => {
            const isError = br.severity === 'Error';

            return (
              <div
                key={br.id}
                className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-900 truncate" title={br.name}>
                        {br.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isError
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isError ? '✗ Error' : '! Warning'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {br.failureBehavior}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditBusinessRule?.(br)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title="Edit rule"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBusinessRule(br.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                    {br.description}
                  </p>

                  <div className="mt-2.5">
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                      Input Fields
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {br.inputFields?.map((f) => (
                        <span
                          key={f}
                          className="px-1.5 py-0.2 bg-white text-slate-700 border border-slate-300 rounded font-mono text-[10px] font-semibold"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded border border-slate-800 break-all leading-tight">
                  <span className="text-slate-400 uppercase font-sans text-[9px] block">Condition</span>
                  {br.condition}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
