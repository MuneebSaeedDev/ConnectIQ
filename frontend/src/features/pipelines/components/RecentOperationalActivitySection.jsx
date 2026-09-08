import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const ACTION_BADGES = {
  'Pipeline Started': 'bg-blue-50 text-blue-700 border-blue-200',
  'Pipeline Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pipeline Failed': 'bg-red-50 text-red-700 border-red-200',
  'Pipeline Paused': 'bg-amber-50 text-amber-700 border-amber-200',
  'Version Published': 'bg-purple-50 text-purple-700 border-purple-200',
  'Schedule Updated': 'bg-sky-50 text-sky-700 border-sky-200',
  'Pipeline Updated': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const STATUS_CONFIG = {
  Running: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Paused: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

export default function RecentOperationalActivitySection({ activity }) {
  if (!activity || activity.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Operational Activity
          </h3>
          <p className="text-xs text-slate-600">
            Real-time audit log of user configurations, triggers, and automated orchestration events.
          </p>
        </div>
        <Link
          to="/operations/logs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <span>View All</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left text-xs text-slate-700">
          <tbody className="divide-y divide-slate-100 bg-white font-normal">
            {activity.map((act) => {
              const badgeStyle = ACTION_BADGES[act.action] || 'bg-slate-100 text-slate-700 border-slate-200';
              const statusStyle = act.status ? STATUS_CONFIG[act.status] : null;

              return (
                <tr key={act.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono text-slate-600 w-24">
                    {act.time}
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium w-28">
                    {act.actor}
                  </td>
                  <td className="px-4 py-3 w-44">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                      {act.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {act.pipeline}
                  </td>
                  <td className="px-4 py-3 w-32">
                    {statusStyle ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                        {act.status}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 text-[11px] w-28">
                    {act.ref ? (
                      act.ref.startsWith('EX-') ? (
                        <Link to={`/dashboard/executions?id=${act.ref}`} className="text-blue-600 hover:underline">
                          {act.ref}
                        </Link>
                      ) : (
                        <span className="text-slate-700 font-semibold">{act.ref}</span>
                      )
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
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
