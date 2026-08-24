import { env } from '../../config/env';

/**
 * Single centralized fetch wrapper (agent rules §9 / AGENTS.md §4.1 —
 * no ad-hoc fetch/Axios calls inside components or feature api files).
 * Every domain api module in `features/<feature>/services/` must call
 * requests through here rather than calling `fetch` directly, so the
 * base URL, headers, and response/error shape stay consistent.
 *
 * Kept intentionally thin: callers still own their own status-code
 * handling and mock-fallback behavior (see each feature's `.api.js`),
 * since those errors carry screen-specific messages. This wrapper only
 * centralizes the request plumbing (base URL, JSON headers, auth
 * header, JSON parsing) that would otherwise be duplicated per call.
 */
export async function apiFetch(path, { method = 'GET', body, headers, signal, auth } = {}) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return res;
}

export async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
