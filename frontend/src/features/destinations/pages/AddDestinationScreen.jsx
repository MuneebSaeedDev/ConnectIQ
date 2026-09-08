import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Database, Snowflake, Share2, Save, Activity, CheckCircle, XCircle } from 'lucide-react';
import AppShell from '../../shell/components/AppShell';

import {
  testConnection,
  createDestination,
  DestinationError
} from '../services/addDestination.api';

// UI Primitives
const fieldBase = 'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';
const fieldInvalid = 'border-danger-border focus-visible:outline-danger';

function Field({ id, label, required, error, hint, className = '', children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-token-1 ${className}`}>
      <label htmlFor={id} className="text-token-sm font-medium text-text-secondary-alt">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {typeof children === 'function' ? children(describedBy) : children}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-token-meta text-text-faint">{hint}</p>}
      {error && <p id={`${id}-error`} className="m-0 text-token-meta text-danger" role="alert">{error}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, invalid, describedBy, required, ...rest }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      required={required}
      className={`${fieldBase} ${invalid ? fieldInvalid : 'border-border'}`}
      {...rest}
    />
  );
}

function SelectInput({ id, value, onChange, options, invalid, describedBy, required, ...rest }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        required={required}
        className={`appearance-none ${fieldBase} ${invalid ? fieldInvalid : 'border-border'}`}
        {...rest}
      >
        <option value="" disabled>Select option...</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-faint">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}

function Section({ index, title, description, children, actions }) {
  return (
    <div className="rounded-lg border border-border bg-surface-card shadow-card-sm overflow-hidden mb-token-6">
      <div className="border-b border-border bg-surface-base px-token-5 py-token-4 flex justify-between items-center">
        <div className="flex gap-token-3 items-start">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-muted text-token-xs font-semibold text-primary">
            {index}
          </div>
          <div>
            <h3 className="text-token-md font-semibold text-text-primary m-0 mb-0.5">{title}</h3>
            {description && <p className="text-token-sm text-text-secondary m-0">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-token-2">{actions}</div>}
      </div>
      <div className="p-token-5">
        {children}
      </div>
    </div>
  );
}

const DESTINATION_TYPES = [
  { value: 'Snowflake', icon: Snowflake },
  { value: 'BigQuery', icon: Database },
  { value: 'Redshift', icon: Database },
  { value: 'PostgreSQL', icon: Database },
  { value: 'Kafka', icon: Share2 }
];

const INITIAL_FORM = {
  name: '',
  description: '',
  destinationType: '',
  // Snowflake specifics
  account: '',
  warehouse: '',
  database: '',
  schema: '',
  role: '',
  // Auth
  authMethod: 'Username & Password',
  username: '',
  password: '',
  // Network
  networkType: 'Public Internet', // 'Public Internet', 'AWS PrivateLink', 'GCP Private Service Connect'
  // Advanced
  connectionTimeout: '30', // seconds
  batchSize: '10000',
  parallelWrites: '4',
  retryAttempts: '3',
  retryInterval: '5'
};

export default function AddDestinationScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Derive readiness state
  const hasAuth = form.authMethod === 'Username & Password' ? !!(form.username && form.password) : true;
  const isReadyToTest = !!(form.destinationType && form.account && form.warehouse && form.database && hasAuth);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCancel = () => {
    const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL_FORM);
    if (isDirty) {
      if (!window.confirm('You have manually configured fields. Are you sure you want to discard this destination?')) {
        return;
      }
    }
    navigate('/destinations');
  };

  const handleTestConnection = async () => {
    if (!isReadyToTest) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(form);
      setTestResult(res);
      // Auto-clear success after delay visually?
    } catch (err) {
      if (err instanceof DestinationError && err.status === 400 && err.details) {
         setErrors(err.details);
         setTestResult({ success: false, message: 'Correct validation errors to continue', error: err });
      } else {
         setTestResult({ success: false, message: err.message || 'Connection failed' });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);
    try {
      await createDestination(form);
      navigate('/destinations');
    } catch (err) {
      if (err instanceof DestinationError && err.status === 400 && err.details) {
         setErrors(err.details);
      } else {
         setSubmitError(err.message || 'Failed to connect destination. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Destinations', 'New Destination']}>
      <main className="mx-auto max-w-7xl pb-16">
        {/* Header */}
        <div className="border-b border-border bg-surface-card px-token-6 py-token-5 shadow-card-sm backdrop-blur-sm sticky top-[60px] z-10 flex items-center justify-between">
          <div>
            <h1 className="text-token-xl font-bold tracking-tight text-text-primary m-0">Add New Destination</h1>
            <p className="mt-1 text-token-sm text-text-secondary m-0">Configure a new destination target for your pipeline outputs.</p>
          </div>
          <div className="flex gap-token-3">
             <button
               type="button"
               onClick={handleCancel}
               className="h-9 px-4 rounded-md border border-border bg-surface-card text-token-sm font-medium text-text-secondary hover:bg-surface-base hover:text-text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-50"
             >
               Cancel
             </button>
             <button
               type="button"
               onClick={handleSubmit}
               disabled={isSubmitting || (testResult && !testResult.success)}
               className="h-9 px-4 rounded-md bg-primary text-token-sm font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
             >
               {isSubmitting ? 'Saving...' : 'Save Destination'}
               <Save className="h-4 w-4" />
             </button>
          </div>
        </div>

        <div className="p-token-6 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8 flex flex-col-reverse gap-8">
           {/* Left Column: Form Forms */}
           <div className="space-y-token-6">
              {submitError && (
                <div className="rounded-md bg-danger-surface p-4 border border-danger-border flex items-start gap-3 mb-6">
                  <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-danger">{submitError}</h3>
                  </div>
                </div>
              )}
              <form id="add-destination-form" onSubmit={handleSubmit}>

                 {/* 1. Destination Type */}
                 <Section index="1" title="Destination Type" description="Select the platform you want to send data to">
                    <div className="grid gap-token-4 sm:grid-cols-2 md:grid-cols-3">
                       {DESTINATION_TYPES.map(type => (
                         <div
                            key={type.value}
                            onClick={() => updateForm('destinationType', type.value)}
                            className={`flex flex-col items-center justify-center p-token-5 rounded-lg border-2 cursor-pointer transition-all ${form.destinationType === type.value ? 'border-primary bg-primary-muted ring-1 ring-primary ring-opacity-20 shadow-sm' : 'border-border bg-surface-card hover:border-text-faint hover:bg-surface-base'}`}
                         >
                            <type.icon className={`h-8 w-8 mb-3 ${form.destinationType === type.value ? 'text-primary' : 'text-text-secondary'}`} />
                            <span className={`text-token-sm font-medium ${form.destinationType === type.value ? 'text-text-primary' : 'text-text-secondary'}`}>{type.value}</span>
                         </div>
                       ))}
                    </div>
                 </Section>

                 {/* 2. Destination Details */}
                 {form.destinationType && (
                   <Section index="2" title="Destination Configuration" description="Basic details and target environment settings">
                      <div className="max-w-2xl space-y-token-5">
                         <Field id="name" label="Destination Name" required error={errors.name} hint="Provide a unique, descriptive name">
                            {(describedBy) => (
                              <TextInput id="name" value={form.name} onChange={(v) => updateForm('name', v)} invalid={!!errors.name} describedBy={describedBy} required placeholder="e.g. Production Data Warehouse" />
                            )}
                         </Field>
                         <Field id="description" label="Description" hint="Optional context about what this destination is used for">
                            {(describedBy) => (
                              <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => updateForm('description', e.target.value)}
                                aria-describedby={describedBy}
                                rows={3}
                                className={`w-full rounded-md border border-border bg-surface-card px-3 py-2 font-sans text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary`}
                                placeholder="Stores sanitized event logs..."
                              />
                            )}
                         </Field>

                         <div className="h-px bg-surface-divider my-token-5" />
                         <h4 className="text-token-sm font-semibold text-text-secondary uppercase tracking-wider mb-token-3">Target Details</h4>

                         <div className="grid gap-token-4 sm:grid-cols-2">
                           <Field id="account" label="Account Identifier" required error={errors.account}>
                             {(describedBy) => (
                               <TextInput id="account" value={form.account} onChange={(v) => updateForm('account', v)} invalid={!!errors.account} describedBy={describedBy} required placeholder={form.destinationType === 'Snowflake' ? "xy12345.us-east-1" : "Account ID"} />
                             )}
                           </Field>
                           <Field id="warehouse" label="Warehouse" required error={errors.warehouse}>
                             {(describedBy) => (
                               <TextInput id="warehouse" value={form.warehouse} onChange={(v) => updateForm('warehouse', v)} invalid={!!errors.warehouse} describedBy={describedBy} required placeholder="COMPUTE_WH" />
                             )}
                           </Field>
                           <Field id="database" label="Database" required error={errors.database}>
                             {(describedBy) => (
                               <TextInput id="database" value={form.database} onChange={(v) => updateForm('database', v)} invalid={!!errors.database} describedBy={describedBy} required placeholder="ANALYTICS_DB" />
                             )}
                           </Field>
                           <Field id="schema" label="Schema" required error={errors.schema}>
                             {(describedBy) => (
                               <TextInput id="schema" value={form.schema} onChange={(v) => updateForm('schema', v)} invalid={!!errors.schema} describedBy={describedBy} required placeholder="PUBLIC" />
                             )}
                           </Field>
                           <div className="sm:col-span-2">
                             <Field id="role" label="Role (Optional)" error={errors.role} hint="Override default role for this connection">
                               {(describedBy) => (
                                 <TextInput id="role" value={form.role} onChange={(v) => updateForm('role', v)} invalid={!!errors.role} describedBy={describedBy} placeholder="SYSADMIN" />
                               )}
                             </Field>
                           </div>
                         </div>
                      </div>
                   </Section>
                 )}

                 {/* 3. Authentication */}
                 {form.destinationType && (
                   <Section index="3" title="Authentication" description="Credentials for accessing the destination">
                     <div className="max-w-2xl space-y-token-5">
                       <Field id="authMethod" label="Authentication Method">
                          {(describedBy) => (
                             <SelectInput id="authMethod" value={form.authMethod} onChange={(v) => updateForm('authMethod', v)} options={['Username & Password', 'Key Pair', 'OAuth']} describedBy={describedBy} />
                          )}
                       </Field>

                       {form.authMethod === 'Username & Password' && (
                         <div className="grid gap-token-4 sm:grid-cols-2 p-token-4 bg-surface-base rounded-md border border-border">
                           <Field id="username" label="Username" required error={errors.username}>
                             {(describedBy) => (
                               <TextInput id="username" value={form.username} onChange={(v) => updateForm('username', v)} invalid={!!errors.username} describedBy={describedBy} required autoComplete="new-password" /> // prevent autofill mess
                             )}
                           </Field>
                           <Field id="password" label="Password" required error={errors.password}>
                             {(describedBy) => (
                               <TextInput id="password" type="password" value={form.password} onChange={(v) => updateForm('password', v)} invalid={!!errors.password} describedBy={describedBy} required autoComplete="new-password" />
                             )}
                           </Field>
                         </div>
                       )}
                     </div>
                   </Section>
                 )}

                 {/* 4. Advanced Settings */}
                 {form.destinationType && (
                   <Section index="4" title="Advanced Configuration" description="Performance and network settings">
                     <div className="max-w-2xl space-y-token-5">
                        <Field id="networkType" label="Network Environment" hint="How ConnectIQ routes traffic to this destination">
                           {(describedBy) => (
                              <SelectInput id="networkType" value={form.networkType} onChange={(v) => updateForm('networkType', v)} options={['Public Internet', 'AWS PrivateLink', 'GCP Private Service Connect', 'Azure Private Link']} describedBy={describedBy} />
                           )}
                        </Field>

                        <div className="grid gap-token-4 sm:grid-cols-2">
                           <Field id="batchSize" label="Batch Size (Records)" required error={errors.batchSize}>
                             {(describedBy) => (
                               <TextInput id="batchSize" type="number" value={form.batchSize} onChange={(v) => updateForm('batchSize', v)} invalid={!!errors.batchSize} describedBy={describedBy} required />
                             )}
                           </Field>
                           <Field id="parallelWrites" label="Parallel Write Threads" required error={errors.parallelWrites}>
                             {(describedBy) => (
                               <TextInput id="parallelWrites" type="number" value={form.parallelWrites} onChange={(v) => updateForm('parallelWrites', v)} invalid={!!errors.parallelWrites} describedBy={describedBy} required />
                             )}
                           </Field>
                           <Field id="connectionTimeout" label="Connection Timeout (s)" required error={errors.connectionTimeout}>
                             {(describedBy) => (
                               <TextInput id="connectionTimeout" type="number" value={form.connectionTimeout} onChange={(v) => updateForm('connectionTimeout', v)} invalid={!!errors.connectionTimeout} describedBy={describedBy} required />
                             )}
                           </Field>
                           <Field id="retryAttempts" label="Retry Attempts" required error={errors.retryAttempts}>
                             {(describedBy) => (
                               <TextInput id="retryAttempts" type="number" value={form.retryAttempts} onChange={(v) => updateForm('retryAttempts', v)} invalid={!!errors.retryAttempts} describedBy={describedBy} required />
                             )}
                           </Field>
                        </div>
                     </div>
                   </Section>
                 )}
              </form>
           </div>

           {/* Right Column: Status / actions */}
           <div>
              <div className="sticky top-[140px] space-y-token-5">

                 {/* Validate / Test Connection Box */}
                 <div className="rounded-lg border border-border bg-surface-card shadow-card-sm overflow-hidden">
                    <div className="border-b border-border bg-surface-base px-token-4 py-token-3">
                       <h3 className="text-token-sm font-semibold text-text-primary m-0 flex items-center gap-2">
                         <Activity className="h-4 w-4 text-text-secondary" />
                         Connection Status
                       </h3>
                    </div>
                    <div className="p-token-4">
                       {!testResult && !isTesting && (
                         <div className="text-center py-4">
                           <p className="text-token-sm text-text-secondary mb-4">Run a connection test to validate configuration.</p>
                           <button
                             type="button"
                             onClick={handleTestConnection}
                             disabled={!isReadyToTest}
                             className="w-full h-9 rounded-md bg-surface-base border border-border text-token-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             Test Connection
                           </button>
                         </div>
                       )}

                       {isTesting && (
                         <div className="flex flex-col items-center justify-center py-6 gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-token-sm text-text-secondary m-0 animate-pulse">Testing connection...</p>
                         </div>
                       )}

                       {testResult && !isTesting && (
                         <div className="space-y-4">
                            <div className={`p-3 border rounded-md flex items-start gap-2 ${testResult.success ? 'bg-success-muted border-success-border' : 'bg-danger-muted border-danger-border'}`}>
                               {testResult.success ? <CheckCircle className="h-4 w-4 text-success mt-0.5" /> : <XCircle className="h-4 w-4 text-danger mt-0.5" />}
                               <p className={`text-token-sm m-0 ${testResult.success ? 'text-success-emphasis' : 'text-danger'}`}>{testResult.message}</p>
                            </div>

                            {testResult.success && testResult.checks && (
                              <div className="space-y-2 pt-2 border-t border-border">
                                <h4 className="text-token-xs font-semibold text-text-secondary uppercase">Diagnostics</h4>
                                <ul className="m-0 p-0 list-none space-y-1.5">
                                  <li className="flex justify-between text-token-sm">
                                    <span className="text-text-secondary">Network Resolvable</span>
                                    {testResult.checks.network ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
                                  </li>
                                  <li className="flex justify-between text-token-sm">
                                    <span className="text-text-secondary">Authentication</span>
                                    {testResult.checks.auth ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
                                  </li>
                                  <li className="flex justify-between text-token-sm">
                                    <span className="text-text-secondary">Permissions</span>
                                    {testResult.checks.permissions ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
                                  </li>
                                </ul>
                                <div className="pt-2 text-token-xs text-text-faint font-mono">Latency: {testResult.latencyMs}ms</div>
                              </div>
                            )}

                            <button
                             type="button"
                             onClick={handleTestConnection}
                             className="w-full h-8 rounded-md bg-transparent text-token-sm font-medium text-primary hover:bg-primary-muted transition-colors"
                           >
                             Re-run Test
                           </button>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Help Box */}
                 <div className="rounded-lg border border-border bg-surface-base px-token-4 py-token-4 shadow-sm">
                   <div className="flex gap-3">
                     <ShieldAlert className="h-5 w-5 text-warning-strong shrink-0" />
                     <div>
                       <h4 className="text-token-sm font-semibold text-text-primary m-0 mb-1">Secure Connections</h4>
                       <p className="text-token-sm text-text-secondary m-0">Connecting to cloud data warehouses often requires whitelisting ConnectIQ IPs. See our <a href="#" className="text-primary hover:underline">security documentation</a> for exact IP ranges.</p>
                     </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </AppShell>
  );
}
