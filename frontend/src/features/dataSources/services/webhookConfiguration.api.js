/**
 * Data + submit for the Webhook Configuration Screen (SCR-054, node
 * 123:43915, Figma page "Page 1", frame "Webhook Configuration Screen").
 * This is the event-driven step of the "add source" wizard: SCR-047
 * Source Connection Setup → Webhook → SCR-054 → data-source list. Unlike
 * the polling connectors, a webhook source exposes a generated inbound
 * HTTPS endpoint that the upstream system POSTs events to; the screen
 * therefore models endpoint generation, HMAC/replay security, event
 * subscription, payload validation, event-processing rules, retry/failure
 * policy, and delivery monitoring.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, endpoint-generation,
 * `test-webhook`, or webhook-registration endpoint exists yet (see
 * docs/modules/module-plan.md). `generateEndpoint`, `testWebhook`, and
 * `createWebhookSource` each attempt a real request first and only fall
 * back to a simulated result when the endpoint is unreachable / returns
 * non-JSON (defends against the Vite dev server's own 200-OK HTML SPA
 * fallback), mirroring ftpConnection.api.js / databaseConnector.api.js /
 * apiConnectorSetup.api.js real-request-first / `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 123:43915 WAS inspected this session
 * (get_metadata + get_design_context + get_screenshot all succeeded).
 * Content (section titles, field labels, auth methods, HMAC defaults,
 * event catalogue, validation modes, sidebar metrics, and the seeded
 * salesforce-crm-events example) is transcribed from that inspection.
 * See docs/reviews/review-log.md.
 *
 * SECURITY: the webhook signing secret is Vault-backed and masked at all
 * times (whsec_••). It is never rendered in clear text and never returned
 * from a create/test call (agent-rules §10).
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class WebhookError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/** Design-sourced select option sets. */
export const WEBHOOK_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  version: ['v2 (Current)', 'v1 (Legacy)', 'v3 (Beta)'],
  organization: ['Acme Corp', 'Acme EU', 'Acme APAC'],
  httpMethod: ['POST', 'PUT'],
  contentType: ['JSON', 'XML', 'Form Data'],
  hmacAlgorithm: ['HMAC-SHA256', 'HMAC-SHA512', 'HMAC-SHA1'],
  validationMode: ['JSON Schema', 'XML Schema', 'Custom Rules', 'Disabled'],
  nullHandling: ['Reject null values', 'Allow null values', 'Coerce null to default'],
  transformationProfile: ['None (pass-through)', 'Salesforce CRM v2', 'Generic Flatten', 'Custom Mapping'],
  processingPriority: ['High', 'Normal', 'Low'],
  queueMode: ['Async Queue', 'Sync (inline)', 'Batch'],
  duplicateHandling: ['Reject duplicates', 'Allow duplicates', 'Last-write-wins'],
  retryStrategy: ['Exponential Backoff', 'Linear Backoff', 'Fixed Interval', 'No Retry'],
  jitter: ['Full Jitter', 'Equal Jitter', 'No Jitter'],
};

/** Endpoint status is a segmented control in the Figma frame. */
export const WEBHOOK_STATUSES = ['Active', 'Paused', 'Disabled'];

/**
 * Authentication methods for an inbound webhook. Each maps to the
 * credential/config fields it requires. `HMAC Signature` is the default
 * (badge on the Auth & Security card) and Vault-backed.
 */
export const WEBHOOK_AUTH_METHODS = [
  { id: 'none', name: 'No Auth', description: 'Open endpoint. Not recommended for production.', secure: false },
  { id: 'secret-token', name: 'Secret Token', description: 'Shared bearer token in a header.', secure: true },
  { id: 'hmac', name: 'HMAC Signature', description: 'Sign each request body with a shared secret.', secure: true },
  { id: 'api-key', name: 'API Key', description: 'Static key in a custom header.', secure: true },
  { id: 'oauth2', name: 'OAuth 2.0', description: 'Validate a bearer access token.', secure: true },
  { id: 'jwt', name: 'JWT Verify', description: 'Verify a signed JWT against a JWKS.', secure: true },
  { id: 'mtls', name: 'Mutual TLS', description: 'Require a trusted client certificate.', secure: true },
  { id: 'ip-allowlist', name: 'IP Allowlist', description: 'Restrict callers to known CIDR ranges.', secure: true },
];

export const AUTH_METHODS_BY_ID = Object.fromEntries(WEBHOOK_AUTH_METHODS.map((m) => [m.id, m]));

/**
 * Event catalogue — the subscribable events grouped by category, as shown
 * in the Figma "Event Subscription" card. `defaultOn` reproduces the
 * frame's pre-selected state (14 of 19 subscribed). `volume` is the
 * design's estimated per-hour rate for the category.
 */
