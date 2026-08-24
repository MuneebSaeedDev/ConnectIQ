import { useQuery } from '@tanstack/react-query';
import { getOrganizationSettings } from '../services/organizationSettings.api';

/**
 * React Query hook for the Organization Setting Screen (SCR-028).
 *
 * Keyed by the route `:id` so each organization has an independent cache
 * entry. Like the Edit hook (SCR-027) — and unlike the Details hook
 * (SCR-025) — there is NO `refetchInterval`: a settings form must not
 * silently refetch and clobber the user's in-progress changes.
 * `staleTime: Infinity` keeps the loaded baseline stable for the editing
 * session; the user reloads explicitly via Reset/Retry. Disabled until
 * an id is present.
 */
export function useOrganizationSettings(orgId) {
  return useQuery({
    queryKey: ['organizations', 'settings', orgId],
    queryFn: () => getOrganizationSettings(orgId),
    enabled: Boolean(orgId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
