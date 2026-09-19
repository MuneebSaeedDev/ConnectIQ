import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPipelineSettings,
  savePipelineSettings,
  validatePipelineSettings,
  DEFAULT_PIPELINE_SETTINGS,
} from '../services/pipelineSettings.api';

export function usePipelineSettings(pipelineId = 'pip_001') {
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pipelines', pipelineId, 'settings'],
    queryFn: () => getPipelineSettings(pipelineId),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const [form, setForm] = useState(DEFAULT_PIPELINE_SETTINGS);
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_PIPELINE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Modals state
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  // Validation
  const validation = useMemo(() => {
    if (!form) return { isValid: true, errors: {}, warnings: [] };
    return validatePipelineSettings(form);
  }, [form]);

  // Dirty tracking & unsaved changes count
  const { isDirty, unsavedChangesCount } = useMemo(() => {
    if (!form || !savedSnapshot) return { isDirty: false, unsavedChangesCount: 0 };
    let count = 0;

    const compareObjects = (a, b) => {
      if (!a || !b) return;
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      keys.forEach((key) => {
        if (typeof a[key] === 'object' && a[key] !== null && !Array.isArray(a[key])) {
          compareObjects(a[key], b[key]);
        } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
          count++;
        }
      });
    };

    compareObjects(form, savedSnapshot);
    return {
      isDirty: count > 0,
      unsavedChangesCount: count,
    };
  }, [form, savedSnapshot]);

  // Toast feedback auto-clear
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Field updaters
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

  const updateDeepNestedField = useCallback((parent, child, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: {
          ...prev[parent]?.[child],
          [field]: value,
        },
      },
    }));
  }, []);

  // Tag helpers
  const addTag = useCallback((tag) => {
    if (!tag || !tag.trim()) return;
    setForm((prev) => {
      const trimmed = tag.trim();
      if (prev.tags?.includes(trimmed)) return prev;
      return { ...prev, tags: [...(prev.tags || []), trimmed] };
    });
  }, []);

  const removeTag = useCallback((tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  }, []);

  // Environment Variable Helpers
  const addEnvVar = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        environmentVariables: [
          ...(prev.advanced?.environmentVariables || []),
          { key: '', value: '' },
        ],
      },
    }));
  }, []);

  const updateEnvVar = useCallback((index, field, value) => {
    setForm((prev) => {
      const vars = [...(prev.advanced?.environmentVariables || [])];
      if (vars[index]) {
        vars[index] = { ...vars[index], [field]: value };
      }
      return {
        ...prev,
        advanced: {
          ...prev.advanced,
          environmentVariables: vars,
        },
      };
    });
  }, []);

  const removeEnvVar = useCallback((index) => {
    setForm((prev) => {
      const vars = (prev.advanced?.environmentVariables || []).filter((_, i) => i !== index);
      return {
        ...prev,
        advanced: {
          ...prev.advanced,
          environmentVariables: vars,
        },
      };
    });
  }, []);

  // Secret Reference Helpers
  const addSecretRef = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        secretReferences: [
          ...(prev.advanced?.secretReferences || []),
          { secretName: '', vaultKey: '' },
        ],
      },
    }));
  }, []);

  const updateSecretRef = useCallback((index, field, value) => {
    setForm((prev) => {
      const secrets = [...(prev.advanced?.secretReferences || [])];
      if (secrets[index]) {
        secrets[index] = { ...secrets[index], [field]: value };
      }
      return {
        ...prev,
        advanced: {
          ...prev.advanced,
          secretReferences: secrets,
        },
      };
    });
  }, []);

  const removeSecretRef = useCallback((index) => {
    setForm((prev) => {
      const secrets = (prev.advanced?.secretReferences || []).filter((_, i) => i !== index);
      return {
        ...prev,
        advanced: {
          ...prev.advanced,
          secretReferences: secrets,
        },
      };
    });
  }, []);

  // Recipient lists
  const addEmailRecipient = useCallback((email) => {
    if (!email || !email.trim()) return;
    setForm((prev) => {
      const trimmed = email.trim();
      const current = prev.notifications?.emailRecipients || [];
      if (current.includes(trimmed)) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          emailRecipients: [...current, trimmed],
        },
      };
    });
  }, []);

  const removeEmailRecipient = useCallback((email) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        emailRecipients: (prev.notifications?.emailRecipients || []).filter((e) => e !== email),
      },
    }));
  }, []);

  const addSlackChannel = useCallback((channel) => {
    if (!channel || !channel.trim()) return;
    setForm((prev) => {
      const formatted = channel.startsWith('#') ? channel.trim() : `#${channel.trim()}`;
      const current = prev.notifications?.slackChannels || [];
      if (current.includes(formatted)) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          slackChannels: [...current, formatted],
        },
      };
    });
  }, []);

  const removeSlackChannel = useCallback((channel) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        slackChannels: (prev.notifications?.slackChannels || []).filter((c) => c !== channel),
      },
    }));
  }, []);

  // Save handler
  const handleSave = async () => {
    if (!form) return;
    if (!validation.isValid) {
      setActionFeedback({
        type: 'error',
        message: 'Please resolve configuration validation errors before saving.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await savePipelineSettings(pipelineId, form);
      setSavedSnapshot(res);
      setForm(res);
      setActionFeedback({
        type: 'success',
        message: 'Pipeline settings updated and persisted successfully.',
      });
    } catch (e) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Failed to save pipeline settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    setForm(JSON.parse(JSON.stringify(savedSnapshot)));
    setResetModalOpen(false);
    setActionFeedback({
      type: 'info',
      message: 'Reverted all unsaved changes to last saved state.',
    });
  };

  return {
    form,
    isLoading: isLoading || !form,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,
    isSaving,
    actionFeedback,
    activeTab,
    setActiveTab,
    validation,

    // Modal state
    discardModalOpen,
    setDiscardModalOpen,
    resetModalOpen,
    setResetModalOpen,

    // Updaters
    updateField,
    updateNestedField,
    updateDeepNestedField,
    addTag,
    removeTag,
    addEnvVar,
    updateEnvVar,
    removeEnvVar,
    addSecretRef,
    updateSecretRef,
    removeSecretRef,
    addEmailRecipient,
    removeEmailRecipient,
    addSlackChannel,
    removeSlackChannel,

    // Actions
    handleSave,
    handleReset,
  };
}
