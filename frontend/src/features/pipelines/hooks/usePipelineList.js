import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPipelines,
  triggerPipelineRun,
  setPipelineStatus,
  duplicatePipeline,
  deletePipeline,
  bulkOperatePipelines,
} from '../services/pipelineList.api';

/**
 * Pipeline catalog query and mutation hook for SCR-063 (Pipeline Library Screen).
 * Polls every 30s for live telemetry & execution updates.
 */
export function usePipelineList(orgId = 'current', filters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['organizations', orgId, 'pipelines', filters],
    queryFn: () => getPipelines(orgId, filters),
    refetchInterval: 30_000,
    keepPreviousData: true,
  });

  const runMutation = useMutation({
    mutationFn: (pipelineId) => triggerPipelineRun(pipelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'pipelines'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ pipelineId, status }) => setPipelineStatus(pipelineId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'pipelines'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (pipelineId) => duplicatePipeline(pipelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'pipelines'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pipelineId) => deletePipeline(pipelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'pipelines'] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action, payload }) => bulkOperatePipelines(ids, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'pipelines'] });
    },
  });

  return {
    ...query,
    runPipeline: runMutation.mutateAsync,
    isRunning: runMutation.isPending,
    setStatus: statusMutation.mutateAsync,
    isSettingStatus: statusMutation.isPending,
    duplicatePipeline: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    deletePipeline: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    bulkOperate: bulkMutation.mutateAsync,
    isBulkOperating: bulkMutation.isPending,
  };
}
