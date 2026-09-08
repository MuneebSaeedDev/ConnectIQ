import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ORG_ID,
  DEFAULT_DESTINATION_HISTORY_DATA,
  getDestinationHistory,
  exportHistoryCsv,
} from '../services/destinationHistory.api';

export function useDestinationHistory(destinationId = 'dest-snowflake-01', orgId = ORG_ID) {
  // Filter states
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severity');
  const [selectedEnvironment, setSelectedEnvironment] = useState('All Environments');
  const [selectedOrganization, setSelectedOrganization] = useState('All Organizations');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedPipeline, setSelectedPipeline] = useState('All Pipelines');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-08-05');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  // Table pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Modals & Drawers state
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [logModalEvent, setLogModalEvent] = useState(null);
  const [auditReportModalOpen, setAuditReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGeneratedSuccess, setReportGeneratedSuccess] = useState(false);

  // Time range selector for charts
  const [chartTimeRange, setChartTimeRange] = useState('30D');

  // Timeline expand/collapse state
  const [timelineExpandedDays, setTimelineExpandedDays] = useState({
    'Aug 05, 2026': true,
    'Aug 04, 2026': false,
    'Aug 03, 2026': false,
  });

  const queryKey = useMemo(
    () => [
      'destination-history',
      orgId,
      destinationId,
      selectedDestination,
      selectedCategory,
      selectedStatus,
      selectedSeverity,
      startDate,
      endDate,
    ],
    [orgId, destinationId, selectedDestination, selectedCategory, selectedStatus, selectedSeverity, startDate, endDate]
  );

  const {
    data = DEFAULT_DESTINATION_HISTORY_DATA,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getDestinationHistory(orgId, destinationId, {
        destination: selectedDestination !== 'all' ? selectedDestination : undefined,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        status: selectedStatus !== 'All Statuses' ? selectedStatus : undefined,
        severity: selectedSeverity !== 'All Severity' ? selectedSeverity : undefined,
        startDate,
        endDate,
        search: searchTerm || undefined,
      }),
    staleTime: 30_000,
  });

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    if (!data.activityTimeline) return [];
    return data.activityTimeline.map((group) => {
      const filteredEvents = group.events.filter((ev) => {
        if (selectedDestination !== 'all' && ev.target !== selectedDestination) return false;
        if (selectedSeverity !== 'All Severity' && ev.severity !== selectedSeverity) return false;
        if (selectedCategory !== 'All Categories' && !ev.category.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, 4))) return false;
        if (searchTerm) {
          const matchSearch =
            ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.actor.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchSearch) return false;
        }
        return true;
      });
      return {
        ...group,
        events: filteredEvents,
      };
    }).filter((g) => g.events.length > 0);
  }, [data.activityTimeline, selectedDestination, selectedSeverity, selectedCategory, searchTerm]);

  // Tab & search filtered history records
  const filteredRecords = useMemo(() => {
    if (!data.historyRecords) return [];
    return data.historyRecords.filter((record) => {
      // Tab filter
      if (activeTab === 'Sync History' && record.category !== 'Sync') return false;
      if (activeTab === 'Failures' && record.status !== 'Failed' && record.severity !== 'Critical') return false;
      if (activeTab === 'Config Changes' && record.category !== 'Config') return false;
      if (activeTab === 'Performance Alerts' && record.category !== 'Performance') return false;
      if (activeTab === 'Authentication Events' && record.category !== 'Auth') return false;
      if (activeTab === 'Audit Logs' && record.category === 'Sync') return false;

      // Dropdown filters
      if (selectedDestination !== 'all' && record.destination !== selectedDestination) return false;
      if (selectedStatus !== 'All Statuses' && record.status !== selectedStatus) return false;
      if (selectedSeverity !== 'All Severity' && record.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'All Categories' && record.category !== selectedCategory) return false;
      if (selectedPipeline !== 'All Pipelines' && record.pipeline !== selectedPipeline) return false;

      // Text search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          record.id.toLowerCase().includes(term) ||
          record.destination.toLowerCase().includes(term) ||
          record.event.toLowerCase().includes(term) ||
          record.category.toLowerCase().includes(term) ||
          record.status.toLowerCase().includes(term) ||
          record.pipeline.toLowerCase().includes(term) ||
          record.userOrSystem.toLowerCase().includes(term) ||
          record.errorCode.toLowerCase().includes(term) ||
          record.sourceIp.toLowerCase().includes(term) ||
          record.org.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.historyRecords, activeTab, selectedDestination, selectedStatus, selectedSeverity, selectedCategory, selectedPipeline, searchTerm]);

  // Sorted records
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredRecords, sortField, sortDirection]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;

  // Sorting handler
  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // Row selection handlers
  const toggleSelectRow = useCallback((id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedRowIds.length === paginatedRecords.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedRecords.map((r) => r.id));
    }
  }, [selectedRowIds, paginatedRecords]);

  // Export handlers
  const handleExportCsv = useCallback(() => {
    const recordsToExport = selectedRowIds.length > 0
      ? data.historyRecords.filter((r) => selectedRowIds.includes(r.id))
      : filteredRecords;
    exportHistoryCsv(recordsToExport);
  }, [data.historyRecords, selectedRowIds, filteredRecords]);

  // Timeline toggle handlers
  const toggleTimelineDay = useCallback((date) => {
    setTimelineExpandedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  }, []);

  const expandAllTimeline = useCallback(() => {
    const all = {};
    data.activityTimeline?.forEach((g) => {
      all[g.date] = true;
    });
    setTimelineExpandedDays(all);
  }, [data.activityTimeline]);

  const collapseAllTimeline = useCallback(() => {
    const all = {};
    data.activityTimeline?.forEach((g) => {
      all[g.date] = false;
    });
    setTimelineExpandedDays(all);
  }, [data.activityTimeline]);

  // Audit report generator simulation
  const handleGenerateAuditReport = useCallback(() => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setReportGeneratedSuccess(true);
      setTimeout(() => {
        setAuditReportModalOpen(false);
        setReportGeneratedSuccess(false);
      }, 1500);
    }, 1200);
  }, []);

  // Quick reset filters
  const resetFilters = useCallback(() => {
    setSelectedDestination('all');
    setSelectedType('All Types');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setSelectedSeverity('All Severity');
    setSelectedEnvironment('All Environments');
    setSelectedOrganization('All Organizations');
    setSelectedUser('All Users');
    setSelectedPipeline('All Pipelines');
    setStartDate('2026-07-01');
    setEndDate('2026-08-05');
    setSearchTerm('');
    setActiveTab('All');
    setCurrentPage(1);
    setSelectedRowIds([]);
  }, []);

  return {
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
    selectedTags,
    setSelectedTags,
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
  };
}
