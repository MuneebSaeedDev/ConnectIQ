import { useQuery } from '@tanstack/react-query';

import { getRoles } from '../services/roleList.api';

/**
 * React Query hook for the Role List Screen (SCR-040). Mirrors the
 * users/useUserList pattern: org-scoped key, filter-scoped cache,
 * background refresh every 30s. `getRoles` handles the MOD-003
 * mock-boundary fallback internally, so this hook never throws for a
 * missing backend — it resolves with `mocked: true` data instead.
 */
export function useRoleList(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'roles', filters],
    queryFn: () => getRoles(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
