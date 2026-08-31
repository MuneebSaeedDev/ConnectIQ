import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  CONNECTION_METHOD_GROUPS,
  METHODS_BY_ID,
  METHOD_ORDER,
  SETUP_STEPS,
  resolveContinueTarget,
} from '../services/sourceConnectionSetup.api';

/**
 * SCR-047 — Source Connection Setup Screen. Node 115:29580, Figma page
 * "Page 1". This is the connection-METHOD chooser that fronts the Data
 * Sources setup flow: the user picks how they want to connect (Database,
 * REST API, CSV, Excel, FTP, SFTP, Webhook), reviews what that method
 * needs, then continues into configuration.
 *
 * MOCK BOUNDARY: MOD-006 backend is still PLANNED and the dedicated
 * per-type setup screens (SCR-048–SCR-054) are still DISCOVERED / not
 * routed. So `Continue` converges on the real, working Add Data Source
 * form (SCR-046, `/data-sources/new`) with the chosen method's connector
 * pre-selected via `?connector=`, rather than linking to a screen that
 * does not exist yet. That boundary is disclosed on-screen. See
 * services/sourceConnectionSetup.api.js.
 */
export default function SourceConnectionSetupScreen() {
  const navigate = useNavigate();
  const [methodId, setMethodId] = useState(null);
  const radiogroupRef = useRef(null);

  const selectedMethod = methodId ? METHODS_BY_ID[methodId] ?? null : null;
  const target = useMemo(() => (methodId ? resolveContinueTarget(methodId) : null), [methodId]);

  function onMethodKeyDown(e) {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const delta = keys[e.key];
    if (!delta) return;
    e.preventDefault();
    const current = METHOD_ORDER.indexOf(methodId);
    const base = current === -1 ? (delta > 0 ? -1 : 0) : current;
    const next = (base + delta + METHOD_ORDER.length) % METHOD_ORDER.length;
    const nextId = METHOD_ORDER[next];
    setMethodId(nextId);
    // Move focus to the newly selected radio for roving-tabindex a11y.
    const el = radiogroupRef.current?.querySelector(`[data-method-id="${nextId}"]`);
    if (el) el.focus();
  }

  function handleContinue() {
    if (!target) return;
    const query = target.connectorId ? `?connector=${encodeURIComponent(target.connectorId)}` : '';
    navigate(`${target.route}${query}`);
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Data', 'Data Sources', 'Connection Setup']}>
      <div className="flex flex-col gap-token-6">
        <Header onCancel={() => navigate('/data-sources')} />

        <span className="sr-only" role="status" aria-live="polite">
          {selectedMethod
            ? `${selectedMethod.name} connection method selected`
            : 'No connection method selected yet'}
        </span>

        <SampleDataNotice />

        <StepRail activeIndex={0} />

        <div className="grid grid-cols-1 gap-token-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <MethodPicker
            methodId={methodId}
            onSelect={setMethodId}
            onKeyDown={onMethodKeyDown}
            radiogroupRef={radiogroupRef}
          />
          <aside className="flex min-w-0 flex-col gap-token-5">
            <MethodDetail method={selectedMethod} target={target} />
            <HelpPanel />
          </aside>
        </div>

        <ActionBar
          method={selectedMethod}
          target={target}
          onCancel={() => navigate('/data-sources')}
          onContinue={handleContinue}
        />
      </div>
    </AppShell>
  );
}

