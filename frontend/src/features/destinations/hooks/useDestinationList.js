import { useQuery } from '@tanstack/react-query';
import { getDestinations } from '../services/destinationList.api';

/**
 * Data-source catalogue for SCR-045 (Data Source List Screen).
 * Polls every 30s to keep connection status / health fresh, mirroring the
 * sibling useRoleList / useUserList hooks. `filters` participates in the
 * query key so option/search changes refetch.
 */
export function useDestinationList(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'data-sources', filters],
    queryFn: () => getDestinations(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
    keepPreviousData: true,
  });
}
