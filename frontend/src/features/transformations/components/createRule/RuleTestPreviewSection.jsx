import React, { useState } from 'react';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Terminal, Eye } from 'lucide-react';

export default function RuleTestPreviewSection({ formData }) {
  const [sampleInput, setSampleInput] = useState(
    JSON.stringify(
      {
        [formData.inputField || 'input_val']: formData.sourceType === 'Decimal' ? 149.99 : '  Sample Test Value  ',
      },
      null,
      2
    )
  );

  const [previewOutput, setPreviewOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'success', 'warning', 'error'
  const [testMessage, setTestMessage] = useState('');

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTestStatus(null);
    setPreviewOutput(null);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(sampleInput);
        const inputKey = formData.inputField?.trim() || Object.keys(parsed)[0] || 'input_val';
        const rawValue = parsed[inputKey];

        let transformedValue = rawValue;

        // Simulate transformations based on category
        switch (formData.category) {
          case 'Data Cleaning':
            if (typeof rawValue === 'string') {
              let clean = rawValue;
              if (formData.parameters?.trim !== false) clean = clean.trim();
              if (formData.parameters?.case === 'lowercase') clean = clean.toLowerCase();
              if (formData.parameters?.case === 'uppercase') clean = clean.toUpperCase();
              transformedValue = clean;
            }
            break;

          case 'Type Conversion':
            if (formData.targetType === 'Decimal' || formData.targetType === 'Integer') {
              const num = Number(String(rawValue).replace(/[^0-9.-]+/g, ''));
              transformedValue = isNaN(num) ? 0 : num;
            } else if (formData.targetType === 'Boolean') {
              transformedValue = Boolean(rawValue && rawValue !== 'false' && rawValue !== '0');
            } else {
              transformedValue = String(rawValue);
            }
            break;

          case 'Date Formatting':
            transformedValue = new Date().toISOString();
            break;

          case 'Lookup & Enrichment':
            transformedValue = 'MATCHED_LABEL_SAMPLE';
            break;

          case 'Custom Expression':
            transformedValue = 161.99; // mocked calculated value
            break;

          default:
            transformedValue = rawValue;
        }

        const outKey = formData.outputField?.trim() || 'output_val';
        const outputResult = {
          ...parsed,
          [outKey]: transformedValue,
        };

        setPreviewOutput(JSON.stringify(outputResult, null, 2));
        setTestStatus('success');
        setTestMessage('Transformation rule applied successfully without warnings.');
      } catch (err) {
        setTestStatus('error');
        setTestMessage('Invalid JSON payload in sample input or simulation failed.');
      } finally {
        setIsRunning(false);
      }
    }, 400);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">5. Interactive Preview & Dry Run</h2>
          <p className="text-xs text-slate-500 mt-0.5">Test sample payload records against the transformation logic.</p>
        </div>
        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
          <span>Run Test Preview</span>
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Terminal className="size-3.5 text-slate-500" />
                Sample Input JSON
              </label>
              <span className="text-[11px] text-slate-400">Mock inbound record</span>
            </div>
            <textarea
              rows={7}
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-xs font-mono bg-slate-900 text-slate-200"
            />
          </div>

          {/* Sample Output */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="size-3.5 text-slate-500" />
                Preview Output Result
              </label>
              <span className="text-[11px] text-slate-400">Transformed outbound record</span>
            </div>
            <div className="relative">
              <textarea
                readOnly
                rows={7}
                value={previewOutput || '// Click "Run Test Preview" to inspect evaluated result...'}
                className={`block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset sm:text-xs font-mono bg-slate-950 text-emerald-400 select-all ${
                  testStatus === 'error' ? 'ring-rose-500 text-rose-400' : 'ring-slate-800'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Status result banner */}
        {testStatus && (
          <div
            className={`mt-4 p-3 rounded-md border flex items-center gap-2.5 text-xs ${
              testStatus === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
