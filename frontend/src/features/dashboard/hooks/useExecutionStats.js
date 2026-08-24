import { useQuery } from '@tanstack/react-query';
import { getExecutionStats } from '../services/executionStats.api';

/**
 * Server state for SCR-020 — React Query, matching
 * useDestinationHealth/useSourceHealth/useSystemHealth's pattern
 * (agent.md §4.1). `timeRange` is included in the query key, mirroring
 * the sibling range-aware pattern — see executionStats.api.js for the
 * mock's range limitation.
 */
export function useExecutionStats(timeRange) {
  return useQuery({
    queryKey: ['dashboard', 'executions', timeRange],
    queryFn: () => getExecutionStats(timeRange),
    refetchInterval: 30_000,
  });
}
