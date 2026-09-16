import React from 'react';
import { Link, Plus, Trash2, Code2, AlertTriangle, Columns } from 'lucide-react';

export default function JoinConditionsSection({
  conditions,
  primaryStream,
  secondaryStream,
  mismatchHandling,
  onUpdateCondition,
  onAddCondition,
  onRemoveCondition,
  onUpdateMismatchHandling,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">04. Join Criteria & Conditions</h2>
        </div>
        <button
          type="button"
          onClick={() => onAddCondition({ leftField: '', operator: 'EQUALS', rightField: '', caseSensitive: true, nullSafe: true })}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md transition"
        >
          <Plus className="size-3" />
          Add Condition
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Conditions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <div className="w-[38%]">Primary Stream Field ({primaryStream?.alias || 'Left'})</div>
            <div className="w-[18%] text-center">Operator</div>
            <div className="w-[38%]">Secondary Stream Field ({secondaryStream?.alias || 'Right'})</div>
            <div className="w-8"></div>
          </div>

          <div className="space-y-2">
            {(conditions || []).map((cond, idx) => (
              <div key={cond.id} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 border border-slate-200 rounded-md p-2">

                {/* Left Field */}
                <div className="flex-1 w-full">
                  <select
                    value={cond.leftField || ''}
                    onChange={(e) => onUpdateCondition(idx, 'leftField', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono text-slate-700"
                  >
                    <option value="" disabled>Select field...</option>
                    {(primaryStream?.fields || []).map(f => (
                      <option key={f.name} value={f.name}>{f.name} ({f.type})</option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div className="sm:w-32 shrink-0 w-full flex items-center justify-center">
                  <select
                    value={cond.operator || 'EQUALS'}
                    onChange={(e) => onUpdateCondition(idx, 'operator', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-semibold text-center border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-blue-700"
                  >
                    <option value="EQUALS">== EQUALS</option>
                    <option value="NOT_EQUALS">!= NOT EQ</option>
                    <option value="GREATER_THAN">&gt; GREATER</option>
                    <option value="LESS_THAN">&lt; LESS</option>
                  </select>
                </div>

                {/* Right Field */}
                <div className="flex-1 w-full">
                  <select
                    value={cond.rightField || ''}
                    onChange={(e) => onUpdateCondition(idx, 'rightField', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono text-slate-700"
                  >
                    <option value="" disabled>Select field...</option>
                    {(secondaryStream?.fields || []).map(f => (
                      <option key={f.name} value={f.name}>{f.name} ({f.type})</option>
                    ))}
                  </select>
                </div>

                {/* Remove Btn */}
                <button
                  type="button"
                  onClick={() => onRemoveCondition(cond.id)}
                  disabled={conditions.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Remove condition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {(!conditions || conditions.length === 0) && (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center">
                <Columns className="size-8 text-slate-300 mb-2" />
                <h3 className="text-sm font-semibold text-slate-700">No Join Criteria Defined</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Add at least one condition to specify how records between streams relate to one another (e.g., matching IDs).
                </p>
                <button
                  type="button"
                  onClick={() => onAddCondition({ leftField: '', operator: 'EQUALS', rightField: '', caseSensitive: true, nullSafe: true })}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Plus className="size-3.5" />
                  Define Condition
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Match Behavior Settings */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              Unmatched Record Handling
            </label>
            <p className="text-[11px] text-slate-500 mb-2 leading-tight">
              Behavior when required strict joins fail to resolve an exact pair mapping.
            </p>
            <select
              value={mismatchHandling || 'INCLUDE_NULLS'}
              onChange={(e) => onUpdateMismatchHandling(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="INCLUDE_NULLS">Include unmatched records, pad missing sides with Nulls (Default)</option>
              <option value="DROP">Drop unmatched records completely (Strict Lossy)</option>
              <option value="EMIT_TO_DEAD_LETTER">Drop from successful output but emit to Dead Letter Queue</option>
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-amber-800">
              <AlertTriangle className="size-4" />
              Cartesian Explosion Risk
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              Joining without a unique primary/foreign key constraint on at least one side can result in an NxM cartesian join. Ensure your selected join keys are highly cardinal.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
