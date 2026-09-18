import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchTransformationNodeConfig,
  saveTransformationNodeConfig,
  saveTransformationDraft,
  testTransformation,
  refreshUpstreamSchema,
  duplicateTransformationNode,
  DEFAULT_TRANSFORMATION_NODE_CONFIG,
} from '../services/transformationNodeConfig.api';

export function useTransformationNodeConfig(nodeId = 'node_trans_008', pipelineId = 'pip_001') {
  // 1. Fetch remote baseline
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'transformation-config'],
    queryFn: () => fetchTransformationNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Editable form state
  const [form, setForm] = useState(DEFAULT_TRANSFORMATION_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_TRANSFORMATION_NODE_CONFIG);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  // Action status & state
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [viewInputDataModalOpen, setViewInputDataModalOpen] = useState(false);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [fixValidationModalOpen, setFixValidationModalOpen] = useState(false);
  const [activeFixItem, setActiveFixItem] = useState(null);

  // Accordions
  const [advancedAccordionOpen, setAdvancedAccordionOpen] = useState(false);
  const [monitoringAccordionOpen, setMonitoringAccordionOpen] = useState(true);

  // Preview & Test tabs
  const [previewTab, setPreviewTab] = useState('differences'); // 'input' | 'transformed' | 'differences'
  const [testingMode, setTestingMode] = useState('all'); // 'individual' | 'selected' | 'all'
  const [bottomTab, setBottomTab] = useState('validation'); // 'validation' | 'tests' | 'logs'

  // Feedback helper
  const showFeedback = useCallback((type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  }, []);

  // Update root field
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update nested field
  const updateNestedField = useCallback((parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  }, []);

  // Tag management
  const addTag = useCallback((tag) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
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

  // Transformation Rules
  const addTransformationRule = useCallback((rule) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      inputField: rule.inputField || 'customer_id',
      transformation: rule.transformation || 'Trim Whitespace',
      parameters: rule.parameters || '—',
      outputField: rule.outputField || rule.inputField || 'customer_id',
      outputType: rule.outputType || 'String',
      status: 'Active',
    };
    setForm((prev) => ({
      ...prev,
      transformationRules: [...(prev.transformationRules || []), newRule],
    }));
    showFeedback('success', `Added transformation rule for "${newRule.outputField}"`);
  }, [showFeedback]);

  const removeTransformationRule = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      transformationRules: (prev.transformationRules || []).filter((r) => r.id !== id),
    }));
    showFeedback('info', 'Transformation rule removed.');
  }, [showFeedback]);

  const updateTransformationRule = useCallback((id, updates) => {
    setForm((prev) => ({
      ...prev,
      transformationRules: (prev.transformationRules || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  }, []);

  const toggleRuleStatus = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      transformationRules: (prev.transformationRules || []).map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'Active' ? 'Disabled' : 'Active';
          return { ...r, status: nextStatus };
        }
        return r;
      }),
    }));
  }, []);

  // Deduplication Fields
  const addDeduplicationField = useCallback((fieldName) => {
    if (!fieldName) return;
    setForm((prev) => {
      const cur = prev.deduplication?.fields || [];
      if (cur.includes(fieldName)) return prev;
      return {
        ...prev,
        deduplication: {
          ...prev.deduplication,
          fields: [...cur, fieldName],
        },
      };
    });
  }, []);

  const removeDeduplicationField = useCallback((fieldName) => {
    setForm((prev) => ({
      ...prev,
      deduplication: {
        ...prev.deduplication,
        fields: (prev.deduplication?.fields || []).filter((f) => f !== fieldName),
      },
    }));
  }, []);

  // Monitoring checkboxes
  const toggleMonitoringOption = useCallback((optionKey) => {
    setForm((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [optionKey]: !prev.monitoring?.[optionKey],
      },
    }));
  }, []);

  // Dirty state computation
  const { isDirty, unsavedChangesCount } = useMemo(() => {
    let diffCount = 0;
    if (form.nodeName !== savedSnapshot.nodeName) diffCount++;
    if (form.displayName !== savedSnapshot.displayName) diffCount++;
    if (form.description !== savedSnapshot.description) diffCount++;
    if (form.category !== savedSnapshot.category) diffCount++;
    if (form.owner !== savedSnapshot.owner) diffCount++;
    if (form.activeMode !== savedSnapshot.activeMode) diffCount++;
    if (JSON.stringify(form.tags) !== JSON.stringify(savedSnapshot.tags)) diffCount++;
    if (JSON.stringify(form.transformationRules) !== JSON.stringify(savedSnapshot.transformationRules)) diffCount++;
    if (JSON.stringify(form.dataCleaning) !== JSON.stringify(savedSnapshot.dataCleaning)) diffCount++;
    if (JSON.stringify(form.typeConversion) !== JSON.stringify(savedSnapshot.typeConversion)) diffCount++;
    if (JSON.stringify(form.dateFormatting) !== JSON.stringify(savedSnapshot.dateFormatting)) diffCount++;
    if (JSON.stringify(form.deduplication) !== JSON.stringify(savedSnapshot.deduplication)) diffCount++;
    if (JSON.stringify(form.lookup) !== JSON.stringify(savedSnapshot.lookup)) diffCount++;
    if (JSON.stringify(form.expressionEditor) !== JSON.stringify(savedSnapshot.expressionEditor)) diffCount++;
    if (JSON.stringify(form.runtimeConfig) !== JSON.stringify(savedSnapshot.runtimeConfig)) diffCount++;
    if (JSON.stringify(form.monitoring) !== JSON.stringify(savedSnapshot.monitoring)) diffCount++;
    if (JSON.stringify(form.advancedConfig) !== JSON.stringify(savedSnapshot.advancedConfig)) diffCount++;

    return {
      isDirty: diffCount > 0,
      unsavedChangesCount: diffCount,
    };
  }, [form, savedSnapshot]);

  // Dynamic Summaries
  const summaries = useMemo(() => {
    const rules = form.transformationRules || [];
    const totalRules = rules.length;
    const activeRules = rules.filter((r) => r.status === 'Active').length;
    const disabledRules = rules.filter((r) => r.status === 'Disabled').length;
    const invalidRules = rules.filter((r) => r.status === 'Invalid').length;
    const fieldsTransformed = new Set(rules.map((r) => r.outputField)).size;

    const validationErrors = (form.validation?.items || []).filter((v) => v.severity === 'Error').length;
    const validationWarnings = (form.validation?.items || []).filter((v) => v.severity === 'Warning').length;
    const validationPassed = (form.validation?.items || []).filter((v) => v.severity === 'Success' || v.severity === 'Passed').length;

    // Operation breakdown
    const cleaningOps = 2;
    const typeConversions = 1;
    const dateFormattingOps = 1;
    const deduplicationOps = 0;
    const lookupOps = 1;
    const expressionOps = 1;

    // Test summaries
    const testResults = form.testing?.testResults || [];
    const testPassed = testResults.filter((t) => t.status === 'Passed').length;
    const testFailed = testResults.filter((t) => t.status === 'Failed').length;
    const testWarn = testResults.filter((t) => t.status === 'Warn').length;

    return {
      totalRules,
      activeRules,
      disabledRules,
      invalidRules,
      fieldsTransformed,
      validationErrors,
      validationWarnings,
      validationPassed,
      validationPercent: 60,
      cleaningOps,
      typeConversions,
      dateFormattingOps,
      deduplicationOps,
      lookupOps,
      expressionOps,
      testPassed,
      testFailed,
      testWarn,
      totalTests: testResults.length,
    };
  }, [form]);

  // Actions
  const handleSaveConfig = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveTransformationNodeConfig(nodeId, pipelineId, form);
      setSavedSnapshot(form);
      setForm((prev) => ({ ...prev, status: 'Configured', lastSaved: new Date().toLocaleTimeString() }));
      showFeedback('success', 'Transformation node configuration saved successfully.');
    } catch (_err) {
      showFeedback('error', 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  }, [form, nodeId, pipelineId, showFeedback]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveTransformationDraft(nodeId, pipelineId, form);
      setSavedSnapshot(form);
      setForm((prev) => ({ ...prev, status: 'Draft', lastSaved: new Date().toLocaleTimeString() }));
      showFeedback('success', 'Draft saved successfully.');
    } catch (_err) {
      showFeedback('error', 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  }, [form, nodeId, pipelineId, showFeedback]);

  const handleResetConfig = useCallback(() => {
    setForm(savedSnapshot);
    showFeedback('info', 'Reverted all unsaved modifications.');
  }, [savedSnapshot, showFeedback]);

  const handleRunTests = useCallback(async () => {
    setIsTesting(true);
    try {
      const res = await testTransformation(nodeId, pipelineId, testingMode, form.transformationRules);
      setForm((prev) => ({
        ...prev,
        testing: {
          ...prev.testing,
          lastRun: 'Just now',
          testResults: res?.results || prev?.testing?.testResults || [],
        },
      }));
      showFeedback('success', `Ran ${res.results?.length || 4} test cases: ${res.passedCount} passed, ${res.failedCount} failed.`);
    } catch (_err) {
      showFeedback('error', 'Failed to run test suite.');
    } finally {
      setIsTesting(false);
    }
  }, [form.transformationRules, nodeId, pipelineId, showFeedback, testingMode]);

  const handleRefreshSchema = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshUpstreamSchema(nodeId, pipelineId);
      setForm((prev) => ({
        ...prev,
        inputDataset: {
          ...prev.inputDataset,
          lastSchemaRefresh: 'Just now',
          schemaVersion: res.schemaVersion,
          estimatedRecords: res.estimatedRecords,
        },
      }));
      showFeedback('success', 'Upstream schema refreshed from Filter: Valid Orders.');
    } catch (_err) {
      showFeedback('error', 'Failed to refresh upstream schema.');
    } finally {
      setIsRefreshing(false);
    }
  }, [nodeId, pipelineId, showFeedback]);

  const handleDuplicateNode = useCallback(async (newName) => {
    try {
      const res = await duplicateTransformationNode(nodeId, pipelineId, newName);
      setDuplicateModalOpen(false);
      showFeedback('success', `Node duplicated as "${res.newNodeName}" (ID: ${res.newNodeId}).`);
    } catch (_err) {
      showFeedback('error', 'Failed to duplicate node.');
    }
  }, [nodeId, pipelineId, showFeedback]);

  const handleOpenFix = useCallback((valItem) => {
    setActiveFixItem(valItem);
    setFixValidationModalOpen(true);
  }, []);

  const handleApplyFix = useCallback((valItemId, fixStrategy) => {
    setForm((prev) => {
      const updatedValidationItems = (prev.validation?.items || []).map((item) => {
        if (item.id === valItemId) {
          return {
            ...item,
            severity: 'Success',
            description: `${item.description} (Resolved via ${fixStrategy})`,
            action: 'Resolved',
            fixable: false,
          };
        }
        return item;
      });

      // If fixing status_map_v2 lookup
      let nextLookup = { ...prev.lookup };
      if (valItemId === 'val_1') {
        nextLookup = {
          ...nextLookup,
          lookupDataset: 'status_map_v1 (fallback)',
          status: 'available',
          warningMessage: null,
        };
      }

      // If fixing rule #4 customer_id
      let nextRules = [...(prev.transformationRules || [])];
      if (valItemId === 'val_2') {
        nextRules = nextRules.map((r) => (r.id === 'rule_4' ? { ...r, status: 'Active' } : r));
      }

      return {
        ...prev,
        lookup: nextLookup,
        transformationRules: nextRules,
        validation: {
          ...prev.validation,
          items: updatedValidationItems,
          statusPercent: 85,
        },
      };
    });

    setFixValidationModalOpen(false);
    setActiveFixItem(null);
    showFeedback('success', 'Applied validation resolution fix.');
  }, [showFeedback]);

  return {
    form,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,

    // Status & Feedback
    actionFeedback,
    isSaving,
    isTesting,
    isRefreshing,
    summaries,

    // Tabs & View modes
    previewTab,
    setPreviewTab,
    testingMode,
    setTestingMode,
    bottomTab,
    setBottomTab,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    viewInputDataModalOpen,
    setViewInputDataModalOpen,
    addRuleModalOpen,
    setAddRuleModalOpen,
    fixValidationModalOpen,
    setFixValidationModalOpen,
    activeFixItem,

    // Accordions
    advancedAccordionOpen,
    setAdvancedAccordionOpen,
    monitoringAccordionOpen,
    setMonitoringAccordionOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addTransformationRule,
    removeTransformationRule,
    updateTransformationRule,
    toggleRuleStatus,
    addDeduplicationField,
    removeDeduplicationField,
    toggleMonitoringOption,

    // Actions
    handleSaveConfig,
    handleSaveDraft,
    handleResetConfig,
    handleRunTests,
    handleRefreshSchema,
    handleDuplicateNode,
    handleOpenFix,
    handleApplyFix,
  };
}
