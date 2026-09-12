import React, { useState, useEffect, useRef } from 'react';
import { Copy, X, Check } from 'lucide-react';

export default function DuplicateNodeModal({
  isOpen,
  onClose,
  onConfirm,
  currentNodeName,
}) {
  const [newName, setNewName] = useState('');
  const inputRef = useRef(null);

  // Sync default name when modal opens
  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setNewName(`${currentNodeName || 'source_node'}_copy`);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, currentNodeName]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-node-title"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Copy className="size-4" />
            </div>
            <h3 id="duplicate-node-title" className="text-sm font-bold text-slate-900">
              Duplicate Source Node
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="dup-node-name" className="block text-xs font-medium text-slate-700 mb-1">
              New Node Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              id="dup-node-name"
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. source_node_002"
              required
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              A cloned copy of this node with all its connection and schema mappings will be created.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
            >
              <Check className="size-3.5" />
              Duplicate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
