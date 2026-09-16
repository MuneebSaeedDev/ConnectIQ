import React, { useState } from 'react';
import { Layers, X, Tag as TagIcon } from 'lucide-react';

export default function GeneralInfoSection({ form, updateField, addTag, removeTag }) {
  const [tagInput, setTagInput] = useState('');

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">01. Destination Identity & Metadata</h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">ID: {form.nodeId}</span>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dstNodeName" className="block text-xs font-semibold text-slate-700 mb-1">
              Node Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="dstNodeName"
              type="text"
              value={form.nodeName || ''}
              onChange={(e) => updateField('nodeName', e.target.value)}
              placeholder="e.g. Snowflake Enterprise Data Warehouse Load"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition"
            />
          </div>

          <div>
            <label htmlFor="dstCategory" className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="dstCategory"
              value={form.category || 'Destinations'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition"
            >
              <option value="Destinations">Destinations (Sink)</option>
              <option value="Cloud Warehouse">Cloud Warehouse</option>
              <option value="Data Lake">Data Lake</option>
              <option value="Event Stream">Event Stream</option>
              <option value="Operational Store">Operational Store</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="dstDescription" className="block text-xs font-semibold text-slate-700 mb-1">
            Description & Target Table Summary
          </label>
          <textarea
            id="dstDescription"
            rows={2}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the downstream consumption pattern and warehouse destination mart..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label htmlFor="dstEnvironment" className="block text-xs font-semibold text-slate-700 mb-1">
              Environment
            </label>
            <input
              id="dstEnvironment"
              type="text"
              readOnly
              value={form.environment || 'Production'}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-md cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="dstVersion" className="block text-xs font-semibold text-slate-700 mb-1">
              Version
            </label>
            <input
              id="dstVersion"
              type="text"
              readOnly
              value={form.version || 'v1.2.0'}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-md font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="dstStatus" className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <input
              id="dstStatus"
              type="text"
              readOnly
              value={form.status || 'Configured'}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-emerald-700 font-semibold rounded-md cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <TagIcon className="size-3 text-slate-400" />
              Organizational Tags
            </span>
            <span className="text-[11px] font-normal text-slate-400">Press enter to add</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-2 border border-slate-300 rounded-md bg-slate-50/50">
            {form.tags &&
              form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            <form onSubmit={handleAddTagSubmit} className="inline-flex items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="+ Add tag..."
                className="px-2 py-1 text-xs bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 min-w-[100px]"
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
