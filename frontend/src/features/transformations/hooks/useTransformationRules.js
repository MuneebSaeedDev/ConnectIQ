import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransformationRules,
  toggleTransformationRuleStatus,
  deleteTransformationRule,
} from '../services/transformationRules.api';

export function useTransformationRulesList() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_LIMIT = 15; // To show high density

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'transformation-rules',
      debouncedSearch,
      selectedCategory,
      selectedStatus,
      currentPage,
    ],
    queryFn: () =>
      fetchTransformationRules({
        search: debouncedSearch,
        category: selectedCategory,
        status: selectedStatus,
        page: currentPage,
        limit: PAGE_LIMIT,
      }),
    keepPreviousData: true,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleTransformationRuleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['transformation-rules']);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteTransformationRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['transformation-rules']);
    },
  });

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    // Simple debounce would normally go here, simplified for react hook:
  }, []);

  const applySearch = useCallback(() => {
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return {
    rules: data?.rules || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 },
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
    toggleRuleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isLoading || toggleStatusMutation.isPending,
    deleteRule: deleteRuleMutation.mutateAsync,
    isDeleting: deleteRuleMutation.isLoading || deleteRuleMutation.isPending,
  };
}
