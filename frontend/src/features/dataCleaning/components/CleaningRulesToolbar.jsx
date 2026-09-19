import React from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, CheckSquare, Square } from 'lucide-react';

export default function CleaningRulesToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedPipelineUsage,
  onPipelineUsageChange,
  selectedRuleIds,
  paginatedRules,
  onSelectAll,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onResetFilters,
}) {
  const hasSelection = selectedRuleIds?.length > 0;
  const isAllSelected = paginatedRules?.length > 0 && selectedRuleIds?.length === paginatedRules?.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 w-full shrink-0 min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search by rule name, description, field, or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center pl-1 pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider shrink-0">Filters:</span>
          </div>

          <div className="relative shrink-0">
            <select
              title="Filter by rule category"
              className="appearance-none block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Text Cleaning">Text Cleaning</option>
              <option value="Null / Missing Data">Null / Missing Data</option>
              <option value="Duplicate Handling">Duplicate Handling</option>
              <option value="Formatting">Formatting</option>
              <option value="Data Type Cleaning">Data Type Cleaning</option>
              <option value="Custom Rules">Custom Rules</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="relative shrink-0">
            <select
              title="Filter by status"
              className="appearance-none block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Disabled">Disabled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="relative shrink-0">
            <select
              title="Filter by pipeline usage"
              className="appearance-none block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white"
              value={selectedPipelineUsage}
              onChange={(e) => onPipelineUsageChange(e.target.value)}
            >
              <option value="ALL">All Usage</option>
              <option value="USED">Used in Pipelines</option>
              <option value="UNUSED">Not Used</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedPipelineUsage !== 'ALL') && (
            <button
              type="button"
              onClick={onResetFilters}
              className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Row */}
      {paginatedRules?.length > 0 && (
        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectAll(!isAllSelected)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 group focus:outline-hidden"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-medium text-[13px]">Select All</span>
            </button>

            {hasSelection && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200 border-l border-slate-200 pl-4">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedRuleIds.length} selected
                </span>
                <button
                  onClick={onBulkActivate}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Activate
                </button>
                <button
                  onClick={onBulkDeactivate}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={onBulkDelete}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
