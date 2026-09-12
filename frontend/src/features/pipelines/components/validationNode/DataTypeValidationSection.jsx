import React from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function DataTypeValidationSection({
  dataTypeConfig,
  onValidateSchema,
}) {
  const fields = dataTypeConfig?.fields || [];
  const mismatchWarning = dataTypeConfig?.mismatchWarning;

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-06-data-type-validation"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            06
          </span>
          <h2 id="section-06-data-type-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Data Type Validation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onValidateSchema}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="size-3 text-slate-500" />
            Validate Schema
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Schema Types Table matching Figma */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th scope="col" className="px-3.5 py-2.5">Field</th>
                  <th scope="col" className="px-3.5 py-2.5">Expected Type</th>
                  <th scope="col" className="px-3.5 py-2.5">Incoming Type</th>
                  <th scope="col" className="px-3.5 py-2.5">Conversion Allowed</th>
                  <th scope="col" className="px-3.5 py-2.5">Severity</th>
                  <th scope="col" className="px-3.5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                {fields.map((f) => (
                  <tr key={f.field} className="hover:bg-slate-50/80 transition">
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                      {f.field}
                    </td>
                    <td className="px-3.5 py-2.5 text-blue-700 font-bold">
                      {f.expectedType}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-700">
                      {f.incomingType}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.conversionAllowed === 'YES'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {f.conversionAllowed}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.severity === 'Error'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : f.severity === 'Warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {f.severity === 'Error' ? '✗ Error' : f.severity === 'Warning' ? '! Warning' : 'i Info'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      {f.status === 'Pass' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="size-2.5" />
                          ✓ Pass
                        </span>
                      )}
                      {f.status === 'Warn' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="size-2.5" />
                          ⚠ Warn
                        </span>
                      )}
                      {f.status === 'Fail' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[10px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          <XCircle className="size-2.5" />
                          ✗ Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mismatch Warning Alert Box */}
        {mismatchWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">{mismatchWarning}</p>
          </div>
        )}
      </div>
    </section>
  );
}
