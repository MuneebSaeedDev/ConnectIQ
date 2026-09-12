import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Terminal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function LiveValidationPanel({
  validationChecks = [],
  dataPreview = {},
  onFixIssue,
  onRunValidation,
  isValidating = false,
}) {
  const [activeTab, setActiveTab] = useState('validation'); // 'validation' | 'preview' | 'logs'

  const passCount = validationChecks.filter((c) => c.type === 'pass').length;
  const warnCount = validationChecks.filter((c) => c.type === 'warning').length;
  const errCount = validationChecks.filter((c) => c.type === 'error').length;

  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="live-validation-heading"
    >
      {/* Top Tabs & Status header matching Figma 170:2728 */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Bottom Inspector Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'validation'}
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'validation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Validation
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Preview
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Logs
          </button>
        </div>

        {/* Live Status Indicators matching Figma 170:2738 */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            {passCount} passed
          </span>
          {warnCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="size-3.5 text-amber-600" />
              {warnCount} warning
            </span>
          )}
          {errCount > 0 && (
            <span className="inline-flex items-center gap-1 text-rose-700">
              <XCircle className="size-3.5 text-rose-600" />
              {errCount} error
            </span>
          )}
        </div>
      </div>

      {/* Panel Body */}
      <div className="p-4">
        {activeTab === 'validation' && (
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {validationChecks.map((item) => {
              const isErr = item.type === 'error';
              const isWarn = item.type === 'warning';
              const isPass = item.type === 'pass';

              return (
                <div
                  key={item.id || item.field}
                  className="py-2.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 px-2 rounded transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon & Code Badge */}
                    <div className="mt-0.5 shrink-0">
                      {isErr && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="size-3 text-rose-600" />
                          ERROR
                        </span>
                      )}
                      {isWarn && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="size-3 text-amber-600" />
                          WARN
                        </span>
                      )}
                      {isPass && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          PASS
                        </span>
                      )}
                    </div>

                    {/* Target & Message */}
                    <div>
                      <span className="font-bold text-slate-900">{item.target || item.field}</span>
                      <p className="font-sans text-[11px] text-slate-600 mt-0.5">{item.title}</p>
                      {item.description && item.description !== '—' && (
                        <p className="font-sans text-[11px] text-slate-500 italic mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fix Action trigger if available */}
                  {(isErr || isWarn) && (
                    <button
                      type="button"
                      onClick={() => onFixIssue && onFixIssue(item)}
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline pt-0.5 font-sans"
                    >
                      <span>Fix</span>
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-4 text-center text-xs text-slate-500 font-sans">
            <p className="font-semibold text-slate-700">Preview Engine Ready</p>
            <p className="mt-1 text-[11px]">
              Click "▶ Preview" in the Data Preview section above or run validation to refresh intermediate outputs.
            </p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-950 text-slate-200 p-3 rounded font-mono text-[11px] space-y-1">
            <p className="text-slate-400">[08:14:02 UTC] Mapping compilation started for node map_node_0041.</p>
            <p className="text-emerald-400">[08:14:02 UTC] 6 source expressions parsed successfully.</p>
            <p className="text-amber-400">[08:14:03 UTC] WARN: Potential loss of precision on balance_usd field.</p>
            <p className="text-rose-400">[08:14:03 UTC] ERROR: Target schema strict validation failed: required field 'status' has no incoming mapping.</p>
          </div>
        )}
      </div>
    </section>
  );
}
