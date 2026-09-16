import React from 'react';
import { Repeat, SaveAll } from 'lucide-react';
import { CONFLICT_RESOLUTIONS } from '../../services/mergeNodeConfig.api';

export default function ConflictResolutionSection({
  conflictResolution,
  leftPrefix,
  rightPrefix,
  fieldMappings,
  onUpdateNestedField,
  onUpdateFieldMapping,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">05. Column Collisions & Output Mapping</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Global Collision Setting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Default Field Collision Strategy
            </label>
            <p className="text-[11px] text-slate-500 max-w-sm mb-2">
              Determines how fields with the same name across streams are handled in the final output.
            </p>
            <select
              value={conflictResolution || 'prefix_suffix'}
              onChange={(e) => onUpdateNestedField(null, 'conflictResolution', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select strategy...</option>
              {CONFLICT_RESOLUTIONS.map(cr => (
                <option key={cr.id} value={cr.id}>{cr.label}</option>
              ))}
            </select>
          </div>

          {/* Render prefix settings if prefix_suffix is chosen */}
          {conflictResolution === 'prefix_suffix' && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-3">
              <p className="text-[11px] font-medium text-slate-600 border-b border-slate-200 pb-1.5">
                Prefix Appending Configuration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Left Stream Prefix
                  </label>
                  <input
                    type="text"
                    value={leftPrefix || ''}
                    onChange={(e) => onUpdateNestedField(null, 'leftPrefix', e.target.value)}
                    placeholder="e.g. org_"
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Right Stream Prefix
                  </label>
                  <input
                    type="text"
                    value={rightPrefix || ''}
                    onChange={(e) => onUpdateNestedField(null, 'rightPrefix', e.target.value)}
                    placeholder="e.g. ext_"
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Schema Mapping Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Final Composite Output Schema</h3>
              <p className="text-[11px] text-slate-500">Toggle fields to include in final output, cast types, or explicitly alias output columns.</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border border-slate-200 transition">
              <SaveAll className="size-3" /> Auto-Map Fields
            </button>
          </div>

          <div className="border border-slate-200 rounded-md overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-bold text-slate-600 w-10 text-center">Inc</th>
                  <th className="px-4 py-2 font-bold text-slate-600">Final Output Name</th>
                  <th className="px-4 py-2 font-bold text-slate-600">Left Source</th>
                  <th className="px-4 py-2 font-bold text-slate-600">Right Source</th>
                  <th className="px-4 py-2 font-bold text-slate-600">Export Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(fieldMappings || []).map((mapping, idx) => (
                  <tr key={idx} className={mapping.include ? '' : 'bg-slate-50/50 opacity-60'}>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={mapping.include}
                        onChange={(e) => onUpdateFieldMapping(idx, 'include', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={mapping.outputField || ''}
                        disabled={!mapping.include}
                        onChange={(e) => onUpdateFieldMapping(idx, 'outputField', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-slate-300 focus:ring-1 focus:ring-blue-500 rounded bg-transparent font-medium text-slate-800"
                      />
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-blue-800">
                      {mapping.leftSource || <span className="text-slate-300 italic">none</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-purple-800">
                      {mapping.rightSource || <span className="text-slate-300 italic">none</span>}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={mapping.type || 'STRING'}
                        disabled={!mapping.include}
                        onChange={(e) => onUpdateFieldMapping(idx, 'type', e.target.value)}
                        className="w-full px-2 py-0.5 text-[10px] font-mono border-transparent hover:border-slate-300 focus:border-slate-300 rounded bg-transparent text-slate-600 uppercase"
                      >
                        <option value="STRING">STRING</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="DECIMAL">DECIMAL</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="JSON">JSON</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
