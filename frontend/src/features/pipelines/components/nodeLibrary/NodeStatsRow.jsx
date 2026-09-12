import React from 'react';
import {
  Layers,
  Database,
  Workflow,
  Warehouse,
  Code,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

const ICON_COMPONENTS = {
  Layers,
  Database,
  Workflow,
  Warehouse,
  Code,
  ShieldCheck,
  AlertTriangle,
  Activity,
};

export default function NodeStatsRow({ metrics = {}, onCardClick }) {
  const cards = [
    {
      key: 'totalNodes',
      label: 'Total Nodes',
      data: metrics.totalNodes || { value: 284, change: '+12', subtext: 'Across all categories', icon: 'Layers' },
      color: 'indigo',
      categoryTarget: 'all',
    },
    {
      key: 'sourceNodes',
      label: 'Source Nodes',
      data: metrics.sourceNodes || { value: 86, change: '+4', subtext: '12 connector types', icon: 'Database' },
      color: 'blue',
      categoryTarget: 'sources',
    },
    {
      key: 'transformations',
      label: 'Transformations',
      data: metrics.transformations || { value: 94, change: '+6', subtext: '15 transform types', icon: 'Workflow' },
      color: 'purple',
      categoryTarget: 'transformations',
    },
    {
      key: 'destinations',
      label: 'Destinations',
      data: metrics.destinations || { value: 52, change: '+2', subtext: '8 sink types', icon: 'Warehouse' },
      color: 'teal',
      categoryTarget: 'destinations',
    },
    {
      key: 'utilityNodes',
      label: 'Utility Nodes',
      data: metrics.utilityNodes || { value: 38, change: '+1', subtext: '9 utility types', icon: 'Code' },
      color: 'slate',
      categoryTarget: 'utilities',
    },
    {
      key: 'customNodes',
      label: 'Custom Nodes',
      data: metrics.customNodes || { value: 14, change: null, subtext: 'Enterprise-built', icon: 'ShieldCheck' },
      color: 'amber',
      quickFilterTarget: 'custom',
    },
    {
      key: 'deprecated',
      label: 'Deprecated',
      data: metrics.deprecated || { value: 7, change: '+1', subtext: 'Scheduled removal', icon: 'AlertTriangle' },
      color: 'rose',
      statusTarget: 'Deprecated',
    },
    {
      key: 'mostUsed',
      label: 'Most Used',
      data: metrics.mostUsed || { value: 'PostgreSQL', change: null, subtext: '1,248 pipeline uses', icon: 'Activity' },
      color: 'emerald',
      quickFilterTarget: 'most_used',
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600',
          border: 'hover:border-indigo-300',
          badge: 'text-indigo-600',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-600',
          border: 'hover:border-blue-300',
          badge: 'text-blue-600',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600',
          border: 'hover:border-purple-300',
          badge: 'text-purple-600',
        };
      case 'teal':
        return {
          iconBg: 'bg-teal-50 text-teal-600',
          border: 'hover:border-teal-300',
          badge: 'text-teal-600',
        };
      case 'slate':
        return {
          iconBg: 'bg-slate-100 text-slate-600',
          border: 'hover:border-slate-300',
          badge: 'text-slate-600',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          border: 'hover:border-amber-300',
          badge: 'text-amber-600',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600',
          border: 'hover:border-rose-300',
          badge: 'text-rose-600',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600',
          border: 'hover:border-emerald-300',
          badge: 'text-emerald-600',
        };
      default:
        return {
          iconBg: 'bg-slate-50 text-slate-600',
          border: 'hover:border-slate-300',
          badge: 'text-slate-600',
        };
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((card) => {
        const IconComp = ICON_COMPONENTS[card.data.icon] || Layers;
        const colors = getColorClasses(card.color);

        return (
          <div
            key={card.key}
            role="button"
            tabIndex={0}
            onClick={() => onCardClick && onCardClick(card)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onCardClick) onCardClick(card);
            }}
            className={`bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm ${colors.border}`}
          >
            {/* Top icon and optional trend */}
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
                <IconComp className="w-3.5 h-3.5" />
              </div>
              {card.data.change && (
                <div className="inline-flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                  <span>{card.data.change}</span>
                </div>
              )}
            </div>

            {/* Value & Label */}
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight truncate">
                {card.data.value}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                {card.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {card.data.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
