import React from 'react';
import {
  DATA_TYPES,
  INVALID_VALUE_HANDLING_OPTIONS,
} from '../../services/transformationNodeConfig.api';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function TypeConversionSection({
  typeConversion = {},
  inputDataset = {},
  onUpdateField,
}) {
  const fields = inputDataset?.fields || [];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header matching Figma 220:6436 */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Type Conversion</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explicit type conversion with format control</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Field Selection Grid matching Figma 220:6444 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Source Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Source Field
            </label>
            <select
              value={typeConversion.sourceField || 'total_amount'}
              onChange={(e) => onUpdateField('sourceField', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {fields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Source Type
            </label>
            <select
              value={typeConversion.sourceType || 'String'}
              onChange={(e) => onUpdateField('sourceType', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {DATA_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Target Type
            </label>
            <select
              value={typeConversion.targetType || 'Decimal'}
              onChange={(e) => onUpdateField('targetType', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {DATA_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Conversion Format */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Conversion Format
            </label>
            <input
              type="text"
              value={typeConversion.format || ''}
              onChange={(e) => onUpdateField('format', e.target.value)}
              placeholder='e.g. "0.00"'
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Invalid Value Handling */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Invalid Value Handling
            </label>
            <select
              value={typeConversion.invalidHandling || 'use_default'}
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

          {/* Default Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Default Value
            </label>
            <input
              type="text"
              value={typeConversion.defaultValue || ''}
              onChange={(e) => onUpdateField('defaultValue', e.target.value)}
              placeholder="e.g. 0.00"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Validation Feedback Strip matching Figma 220:6491 */}
        <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Conversion valid: {typeConversion.sourceType || 'String'} → {typeConversion.targetType || 'Decimal'} with format &quot;{typeConversion.format || '0.00'}&quot;
          </span>
        </div>
      </div>
    </section>
  );
}
