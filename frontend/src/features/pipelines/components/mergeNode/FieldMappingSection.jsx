import React from 'react';
import { FileDiff, SplitSquareHorizontal, MoveRight, Settings2, Combine } from 'lucide-react';
import { CONFLICT_RESOLUTIONS } from '../../services/mergeNodeConfig.api';

export default function FieldMappingSection({
  fieldMappings = [],
  conflictResolution,
  leftPrefix,
  rightPrefix,
  updateNestedField,
  updateFieldMapping,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="size-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">05. Output Schema & Collision Policy</h2>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Global Conflict Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 border border-slate-200 rounded-md">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Global Field Conflict Resolution
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Behavior when identical column names appear in both streams without an explicit unified mapping override.
            </p>
            <select
              value={conflictResolution || 'prefix_suffix'}
              onChange={(e) => updateNestedField('conflictResolution', null, e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {CONFLICT_RESOLUTIONS.map(cr => (
                <option key={cr.id} value={cr.id}>{cr.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Namespace Segregation (Prefixes)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Required when using Prefix/Suffix conflict resolution string templating.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Left Prefix</span>
                <input
                  type="text"
                  value={leftPrefix || ''}
                  onChange={(e) => updateNestedField('leftPrefix', null, e.target.value)}
                  placeholder="e.g. crm_"
                  disabled={conflictResolution !== 'prefix_suffix'}
                  className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Right Prefix</span>
                <input
                  type="text"
                  value={rightPrefix || ''}
                  onChange={(e) => updateNestedField('rightPrefix', null, e.target.value)}
                  placeholder="e.g. orders_"
                  disabled={conflictResolution !== 'prefix_suffix'}
                  className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projection Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="block text-xs font-semibold text-slate-800">
                Explicit Column Projection Matrix
              </label>
              <p className="text-[11px] text-slate-500">
                Force specific unified field names resulting from the merged stream tuple output.
              </p>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Settings2 className="size-3" /> Auto-Map Types
            </button>
          </div>

          <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
            <div className="grid grid-cols-[auto_1fr_auto_1fr_1fr] gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider items-center">
              <div className="w-8 text-center" title="Project to output stream">Emit</div>
              <div>Left Stream Field Source</div>
              <div className="w-8 flex justify-center"><Combine className="size-3 text-slate-400" /></div>
              <div>Right Stream Field Source</div>
              <div>Unified Output Label</div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {fieldMappings.map((mapping, idx) => (
                <div key={idx} className={`grid grid-cols-[auto_1fr_auto_1fr_1fr] gap-3 px-4 py-2.5 items-center transition ${mapping.include ? '' : 'opacity-40 bg-slate-50'}`}>
                  {/* Include Toggle */}
                  <div className="w-8 flex justify-center">
                    <input
                      type="checkbox"
                      checked={mapping.include}
                      onChange={(e) => updateFieldMapping(idx, 'include', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-3.5"
                    />
                  </div>

                  {/* Left Source */}
                  <div className="flex items-center gap-2">
                    {mapping.leftSource ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-800 font-mono text-[11px] truncate max-w-full">
                        {mapping.leftSource}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic font-mono px-2">—</span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="w-8 flex justify-center text-slate-300">
                    <MoveRight className="size-3.5" />
                  </div>

                  {/* Right Source */}
                  <div className="flex items-center gap-2">
                    {mapping.rightSource ? (
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-800 font-mono text-[11px] truncate max-w-full">
                        {mapping.rightSource}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic font-mono px-2">—</span>
                    )}
                  </div>

                  {/* Output Label */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mapping.outputField}
                      onChange={(e) => updateFieldMapping(idx, 'outputField', e.target.value)}
                      disabled={!mapping.include}
                      className="w-full px-2 py-1 text-[11px] font-mono font-semibold text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500 disabled:bg-transparent disabled:border-transparent"
                    />
                    <span className="text-[10px] uppercase font-mono text-slate-400 w-16 text-right shrink-0">
                      {mapping.type.substring(0, 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
