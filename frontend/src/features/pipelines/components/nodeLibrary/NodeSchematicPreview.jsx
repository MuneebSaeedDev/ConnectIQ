import React from 'react';
import { Database, Workflow, ShieldCheck, Warehouse, Code, Activity, Globe, Filter, Cloud } from 'lucide-react';

const ICON_MAP = {
  'node-pg-src-01': Database,
  'node-kafka-src-02': Activity,
  'node-rest-src-03': Globe,
  'node-field-map-04': Workflow,
  'node-filter-05': Filter,
  'node-python-transform-06': Code,
  'node-schema-val-07': ShieldCheck,
  'node-snowflake-dst-08': Warehouse,
  'node-s3-dst-09': Cloud,
};

export default function NodeSchematicPreview({ node }) {
  if (!node) return null;

  const IconComp = ICON_MAP[node.id] || Database;

  return (
    <div className="bg-slate-900/5 rounded-xl border border-dashed border-slate-300 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background canvas grid pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Schematic Node Container */}
      <div className="relative w-48 bg-white border border-slate-300 rounded-lg shadow-md z-10 select-none">
        {/* Top Category Accent Line */}
        <div
          className="h-1 rounded-t-md w-full"
          style={{ backgroundColor: node.accentColor || '#3b82f6' }}
        />

        {/* Input port dot on left edge (for non-sources) */}
        {node.category !== 'Sources' && (
          <div
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-xs"
            title="Input Port (Records In)"
          />
        )}

        {/* Output port dot on right edge (for non-destinations) */}
        {node.category !== 'Destinations' && (
          <div
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs"
            title="Output Port (Records Out)"
          />
        )}

        {/* Node Body */}
        <div className="p-2.5">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 text-[10px]"
              style={{ backgroundColor: node.accentColor || '#3b82f6' }}
            >
              <IconComp className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                {node.name}
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                {node.instancePreviewName || 'instance-01'}
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[9px]">
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
              {node.category}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">{node.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
