import React from 'react';
import {
  DATABASES,
  SCHEMAS,
  TABLES,
} from '../../services/sourceNodeConfig.api';

export default function SourceConfigSection({
  form,
  updateField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="source-config-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          4
        </div>
        <div>
          <h2 id="source-config-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Source Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database, schema, table, and query extraction settings
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Database, Schema, Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source-cfg-database" className="block text-xs font-medium text-slate-700 mb-1">
              Database <span className="text-rose-500">*</span>
            </label>
            <select
              id="source-cfg-database"
              value={form.database || 'analytics_db'}
              onChange={(e) => updateField('database', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {DATABASES.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-cfg-schema" className="block text-xs font-medium text-slate-700 mb-1">
              Schema
            </label>
            <select
              id="source-cfg-schema"
              value={form.schema || 'public'}
              onChange={(e) => updateField('schema', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {SCHEMAS.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-cfg-table" className="block text-xs font-medium text-slate-700 mb-1">
              Table <span className="text-rose-500">*</span>
            </label>
            <select
              id="source-cfg-table"
              value={form.table || 'orders'}
              onChange={(e) => updateField('table', e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {TABLES.map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  {tbl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SQL Query Override */}
        <div>
          <label htmlFor="source-sql-override" className="block text-xs font-medium text-slate-700 mb-1">
            SQL Query Override
          </label>
          <textarea
            id="source-sql-override"
            rows={3}
            value={form.sqlQueryOverride || ''}
            onChange={(e) => updateField('sqlQueryOverride', e.target.value)}
            placeholder="SELECT * FROM orders WHERE created_at > :last_watermark ORDER BY created_at ASC;"
            className="w-full px-3 py-2 text-xs font-mono bg-slate-900 text-emerald-400 rounded-md border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Optional — overrides table selection. Supports parameterized watermarks.
          </p>
        </div>

        {/* Custom Endpoint / API Options matching Figma node 155:2585 */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="source-custom-endpoint" className="block text-xs font-medium text-slate-700 mb-1">
                Custom Endpoint
              </label>
              <input
                id="source-custom-endpoint"
                type="text"
                value={form.customEndpoint || ''}
                onChange={(e) => updateField('customEndpoint', e.target.value)}
                placeholder="https://api.internal/v1/resource"
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="source-request-method" className="block text-xs font-medium text-slate-700 mb-1">
                Request Method
              </label>
              <select
                id="source-request-method"
                value={form.requestMethod || 'GET'}
                onChange={(e) => updateField('requestMethod', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="FETCH">FETCH</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="source-custom-headers" className="block text-xs font-medium text-slate-700 mb-1">
              Custom Headers
            </label>
            <input
              id="source-custom-headers"
              type="text"
              value={form.customHeaders || ''}
              onChange={(e) => updateField('customHeaders', e.target.value)}
              placeholder="X-Api-Key: <key> Content-Type: application/json"
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
