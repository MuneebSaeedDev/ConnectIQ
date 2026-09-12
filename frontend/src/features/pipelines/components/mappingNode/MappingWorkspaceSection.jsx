import React from 'react';
import {
  Plus,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit2,
  Copy,
  X,
  ArrowRight,
} from 'lucide-react';

export default function MappingWorkspaceSection({
  mappings = [],
  selectedMappingId,
  onSelectMapping,
  onAddMapping,
  onAutoMap,
  onClearAll,
  onEditMapping,
  onDuplicateMapping,
  onRemoveMapping,
}) {
  const mappedCount = mappings.filter((m) => m.status === 'mapped' || m.validationStatus === 'pass').length;
  const warningCount = mappings.filter((m) => m.status === 'warning' || m.validationStatus === 'warning').length;
  const errorCount = mappings.filter((m) => m.status === 'missing' || m.validationStatus === 'error').length;

  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="mapping-workspace-heading"
    >
      {/* Header matching Figma 170:2010 */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            04
          </span>
          <h2 id="mapping-workspace-heading" className="text-sm font-bold text-slate-900">
            Mapping Workspace
          </h2>

          {/* Metric status pills */}
          <div className="flex items-center gap-1.5 ml-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {mappedCount} mapped
            </span>
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <span className="size-1.5 rounded-full bg-amber-500" />
                {warningCount} warning
              </span>
            )}
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <span className="size-1.5 rounded-full bg-rose-500" />
                {errorCount} error
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddMapping}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
          >
            <Plus className="size-3 text-blue-600" />
            Add Mapping
          </button>

          <button
            type="button"
            onClick={onAutoMap}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors"
          >
            <Sparkles className="size-3 text-slate-500" />
            Auto Map
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Mapping Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" className="py-2.5 px-4 font-semibold">Source Field</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Src Type</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Mapping</th>
              <th scope="col" className="py-2.5 px-4 font-semibold">Transformation</th>
              <th scope="col" className="py-2.5 px-4 font-semibold">Target Field</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Tgt Type</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Validation</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 font-mono text-[11px]">
            {mappings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                  No mapping rules defined. Click "+ Add Mapping" or "Auto Map" to begin.
                </td>
              </tr>
            ) : (
              mappings.map((m) => {
                const isSelected = m.id === selectedMappingId;
                const isError = m.validationStatus === 'error' || m.status === 'missing';
                const isWarning = m.validationStatus === 'warning';
                const isPass = m.validationStatus === 'pass';

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMapping && onSelectMapping(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                        : isError
                        ? 'bg-rose-50/30 hover:bg-rose-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Source Field */}
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full shrink-0 ${
                            isPass ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-semibold">{m.sourceField}</span>
                      </div>
                    </td>

                    {/* Source Type */}
                    <td className="py-2.5 px-3">
                      {m.srcType !== '—' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {m.srcType}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Mapping Type */}
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">
                      {m.mappingType !== '—' ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.mappingType === 'Direct'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.mappingType === 'Expression'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : m.mappingType === 'Cast'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : m.mappingType === 'Conditional'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {m.mappingType}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Transformation */}
                    <td className="py-2.5 px-4 text-slate-700 max-w-[220px] truncate" title={m.transformation}>
                      {m.transformation !== '—' ? (
                        <code className="text-[11px] text-blue-800 bg-blue-50/50 px-1 py-0.5 rounded">
                          {m.transformation}
                        </code>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Target Field */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {m.targetField !== '—' ? (
                        <span>{m.targetField}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Target Type */}
                    <td className="py-2.5 px-3">
                      {m.tgtType !== '—' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {m.tgtType}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Validation */}
                    <td className="py-2.5 px-3 font-sans">
                      {isPass && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          ✓ Pass
                        </span>
                      )}
                      {isWarning && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"
                          title={m.validationMessage}
                        >
                          <AlertTriangle className="size-3 text-amber-600 shrink-0" />
                          ⚠ Precision
                        </span>
                      )}
                      {isError && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700"
                          title={m.validationMessage}
                        >
                          <XCircle className="size-3 text-rose-600 shrink-0" />
                          ✗ Missing
                        </span>
                      )}
                      {m.validationStatus === 'unmapped' && (
                        <span className="text-[11px] text-slate-400 italic">
                          — Unmapped
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onEditMapping && onEditMapping(m)}
                          className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit mapping rule"
                          aria-label={`Edit ${m.targetField}`}
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateMapping && onDuplicateMapping(m)}
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Duplicate rule"
                          aria-label={`Duplicate ${m.targetField}`}
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveMapping && onRemoveMapping(m.id)}
                          className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove rule"
                          aria-label={`Delete ${m.targetField}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