/* ---- Header --------------------------------------------------------- */
function Header({ onCancel }) {
  return (
    <div className="flex flex-col gap-token-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">
          Set Up a Source Connection
        </h1>
        <p className="m-0 mt-token-1 max-w-2xl text-token-sm text-text-secondary-alt">
          Choose how you want to connect this data source. Each method collects the details it needs on the next step,
          then tests the connection before the source is created.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-token-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---- Mock-boundary disclosure --------------------------------------- */
function SampleDataNotice() {
  return (
    <div className="flex items-start gap-token-3 rounded-md border border-warning bg-warning-bg p-token-4" role="note">
      <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-warning-strong" />
      <div>
        <p className="m-0 flex items-center gap-token-2 text-token-sm font-semibold text-warning-strong">
          Sample data
          <span className="rounded-sm border border-warning bg-surface-card px-token-2 py-0.5 text-token-meta font-semibold uppercase tracking-[0.04em] text-warning-strong">
            No backend
          </span>
        </p>
        <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
          MOD-006 has no data-source backend yet, and the dedicated per-type setup screens are still planned. For now every
          method continues to the working Add Data Source form with the matching connector pre-selected.
        </p>
      </div>
    </div>
  );
}

/* ---- Step rail ------------------------------------------------------ */
function StepRail({ activeIndex }) {
  return (
    <ol className="flex flex-wrap items-center gap-token-2 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      {SETUP_STEPS.map((step, i) => {
        const active = i === activeIndex;
        const done = i < activeIndex;
        return (
          <li key={step.key} className="flex items-center gap-token-2">
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-token-meta font-semibold ${
                active
                  ? 'bg-primary text-text-on-primary'
                  : done
                    ? 'bg-success text-text-on-primary'
                    : 'bg-surface-muted text-text-faint'
              }`}
            >
              {done ? <IconCheck className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={`text-token-sm font-medium ${active ? 'text-text-primary-alt' : 'text-text-secondary-alt'}`}
              aria-current={active ? 'step' : undefined}
            >
              {step.label}
            </span>
            {i < SETUP_STEPS.length - 1 && (
              <span aria-hidden="true" className="mx-token-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---- Method picker (radiogroup) ------------------------------------- */
function MethodPicker({ methodId, onSelect, onKeyDown, radiogroupRef }) {
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-6 shadow-sm">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connection Method</h2>
      <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
        Select the source type that best matches where your data lives.
      </p>
      <div
        ref={radiogroupRef}
        role="radiogroup"
        aria-label="Connection method"
        onKeyDown={onKeyDown}
        className="mt-token-5 flex flex-col gap-token-5"
      >
        {CONNECTION_METHOD_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="m-0 mb-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">
              {group.group}
            </p>
            <div className="grid grid-cols-1 gap-token-3 sm:grid-cols-2">
              {group.methods.map((method) => {
                const selected = methodId === method.id;
                const isFirst = method.id === METHOD_ORDER[0];
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    data-method-id={method.id}
                    aria-checked={selected}
                    tabIndex={selected || (!methodId && isFirst) ? 0 : -1}
                    onClick={() => onSelect(method.id)}
                    className={`flex items-start gap-token-3 rounded-md border p-token-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      selected ? 'border-primary bg-shell-accent-wash' : 'border-border bg-surface-card hover:bg-surface-hover'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                        selected ? 'bg-primary text-text-on-primary' : 'bg-surface-muted text-text-secondary-alt'
                      }`}
                    >
                      <MethodIcon icon={method.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-token-2">
                        <span className={`text-token-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary-alt'}`}>
                          {method.name}
                        </span>
                        {selected && <IconCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </span>
                      <span className="mt-0.5 block text-token-meta text-text-faint">{method.subtitle}</span>
                      <span className="mt-token-2 block text-token-sm text-text-secondary-alt">{method.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Sidebar: selected method detail -------------------------------- */
function MethodDetail({ method, target }) {
  if (!method) {
    return (
      <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
        <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Connection Details</h2>
        <p className="m-0 mt-token-3 flex items-start gap-token-2 text-token-sm text-text-secondary-alt">
          <IconCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-faint" />
          Select a connection method to see what it needs and where you’ll continue.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-md border border-border bg-surface-card p-token-5 shadow-sm">
      <div className="flex items-center gap-token-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-shell-accent-wash text-primary"
        >
          <MethodIcon icon={method.icon} />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 truncate text-token-base font-semibold text-text-primary-alt">{method.name}</h2>
          <p className="m-0 truncate text-token-meta text-text-faint">{method.subtitle}</p>
        </div>
      </div>
      <p className="m-0 mt-token-4 text-token-sm text-text-secondary-alt">{method.description}</p>

      <div className="mt-token-4">
        <p className="m-0 mb-token-2 text-token-meta font-semibold uppercase tracking-[0.04em] text-text-faint">
          You’ll provide
        </p>
        <ul className="m-0 flex list-none flex-col gap-token-2 p-0">
          {method.requires.map((req) => (
            <li key={req} className="flex items-center gap-token-2 text-token-sm text-text-primary-alt">
              <IconCheck className="h-3.5 w-3.5 shrink-0 text-success" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-token-4 rounded-md bg-shell-accent-wash px-token-3 py-token-3">
        <p className="m-0 text-token-meta font-semibold text-primary">Next step</p>
        <p className="m-0 mt-0.5 text-token-meta text-text-secondary-alt">
          {target?.live
            ? `Continue to the dedicated ${method.name} setup screen (${target.plannedScreen ?? method.targetScreen}).`
            : target?.connectorName
              ? `Continue to the Add Data Source form with ${target.connectorName} pre-selected.`
              : 'Continue to the Add Data Source form to finish configuring this source.'}
        </p>
        {!target?.live && (
          <p className="m-0 mt-token-2 text-token-meta text-text-faint">
            Dedicated screen {target?.plannedScreen ?? method.targetScreen} ({target?.plannedRoute ?? method.targetRoute}) is planned.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---- Sidebar: help -------------------------------------------------- */
function HelpPanel() {
  return (
    <section className="rounded-md border border-border-subtle bg-surface-muted p-token-5">
      <h2 className="m-0 text-token-base font-semibold text-text-primary-alt">Not sure which to pick?</h2>
      <ul className="m-0 mt-token-3 flex list-none flex-col gap-token-2 p-0">
        <li className="text-token-sm text-text-secondary-alt">
          <span className="font-medium text-text-primary-alt">Live systems</span> — use Database or REST API for
          continuously synced data.
        </li>
        <li className="text-token-sm text-text-secondary-alt">
          <span className="font-medium text-text-primary-alt">One-off files</span> — use CSV or Excel upload.
        </li>
        <li className="text-token-sm text-text-secondary-alt">
          <span className="font-medium text-text-primary-alt">Scheduled drops</span> — use FTP or SFTP to poll a
          server.
        </li>
        <li className="text-token-sm text-text-secondary-alt">
          <span className="font-medium text-text-primary-alt">Push events</span> — use a Webhook so the source sends
          data to you.
        </li>
      </ul>
    </section>
  );
}

/* ---- Sticky action bar ---------------------------------------------- */
function ActionBar({ method, target, onCancel, onContinue }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-token-3 rounded-md border border-border bg-surface-card px-token-5 py-token-3 shadow-sm">
      <span className="flex items-center gap-token-2 text-token-sm text-text-secondary-alt">
        <span className={`h-1.5 w-1.5 rounded-full ${method ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
        {method
          ? `${method.name} selected${target?.connectorName ? ` · ${target.connectorName}` : ''}`
          : 'Choose a connection method to continue'}
      </span>
      <div className="flex items-center gap-token-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 items-center rounded-md border border-border bg-surface-card px-token-4 text-token-sm font-medium text-text-secondary-alt hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!method}
          className="flex h-8 items-center gap-token-2 rounded-md bg-primary px-token-4 text-token-sm font-semibold text-text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Continue
          <IconArrowRight />
        </button>
      </div>
    </div>
  );
}

/* ---- Inline icons (currentColor SVGs) ------------------------------- */
function MethodIcon({ icon }) {
  const common = {
    viewBox: '0 0 16 16',
    className: 'block h-4 w-4',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (icon) {
    case 'database':
      return (
        <svg {...common}>
          <ellipse cx="8" cy="3.5" rx="5" ry="2" />
          <path d="M3 3.5v9c0 1.1 2.2 2 5 2s5-.9 5-2v-9M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" />
        </svg>
      );
    case 'api':
      return (
        <svg {...common}>
          <path d="M5 2 2 8l3 6M11 2l3 6-3 6M9.5 3l-3 10" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M4 1.5h5L13 5v9.5H4V1.5Z" />
          <path d="M9 1.5V5h4" />
        </svg>
      );
    case 'transfer':
      return (
        <svg {...common}>
          <path d="M2 5h9M8 2l3 3-3 3M14 11H5m3 3-3-3 3-3" />
        </svg>
      );
    case 'webhook':
      return (
        <svg {...common}>
          <circle cx="5" cy="5" r="2.5" />
          <path d="M6.5 7 4 12h8M11 5l-3 7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
        </svg>
      );
  }
}

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}

function IconCircle({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3M8 5.5h.01" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg viewBox="0 0 16 16" className="block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h9M8 4l4 4-4 4" />
    </svg>
  );
}
