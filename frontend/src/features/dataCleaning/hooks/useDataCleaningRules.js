import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataCleaningApi } from '../services/dataCleaning.api';

// Comprehensive default mock data representative of realistic enterprise cleaning rules
const INITIAL_MOCK_RULES = [
  {
    _id: 'clean-1',
    ruleId: 'CLR-001',
    name: 'Trim Customer Names & Whitespace',
    description: 'Removes leading and trailing whitespace and collapses consecutive spaces into a single space.',
    category: 'Text Cleaning',
    subType: 'trim_whitespace',
    targetField: 'customer_name',
    sourceType: 'String',
    targetType: 'String',
    status: 'Active',
    version: 'v1.2.0',
    pipelinesCount: 6,
    usageCount: 142050,
    updatedAt: '2026-09-18T14:20:00Z',
    updatedBy: 'Sarah Connor',
    operation: 'Trim Whitespace',
    parameters: { leading: true, trailing: true, collapseMultiple: true },
  },
  {
    _id: 'clean-2',
    ruleId: 'CLR-002',
    name: 'Normalize Email Addresses',
    description: 'Converts email strings to lowercase, trims whitespace, and strips non-standard unicode characters.',
    category: 'Formatting',
    subType: 'normalize_email',
    targetField: 'contact_email',
    sourceType: 'String',
    targetType: 'String',
    status: 'Active',
    version: 'v2.0.1',
    pipelinesCount: 12,
    usageCount: 890400,
    updatedAt: '2026-09-17T09:15:00Z',
    updatedBy: 'Alex Rivera',
    operation: 'Email Normalization',
    parameters: { lowercase: true, trim: true, removeSpecial: false },
  },
  {
    _id: 'clean-3',
    ruleId: 'CLR-003',
    name: 'Remove Duplicate Customers by Tax ID',
    description: 'Deduplicates records based on tax identifier, keeping the most recently updated record.',
    category: 'Duplicate Handling',
    subType: 'deduplicate_exact',
    targetField: 'tax_identification_number',
    sourceType: 'String',
    targetType: 'String',
    status: 'Active',
    version: 'v1.0.0',
    pipelinesCount: 4,
    usageCount: 45000,
    updatedAt: '2026-09-16T11:45:00Z',
    updatedBy: 'David Kim',
    operation: 'Exact Duplicate Removal',
    parameters: { matchStrategy: 'exact', keepStrategy: 'latest' },
  },
  {
    _id: 'clean-4',
    ruleId: 'CLR-004',
    name: 'Replace Missing Country Codes',
    description: 'Assigns default country code "US" when field is null, empty string, or whitespace.',
    category: 'Null / Missing Data',
    subType: 'handle_nulls',
    targetField: 'billing_country_code',
    sourceType: 'String',
    targetType: 'String',
    status: 'Active',
    version: 'v1.1.0',
    pipelinesCount: 8,
    usageCount: 312000,
    updatedAt: '2026-09-15T16:30:00Z',
    updatedBy: 'Elena Rostova',
    operation: 'Default Value Fallback',
    parameters: { condition: 'isNullOrEmpty', defaultValue: 'US' },
  },
  {
    _id: 'clean-5',
    ruleId: 'CLR-005',
    name: 'Standardize International Phone Numbers',
    description: 'Formats phone numbers into strict E.164 standard, removing dashes, spaces, and brackets.',
    category: 'Formatting',
    subType: 'normalize_phone',
    targetField: 'primary_phone',
    sourceType: 'String',
    targetType: 'String',
    status: 'Active',
    version: 'v1.0.4',
    pipelinesCount: 5,
    usageCount: 94000,
    updatedAt: '2026-09-14T08:10:00Z',
    updatedBy: 'Sarah Connor',
    operation: 'E.164 Formatting',
    parameters: { defaultCountry: '+1', format: 'E.164' },
  },
  {
    _id: 'clean-6',
    ruleId: 'CLR-006',
    name: 'Standardize ISO-8601 Date Timestamps',
    description: 'Parses varied date inputs (MM/DD/YYYY, YYYY-MM-DD) into standardized UTC ISO-8601 format.',
    category: 'Formatting',
    subType: 'date_normalization',
    targetField: 'transaction_date',
    sourceType: 'Date/String',
    targetType: 'ISO Timestamp',
    status: 'Draft',
    version: 'v0.9.0',
    pipelinesCount: 0,
    usageCount: 0,
    updatedAt: '2026-09-19T07:20:00Z',
    updatedBy: 'David Kim',
    operation: 'ISO Date Standardization',
    parameters: { inputFormat: 'Auto-detect', outputFormat: 'YYYY-MM-DDTHH:mm:ssZ' },
  },
  {
    _id: 'clean-7',
    ruleId: 'CLR-007',
    name: 'Sanitize Special Characters from SKUs',
    description: 'Strips non-alphanumeric punctuation and converts all product SKUs to uppercase.',
    category: 'Text Cleaning',
    subType: 'remove_special_chars',
    targetField: 'item_sku',
    sourceType: 'String',
    targetType: 'String',
    status: 'Disabled',
    version: 'v1.0.0',
    pipelinesCount: 1,
    usageCount: 1200,
    updatedAt: '2026-09-10T14:00:00Z',
    updatedBy: 'Alex Rivera',
    operation: 'Regex Strip Punctuation',
    parameters: { regex: '[^a-zA-Z0-9-]', uppercase: true },
  },
];

