import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import {
  RULE_TYPES,
  RULE_SEVERITIES,
  FAILURE_BEHAVIORS,
  INPUT_DATASET_FIELDS,
} from '../../services/validationNodeConfig.api';

export default function EditRuleModal({
  isOpen,
  onClose,
  rule,
  onUpdateRule,
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    }
  }, [rule]);

  if (!isOpen || !rule) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateRule(rule.id, formData);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-rule-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="size-4 text-blue-600" />
            <h3 id="edit-rule-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Edit Rule — {rule.ruleName}
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
            <label htmlFor="edit-rule-name" className="block font-semibold text-slate-700">
              Rule Name
            </label>
            <input
              type="text"
              id="edit-rule-name"
              value={formData.ruleName || ''}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="edit-rule-field" className="block font-semibold text-slate-700">
                Target Field
              </label>
              <select
                id="edit-rule-field"
                value={formData.field || 'customer_id'}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
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
              <label htmlFor="edit-rule-type" className="block font-semibold text-slate-700">
                Validation Type
              </label>
              <select
                id="edit-rule-type"
                value={formData.validationType || 'Not Null'}
                onChange={(e) => setFormData({ ...formData, validationType: e.target.value })}
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
              <label htmlFor="edit-rule-condition" className="block font-semibold text-slate-700">
                Operator / Condition
              </label>
              <input
                type="text"
                id="edit-rule-condition"
                value={formData.condition || ''}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-rule-expected" className="block font-semibold text-slate-700">
                Expected Value
              </label>
              <input
                type="text"
                id="edit-rule-expected"
                value={formData.expectedValue || ''}
                onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="edit-rule-severity" className="block font-semibold text-slate-700">
                Severity
              </label>
              <select
                id="edit-rule-severity"
                value={formData.severity || 'Error'}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="Error">Error (Fail)</option>
                <option value="Warning">Warning (Flag)</option>
                <option value="Info">Informational</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-rule-behavior" className="block font-semibold text-slate-700">
                Failure Behavior
              </label>
              <select
                id="edit-rule-behavior"
                value={formData.failureBehavior || 'Reject Record'}
                onChange={(e) => setFormData({ ...formData, failureBehavior: e.target.value })}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
