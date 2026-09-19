import React, { useState } from 'react';
import { X, Play } from 'lucide-react';

export const TestDateFormattingRuleDrawer = ({ isOpen, onClose, rule }) => {
  const [sampleDate, setSampleDate] = useState('2026-09-19T14:30:00Z');
  const [testResult, setTestResult] = useState(null);

  if (!isOpen || !rule) return null;

  const handleTest = () => {
    try {
      const d = new Date(sampleDate);
      if (isNaN(d.getTime())) {
        setTestResult({ success: false, error: 'Invalid Date Input' });
      } else {
        setTestResult({ success: true, formatted: d.toLocaleString() });
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Test Rule: {rule.ruleName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Sample Date Input
            </label>
            <input
              type="text"
              value={sampleDate}
              onChange={(e) => setSampleDate(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleTest}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Play className="w-3.5 h-3.5" />
            Run Test
          </button>

          {testResult && (
            <div className={`p-4 rounded-md border text-xs ${testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="font-semibold mb-1">{testResult.success ? 'Formatted Output:' : 'Error:'}</div>
              <div className="font-mono">{testResult.success ? testResult.formatted : testResult.error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
