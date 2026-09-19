import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getMappingNodeConfig,
  saveMappingNodeConfig,
  saveMappingDraft,
  validateMapping,
  previewMappedData,
  runAutoMappingAlgorithm,
  DEFAULT_MAPPING_NODE_CONFIG,
} from '../services/fieldMapping.api';

export function useFieldMapping(nodeId = 'map_node_0041', pipelineId = 'customer-etl-v2') {
  // 1. Query remote/mock baseline
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'nodes', nodeId, 'mapping-config'],
    queryFn: () => getMappingNodeConfig(nodeId, pipelineId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Editable form state
  const [form, setForm] = useState(DEFAULT_MAPPING_NODE_CONFIG);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_MAPPING_NODE_CONFIG);

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
  const [previewTab, setPreviewTab] = useState('mapped'); // 'source' | 'mapped' | 'diff'
  const [previewLimit, setPreviewLimit] = useState(10);
  const [selectedMappingId, setSelectedMappingId] = useState('map_2');

  // Modals state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [addMappingModalOpen, setAddMappingModalOpen] = useState(false);
  const [autoMapModalOpen, setAutoMapModalOpen] = useState(false);
  const [editMappingModalOpen, setEditMappingModalOpen] = useState(false);
  const [activeEditingMapping, setActiveEditingMapping] = useState(null);

  // Accordions
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-clear feedback banner
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

  // Update nested fields
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

  // Toggle Auto Mapping Checkbox Options
  const toggleAutoMapOption = useCallback((optionKey) => {
    setForm((prev) => ({
      ...prev,
      autoMappingConfig: {
        ...prev.autoMappingConfig,
        [optionKey]: !prev.autoMappingConfig[optionKey],
      },
    }));
  }, []);

  // Mappings management
  const addMappingItem = useCallback((item) => {
    const newItem = {
      id: `map_${Date.now()}`,
      sourceField: item.sourceField || '—',
      srcType: item.srcType || 'STRING',
      mappingType: item.mappingType || 'Direct',
      transformation: item.transformation || '—',
      targetField: item.targetField || '—',
      tgtType: item.tgtType || 'STRING',
      validationStatus: item.validationStatus || 'pass',
      validationMessage: item.validationMessage || 'Mapping added.',
      status: 'mapped',
    };
    setForm((prev) => ({
      ...prev,
      mappings: [...prev.mappings, newItem],
    }));
    showFeedback('success', `Added mapping for target field "${newItem.targetField}".`);
  }, [showFeedback]);

  const updateMappingItem = useCallback((id, updates) => {
    setForm((prev) => ({
      ...prev,
      mappings: prev.mappings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  const removeMappingItem = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      mappings: prev.mappings.filter((m) => m.id !== id),
    }));
    showFeedback('info', 'Mapping entry removed.');
  }, [showFeedback]);

  const clearAllMappings = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      mappings: [],
    }));
    showFeedback('info', 'All mapping entries cleared.');
  }, [showFeedback]);

  // Apply Auto-Mapping matches
  const applyAutoMatches = useCallback(() => {
    const { matches } = runAutoMappingAlgorithm(
      form.inputSchema?.fields || [],
      form.targetSchema?.fields || [],
      form.autoMappingConfig || {}
    );

    if (matches.length === 0) {
      showFeedback('info', 'No new automatic matches found with current criteria.');
      return;
    }

    setForm((prev) => {
      const existingTargets = new Set(prev.mappings.map((m) => m.targetField));
      const newEntries = matches
        .filter((match) => !existingTargets.has(match.targetField))
        .map((match, idx) => ({
          id: `map_auto_${Date.now()}_${idx}`,
          sourceField: match.sourceField,
          srcType: match.srcType,
          mappingType: match.mappingType,
          transformation: '—',
          targetField: match.targetField,
          tgtType: match.tgtType,
          validationStatus: 'pass',
          validationMessage: `Auto-mapped via ${match.strategy}.`,
          status: 'mapped',
        }));

      return {
        ...prev,
        mappings: [...prev.mappings, ...newEntries],
      };
    });

    showFeedback('success', `Applied ${matches.length} automatic field matches.`);
    setAutoMapModalOpen(false);
  }, [form.inputSchema, form.targetSchema, form.autoMappingConfig, showFeedback]);

  // Selected transformation item
  const selectedMapping = useMemo(() => {
    return (form?.mappings || []).find((m) => m.id === selectedMappingId) || form?.mappings?.[0] || null;
  }, [form?.mappings, selectedMappingId]);

  // Dynamic Summary & Validation Calculation
  const computedSummary = useMemo(() => {
    const mappingsList = form?.mappings || [];
    const totalSource = form?.inputSchema?.fields?.length || 18;
    const totalTarget = form?.targetSchema?.fields?.length || 14;
    const requiredTarget = (form?.targetSchema?.fields || []).filter((f) => f.required).length || 9;

    const mappedTargetSet = new Set(
      mappingsList.filter((m) => m.targetField && m.targetField !== '—').map((m) => m.targetField)
    );

    const requiredMappedCount = (form?.targetSchema?.fields || [])
      .filter((f) => f.required && mappedTargetSet.has(f.name)).length;

    const directCount = mappingsList.filter((m) => m.mappingType === 'Direct').length;
    const transformCount = mappingsList.filter((m) => ['Expression', 'Rename', 'Conditional', 'Lookup'].includes(m.mappingType)).length;
    const castCount = mappingsList.filter((m) => m.mappingType === 'Cast').length;

    const passCount = mappingsList.filter((m) => m.validationStatus === 'pass').length;
    const warnCount = mappingsList.filter((m) => m.validationStatus === 'warning').length;
    const errCount = mappingsList.filter((m) => m.validationStatus === 'error' || m.status === 'missing').length;

    const completion = totalTarget > 0 ? Math.round((mappedTargetSet.size / totalTarget) * 100) : 0;

    return {
      completionPercentage: completion,
      totalSourceFields: totalSource,
      mappedFields: mappedTargetSet.size,
      unmappedFields: Math.max(0, totalSource - mappedTargetSet.size),
      totalTargetFields: totalTarget,
      requiredFieldsMapped: `${requiredMappedCount} / ${requiredTarget}`,
      transformations: transformCount + castCount,
      validationErrors: errCount,
      schemaSummary: {
        sourceFields: totalSource,
        targetFields: totalTarget,
        requiredFields: requiredTarget,
      },
      transformationSummary: {
        directMappings: directCount,
        transformations: transformCount,
        typeConversions: castCount,
      },
      validationSummary: {
        passed: passCount,
        warnings: warnCount,
        errors: errCount,
      },
      mappingStatus: {
        totalMappings: mappingsList.length,
        complete: passCount,
        incomplete: warnCount,
        invalid: errCount,
      },
    };
  }, [form?.inputSchema, form?.targetSchema, form?.mappings]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

  const unsavedChangesCount = useMemo(() => {
    if (!isDirty) return 0;
    let count = 0;
    if (form.nodeName !== savedSnapshot.nodeName) count++;
    if (form.displayName !== savedSnapshot.displayName) count++;
    if (form.description !== savedSnapshot.description) count++;
    if (JSON.stringify(form.tags) !== JSON.stringify(savedSnapshot.tags)) count++;
    if (JSON.stringify(form.mappings) !== JSON.stringify(savedSnapshot.mappings)) count++;
    if (JSON.stringify(form.transformationConfig) !== JSON.stringify(savedSnapshot.transformationConfig)) count++;
    if (JSON.stringify(form.dataTypeConversion) !== JSON.stringify(savedSnapshot.dataTypeConversion)) count++;
    if (JSON.stringify(form.nullHandling) !== JSON.stringify(savedSnapshot.nullHandling)) count++;
    if (JSON.stringify(form.runtimeConfig) !== JSON.stringify(savedSnapshot.runtimeConfig)) count++;
    if (JSON.stringify(form.monitoring) !== JSON.stringify(savedSnapshot.monitoring)) count++;
    if (JSON.stringify(form.advancedConfig) !== JSON.stringify(savedSnapshot.advancedConfig)) count++;
    return Math.max(1, count);
  }, [form, savedSnapshot, isDirty]);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await saveMappingNodeConfig(nodeId, pipelineId, form);
      setSavedSnapshot(form);
      setForm((prev) => ({
        ...prev,
        status: 'Configured',
        lastSaved: new Date().toUTCString(),
      }));
      showFeedback('success', res.message || 'Mapping Node Configuration saved successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save mapping configuration.');
    } finally {
      setIsSaving(false);
    }
  }, [nodeId, pipelineId, form, showFeedback]);

  // Save draft handler
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await saveMappingDraft(nodeId, pipelineId, form);
      setSavedSnapshot(form);
      showFeedback('success', res.message || 'Draft saved successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  }, [nodeId, pipelineId, form, showFeedback]);

  // Validate handler
  const handleValidateMapping = useCallback(async () => {
    setIsValidating(true);
    try {
      const res = await validateMapping(nodeId, pipelineId, form);
      if (res.errors > 0) {
        showFeedback('error', `Validation failed: ${res.errors} error(s) and ${res.warnings} warning(s) found.`);
      } else if (res.warnings > 0) {
        showFeedback('info', `Validation passed with ${res.warnings} warning(s).`);
      } else {
        showFeedback('success', `All ${res.passed} mapping checks passed successfully.`);
      }
    } catch (err) {
      showFeedback('error', err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  }, [nodeId, pipelineId, form, showFeedback]);

  // Preview Data handler
  const handlePreviewData = useCallback(async () => {
    setIsPreviewing(true);
    try {
      const res = await previewMappedData(nodeId, pipelineId, {
        limit: previewLimit,
        mappings: form.mappings,
      });
      setForm((prev) => ({
        ...prev,
        dataPreview: res,
      }));
      showFeedback('success', `Generated data preview for ${res.stats?.recordsPreviewed || 10} records.`);
    } catch (err) {
      showFeedback('error', err.message || 'Failed to generate preview data.');
    } finally {
      setIsPreviewing(false);
    }
  }, [nodeId, pipelineId, form.mappings, previewLimit, showFeedback]);

  // Reset form to last saved
  const handleReset = useCallback(() => {
    setForm(savedSnapshot);
    showFeedback('info', 'Configuration reset to last saved state.');
  }, [savedSnapshot, showFeedback]);

  // Duplicate handler
  const handleDuplicate = useCallback((newName) => {
    const duplicatedNodeId = `map_node_${Math.floor(1000 + Math.random() * 9000)}`;
    setDuplicateModalOpen(false);
    showFeedback('success', `Node duplicated as "${newName}" (${duplicatedNodeId}).`);
  }, [showFeedback]);

  // Fix validation issue action
  const handleFixValidation = useCallback((checkItem) => {
    if (checkItem.field === 'status') {
      // Map missing status field
      setForm((prev) => ({
        ...prev,
        mappings: prev.mappings.map((m) =>
          m.targetField === 'status'
            ? {
                ...m,
                sourceField: 'is_active',
                srcType: 'BOOLEAN',
                mappingType: 'Conditional',
                transformation: "IF(is_active = true, 'ACTIVE', 'INACTIVE')",
                validationStatus: 'pass',
                validationMessage: 'Mapped with conditional status expression.',
                status: 'mapped',
              }
            : m
        ),
      }));
      showFeedback('success', 'Fixed: Mapped status field with active status expression.');
    } else if (checkItem.field === 'balance_usd') {
      // Fix decimal precision
      setForm((prev) => ({
        ...prev,
        dataTypeConversion: {
          ...prev.dataTypeConversion,
          conversionRule: 'CAST(x AS DECIMAL(14,4))',
        },
        mappings: prev.mappings.map((m) =>
          m.targetField === 'balance_usd'
            ? {
                ...m,
                validationStatus: 'pass',
                validationMessage: 'Target precision increased to DECIMAL(14,4).',
              }
            : m
        ),
      }));
      showFeedback('success', 'Fixed: Increased target balance precision to DECIMAL(14,4).');
    }
  }, [showFeedback]);

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
    isPreviewing,
    previewTab,
    setPreviewTab,
    previewLimit,
    setPreviewLimit,
    selectedMappingId,
    setSelectedMappingId,
    selectedMapping,
    computedSummary,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    addMappingModalOpen,
    setAddMappingModalOpen,
    autoMapModalOpen,
    setAutoMapModalOpen,
    editMappingModalOpen,
    setEditMappingModalOpen,
    activeEditingMapping,
    setActiveEditingMapping,

    // Accordions
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    toggleAutoMapOption,
    addMappingItem,
    updateMappingItem,
    removeMappingItem,
    clearAllMappings,
    applyAutoMatches,
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateMapping,
    handlePreviewData,
    handleDuplicate,
    handleFixValidation,
  };
}
