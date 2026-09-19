import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TypeConversionRulesHeader } from '../components/typeConversion/TypeConversionRulesHeader';
import { TypeConversionRulesStats } from '../components/typeConversion/TypeConversionRulesStats';
import { TypeConversionRulesFilters } from '../components/typeConversion/TypeConversionRulesFilters';
import { TypeConversionRulesContainer } from '../components/typeConversion/TypeConversionRulesContainer';
import { useTypeConversionRules } from '../hooks/useTypeConversionRules';
import { DeleteConversionRuleDialog } from '../components/typeConversion/DeleteConversionRuleDialog';
import AppShell from '../../shell/components/AppShell';

const TypeConversionRulesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search and filter state
  const [filters, setFilters] = useState({
    search: '',
    sourceType: 'All',
    targetType: 'All',
    status: 'All',
    category: 'All',
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortDir: 'desc'
  });

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // Fetch rules data
  const {
    rules,
    stats,
    pagination,
    isLoading,
    isError,
    refetch,
    deleteRule,
    toggleStatus,
    duplicateRule
  } = useTypeConversionRules(filters);

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
    navigate('/transformations/type-conversion/new');
  };

  const handleEdit = (id) => {
    navigate(`/transformations/type-conversion/${id}/edit`);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete) {
      await deleteRule(ruleToDelete.id);
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleDuplicate = async (id) => {
    await duplicateRule(id);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleStatus(id, currentStatus);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Transformations', 'Type Conversion Rules']}>
      <div className="flex flex-col h-full bg-[#f8fafc]">
        {/* Page Header */}
        <TypeConversionRulesHeader
          onCreateClick={handleCreateNew}
          onRefresh={refetch}
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Stats Bar */}
            <TypeConversionRulesStats stats={stats} isLoading={isLoading} />

            <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm flex flex-col">
              {/* Search and Filters */}
              <TypeConversionRulesFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              {/* Data Table & Matrix Container */}
              <TypeConversionRulesContainer
                data={rules || []}
                pagination={pagination}
                filters={filters}
                isLoading={isLoading}
                isError={isError}
                onTableChange={handleTableChange}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConversionRuleDialog
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          rule={ruleToDelete}
        />
      </div>
    </AppShell>
  );
};

export default TypeConversionRulesScreen;
