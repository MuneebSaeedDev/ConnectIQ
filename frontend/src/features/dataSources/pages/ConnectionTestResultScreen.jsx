import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useConnectionTestResult } from '../hooks/useConnectionTestResult';
import {
  ORG_ID,
  RESULT_BREAKDOWN,
  buildDiagnosticsText,
  saveValidatedConnection,
} from '../services/connectionTestResult.api';
import { downloadJson, downloadFile } from '../../../utils/exportHelper';

/* Result status → token utilities. Mapped to the verified Figma tones
   (node 124:45976): passed → success, partial/warning → warning,
   failed → danger, info/neutral → primary wash. No alpha modifiers on
   CSS-var tokens. */
const STATUS_TONE = {
  passed: { dot: 'bg-success', pill: 'border-success bg-success-bg text-success', text: 'text-success', icon: 'text-success' },
  granted: { dot: 'bg-success', pill: 'border-success bg-success-bg text-success', text: 'text-success', icon: 'text-success' },
  ok: { dot: 'bg-success', pill: 'border-success bg-success-bg text-success', text: 'text-success', icon: 'text-success' },
  partial: { dot: 'bg-warning', pill: 'border-warning bg-warning-bg text-warning-strong', text: 'text-warning-strong', icon: 'text-warning-strong' },
  warning: { dot: 'bg-warning', pill: 'border-warning bg-warning-bg text-warning-strong', text: 'text-warning-strong', icon: 'text-warning-strong' },
  failed: { dot: 'bg-danger', pill: 'border-danger-border bg-danger-bg text-danger-strong', text: 'text-danger-strong', icon: 'text-danger' },
  'not-required': { dot: 'bg-text-faint', pill: 'border-border bg-surface-muted text-text-secondary-alt', text: 'text-text-secondary-alt', icon: 'text-text-faint' },
  info: { dot: 'bg-primary', pill: 'border-primary bg-shell-accent-wash text-primary', text: 'text-primary', icon: 'text-primary' },
  neutral: { dot: 'bg-text-faint', pill: 'border-border bg-surface-muted text-text-secondary-alt', text: 'text-text-secondary-alt', icon: 'text-text-faint' },
  good: { dot: 'bg-success', pill: 'border-success bg-success-bg text-success', text: 'text-success', icon: 'text-success' },
  success: { dot: 'bg-success', pill: 'border-success bg-success-bg text-success', text: 'text-success', icon: 'text-success' },
};

function tone(key) {
  return STATUS_TONE[key] ?? STATUS_TONE.neutral;
}

const STATUS_LABEL = {
  passed: 'Passed', warning: 'Warning', failed: 'Failed', partial: 'Partial',
  granted: 'Granted', 'not-required': 'Not Required', ok: 'OK', info: 'Info',
};

