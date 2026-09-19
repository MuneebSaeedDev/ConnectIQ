import React from 'react';

const getTypeColor = (type) => {
  switch (type) {
    case 'String':
    case 'Text':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Date':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'DateTime':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Timestamp':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Time':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Multiple':
    case 'Multiple (3)':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const TypeBadge = ({ type }) => {
  if (!type) return null;
  const colorClass = getTypeColor(type);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${colorClass}`}>
      {type}
    </span>
  );
};

export const FormattingDirection = ({ inputType, outputType, inputFormat, outputFormat }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex flex-col min-w-[120px]">
          <TypeBadge type={inputType} />
          <span className="text-xs text-[#475569] font-mono mt-1 truncate" title={inputFormat}>
            {inputFormat || 'Auto'}
          </span>
        </div>
        <div className="text-[#94a3b8] flex flex-col items-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.3335 8H12.6668" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.00016 3.33331L12.6668 7.99998L8.00016 12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col min-w-[120px]">
          <TypeBadge type={outputType} />
          <span className="text-xs text-[#475569] font-mono mt-1 truncate" title={outputFormat}>
            {outputFormat || 'Standard'}
          </span>
        </div>
      </div>
    </div>
  );
};