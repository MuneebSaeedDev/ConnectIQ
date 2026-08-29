import { useQuery } from '@tanstack/react-query';
import { getUserPermissions } from '../services/userPermissions.api';

/**
 * React Query hook for the User Permission Management Screen (SCR-039).
 *
 * Keyed by the org scope + route `:id` so each user's permission record
 * has an independent cache entry. `staleTime: 30s` and
 * `refetchOnWindowFocus: false` match the sibling read screens: the
 * screen holds unsaved local edits, so a focus-triggered refetch would
 * be disruptive. Disabled until both ids are present.
 */
export function useUserPermissions(orgId, userId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', 'permissions', userId],
    queryFn: () => getUserPermissions(orgId, userId),
    enabled: Boolean(orgId) && Boolean(userId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
