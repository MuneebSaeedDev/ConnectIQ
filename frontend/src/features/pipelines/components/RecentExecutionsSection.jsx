import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const STATUS_CONFIG = {
  Running: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Scheduled: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Paused: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Disabled: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  Retrying: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500 animate-spin' },
};

export default function RecentExecutionsSection({ executions }) {
  if (!executions || executions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Executions
          </h3>
          <p className="text-xs text-slate-600">
            Latest execution jobs dispatched across distributed worker nodes.
          </p>
        </div>
        <Link
          to="/dashboard/executions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <span>View All</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Execution ID</th>
              <th scope="col" className="px-4 py-3">Pipeline</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Started</th>
              <th scope="col" className="px-4 py-3">Completed</th>
              <th scope="col" className="px-4 py-3">Duration</th>
              <th scope="col" className="px-4 py-3">Records</th>
              <th scope="col" className="px-4 py-3">Worker</th>
              <th scope="col" className="px-4 py-3">Trigger</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-normal">
            {executions.map((exec) => {
              const statusStyle = STATUS_CONFIG[exec.status] || STATUS_CONFIG.Running;
              return (
                <tr key={exec.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono font-medium text-blue-600 hover:underline">
                    <Link to={`/dashboard/executions?id=${exec.id}`}>
                      {exec.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {exec.pipeline}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{exec.started}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{exec.completed}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{exec.duration}</td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{exec.records}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{exec.worker}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/60">
                      {exec.trigger}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dashboard/executions?id=${exec.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
