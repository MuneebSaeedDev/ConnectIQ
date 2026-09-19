import React, { useState } from 'react';
import { Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function RuleTestingPreviewSection({
  category,
  inputField,
  outputField,
  parameters,
  expression,
  sourceType,
  targetType,
}) {
  const [sampleInput, setSampleInput] = useState('{"customer_email": "  John.Doe@Example.COM  ", "subtotal": 120, "tax_rate": 0.08, "order_date": "2026-09-18T10:00:00Z", "status_code": "1"}');
  const [testResult, setTestResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRunPreview = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      try {
        let parsed = {};
        try {
          parsed = JSON.parse(sampleInput);
        } catch (_e) {
          // treat as plain text if invalid json
          parsed = { [inputField || 'input']: sampleInput };
        }

        let outputVal = 'N/A';
        let status = 'success';
        let message = 'Transformation evaluated accurately.';

        const rawVal = parsed[inputField] !== undefined ? parsed[inputField] : Object.values(parsed)[0];

        switch (category) {
          case 'Data Cleaning':
            if (typeof rawVal === 'string') {
              let val = rawVal;
              if (parameters?.whitespace === 'trim') val = val.trim();
              if (parameters?.case === 'lowercase') val = val.toLowerCase();
              if (parameters?.case === 'uppercase') val = val.toUpperCase();
              outputVal = val;
            } else {
              outputVal = String(rawVal || '');
            }
            break;

          case 'Type Conversion':
            if (targetType === 'Decimal' || targetType === 'Integer') {
              const cleaned = String(rawVal).replace(/[^0-9.-]+/g, '');
              outputVal = targetType === 'Integer' ? parseInt(cleaned, 10) : parseFloat(cleaned);
              if (isNaN(outputVal)) {
                outputVal = parameters?.defaultValue || null;
                status = 'warning';
                message = 'Non-numeric input encountered. Reverted to default fallback.';
              }
            } else if (targetType === 'Boolean') {
              outputVal = Boolean(rawVal);
            } else {
              outputVal = String(rawVal);
            }
            break;

          case 'Date Formatting':
            try {
              const d = new Date(rawVal);
              outputVal = d.toISOString();
            } catch (_e) {
              outputVal = 'INVALID_DATE';
              status = 'error';
              message = 'Failed to parse input timestamp correctly.';
            }
            break;

          case 'Lookup & Enrichment':
            outputVal = 'Lookup_Match_' + rawVal;
            break;

          case 'Custom Expression':
          default:
            outputVal = `Result_of(${expression || 'expression'})`;
            break;
        }

        setTestResult({
          status,
          message,
          input: rawVal,
          output: outputVal,
          outputKey: outputField || 'output',
          executionTimeMs: 0.84,
        });
      } catch (err) {
        setTestResult({
          status: 'error',
          message: err.message || 'Execution failed',
          input: sampleInput,
          output: null,
          executionTimeMs: 0,
        });
      } finally {
        setIsEvaluating(false);
      }
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">5. Interactive Rule Simulator & Tester</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dry-run sample records against your logic configuration before saving.</p>
        </div>
        <button
          type="button"
          onClick={handleRunPreview}
          disabled={isEvaluating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
        >
          {isEvaluating ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Test Dry Run
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sample Payload Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Sample Inbound JSON Record</label>
            <span className="text-[11px] text-slate-400 font-mono">JSON Payload</span>
          </div>
          <textarea
            rows={5}
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-xs font-mono bg-slate-50"
          />
        </div>

        {/* Live Evaluation Output */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Dry Run Output & Telemetry</label>
            {testResult && (
              <span className={`text-[11px] font-semibold ${testResult.status === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {testResult.executionTimeMs}ms latency
              </span>
            )}
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-900 p-3.5 min-h-[110px] text-xs font-mono text-slate-100 flex flex-col justify-between">
            {testResult ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResult.status === 'success' ? (
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-400 shrink-0" />
                  )}
                  <span className={testResult.status === 'success' ? 'text-emerald-300' : 'text-amber-300'}>
                    {testResult.message}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500">// Output record attribute:</span>
                  <div className="text-emerald-400 mt-0.5">
                    "{testResult.outputKey}": {JSON.stringify(testResult.output)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs py-8">
                Click "Test Dry Run" to execute transformation logic against sample record.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
