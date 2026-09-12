import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function RequiredFieldValidationSection({
  requiredConfig,
  updateNestedField,
}) {
  const fields = requiredConfig?.fields || [];
  const behavior = requiredConfig?.behavior || {};
  const stats = requiredConfig?.stats || {};

  const toggleBehavior = (key) => {
    updateNestedField('requiredFieldValidation', 'behavior', {
      ...behavior,
      [key]: !behavior[key],
    });
  };

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-05-required-fields"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            05
          </span>
          <h2 id="section-05-required-fields" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Required Field Validation
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Required Fields:{' '}
          <strong className="text-slate-800 font-mono font-bold">
            {stats.requiredFields || 5}
          </strong>{' '}
          · Missing:{' '}
          <strong className="text-rose-600 font-mono font-bold">
            {stats.missing || 2}
          </strong>{' '}
          · Failures:{' '}
          <strong className="text-rose-600 font-mono font-bold">
            {stats.failures || 2}
          </strong>
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Fields list & status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
            <h3 className="text-xs font-semibold text-slate-800">Field Nullability & Presence</h3>
            <div className="space-y-1.5">
              {fields.map((f) => {
                const isPass = f.status === 'Pass';
                return (
                  <div
                    key={f.name}
                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-900">{f.name}</span>
                      {f.required && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          REQ
                        </span>
                      )}
                    </div>
                    <div>
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3" />
                          ✓ Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <XCircle className="size-3" />
                          ✗ Fail
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Behavior options */}
          <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50/50">
            <h3 className="text-xs font-semibold text-slate-800">Validation Behavior</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={behavior.failIfMissing ?? true}
                  onChange={() => toggleBehavior('failIfMissing')}
                  className="rounded text-blue-600 focus:ring-blue-500 size-3.5"
                />
                <span>Fail if missing (field not in incoming payload)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={behavior.failIfNull ?? true}
                  onChange={() => toggleBehavior('failIfNull')}
                  className="rounded text-blue-600 focus:ring-blue-500 size-3.5"
                />
                <span>Fail if null (field is null or None)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={behavior.failIfEmpty ?? true}
                  onChange={() => toggleBehavior('failIfEmpty')}
                  className="rounded text-blue-600 focus:ring-blue-500 size-3.5"
                />
                <span>Fail if empty string (length == 0)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={behavior.failIfWhitespaceOnly ?? true}
                  onChange={() => toggleBehavior('failIfWhitespaceOnly')}
                  className="rounded text-blue-600 focus:ring-blue-500 size-3.5"
                />
                <span>Fail if whitespace-only string</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
