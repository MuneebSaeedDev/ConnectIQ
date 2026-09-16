import React from 'react';
import { Network, HelpCircle, CheckCircle } from 'lucide-react';
import { MERGE_STRATEGIES } from '../../services/mergeNodeConfig.api';

export default function JoinStrategySection({ selectedStrategy, onSelectStrategy }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">03. Join & Merge Strategy</h2>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:underline text-xs">
          <HelpCircle className="size-3.5" />
          <span>Need help choosing?</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MERGE_STRATEGIES.map((strategy) => {
            const isSelected = selectedStrategy === strategy.id;
            return (
              <div
                key={strategy.id}
                onClick={() => onSelectStrategy(strategy.id)}
                className={`relative px-4 py-3 rounded-lg border transition cursor-pointer flex flex-col pt-4 ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-600 shadow-sm ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-2xs'
                }`}
              >
                {/* Badge Overlay */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {strategy.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Network className="size-4" />
                  </div>
                  <h3 className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {strategy.label}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug mb-3 flex-grow">
                  {strategy.description}
                </p>

                <div className="mt-auto space-y-1">
                  <p className="text-[10px] font-medium text-slate-400 flex gap-1">
                    <span className="font-bold text-slate-500">Ex:</span> {strategy.example}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 flex gap-1">
                    <span className="font-bold text-slate-500">Best for:</span> <span className="truncate" title={strategy.recommendedFor}>{strategy.recommendedFor}</span>
                  </p>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 bg-white border border-blue-600 rounded-full p-0.5">
                    <CheckCircle className="size-4 text-blue-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
