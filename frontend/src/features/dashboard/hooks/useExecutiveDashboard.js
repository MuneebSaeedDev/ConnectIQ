import { useQuery } from '@tanstack/react-query';
import { getExecutiveDashboard } from '../services/executiveDashboard.api';

/**
 * Server state for SCR-014 — React Query, matching useDashboardSummary's
 * pattern (agent.md §4.1). `dateRange` is included in the query key so
 * switching 7d/30d/90d/1yr triggers a real refetch once MOD-009 exposes
 * a range-aware endpoint; today's mock fallback only has one 30-day
 * dataset and ignores the range param (documented mock limitation, see
 * executiveDashboard.api.js).
 */
export function useExecutiveDashboard(dateRange) {
  return useQuery({
    queryKey: ['dashboard', 'executive', dateRange],
    queryFn: () => getExecutiveDashboard(dateRange),
    refetchInterval: 30_000,
  });
}
