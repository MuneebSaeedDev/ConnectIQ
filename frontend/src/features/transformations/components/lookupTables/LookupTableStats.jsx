import React from 'react';
import { Database, CheckCircle, Clock, AlertTriangle, Workflow } from 'lucide-react';

export default function LookupTableStats({ stats }) {
  const statCards = [
    {
      label: 'Total Lookup Tables',
      value: stats?.total ?? 0,
      icon: Database,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
    },
    {
      label: 'Active',
      value: stats?.active ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Draft',
      value: stats?.draft ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Disabled',
      value: stats?.disabled ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Used in Pipelines',
      value: stats?.usedInPipelines ?? 0,
      icon: Workflow,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-xs"
          >
            <div className={`p-2.5 rounded-md ${card.bg}`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
