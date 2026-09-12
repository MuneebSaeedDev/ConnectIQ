import React from 'react';
import { Sliders, Code2, Database, Terminal } from 'lucide-react';

const FILTER_MODES = [
  {
    id: 'basic',
    label: 'Basic Filter',
    icon: Sliders,
    description: 'Visual condition builder with typed operators and group logic',
  },
  {
    id: 'advanced',
    label: 'Advanced Expression',
    icon: Code2,
    description: 'Boolean expression syntax with nested functions and sub-expressions',
  },
  {
    id: 'sql',
    label: 'SQL WHERE Clause',
    icon: Database,
    description: 'Standard ANSI SQL predicate pushed down to execution engine',
  },
  {
    id: 'script',
    label: 'Custom Script',
    icon: Terminal,
    description: 'Record-level programmatic evaluation in Python or JavaScript',
  },
];

export default function FilterModeSelector({
  filterMode = 'basic',
  onSelectMode,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-filter-mode"
    >
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
        <h2 id="section-filter-mode" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
          Filter Mode
        </h2>
      </div>

      <div className="p-5">
        <div
          role="radiogroup"
          aria-label="Select filter configuration mode"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {FILTER_MODES.map((mode) => {
            const isSelected = filterMode === mode.id;
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectMode(mode.id)}
                className={`p-3.5 rounded-lg text-left transition border text-xs flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {mode.label}
                    </span>
                  </div>
                  <span
                    className={`size-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
