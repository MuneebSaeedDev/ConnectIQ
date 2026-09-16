import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPipelineTemplates, instantiateTemplate } from '../services/pipelineTemplates.api';

export function usePipelineTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstantiating, setIsInstantiating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const { data: templates = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pipelines', 'templates', selectedCategory, searchQuery],
    queryFn: () => getPipelineTemplates(selectedCategory, searchQuery),
    refetchOnWindowFocus: false,
  });

  const handleUseTemplate = async (template, customName) => {
    setIsInstantiating(true);
    try {
      const res = await instantiateTemplate(template.id, customName || template.title);
      setActionFeedback({
        type: 'success',
        message: `Pipeline created from template "${template.title}". Redirecting to builder...`,
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
    }
  };

  return {
    templates,
    isLoading,
    isError,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    handleUseTemplate,
    isInstantiating,
    actionFeedback,
  };
}
