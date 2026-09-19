import React from 'react';

const OPERATIONS_BY_CATEGORY = {
  'Data Cleaning': [
    { label: 'Normalize Case + Trim', value: 'Normalize Case + Trim' },
    { label: 'Regex Multi-space Strip', value: 'Regex Multi-space Strip' },
    { label: 'Remove Non-Alphanumeric', value: 'Remove Non-Alphanumeric' },
    { label: 'Strip HTML Tags', value: 'Strip HTML Tags' },
  ],
  'Type Conversion': [
    { label: 'String → Decimal', value: 'String → Decimal' },
    { label: 'String → Integer', value: 'String → Integer' },
    { label: 'String → Boolean', value: 'String → Boolean' },
    { label: 'Timestamp → Epoch', value: 'Timestamp → Epoch' },
  ],
  'Date Formatting': [
    { label: 'Parse Date / Timezone Cast', value: 'Parse Date / Timezone Cast' },
    { label: 'ISO-8601 Standardize', value: 'ISO-8601 Standardize' },
    { label: 'Custom Date Mask (YYYY-MM-DD)', value: 'Custom Date Mask (YYYY-MM-DD)' },
  ],
  'Lookup & Enrichment': [
    { label: 'Dictionary Map / Fallback', value: 'Dictionary Map / Fallback' },
    { label: 'GeoIP Country Lookup', value: 'GeoIP Country Lookup' },
    { label: 'Static Key-Value Mapping', value: 'Static Key-Value Mapping' },
  ],
  'Custom Expression': [
    { label: 'Expression Formula', value: 'Expression Formula' },
    { label: 'Conditional IF/ELSE', value: 'Conditional IF/ELSE' },
  ],
  'Field Mapping': [
    { label: 'Direct Rename', value: 'Direct Rename' },
    { label: 'Concatenate Multi-fields', value: 'Concatenate Multi-fields' },
    { label: 'Extract Nested JSON Path', value: 'Extract Nested JSON Path' },
  ],
  'Normalization': [
    { label: 'Min-Max Scaling [0, 1]', value: 'Min-Max Scaling [0, 1]' },
    { label: 'Standard Deviation Z-Score', value: 'Standard Deviation Z-Score' },
  ],
  'General': [
    { label: 'Passthrough', value: 'Passthrough' },
    { label: 'Custom Script', value: 'Custom Script' },
  ],
};

export default function RuleLogicSection({ formData, handleChange, handleParameterChange, errors }) {
  const operations = OPERATIONS_BY_CATEGORY[formData.category] || OPERATIONS_BY_CATEGORY['General'];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-800">4. Transformation Logic</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select the mathematical or functional operation to apply on data.</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label htmlFor="operation" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600">
            Operation Type <span className="text-rose-500">*</span>
          </label>
          <select
            id="operation"
            name="operation"
            value={formData.operation || operations[0]?.value || 'Custom'}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            {operations.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Controls based on Category / Operation */}
        {formData.category === 'Custom Expression' && (
          <div>
            <label htmlFor="expression" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600">
              Expression Formula <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="expression"
              name="expression"
              rows={3}
              value={formData.expression || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 font-mono text-xs ${errors.expression ? 'ring-rose-300 focus:ring-rose-500 bg-rose-50/50' : 'ring-slate-300 focus:ring-blue-600'}`}
              placeholder="e.g., subtotal * (1 + tax_rate)"
            />
            {errors.expression && <p className="mt-1.5 text-xs text-rose-600">{errors.expression}</p>}
            <p className="mt-1.5 text-[11px] text-slate-500">Supports standard arithmetic operators, variables, and math functions.</p>
          </div>
        )}

        {formData.category === 'Data Cleaning' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Letter Case</label>
              <select
                value={formData.parameters?.case || 'lowercase'}
                onChange={(e) => handleParameterChange('case', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 sm:text-xs"
              >
                <option value="lowercase">Lowercase</option>
                <option value="uppercase">Uppercase</option>
                <option value="capitalize">Title / Capitalize</option>
                <option value="preserve">Preserve</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.parameters?.trim !== false}
                  onChange={(e) => handleParameterChange('trim', e.target.checked)}
                  className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-xs font-medium text-slate-700">Trim leading/trailing whitespace</span>
              </label>
            </div>
          </div>
        )}

        {formData.category === 'Lookup & Enrichment' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lookup Table / Map Name</label>
              <input
                type="text"
                value={formData.parameters?.lookupTable || ''}
                onChange={(e) => handleParameterChange('lookupTable', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 sm:text-xs"
                placeholder="e.g., status_dictionary_v1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default / Fallback Value</label>
              <input
                type="text"
                value={formData.parameters?.defaultValue || ''}
                onChange={(e) => handleParameterChange('defaultValue', e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 sm:text-xs"
                placeholder="e.g., UNKNOWN or N/A"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
