/**
 * Single validated entry point for environment/config access (agent
 * rules §14 — Security & Configuration). Nothing outside this file
 * should read `import.meta.env` directly, so every consumer gets the
 * same fallback/validation behavior instead of re-deriving it.
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  clusterId: import.meta.env.VITE_CLUSTER_ID ?? 'prod-01',
  clusterRegion: import.meta.env.VITE_CLUSTER_REGION ?? 'us-east-1',
  appVersion: import.meta.env.VITE_APP_VERSION ?? 'v7.2.1',
  buildId: import.meta.env.VITE_BUILD_ID ?? '20250731.1',
  appEnv: import.meta.env.VITE_APP_ENV ?? 'production',
};
