import React from 'react';

export default function LookupTypeBadge({ type }) {
  const styles = {
    'Key/Value': 'bg-blue-50 text-blue-700 border-blue-200',
    'Multi-Column': 'bg-purple-50 text-purple-700 border-purple-200',
    'Composite Key': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Range Lookup': 'bg-teal-50 text-teal-700 border-teal-200',
    'Conditional': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const currentStyle = styles[type] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${currentStyle}`}>
      {type || 'Key/Value'}
    </span>
  );
}
