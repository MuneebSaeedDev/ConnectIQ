import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDestinationHealthMonitoring } from '../hooks/useDestinationHealthMonitoring';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  FileText,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Radio,
  Sliders,
} from 'lucide-react';

/**
 * Helper to render mini SVG sparklines for KPI cards and performance overview.
 */
function Sparkline({ data = [], color = 'var(--color-primary)', height = 24, width = 64 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * Destination Health Screen (SCR-061)
 * Figma Frame: 131:105
 * Expected Route: /destinations/:id/health
 */
export default function DestinationHealthMonitoringScreen() {
  const { id = 'dest_sf_prod_01' } = useParams();

  const {
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
    totalHistoryCount,
    announcement,
    handleRunCheck,
    handleRunAllChecks,
    handleAcknowledgeAlert,
    handleTestConnection,
    handleExportReport,
  } = useDestinationHealthMonitoring(id);

  const [copiedLog, setCopiedLog] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeLogItem) setActiveLogItem(null);
        if (activeAlertDetails) setActiveAlertDetails(null);
        if (testResult) setTestResult(null);
      }
    };
    if (activeLogItem || activeAlertDetails || testResult) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeLogItem, activeAlertDetails, testResult, setActiveLogItem, setActiveAlertDetails, setTestResult]);

  const handleCopyLogs = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Destinations', 'Destination Health']}>
      {/* Screen Reader Live Region */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement ||
          (isLoading
            ? 'Loading destination health data'
            : isFetching
            ? 'Refreshing health status'
            : 'Destination health data updated')}
      </div>

      <div className="flex flex-col gap-6 pb-20">
        {isError && (
          <div className="rounded-lg border border-danger-border bg-danger-bg p-4" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-danger-strong font-medium text-xs">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <span>Failed to load live destination health data. Showing cached/fallback telemetry. ({error?.message || 'Network error'})</span>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded bg-surface-card px-2.5 py-1 text-xs font-medium text-danger-strong border border-danger-border hover:bg-surface-hover"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. TOP HEADER & METADATA BAR                                */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-text-primary">
                  Destination Health
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success-strong">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  {data.statusLabel || 'Healthy'}
                </span>
                {data.mocked && (
                  <span className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                    Sample Data
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Monitor the operational health, connectivity, authentication, performance, and reliability of this destination.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/destinations/${id}/configure`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                <Sliders className="h-3.5 w-3.5" />
                View Configuration
              </Link>
              <button
                type="button"
                onClick={() =>
                  setActiveLogItem({
                    title: `Destination Logs — ${data.name}`,
                    logs: `[${data.lastUpdated} INFO] Destination telemetry active. Monitoring interval: 5m.\n[${data.lastUpdated} INFO] Health checks passed. Warehouse active.\n[${data.lastUpdated} INFO] Zero active connection bottlenecks detected.`,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                View Logs
              </button>
              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export Report
              </button>
              <div className="hidden h-5 w-px bg-border sm:block" />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConn}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-card px-3.5 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
              >
                <Radio className={`h-3.5 w-3.5 text-primary ${isTestingConn ? 'animate-pulse' : ''}`} />
                {isTestingConn ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-text-on-primary shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh Health'}
              </button>
            </div>
          </div>

          {/* Metadata Strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Destination</span>
              <p className="mt-0.5 text-xs font-semibold text-text-primary">{data.name}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Type</span>
              <p className="mt-0.5 text-xs font-medium text-text-primary">{data.type}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Environment</span>
              <div className="mt-0.5">
                <span className="inline-flex items-center rounded bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary-strong">
                  {data.environment}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Last Health Check</span>
              <p className="mt-0.5 text-xs text-text-primary">{data.lastHealthCheck}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Last Successful</span>
              <p className="mt-0.5 text-xs text-text-primary">{data.lastSuccessfulConnection}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Monitoring Interval</span>
              <p className="mt-0.5 text-xs text-text-primary">{data.monitoringInterval}</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. HEALTH SCORE & SUMMARY STRIP                             */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            {/* Health Score Pill */}
            <div className="flex items-center gap-4 lg:col-span-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg border border-success/20">
                <span className="text-2xl font-bold text-success-strong">{data.healthScore}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Health Score</span>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-success-strong font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Excellent posture</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-5 lg:col-span-9 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <div>
                <span className="text-[11px] text-text-secondary">Availability</span>
                <p className="text-base font-bold text-text-primary">{data.availability30d}</p>
                <span className="text-[11px] text-text-secondary">last 30d</span>
              </div>
              <div>
                <span className="text-[11px] text-text-secondary">Active Alerts</span>
                <p className="text-base font-bold text-text-primary">{data.activeAlertsCount}</p>
                <span className="text-[11px] text-text-secondary">{data.activeAlertsSubtext}</span>
              </div>
              <div>
                <span className="text-[11px] text-text-secondary">Last Incident</span>
                <p className="text-base font-bold text-text-primary">{data.lastIncident}</p>
                <span className="text-[11px] text-text-secondary">{data.lastIncidentDate}</span>
              </div>
              <div>
                <span className="text-[11px] text-text-secondary">Current Status</span>
                <p className="text-base font-bold text-success-strong">{data.statusLabel}</p>
                <span className="text-[11px] text-text-secondary">{data.currentStatusDetail}</span>
              </div>
              <div>
                <span className="text-[11px] text-text-secondary">Last Updated</span>
                <p className="text-base font-bold text-text-primary">{data.lastUpdatedRelative}</p>
                <span className="text-[11px] text-text-secondary">{data.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. 6 KPI METRIC CARDS ROW                                   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Availability */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.availability.label}</span>
              <p className="mt-1 text-xl font-bold text-text-primary">{data.kpiMetrics.availability.value}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-success-strong font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{data.kpiMetrics.availability.trend}</span>
                <span className="text-[10px] text-text-secondary ml-1">{data.kpiMetrics.availability.period}</span>
              </div>
              <Sparkline data={data.kpiMetrics.availability.sparkline} color="var(--color-success)" />
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.avgResponseTime.label}</span>
              <p className="mt-1 text-xl font-bold text-text-primary">{data.kpiMetrics.avgResponseTime.value}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-success-strong font-medium">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>{data.kpiMetrics.avgResponseTime.trend}</span>
                <span className="text-[10px] text-text-secondary ml-1">{data.kpiMetrics.avgResponseTime.period}</span>
              </div>
              <Sparkline data={data.kpiMetrics.avgResponseTime.sparkline} color="var(--color-primary)" />
            </div>
          </div>

          {/* Successful Connections */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.successfulConnections.label}</span>
              <p className="mt-1 text-xl font-bold text-text-primary">{data.kpiMetrics.successfulConnections.value}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-success-strong font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{data.kpiMetrics.successfulConnections.trend}</span>
                <span className="text-[10px] text-text-secondary ml-1">{data.kpiMetrics.successfulConnections.period}</span>
              </div>
              <Sparkline data={data.kpiMetrics.successfulConnections.sparkline} color="var(--color-success)" />
            </div>
          </div>

          {/* Failed Connections */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.failedConnections.label}</span>
              <p className="mt-1 text-xl font-bold text-text-primary">{data.kpiMetrics.failedConnections.value}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-danger-strong font-medium">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>{data.kpiMetrics.failedConnections.trend}</span>
                <span className="text-[10px] text-text-secondary ml-1">{data.kpiMetrics.failedConnections.period}</span>
              </div>
              <Sparkline data={data.kpiMetrics.failedConnections.sparkline} color="var(--color-danger)" />
            </div>
          </div>

          {/* Auth Status */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.authStatus.label}</span>
              <p className="mt-1 text-xl font-bold text-success-strong">{data.kpiMetrics.authStatus.value}</p>
            </div>
            <div className="mt-3">
              <span className="text-xs font-medium text-text-primary">{data.kpiMetrics.authStatus.subtext}</span>
              <p className="text-[11px] text-text-secondary">{data.kpiMetrics.authStatus.detail}</p>
            </div>
          </div>

          {/* Write Success Rate */}
          <div className="rounded-lg border border-border bg-surface-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-text-secondary">{data.kpiMetrics.writeSuccessRate.label}</span>
              <p className="mt-1 text-xl font-bold text-text-primary">{data.kpiMetrics.writeSuccessRate.value}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-success-strong font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{data.kpiMetrics.writeSuccessRate.trend}</span>
                <span className="text-[10px] text-text-secondary ml-1">{data.kpiMetrics.writeSuccessRate.period}</span>
              </div>
              <Sparkline data={data.kpiMetrics.writeSuccessRate.sparkline} color="var(--color-success)" />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. HEALTH TIMELINE CARD                                     */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary">Health Timeline</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Last 24 hours of operational events</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-muted text-[11px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Timestamp</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Event</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Duration</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Initiated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {data.healthTimeline.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3 text-text-secondary">{item.timestamp}</td>
                    <td className="px-5 py-3 font-sans font-medium text-text-primary">{item.event}</td>
                    <td className="px-5 py-3 font-sans">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.status === 'Healthy'
                            ? 'bg-success-bg text-success-strong'
                            : 'bg-warning-bg text-warning-strong'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{item.duration}</td>
                    <td className="px-5 py-3 text-text-secondary font-mono">{item.initiatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. PERFORMANCE OVERVIEW CARD                                */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Performance Overview</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Response time and latency metrics</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {data.performanceOverview.map((metric) => (
              <div
                key={metric.id}
                className="flex flex-col justify-between rounded-md border border-border bg-surface-muted/30 p-3"
              >
                <div>
                  <span className="text-[11px] text-text-secondary leading-tight line-clamp-1">
                    {metric.label}
                  </span>
                  <p className="mt-1 text-base font-bold text-text-primary">{metric.value}</p>
                  <span className="text-[10px] text-text-secondary">{metric.prev}</span>
                </div>
                <div className="mt-2">
                  <Sparkline data={metric.history} color="var(--color-primary)" height={20} width={80} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. HEALTH CHECKS CARD                                       */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Health Checks</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Primary validation results for destination readiness
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunAllChecks}
              disabled={isRunningAll}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-primary shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
            >
              <Play className={`h-3 w-3 ${isRunningAll ? 'animate-spin' : ''}`} />
              {isRunningAll ? 'Running Checks...' : 'Run All Checks'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-muted text-[11px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Health Check</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Last Executed</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Duration</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Result</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.healthChecks.map((check) => {
                  const isRunning = runningCheckId === check.id;
                  return (
                    <tr key={check.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-text-primary">{check.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            check.status === 'Healthy'
                              ? 'bg-success-bg text-success-strong'
                              : 'bg-warning-bg text-warning-strong'
                          }`}
                        >
                          {check.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">{check.lastExecuted}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary">{check.duration}</td>
                      <td className="px-5 py-3 text-text-secondary">{check.result}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRunCheck(check.id)}
                            disabled={isRunning}
                            className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                          >
                            {isRunning ? 'Running...' : 'Run'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLogItem({
                                title: `${check.name} — Execution Logs`,
                                logs: check.logOutput || 'No logs available for this check.',
                              })
                            }
                            className="rounded px-2 py-1 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. CONNECTION HISTORY CARD                                  */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Connection History</h2>
              <p className="mt-0.5 text-xs text-text-secondary">Recent connection attempts and results</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="h-8 rounded-md border border-border bg-surface-card pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="relative">
                <select
                  value={historyFilter}
                  onChange={(e) => {
                    setHistoryFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="h-8 rounded-md border border-border bg-surface-card px-2.5 text-xs text-text-secondary-strong focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Filter connection history"
                >
                  <option value="All">Filter: All</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Warning">Warning</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface-card px-2.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Download className="h-3 w-3" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-muted text-[11px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Time</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Result</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Response Time</th>
                  <th scope="col" className="px-5 py-3 font-semibold">User / Process</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Authentication</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Environment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {paginatedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3 text-text-secondary">{item.time}</td>
                    <td className="px-5 py-3 font-sans">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.result === 'Healthy'
                            ? 'bg-success-bg text-success-strong'
                            : 'bg-warning-bg text-warning-strong'
                        }`}
                      >
                        {item.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{item.responseTime}</td>
                    <td className="px-5 py-3 font-sans text-text-primary">{item.userProcess}</td>
                    <td className="px-5 py-3 font-sans text-text-secondary">{item.authentication}</td>
                    <td className="px-5 py-3 font-sans text-text-secondary">{item.environment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-secondary">
            <span>
              Showing {paginatedHistory.length} of {totalHistoryCount} connections
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="rounded border border-border px-2.5 py-1 font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-text-primary">
                {historyPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                disabled={historyPage === totalPages}
                className="rounded border border-border px-2.5 py-1 font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 8. ALERTS & INCIDENTS CARD                                  */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Alerts & Incidents</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Active and recent operational alerts</p>
          </div>

          <div className="flex flex-col gap-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 transition-colors ${
                  alert.severity === 'Warning'
                    ? 'border-warning/30 bg-warning-bg/30'
                    : 'border-primary/20 bg-surface-muted/60'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        alert.severity === 'Warning'
                          ? 'bg-warning-bg text-warning-strong'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary">{alert.title}</h3>
                        <span className="text-xs text-text-secondary">{alert.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{alert.description}</p>
                      <p className="mt-1 text-xs font-medium text-text-secondary-strong">{alert.suggestion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                        alert.status === 'Active'
                          ? 'bg-danger-bg text-danger-strong'
                          : 'bg-surface-muted text-text-secondary'
                      }`}
                    >
                      {alert.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveAlertDetails(alert)}
                      className="rounded px-2 py-1 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover"
                    >
                      Details
                    </button>
                    {alert.status === 'Active' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-surface-hover"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveLogItem({
                          title: `Alert Logs — ${alert.title}`,
                          logs: alert.logs || 'No raw logs attached to this incident.',
                        })
                      }
                      className="rounded px-2 py-1 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover"
                    >
                      Logs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 9. CONNECTED PIPELINES IMPACT CARD                          */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary">Connected Pipelines Impact</h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Pipelines currently routing data through this destination
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-muted text-[11px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Pipeline</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Last Execution</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Current Impact</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.connectedPipelines.map((pipe) => (
                  <tr key={pipe.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-text-primary">{pipe.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          pipe.status === 'Healthy'
                            ? 'bg-success-bg text-success-strong'
                            : 'bg-warning-bg text-warning-strong'
                        }`}
                      >
                        {pipe.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{pipe.lastExecution}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          pipe.currentImpact === 'None'
                            ? 'text-text-secondary'
                            : 'font-medium text-warning-strong'
                        }
                      >
                        {pipe.currentImpact}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/pipelines/${pipe.pipelineId || 'new'}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View Pipeline &gt;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 10. HEALTH DIAGNOSTICS CARD (COLLAPSIBLE ACCORDION)         */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <button
            type="button"
            onClick={() => setDiagnosticsExpanded(!diagnosticsExpanded)}
            className="flex w-full items-center justify-between p-5 text-left hover:bg-surface-hover/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            aria-expanded={diagnosticsExpanded}
          >
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Health Diagnostics</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Technical endpoint and configuration details
              </p>
            </div>
            <span className="text-text-secondary">
              {diagnosticsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </span>
          </button>

          {diagnosticsExpanded && (
            <div className="border-t border-border p-5 bg-surface-muted/20">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(data.diagnostics).map(([key, val]) => (
                  <div key={key} className="rounded border border-border bg-surface-card p-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <p className="mt-1 font-mono text-xs font-medium text-text-primary break-all">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 11. RECOMMENDED ACTIONS CARD                                */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-border bg-surface-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary">Recommended Actions</h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Actionable recommendations based on current health status
            </p>
          </div>

          <div className="divide-y divide-border">
            {data.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-surface-hover/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      rec.priorityTone === 'info'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-muted text-text-secondary-strong'
                    }`}
                  >
                    {rec.priority}
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-text-primary">{rec.title}</h3>
                    <p className="mt-0.5 text-xs text-text-secondary">{rec.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleExportReport()}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                  >
                    {rec.buttonLabel}
                  </button>
                  <span className="text-xs font-medium text-text-secondary">{rec.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 12. STICKY BOTTOM ACTION BAR (Figma Node 131:1068)           */}
      {/* ============================================================ */}
      <div className="sticky bottom-0 z-20 -mx-6 -mb-6 flex items-center justify-between border-t border-border bg-surface-card/95 px-6 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Healthy
          </span>
          <span className="text-xs text-text-secondary hidden sm:inline">
            Last updated: {data.lastUpdated} · {data.lastUpdatedRelative}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveLogItem({
                title: `Destination Health Logs — ${data.name}`,
                logs: `[${data.lastUpdated} INFO] Continuous destination health monitor active.\n[${data.lastUpdated} INFO] Ping latency: 142ms. Zero packet loss.\n[${data.lastUpdated} SUCCESS] All 8 diagnostics subsystems operational.`,
              })
            }
            className="rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
          >
            View Logs
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="rounded-md border border-border bg-surface-card px-3.5 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
          >
            {isTestingConn ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-text-on-primary shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Health
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: LOG VIEWER                                            */}
      {/* ============================================================ */}
      {activeLogItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-modal-title"
        >
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-surface-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 id="log-modal-title" className="text-sm font-semibold text-text-primary">
                  {activeLogItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLogItem(null)}
                className="rounded p-1 text-text-secondary hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Close logs dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <pre className="rounded bg-text-primary p-4 font-mono text-xs text-surface-card leading-relaxed whitespace-pre-wrap">
                {activeLogItem.logs}
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-border p-4 bg-surface-muted/30">
              <button
                type="button"
                onClick={() => handleCopyLogs(activeLogItem.logs)}
                className="inline-flex items-center gap-1.5 rounded border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
              >
                {copiedLog ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLog ? 'Copied!' : 'Copy Logs'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLogItem(null)}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-text-on-primary hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ALERT DETAILS                                         */}
      {/* ============================================================ */}
      {activeAlertDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-modal-title"
        >
          <div className="flex w-full max-w-lg flex-col rounded-lg border border-border bg-surface-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning-strong" />
                <h3 id="alert-modal-title" className="text-sm font-semibold text-text-primary">
                  {activeAlertDetails.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlertDetails(null)}
                className="rounded p-1 text-text-secondary hover:bg-surface-hover"
                aria-label="Close alert dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <span className="font-semibold text-text-secondary">Severity:</span>
                <span className="ml-2 font-medium text-text-primary">{activeAlertDetails.severity}</span>
              </div>
              <div>
                <span className="font-semibold text-text-secondary">Status:</span>
                <span className="ml-2 font-medium text-text-primary">{activeAlertDetails.status}</span>
              </div>
              <div>
                <span className="font-semibold text-text-secondary">Description:</span>
                <p className="mt-1 text-text-secondary">{activeAlertDetails.description}</p>
              </div>
              <div>
                <span className="font-semibold text-text-secondary">Suggested Action:</span>
                <p className="mt-1 text-text-secondary-strong font-medium">{activeAlertDetails.suggestion}</p>
              </div>
              {activeAlertDetails.detailsText && (
                <div>
                  <span className="font-semibold text-text-secondary">Technical Details:</span>
                  <p className="mt-1 font-mono text-[11px] text-text-secondary bg-surface-muted p-2 rounded">
                    {activeAlertDetails.detailsText}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              {activeAlertDetails.status === 'Active' && (
                <button
                  type="button"
                  onClick={() => {
                    handleAcknowledgeAlert(activeAlertDetails.id);
                    setActiveAlertDetails(null);
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-primary hover:bg-primary/90"
                >
                  Acknowledge Alert
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveAlertDetails(null)}
                className="rounded-md border border-border bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary-strong hover:bg-surface-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TEST CONNECTION RESULT                                */}
      {/* ============================================================ */}
      {testResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="test-result-title"
        >
          <div className="flex w-full max-w-md flex-col rounded-lg border border-border bg-surface-card p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  testResult.success ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <h3 id="test-result-title" className="text-sm font-semibold text-text-primary">
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {testResult.message || (testResult.success ? 'Endpoint responded with HTTP 200 OK.' : 'Unable to connect to host.')}
                </p>
              </div>
            </div>

            {testResult.latency && (
              <div className="mt-4 rounded bg-surface-muted p-3 text-xs">
                <span className="text-text-secondary">Response Latency: </span>
                <span className="font-mono font-semibold text-text-primary">{testResult.latency}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-text-on-primary hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
