/**
 * Data + submit for the SFTP Connection Screen (SCR-053, node 122:41785,
 * Figma page "Page 1", frame "SFTP Connection Screen"). This is the
 * SSH-based file-transfer step of the "add source" wizard: SCR-047
 * Source Connection Setup → SCR-053 SFTP → SCR-055 Connection Test
 * Result. Unlike the protocol-agnostic SCR-052 FTP screen (which offers
 * FTP/FTPS/SFTP transports in a radiogroup), this screen is SFTP-only:
 * the transport is a fixed, always-encrypted SSH-2.0 channel, so the UI
 * drops the transport picker and instead surfaces SSH-specific concerns
 * — host-key verification, known-hosts policy, negotiated cipher suite,
 * key-source (vault), and SSH session diagnostics.
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed — no `DataSource` entity, connector-config
 * validation, `test-connection` action, directory-browse, or
 * `ConnectionTestResult` endpoint exists yet (see
 * docs/modules/module-plan.md). `testSftpConnection`,
 * `browseSftpDirectories`, and `createSftpSource` each attempt a real
 * request first and only fall back to a simulated result when the
 * endpoint is unreachable / returns non-JSON (defends against the Vite
 * dev server's own 200-OK HTML SPA fallback), mirroring the sibling
 * ftpConnection.api.js / databaseConnector.api.js real-request-first /
 * `mocked: true` patterns.
 *
 * FIGMA VERIFICATION: node 122:41785 WAS inspected this session
 * (get_metadata / get_design_context over the full frame +
 * get_screenshot both succeeded). Content (section titles, field
 * labels, auth methods, key algorithms/formats, security toggles,
 * negotiated-algorithm-suite rows, and the default GlobalBank example
 * etl-sftp-globalbank → sftp.globalbank-exchange.com:22) is transcribed
 * from that inspection. See docs/reviews/review-log.md.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class SftpConnectionError extends Error {}

/** Scope this source to the caller's organization (see addDataSource.api.js). */
export const ORG_ID = 'current';

/** Fixed transport metadata — SFTP is always SSH-2.0 and encrypted. */
export const SFTP_TRANSPORT = {
  id: 'sftp',
  name: 'SFTP (SSH)',
  protocol: 'SSH-2.0',
  defaultPort: 22,
  secure: true,
};

/** Design-sourced select option sets. */
export const SFTP_OPTIONS = {
  environment: ['Production', 'Staging', 'Development', 'Sandbox'],
  connectionProfile: ['High-Security Profile', 'Standard Profile', 'Legacy Compatibility', 'Custom Profile'],
  keyAlgorithm: ['ed25519', 'ecdsa-nistp256', 'ecdsa-nistp384', 'rsa-4096', 'rsa-2048'],
  keyFormat: ['OpenSSH', 'PEM', 'PKCS#8', 'PPK (PuTTY)', 'RFC 4716'],
  keySource: ['Enterprise Vault (Active)', 'Uploaded Key', 'Inline Key Material'],
  overwritePolicy: ['Skip Existing', 'Overwrite', 'Rename (append timestamp)', 'Fail on Conflict'],
  fileEncoding: ['Auto-detect', 'UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII'],
  sortOrder: ['Modified Descending (Newest First)', 'Modified Ascending (Oldest First)', 'Name (A→Z)', 'Name (Z→A)', 'Size Descending'],
  scheduleFrequency: ['Daily', 'Hourly', 'Every 15 minutes', 'Weekly', 'Custom (cron)'],
  retryStrategy: ['Exponential Backoff', 'Fixed Delay', 'Linear Backoff'],
  timezone: ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore'],
};

/** The SSH auth methods the screen offers (SFTP is SSH-only). */
export const SFTP_AUTH_METHODS = [
  'Username & Password',
  'SSH Private Key',
  'SSH Key + Passphrase',
  'Public/Private Pair',
];

/** Auth-method → which credential fields to show. */
export const SFTP_AUTH_FIELD_MAP = {
  'Username & Password': ['username', 'password'],
  'SSH Private Key': ['username', 'privateKey'],
  'SSH Key + Passphrase': ['username', 'privateKey', 'passphrase'],
  'Public/Private Pair': ['username', 'privateKey', 'publicKeyFingerprint'],
};

/** Trigger types for scheduling. */
export const SFTP_TRIGGER_TYPES = ['Manual', 'Scheduled', 'Event Triggered', 'Pipeline Trigger'];

/**
 * Negotiated SSH algorithm suite shown in the SSH Security section. This
 * is the connection's cryptographic profile — populated from a live test
 * where available, otherwise from this design-sourced default.
 */
export const NEGOTIATED_SUITE = [
  { key: 'kex', type: 'Key Exchange (KEX)', negotiated: 'curve25519-sha256', policy: 'Modern (Auto)', grade: 'A+' },
  { key: 'hostkey', type: 'Host Key', negotiated: 'ed25519 / ECDSA', policy: 'Modern (Auto)', grade: 'A+' },
  { key: 'cipher-cs', type: 'Cipher (C→S)', negotiated: 'chacha20-poly1305@openssh', policy: 'Modern (Auto)', grade: 'A+' },
  { key: 'cipher-sc', type: 'Cipher (S→C)', negotiated: 'chacha20-poly1305@openssh', policy: 'Modern (Auto)', grade: 'A+' },
  { key: 'mac-cs', type: 'MAC (C→S)', negotiated: 'hmac-sha2-256-etm@openssh', policy: 'ETM Mode', grade: 'A' },
  { key: 'mac-sc', type: 'MAC (S→C)', negotiated: 'hmac-sha2-256-etm@openssh', policy: 'ETM Mode', grade: 'A' },
  { key: 'compression', type: 'Compression', negotiated: 'none', policy: 'Disabled', grade: '—' },
];

