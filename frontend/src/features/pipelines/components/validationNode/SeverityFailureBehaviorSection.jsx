import React from 'react';
import { RULE_SEVERITIES, FAILURE_BEHAVIORS } from '../../services/validationNodeConfig.api';

export default function SeverityFailureBehaviorSection({
  failureBehavior,
  onSelectBehavior,
}) {
  const primaryBehavior = failureBehavior?.primaryBehavior || 'reject_record';
  const stats = failureBehavior?.stats || {};

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
          {RULE_SEVERITIES.map((sev) => (
            <div
              key={sev.id}
              className="p-3 border border-slate-200 rounded-md bg-slate-50/40 flex items-start gap-3 text-xs"
            >
              <span
                className={`inline-flex items-center justify-center size-6 rounded font-bold text-xs shrink-0 ${
                  sev.id === 'error'
                    ? 'bg-rose-100 text-rose-700'
                    : sev.id === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {sev.icon}
              </span>
              <div>
                <span className="font-bold text-slate-900 block">{sev.label}</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{sev.description}</p>
              </div>
            </div>
          ))}
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
          <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {stats.rejected || '24,797'} Rejected
          </span>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="space-y-1.5" role="radiogroup" aria-label="Failure Behavior">
            {FAILURE_BEHAVIORS.map((fb) => {
              const isSelected = primaryBehavior === fb.id;
              return (
                <label
                  key={fb.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 text-blue-900'
                      : 'bg-slate-50/30 border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="primary_failure_behavior"
                    value={fb.id}
                    checked={isSelected}
                    onChange={() => onSelectBehavior(fb.id)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <strong className="block text-xs font-bold">{fb.label}</strong>
                    <span className="text-[11px] text-slate-500">{fb.description}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Rejected Records</span>
              <strong className="text-xs text-rose-600 block mt-0.5">{stats.rejected || '24,797'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Error Reasons</span>
              <strong className="text-xs text-slate-800 block mt-0.5">{stats.errorReasons || 3}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Top Rule</span>
              <strong className="text-xs text-blue-700 block mt-0.5 truncate">{stats.topRule || 'email_not_null'}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
