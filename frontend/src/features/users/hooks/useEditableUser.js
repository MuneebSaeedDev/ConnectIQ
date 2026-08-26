import { useQuery } from '@tanstack/react-query';
import { getEditableUser } from '../services/editUser.api';

/**
 * React Query hook for the Edit User Screen (SCR-034).
 *
 * Keyed by the org scope + route `:id` so each user has an independent
 * cache entry. Like the Edit Organization hook (SCR-027) there is NO
 * `refetchInterval`: an edit form must not silently refetch and clobber
 * the user's in-progress changes. `staleTime: Infinity` keeps the loaded
 * baseline stable for the editing session; the user reloads explicitly
 * via Reset/Retry. Disabled until both ids are present.
 */
export function useEditableUser(orgId, userId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', 'edit', userId],
    queryFn: () => getEditableUser(orgId, userId),
    enabled: Boolean(orgId) && Boolean(userId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
