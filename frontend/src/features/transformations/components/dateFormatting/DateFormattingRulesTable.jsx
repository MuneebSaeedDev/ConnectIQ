import React from 'react';
import { TypeBadge, FormattingDirection } from './TypeBadge';


export const DateFormattingRulesTable = ({
  data = [],
  pagination,
  filters,
  isLoading,
  isError,
  onTableChange,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onTest
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#e2e8f0] border-t-[#0ea5e9]"></div>
        <p className="mt-2 text-sm text-[#64748b]">Loading date formatting rules...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white">
        <div className="inline-flex p-3 rounded-full bg-red-50 text-red-600 mb-2">
          <img src="/src/assets/icons/alert-circle.svg" className="w-6 h-6" alt="Alert" />
        </div>
        <h3 className="text-sm font-semibold text-[#0f172a]">Failed to load date formatting rules</h3>
        <p className="text-xs text-[#64748b] mt-1">Please try refreshing the page or check your connection.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-white">
        <div className="inline-flex p-4 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] mb-3">
          <img src="/src/assets/icons/pipeline-overview/icon-pipeline.svg" className="w-8 h-8" alt="Pipeline" />
        </div>
        <h3 className="text-base font-semibold text-[#0f172a]">No date formatting rules found</h3>
        <p className="text-sm text-[#64748b] max-w-md mx-auto mt-1">
          {filters.search || (filters.inputType && filters.inputType !== 'All') || (filters.outputType && filters.outputType !== 'All')
            ? 'No rules match your current filter criteria. Try adjusting or clearing the filters.'
            : 'Get started by creating your first date formatting rule to standardize and format date/time values in ETL pipelines.'}
        </p>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    onTableChange({ page: newPage });
  };

  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e2e8f0] text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-semibold text-[#475569] uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Rule Name & Details</th>
              <th scope="col" className="px-6 py-3">Input → Output Format</th>
              <th scope="col" className="px-6 py-3">Target Fields</th>
              <th scope="col" className="px-6 py-3">Timezone / Locale</th>
              <th scope="col" className="px-6 py-3">Pipeline Usage</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Version / Updated</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] bg-white">
            {data.map((rule) => {
              const isActive = rule.status === 'active';
              const isDraft = rule.status === 'draft';

              return (
                <tr key={rule.id} className="hover:bg-[#f8fafc] transition-colors">
                  {/* Rule Name & Desc */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#0f172a] hover:text-[#0ea5e9] cursor-pointer" onClick={() => onEdit(rule.id)}>
                        {rule.ruleName}
                      </span>
                      <span className="text-xs text-[#64748b] truncate max-w-xs" title={rule.description}>
                        {rule.description}
                      </span>
                      {rule.tags && rule.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {rule.tags.map(t => (
                            <span key={t} className="inline-block px-1.5 py-0.2 bg-[#f1f5f9] text-[#475569] text-[10px] rounded border border-[#e2e8f0]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Input -> Output Format */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FormattingDirection
                      inputType={rule.inputType}
                      outputType={rule.outputType}
                      inputFormat={rule.inputFormat}
                      outputFormat={rule.outputFormat}
                    />
                  </td>

                  {/* Target Fields */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {rule.targetFields?.map(field => (
                        <span key={field} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0]">
                          {field}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Timezone / Locale */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#0f172a] flex items-center gap-1">
                        <span className="text-[#64748b]">TZ:</span> {rule.targetTimezone || rule.timezone || 'UTC'}
                      </span>
                      <span className="text-[11px] text-[#64748b] mt-0.5">
                        Locale: <span className="font-mono">{rule.locale || 'en-US'}</span>
                      </span>
                    </div>
                  </td>

                  {/* Pipeline Usage */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0f172a]">{rule.pipelineUsage}</span>
                      <span className="text-xs text-[#64748b]">{rule.pipelineUsage === 1 ? 'pipeline' : 'pipelines'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isDraft ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-500' :
                        isDraft ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`} />
                      {isActive ? 'Active' : isDraft ? 'Draft' : 'Disabled'}
                    </span>
                  </td>

                  {/* Version / Updated */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#64748b]">
                    <div className="flex flex-col">
                      <span className="font-mono text-[#0f172a]">{rule.version}</span>
                      <span className="mt-0.5">By {rule.updatedBy}</span>
                    </div>
                  </td>

                  {/* Actions Menu */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onTest(rule)}
                        className="text-[#0284c7] hover:text-[#0369a1] transition-colors"
                        title="Test Rule"
                      >
                        Test
                      </button>

                      <button
                        onClick={() => onEdit(rule.id)}
                        className="text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
                        title="Edit Rule"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDuplicate(rule.id)}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors"
                        title="Duplicate Rule"
                      >
                        Duplicate
                      </button>

                      <button
                        onClick={() => onToggleStatus(rule.id, rule.status)}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors"
                      >
                        {isActive ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => onDelete(rule)}
                        className="text-rose-600 hover:text-rose-700 transition-colors"
                        title="Delete Rule"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <span className="text-xs text-[#64748b]">
            Showing <span className="font-medium text-[#0f172a]">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium text-[#0f172a]">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium text-[#0f172a]">{pagination.total}</span> rules
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-xs font-medium text-[#475569] bg-white border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-xs font-medium text-[#475569] bg-white border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};