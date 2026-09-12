import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function DuplicateNodeModal({
  isOpen,
  onClose,
  onDuplicate,
  currentNodeName = 'customer_field_mapper',
}) {
  const [duplicateName, setDuplicateName] = useState(`${currentNodeName}_copy`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (duplicateName.trim()) {
      onDuplicate(duplicateName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-node-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Copy className="size-4 text-blue-600" />
            <h3 id="duplicate-node-modal-title" className="text-sm font-bold text-slate-900">
              Duplicate Mapping Node
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label htmlFor="dupNodeName" className="block font-semibold text-slate-700 mb-1">
              New Node Name
            </label>
            <input
              id="dupNodeName"
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              className="w-full h-8 px-2.5 font-mono text-xs text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Creates an exact clone of current schemas, transformation rules, and runtime parameters.
            </p>
          </div>

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
              Duplicate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
