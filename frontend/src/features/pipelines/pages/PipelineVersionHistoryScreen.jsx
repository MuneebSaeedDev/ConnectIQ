import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineHistory } from '../hooks/usePipelineHistory';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  User,
  ChevronRight,
  GitCommit,
  Layers,
  ArrowLeft
} from 'lucide-react';

export default function PipelineVersionHistoryScreen() {
  const { id: routePipelineId } = useParams();
  const navigate = useNavigate();
  const pipelineId = routePipelineId || 'pip_001';

  const {
    history,
    isLoading,
    isError,
    error,
    refetch,
    selectedVersion,
    setSelectedVersion,
    handleRollback,
    isRollingBack,
    actionFeedback,
  } = usePipelineHistory(pipelineId);

  if (isLoading) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Version History']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading version history…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Version History']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load Version History</h2>
          <p className="text-xs text-rose-700">{error?.message || 'Error communicating with history service'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition"
          >
            Retry Loading
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', pipelineId, 'Version History']}>
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {actionFeedback.type === 'success' && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
          {actionFeedback.type === 'error' && <AlertCircle className="size-4 text-rose-600 shrink-0" />}
          {actionFeedback.type === 'info' && <Info className="size-4 text-blue-600 shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
              <span className="hover:text-slate-800 transition cursor-pointer" onClick={() => navigate('/pipelines')}>Pipelines</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">Version History & Revisions</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <History className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Pipeline Revisions & Audit Log</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs"
          >
            <ArrowLeft className="size-3.5" /> Back to Pipeline
          </button>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Timeline / List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historical Versions ({history.length})</h2>
            <div className="space-y-3">
              {history.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-4 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GitCommit className="size-4 text-indigo-600" />
                        <span className="text-sm font-bold text-slate-900 font-mono">v{ver.version}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ver.tag === 'PRODUCTION' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ver.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed mb-3">
                      {ver.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <User className="size-3 text-slate-400" /> {ver.author.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version Diff & Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedVersion && (
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 font-mono">Version {selectedVersion.version} Details</h2>
                      <span className="text-xs font-mono text-slate-400">({selectedVersion.id})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Committed by {selectedVersion.author.name} on {new Date(selectedVersion.createdAt).toUTCString()}</p>
                  </div>

                  {selectedVersion.tag !== 'PRODUCTION' && (
                    <button
                      type="button"
                      onClick={() => handleRollback(selectedVersion)}
                      disabled={isRollingBack}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition shadow-xs disabled:opacity-50"
                    >
                      {isRollingBack ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                      Rollback to this Version
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Release Notes / Commit Message</h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 leading-relaxed font-mono">
                    {selectedVersion.message}
                  </div>
                </div>

                {/* Node Graph Structural Changes */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="size-3.5 text-slate-400" />
                    Topology Diffs
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-md">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Nodes Added</span>
                      <span className="text-sm font-bold text-emerald-950 font-mono">{selectedVersion.changes.added.length}</span>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">Nodes Modified</span>
                      <span className="text-sm font-bold text-amber-950 font-mono">{selectedVersion.changes.modified.length}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Nodes Removed</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">{selectedVersion.changes.removed.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
