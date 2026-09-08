import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ORG_ID,
  DEFAULT_DESTINATION_CONFIG,
  getDestinationConfiguration,
  updateDestinationConfiguration,
  testDestinationConnectionQuick,
  rotateDestinationCredentials,
} from '../services/destinationConfiguration.api';

/**
 * Custom hook to manage destination configuration query, form editing, dirty state,
 * validation tracking, connection test trigger, and persistence.
 */
export function useDestinationConfiguration(destinationId = 'dest_sf_prod_01', orgId = ORG_ID) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ['destination-config', orgId, destinationId], [orgId, destinationId]);

  // Fetch initial data
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getDestinationConfiguration(orgId, destinationId),
    staleTime: 30_000,
  });

  // Local mutable form state
  const [formData, setFormData] = useState(DEFAULT_DESTINATION_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateSuccess, setRotateSuccess] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Sync form state when data loads or updates
  useEffect(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [initialData]);

  // Determine dirty state by deep comparing form state to initialData
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    try {
      const initialClean = JSON.stringify({
        general: initialData.general,
        connection: initialData.connection,
        auth: initialData.auth,
        configuration: initialData.configuration,
        advanced: initialData.advanced,
      });
      const currentClean = JSON.stringify({
        general: formData.general,
        connection: formData.connection,
        auth: formData.auth,
        configuration: formData.configuration,
        advanced: formData.advanced,
      });
      return initialClean !== currentClean;
    } catch {
      return false;
    }
  }, [initialData, formData]);

  // Field updaters
  const updateGeneral = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  }, []);

  const addTag = useCallback((newTag) => {
    if (!newTag || !newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    setFormData((prev) => {
      if (prev.general.tags.includes(tag)) return prev;
      return {
        ...prev,
        general: {
          ...prev.general,
          tags: [...prev.general.tags, tag],
        },
      };
    });
    setSaveSuccess(false);
  }, []);

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        tags: prev.general.tags.filter((t) => t !== tagToRemove),
      },
    }));
    setSaveSuccess(false);
  }, []);

  const updateConnection = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      connection: {
        ...prev.connection,
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  }, []);

  const updateAuth = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      auth: {
        ...prev.auth,
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  }, []);

  const updateConfig = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  }, []);

  const toggleConfigSwitch = useCallback((field) => {
    setFormData((prev) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: !prev.configuration[field],
      },
    }));
    setSaveSuccess(false);
  }, []);

  const updateAdvanced = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  }, []);

  const toggleAdvancedSwitch = useCallback((field) => {
    setFormData((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [field]: !prev.advanced[field],
      },
    }));
    setSaveSuccess(false);
  }, []);

  // Validation calculation
  const validationSummary = useMemo(() => {
    const requiredItems = [
      { name: 'Display Name', valid: Boolean(formData.general?.displayName?.trim()) },
      { name: 'Destination Type', valid: Boolean(formData.general?.type) },
      { name: 'Account / Host', valid: Boolean(formData.connection?.account?.trim()) },
      { name: 'Warehouse', valid: Boolean(formData.connection?.warehouse?.trim()) },
      { name: 'Database', valid: Boolean(formData.connection?.database?.trim()) },
      { name: 'Schema', valid: Boolean(formData.connection?.schema?.trim()) },
      { name: 'Auth Username/Key', valid: Boolean(formData.auth?.username?.trim() || formData.auth?.roleArn?.trim()) },
    ];

    const completedCount = requiredItems.filter((i) => i.valid).length;
    const totalRequired = requiredItems.length;
    const isAllValid = completedCount === totalRequired;

    return {
      completedCount,
      totalRequired,
      isAllValid,
      percent: Math.round((completedCount / totalRequired) * 100),
      items: requiredItems,
    };
  }, [formData]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => updateDestinationConfiguration(orgId, destinationId, payload),
    onSuccess: () => {
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        ...formData,
        lastUpdated: 'Just now',
      }));
      setSaveSuccess(true);
      setBannerDismissed(false);
    },
  });

  const handleSave = useCallback(async () => {
    if (saveMutation.isPending) return;
    try {
      await saveMutation.mutateAsync(formData);
    } catch (err) {
      console.error('[useDestinationConfiguration] Save error:', err);
    }
  }, [saveMutation, formData]);

  const handleReset = useCallback(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    }
    setSaveSuccess(false);
  }, [initialData]);

  // Quick Connection Test Action
  const runQuickTest = useCallback(async () => {
    setIsTesting(true);
    setTestError(null);
    try {
      const res = await testDestinationConnectionQuick(orgId, destinationId);
      setTestResult(res);
      setFormData((prev) => ({
        ...prev,
        lastTested: `${new Date().toLocaleTimeString()} today`,
      }));
    } catch (err) {
      setTestError(err?.message || 'Quick test failed. Verify network and credentials.');
    } finally {
      setIsTesting(false);
    }
  }, [orgId, destinationId]);

  // Rotate Credentials Action
  const rotateCredentials = useCallback(async () => {
    setIsRotating(true);
    try {
      const res = await rotateDestinationCredentials(orgId, destinationId);
      if (res.success) {
        setRotateSuccess(true);
        setFormData((prev) => ({
          ...prev,
          auth: {
            ...prev.auth,
            lastRotated: 'Just now',
          },
        }));
      }
    } catch (err) {
      console.error('[useDestinationConfiguration] Rotate credentials error:', err);
    } finally {
      setIsRotating(false);
    }
  }, [orgId, destinationId]);

  return {
    data: formData,
    initialData,
    isLoading,
    isError,
    error,
    isDirty,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    saveSuccess,
    bannerDismissed,
    setBannerDismissed,
    validationSummary,
    isTesting,
    testResult,
    testError,
    isRotating,
    rotateSuccess,
    refetch,
    updateGeneral,
    addTag,
    removeTag,
    updateConnection,
    updateAuth,
    updateConfig,
    toggleConfigSwitch,
    updateAdvanced,
    toggleAdvancedSwitch,
    handleSave,
    handleReset,
    runQuickTest,
    rotateCredentials,
  };
}
