import React from 'react';
import { ChevronDown, ChevronRight, Sliders } from 'lucide-react';

export default function AdvancedConfigSection({
  advancedConfig,
  isOpen,
  onToggle,
  updateNestedField,
}) {
  const ac = advancedConfig || {};

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-22-advanced-config"
    >
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            22
          </span>
          <h2 id="section-22-advanced-config" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Advanced Configuration
          </h2>
          <span className="text-[11px] text-slate-500 font-normal">
            — Runtime vars, custom expressions, quality thresholds
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span className="text-xs font-mono">{isOpen ? '−' : '+'}</span>
          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="custom-engine-args" className="block text-[11px] font-semibold text-slate-700">
                Custom Engine Arguments (Spark / Flink)
              </label>
              <input
                type="text"
                id="custom-engine-args"
                value={ac.customEngineArgs || ''}
                onChange={(e) =>
                  updateNestedField('advancedConfig', 'customEngineArgs', e.target.value)
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
                placeholder="--conf spark.sql.validation.mode=strict"
              />
            </div>

            <div>
              <label htmlFor="temp-spill-path" className="block text-[11px] font-semibold text-slate-700">
                Temp Spill Directory
              </label>
              <input
                type="text"
                id="temp-spill-path"
                value={ac.tempSpillPath || ''}
                onChange={(e) =>
                  updateNestedField('advancedConfig', 'tempSpillPath', e.target.value)
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
                placeholder="/tmp/spark-validation-spill"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="memory-limit" className="block text-[11px] font-semibold text-slate-700">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                id="memory-limit"
                value={ac.memoryLimitMb || 8192}
                onChange={(e) =>
                  updateNestedField('advancedConfig', 'memoryLimitMb', Number(e.target.value))
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>

            <div>
              <label htmlFor="quality-thresholds" className="block text-[11px] font-semibold text-slate-700">
                Custom Quality Thresholds
              </label>
              <input
                type="text"
                id="quality-thresholds"
                value={ac.qualityThresholds || ''}
                onChange={(e) =>
                  updateNestedField('advancedConfig', 'qualityThresholds', e.target.value)
                }
                className="w-full mt-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
                placeholder="completeness > 95.0%, validity > 99.0%"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
