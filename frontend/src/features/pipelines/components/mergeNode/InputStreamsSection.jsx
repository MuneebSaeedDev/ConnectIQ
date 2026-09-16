import React from 'react';
import { Database, ArrowRight, RefreshCw, Key, Layers, ExternalLink } from 'lucide-react';

export default function InputStreamsSection({
  primaryStream,
  secondaryStream,
  onViewSchema,
  onRefreshSchemas,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">02. Connected Input Streams</h2>
        </div>
        <button
          type="button"
          onClick={onRefreshSchemas}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
        >
          <RefreshCw className="size-3" />
          Refresh Schemas
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Left Stream Card */}
          <div className="p-4 border border-blue-200 bg-blue-50/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  Left Stream (Primary)
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {primaryStream?.alias || 'crm'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {primaryStream?.totalRecords?.toLocaleString()} records
              </span>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-800">{primaryStream?.nodeName}</h3>
              <p className="text-[11px] text-slate-500 font-mono">Node ID: {primaryStream?.nodeId}</p>
            </div>

            {/* Field Pills preview */}
            <div className="pt-2 border-t border-blue-100/80">
              <div className="text-[11px] font-medium text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Available Schema ({primaryStream?.fields?.length || 0} fields)</span>
                <button
                  type="button"
                  onClick={() => onViewSchema('primary')}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Details <ExternalLink className="size-2.5" />
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {(primaryStream?.fields || []).map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {f.isKey && <Key className="size-3 text-amber-600" title="Primary / Unique Key" />}
                      <span className="font-mono text-slate-800">{f.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {f.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Right Stream Card */}
          <div className="p-4 border border-purple-200 bg-purple-50/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Right Stream (Secondary)
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {secondaryStream?.alias || 'orders'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {secondaryStream?.totalRecords?.toLocaleString()} records
              </span>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-800">{secondaryStream?.nodeName}</h3>
              <p className="text-[11px] text-slate-500 font-mono">Node ID: {secondaryStream?.nodeId}</p>
            </div>

            {/* Field Pills preview */}
            <div className="pt-2 border-t border-purple-100/80">
              <div className="text-[11px] font-medium text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Available Schema ({secondaryStream?.fields?.length || 0} fields)</span>
                <button
                  type="button"
                  onClick={() => onViewSchema('secondary')}
                  className="text-purple-600 hover:underline flex items-center gap-1"
                >
                  View Details <ExternalLink className="size-2.5" />
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {(secondaryStream?.fields || []).map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {f.isKey && <Key className="size-3 text-amber-600" title="Key Attribute" />}
                      <span className="font-mono text-slate-800">{f.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {f.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
