import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { TRANSFORMATION_CATEGORIES, TRANSFORMATION_STATUSES } from '../../services/transformationRules.api';

export default function TransformationRulesFilter({
  searchQuery,
  onSearchChange,
  onApplySearch,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
}) {
  return (
    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="size-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && onApplySearch()}
          placeholder="Search by rule name, field, operation, or tags..."
          className="w-full pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange({ target: { value: '' } });
              onApplySearch();
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Category:
          </span>
          <select
            value={selectedCategory}
            onChange={onCategoryChange}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {TRANSFORMATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Status:
          </span>
          <select
            value={selectedStatus}
            onChange={onStatusChange}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {TRANSFORMATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
