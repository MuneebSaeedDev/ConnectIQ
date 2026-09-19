import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTypeConversionRules,
  fetchTypeConversionRuleById,
  createTypeConversionRule,
  updateTypeConversionRule,
  deleteTypeConversionRule,
  testTypeConversionRule
} from '../services/typeConversion.api';

export function useTypeConversionRules(params = {}) {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['type-conversion-rules', params],
    queryFn: () => fetchTypeConversionRules(params),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createTypeConversionRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['type-conversion-rules']);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateTypeConversionRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['type-conversion-rules']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTypeConversionRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['type-conversion-rules']);
    },
  });

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    return updateMutation.mutateAsync({ id, updates: { status: nextStatus } });
  };

  const duplicateRule = async (id) => {
    const original = rulesQuery.data?.rules?.find(r => r.id === id);
    if (!original) return;
    const duplicatedPayload = {
      ...original,
      ruleName: `${original.ruleName} (Copy)`,
      status: 'draft',
      version: 'v1.0.0',
    };
    delete duplicatedPayload.id;
    return createMutation.mutateAsync(duplicatedPayload);
  };

  return {
    rules: rulesQuery.data?.rules || [],
    stats: rulesQuery.data?.stats || {
      totalRules: 0,
      activeRules: 0,
      draftRules: 0,
      disabledRules: 0,
      rulesUsedInPipelines: 0
    },
    pagination: rulesQuery.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    isLoading: rulesQuery.isLoading,
    isFetching: rulesQuery.isFetching,
    isError: rulesQuery.isError,
    error: rulesQuery.error,
    refetch: rulesQuery.refetch,
    createRule: createMutation.mutateAsync,
    updateRule: updateMutation.mutateAsync,
    deleteRule: deleteMutation.mutateAsync,
    toggleStatus,
    duplicateRule,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTypeConversionRuleDetails(id) {
  return useQuery({
    queryKey: ['type-conversion-rule', id],
    queryFn: () => fetchTypeConversionRuleById(id),
    enabled: Boolean(id),
  });
}

export function useTestConversionRule() {
  return useMutation({
    mutationFn: testTypeConversionRule,
  });
}
