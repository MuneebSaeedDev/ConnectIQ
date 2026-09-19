import React, { useState } from 'react';
import { Sliders, Terminal, Lock, Plug, Trash2, Plus, Info } from 'lucide-react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function AdvancedSettingsSection({
  form,
  updateNestedField,
  addEnvVar,
  updateEnvVar,
  removeEnvVar,
  addSecretRef,
  updateSecretRef,
  removeSecretRef
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full bg-white border border-slate-200 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition shadow-2xs group"
      >
        <Sliders className="size-4 group-hover:text-blue-600 transition-colors" />
        <span className="text-xs font-semibold">Show Advanced Configuration</span>
      </button>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Advanced Configuration</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition"
          >
            Hide Advanced
          </button>
        </div>

        <div className="p-5 space-y-8">
          {/* Telemetry & Compile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="log-level" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cluster Log Level
              </label>
              <select
                id="log-level"
                value={form.advanced?.logLevel || 'INFO'}
                onChange={(e) => updateNestedField('advanced', 'logLevel', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {PIPELINE_SETTINGS_OPTIONS.logLevels.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6">
               <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      checked={form.advanced?.enableOpenTelemetryTracing ?? true}
                      onChange={(e) => updateNestedField('advanced', 'enableOpenTelemetryTracing', e.target.checked)}
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Export OpenTelemetry Traces</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Stream W3C Trace Context spans to the enterprise APM collector</span>
                  </div>
                </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Engine Tuning</h3>

            <div>
              <label htmlFor="spark-args" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Terminal className="size-3.5" /> Additional Spark / Engine Arguments
              </label>
              <textarea
                id="spark-args"
                rows={2}
                value={form.advanced?.customSparkArgs || ''}
                onChange={(e) => updateNestedField('advanced', 'customSparkArgs', e.target.value)}
                className="w-full px-3 py-2 text-[11px] font-mono border border-slate-300 text-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                placeholder="--conf spark.sql.shuffle.partitions=200"
              />
            </div>

            <div>
               <label htmlFor="gc-args" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Garbage Collection Flags
              </label>
              <input
                id="gc-args"
                type="text"
                value={form.advanced?.garbageCollectionOpt || ''}
                onChange={(e) => updateNestedField('advanced', 'garbageCollectionOpt', e.target.value)}
                className="w-full px-3 py-2 text-[11px] font-mono border border-slate-300 text-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      checked={form.advanced?.enableJitCompilation ?? true}
                      onChange={(e) => updateNestedField('advanced', 'enableJitCompilation', e.target.checked)}
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">JIT Code Generation</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Compile DAG expression plans to native machine code before execution (increases startup latency, massively drops row latency)</span>
                  </div>
            </label>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plug className="size-3.5" /> Environment Variables
              </h3>
              <button
                type="button"
                onClick={addEnvVar}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                <Plus className="size-3" /> ADD VARIABLE
              </button>
            </div>

            {form.advanced?.environmentVariables?.length > 0 ? (
              <div className="space-y-2">
                {form.advanced.environmentVariables.map((env, index) => (
                  <div key={`env-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value.toUpperCase())}
                      placeholder="KEY_NAME"
                      className="w-1/3 px-3 py-1.5 text-[11px] font-mono border border-slate-300 bg-slate-50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase placeholder:normal-case placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-1.5 text-[11px] font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeEnvVar(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Remove Variable"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border border-slate-200 border-dashed rounded bg-slate-50">
                <p className="text-[11px] text-slate-500">No custom environment variables injected.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Secret Vault References
              </h3>
              <button
                type="button"
                onClick={addSecretRef}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="size-3" /> ADD SECRET REF
              </button>
            </div>

             <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md flex items-start gap-2 text-indigo-800">
               <Info className="size-3.5 shrink-0 mt-0.5" />
               <p className="text-[10px] leading-relaxed">Mount external HashiCorp / AWS Secrets Manager references dynamically into the worker pool. These are resolved at runtime and never persisted in pipeline logs.</p>
             </div>

            {form.advanced?.secretReferences?.length > 0 ? (
               <div className="space-y-2">
                {form.advanced.secretReferences.map((secret, index) => (
                  <div key={`param-${index}`} className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                       <Lock className="absolute left-2.5 top-2 size-3 text-slate-400" />
                       <input
                        type="text"
                        value={secret.secretName}
                        onChange={(e) => updateSecretRef(index, 'secretName', e.target.value)}
                        placeholder="Internal Alias (e.g. OAUTH_TOKEN)"
                        className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-[2] flex gap-2">
                       <input
                        type="text"
                        value={secret.vaultKey}
                        onChange={(e) => updateSecretRef(index, 'vaultKey', e.target.value)}
                        placeholder="Vault URI (e.g. vault://enterprise/oauth...)"
                         className="w-full px-3 py-1.5 text-[11px] font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSecretRef(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition shrink-0"
                        title="Remove Secret"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="p-4 text-center border border-slate-200 border-dashed rounded bg-slate-50">
                   <p className="text-[11px] text-slate-500">No external secrets mounted.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
