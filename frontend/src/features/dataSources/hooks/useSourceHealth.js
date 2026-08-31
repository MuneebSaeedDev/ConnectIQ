import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSourceHealth } from '../services/sourceHealthMonitoring.api';

/**
 * Source-health telemetry for SCR-056 (Source Health Monitoring Screen).
 * Polls every 30s to keep availability / latency / incident state fresh,
 * mirroring the sibling useDataSourceList hook. `sourceId` (the route's
 * entry context) and `filters` participate in the query key so range /
 * health-filter changes refetch. `placeholderData: keepPreviousData`
 * (TanStack Query v5) retains the prior rows across a filter/range change
 * so the grid doesn't flash its skeleton on every refetch.
 */
export function useSourceHealth(orgId, sourceId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'source-health', sourceId, filters],
    queryFn: () => getSourceHealth(orgId, sourceId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}
