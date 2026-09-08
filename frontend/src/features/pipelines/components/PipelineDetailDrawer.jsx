import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Play,
  Pause,
  Copy,
  Activity,
  History,
  Edit,
} from 'lucide-react';

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

export default function PipelineDetailDrawer({
  pipeline,
  isOpen,
  onClose,
  onRun,
  onPauseToggle,
  onDuplicate,
}) {
  if (!isOpen || !pipeline) return null;

  const statusStyle = STATUS_CONFIG[pipeline.status] || STATUS_CONFIG.Running;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 id="drawer-title" className="text-base font-semibold text-slate-900">
          Pipeline Details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close details"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title & Status */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {pipeline.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
            >
              <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
              {pipeline.status}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {pipeline.description || 'Continuous data transformation and sync stream.'}
          </p>
        </div>

        {/* Overview Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-600 block text-[11px]">Owner</span>
            <span className="font-semibold text-slate-800">{pipeline.owner}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[11px]">Team</span>
            <span className="font-semibold text-slate-800">{pipeline.team}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[11px]">Env</span>
            <span className="font-semibold text-slate-800">{pipeline.environment || 'Production'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[11px]">Version</span>
            <span className="font-semibold text-slate-800">{pipeline.version}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[11px]">Tags</span>
            <span className="font-medium text-slate-700">{pipeline.tags?.join(', ') || 'etl, sync'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[11px]">Created</span>
            <span className="font-medium text-slate-700">{pipeline.created || 'Jun 1, 2024'}</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Schedule
          </h4>
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-600 block text-[11px]">Trigger</span>
              <span className="font-semibold text-slate-800">{pipeline.trigger || 'Continuous'}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px]">Frequency</span>
              <span className="font-semibold text-slate-800">{pipeline.frequency || 'Streaming'}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px]">Timezone</span>
              <span className="font-semibold text-slate-800">{pipeline.timezone || 'UTC'}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px]">Next Run</span>
              <span className="font-semibold text-slate-800">{pipeline.nextExec}</span>
            </div>
          </div>
        </div>

        {/* Connectors */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Connectors
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-600 block text-[11px]">Source</span>
                <span className="font-semibold text-slate-800">{pipeline.source}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-600 block text-[11px]">Destination</span>
                <span className="font-semibold text-slate-800">{pipeline.destination}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Operational Metrics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Success Rate</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.successRate || pipeline.successRate}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Avg Duration</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.avgDuration || pipeline.duration}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Records Today</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.recordsToday || pipeline.records}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Throughput</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.throughput || '142K/s'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Retry Count</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.retryCount || '0'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600 block text-[11px]">Queue Time</span>
              <span className="text-sm font-bold text-slate-900">
                {pipeline.operationalMetrics?.queueTime || '< 10ms'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Recent Executions
            </h4>
            <Link
              to="/dashboard/executions"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-800">EX-90412</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                Running
              </span>
              <span className="text-slate-500">10:48</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-800">EX-90405</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="text-slate-500">09:00</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-800">EX-90398</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="text-slate-500">08:00</span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Recent Alerts
          </h4>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
            No active alerts for this pipeline.
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 grid grid-cols-3 gap-2 text-xs">
        <Link
          to={`/pipelines/new?edit=${pipeline.id}`}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
        >
          <Edit className="size-3.5 text-slate-500" />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          onClick={() => onRun(pipeline.id)}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
        >
          <Play className="size-3.5" />
          <span>Run</span>
        </button>

        <button
          type="button"
          onClick={() => onPauseToggle(pipeline.id, pipeline.status === 'Paused' ? 'Running' : 'Paused')}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
        >
          <Pause className="size-3.5 text-amber-500" />
          <span>{pipeline.status === 'Paused' ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(pipeline.id)}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
        >
          <Copy className="size-3.5 text-purple-500" />
          <span>Duplicate</span>
        </button>

        <Link
          to="/dashboard/realtime"
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
        >
          <Activity className="size-3.5 text-emerald-500" />
          <span>Monitoring</span>
        </Link>

        <Link
          to="/dashboard/executions"
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
        >
          <History className="size-3.5 text-sky-500" />
          <span>History</span>
        </Link>
      </div>
    </div>
  );
}
