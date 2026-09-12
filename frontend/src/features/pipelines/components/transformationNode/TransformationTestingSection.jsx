import React from 'react';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';

export default function TransformationTestingSection({
  testing = {},
  testingMode = 'all',
  isTesting = false,
  onSetTestingMode,
  onRunTests,
}) {
  const results = testing.testResults || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Transformation Testing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Test individual rules or the full transformation node</p>
        </div>

        {/* Test Mode Selector + Run Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onSetTestingMode('individual')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                testingMode === 'individual'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individual Rule
            </button>
            <button
              type="button"
              onClick={() => onSetTestingMode('selected')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                testingMode === 'selected'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selected Rules
            </button>
            <button
              type="button"
              onClick={() => onSetTestingMode('all')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                testingMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Rules
            </button>
          </div>

          <button
            type="button"
            onClick={onRunTests}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 rounded hover:bg-amber-200 transition shadow-2xs disabled:opacity-50"
          >
            <Zap className="size-3.5 text-amber-700 fill-amber-500" />
            {isTesting ? 'Running...' : '⚡ Run All Tests'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Test Results Table matching Figma 220:6875 */}
        <div className="border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Test Input</th>
                <th className="py-2.5 px-3">Expected Output</th>
                <th className="py-2.5 px-3">Actual Output</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {results.map((t) => {
                const isPassed = t.status === 'Passed';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-3 text-slate-900 font-medium">{t.testInput}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.expectedOutput}</td>
                    <td
                      className={`py-2.5 px-3 font-semibold ${
                        isPassed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {t.actualOutput}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="size-3 text-emerald-600" />
                        ) : (
                          <XCircle className="size-3 text-rose-600" />
                        )}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans">{t.duration}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Safety Disclaimer matching Figma 220:6934 */}
        <p className="text-[11px] text-slate-500 italic">
          Transformation tests execute in an isolated sandbox and do not modify production data.
        </p>
      </div>
    </section>
  );
}
