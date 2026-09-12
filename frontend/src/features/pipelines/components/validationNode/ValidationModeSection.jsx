import React from 'react';
import { VALIDATION_MODES } from '../../services/validationNodeConfig.api';

export default function ValidationModeSection({
  selectedMode,
  onSelectMode,
}) {
  const currentMode = VALIDATION_MODES.find((m) => m.id === selectedMode) || VALIDATION_MODES[0];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-03-validation-mode"
    >
      {/* Section Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            03
          </span>
          <h2 id="section-03-validation-mode" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Validation Mode
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Selected: <strong className="text-slate-800">{currentMode.label}</strong>
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Validation Mode">
          {VALIDATION_MODES.map((mode) => {
            const isSelected = (selectedMode || 'rule_based') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectMode(mode.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Selected Mode description banner */}
        <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-md">
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-blue-900 font-semibold">{currentMode.label}</strong> — {currentMode.description}
          </p>
        </div>
      </div>
    </section>
  );
}
