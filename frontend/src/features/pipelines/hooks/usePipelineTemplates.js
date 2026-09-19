import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPipelineTemplates, instantiateTemplate } from '../services/pipelineTemplates.api';

export function usePipelineTemplates() {
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    ownership: ['system', 'organization', 'personal'],
    status: ['active', 'draft'] // archived unchecked by default
  });

  const [isInstantiating, setIsInstantiating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const { data: templates = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pipelines', 'templates', filters],
    queryFn: () => getPipelineTemplates(filters),
    refetchOnWindowFocus: false,
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleUseTemplate = async (template, config) => {
    setIsInstantiating(true);
    try {
      const payload = {
         name: config?.name || `Copy of ${template.title}`,
         ...config
      };
      const res = await instantiateTemplate(template.id, payload);
      setActionFeedback({
        type: 'success',
        message: `Pipeline created from template "${template.title}". Redirecting...`,
        pipelineId: res.pipelineId,
      });
      return res;
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Failed to instantiate template.',
      });
      return null;
    } finally {
      setIsInstantiating(false);
      // Auto clear feedback
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  return {
    templates,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    updateFilters,
    handleUseTemplate,
    isInstantiating,
    actionFeedback,
    clearFeedback: () => setActionFeedback(null)
  };
}
