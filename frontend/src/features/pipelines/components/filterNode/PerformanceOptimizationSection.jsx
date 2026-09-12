import React from 'react';
import { Zap, Cpu } from 'lucide-react';

const OPTIMIZATION_ITEMS = [
  {
    key: 'predicatePushdown',
    label: 'Predicate Pushdown',
    description: 'Push filter expressions down to the upstream storage connector (e.g. Snowflake WHERE pushdown).',
  },
  {
    key: 'indexUsage',
    label: 'Index Usage',
    description: 'Leverage clustered keys and secondary indexes on referenced columns to eliminate table scans.',
  },
  {
    key: 'parallelEval',
    label: 'Parallel Evaluation',
    description: 'Distribute condition checks across worker thread pools for multi-rule predicates.',
  },
  {
    key: 'memoryOpt',
    label: 'Memory Optimization',
    description: 'Use Arrow zero-copy memory buffers and streaming chunk iterators to prevent OOM errors.',
  },
  {
    key: 'batchEval',
    label: 'Batch Evaluation',
    description: 'Vectorize boolean rule evaluations across 10,000-record chunks using SIMD instructions.',
  },
];

export default function PerformanceOptimizationSection({
  performanceOpt = {},
  togglePerformanceOpt,
}) {
  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-perf-opt"
    >
      {/* Section Header matching Figma 157:4217 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          <h2 id="section-perf-opt" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Performance Optimization
          </h2>
        </div>

        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          <Cpu className="size-3 text-purple-600" />
          Estimated cost: {performanceOpt.estimatedCost || '2.4 CU'}
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPTIMIZATION_ITEMS.map((item) => {
            const isEnabled = !!performanceOpt[item.key];

            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-lg border transition flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-slate-50/70 border-slate-300'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="space-y-0.5">
                  <label
                    htmlFor={`opt-${item.key}`}
                    className="text-xs font-semibold text-slate-800 cursor-pointer block"
                  >
                    {item.label}
                  </label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  id={`opt-${item.key}`}
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => togglePerformanceOpt(item.key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