export const EVENT_CATEGORIES = [
  {
    id: 'customer',
    name: 'Customer Events',
    volume: '~2,400/hr',
    events: [
      { id: 'customer.created', label: 'customer.created', description: 'New customer account created', defaultOn: true },
      { id: 'customer.updated', label: 'customer.updated', description: 'Customer profile fields changed', defaultOn: true },
      { id: 'customer.deleted', label: 'customer.deleted', description: 'Customer account removed', defaultOn: true },
      { id: 'customer.merged', label: 'customer.merged', description: 'Duplicate customer records merged', defaultOn: true },
      { id: 'customer.tier_changed', label: 'customer.tier_changed', description: 'Customer tier / segment reassigned', defaultOn: false },
    ],
  },
  {
    id: 'pipeline',
    name: 'Pipeline Events',
    volume: '~180/hr',
    events: [
      { id: 'pipeline.started', label: 'pipeline.started', description: 'Pipeline run began', defaultOn: true },
      { id: 'pipeline.completed', label: 'pipeline.completed', description: 'Pipeline run finished successfully', defaultOn: true },
      { id: 'pipeline.failed', label: 'pipeline.failed', description: 'Pipeline run failed', defaultOn: true },
      { id: 'pipeline.paused', label: 'pipeline.paused', description: 'Pipeline paused by operator', defaultOn: false },
    ],
  },
  {
    id: 'dataset',
    name: 'Dataset Events',
    volume: '~320/hr',
    events: [
      { id: 'dataset.created', label: 'dataset.created', description: 'New dataset registered', defaultOn: true },
      { id: 'dataset.updated', label: 'dataset.updated', description: 'Dataset schema or rows updated', defaultOn: true },
      { id: 'dataset.deleted', label: 'dataset.deleted', description: 'Dataset removed', defaultOn: true },
      { id: 'dataset.schema_changed', label: 'dataset.schema_changed', description: 'Dataset schema drift detected', defaultOn: false },
    ],
  },
  {
    id: 'user',
    name: 'User Events',
    volume: '~60/hr',
    events: [
      { id: 'user.login', label: 'user.login', description: 'User signed in', defaultOn: false },
      { id: 'user.role_changed', label: 'user.role_changed', description: 'User role or permissions changed', defaultOn: false },
    ],
  },
  {
    id: 'organization',
    name: 'Organization Events',
    volume: '~10/hr',
    events: [
      { id: 'org.settings_changed', label: 'org.settings_changed', description: 'Organization settings updated', defaultOn: false },
      { id: 'org.member_added', label: 'org.member_added', description: 'Member added to the organization', defaultOn: false },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Events',
    volume: 'Variable',
    events: [
      { id: 'custom.event', label: 'custom.*', description: 'Any custom-namespaced event.', defaultOn: false },
    ],
  },
];

/** Flat event lookup + the default-subscribed id set. */
export const EVENTS_BY_ID = Object.fromEntries(
  EVENT_CATEGORIES.flatMap((c) => c.events.map((e) => [e.id, { ...e, categoryId: c.id, categoryName: c.name }])),
);
export const DEFAULT_SUBSCRIBED_EVENT_IDS = Object.values(EVENTS_BY_ID)
  .filter((e) => e.defaultOn)
  .map((e) => e.id);
export const TOTAL_EVENT_COUNT = Object.keys(EVENTS_BY_ID).length;

/** Seeded IP allowlist rows (Figma). */
export const DEFAULT_IP_ALLOWLIST = [
  { cidr: '96.43.144.0/20', label: 'Salesforce Production' },
  { cidr: '136.146.0.0/15', label: 'Salesforce Hyperforce' },
  { cidr: '13.108.0.0/14', label: 'Salesforce Edge' },
  { cidr: '85.222.128.0/19', label: 'Salesforce EMEA' },
  { cidr: '101.53.160.0/19', label: 'Salesforce APAC' },
];

/** The default JSON Schema shown in the Payload Validation editor. */
export const DEFAULT_JSON_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["event_id", "event_type", "occurred_at", "data"],
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "event_type": { "type": "string" },
    "occurred_at": { "type": "string", "format": "date-time" },
    "source": { "type": "string", "enum": ["salesforce"] },
    "data": { "type": "object" }
  },
  "additionalProperties": false
}`;

/**
 * Validation-status checklist rows shown in the sidebar. "Ready for
 * Production" is the item that stays pending until every prior step and a
 * webhook test succeed — mirroring the FTP screen's "Connection Verified".
 */
export function computeChecklist(form, endpoint, webhookTested) {
  const authMethod = AUTH_METHODS_BY_ID[form.authMethodId] ?? null;
  const authConfigured =
    authMethod?.id === 'none'
      ? true
      : authMethod?.id === 'hmac'
        ? !!form.signatureHeader.trim()
        : !!authMethod;
  const eventsSelected = form.subscribedEventIds.length;
  return [
    { key: 'endpoint', label: 'Endpoint Generated', done: !!endpoint },
    { key: 'https', label: 'HTTPS Enforced', done: !!form.enforceHttps },
    { key: 'auth', label: 'Authentication Configured', done: authConfigured },
    { key: 'validation', label: 'Payload Validation Active', done: form.validationMode !== 'Disabled' },
    { key: 'events', label: `Events Selected (${eventsSelected})`, done: eventsSelected > 0 },
    { key: 'ready', label: 'Ready for Production', done: webhookTested },
  ];
}

/** Required-field / integrity validation. */
export function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Webhook name is required.';
  else if (!/^[a-z0-9][a-z0-9-]*$/.test(form.name.trim()))
    errors.name = 'Use lowercase letters, digits, and hyphens (e.g. salesforce-crm-events).';

  if (!form.environment) errors.environment = 'Select an environment.';
  if (!form.organization) errors.organization = 'Select an organization.';

  const authMethod = AUTH_METHODS_BY_ID[form.authMethodId] ?? null;
  if (authMethod?.id === 'hmac') {
    if (!form.signatureHeader.trim()) errors.signatureHeader = 'Signature header name is required for HMAC.';
    // The Vault-backed secret is provisioned on generate, so it is only
    // "missing" if the endpoint has not been generated yet.
    if (!form.secretProvisioned) errors.webhookSecret = 'Generate the signing secret before saving.';
  }

  for (const [key, label, min] of [
    ['maxPayloadSize', 'max payload size (MB)', 1],
    ['requestTimeout', 'request timeout (seconds)', 1],
    ['rateLimit', 'rate limit (req/min)', 1],
    ['timestampTolerance', 'timestamp tolerance (seconds)', 0],
    ['requestExpiration', 'request expiration (seconds)', 0],
    ['maxNestedDepth', 'max nested depth', 1],
    ['maxRetries', 'max retry attempts', 0],
    ['retryInterval', 'initial retry interval (seconds)', 1],
  ]) {
    const n = Number(form[key]);
    if (!Number.isInteger(n) || n < min) errors[key] = `Enter a valid ${label}.`;
  }

  if (form.subscribedEventIds.length === 0) errors.events = 'Subscribe to at least one event.';

  if (form.validationMode === 'JSON Schema' && !form.jsonSchema.trim()) {
    errors.jsonSchema = 'Provide a JSON schema or switch validation off.';
  } else if (form.validationMode === 'JSON Schema') {
    try {
      JSON.parse(form.jsonSchema);
    } catch {
      errors.jsonSchema = 'Schema is not valid JSON.';
    }
  }
  return errors;
}

/** Assemble the create/test payload from flat form state. */
export function buildPayload(form, endpoint) {
  const authMethod = AUTH_METHODS_BY_ID[form.authMethodId] ?? null;
  return {
    connectorId: 'rest',
    method: 'webhook',
    general: {
      name: form.name.trim(),
      environment: form.environment,
      version: form.version,
      endpointAlias: form.endpointAlias.trim() || null,
      status: form.status,
      organization: form.organization,
      description: form.description.trim() || null,
    },
    endpoint: {
      id: endpoint?.endpointId ?? null,
      url: endpoint?.url ?? null,
      customPath: form.customPath.trim() || null,
      httpMethod: form.httpMethod,
      contentType: form.contentType,
      maxPayloadSizeMb: Number(form.maxPayloadSize) || null,
      requestTimeoutSec: Number(form.requestTimeout) || null,
      rateLimitPerMin: Number(form.rateLimit) || null,
      enforceHttps: form.enforceHttps,
    },
    security: {
      authMethod: authMethod?.id ?? null,
      hmacAlgorithm: form.hmacAlgorithm,
      signatureHeader: form.signatureHeader.trim() || null,
      signaturePrefix: form.signaturePrefix.trim() || null,
      // The secret itself is Vault-backed and never transmitted from the
      // client; only whether it has been provisioned is reported.
      secretProvisioned: !!form.secretProvisioned,
      replayProtection: form.replayProtection,
      timestampValidation: form.timestampValidation,
      signatureVerification: form.signatureVerification,
      tlsCertPinning: form.tlsCertPinning,
      timestampToleranceSec: Number(form.timestampTolerance) || null,
      requestExpirationSec: Number(form.requestExpiration) || null,
      ipAllowlist: form.ipAllowlist.map((r) => r.cidr),
    },
    events: {
      subscribed: form.subscribedEventIds,
      count: form.subscribedEventIds.length,
    },
    validation: {
      mode: form.validationMode,
      schema: form.validationMode === 'JSON Schema' ? form.jsonSchema : null,
      versionField: form.payloadVersionField.trim() || null,
      maxNestedDepth: Number(form.maxNestedDepth) || null,
      nullHandling: form.nullHandling,
      duplicateDetection: form.duplicateDetection,
      strictAdditionalProperties: form.strictAdditionalProperties,
      payloadVersionEnforcement: form.payloadVersionEnforcement,
    },
    processing: {
      transformationProfile: form.transformationProfile,
      priority: form.processingPriority,
      queueMode: form.queueMode,
      duplicateHandling: form.duplicateHandling,
      eventOrdering: form.eventOrdering,
      deadLetterQueue: form.deadLetterQueue,
      eventDeduplication: form.eventDeduplication,
      schemaVersionRouting: form.schemaVersionRouting,
      dlqName: form.dlqName.trim() || null,
      dedupWindowMin: Number(form.dedupWindow) || null,
    },
    retry: {
      maxRetries: Number(form.maxRetries) || null,
      retryIntervalSec: Number(form.retryInterval) || null,
      maxRetryWindowHrs: Number(form.maxRetryWindow) || null,
      strategy: form.retryStrategy,
      jitter: form.jitter,
      alertThreshold: Number(form.alertThreshold) || null,
      autoDisableThreshold: Number(form.autoDisableThreshold) || null,
      failureQueue: form.failureQueue.trim() || null,
      autoPause: form.autoPause,
      pagerDutyEscalation: form.pagerDutyEscalation,
    },
    monitoring: {
      deliveryMonitoring: form.deliveryMonitoring,
      failureMonitoring: form.failureMonitoring,
      auditLogging: form.auditLogging,
      payloadLogging: form.payloadLogging,
      securityEventLogging: form.securityEventLogging,
      performanceMetrics: form.performanceMetrics,
      alertNotifications: form.alertNotifications,
      activityRetention: form.activityRetention,
      alertEmail: form.alertEmail.trim() || null,
      slackChannel: form.slackChannel.trim() || null,
    },
  };
}

/** Deterministic-ish random slug for simulated endpoint ids. */
function randomToken(len) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/**
 * Generate (or regenerate) the inbound endpoint. Real POST first; on any
 * failure return a simulated endpoint flagged `mocked: true`. The signing
 * secret is provisioned server-side into Vault and is NEVER returned in
 * clear text — only a masked reference and metadata come back.
 */
export async function generateEndpoint(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/webhook/generate-endpoint`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new WebhookError('Unable to generate an endpoint right now.');
    }
    const data = await readJson(res);
    if (!data || !data.url) {
      throw new WebhookError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const slug = (payload?.general?.name || 'webhook').trim();
    const path = payload?.endpoint?.customPath || slug;
    const suffix = randomToken(12);
    return {
      endpointId: `wbhk_${randomToken(20)}`,
      url: `https://etl.acme.corp/webhooks/v2/${path}-${suffix}`,
      secretRef: 'whsec_••••••••••••••••',
      tls: 'TLS 1.3 enforced',
      availability: 'Available',
      generatedAt: new Date().toISOString(),
      mocked: true,
    };
  }
}

