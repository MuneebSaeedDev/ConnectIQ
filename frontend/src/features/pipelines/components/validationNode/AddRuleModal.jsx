import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  RULE_TYPES,
  RULE_SEVERITIES,
  FAILURE_BEHAVIORS,
  INPUT_DATASET_FIELDS,
} from '../../services/validationNodeConfig.api';

export default function AddRuleModal({
  isOpen,
  onClose,
  onAddRule,
}) {
  const [ruleName, setRuleName] = useState('');
  const [field, setField] = useState('customer_id');
  const [validationType, setValidationType] = useState('Not Null');
  const [condition, setCondition] = useState('IS NOT NULL');
  const [expectedValue, setExpectedValue] = useState('—');
  const [severity, setSeverity] = useState('Error');
  const [failureBehavior, setFailureBehavior] = useState('Reject Record');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    onAddRule({
      ruleName: ruleName.trim(),
      field,
      validationType,
      condition,
      expectedValue,
      severity,
      failureBehavior,
    });

    setRuleName('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-rule-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-blue-600" />
            <h3 id="add-rule-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Add Validation Rule
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
            <label htmlFor="rule-name-input" className="block font-semibold text-slate-700">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="rule-name-input"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. check_customer_balance"
              className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="rule-field-select" className="block font-semibold text-slate-700">
                Target Field
              </label>
              <select
                id="rule-field-select"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              >
                {INPUT_DATASET_FIELDS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rule-type-select" className="block font-semibold text-slate-700">
                Validation Type
              </label>
              <select
                id="rule-type-select"
                value={validationType}
                onChange={(e) => setValidationType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                {RULE_TYPES.map((t) => (
                  <option key={t.value} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="rule-condition-input" className="block font-semibold text-slate-700">
                Operator / Condition
              </label>
              <input
                type="text"
                id="rule-condition-input"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. IS NOT NULL, MATCHES"
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rule-expected-value" className="block font-semibold text-slate-700">
                Expected Value
              </label>
              <input
                type="text"
                id="rule-expected-value"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                placeholder="e.g. — or regex pattern"
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="rule-severity-select" className="block font-semibold text-slate-700">
                Severity
              </label>
              <select
                id="rule-severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="Error">Error (Fail)</option>
                <option value="Warning">Warning (Flag)</option>
                <option value="Info">Informational</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rule-failure-behavior-select" className="block font-semibold text-slate-700">
                Failure Behavior
              </label>
              <select
                id="rule-failure-behavior-select"
                value={failureBehavior}
                onChange={(e) => setFailureBehavior(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                {FAILURE_BEHAVIORS.map((fb) => (
                  <option key={fb.id} value={fb.label}>
                    {fb.label}
                  </option>
                ))}
              </select>
            </div>
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
              Add Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
