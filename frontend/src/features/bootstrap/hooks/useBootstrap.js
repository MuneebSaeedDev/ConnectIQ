import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  bootstrapCompleted,
  bootstrapReset,
  stepFailed,
  stepStarted,
  stepSucceeded,
} from '../state/bootstrapSlice';
import { checkConnectivity, loadPlatformConfig, restoreSession } from '../services/bootstrap.api';

/**
 * Drives the splash screen's real initialization sequence: load
 * platform config, verify connectivity, restore any existing session.
 * Exposes progress via Redux so the UI stays a pure render of state
 * rather than owning the sequencing itself.
 */
export function useBootstrap() {
  const dispatch = useAppDispatch();
  const { steps, error, complete } = useAppSelector((state) => state.bootstrap);
  const [config, setConfig] = useState(null);
  const [hasSession, setHasSession] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const controller = new AbortController();
    dispatch(bootstrapReset());

    async function run() {
      try {
        dispatch(stepStarted('config'));
        const cfg = await loadPlatformConfig();
        setConfig(cfg);
        dispatch(stepSucceeded('config'));

        dispatch(stepStarted('connectivity'));
        const connectivity = await checkConnectivity(controller.signal);
        if (!connectivity.ok) {
          dispatch(
            stepFailed({
              id: 'connectivity',
              message: 'Unable to reach the platform. Check your connection and retry.',
            }),
          );
          return;
        }
        dispatch(stepSucceeded('connectivity'));

        dispatch(stepStarted('session'));
        const session = await restoreSession();
        setHasSession(session.hasSession);
        dispatch(stepSucceeded('session'));

        dispatch(bootstrapCompleted());
      } catch (err) {
        dispatch(
          stepFailed({
            id: 'connectivity',
            message: err instanceof Error ? err.message : 'Initialization failed unexpectedly.',
          }),
        );
      }
    }

    void run();
    return () => controller.abort();
  }, [dispatch]);

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const activeStep =
    steps.find((s) => s.status === 'running') ?? steps.find((s) => s.status === 'error');

  return { steps, error, complete, progress, activeStep, config, hasSession };
}
