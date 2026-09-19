import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateFormattingRulesHeader } from '../components/dateFormatting/DateFormattingRulesHeader';
import { DateFormattingRulesStats } from '../components/dateFormatting/DateFormattingRulesStats';
import { DateFormattingRulesFilters } from '../components/dateFormatting/DateFormattingRulesFilters';
import { DateFormattingRulesTable } from '../components/dateFormatting/DateFormattingRulesTable';
import { useDateFormattingRules } from '../hooks/useDateFormattingRules';
import { DeleteDateFormattingRuleDialog } from '../components/dateFormatting/DeleteDateFormattingRuleDialog';
import { TestDateFormattingRuleDrawer } from '../components/dateFormatting/TestDateFormattingRuleDrawer';
import CreateDateFormattingRuleDrawer from '../components/dateFormatting/CreateDateFormattingRuleDrawer';
import AppShell from '../../shell/components/AppShell';

const DateFormattingRulesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search and filter state
  const [filters, setFilters] = useState({
    search: '',
    inputType: 'All',
    outputType: 'All',
    status: 'All',
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortDir: 'desc'
  });

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // State for test drawer
  const [testDrawerOpen, setTestDrawerOpen] = useState(false);
  const [ruleToTest, setRuleToTest] = useState(null);

  // State for create / edit drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Feedback Toast
  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (type, message) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Fetch rules data
  const {
    rules,
    stats,
    isLoading,
    isError,
    refetch,
    deleteRule,
    toggleRuleStatus,
    duplicateRule
  } = useDateFormattingRules(filters);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle pagination/sorting
  const handleTableChange = (updates) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Action handlers
  const handleCreateNew = () => {
    setEditingRule(null);
    setCreateDrawerOpen(true);
  };

  const handleEdit = (id) => {
    const found = rules?.rules?.find(r => (r.id || r._id) === id);
    if (found) {
      setEditingRule(found);
      setCreateDrawerOpen(true);
    }
  };

  const handleSaveRule = async (payload) => {
    try {
      showToast('success', editingRule ? 'Rule updated successfully' : 'Date Formatting Rule created successfully');
      setCreateDrawerOpen(false);
      setEditingRule(null);
      await refetch();
    } catch (_err) {
      showToast('error', 'Failed to save rule');
    }
  };

  const handleTest = (rule) => {
    setRuleToTest(rule);
    setTestDrawerOpen(true);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete) {
      await deleteRule(ruleToDelete.id || ruleToDelete._id);
      setDeleteModalOpen(false);
      setRuleToDelete(null);
      showToast('success', `Rule "${ruleToDelete.ruleName}" deleted.`);
    }
  };

  const handleDuplicate = async (id) => {
    await duplicateRule(id);
    showToast('success', 'Rule duplicated successfully');
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await toggleRuleStatus(id, newStatus);
    showToast('success', `Rule status changed to ${newStatus}`);
  };

  const handleImport = () => {
    showToast('info', 'Importing rules from JSON schema file...');
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules?.rules || [], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "date_formatting_rules.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Exported date formatting rules.');
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Date Formatting Rules']}>
      <div className="flex flex-col h-full bg-[#f8fafc]">
        {/* Toast alert */}
        {feedbackToast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm animate-fade-in bg-white border-slate-200 text-slate-800">
            <span className={`w-2 h-2 rounded-full ${feedbackToast.type === 'success' ? 'bg-emerald-500' : feedbackToast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <DateFormattingRulesHeader
          onCreateClick={handleCreateNew}
          onRefresh={refetch}
          onImport={handleImport}
          onExport={handleExport}
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Stats Bar */}
            <DateFormattingRulesStats stats={stats} isLoading={isLoading} />

            <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col">
              {/* Search and Filters */}
              <DateFormattingRulesFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              {/* Data Table */}
              <DateFormattingRulesTable
                data={rules?.rules || []}
                pagination={rules?.pagination || null}
                filters={filters}
                isLoading={isLoading}
                isError={isError}
                onTableChange={handleTableChange}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleStatus={handleToggleStatus}
                onTest={handleTest}
              />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteDateFormattingRuleDialog
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          rule={ruleToDelete}
        />

        {/* Test Drawer */}
        <TestDateFormattingRuleDrawer
          isOpen={testDrawerOpen}
          onClose={() => {
            setTestDrawerOpen(false);
            setRuleToTest(null);
          }}
          rule={ruleToTest}
        />

        {/* Create / Edit Drawer */}
        <CreateDateFormattingRuleDrawer
          isOpen={createDrawerOpen}
          onClose={() => {
            setCreateDrawerOpen(false);
            setEditingRule(null);
          }}
          onSubmit={handleSaveRule}
          initialRule={editingRule}
          isEditing={!!editingRule}
        />
      </div>
    </AppShell>
  );
};

export default DateFormattingRulesScreen;