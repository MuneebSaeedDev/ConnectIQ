import { useQuery } from '@tanstack/react-query';
import { getExecutionStatistics } from '../services/executionStatistics.api';

/**
 * Server state for SCR-020 — Execution Statistics Dashboard. React
 * Query, matching the MOD-009 sibling pattern
 * (useDestinationHealth/useSourceHealth): `range` is threaded into the
 * query key and forwarded as `?range=`, with a 30s refetch. See
 * executionStatistics.api.js for the mock's range limitation.
 */
export function useExecutionStatistics(range) {
  return useQuery({
    queryKey: ['dashboard', 'execution-statistics', range],
    queryFn: () => getExecutionStatistics(range),
    refetchInterval: 30_000,
  });
}
