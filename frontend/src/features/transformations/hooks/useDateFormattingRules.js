import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDateFormattingRules,
  deleteDateFormattingRule,
  updateDateFormattingRule,
  createDateFormattingRule
} from '../services/dateFormatting.api';

export function useDateFormattingRules(filters = {}) {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['dateFormattingRules', filters],
    queryFn: () => fetchDateFormattingRules(filters),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDateFormattingRule(id),
    onSuccess: () => queryClient.invalidateQueries(['dateFormattingRules'])
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateDateFormattingRule(id, updates),
    onSuccess: () => queryClient.invalidateQueries(['dateFormattingRules'])
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      const all = rulesQuery.data?.rules || [];
      const item = all.find(r => r.id === id);
      if (item) {
        return createDateFormattingRule({
          ...item,
          ruleName: `${item.ruleName} (Copy)`,
          status: 'draft'
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['dateFormattingRules'])
  });

  return {
    rules: rulesQuery.data,
    stats: rulesQuery.data?.stats,
    isLoading: rulesQuery.isLoading,
    isError: rulesQuery.isError,
    refetch: rulesQuery.refetch,
    deleteRule: (id) => deleteMutation.mutateAsync(id),
    toggleRuleStatus: (id, status) => updateMutation.mutateAsync({ id, updates: { status } }),
    duplicateRule: (id) => duplicateMutation.mutateAsync(id)
  };
}
