import React from 'react';
import { CopyCheck, ArrowDownUp } from 'lucide-react';

export default function DeduplicationSection({
  deduplication,
  updateNestedField,
}) {
  if (!deduplication) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CopyCheck className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">06. Deduplication & Output Aggregation</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 cursor-pointer">Enable Dedup:</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={deduplication.enabled}
              onChange={(e) => updateNestedField('deduplication', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {deduplication.enabled && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/30">
          {/* Strategy */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Resolution Strategy</label>
              <select
                value={deduplication.dedupStrategy || 'KEEP_LATEST'}
                onChange={(e) => updateNestedField('deduplication', 'dedupStrategy', e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="KEEP_LATEST">Keep Latest (Based on Sort Field)</option>
                <option value="KEEP_FIRST">Keep First (Based on Sort Field)</option>
                <option value="FAIL_ON_DUPLICATE">Fail Pipeline on Duplicate</option>
                <option value="SUM_NUMERICS">Aggregate: Sum Numerics, Keep First</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Composite Deduplication Keys</label>
              <input
                type="text"
                value={(deduplication.compositeKeys || []).join(', ')}
                placeholder="e.g. customer_id, order_id"
                onChange={(e) => updateNestedField('deduplication', 'compositeKeys', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500">Comma separated column names that form uniqueness.</p>
            </div>
          </div>

          {/* Tiebreaker */}
          <div className="space-y-4 border-l border-slate-200 pl-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Historical Sort Determinant</label>
              <p className="text-[11px] text-slate-500 max-w-[280px]">
                The timestamp or sequence identity field used to decide which record is "Latest" or "First".
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={deduplication.sortField || ''}
                  onChange={(e) => updateNestedField('deduplication', 'sortField', e.target.value)}
                  placeholder="e.g. updated_at"
                  className="w-[180px] px-3 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => updateNestedField('deduplication', 'sortOrder', deduplication.sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition"
                >
                  <ArrowDownUp className="size-3.5" />
                  {deduplication.sortOrder || 'DESC'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
