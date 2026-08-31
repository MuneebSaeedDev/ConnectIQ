/**
 * Catalogue + navigation model for the Source Connection Setup Screen
 * (SCR-047, node 115:29580, Figma page "Page 1", frame "Source
 * Connection Setup Screen"). This screen is the connection-METHOD hub
 * that sits between the Add Data Source entry (SCR-046) and the
 * type-specific setup screens it feeds:
 *   Database (SCR-048), API (SCR-049), CSV (SCR-050), Excel (SCR-051),
 *   FTP (SCR-052), SFTP (SCR-053), Webhook (SCR-054).
 *
 * MOCK BOUNDARY: MOD-006 (Data Sources & Connectors) is still `PLANNED`
 * with no backend deployed (see docs/modules/module-plan.md) — there is
 * no source-CRUD, connector-config-validation, or test-connection
 * endpoint yet. The method catalogue below is DESIGN-SOURCED static
 * config (exactly like SCR-046's `CONNECTOR_GROUPS`), so it is exported
 * directly rather than fetched; there is no fabricated network call.
 * The per-type setup screens (SCR-048–SCR-054) are themselves still
 * `DISCOVERED`/not-routed, so each method's `Continue` action converges
 * on the real, working Add Data Source form (`/data-sources/new`,
 * SCR-046) — pre-selecting the mapped connector when one exists — rather
 * than linking to a screen that does not exist. That boundary is
 * disclosed on-screen (a "Sample data" badge + a "planned dedicated
 * setup" note per method).
 *
 * FIGMA VERIFICATION: node 115:29580 was NOT independently re-pulled in
 * this session (the Figma MCP read tools were unavailable), so pixel
 * fidelity is `not-verified` here. Layout/content follow the project's
 * established design language (docs/figma/design-system-notes.md) and
 * the connection-method taxonomy already transcribed from the sibling
 * Add Data Source frame (115:28040) into addDataSource.api.js. See
 * docs/reviews/review-log.md.
 */

import { CONNECTORS_BY_ID } from './addDataSource.api';

/** The real, working destination every method converges on today. */
export const ADD_DATA_SOURCE_ROUTE = '/data-sources/new';

/**
 * Method ids whose dedicated per-type setup screen is now built and
 * routed, so `Continue` can go straight there instead of converging on
 * the generic Add Data Source form. Grows as each SCR-048…SCR-054
 * screen ships.
 */
export const LIVE_METHOD_ROUTES = {
  database: '/data-sources/new/database',
  api: '/data-sources/new/api',
  csv: '/data-sources/new/csv',
  excel: '/data-sources/new/excel',
  ftp: '/data-sources/new/ftp',
  sftp: '/data-sources/new/sftp',
  webhook: '/data-sources/new/webhook',
};

/**
 * Connection methods, grouped as the Figma frame groups them. Each
 * method maps to its planned dedicated setup screen (`targetScreen` /
 * `targetRoute`, still PLANNED) and to the connector the Add Data
 * Source form should pre-select (`connectorId`, or `null` for the
 * file-upload methods that have no live connector kind yet).
 *
 * NOTE: `defaultPort` on each method is informational only — SCR-047
 * never reads it. The Add Data Source form seeds the real port from the
 * mapped connector in `CONNECTORS_BY_ID` after the handoff, so this field
 * documents the method's conventional port rather than driving any logic.
 */
