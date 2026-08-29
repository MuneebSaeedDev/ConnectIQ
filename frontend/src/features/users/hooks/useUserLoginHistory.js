import { useQuery } from '@tanstack/react-query';
import { getUserLoginHistory } from '../services/userLoginHistory.api';

/**
 * React Query hook for the User Login History Screen (SCR-038).
 *
 * Keyed by the org scope + route `:id` so each user has an independent
 * cache entry. A read-only log view: `staleTime: 30s` and
 * `refetchOnWindowFocus: false` match the sibling read screens
 * (useUserActivityHistory / useUserDetails / useUserProfile) to avoid
 * surprising flicker on a static record. Disabled until both ids are
 * present.
 */
export function useUserLoginHistory(orgId, userId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', 'login-history', userId],
    queryFn: () => getUserLoginHistory(orgId, userId),
    enabled: Boolean(orgId) && Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
