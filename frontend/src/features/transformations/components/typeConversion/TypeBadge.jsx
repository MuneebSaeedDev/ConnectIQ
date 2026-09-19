import React from 'react';

const TYPE_COLORS = {
  // Numeric
  Integer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Decimal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Float: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Number: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // String / Text
  String: 'bg-blue-50 text-blue-700 border-blue-200',
  Text: 'bg-blue-50 text-blue-700 border-blue-200',
  'JSON/Text': 'bg-blue-50 text-blue-700 border-blue-200',

  // Date / Time
  Date: 'bg-purple-50 text-purple-700 border-purple-200',
  DateTime: 'bg-purple-50 text-purple-700 border-purple-200',
  Timestamp: 'bg-purple-50 text-purple-700 border-purple-200',

  // Boolean
  Boolean: 'bg-amber-50 text-amber-700 border-amber-200',

  // Structured
  JSON: 'bg-rose-50 text-rose-700 border-rose-200',
  Object: 'bg-rose-50 text-rose-700 border-rose-200',
  Array: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const TypeBadge = ({ type }) => {
  const colorClass = TYPE_COLORS[type] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
      {type}
    </span>
  );
};

export const ConversionDirection = ({ sourceType, targetType }) => {
  return (
    <div className="flex items-center gap-1.5 font-medium">
      <TypeBadge type={sourceType} />
      <span className="text-[#94a3b8] text-xs">→</span>
      <TypeBadge type={targetType} />
    </div>
  );
};
