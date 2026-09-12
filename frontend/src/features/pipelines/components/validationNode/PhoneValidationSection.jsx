import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PhoneValidationSection({
  phoneConfig,
}) {
  const conf = phoneConfig || {};

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-09-phone-validation"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            09
          </span>
          <h2 id="section-09-phone-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Phone Validation
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Disabled
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Settings grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs opacity-75">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Phone Field</span>
            <span className="block font-mono font-medium text-slate-600 mt-0.5">{conf.field || 'phone (disabled)'}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Country / Region</span>
            <span className="block font-medium text-slate-700 mt-0.5">{conf.countryRegion || 'International (E.164)'}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Format</span>
            <span className="block font-mono font-medium text-slate-700 mt-0.5">{conf.format || 'E.164 (+[PHONE_REDACTED])'}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="block text-[11px] font-medium text-slate-500">Normalization</span>
            <span className="block font-medium text-slate-700 mt-0.5">{conf.normalization || 'Normalize to E.164'}</span>
          </div>
        </div>

        {/* Metrics Row & Notice Callout matching Figma */}
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-md flex items-center gap-2 text-xs text-slate-600">
          <AlertCircle className="size-4 text-slate-400 shrink-0" />
          <p className="leading-relaxed">
            {conf.disabledNotice || 'Rule is disabled — phone field not present in current schema.'}
          </p>
        </div>
      </div>
    </section>
  );
}
