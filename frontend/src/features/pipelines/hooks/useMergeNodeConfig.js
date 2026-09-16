import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getMergeNodeConfig,
  saveMergeNodeConfig,
  saveMergeNodeDraft,
  validateMergeConditions,
  testMergeExecution,
  duplicateMergeNode,
  DEFAULT_MERGE_NODE_CONFIG,
} from '../services/mergeNodeConfig.api';

export function useMergeNodeConfig(nodeId = 'mrg_node_0072', pipelineId = 'customer-etl-pipeline') {
  // 1. Fetch remote / mock baseline
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'merge-config'],
    queryFn: () => getMergeNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Editable form state
  const [form, setForm] = useState(DEFAULT_MERGE_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_MERGE_NODE_CONFIG);

  // Sync form when initialData loads
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  // Dirty detection
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  const unsavedChangesCount = useMemo(() => {
    let count = 0;
    if (form.nodeName !== savedSnapshot.nodeName) count++;
    if (form.description !== savedSnapshot.description) count++;
    if (form.strategy !== savedSnapshot.strategy) count++;
    if (form.conflictResolution !== savedSnapshot.conflictResolution) count++;
    if (JSON.stringify(form.joinConditions) !== JSON.stringify(savedSnapshot.joinConditions)) count++;
    if (JSON.stringify(form.fieldMappings) !== JSON.stringify(savedSnapshot.fieldMappings)) count++;
    if (JSON.stringify(form.deduplication) !== JSON.stringify(savedSnapshot.deduplication)) count++;
    if (JSON.stringify(form.performance) !== JSON.stringify(savedSnapshot.performance)) count++;
    if (JSON.stringify(form.monitoring) !== JSON.stringify(savedSnapshot.monitoring)) count++;
    return count;
  }, [form, savedSnapshot]);

  // UI state for modals, active tabs and action feedbacks
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [testResults, setTestResults] = useState(null);

  // Modals
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [viewSchemaModalOpen, setViewSchemaModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [addJoinConditionOpen, setAddJoinConditionOpen] = useState(false);

  // Accordion sections state
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Mutators
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedField = useCallback((parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  }, []);

  const addTag = useCallback((tag) => {
    if (!tag.trim()) return;
    setForm((prev) => {
      if (prev.tags.includes(tag.trim())) return prev;
      return { ...prev, tags: [...prev.tags, tag.trim()] };
    });
  }, []);

  const removeTag = useCallback((tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  }, []);

  const addJoinCondition = useCallback((condition) => {
    setForm((prev) => ({
      ...prev,
      joinConditions: [
        ...prev.joinConditions,
        {
          id: `jc_${Date.now()}`,
          ...condition,
        },
      ],
    }));
  }, []);

  const removeJoinCondition = useCallback((conditionId) => {
    setForm((prev) => ({
      ...prev,
      joinConditions: prev.joinConditions.filter((jc) => jc.id !== conditionId),
    }));
  }, []);

  const updateFieldMapping = useCallback((index, fieldKey, value) => {
    setForm((prev) => {
      const updated = [...prev.fieldMappings];
      updated[index] = { ...updated[index], [fieldKey]: value };
      return { ...prev, fieldMappings: updated };
    });
  }, []);

  // Action Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveMergeNodeConfig(nodeId, pipelineId, form);
      setSavedSnapshot(res);
      setActionFeedback({
        type: 'success',
        message: 'Merge Node configuration applied and saved to pipeline DAG.',
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Failed to save merge node configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await saveMergeNodeDraft(nodeId, pipelineId, form);
      setSavedSnapshot(res);
      setActionFeedback({
        type: 'info',
        message: 'Merge Node draft configuration saved successfully.',
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Failed to save draft.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(savedSnapshot);
    setActionFeedback({
      type: 'info',
      message: 'Reverted all unsaved changes to last saved state.',
    });
  };

  const handleValidateJoin = async () => {
    setIsValidating(true);
    try {
      const report = await validateMergeConditions(nodeId, pipelineId, form);
      setValidationReport(report);
      setActionFeedback({
        type: report.isValid ? 'success' : 'warning',
        message: report.isValid
          ? 'Join conditions and composite schemas passed verification.'
          : 'Validation warning: Review join key data types.',
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Join condition validation failed.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunTest = async (sampleLimit = 50) => {
    setIsTesting(true);
    try {
      const results = await testMergeExecution(nodeId, pipelineId, sampleLimit);
      setTestResults(results);
      setActionFeedback({
        type: 'success',
        message: `Test join execution finished: ${results.recordsProcessed} sample records evaluated.`,
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Test join execution failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDuplicate = async (newName) => {
    try {
      const duplicated = await duplicateMergeNode(nodeId, pipelineId, newName);
      setActionFeedback({
        type: 'success',
        message: `Merge node duplicated as "${duplicated.nodeName}".`,
      });
      setDuplicateModalOpen(false);
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Failed to duplicate node.',
      });
    }
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
    isTesting,
    validationReport,
    testResults,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    addJoinConditionOpen,
    setAddJoinConditionOpen,

    // Accordions
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addJoinCondition,
    removeJoinCondition,
    updateFieldMapping,

    // Action handlers
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateJoin,
    handleRunTest,
    handleDuplicate,
  };
}