export const CONNECTION_METHOD_GROUPS = [
  {
    group: 'Databases & Warehouses',
    methods: [
      {
        id: 'database',
        name: 'Database',
        subtitle: 'Relational & warehouse',
        description:
          'Connect to PostgreSQL, MySQL, SQL Server, Oracle, MariaDB, or a cloud warehouse (Snowflake, BigQuery, Redshift, Azure Synapse).',
        icon: 'database',
        connectorId: 'postgresql',
        defaultPort: 5432,
        requires: ['Host & port', 'Database name', 'Credentials'],
        targetScreen: 'SCR-048',
        targetRoute: '/data-sources/new/database',
      },
    ],
  },
  {
    group: 'APIs & Streaming',
    methods: [
      {
        id: 'api',
        name: 'REST API',
        subtitle: 'HTTP / SaaS / streaming',
        description:
          'Pull from a REST endpoint or SaaS connector (Salesforce, HubSpot) or subscribe to a streaming source such as Apache Kafka.',
        icon: 'api',
        connectorId: 'rest',
        defaultPort: 443,
        requires: ['Endpoint URL', 'Auth method', 'API credentials'],
        targetScreen: 'SCR-049',
        targetRoute: '/data-sources/new/api',
      },
    ],
  },
  {
    group: 'File Uploads',
    methods: [
      {
        id: 'csv',
        name: 'CSV Upload',
        subtitle: 'Delimited text file',
        description:
          'Upload a comma- or tab-delimited file. Choose delimiter, header row, and empty-value handling (skip empty rows / treat empty as null).',
        icon: 'file',
        connectorId: null,
        requires: ['CSV / TSV file', 'Delimiter', 'Header options'],
        targetScreen: 'SCR-050',
        targetRoute: '/data-sources/new/csv',
      },
      {
        id: 'excel',
        name: 'Excel Upload',
        subtitle: '.xlsx / .xls workbook',
        description:
          'Upload an Excel workbook and choose which worksheets to ingest, with empty-cell and empty-worksheet handling.',
        icon: 'file',
        connectorId: null,
        requires: ['Workbook file', 'Worksheet selection', 'Cell options'],
        targetScreen: 'SCR-051',
        targetRoute: '/data-sources/new/excel',
      },
    ],
  },
  {
    group: 'File Transfer',
    methods: [
      {
        id: 'ftp',
        name: 'FTP',
        subtitle: 'File Transfer Protocol',
        description:
          'Poll a remote FTP server for files on a schedule. Best for legacy exports where a secure transport is not available.',
        icon: 'transfer',
        connectorId: null,
        defaultPort: 21,
        requires: ['Host & port', 'Path / glob', 'Credentials'],
        targetScreen: 'SCR-052',
        targetRoute: '/data-sources/new/ftp',
      },
      {
        id: 'sftp',
        name: 'SFTP',
        subtitle: 'SSH File Transfer',
        description:
          'Poll a remote SFTP server over an encrypted SSH channel. Preferred over plain FTP for any sensitive data.',
        icon: 'transfer',
        connectorId: 'sftp',
        defaultPort: 22,
        requires: ['Host & port', 'Path / glob', 'Key or password'],
        targetScreen: 'SCR-053',
        targetRoute: '/data-sources/new/sftp',
      },
    ],
  },
  {
    group: 'Event-driven',
    methods: [
      {
        id: 'webhook',
        name: 'Webhook',
        subtitle: 'Inbound HTTP events',
        description:
          'Receive data pushed to a generated inbound endpoint. The source posts events to ConnectIQ as they happen — no polling.',
        icon: 'webhook',
        connectorId: 'rest',
        defaultPort: 443,
        requires: ['Generated endpoint', 'Signing secret', 'Event schema'],
        targetScreen: 'SCR-054',
        targetRoute: '/data-sources/new/webhook',
      },
    ],
  },
];

/** Flat lookup by method id. */
export const METHODS_BY_ID = Object.fromEntries(
  CONNECTION_METHOD_GROUPS.flatMap((g) => g.methods.map((m) => [m.id, m])),
);

/** Flat method-id order for radiogroup roving focus / arrow-key nav. */
export const METHOD_ORDER = CONNECTION_METHOD_GROUPS.flatMap((g) => g.methods.map((m) => m.id));

/**
 * The guided steps this wizard sits at the front of. Step 1 (choose a
 * connection method) is what SCR-047 owns; the later steps happen on
 * the Add Data Source form / planned per-type screens.
 */
export const SETUP_STEPS = [
  { key: 'method', label: 'Choose method' },
  { key: 'configure', label: 'Configure connection' },
  { key: 'test', label: 'Test & discover' },
  { key: 'create', label: 'Create source' },
];

/**
 * Resolve where `Continue` should take the user for a chosen method.
 * Methods whose dedicated per-type screen is built (see
 * `LIVE_METHOD_ROUTES`) route straight to it; the rest still converge on
 * the real Add Data Source form (SCR-046) with the mapped connector
 * pre-selected. The planned per-type route is always returned too so the
 * UI can name the destination honestly.
 */
export function resolveContinueTarget(methodId) {
  const method = METHODS_BY_ID[methodId] ?? null;
  if (!method) return null;
  const connector = method.connectorId ? CONNECTORS_BY_ID[method.connectorId] ?? null : null;
  const liveRoute = LIVE_METHOD_ROUTES[methodId] ?? null;
  return {
    route: liveRoute ?? ADD_DATA_SOURCE_ROUTE,
    connectorId: connector?.id ?? null,
    connectorName: connector?.name ?? null,
    plannedScreen: method.targetScreen,
    plannedRoute: method.targetRoute,
    live: !!liveRoute,
  };
}
