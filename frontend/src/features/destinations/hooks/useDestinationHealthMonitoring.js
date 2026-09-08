import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ORG_ID,
  DEFAULT_DESTINATION_HEALTH_DATA,
  getDestinationHealth,
  runDestinationHealthCheck,
  runAllDestinationHealthChecks,
  acknowledgeDestinationAlert,
  testDestinationConnectivity,
} from '../services/destinationHealthMonitoring.api';

/**
 * Custom hook to manage Destination Health Monitoring state, queries, and mutations.
 */
export function useDestinationHealthMonitoring(destinationId = 'dest_sf_prod_01', orgId = ORG_ID) {
  const queryKey = useMemo(() => ['destination-health', orgId, destinationId], [orgId, destinationId]);

  // Main health data query
  const {
    data: fetchedData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getDestinationHealth(orgId, destinationId),
    staleTime: 30_000,
  });

  // Local overrides/overlaid state for live interactions
  const [localChecks, setLocalChecks] = useState(null);
  const [localAlerts, setLocalAlerts] = useState(null);
  const [runningCheckId, setRunningCheckId] = useState(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeLogItem, setActiveLogItem] = useState(null);
  const [activeAlertDetails, setActiveAlertDetails] = useState(null);
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historyPage, setHistoryPage] = useState(1);
  const [announcement, setAnnouncement] = useState('');

  // Combined data with local mutation overlays
  const data = useMemo(() => {
    const base = fetchedData || DEFAULT_DESTINATION_HEALTH_DATA;
    return {
      ...base,
      healthChecks: localChecks || base.healthChecks,
      alerts: localAlerts || base.alerts,
    };
  }, [fetchedData, localChecks, localAlerts]);

  // Filtered and paginated connection history
  const filteredHistory = useMemo(() => {
    const list = data.connectionHistory || [];
    return list.filter((item) => {
      const matchesSearch =
        !historySearch ||
        item.userProcess.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.time.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.authentication.toLowerCase().includes(historySearch.toLowerCase());

      const matchesFilter =
        historyFilter === 'All' || item.result.toLowerCase() === historyFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [data.connectionHistory, historySearch, historyFilter]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage));
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, historyPage]);

  // Run single health check mutation
  const handleRunCheck = useCallback(
    async (checkId) => {
      try {
        setRunningCheckId(checkId);
        setAnnouncement(`Running check ${checkId}...`);
        const result = await runDestinationHealthCheck(orgId, destinationId, checkId);

        setLocalChecks((prev) => {
          const current = prev || data.healthChecks;
          return current.map((chk) =>
            chk.id === checkId
              ? {
                  ...chk,
                  lastExecuted: result.lastExecuted || 'Just now',
                  duration: result.duration || chk.duration,
                  status: result.status || chk.status,
                  result: result.result || chk.result,
                }
              : chk
          );
        });
        setAnnouncement(`Health check completed: ${result.result || 'Success'}`);
      } catch (err) {
        setAnnouncement(`Failed to run health check: ${err.message}`);
      } finally {
        setRunningCheckId(null);
      }
    },
    [orgId, destinationId, data.healthChecks]
  );

  // Run all health checks
  const handleRunAllChecks = useCallback(async () => {
    try {
      setIsRunningAll(true);
      setAnnouncement('Running all health checks...');
      await runAllDestinationHealthChecks(orgId, destinationId);

      setLocalChecks((prev) => {
        const current = prev || data.healthChecks;
        return current.map((chk) => ({
          ...chk,
          lastExecuted: 'Just now',
          status: chk.id === 'chk-7' ? 'Healthy' : chk.status,
        }));
      });
      setAnnouncement('All 8 health checks executed successfully.');
    } catch (err) {
      setAnnouncement(`Failed to run all checks: ${err.message}`);
    } finally {
      setIsRunningAll(false);
    }
  }, [orgId, destinationId, data.healthChecks]);

  // Acknowledge alert
  const handleAcknowledgeAlert = useCallback(
    async (alertId) => {
      try {
        await acknowledgeDestinationAlert(orgId, destinationId, alertId);
        setLocalAlerts((prev) => {
          const current = prev || data.alerts;
          return current.map((alt) =>
            alt.id === alertId ? { ...alt, status: 'Acknowledged' } : alt
          );
        });
        setAnnouncement(`Alert ${alertId} acknowledged.`);
      } catch (err) {
        setAnnouncement(`Failed to acknowledge alert: ${err.message}`);
      }
    },
    [orgId, destinationId, data.alerts]
  );

  // Run test connection
  const handleTestConnection = useCallback(async () => {
    try {
      setIsTestingConn(true);
      setAnnouncement('Testing destination connectivity...');
      const res = await testDestinationConnectivity(orgId, destinationId);
      setTestResult(res);
      setAnnouncement(`Connection test successful. Status: ${res.status}`);
    } catch (err) {
      setTestResult({ success: false, status: 'Failed', message: err.message });
      setAnnouncement(`Connection test failed: ${err.message}`);
    } finally {
      setIsTestingConn(false);
    }
  }, [orgId, destinationId]);

  // Export report simulation
  const handleExportReport = useCallback(() => {
    const reportContent = JSON.stringify(data, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `destination-health-report-${destinationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAnnouncement('Health report exported successfully.');
  }, [data, destinationId]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    runningCheckId,
    isRunningAll,
    isTestingConn,
    testResult,
    setTestResult,
    activeLogItem,
    setActiveLogItem,
    activeAlertDetails,
    setActiveAlertDetails,
    diagnosticsExpanded,
    setDiagnosticsExpanded,
    historySearch,
    setHistorySearch,
    historyFilter,
    setHistoryFilter,
    historyPage,
    setHistoryPage,
    totalPages,
    paginatedHistory,
    totalHistoryCount: filteredHistory.length,
    announcement,
    handleRunCheck,
    handleRunAllChecks,
    handleAcknowledgeAlert,
    handleTestConnection,
    handleExportReport,
  };
}
