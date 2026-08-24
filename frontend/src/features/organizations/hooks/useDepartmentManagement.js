import { useQuery } from '@tanstack/react-query';
import { getDepartmentManagement } from '../services/departmentManagement.api';

/**
 * React Query hook for the Department Management Screen (SCR-029).
 *
 * Scoped to the organization in the route (`orgId`). Filters are passed
 * to the service so a real MOD-004 endpoint could apply them
 * server-side; against the current mock they are echoed but the client
 * applies the effective search/filter/sort over the returned rows.
 * `refetchInterval` mirrors the SCR-024 organization-list cadence (30s)
 * and is disabled until an org id is present.
 */
export function useDepartmentManagement(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'departments', filters],
    queryFn: () => getDepartmentManagement(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
