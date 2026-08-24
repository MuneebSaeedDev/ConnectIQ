import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/dashboard.api';

/**
 * Server state for SCR-009 — owned by React Query, not Redux, per
 * agent.md §4.1 (Redux for shared client state, React Query for
 * server data). A 30s refetch interval keeps "Updated Xm ago"
 * reasonably current without a real-time push channel (that's
 * SCR-023's unbuilt Socket.IO scope, not this screen's).
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30_000,
  });
}
