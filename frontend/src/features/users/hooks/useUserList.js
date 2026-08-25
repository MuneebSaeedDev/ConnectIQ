import { useQuery } from '@tanstack/react-query';
import { getUserList } from '../services/userList.api';

/**
 * React Query hook for the User List Screen (SCR-032).
 *
 * Scoped to the caller's organization (`orgId`). Filters are passed to
 * the service so a real MOD-005 endpoint could apply them server-side;
 * against the current mock they are echoed but the client applies the
 * effective search/filter/sort over the returned rows. `refetchInterval`
 * mirrors the SCR-030 team-management cadence (30s) and is disabled
 * until an org id is present.
 */
export function useUserList(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'users', filters],
    queryFn: () => getUserList(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
