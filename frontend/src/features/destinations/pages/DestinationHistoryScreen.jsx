import React, { useState, useEffect, useId } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDestinationHistory } from '../hooks/useDestinationHistory';
import {
  DESTINATION_OPTIONS,
  EVENT_CATEGORIES,
  SEVERITIES,
  STATUSES,
  ENVIRONMENTS,
} from '../services/destinationHistory.api';
import {
  History,
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Server,
  Search,
  Download,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Sliders,
  Shield,
  Zap,
  HardDrive,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Terminal,
  ArrowRight,
  GitBranch,
  X,
  Check,
} from 'lucide-react';

export default function DestinationHistoryScreen() {
  const { id = 'dest-snowflake-01' } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    // Filter values
    selectedDestination,
    setSelectedDestination,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedSeverity,
    setSelectedSeverity,
    selectedEnvironment,
    setSelectedEnvironment,
    selectedOrganization,
    setSelectedOrganization,
    selectedUser,
    setSelectedUser,
    selectedPipeline,
    setSelectedPipeline,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    resetFilters,

    // Records & Pagination
    filteredRecords,
    sortedRecords,
    paginatedRecords,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    sortField,
    sortDirection,
    handleSort,
    selectedRowIds,
    toggleSelectRow,
    toggleSelectAll,

    // Timeline
    filteredTimeline,
    timelineExpandedDays,
    toggleTimelineDay,
    expandAllTimeline,
    collapseAllTimeline,

    // Modals & Drawers
    selectedEventDetails,
    setSelectedEventDetails,
    logModalEvent,
    setLogModalEvent,
    auditReportModalOpen,
    setAuditReportModalOpen,
    isGeneratingReport,
    reportGeneratedSuccess,
    handleGenerateAuditReport,

    // Charts & Exports
    chartTimeRange,
    setChartTimeRange,
    handleExportCsv,
  } = useDestinationHistory(id);

  // Local UI state
  const [activeChartHover, setActiveChartHover] = useState(null);
  const [activeUptimeHover, setActiveUptimeHover] = useState(null);
  const [reportType, setReportType] = useState('full-audit');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Accessible IDs
  const searchInputId = useId();
  const destSelectId = useId();
  const typeSelectId = useId();
  const catSelectId = useId();
  const statusSelectId = useId();
  const sevSelectId = useId();
  const envSelectId = useId();
  const orgSelectId = useId();
  const userSelectId = useId();
  const pipeSelectId = useId();

  // Escape key listener for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedEventDetails) setSelectedEventDetails(null);
        if (logModalEvent) setLogModalEvent(null);
        if (auditReportModalOpen) setAuditReportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEventDetails, logModalEvent, auditReportModalOpen, setSelectedEventDetails, setLogModalEvent, setAuditReportModalOpen]);

  // Helper for severity badges
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-danger/10 text-danger border border-danger/30 font-semibold';
      case 'high':
        return 'bg-danger/10 text-danger border border-danger/20 font-medium';
      case 'medium':
        return 'bg-warning/15 text-warning-strong border border-warning/30 font-medium';
      case 'low':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
      case 'info':
      default:
        return 'bg-surface-muted text-text-secondary border border-border';
    }
  };

  // Helper for status badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-success/10 text-success border border-success/30';
      case 'failed':
        return 'bg-danger/10 text-danger border border-danger/30';
      case 'warning':
        return 'bg-warning/15 text-warning-strong border border-warning/30';
      case 'running':
        return 'bg-primary/10 text-primary border border-primary/30 animate-pulse';
      case 'skipped':
        return 'bg-surface-muted text-text-muted border border-border';
      default:
        return 'bg-surface-muted text-text-secondary border border-border';
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Destinations', 'Destination History']}>
      <div className="min-h-screen bg-surface-page text-text-primary pb-16 font-sans">
        {/* Mock Boundary Disclosure Banner */}
        {!bannerDismissed && data?.mocked && (
          <aside
            role="note"
            aria-label="Simulation notice"
            className="bg-primary/5 border-b border-primary/20 px-6 py-2.5 flex items-center justify-between text-xs text-text-secondary"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary text-text-on-primary">
                MOCK PREVIEW
              </span>
              <span>
                <strong>Figma Frame 133:2160 (SCR-062):</strong> MOD-007 destination history telemetry. Displaying real-request fallback with design-accurate historical events and telemetry records.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-text-muted hover:text-text-primary p-1"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </aside>
        )}

        {/* Screen Reader Live Region for Async State & Filter Updates */}
        <div className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? 'Loading destination history telemetry...'
            : isError
            ? 'Error loading destination history telemetry.'
            : `${filteredRecords.length} records matching current filters. Page ${currentPage} of ${totalPages}.`}
        </div>

        {/* Error Boundary Banner */}
        {isError && (
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <div
              role="alert"
              className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2 text-danger font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Failed to load live destination history data: {error?.message || 'Network error or backend unavailable'}.</span>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1 bg-danger text-text-on-primary font-semibold rounded hover:bg-danger/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6 animate-pulse" aria-busy="true">
            <div className="h-28 bg-surface-card rounded-lg border border-border" />
            <div className="h-32 bg-surface-card rounded-lg border border-border" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-card rounded-lg border border-border" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-64 bg-surface-card rounded-lg border border-border" />
              <div className="h-64 bg-surface-card rounded-lg border border-border" />
              <div className="h-64 bg-surface-card rounded-lg border border-border" />
            </div>
            <div className="h-96 bg-surface-card rounded-lg border border-border" />
          </div>
        ) : (
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
          {/* SECTION 1: Top Header & Metadata Strip (Figma 133:2161) */}
          <header className="bg-surface-card border border-border rounded-lg p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-1" aria-label="Breadcrumb">
                  <Link to="/destinations" className="hover:text-primary transition-colors">
                    Operations
                  </Link>
                  <span>/</span>
                  <Link to="/destinations" className="hover:text-primary transition-colors">
                    Monitoring
                  </Link>
                  <span>/</span>
                  <span className="text-text-primary font-medium">Destination History</span>
                </nav>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-primary">Destination History</h1>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Review historical destination events, synchronization records, configuration changes, failures, recoveries, and operational activities across the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-muted border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors shadow-sm"
                  aria-label="Refresh telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-surface-muted border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export History</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditReportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-text-on-primary transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Audit Report</span>
                </button>
              </div>
            </div>
          </header>

          {/* SECTION 2: Filter Toolbar (Figma 133:2193) */}
          <section className="bg-surface-card border border-border rounded-lg p-4 shadow-sm space-y-3" aria-label="History Filters">
            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2.5">
              {/* Destination Filter */}
              <div>
                <label htmlFor={destSelectId} className="sr-only">Destination</label>
                <select
                  id={destSelectId}
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  {DESTINATION_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              {/* Types Filter */}
              <div>
                <label htmlFor={typeSelectId} className="sr-only">Type</label>
                <select
                  id={typeSelectId}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  <option>All Types</option>
                  <option>Snowflake</option>
                  <option>Kafka</option>
                  <option>Amazon S3</option>
                  <option>Google BigQuery</option>
                  <option>PostgreSQL</option>
                  <option>Amazon Redshift</option>
                </select>
              </div>

              {/* Category / Events Filter */}
              <div>
                <label htmlFor={catSelectId} className="sr-only">Event Category</label>
                <select
                  id={catSelectId}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor={statusSelectId} className="sr-only">Status</label>
                <select
                  id={statusSelectId}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label htmlFor={sevSelectId} className="sr-only">Severity</label>
                <select
                  id={sevSelectId}
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  {SEVERITIES.map((sev) => (
                    <option key={sev} value={sev}>{sev}</option>
                  ))}
                </select>
              </div>

              {/* Environment Filter */}
              <div>
                <label htmlFor={envSelectId} className="sr-only">Environment</label>
                <select
                  id={envSelectId}
                  value={selectedEnvironment}
                  onChange={(e) => setSelectedEnvironment(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>

              {/* Organization Filter */}
              <div>
                <label htmlFor={orgSelectId} className="sr-only">Organization</label>
                <select
                  id={orgSelectId}
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  <option>All Organizations</option>
                  <option>Enterprise Production</option>
                  <option>Sales Analytics Org</option>
                  <option>FinTech Core</option>
                  <option>Data Engineering</option>
                </select>
              </div>

              {/* Users Filter */}
              <div>
                <label htmlFor={userSelectId} className="sr-only">User</label>
                <select
                  id={userSelectId}
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  <option>All Users</option>
                  <option>System Monitor</option>
                  <option>Priya S.</option>
                  <option>Alex K.</option>
                  <option>Dave Pipeline</option>
                  <option>Security Bot</option>
                </select>
              </div>

              {/* Pipelines Filter */}
              <div>
                <label htmlFor={pipeSelectId} className="sr-only">Pipeline</label>
                <select
                  id={pipeSelectId}
                  value={selectedPipeline}
                  onChange={(e) => setSelectedPipeline(e.target.value)}
                  className="w-full text-xs bg-surface-muted border border-border rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary truncate"
                >
                  <option>All Pipelines</option>
                  <option>pipe-sales-hourly</option>
                  <option>pipe-events-stream</option>
                  <option>pipe-analytics-daily</option>
                  <option>pipe-lake-raw</option>
                  <option>pipe-legacy-archive</option>
                </select>
              </div>
            </div>

            {/* Sub-bar: Date range pickers, search input, tags, quick metrics */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id={searchInputId}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search history, events, IDs, IPs..."
                    className="w-full text-xs bg-surface-muted border border-border rounded-md pl-8 pr-3 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Date Pickers */}
                <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-surface-muted border border-border rounded-md px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs text-text-primary focus:outline-none"
                    aria-label="Start Date"
                  />
                  <span className="text-text-muted">→</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs text-text-primary focus:outline-none"
                    aria-label="End Date"
                  />
                </div>

                {/* Reset Filters button */}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-text-secondary hover:text-primary underline px-1 py-1"
                >
                  Clear Filters
                </button>
              </div>

              {/* Summary Stats info */}
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div>
                  <span className="text-text-muted">Total Records:</span>{' '}
                  <strong className="text-text-primary font-semibold">{data.totalRecords?.toLocaleString()}</strong>
                </div>
                <div className="h-3 w-px bg-border hidden sm:block" />
                <div>
                  <span className="text-text-muted">Last Updated:</span>{' '}
                  <span className="font-mono text-text-secondary">{data.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Quick Filter Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40" role="tablist">
              {[
                { label: 'All', count: data.totalRecords },
                { label: 'Sync History', count: data.kpis?.successfulSyncs?.value },
                { label: 'Failures', count: data.kpis?.failedSyncs?.value + data.kpis?.connectionFailures?.value },
                { label: 'Config Changes', count: data.kpis?.configChanges?.value },
                { label: 'Performance Alerts', count: '142' },
                { label: 'Authentication Events', count: data.kpis?.connectionFailures?.value },
                { label: 'Audit Logs', count: data.auditHistory?.length || 6 },
              ].map((tab) => {
                const isActive = activeTab === tab.label;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-text-on-primary shadow-sm'
                        : 'bg-surface-muted hover:bg-surface-muted text-text-secondary border border-border'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-text-on-primary'
                          : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      {typeof tab.count === 'number' ? tab.count.toLocaleString() : tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: KPI Metrics Grid (Figma 133:2317 - 8 Stat Cards) */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3" aria-label="Key Performance Indicators">
            {/* Card 1: Total Historical Events */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Total Historical Events</span>
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12.4%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono">
                  {data.kpis?.totalEvents?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">All time</div>
              </div>
            </div>

            {/* Card 2: Successful Syncs */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Successful Syncs</span>
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +8.1%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono text-success">
                  {data.kpis?.successfulSyncs?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Last 30 days</div>
              </div>
            </div>

            {/* Card 3: Failed Syncs */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Failed Syncs</span>
                <span className="text-[11px] font-medium text-danger flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -3.2%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-danger font-mono">
                  {data.kpis?.failedSyncs?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Last 30 days</div>
              </div>
            </div>

            {/* Card 4: Config Changes */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Config Changes</span>
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +2.7%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono">
                  {data.kpis?.configChanges?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Last 30 days</div>
              </div>
            </div>

            {/* Card 5: Connection Failures */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Connection Failures</span>
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -18%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-warning-strong font-mono">
                  {data.kpis?.connectionFailures?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Last 30 days</div>
              </div>
            </div>

            {/* Card 6: Recovery Events */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Recovery Events</span>
                <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +5.9%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono">
                  {data.kpis?.recoveryEvents?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Last 30 days</div>
              </div>
            </div>

            {/* Card 7: Avg Daily Events */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Avg Daily Events</span>
                <span className="text-[11px] font-medium text-text-muted flex items-center gap-0.5">
                  → +0.3%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono">
                  {data.kpis?.avgDailyEvents?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">30-day avg</div>
              </div>
            </div>

            {/* Card 8: Archived Records */}
            <div className="bg-surface-card border border-border rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate">Archived Records</span>
                <span className="text-[11px] font-mono text-text-muted">Total</span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold tracking-tight text-text-primary font-mono">
                  {data.kpis?.archivedRecords?.value?.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Total archived</div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Analytics & Trends Grid (Figma 133:2429 - 3 Analytics Cards) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5" aria-label="Analytics and Trends">
            {/* Analytics Card 1: Events Over Time Histogram */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-text-primary">Events Over Time</h2>
                  </div>
                  {/* Time Range Pills */}
                  <div className="inline-flex p-0.5 rounded-md bg-surface-muted border border-border text-[11px]">
                    {['7D', '30D', '90D'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setChartTimeRange(range)}
                        className={`px-2 py-0.5 rounded font-medium ${
                          chartTimeRange === range
                            ? 'bg-primary text-text-on-primary'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Histogram Bars */}
                <div className="h-32 flex items-end gap-1.5 pt-4 pb-2 border-b border-border/60">
                  {data.analytics?.eventsOverTime?.data?.map((bar, i) => {
                    const heightPct = Math.min(100, Math.round((bar.events / 2400) * 100));
                    const isHovered = activeChartHover === i;
                    return (
                      <div
                        key={bar.date}
                        className="flex-1 flex flex-col items-center group relative cursor-pointer"
                        onMouseEnter={() => setActiveChartHover(i)}
                        onMouseLeave={() => setActiveChartHover(null)}
                      >
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-page border border-border px-2 py-1 rounded shadow-lg text-[10px] text-text-primary whitespace-nowrap z-20 font-mono">
                            <div><strong>{bar.date}:</strong> {bar.events} events</div>
                            <div className="text-success">{bar.success} ok / <span className="text-danger">{bar.failure} err</span></div>
                          </div>
                        )}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t transition-all ${
                            isHovered ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary/70'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
                  <span>Jul 07</span>
                  <span>Jul 22</span>
                  <span>Aug 05</span>
                </div>
              </div>

              {/* Sub Metrics Strip */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/60 text-center">
                <div>
                  <div className="text-[10px] text-text-muted">Peak Day</div>
                  <div className="text-xs font-bold font-mono text-text-primary mt-0.5">{data.analytics?.eventsOverTime?.peakDay}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted">Avg / Day</div>
                  <div className="text-xs font-bold font-mono text-text-primary mt-0.5">{data.analytics?.eventsOverTime?.avgPerDay}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted">Success Rate</div>
                  <div className="text-xs font-bold font-mono text-success mt-0.5">{data.analytics?.eventsOverTime?.successRate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted">Failure Rate</div>
                  <div className="text-xs font-bold font-mono text-danger mt-0.5">{data.analytics?.eventsOverTime?.failureRate}</div>
                </div>
              </div>
            </div>

            {/* Analytics Card 2: Event Distribution */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-text-primary">Event Distribution</h2>
                  </div>
                  <span className="text-xs font-mono text-text-muted">By Category</span>
                </div>

                <div className="space-y-3">
                  {data.analytics?.eventDistribution?.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-medium">{item.category}</span>
                        <span className="font-mono text-text-primary font-semibold">
                          {item.count?.toLocaleString()} <span className="text-text-muted font-normal">({item.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 text-xs text-text-muted flex items-center justify-between">
                <span>Total Classified Events:</span>
                <span className="font-mono text-text-primary font-semibold">48,291</span>
              </div>
            </div>

            {/* Analytics Card 3: Failure Trend & Reasons */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <h2 className="text-sm font-semibold text-text-primary">Failure Trend</h2>
                  </div>
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {data.analytics?.failureTrend?.monthlyChange}
                  </span>
                </div>

                {/* Failure Sparkline */}
                <div className="h-28 flex items-end gap-1.5 pt-2 pb-2 border-b border-border/60">
                  {data.analytics?.failureTrend?.dailyTrend?.map((pt) => {
                    const h = Math.min(100, Math.round((pt.count / 50) * 100));
                    return (
                      <div key={pt.date} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full bg-danger/50 group-hover:bg-danger rounded-t transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
                  <span>Jul 07</span>
                  <span>Aug 05</span>
                </div>
              </div>

              {/* Failure Breakdown Rows */}
              <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Sync Failures</span>
                  <span className="font-mono font-bold text-danger">
                    {data.analytics?.failureTrend?.syncFailures?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Connection Failures</span>
                  <span className="font-mono font-semibold text-warning-strong">
                    {data.analytics?.failureTrend?.connectionFailures?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Auth Failures</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {data.analytics?.failureTrend?.authFailures?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">SSL Issues</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {data.analytics?.failureTrend?.sslIssues?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Recent Critical Events (Figma 133:2647) */}
          <section className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-3" aria-label="Recent Critical Alerts">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <h2 className="text-sm font-bold text-text-primary">Recent Critical Events</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-danger/10 text-danger border border-danger/20">
                  6 active
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Failures')}
                className="text-xs text-primary hover:underline font-medium"
              >
                View All Failures →
              </button>
            </div>

            <div className="space-y-2.5">
              {data.recentCriticalEvents?.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-muted border border-border/80 hover:border-border rounded-lg p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${getSeverityBadge(item.severity)} shrink-0 mt-0.5`}>
                      {item.severity}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-xs font-semibold text-text-primary">{item.event}</strong>
                        <span className="text-text-muted text-xs">on</span>
                        <code className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {item.destination}
                        </code>
                        <span className="text-[11px] text-text-muted font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{item.impact}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const rec = data.historyRecords?.find((r) => r.destination === item.destination);
                        if (rec) setSelectedEventDetails(rec);
                      }}
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {item.remediationAction}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: Historical Activity Timeline (Figma 133:2798) */}
          <section className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-4" aria-label="Historical Activity Timeline">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Historical Activity Timeline</h2>
                <span className="px-2 py-0.5 text-[11px] rounded bg-surface-muted text-text-secondary border border-border">
                  Grouped by date
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={collapseAllTimeline}
                  className="px-2.5 py-1 text-text-secondary hover:text-text-primary bg-surface-muted border border-border rounded-md hover:bg-surface-muted transition-colors"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={expandAllTimeline}
                  className="px-2.5 py-1 text-text-secondary hover:text-text-primary bg-surface-muted border border-border rounded-md hover:bg-surface-muted transition-colors"
                >
                  Expand All
                </button>
              </div>
            </div>

            {/* Timeline Day Groups */}
            <div className="space-y-4">
              {filteredTimeline.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs bg-surface-muted rounded-lg border border-border">
                  No activity timeline events match the current filter criteria.
                </div>
              ) : (
                filteredTimeline.map((group) => {
                  const isExpanded = timelineExpandedDays[group.date] ?? true;
                  return (
                    <div key={group.date} className="border border-border/80 rounded-lg overflow-hidden">
                      {/* Day Header */}
                      <button
                        type="button"
                        onClick={() => toggleTimelineDay(group.date)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-muted hover:bg-surface-muted transition-colors text-left"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                          <span className="text-xs font-bold text-text-primary">{group.date}</span>
                          <span className="text-[11px] text-text-muted">({group.events.length} events)</span>
                        </div>
                        <span className="text-[11px] text-text-muted font-mono">24-hour log</span>
                      </button>

                      {/* Timeline Items */}
                      {isExpanded && (
                        <div className="p-4 bg-surface-card space-y-3 divide-y divide-border/40">
                          {group.events.map((ev, ei) => (
                            <div
                              key={ev.id || ei}
                              className={`pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-surface-muted/50 p-2 rounded transition-colors cursor-pointer`}
                              onClick={() => {
                                const rec = data.historyRecords?.find((r) => r.destination === ev.target || r.event === ev.title) || {
                                  id: ev.id || 'EVT-TL',
                                  timestamp: `${group.date} ${ev.time}`,
                                  destination: ev.target,
                                  event: ev.title,
                                  category: ev.category,
                                  status: ev.severity === 'Critical' || ev.severity === 'High' ? 'Failed' : 'Success',
                                  severity: ev.severity,
                                  userOrSystem: ev.actor,
                                  pipeline: 'pipe-sales-hourly',
                                  duration: '2.5s',
                                  records: '14,200',
                                  errorCode: ev.severity === 'Critical' ? 'ERR_CONN_TIMEOUT' : '—',
                                  sourceIp: '10.0.1.42',
                                  org: 'Sales Corp',
                                  region: 'us-east-1',
                                  description: ev.description,
                                  correlationId: 'EXEC-8821-A',
                                  sessionId: 'sess-8821',
                                  tenant: 'enterprise-tier',
                                  version: 'v2.14.0',
                                };
                                setSelectedEventDetails(rec);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono text-text-muted shrink-0 w-12 text-[11px] mt-0.5">
                                  {ev.time}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(ev.severity)} shrink-0`}>
                                  {ev.severity}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-surface-muted text-text-secondary border border-border shrink-0">
                                  {ev.category}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <strong className="text-text-primary font-semibold">{ev.title}</strong>
                                    <span className="text-text-muted">on</span>
                                    <code className="text-[11px] font-mono text-primary bg-primary/10 px-1 py-0.2 rounded">
                                      {ev.target}
                                    </code>
                                  </div>
                                  <p className="text-text-secondary text-xs mt-0.5">{ev.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end md:self-center text-text-muted text-[11px]">
                                <span>by <strong className="text-text-secondary">{ev.actor}</strong></span>
                                <span className="text-primary hover:underline flex items-center gap-0.5">
                                  Details <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* SECTION 7: History Records Table (Figma 133:3054) */}
          <section className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-4" aria-label="History Records Table">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">History Records</h2>
                <span className="text-xs font-mono text-text-muted">
                  ({filteredRecords.length.toLocaleString()} matching records)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {selectedRowIds.length > 0 && (
                  <span className="text-primary font-medium">
                    {selectedRowIds.length} selected
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-muted border border-border hover:bg-surface-muted rounded-md text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Selection</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-text-secondary font-medium select-none">
                    <th scope="col" className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === paginatedRecords.length && paginatedRecords.length > 0}
                        onChange={toggleSelectAll}
                        aria-label="Select all records on page"
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </th>
                    <th
                      scope="col"
                      aria-sort={sortField === 'timestamp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="p-3 select-none"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:underline"
                      >
                        <span>Timestamp</span>
                        {sortField === 'timestamp' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th
                      scope="col"
                      aria-sort={sortField === 'destination' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="p-3 select-none"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('destination')}
                        className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:underline"
                      >
                        <span>Destination</span>
                        {sortField === 'destination' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th
                      scope="col"
                      aria-sort={sortField === 'event' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="p-3 select-none"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('event')}
                        className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:underline"
                      >
                        <span>Event</span>
                        {sortField === 'event' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th scope="col" className="p-3">Category</th>
                    <th
                      scope="col"
                      aria-sort={sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="p-3 select-none"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:underline"
                      >
                        <span>Status</span>
                        {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th scope="col" className="p-3">Severity</th>
                    <th scope="col" className="p-3">User / System</th>
                    <th scope="col" className="p-3">Pipeline</th>
                    <th scope="col" className="p-3">Duration</th>
                    <th scope="col" className="p-3">Records</th>
                    <th scope="col" className="p-3">Error Code</th>
                    <th scope="col" className="p-3">Source IP</th>
                    <th scope="col" className="p-3">Org</th>
                    <th scope="col" className="p-3">Region</th>
                    <th scope="col" className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="p-8 text-center text-text-muted">
                        No historical records matching the active filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => {
                      const isSelected = selectedRowIds.includes(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-surface-muted/50 transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(row.id)}
                              aria-label={`Select record ${row.id}`}
                              className="rounded border-border text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="p-3 font-mono text-text-secondary whitespace-nowrap">{row.timestamp}</td>
                          <td className="p-3 font-medium text-primary whitespace-nowrap">
                            <Link to={`/destinations/${row.destination}/configure`} className="hover:underline">
                              {row.destination}
                            </Link>
                          </td>
                          <td className="p-3 font-semibold text-text-primary whitespace-nowrap">{row.event}</td>
                          <td className="p-3 text-text-secondary whitespace-nowrap">{row.category}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(row.severity)}`}>
                              {row.severity}
                            </span>
                          </td>
                          <td className="p-3 text-text-secondary whitespace-nowrap">{row.userOrSystem}</td>
                          <td className="p-3 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                            {row.pipeline !== '—' ? (
                              <span className="text-primary hover:underline cursor-pointer">{row.pipeline}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 font-mono text-text-secondary whitespace-nowrap">{row.duration}</td>
                          <td className="p-3 font-mono text-text-primary whitespace-nowrap">{row.records}</td>
                          <td className="p-3 font-mono text-[11px] text-danger whitespace-nowrap">{row.errorCode}</td>
                          <td className="p-3 font-mono text-[11px] text-text-muted whitespace-nowrap">{row.sourceIp}</td>
                          <td className="p-3 text-text-secondary whitespace-nowrap">{row.org}</td>
                          <td className="p-3 font-mono text-[11px] text-text-muted whitespace-nowrap">{row.region}</td>
                          <td className="p-3 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => setSelectedEventDetails(row)}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogModalEvent(row)}
                              className="text-xs text-text-secondary hover:text-text-primary hover:underline"
                            >
                              Logs
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-text-secondary pt-2">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-surface-muted border border-border rounded px-2 py-1 text-text-primary focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-text-muted ml-2">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, sortedRecords.length)} - {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length.toLocaleString()} records
                </span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded bg-surface-muted border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-2 font-mono text-text-primary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded bg-surface-muted border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 8: Two-Column Section: Configuration History + Sustained Availability (Figma 133:3562) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-label="Configuration and Availability History">
            {/* Sub-card A: Configuration History */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-text-primary">Configuration History</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/destinations/${id}/configure`)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Compare Versions →
                  </button>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-muted border-b border-border text-text-secondary font-medium">
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Field Changed</th>
                        <th className="p-2.5">Previous Value</th>
                        <th className="p-2.5">New Value</th>
                        <th className="p-2.5">Modified By</th>
                        <th className="p-2.5 text-right">Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                      {data.configHistory?.map((ch, i) => (
                        <tr key={i} className="hover:bg-surface-muted/40">
                          <td className="p-2.5 text-text-muted whitespace-nowrap">{ch.timestamp}</td>
                          <td className="p-2.5 font-sans font-medium text-text-primary whitespace-nowrap">{ch.fieldChanged}</td>
                          <td className="p-2.5 text-danger line-through whitespace-nowrap">{ch.previousValue}</td>
                          <td className="p-2.5 text-success whitespace-nowrap">{ch.newValue}</td>
                          <td className="p-2.5 text-text-secondary font-sans whitespace-nowrap">{ch.modifiedBy}</td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                              ch.approval === 'Approved' || ch.approval === 'Auto'
                                ? 'bg-success/10 text-success border border-success/30'
                                : 'bg-warning/15 text-warning-strong border border-warning/30'
                            }`}>
                              {ch.approval}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
                <span>Tracked Parameters: 24 active</span>
                <span>Audit retention: 365 days</span>
              </div>
            </div>

            {/* Sub-card B: Sustained Availability (30-Day Heatmap) */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-success" />
                    <h2 className="text-sm font-bold text-text-primary">Sustained Availability</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30">
                    Availability: {data.availabilityHistory?.availabilityRate}
                  </span>
                </div>

                {/* 30-Day Heatmap Grid */}
                <div>
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                    <span>30-Day Daily Availability</span>
                    <span className="text-text-muted font-mono">Jul 07 → Aug 05</span>
                  </div>
                  <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 p-3 bg-surface-muted rounded-lg border border-border">
                    {data.availabilityHistory?.dailyUptime?.map((day, i) => {
                      let bg = 'bg-success';
                      if (day.status === 'degraded') bg = 'bg-warning';
                      if (day.status === 'down') bg = 'bg-danger';
                      const isHovered = activeUptimeHover === i;
                      return (
                        <div
                          key={day.day}
                          onMouseEnter={() => setActiveUptimeHover(i)}
                          onMouseLeave={() => setActiveUptimeHover(null)}
                          className="relative group cursor-pointer"
                        >
                          <div className={`h-6 rounded-sm ${bg} opacity-85 hover:opacity-100 transition-opacity`} />
                          {isHovered && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-page border border-border px-2 py-1 rounded shadow-lg text-[10px] text-text-primary whitespace-nowrap z-20 font-mono">
                              <div>{day.date}</div>
                              <div><strong>Uptime:</strong> {day.uptime}%</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 6 Availability Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                <div>
                  <div className="text-[11px] text-text-muted">Connection Attempts</div>
                  <div className="text-sm font-bold font-mono text-text-primary mt-0.5">
                    {data.availabilityHistory?.totalAttempts?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Successful</div>
                  <div className="text-sm font-bold font-mono text-success mt-0.5">
                    {data.availabilityHistory?.successfulAttempts?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Failed</div>
                  <div className="text-sm font-bold font-mono text-danger mt-0.5">
                    {data.availabilityHistory?.failedAttempts?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Auth Failures</div>
                  <div className="text-sm font-bold font-mono text-warning-strong mt-0.5">
                    {data.availabilityHistory?.authFailures?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">SSL Issues</div>
                  <div className="text-sm font-bold font-mono text-text-primary mt-0.5">
                    {data.availabilityHistory?.sslIssues?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Total Downtime</div>
                  <div className="text-sm font-bold font-mono text-danger mt-0.5">
                    {data.availabilityHistory?.totalDowntime}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 9: Two-Column Section: Synchronization History + Storage History (Figma 133:3731) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-label="Synchronization and Storage Telemetry">
            {/* Sub-card A: Synchronization History */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-text-primary">Synchronization History</h2>
                  </div>
                  <span className="text-xs text-primary hover:underline cursor-pointer font-medium">
                    View All Sessions →
                  </span>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-muted border-b border-border text-text-secondary font-medium">
                        <th className="p-2.5">Started</th>
                        <th className="p-2.5">Completed</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Written</th>
                        <th className="p-2.5">Failed</th>
                        <th className="p-2.5">Retries</th>
                        <th className="p-2.5">Throughput</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                      {data.syncHistory?.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-muted/40">
                          <td className="p-2.5 text-text-primary whitespace-nowrap">{s.started}</td>
                          <td className="p-2.5 text-text-muted whitespace-nowrap">{s.completed}</td>
                          <td className="p-2.5 text-text-secondary whitespace-nowrap">{s.duration}</td>
                          <td className="p-2.5 text-success font-semibold whitespace-nowrap">{s.written}</td>
                          <td className="p-2.5 text-danger whitespace-nowrap">{s.failed}</td>
                          <td className="p-2.5 text-text-secondary whitespace-nowrap">{s.retries}</td>
                          <td className="p-2.5 text-text-primary whitespace-nowrap">{s.throughput}</td>
                          <td className="p-2.5 text-right whitespace-nowrap font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(s.status)}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 text-xs text-text-muted flex items-center justify-between">
                <span>Avg sync throughput: 2,540 rows/sec</span>
                <span>SLA compliance: 99.1%</span>
              </div>
            </div>

            {/* Sub-card B: Storage History */}
            <div className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-warning-strong" />
                    <h2 className="text-sm font-bold text-text-primary">Storage History</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/15 text-warning-strong border border-warning/30">
                    Status: {data.storageHistory?.usedPercentage} Used
                  </span>
                </div>

                <div className="text-xs text-text-secondary mb-2">Monthly Storage Growth (GB)</div>

                {/* Storage Growth Bar Chart */}
                <div className="h-28 flex items-end gap-2.5 pt-2 pb-2 border-b border-border/60">
                  {data.storageHistory?.monthlyGrowth?.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-mono text-text-muted group-hover:text-primary">{m.percentage}%</span>
                      <div
                        style={{ height: `${m.percentage}%` }}
                        className={`w-full rounded-t transition-all ${
                          m.percentage >= 90 ? 'bg-danger' : m.percentage >= 70 ? 'bg-warning' : 'bg-primary/60'
                        }`}
                      />
                      <span className="text-[10px] text-text-muted">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage Telemetry Parameters */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border/60 text-xs">
                <div>
                  <div className="text-[11px] text-text-muted">Total Capacity</div>
                  <div className="text-sm font-bold font-mono text-text-primary mt-0.5">{data.storageHistory?.totalCapacity}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Used</div>
                  <div className="text-sm font-bold font-mono text-danger mt-0.5">{data.storageHistory?.used}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Daily Growth</div>
                  <div className="text-sm font-bold font-mono text-text-primary mt-0.5">{data.storageHistory?.dailyGrowth}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Retention Policy</div>
                  <div className="text-sm font-mono text-text-secondary mt-0.5">{data.storageHistory?.retentionDays}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] text-text-muted">Warn Threshold</div>
                  <div className="text-xs font-mono text-warning-strong mt-0.5">
                    {data.storageHistory?.alertThreshold} (Alerted: {data.storageHistory?.alertTriggeredDate})
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: Audit History & Compliance (Figma 133:3923) */}
          <section className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-3" aria-label="Audit History and Compliance">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Audit History</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                  Compliance View
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAuditReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-surface-muted border border-border hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-text-secondary font-medium">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Previous State</th>
                    <th className="p-3">New State</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Session</th>
                    <th className="p-3 text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                  {data.auditHistory?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted/40">
                      <td className="p-3 text-text-muted whitespace-nowrap">{item.timestamp}</td>
                      <td className="p-3 font-sans font-medium text-text-primary whitespace-nowrap">{item.user}</td>
                      <td className="p-3 font-sans text-text-secondary whitespace-nowrap">{item.role}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                          {item.action}
                        </span>
                      </td>
                      <td className="p-3 text-text-primary whitespace-nowrap">{item.resource}</td>
                      <td className="p-3 text-danger line-through whitespace-nowrap">{item.previousState}</td>
                      <td className="p-3 text-success whitespace-nowrap">{item.newState}</td>
                      <td className="p-3 text-text-muted whitespace-nowrap">{item.sourceIp}</td>
                      <td className="p-3 text-text-secondary whitespace-nowrap">{item.session}</td>
                      <td className="p-3 text-right whitespace-nowrap font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-success/10 text-success border border-success/30 font-medium">
                          {item.approval}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 11: Related Pipelines Performance (Figma 133:4102) */}
          <section className="bg-surface-card border border-border rounded-lg p-5 shadow-sm space-y-3" aria-label="Related Pipelines Performance">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Related Pipelines</h2>
              </div>
              <Link to="/pipelines" className="text-xs text-primary hover:underline font-medium">
                View All Pipelines →
              </Link>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-text-secondary font-medium">
                    <th className="p-3">Pipeline</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Last Execution</th>
                    <th className="p-3">Total Runs</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.relatedPipelines?.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-muted/40">
                      <td className="p-3 font-mono font-semibold text-primary">{p.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(p.currentStatus)}`}>
                          {p.currentStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{p.lastExecution}</td>
                      <td className="p-3 font-mono text-text-primary">{p.totalRuns.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              style={{ width: `${p.successRate}%` }}
                              className={`h-full rounded-full ${
                                p.successRate >= 95 ? 'bg-success' : p.successRate >= 90 ? 'bg-warning' : 'bg-danger'
                              }`}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-text-primary">{p.successRate}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/pipelines/${encodeURIComponent(p.id)}`}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          View Pipeline
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 12: Event Details Drawer / Inspector (Figma 133:4227) */}
          {selectedEventDetails && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-drawer-title"
              className="fixed inset-0 z-50 overflow-hidden bg-overlay-scrim flex justify-end animate-fade-in"
            >
              <div className="w-full max-w-2xl bg-surface-page border-l border-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 id="event-drawer-title" className="text-base font-bold text-text-primary">
                          Event Details Inspector
                        </h2>
                        <span className="font-mono text-xs text-text-muted">{selectedEventDetails.id}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEventDetails(null)}
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
                      aria-label="Close Inspector"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Top Status & Target Strip */}
                  <div className="bg-surface-card border border-border rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[11px] text-text-muted">Status</div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(selectedEventDetails.status)}`}>
                          {selectedEventDetails.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Severity</div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(selectedEventDetails.severity)}`}>
                          {selectedEventDetails.severity}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Destination</div>
                      <div className="mt-1 font-mono font-semibold text-primary">{selectedEventDetails.destination}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Timestamp</div>
                      <div className="mt-1 font-mono text-text-secondary">{selectedEventDetails.timestamp}</div>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3 text-xs">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      Event Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-text-muted block">Description:</span>
                        <p className="text-text-primary mt-0.5 bg-surface-muted p-2.5 rounded border border-border font-mono text-[11px]">
                          {selectedEventDetails.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="text-text-muted">Correlation ID:</span>
                          <div className="font-mono text-text-primary mt-0.5">{selectedEventDetails.correlationId || 'EXEC-8821-A'}</div>
                        </div>
                        <div>
                          <span className="text-text-muted">Session ID:</span>
                          <div className="font-mono text-text-primary mt-0.5">{selectedEventDetails.sessionId || 'sess-8821'}</div>
                        </div>
                        <div>
                          <span className="text-text-muted">Triggered By:</span>
                          <div className="text-text-primary mt-0.5">{selectedEventDetails.userOrSystem}</div>
                        </div>
                        <div>
                          <span className="text-text-muted">Pipeline:</span>
                          <div className="font-mono text-primary mt-0.5">{selectedEventDetails.pipeline}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3 text-xs">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Operational Metrics
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-text-muted">Duration:</span>
                        <div className="font-mono text-text-primary font-semibold mt-0.5">{selectedEventDetails.duration}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Records Processed:</span>
                        <div className="font-mono text-text-primary font-semibold mt-0.5">{selectedEventDetails.records}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Error Code:</span>
                        <div className="font-mono text-danger font-semibold mt-0.5">{selectedEventDetails.errorCode}</div>
                      </div>
                    </div>
                  </div>

                  {/* System Context */}
                  <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3 text-xs">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-primary" />
                      System Context
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                      <div>
                        <span className="text-text-muted font-sans block">Region:</span>
                        <span className="text-text-primary">{selectedEventDetails.region}</span>
                      </div>
                      <div>
                        <span className="text-text-muted font-sans block">Source IP:</span>
                        <span className="text-text-primary">{selectedEventDetails.sourceIp}</span>
                      </div>
                      <div>
                        <span className="text-text-muted font-sans block">Organization:</span>
                        <span className="text-text-primary">{selectedEventDetails.org}</span>
                      </div>
                      <div>
                        <span className="text-text-muted font-sans block">Tenant:</span>
                        <span className="text-text-primary">{selectedEventDetails.tenant || 'enterprise-tier'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted font-sans block">Agent Version:</span>
                        <span className="text-text-primary">{selectedEventDetails.version || 'v2.14.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLogModalEvent(selectedEventDetails);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-muted border border-border hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>View Raw Logs</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEventDetails(null)}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-surface-muted border border-border text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      to={`/destinations/${selectedEventDetails.destination}/configure`}
                      className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-text-on-primary transition-colors inline-flex items-center gap-1"
                    >
                      <span>Open Destination</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Log Viewer Modal */}
          {logModalEvent && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="log-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay-scrim animate-fade-in"
            >
              <div className="w-full max-w-3xl bg-[#0d1117] text-[#c9d1d9] border border-border rounded-lg shadow-2xl overflow-hidden">
                <div className="px-4 py-3 bg-[#161b22] border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-on-primary">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span id="log-modal-title" className="font-bold">Execution Logs: {logModalEvent.id}</span>
                    <span className="text-text-muted">({logModalEvent.destination})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogModalEvent(null)}
                    className="text-text-muted hover:text-text-on-primary"
                    aria-label="Close Logs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed space-y-1.5 max-h-[400px] overflow-y-auto">
                  <div className="text-text-muted">[{logModalEvent.timestamp}] INFO [core.runner] Initializing event session for {logModalEvent.destination}</div>
                  <div className="text-text-muted">[{logModalEvent.timestamp}] INFO [auth.verifier] Checking tenant credentials for org: {logModalEvent.org}</div>
                  <div className="text-text-muted">[{logModalEvent.timestamp}] INFO [network.dialer] Connecting to socket endpoint at {logModalEvent.sourceIp}:5439</div>
                  {logModalEvent.status === 'Failed' ? (
                    <>
                      <div className="text-danger font-bold">[{logModalEvent.timestamp}] ERROR [transport.tcp] Dial error: Connection refused ({logModalEvent.errorCode})</div>
                      <div className="text-danger">[{logModalEvent.timestamp}] ERROR [pipeline.manager] Suspending pipeline {logModalEvent.pipeline} due to terminal endpoint error</div>
                      <div className="text-warning-strong">[{logModalEvent.timestamp}] WARN [health.sentinel] Emitting diagnostic alert to APM channel #data-ops</div>
                    </>
                  ) : (
                    <>
                      <div className="text-success font-bold">[{logModalEvent.timestamp}] SUCCESS [sync.writer] Successfully streamed payload chunk (records: {logModalEvent.records})</div>
                      <div className="text-success">[{logModalEvent.timestamp}] SUCCESS [pipeline.manager] Execution completed in {logModalEvent.duration}</div>
                    </>
                  )}
                </div>
                <div className="px-4 py-2.5 bg-[#161b22] border-t border-border/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Exit status: {logModalEvent.status === 'Failed' ? '1 (SIGFAIL)' : '0 (SUCCESS)'}</span>
                  <button
                    type="button"
                    onClick={() => setLogModalEvent(null)}
                    className="px-3 py-1 bg-surface-muted hover:bg-surface-muted text-text-primary rounded text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate Audit Report Modal */}
          {auditReportModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="audit-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay-scrim animate-fade-in"
            >
              <div className="w-full max-w-lg bg-surface-card border border-border rounded-lg shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 id="audit-modal-title" className="text-sm font-bold text-text-primary">
                      Generate Destination Audit Report
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuditReportModalOpen(false)}
                    className="text-text-muted hover:text-text-primary"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-medium text-text-primary mb-1">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none"
                    >
                      <option value="full-audit">Comprehensive Operational & Compliance Audit (SOC2 / ISO)</option>
                      <option value="security">Security & Access Modification Log</option>
                      <option value="incident">Incident & Failure Root-Cause Analysis</option>
                      <option value="performance">SLA & Throughput Performance Benchmark</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-text-primary mb-1">Date Range</label>
                      <input
                        type="text"
                        readOnly
                        value={`${startDate} to ${endDate}`}
                        className="w-full bg-surface-muted border border-border rounded-md px-3 py-1.5 text-text-secondary font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-text-primary mb-1">Format</label>
                      <select
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value)}
                        className="w-full bg-surface-muted border border-border rounded-md px-3 py-1.5 text-text-primary focus:outline-none"
                      >
                        <option value="PDF">Encrypted PDF (.pdf)</option>
                        <option value="CSV">Data Records CSV (.csv)</option>
                        <option value="JSON">Raw Telemetry JSON (.json)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-muted rounded-lg border border-border space-y-1">
                    <span className="font-semibold text-text-primary block">Included Scopes:</span>
                    <ul className="list-disc list-inside text-text-secondary text-[11px] space-y-0.5">
                      <li>48,291 historical synchronization events</li>
                      <li>Configuration mutation history with dual-approval trails</li>
                      <li>Sustained availability heatmap & downtime incident logs</li>
                      <li>Signed cryptographic verification digest</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuditReportModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-surface-muted border border-border text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAuditReport}
                    disabled={isGeneratingReport}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-text-on-primary transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling Audit Digest...</span>
                      </>
                    ) : reportGeneratedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span>Generated & Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate & Export</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </AppShell>
  );
}
