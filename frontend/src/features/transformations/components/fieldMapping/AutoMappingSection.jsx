import React from 'react';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AutoMappingSection({
  config = {},
  onToggleOption,
  onPreviewMatches,
  onApplyMatches,
}) {
  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="auto-mapping-heading"
    >
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            05
          </span>
          <h2 id="auto-mapping-heading" className="text-sm font-bold text-slate-900">
            Auto Mapping
          </h2>
          <span className="text-xs text-slate-500 font-normal">
            — Intelligent field matching
          </span>
        </div>

        {/* Status result badge matching Figma 170:1999 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="size-3.5 text-emerald-600" />
          <span>{config.matchesFound || 8} matches found</span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-700">{config.conflicts || 2} conflicts</span>
        </div>
      </div>

      <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Match by criteria checkboxes matching Figma 170:1979 */}
        <div className="flex items-center gap-6 flex-wrap text-xs text-slate-700 font-medium">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            Match by:
          </span>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!config.matchByName}
              onChange={() => onToggleOption('matchByName')}
              className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Field Name</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!config.matchBySimilarName}
              onChange={() => onToggleOption('matchBySimilarName')}
              className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Similar Name</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!config.matchByDataType}
              onChange={() => onToggleOption('matchByDataType')}
              className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Data Type</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!config.matchBySourcePath}
              onChange={() => onToggleOption('matchBySourcePath')}
              className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Source Path</span>
          </label>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPreviewMatches}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            Preview Matches
          </button>

          <button
            type="button"
            onClick={onPreviewMatches}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
          >
            Review Unmatched
          </button>

          <button
            type="button"
            onClick={onApplyMatches}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-sm transition-colors"
          >
            <Wand2 className="size-3.5 text-white" />
            Apply Matches
          </button>
        </div>
      </div>
    </section>
  );
}
