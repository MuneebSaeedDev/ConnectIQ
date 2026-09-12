import React from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ResultsMetricsSection({
  validationResults,
  dataQualityMetrics,
  resultsFilter,
  setResultsFilter,
}) {
  const res = validationResults || {};
  const dq = dataQualityMetrics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 17 Validation Results */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-17-validation-results"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              17
            </span>
            <h2 id="section-17-validation-results" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Validation Results
            </h2>
          </div>

          <div className="flex items-center gap-1" role="tablist" aria-label="Results filter">
            {['all', 'errors', 'warnings', 'passed'].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={resultsFilter === tab}
                onClick={() => setResultsFilter(tab)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize font-medium transition cursor-pointer ${
                  resultsFilter === tab
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-sans block">Rules Executed</span>
              <strong className="text-xs text-slate-900 block mt-0.5">{res.rulesExecuted || 12}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-sans block">Passed Rules</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">{res.passedRules || 8}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-sans block">Failed Rules</span>
              <strong className="text-xs text-rose-600 block mt-0.5">{res.failedRules || 2}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-sans block">Warnings</span>
              <strong className="text-xs text-amber-600 block mt-0.5">{res.warnings || 1}</strong>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Records Checked</span>
              <strong className="text-xs text-slate-800 block mt-0.5">{res.recordsChecked || '4,200,000'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Valid Records</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">{res.validRecords || '4,175,203'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Invalid Records</span>
              <strong className="text-xs text-rose-600 block mt-0.5">{res.invalidRecords || '24,797'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Validation Rate</span>
              <strong className="text-xs text-blue-700 block mt-0.5">{res.validationRate || '99.4%'}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 18 Data Quality Metrics */}
      <section
        className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
        aria-labelledby="section-18-data-quality-metrics"
      >
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
              18
            </span>
            <h2 id="section-18-data-quality-metrics" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Data Quality Metrics
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {dq.qualityTrend || '▲ +1.2%'}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg">
            <div>
              <span className="text-xs text-blue-900 font-bold block">Data Quality Score</span>
              <span className="text-2xl font-bold font-mono text-blue-700">{dq.qualityScore || 87.3}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-sans">Rejected Records</span>
              <span className="text-sm font-bold font-mono text-rose-600">{dq.recordsRejected || '24,797'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Validity Rate</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">{dq.validityRate || '99.4%'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Completeness Rate</span>
              <strong className="text-xs text-emerald-700 block mt-0.5">{dq.completenessRate || '96.2%'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Duplicate Rate</span>
              <strong className="text-xs text-blue-700 block mt-0.5">{dq.duplicateRate || '0.03%'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Error Rate</span>
              <strong className="text-xs text-rose-600 block mt-0.5">{dq.errorRate || '0.59%'}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
