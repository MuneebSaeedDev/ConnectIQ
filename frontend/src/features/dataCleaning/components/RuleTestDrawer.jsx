import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const MOCK_SAMPLE_RECORDS = [
  {
    field: 'customer_name',
    original: '  JOHN   DOE  ',
    cleaned: 'John Doe',
    status: 'Changed',
  },
  {
    field: 'contact_email',
    original: 'USER.EXAMPLE@DOMAIN.COM ',
    cleaned: 'user.example@domain.com',
    status: 'Changed',
  },
  {
    field: 'tax_id',
    original: '12-3456789',
    cleaned: '12-3456789',
    status: 'Unchanged',
  },
  {
    field: 'billing_country',
    original: '',
    cleaned: 'US',
    status: 'Changed',
  },
  {
    field: 'transaction_date',
    original: '2026/09/19 14:30:00',
    cleaned: '2026-09-19T14:30:00Z',
    status: 'Changed',
  },
];

export default function RuleTestDrawer({ isOpen, rule, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [sampleData, setSampleData] = useState(MOCK_SAMPLE_RECORDS);

  if (!isOpen || !rule) return null;

  const handleRunTest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        tested: sampleData.length,
        changed: sampleData.filter((r) => r.status === 'Changed').length,
        unchanged: sampleData.filter((r) => r.status === 'Unchanged').length,
        errors: 0,
        dataQualityScore: '98.4%',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900" id="slide-over-title">
                    Test & Preview Cleaning Rule
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {rule.ruleId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Validate cleaning operations against sandbox dataset before activating in production pipelines.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Rule Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{rule.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{rule.description}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 text-slate-700 rounded">
                    Field: {rule.targetField || 'All'}
                  </span>
                </div>
              </div>

              {/* Trigger Test Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Sample Records Preview</h4>
                  <p className="text-xs text-slate-500">Showing transformation diff for 5 sample rows</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
                >
                  <Play className={`size-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running Cleaning Logic...' : 'Run Test Execution'}
                </button>
              </div>

              {/* Test Metrics Stats */}
              {testResults && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 block">Tested</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">{testResults.tested}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center shadow-2xs">
                    <span className="text-[11px] font-medium text-emerald-700 block">Cleaned</span>
                    <span className="text-lg font-bold text-emerald-800 mt-0.5 block">{testResults.changed}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-600 block">Unchanged</span>
                    <span className="text-lg font-bold text-slate-700 mt-0.5 block">{testResults.unchanged}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center shadow-2xs">
                    <span className="text-[11px] font-medium text-blue-700 block">Est. Quality</span>
                    <span className="text-lg font-bold text-blue-800 mt-0.5 block">{testResults.dataQualityScore}</span>
                  </div>
                </div>
              )}

              {/* Sample Diff Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700">Field</th>
                      <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700">Original (Before)</th>
                      <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700">Cleaned (After)</th>
                      <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sampleData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-xs font-mono text-slate-600 bg-slate-50/50">
                          {row.field}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-rose-700 font-mono bg-rose-50/30">
                          {row.original === '' ? <span className="text-slate-400 italic font-sans">[Empty string]</span> : row.original}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-emerald-700 font-mono bg-emerald-50/30">
                          {row.cleaned}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-xs">
                          {row.status === 'Changed' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="size-3" /> Sanitized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                              Unchanged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Data Quality & Pipeline Connection Info */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3">
                <ShieldAlert className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold">Data Quality Impact:</span> Activating this rule resolves non-standard formatting and missing value errors before validation checks execute. Reusable directly in Pipeline Transformation and Validation Nodes.
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
