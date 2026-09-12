import React, { useState } from 'react';
import { Tag, Plus, X, AlertCircle } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../../services/filterNodeConfig.api';

export default function GeneralInfoSection({
  form,
  updateField,
  addTag,
  removeTag,
}) {
  const [tagInput, setTagInput] = useState('');
  const [tagInputVisible, setTagInputVisible] = useState(false);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
        setTagInput('');
        setTagInputVisible(false);
      }
    } else if (e.key === 'Escape') {
      setTagInputVisible(false);
      setTagInput('');
    }
  };

  const isNodeNameValid = !form.nodeName || /^[a-z0-9_]+$/.test(form.nodeName);

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-general-info"
    >
      {/* Section Header matching Figma 157:3726 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <h2 id="section-general-info" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
          General Information
        </h2>
        <span className="font-mono text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          v{form.version || '2.4.1'} · {form.nodeId || 'node_filter_007'}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Row 1: Node Name & Display Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="nodeName" className="block text-xs font-semibold text-slate-700">
              Node Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="nodeName"
              value={form.nodeName || ''}
              onChange={(e) => updateField('nodeName', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. revenue_country_filter"
              className={`w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-white border rounded-md shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                !isNodeNameValid ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
              required
            />
            {!isNodeNameValid ? (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="size-3 shrink-0" />
                Must contain only lowercase alphanumeric characters and underscores.
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Unique identifier for pipeline execution DAG</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={form.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="e.g. Active Revenue Filter"
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <p className="text-[11px] text-slate-400">Human-readable label displayed on canvas</p>
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={2}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Explain the filtering criteria, target dataset, and business purpose..."
            className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-y"
          />
        </div>

        {/* Row 3: Category & Owner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-xs font-semibold text-slate-700">
              Category
            </label>
            <select
              id="category"
              value={form.category || 'Data Quality'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="owner" className="block text-xs font-semibold text-slate-700">
              Owner
            </label>
            <input
              type="text"
              id="owner"
              value={form.owner || ''}
              onChange={(e) => updateField('owner', e.target.value)}
              placeholder="e.g. data-eng-team@acme.io"
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Row 4: Tags Management */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Tags
          </label>
          <div className="flex items-center flex-wrap gap-2 p-2 bg-slate-50/70 border border-slate-200 rounded-md min-h-[38px]">
            <Tag className="size-3.5 text-slate-400 shrink-0 ml-1" />
            {(form.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-2xs"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 transition"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            {tagInputVisible ? (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) addTag(tagInput.trim());
                  setTagInput('');
                  setTagInputVisible(false);
                }}
                autoFocus
                placeholder="tag name..."
                className="px-2 py-0.5 text-xs text-slate-900 bg-white border border-blue-400 rounded outline-hidden shadow-2xs w-28"
              />
            ) : (
              <button
                type="button"
                onClick={() => setTagInputVisible(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-dashed border-blue-300 rounded transition"
              >
                <Plus className="size-3" />
                Add
              </button>
            )}
          </div>
        </div>

        {/* Row 5: Metadata Footer Strip matching Figma 157:3783 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Node Type</span>
            <span className="font-semibold text-slate-800 font-mono text-xs">{form.nodeType || 'FILTER'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Created By</span>
            <span className="font-semibold text-slate-800">{form.createdBy || 'a.weber'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Version</span>
            <span className="font-semibold text-slate-800 font-mono">{form.version || '2.4.1'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Last Modified</span>
            <span className="font-semibold text-slate-800">{form.lastModified || '2026-08-06 14:22'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