export function useDataCleaningRules() {
  const queryClient = useQueryClient();

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPipelineUsage, setSelectedPipelineUsage] = useState('ALL');
  const [selectedCleaningType, setSelectedCleaningType] = useState('ALL');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected rules for bulk actions
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);

  // Local fallback storage for state changes during interactive sessions
  const [localRules, setLocalRules] = useState(INITIAL_MOCK_RULES);

  // Fetch cleaning rules
  const { data: serverData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dataCleaningRules', { currentPage, searchQuery, selectedCategory, selectedStatus }],
    queryFn: () => dataCleaningApi.getRules({
      search: searchQuery,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      page: currentPage,
      limit: pageSize,
    }),
    placeholderData: (previousData) => previousData,
  });

  // Combine server data with local state for reliable responsiveness
  const allRules = useMemo(() => {
    if (serverData?.rules && serverData.rules.length > 0) {
      return serverData.rules;
    }
    return localRules;
  }, [serverData, localRules]);

  // Client-side filtering & sorting for interactive controls
  const filteredRules = useMemo(() => {
    return allRules.filter((rule) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rule.name?.toLowerCase().includes(q);
        const matchDesc = rule.description?.toLowerCase().includes(q);
        const matchField = rule.targetField?.toLowerCase().includes(q);
        const matchId = rule.ruleId?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchField && !matchId) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && rule.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && rule.status !== selectedStatus) {
        return false;
      }

      // Pipeline Usage filter
      if (selectedPipelineUsage === 'USED' && (rule.pipelinesCount || 0) === 0) {
        return false;
      }
      if (selectedPipelineUsage === 'UNUSED' && (rule.pipelinesCount || 0) > 0) {
        return false;
      }

      // Cleaning Type filter
      if (selectedCleaningType !== 'ALL' && rule.subType !== selectedCleaningType) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allRules, searchQuery, selectedCategory, selectedStatus, selectedPipelineUsage, selectedCleaningType, sortBy, sortOrder]);

  // Paginate filtered results
  const totalItems = filteredRules.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRules = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRules.slice(startIndex, startIndex + pageSize);
  }, [filteredRules, currentPage, pageSize]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = allRules.length;
    const active = allRules.filter((r) => r.status === 'Active').length;
    const draft = allRules.filter((r) => r.status === 'Draft').length;
    const disabled = allRules.filter((r) => r.status === 'Disabled' || r.status === 'Archived').length;
    const usedInPipelines = allRules.filter((r) => (r.pipelinesCount || 0) > 0).length;

    return { total, active, draft, disabled, usedInPipelines };
  }, [allRules]);

  // Mutations
  const toggleRuleMutation = useMutation({
    mutationFn: async (id) => {
      try {
        await dataCleaningApi.toggleStatus(id);
      } catch (_e) {
        // Fallback local update
      }
      return id;
    },
    onSuccess: (id) => {
      setLocalRules((prev) =>
        prev.map((r) =>
          r._id === id || r.ruleId === id
            ? { ...r, status: r.status === 'Active' ? 'Disabled' : 'Active' }
            : r
        )
      );
      queryClient.invalidateQueries({ queryKey: ['dataCleaningRules'] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id) => {
      try {
        await dataCleaningApi.deleteRule(id);
      } catch (_e) {
        // Fallback local delete
      }
      return id;
    },
    onSuccess: (id) => {
      setLocalRules((prev) => prev.filter((r) => r._id !== id && r.ruleId !== id));
      setSelectedRuleIds((prev) => prev.filter((item) => item !== id));
      queryClient.invalidateQueries({ queryKey: ['dataCleaningRules'] });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (newRule) => {
      try {
        const created = await dataCleaningApi.createRule(newRule);
        return created;
      } catch (_e) {
        return {
          ...newRule,
          _id: 'clean-' + Date.now(),
          ruleId: 'CLR-' + Math.floor(100 + Math.random() * 900),
          updatedAt: new Date().toISOString(),
          pipelinesCount: 0,
          usageCount: 0,
          version: 'v1.0.0',
        };
      }
    },
    onSuccess: (created) => {
      setLocalRules((prev) => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['dataCleaningRules'] });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const updated = await dataCleaningApi.updateRule(id, data);
        return updated;
      } catch (_e) {
        return { id, data };
      }
    },
    onSuccess: ({ id, data }) => {
      setLocalRules((prev) =>
        prev.map((r) => (r._id === id || r.ruleId === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
      );
      queryClient.invalidateQueries({ queryKey: ['dataCleaningRules'] });
    },
  });

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRuleIds(paginatedRules.map((r) => r._id || r.ruleId));
    } else {
      setSelectedRuleIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedRuleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = () => {
    setLocalRules((prev) =>
      prev.map((r) =>
        selectedRuleIds.includes(r._id) || selectedRuleIds.includes(r.ruleId)
          ? { ...r, status: 'Active' }
          : r
      )
    );
    setSelectedRuleIds([]);
  };

  const handleBulkDeactivate = () => {
    setLocalRules((prev) =>
      prev.map((r) =>
        selectedRuleIds.includes(r._id) || selectedRuleIds.includes(r.ruleId)
          ? { ...r, status: 'Disabled' }
          : r
      )
    );
    setSelectedRuleIds([]);
  };

  const handleBulkDelete = () => {
    setLocalRules((prev) =>
      prev.filter((r) => !selectedRuleIds.includes(r._id) && !selectedRuleIds.includes(r.ruleId))
    );
    setSelectedRuleIds([]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedPipelineUsage('ALL');
    setSelectedCleaningType('ALL');
    setCurrentPage(1);
  };

  return {
    rules: paginatedRules,
    totalRulesCount: totalItems,
    pagination: {
      page: currentPage,
      totalPages,
      total: totalItems,
    },
    stats,
    isLoading,
    isError,
    error,
    refetch,

    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedPipelineUsage,
    setSelectedPipelineUsage,
    selectedCleaningType,
    setSelectedCleaningType,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    resetFilters,

    // Bulk selection
    selectedRuleIds,
    handleSelectAll,
    handleSelectOne,
    handleBulkActivate,
    handleBulkDeactivate,
    handleBulkDelete,

    // Mutations
    toggleRuleStatus: toggleRuleMutation.mutateAsync,
    deleteRule: deleteRuleMutation.mutateAsync,
    createRule: createRuleMutation.mutateAsync,
    updateRule: updateRuleMutation.mutateAsync,
    isDeleting: deleteRuleMutation.isPending,
  };
}
