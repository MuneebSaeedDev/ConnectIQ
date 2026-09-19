import React, { useState } from 'react';
import {
  X,
  Play,
  Save,
  Code,
  Plus
} from 'lucide-react';

const BUILT_IN_FUNCTIONS = {
  String: [
    { name: 'CONCAT', desc: 'Concatenate multiple strings', syntax: 'CONCAT(str1, str2, ...)' },
    { name: 'SUBSTRING', desc: 'Extract a part of a string', syntax: 'SUBSTRING(str, start, length)' },
    { name: 'UPPER', desc: 'Convert string to uppercase', syntax: 'UPPER(str)' },
    { name: 'LOWER', desc: 'Convert string to lowercase', syntax: 'LOWER(str)' },
    { name: 'TRIM', desc: 'Remove leading and trailing whitespace', syntax: 'TRIM(str)' },
    { name: 'REPLACE', desc: 'Replace substring with another', syntax: 'REPLACE(str, search, replace)' }
  ],
  Numeric: [
    { name: 'ROUND', desc: 'Round a number to given decimal places', syntax: 'ROUND(num, decimals)' },
    { name: 'ABS', desc: 'Get absolute value', syntax: 'ABS(num)' },
    { name: 'FLOOR', desc: 'Round down to nearest integer', syntax: 'FLOOR(num)' },
    { name: 'CEIL', desc: 'Round up to nearest integer', syntax: 'CEIL(num)' }
  ],
  'Date/Time': [
    { name: 'NOW', desc: 'Current timestamp', syntax: 'NOW()' },
    { name: 'DATE_ADD', desc: 'Add interval to date', syntax: 'DATE_ADD(date, interval, unit)' },
    { name: 'DATE_DIFF', desc: 'Difference between two dates', syntax: 'DATE_DIFF(date1, date2, unit)' },
    { name: 'FORMAT_DATE', desc: 'Format date with pattern', syntax: 'FORMAT_DATE(date, pattern)' }
  ],
  Conditional: [
    { name: 'IF', desc: 'Conditional ternary logic', syntax: 'IF(condition, true_val, false_val)' },
    { name: 'COALESCE', desc: 'First non-null value', syntax: 'COALESCE(val1, val2, ...)' },
    { name: 'IS_NULL', desc: 'Check if value is null', syntax: 'IS_NULL(val)' }
  ]
};

const SAMPLE_FIELDS = [
  { name: 'order.amount', type: 'Decimal', sample: '150.50' },
  { name: 'order.tax_rate', type: 'Decimal', sample: '0.08' },
  { name: 'order.shipping', type: 'Decimal', sample: '15.00' },
  { name: 'customer.firstName', type: 'String', sample: 'John' },
  { name: 'customer.lastName', type: 'String', sample: 'Doe' },
  { name: 'customer.email', type: 'String', sample: 'john.doe@example.com' },
  { name: 'customer.created_at', type: 'Date', sample: '2023-01-15' }
];

export default function ExpressionBuilderDrawer({ isOpen, onClose, initialData = null }) {
  const [activeTab, setActiveTab] = useState('fields');
  const [expressionName, setExpressionName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Numeric');
  const [returnType, setReturnType] = useState(initialData?.returnType || 'Decimal');
  const [expression, setExpression] = useState(initialData?.expression || 'ROUND(order.amount * (1 + order.tax_rate) + order.shipping, 2)');

  // Interactive / Testing State
  const [testResult, setTestResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleInsert = (text) => {
    setExpression((prev) => prev + text);
  };

  const handleTest = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setTestResult({
        success: true,
        output: '177.54',
        type: returnType,
        executionTime: '0.42ms'
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {initialData ? 'Edit Expression' : 'Create Custom Expression'}
              </h2>
              <p className="text-xs text-slate-500">Configure parameters, syntax, and sample pipeline testing.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Expression Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={expressionName}
                onChange={(e) => setExpressionName(e.target.value)}
                placeholder="e.g. Calculate Final Total"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Numeric">Numeric</option>
                <option value="String">String</option>
                <option value="Date/Time">Date/Time</option>
                <option value="Conditional">Conditional</option>
                <option value="Boolean">Boolean</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what this expression calculates or standardizes..."
              />
            </div>
          </div>

          {/* Builder Layout */}
          <div className="grid grid-cols-3 gap-6 h-[420px]">

            {/* Sidebar: Fields & Functions */}
            <div className="col-span-1 border border-slate-200 rounded-lg flex flex-col h-full bg-slate-50/50">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`flex-1 py-2 text-xs font-semibold ${activeTab === 'fields' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Fields
                </button>
                <button
                  onClick={() => setActiveTab('functions')}
                  className={`flex-1 py-2 text-xs font-semibold ${activeTab === 'functions' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Functions
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeTab === 'fields' ? (
                  SAMPLE_FIELDS.map((f) => (
                    <div
                      key={f.name}
                      onClick={() => handleInsert(f.name)}
                      className="p-2 bg-white border border-slate-200 rounded text-xs hover:border-indigo-300 hover:shadow-xs cursor-pointer flex items-center justify-between group"
                    >
                      <span className="font-mono text-slate-800">{f.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {f.type}
                      </span>
                    </div>
                  ))
                ) : (
                  Object.entries(BUILT_IN_FUNCTIONS).map(([cat, fns]) => (
                    <div key={cat} className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-2">{cat}</div>
                      {fns.map((fn) => (
                        <div
                          key={fn.name}
                          onClick={() => handleInsert(`${fn.name}()`)}
                          className="p-2 bg-white border border-slate-200 rounded text-xs hover:border-indigo-300 hover:shadow-xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-medium text-indigo-600">{fn.name}</span>
                            <Plus className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{fn.desc}</div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expression Editor Main */}
            <div className="col-span-2 flex flex-col h-full space-y-4">
              <div className="flex-1 border border-slate-200 rounded-lg flex flex-col overflow-hidden bg-slate-900 shadow-inner">
                {/* Editor Bar */}
                <div className="px-3 py-1.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">Expression Syntax</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Valid
                    </span>
                  </div>
                </div>

                {/* Code Area */}
                <textarea
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="flex-1 w-full p-3 bg-transparent text-emerald-300 font-mono text-sm resize-none focus:outline-none"
                  placeholder="Enter custom expression logic..."
                />
              </div>

              {/* Actions & Result */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-700">Live Evaluation Preview</div>
                  <button
                    onClick={handleTest}
                    disabled={isValidating}
                    className="inline-flex items-center px-2 py-1 border border-indigo-200 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 shadow-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Evaluate
                  </button>
                </div>

                {testResult ? (
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Output:</span>
                      <span className="font-mono font-bold text-slate-900">{testResult.output}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {testResult.type}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{testResult.executionTime}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic bg-white border border-slate-200 border-dashed rounded p-2 text-center">
                    Click evaluate to run against sample pipeline payload.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              className="px-3 py-2 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              Validate Logic
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Expression
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
