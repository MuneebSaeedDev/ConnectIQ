import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Play,
  Share2,
  Layers,
  ArrowRight,
  DatabaseZap,
  Sliders,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function PipelineReviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pipelineId = id || 'pip_001';

  const [isPublishing, setIsPublishing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      showFeedback('success', 'Pipeline published successfully! It is now active and ready for execution.');
      setTimeout(() => {
        navigate(`/pipelines/${pipelineId}/builder`);
      }, 1500);
    }, 1000);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Review & Deploy']}>
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 bg-emerald-50 text-emerald-900 border-emerald-300"
        >
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <FileCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-slate-900">Pipeline Review &amp; Deployment</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Publish
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Final validation check across sources, transformations, parameters, schedules, and destination sinks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/pipelines/${pipelineId}/builder`}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              Back to Canvas
            </Link>
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              {isPublishing ? 'Publishing Pipeline...' : 'Publish & Deploy Pipeline'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Top Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Pipeline Nodes</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">5</span>
              <span className="text-xs text-emerald-600 font-semibold">100% Validated</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Data Flow Schema</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">14</span>
              <span className="text-xs text-slate-500">Target Columns</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Schedule Policy</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-900">0 0 * * *</span>
              <span className="text-xs text-slate-500">Daily UTC</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Estimated Throughput</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">~120k</span>
              <span className="text-xs text-slate-500">Records / Run</span>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            Pre-flight Validation Checks
          </h2>

          <div className="space-y-3 text-xs divide-y divide-slate-100">
            {[
              { title: 'Source Connection Verified', desc: 'Shopify PostgreSQL connector authenticated and schema synced.', status: 'Passed' },
              { title: 'Data Cleaning & Normalization', desc: 'Trim and case normalization rules active with 0 syntax errors.', status: 'Passed' },
              { title: 'Type Conversion Safety', desc: 'All type casts have safe fallback defaults configured for malformed records.', status: 'Passed' },
              { title: 'Target Destination Sink', desc: 'Snowflake analytics warehouse permissions and table existence confirmed.', status: 'Passed' },
              { title: 'Dead-letter & Retry Handlers', desc: 'Failed records automatically routed to dead_letter_customer_sink table.', status: 'Passed' },
            ].map((check, idx) => (
              <div key={idx} className="pt-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">{check.title}</span>
                    <span className="text-slate-500 mt-0.5 block">{check.desc}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DAG Stages Review */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="size-4 text-blue-600" />
            Configured Pipeline Execution Sequence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { step: '1. Source', name: 'PostgreSQL Store', badge: 'Source' },
              { step: '2. Filter', name: 'Valid Orders Only', badge: 'Filter' },
              { step: '3. Transform', name: 'Clean & Format', badge: 'Transform' },
              { step: '4. Validate', name: 'Schema Integrity', badge: 'Validate' },
              { step: '5. Sink', name: 'Snowflake Warehouse', badge: 'Destination' },
            ].map((node, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">{node.step}</span>
                <span className="font-bold text-slate-900 block truncate">{node.name}</span>
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-white border border-slate-200 rounded text-slate-700">
                  {node.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
