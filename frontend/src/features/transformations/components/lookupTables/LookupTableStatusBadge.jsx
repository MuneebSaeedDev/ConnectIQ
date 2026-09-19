import React from 'react';

export default function LookupTableStatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Disabled: 'bg-slate-100 text-slate-700 border-slate-300',
    Archived: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const dots = {
    Active: 'bg-emerald-500',
    Draft: 'bg-amber-500',
    Disabled: 'bg-slate-400',
    Archived: 'bg-rose-500',
  };

  const currentStyle = styles[status] || styles.Disabled;
  const currentDot = dots[status] || dots.Disabled;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />
      {status || 'Unknown'}
    </span>
  );
}
