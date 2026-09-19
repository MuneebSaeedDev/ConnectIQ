import React from 'react';
import { 
  Code2, 
  CheckCircle2, 
  GitFork, 
  Layers, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function CustomExpressionStats({ expressions = [] }) {
  const total = expressions.length;
  const active = expressions.filter(e => e.status === 'Active').length;
  const totalPipelines = expressions.reduce((sum, e) => sum + (e.pipelinesUsage || 0), 0);
  const categories = new Set(expressions.map(e => e.category)).size;

  const stats = [
    {
      label: 'Total Expressions',
      value: total,
      subtext: 'Configured & reusable',
      icon: Code2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      label: 'Active & Verified',
      value: active,
      subtext: `${total ? Math.round((active / total) * 100) : 0}% production ready`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Pipeline References',
      value: totalPipelines,
      subtext: 'Active pipeline nodes',
      icon: GitFork,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Categories Covered',
      value: categories,
      subtext: 'String, Math, Date, etc.',
      icon: Layers,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
