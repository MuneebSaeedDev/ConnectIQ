import React from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { runAutoMappingAlgorithm } from '../../services/fieldMapping.api';

export default function PreviewMatchesModal({
  isOpen,
  onClose,
  onApply,
  sourceFields = [],
  targetFields = [],
  autoMappingConfig = {},
}) {
  if (!isOpen) return null;

  const { matches, conflicts } = runAutoMappingAlgorithm(
    sourceFields,
    targetFields,
    autoMappingConfig
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-matches-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />
            <h3 id="preview-matches-modal-title" className="text-sm font-bold text-slate-900">
              Auto-Mapping Matches Preview
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content table */}
        <div className="p-5 max-h-[400px] overflow-y-auto">
          <p className="text-xs text-slate-500 mb-3">
            Review suggested field correspondences calculated from active similarity and type heuristics:
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2 px-3">Source Field</th>
                <th scope="col" className="py-2 px-2 text-center"></th>
                <th scope="col" className="py-2 px-3">Target Field</th>
                <th scope="col" className="py-2 px-3">Strategy</th>
                <th scope="col" className="py-2 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {matches.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-900 font-semibold">{m.sourceField}</td>
                  <td className="py-2 px-2 text-center text-slate-400 font-sans">
                    <ArrowRight className="size-3 mx-auto text-blue-600" />
                  </td>
                  <td className="py-2 px-3 text-slate-900 font-semibold">{m.targetField}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{m.strategy}</td>
                  <td className="py-2 px-3 text-emerald-600 font-bold font-sans">
                    {Math.round(m.confidence * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {matches.length} matches ready to apply
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
            >
              Apply All Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
