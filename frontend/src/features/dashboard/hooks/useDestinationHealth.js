import { useQuery } from '@tanstack/react-query';
import { getDestinationHealth } from '../services/destinationHealth.api';

/**
 * Server state for SCR-019 — React Query, matching
 * useSourceHealth/useSystemHealth/useDataQuality's pattern
 * (agent.md §4.1). `timeRange` is included in the query key, mirroring
 * useSourceHealth's range-aware pattern — see destinationHealth.api.js
 * for the mock's range limitation.
 */
export function useDestinationHealth(timeRange) {
  return useQuery({
    queryKey: ['dashboard', 'destination-health', timeRange],
    queryFn: () => getDestinationHealth(timeRange),
    refetchInterval: 30_000,
  });
}
