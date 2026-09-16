import React from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

export default function PerformanceBufferSection({
  performance = {},
  monitoring = {},
  updateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">07. Engine Tuning & Buffer Policy</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Join Processing Algorithm */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-1 border-b border-slate-100 flex items-center gap-2">
              <Activity className="size-3.5 text-blue-600" />
              Runtime Algorithm
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Execution Strategy</label>
              <select
                value={performance.joinBufferType || 'IN_MEMORY_HASH'}
                onChange={(e) => updateNestedField('performance', 'joinBufferType', e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="IN_MEMORY_HASH">In-Memory Hash Join (Fastest, High RAM)</option>
                <option value="SORT_MERGE_SPILL">Sort & Merge (Best for large streams, spills to disk)</option>
                <option value="BROADCAST_LOOKUP">Broadcast Lookup (Left large, right small)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Buffer Size (MB)</label>
                <input
                  type="number"
                  min="64"
                  max="4096"
                  value={performance.bufferSizeMb || 512}
                  onChange={(e) => updateNestedField('performance', 'bufferSizeMb', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Parallel Shards</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={performance.parallelWorkers || 4}
                  onChange={(e) => updateNestedField('performance', 'parallelWorkers', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Spill & Monitoring */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-1 border-b border-slate-100 flex items-center gap-2">
              <HardDrive className="size-3.5 text-blue-600" />
              Overflow & Alerts
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={performance.spillToDisk}
                  onChange={(e) => updateNestedField('performance', 'spillToDisk', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold block">Allow Spilling to Disk</span>
                  <p className="text-[10px] text-slate-500 max-w-[250px]">Prevents OOM on large cartesian intersections at the cost of IO IOPS overhead.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={monitoring.alertOnDropRateExceeded}
                  onChange={(e) => updateNestedField('monitoring', 'alertOnDropRateExceeded', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold block">Alert on High Drop Rate</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">Threshold:</span>
                    <input
                      type="number"
                      disabled={!monitoring.alertOnDropRateExceeded}
                      value={monitoring.dropRateThresholdPercent || 5.0}
                      onChange={(e) => updateNestedField('monitoring', 'dropRateThresholdPercent', parseFloat(e.target.value))}
                      className="w-16 px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded disabled:bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
