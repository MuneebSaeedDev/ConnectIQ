import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DATA_TYPES } from '../../services/transformationNodeConfig.api';

export default function AddRuleModal({
  isOpen,
  datasetFields = [],
  onClose,
  onAddRule,
}) {
  const [inputField, setInputField] = useState('email');
  const [transformation, setTransformation] = useState('Normalize Case');
  const [parameters, setParameters] = useState('lowercase');
  const [outputField, setOutputField] = useState('email_clean');
  const [outputType, setOutputType] = useState('String');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (outputField.trim()) {
      onAddRule({
        inputField,
        transformation,
        parameters,
        outputField: outputField.trim(),
        outputType,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Plus className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Add Transformation Rule</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Input Field</label>
              <select
                value={inputField}
                onChange={(e) => {
                  setInputField(e.target.value);
                  setOutputField(`${e.target.value}_transformed`);
                }}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-900"
              >
                {datasetFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transformation</label>
              <select
                value={transformation}
                onChange={(e) => setTransformation(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
              >
                <option value="Normalize Case">Normalize Case</option>
                <option value="Trim Whitespace">Trim Whitespace</option>
                <option value="String → Decimal">String → Decimal</option>
                <option value="Parse Timestamp">Parse Timestamp</option>
                <option value="Lookup">Lookup</option>
                <option value="Hash / Mask">Hash / Mask</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parameters</label>
              <input
                type="text"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                placeholder="e.g. lowercase"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Output Type</label>
              <select
                value={outputType}
                onChange={(e) => setOutputType(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Output Field Name</label>
            <input
              type="text"
              required
              value={outputField}
              onChange={(e) => setOutputField(e.target.value)}
              placeholder="e.g. email_clean"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Add Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
