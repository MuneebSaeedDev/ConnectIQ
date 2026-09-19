import React from 'react';
import { Search } from 'lucide-react';
import { SUPPORTED_SOURCE_TYPES, SUPPORTED_TARGET_TYPES } from '../../services/typeConversion.api';

export const TypeConversionRulesFilters = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      sourceType: 'All',
      targetType: 'All',
      status: 'All',
      category: 'All'
    });
  };

  const hasActiveFilters = filters.search ||
    (filters.sourceType && filters.sourceType !== 'All') ||
    (filters.targetType && filters.targetType !== 'All') ||
    (filters.status && filters.status !== 'All') ||
    (filters.category && filters.category !== 'All');

  return (
    <div className="p-4 border-b border-[#e2e8f0] bg-white">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#94a3b8]" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search by rule name, fields, tags, or description..."
            className="block w-full pl-9 pr-3 py-2 border border-[#e2e8f0] rounded-md text-sm placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
          />
        </div>

        {/* Filters array */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Source Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              name="sourceType"
              value={filters.sourceType || 'All'}
              onChange={handleChange}
              className="block w-full sm:w-[150px] pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] bg-white text-[#0f172a]"
            >
              <option value="All">All Source Types</option>
              {SUPPORTED_SOURCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block text-[#94a3b8]">→</div>

          {/* Target Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              name="targetType"
              value={filters.targetType || 'All'}
              onChange={handleChange}
              className="block w-full sm:w-[150px] pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] bg-white text-[#0f172a]"
            >
              <option value="All">All Target Types</option>
              {SUPPORTED_TARGET_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <select
              name="status"
              value={filters.status || 'All'}
              onChange={handleChange}
              className="block w-full sm:w-[130px] pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] bg-white text-[#0f172a]"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
