import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

export default function DuplicateNodeModal({
  isOpen,
  onClose,
  onConfirm,
  currentName,
}) {
  const [nodeName, setNodeName] = useState(`${currentName || 'customer_validator'}_copy`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nodeName.trim()) {
      onConfirm(nodeName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-node-title"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Copy className="size-4 text-blue-600" />
            <h3 id="duplicate-node-title">Duplicate Validation Node</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="dup-node-name" className="block text-xs font-semibold text-slate-700">
              New Node Name
            </label>
            <input
              type="text"
              id="dup-node-name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-[11px] text-slate-500">
              All 22 validation configuration parameters, rules, and tests will be cloned.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Create Duplicate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
