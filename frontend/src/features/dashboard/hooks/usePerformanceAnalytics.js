import { useQuery } from '@tanstack/react-query';
import { getPerformanceAnalytics } from '../services/performanceAnalytics.api';

/**
 * Server state for SCR-022 — Performance Analytics Dashboard. React
 * Query, matching the MOD-009 sibling pattern (useErrorAnalytics /
 * useExecutionStatistics): `range` is threaded into the query key and
 * forwarded as `?range=`, with a 30s refetch. See
 * performanceAnalytics.api.js for the mock's range limitation.
 */
export function usePerformanceAnalytics(range) {
  return useQuery({
    queryKey: ['dashboard', 'performance-analytics', range],
    queryFn: () => getPerformanceAnalytics(range),
    refetchInterval: 30_000,
  });
}
