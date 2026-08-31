/**
 * Data + submit for the FTP Connection Screen (SCR-052, node 121:39854,
 * Figma page "Page 1", frame "FTP Connection Screen"). This is the
 * file-transfer step of the "add source" wizard: SCR-047 Source
 * Connection Setup → (SCR-048 Database / SCR-049 API / … / SCR-052 FTP /
 * SCR-053 SFTP …) → SCR-055 Connection Test Result. Despite the "FTP"
 * name, the Figma frame is protocol-aware: its default active state is
 * SFTP (SSH), and it also supports FTP, FTPS Explicit, and FTPS Implicit
 * — so this module models all four transports, each with its own default
 * port, transport security, and auth-method set.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, connector-config
 * validation, `test-connection` action, directory-browse, or
 * `ConnectionTestResult` endpoint exists yet (see
 * docs/modules/module-plan.md). `testFtpConnection`, `browseDirectories`,
 * and `createFtpSource` each attempt a real request first and only fall
 * back to a simulated result when the endpoint is unreachable / returns
 * non-JSON (defends against the Vite dev server's own 200-OK HTML SPA
 * fallback), mirroring the sibling databaseConnector.api.js /
 * apiConnectorSetup.api.js / addDataSource.api.js real-request-first /
 * `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 121:39854 WAS inspected this session
 * (get_metadata over 1287 named nodes + get_screenshot both succeeded),
 * unlike the SCR-048/049 sessions where the Figma read tools were
 * unavailable. Content (protocol names/subtitles, section titles,
 * field labels, auth methods, security toggles, default SFTP example
 * acme-sftp-prod → sftp.acme-partners.com:22) is transcribed from that
 * inspection. See docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class FtpConnectionError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/**
 * The four file-transfer protocols the screen supports. `secure`
 * distinguishes plain FTP from the encrypted transports; `ssh` marks the
 * SSH-based transport (SFTP) for which transfer-mode (Active/Passive) is
 * N/A and SSH-key auth methods apply. `defaultPort` seeds the port field
 * on protocol change.
 */
export const FTP_PROTOCOLS = [
  {
    id: 'ftp',
    name: 'FTP',
    subtitle: 'Insecure',
    description: 'Unencrypted. Not recommended for enterprise use.',
    secure: false,
    ssh: false,
    defaultPort: 21,
  },
  {
    id: 'ftps-explicit',
    name: 'FTPS Explicit',
    subtitle: 'Secure',
    description: 'Explicit TLS upgrade on the standard FTP port (21). Secure.',
    secure: true,
    ssh: false,
    defaultPort: 21,
  },
  {
    id: 'ftps-implicit',
    name: 'FTPS Implicit',
    subtitle: 'Secure',
    description: 'Implicit TLS on a dedicated port (990). Secure.',
    secure: true,
    ssh: false,
    defaultPort: 990,
  },
  {
    id: 'sftp',
    name: 'SFTP (SSH)',
    subtitle: 'Recommended',
    description: 'SSH-based file transfer protocol. Enterprise standard.',
    secure: true,
    ssh: true,
    defaultPort: 22,
  },
];

/** Flat lookup by protocol id. */
export const PROTOCOLS_BY_ID = Object.fromEntries(FTP_PROTOCOLS.map((p) => [p.id, p]));

/** Design-sourced select option sets. */
export const FTP_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  keyFormat: ['OpenSSH', 'PEM (PKCS#8)', 'PPK (PuTTY)', 'RFC 4716'],
  overwritePolicy: ['Skip Existing', 'Overwrite', 'Rename (append timestamp)', 'Fail on Conflict'],
  fileEncoding: ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII', 'Auto-detect'],
  transferDirection: ['Download', 'Upload', 'Bi-directional Sync'],
};

/**
 * Auth methods available per transport. SSH transports (SFTP) expose
 * key-based methods; the FTP/FTPS transports authenticate with a
 * username & password (or an X.509 client certificate for FTPS). This is
 * a function, not a static map, because the valid set depends on whether
 * the selected protocol is SSH-based.
 */
