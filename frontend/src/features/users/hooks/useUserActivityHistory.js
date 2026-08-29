import { useQuery } from '@tanstack/react-query';
import { getUserActivityHistory } from '../services/userActivityHistory.api';

/**
 * React Query hook for the User Activity History Screen (SCR-037).
 *
 * Keyed by the org scope + route `:id` so each user has an independent
 * cache entry. A read-only log view: `staleTime: 30s` and
 * `refetchOnWindowFocus: false` match the sibling read screens
 * (useUserDetails / useUserProfile) to avoid surprising flicker on a
 * static record. Disabled until both ids are present.
 */
export function useUserActivityHistory(orgId, userId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', 'activity', userId],
    queryFn: () => getUserActivityHistory(orgId, userId),
    enabled: Boolean(orgId) && Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
