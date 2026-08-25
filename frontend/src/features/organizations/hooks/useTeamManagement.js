import { useQuery } from '@tanstack/react-query';
import { getTeamManagement } from '../services/teamManagement.api';

/**
 * React Query hook for the Team Management Screen (SCR-030).
 *
 * Scoped to the organization in the route (`orgId`). Filters are passed
 * to the service so a real MOD-004 endpoint could apply them
 * server-side; against the current mock they are echoed but the client
 * applies the effective search/filter/sort over the returned rows.
 * `refetchInterval` mirrors the SCR-029 department-management cadence
 * (30s) and is disabled until an org id is present.
 */
export function useTeamManagement(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'teams', filters],
    queryFn: () => getTeamManagement(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
