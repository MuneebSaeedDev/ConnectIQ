import React, { useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useCustomExpressions } from '../hooks/useCustomExpressions';

// Subcomponents
import CustomExpressionStats from '../components/expressionBuilder/CustomExpressionStats';
import ExpressionBuilderDrawer from '../components/expressionBuilder/ExpressionBuilderDrawer';

import {
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Code2
} from 'lucide-react';

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
    case 'draft':
      return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
    case 'deprecated':
      return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">Deprecated</span>;
    case 'archived':
      return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-slate-100 text-slate-500 border border-slate-200">Archived</span>;
    default:
      return <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
  }
};

export default function CustomExpressionBuilderScreen() {
  const {
    expressions,
    refetch,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedReturnType,
    setSelectedReturnType,
    selectedStatus,
    setSelectedStatus,

    // Selection
    selectedItems,
    handleSelectAll,
    handleSelectItem,

    pagination
  } = useCustomExpressions();

  // Drawer Controls
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpression, setSelectedExpression] = useState(null);

  const handleCreateNew = () => {
    setSelectedExpression(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (exp) => {
    setSelectedExpression(exp);
    setIsDrawerOpen(true);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Custom Expressions']}>
      <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">

        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Custom Expression Builder</h1>
                <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Engine v2.4
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                Define, test, and manage production-grade expressions with type checking and built-in functions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center px-3 py-2 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />
                Export Library
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Expression
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto w-full">

          {/* Quick Stats */}
          <CustomExpressionStats expressions={expressions} />

          {/* Expressions Library Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">

            {/* Action Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Search by name, logic, description..."
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Numeric">Numeric</option>
                  <option value="String">String</option>
                  <option value="Date/Time">Date/Time</option>
                  <option value="Conditional">Conditional</option>
                </select>

                <select
                  value={selectedReturnType}
                  onChange={(e) => setSelectedReturnType(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Return Types</option>
                  <option value="Decimal">Decimal</option>
                  <option value="String">String</option>
                  <option value="Integer">Integer</option>
                  <option value="Boolean">Boolean</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              {/* Refresh / Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={refetch}
                  className="p-2 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expressions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-3 font-semibold text-slate-900">Expression Detail</th>
                    <th className="p-3 font-semibold text-slate-900">Category & Type</th>
                    <th className="p-3 font-semibold text-slate-900">Pipeline Usage</th>
                    <th className="p-3 font-semibold text-slate-900">Status</th>
                    <th className="p-3 font-semibold text-slate-900">Last Modified</th>
                    <th className="p-3 font-semibold text-slate-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expressions.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 group transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(exp.id)}
                          onChange={(e) => handleSelectItem(exp.id, e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 flex-shrink-0 mt-0.5">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {exp.name}
                              <span className="text-[10px] text-slate-400 font-mono font-normal">v{exp.version}</span>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5 max-w-sm line-clamp-1">
                              {exp.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-slate-700 font-medium">{exp.category}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <span className="text-slate-400">return:</span>
                            <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-medium border border-slate-200">
                              {exp.returnType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 font-medium text-slate-700 border border-slate-200">
                            {exp.pipelinesUsage} pipelines
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(exp.status)}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900 font-medium">{new Date(exp.lastUpdated).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[120px]">by {exp.updatedBy}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium rounded"
                          >
                            Edit
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => pagination.setCurrentPage(p => p - 1)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => pagination.setCurrentPage(p => p + 1)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Builder Side Drawer */}
        <ExpressionBuilderDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          initialData={selectedExpression}
        />

      </div>
    </AppShell>
  );
}
