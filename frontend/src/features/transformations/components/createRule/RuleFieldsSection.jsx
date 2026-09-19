import React from 'react';

const DATA_TYPES = ['String', 'Integer', 'Decimal', 'Boolean', 'Date', 'Timestamp', 'Array', 'Object'];

export default function RuleFieldsSection({ formData, handleChange, errors }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-800">2. Field Definitions & Mapping</h2>
        <p className="text-xs text-slate-500 mt-0.5">Define incoming source fields and outgoing target fields.</p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Source Field Info */}
        <div className="space-y-4 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Field (Input)</span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Inbound</span>
          </div>
          <div>
            <label htmlFor="inputField" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600">
              Source Field Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="inputField"
              name="inputField"
              value={formData.inputField || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 font-mono text-xs ${errors.inputField ? 'ring-rose-300 focus:ring-rose-500 bg-rose-50/50' : 'ring-slate-300 focus:ring-blue-600'}`}
              placeholder="e.g., customer_email or subtotal, tax_rate"
            />
            {errors.inputField && <p className="mt-1.5 text-xs text-rose-600">{errors.inputField}</p>}
          </div>

          <div>
            <label htmlFor="sourceType" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Data Type
            </label>
            <select
              id="sourceType"
              name="sourceType"
              value={formData.sourceType || 'String'}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {DATA_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Field Info */}
        <div className="space-y-4 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Field (Output)</span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10">Outbound</span>
          </div>
          <div>
            <label htmlFor="outputField" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600">
              Output Field Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="outputField"
              name="outputField"
              value={formData.outputField || ''}
              onChange={handleChange}
              className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 font-mono text-xs ${errors.outputField ? 'ring-rose-300 focus:ring-rose-500 bg-rose-50/50' : 'ring-slate-300 focus:ring-blue-600'}`}
              placeholder="e.g., email_clean or total_amount"
            />
            {errors.outputField && <p className="mt-1.5 text-xs text-rose-600">{errors.outputField}</p>}
          </div>

          <div>
            <label htmlFor="targetType" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Data Type
            </label>
            <select
              id="targetType"
              name="targetType"
              value={formData.targetType || 'String'}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {DATA_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