/**
 * Send a signed test event to the endpoint. Real POST first; on any
 * failure return a simulated delivery result flagged `mocked: true` —
 * reproducing the Figma "Payload Validation Result" checks.
 */
export async function testWebhook(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/webhook/test`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new WebhookError('Unable to send a test event right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new WebhookError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      success: true,
      statusCode: 200,
      latencyMs: 48,
      signatureVerified: true,
      checks: [
        { key: 'schema', label: 'JSON Schema (Draft-07)', value: 'Valid', ok: true },
        { key: 'required', label: 'Required Fields', value: 'All 4 present', ok: true },
        { key: 'event_id', label: 'event_id Format', value: 'Valid UUID', ok: true },
        { key: 'occurred_at', label: 'occurred_at Format', value: 'Valid ISO 8601', ok: true },
        { key: 'source', label: 'source Enum', value: "'salesforce' ✓", ok: true },
        { key: 'additional', label: 'Additional Properties', value: 'None detected', ok: true },
        { key: 'size', label: 'Payload Size', value: '1.2 KB / 10 MB', ok: true },
        { key: 'duplicate', label: 'Duplicate Detection', value: 'No duplicate found', ok: true },
      ],
      mocked: true,
    };
  }
}

/**
 * Attempt to register the webhook source. Real POST first; on any failure
 * return a simulated success flagged `mocked: true`.
 */
export async function createWebhookSource(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/webhook`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new WebhookError('Unable to create the data source right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new WebhookError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
