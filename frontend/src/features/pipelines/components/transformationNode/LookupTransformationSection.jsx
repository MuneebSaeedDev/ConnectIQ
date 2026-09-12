import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LookupTransformationSection({
  lookup = {},
  datasetFields = [],
  onUpdateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Lookup Transformation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Enrich records using lookup tables or datasets</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Form Grid matching Figma 220:6634 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Lookup Source */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lookup Source</label>
            <select
              value={lookup.lookupSource || 'Internal Dataset'}
              onChange={(e) => onUpdateNestedField('lookup', 'lookupSource', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              <option value="Internal Dataset">Internal Dataset</option>
              <option value="External Database">External Database</option>
              <option value="Redis Cache">Redis Cache</option>
              <option value="REST API Endpoint">REST API Endpoint</option>
            </select>
          </div>

          {/* Lookup Dataset */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lookup Dataset</label>
            <select
              value={lookup.lookupDataset || 'status_map_v2'}
              onChange={(e) => onUpdateNestedField('lookup', 'lookupDataset', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              <option value="status_map_v2">status_map_v2</option>
              <option value="status_map_v1 (fallback)">status_map_v1 (fallback)</option>
              <option value="customer_tier_lookup">customer_tier_lookup</option>
              <option value="geo_country_codes">geo_country_codes</option>
            </select>
          </div>

          {/* Lookup Key */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lookup Key</label>
            <input
              type="text"
              value={lookup.lookupKey || 'code'}
              onChange={(e) => onUpdateNestedField('lookup', 'lookupKey', e.target.value)}
              placeholder="e.g. code"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Input Key */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Input Key</label>
            <select
              value={lookup.inputKey || 'status'}
              onChange={(e) => onUpdateNestedField('lookup', 'inputKey', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {datasetFields.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Output Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Output Field</label>
            <input
              type="text"
              value={lookup.outputField || 'status_label'}
              onChange={(e) => onUpdateNestedField('lookup', 'outputField', e.target.value)}
              placeholder="e.g. status_label"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Default Value</label>
            <input
              type="text"
              value={lookup.defaultValue || 'UNKNOWN'}
              onChange={(e) => onUpdateNestedField('lookup', 'defaultValue', e.target.value)}
              placeholder="e.g. UNKNOWN"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Warning Callout when dataset status is unavailable matching Figma 220:6689 */}
        {lookup.warningMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-800">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{lookup.warningMessage}</span>
              <p className="text-rose-600 text-[11px] mt-0.5">
                The lookup dataset &apos;status_map_v2&apos; could not be resolved in the organization catalog. Switch to status_map_v1 or re-sync catalog.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
