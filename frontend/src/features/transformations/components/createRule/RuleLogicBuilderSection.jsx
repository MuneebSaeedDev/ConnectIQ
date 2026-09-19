import React from 'react';
import { Sliders, Code, Search, Sparkles, Calendar, ArrowRightLeft } from 'lucide-react';

export default function RuleLogicBuilderSection({ category, parameters, onParameterChange, expression, onExpressionChange }) {
  // Render specific logic builder based on category
  const renderConfig = () => {
    switch (category) {
      case 'Data Cleaning':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Casing Transformation</label>
                <select
                  value={parameters?.case || 'none'}
                  onChange={(e) => onParameterChange('case', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="none">Preserve Original Casing</option>
                  <option value="lowercase">Convert to Lowercase (lowercase)</option>
                  <option value="uppercase">Convert to Uppercase (UPPERCASE)</option>
                  <option value="titlecase">Capitalize Words (Title Case)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Whitespace Handling</label>
                <select
                  value={parameters?.whitespace || 'trim'}
                  onChange={(e) => onParameterChange('whitespace', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="trim">Trim Leading & Trailing Whitespace</option>
                  <option value="collapse">Collapse Multiple Spaces into Single</option>
                  <option value="removeAll">Remove All Spaces and Tabs</option>
                  <option value="none">Leave Unchanged</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Regex Pattern Replacement</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Regex Match (e.g., [^a-zA-Z0-9])"
                  value={parameters?.regexMatch || ''}
                  onChange={(e) => onParameterChange('regexMatch', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
                />
                <input
                  type="text"
                  placeholder="Replacement String (e.g., _)"
                  value={parameters?.regexReplace || ''}
                  onChange={(e) => onParameterChange('regexReplace', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 'Type Conversion':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Casting Strategy</label>
                <select
                  value={parameters?.castingStrategy || 'strict'}
                  onChange={(e) => onParameterChange('castingStrategy', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="strict">Strict (Fail on non-parsable value)</option>
                  <option value="fallback">Fallback to Default Value</option>
                  <option value="nullOnFailure">Set to NULL on Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fallback Default Value</label>
                <input
                  type="text"
                  placeholder="e.g. 0 or false"
                  value={parameters?.defaultValue || ''}
                  onChange={(e) => onParameterChange('defaultValue', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number / Currency Format (If Applicable)</label>
              <input
                type="text"
                placeholder="e.g. $#,##0.00 or strip characters like $, £, ,"
                value={parameters?.formatPattern || ''}
                onChange={(e) => onParameterChange('formatPattern', e.target.value)}
                className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
              />
            </div>
          </div>
        );

      case 'Date Formatting':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Format</label>
                <input
                  type="text"
                  placeholder="e.g., auto or YYYY-MM-DD HH:mm:ss"
                  value={parameters?.sourceFormat || 'auto'}
                  onChange={(e) => onParameterChange('sourceFormat', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Format</label>
                <select
                  value={parameters?.targetFormat || 'ISO-8601'}
                  onChange={(e) => onParameterChange('targetFormat', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="ISO-8601">ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)</option>
                  <option value="YYYY-MM-DD">Standard Date (YYYY-MM-DD)</option>
                  <option value="MM/DD/YYYY">US Date (MM/DD/YYYY)</option>
                  <option value="UNIX_TIMESTAMP">Unix Epoch Seconds (Timestamp)</option>
                  <option value="UNIX_MILLIS">Unix Epoch Milliseconds</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Timezone</label>
                <select
                  value={parameters?.targetTz || 'UTC'}
                  onChange={(e) => onParameterChange('targetTz', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'Lookup & Enrichment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lookup Reference Table / Dictionary</label>
                <select
                  value={parameters?.lookupTable || 'country_codes'}
                  onChange={(e) => onParameterChange('lookupTable', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="country_codes">Country Code to Full Name</option>
                  <option value="state_provinces">US States & Provinces Map</option>
                  <option value="status_codes_v1">Order Status Codes (1=New, 2=Proc...)</option>
                  <option value="currency_symbols">Currency Symbol to ISO Code</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Fallback Value</label>
                <input
                  type="text"
                  placeholder="e.g., UNKNOWN or UNASSIGNED"
                  value={parameters?.defaultValue || 'UNKNOWN'}
                  onChange={(e) => onParameterChange('defaultValue', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 'Custom Expression':
      default:
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Expression / Calculation Formula</label>
                <span className="text-xs text-slate-400 font-mono">Supports safe math & string operators</span>
              </div>
              <textarea
                rows={3}
                placeholder="e.g. subtotal * (1 + tax_rate) or concat(first_name, ' ', last_name)"
                value={expression || ''}
                onChange={(e) => onExpressionChange(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm font-mono bg-slate-900 text-emerald-400 placeholder:text-slate-600 focus:ring-offset-1"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-slate-500 font-medium self-center mr-1">Quick Operators:</span>
              {['concat(a, b)', 'trim(a)', 'upper(a)', 'lower(a)', 'round(a, 2)', 'coalesce(a, b)', 'if(a > 0, b, c)'].map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => onExpressionChange((expression ? expression + ' ' : '') + fn)}
                  className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-mono text-slate-700 hover:bg-slate-200 transition"
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-800">4. Transformation Logic & Parameters</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure operational rules and parsing arguments.</p>
      </div>
      <div className="p-6">
        {renderConfig()}
      </div>
    </div>
  );
}
