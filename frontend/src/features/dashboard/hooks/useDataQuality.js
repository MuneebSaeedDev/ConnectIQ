import { useQuery } from '@tanstack/react-query';
import { getDataQuality } from '../services/dataQuality.api';

/**
 * Server state for SCR-016 — React Query, matching
 * usePipelineOverview/useExecutiveDashboard's pattern (agent.md §4.1).
 * `dateRange` is included in the query key, mirroring
 * usePipelineOverview's range-aware pattern — see dataQuality.api.js
 * for the mock's range limitation.
 */
export function useDataQuality(dateRange) {
  return useQuery({
    queryKey: ['dashboard', 'data-quality', dateRange],
    queryFn: () => getDataQuality(dateRange),
    refetchInterval: 30_000,
  });
}
