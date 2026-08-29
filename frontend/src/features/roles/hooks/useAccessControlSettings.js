import { useQuery } from '@tanstack/react-query';
import { getAccessControlSettings } from '../services/accessControlSettings.api';

/**
 * React Query hook for the Access Control Settings Screen (SCR-044).
 *
 * Like the Organization Settings hook (SCR-028), there is NO
 * `refetchInterval`: a settings form must not silently refetch and clobber
 * the user's in-progress security-policy edits. `staleTime: Infinity` keeps
 * the loaded baseline stable for the editing session; the user reloads
 * explicitly via Reset/Retry. `refetchOnWindowFocus: false` for the same
 * reason. Disabled until an org id is present.
 */
export function useAccessControlSettings(orgId) {
  return useQuery({
    queryKey: ['roles', 'access-control', orgId],
    queryFn: () => getAccessControlSettings(orgId),
    enabled: Boolean(orgId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
