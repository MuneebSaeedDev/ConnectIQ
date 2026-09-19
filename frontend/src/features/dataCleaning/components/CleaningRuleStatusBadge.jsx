import React from 'react';

export default function CleaningRuleStatusBadge({ status }) {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Disabled':
      case 'Archived':
      case 'Invalid':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusConfig(status)}`}
    >
      {/*
        The rule of dot indicator:
        Active shows a colored dot, others lack it to keep it visually "quieter".
        Following enterprise "Status Colors" from design context.
      */}
      {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
      {status === 'Draft' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
      {status}
    </span>
  );
}
