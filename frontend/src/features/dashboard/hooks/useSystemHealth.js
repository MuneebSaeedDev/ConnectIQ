import { useQuery } from '@tanstack/react-query';
import { getSystemHealth } from '../services/systemHealth.api';

/**
 * Server state for SCR-017 — React Query, matching
 * useDataQuality/usePipelineOverview/useExecutiveDashboard's pattern
 * (agent.md §4.1). `timeRange` is included in the query key, mirroring
 * useDataQuality's range-aware pattern — see systemHealth.api.js for
 * the mock's range limitation.
 */
export function useSystemHealth(timeRange) {
  return useQuery({
    queryKey: ['dashboard', 'system-health', timeRange],
    queryFn: () => getSystemHealth(timeRange),
    refetchInterval: 30_000,
  });
}
