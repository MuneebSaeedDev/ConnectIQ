import { useQuery } from '@tanstack/react-query';
import { getUserDetails } from '../services/userDetails.api';

/**
 * React Query hook for the User Details Screen (SCR-035).
 *
 * Keyed by the org scope + route `:id` so each user has an independent
 * cache entry. A read-only detail view: `staleTime: 30s` allows a
 * background refresh when the user returns to the tab is disabled
 * (`refetchOnWindowFocus: false`) to avoid surprising flicker on a
 * static record, matching the sibling read screens. Disabled until both
 * ids are present.
 */
export function useUserDetails(orgId, userId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', 'detail', userId],
    queryFn: () => getUserDetails(orgId, userId),
    enabled: Boolean(orgId) && Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
