import { useQuery } from '@tanstack/react-query';

import { getPermissionMatrix } from '../services/permissionMatrix.api';

/**
 * React Query hook for the Permission Matrix Screen (SCR-043). Mirrors the
 * roles/useRoleList pattern: org-scoped key, background refresh every 30s.
 * `getPermissionMatrix` handles the MOD-003 mock-boundary fallback
 * internally, so this hook never throws for a missing backend — it resolves
 * with `mocked: true` data instead.
 */
export function usePermissionMatrix(orgId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'permission-matrix'],
    queryFn: () => getPermissionMatrix(orgId),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
