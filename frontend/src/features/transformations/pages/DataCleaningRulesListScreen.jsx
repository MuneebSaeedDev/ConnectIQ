import React, { useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useDataCleaningRules } from '../hooks/useDataCleaningRules';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import CleaningRulesHeader from '../components/dataCleaning/CleaningRulesHeader';
import CleaningRulesStats from '../components/dataCleaning/CleaningRulesStats';
import CleaningRulesFilter from '../components/dataCleaning/CleaningRulesFilter';
import CleaningRulesToolbar from '../components/dataCleaning/CleaningRulesToolbar';
import CleaningRulesTable from '../components/dataCleaning/CleaningRulesTable';
import DeleteRuleModal from '../components/dataCleaning/DeleteRuleModal';
import RuleTestDrawer from '../components/dataCleaning/RuleTestDrawer';
import CreateCleaningRuleDrawer from '../components/dataCleaning/CreateCleaningRuleDrawer';

export default function DataCleaningRulesListScreen() {
  const {
    rules,
    pagination,
    stats,
    isLoading,
    isError,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedPipelineUsage,
    setSelectedPipelineUsage,
    selectedCleaningType,
    setSelectedCleaningType,
    currentPage,
    setCurrentPage,
    resetFilters,

    // Bulk selection
    selectedRuleIds,
    handleSelectAll,
    handleSelectOne,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,

    // Actions
    toggleRuleStatus,
    deleteRule,
    createRule,
    isDeleting,
  } = useDataCleaningRules();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRuleForDeletion, setSelectedRuleForDeletion] = useState(null);

  const [testDrawerOpen, setTestDrawerOpen] = useState(false);
  const [selectedRuleForTesting, setSelectedRuleForTesting] = useState(null);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (type, message) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleRuleStatus(id);
      showToast('success', 'Status updated successfully');
    } catch (_err) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleOpenDelete = (rule) => {
    setSelectedRuleForDeletion(rule);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRuleForDeletion) return;
    try {
      await deleteRule(selectedRuleForDeletion._id || selectedRuleForDeletion.ruleId);
      setDeleteModalOpen(false);
      setSelectedRuleForDeletion(null);
      showToast('success', `Rule "${selectedRuleForDeletion.name}" deleted.`);
    } catch (_err) {
      showToast('error', 'Failed to delete rule.');
    }
  };

  const handleOpenTest = (rule) => {
    setSelectedRuleForTesting(rule);
    setTestDrawerOpen(true);
  };

  const handleCreateRule = async (newRuleData) => {
    try {
      await createRule(newRuleData);
      showToast('success', `Rule "${newRuleData.name}" created successfully.`);
    } catch (_err) {
      showToast('error', 'Failed to create rule.');
    }
  };

  const handleBulkAction = async (actionFn, successMessage) => {
    try {
      await actionFn();
      showToast('success', successMessage);
    } catch (_err) {
      showToast('error', 'Failed to complete bulk action');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'data-cleaning-rules.json';
    a.click();
    showToast('info', 'Rules exported successfully');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Data Cleaning Rules']}>
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

          <CleaningRulesHeader
            onCreateRule={() => setCreateDrawerOpen(true)}
            onImportRules={() => showToast('info', 'Import dialog opened')}
            onExportRules={handleExport}
            onRefresh={() => window.location.reload()}
            isRefreshing={isLoading}
          />

          {feedbackToast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              feedbackToast.type === 'success' ? 'bg-emerald-900 text-white' :
              feedbackToast.type === 'error' ? 'bg-rose-900 text-white' :
              'bg-slate-900 text-white'
            }`}>
              {feedbackToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
               feedbackToast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> :
               <Info className="w-5 h-5 text-blue-400" />}
              <span>{feedbackToast.message}</span>
            </div>
          )}

          <CleaningRulesStats stats={stats} />

          <CleaningRulesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onApplySearch={() => {}}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPipelineUsage={selectedPipelineUsage}
            onPipelineUsageChange={setSelectedPipelineUsage}
            selectedCleaningType={selectedCleaningType}
            onCleaningTypeChange={setSelectedCleaningType}
            onResetFilters={resetFilters}
          />

          <CleaningRulesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPipelineUsage={selectedPipelineUsage}
            onPipelineUsageChange={setSelectedPipelineUsage}
            selectedRuleIds={selectedRuleIds}
            paginatedRules={rules}
            onSelectAll={handleSelectAll}
            onBulkActivate={() => handleBulkAction(handleBulkActivate, 'Rules activated')}
            onBulkDeactivate={() => handleBulkAction(handleBulkDeactivate, 'Rules deactivated')}
            onBulkDelete={() => handleBulkAction(handleBulkDelete, 'Rules deleted')}
            onResetFilters={resetFilters}
          />

          <CleaningRulesTable
            rules={rules}
            isLoading={isLoading}
            selectedRuleIds={selectedRuleIds}
            onSelectRule={handleSelectOne}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
            onEdit={(id) => showToast('info', `Edit rule ${id}`)}
            onTest={handleOpenTest}
          />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 rounded-lg shadow-xs sm:px-6">
              <div className="hidden sm:block">
                <p className="text-sm text-slate-700">
                  Showing page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} total)
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(c => c - 1)}
                  className="relative inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage(c => c + 1)}
                  className="relative inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <DeleteRuleModal
        isOpen={deleteModalOpen}
        rule={selectedRuleForDeletion}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <RuleTestDrawer
        isOpen={testDrawerOpen}
        rule={selectedRuleForTesting}
        onClose={() => setTestDrawerOpen(false)}
      />

      <CreateCleaningRuleDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreate={handleCreateRule}
      />
    </AppShell>
  );
}
