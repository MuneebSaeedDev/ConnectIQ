import React from 'react';
import { Database } from 'lucide-react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function DataProcessingSection({ form, updateNestedField }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Data Processing & Quality</h3>
        <p className="text-xs text-slate-500 mt-0.5">Control pipeline ingestion semantics, schema evolution handling, and runtime memory limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Schema Drift Policy */}
        <div>
          <label htmlFor="schema-drift" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Upstream Schema Drift Policy
          </label>
          <select
            id="schema-drift"
            value={form.dataProcessing?.schemaDriftPolicy || 'evolve'}
            onChange={(e) => updateNestedField('dataProcessing', 'schemaDriftPolicy', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PIPELINE_SETTINGS_OPTIONS.schemaDriftPolicies.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Compression */}
        <div>
          <label htmlFor="compression-codec" className="block text-xs font-semibold text-slate-700 mb-1.5">
            In-Transit Payload Compression
          </label>
          <select
            id="compression-codec"
            value={form.dataProcessing?.compressionCodec || 'snappy'}
            onChange={(e) => updateNestedField('dataProcessing', 'compressionCodec', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PIPELINE_SETTINGS_OPTIONS.compressionCodecs.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deduplication buffer */}
        <div>
          <label htmlFor="dedup-buffer" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Deduplication Window</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">Records</span>
          </label>
          <input
            id="dedup-buffer"
            type="number"
            min="0"
            step="10000"
            value={form.dataProcessing?.deduplicationBufferRecords ?? 50000}
            onChange={(e) => updateNestedField('dataProcessing', 'deduplicationBufferRecords', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Disk spill limit */}
        <div>
          <label htmlFor="spill-limit" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Memory Spill Threshold</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">MB Limit</span>
          </label>
          <input
            id="spill-limit"
            type="number"
            min="0"
            step="512"
            value={form.dataProcessing?.spillToDiskThresholdMb ?? 4096}
            onChange={(e) => updateNestedField('dataProcessing', 'spillToDiskThresholdMb', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-2xs">
          <div className="flex h-5 items-center mt-0.5">
            <input
              type="checkbox"
              checked={form.dataProcessing?.enableCdcWatermarking ?? true}
              onChange={(e) => updateNestedField('dataProcessing', 'enableCdcWatermarking', e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Enable CDC Watermarking</span>
            <span className="text-xs text-slate-500 mt-1">Track high-water marks transactionally to support precise incremental extractions across pipeline restarts.</span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-2xs">
          <div className="flex h-5 items-center mt-0.5">
            <input
              type="checkbox"
              checked={form.dataProcessing?.spillEncryptionEnabled ?? true}
              onChange={(e) => updateNestedField('dataProcessing', 'spillEncryptionEnabled', e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Encrypt Disk Spills (AES-256)</span>
            <span className="text-xs text-slate-500 mt-1">Ensure RAM exhaustion spill blocks are encrypted at rest using ephemeral cluster vault keys.</span>
          </div>
        </label>
      </div>

    </div>
  );
}