/** SCR-055 — Connection Test Result Screen. Node 124:45976. */
export default function ConnectionTestResultScreen() {
  const navigate = useNavigate();
  const orgId = ORG_ID;
  const { data, isLoading, isError, error, refetch, isFetching } = useConnectionTestResult(orgId, null);

  const [diagFilter, setDiagFilter] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const liveRef = useRef(null);

  const result = data;

  async function handleCopyDiagnostics() {
    if (!result) return;
    const text = buildDiagnosticsText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleExportReport() {
    if (!result) return;
    downloadJson(result, `connection-test-result-${result.connectionId}`);
  }

  function handleExportDiagnostics() {
    if (!result) return;
    const text = buildDiagnosticsText(result);
    downloadFile(text, `diagnostics-${result.connectionId}.txt`, 'text/plain');
  }

  async function handleSave() {
    if (!result) return;
    setSaveState({ status: 'saving', message: '' });
    const res = await saveValidatedConnection(orgId, result.connectionId, {});
    if (res.mocked) {
      setSaveState({
        status: 'mocked',
        message:
          'MOD-006 has no data-source backend yet, so nothing was persisted. In a live environment this would activate the validated connection and return you to the source list.',
      });
    } else {
      setSaveState({ status: 'success', message: 'Connection saved.' });
      navigate('/data-sources');
    }
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Connectors', 'Connection Validation', 'Connection Test Result']}>
      <div className="flex flex-col gap-token-6">
        <span className="sr-only" role="status" aria-live="polite" ref={liveRef}>
          {isLoading
            ? 'Loading connection test result'
            : isError
              ? 'Could not load the connection test result'
              : saveState.status === 'saving'
                ? 'Saving connection'
                : saveState.status === 'mocked'
                  ? 'Connection save simulated — no backend available'
                  : result
                    ? `Connection test result loaded — ${result.statusLabel}, ${result.checksPassed} of ${result.checksTotal} checks passed`
                    : ''}
        </span>

        {isLoading && <ResultSkeleton />}

        {isError && (
          <div className="rounded-md border border-danger-border bg-danger-bg p-token-6" role="alert">
            <p className="m-0 text-token-base font-medium text-danger-strong">Couldn&rsquo;t load the connection test result</p>
            <p className="m-0 mt-token-1 text-token-sm text-danger">{error?.message ?? 'Something went wrong. Please try again.'}</p>
            <button type="button" onClick={() => refetch()} className="mt-token-4 h-8 rounded-md border border-danger-border bg-surface-card px-token-4 text-token-sm font-medium text-danger-strong hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Retry
            </button>
          </div>
        )}

        {result && (
          <>
            <Header result={result} mocked={result.mocked} onClose={() => navigate('/data-sources')} onCopy={handleCopyDiagnostics} copied={copied} onExport={handleExportReport} onRetry={() => refetch()} retrying={isFetching} onSave={handleSave} onViewConfig={() => navigate('/data-sources/new/connection')} saving={saveState.status === 'saving'} saved={saveState.status === 'mocked'} />

            {saveState.status === 'mocked' && (
              <div className="rounded-md border border-warning bg-warning-bg p-token-5" role="alert">
                <p className="m-0 text-token-base font-semibold text-warning-strong">Simulated save (no backend)</p>
                <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{saveState.message}</p>
              </div>
            )}

            <ResultBanner result={result} />

            <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-w-0 flex-col gap-token-6">
                <ValidationChecklist result={result} />
                <ConnectionInformation result={result} />
                <PerformanceMetrics result={result} />
                <SecurityValidation result={result} />
                <PermissionVerification result={result} />
                <Diagnostics result={result} filter={diagFilter} setFilter={setDiagFilter} onCopy={handleCopyDiagnostics} copied={copied} onExport={handleExportDiagnostics} />
                <ValidationHistory result={result} search={historySearch} setSearch={setHistorySearch} />
              </div>

              <aside className="flex min-w-0 flex-col gap-token-5">
                <TestSummary result={result} />
                <ValidationScore result={result} />
                <ConnectionHealthCard result={result} />
                <SecurityReviewCard result={result} />
                <Recommendations result={result} />
                <SaveConnectionCard onSave={handleSave} saving={saveState.status === 'saving'} saved={saveState.status === 'mocked'} />
              </aside>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ---- Header ---------------------------------------------------------- */
function Header({ result, mocked, onClose, onCopy, copied, onExport, onRetry, retrying, onViewConfig, onSave, saving, saved }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-token-3">
          <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">Connection Test Result</h1>
          {mocked && (
            <span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 font-mono text-token-xs font-semibold uppercase tracking-[0.04em] text-warning-strong" title="MOD-006 has no data-source backend deployed yet — showing sample data, not a live test.">
              Sample data
            </span>
          )}
        </div>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          Review validation results, diagnostics, security validation, and connection health for <span className="font-mono text-text-primary-alt">{result.connectionName}</span>.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button type="button" onClick={onClose} className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Close
        </button>
        <button type="button" onClick={onCopy} className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {copied ? <IconCheck className="h-3.5 w-3.5 text-success" /> : <IconCopy />}
          {copied ? 'Copied' : 'Copy Diagnostics'}
        </button>
        <button type="button" onClick={onExport} className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconDownload />
          Export Report
        </button>
        <button type="button" onClick={onViewConfig} className="flex h-8 items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <IconGear />
          View Configuration
        </button>
        <button type="button" onClick={onRetry} disabled={retrying} className="flex h-8 items-center gap-token-2 rounded-md border border-primary bg-surface-card px-token-4 text-token-sm font-semibold text-primary hover:bg-shell-accent-wash disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {retrying ? <IconSpinner /> : <IconRefresh />}
          {retrying ? 'Retesting…' : 'Retry Test'}
        </button>
        <button type="button" onClick={onSave} disabled={saving || saved} title={saved ? 'Connection already simulated — return to the list to add another.' : undefined} className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {saving ? <IconSpinner /> : <IconCheck className="h-3.5 w-3.5" />}
          Save Connection
        </button>
      </div>
    </div>
  );
}

/* ---- Result banner --------------------------------------------------- */
function ResultBanner({ result }) {
  const t = tone(result.status);
  const Icon = result.status === 'passed' ? IconCheckCircle : result.status === 'failed' ? IconXCircle : IconAlert;
  return (
    <div className={`flex flex-col gap-token-4 rounded-md border p-token-6 ${t.pill}`}>
      <div className="flex flex-col gap-token-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-token-3">
          <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${t.icon}`} />
          <div className="min-w-0">
            <p className={`m-0 text-token-lg font-bold ${t.text}`}>{result.statusLabel}</p>
            <p className="m-0 mt-0.5 font-mono text-token-sm text-text-primary-alt">{result.connectionName}</p>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{result.summary}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-baseline gap-token-2 rounded-md border border-border bg-surface-card px-token-4 py-token-3">
          <span className="text-token-xl font-bold text-text-primary-alt">{result.checksPassed}</span>
          <span className="text-token-base text-text-faint">/ {result.checksTotal}</span>
          <span className="text-token-sm text-text-secondary-alt">checks</span>
        </div>
      </div>
      <dl className="m-0 flex flex-wrap gap-x-token-6 gap-y-token-2 border-t border-border-subtle pt-token-4 text-token-meta">
        <MetaItem label="Duration" value={`${result.durationSeconds} s`} />
        <MetaItem label="Tested" value={result.testedAt} />
        <MetaItem label="Tested by" value={result.testedBy} />
        <MetaItem label="Environment" value={result.environment} />
        <MetaItem label="Type" value={result.connectorShort} />
      </dl>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="flex items-center gap-token-2">
      <dt className="text-text-faint">{label}</dt>
      <dd className="m-0 font-medium text-text-primary-alt">{value}</dd>
    </div>
  );
}

/* ---- Shared card + status primitives -------------------------------- */
function Card({ title, description, count, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <div className="flex items-start justify-between gap-token-3">
        <div className="min-w-0">
          <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">{title}</h2>
          {description && <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-token-2">
          {count && <span className="rounded-sm border border-border bg-surface-muted px-token-2 py-0.5 font-mono text-token-meta font-semibold text-text-secondary-alt">{count}</span>}
          {action}
        </div>
      </div>
      <div className="mt-token-5">{children}</div>
    </section>
  );
}

function StatusPill({ status }) {
  const t = tone(status);
  const label = STATUS_LABEL[status] ?? status;
  const Icon = status === 'passed' || status === 'granted' || status === 'ok' ? IconCheck : status === 'failed' ? IconX : status === 'not-required' ? IconMinus : IconAlert;
  return (
    <span className={`inline-flex items-center gap-token-1 rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${t.pill}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

/* ---- Section: Validation Checklist ---------------------------------- */
function ValidationChecklist({ result }) {
  return (
    <Card title="Validation Checklist" description="Sequential validation of all required connectivity, security, and permission checks." count={`${result.checksPassed} / ${result.checksTotal}`}>
      <ol className="m-0 flex list-none flex-col gap-token-2 p-0">
        {result.checklist.map((c) => {
          const t = tone(c.status);
          const Icon = c.status === 'passed' ? IconCheckCircle : c.status === 'failed' ? IconXCircle : IconAlert;
          return (
            <li key={c.step} className="flex items-start gap-token-3 rounded-md border border-border-subtle bg-surface-muted px-token-4 py-token-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.icon}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-token-2">
                  <span className="text-token-sm font-semibold text-text-primary-alt">{c.step}. {c.label}</span>
                  <span className="flex items-center gap-token-3">
                    {c.timing && c.timing !== '—' && <span className="font-mono text-token-meta text-text-faint">{c.timing}</span>}
                    <StatusPill status={c.status} />
                  </span>
                </div>
                <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{c.detail}</p>
                {c.note && (
                  <p className={`m-0 mt-token-1 flex items-start gap-token-1 text-token-meta ${t.text}`}>
                    <IconInfo className="mt-0.5 h-3 w-3 shrink-0" />
                    {c.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ---- Section: Connection Information -------------------------------- */
function ConnectionInformation({ result }) {
  return (
    <Card title="Connection Information" description="Operational metadata for the validated connection.">
      <dl className="m-0 grid grid-cols-1 gap-x-token-6 gap-y-token-3 sm:grid-cols-2">
        {result.connectionInfo.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-token-3 border-b border-border-subtle pb-token-2">
            <dt className="text-token-meta text-text-faint">{row.label}</dt>
            <dd className={`m-0 max-w-[60%] truncate text-right text-token-sm font-medium text-text-primary-alt ${row.mono ? 'font-mono' : ''}`} title={row.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/* ---- Section: Performance Metrics ----------------------------------- */
function PerformanceMetrics({ result }) {
  const { metrics, latencyBreakdown, network } = result.performance;
  const maxMs = Math.max(...latencyBreakdown.map((l) => l.ms), 1);
  return (
    <Card title="Performance Metrics" description="Latency breakdown, response timing, and network quality.">
      <div className="grid grid-cols-2 gap-token-3 sm:grid-cols-3">
        {metrics.map((m) => {
          const t = tone(m.tone);
          return (
            <div key={m.label} className="rounded-md border border-border-subtle bg-surface-muted p-token-4">
              <p className={`m-0 text-token-lg font-bold ${m.tone === 'warning' ? 'text-warning-strong' : 'text-text-primary-alt'}`}>{m.value}</p>
              <p className="m-0 mt-0.5 text-token-meta font-medium text-text-secondary-alt">{m.label}</p>
              <p className={`m-0 mt-0.5 text-token-meta ${t.text}`}>{m.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-token-5">
        <p className="m-0 mb-token-3 text-token-sm font-semibold text-text-primary-alt">Connection Latency Breakdown</p>
        <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
          {latencyBreakdown.map((l) => (
            <li key={l.label} className="flex items-center gap-token-3">
              <span className="w-36 shrink-0 text-token-meta text-text-secondary-alt">{l.label}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                <span className={`absolute inset-y-0 left-0 rounded-full ${l.ms >= 1000 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.max((l.ms / maxMs) * 100, 2)}%` }} />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-token-meta text-text-primary-alt">{l.ms.toLocaleString()} ms</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-token-5 rounded-md border border-border-subtle bg-surface-muted p-token-4">
        <div className="flex items-center justify-between">
          <p className="m-0 text-token-sm font-semibold text-text-primary-alt">Network Quality</p>
          <StatusPill status="good" />
        </div>
        <dl className="m-0 mt-token-3 grid grid-cols-2 gap-token-3 sm:grid-cols-4">
          <MiniStat label="Quality" value={network.quality} />
          <MiniStat label="Packet Loss" value={network.packetLoss} />
          <MiniStat label="Jitter" value={network.jitter} />
          <MiniStat label="Bandwidth" value={network.bandwidth} />
        </dl>
      </div>
    </Card>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className="m-0 text-token-sm font-semibold text-text-primary-alt">{value}</dd>
    </div>
  );
}

/* ---- Section: Security Validation ----------------------------------- */
function SecurityValidation({ result }) {
  const { checks, callout, warnings } = result.security;
  return (
    <Card title="Security Validation" description="Encryption, TLS configuration, certificate status, and compliance." count={`${warnings} Warning`}>
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <table className="w-full border-collapse text-token-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Security Check</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Value</th>
              <th scope="col" className="px-token-4 py-token-2 text-right text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Result</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.check} className="border-t border-border-subtle">
                <td className="px-token-4 py-token-2 font-medium text-text-primary-alt">{c.check}</td>
                <td className="px-token-4 py-token-2 font-mono text-token-meta text-text-secondary-alt">{c.value}</td>
                <td className="px-token-4 py-token-2 text-right"><StatusPill status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-token-4 flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4">
        <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-strong" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-token-sm font-semibold text-warning-strong">{callout.title}</p>
          <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{callout.body}</p>
        </div>
        <a href="https://docs.snowflake.com/en/user-guide/client-connectivity-troubleshooting/overview" target="_blank" rel="noreferrer" className="shrink-0 text-token-meta font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Docs →
        </a>
      </div>
    </Card>
  );
}

/* ---- Section: Permission Verification ------------------------------- */
function PermissionVerification({ result }) {
  const { rows, granted, notRequired, denied } = result.permissions;
  return (
    <Card title="Permission Verification" description="Validated access rights, privilege scope, and resource grants.">
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <table className="w-full border-collapse text-token-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Permission</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Scope</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Grant</th>
              <th scope="col" className="px-token-4 py-token-2 text-right text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Verified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.permission}-${r.scope}-${i}`} className="border-t border-border-subtle">
                <td className="px-token-4 py-token-2 font-mono font-medium text-text-primary-alt">{r.permission}</td>
                <td className="px-token-4 py-token-2 text-token-meta text-text-secondary-alt">{r.scope}</td>
                <td className="px-token-4 py-token-2 font-mono text-token-meta text-text-secondary-alt">{r.grant}</td>
                <td className="px-token-4 py-token-2 text-right"><StatusPill status={r.verified} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-token-3 flex flex-wrap gap-token-4 text-token-meta">
        <span className="flex items-center gap-token-1 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />{granted} permissions granted</span>
        <span className="flex items-center gap-token-1 text-text-secondary-alt"><span className="h-1.5 w-1.5 rounded-full bg-text-faint" aria-hidden="true" />{notRequired} not required (expected)</span>
        <span className="flex items-center gap-token-1 text-text-secondary-alt"><span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />{denied} denied</span>
      </div>
    </Card>
  );
}

/* ---- Section: Diagnostics ------------------------------------------- */
function Diagnostics({ result, filter, setFilter, onCopy, copied, onExport }) {
  const q = filter.trim().toLowerCase();
  const rows = useMemo(
    () => result.diagnostics.filter((d) => !q || `${d.category} ${d.key} ${d.value}`.toLowerCase().includes(q)),
    [result.diagnostics, q],
  );
  const action = (
    <div className="flex items-center gap-token-2">
      <button type="button" onClick={onCopy} className="flex h-7 items-center gap-token-1 rounded-md border border-border bg-surface-card px-token-3 text-token-meta font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {copied ? <IconCheck className="h-3 w-3 text-success" /> : <IconCopy className="h-3 w-3" />}
        {copied ? 'Copied' : 'Copy Diagnostics'}
      </button>
      <button type="button" onClick={onExport} className="flex h-7 items-center gap-token-1 rounded-md border border-border bg-surface-card px-token-3 text-token-meta font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <IconDownload className="h-3 w-3" />
        Export
      </button>
    </div>
  );
  return (
    <Card title="Diagnostics" description="Structured technical diagnostics for network, auth, security, server, and resources." action={action}>
      <div className="mb-token-3">
        <label htmlFor="diag-filter" className="sr-only">Filter diagnostics</label>
        <input id="diag-filter" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter diagnostics..." className="h-9 w-full rounded-md border border-border bg-surface-card px-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary sm:max-w-xs" />
      </div>
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <table className="w-full border-collapse text-token-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Category</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Key</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Value</th>
              <th scope="col" className="px-token-4 py-token-2 text-right text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-token-4 py-token-6 text-center text-token-sm text-text-faint">No diagnostics match &ldquo;{filter}&rdquo;.</td></tr>
            ) : (
              rows.map((d, i) => (
                <tr key={`${d.category}-${d.key}-${i}`} className="border-t border-border-subtle">
                  <td className="px-token-4 py-token-2 text-token-meta font-medium text-text-secondary-alt">{d.category}</td>
                  <td className="px-token-4 py-token-2 text-text-primary-alt">{d.key}</td>
                  <td className="px-token-4 py-token-2 font-mono text-token-meta text-text-secondary-alt">{d.value}</td>
                  <td className="px-token-4 py-token-2 text-right">
                    <span className={`inline-flex h-2 w-2 rounded-full ${tone(d.status).dot}`} aria-hidden="true" />
                    <span className="sr-only">{STATUS_LABEL[d.status] ?? d.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---- Section: Validation History ------------------------------------ */
function ValidationHistory({ result, search, setSearch }) {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const q = search.trim().toLowerCase();
  const rows = useMemo(
    () => result.history.filter((h) => !q || `${h.timestamp} ${h.result} ${h.testedBy} ${h.environment}`.toLowerCase().includes(q)),
    [result.history, q],
  );
  return (
    <Card title="Validation History" description="Recent validation executions for this connection configuration.">
      <div className="mb-token-3">
        <label htmlFor="history-search" className="sr-only">Search validation history</label>
        <input id="history-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..." className="h-9 w-full rounded-md border border-border bg-surface-card px-3 text-token-sm text-text-primary-alt placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary sm:max-w-xs" />
      </div>
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <table className="w-full border-collapse text-token-sm">
          <thead>
            <tr className="bg-surface-muted text-left">
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Timestamp</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Result</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Duration</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Tested By</th>
              <th scope="col" className="px-token-4 py-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Environment</th>
              <th scope="col" className="px-token-4 py-token-2 text-right text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-token-4 py-token-6 text-center text-token-sm text-text-faint">No history matches &ldquo;{search}&rdquo;.</td></tr>
            ) : (
              rows.map((h, i) => (
                <tr key={`${h.timestamp}-${i}`} className={`border-t border-border-subtle ${h.current ? 'bg-shell-accent-wash' : ''}`}>
                  <td className="px-token-4 py-token-2 font-mono text-token-meta text-text-primary-alt">
                    {h.timestamp}
                    {h.current && <span className="ml-token-2 rounded-sm border border-primary bg-surface-card px-token-1 py-0 text-token-xs font-semibold text-primary">current</span>}
                  </td>
                  <td className="px-token-4 py-token-2"><StatusPill status={h.result} /></td>
                  <td className="px-token-4 py-token-2 font-mono text-token-meta text-text-secondary-alt">{h.duration}</td>
                  <td className="px-token-4 py-token-2 text-token-meta text-text-secondary-alt">{h.testedBy}</td>
                  <td className="px-token-4 py-token-2 text-token-meta text-text-secondary-alt">{h.environment}</td>
                  <td className="px-token-4 py-token-2 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedHistory(h)}
                      className="text-token-meta font-semibold text-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim p-4" onClick={() => setSelectedHistory(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-surface-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="m-0 text-token-base font-bold text-text-primary-alt">Validation Run Details</h3>
              <button
                type="button"
                onClick={() => setSelectedHistory(null)}
                className="text-text-faint hover:text-text-primary-alt"
              >
                ✕
              </button>
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-token-sm">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <dt className="text-text-faint">Timestamp:</dt>
                <dd className="font-mono font-medium text-text-primary-alt">{selectedHistory.timestamp}</dd>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <dt className="text-text-faint">Result:</dt>
                <dd><StatusPill status={selectedHistory.result} /></dd>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <dt className="text-text-faint">Duration:</dt>
                <dd className="font-mono text-text-primary-alt">{selectedHistory.duration}</dd>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <dt className="text-text-faint">Tested By:</dt>
                <dd className="text-text-primary-alt">{selectedHistory.testedBy}</dd>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <dt className="text-text-faint">Environment:</dt>
                <dd className="text-text-primary-alt">{selectedHistory.environment}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistory(null)}
                className="h-8 rounded-md bg-primary px-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---- Sidebar shared card -------------------------------------------- */
function SidebarCard({ title, action, children }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center justify-between gap-token-2">
        <h2 className="m-0 text-token-sm font-semibold text-text-primary-alt">{title}</h2>
        {action}
      </div>
      <div className="mt-token-3">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-token-3 py-token-1">
      <dt className="text-token-meta text-text-faint">{label}</dt>
      <dd className={`m-0 max-w-[60%] truncate text-right text-token-meta font-medium text-text-primary-alt ${mono ? 'font-mono' : ''}`} title={typeof value === 'string' ? value : undefined}>{value || '—'}</dd>
    </div>
  );
}

/* ---- Sidebar: Test Summary ------------------------------------------ */
function TestSummary({ result }) {
  const t = tone(result.status);
  return (
    <SidebarCard title="Test Summary" action={<span className={`rounded-sm border px-token-2 py-0.5 text-token-meta font-semibold ${t.pill}`}>{result.statusLabel}</span>}>
      <p className="m-0 font-mono text-token-sm font-semibold text-text-primary-alt">{result.connectionName}</p>
      <p className="m-0 mt-0.5 text-token-meta text-text-faint">{result.connectorShort} · {result.environment}</p>
      <dl className="m-0 mt-token-3 flex flex-col divide-y divide-border-subtle">
        <SummaryRow label="Type" value={result.connectorShort} />
        <SummaryRow label="Status" value={result.statusLabel} />
        <SummaryRow label="Duration" value={`${result.durationSeconds} s`} />
        <SummaryRow label="Last Tested" value={result.testedAt.split(' · ')[1] ?? result.testedAt} />
        <SummaryRow label="Tested By" value={result.testedBy.split('@')[0]} />
        <SummaryRow label="Environment" value={result.environment} />
        <SummaryRow label="Checks" value={`${result.checksPassed} / ${result.checksTotal}`} />
      </dl>
    </SidebarCard>
  );
}

/* ---- Sidebar: Validation Score -------------------------------------- */
function ValidationScore({ result }) {
  const score = result.validationScore;
  const b = RESULT_BREAKDOWN;
  return (
    <SidebarCard title="Validation Score">
      <div className="flex items-center gap-token-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" role="img" aria-label={`Validation score ${score} percent`}>
            <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-border-subtle" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-warning" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${score}, 100`} />
          </svg>
          <span className="absolute text-token-base font-bold text-text-primary-alt">{score}%</span>
        </div>
        <div className="min-w-0">
          <p className="m-0 text-token-sm font-semibold text-text-primary-alt">{score}% readiness</p>
          <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{b.passed.count} passed · {b.warnings.count} warning · {b.info.count} info</p>
        </div>
      </div>
      <dl className="m-0 mt-token-4 grid grid-cols-2 gap-token-3">
        <ScoreStat label={b.passed.label} count={b.passed.count} note={b.passed.note} status="passed" />
        <ScoreStat label={b.warnings.label} count={b.warnings.count} note={b.warnings.note} status="warning" />
        <ScoreStat label={b.info.label} count={b.info.count} note={b.info.note} status="info" />
        <ScoreStat label={b.failed.label} count={b.failed.count} note={b.failed.note} status={b.failed.count > 0 ? 'failed' : 'neutral'} />
      </dl>
    </SidebarCard>
  );
}

function ScoreStat({ label, count, note, status }) {
  const t = tone(status);
  return (
    <div className="rounded-md border border-border-subtle bg-surface-muted p-token-3">
      <div className="flex items-center gap-token-2">
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
        <span className="text-token-meta font-medium text-text-secondary-alt">{label}</span>
      </div>
      <p className={`m-0 mt-0.5 text-token-base font-bold ${t.text}`}>{count}</p>
      <p className="m-0 text-token-meta text-text-faint">{note}</p>
    </div>
  );
}

/* ---- Sidebar: Connection Health ------------------------------------- */
function ConnectionHealthCard({ result }) {
  const h = result.health;
  const metrics = [
    { label: 'Availability', value: h.availability },
    { label: 'Response Time', value: h.responseTime },
    { label: 'Auth Latency', value: h.authLatency },
    { label: 'Schema Speed', value: h.schemaSpeed },
    { label: 'Metadata Speed', value: h.metadataSpeed },
    { label: 'Network Quality', value: h.networkQuality },
    { label: 'Packet Loss', value: h.packetLoss },
  ];
  return (
    <SidebarCard title="Connection Health" action={<span className="rounded-sm border border-success bg-success-bg px-token-2 py-0.5 text-token-meta font-semibold text-success">{h.status}</span>}>
      <dl className="m-0 grid grid-cols-2 gap-token-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="text-token-meta text-text-faint">{m.label}</dt>
            <dd className="m-0 text-token-sm font-semibold text-text-primary-alt">{m.value}</dd>
          </div>
        ))}
      </dl>
    </SidebarCard>
  );
}

/* ---- Sidebar: Security Review --------------------------------------- */
function SecurityReviewCard({ result }) {
  const s = result.securityReview;
  return (
    <SidebarCard title="Security Review" action={<span className="rounded-sm border border-warning bg-warning-bg px-token-2 py-0.5 text-token-meta font-semibold text-warning-strong">{s.warnings} Warning</span>}>
      <dl className="m-0 flex flex-col divide-y divide-border-subtle">
        {s.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-token-3 py-token-1">
            <dt className="flex items-center gap-token-2 text-token-meta text-text-secondary-alt">
              <span className={`h-1.5 w-1.5 rounded-full ${tone(r.status).dot}`} aria-hidden="true" />
              {r.label}
            </dt>
            <dd className={`m-0 text-token-meta font-medium ${r.status === 'warning' ? 'text-warning-strong' : 'text-text-primary-alt'}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-token-3 flex items-start gap-token-2 rounded-md bg-warning-bg px-token-3 py-token-2 text-token-meta text-warning-strong">
        <IconAlert className="mt-0.5 h-3 w-3 shrink-0" />
        {s.note}
      </p>
    </SidebarCard>
  );
}

/* ---- Sidebar: Recommendations --------------------------------------- */
function Recommendations({ result }) {
  return (
    <SidebarCard title="Recommendations">
      <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
        {result.recommendations.map((r) => {
          const t = tone(r.tone);
          return (
            <li key={r.title} className="flex items-start gap-token-2 rounded-md border border-border-subtle bg-surface-muted p-token-3">
              <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="m-0 text-token-meta font-semibold text-text-primary-alt">{r.title}</p>
                <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">{r.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </SidebarCard>
  );
}

/* ---- Sidebar: Save Connection --------------------------------------- */
function SaveConnectionCard({ onSave, saving, saved }) {
  return (
    <SidebarCard title="Save Connection">
      <p className="m-0 text-token-meta text-text-secondary-alt">
        {saved
          ? 'This connection was simulated — no MOD-006 backend is deployed yet, so nothing was persisted.'
          : 'Activate this validated connection and add it to your data sources.'}
      </p>
      <button type="button" onClick={onSave} disabled={saving || saved} className="mt-token-3 flex h-9 w-full items-center justify-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {saving ? <IconSpinner /> : <IconCheck className="h-3.5 w-3.5" />}
        {saving ? 'Saving…' : saved ? 'Saved (simulated)' : 'Save Connection'}
      </button>
    </SidebarCard>
  );
}

/* ---- Loading skeleton ----------------------------------------------- */
function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-token-6" aria-hidden="true">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-28 animate-pulse rounded-md border border-border bg-surface-muted" />
      <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-token-6">
          <div className="h-96 animate-pulse rounded-md border border-border bg-surface-muted" />
          <div className="h-64 animate-pulse rounded-md border border-border bg-surface-muted" />
        </div>
        <div className="flex flex-col gap-token-5">
          <div className="h-64 animate-pulse rounded-md border border-border bg-surface-muted" />
          <div className="h-48 animate-pulse rounded-md border border-border bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor) ------------------------------------ */
function IconCheck({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 4.5 6 12 2.5 8.5" />
    </svg>
  );
}

function IconX({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4 4 12M4 4l8 8" />
    </svg>
  );
}

function IconMinus({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 8h9" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.25 8 7.25 10 10.75 6" />
    </svg>
  );
}

function IconXCircle({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M10 6 6 10M6 6l4 4" />
    </svg>
  );
}

function IconAlert({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.75 1.75 13.25h12.5L8 1.75Z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}

function IconInfo({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5M8 5.25h.01" />
    </svg>
  );
}

function IconCopy({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.25" y="5.25" width="8" height="8" rx="1.25" />
      <path d="M10.75 5.25V3.5a1.25 1.25 0 0 0-1.25-1.25h-6A1.25 1.25 0 0 0 2.25 3.5v6a1.25 1.25 0 0 0 1.25 1.25h1.75" />
    </svg>
  );
}

function IconDownload({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.5v7M4.75 6.75 8 10l3.25-3.25M2.75 12.5h10.5" />
    </svg>
  );
}

function IconGear({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v1.75M8 12.75v1.75M14.5 8h-1.75M3.25 8H1.5M12.6 3.4l-1.24 1.24M4.64 11.36 3.4 12.6M12.6 12.6l-1.24-1.24M4.64 4.64 3.4 3.4" />
    </svg>
  );
}

function IconRefresh({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
    </svg>
  );
}

function IconSpinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
