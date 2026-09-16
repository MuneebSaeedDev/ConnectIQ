import React from 'react';
import { Network, Check, Combine } from 'lucide-react';
import { MERGE_STRATEGIES } from '../../services/mergeNodeConfig.api';

export default function MergeStrategySection({
  selectedStrategy,
  onSelectStrategy,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Network className="size-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900">03. Target Operational Strategy</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-800">
            Merge Topology & Record Resolution Rule
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Select the mathematical join or topological stack operation to fuse the primary and secondary datastreams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MERGE_STRATEGIES.map((strategy) => {
            const isSelected = selectedStrategy === strategy.id;
            return (
              <button
                key={strategy.id}
                type="button"
                onClick={() => onSelectStrategy(strategy.id)}
                className={`relative p-4 rounded-lg border text-left flex flex-col items-start gap-2.5 transition-all outline-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full h-8">
                  <div
                    className={`size-8 rounded flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Combine className="size-4" />
                  </div>
                  {strategy.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected
                          ? 'bg-indigo-200 text-indigo-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {strategy.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full">
                      <Check className="size-5 p-0.5" />
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <h3
                    className={`text-xs font-bold leading-tight ${
                      isSelected ? 'text-indigo-900' : 'text-slate-800'
                    }`}
                  >
                    {strategy.label}
                  </h3>
                  <p
                    className={`text-[11px] mt-1 line-clamp-3 leading-snug ${
                      isSelected ? 'text-indigo-700/90' : 'text-slate-500'
                    }`}
                  >
                    {strategy.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
