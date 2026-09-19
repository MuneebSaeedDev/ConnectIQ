import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

export default function CleaningRulesFilter({
  searchQuery,
  onSearchChange,
  onApplySearch, // Usually connected to an 'Enter' press or auto-debounce
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedPipelineUsage,
  onPipelineUsageChange,
  selectedCleaningType,
  onCleaningTypeChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedPipelineUsage !== 'ALL' ||
    selectedCleaningType !== 'ALL';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-2xs space-y-3 sm:space-y-4">
      {/* Search and primary controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 text-sm sm:leading-6 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            placeholder="Search cleaning rules..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplySearch()}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Quick filter access (optional mobile toggle, normally inline on desktop) */}
          <div className="hidden sm:flex items-center gap-2 p-1.5px bg-slate-100 rounded-md text-slate-500 border border-slate-200">
             <SlidersHorizontal className="size-4 mx-2 text-slate-500"/>
          </div>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block w-full pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem]"
        >
          <option value="ALL">All Categories</option>
          <option value="Text Cleaning">Text Cleaning</option>
          <option value="Null / Missing Data">Null / Missing Data</option>
          <option value="Duplicate Handling">Duplicate Handling</option>
          <option value="Formatting">Formatting</option>
          <option value="Data Type Cleaning">Data Type Cleaning</option>
          <option value="Validation-Assisted Cleaning">Validation-Assisted</option>
          <option value="Custom Rules">Custom Expression</option>
        </select>

        <select
          value={selectedCleaningType}
          onChange={(e) => onCleaningTypeChange(e.target.value)}
          className="block w-full pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem]"
        >
          <option value="ALL">All Rule Types</option>
          <option value="trim_whitespace">Trim Whitespace</option>
          <option value="normalize_email">Normalize Email</option>
          <option value="deduplicate_exact">Exact Deduplication</option>
          <option value="handle_nulls">Null Handling</option>
          <option value="normalize_phone">Phone Normalization</option>
          <option value="date_normalization">Date Normalization</option>
          <option value="remove_special_chars">Remove Characters</option>
        </select>

        <select
          value={selectedPipelineUsage}
          onChange={(e) => onPipelineUsageChange(e.target.value)}
          className="block w-full pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem]"
        >
          <option value="ALL">All Usage</option>
          <option value="USED">Used in Pipelines</option>
          <option value="UNUSED">Not Used in Pipelines</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem_1rem]"
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Disabled">Disabled</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-slate-500">Active filters:</span>
          <button
            onClick={onResetFilters}
            className="group flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
          >
            <X className="size-3 group-hover:scale-110 transition-transform" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
