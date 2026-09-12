import React, { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

export default function ImportRulesModal({
  isOpen,
  onClose,
  onImport,
}) {
  const [rulesJson, setRulesJson] = useState(`[
  {
    "ruleName": "valid_postal_code",
    "field": "region",
    "validationType": "Pattern",
    "condition": "MATCHES",
    "expectedValue": "^[0-9]{5}(-[0-9]{4})?$",
    "severity": "Warning",
    "failureBehavior": "Mark Warning"
  }
]`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(rulesJson);
      if (Array.isArray(parsed)) {
        parsed.forEach((r) => onImport(r));
        onClose();
      }
    } catch (_err) {
      alert('Invalid JSON syntax');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-rules-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="size-4 text-blue-600" />
            <h3 id="import-rules-title" className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Import Validation Rules (JSON)
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
            <label htmlFor="import-rules-json" className="block font-semibold text-slate-700">
              Paste JSON Array of Validation Rules
            </label>
            <textarea
              id="import-rules-json"
              rows={8}
              value={rulesJson}
              onChange={(e) => setRulesJson(e.target.value)}
              className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded bg-slate-900 text-emerald-400"
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
              Import Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
