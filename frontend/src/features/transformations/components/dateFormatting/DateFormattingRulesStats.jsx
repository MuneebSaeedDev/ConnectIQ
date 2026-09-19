import React from 'react';

export const DateFormattingRulesStats = ({ stats, isLoading }) => {
  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const {
    totalRules = 0,
    activeRules = 0,
    draftRules = 0,
    disabledRules = 0,
    rulesUsedInPipelines = 0
  } = stats || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-medium text-slate-500 mb-1">Total Rules</h3>
        <span className="text-2xl font-bold text-slate-900">{totalRules}</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-medium text-slate-500 mb-1">Active Rules</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{activeRules}</span>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Active</span>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-medium text-slate-500 mb-1">Draft Rules</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{draftRules}</span>
          <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Draft</span>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-medium text-slate-500 mb-1">Disabled Rules</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{disabledRules}</span>
          <span className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Disabled</span>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-medium text-slate-500 mb-1">Used In Pipelines</h3>
        <span className="text-2xl font-bold text-slate-900">{rulesUsedInPipelines}</span>
      </div>
    </div>
  );
};
