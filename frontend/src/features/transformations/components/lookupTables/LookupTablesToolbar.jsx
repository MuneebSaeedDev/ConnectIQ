import React from 'react';
import { Play, Pause, Trash2, CheckSquare } from 'lucide-react';

export default function LookupTablesToolbar({
  selectedTableIds = [],
  paginatedTables = [],
  onSelectAll,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
}) {
  const isAllSelected =
    paginatedTables.length > 0 &&
    paginatedTables.every((table) => selectedTableIds.includes(table._id || table.id));
  const isSomeSelected = selectedTableIds.length > 0;

  if (!isSomeSelected) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-blue-50/70 border border-blue-200 rounded-lg shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
          />
          <span className="text-xs font-semibold text-blue-900">
            {selectedTableIds.length} lookup table{selectedTableIds.length === 1 ? '' : 's'} selected
          </span>
        </label>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onBulkActivate}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-300 rounded shadow-2xs hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        >
          <Play className="size-3.5 fill-current" />
          Activate
        </button>

        <button
          type="button"
          onClick={onBulkDeactivate}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
        >
          <Pause className="size-3.5 fill-current" />
          Deactivate
        </button>

        <button
          type="button"
          onClick={onBulkDelete}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-700 bg-white border border-rose-300 rounded shadow-2xs hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
