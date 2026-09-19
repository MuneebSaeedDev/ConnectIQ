import React from 'react';
import { Layers, CheckCircle2, FileEdit, Ban, Workflow } from 'lucide-react';

export default function CleaningRuleStats({ stats }) {
  const statItems = [
    {
      label: 'Total Rules',
      value: stats?.total ?? 0,
      icon: Layers,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      subtext: 'Configured in catalog',
    },
    {
      label: 'Active Rules',
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      subtext: 'Live in executions',
    },
    {
      label: 'Draft Rules',
      value: stats?.draft ?? 0,
      icon: FileEdit,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      subtext: 'Pending activation',
    },
    {
      label: 'Disabled Rules',
      value: stats?.disabled ?? 0,
      icon: Ban,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      subtext: 'Temporarily halted',
    },
    {
      label: 'Used in Pipelines',
      value: stats?.usedInPipelines ?? 0,
      icon: Workflow,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      subtext: 'Linked to ETL nodes',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <div className={`p-1 rounded-md ${item.bgColor} ${item.color}`}>
                <Icon className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {item.value}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400 truncate">{item.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
