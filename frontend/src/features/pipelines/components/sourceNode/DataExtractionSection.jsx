import React from 'react';
import {
  EXTRACTION_MODES,
} from '../../services/sourceNodeConfig.api';

export default function DataExtractionSection({
  form,
  updateField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="data-extraction-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          5
        </div>
        <div>
          <h2 id="data-extraction-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Data Extraction
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Extraction mode, incremental logic, CDC, and streaming configuration
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {/* Extraction Mode Radio Cards */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Extraction Mode
          </label>
          <div
            className="grid grid-cols-2 md:grid-cols-5 gap-2"
            role="radiogroup"
            aria-label="Extraction Mode"
          >
            {EXTRACTION_MODES.map((mode) => {
              const isSelected = form.extractionMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  title={mode.description}
                  onClick={() => updateField('extractionMode', mode.id)}
                  className={`px-3 py-2.5 rounded-md text-xs font-medium text-center transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-500'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mode.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Incremental Load Configuration (shown when applicable) */}
        {['incremental_load', 'cdc', 'streaming'].includes(form.extractionMode) && (
          <div className="bg-slate-50 rounded-md border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-3">
              {form.extractionMode === 'incremental_load' ? 'Incremental Load Configuration' : 'Advanced Extraction Configuration'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="source-watermark-col" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Watermark Column
                </label>
                <select
                  id="source-watermark-col"
                  value={form.watermarkColumn || 'created_at'}
                  onChange={(e) => updateField('watermarkColumn', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="id">id</option>
                  <option value="created_at">created_at</option>
                  <option value="updated_at">updated_at</option>
                  <option value="event_time">event_time</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Column used to track extraction progress.
                </p>
              </div>

              <div>
                <label htmlFor="source-cursor-field" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Cursor Field
                </label>
                <select
                  id="source-cursor-field"
                  value={form.cursorField || 'id'}
                  onChange={(e) => updateField('cursorField', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="id">id</option>
                  <option value="transaction_id">transaction_id</option>
                  <option value="uuid">uuid</option>
                </select>
              </div>

              <div>
                <label htmlFor="source-timestamp-col" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Timestamp Column
                </label>
                <select
                  id="source-timestamp-col"
                  value={form.timestampColumn || 'updated_at'}
                  onChange={(e) => updateField('timestampColumn', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="created_at">created_at</option>
                  <option value="updated_at">updated_at</option>
                  <option value="modified_date">modified_date</option>
                </select>
              </div>

              <div>
                <label htmlFor="source-batch-window" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Batch Window
                </label>
                <div className="flex">
                  <input
                    id="source-batch-window"
                    type="number"
                    min="1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-l-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 z-10"
                    value={form.batchWindow || '6'}
                    onChange={(e) => updateField('batchWindow', e.target.value)}
                  />
                  <select
                    value={form.batchWindowUnit || 'hours'}
                    onChange={(e) => updateField('batchWindowUnit', e.target.value)}
                    className="w-24 px-2 py-1.5 text-xs rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:z-20"
                    aria-label="Batch window unit"
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
