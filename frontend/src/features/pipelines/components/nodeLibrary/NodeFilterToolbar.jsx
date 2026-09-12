import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Rows,
  X,
  Star,
  Clock,
  Code,
  Shield,
  TrendingUp,
} from 'lucide-react';
import {
  CATEGORY_OPTIONS,
  CONNECTOR_TYPE_OPTIONS,
  STATUS_OPTIONS,
  COMPATIBILITY_OPTIONS,
  OWNER_OPTIONS,
  CERTIFICATION_OPTIONS,
} from '../../services/nodeLibrary.api';

export default function NodeFilterToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  connectorType,
  onConnectorTypeChange,
  statusFilter,
  onStatusChange,
  compatibilityFilter,
  onCompatibilityChange,
  ownerFilter,
  onOwnerChange,
  certificationFilter,
  onCertificationChange,
  quickFilter,
  onToggleQuickFilter,
  filteredCount,
  totalCount,
  lastUpdated,
  viewMode,
  onViewModeChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (categoryFilter !== 'all' && categoryFilter !== 'All Categories') ||
    connectorType !== 'All Connector Types' ||
    statusFilter !== 'All Statuses' ||
    compatibilityFilter !== 'All Versions' ||
    ownerFilter !== 'All Owners' ||
    certificationFilter !== 'All Certifications' ||
    quickFilter !== null;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex flex-col gap-2.5">
      {/* Filters Top Row: Search + Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative min-w-[200px] sm:min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search nodes…"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Node Category dropdown */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Node Category filter"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt === 'All Categories' ? 'all' : opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Connector Type dropdown */}
        <div className="relative">
          <select
            value={connectorType}
            onChange={(e) => onConnectorTypeChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Connector Type filter"
          >
            {CONNECTOR_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Status filter"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Compatibility dropdown */}
        <div className="relative">
          <select
            value={compatibilityFilter}
            onChange={(e) => onCompatibilityChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Compatibility version filter"
          >
            {COMPATIBILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Owner dropdown */}
        <div className="relative">
          <select
            value={ownerFilter}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Owner team filter"
          >
            {OWNER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Certification dropdown */}
        <div className="relative">
          <select
            value={certificationFilter}
            onChange={(e) => onCertificationChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
            aria-label="Certification filter"
          >
            {CERTIFICATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filters Bottom Row: Quick Filter Pills + Count/Timestamp + View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Favorites */}
          <button
            type="button"
            onClick={() => onToggleQuickFilter('favorites')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              quickFilter === 'favorites'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                : 'bg-slate-100/80 text-slate-600 border border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Star className={`w-3 h-3 ${quickFilter === 'favorites' ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>

          {/* Recently Used */}
          <button
            type="button"
            onClick={() => onToggleQuickFilter('recently_used')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              quickFilter === 'recently_used'
                ? 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold'
                : 'bg-slate-100/80 text-slate-600 border border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Clock className={`w-3 h-3 ${quickFilter === 'recently_used' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Recently Used</span>
          </button>

          {/* Custom */}
          <button
            type="button"
            onClick={() => onToggleQuickFilter('custom')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              quickFilter === 'custom'
                ? 'bg-purple-100 text-purple-900 border border-purple-300 font-semibold'
                : 'bg-slate-100/80 text-slate-600 border border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Code className={`w-3 h-3 ${quickFilter === 'custom' ? 'text-purple-600' : 'text-slate-400'}`} />
            <span>Custom</span>
          </button>

          {/* Enterprise */}
          <button
            type="button"
            onClick={() => onToggleQuickFilter('enterprise')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              quickFilter === 'enterprise'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold'
                : 'bg-slate-100/80 text-slate-600 border border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Shield className={`w-3 h-3 ${quickFilter === 'enterprise' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Enterprise</span>
          </button>

          {/* Most Used */}
          <button
            type="button"
            onClick={() => onToggleQuickFilter('most_used')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              quickFilter === 'most_used'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold'
                : 'bg-slate-100/80 text-slate-600 border border-transparent hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className={`w-3 h-3 ${quickFilter === 'most_used' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Most Used</span>
          </button>
        </div>

        {/* Counter & View Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filteredCount}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> nodes{' '}
            <span className="text-slate-300 mx-1">·</span> {lastUpdated}
          </div>

          {/* View Switcher Buttons */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
              aria-label="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact View"
              aria-label="Compact view"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
