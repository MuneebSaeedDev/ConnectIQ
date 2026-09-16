import React from 'react';
import { Cpu, HardDrive, Network } from 'lucide-react';

export default function PerformanceTuningSection({ performance, updateNestedField }) {
  if (!performance) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">07. Engine Performance & Resource Tuning</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Join Algorithm */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Algorithm</label>
            <select
              value={performance.joinBufferType || 'IN_MEMORY_HASH'}
              onChange={(e) => updateNestedField('performance', 'joinBufferType', e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
            >
              <option value="IN_MEMORY_HASH">In-Memory Hash Join</option>
              <option value="SORT_MERGE_SPILL">Sort Default (Spill-to-Disk)</option>
              <option value="BROADCAST_LOOKUP">Broadcast Lookup</option>
            </select>
          </div>

          {/* Parallel Workers */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Parallel Shards</label>
            <input
              type="number"
              min="1"
              max="64"
              value={performance.parallelWorkers || 4}
              onChange={(e) => updateNestedField('performance', 'parallelWorkers', parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Buffer Capacity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Max RAM Buffer (MB)</label>
            <input
              type="number"
              min="64"
              max="8192"
              step="64"
              value={performance.bufferSizeMb || 512}
              onChange={(e) => updateNestedField('performance', 'bufferSizeMb', parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Batch Splitting */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Batch Chunk Size</label>
            <input
              type="number"
              min="100"
              max="100000"
              step="500"
              value={performance.batchSize || 10000}
              onChange={(e) => updateNestedField('performance', 'batchSize', parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

        </div>

        {/* Disk spilling constraints */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={performance.spillToDisk || false}
                onChange={(e) => updateNestedField('performance', 'spillToDisk', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <HardDrive className="size-3.5 text-slate-500" />
              Allow Local Disk Traversal Spilling
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Prevents OOM terminations during massive unconstrained cross-joins by serializing intermediate buffers to internal volume stores. Substantially decreases throughput overhead.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={performance.enablePartitioning || false}
                onChange={(e) => updateNestedField('performance', 'enablePartitioning', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Network className="size-3.5 text-slate-500" />
              Distributed Shard Partitioning
            </label>
            <div className="pl-6 flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Partition Routing Key:</span>
              <input
                type="text"
                value={performance.partitionKey || ''}
                disabled={!performance.enablePartitioning}
                onChange={(e) => updateNestedField('performance', 'partitionKey', e.target.value)}
                placeholder="e.g. region_code"
                className="w-48 px-2 py-1 text-xs border border-slate-300 font-mono rounded focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
