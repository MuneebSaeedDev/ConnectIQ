import React, { useState } from 'react';
import { X, FileCode } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../../services/nodeLibrary.api';

export default function CreateCustomNodeModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Transformations');
  const [subcategory, setSubcategory] = useState('Custom Script');
  const [runtime, setRuntime] = useState('Python 3.11');
  const [ownerTeam, setOwnerTeam] = useState('Data Engineering');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(
`def transform(records):
    # Process batch of records
    transformed = []
    for record in records:
        # Custom transformation logic
        record['processed_at'] = '2026-09-08T00:00:00Z'
        transformed.append(record)
    return transformed`
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      category,
      subcategory,
      runtime,
      ownerTeam,
      description,
      code,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-node-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-node-title" className="text-base font-bold text-slate-900">
                Create Custom Node
              </h2>
              <p className="text-xs text-slate-500">
                Author and register a custom pipeline component for your organization.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Node Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="custom-node-name" className="font-semibold text-slate-700">
                Node Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="custom-node-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anomaly Detector"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="custom-node-cat" className="font-semibold text-slate-700">
                Category
              </label>
              <select
                id="custom-node-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {CATEGORY_OPTIONS.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory & Runtime Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="custom-node-subcat" className="font-semibold text-slate-700">
                Subcategory / Taxonomy
              </label>
              <input
                id="custom-node-subcat"
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Scripting (Python)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="custom-node-runtime" className="font-semibold text-slate-700">
                Execution Runtime
              </label>
              <select
                id="custom-node-runtime"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="Python 3.11">Python 3.11</option>
                <option value="SQL / Spark">SQL / Apache Spark</option>
                <option value="Java 17">Java 17 (JVM)</option>
                <option value="Node.js 20">Node.js 20</option>
                <option value="WASM Sandbox">WebAssembly Sandbox</option>
              </select>
            </div>
          </div>

          {/* Owner Team */}
          <div className="space-y-1">
            <label htmlFor="custom-node-owner" className="font-semibold text-slate-700">
              Owner Team
            </label>
            <input
              id="custom-node-owner"
              type="text"
              value={ownerTeam}
              onChange={(e) => setOwnerTeam(e.target.value)}
              placeholder="e.g. ML Engineering · Platform"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="custom-node-desc" className="font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="custom-node-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the component's functionality and interface..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Code Editor */}
          <div className="space-y-1">
            <label htmlFor="custom-node-code" className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Transformation Code Template ({runtime})</span>
              <span className="font-mono text-[10px] text-slate-400">Read-Write Sandbox</span>
            </label>
            <textarea
              id="custom-node-code"
              rows={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions inside form */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              Create Custom Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
