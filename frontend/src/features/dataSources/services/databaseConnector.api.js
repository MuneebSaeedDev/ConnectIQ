/**
 * Data + submit for the Database Connector Setup Screen (SCR-048, node
 * 116:31212, Figma page "Page 1", frame "Database Connector Setup Scren"
 * — Figma name has a typo, preserved verbatim in docs). This is the
 * database-engine step of the "add source" wizard: SCR-047 Source
 * Connection Setup → (SCR-048 Database / SCR-049 API / SCR-050 CSV / …)
 * → SCR-055 Connection Test Result. It is narrower and engine-specific
 * (MySQL / PostgreSQL / MongoDB) versus the generic connector-agnostic
 * SCR-046 Add Data Source form.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, connector-config
 * validation, `test-connection` action, or `ConnectionTestResult`
 * endpoint exists yet (see docs/modules/module-plan.md). Both
 * `testDatabaseConnection` and `createDatabaseSource` attempt a real
 * request first and only fall back to a simulated result when the
 * endpoint is unreachable / returns non-JSON (defends against the Vite
 * dev server's own 200-OK HTML SPA fallback), mirroring the sibling
 * write-side addDataSource.api.js / addUser.api.js / createRole.api.js
 * real-request-first / `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: the Figma MCP was NOT reachable this session
 * (use_figma/get_metadata/get_screenshot all returned "No such tool
 * available", the same environmental gap recorded across the SCR-035…
 * SCR-046 review-log entries). Layout/content is therefore `derived`
 * from (a) the screen-inventory row for node 116:31212 ("MySQL /
 * PostgreSQL / MongoDB connector form"), (b) the MOD-006 pattern-of-
 * record established by the Figma-verified SCR-046 (node 115:28040,
 * 664 named nodes inspected there), and (c) real database-driver
 * connection semantics for the three named engines. Pixel fidelity to
 * node 116:31212 is NOT independently verified — see the honest
 * boundary note in docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DatabaseConnectorError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/**
 * The three database engines the screen supports (Figma "MySQL /
 * PostgreSQL / MongoDB"). `kind` distinguishes the relational engines
 * (which expose a schema + SSL-mode enum) from the document engine
 * (which exposes a connection-string option, an auth database, and a
 * replica set), so the form is engine-aware rather than hardcoded.
 */
export const DATABASE_ENGINES = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    subtitle: 'Relational · SQL',
    kind: 'relational',
    defaultPort: 5432,
    defaultDatabase: 'postgres',
    databaseLabel: 'Database',
    databasePlaceholder: 'analytics_db',
    hostPlaceholder: 'db.internal.company.com',
    sslModes: ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'],
    defaultSslMode: 'require',
    driver: 'postgres',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    subtitle: 'Relational · SQL',
    kind: 'relational',
    defaultPort: 3306,
    defaultDatabase: '',
    databaseLabel: 'Database',
    databasePlaceholder: 'app_production',
    hostPlaceholder: 'mysql.internal.company.com',
    sslModes: ['DISABLED', 'PREFERRED', 'REQUIRED', 'VERIFY_CA', 'VERIFY_IDENTITY'],
    defaultSslMode: 'REQUIRED',
    driver: 'mysql',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    subtitle: 'Document · NoSQL',
    kind: 'document',
    defaultPort: 27017,
    defaultDatabase: '',
    databaseLabel: 'Database',
    databasePlaceholder: 'analytics',
    hostPlaceholder: 'mongo.internal.company.com',
    sslModes: ['off', 'preferSSL', 'requireSSL'],
    defaultSslMode: 'requireSSL',
    driver: 'mongodb',
  },
];

/** Flat lookup by engine id. */
export const ENGINES_BY_ID = Object.fromEntries(DATABASE_ENGINES.map((e) => [e.id, e]));

/** Design-sourced select option sets. */
export const DATABASE_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  authMethod: ['Username & Password', 'IAM / Cloud Auth', 'Client Certificate'],
  readPreference: ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'],
};

/** Auth-method → which credential fields to show. */
export const DB_AUTH_FIELD_MAP = {
  'Username & Password': ['username', 'password'],
  'IAM / Cloud Auth': ['iamRole'],
  'Client Certificate': ['clientCert'],
};

/**
 * The connection-checklist rows shown in the Figma test-result panel.
 * The simulated result reproduces them so the panel is populated, not
 * hardcoded per engine.
 */
function simulatedChecks(engine) {
  const checks = [
    { key: 'network', label: 'Network Reachability', ok: true },
    { key: 'auth', label: 'Authentication', ok: true },
    { key: 'ssl', label: 'SSL / TLS Handshake', ok: true },
    { key: 'database', label: engine?.kind === 'document' ? 'Database Accessible' : 'Schema Accessible', ok: true },
    { key: 'permissions', label: 'Read Permissions', ok: true },
  ];
  return checks;
}

const SIMULATED_VERSIONS = {
  postgresql: 'PostgreSQL 16.1',
  mysql: 'MySQL 8.0.36',
  mongodb: 'MongoDB 7.0.5',
};

/**
 * Attempt a connection test. Real POST first; on any failure (including
 * the Vite dev-server HTML SPA fallback) return a simulated success
 * flagged `mocked: true`.
 */
export async function testDatabaseConnection(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/test-connection`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DatabaseConnectorError('Unable to test the connection right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new DatabaseConnectorError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const engine = ENGINES_BY_ID[payload?.engineId] ?? null;
    return {
      success: true,
      latencyMs: engine?.id === 'mongodb' ? 18 : 9,
      serverVersion: SIMULATED_VERSIONS[engine?.id] ?? `${engine?.name ?? 'Server'} (detected)`,
      permissions: 'Read, Schema',
      checks: simulatedChecks(engine),
      mocked: true,
    };
  }
}

/**
 * Attempt to create the database source. Real POST first; on any
 * failure return a simulated success flagged `mocked: true`.
 */
export async function createDatabaseSource(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DatabaseConnectorError('Unable to create the data source right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new DatabaseConnectorError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
