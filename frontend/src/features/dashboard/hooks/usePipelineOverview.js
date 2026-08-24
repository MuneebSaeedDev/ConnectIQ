import { useQuery } from '@tanstack/react-query';
import { getPipelineOverview } from '../services/pipelineOverview.api';

/**
 * Server state for SCR-015 — React Query, matching
 * useDashboardSummary/useExecutiveDashboard's pattern (agent.md §4.1).
 * `dateRange` is included in the query key, mirroring
 * useExecutiveDashboard's range-aware pattern — see
 * pipelineOverview.api.js for the mock's range limitation.
 */
export function usePipelineOverview(dateRange) {
  return useQuery({
    queryKey: ['dashboard', 'pipelines', dateRange],
    queryFn: () => getPipelineOverview(dateRange),
    refetchInterval: 30_000,
  });
}
