import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

export default function DuplicateNodeModal({
  isOpen,
  onClose,
  onConfirm,
  currentNodeName = 'customer_orders_merge',
}) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const currentVal = name || `${currentNodeName}_copy`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentVal.trim()) {
      onConfirm(currentVal.trim());
      setName('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Copy className="size-4 text-slate-700" />
            <h3 id="duplicate-modal-title" className="text-sm font-bold text-slate-900">
              Duplicate Merge Node
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Create an independent copy of this merge node with all join conditions, output schemas, conflict resolution policies, and buffer settings preserved.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="dupNodeName" className="block text-xs font-semibold text-slate-700">
              New Node Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="dupNodeName"
              value={currentVal}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400">Lowercase letters, numbers, and underscores only</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
            >
              Duplicate Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
