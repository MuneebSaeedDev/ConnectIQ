import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Database,
  Download,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Snowflake,
  Terminal,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import AppShell from '../../shell/components/AppShell';
import { useDestinationConnectionTest } from '../hooks/useDestinationConnectionTest';
import {
  TEST_MODES,
  buildDiagnosticsExportText,
} from '../services/destinationConnectionTest.api';

// Helper for status badge styling
function StatusBadge({ status }) {
  if (status === 'passed' || status === 'SUCCESS') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success bg-success-bg px-2.5 py-0.5 text-token-xs font-medium text-success-strong">
        <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
        Passed
      </span>
    );
  }
  if (status === 'warning' || status === 'WARN') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning bg-warning-bg px-2.5 py-0.5 text-token-xs font-medium text-warning-strong">
        <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
        Warning
      </span>
    );
  }
  if (status === 'failed' || status === 'ERROR') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-border bg-danger-bg px-2.5 py-0.5 text-token-xs font-medium text-danger-strong">
        <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-token-xs font-medium text-text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-text-faint"></span>
      Not Tested
    </span>
  );
}

// Interactive Toggle Switch
function Toggle({ id, checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-token-sm font-medium text-text-primary cursor-pointer">
          {label}
        </label>
        {description && <p className="text-token-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          checked ? 'bg-primary' : 'bg-surface-muted'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface-card shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function DestinationConnectionTestScreen() {
  const navigate = useNavigate();
  const {
    destination,
    config,
    testStatus,
    activeStepIndex,
    progressPercent,
    result,
    error,
    isSaving,
    saveSuccess,
    updateConfig,
    toggleConfig,
    startTest,
    cancelTest,
    resetTest,
    saveDestination,
  } = useDestinationConnectionTest();

  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyDiagnostics = () => {
    const text = buildDiagnosticsExportText(destination, config, result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportReport = () => {
    const text = buildDiagnosticsExportText(destination, config, result);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `destination-test-${destination.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveAndContinue = async () => {
    try {
      await saveDestination();
      setTimeout(() => {
        navigate('/destinations');
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Destinations', 'Connection Validation', 'Connection Test Result']}>
      <div className="flex flex-col gap-6 pb-24">
        {/* Screen Reader Live Region for Async Test Progress & Status */}
        <span className="sr-only" role="status" aria-live="polite">
          {testStatus === 'running'
            ? `Testing destination connection: ${progressPercent}% complete, checkpoint ${activeStepIndex + 1} of 7.`
            : testStatus === 'completed'
            ? `Connection test completed successfully. ${result?.checksPassed || 0} of ${result?.checksTotal || 0} validation checks passed.`
            : testStatus === 'failed'
            ? `Connection test failed: ${error || 'Unknown error'}`
            : ''}
        </span>

        {/* Mock disclosure alert banner if mocked */}
        {result?.mocked && (
          <div
            role="note"
            className="flex items-center justify-between rounded-lg border border-warning bg-warning-bg px-4 py-3 text-token-sm text-warning-strong"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <span>
                <strong>Sample Test Data:</strong> MOD-007 Destinations test daemon is operating under simulated mock contracts. Results reflect design node 130:2662.
              </span>
            </div>
            <span className="rounded bg-surface-card px-2 py-0.5 text-token-xs font-semibold text-text-primary shadow-sm">
              MOCK PREVIEW
            </span>
          </div>
        )}

        {/* 1. TOP HEADER & METADATA BAR */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/destinations/new')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-card text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors focus-visible:outline-primary"
                title="Back to Add Destination"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-token-xl font-semibold text-text-primary">Destination Connection Test</h1>
                  {testStatus === 'completed' ? (
                    <StatusBadge status="passed" />
                  ) : testStatus === 'failed' ? (
                    <StatusBadge status="failed" />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-token-xs font-medium text-text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-faint"></span>
                      Not Tested
                    </span>
                  )}
                </div>
                <p className="mt-1 text-token-sm text-text-muted">
                  Validate connectivity, authentication, schema integrity, and write permissions for {destination.name}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyDiagnostics}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary transition-colors shadow-sm"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-text-muted" />}
                <span>{copied ? 'Copied' : 'Copy Diagnostics'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 text-text-muted" />
                <span>Export Report</span>
              </button>
              {testStatus === 'completed' ? (
                <button
                  type="button"
                  onClick={startTest}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3.5 py-2 text-token-sm font-medium text-text-primary hover:bg-surface-hover transition-colors shadow-sm"
                >
                  <RotateCcw className="h-4 w-4 text-text-muted" />
                  <span>Re-test Connection</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Metadata Strip */}
          <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Destination</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary truncate">{destination.name}</p>
            </div>
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Type</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5 text-primary" />
                {destination.type}
              </p>
            </div>
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Environment</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary">{destination.environment}</p>
            </div>
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Auth Method</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary truncate">{destination.authMethod}</p>
            </div>
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Last Tested</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary">{destination.lastTested}</p>
            </div>
            <div>
              <span className="text-token-xs font-medium text-text-faint uppercase tracking-wider">Config Version</span>
              <p className="mt-0.5 text-token-sm font-medium text-text-primary font-mono">{destination.configVersion}</p>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN LAYOUT: Content (Left) + Rail (Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT 8 COLS */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* 2. TEST CONFIGURATION CARD */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-token-base font-semibold text-text-primary">Test Configuration</h2>
                    <p className="text-token-xs text-text-muted">Configure connection parameters and validation depth</p>
                  </div>
                </div>
                <span className="rounded bg-surface-muted px-2.5 py-1 text-token-xs font-medium text-text-muted">
                  Pre-flight Options
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-5">
                {/* Mode Selector */}
                <div>
                  <label className="text-token-sm font-medium text-text-primary">Test Mode</label>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {TEST_MODES.map((mode) => {
                      const isSelected = config.mode === mode.id;
                      return (
                        <button
                          type="button"
                          key={mode.id}
                          aria-pressed={isSelected}
                          onClick={() => updateConfig('mode', mode.id)}
                          className={`flex flex-col text-left rounded-xl border p-4 transition-all duration-150 ${
                            isSelected
                              ? 'border-primary bg-shell-accent-wash/20 ring-1 ring-primary'
                              : 'border-border bg-surface-card hover:border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-token-sm font-semibold text-text-primary">{mode.name}</span>
                            <span className="text-token-xs font-mono text-primary font-medium">{mode.estimatedSeconds}</span>
                          </div>
                          <p className="mt-1 text-token-xs text-text-muted leading-relaxed">{mode.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Fields: Timeout & Retries */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="timeoutSeconds" className="text-token-sm font-medium text-text-primary">
                      Connection Timeout (seconds)
                    </label>
                    <input
                      id="timeoutSeconds"
                      type="number"
                      min="5"
                      max="120"
                      value={config.timeoutSeconds}
                      onChange={(e) => updateConfig('timeoutSeconds', Number(e.target.value))}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary focus-visible:outline-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="retryAttempts" className="text-token-sm font-medium text-text-primary">
                      Retry Attempts on Timeout
                    </label>
                    <input
                      id="retryAttempts"
                      type="number"
                      min="0"
                      max="5"
                      value={config.retryAttempts}
                      onChange={(e) => updateConfig('retryAttempts', Number(e.target.value))}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary focus-visible:outline-primary"
                    />
                  </div>
                </div>

                {/* Validation Toggles List */}
                <div className="flex flex-col divide-y divide-border-muted border-t border-border-subtle pt-2">
                  <Toggle
                    id="verifyWritePermissions"
                    checked={config.verifyWritePermissions}
                    onChange={() => toggleConfig('verifyWritePermissions')}
                    label="Verify Write Permissions (DDL/DML)"
                    description="Checks INSERT, UPDATE, DELETE, and CREATE TABLE privileges on target schema"
                  />
                  <Toggle
                    id="validateSchema"
                    checked={config.validateSchema}
                    onChange={() => toggleConfig('validateSchema')}
                    label="Validate Database & Schema"
                    description="Confirms the target database and schema exist and are accessible"
                  />
                  <Toggle
                    id="verifySslCertificate"
                    checked={config.verifySslCertificate}
                    onChange={() => toggleConfig('verifySslCertificate')}
                    label="Verify SSL/TLS Certificate"
                    description="Validates certificate authority chain and expiration date"
                  />
                  <Toggle
                    id="performSampleWrite"
                    checked={config.performSampleWrite}
                    onChange={() => toggleConfig('performSampleWrite')}
                    label="Perform Sample Write & Rollback"
                    description="Inserts a temporary row to test write speed and rollback behavior"
                  />
                </div>

                {/* Primary Action Buttons in Config Card */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                  <span className="text-token-xs text-text-faint">
                    {testStatus === 'running'
                      ? 'Test in progress, please wait...'
                      : testStatus === 'completed'
                      ? 'Test completed. Adjust settings above to re-run.'
                      : 'Click Run Connection Test to execute validation steps.'}
                  </span>
                  <div className="flex items-center gap-3">
                    {testStatus === 'running' ? (
                      <button
                        type="button"
                        onClick={cancelTest}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-2 text-token-sm font-medium text-text-muted hover:bg-surface-hover"
                      >
                        Cancel
                      </button>
                    ) : testStatus === 'completed' ? (
                      <button
                        type="button"
                        onClick={resetTest}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-2 text-token-sm font-medium text-text-muted hover:bg-surface-hover"
                      >
                        Reset Options
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={startTest}
                      disabled={testStatus === 'running'}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-token-sm font-semibold text-text-on-primary hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testStatus === 'running' ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Testing ({progressPercent}%)</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" />
                          <span>Run Connection Test</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE TEST PROGRESS BAR (When Running) */}
            {testStatus === 'running' && (
              <div className="rounded-xl border border-primary/30 bg-shell-accent-wash/10 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-5 w-5 animate-pulse text-primary" />
                    <span className="text-token-sm font-semibold text-text-primary">
                      Executing Validation Checks...
                    </span>
                  </div>
                  <span className="text-token-sm font-mono font-medium text-primary">{progressPercent}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Connection validation progress"
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-token-xs text-text-muted">
                  Running active checkpoint {activeStepIndex + 1} of 7...
                </p>
              </div>
            )}

            {/* FAILURE ALERT BANNER (When Failed) */}
            {testStatus === 'failed' && (
              <div role="alert" className="rounded-xl border border-danger-border bg-danger-bg p-6 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger text-text-on-primary">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-token-base font-semibold text-danger-strong">
                        Connection Validation Failed
                      </h3>
                      <button
                        type="button"
                        onClick={startTest}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-danger-border bg-surface-card px-3 py-1 text-token-xs font-semibold text-danger-strong hover:bg-surface-hover transition-colors shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Retry Test</span>
                      </button>
                    </div>
                    <p className="mt-1 text-token-sm text-text-secondary-alt leading-relaxed">
                      {error || 'Unable to establish a secure connection to the destination endpoint. Please verify your network reachability, firewall rules, and authentication credentials.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SUCCESS STATUS BANNER (When Completed) */}
            {testStatus === 'completed' && result && (
              <div className="rounded-xl border border-success bg-success-bg p-6 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-text-on-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-token-base font-semibold text-success-strong">
                        Connection Test Completed Successfully
                      </h3>
                      <span className="font-mono text-token-xs font-semibold text-success-strong">
                        {result.totalExecutionMs}ms total latency
                      </span>
                    </div>
                    <p className="mt-1 text-token-sm text-text-secondary-alt leading-relaxed">
                      All validation checks passed. The destination endpoint is reachable, credentials are valid, and necessary schema permissions are granted.
                    </p>

                    {/* Sub-checkpoints summary */}
                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-success/40 pt-3 sm:grid-cols-2 md:grid-cols-3">
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>DNS & TCP Reachability</span>
                      </div>
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>TLS 1.3 Encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>Native Auth Validated</span>
                      </div>
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>Warehouse Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>Schema & DDL Verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-token-xs text-text-primary">
                        <Check className="h-4 w-4 text-success" />
                        <span>Sample Write Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VALIDATION RESULTS CHECKLIST */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-token-base font-semibold text-text-primary">Validation Results</h2>
                    <p className="text-token-xs text-text-muted">Step-by-step checklist of destination verification</p>
                  </div>
                </div>
                {result && (
                  <span className="font-mono text-token-xs font-semibold text-success">
                    {result.checksPassed} of {result.checksTotal} Passed
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col divide-y divide-border-muted">
                {(result?.validationSteps || [
                  {
                    id: '1',
                    name: 'DNS & Network Reachability',
                    description: 'Resolving endpoint host and opening target port 443',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '2',
                    name: 'TLS / SSL Negotiation',
                    description: 'Validating SSL certificate and cipher suite compatibility',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '3',
                    name: 'Authentication & Credentials',
                    description: 'Verifying Snowflake Native username & password',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '4',
                    name: 'Warehouse Availability',
                    description: 'Confirming warehouse state and auto-resume capacity',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '5',
                    name: 'Database & Schema Verification',
                    description: 'Validating existence of PROD_ANALYTICS.PUBLIC',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '6',
                    name: 'Write & DDL Permissions',
                    description: 'Checking INSERT, UPDATE, CREATE TABLE permissions',
                    status: 'idle',
                    durationMs: '—',
                  },
                  {
                    id: '7',
                    name: 'Data Insertion Test',
                    description: 'Executing transient sample row write and rollback',
                    status: 'idle',
                    durationMs: '—',
                  },
                ]).map((step, index) => (
                  <div key={step.id || index} className="flex items-start justify-between gap-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {step.status === 'passed' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : step.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        ) : testStatus === 'running' && activeStepIndex === index ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-token-xs text-text-faint">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-token-sm font-semibold text-text-primary">{step.name}</span>
                          {step.required && (
                            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                              REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-token-xs text-text-muted mt-0.5">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-token-xs font-mono text-text-faint">
                        {step.durationMs !== '—' ? `${step.durationMs}ms` : '—'}
                      </span>
                      <StatusBadge status={step.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. CONNECTION METRICS */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-token-base font-semibold text-text-primary">Connection Metrics</h2>
                    <p className="text-token-xs text-text-muted">Latency breakdown and performance timings</p>
                  </div>
                </div>
                <span className="text-token-xs text-text-muted font-mono">Benchmark: Healthy (&lt; 2000ms)</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">Response Time</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.responseTimeMs || 24} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-success font-medium">Fast (p99 &lt; 50ms)</span>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">DNS Lookup</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.dnsLookupMs || 38} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">AWS Route53</span>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">TLS Handshake</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.tlsHandshakeMs || 186} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-success font-medium">TLS 1.3 ECDHE</span>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">Auth Time</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.authTimeMs || 312} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">Native Token</span>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">Permission Check</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.permissionCheckMs || 218} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-success font-medium">DDL/DML Verified</span>
                </div>
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3.5">
                  <span className="text-token-xs text-text-muted">Sample Write</span>
                  <p className="mt-1 font-mono text-token-lg font-bold text-text-primary">
                    {result?.metrics?.sampleWriteMs || 258} <span className="text-token-xs font-normal text-text-muted">ms</span>
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">14.2 MB/s</span>
                </div>
                <div className="col-span-2 rounded-lg border border-primary/20 bg-shell-accent-wash/10 p-3.5 sm:col-span-3 lg:col-span-2">
                  <span className="text-token-xs font-semibold text-primary">Total Execution Duration</span>
                  <p className="mt-1 font-mono text-token-xl font-bold text-primary">
                    {result?.metrics?.totalExecutionMs || 1248} <span className="text-token-sm font-normal text-primary">ms</span>
                  </p>
                  <span className="text-[10px] text-text-muted">Includes handshake, auth, schema discovery, and teardown</span>
                </div>
              </div>
            </div>

            {/* 6. TEST TIMELINE (Execution Log) */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-token-base font-semibold text-text-primary">Test Timeline</h2>
                    <p className="text-token-xs text-text-muted">Chronological event execution log</p>
                  </div>
                </div>
                <span className="rounded bg-surface-muted px-2.5 py-1 text-token-xs font-mono text-text-muted">
                  Session: {result?.sessionId || 'sess_sf_8839201a'}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-token-sm">
                  <thead>
                    <tr className="border-b border-border text-token-xs font-medium text-text-faint">
                      <th scope="col" className="pb-2.5 font-mono">Time</th>
                      <th scope="col" className="pb-2.5">Event Description</th>
                      <th scope="col" className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted font-sans text-token-xs">
                    {(result?.timeline || [
                      { time: '00:00.000', event: 'Test initialization started (Quick Validation mode)', status: 'INFO' },
                      { time: '00:00.038', event: 'DNS lookup completed for xy12345.us-east-1.snowflakecomputing.com', status: 'SUCCESS' },
                      { time: '00:00.224', event: 'TLS 1.3 handshake established with server certificate verification', status: 'SUCCESS' },
                      { time: '00:00.536', event: 'Authentication token acquired for user CONNECTIQ_PROD_SVC', status: 'SUCCESS' },
                      { time: '00:00.630', event: 'Warehouse COMPUTE_WH status confirmed (ACTIVE)', status: 'SUCCESS' },
                      { time: '00:00.772', event: 'Database PROD_ANALYTICS and schema PUBLIC introspection complete', status: 'SUCCESS' },
                      { time: '00:00.990', event: 'Role permissions verified (INSERT, UPDATE, DELETE, CREATE TABLE)', status: 'SUCCESS' },
                      { time: '00:01.248', event: 'All validation checks completed successfully', status: 'SUCCESS' },
                    ]).map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-muted transition-colors">
                        <td className="py-2.5 font-mono text-text-muted">{item.time}</td>
                        <td className="py-2.5 text-text-primary">{item.event}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                              item.status === 'SUCCESS'
                                ? 'bg-success-bg text-success-strong'
                                : item.status === 'WARN'
                                ? 'bg-warning-bg text-warning-strong'
                                : 'bg-surface-muted text-text-muted'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. DIAGNOSTIC DETAILS (Collapsible) */}
            <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <button
                type="button"
                aria-expanded={diagnosticsExpanded}
                aria-controls="diagnostics-details-panel"
                onClick={() => setDiagnosticsExpanded(!diagnosticsExpanded)}
                className="flex w-full items-center justify-between text-left focus-visible:outline-primary"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-token-base font-semibold text-text-primary">Diagnostic Details</h2>
                    <p className="text-token-xs text-text-muted">Target host, driver, protocol, and session parameters</p>
                  </div>
                </div>
                {diagnosticsExpanded ? (
                  <ChevronDown className="h-5 w-5 text-text-muted" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                )}
              </button>

              {diagnosticsExpanded && (
                <div id="diagnostics-details-panel" className="mt-5 border-t border-border-subtle pt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(result?.diagnostics || {
                      destinationHost: 'xy12345.us-east-1.snowflakecomputing.com',
                      targetPort: '443',
                      protocol: 'HTTPS / JDBC',
                      tlsVersion: 'TLS 1.3',
                      cipherSuite: 'TLS_AES_256_GCM_SHA384',
                      driverVersion: 'Snowflake JDBC 3.14.4',
                      serverVersion: 'Snowflake 7.32.1',
                      cloudRegion: 'AWS us-east-1 (N. Virginia)',
                      sessionId: '01b4e889-0001-2a3b-0003-918273645012',
                      clientIp: '[IP_REDACTED] (NAT Gateway)',
                    }).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col rounded-lg border border-border-subtle bg-surface-muted p-3"
                      >
                        <span className="text-[11px] font-medium text-text-faint uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="mt-1 font-mono text-token-xs font-semibold text-text-primary truncate" title={val}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 4 COLS (Rail) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* 8. CONFIGURATION SUMMARY & HEALTH METER */}
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface-card p-6 shadow-sm">
              <h3 className="text-token-base font-semibold text-text-primary">Configuration Summary</h3>

              {/* Destination Card Preview */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shell-accent-wash text-primary">
                  <Snowflake className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-token-sm font-semibold text-text-primary truncate">{destination.name}</h4>
                  <p className="text-token-xs text-text-muted">{destination.typeLabel}</p>
                </div>
                <span className="rounded bg-success-bg px-2 py-0.5 text-token-xs font-medium text-success-strong">
                  Ready
                </span>
              </div>

              {/* Overall Health Meter */}
              <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-token-xs font-medium text-text-muted">Destination Health Score</span>
                  <span className="text-token-base font-mono font-bold text-success">
                    {result?.healthScore || 98}/100
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={result?.healthScore || 98}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Destination health score"
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full bg-success transition-all duration-300"
                    style={{ width: `${result?.healthScore || 98}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-token-xs">
                  <span className="font-medium text-success-strong">{result?.healthScoreLabel || 'Excellent'}</span>
                  <span className="text-text-faint">{result?.healthScoreNote || 'Optimal for production'}</span>
                </div>
              </div>

              {/* Required Configuration checklist summary */}
              <div className="flex flex-col gap-2.5 border-t border-border-subtle pt-4">
                <span className="text-token-xs font-semibold text-text-primary">Required Parameters Verified</span>
                <div className="flex flex-col gap-2 text-token-xs">
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Account Identifier
                    </span>
                    <span className="font-mono text-text-primary">{destination.account}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Warehouse
                    </span>
                    <span className="font-mono text-text-primary">{destination.warehouse}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Target Database
                    </span>
                    <span className="font-mono text-text-primary">{destination.database}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Target Schema
                    </span>
                    <span className="font-mono text-text-primary">{destination.schema}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Service User
                    </span>
                    <span className="font-mono text-text-primary">{destination.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> SSL/TLS Protocol
                    </span>
                    <span className="font-mono text-text-primary">Enforced (TLS 1.3)</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary-alt">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> Write Privileges
                    </span>
                    <span className="font-mono text-text-primary">Granted (DML)</span>
                  </div>
                </div>
              </div>

              {/* Security Callout */}
              <div className="rounded-lg border border-border bg-surface-muted p-3.5 text-token-xs text-text-secondary-alt leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Enterprise Security Guarantee
                </div>
                All test credentials are processed in ephemeral memory and discarded immediately following validation. No sensitive passwords or secrets are recorded in audit logs.
              </div>
            </div>
          </div>
        </div>

        {/* 9. BOTTOM STICKY FOOTER ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-border bg-surface-card/95 px-6 py-3.5 backdrop-blur shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/destinations/new')}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-2 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit Configuration</span>
            </button>
            <span className="hidden text-token-xs text-text-faint sm:inline-block">
              Destination: <strong className="text-text-primary">{destination.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/destinations')}
              className="rounded-lg border border-border bg-surface-card px-4 py-2 text-token-sm font-medium text-text-muted hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-token-sm font-semibold text-text-on-primary hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving Destination...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved! Redirecting...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save & Activate Destination</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
