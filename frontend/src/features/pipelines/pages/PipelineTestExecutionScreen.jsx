import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineTest } from '../hooks/usePipelineTest';
import {
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Terminal,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  XCircle,
  Clock,
  Layers,
  FileJson,
  X,
  Search,
  Square,
  ArrowRight
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

  const [activeTab, setActiveTab] = useState('logs'); // logs | input | output
  const [logFilter, setLogFilter] = useState('all'); // all | error | info
  const [searchTerm, setSearchTerm] = useState('');

  // Status badge config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'PASSED':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'FAILED':
      case 'ERROR':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle };
      case 'WARNING':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle };
      case 'RUNNING':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Loader2, spin: true };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: Info };
    }
  };

  const PipelineStatus = getStatusConfig(testResults?.summary?.status || 'PENDING');

  // Filter logs safely
  const filteredLogs = selectedStage?.logs?.filter(log => {
     if (logFilter === 'error' && !log.toLowerCase().includes('fail') && !log.toLowerCase().includes('error')) return false;
     if (searchTerm && !log.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  }) || [];

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
          <button onClick={() => {}} className="ml-2 text-current opacity-70 hover:opacity-100"><X className="size-3" /></button>
        </div>
      )}

      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

        {/* Warning Banner: Test mode only */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2">
            <ShieldAlert className="size-4 text-amber-600" />
            <p className="text-[13px] text-amber-900 font-medium">Pipeline Test Execution mode. External system side effects may occur depending on your destination node configuration.</p>
        </div>

        <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
              <button type="button" className="hover:text-slate-800 transition flex items-center gap-1" onClick={() => navigate('/pipelines')}>
                <ArrowLeft className="size-3" />
                Back to Builder
              </button>
              <span className="text-slate-300">|</span>
              <span>Pipelines</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span>{testResults?.pipelineName || 'Pipeline'}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">Test Execution</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className={`size-8 rounded-lg flex items-center justify-center border ${PipelineStatus.bg} ${PipelineStatus.border} ${PipelineStatus.text}`}>
                <PipelineStatus.icon className={`size-4 ${PipelineStatus.spin ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-lg font-bold text-slate-900 leading-tight">{testResults?.pipelineName || 'Pipeline'}</h1>
                 <span className="text-[11px] text-slate-500 font-medium font-mono">v{testResults?.version || '1.0.0'} • {testResults?.environment || 'Staging Sandbox'}</span>
              </div>
            </div>
          </div>

          {/* Test Trigger Controls */}
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">

            <div className="flex items-center gap-4 border-r border-slate-200 pr-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sample Size</label>
                <select
                  value={sampleSize}
                  disabled={isRunning}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono text-slate-700 disabled:opacity-50"
                >
                  <option value={100}>100 records</option>
                  <option value={500}>500 records</option>
                  <option value={2000}>2,000 records</option>
                </select>
              </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Use Mock Inputs</label>
                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                      <input
                         type="checkbox"
                         disabled={isRunning}
                         checked={mockInputs}
                         onChange={() => setMockInputs(!mockInputs)}
                         className="rounded text-primary border-slate-300 focus:ring-primary disabled:opacity-50"
                      />
                      <span className="text-xs text-slate-700 font-medium">Enabled</span>
                  </label>
               </div>
            </div>

            <div className="flex items-center gap-2">
                {isRunning && (
                     <button
                     type="button"
                     className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-md transition shadow-sm"
                   >
                     <Square className="size-3.5 fill-current" />
                     Stop Test
                   </button>
                )}
                <button
                type="button"
                onClick={handleRunTest}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 active:bg-primary/95 rounded-md transition shadow-xs disabled:opacity-50"
                >
                {isRunning ? (
                    <>
                    <Loader2 className="size-4 animate-spin" />
                    Running...
                    </>
                ) : (
                    <>
                    <PlayCircle className="size-4" />
                    Run Test
                    </>
                )}
                </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Runner Console */}
      <main className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">

        {/* Execution Summary/KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] xl:col-span-1">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-mono">{testResults?.summary?.totalDurationMs || 0}ms</span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] xl:col-span-1">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Layers className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tested</span>
            </div>
            <span className="text-xl font-bold text-slate-900 font-mono">{testResults?.summary?.totalRecordsTested || 0}</span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] xl:col-span-1">
             <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <CheckCircle2 className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Loaded</span>
            </div>
            <span className="text-xl font-bold text-emerald-900 font-mono">{testResults?.summary?.successfulRecords || 0}</span>
            <div className="mt-1 text-[10px] text-emerald-700">100% of pipeline</div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] xl:col-span-1">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Filter className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Filtered</span>
            </div>
            <span className="text-xl font-bold text-amber-900 font-mono">{testResults?.summary?.filteredRecords || 0}</span>
            <div className="mt-1 text-[10px] text-amber-700">Records skipped</div>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] xl:col-span-2">
             <div className="flex items-center gap-2 text-rose-700 mb-2">
                <XCircle className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Errors / Failed Validation</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-rose-900 font-mono">{testResults?.summary?.failedValidation || 0}</span>
                <button type="button" className="text-[11px] font-medium text-rose-700 bg-white border border-rose-200 px-2 py-1 rounded hover:bg-rose-100">
                    View Failed Records
                </button>
            </div>
          </div>
        </div>

        {/* Stage Timeline and Stage Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Node Execution Sequence */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                 <h2 className="text-[13px] font-bold text-slate-800">Execution Sequence</h2>
                 <span className="text-[11px] text-slate-500 font-medium">{testResults?.stages?.length || 0} Nodes</span>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto max-h-[600px]">
              {testResults?.stages?.map((stage, idx) => {
                const isSelected = selectedStage?.id === stage.id;
                const StageStatus = getStatusConfig(stage.status);

                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`p-3 rounded-md transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'border border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    {/* Node Connector Line (visual) */}
                    {idx < (testResults?.stages?.length || 0) - 1 && (
                         <div className="absolute left-[27px] top-[40px] bottom-[-16px] w-[2px] bg-slate-200 z-0" />
                    )}

                    <div className="relative z-10 flex items-start gap-3">
                      <div className={`mt-0.5 size-8 shrink-0 rounded border flex items-center justify-center bg-white ${StageStatus.border} ${StageStatus.text}`}>
                        <StageStatus.icon className={`size-4 ${StageStatus.spin ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-[13px] font-bold block truncate ${isSelected ? 'text-primary' : 'text-slate-900'}`}>{stage.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono shrink-0">{stage.durationMs}ms</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block truncate mb-2">{stage.nodeId}</span>

                        {/* Node mini-stats */}
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                           <div className="flex items-center gap-1" title="Records In">
                               <ArrowRight className="size-3 text-slate-400" /> {stage.recordsIn}
                           </div>
                           <div className="flex items-center gap-1" title="Records Out">
                               <ArrowRight className="size-3 text-slate-400" /> {stage.recordsOut}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector */}
          <div className="lg:col-span-8 space-y-4">
            {selectedStage ? (
               <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[650px]">

                  {/* Inspector Header */}
                  <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">{selectedStage.name}</h3>
                          <span className="text-[11px] text-slate-500 font-mono">Node ID: {selectedStage.nodeId}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded border ${getStatusConfig(selectedStage.status).bg} ${getStatusConfig(selectedStage.status).text} ${getStatusConfig(selectedStage.status).border}`}>
                            {selectedStage.status}
                         </span>
                         <button type="button" className="text-[13px] text-slate-600 font-medium border border-slate-300 rounded px-3 py-1.5 bg-white hover:bg-slate-50 transition shadow-xs">
                            Edit configuration
                         </button>
                      </div>
                  </div>

                  {/* Inspector Tabs */}
                  <div className="flex border-b border-slate-200 px-2 bg-slate-50/50">
                     <button
                        type="button"
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                         <Terminal className="size-4" /> Execution Logs
                     </button>
                     <button
                         type="button"
                         onClick={() => setActiveTab('input')}
                        className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'input' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                         <FileJson className="size-4" /> Input Sample
                     </button>
                     <button
                         type="button"
                         onClick={() => setActiveTab('output')}
                        className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'output' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                         <FileJson className="size-4" /> Output Sample
                     </button>
                  </div>

                  {/* Tab Content: Logs */}
                  {activeTab === 'logs' && (
                     <div className="flex-1 flex flex-col bg-[#0f172a]">

                        {/* Log controls */}
                        <div className="p-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-900">
                           <div className="flex items-center gap-2">
                               <div className="relative">
                                  <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                     type="text"
                                     placeholder="Search logs..."
                                     value={searchTerm}
                                     onChange={(e) => setSearchTerm(e.target.value)}
                                     className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:border-emerald-500 font-mono"
                                  />
                               </div>
                               <select
                                   value={logFilter}
                                   onChange={(e) => setLogFilter(e.target.value)}
                                   className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
                               >
                                  <option value="all">All Levels</option>
                                  <option value="error">Errors & Warnings</option>
                               </select>
                           </div>
                           <button type="button" className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[11px] font-semibold">
                               <RefreshCcw className="size-3" /> Auto-scroll
                           </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs">
                          {filteredLogs.length > 0 ? (
                              <div className="space-y-1.5">
                                {filteredLogs.map((line, i) => {
                                  const isError = line.toLowerCase().includes('fail') || line.toLowerCase().includes('error');
                                  const isWarn = line.toLowerCase().includes('warn');
                                  return (
                                    <div key={i} className={`flex gap-3 leading-relaxed hover:bg-slate-800/50 px-2 py-1 rounded ${isError ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-300'}`}>
                                      <span className="text-slate-500 select-none shrink-0 w-16 invisible md:visible">10:42:{String(31 + i).padStart(2, '0')}</span>
                                      <span className={`shrink-0 w-10 font-bold ${isError ? 'text-rose-500' : isWarn ? 'text-amber-500' : 'text-blue-400'}`}>
                                          {isError ? 'ERRO' : isWarn ? 'WARN' : 'INFO'}
                                      </span>
                                      <span className="flex-1 break-all">{line}</span>
                                    </div>
                                  );
                                })}
                              </div>
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                  <Info className="size-8 mb-3 opacity-50" />
                                  <p>No logs matching current filters.</p>
                              </div>
                          )}
                        </div>
                     </div>
                  )}

                  {/* Tab Content: Input/Output Placeholders */}
                  {(activeTab === 'input' || activeTab === 'output') && (
                     <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
                        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <FileJson className="size-10 mb-3 text-slate-300" />
                            <h4 className="text-[13px] font-bold text-slate-700 mb-1">
                                {activeTab === 'input' ? 'Input Data Sample' : 'Output Data Sample'}
                            </h4>
                            <p className="text-xs mb-4 max-w-sm">
                                {activeTab === 'input'
                                  ? `Showing a preview of the ${selectedStage.recordsIn} records flowing into this node.`
                                  : `Showing a preview of the ${selectedStage.recordsOut} records produced by this node.`}
                            </p>
                            <button type="button" className="text-[13px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-md hover:bg-emerald-100 transition">
                                Load Sample JSON
                            </button>
                        </div>
                     </div>
                  )}

               </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-[600px] flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                    <Layers className="size-12 mb-4 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-900 mb-2">Select a Node to Inspect</h3>
                    <p className="text-[13px] max-w-md">
                        Click on any node in the execution sequence on the left to view detailed logs, incoming records, outgoing records, and validation status for that specific stage.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
