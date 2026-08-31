/**
 * Data + submit for the API Connector Setup Screen (SCR-049, node
 * 116:33009, Figma page "Page 1", frame "API Connector Setup Screen").
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, REST-connector
 * config validation, `test-connection`/`sample-request` action, or
 * `SourceHealthRecord` endpoint exists yet (see
 * docs/modules/module-plan.md). Both `sendTestRequest` and
 * `createApiConnector` always attempt a real request first and only fall
 * back to a simulated result when the endpoint is unreachable / returns
 * non-JSON (defends against the Vite dev server's own 200-OK HTML SPA
 * fallback), mirroring the sibling write-side
 * dataSources/addDataSource.api.js and users/addUser.api.js
 * real-request-first / `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 116:33009 could NOT be inspected this session
 * — the Figma MCP server reports "Connected" (`claude mcp list`) but its
 * tools (`get_metadata`/`get_screenshot`/`use_figma`) are not exposed in
 * the current tool set, so no metadata or screenshot could be pulled.
 * The API-connector setup content below is therefore transcribed from
 * the established MOD-006 conventions (the sibling SCR-046 Add Data
 * Source REST/API connector flow in addDataSource.api.js — endpoint,
 * auth-method-driven credentials, connection testing, mock boundary) and
 * the MOD-006 module spec (REST API connector: endpoint/method/headers/
 * auth/pagination/rate-limiting/response-mapping). Layout/content
 * fidelity is `unverified` against the frame pending Figma MCP tool
 * availability, matching the documented SCR-044 precedent
 * ("get_screenshot unavailable … pixel fidelity not independently
 * re-pulled"). See docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class ApiConnectorError extends Error {}

/** Scope this connector to the caller's organization (see addUser.api.js note). */
export const ORG_ID = 'current';

/** HTTP methods offered for the connector's default/test request. */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/** API payload formats the response parser understands. */
export const RESPONSE_FORMATS = ['JSON', 'XML', 'CSV', 'NDJSON'];

/** Environment + category select sets (shared vocabulary with SCR-046). */
export const API_CONNECTOR_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  category: ['Analytics', 'Operational', 'Financial', 'Customer', 'Marketing', 'Compliance'],
  owner: [
    'alice.chen@company.com',
    'james.park@company.com',
    'maria.rodriguez@company.com',
    'david.lee@company.com',
    'chris.ward@company.com',
  ],
  dataClassification: ['Public', 'Internal', 'Confidential', 'Restricted'],
};

/**
 * Authentication methods for a REST/HTTP connector and which credential
 * fields each one shows. Distinct from SCR-046's broader connector-auth
 * map — this set is HTTP-API specific (bearer/api-key/basic/oauth).
 */
export const API_AUTH_METHODS = ['None', 'API Key', 'Bearer Token', 'Basic Auth', 'OAuth 2.0'];

export const API_AUTH_FIELD_MAP = {
  None: [],
  'API Key': ['apiKeyName', 'apiKeyValue', 'apiKeyLocation'],
  'Bearer Token': ['bearerToken'],
  'Basic Auth': ['basicUsername', 'basicPassword'],
  'OAuth 2.0': ['oauthTokenUrl', 'oauthClientId', 'oauthClientSecret', 'oauthScope'],
};

/** Where an API-key credential is sent. */
export const API_KEY_LOCATIONS = ['Header', 'Query Parameter'];

/**
 * Pagination strategies (Figma "Pagination"). `kind` drives which
 * pagination fields render so the connector is strategy-aware rather than
 * hardcoded to a single scheme.
 */
export const PAGINATION_STRATEGIES = [
  { id: 'none', name: 'None', description: 'Single response, no paging.' },
  { id: 'offset', name: 'Offset / Limit', description: 'offset & limit query params.' },
  { id: 'page', name: 'Page Number', description: 'page & pageSize query params.' },
  { id: 'cursor', name: 'Cursor', description: 'Follow a next-cursor token in the response.' },
  { id: 'link', name: 'Link Header', description: 'Follow RFC 5988 Link: rel="next".' },
];

export const PAGINATION_FIELD_MAP = {
  none: [],
  offset: ['offsetParam', 'limitParam', 'pageSize'],
  page: ['pageParam', 'pageSizeParam', 'pageSize'],
  cursor: ['cursorParam', 'cursorPath', 'pageSize'],
  link: ['pageSize'],
};

export const RETRY_POLICY_OPTIONS = [
  'Exponential backoff (3 retries)',
  'Exponential backoff (5 retries)',
  'Fixed interval (5 retries)',
  'No automatic retry',
];

/**
 * A design-sourced sample response body used to preview response mapping
 * before a real MOD-006 backend exists. A real connector would echo the
 * live source's payload from the test request.
 */
export const SAMPLE_RESPONSE = {
  data: [
    { id: 1001, name: 'Acme Corp', status: 'active', created_at: '2026-01-14T09:22:00Z', revenue: 482300 },
    { id: 1002, name: 'Globex', status: 'active', created_at: '2026-02-03T14:05:00Z', revenue: 291750 },
    { id: 1003, name: 'Initech', status: 'churned', created_at: '2025-11-27T11:40:00Z', revenue: 88400 },
  ],
  meta: { total: 1284, page: 1, page_size: 3, next_cursor: 'eyJvZmZzZXQiOjN9' },
};

/** Candidate JSON paths detected from SAMPLE_RESPONSE for the record-path picker. */
export const SAMPLE_RECORD_PATHS = ['data', 'meta', 'data[].id', 'data[].name', 'data[].status', 'data[].revenue'];

/**
 * Send a test request. Real POST first; on any failure return a simulated
 * success flagged `mocked: true`. The checks array mirrors the connection
 * result panel (DNS / TLS / Auth / Response Parsed / Rate-limit headers).
 */
export async function sendTestRequest(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/api/test-request`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ApiConnectorError('Unable to send the test request right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new ApiConnectorError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      success: true,
      statusCode: 200,
      latencyMs: 148,
      recordCount: Array.isArray(SAMPLE_RESPONSE.data) ? SAMPLE_RESPONSE.data.length : 0,
      totalAvailable: SAMPLE_RESPONSE.meta?.total ?? null,
      rateLimitRemaining: 4996,
      body: SAMPLE_RESPONSE,
      checks: [
        { key: 'dns', label: 'DNS Resolution', ok: true },
        { key: 'tls', label: 'SSL / TLS Handshake', ok: true },
        { key: 'auth', label: 'Authentication', ok: true },
        { key: 'response', label: 'Response Parsed', ok: true },
        { key: 'ratelimit', label: 'Rate-limit Headers Detected', ok: true },
      ],
      mocked: true,
    };
  }
}

/**
 * Attempt to create the API connector. Real POST first; on any failure
 * return a simulated success flagged `mocked: true`.
 */
export async function createApiConnector(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/api`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new ApiConnectorError('Unable to create the API connector right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new ApiConnectorError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `api_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
