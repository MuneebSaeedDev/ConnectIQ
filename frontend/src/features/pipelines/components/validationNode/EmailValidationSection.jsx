import React from 'react';
import { Mail, CheckCircle2, XCircle, Percent } from 'lucide-react';

export default function EmailValidationSection({
  emailConfig,
}) {
  const conf = emailConfig || {};

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-08-email-validation"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            08
          </span>
          <h2 id="section-08-email-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Email Validation
          </h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 font-mono">
          Validation Rate: <strong>{conf.validationRate || '99.6%'}</strong>
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Settings grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Email Field</span>
            <span className="block font-mono font-bold text-slate-900 mt-0.5">{conf.field || 'email'}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Severity</span>
            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {conf.severity || 'Error'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Validation Pattern</span>
            <span className="block font-mono font-semibold text-blue-700 mt-0.5">{conf.pattern || 'RFC 5322'}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Case Sensitivity</span>
            <span className="block font-medium text-slate-700 mt-0.5">{conf.caseSensitivity || 'Case Insensitive'}</span>
          </div>
        </div>

        {/* Telemetry metrics bar */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-center">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Valid Records</span>
            <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">
              {conf.validRecords || '4,181,203'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Invalid Records</span>
            <span className="text-sm font-bold font-mono text-rose-700 block mt-0.5">
              {conf.invalidRecords || '18,797'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Validation Rate</span>
            <span className="text-sm font-bold font-mono text-blue-700 block mt-0.5">
              {conf.validationRate || '99.6%'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
