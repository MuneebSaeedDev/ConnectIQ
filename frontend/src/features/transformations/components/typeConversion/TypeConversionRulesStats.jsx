import React from 'react';

export const TypeConversionRulesStats = ({ stats, isLoading }) => {
  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-[#e2e8f0] rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-[#e2e8f0] rounded w-1/3"></div>
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
      {/* Total */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-medium text-[#64748b] mb-1">Total Rules</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[#0f172a] leading-none">{totalRules.toLocaleString()}</span>
        </div>
      </div>

      {/* Active */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-medium text-[#64748b] mb-1">Active Rules</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[#0f172a] leading-none">{activeRules.toLocaleString()}</span>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
            Active
          </span>
        </div>
      </div>

      {/* Drafts */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-medium text-[#64748b] mb-1">Draft Rules</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[#0f172a] leading-none">{draftRules.toLocaleString()}</span>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></div>
            Draft
          </span>
        </div>
      </div>

      {/* Disabled */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-medium text-[#64748b] mb-1">Disabled Rules</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[#0f172a] leading-none">{disabledRules.toLocaleString()}</span>
          <span className="text-xs font-medium text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded flex items-center mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] mr-1.5"></div>
            Disabled
          </span>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-medium text-[#64748b] mb-1">Rules Used in Pipelines</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-[#0f172a] leading-none">{rulesUsedInPipelines.toLocaleString()}</span>
          <span className="text-sm font-medium text-[#64748b] mb-0.5">rules</span>
        </div>
      </div>
    </div>
  );
};
