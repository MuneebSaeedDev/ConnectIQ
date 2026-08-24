import { useQuery } from '@tanstack/react-query';
import { getSourceHealth } from '../services/sourceHealth.api';

/**
 * Server state for SCR-018 — React Query, matching
 * useSystemHealth/useDataQuality/usePipelineOverview's pattern
 * (agent.md §4.1). `timeRange` is included in the query key, mirroring
 * useSystemHealth's range-aware pattern — see sourceHealth.api.js for
 * the mock's range limitation.
 */
export function useSourceHealth(timeRange) {
  return useQuery({
    queryKey: ['dashboard', 'source-health', timeRange],
    queryFn: () => getSourceHealth(timeRange),
    refetchInterval: 30_000,
  });
}
