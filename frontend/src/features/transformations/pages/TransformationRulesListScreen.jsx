import React, { useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useTransformationRulesList } from '../hooks/useTransformationRules';

// Subcomponents
import TransformationRulesHeader from '../components/rulesList/TransformationRulesHeader';
import TransformationRulesSummary from '../components/rulesList/TransformationRulesSummary';
import TransformationRulesFilter from '../components/rulesList/TransformationRulesFilter';
import TransformationRulesTable from '../components/rulesList/TransformationRulesTable';
import DeleteRuleModal from '../components/dataCleaning/DeleteRuleModal';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function TransformationRulesListScreen() {
  const {
    rules,
    pagination,
    isLoading,
    isError,
    error,
    refetch,

    // Filters
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    applySearch,
    selectedCategory,
    handleCategoryChange,
    selectedStatus,
    handleStatusChange,

    // Pagination
    currentPage,
    handlePageChange,

    // Mutations
    toggleRuleStatus,
    deleteRule,
    isDeleting,
  } = useTransformationRulesList();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (type, message) => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleRuleStatus(id);
      showToast('success', 'Transformation rule status updated successfully.');
    } catch (_err) {
      showToast('error', 'Failed to update transformation rule status.');
    }
  };

  const handleOpenDelete = (rule) => {
    setSelectedRule(rule);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRule) return;
    try {
      await deleteRule(selectedRule._id || selectedRule.ruleId);
      setDeleteModalOpen(false);
      setSelectedRule(null);
      showToast('success', `Transformation rule "${selectedRule.name}" deleted.`);
    } catch (_err) {
      showToast('error', 'Failed to delete transformation rule.');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'transformation_rules_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('info', 'Transformation rules schema exported.');
  };

  // Mock summary computation based on current list
  const summaryMetrics = {
    total: pagination.total || rules.length,
    active: rules.filter((r) => r.status === 'Active').length,
    drafts: rules.filter((r) => r.status === 'Draft').length,
    deprecated: rules.filter((r) => r.status === 'Disabled' || r.status === 'Invalid').length,
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Rules Library']}>
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">

          {/* Header Section */}
          <TransformationRulesHeader
            totalRules={summaryMetrics.total}
            onExport={handleExport}
          />

          {/* Feedback Toast */}
          {feedbackToast && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold transition-all duration-200 animate-in slide-in-from-bottom-5 ${
                feedbackToast.type === 'success'
                  ? 'bg-emerald-900 text-white'
                  : feedbackToast.type === 'error'
                  ? 'bg-rose-900 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {feedbackToast.type === 'success' ? (
                <CheckCircle2 className="size-4 text-emerald-400" />
              ) : feedbackToast.type === 'error' ? (
                <AlertCircle className="size-4 text-rose-400" />
              ) : (
                <Info className="size-4 text-blue-400" />
              )}
              <span>{feedbackToast.message}</span>
            </div>
          )}

          {/* High Level Metrics / Summaries */}
          <TransformationRulesSummary summaryMetrics={summaryMetrics} />

          {/* Filter & Search Bar */}
          <TransformationRulesFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onApplySearch={applySearch}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />

          {/* Rules Table */}
          <TransformationRulesTable
            rules={rules}
            isLoading={isLoading}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 rounded-lg border shadow-xs sm:px-6">
              <div className="hidden sm:block">
                <p className="text-xs text-slate-700">
                  Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                  <span className="font-semibold">{pagination.totalPages}</span> (
                  <span className="font-semibold">{pagination.total}</span> total results)
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="relative inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="relative inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        <DeleteRuleModal
          isOpen={deleteModalOpen}
          rule={selectedRule}
          isDeleting={isDeleting}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AppShell>
  );
}
