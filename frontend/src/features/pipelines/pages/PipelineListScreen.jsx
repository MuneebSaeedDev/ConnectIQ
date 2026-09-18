import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCw,
  Upload,
  Download,
  Plus,
  ChevronDown,
  Play,
  Edit2,
  MoreHorizontal,
  ChevronRight,
  Hexagon,
  Target,
  PlayCircle,
  Clock,
  XCircle,
  CheckCircle2,
  Timer,
  Grid3X3,
  SlidersHorizontal,
  Eye,
  Bookmark,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import AppShell from '../../shell/components/AppShell';
import { usePipelineList } from '../hooks/usePipelineList';
import {
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  ENVIRONMENT_OPTIONS,
  SCHEDULE_OPTIONS,
  OWNER_OPTIONS,
  TEAM_OPTIONS,
  SOURCE_OPTIONS,
  DESTINATION_OPTIONS,
  SAVED_VIEWS,
  QUICK_FILTERS,
} from '../services/pipelineList.api';
import BulkActionBar from '../components/BulkActionBar';
import PipelineDetailDrawer from '../components/PipelineDetailDrawer';
import ExpandedRowPreview from '../components/ExpandedRowPreview';
import PipelineAnalyticsSection from '../components/PipelineAnalyticsSection';
import RecentExecutionsSection from '../components/RecentExecutionsSection';
import RecentOperationalActivitySection from '../components/RecentOperationalActivitySection';

