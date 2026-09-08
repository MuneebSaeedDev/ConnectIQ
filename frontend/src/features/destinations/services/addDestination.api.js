// For MOCK BOUNDARY
export const ORG_ID = 'current';

export class DestinationError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = 'DestinationError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Validates a destination payload strictly.
 * Modeled after AddDataSource validation logic but adapted for this mockup.
 */
export function validateDestination(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Destination name is required';
  } else if (!/^[A-Za-z0-9][A-Za-z0-9\s-_]{0,62}$/.test(form.name)) {
    errors.name = 'Invalid name format';
  }

  if (form.destinationType === 'Snowflake') {
    if (!form.account?.trim()) errors.account = 'Account identifier is required';
    if (!form.warehouse?.trim()) errors.warehouse = 'Warehouse is required';
    if (!form.database?.trim()) errors.database = 'Target database is required';
    if (!form.schema?.trim()) errors.schema = 'Target schema is required';
  }

  if (form.authMethod === 'Username & Password') {
    if (!form.username?.trim()) errors.username = 'Username is required';
    if (!form.password) errors.password = 'Password is required';
  }

  const timeout = Number(form.connectionTimeout);
  if (isNaN(timeout) || timeout < 1) errors.connectionTimeout = 'Must be greater than 0';

  const batchSize = Number(form.batchSize);
  if (isNaN(batchSize) || batchSize < 1) errors.batchSize = 'Must be greater than 0';

  const retries = Number(form.retryAttempts);
  if (isNaN(retries) || retries < 0) errors.retryAttempts = 'Cannot be negative';

  const retryInterval = Number(form.retryInterval);
  if (isNaN(retryInterval) || retryInterval < 0) errors.retryInterval = 'Cannot be negative';

  const parallel = Number(form.parallelWrites);
  if (isNaN(parallel) || parallel < 1) errors.parallelWrites = 'Minimum 1 thread required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a connection for testing specifically (subset of full validation).
 */
export function validateTestConnection(form) {
  const errors = {};

  if (form.destinationType === 'Snowflake') {
    if (!form.account?.trim()) errors.account = 'Account identifier is required';
    if (!form.warehouse?.trim()) errors.warehouse = 'Warehouse is required';
    if (!form.database?.trim()) errors.database = 'Target database is required';
  }

  if (form.authMethod === 'Username & Password') {
    if (!form.username?.trim()) errors.username = 'Username is required';
    if (!form.password) errors.password = 'Password is required';
  }

  return {
    isReady: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * ---------------------------------------------------------------------------
 * MOCK ENDPOINTS (Vite SPA HTML-fallback defended via standard project guards)
 * ---------------------------------------------------------------------------
 */

export async function testConnection(form) {
  /*
    * FIGMA VERIFICATION
    * "Connection Status" check states are derived directly from the design text (e.g. "Run a connection test to validate configuration" / "Not Tested")
    */
  console.log(`[TEST] Testing ${form.destinationType} connection to ${form.account}...`);

  // Simulate network delay based on environment
  await new Promise((r) => setTimeout(r, form.environment === 'Production' ? 800 : 400));

  const { isReady, errors } = validateTestConnection(form);
  if (!isReady) {
    throw new DestinationError('Missing required connection parameters', 400, errors);
  }

  // Mock failure states for demo purposes if account starts with 'fail'
  if (form.account?.toLowerCase().startsWith('fail')) {
    return {
      success: false,
      message: 'Failed to authenticate with destination system. Invalid credentials or IP blocked.',
      latencyMs: 1402,
      checks: { network: true, auth: false, permissions: false }
    };
  }

  return {
    success: true,
    message: 'Connection successful',
    latencyMs: 341,
    environmentName: 'prod-east',
    version: '7.34.1',
    checks: {
       network: true,
       auth: true,
       permissions: true
    },
    mocked: true,
  };
}

export async function createDestination(form) {
  console.log(`[POST /organizations/${ORG_ID}/destinations]`, form);

  await new Promise((r) => setTimeout(r, 600));

  const { isValid, errors } = validateDestination(form);
  if (!isValid) {
    throw new DestinationError('Validation failed', 400, errors);
  }

  return {
    id: `dest_${Date.now().toString(36)}`,
    ...form,
    status: 'Connected',
    createdAt: new Date().toISOString(),
    mocked: true,
  };
}
