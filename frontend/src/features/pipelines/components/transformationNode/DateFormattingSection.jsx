import React from 'react';
import {
  DATE_FORMATS,
  TIME_ZONES,
  LOCALES,
} from '../../services/transformationNodeConfig.api';

export default function DateFormattingSection({
  dateFormatting = {},
  datasetFields = [],
  onUpdateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Date Formatting</h2>
        <p className="text-xs text-slate-500 mt-0.5">Parse, format, and convert date/time fields</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Input Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Input Field</label>
            <select
              value={dateFormatting.inputField || 'order_date'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'inputField', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {datasetFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Format */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Source Format</label>
            <select
              value={dateFormatting.sourceFormat || 'ISO 8601'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'sourceFormat', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {DATE_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Format */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Format</label>
            <select
              value={dateFormatting.targetFormat || 'yyyy-MM-dd'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'targetFormat', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {DATE_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Time Zone</label>
            <select
              value={dateFormatting.timeZone || 'UTC'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'timeZone', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {TIME_ZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Locale */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Locale</label>
            <select
              value={dateFormatting.locale || 'en-US'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'locale', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              {LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Output Field & Live Preview Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Output Field</label>
            <input
              type="text"
              value={dateFormatting.outputField || 'order_date_clean'}
              onChange={(e) => onUpdateNestedField('dateFormatting', 'outputField', e.target.value)}
              placeholder="e.g. order_date_clean"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Input Sample</span>
            <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
              {dateFormatting.inputSample || '2024-01-15T08:32:00Z'}
            </span>
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200">
            <span className="text-[11px] font-medium text-emerald-700 block">Output Preview</span>
            <span className="text-xs font-bold text-emerald-900 font-mono mt-0.5 block">
              {dateFormatting.outputPreview || '2024-01-15'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
