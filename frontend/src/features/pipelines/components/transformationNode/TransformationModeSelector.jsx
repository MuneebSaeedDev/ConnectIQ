import React from 'react';
import {
  TRANSFORMATION_MODES,
} from '../../services/transformationNodeConfig.api';
import {
  Sliders,
  Code2,
  Sparkles,
  ArrowRightLeft,
  Calendar,
  CopyX,
  Search,
  Wrench,
} from 'lucide-react';

const MODE_ICONS = {
  rule_based: Sliders,
  expression: Code2,
  cleaning: Sparkles,
  type_conversion: ArrowRightLeft,
  date_formatting: Calendar,
  deduplication: CopyX,
  lookup: Search,
  custom: Wrench,
};

export default function TransformationModeSelector({
  activeMode = 'rule_based',
  onSelectMode,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header matching Figma 220:6217 */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">
          Transformation Mode
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select the active transformation strategy
        </p>
      </div>

      {/* 8 Mode Button Pills matching Figma 220:6226 - 220:6240 */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {TRANSFORMATION_MODES.map((mode) => {
            const isSelected = activeMode === mode.id;
            const IconComp = MODE_ICONS[mode.id] || Sliders;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <IconComp
                  className={`size-4.5 mb-1.5 ${
                    isSelected ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
