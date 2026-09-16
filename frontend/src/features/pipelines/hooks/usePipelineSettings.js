import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPipelineSettings, savePipelineSettings } from '../services/pipelineSettings.api';

export function usePipelineSettings(pipelineId = 'pip_001') {
  const { data: initialData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pipelines', pipelineId, 'settings'],
    queryFn: () => getPipelineSettings(pipelineId),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const [form, setForm] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSavedSnapshot(initialData);
    }
  }, [initialData]);

  const isDirty = useMemo(() => {
    if (!form || !savedSnapshot) return false;
    return JSON.stringify(form) !== JSON.stringify(savedSnapshot);
  }, [form, savedSnapshot]);

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
    if (!tag.trim() || !form) return;
    setForm((prev) => {
      if (prev.tags.includes(tag.trim())) return prev;
      return { ...prev, tags: [...prev.tags, tag.trim()] };
    });
  }, [form]);

  const removeTag = useCallback((tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const res = await savePipelineSettings(pipelineId, form);
      setSavedSnapshot(res);
      setActionFeedback({
        type: 'success',
        message: 'Pipeline settings saved successfully.',
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

  const handleReset = () => {
    setForm(savedSnapshot);
    setActionFeedback({
      type: 'info',
      message: 'Reverted unsaved changes.',
    });
  };

  return {
    form,
    isLoading: isLoading || !form,
    isError,
    error,
    refetch,
    isDirty,
    isSaving,
    actionFeedback,
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    handleSave,
    handleReset,
  };
}
