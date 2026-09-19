import React from 'react';
import { Search } from 'lucide-react';

export const SUPPORTED_DATE_TYPES = ['String', 'Integer', 'Date', 'DateTime', 'Timestamp'];

export const DateFormattingRulesFilters = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      inputType: 'All',
      outputType: 'All',
      status: 'All',
      category: 'All'
    });
  };

  const hasActiveFilters = filters.search ||
    (filters.inputType && filters.inputType !== 'All') ||
    (filters.outputType && filters.outputType !== 'All') ||
    (filters.status && filters.status !== 'All') ||
    (filters.category && filters.category !== 'All');

  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search by rule name, formats, fields, tags, or description..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters array */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Input Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              name="inputType"
              value={filters.inputType || 'All'}
              onChange={handleChange}
              className="block w-full sm:w-[150px] pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="All">All Input Types</option>
              {SUPPORTED_DATE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block text-slate-400">→</div>

          {/* Output Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              name="outputType"
              value={filters.outputType || 'All'}
              onChange={handleChange}
              className="block w-full sm:w-[150px] pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="All">All Output Types</option>
              {SUPPORTED_DATE_TYPES.map(t => (
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
              className="block w-full sm:w-[130px] pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
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
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
