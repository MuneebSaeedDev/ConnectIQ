import { useQuery } from '@tanstack/react-query';
import { getEditableOrganization } from '../services/editOrganization.api';

/**
 * React Query hook for the Edit Organization Screen (SCR-027).
 *
 * Keyed by the route `:id` so each organization has an independent
 * cache entry. Unlike the Details hook (SCR-025) there is NO
 * `refetchInterval`: an edit form must not silently refetch and clobber
 * the user's in-progress changes. `staleTime: Infinity` keeps the loaded
 * baseline stable for the editing session; the user reloads explicitly
 * via Reset/Retry. Disabled until an id is present.
 */
export function useEditableOrganization(orgId) {
  return useQuery({
    queryKey: ['organizations', 'edit', orgId],
    queryFn: () => getEditableOrganization(orgId),
    enabled: Boolean(orgId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
