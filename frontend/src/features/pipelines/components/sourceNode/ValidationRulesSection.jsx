import React from 'react';

export default function ValidationRulesSection({
  form,
  toggleValidationRule,
}) {
  const rules = form.validationRules || [];
  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="validation-rules-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          8
        </div>
        <div>
          <h2 id="validation-rules-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Validation Rules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data quality enforcement and business rule configuration
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Toggle cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                rule.enabled
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="pr-3">
                <h3 className="text-xs font-semibold text-slate-800 leading-tight">
                  {rule.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {rule.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={rule.enabled}
                aria-label={`Toggle ${rule.name}`}
                onClick={() => toggleValidationRule(rule.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  rule.enabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block size-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    rule.enabled ? 'translate-x-2' : '-translate-x-2'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Rule Status Bar matching Figma node 155:3108 */}
        <div className="flex items-center gap-6 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{activeCount}</span> Rules Active
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>0</span> Warnings
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="size-2 rounded-full bg-slate-400" />
            <span>0</span> Errors
          </div>
        </div>
      </div>
    </section>
  );
}
