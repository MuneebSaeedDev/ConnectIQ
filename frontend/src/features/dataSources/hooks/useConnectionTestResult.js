import { useQuery } from '@tanstack/react-query';

import { fetchConnectionTestResult } from '../services/connectionTestResult.api';

/**
 * React Query hook for the Connection Test Result Screen (SCR-055).
 * Mirrors the roles/useRoleList pattern: org-scoped key, per-connection
 * cache. `fetchConnectionTestResult` handles the MOD-006 mock-boundary
 * fallback internally, so this hook never throws for a missing backend —
 * it resolves with `mocked: true` data instead. Unlike the dashboards
 * this is a one-shot report, so no background refetch interval.
 */
export function useConnectionTestResult(orgId, connectionId) {
  return useQuery({
    queryKey: ['organizations', orgId, 'data-sources', connectionId ?? 'current', 'test-result'],
    queryFn: ({ signal }) => fetchConnectionTestResult(orgId, connectionId, { signal }),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}
