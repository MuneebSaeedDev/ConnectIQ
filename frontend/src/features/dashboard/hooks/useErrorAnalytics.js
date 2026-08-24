import { useQuery } from '@tanstack/react-query';
import { getErrorAnalytics } from '../services/errorAnalytics.api';

/**
 * Server state for SCR-021 — Error Analytics Dashboard. React Query,
 * matching the MOD-009 sibling pattern (useExecutionStatistics): `range`
 * is threaded into the query key and forwarded as `?range=`, with a 30s
 * refetch. See errorAnalytics.api.js for the mock's range limitation.
 */
export function useErrorAnalytics(range) {
  return useQuery({
    queryKey: ['dashboard', 'error-analytics', range],
    queryFn: () => getErrorAnalytics(range),
    refetchInterval: 30_000,
  });
}
