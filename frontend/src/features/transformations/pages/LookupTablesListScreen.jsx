import React, { useState } from 'react';
import AppShell from '../../shell/components/AppShell';
import { useLookupTables } from '../hooks/useLookupTables';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Components
import LookupTablesHeader from '../components/lookupTables/LookupTablesHeader';
import LookupTableStats from '../components/lookupTables/LookupTableStats';
import LookupTablesFilter from '../components/lookupTables/LookupTablesFilter';
import LookupTablesToolbar from '../components/lookupTables/LookupTablesToolbar';
import LookupTablesTable from '../components/lookupTables/LookupTablesTable';
import DeleteLookupTableModal from '../components/lookupTables/DeleteLookupTableModal';
import LookupTestDrawer from '../components/lookupTables/LookupTestDrawer';
import CreateLookupTableDrawer from '../components/lookupTables/CreateLookupTableDrawer';

export default function LookupTablesListScreen() {
  const {
    tables,
    pagination,
    stats,
    isLoading,
    isError,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedSource,
    setSelectedSource,
    currentPage,
    setCurrentPage,
    resetFilters,

    // Bulk actions
    selectedTableIds,
    handleSelectAll,
    handleSelectOne,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,

    // Single actions
    toggleTableStatus,
    deleteTable,
    createTable,
    isDeleting,
    refetch,
  } = useLookupTables();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTableForDeletion, setSelectedTableForDeletion] = useState(null);

  const [testDrawerOpen, setTestDrawerOpen] = useState(false);
  const [selectedTableForTesting, setSelectedTableForTesting] = useState(null);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (type, message) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleTableStatus(id);
      showToast('success', 'Lookup table status updated.');
    } catch {
      showToast('error', 'Failed to update table status.');
    }
  };

  const handleOpenDelete = (table) => {
    setSelectedTableForDeletion(table);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTableForDeletion) return;
    try {
      await deleteTable(selectedTableForDeletion._id || selectedTableForDeletion.id);
      setDeleteModalOpen(false);
      setSelectedTableForDeletion(null);
      showToast('success', `Lookup table "${selectedTableForDeletion.name}" deleted.`);
    } catch {
      showToast('error', 'Failed to delete table.');
    }
  };

  const handleOpenTest = (table) => {
    setSelectedTableForTesting(table);
    setTestDrawerOpen(true);
  };

  const handleCreateNewTable = async (tableData) => {
    try {
      await createTable(tableData);
      showToast('success', `Lookup table "${tableData.name}" created successfully.`);
    } catch {
      showToast('error', 'Failed to create lookup table.');
    }
  };

  const handleBulkAction = async (actionFn, successMessage) => {
    try {
      await actionFn();
      showToast('success', successMessage);
    } catch {
      showToast('error', 'Failed to complete bulk action');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tables, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'lookup-tables-export.json';
    a.click();
    showToast('info', 'Lookup tables exported successfully.');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Lookup Tables']}>
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

          <LookupTablesHeader
            onCreateTable={() => setCreateDrawerOpen(true)}
            onImportTables={() => showToast('info', 'Import dialog opened')}
            onExportTables={handleExport}
            onRefresh={refetch}
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

          <LookupTableStats stats={stats} />

          <LookupTablesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onApplySearch={() => {}}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            onResetFilters={resetFilters}
          />

          <LookupTablesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedType}
            onCategoryChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedRuleIds={selectedTableIds}
            paginatedRules={tables}
            onSelectAll={handleSelectAll}
            onBulkActivate={() => handleBulkAction(handleBulkActivate, 'Tables activated')}
            onBulkDeactivate={() => handleBulkAction(handleBulkDeactivate, 'Tables deactivated')}
            onBulkDelete={() => handleBulkAction(handleBulkDelete, 'Tables deleted')}
            onResetFilters={resetFilters}
          />

          <LookupTablesTable
            tables={tables}
            isLoading={isLoading}
            selectedTableIds={selectedTableIds}
            onSelectTable={handleSelectOne}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
            onEdit={(table) => showToast('info', `Edit configuration for: ${table.name}`)}
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

      <DeleteLookupTableModal
        isOpen={deleteModalOpen}
        table={selectedTableForDeletion}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <LookupTestDrawer
        isOpen={testDrawerOpen}
        table={selectedTableForTesting}
        onClose={() => setTestDrawerOpen(false)}
      />

      <CreateLookupTableDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreate={handleCreateNewTable}
      />
    </AppShell>
  );
}
