import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  Play,
  Copy,
  Info,
  Wand2,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  DATA_TYPES,
  MAPPING_TYPES,
  BUILTIN_FUNCTIONS,
} from '../../services/mappingNodeConfig.api';

export default function TransformationConfigSection({
  transformationConfig = {},
  selectedMapping,
  updateTransformationConfig,
  onApplyExpression,
}) {
  const [activeCategory, setActiveCategory] = useState('String');
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const handleFunctionInsert = (snippet) => {
    const current = transformationConfig.expression || '';
    const updated = current ? `${current}\n${snippet}` : snippet;
    updateTransformationConfig('expression', updated);
  };

  const handleCopySnippet = (snippet) => {
    navigator.clipboard?.writeText(snippet);
    setCopiedSnippet(snippet);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const functionsList = BUILTIN_FUNCTIONS[activeCategory] || [];

  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="transformation-config-heading"
    >
      {/* Header matching Figma 170:2268 */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            06
          </span>
          <h2 id="transformation-config-heading" className="text-sm font-bold text-slate-900">
            Transformation Configuration
          </h2>
          <span className="text-xs text-slate-500 font-mono font-medium">
            — Selected: {transformationConfig.selectedLabel || 'first_name → full_name'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Code2 className="size-3.5" />
          <span>Expression Mode</span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Parameter Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Transformation Type */}
          <div>
            <label htmlFor="transType" className="block font-semibold text-slate-700 mb-1">
              Transformation Type
            </label>
            <select
              id="transType"
              value={transformationConfig.transformationType || 'Expression'}
              onChange={(e) => updateTransformationConfig('transformationType', e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {MAPPING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Output Type */}
          <div>
            <label htmlFor="outType" className="block font-semibold text-slate-700 mb-1">
              Output Type
            </label>
            <select
              id="outType"
              value={transformationConfig.outputType || 'STRING'}
              onChange={(e) => updateTransformationConfig('outputType', e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {DATA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Input Fields */}
          <div>
            <span className="block font-semibold text-slate-700 mb-1">
              Input Fields
            </span>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded min-h-[36px]">
              {(transformationConfig.inputFields || ['first_name', 'last_name']).map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Null Handling */}
          <div>
            <label htmlFor="nullHandling" className="block font-semibold text-slate-700 mb-1">
              Null Handling
            </label>
            <select
              id="nullHandling"
              value={transformationConfig.nullHandling || 'Replace With Default'}
              onChange={(e) => updateTransformationConfig('nullHandling', e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Replace With Default">Replace With Default</option>
              <option value="Preserve Null">Preserve Null</option>
              <option value="Reject Record">Reject Record</option>
              <option value="Skip Field">Skip Field</option>
            </select>
          </div>

          {/* Default Value */}
          <div>
            <label htmlFor="defaultValue" className="block font-semibold text-slate-700 mb-1">
              Default Value
            </label>
            <input
              id="defaultValue"
              type="text"
              value={transformationConfig.defaultValue || 'UNKNOWN'}
              onChange={(e) => updateTransformationConfig('defaultValue', e.target.value)}
              placeholder="UNKNOWN"
              className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Code Editor & Built-in Functions Explorer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Editor Container matching Figma 170:2310 */}
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 shadow-md">
            {/* Editor Top Bar */}
            <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Code2 className="size-3.5 text-blue-400" />
                EXPRESSION EDITOR
              </span>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Syntax OK
                </span>
                <button
                  type="button"
                  onClick={() => onApplyExpression && onApplyExpression(transformationConfig.expression)}
                  className="px-2 py-0.5 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Validate
                </button>
              </div>
            </div>

            {/* Code TextArea with line numbering styling */}
            <div className="p-3">
              <textarea
                rows={5}
                value={transformationConfig.expression || "CONCAT(\n  first_name,\n  ' ',\n  last_name\n)"}
                onChange={(e) => updateTransformationConfig('expression', e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-amber-300 focus:outline-none leading-relaxed resize-y"
                spellCheck="false"
                aria-label="Transformation expression code editor"
              />
            </div>
          </div>

          {/* Built-in Functions Library matching Figma 170:2367 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700">
                Built-in Functions:
              </span>

              {/* Function Category Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {Object.keys(BUILTIN_FUNCTIONS).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Functions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
              {functionsList.map((fn) => (
                <button
                  key={fn.name}
                  type="button"
                  onClick={() => handleFunctionInsert(fn.snippet)}
                  title={`${fn.desc} - Click to insert`}
                  className="p-1.5 text-left bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded transition-colors group truncate"
                >
                  <span className="font-semibold text-blue-700 group-hover:text-blue-900 block truncate">
                    {fn.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
