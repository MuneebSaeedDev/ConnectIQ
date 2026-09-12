import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getValidationNodeConfig,
  saveValidationNodeConfig,
  saveValidationNodeDraft,
  validateNodeRules,
  runValidationTest,
  previewValidationData,
  refreshValidationSchema,
  duplicateValidationNode,
  DEFAULT_VALIDATION_NODE_CONFIG,
} from '../services/validationNodeConfig.api';

export function useValidationNodeConfig(nodeId = 'val_node_0052', pipelineId = 'customer-etl-pipeline') {
  // 1. Fetch remote / mock baseline
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'validation-config'],
    queryFn: () => getValidationNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Editable form state
  const [form, setForm] = useState(DEFAULT_VALIDATION_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_VALIDATION_NODE_CONFIG);

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
  const [isTesting, setIsTesting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewTab, setPreviewTab] = useState('all'); // 'all' | 'valid' | 'invalid' | 'warnings'
  const [resultsFilter, setResultsFilter] = useState('all'); // 'all' | 'errors' | 'warnings' | 'passed'
  const [previewLimit, setPreviewLimit] = useState(25);

  // Modals state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [viewSchemaModalOpen, setViewSchemaModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [importRulesModalOpen, setImportRulesModalOpen] = useState(false);
  const [editRuleModalOpen, setEditRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Collapsible accordions
  const [monitoringOpen, setMonitoringOpen] = useState(true);
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

  // Rule builder actions
  const addRule = useCallback((newRule) => {
    setForm((prev) => {
      const id = `rule_${Date.now()}`;
      return {
        ...prev,
        rules: [...(prev.rules || []), { ...newRule, id, active: true, status: 'Pass' }],
      };
    });
    showFeedback('success', 'Validation rule added');
  }, [showFeedback]);

  const updateRule = useCallback((ruleId, updatedProps) => {
    setForm((prev) => ({
      ...prev,
      rules: (prev.rules || []).map((r) => (r.id === ruleId ? { ...r, ...updatedProps } : r)),
    }));
    showFeedback('info', 'Rule updated');
  }, [showFeedback]);

  const toggleRuleActive = useCallback((ruleId) => {
    setForm((prev) => ({
      ...prev,
      rules: (prev.rules || []).map((r) => {
        if (r.id === ruleId) {
          const nextActive = !r.active;
          return {
            ...r,
            active: nextActive,
            status: nextActive ? 'Pass' : 'Disabled',
          };
        }
        return r;
      }),
    }));
  }, []);

  const deleteRule = useCallback((ruleId) => {
    setForm((prev) => ({
      ...prev,
      rules: (prev.rules || []).filter((r) => r.id !== ruleId),
    }));
    showFeedback('info', 'Rule removed');
  }, [showFeedback]);

  // Business rules actions
  const addBusinessRule = useCallback((newBizRule) => {
    setForm((prev) => {
      const id = `br_${Date.now()}`;
      return {
        ...prev,
        businessRules: [...(prev.businessRules || []), { ...newBizRule, id }],
      };
    });
    showFeedback('success', 'Business rule added');
  }, [showFeedback]);

  const deleteBusinessRule = useCallback((bizRuleId) => {
    setForm((prev) => ({
      ...prev,
      businessRules: (prev.businessRules || []).filter((br) => br.id !== bizRuleId),
    }));
    showFeedback('info', 'Business rule removed');
  }, [showFeedback]);

  // Toggle monitoring options & channels
  const toggleMonitoringOption = useCallback((optionKey) => {
    setForm((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [optionKey]: !prev.monitoring[optionKey],
      },
    }));
  }, []);

  const toggleMonitoringChannel = useCallback((channelKey) => {
    setForm((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        channels: {
          ...prev.monitoring.channels,
          [channelKey]: !prev.monitoring.channels[channelKey],
        },
      },
    }));
  }, []);

  // Dirty detection & changes count
  const { isDirty, unsavedChangesCount } = useMemo(() => {
    let count = 0;
    if (form.nodeName !== savedSnapshot.nodeName) count++;
    if (form.displayName !== savedSnapshot.displayName) count++;
    if (form.description !== savedSnapshot.description) count++;
    if (form.category !== savedSnapshot.category) count++;
    if (form.owner !== savedSnapshot.owner) count++;
    if (form.validationMode !== savedSnapshot.validationMode) count++;
    if (JSON.stringify(form.tags) !== JSON.stringify(savedSnapshot.tags)) count++;
    if (JSON.stringify(form.rules) !== JSON.stringify(savedSnapshot.rules)) count++;
    if (JSON.stringify(form.businessRules) !== JSON.stringify(savedSnapshot.businessRules)) count++;
    if (JSON.stringify(form.runtimeConfig) !== JSON.stringify(savedSnapshot.runtimeConfig)) count++;
    if (JSON.stringify(form.monitoring) !== JSON.stringify(savedSnapshot.monitoring)) count++;
    if (JSON.stringify(form.advancedConfig) !== JSON.stringify(savedSnapshot.advancedConfig)) count++;
    return {
      isDirty: count > 0,
      unsavedChangesCount: count,
    };
  }, [form, savedSnapshot]);

  // Handlers for Save, Draft, Reset, Validate, Test, Preview, Refresh
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveValidationNodeConfig(form.nodeId, form.pipelineId, form);
      setSavedSnapshot(form);
      showFeedback('success', `Configuration saved successfully (v${form.version || '1.2.0'})`);
      return res;
    } catch (err) {
      showFeedback('error', `Failed to save configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await saveValidationNodeDraft(form.nodeId, form.pipelineId, form);
      setSavedSnapshot(form);
      showFeedback('info', 'Draft configuration saved');
      return res;
    } catch (err) {
      showFeedback('error', `Failed to save draft: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(savedSnapshot);
    showFeedback('info', 'Configuration reset to last saved state');
  };

  const handleValidateRules = async () => {
    setIsValidating(true);
    try {
      const res = await validateNodeRules(form.nodeId, form.pipelineId, form.rules);
      showFeedback(
        res.valid ? 'success' : 'warning',
        res.valid
          ? 'Validation passed with 0 errors'
          : `Validation check complete: ${res.summary?.errors || 2} errors, ${res.summary?.warnings || 1} warning found.`
      );
      return res;
    } catch (err) {
      showFeedback('error', `Validation check failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const res = await runValidationTest(form.nodeId, form.pipelineId, form.validationTest?.samplePayload);
      setForm((prev) => ({
        ...prev,
        validationTest: {
          ...prev.validationTest,
          lastExecution: {
            status: res.status,
            execTime: res.execTime,
            failedRulesCount: res.failedRulesCount,
            results: res.results || prev.validationTest?.lastExecution?.results,
          },
        },
      }));
      showFeedback('info', `Test execution completed: ${res.status} (${res.execTime || '0.84 ms'})`);
      return res;
    } catch (err) {
      showFeedback('error', `Test execution failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePreviewData = async () => {
    setIsPreviewing(true);
    try {
      const res = await previewValidationData(form.nodeId, form.pipelineId, previewLimit);
      setForm((prev) => ({
        ...prev,
        dataPreview: {
          ...prev.dataPreview,
          totalTested: res.totalTested || 25,
          valid: res.valid || 21,
          invalid: res.invalid || 4,
          warnings: res.warnings || 1,
          validationRate: res.validationRate || '84.0%',
          records: res.records || prev.dataPreview?.records,
        },
      }));
      showFeedback('success', `Preview refreshed with ${previewLimit} records`);
      return res;
    } catch (err) {
      showFeedback('error', `Preview failed: ${err.message}`);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleRefreshSchema = async () => {
    try {
      const res = await refreshValidationSchema(form.nodeId, form.pipelineId);
      setForm((prev) => ({
        ...prev,
        inputDataset: {
          ...prev.inputDataset,
          lastRefreshed: res.refreshedAt || '09:42 UTC',
          fields: res.fields || prev.inputDataset?.fields,
        },
      }));
      showFeedback('success', 'Input schema refreshed');
    } catch (err) {
      showFeedback('error', `Schema refresh failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (newName) => {
    try {
      const res = await duplicateValidationNode(form.nodeId, form.pipelineId, newName);
      setDuplicateModalOpen(false);
      showFeedback('success', `Node duplicated as "${newName}" (${res.newNodeId || 'val_node_copy'})`);
      return res;
    } catch (err) {
      showFeedback('error', `Failed to duplicate node: ${err.message}`);
    }
  };

  return {
    form,
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
    isPreviewing,
    previewTab,
    setPreviewTab,
    resultsFilter,
    setResultsFilter,
    previewLimit,
    setPreviewLimit,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    addRuleModalOpen,
    setAddRuleModalOpen,
    importRulesModalOpen,
    setImportRulesModalOpen,
    editRuleModalOpen,
    setEditRuleModalOpen,
    editingRule,
    setEditingRule,

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
    addRule,
    updateRule,
    toggleRuleActive,
    deleteRule,
    addBusinessRule,
    deleteBusinessRule,
    toggleMonitoringOption,
    toggleMonitoringChannel,

    // Action handlers
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateRules,
    handleRunTest,
    handlePreviewData,
    handleRefreshSchema,
    handleDuplicate,
  };
}