export function authMethodsFor(protocolId) {
  const protocol = PROTOCOLS_BY_ID[protocolId] ?? null;
  if (protocol?.ssh) {
    return ['SSH Private Key', 'SSH Key + Passphrase', 'Public Key Auth', 'Username & Password'];
  }
  if (protocol?.secure) {
    return ['Username & Password', 'Certificate Auth'];
  }
  return ['Username & Password'];
}

/** Auth-method → which credential fields to show. */
export const FTP_AUTH_FIELD_MAP = {
  'Username & Password': ['username', 'password'],
  'SSH Private Key': ['username', 'privateKey'],
  'SSH Key + Passphrase': ['username', 'privateKey', 'passphrase'],
  'Public Key Auth': ['username', 'privateKey', 'publicKeyFingerprint'],
  'Certificate Auth': ['username', 'clientCert'],
};

/**
 * The connection-checklist rows shown in the Figma test-result panel.
 * The simulated result reproduces them so the panel is populated, not
 * hardcoded per protocol.
 */
function simulatedChecks(protocol) {
  return [
    { key: 'reachable', label: 'Server Reachable', ok: true },
    { key: 'auth', label: 'Authentication Successful', ok: true },
    { key: 'security', label: protocol?.ssh ? 'Host Key Verified' : 'TLS Handshake', ok: true },
    { key: 'directory', label: 'Directory Accessible', ok: true },
    { key: 'permissions', label: 'Transfer Permissions Verified', ok: true },
  ];
}

const SIMULATED_SERVER = {
  sftp: { software: 'OpenSSH 9.2', protocolVersion: 'SSH-2.0', hostKey: 'RSA-4096 / SHA-256', encryption: 'AES-256-GCM' },
  ftp: { software: 'vsftpd 3.0.5', protocolVersion: 'FTP', hostKey: null, encryption: 'None' },
  'ftps-explicit': { software: 'vsftpd 3.0.5', protocolVersion: 'FTP + TLS', hostKey: null, encryption: 'TLS 1.3' },
  'ftps-implicit': { software: 'FileZilla Server 1.7', protocolVersion: 'FTP + TLS', hostKey: null, encryption: 'TLS 1.3' },
};

/**
 * Attempt a connection test. Real POST first; on any failure (including
 * the Vite dev-server HTML SPA fallback) return a simulated success
 * flagged `mocked: true`.
 */
export async function testFtpConnection(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/ftp/test-connection`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new FtpConnectionError('Unable to test the connection right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new FtpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const protocol = PROTOCOLS_BY_ID[payload?.protocolId] ?? null;
    const server = SIMULATED_SERVER[protocol?.id] ?? SIMULATED_SERVER.sftp;
    return {
      success: true,
      latencyMs: 124,
      networkLatencyMs: 38,
      transferSpeed: '48.2 MB/s',
      server,
      checks: simulatedChecks(protocol),
      mocked: true,
    };
  }
}

/**
 * Attempt to browse the remote directory tree. Real GET first; on any
 * failure return a simulated tree flagged `mocked: true` — the Figma
 * "Directory Discovery" panel content.
 */
export async function browseDirectories(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/ftp/browse`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new FtpConnectionError('Unable to browse directories right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.entries)) {
      throw new FtpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      entries: [
        { path: '/data/inbound/etl', label: 'etl', files: 12, dirs: 4 },
        { path: '/data/inbound/staging', label: 'staging', files: 6, dirs: 0 },
        { path: '/data/raw', label: 'raw', files: 0, dirs: 2 },
        { path: '/data/archive', label: 'archive', files: 0, dirs: 1 },
        { path: '/outbound', label: 'outbound', files: 0, dirs: 1 },
        { path: '/tmp', label: 'tmp', files: 3, dirs: 0 },
      ],
      mocked: true,
    };
  }
}

/**
 * Attempt to create the FTP source. Real POST first; on any failure
 * return a simulated success flagged `mocked: true`.
 */
export async function createFtpSource(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/ftp`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new FtpConnectionError('Unable to create the data source right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new FtpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
