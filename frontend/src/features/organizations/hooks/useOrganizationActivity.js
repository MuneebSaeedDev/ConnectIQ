import { useQuery } from '@tanstack/react-query';
import { getOrganizationActivity } from '../services/organizationActivity.api';

/**
 * React Query hook for the Organization Activity Screen (SCR-031).
 *
 * Scoped to the organization in the route (`orgId`). Filters (search,
 * event/resource type, user, department, team, status, severity, saved
 * view, sort) are passed to the service so a real MOD-004 activity
 * endpoint could apply them server-side; against the current mock they
 * are echoed but the client applies the effective search/filter/sort
 * over the returned rows. `refetchInterval` mirrors the SCR-030
 * team-management cadence (30s) — activity is a live operational feed —
 * and is disabled until an org id is present.
 */
export function useOrganizationActivity(orgId, filters) {
  return useQuery({
    queryKey: ['organizations', orgId, 'activity', filters],
    queryFn: () => getOrganizationActivity(orgId, filters),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
}
