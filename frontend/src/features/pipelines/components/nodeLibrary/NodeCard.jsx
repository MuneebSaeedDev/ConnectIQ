import React from 'react';
import {
  Star,
  Shield,
  Sliders,
  Plus,
  Database,
  Workflow,
  ShieldCheck,
  Warehouse,
  Code,
  Activity,
  Globe,
  Filter,
  Cloud,
  Clock,
} from 'lucide-react';

const NODE_ICON_MAP = {
  'node-pg-src-01': Database,
  'node-kafka-src-02': Activity,
  'node-rest-src-03': Globe,
  'node-field-map-04': Workflow,
  'node-filter-05': Filter,
  'node-python-transform-06': Code,
  'node-schema-val-07': ShieldCheck,
  'node-snowflake-dst-08': Warehouse,
  'node-s3-dst-09': Cloud,
  'node-rate-limiter-10': Clock,
  'node-masking-11': ShieldCheck,
  'node-legacy-soap-12': Globe,
};

export default function NodeCard({
  node,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onAddToPipeline,
}) {
  const IconComp =
    NODE_ICON_MAP[node.id] ||
    (node.category === 'Sources'
      ? Database
      : node.category === 'Transformations'
      ? Workflow
      : node.category === 'Validation'
      ? ShieldCheck
      : node.category === 'Destinations'
      ? Warehouse
      : Code);

  const getCategoryColor = () => {
    switch (node.category) {
      case 'Sources':
        return {
          bar: 'bg-blue-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
        };
      case 'Transformations':
        return {
          bar: 'bg-purple-500',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
        };
      case 'Validation':
        return {
          bar: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        };
      case 'Destinations':
        return {
          bar: 'bg-teal-500',
          badge: 'bg-teal-50 text-teal-700 border-teal-200',
          iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
        };
      case 'Utilities':
        return {
          bar: 'bg-slate-500',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      default:
        return {
          bar: 'bg-indigo-500',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
    }
  };

  const colors = getCategoryColor();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(node.id);
      }}
      className={`relative bg-white border rounded-xl p-4 flex flex-col justify-between transition-all duration-150 cursor-pointer text-left shadow-2xs hover:shadow-md ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-3 right-3 h-0.75 rounded-t-full ${colors.bar}`} />

      {/* Top Header: Icon + Title + Badges + Favorite */}
      <div className="flex items-start justify-between gap-2 pt-1 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colors.iconBg}`}>
            <IconComp className="w-4 h-4" />
          </div>

          {/* Title & Category Tags */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">
              {node.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${colors.badge}`}>
                {node.category}
              </span>
              {node.certification === 'Enterprise' ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                  <Shield className="w-2.5 h-2.5 text-indigo-600" />
                  <span>Enterprise</span>
                </span>
              ) : node.certification === 'Custom' ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                  Custom
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  Internal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Favorite star toggle */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(node.id, e)}
          className="p-1 rounded-md text-slate-300 hover:text-amber-400 hover:bg-slate-50 transition-colors shrink-0"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={`Favorite ${node.name}`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3 min-h-[32px] leading-relaxed">
        {node.description}
      </p>

      {/* Meta Specs Row: Version · Compat · Uses · Updated */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2.5 flex-wrap font-mono">
        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-semibold">
          {node.version}
        </span>
        <span>{node.minPlatformVersion}</span>
        <span className="text-slate-300">·</span>
        <span>{node.usesCount.toLocaleString()} uses</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-400">{node.updatedDate}</span>
      </div>

      {/* Health / Reliability / Status Row */}
      <div className="flex items-center justify-between pt-2 pb-2.5 border-t border-slate-100 text-xs">
        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              node.status === 'Active'
                ? 'bg-emerald-500'
                : node.status === 'Beta'
                ? 'bg-purple-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-[11px] font-medium text-slate-700">{node.status}</span>
        </div>

        {/* 5-dot health score & percent */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((dot) => (
              <span
                key={dot}
                className={`w-1.5 h-1.5 rounded-full ${
                  dot <= node.healthDots ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-800 font-mono">
            {node.healthPercent}%
          </span>
        </div>
      </div>

      {/* Footer: Owner Team + Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <span className="text-[10px] text-slate-400 truncate max-w-[130px]" title={node.ownerTeam}>
          {node.ownerTeam}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Quick config/inspect icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node.id);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Inspect Configuration"
            aria-label="Inspect configuration"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* + Add button */}
          <button
            type="button"
            onClick={(e) => onAddToPipeline(node, e)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-[11px] font-semibold transition-colors shadow-2xs"
            title="Add to active pipeline"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
