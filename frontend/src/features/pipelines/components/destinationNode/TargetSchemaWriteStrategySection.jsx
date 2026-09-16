import React from 'react';
import { Table, HardDrive, Layers, Server } from 'lucide-react';
import { WRITE_MODES } from '../../services/destinationNodeConfig.api';

export default function TargetSchemaWriteStrategySection({ form, updateField }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">03. Target Schema & Write Strategy</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Destination Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Database / Catalog <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.targetDatabase || ''}
              onChange={(e) => updateField('targetDatabase', e.target.value)}
              placeholder="e.g. ANALYTICS_PROD"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Schema / Dataset <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.targetSchema || ''}
              onChange={(e) => updateField('targetSchema', e.target.value)}
              placeholder="e.g. PUBLIC_MARTS"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Table / Collection <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.targetTable || ''}
              onChange={(e) => updateField('targetTable', e.target.value)}
              placeholder="e.g. FACT_CUSTOMER_ORDERS"
              className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Write Mode Radios */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Write & Ingestion Strategy
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {WRITE_MODES.map((mode) => {
              const isSelected = form.writeMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => updateField('writeMode', mode.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {mode.label}
                    </span>
                    <input
                      type="radio"
                      name="writeMode"
                      checked={isSelected}
                      onChange={() => updateField('writeMode', mode.id)}
                      className="text-emerald-600 focus:ring-emerald-500 size-3.5"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {mode.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upsert Primary Key Configuration */}
        {form.writeMode === 'upsert' && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-emerald-900">
              Upsert Conflict Resolution Keys (Composite Primary Match)
            </label>
            <input
              type="text"
              value={(form.upsertKeys || []).join(', ')}
              onChange={(e) => updateField('upsertKeys', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="e.g. CUSTOMER_ID, ORDER_ID"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 bg-white border border-emerald-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-emerald-700">
              Rows with matching composite keys will be updated in place with fresh incoming values; non-matching rows will be appended.
            </p>
          </div>
        )}

        {/* Staging Bucket Configuration */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.useStaging}
                onChange={(e) => updateField('useStaging', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <HardDrive className="size-3.5 text-slate-500" />
              Use Intermediate Cloud Staging Buffer
            </label>
            <input
              type="text"
              value={form.stagingBucket || ''}
              disabled={!form.useStaging}
              onChange={(e) => updateField('stagingBucket', e.target.value)}
              placeholder="s3://stage-bucket/path/"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Bulk Copy Compression Format
            </label>
            <select
              value={form.tableFormat || 'PARQUET'}
              onChange={(e) => updateField('tableFormat', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            >
              <option value="PARQUET">Apache Parquet (Columnar, High Performance)</option>
              <option value="ORC">Apache ORC (Optimized Row Columnar)</option>
              <option value="GZIP_CSV">GZIP Compressed Delimited CSV</option>
              <option value="JSON_LINES">Newline-Delimited JSON (NDJSON)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
