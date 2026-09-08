import React, { useState, useEffect, useId } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDestinationConfiguration } from '../hooks/useDestinationConfiguration';
import { AUTH_METHODS, ENVIRONMENTS } from '../services/destinationConfiguration.api';
import {
  Database,
  Server,
  Key,
  Shield,
  Sliders,
  CheckSquare,
  Activity,
  Zap,
  GitBranch,
  Cpu,
  ArrowLeft,
  Trash2,
  Copy,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  EyeOff,
  Lock,
  Layers,
  RotateCw,
} from 'lucide-react';

export default function DestinationConfigurationScreen() {
  const { id = 'dest_sf_prod_01' } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    isDirty,
    isSaving,
    saveSuccess,
    bannerDismissed,
    setBannerDismissed,
    validationSummary,
    isTesting,
    testResult,
    testError,
    isRotating,
    rotateSuccess,
    refetch,
    updateGeneral,
    addTag,
    removeTag,
    updateConnection,
    updateAuth,
    updateConfig,
    toggleConfigSwitch,
    updateAdvanced,
    toggleAdvancedSwitch,
    handleSave,
    handleReset,
    runQuickTest,
    rotateCredentials,
  } = useDestinationConfiguration(id);

  // Local UI state
  const [newTagInput, setNewTagInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(true);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (cloneModalOpen) setCloneModalOpen(false);
        if (deleteModalOpen) setDeleteModalOpen(false);
      }
    };
    if (cloneModalOpen || deleteModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [cloneModalOpen, deleteModalOpen]);

  // Unique accessible IDs for form fields
  const nameId = useId();
  const typeId = useId();
  const descId = useId();
  const envId = useId();
  const ownerId = useId();
  const tagInputId = useId();
  const accountId = useId();
  const warehouseId = useId();
  const databaseId = useId();
  const schemaId = useId();
  const roleId = useId();
  const authMethodId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const roleArnId = useId();
  const timeoutId = useId();
  const retriesId = useId();
  const intervalId = useId();
  const batchSizeId = useId();
  const parallelWritesId = useId();
  const poolSizeId = useId();
  const stmtTimeoutId = useId();
  const queryTagId = useId();

  const breadcrumbs = [
    'ConnectIQ',
    'Destinations',
    data?.general?.displayName || 'Snowflake Production',
    'Configure',
  ];

  if (isLoading) {
    return (
      <AppShell breadcrumb={breadcrumbs}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-text-secondary">Loading destination configuration...</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={breadcrumbs}>
        <div className="max-w-4xl mx-auto my-8 p-6 rounded-xl border border-danger/30 bg-danger/5 text-center">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-text-primary">Unable to load destination configuration</h2>
          <p className="text-sm text-text-secondary mt-1 mb-4">
            {error?.message || 'An error occurred while fetching destination details.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-text-on-primary hover:opacity-90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      addTag(newTagInput);
      setNewTagInput('');
    }
  };

  return (
    <AppShell breadcrumb={breadcrumbs}>
      <div className="w-full pb-24 text-text-primary">
        {/* ==================================================================== */}
        {/* TOP HEADER / ACTION BAR                                              */}
        {/* ==================================================================== */}
        <header className="mb-6 pb-5 border-b border-border-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title & Metadata */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {data?.general?.displayName || 'Snowflake Production'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  {data?.status || 'Connected'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-muted text-text-secondary border border-border-subtle">
                  {data?.version || 'v1.0.0'}
                </span>
              </div>

              {/* Subheader Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">Type:</span> {data?.typeLabel || 'Snowflake Data Warehouse'}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">Environment:</span>{' '}
                  <span className="font-medium text-text-primary">{data?.environment || 'Production'}</span>
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">Owner:</span> {data?.owner || 'Priya S.'}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">Last Updated:</span> {data?.lastUpdated || '2 hours ago'}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-secondary">Last Tested:</span> {data?.lastTested || '14:02:17 today'}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
                title="Return to destination list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Destinations
              </Link>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-danger/30 bg-danger/5 hover:bg-danger/10 text-danger transition-colors"
                title="Delete destination"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>

              <button
                type="button"
                onClick={() => setCloneModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
                title="Clone this destination config"
              >
                <Copy className="w-3.5 h-3.5" />
                Clone
              </button>

              <button
                type="button"
                onClick={runQuickTest}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-primary transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-primary' : 'text-text-secondary'}`} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-text-on-primary hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* DISMISSIBLE SUCCESS BANNER                                           */}
        {/* ==================================================================== */}
        {saveSuccess && !bannerDismissed && (
          <div
            className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-text-primary flex items-start justify-between gap-4 transition-all duration-300 shadow-sm"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Configuration updated successfully
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Changes have been saved and applied to{' '}
                  <span className="font-semibold text-text-primary">{data?.general?.displayName}</span>. Connected pipelines
                  will use updated parameters on their next execution.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setBannerDismissed(true)}
                    className="font-semibold text-primary hover:underline"
                  >
                    Continue Editing
                  </button>
                  <Link to="/destinations" className="font-semibold text-text-secondary hover:text-text-primary hover:underline">
                    View All Destinations →
                  </Link>
                  <button
                    type="button"
                    onClick={runQuickTest}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Test Connection Again
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-emerald-500/20"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ROTATE SUCCESS BANNER                                                */}
        {/* ==================================================================== */}
        {rotateSuccess && (
          <div
            className="mb-6 p-3 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-between text-xs"
            role="status"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                <strong>Credentials rotated successfully.</strong> New encryption key active. All active sessions refreshed.
              </span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MAIN 2-COLUMN GRID (9 Left Cards + Right Summary Rail)               */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ------------------------------------------------------------------ */}
          {/* LEFT COLUMN: 9 CONFIGURATION & TELEMETRY CARDS (8 Cols)            */}
          {/* ------------------------------------------------------------------ */}
          <div className="lg:col-span-8 space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* CARD 1: GENERAL INFORMATION                                      */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-subtle">
                <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-text-primary">General Information</h2>
                  <p className="text-xs text-text-secondary">Identification, classification, and ownership metadata.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="sm:col-span-2">
                  <label htmlFor={nameId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Destination Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    value={data?.general?.displayName || ''}
                    onChange={(e) => updateGeneral('displayName', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., Snowflake Production"
                    required
                  />
                </div>

                {/* Destination Type */}
                <div>
                  <label htmlFor={typeId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Destination Type <span className="text-danger">*</span>
                  </label>
                  <select
                    id={typeId}
                    value={data?.general?.type || 'Snowflake'}
                    onChange={(e) => updateGeneral('type', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="Snowflake">Snowflake Data Warehouse</option>
                    <option value="PostgreSQL">PostgreSQL Database</option>
                    <option value="BigQuery">Google BigQuery</option>
                    <option value="Redshift">Amazon Redshift</option>
                    <option value="Databricks">Databricks Delta Lake</option>
                    <option value="S3">Amazon S3 Data Lake</option>
                    <option value="Kafka">Apache Kafka Event Stream</option>
                  </select>
                </div>

                {/* Environment */}
                <div>
                  <label htmlFor={envId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Environment <span className="text-danger">*</span>
                  </label>
                  <select
                    id={envId}
                    value={data?.general?.environment || 'Production'}
                    onChange={(e) => updateGeneral('environment', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {ENVIRONMENTS.map((env) => (
                      <option key={env} value={env}>
                        {env}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Owner */}
                <div>
                  <label htmlFor={ownerId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Owner / Responsible Team
                  </label>
                  <input
                    id={ownerId}
                    type="text"
                    value={data?.general?.owner || ''}
                    onChange={(e) => updateGeneral('owner', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., Priya S. / DataOps"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label htmlFor={descId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Description & Purpose
                  </label>
                  <textarea
                    id={descId}
                    rows={2}
                    value={data?.general?.description || ''}
                    onChange={(e) => updateGeneral('description', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Describe how pipelines and analysts utilize this destination."
                  />
                </div>

                {/* Tags Management */}
                <div className="sm:col-span-2">
                  <label htmlFor={tagInputId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Tags & Labels
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border bg-surface-card min-h-[42px]">
                    {data?.general?.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-muted text-text-primary border border-border-subtle"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-text-secondary hover:text-danger rounded p-0.5"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <form onSubmit={handleAddTagSubmit} className="inline-flex items-center flex-1 min-w-[120px]">
                      <input
                        id={tagInputId}
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="+ add tag and press Enter"
                        className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none px-1 py-0.5"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 2: CONNECTION DETAILS                                       */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-subtle">
                <Server className="w-5 h-5 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-text-primary">Connection Details</h2>
                  <p className="text-xs text-text-secondary">
                    Warehouse host parameters, virtual compute, and schema namespaces.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Identifier */}
                <div className="sm:col-span-2">
                  <label htmlFor={accountId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Account Identifier / Host <span className="text-danger">*</span>
                  </label>
                  <input
                    id={accountId}
                    type="text"
                    value={data?.connection?.account || ''}
                    onChange={(e) => updateConnection('account', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., xy12345.us-east-1"
                    required
                  />
                  <p className="text-[11px] text-text-secondary mt-1">
                    Snowflake locator format or organisation-account slug.
                  </p>
                </div>

                {/* Warehouse */}
                <div>
                  <label htmlFor={warehouseId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Virtual Warehouse <span className="text-danger">*</span>
                  </label>
                  <input
                    id={warehouseId}
                    type="text"
                    value={data?.connection?.warehouse || ''}
                    onChange={(e) => updateConnection('warehouse', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="COMPUTE_WH"
                    required
                  />
                </div>

                {/* Database */}
                <div>
                  <label htmlFor={databaseId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Target Database <span className="text-danger">*</span>
                  </label>
                  <input
                    id={databaseId}
                    type="text"
                    value={data?.connection?.database || ''}
                    onChange={(e) => updateConnection('database', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="ANALYTICS_DB"
                    required
                  />
                </div>

                {/* Schema */}
                <div>
                  <label htmlFor={schemaId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Schema <span className="text-danger">*</span>
                  </label>
                  <input
                    id={schemaId}
                    type="text"
                    value={data?.connection?.schema || ''}
                    onChange={(e) => updateConnection('schema', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="PUBLIC"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor={roleId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Default Role
                  </label>
                  <input
                    id={roleId}
                    type="text"
                    value={data?.connection?.role || ''}
                    onChange={(e) => updateConnection('role', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="SYSADMIN"
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 3: AUTHENTICATION                                           */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Authentication</h2>
                    <p className="text-xs text-text-secondary">Security credentials and identity management.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-surface-muted text-text-secondary border border-border-subtle">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  {data?.auth?.encryption || 'AES-256'} Encrypted
                </span>
              </div>

              {/* Auth Method Selector */}
              <div className="mb-5">
                <span id={authMethodId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Authentication Method
                </span>
                <div role="radiogroup" aria-labelledby={authMethodId} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AUTH_METHODS.map((method) => {
                    const isSelected = data?.auth?.method === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-pressed={isSelected}
                        onClick={() => updateAuth('method', method)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                            : 'border-border bg-surface-card text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Credential Inputs based on Auth Method */}
              <div className="space-y-4">
                {data?.auth?.method === 'Username & Password' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={usernameId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Service Username <span className="text-danger">*</span>
                      </label>
                      <input
                        id={usernameId}
                        type="text"
                        value={data?.auth?.username || ''}
                        onChange={(e) => updateAuth('username', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="etl_service_user"
                      />
                    </div>
                    <div>
                      <label htmlFor={passwordId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Password / Secret <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id={passwordId}
                          type={showPassword ? 'text' : 'password'}
                          value={data?.auth?.password || ''}
                          onChange={(e) => updateAuth('password', e.target.value)}
                          className="w-full pl-3 pr-10 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {data?.auth?.method === 'AWS IAM Role' && (
                  <div>
                    <label htmlFor={roleArnId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                      IAM Role ARN <span className="text-danger">*</span>
                    </label>
                    <input
                      id={roleArnId}
                      type="text"
                      value={data?.auth?.roleArn || ''}
                      onChange={(e) => updateAuth('roleArn', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="arn:aws:iam::123456789012:role/ConnectIQSnowflakeRole"
                    />
                  </div>
                )}

                {data?.auth?.method === 'Key Pair Authentication' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      RSA Private Key (.p8)
                    </label>
                    <div className="p-3 rounded-lg border border-border bg-surface-card text-xs font-mono text-text-secondary">
                      Fingerprint: {data?.auth?.keyFingerprint || 'SHA256:7b:9c:4a:12:ef:90:3d:1a:88:5b:bc:aa'}
                    </div>
                  </div>
                )}

                {/* Credential Rotation Box */}
                <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-text-primary">Credential Rotation Policy</h3>
                      <p className="text-[11px] text-text-secondary">
                        Last rotated: <span className="font-semibold text-text-primary">{data?.auth?.lastRotated}</span> ·
                        Managed by AWS Secrets Manager
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={rotateCredentials}
                    disabled={isRotating}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-card hover:bg-surface-card text-text-primary transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-primary' : ''}`} />
                    {isRotating ? 'Rotating...' : 'Rotate Credentials'}
                  </button>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 4: CONNECTION CONFIGURATION & PERFORMANCE                   */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-subtle">
                <Sliders className="w-5 h-5 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-text-primary">Connection Configuration & Performance</h2>
                  <p className="text-xs text-text-secondary">Network limits, throughput, and automated retry policies.</p>
                </div>
              </div>

              {/* Performance Numeric Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor={timeoutId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Timeout (seconds)
                  </label>
                  <input
                    id={timeoutId}
                    type="number"
                    min="5"
                    max="300"
                    value={data?.configuration?.connectionTimeout || 30}
                    onChange={(e) => updateConfig('connectionTimeout', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={retriesId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Retry Attempts
                  </label>
                  <input
                    id={retriesId}
                    type="number"
                    min="0"
                    max="10"
                    value={data?.configuration?.retryAttempts || 3}
                    onChange={(e) => updateConfig('retryAttempts', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={intervalId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Retry Interval (s)
                  </label>
                  <input
                    id={intervalId}
                    type="number"
                    min="1"
                    max="60"
                    value={data?.configuration?.retryInterval || 5}
                    onChange={(e) => updateConfig('retryInterval', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={batchSizeId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Batch Size (rows)
                  </label>
                  <input
                    id={batchSizeId}
                    type="number"
                    step="1000"
                    min="1000"
                    max="100000"
                    value={data?.configuration?.batchSize || 10000}
                    onChange={(e) => updateConfig('batchSize', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={parallelWritesId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Parallel Writes
                  </label>
                  <input
                    id={parallelWritesId}
                    type="number"
                    min="1"
                    max="32"
                    value={data?.configuration?.parallelWrites || 4}
                    onChange={(e) => updateConfig('parallelWrites', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                {/* SSL Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-card">
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">SSL / TLS Encryption</span>
                    <span className="text-[11px] text-text-secondary">
                      Enforce strict TLS 1.3 cryptographic transport security.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data?.configuration?.sslEnabled}
                    onClick={() => toggleConfigSwitch('sslEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      data?.configuration?.sslEnabled ? 'bg-primary' : 'bg-surface-muted border border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        data?.configuration?.sslEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Compression Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-card">
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">GZIP Stream Compression</span>
                    <span className="text-[11px] text-text-secondary">
                      Compress payload chunks before warehouse ingress to reduce network egress.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data?.configuration?.compression}
                    onClick={() => toggleConfigSwitch('compression')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      data?.configuration?.compression ? 'bg-primary' : 'bg-surface-muted border border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        data?.configuration?.compression ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Keep Alive Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-card">
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">Keep-Alive Session Pooling</span>
                    <span className="text-[11px] text-text-secondary">
                      Maintain warm connection sockets to avoid repeated TLS handshake overhead.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data?.configuration?.keepAlive}
                    onClick={() => toggleConfigSwitch('keepAlive')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      data?.configuration?.keepAlive ? 'bg-primary' : 'bg-surface-muted border border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        data?.configuration?.keepAlive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 5: VALIDATION STATUS (7-ITEM CHECKLIST)                     */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-5 h-5 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Validation Status</h2>
                    <p className="text-xs text-text-secondary">
                      Verification results from the most recent system test execution.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-warning-strong border border-amber-500/20">
                  6 / 7 Passed · 1 Warning
                </span>
              </div>

              <div className="divide-y divide-border-subtle">
                {data?.validationChecklist?.map((item) => {
                  const isPassed = item.status === 'passed';
                  const isWarning = item.status === 'warning';
                  const isPending = item.status === 'pending';

                  return (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isPassed && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                              ✓
                            </span>
                          )}
                          {isWarning && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10 text-warning-strong font-bold">
                              !
                            </span>
                          )}
                          {isPending && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-500/10 text-slate-400">
                              ○
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">{item.name}</span>
                          <span className="text-text-secondary text-[11px]">{item.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span className="text-[11px] text-text-secondary font-mono">{item.timestamp}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            isPassed
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : isWarning
                              ? 'bg-amber-500/10 text-warning-strong border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 6: CONNECTION HEALTH & TELEMETRY TIMELINE                   */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Connection Health & Telemetry</h2>
                    <p className="text-xs text-text-secondary">
                      24-hour response latency histogram and availability metrics.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  99.8% Availability
                </span>
              </div>

              {/* 7 KPI Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-lg border border-border bg-surface-card">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                    Current Status
                  </span>
                  <span className="text-sm font-bold text-emerald-500 mt-1 block">
                    {data?.healthMetrics?.currentStatus || 'Connected'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-surface-card">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                    Last Successful
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono mt-1 block">
                    {data?.healthMetrics?.lastSuccessful || '14:02:17'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-surface-card">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                    Avg Response
                  </span>
                  <span className="text-sm font-bold text-text-primary mt-1 block">
                    {data?.healthMetrics?.avgResponseTimeMs || 354} ms
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-surface-card">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                    Tests (24h)
                  </span>
                  <span className="text-sm font-bold text-text-primary mt-1 block">
                    {data?.healthMetrics?.successfulTests} / {data?.healthMetrics?.successfulTests + data?.healthMetrics?.failedTests}
                  </span>
                </div>
              </div>

              {/* 24-Hour Timeline Bar Chart (Histogram) */}
              <div className="p-4 rounded-xl border border-border-subtle bg-surface-card">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-text-secondary">24-Hour Health Timeline</span>
                  <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Healthy (100%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Warning (&lt;98%)
                    </span>
                  </div>
                </div>

                {/* Hourly Bars */}
                <div className="flex items-end justify-between gap-1.5 h-16 pt-2 pb-1 border-b border-border">
                  {data?.healthMetrics?.timelineBars?.map((bar, idx) => {
                    const isHealthy = bar.status === 'healthy';
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative cursor-pointer"
                        title={`${bar.hour}: ${bar.value} (${bar.status})`}
                      >
                        <div
                          style={{ height: `${bar.height}px` }}
                          className={`w-full rounded-t transition-all ${
                            isHealthy
                              ? 'bg-emerald-500 hover:bg-emerald-400'
                              : 'bg-amber-500 hover:bg-amber-400'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono mt-2">
                  <span>24 hours ago</span>
                  <span>12 hours ago</span>
                  <span>Current (Now)</span>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 7: TEST CONNECTION DIAGNOSTIC CARD                          */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Connection Diagnostics</h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Target:{' '}
                      <span className="font-mono font-medium text-text-primary">
                        {data?.connection?.account || 'xy12345.us-east-1'}.snowflakecomputing.com:443
                      </span>
                    </p>
                    {testResult && (
                      <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Quick Test Result: {testResult.status} ({testResult.responseTimeMs}ms) at {testResult.testedAt}
                      </div>
                    )}
                    {testError && (
                      <div className="mt-2 text-xs text-danger flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {testError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/destinations/new/test"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Full Test Suite
                  </Link>

                  <button
                    type="button"
                    onClick={runQuickTest}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-text-on-primary hover:opacity-90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testing...' : 'Test Now'}
                  </button>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 8: CONNECTED PIPELINES TABLE                                */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-5 h-5 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Connected Pipelines</h2>
                    <p className="text-xs text-text-secondary">
                      Active and scheduled data ingestion pipelines writing to this destination.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-muted text-text-secondary border border-border-subtle">
                  {data?.connectedPipelines?.length || 3} Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-secondary uppercase tracking-wider font-semibold text-[10px]">
                      <th scope="col" className="pb-2.5 font-semibold">Pipeline Name</th>
                      <th scope="col" className="pb-2.5 font-semibold">Status</th>
                      <th scope="col" className="pb-2.5 font-semibold">Schedule</th>
                      <th scope="col" className="pb-2.5 font-semibold">Last Run</th>
                      <th scope="col" className="pb-2.5 font-semibold">Throughput</th>
                      <th scope="col" className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data?.connectedPipelines?.map((pipeline) => {
                      const isRunning = pipeline.statusType === 'running';
                      const isWarning = pipeline.statusType === 'warning';

                      return (
                        <tr key={pipeline.id} className="hover:bg-surface-muted/50 transition-colors">
                          <td className="py-3 font-semibold text-text-primary flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            {pipeline.name}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isRunning
                                  ? 'bg-primary/10 text-primary'
                                  : isWarning
                                  ? 'bg-amber-500/10 text-warning-strong'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isRunning
                                    ? 'bg-primary animate-pulse'
                                    : isWarning
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              {pipeline.status}
                            </span>
                          </td>
                          <td className="py-3 text-text-secondary">{pipeline.schedule}</td>
                          <td className="py-3 text-text-secondary font-mono">{pipeline.lastRun}</td>
                          <td className="py-3 text-text-secondary">{pipeline.recordsProcessed}</td>
                          <td className="py-3 text-right">
                            <Link
                              to="/pipelines"
                              className="text-primary font-semibold hover:underline"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* CARD 9: ADVANCED SETTINGS (COLLAPSIBLE ACCORDION)                */}
            {/* ---------------------------------------------------------------- */}
            <section className="bg-surface-card rounded-xl border border-border p-5 sm:p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setAdvancedExpanded(!advancedExpanded)}
                aria-expanded={advancedExpanded}
                aria-controls="advanced-warehouse-settings"
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Advanced Warehouse Settings</h2>
                    <p className="text-xs text-text-secondary">
                      Session parameters, query tagging, and connection pooling.
                    </p>
                  </div>
                </div>
                {advancedExpanded ? (
                  <ChevronUp className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                )}
              </button>

              {advancedExpanded && (
                <div id="advanced-warehouse-settings" className="pt-5 mt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={poolSizeId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Max Pool Size (connections)
                    </label>
                    <input
                      id={poolSizeId}
                      type="number"
                      min="1"
                      max="100"
                      value={data?.advanced?.poolSize || 20}
                      onChange={(e) => updateAdvanced('poolSize', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor={stmtTimeoutId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Statement Timeout (seconds)
                    </label>
                    <input
                      id={stmtTimeoutId}
                      type="number"
                      min="30"
                      max="3600"
                      value={data?.advanced?.statementTimeout || 300}
                      onChange={(e) => updateAdvanced('statementTimeout', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={queryTagId} className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Snowflake Query Tag
                    </label>
                    <input
                      id={queryTagId}
                      type="text"
                      value={data?.advanced?.queryTag || 'connectiq-etl-prod'}
                      onChange={(e) => updateAdvanced('queryTag', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="e.g., connectiq-etl-prod"
                    />
                    <p className="text-[11px] text-text-secondary mt-1">
                      Applied to Snowflake QUERY_TAG for cost tracking and warehouse workload attribution.
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-2 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-card">
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">Auto-Resume Warehouse</span>
                        <span className="text-[11px] text-text-secondary">
                          Automatically resume suspended compute warehouse when batch write starts.
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={data?.advanced?.autoResumeWarehouse}
                        onClick={() => toggleAdvancedSwitch('autoResumeWarehouse')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                          data?.advanced?.autoResumeWarehouse ? 'bg-primary' : 'bg-surface-muted border border-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            data?.advanced?.autoResumeWarehouse ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* RIGHT COLUMN: SUMMARY PANEL & SECURITY WIDGETS (4 Cols)             */}
          {/* ------------------------------------------------------------------ */}
          <div className="lg:col-span-4 space-y-6">
            {/* Summary Card */}
            <section className="bg-surface-card rounded-xl border border-border p-5 shadow-sm">
              <h2 className="text-sm font-bold text-text-primary pb-3 mb-3 border-b border-border-subtle flex items-center justify-between">
                <span>Configuration Summary</span>
                <span className="text-[11px] font-mono text-text-secondary">{data?.version || 'v1.0.0'}</span>
              </h2>

              <dl className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Connection Status:</dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {data?.summary?.connectionStatus || 'Connected'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Validation Status:</dt>
                  <dd className="font-semibold text-warning-strong">
                    {data?.summary?.validationStatus || '1 Warning'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Health Score:</dt>
                  <dd className="font-bold text-emerald-600 dark:text-emerald-400">
                    {data?.summary?.healthScore || '99.8%'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Last Check:</dt>
                  <dd className="font-mono text-text-primary">{data?.summary?.lastCheck || '14:02:17'}</dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Connected Pipelines:</dt>
                  <dd className="font-semibold text-text-primary">{data?.summary?.connectedPipelinesCount || '3 active'}</dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Auth Method:</dt>
                  <dd className="text-text-primary truncate max-w-[150px]" title={data?.auth?.method}>
                    {data?.auth?.method || 'Username & Password'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Environment:</dt>
                  <dd className="font-medium text-text-primary">{data?.environment || 'Production'}</dd>
                </div>
              </dl>
            </section>

            {/* Required Fields Completion Progress */}
            <section className="bg-surface-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text-primary">Required Configuration</h3>
                <span className="text-xs font-bold text-primary">
                  {validationSummary.completedCount} / {validationSummary.totalRequired}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden mb-3">
                <div
                  style={{ width: `${validationSummary.percent}%` }}
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                />
              </div>

              <div className="space-y-1.5 text-[11px]">
                {validationSummary.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-text-secondary">
                    <span>{item.name}</span>
                    <span className={item.valid ? 'text-emerald-500 font-semibold' : 'text-danger font-semibold'}>
                      {item.valid ? '✓ Ready' : '• Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activity Stream */}
            <section className="bg-surface-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-xs font-bold text-text-primary pb-3 mb-3 border-b border-border-subtle flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Recent Activity
              </h3>

              <div className="space-y-3 text-xs">
                {data?.summary?.recentActivity?.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-text-primary text-[11px] font-medium leading-snug">{act.text}</p>
                      <span className="text-[10px] text-text-secondary font-mono block mt-0.5">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Security & Audit Notice */}
            <section className="bg-surface-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h3 className="font-bold text-text-primary mb-1">Security & Compliance</h3>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    All destination credentials are encrypted in transit and at rest using envelope encryption (KMS).
                    Configuration mutations are recorded in the immutable audit log.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* STICKY BOTTOM ACTION BAR                                             */}
        {/* ==================================================================== */}
        <div
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface-card/95 backdrop-blur-md px-6 py-3 shadow-lg"
          role="region"
          aria-label="Save and validation controls"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left Status */}
            <div className="flex items-center gap-4 text-xs">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-warning-strong">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  All changes saved
                </span>
              )}

              <span className="text-border">|</span>

              <span className="text-text-secondary text-[11px]">
                Validation:{' '}
                <strong className="text-text-primary">
                  {validationSummary.completedCount} / {validationSummary.totalRequired} fields ready
                </strong>
              </span>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || isSaving}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Discard Changes
              </button>

              <button
                type="button"
                onClick={runQuickTest}
                disabled={isTesting}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-card hover:bg-surface-muted text-text-primary transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-primary' : ''}`} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-text-on-primary hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Screen Reader Live Region for Async Notifications */}
        <div className="sr-only" role="status" aria-live="polite">
          {isLoading && 'Loading destination configuration.'}
          {isSaving && 'Saving destination configuration changes.'}
          {saveSuccess && 'Destination configuration updated successfully.'}
          {isTesting && 'Running destination connection test.'}
          {testResult && `Connection test complete: ${testResult.status} in ${testResult.responseTimeMs} milliseconds.`}
          {testError && `Connection test failed: ${testError}`}
          {isRotating && 'Rotating destination security credentials.'}
          {rotateSuccess && 'Security credentials rotated successfully.'}
        </div>

        {/* ==================================================================== */}
        {/* CLONE MODAL                                                          */}
        {/* ==================================================================== */}
        {cloneModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay-scrim backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clone-modal-title"
          >
            <div className="w-full max-w-md bg-surface-card rounded-xl border border-border p-6 shadow-xl">
              <h3 id="clone-modal-title" className="text-base font-bold text-text-primary mb-2">Clone Destination Configuration</h3>
              <p className="text-xs text-text-secondary mb-4">
                Create a new destination duplicate based on{' '}
                <span className="font-semibold text-text-primary">{data?.general?.displayName}</span> parameters.
              </p>
              <div className="space-y-3 mb-5">
                <div>
                  <label htmlFor="clone-name-input" className="block text-xs font-semibold text-text-secondary mb-1">New Destination Name</label>
                  <input
                    id="clone-name-input"
                    type="text"
                    defaultValue={`${data?.general?.displayName} (Clone)`}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-card text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCloneModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface-card text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCloneModalOpen(false);
                    navigate('/destinations/new');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-text-on-primary hover:opacity-90"
                >
                  Create Clone
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* DELETE MODAL                                                         */}
        {/* ==================================================================== */}
        {deleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay-scrim backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="w-full max-w-md bg-surface-card rounded-xl border border-danger/30 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-3 text-danger">
                <AlertTriangle className="w-6 h-6" />
                <h3 id="delete-modal-title" className="text-base font-bold">Delete Destination</h3>
              </div>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-text-primary">{data?.general?.displayName}</strong>? Connected pipelines will fail
                unless re-routed to an alternative destination warehouse.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface-card text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    navigate('/destinations');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-danger text-text-on-primary hover:bg-danger/90"
                >
                  Confirm Deletion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
