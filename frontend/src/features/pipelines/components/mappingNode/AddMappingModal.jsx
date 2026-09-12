import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { DATA_TYPES, MAPPING_TYPES } from '../../services/mappingNodeConfig.api';

export default function AddMappingModal({
  isOpen,
  onClose,
  onAdd,
  inputFieldOptions = [],
  targetFieldOptions = [],
}) {
  const [sourceField, setSourceField] = useState(inputFieldOptions[0]?.name || 'customer_id');
  const [srcType, setSrcType] = useState(inputFieldOptions[0]?.type || 'INTEGER');
  const [targetField, setTargetField] = useState(targetFieldOptions[0]?.name || 'customer_id');
  const [tgtType, setTgtType] = useState(targetFieldOptions[0]?.type || 'INTEGER');
  const [mappingType, setMappingType] = useState('Direct');
  const [transformation, setTransformation] = useState('—');

  if (!isOpen) return null;

  const handleSourceChange = (fieldName) => {
    setSourceField(fieldName);
    const found = inputFieldOptions.find((f) => f.name === fieldName);
    if (found) setSrcType(found.type);
  };

  const handleTargetChange = (fieldName) => {
    setTargetField(fieldName);
    const found = targetFieldOptions.find((f) => f.name === fieldName);
    if (found) setTgtType(found.type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      sourceField,
      srcType,
      targetField,
      tgtType,
      mappingType,
      transformation: mappingType === 'Direct' ? '—' : transformation,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-mapping-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 id="add-mapping-modal-title" className="text-sm font-bold text-slate-900">
            Add Field Mapping Rule
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Source field select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modalSrcField" className="block font-semibold text-slate-700 mb-1">
                Source Field
              </label>
              <select
                id="modalSrcField"
                value={sourceField}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
              >
                {inputFieldOptions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modalSrcType" className="block font-semibold text-slate-700 mb-1">
                Source Type
              </label>
              <select
                id="modalSrcType"
                value={srcType}
                onChange={(e) => setSrcType(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mapping type */}
          <div>
            <label htmlFor="modalMapType" className="block font-semibold text-slate-700 mb-1">
              Mapping Type
            </label>
            <select
              id="modalMapType"
              value={mappingType}
              onChange={(e) => setMappingType(e.target.value)}
              className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
            >
              {MAPPING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transformation expression if not direct */}
          {mappingType !== 'Direct' && (
            <div>
              <label htmlFor="modalTrans" className="block font-semibold text-slate-700 mb-1">
                Transformation Expression
              </label>
              <input
                id="modalTrans"
                type="text"
                value={transformation}
                onChange={(e) => setTransformation(e.target.value)}
                placeholder="e.g. UPPER(TRIM(field_name))"
                className="w-full h-8 px-2.5 font-mono text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Target field select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modalTgtField" className="block font-semibold text-slate-700 mb-1">
                Target Field
              </label>
              <select
                id="modalTgtField"
                value={targetField}
                onChange={(e) => handleTargetChange(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
              >
                {targetFieldOptions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} {f.required ? '(REQ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modalTgtType" className="block font-semibold text-slate-700 mb-1">
                Target Type
              </label>
              <select
                id="modalTgtType"
                value={tgtType}
                onChange={(e) => setTgtType(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
            >
              Add Mapping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
