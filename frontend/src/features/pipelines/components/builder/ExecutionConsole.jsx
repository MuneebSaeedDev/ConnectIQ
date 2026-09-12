import React, { useState } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function ExecutionConsole({
  isOpen,
  onToggleOpen,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  logLevelFilter,
  onLogLevelChange,
  logs,
  validationItems,
  errorsCount,
  warningsCount,
  executionStatus,
  progressPercent,
  activeExecutingNode,
  recordsProcessed,
  duration,
  eta,
  onTogglePause,
  onStopExecution,
}) {
  const [copied, setCopied] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.time}] [${l.level}] [${l.node}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <div className="h-9 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-10 shadow-xs">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-blue-600 transition"
        >
          <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
          <span>EXECUTION CONSOLE</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({executionStatus} · {progressPercent}%)
          </span>
          <ChevronUp className="size-3.5 text-slate-400" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
          >
            {executionStatus === 'Paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            type="button"
            onClick={onStopExecution}
            className="px-2 py-0.5 text-[10px] font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
          >
            ⏹ Stop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-56 bg-white border-t-2 border-slate-200 flex flex-col shrink-0 select-none z-10 overflow-hidden shadow-md">
      {/* Top Header & Tabs Strip matching Figma node 150:9168 */}
      <div className="h-9 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white">
        {/* Left: Console Title & Tabs */}
        <div className="flex items-center gap-2 h-full">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200 h-full">
            <span className="text-[11px] font-semibold text-slate-900 tracking-wider uppercase">
              Execution Console
            </span>
            <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>

          {/* Tab Navigation */}
          <div role="tablist" aria-label="Execution Console Views" className="flex items-center gap-1 h-full text-xs">
            {/* Validation Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'validation'}
              onClick={() => onSelectTab('validation')}
              className={`flex items-center gap-1 px-3 py-1.5 border-b-2 font-medium transition ${
                activeTab === 'validation'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Validation</span>
              {warningsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {warningsCount}
                </span>
              )}
            </button>

            {/* Execution Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'execution'}
              onClick={() => onSelectTab('execution')}
              className={`px-3 py-1.5 border-b-2 font-medium transition ${
                activeTab === 'execution'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Execution
            </button>

            {/* Logs Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'logs'}
              onClick={() => onSelectTab('logs')}
              className={`px-3 py-1.5 border-b-2 font-medium transition ${
                activeTab === 'logs'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Logs
            </button>

            {/* Errors Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'errors'}
              onClick={() => onSelectTab('errors')}
              className={`flex items-center gap-1 px-3 py-1.5 border-b-2 font-medium transition ${
                activeTab === 'errors'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Errors</span>
              {errorsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  {errorsCount}
                </span>
              )}
            </button>

            {/* Metrics Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'metrics'}
              onClick={() => onSelectTab('metrics')}
              className={`px-3 py-1.5 border-b-2 font-medium transition ${
                activeTab === 'metrics'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Metrics
            </button>
          </div>
        </div>

        {/* Right: Search, Filter, Copy, Collapse Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search logs..."
              aria-label="Filter execution logs"
              className="w-36 bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition flex items-center gap-1"
            >
              <Filter className="size-3" />
              <span>{logLevelFilter === 'ALL' ? 'Filter' : logLevelFilter}</span>
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      onLogLevelChange(lvl);
                      setFilterMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1 text-left text-[11px] hover:bg-slate-50 ${
                      logLevelFilter === lvl ? 'font-bold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            title="Copy Logs"
            className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={onToggleOpen}
            title="Collapse Console"
            aria-label="Collapse execution console"
            className="p-1 text-slate-400 hover:text-slate-700 transition"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Center: Active Tab Content (Log table / Validation items / Metrics) */}
      <div className="flex-1 overflow-y-auto bg-white font-mono text-[11px]">
        {activeTab === 'logs' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fb] border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-1 w-28 font-medium">
                  Time
                </th>
                <th scope="col" className="px-3 py-1 w-20 font-medium">
                  Level
                </th>
                <th scope="col" className="px-3 py-1 w-36 font-medium">
                  Node
                </th>
                <th scope="col" className="px-3 py-1 font-medium">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isWarn = log.level === 'WARN';
                const isError = log.level === 'ERROR';

                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isWarn ? 'bg-amber-50/40' : isError ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="px-3 py-1 text-slate-400 whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="px-3 py-1">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                          isError
                            ? 'bg-red-100 text-red-600'
                            : isWarn
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-slate-600 truncate max-w-[140px]">
                      {log.node}
                    </td>
                    <td
                      className={`px-3 py-1 ${
                        isError ? 'text-red-700 font-medium' : isWarn ? 'text-amber-800' : 'text-slate-800'
                      }`}
                    >
                      {log.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'validation' && (
          <div className="p-3 font-sans space-y-2 text-xs">
            {validationItems.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded-lg border flex items-start justify-between ${
                  item.status === 'Error'
                    ? 'bg-red-50/60 border-red-200'
                    : item.status === 'Warning'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.status === 'Error' ? (
                    <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  ) : item.status === 'Warning' ? (
                    <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="font-semibold text-slate-900">{item.label}</h5>
                    <p className="text-slate-600 text-[11px] mt-0.5">{item.details}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Error'
                      ? 'bg-red-100 text-red-700'
                      : item.status === 'Warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status} {item.count ? `(${item.count})` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'execution' && (
          <div className="p-4 font-sans text-xs space-y-3">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Active Nodes
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">10 / 10</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Records Ingested
                </span>
                <span className="text-base font-bold text-blue-600 font-mono">12.4M</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Throughput
                </span>
                <span className="text-base font-bold text-emerald-600 font-mono">2,100 /s</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Memory Utilization
                </span>
                <span className="text-base font-bold text-slate-800 font-mono">1.4 GB / 4 GB</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="p-3 font-sans space-y-2 text-xs">
            {logs
              .filter((l) => l.level === 'ERROR' || l.level === 'WARN')
              .map((err) => (
                <div
                  key={err.id}
                  className="p-2 rounded-lg bg-red-50/50 border border-red-200 flex items-start gap-2"
                >
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{err.node}</span>
                      <span className="text-[10px] font-mono text-slate-400">{err.time}</span>
                    </div>
                    <p className="text-[11px] text-red-800 mt-0.5">{err.message}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="p-4 font-sans text-xs space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Peak Cluster CPU</span>
              <span className="font-mono font-semibold text-slate-800">42%</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Avg End-to-End Latency</span>
              <span className="font-mono font-semibold text-slate-800">312 ms</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Queue Buffer Depth</span>
              <span className="font-mono font-semibold text-slate-800">1,243 msgs</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600">Data Compression Ratio</span>
              <span className="font-mono font-semibold text-slate-800">4.2 : 1 (Parquet)</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Execution Status Strip matching Figma node 150:9311 */}
      <div className="h-7 bg-[#f8f9fb] border-t border-slate-200 px-4 flex items-center justify-between shrink-0 select-none text-[10px]">
        {/* Left Status Label */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-600 capitalize">
            {executionStatus}
          </span>
          <span className="text-slate-500">
            · Node: {activeExecutingNode} · Progress: {progressPercent}% · Records: {recordsProcessed}
          </span>
        </div>

        {/* Center Progress Bar matching Figma 150:9314 */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Pipeline execution progress"
          className="flex-1 max-w-md mx-4 h-1 bg-slate-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Right Duration & Action Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Duration: {duration} · ETA: {eta}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onTogglePause}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              {executionStatus === 'Paused' ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              type="button"
              onClick={onStopExecution}
              className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition shadow-2xs"
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
