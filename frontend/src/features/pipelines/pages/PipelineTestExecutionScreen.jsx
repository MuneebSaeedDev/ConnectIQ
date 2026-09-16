import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineTest } from '../hooks/usePipelineTest';
import {
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Clock,
  Layers,
  Terminal,
  Activity,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function PipelineTestExecutionScreen() {
  const { id: routePipelineId } = useParams();
  const navigate = useNavigate();
  const pipelineId = routePipelineId || 'pip_001';

  const {
    testResults,
    selectedStage,
    setSelectedStage,
    sampleSize,
    setSampleSize,
    mockInputs,
    setMockInputs,
    isRunning,
    handleRunTest,
    actionFeedback,
  } = usePipelineTest(pipelineId);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', pipelineId, 'Test Execution']}>
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
              <span className="text-slate-900 font-semibold">End-to-End Test Execution</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <PlayCircle className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">{testResults.pipelineName} — Sandbox Runner</h1>
            </div>
          </div>

          {/* Test Trigger Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Sample Rows:</span>
              <select
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
              >
                <option value={100}>100 rows</option>
                <option value={500}>500 rows</option>
                <option value={2000}>2,000 rows</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRunTest}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md transition shadow-xs disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <PlayCircle className="size-3.5" />}
              Execute Dry Run
            </button>
          </div>
        </div>
      </header>

      {/* Main Runner Console */}
      <main className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Tested</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{testResults.summary.totalRecordsTested}</span>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Target Loaded</span>
            <span className="text-xl font-bold text-emerald-900 font-mono">{testResults.summary.successfulRecords}</span>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Filtered Out</span>
            <span className="text-xl font-bold text-amber-900 font-mono">{testResults.summary.filteredRecords}</span>
          </div>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Validation Errors</span>
            <span className="text-xl font-bold text-rose-900 font-mono">{testResults.summary.failedValidation}</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Latency</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{testResults.summary.totalDurationMs}ms</span>
          </div>
        </div>

        {/* Stage Timeline and Stage Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Stage List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Topology Execution Stages</h2>
            <div className="space-y-2">
              {testResults.stages.map((stage, idx) => {
                const isSelected = selectedStage?.id === stage.id;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">{stage.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{stage.nodeId}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 block">
                        {stage.recordsOut} rows
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{stage.durationMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Log Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {selectedStage && (
              <div className="bg-slate-900 text-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-emerald-400" />
                    <span className="font-bold text-white">Stage Logs: {selectedStage.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                    {selectedStage.status} ({selectedStage.durationMs}ms)
                  </span>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
                  {selectedStage.logs.map((line, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span className="text-slate-300">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
