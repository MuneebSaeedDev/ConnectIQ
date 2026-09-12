import React from 'react';
import { Link2, Copy, CheckCircle2 } from 'lucide-react';

export default function ReferentialDuplicateSection({
  referentialConfig,
  duplicateConfig,
  updateNestedField,
}) {
  const refConf = referentialConfig || {};
  const dupConf = duplicateConfig || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 11 Referential Validation */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-11-referential-validation"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              11
            </span>
            <h2 id="section-11-referential-validation" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Referential Validation
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {refConf.matchRate || '99.9%'} Match
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Source Field</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                {refConf.sourceField || 'customer_id'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Reference Dataset</span>
              <span className="font-mono font-bold text-blue-700 mt-0.5 block">
                {refConf.referenceDataset || 'customers_master'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Reference Field</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                {refConf.referenceField || 'id'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Match Strategy</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                {refConf.matchStrategy || 'Exact Match'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">
              Missing Reference Behavior:{' '}
              <strong className="text-slate-800 font-semibold">{refConf.missingBehavior || 'Reject Record'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Matched</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">
                {refConf.matched || '4,194,001'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Unmatched</span>
              <strong className="text-xs text-rose-600 block mt-0.5">
                {refConf.unmatched || '6,000'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Match Rate</span>
              <strong className="text-xs text-blue-700 block mt-0.5">
                {refConf.matchRate || '99.9%'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Duplicate Detection */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-12-duplicate-detection"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              12
            </span>
            <h2 id="section-12-duplicate-detection" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Duplicate Detection
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {dupConf.dupRate || '0.03%'} Dup Rate
          </span>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-slate-500">Detection Fields</span>
            <div className="flex flex-wrap gap-1.5">
              {(dupConf.detectionFields || ['customer_id', 'email']).map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs font-semibold text-slate-800"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Matching Strategy</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{dupConf.matchingStrategy || 'Exact Match'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Case Sensitivity</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{dupConf.caseSensitivity || 'Case Insensitive'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Null Handling</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{dupConf.nullHandling || 'Nulls are not equal'}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Keep Strategy</span>
              <span className="font-medium text-blue-700 font-semibold mt-0.5 block">{dupConf.keepStrategy || 'First Record'}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Checked</span>
              <strong className="text-[11px] text-slate-800 block mt-0.5">
                {dupConf.checked || '4,200,000'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Duplicates</span>
              <strong className="text-[11px] text-amber-700 block mt-0.5">
                {dupConf.duplicates || '1,241'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Unique</span>
              <strong className="text-[11px] text-emerald-700 block mt-0.5">
                {dupConf.unique || '4,198,759'}
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Dup Rate</span>
              <strong className="text-[11px] text-blue-700 block mt-0.5">
                {dupConf.dupRate || '0.03%'}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
