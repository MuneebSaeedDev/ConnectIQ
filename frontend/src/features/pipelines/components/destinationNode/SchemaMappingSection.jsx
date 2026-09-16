import React from 'react';
import { Columns, ArrowRight, Check, Key } from 'lucide-react';

export default function SchemaMappingSection({ fieldMappings = [], updateFieldMapping }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">04. Output-to-Target Column Projections</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {fieldMappings.length} Columns Mapped
        </span>
      </div>

      <div className="p-6">
        <div className="border border-slate-200 rounded-md overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-bold text-slate-600">Pipeline Output Field</th>
                <th className="w-8 text-center"></th>
                <th className="px-4 py-2.5 font-bold text-slate-600">Destination Column Name</th>
                <th className="px-4 py-2.5 font-bold text-slate-600">Destination SQL Type</th>
                <th className="px-4 py-2.5 font-bold text-slate-600 text-center">Key</th>
                <th className="px-4 py-2.5 font-bold text-slate-600 text-center">Nullable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fieldMappings.map((mapping, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono font-medium text-blue-900">
                    {mapping.sourceField}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-300">
                    <ArrowRight className="size-3.5" />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={mapping.targetField}
                      onChange={(e) => updateFieldMapping(idx, 'targetField', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono font-bold text-slate-900 border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded bg-transparent focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600">
                    <input
                      type="text"
                      value={mapping.targetType}
                      onChange={(e) => updateFieldMapping(idx, 'targetType', e.target.value)}
                      className="w-36 px-2 py-1 text-xs font-mono text-slate-600 border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded bg-transparent focus:bg-white uppercase"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={mapping.isKey}
                      onChange={(e) => updateFieldMapping(idx, 'isKey', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={mapping.nullable}
                      onChange={(e) => updateFieldMapping(idx, 'nullable', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