/* Connection-checklist rows shown in the test-result panel + right rail. */
function simulatedChecks() {
  return [
    { key: 'reachable', label: 'Server Reachable', ok: true },
    { key: 'handshake', label: 'SSH Handshake Successful', ok: true },
    { key: 'hostkey', label: 'Host Key Verified', ok: true },
    { key: 'auth', label: 'Authentication Successful', ok: true },
    { key: 'directory', label: 'Directory Accessible', ok: true },
    { key: 'read', label: 'Read Permission Verified', ok: true },
    { key: 'write', label: 'Write Permission Verified', ok: false },
  ];
}

const SIMULATED_SERVER = {
  software: 'OpenSSH_9.4p1 Ubuntu-3ubuntu3',
  protocolVersion: 'SSH-2.0',
  hostKeyType: 'ed25519',
  hostKey: 'SHA256:Zq9pKLr4mXbVfD8nY2jWh6oAuEsGcT1dMiNn5PeB7qH',
  encryption: 'chacha20-poly1305@openssh',
  kex: 'curve25519-sha256',
  mac: 'hmac-sha2-256-etm@openssh',
  authMethod: 'publickey (ed25519)',
  resolvedIp: '203.0.113.211',
  serverOs: 'Ubuntu 22.04 LTS',
};

/**
 * Attempt an SFTP connection test. Real POST first; on any failure
 * (including the Vite dev-server HTML SPA fallback) return a simulated
 * success flagged `mocked: true`.
 */
export async function testSftpConnection(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/sftp/test-connection`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SftpConnectionError('Unable to test the connection right now.');
    }
    const data = await readJson(res);
    if (!data || typeof data.success !== 'boolean') {
      throw new SftpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      success: true,
      latencyMs: 87,
      networkLatencyMs: 24,
      sessionDuration: '00:04:38',
      transferSpeed: '61.4 MB/s',
      transferSuccessRate: '99.98%',
      filesToday: 23,
      server: SIMULATED_SERVER,
      suite: NEGOTIATED_SUITE,
      checks: simulatedChecks(),
      mocked: true,
    };
  }
}

/**
 * Attempt to browse the remote directory tree. Real POST first; on any
 * failure return a simulated tree flagged `mocked: true` — the Figma
 * "Directory Discovery" panel content.
 */
export async function browseSftpDirectories(orgId, payload) {
  try {
    const res = await apiFetch(
      `/organizations/${encodeURIComponent(orgId)}/data-sources/sftp/browse`,
      { method: 'POST', body: payload },
    );
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SftpConnectionError('Unable to browse directories right now.');
    }
    const data = await readJson(res);
    if (!data || !Array.isArray(data.entries)) {
      throw new SftpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return {
      entries: [
        { path: '/data/exchange/etl', label: 'etl', files: 8, dirs: 3, access: true },
        { path: '/data/exchange/etl/inbound', label: 'inbound', files: 23, dirs: 0, access: true },
        { path: '/data/exchange/etl/outbound', label: 'outbound', files: 7, dirs: 0, access: true },
        { path: '/data/exchange/etl/archive', label: 'archive', files: 0, dirs: 12, access: true },
        { path: '/data/exchange/settlement', label: 'settlement', files: 0, dirs: 2, access: true },
        { path: '/data/exchange/compliance', label: 'compliance', files: 0, dirs: 0, access: true },
        { path: '/data/exchange/logs', label: 'logs', files: 44, dirs: 0, access: false },
        { path: '/tmp', label: 'tmp', files: 2, dirs: 0, access: true },
      ],
      storage: { used: '841 GB', total: '4 TB' },
      lastSync: '2024-01-15 · 06:00 UTC',
      mocked: true,
    };
  }
}

/**
 * Sample pattern-match preview rows for the File Discovery Rules
 * section. Design-sourced; in a live environment these come from the
 * remote directory listing filtered by the glob/regex.
 */
export const SAMPLE_MATCHES = [
  { name: 'settlement_20240115.csv', size: '18.2 MB', modified: '2024-01-15 · 06:02 UTC', matched: true },
  { name: 'transactions_daily.json', size: '42.7 MB', modified: '2024-01-15 · 05:44 UTC', matched: true },
  { name: 'compliance_report.xml', size: '6.1 MB', modified: '2024-01-15 · 05:40 UTC', matched: true },
  { name: 'fx_rates_20240115.csv', size: '312 KB', modified: '2024-01-15 · 05:30 UTC', matched: true },
  { name: 'account_balances.csv.gz', size: '88.4 MB', modified: '2024-01-14 · 23:00 UTC', matched: true },
];

/**
 * Attempt to create the SFTP source. Real POST first; on any failure
 * return a simulated success flagged `mocked: true`.
 */
export async function createSftpSource(orgId, payload) {
  try {
    const res = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/data-sources/sftp`, {
      method: 'POST',
      body: payload,
    });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new SftpConnectionError('Unable to create the data source right now.');
    }
    const data = await readJson(res);
    if (!data || !data.id) {
      throw new SftpConnectionError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    const id = `ds_${Math.random().toString(36).slice(2, 10)}`;
    return { id, status: 'active', name: payload?.general?.name ?? null, mocked: true };
  }
}