const STATUS_CONFIG = {
  Running: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Scheduled: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Paused: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Disabled: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  Retrying: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500 animate-spin' },
  Draft: { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

const KPI_ICONS = {
  hexagon: Hexagon,
  target: Target,
  play: PlayCircle,
  clock: Clock,
  x: XCircle,
  check: CheckCircle2,
  stopwatch: Timer,
  grid: Grid3X3,
};

export default function PipelineListScreen() {
  // Filters State
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [type, setType] = useState('All Types');
  const [environment, setEnvironment] = useState('All Environments');
  const [schedule, setSchedule] = useState('All Schedules');
  const [owner, setOwner] = useState('All Owners');
  const [team, setTeam] = useState('All Teams');
  const [tag, setTag] = useState('All Tags');
  const [source, setSource] = useState('All Sources');
  const [destination, setDestination] = useState('All Destinations');
  const [quickFilter, setQuickFilter] = useState('all');

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selection & Details State
  const [selectedIds, setSelectedIds] = useState(new Set(['pipe-004'])); // User Events Stream selected by default matching Figma
  const [expandedRowId, setExpandedRowId] = useState('pipe-004'); // User Events Stream expanded preview in Figma
  const [drawerPipeline, setDrawerPipeline] = useState(null);
  const [activeDropdownMenu, setActiveDropdownMenu] = useState(null);
  const [viewsMenuOpen, setViewsMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Visible columns configuration
  const [visibleColumns, setVisibleColumns] = useState({
    schedule: true,
    source: true,
    destination: true,
    owner: true,
    team: true,
    lastExec: true,
    nextExec: true,
    duration: true,
    records: true,
    success: true,
    version: true,
  });

  // Query Hook
  const queryFilters = useMemo(
    () => ({
      search: tableFilter || search,
      status,
      type,
      environment,
      schedule,
      owner,
      team,
      tag,
      source,
      destination,
      quickFilter,
      page,
      pageSize,
      sortField,
      sortOrder,
    }),
    [
      tableFilter,
      search,
      status,
      type,
      environment,
      schedule,
      owner,
      team,
      tag,
      source,
      destination,
      quickFilter,
      page,
      pageSize,
      sortField,
      sortOrder,
    ]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    runPipeline,
    setStatus: updatePipelineStatus,
    duplicatePipeline: clonePipeline,
    deletePipeline: removePipeline,
    bulkOperate,
    isBulkOperating,
  } = usePipelineList('current', queryFilters);

  const showToast = (message, tone = 'success') => {
    setFeedbackNotice({ message, tone });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setTableFilter('');
    setStatus('All Statuses');
    setType('All Types');
    setEnvironment('All Environments');
    setSchedule('All Schedules');
    setOwner('All Owners');
    setTeam('All Teams');
    setTag('All Tags');
    setSource('All Sources');
    setDestination('All Destinations');
    setQuickFilter('all');
    setPage(1);
    showToast('Filters cleared');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(data?.items?.map((item) => item.id) || []);
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRun = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await runPipeline(id);
      showToast('Pipeline execution started');
    } catch {
      showToast('Failed to trigger execution', 'error');
    }
  };

  const handlePauseToggle = async (id, targetStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await updatePipelineStatus({ pipelineId: id, status: targetStatus });
      showToast(`Pipeline status updated to ${targetStatus}`);
    } catch {
      showToast('Failed to update pipeline status', 'error');
    }
  };

  const handleDuplicate = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await clonePipeline(id);
      showToast('Pipeline duplicated successfully');
    } catch {
      showToast('Failed to duplicate pipeline', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this pipeline?')) {
      try {
        await removePipeline(id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast('Pipeline deleted');
      } catch {
        showToast('Failed to delete pipeline', 'error');
      }
    }
  };

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${ids.length} selected pipeline(s)?`)) {
        return;
      }
    }

    try {
      await bulkOperate({ ids, action });
      showToast(`Bulk action "${action}" completed for ${ids.length} pipelines`);
      if (action === 'delete') {
        setSelectedIds(new Set());
      }
    } catch {
      showToast(`Failed to execute bulk action "${action}"`, 'error');
    }
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(data?.items || [], null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectiq-pipelines-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported pipelines configuration');
  };

  const pipelines = data?.items || [];
  const allSelected = pipelines.length > 0 && pipelines.every((p) => selectedIds.has(p.id));
  const someSelected = pipelines.some((p) => selectedIds.has(p.id)) && !allSelected;

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Library']}>
      <div className="space-y-6 pb-20">
        {/* Toast / Feedback Notice */}
        {feedbackNotice && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
              feedbackNotice.tone === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{feedbackNotice.message}</span>
          </div>
        )}

        {/* 1. Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Pipeline Library
              </h1>
              {data?.mocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="size-3 text-amber-500" />
                  Sample Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Manage, organize, monitor, and operate all data pipelines across the enterprise platform.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                refetch();
                showToast('Refreshing pipeline fleet status...');
              }}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`size-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs active:scale-95"
            >
              <Download className="size-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Bulk Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBulkMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>Bulk Actions</span>
                <ChevronDown className="size-3.5 text-slate-500" />
              </button>

              {bulkMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      handleBulkAction('run');
                      setBulkMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Play className="size-3.5 text-blue-500" />
                    <span>Run Selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleBulkAction('pause');
                      setBulkMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="size-3.5 text-amber-500" />
                    <span>Pause Selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleBulkAction('export');
                      setBulkMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Download className="size-3.5 text-slate-500" />
                    <span>Export Configurations</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => showToast('Import Pipeline dialog opened')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs active:scale-95"
            >
              <Upload className="size-3.5 text-slate-500" />
              <span>Import Pipeline</span>
            </button>

            <Link
              to="/pipelines/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition active:scale-95"
            >
              <Plus className="size-4" />
              <span>Create Pipeline</span>
            </Link>
          </div>
        </div>

        {/* 2. Search, Filter Bar & Quick Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
          {/* Main Filter Dropdowns Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search pipelines..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Status Select */}
            <select
              value={status}
              aria-label="Filter by Status"
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Type Select */}
            <select
              value={type}
              aria-label="Filter by Type"
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Environment Select */}
            <select
              value={environment}
              aria-label="Filter by Environment"
              onChange={(e) => {
                setEnvironment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENVIRONMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Schedule Select */}
            <select
              value={schedule}
              aria-label="Filter by Schedule"
              onChange={(e) => {
                setSchedule(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SCHEDULE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Owner Select */}
            <select
              value={owner}
              aria-label="Filter by Owner"
              onChange={(e) => {
                setOwner(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OWNER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Team Select */}
            <select
              value={team}
              aria-label="Filter by Team"
              onChange={(e) => {
                setTeam(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TEAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Source Select */}
            <select
              value={source}
              aria-label="Filter by Source"
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Destination Select */}
            <select
              value={destination}
              aria-label="Filter by Destination"
              onChange={(e) => {
                setDestination(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DESTINATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Clear All Text Button */}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 transition"
            >
              Clear All
            </button>

            {/* Right Telemetry / Auto-refresh */}
            <div className="flex items-center gap-3 ml-auto text-xs text-slate-500 border-l border-slate-200 pl-3">
              <span className="font-semibold text-slate-700">{data?.total || 248} pipelines</span>
              <span className="text-slate-300">•</span>
              <span>Updated 30s ago</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-refresh
              </span>
            </div>
          </div>

          {/* Quick Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider mr-1">
              Quick:
            </span>

            {QUICK_FILTERS.map((qf) => {
              const isActive = quickFilter === qf.id;
              let toneBadge = 'bg-slate-100 text-slate-700 hover:bg-slate-200/80';
              if (isActive) {
                toneBadge = 'bg-blue-600 text-white font-semibold shadow-2xs';
              } else if (qf.tone === 'red') {
                toneBadge = 'bg-red-50 text-red-700 hover:bg-red-100/80 border border-red-200';
              } else if (qf.tone === 'blue') {
                toneBadge = 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200';
              } else if (qf.tone === 'purple') {
                toneBadge = 'bg-purple-50 text-purple-700 hover:bg-purple-100/80 border border-purple-200';
              }

              return (
                <button
                  key={qf.id}
                  type="button"
                  onClick={() => {
                    setQuickFilter(qf.id);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition text-xs ${toneBadge}`}
                >
                  <span>{qf.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-current'
                    }`}
                  >
                    {qf.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 8 Top KPI Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {data?.kpis?.map((kpi) => {
            const IconComponent = KPI_ICONS[kpi.icon] || Hexagon;
            const isDanger = kpi.changeTone === 'danger';
            return (
              <div
                key={kpi.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 truncate block" title={kpi.label}>
                    {kpi.label}
                  </span>
                  <IconComponent className="size-4 text-slate-600 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold mt-0.5">
                    <span className={isDanger ? 'text-red-700' : 'text-emerald-700'}>
                      {kpi.change}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 block truncate mt-0.5">
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Visual Overview & Analytics Charts Row (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status Distribution
            </h3>
            <div className="space-y-2 text-xs">
              {data?.statusDistribution?.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900 font-bold">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Success vs Failure (24h) Stacked Columns */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Success vs Failure (24h)
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Success
                </span>
                <span className="flex items-center gap-1 text-red-700 font-medium">
                  <span className="size-2 rounded-full bg-red-500" />
                  Failure
                </span>
              </div>
            </div>

            {/* 12/24 Stacked Column Bars */}
            <div className="flex items-end gap-1.5 h-28 pt-2">
              {data?.successVsFailure24h?.map((col, idx) => {
                const failHeight = col.failure * 1.5;
                const succHeight = col.success * 0.8;
                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full gap-0.5 group relative">
                    <div
                      className="w-full bg-red-500 rounded-t-xs transition-all group-hover:opacity-80"
                      style={{ height: `${failHeight}%` }}
                      title={`${col.hour} - Failure: ${col.failure}%`}
                    />
                    <div
                      className="w-full bg-emerald-500 rounded-b-xs transition-all group-hover:opacity-80"
                      style={{ height: `${succHeight}%` }}
                      title={`${col.hour} - Success: ${col.success}%`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Trigger Types Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Trigger Types
            </h3>
            <div className="flex items-center justify-center gap-6 py-1">
              {/* SVG Donut */}
              <div className="relative size-24 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="3.8"
                  />
                  {/* Scheduled (57%) - Blue */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="3.8"
                    strokeDasharray="57 43"
                    strokeDashoffset="0"
                  />
                  {/* Manual (22%) - Purple */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="3.8"
                    strokeDasharray="22 78"
                    strokeDashoffset="-57"
                  />
                  {/* Event-driven (21%) - Emerald */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray="21 79"
                    strokeDashoffset="-79"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">248</span>
                  <span className="text-[9px] text-slate-600 uppercase font-semibold">total</span>
                </div>
              </div>

              {/* Legend & Percentages */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="size-2 rounded-full bg-blue-500" />
                    Scheduled
                  </span>
                  <span className="font-bold text-slate-900">57%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="size-2 rounded-full bg-purple-500" />
                    Manual
                  </span>
                  <span className="font-bold text-slate-900">22%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Event-driven
                  </span>
                  <span className="font-bold text-slate-900">21%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Execution Trend (7d) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Execution Trend (7d)
              </h3>
              <span className="text-[11px] text-slate-600">Daily executions</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-24 pt-1">
              {data?.executionTrend7d?.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-blue-500 rounded-t-xs hover:bg-blue-600 transition"
                    style={{ height: `${day.height}%` }}
                    title={`${day.day}: ${day.count} executions`}
                  />
                  <span className="text-[10px] font-medium text-slate-600">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Pipeline Inventory Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Table Header Bar */}
          <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pipeline Inventory
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Table search filter */}
              <div className="relative min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-600" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder="Filter table…"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Columns Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setColumnsMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Eye className="size-3.5 text-slate-500" />
                  <span>Columns</span>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>

                {columnsMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 space-y-1 text-xs">
                    {Object.keys(visibleColumns).map((colKey) => (
                      <label key={colKey} className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:bg-slate-50 rounded cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={visibleColumns[colKey]}
                          onChange={(e) =>
                            setVisibleColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))
                          }
                          className="rounded text-blue-600"
                        />
                        <span>{colKey}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Views Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setViewsMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Bookmark className="size-3.5 text-slate-500" />
                  <span>Views</span>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>

                {viewsMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                    {SAVED_VIEWS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          showToast(`Applied view: ${v.label}`);
                          setViewsMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => showToast('View configuration saved')}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Save View
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label="Select all pipelines"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>PIPELINE NAME</span>
                      <span className="text-slate-400">↕</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">STATUS</th>
                  {visibleColumns.schedule && <th scope="col" className="px-4 py-3">SCHEDULE</th>}
                  {visibleColumns.source && <th scope="col" className="px-4 py-3">SOURCE</th>}
                  {visibleColumns.destination && <th scope="col" className="px-4 py-3">DESTINATION</th>}
                  {visibleColumns.owner && <th scope="col" className="px-4 py-3">OWNER</th>}
                  {visibleColumns.team && <th scope="col" className="px-4 py-3">TEAM</th>}
                  {visibleColumns.lastExec && <th scope="col" className="px-4 py-3">LAST EXEC</th>}
                  {visibleColumns.nextExec && <th scope="col" className="px-4 py-3">NEXT EXEC</th>}
                  {visibleColumns.duration && <th scope="col" className="px-4 py-3">DURATION</th>}
                  {visibleColumns.records && <th scope="col" className="px-4 py-3">RECORDS</th>}
                  {visibleColumns.success && <th scope="col" className="px-4 py-3">SUCCESS</th>}
                  {visibleColumns.version && <th scope="col" className="px-4 py-3">VERSION</th>}
                  <th scope="col" className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white font-normal">
                {isLoading ? (
                  <tr>
                    <td colSpan={15} className="p-8 text-center text-slate-500">
                      <RotateCw className="size-6 animate-spin text-blue-600 mx-auto mb-2" />
                      Loading pipeline inventory...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={15} className="p-8 text-center text-red-600">
                      <AlertCircle className="size-6 text-red-500 mx-auto mb-2" />
                      Failed to load pipeline catalogue.
                    </td>
                  </tr>
                ) : pipelines.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="p-8 text-center text-slate-500">
                      No pipelines match your current filters.
                    </td>
                  </tr>
                ) : (
                  pipelines.map((pipe) => {
                    const isSelected = selectedIds.has(pipe.id);
                    const isExpanded = expandedRowId === pipe.id;
                    const statusStyle = STATUS_CONFIG[pipe.status] || STATUS_CONFIG.Running;

                    return (
                      <React.Fragment key={pipe.id}>
                        <tr
                          onClick={() => setDrawerPipeline(pipe)}
                          className={`group transition cursor-pointer ${
                            isSelected ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleSelect(pipe.id, e)}
                              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label={`Select ${pipe.name}`}
                            />
                          </td>

                          {/* Pipeline Name */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRowId((prev) => (prev === pipe.id ? null : pipe.id));
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700 transition"
                                aria-label="Toggle preview"
                              >
                                <ChevronRight className={`size-3.5 transition-transform ${isExpanded ? 'rotate-90 text-blue-600' : ''}`} />
                              </button>
                              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                                {pipe.name}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg}`}
                            >
                              <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                              {pipe.status}
                            </span>
                          </td>

                          {/* Schedule */}
                          {visibleColumns.schedule && (
                            <td className="px-4 py-3.5 text-slate-600">
                              {pipe.schedule}
                            </td>
                          )}

                          {/* Source */}
                          {visibleColumns.source && (
                            <td className="px-4 py-3.5 text-slate-800 font-medium">
                              <span className="inline-flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-blue-500" />
                                {pipe.source}
                              </span>
                            </td>
                          )}

                          {/* Destination */}
                          {visibleColumns.destination && (
                            <td className="px-4 py-3.5 text-slate-800 font-medium">
                              <span className="inline-flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-indigo-500" />
                                {pipe.destination}
                              </span>
                            </td>
                          )}

                          {/* Owner */}
                          {visibleColumns.owner && (
                            <td className="px-4 py-3.5 text-slate-700">
                              {pipe.owner}
                            </td>
                          )}

                          {/* Team */}
                          {visibleColumns.team && (
                            <td className="px-4 py-3.5 text-slate-700">
                              {pipe.team}
                            </td>
                          )}

                          {/* Last Exec */}
                          {visibleColumns.lastExec && (
                            <td className="px-4 py-3.5 text-slate-600 font-mono">
                              {pipe.lastExec}
                            </td>
                          )}

                          {/* Next Exec */}
                          {visibleColumns.nextExec && (
                            <td className="px-4 py-3.5 text-slate-600">
                              {pipe.nextExec}
                            </td>
                          )}

                          {/* Duration */}
                          {visibleColumns.duration && (
                            <td className="px-4 py-3.5 text-slate-700 font-medium">
                              {pipe.duration}
                            </td>
                          )}

                          {/* Records */}
                          {visibleColumns.records && (
                            <td className="px-4 py-3.5 text-slate-900 font-semibold">
                              {pipe.records}
                            </td>
                          )}

                          {/* Success Rate */}
                          {visibleColumns.success && (
                            <td className="px-4 py-3.5 text-emerald-700 font-semibold">
                              {pipe.successRate}
                            </td>
                          )}

                          {/* Version */}
                          {visibleColumns.version && (
                            <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                              {pipe.version}
                            </td>
                          )}

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleRun(pipe.id, e)}
                                title="Run Pipeline"
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Play className="size-3.5" />
                              </button>
                              <Link
                                to={`/pipelines/new?edit=${pipe.id}`}
                                title="Edit Pipeline"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              >
                                <Edit2 className="size-3.5" />
                              </Link>
                              <div className="relative inline-block">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownMenu(activeDropdownMenu === pipe.id ? null : pipe.id);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </button>

                                {activeDropdownMenu === pipe.id && (
                                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs text-left">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDrawerPipeline(pipe);
                                        setActiveDropdownMenu(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownMenu(null);
                                        handlePauseToggle(pipe.id, pipe.status === 'Paused' ? 'Running' : 'Paused', e);
                                      }}
                                      className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                                    >
                                      {pipe.status === 'Paused' ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownMenu(null);
                                        handleDuplicate(pipe.id, e);
                                      }}
                                      className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                                    >
                                      Duplicate
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownMenu(null);
                                        handleDelete(pipe.id, e);
                                      }}
                                      className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 border-t border-slate-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Expanded Row Preview */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={15} className="p-0">
                              <ExpandedRowPreview
                                pipeline={pipe}
                                onCollapse={() => setExpandedRowId(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-600">
              Showing {data?.filteredTotal > 0 ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, data?.filteredTotal || 0)} of 248 pipelines
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition disabled:opacity-40"
              >
                ← Prev
              </button>

              {[1, 2, 3].map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={`size-8 rounded-lg font-semibold transition ${
                    page === pNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <span className="px-1 text-slate-400">…</span>

              <button
                type="button"
                onClick={() => setPage(25)}
                className={`size-8 rounded-lg font-semibold transition ${
                  page === 25
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                25
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data?.totalPages || 25, p + 1))}
                disabled={page >= (data?.totalPages || 25)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Secondary Pipeline Analytics Section */}
        <PipelineAnalyticsSection analytics={data?.analytics} />

        {/* 7. Recent Executions Section */}
        <RecentExecutionsSection executions={data?.recentExecutions} />

        {/* 8. Recent Operational Activity Section */}
        <RecentOperationalActivitySection activity={data?.recentActivity} />

        {/* Floating Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkAction={handleBulkAction}
          isLoading={isBulkOperating}
        />

        {/* Pipeline Details Drawer */}
        <PipelineDetailDrawer
          pipeline={drawerPipeline}
          isOpen={Boolean(drawerPipeline)}
          onClose={() => setDrawerPipeline(null)}
          onRun={handleRun}
          onPauseToggle={handlePauseToggle}
          onDuplicate={handleDuplicate}
        />
      </div>
    </AppShell>
  );
}
