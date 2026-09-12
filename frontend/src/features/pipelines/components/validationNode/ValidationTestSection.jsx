import React from 'react';
import { Play, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ValidationTestSection({
  testConfig,
  updateNestedField,
  onRunTest,
  isTesting,
}) {
  const samplePayload = testConfig?.samplePayload || '';
  const lastExec = testConfig?.lastExecution || {};
  const isPassed = lastExec.status === 'SUCCESS' || lastExec.status === 'PASSED';

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-15-validation-test"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
            15
          </span>
          <h2 id="section-15-validation-test" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Validation Test
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Target: <strong className="text-slate-800 font-semibold">{testConfig?.scope || 'Entire Validation Node'}</strong>
          </span>
          <button
            type="button"
            onClick={onRunTest}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Play className="size-3 fill-white" />
            {isTesting ? 'Running…' : 'Run Test'}
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Test Input Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="sample-record-json" className="text-xs font-semibold text-slate-800">
              Test Input (sample record)
            </label>
            <span className="font-mono text-[11px] text-slate-400">test_record.json</span>
          </div>
          <textarea
            id="sample-record-json"
            rows={8}
            value={samplePayload}
            onChange={(e) => updateNestedField('validationTest', 'samplePayload', e.target.value)}
            className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-md border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Test Results Output */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">Test Results</h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    isPassed ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                  {lastExec.status || 'FAILED'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{lastExec.execTime || '0.84 ms'}</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(lastExec.results || []).map((check, idx) => {
                const isFail = check.status === 'FAIL';
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border text-xs flex items-start gap-2 ${
                      isFail
                        ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    {isFail ? (
                      <XCircle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="font-mono text-[11px] block">{check.rule}</strong>
                      <span className="text-[11px] opacity-90">{check.message}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Status</span>
              <strong className="text-rose-600 block mt-0.5">{lastExec.status || 'FAILED'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Exec Time</span>
              <strong className="text-slate-800 block mt-0.5">{lastExec.execTime || '0.84ms'}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-sans block">Failed Rules</span>
              <strong className="text-rose-600 block mt-0.5">{lastExec.failedRulesCount || 2}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
