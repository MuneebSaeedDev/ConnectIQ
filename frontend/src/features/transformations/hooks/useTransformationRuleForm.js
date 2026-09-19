import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createTransformationRule, fetchTransformationRuleById, updateTransformationRule } from '../services/transformationRules.api';

export function useTransformationRuleForm(ruleId = null) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [feedbackError, setFeedbackError] = useState(null);

  // If ruleId is provided, fetch existing rule for editing
  const { data: existingRule, isLoading: isLoadingRule } = useQuery({
    queryKey: ['transformation-rule', ruleId],
    queryFn: () => fetchTransformationRuleById(ruleId),
    enabled: !!ruleId,
  });

  const createMutation = useMutation({
    mutationFn: createTransformationRule,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['transformation-rules']);
      navigate('/transformations/rules', {
        state: { message: 'Rule successfully created', type: 'success' }
      });
    },
    onError: (error) => {
      setFeedbackError(error.message || 'Failed to create transformation rule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => updateTransformationRule(ruleId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['transformation-rules']);
      queryClient.invalidateQueries(['transformation-rule', ruleId]);
      navigate('/transformations/rules', {
        state: { message: 'Rule successfully updated', type: 'success' }
      });
    },
    onError: (error) => {
      setFeedbackError(error.message || 'Failed to update transformation rule');
    },
  });

  return {
    existingRule,
    isLoadingRule,
    createRule: createMutation.mutateAsync,
    isCreating: createMutation.isLoading || createMutation.isPending,
    updateRule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading || updateMutation.isPending,
    feedbackError,
    clearFeedbackError: () => setFeedbackError(null),
  };
}
