import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSourceNodeConfig,
  saveSourceNodeConfig,
  testSourceConnection,
  testAuthentication,
  detectSchema,
  fetchPreviewData,
  runLiveValidation,
  duplicateSourceNode,
  INITIAL_SOURCE_NODE_FORM,
} from '../services/sourceNodeConfig.api';

export function useSourceNodeConfig(nodeId = 'source_node_001', pipelineId = 'pip_001') {
  const queryClient = useQueryClient();

  // 1. Query initial configuration
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'source-config'],
    queryFn: () => getSourceNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
  });

  // 2. Local form state initialized from query data
  const [form, setForm] = useState(INITIAL_SOURCE_NODE_FORM);
  const [baseline, setBaseline] = useState(INITIAL_SOURCE_NODE_FORM);
  const [tagInput, setTagInput] = useState('');
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Modals
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [testConnModalOpen, setTestConnModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  // Operation feedback
  const [actionFeedback, setActionFeedback] = useState(null);
  const [testConnResult, setTestConnResult] = useState(null);
  const [testAuthResult, setTestAuthResult] = useState(null);

  // Sync initial query data once when loaded
  const initialDataSynced = useRef(false);
  useEffect(() => {
    if (initialData && !initialDataSynced.current) {
      setForm(initialData);
      setBaseline(initialData);
      initialDataSynced.current = true;
    }
  }, [initialData]);

  // Track field changes & compute unsaved changes count
  const unsavedChangesCount = useMemo(() => {
    let count = 0;
    if (form.nodeName !== baseline.nodeName) count++;
    if (form.displayName !== baseline.displayName) count++;
    if (form.description !== baseline.description) count++;
    if (form.connectorType !== baseline.connectorType) count++;
    if (form.connectorInstance !== baseline.connectorInstance) count++;
    if (form.database !== baseline.database) count++;
    if (form.table !== baseline.table) count++;
    if (form.sqlQueryOverride !== baseline.sqlQueryOverride) count++;
    if (form.extractionMode !== baseline.extractionMode) count++;
    if (form.watermarkColumn !== baseline.watermarkColumn) count++;
    if (form.batchSize !== baseline.batchSize) count++;
    if (form.parallelism !== baseline.parallelism) count++;
    if (form.timeout !== baseline.timeout) count++;
    if (form.retryPolicy !== baseline.retryPolicy) count++;
    if (form.failOnError !== baseline.failOnError) count++;
    if (form.continueProcessing !== baseline.continueProcessing) count++;
    if (form.enableMetrics !== baseline.enableMetrics) count++;
    if (form.enableLogs !== baseline.enableLogs) count++;
    if (JSON.stringify(form.tags) !== JSON.stringify(baseline.tags)) count++;
    if (JSON.stringify(form.schemaMappings) !== JSON.stringify(baseline.schemaMappings)) count++;
    if (JSON.stringify(form.validationRules) !== JSON.stringify(baseline.validationRules)) count++;
    if (JSON.stringify(form.advancedSettings) !== JSON.stringify(baseline.advancedSettings)) count++;
    return count;
  }, [form, baseline]);

  const isDirty = unsavedChangesCount > 0;

  // Field updaters
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  // Tag management
  const addTag = useCallback((tagText) => {
    const clean = tagText.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (clean && !form.tags?.includes(clean)) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), clean],
      }));
    }
  }, [form.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  }, []);

  // Schema mappings
  const updateSchemaMapping = useCallback((fieldId, updates) => {
    setForm((prev) => ({
      ...prev,
      schemaMappings: (prev.schemaMappings || []).map((row) =>
        row.id === fieldId ? { ...row, ...updates } : row
      ),
    }));
  }, []);

  const toggleAllSchemaSelected = useCallback((selected) => {
    setForm((prev) => ({
      ...prev,
      schemaMappings: (prev.schemaMappings || []).map((row) => ({ ...row, selected })),
    }));
  }, []);

  // Validation rules toggles
  const toggleValidationRule = useCallback((ruleId) => {
    setForm((prev) => ({
      ...prev,
      validationRules: (prev.validationRules || []).map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  }, []);

  // Notification channels toggle
  const toggleNotificationChannel = useCallback((channelId) => {
    setForm((prev) => ({
      ...prev,
      notificationChannels: {
        ...prev.notificationChannels,
        [channelId]: !prev.notificationChannels?.[channelId],
      },
    }));
  }, []);

  // Live validation summary
  const validationSummary = useMemo(() => {
    const list = form.validations || [];
    const passed = list.filter((v) => v.status === 'passed').length;
    const warning = list.filter((v) => v.status === 'warning').length;
    const pending = list.filter((v) => v.status === 'pending').length;
    const failed = list.filter((v) => v.status === 'failed').length;
    return { passed, warning, pending, failed, total: list.length };
  }, [form.validations]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload) => saveSourceNodeConfig(nodeId, pipelineId, payload),
    onSuccess: (data) => {
      setBaseline(form);
      queryClient.setQueryData(['pipelines', pipelineId, 'nodes', nodeId, 'source-config'], form);
      setActionFeedback({
        type: 'success',
        message: data.message || 'Source node configuration saved successfully.',
      });
      setTimeout(() => setActionFeedback(null), 4000);
    },
    onError: (err) => {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to save source node configuration.',
      });
    },
  });

  const handleSave = useCallback(() => {
    saveMutation.mutate(form);
  }, [saveMutation, form]);

  const handleReset = useCallback(() => {
    setForm(baseline);
    setActionFeedback({
      type: 'info',
      message: 'Configuration reset to baseline.',
    });
    setTimeout(() => setActionFeedback(null), 3000);
  }, [baseline]);

  const handleTestConnection = useCallback(async () => {
    setActionFeedback({ type: 'info', message: 'Testing source connection…' });
    try {
      const result = await testSourceConnection({
        connectorType: form.connectorType,
        connectorInstance: form.connectorInstance,
      });
      setTestConnResult(result);
      setTestConnModalOpen(true);
      setActionFeedback({
        type: 'success',
        message: `Connected successfully (${result.latencyMs} ms latency)`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Connection test failed.' });
    }
  }, [form.connectorType, form.connectorInstance]);

  const handleTestAuth = useCallback(async () => {
    setActionFeedback({ type: 'info', message: 'Verifying authentication credentials…' });
    try {
      const result = await testAuthentication({
        authMethod: form.authMethod,
        username: form.username,
      });
      setTestAuthResult(result);
      setActionFeedback({
        type: 'success',
        message: `Authentication verified for ${result.principal}`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Authentication failed.' });
    }
  }, [form.authMethod, form.username]);

  const handleDetectSchema = useCallback(async () => {
    setActionFeedback({ type: 'info', message: 'Introspecting remote schema…' });
    try {
      const result = await detectSchema({
        database: form.database,
        schema: form.schema,
        table: form.table,
      });
      if (result.mappings) {
        setForm((prev) => ({
          ...prev,
          schemaMappings: result.mappings,
        }));
      }
      setActionFeedback({
        type: 'success',
        message: `Schema auto-detected: ${result.fieldsCount || 6} fields found in ${result.table}`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Schema detection failed.' });
    }
  }, [form.database, form.schema, form.table]);

  const handlePreviewData = useCallback(async () => {
    setActionFeedback({ type: 'info', message: 'Fetching live sample rows…' });
    try {
      const result = await fetchPreviewData({
        table: form.table,
        query: form.sqlQueryOverride,
      });
      if (result.rows) {
        setForm((prev) => ({
          ...prev,
          previewRows: result.rows,
        }));
      }
      setActionFeedback({
        type: 'success',
        message: `Data sampled: ${result.rows?.length || 6} preview rows loaded`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Data preview fetch failed.' });
    }
  }, [form.table, form.sqlQueryOverride]);

  const handleReRunValidation = useCallback(async () => {
    setActionFeedback({ type: 'info', message: 'Running live validation suite…' });
    try {
      const result = await runLiveValidation(form);
      if (result.validations) {
        setForm((prev) => ({
          ...prev,
          validations: result.validations,
        }));
      }
      setActionFeedback({
        type: 'success',
        message: 'Live validation checks completed.',
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Validation suite failed.' });
    }
  }, [form]);

  const handleDuplicate = useCallback(async (newName) => {
    try {
      const result = await duplicateSourceNode(nodeId, pipelineId, newName);
      setDuplicateModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: `Node duplicated as "${result.nodeName}" (${result.newNodeId})`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to duplicate node.' });
    }
  }, [nodeId, pipelineId]);

  return {
    form,
    baseline,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,
    tagInput,
    setTagInput,
    passwordRevealed,
    setPasswordRevealed,
    advancedOpen,
    setAdvancedOpen,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    testConnModalOpen,
    setTestConnModalOpen,
    discardModalOpen,
    setDiscardModalOpen,

    // Feedback & state
    actionFeedback,
    setActionFeedback,
    testConnResult,
    testAuthResult,
    validationSummary,
    isSaving: saveMutation.isPending,

    // Actions
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    updateSchemaMapping,
    toggleAllSchemaSelected,
    toggleValidationRule,
    toggleNotificationChannel,
    handleSave,
    handleReset,
    handleTestConnection,
    handleTestAuth,
    handleDetectSchema,
    handlePreviewData,
    handleReRunValidation,
    handleDuplicate,
  };
}

