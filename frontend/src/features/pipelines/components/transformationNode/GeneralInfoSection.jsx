import React from 'react';
import {
  TRANSFORMATION_CATEGORY_OPTIONS,
  OWNER_OPTIONS,
} from '../../services/transformationNodeConfig.api';
import { Tag, X } from 'lucide-react';

export default function GeneralInfoSection({
  form,
  updateField,
  addTag,
  removeTag,
}) {
  const [tagInput, setTagInput] = React.useState('');

  const handleKeyDownTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
        setTagInput('');
      }
    }
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header matching Figma 220:6030 */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">
          General Information
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Node identity and metadata
        </p>
      </div>

      {/* Form Fields Grid matching Figma 220:6037 */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Node Name */}
          <div>
            <label
              htmlFor="trans-node-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Node Name <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              id="trans-node-name"
              type="text"
              value={form.nodeName || ''}
              onChange={(e) => updateField('nodeName', e.target.value)}
              placeholder="e.g. clean_customer_records"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="trans-display-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Display Name
            </label>
            <input
              id="trans-display-name"
              type="text"
              value={form.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="e.g. Clean Customer Records"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Transformation Category */}
          <div>
            <label
              htmlFor="trans-category"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Transformation Category <span className="text-rose-600 font-bold">*</span>
            </label>
            <select
              id="trans-category"
              value={form.category || 'Data Cleaning'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRANSFORMATION_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label
              htmlFor="trans-owner"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Owner
            </label>
            <select
              id="trans-owner"
              value={form.owner || 'D. Engineer'}
              onChange={(e) => updateField('owner', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {OWNER_OPTIONS.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label
              htmlFor="trans-tags-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 border border-slate-300 rounded-md bg-white min-h-[34px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              {(form.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                >
                  <Tag className="size-2.5 text-slate-400" />
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                    className="hover:text-rose-600 rounded-xs"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
              <input
                id="trans-tags-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="e.g. cleaning, customer, prod (press Enter)"
                className="flex-1 min-w-[140px] text-xs px-1 py-0.5 border-0 focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <label
            htmlFor="trans-description"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="trans-description"
            rows={2}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe what this transformation node does…"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
        </div>

        {/* Readonly Node Metadata Strip matching Figma 220:6080 */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Node Type</span>
            <span className="font-semibold text-slate-800">{form.nodeType || 'Transformation'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Version</span>
            <span className="font-semibold text-slate-800">{form.version || 'v1.0.0'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Created By</span>
            <span className="font-semibold text-slate-800">{form.createdBy || 'D. Engineer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Modified</span>
            <span className="font-semibold text-slate-800">{form.lastModified || '2 min ago'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
