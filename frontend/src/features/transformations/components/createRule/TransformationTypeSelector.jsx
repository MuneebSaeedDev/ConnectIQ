import React from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  Calendar,
  CopyX,
  Search,
  Code2,
  Filter,
  SlidersHorizontal,
  TableProperties
} from 'lucide-react';

const RULE_TYPES = [
  {
    id: 'Data Cleaning',
    title: 'Data Cleaning',
    description: 'Trim whitespace, sanitize strings, remove unwanted characters, and regex replacements.',
    icon: Sparkles,
  },
  {
    id: 'Type Conversion',
    title: 'Type Conversion',
    description: 'Cast values safely between types (e.g. String to Decimal, Integer to Boolean).',
    icon: ArrowRightLeft,
  },
  {
    id: 'Date Formatting',
    title: 'Date & Time Formatting',
    description: 'Standardize datetime inputs into standard formats (e.g. ISO-8601, UTC, custom epochs).',
    icon: Calendar,
  },
  {
    id: 'Lookup & Enrichment',
    title: 'Lookup & Enrichment',
    description: 'Map codes or foreign identifiers using reference dictionary tables and fallback values.',
    icon: Search,
  },
  {
    id: 'Custom Expression',
    title: 'Custom Expression',
    description: 'Write formulas or mathematical calculations using multi-field expressions.',
    icon: Code2,
  },
  {
    id: 'Field Mapping',
    title: 'Field Mapping',
    description: 'Rename, direct-map, and clone payload attributes directly to downstream fields.',
    icon: TableProperties,
  },
];

export default function TransformationTypeSelector({ selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">2. Transformation Type</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select the core transformation paradigm to unlock specific builders.</p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RULE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedCategory === type.id;
            return (
              <button
                type="button"
                key={type.id}
                onClick={() => onSelectCategory(type.id)}
                className={`flex flex-col text-left p-4 rounded-lg border transition-all relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="size-4" />
                  </div>
                  <h3 className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {type.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {type.description}
                </p>
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
