import React, { useState } from 'react';
import {
  X,
  Star,
  Shield,
  Plus,
  Copy,
  Check,
  Code,
  Activity,
  Database,
  Workflow,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';
import NodeSchematicPreview from './NodeSchematicPreview';

const TABS = ['Overview', 'Config', 'I/O', 'Metrics', 'Versions', 'Docs'];

const ICON_MAP = {
  'node-pg-src-01': Database,
  'node-kafka-src-02': Activity,
  'node-rest-src-03': Database,
  'node-field-map-04': Workflow,
  'node-filter-05': Workflow,
  'node-python-transform-06': Code,
  'node-schema-val-07': ShieldCheck,
  'node-snowflake-dst-08': Warehouse,
  'node-s3-dst-09': Warehouse,
};

export default function NodeDetailDrawer({
  node,
  isOpen,
  onClose,
  activeTab = 'Overview',
  onTabChange,
  isFavorite,
  onToggleFavorite,
  onAddToPipeline,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !node) return null;

  const IconComp = ICON_MAP[node.id] || Database;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <aside
      className="w-80 sm:w-88 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden h-full z-20 shadow-lg text-xs"
      aria-label="Node Details Panel"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: node.accentColor || '#3b82f6' }}
            >
              <IconComp className="w-5 h-5" />
            </div>

            {/* Title & Version */}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {node.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                  {node.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {node.version}
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close panel"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-2 mt-3 text-[10px] flex-wrap">
          {/* Status */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{node.status}</span>
          </span>

          {/* Tier */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
            <Shield className="w-2.5 h-2.5 text-indigo-600" />
            <span>{node.certification}</span>
          </span>

          {/* Team */}
          <span className="text-slate-500 truncate max-w-[120px]" title={node.ownerTeam}>
            {node.ownerTeam}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/50 px-2 shrink-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            {/* Description */}
            <p className="text-slate-600 leading-relaxed text-xs">
              {node.description}
            </p>

            {/* Node Preview Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Node Preview
              </span>
              <NodeSchematicPreview node={node} />
            </div>

            {/* Compatibility Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Compatibility
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Platform Version</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {node.compatibility?.platformVersion || 'v4.0+'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Runtime</span>
                  <span className="font-medium text-slate-800">
                    {node.compatibility?.runtime || 'JVM 17 / Python 3.11'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Supported Sources</span>
                  <span className="text-slate-700">
                    {node.compatibility?.supportedSources || '12 connector types'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Supported Destinations</span>
                  <span className="text-slate-700">
                    {node.compatibility?.supportedDestinations || 'Any sink node'}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration Parameters Summary */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Configuration
              </span>
              <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                {node.configParameters?.map((param) => (
                  <div key={param.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-0.5">
                      <span className="font-medium text-slate-800">{param.name}</span>
                      {param.required && <span className="text-rose-500 font-bold">*</span>}
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                      {param.default}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Metrics (2x2 Grid) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Operational Metrics
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">Usage Count</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                    {node.metrics?.usageCount || node.usesCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">Success Rate</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5 font-mono">
                    {node.metrics?.successRate || '98.7%'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">Failure Rate</div>
                  <div className="text-sm font-bold text-rose-600 mt-0.5 font-mono">
                    {node.metrics?.failureRate || '1.3%'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">Avg Exec Time</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                    {node.metrics?.avgExecTime || '4.2 s'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Dependencies
              </span>
              <div className="space-y-1.5">
                {node.dependencies?.map((dep) => (
                  <div
                    key={dep.name}
                    className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-200/50 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-mono text-slate-700 truncate">{dep.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 shrink-0">
                      {dep.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIG */}
        {activeTab === 'Config' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Configuration Schema</h3>
            <div className="space-y-3">
              {node.configParameters?.map((param) => (
                <div key={param.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {param.name} {param.required && <span className="text-rose-500">*</span>}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 font-mono text-slate-700">
                      {param.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Default: <code className="text-indigo-600 font-mono">{param.default}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: I/O */}
        {activeTab === 'I/O' && (
          <div className="space-y-4">
            {/* Inputs */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Input Ports</h3>
              {node.ports?.inputs?.length > 0 ? (
                <div className="space-y-1.5">
                  {node.ports.inputs.map((inp) => (
                    <div key={inp.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800">{inp.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{inp.type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                  Source node — no input ports required.
                </div>
              )}
            </div>

            {/* Outputs */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Output Ports</h3>
              {node.ports?.outputs?.length > 0 ? (
                <div className="space-y-1.5">
                  {node.ports.outputs.map((out) => (
                    <div key={out.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800">{out.name}</div>
                      <div className="text-[10px] font-mono text-indigo-600">{out.type} ({out.format || 'RecordBatch'})</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                  Terminal destination sink — no outgoing ports.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: METRICS */}
        {activeTab === 'Metrics' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800">Performance Telemetry</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">P95 Latency SLA</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">120 ms</div>
                <div className="text-[10px] text-emerald-600 font-medium">99.98% within SLA threshold</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Throughput Capacity</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">45,000 rec/sec</div>
                <div className="text-[10px] text-slate-500">Peak cluster capacity tested</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VERSIONS */}
        {activeTab === 'Versions' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Release Changelog</h3>
            <div className="space-y-2">
              {node.versions?.map((v) => (
                <div key={v.version} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700">{v.version}</span>
                    <span className="text-[10px] text-slate-400">{v.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{v.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DOCS */}
        {activeTab === 'Docs' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Documentation</h3>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 prose prose-slate text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed">
                ConnectIQ provides full runtime orchestration for the <strong>{node.name}</strong> component.
              </p>
              <h4 className="font-bold text-slate-900 text-xs">Best Practices:</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>Always enable connection pooling in production environments.</li>
                <li>Set query timeout to under 60 seconds to prevent blocking worker threads.</li>
                <li>Ensure TLS 1.3 is configured for data in transit.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Sticky Footer */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-2">
        {/* Primary Add to Pipeline Button */}
        <button
          type="button"
          onClick={() => onAddToPipeline(node)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Pipeline</span>
        </button>

        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(node.id, e)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Favorite toggle"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>

        {/* Share Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          title="Copy node link"
          aria-label="Copy node link"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
