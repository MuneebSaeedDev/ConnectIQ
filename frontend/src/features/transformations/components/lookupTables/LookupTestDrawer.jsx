import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function LookupTestDrawer({ isOpen, table, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [testKey, setTestKey] = useState('');
  const [testResult, setTestResult] = useState(null);

  if (!isOpen || !table) return null;

  const handleTest = () => {
    if (!testKey.trim()) return;
    setIsRunning(true);
    setTestResult(null);

    // Mock API call to simulate testing lookup against realistic data
    setTimeout(() => {
      setIsRunning(false);
      // Hardcoded mock outcomes depending on input length just for demo behavior:
      if (testKey.toLowerCase() === 'error') {
        setTestResult({ status: 'Error', match: null, error: 'Connection to source dataset failed.' });
      } else if (testKey.length > 5) {
         setTestResult({ status: 'Not Found', match: null, error: null });
      } else {
        const returnObj = {};
        if (Array.isArray(table.returnFields)) {
          table.returnFields.forEach(f => {
            returnObj[f] = `Demo ${f} value`;
          });
        } else {
          returnObj.value = 'Demo value';
        }
        setTestResult({
          status: 'Found',
          match: `Match for key: ${testKey}`,
          output: returnObj,
          error: null
        });
      }
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
                    Test Lookup Table
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {table.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter a sample lookup key to test matching behavior against the configured reference data.
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

              {/* Table Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{table.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{table.dataSource || 'Internal Source'} • {table.records?.toLocaleString() || 0} records</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded">
                    Type: {table.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-600">{table.keyField || 'key_field'}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-blue-600">{Array.isArray(table.returnFields) ? table.returnFields.join(', ') : table.returnFields}</span>
                </div>
              </div>

               {/* Test Input Area */}
              <div className="space-y-3">
                 <label htmlFor="testKey" className="block text-sm font-medium text-slate-700">Enter Sample Lookup Key</label>
                 <div className="flex gap-3">
                   <input
                      id="testKey"
                      type="text"
                      className="flex-1 rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="e.g. US, PK, or 12345"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                   />
                   <button
                    type="button"
                    onClick={handleTest}
                    disabled={isRunning || !testKey.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
                  >
                    <Play className={`size-4 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Searching...' : 'Test Match'}
                  </button>
                 </div>
              </div>

              {/* Test Results */}
              {testResult && (
                <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <h4 className="text-sm font-semibold text-slate-900">Execution Result</h4>

                   {testResult.status === 'Found' && (
                     <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-emerald-200 flex items-center gap-2 bg-emerald-100/50">
                           <CheckCircle2 className="size-4 text-emerald-600" />
                           <span className="text-sm font-medium text-emerald-900">Record Found</span>
                        </div>
                        <div className="p-4 space-y-4">
                           <div>
                             <p className="text-xs font-medium text-slate-500 mb-1">Matched Record Key</p>
                             <div className="text-sm font-mono text-slate-900 bg-white p-2 rounded border border-emerald-100">{testResult.match}</div>
                           </div>
                           <div>
                             <p className="text-xs font-medium text-slate-500 mb-1">Returned Output Fields</p>
                             <div className="bg-white p-3 rounded border border-emerald-100 text-sm font-mono text-slate-900">
                               <pre className="whitespace-pre-wrap">{JSON.stringify(testResult.output, null, 2)}</pre>
                             </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {testResult.status === 'Not Found' && (
                     <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="size-5 text-amber-600 shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-slate-900">No Match Found</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            The key <span className="font-mono bg-slate-200 px-1 rounded">{testKey}</span> did not match any records in the reference dataset.
                            Depending on missing-match configuration in the pipeline, this would return null, a default value, or trigger an error.
                          </p>
                        </div>
                     </div>
                   )}

                   {testResult.status === 'Error' && (
                     <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="size-5 text-rose-600 shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-rose-900">Lookup Execution Error</h5>
                          <p className="text-xs text-rose-700 mt-1">{testResult.error}</p>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* Data Quality & Pipeline Connection Info */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3 mt-8">
                <ShieldAlert className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold">Pipeline Integration:</span> Data missing from lookup tables can trigger validation failures. Ensure missing lookup behaviors (e.g., Use Default, Mark as Failed, or Set to Null) are configured correctly in the Mapping Node.
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
                Close Panel
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
