import { useQuery } from '@tanstack/react-query';
import { getOrganizationDetails } from '../services/organizationDetails.api';

/**
 * React Query hook for the Organization Details Screen (SCR-025).
 *
 * Keyed by the route `:id` so navigating between organizations from the
 * list (SCR-024) yields an independent cache entry. `refetchInterval`
 * mirrors the MOD-009 dashboard / MOD-004 list cadence (30s) so the
 * live activity / health / audit sections stay fresh. Disabled until an
 * id is present.
 */
export function useOrganizationDetails(orgId) {
  return useQuery({
    queryKey: ['organizations', 'details', orgId],
    queryFn: () => getOrganizationDetails(orgId),
    enabled: Boolean(orgId),
    refetchInterval: 30_000,
  });
}
