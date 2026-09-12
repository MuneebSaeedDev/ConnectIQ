import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Sliders } from 'lucide-react';

export default function AdvancedConfigSection({
  advancedConfig = {},
  updateAdvancedConfig,
  isOpen = false,
  onToggle,
}) {
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const variables = advancedConfig.runtimeVariables || [];

  const handleAddVariable = (e) => {
    e.preventDefault();
    if (newKey.trim()) {
      updateAdvancedConfig('runtimeVariables', [
        ...variables,
        { key: newKey.trim(), value: newVal.trim() },
      ]);
      setNewKey('');
      setNewVal('');
    }
  };

  const handleRemoveVariable = (index) => {
    updateAdvancedConfig(
      'runtimeVariables',
      variables.filter((_, i) => i !== index)
    );
  };

  return (
    <section
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      aria-labelledby="advanced-config-heading"
    >
      {/* Header with accordion toggle matching Figma 170:2716 */}
      <button
        type="button"
        id="advanced-config-heading"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            15
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Advanced Configuration
          </h2>
          <span className="text-xs text-slate-500 font-normal">
            — Runtime variables, schema overrides, custom functions
          </span>
        </div>

        <div className="size-6 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600">
          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-5 text-xs">
          {/* Runtime Variables Table */}
          <div>
            <span className="block font-semibold text-slate-700 mb-2">
              Runtime Variables
            </span>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase font-sans">
                  <tr>
                    <th scope="col" className="py-1.5 px-3">Variable Key</th>
                    <th scope="col" className="py-1.5 px-3">Value</th>
                    <th scope="col" className="py-1.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variables.map((v, i) => (
                    <tr key={v.key || i} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-800">{v.key}</td>
                      <td className="py-1.5 px-3 text-slate-600">{v.value}</td>
                      <td className="py-1.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariable(i)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete variable"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add row form */}
              <div className="p-2 bg-slate-50/50 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="NEW_VARIABLE_KEY"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-1 h-7 px-2 text-[11px] font-mono bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="value"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="flex-1 h-7 px-2 text-[11px] font-mono bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Schema Strictness & Memory Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="schemaStrict" className="block font-semibold text-slate-700 mb-1">
                Schema Strictness
              </label>
              <select
                id="schemaStrict"
                value={advancedConfig.schemaStrictness || 'STRICT'}
                onChange={(e) => updateAdvancedConfig('schemaStrictness', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="STRICT">STRICT (Fail on schema mismatch)</option>
                <option value="COERCE">COERCE (Auto-coerce where possible)</option>
                <option value="LENIENT">LENIENT (Pass unmapped fields)</option>
              </select>
            </div>

            <div>
              <label htmlFor="memThreshold" className="block font-semibold text-slate-700 mb-1">
                Memory Threshold (MB)
              </label>
              <input
                id="memThreshold"
                type="number"
                value={advancedConfig.memoryThresholdMb || 1024}
                onChange={(e) => updateAdvancedConfig('memoryThresholdMb', Number(e.target.value))}
                className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom UDF Script */}
          <div>
            <label htmlFor="udfScript" className="block font-semibold text-slate-700 mb-1">
              Custom JavaScript UDFs
            </label>
            <textarea
              id="udfScript"
              rows={3}
              value={advancedConfig.customUdfScript || ''}
              onChange={(e) => updateAdvancedConfig('customUdfScript', e.target.value)}
              placeholder="// Write helper functions here"
              className="w-full p-2.5 text-xs font-mono bg-slate-900 text-emerald-300 rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </section>
  );
}
