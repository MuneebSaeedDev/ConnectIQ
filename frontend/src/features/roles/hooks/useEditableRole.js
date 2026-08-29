import { useQuery } from '@tanstack/react-query';
import { getEditableRole } from '../services/editRole.api';

/**
 * React Query hook for the Edit Role Screen (SCR-042).
 *
 * Keyed by the org scope + route `:id` so each role has an independent
 * cache entry. Like the Edit User hook (SCR-034) and Edit Organization
 * hook (SCR-027) there is NO `refetchInterval`: an edit form must not
 * silently refetch and clobber the user's in-progress changes.
 * `staleTime: Infinity` keeps the loaded baseline stable for the editing
 * session; the user reloads explicitly via Reset/Retry. Disabled until
 * both ids are present. `getEditableRole` handles the MOD-003
 * mock-boundary fallback internally, so this hook never throws for a
 * missing backend — it resolves with `mocked: true` data instead.
 */
export function useEditableRole(orgId, roleId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'roles', 'edit', roleId],
    queryFn: () => getEditableRole(orgId, roleId),
    enabled: Boolean(orgId) && Boolean(roleId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
