import { useState, useCallback, useEffect } from 'react';
import { lookupTablesApi } from '../services/lookupTables.api';

export function useLookupTables() {
  const [tables, setTables] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, disabled: 0, usedInPipelines: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk actions
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await lookupTablesApi.getTables({
        page: currentPage,
        search: searchQuery,
        type: selectedType,
        status: selectedStatus,
        source: selectedSource,
      });

      const fetchedTables = response.tables || [];
      setTables(fetchedTables);
      setPagination(response.pagination || { total: fetchedTables.length, page: 1, limit: 10, totalPages: 1 });

      if (response.stats) {
        setStats(response.stats);
      } else {
        setStats({
          total: response.pagination?.total || fetchedTables.length,
          active: fetchedTables.filter((t) => t.status === 'Active').length,
          draft: fetchedTables.filter((t) => t.status === 'Draft').length,
          disabled: fetchedTables.filter((t) => t.status === 'Disabled').length,
          usedInPipelines: fetchedTables.filter((t) => (t.pipelinesCount || 0) > 0).length,
        });
      }
    } catch (err) {
      console.error('Error in useLookupTables hook:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedType, selectedStatus, selectedSource]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setSelectedSource('All Sources');
    setCurrentPage(1);
  }, []);

  const handleSelectAll = useCallback(
    (e) => {
      if (e.target.checked) {
        setSelectedTableIds(tables.map((t) => t._id || t.id));
      } else {
        setSelectedTableIds([]);
      }
    },
    [tables]
  );

  const handleSelectOne = useCallback((id) => {
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleTableStatus = useCallback(
    async (id) => {
      await lookupTablesApi.toggleStatus(id);
      await fetchTables();
    },
    [fetchTables]
  );

  const deleteTable = useCallback(
    async (id) => {
      setIsDeleting(true);
      try {
        await lookupTablesApi.deleteTable(id);
        await fetchTables();
      } finally {
        setIsDeleting(false);
      }
    },
    [fetchTables]
  );

  const createTable = useCallback(
    async (payload) => {
      await lookupTablesApi.createTable(payload);
      await fetchTables();
    },
    [fetchTables]
  );

  const handleBulkActivate = useCallback(async () => {
    for (const id of selectedTableIds) {
      await lookupTablesApi.updateTable(id, { status: 'Active' });
    }
    setSelectedTableIds([]);
    await fetchTables();
  }, [selectedTableIds, fetchTables]);

  const handleBulkDeactivate = useCallback(async () => {
    for (const id of selectedTableIds) {
      await lookupTablesApi.updateTable(id, { status: 'Disabled' });
    }
    setSelectedTableIds([]);
    await fetchTables();
  }, [selectedTableIds, fetchTables]);

  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedTableIds) {
      await lookupTablesApi.deleteTable(id);
    }
    setSelectedTableIds([]);
    await fetchTables();
  }, [selectedTableIds, fetchTables]);

  return {
    tables,
    pagination,
    stats,
    isLoading,
    isError,

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

    selectedTableIds,
    handleSelectAll,
    handleSelectOne,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,

    toggleTableStatus,
    deleteTable,
    createTable,
    isDeleting,
    refetch: fetchTables,
  };
}
