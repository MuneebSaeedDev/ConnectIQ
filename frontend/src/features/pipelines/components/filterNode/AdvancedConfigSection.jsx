import React from 'react';
import { SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdvancedConfigSection({
  advancedConfig = {},
  updateNestedField,
  isOpen,
  onToggleOpen,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-advanced-config"
    >
      <button
        type="button"
        id="section-advanced-config"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className="w-full px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Advanced Configuration
          </h2>
          <span className="text-[11px] text-slate-500 font-normal ml-2">
            Low-level engine overrides, memory thresholds, and disk spill buffers
          </span>
        </div>
        {isOpen ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="customEngineArgs" className="block text-xs font-semibold text-slate-700">
                Custom Engine Arguments (Spark / JVM / Arrow)
              </label>
              <input
                type="text"
                id="customEngineArgs"
                value={advancedConfig.customEngineArgs || ''}
                onChange={(e) => updateNestedField('advancedConfig', 'customEngineArgs', e.target.value)}
                placeholder="--conf spark.sql.shuffle.partitions=16"
                className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tempSpillPath" className="block text-xs font-semibold text-slate-700">
                Temporary Spill Storage Path
              </label>
              <input
                type="text"
                id="tempSpillPath"
                value={advancedConfig.tempSpillPath || ''}
                onChange={(e) => updateNestedField('advancedConfig', 'tempSpillPath', e.target.value)}
                placeholder="/tmp/spark-filter-spill"
                className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="memoryLimitMb" className="block text-xs font-semibold text-slate-700">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                id="memoryLimitMb"
                min={512}
                max={65536}
                step={512}
                value={advancedConfig.memoryLimitMb ?? 4096}
                onChange={(e) => updateNestedField('advancedConfig', 'memoryLimitMb', Number(e.target.value))}
                className="w-full px-3 py-1.5 font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={advancedConfig.enableJit ?? true}
                  onChange={(e) => updateNestedField('advancedConfig', 'enableJit', e.target.checked)}
                  className="size-4 rounded text-blue-600 focus:ring-blue-500"
                />
                Enable JIT Expression Compilation
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={advancedConfig.logFilteredRecords ?? false}
                  onChange={(e) => updateNestedField('advancedConfig', 'logFilteredRecords', e.target.checked)}
                  className="size-4 rounded text-blue-600 focus:ring-blue-500"
                />
                Log Dropped Records to Audit Stream
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
