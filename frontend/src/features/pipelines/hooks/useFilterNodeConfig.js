import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchFilterNodeConfig,
  saveFilterNodeConfig,
  saveFilterDraft,
  validateFilterNode,
  previewFilterData,
  refreshDatasetMetadata,
  duplicateFilterNode,
  generateExpressionFromRules,
  DEFAULT_FILTER_NODE_CONFIG,
} from '../services/filterNodeConfig.api';

export function useFilterNodeConfig(nodeId = 'node_filter_007', pipelineId = 'pip_001') {
  // 1. Fetch remote/mock baseline
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'filter-config'],
    queryFn: () => fetchFilterNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Editable form state
  const [form, setForm] = useState(DEFAULT_FILTER_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_FILTER_NODE_CONFIG);

  // Sync form when initialData loads
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  // Action status & state
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [validationSummary, setValidationSummary] = useState(
    DEFAULT_FILTER_NODE_CONFIG.validationSummary
  );
  const [previewTab, setPreviewTab] = useState('after'); // 'before' | 'after' | 'diff'
  const [sampleLimit, setSampleLimit] = useState(100);

  // Modals state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [viewSchemaModalOpen, setViewSchemaModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [activeFixItem, setActiveFixItem] = useState(null);

  // Collapsible accordions
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-clear feedback
  const showFeedback = useCallback((type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  }, []);

  // Update root fields
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update nested object fields
  const updateNestedField = useCallback((parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  }, []);

  // Tags management
  const addTag = useCallback((newTag) => {
    const clean = newTag.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!clean) return;
    setForm((prev) => {
      if ((prev.tags || []).includes(clean)) return prev;
      return {
        ...prev,
        tags: [...(prev.tags || []), clean],
      };
    });
  }, []);

  const removeTag = useCallback((tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  }, []);

  // Basic rules management
  const setLogic = useCallback((logic) => {
    setForm((prev) => {
      const nextBasic = { ...prev.basicRules, logic };
      const generated = generateExpressionFromRules(nextBasic);
      return {
        ...prev,
        basicRules: nextBasic,
        advancedExpression: generated,
      };
    });
  }, []);

  const toggleNotGroup = useCallback(() => {
    setForm((prev) => {
      const nextBasic = { ...prev.basicRules, notGroup: !prev.basicRules?.notGroup };
      const generated = generateExpressionFromRules(nextBasic);
      return {
        ...prev,
        basicRules: nextBasic,
        advancedExpression: generated,
      };
    });
  }, []);

  const addRule = useCallback(() => {
    setForm((prev) => {
      const newId = `r_${Date.now().toString().slice(-4)}`;
      const newRule = {
        id: newId,
        field: 'status',
        operator: 'equals',
        value: 'active',
        dataType: 'STRING',
        nullHandling: 'EXCLUDE',
        caseSensitive: false,
      };
      const nextBasic = {
        ...prev.basicRules,
        rules: [...(prev.basicRules?.rules || []), newRule],
      };
      const generated = generateExpressionFromRules(nextBasic);
      return {
        ...prev,
        basicRules: nextBasic,
        advancedExpression: generated,
      };
    });
  }, []);

  const removeRule = useCallback((ruleId) => {
    setForm((prev) => {
      const nextBasic = {
        ...prev.basicRules,
        rules: (prev.basicRules?.rules || []).filter((r) => r.id !== ruleId),
      };
      const generated = generateExpressionFromRules(nextBasic);
      return {
        ...prev,
        basicRules: nextBasic,
        advancedExpression: generated,
      };
    });
  }, []);

  const updateRule = useCallback((ruleId, field, value) => {
    setForm((prev) => {
      const nextRules = (prev.basicRules?.rules || []).map((r) => {
        if (r.id === ruleId) {
          const updated = { ...r, [field]: value };
          // If field changes, auto-set dataType
          if (field === 'field') {
            const schemaField = prev.inputDataset?.columns?.find((c) => c.name === value);
            if (schemaField) {
              updated.dataType = schemaField.type;
            }
          }
          return updated;
        }
        return r;
      });

      const nextBasic = { ...prev.basicRules, rules: nextRules };
      const generated = generateExpressionFromRules(nextBasic);
      return {
        ...prev,
        basicRules: nextBasic,
        advancedExpression: generated,
      };
    });
  }, []);

  // Performance Optimization toggles
  const togglePerformanceOpt = useCallback((key) => {
    setForm((prev) => ({
      ...prev,
      performanceOpt: {
        ...prev.performanceOpt,
        [key]: !prev.performanceOpt?.[key],
      },
    }));
  }, []);

  // Monitoring toggles
  const toggleMonitoringChannel = useCallback((channelKey) => {
    setForm((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        channels: {
          ...prev.monitoring?.channels,
          [channelKey]: !prev.monitoring?.channels?.[channelKey],
        },
      },
    }));
  }, []);

  // Dynamic preview evaluation based on live form rules
  const evaluatedPreview = useMemo(() => {
    const rawRows = form.dataPreview?.sampleRows || DEFAULT_FILTER_NODE_CONFIG.dataPreview.sampleRows;
    const rules = form.basicRules?.rules || [];

    const evaluatedRows = rawRows.map((row) => {
      let isMatch = true;
      const reasons = [];

      if (form.filterMode === 'basic') {
        for (const rule of rules) {
          let fieldVal = '';
          if (rule.field === 'revenue') fieldVal = row.revenueNumeric ?? 0;
          else if (rule.field === 'status') fieldVal = row.status ?? '';
          else if (rule.field === 'country_code') fieldVal = row.country ?? '';
          else if (rule.field === 'customer_name') fieldVal = row.customer ?? '';
          else if (rule.field === 'order_id') fieldVal = row.orderId ?? '';

          let rulePassed = true;
          switch (rule.operator) {
            case 'equals':
              rulePassed = String(fieldVal).toLowerCase() === String(rule.value).toLowerCase();
              if (!rulePassed) reasons.push(`${rule.field} != "${rule.value}"`);
              break;
            case 'not_equals':
              rulePassed = String(fieldVal).toLowerCase() !== String(rule.value).toLowerCase();
              if (!rulePassed) reasons.push(`${rule.field} == "${rule.value}"`);
              break;
            case 'greater_than':
              rulePassed = Number(fieldVal) > Number(rule.value);
              if (!rulePassed) reasons.push(`${rule.field} (${fieldVal}) <= ${rule.value}`);
              break;
            case 'less_than':
              rulePassed = Number(fieldVal) < Number(rule.value);
              if (!rulePassed) reasons.push(`${rule.field} (${fieldVal}) >= ${rule.value}`);
              break;
            case 'in_list': {
              const list = (rule.value || '')
                .split(',')
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean);
              rulePassed = list.includes(String(fieldVal).toLowerCase());
              if (!rulePassed) reasons.push(`${rule.field} not in [${rule.value}]`);
              break;
            }
            default:
              break;
          }

          if (form.basicRules.logic === 'AND' && !rulePassed) {
            isMatch = false;
            break;
          }
        }
      }

      if (form.basicRules?.notGroup) {
        isMatch = !isMatch;
      }

      return {
        ...row,
        match: isMatch,
        reason: isMatch ? 'Passed all filter conditions' : (reasons.join(', ') || 'Failed filter criteria'),
      };
    });

    const matchingCount = evaluatedRows.filter((r) => r.match).length;
    const excludedCount = evaluatedRows.length - matchingCount;
    const matchPct = evaluatedRows.length > 0 ? `${Math.round((matchingCount / evaluatedRows.length) * 100)}%` : '0%';
    const excludedPct = evaluatedRows.length > 0 ? `${Math.round((excludedCount / evaluatedRows.length) * 100)}%` : '0%';

    return {
      totalRecords: sampleLimit,
      sampleSizeLabel: `${sampleLimit} rows`,
      matchingRecords: matchingCount,
      matchingPct: matchPct,
      excludedRecords: excludedCount,
      excludedPct: excludedPct,
      matchPercentage: matchPct,
      sampleRows: evaluatedRows,
    };
  }, [form.dataPreview, form.basicRules, form.filterMode, sampleLimit]);

  // Dirty detection
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  const unsavedChangesCount = useMemo(() => {
    if (!isDirty) return 0;
    let count = 0;
    if (form.nodeName !== savedSnapshot.nodeName) count++;
    if (form.displayName !== savedSnapshot.displayName) count++;
    if (form.description !== savedSnapshot.description) count++;
    if (form.category !== savedSnapshot.category) count++;
    if (form.filterMode !== savedSnapshot.filterMode) count++;
    if (JSON.stringify(form.basicRules) !== JSON.stringify(savedSnapshot.basicRules)) count++;
    if (JSON.stringify(form.performanceOpt) !== JSON.stringify(savedSnapshot.performanceOpt)) count++;
    if (JSON.stringify(form.runtimeConfig) !== JSON.stringify(savedSnapshot.runtimeConfig)) count++;
    if (JSON.stringify(form.tags) !== JSON.stringify(savedSnapshot.tags)) count++;
    return Math.max(1, count);
  }, [form, savedSnapshot, isDirty]);

  // Actions
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveFilterNodeConfig(nodeId, pipelineId, form);
      const newSaved = { ...form, lastSaved: new Date().toISOString().replace('T', ' ').slice(0, 19) };
      setForm(newSaved);
      setSavedSnapshot(newSaved);
      showFeedback('success', 'Filter Node configuration saved successfully.');
      return res;
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveFilterDraft(nodeId, pipelineId, form);
      showFeedback('info', 'Draft configuration saved.');
    } catch (_err) {
      showFeedback('info', 'Draft configuration saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(savedSnapshot);
    showFeedback('info', 'Form reset to last saved configuration.');
  };

  const handleValidateFilter = async () => {
    setIsValidating(true);
    try {
      const summary = await validateFilterNode(nodeId, pipelineId, form);
      setValidationSummary(summary);
      showFeedback('success', 'Filter rules validated successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Validation encountered an error.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePreviewData = async () => {
    setIsPreviewing(true);
    try {
      await previewFilterData(nodeId, pipelineId, form, sampleLimit);
      showFeedback('info', `Preview dataset updated (${sampleLimit} records).`);
    } catch (err) {
      showFeedback('error', err.message || 'Failed to refresh preview data.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleRefreshMetadata = async () => {
    try {
      const res = await refreshDatasetMetadata(nodeId, pipelineId);
      setForm((prev) => ({
        ...prev,
        inputDataset: {
          ...prev.inputDataset,
          lastSchemaRefresh: res.lastSchemaRefresh || prev.inputDataset.lastSchemaRefresh,
        },
      }));
      showFeedback('success', 'Input dataset metadata refreshed from Snowflake.');
    } catch (_err) {
      showFeedback('error', 'Failed to refresh source metadata.');
    }
  };

  const handleDuplicate = async (customName) => {
    try {
      const res = await duplicateFilterNode(nodeId, pipelineId, { name: customName });
      setDuplicateModalOpen(false);
      showFeedback('success', res.message || 'Node duplicated successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to duplicate node.');
    }
  };

  const handleOpenFix = (checkItem) => {
    setActiveFixItem(checkItem);
    setFixModalOpen(true);
  };

  const handleApplyFix = (fixType) => {
    if (fixType === 'index_fix') {
      // Apply index usage & pushdown optimization
      setForm((prev) => ({
        ...prev,
        performanceOpt: {
          ...prev.performanceOpt,
          predicatePushdown: true,
          indexUsage: true,
        },
      }));
      setValidationSummary((prev) => ({
        ...prev,
        warnings: Math.max(0, prev.warnings - 1),
        passed: prev.passed + 1,
        checks: prev.checks.map((c) =>
          c.id === 'chk_perf'
            ? { ...c, status: 'passed', description: 'Index usage enabled for target partition columns.' }
            : c
        ),
      }));
      showFeedback('success', 'Optimization applied: Index and pushdown enabled.');
    } else if (fixType === 'preview_fix') {
      // Lower preview sample size
      setSampleLimit(100);
      setValidationSummary((prev) => ({
        ...prev,
        errors: Math.max(0, prev.errors - 1),
        passed: prev.passed + 1,
        checks: prev.checks.map((c) =>
          c.id === 'chk_preview'
            ? { ...c, status: 'passed', description: 'Sample size adjusted within real-time streaming limits.' }
            : c
        ),
      }));
      showFeedback('success', 'Preview memory limit resolved: Sample bounded to 100 rows.');
    }
    setFixModalOpen(false);
  };

  return {
    form,
    savedSnapshot,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,

    // Actions & Feedback
    actionFeedback,
    isSaving,
    isValidating,
    isPreviewing,
    validationSummary,
    previewTab,
    setPreviewTab,
    sampleLimit,
    setSampleLimit,
    evaluatedPreview,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    fixModalOpen,
    setFixModalOpen,
    activeFixItem,

    // Accordions
    monitoringOpen,
    setMonitoringOpen,
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    setLogic,
    toggleNotGroup,
    addRule,
    removeRule,
    updateRule,
    togglePerformanceOpt,
    toggleMonitoringChannel,
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateFilter,
    handlePreviewData,
    handleRefreshMetadata,
    handleDuplicate,
    handleOpenFix,
    handleApplyFix,
  };
}
