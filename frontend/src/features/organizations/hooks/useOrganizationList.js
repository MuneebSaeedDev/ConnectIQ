import { useQuery } from '@tanstack/react-query';
import { getOrganizationList } from '../services/organizationList.api';

/**
 * React Query hook for the Organization List Screen (SCR-024).
 *
 * Filters are passed to the service so a real MOD-004 endpoint could
 * apply them server-side; against the current mock they are echoed but
 * the client applies the effective search/filter over the returned
 * rows. `refetchInterval` mirrors the MOD-009 dashboard cadence (30s).
 */
export function useOrganizationList(filters) {
  return useQuery({
    queryKey: ['organizations', 'list', filters],
    queryFn: () => getOrganizationList(filters),
    refetchInterval: 30_000,
  });
}
