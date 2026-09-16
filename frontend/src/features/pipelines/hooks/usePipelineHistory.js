import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPipelineHistory, rollbackPipeline } from '../services/pipelineHistory.api';

export function usePipelineHistory(pipelineId = 'pip_001') {
  const { data: history = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pipelines', pipelineId, 'history'],
    queryFn: () => getPipelineHistory(pipelineId),
    refetchOnWindowFocus: false,
  });

  const [selectedVersion, setSelectedVersion] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    if (history.length > 0 && !selectedVersion) {
      setSelectedVersion(history[0]);
    }
  }, [history, selectedVersion]);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleRollback = async (version) => {
    setIsRollingBack(true);
    try {
      await rollbackPipeline(pipelineId, version.id);
      setActionFeedback({
        type: 'success',
        message: `Pipeline successfully rolled back to v${version.version}.`,
      });
      refetch();
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Failed to rollback pipeline version.',
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  return {
    history,
    isLoading,
    isError,
    error,
    refetch,
    selectedVersion,
    setSelectedVersion,
    handleRollback,
    isRollingBack,
    actionFeedback,
  };
}
