import React from 'react';
import { SORT_OPTIONS } from '../../services/nodeLibrary.api';
import NodeCard from './NodeCard';
import { Layers, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function NodeCatalogGrid({
  nodes = [],
  totalCount = 284,
  filteredCount = 0,
  sortBy = 'most_used',
  onSortChange,
  selectedNodeId,
  onSelectNode,
  favoriteIds = new Set(),
  onToggleFavorite,
  onAddToPipeline,
  isLoading,
  error,
  onRetry,
  onResetFilters,
  viewMode = 'grid',
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Catalog Header Strip */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Node Catalog
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {filteredCount} of {totalCount}
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <label htmlFor="catalog-sort" className="text-slate-500 font-medium">Sort by:</label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md py-1 pl-2 pr-6 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-rose-900 mb-1">Failed to load nodes</h3>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && nodes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching nodes found</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              No components match your current combination of search terms, category filters, and compatibility flags.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Populated Grid */}
        {!isLoading && !error && nodes.length > 0 && (
          <div
            className={
              viewMode === 'compact'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3'
                : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            }
          >
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={onSelectNode}
                isFavorite={favoriteIds.has(node.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPipeline={onAddToPipeline}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
