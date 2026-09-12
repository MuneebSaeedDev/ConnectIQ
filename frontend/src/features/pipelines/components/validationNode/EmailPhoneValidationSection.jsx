import React from 'react';
import { Mail, Phone, AlertCircle } from 'lucide-react';

export default function EmailPhoneValidationSection({
  emailConfig,
  phoneConfig,
  updateNestedField,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 08 Email Validation Section */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-08-email-validation"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              08
            </span>
            <h2 id="section-08-email-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Email Validation
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {emailConfig?.validationRate || '99.6%'}
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Email Field</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                {emailConfig?.field || 'email'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Severity</span>
              <span className="font-bold text-rose-600 mt-0.5 block">
                {emailConfig?.severity || 'Error'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Validation Pattern</span>
              <span className="font-mono font-bold text-blue-700 mt-0.5 block">
                {emailConfig?.pattern || 'RFC 5322'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Case Sensitivity</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {emailConfig?.caseSensitivity || 'Case Insensitive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Valid Records</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">
                {emailConfig?.validRecords || '4,181,203'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Invalid Records</span>
              <strong className="text-xs text-rose-600 block mt-0.5">
                {emailConfig?.invalidRecords || '18,797'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Validation Rate</span>
              <strong className="text-xs text-blue-700 block mt-0.5">
                {emailConfig?.validationRate || '99.6%'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 09 Phone Validation Section */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden opacity-90"
        aria-labelledby="section-09-phone-validation"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-bold">
              09
            </span>
            <h2 id="section-09-phone-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Phone Validation
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Disabled
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Phone Field</span>
              <span className="font-mono text-slate-600 mt-0.5 block">
                {phoneConfig?.field || 'phone (disabled)'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Country / Region</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {phoneConfig?.countryRegion || 'International (E.164)'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Format</span>
              <span className="font-mono text-slate-700 mt-0.5 block">
                {phoneConfig?.format || 'E.164 (+[PHONE_REDACTED])'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Normalization</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {phoneConfig?.normalization || 'Normalize to E.164'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex items-center gap-2">
            <AlertCircle className="size-4 text-slate-400 shrink-0" />
            <span>
              {phoneConfig?.disabledNotice ||
                'Rule is disabled — phone field not present in current schema.'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
