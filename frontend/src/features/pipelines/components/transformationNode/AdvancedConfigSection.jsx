import React from 'react';
import { ChevronDown, ChevronRight, Sliders, FileCode, Database } from 'lucide-react';

export default function AdvancedConfigSection({
  advancedConfig = {},
  isOpen = false,
  onToggleOpen,
  onUpdateNestedField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Accordion Header matching Figma 220:7089 */}
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition text-left focus:outline-none"
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Advanced Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Runtime variables, custom functions, lookup cache, schema overrides
          </p>
        </div>
        <div className="p-1 rounded text-slate-500">
          {isOpen ? <ChevronDown className="size-4.5" /> : <ChevronRight className="size-4.5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 border-t border-slate-200 space-y-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Runtime Variables */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Runtime Variables (KEY=VALUE)
              </label>
              <textarea
                rows={3}
                value={advancedConfig.runtimeVariables || ''}
                onChange={(e) => onUpdateNestedField('advancedConfig', 'runtimeVariables', e.target.value)}
                placeholder="CUSTOM_PRECISION=4&#10;STRICT_TYPING=true"
                className="w-full text-xs px-3 py-2 bg-slate-900 text-emerald-400 font-mono rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Custom Python/JS Functions */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Custom Transformation Functions (UDF)
              </label>
              <textarea
                rows={3}
                value={advancedConfig.customFunctions || ''}
                onChange={(e) => onUpdateNestedField('advancedConfig', 'customFunctions', e.target.value)}
                placeholder="def clean_phone(val):&#10;  return re.sub(r'\D', '', val)"
                className="w-full text-xs px-3 py-2 bg-slate-900 text-amber-300 font-mono rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Lookup Cache TTL */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Lookup Cache TTL (seconds)
              </label>
              <input
                type="number"
                value={advancedConfig.lookupCacheTTL || 3600}
                onChange={(e) => onUpdateNestedField('advancedConfig', 'lookupCacheTTL', parseInt(e.target.value, 10))}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>

            {/* Schema Overrides JSON */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Schema Overrides (JSON)
              </label>
              <input
                type="text"
                value={advancedConfig.schemaOverrides || '{}'}
                onChange={(e) => onUpdateNestedField('advancedConfig', 'schemaOverrides', e.target.value)}
                placeholder="{}"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
