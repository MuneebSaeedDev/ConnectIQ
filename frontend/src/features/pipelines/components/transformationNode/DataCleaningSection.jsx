import React from 'react';
import {
  DATA_CLEANING_OPERATIONS,
  INVALID_VALUE_HANDLING_OPTIONS,
} from '../../services/transformationNodeConfig.api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function DataCleaningSection({
  dataCleaning = {},
  inputDataset = {},
  onUpdateField,
}) {
  const fields = inputDataset?.fields || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header matching Figma 220:6367 */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Data Cleaning</h2>
        <p className="text-xs text-slate-500 mt-0.5">Cleaning operations applied to input fields</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls Grid matching Figma 220:6375 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Input Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Input Field
            </label>
            <select
              value={dataCleaning.inputField || 'email'}
              onChange={(e) => onUpdateField('inputField', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          {/* Cleaning Operation */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cleaning Operation
            </label>
            <select
              value={dataCleaning.operation || 'Normalize Case'}
              onChange={(e) => onUpdateField('operation', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {DATA_CLEANING_OPERATIONS.map((op) => (
                <option key={op.value} value={op.label}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parameters */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Parameters
            </label>
            <input
              type="text"
              value={dataCleaning.parameters || ''}
              onChange={(e) => onUpdateField('parameters', e.target.value)}
              placeholder="e.g. lowercase"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Output Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Output Field
            </label>
            <input
              type="text"
              value={dataCleaning.outputField || ''}
              onChange={(e) => onUpdateField('outputField', e.target.value)}
              placeholder="e.g. email_clean"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Invalid Value Handling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Invalid Value Handling
            </label>
            <select
              value={dataCleaning.invalidHandling || 'set_to_null'}
              onChange={(e) => onUpdateField('invalidHandling', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {INVALID_VALUE_HANDLING_OPTIONS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Operations Pill Cloud matching Figma 220:6414 - 220:6435 */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block mb-2">
            Available Operations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DATA_CLEANING_OPERATIONS.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => onUpdateField('operation', op.label)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                  dataCleaning.operation === op.label
                    ? 'bg-purple-100 text-purple-800 border border-purple-300 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
