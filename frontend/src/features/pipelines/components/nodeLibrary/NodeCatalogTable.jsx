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

export default function NodeCatalogTable({
  nodes = [],
  selectedNodeId,
  onSelectNode,
  favoriteIds = new Set(),
  onToggleFavorite,
  onAddToPipeline,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <th scope="col" className="w-10 px-3 py-2.5 text-center">
                <span className="sr-only">Favorite</span>
              </th>
              <th scope="col" className="px-4 py-2.5">
                Node Name
              </th>
              <th scope="col" className="px-3 py-2.5">
                Category
              </th>
              <th scope="col" className="px-3 py-2.5">
                Version
              </th>
              <th scope="col" className="px-3 py-2.5">
                Tier
              </th>
              <th scope="col" className="px-3 py-2.5">
                Status
              </th>
              <th scope="col" className="px-3 py-2.5">
                Success Rate
              </th>
              <th scope="col" className="px-3 py-2.5">
                Usage
              </th>
              <th scope="col" className="px-3 py-2.5">
                Owner Team
              </th>
              <th scope="col" className="px-3 py-2.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isFavorite = favoriteIds.has(node.id);
              const IconComp = NODE_ICON_MAP[node.id] || Database;

              return (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  {/* Star */}
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(node.id, e)}
                      className="p-1 rounded text-slate-300 hover:text-amber-400 transition-colors"
                      aria-label="Favorite toggle"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </td>

                  {/* Node Name + Icon + Subcategory */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {node.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {node.subcategory}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] font-medium text-slate-700">
                      {node.category}
                    </span>
                  </td>

                  {/* Version */}
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                    {node.version}
                  </td>

                  {/* Tier / Certification */}
                  <td className="px-3 py-2.5">
                    {node.certification === 'Enterprise' ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium">
                        <Shield className="w-2.5 h-2.5 text-indigo-600" />
                        <span>Enterprise</span>
                      </span>
                    ) : node.certification === 'Custom' ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-medium">
                        Custom
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        Internal
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          node.status === 'Active'
                            ? 'bg-emerald-500'
                            : node.status === 'Beta'
                            ? 'bg-purple-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-[11px] text-slate-700">{node.status}</span>
                    </div>
                  </td>

                  {/* Success Rate */}
                  <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-slate-800">
                    {node.metrics.successRate}
                  </td>

                  {/* Usage */}
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                    {node.usesCount.toLocaleString()}
                  </td>

                  {/* Owner Team */}
                  <td className="px-3 py-2.5 text-slate-600 text-[11px] truncate max-w-[140px]">
                    {node.ownerTeam}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(node.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Inspect"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onAddToPipeline(node, e)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
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
