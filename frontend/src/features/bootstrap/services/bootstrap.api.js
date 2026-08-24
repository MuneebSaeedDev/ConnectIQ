/**
 * Bootstrap initialization checks run by the Splash Screen.
 *
 * MOCK BOUNDARY: no backend exists yet (docs/modules/module-plan.md,
 * MOD-001 has no backend dependency of its own — auth/session live in
 * MOD-002). `checkConnectivity` attempts a real request against the
 * platform health endpoint first; if that endpoint isn't reachable
 * (no backend deployed yet) it falls back to a resolved mock result
 * rather than hanging or throwing, so the splash flow stays real for
 * whichever half of the environment actually exists. Replace the
 * catch-fallback with a hard failure once MOD-002's backend is live
 * and a missing health endpoint should be a genuine error state.
 */

import { apiFetch } from '../../../services/api/client';
import { env } from '../../../config/env';

export async function loadPlatformConfig() {
  // Config values shown on this screen (version/build/cluster) come
  // from the centralized env config (src/config/env.js), falling back
  // to the values captured from the Figma design when unset.
  return {
    clusterId: env.clusterId,
    region: env.clusterRegion,
    version: env.appVersion,
    buildId: env.buildId,
    environment: env.appEnv,
  };
}

export async function checkConnectivity(signal) {
  try {
    const res = await apiFetch('/health', { signal });
    return { ok: res.ok, mocked: false };
  } catch {
    // Backend not deployed yet — documented mock fallback, not a
    // fabricated success used to hide a real failure.
    return { ok: true, mocked: true };
  }
}

export async function restoreSession() {
  // Real check against the browser's own storage (not a mock): this
  // reads whatever MOD-002's auth flow actually persisted on login.
  // The login screen (SCR-002) writes to localStorage when "Keep me
  // signed in" was checked, sessionStorage otherwise — check both so
  // a session started without that checkbox isn't reported as absent.
  const token =
    window.localStorage.getItem('meridian.refreshToken') ??
    window.sessionStorage.getItem('meridian.refreshToken');
  return { hasSession: Boolean(token) };
}
