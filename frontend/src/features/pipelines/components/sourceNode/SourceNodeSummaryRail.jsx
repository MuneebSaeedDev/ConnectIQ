import React from 'react';
import {
  Lock,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

export default function SourceNodeSummaryRail({
  form,
  validationSummary,
  onSave,
  onTestConnection,
  onDuplicate,
  isSaving,
}) {
  const reqFieldsCount = form.nodeName ? 6 : 5;

  return (
    <aside className="w-full xl:w-80 space-y-4 shrink-0" aria-label="Source Node Summary and Diagnostics">
      {/* 1. Node Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-[#336791]/10 border border-[#336791]/30 text-[#336791] font-bold text-xs flex items-center justify-center">
              PG
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                PostgreSQL Source
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {form.nodeName || 'source_node_001'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Draft
          </span>
        </div>

        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Config Status</dt>
            <dd className="font-semibold text-amber-700">In Progress</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Validation</dt>
            <dd className="font-medium text-slate-800">
              {validationSummary.passed} / {validationSummary.total} passed
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Connected Pipelines</dt>
            <dd className="font-medium text-slate-800">0</dd>
          </div>
        </dl>
      </div>

      {/* 2. Connector Health Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Connector Health
        </h3>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Connection</dt>
            <dd className="font-semibold text-emerald-700 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Connected
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Authentication</dt>
            <dd className="font-semibold text-emerald-700 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Verified
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Latency</dt>
            <dd className="font-semibold text-emerald-700">18 ms</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Availability</dt>
            <dd className="font-semibold text-emerald-700">99.97%</dd>
          </div>
        </dl>
      </div>

      {/* 3. Source Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Source Summary
        </h3>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Connector</dt>
            <dd className="font-mono text-slate-800">{form.connectorInstance || 'pg-prod-primary'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Environment</dt>
            <dd className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
              {form.environment || 'Production'}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Database</dt>
            <dd className="font-mono text-slate-800">{form.database || 'analytics_db'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Schema</dt>
            <dd className="font-mono text-slate-800">{form.schema || 'public'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Table</dt>
            <dd className="font-mono text-slate-800 font-semibold">{form.table || 'orders'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Extraction</dt>
            <dd className="text-slate-800 font-medium capitalize">
              {form.extractionMode?.replace('_', ' ') || 'Incremental'}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Watermark Col</dt>
            <dd className="font-mono text-slate-800">{form.watermarkColumn || 'created_at'}</dd>
          </div>
        </dl>
      </div>

      {/* 4. Runtime Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Runtime Summary
        </h3>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Batch Size</dt>
            <dd className="font-medium text-slate-800">{form.batchSize || '10,000'} rows</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Parallelism</dt>
            <dd className="font-medium text-slate-800">{form.parallelism || 4} threads</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Timeout</dt>
            <dd className="font-medium text-slate-800">{form.timeout || 30} {form.timeoutUnit || 'sec'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Retry Policy</dt>
            <dd className="font-medium text-slate-800">Exp. Backoff</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-slate-500">Compression</dt>
            <dd className="font-medium text-emerald-700 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Enabled
            </dd>
          </div>
        </dl>
      </div>

      {/* 5. Validation Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Validation Summary
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200/60">
            <span className="block text-base font-bold text-emerald-700">
              {validationSummary.passed}
            </span>
            <span className="text-[10px] font-medium text-emerald-800">Passed</span>
          </div>
          <div className="p-2 rounded-md bg-amber-50 border border-amber-200/60">
            <span className="block text-base font-bold text-amber-700">
              {validationSummary.warning}
            </span>
            <span className="text-[10px] font-medium text-amber-800">Warnings</span>
          </div>
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <span className="block text-base font-bold text-slate-700">
              {validationSummary.pending}
            </span>
            <span className="text-[10px] font-medium text-slate-600">Pending</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Required Fields</span>
            <span className="font-bold text-slate-800">{reqFieldsCount} / 7</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(reqFieldsCount / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. Action Buttons & Security Notice */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
        >
          <Check className="size-4" />
          {isSaving ? 'Saving…' : 'Save Configuration'}
        </button>

        <button
          type="button"
          onClick={onTestConnection}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
        >
          <Activity className="size-4 text-blue-600" />
          Test Connection
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
        >
          <Copy className="size-4 text-slate-500" />
          Duplicate Node
        </button>

        <p className="text-[11px] text-slate-400 p-3 bg-slate-50 rounded-md border border-slate-200 leading-relaxed flex items-start gap-2">
          <Lock className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Credentials are AES-256 encrypted at rest and never exposed after initial configuration.
          </span>
        </p>
      </div>
    </aside>
  );
}
