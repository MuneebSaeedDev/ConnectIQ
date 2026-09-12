import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { INPUT_DATASET_FIELDS } from '../../services/validationNodeConfig.api';

export default function AddBusinessRuleModal({
  isOpen,
  onClose,
  onAddBusinessRule,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Error');
  const [failureBehavior, setFailureBehavior] = useState('Reject Record');
  const [selectedField, setSelectedField] = useState('status');
  const [condition, setCondition] = useState("IF status = 'active' THEN email IS NOT NULL");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddBusinessRule({
      name: name.trim(),
      description: description.trim() || 'Custom business validation rule',
      severity,
      failureBehavior,
      inputFields: [selectedField],
      condition: condition.trim(),
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-br-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-blue-600" />
            <h3 id="add-br-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Add Business Rule
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="br-name-input" className="block font-semibold text-slate-700">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="br-name-input"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. tier_requires_minimum_balance"
              className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="br-desc-input" className="block font-semibold text-slate-700">
              Description
            </label>
            <input
              type="text"
              id="br-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Active accounts must maintain valid email address"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="br-severity-select" className="block font-semibold text-slate-700">
                Severity
              </label>
              <select
                id="br-severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="Error">Error (Fail)</option>
                <option value="Warning">Warning (Flag)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="br-field-select" className="block font-semibold text-slate-700">
                Primary Input Field
              </label>
              <select
                id="br-field-select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              >
                {INPUT_DATASET_FIELDS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="br-condition-textarea" className="block font-semibold text-slate-700">
              Condition Expression
            </label>
            <textarea
              id="br-condition-textarea"
              rows={2}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded bg-slate-900 text-emerald-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs"
            >
              Add Business Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
