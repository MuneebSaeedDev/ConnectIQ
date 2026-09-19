import React from 'react';
import { Layers, CheckCircle2, FileEdit, AlertTriangle, GitFork } from 'lucide-react';

export default function CleaningRulesStats({ stats }) {
  const statCards = [
    {
      label: 'Total Rules',
      value: stats.total,
      subtext: 'Configured cleaning policies',
      icon: Layers,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Active Rules',
      value: stats.active,
      subtext: 'Applied during pipeline ETL',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Draft Rules',
      value: stats.draft,
      subtext: 'Pending test validation',
      icon: FileEdit,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Disabled Rules',
      value: stats.disabled,
      subtext: 'Deactivated / archived',
      icon: AlertTriangle,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    {
      label: 'Used in Pipelines',
      value: stats.usedInPipelines,
      subtext: 'Referenced in live nodes',
      icon: GitFork,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 truncate">{stat.label}</span>
              <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.borderColor} border`}>
                <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
