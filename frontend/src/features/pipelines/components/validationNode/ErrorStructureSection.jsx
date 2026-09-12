import React from 'react';

export default function ErrorStructureSection({
  errorRows,
}) {
  const rows = errorRows || [];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-19-error-structure"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            19
          </span>
          <h2 id="section-19-error-structure" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Error Structure
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Showing <strong className="text-slate-800">{rows.length}</strong> failure patterns
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th scope="col" className="px-3.5 py-2.5">Error Code</th>
              <th scope="col" className="px-3.5 py-2.5">Rule</th>
              <th scope="col" className="px-3.5 py-2.5">Field</th>
              <th scope="col" className="px-3.5 py-2.5">Record ID</th>
              <th scope="col" className="px-3.5 py-2.5">Severity</th>
              <th scope="col" className="px-3.5 py-2.5">Message</th>
              <th scope="col" className="px-3.5 py-2.5">Suggested Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
            {rows.map((row, idx) => {
              const isError = row.severity === 'Error';

              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">
                    {row.errorCode || row.code}
                  </td>
                  <td className="px-3.5 py-2.5 font-bold text-blue-700">
                    {row.rule}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-700">
                    {row.field}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-900 font-bold">
                    {row.recordId}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isError ? '✗ Error' : '! Warning'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-800 font-medium">
                    {row.message}
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-500 text-[11px]">
                    {row.resolution || row.suggestedResolution}
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
