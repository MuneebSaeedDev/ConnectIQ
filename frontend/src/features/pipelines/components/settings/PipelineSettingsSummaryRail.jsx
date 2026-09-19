import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldAlert,
  Cpu,
  RotateCw,
  Bell,
  Sliders,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function PipelineSettingsSummaryRail({
  form,
  validation,
  activeTab,
  setActiveTab
}) {
  const isHealthy = validation?.isValid ?? true;

  const getPercentage = () => {
    let completed = 0;
    const total = 5; // General, Execution, Data, Error, Retry
    if (form.name && form.name.length >= 3) completed++;
    if (form.execution?.engine && form.execution?.mode) completed++;
    if (form.dataProcessing?.schemaDriftPolicy) completed++;
    if (form.errorHandling?.strategy) completed++;
    if (!form.retryConfig?.enabled || (form.retryConfig?.maxRetries > 0)) completed++;
    return Math.round((completed / total) * 100);
  };

  const pct = getPercentage();

  const navItems = [
    { id: 'general', label: 'General Identity', icon: Sliders },
    { id: 'execution', label: 'Execution Profile', icon: Cpu, hasError: validation?.errors?.timeoutMinutes },
    { id: 'data', label: 'Data Processing', icon: Database },
    { id: 'error', label: 'Error Handling', icon: ShieldAlert, hasError: validation?.errors?.maxErrorThresholdPct },
    { id: 'retry', label: 'Retry Policies', icon: RotateCw, hasError: validation?.errors?.maxRetries || validation?.errors?.initialDelaySeconds },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-5">
      {/* Configuration Status Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Configuration Status
          </h3>
          {isHealthy ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="size-3" /> Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
              <AlertCircle className="size-3" /> Errors
            </span>
          )}
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Settings Readiness</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation Checklist if errors exist */}
      {!isHealthy && Object.keys(validation?.errors || {}).length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg shadow-2xs p-4 animate-in fade-in duration-200">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2">
            <AlertCircle className="size-4" />
            Validation Errors ({Object.keys(validation.errors).length})
          </h3>
          <ul className="space-y-1.5">
            {Object.entries(validation.errors).map(([key, msg]) => (
              <li key={key} className="text-[11px] text-rose-700 font-medium flex items-start gap-1">
                <span className="mt-0.5">•</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Anchor List */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Quick Navigation
          </h3>
        </div>
        <div className="p-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="size-3.5" />
                {item.label}
              </div>
              {item.hasError && (
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
              )}
              {activeTab === item.id && !item.hasError && (
                <ChevronRight className="size-3 text-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Summary Reference */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Active Parameters
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Engine</span>
            <span className="text-slate-900 font-semibold truncate max-w-[140px]">
              {PIPELINE_SETTINGS_OPTIONS.executionEngines.find(e => e.value === form.execution?.engine)?.label.split('(')[0].trim() || 'Spark Distributed'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Mode</span>
            <span className="text-slate-900 font-semibold capitalize">{form.execution?.mode || 'Batch'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Timeout</span>
            <span className="text-slate-900 font-semibold">{form.execution?.timeoutMinutes || 120} min</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Error Mode</span>
            <span className="text-slate-900 font-semibold truncate max-w-[140px]">
              {PIPELINE_SETTINGS_OPTIONS.errorStrategies.find(e => e.value === form.errorHandling?.strategy)?.label || 'Continue Valid'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Retries</span>
            {form.retryConfig?.enabled ? (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 rounded">{form.retryConfig.maxRetries} max</span>
            ) : (
              <span className="text-slate-500 font-semibold bg-slate-100 px-1.5 rounded">Disabled</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
