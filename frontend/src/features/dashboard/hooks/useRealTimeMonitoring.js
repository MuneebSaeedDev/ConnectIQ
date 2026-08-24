import { useQuery } from '@tanstack/react-query';
import { getRealTimeMonitoring } from '../services/realTimeMonitoring.api';

/**
 * Server state for SCR-023 — Real-Time Monitoring Dashboard. React
 * Query, matching the MOD-009 sibling pattern
 * (useExecutionStatistics/useSystemHealth): `range` is threaded into
 * the query key and forwarded as `?range=`.
 *
 * Unlike the other MOD-009 dashboards (30s refetch), this is the live
 * monitoring surface, so it polls on a tighter 15s interval — and only
 * while the caller keeps it enabled, so the screen's Pause/Live toggle
 * can stop the polling loop. See realTimeMonitoring.api.js for the
 * mock's range/streaming limitation.
 */
export function useRealTimeMonitoring(range, { live = true } = {}) {
  return useQuery({
    queryKey: ['dashboard', 'realtime-monitoring', range],
    queryFn: () => getRealTimeMonitoring(range),
    refetchInterval: live ? 15_000 : false,
  });
}
