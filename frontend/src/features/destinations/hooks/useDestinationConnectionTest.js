import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DEFAULT_DESTINATION_METADATA,
  DEFAULT_TEST_CONFIG,
  runDestinationConnectionTest,
  saveValidatedDestination,
  ORG_ID,
} from '../services/destinationConnectionTest.api';

/**
 * Hook to manage destination connection test lifecycle, interactive configuration,
 * step execution simulations, and results reporting.
 */
export function useDestinationConnectionTest(initialDestination = null) {
  const [destination, setDestination] = useState(initialDestination || DEFAULT_DESTINATION_METADATA);
  const [config, setConfig] = useState(DEFAULT_TEST_CONFIG);
  const [testStatus, setTestStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed'
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const abortControllerRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    const timer = timerRef;
    const abort = abortControllerRef;
    return () => {
      const activeTimer = timer.current;
      const activeAbort = abort.current;
      if (activeTimer) clearInterval(activeTimer);
      if (activeAbort) activeAbort.abort();
    };
  }, []);

  const updateConfig = useCallback((key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleConfig = useCallback((key) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const startTest = useCallback(async () => {
    setTestStatus('running');
    setError(null);
    setProgressPercent(10);
    setActiveStepIndex(0);

    // Simulate animated step progression
    let currentStep = 0;
    const totalSteps = 7;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep < totalSteps) {
        setActiveStepIndex(currentStep);
        setProgressPercent(Math.min(90, Math.round((currentStep / totalSteps) * 100)));
      }
    }, 150);

    try {
      const res = await runDestinationConnectionTest(ORG_ID, destination.id, config);
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveStepIndex(totalSteps);
      setProgressPercent(100);
      setResult(res);
      setTestStatus('completed');
      setDestination((prev) => ({
        ...prev,
        lastTested: 'Just now',
      }));
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      setError(err?.message || 'Connection test failed. Please check network and credentials.');
      setTestStatus('failed');
    }
  }, [destination.id, config]);

  const cancelTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setTestStatus('idle');
    setActiveStepIndex(-1);
    setProgressPercent(0);
  }, []);

  const resetTest = useCallback(() => {
    setTestStatus('idle');
    setActiveStepIndex(-1);
    setProgressPercent(0);
    setResult(null);
    setError(null);
    setSaveSuccess(false);
  }, []);

  const saveDestination = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await saveValidatedDestination(ORG_ID, destination.id, {
        destination,
        config,
        result,
      });
      setIsSaving(false);
      setSaveSuccess(true);
      return res;
    } catch (err) {
      setIsSaving(false);
      throw err;
    }
  }, [destination, config, result]);

  return {
    destination,
    config,
    testStatus,
    activeStepIndex,
    progressPercent,
    result,
    error,
    isSaving,
    saveSuccess,
    updateConfig,
    toggleConfig,
    startTest,
    cancelTest,
    resetTest,
    saveDestination,
  };
}
