import React from 'react';
import { Plus } from 'lucide-react';

export default function FieldValidationRulesSection({
  fieldRules,
  onAddTextRule,
  onAddNumericRule,
  onAddDateTimeRule,
}) {
  const textRules = fieldRules?.textRules || [];
  const numericRules = fieldRules?.numericRules || [];
  const dateTimeRules = fieldRules?.dateTimeRules || [];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-07-field-rules"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            07
          </span>
          <h2 id="section-07-field-rules" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Field Validation Rules
          </h2>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Text Rules */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="flex items-center justify-center size-6 rounded bg-blue-100 text-blue-700 font-bold text-xs">
                T
              </span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Text Rules
              </h3>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {textRules.map((tr, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between font-mono text-[11px]"
                >
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">
                      {tr.type}
                    </span>
                    <strong className="text-slate-800">{tr.field}</strong>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-blue-800">
                    {tr.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onAddTextRule}
            className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="size-3" />
            + Add Text Rule
          </button>
        </div>

        {/* Column 2: Numeric Rules */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="flex items-center justify-center size-6 rounded bg-emerald-100 text-emerald-700 font-bold text-xs">
                #
              </span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Numeric Rules
              </h3>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {numericRules.map((nr, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between font-mono text-[11px]"
                >
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">
                      {nr.type}
                    </span>
                    <strong className="text-slate-800">{nr.field}</strong>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-emerald-800">
                    {nr.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onAddNumericRule}
            className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-emerald-600 bg-white border border-emerald-200 hover:bg-emerald-50 rounded transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="size-3" />
            + Add Numeric Rule
          </button>
        </div>

        {/* Column 3: Date / Time Rules */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/40 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="flex items-center justify-center size-6 rounded bg-purple-100 text-purple-700 font-bold text-xs">
                D
              </span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Date / Time
              </h3>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {dateTimeRules.map((dr, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between font-mono text-[11px]"
                >
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">
                      {dr.type}
                    </span>
                    <strong className="text-slate-800">{dr.field}</strong>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-purple-800">
                    {dr.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onAddDateTimeRule}
            className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 rounded transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="size-3" />
            + Add Date / Time Rule
          </button>
        </div>
      </div>
    </section>
  );
}
