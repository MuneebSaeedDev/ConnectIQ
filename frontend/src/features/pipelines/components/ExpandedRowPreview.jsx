import React from 'react';
import { ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
  Running: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Scheduled: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Paused: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Disabled: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  Retrying: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500 animate-spin' },
  Draft: { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

export default function ExpandedRowPreview({ pipeline, onCollapse }) {
  if (!pipeline) return null;

  const statusStyle = STATUS_CONFIG[pipeline.status] || STATUS_CONFIG.Running;

  return (
    <div className="bg-slate-50/90 border-t border-b border-slate-200/80 p-5 space-y-4 text-xs transition-all animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCollapse}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition"
            aria-label="Collapse row preview"
          >
            <ChevronDown className="size-4" />
          </button>
          <span className="font-bold text-slate-900 text-sm">{pipeline.name}</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
          >
            <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
            {pipeline.status}
          </span>
        </div>
        <span className="text-slate-600 font-medium text-[11px] tracking-wide uppercase">
          Expanded row preview
        </span>
      </div>

      {/* 5 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Col 1: Overview */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
          <span className="font-bold text-slate-900 text-xs tracking-tight block border-b border-slate-100 pb-1.5">
            Overview
          </span>
          <div className="space-y-1.5 text-slate-600">
            <div>
              <span className="text-[11px] text-slate-600 block">Description</span>
              <span className="text-slate-800 font-medium leading-snug line-clamp-2">
                {pipeline.description || 'Continuous data stream'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Owner</span>
              <span className="text-slate-800 font-medium">{pipeline.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Team</span>
              <span className="text-slate-800 font-medium">{pipeline.team}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Environment</span>
              <span className="text-slate-800 font-medium">{pipeline.environment || 'Production'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tags</span>
              <span className="text-slate-800 font-medium truncate max-w-[120px]" title={pipeline.tags?.join(', ')}>
                {pipeline.tags?.join(', ') || 'etl, streaming'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Version</span>
              <span className="text-slate-800 font-medium">{pipeline.version}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Execution Summary */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
          <span className="font-bold text-slate-900 text-xs tracking-tight block border-b border-slate-100 pb-1.5">
            Execution Summary
          </span>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-600">Last Execution</span>
              <span className="text-slate-800 font-medium">{pipeline.lastExec}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Next Scheduled</span>
              <span className="text-slate-800 font-medium">{pipeline.nextExec}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Duration</span>
              <span className="text-slate-800 font-medium">{pipeline.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Success Rate</span>
              <span className="text-emerald-700 font-semibold">{pipeline.successRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Failure Rate</span>
              <span className="text-slate-800 font-medium">0.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Retry Count</span>
              <span className="text-slate-800 font-medium">{pipeline.operationalMetrics?.retryCount || '0'}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Connectors */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
          <span className="font-bold text-slate-900 text-xs tracking-tight block border-b border-slate-100 pb-1.5">
            Connectors
          </span>
          <div className="space-y-2.5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Source</span>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 truncate" title={pipeline.source}>{pipeline.source}</span>
                <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <span className="text-[10px] text-slate-600 block">2m ago</span>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Destination</span>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 truncate" title={pipeline.destination}>{pipeline.destination}</span>
                <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Healthy
                </span>
              </div>
              <span className="text-[10px] text-slate-600 block">1m ago</span>
            </div>
          </div>
        </div>

        {/* Col 4: Performance */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
          <span className="font-bold text-slate-900 text-xs tracking-tight block border-b border-slate-100 pb-1.5">
            Performance
          </span>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-600">Throughput</span>
              <span className="text-slate-900 font-bold">{pipeline.operationalMetrics?.throughput || '142,000 rec/s'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Records Today</span>
              <span className="text-slate-900 font-bold">{pipeline.records}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Processing Speed</span>
              <span className="text-slate-800 font-medium">2.1 GB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Queue Time</span>
              <span className="text-slate-800 font-medium">&lt; 10ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Worker Utilization</span>
              <span className="text-slate-800 font-medium">67%</span>
            </div>
          </div>
        </div>

        {/* Col 5: Pipeline Components */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs tracking-tight block border-b border-slate-100 pb-1.5">
              Pipeline Components
            </span>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-700 font-medium">Source:</span>
                <span className="text-slate-600 ml-auto truncate">{pipeline.components?.source || 'Consumer × 4'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-purple-500 shrink-0" />
                <span className="text-slate-700 font-medium">Transform:</span>
                <span className="text-slate-600 ml-auto truncate">{pipeline.components?.transformations || '8 nodes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-700 font-medium">Validation:</span>
                <span className="text-slate-600 ml-auto truncate">{pipeline.components?.validation || '3 steps'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-700 font-medium">Merge:</span>
                <span className="text-slate-600 ml-auto truncate">{pipeline.components?.merge || '2 nodes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-slate-700 font-medium">Destination:</span>
                <span className="text-slate-600 ml-auto truncate">{pipeline.components?.destination || 'Sink × 2'}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
            Total nodes: {pipeline.components?.totalNodes || 19} · Complexity: {pipeline.components?.complexity || 'High'}
          </div>
        </div>
      </div>
    </div>
  );
}
