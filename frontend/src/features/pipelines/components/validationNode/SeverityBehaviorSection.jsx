import React from 'react';
import { ShieldAlert, AlertOctagon, HelpCircle } from 'lucide-react';
import { RULE_SEVERITIES, FAILURE_BEHAVIORS } from '../../services/validationNodeConfig.api';

export default function SeverityBehaviorSection({
  failureConfig,
  updateNestedField,
}) {
  const stats = failureConfig?.stats || {};
  const currentBehavior = failureConfig?.primaryBehavior || 'reject_record';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 13 Rule Severity */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-13-rule-severity"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              13
            </span>
            <h2 id="section-13-rule-severity" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Rule Severity
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {RULE_SEVERITIES.map((sev) => {
            const isErr = sev.id === 'error';
            const isWarn = sev.id === 'warning';

            return (
              <div
                key={sev.id}
                className="p-3 bg-slate-50/60 border border-slate-200 rounded-md flex items-start gap-3"
              >
                <span
                  className={`flex items-center justify-center size-6 rounded font-bold text-xs shrink-0 ${
                    isErr
                      ? 'bg-rose-100 text-rose-700'
                      : isWarn
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {sev.icon}
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {sev.label}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {sev.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 14 Failure Behavior */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-14-failure-behavior"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              14
            </span>
            <h2 id="section-14-failure-behavior" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Failure Behavior
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Top Rule: <strong className="text-rose-600 font-bold">{stats.topRule || 'email_not_null'}</strong>
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="space-y-2">
            {FAILURE_BEHAVIORS.map((fb) => {
              const isSelected = currentBehavior === fb.id;
              return (
                <label
                  key={fb.id}
                  className={`p-2.5 rounded-md border flex items-start gap-2.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-400 shadow-2xs'
                      : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="failure_behavior_radio"
                    value={fb.id}
                    checked={isSelected}
                    onChange={() =>
                      updateNestedField('failureBehavior', 'primaryBehavior', fb.id)
                    }
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{fb.label}</span>
                    <span className="text-[11px] text-slate-500 block leading-tight">{fb.description}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Rejected</span>
              <strong className="text-xs text-rose-600 block mt-0.5">{stats.rejected || '24,797'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Error Reasons</span>
              <strong className="text-xs text-slate-800 block mt-0.5">{stats.errorReasons || 3}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Top Rule</span>
              <strong className="text-xs text-blue-700 truncate block mt-0.5">{stats.topRule || 'email_not_null'}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
