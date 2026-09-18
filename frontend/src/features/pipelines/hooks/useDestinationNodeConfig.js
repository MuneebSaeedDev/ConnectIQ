import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDestinationNodeConfig,
  saveDestinationNodeConfig,
  saveDestinationNodeDraft,
  testDestinationConnection,
  testDryRunLoad,
  duplicateDestinationNode,
  DEFAULT_DESTINATION_NODE_CONFIG,
} from '../services/destinationNodeConfig.api';

export function useDestinationNodeConfig(nodeId = 'dst_node_0073', pipelineId = 'customer-etl-pipeline') {
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'destination-config'],
    queryFn: () => getDestinationNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [form, setForm] = useState(DEFAULT_DESTINATION_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_DESTINATION_NODE_CONFIG);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  const unsavedChangesCount = useMemo(() => {
    let count = 0;
    if (form.nodeName !== savedSnapshot.nodeName) count++;
    if (form.description !== savedSnapshot.description) count++;
    if (form.destinationType !== savedSnapshot.destinationType) count++;
    if (form.writeMode !== savedSnapshot.writeMode) count++;
    if (form.targetTable !== savedSnapshot.targetTable) count++;
    if (form.targetDatabase !== savedSnapshot.targetDatabase) count++;
    if (JSON.stringify(form.fieldMappings) !== JSON.stringify(savedSnapshot.fieldMappings)) count++;
    if (JSON.stringify(form.performance) !== JSON.stringify(savedSnapshot.performance)) count++;
    return count;
  }, [form, savedSnapshot]);

  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isTestingLoad, setIsTestingLoad] = useState(false);
  const [testConnResult, setTestConnResult] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [testConnModalOpen, setTestConnModalOpen] = useState(false);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

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

  const updateFieldMapping = useCallback((index, fieldKey, value) => {
    setForm((prev) => {
      const updated = [...prev.fieldMappings];
      updated[index] = { ...updated[index], [fieldKey]: value };
      return { ...prev, fieldMappings: updated };
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveDestinationNodeConfig(nodeId, pipelineId, form);
      setSavedSnapshot(res);
      setActionFeedback({
        type: 'success',
        message: 'Destination Node configuration saved and published to pipeline.',
      });
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Failed to save destination node configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await saveDestinationNodeDraft(nodeId, pipelineId, form);
      setSavedSnapshot(res);
      setActionFeedback({
        type: 'info',
        message: 'Destination Node draft configuration saved successfully.',
      });
    } catch (e) {
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

  const handleTestConnection = async (e) => { if (e && e.preventDefault) e.preventDefault(); 
    setIsTestingConn(true);
    try {
      const report = await testDestinationConnection(nodeId, pipelineId, form);
      setTestConnResult(report);
      setTestConnModalOpen(true);
      setActionFeedback({
        type: report.success ? 'success' : 'warning',
        message: report.success
          ? 'Destination connection check succeeded! Permissions verified.'
          : 'Connection test failed: check target database credentials.',
      });
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: 'Destination connection test failed.',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleRunDryLoad = async (sampleRows = 25) => {
    setIsTestingLoad(true);
    try {
      const res = await testDryRunLoad(nodeId, pipelineId, sampleRows);
      setDryRunResult(res);
      setActionFeedback({
        type: 'success',
        message: `Dry-run staging verification complete: ${res.rowsStaged} sample rows validated.`,
      });
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: 'Dry-run load test failed.',
      });
    } finally {
      setIsTestingLoad(false);
    }
  };

  const handleDuplicate = async (newName) => {
    try {
      const duplicated = await duplicateDestinationNode(nodeId, pipelineId, newName);
      setActionFeedback({
        type: 'success',
        message: `Destination node duplicated as "${duplicated.nodeName}".`,
      });
      setDuplicateModalOpen(false);
    } catch (e) {
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

    actionFeedback,
    isSaving,
    isTestingConn,
    isTestingLoad,
    testConnResult,
    dryRunResult,

    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    testConnModalOpen,
    setTestConnModalOpen,

    updateField,
    updateNestedField,
    addTag,
    removeTag,
    updateFieldMapping,

    handleSave,
    handleSaveDraft,
    handleReset,
    handleTestConnection,
    handleRunDryLoad,
    handleDuplicate,
  };
}
