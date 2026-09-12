import React, { useState } from 'react';
import {
  CATEGORIES,
  ENVIRONMENTS,
  OWNERS,
} from '../../services/sourceNodeConfig.api';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GeneralInfoSection({
  form,
  updateField,
  addTag,
  removeTag,
}) {
  const [tagInputText, setTagInputText] = useState('');
  const isNodeNameValid = Boolean(form.nodeName && form.nodeName.trim().length > 0);

  const handleKeyDownTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInputText.trim()) {
        addTag(tagInputText);
        setTagInputText('');
      }
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="general-info-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          1
        </div>
        <div>
          <h2 id="general-info-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            General Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Node identity, classification, and ownership metadata
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Node Name & Display Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source-node-name" className="block text-xs font-medium text-slate-700 mb-1">
              Node Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="source-node-name"
                type="text"
                value={form.nodeName || ''}
                onChange={(e) => updateField('nodeName', e.target.value)}
                placeholder="e.g. source_node_001"
                aria-required="true"
                aria-invalid={!isNodeNameValid}
                aria-describedby={!isNodeNameValid ? 'node-name-error' : undefined}
                className={`w-full px-3 py-2 text-xs font-mono rounded-md border ${
                  isNodeNameValid
                    ? 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                {isNodeNameValid ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-3.5 text-rose-500" />
                )}
              </div>
            </div>
            {!isNodeNameValid && (
              <p id="node-name-error" className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium" role="alert">
                <X className="size-3" /> Node name is required
              </p>
            )}
          </div>

          <div>
            <label htmlFor="source-display-name" className="block text-xs font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              id="source-display-name"
              type="text"
              value={form.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="e.g. Customer Orders Source"
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Human-readable label shown in the pipeline canvas.
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="source-description" className="block text-xs font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            id="source-description"
            rows={2}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the purpose of this source node…"
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 3-Column Select Row: Category, Environment, Owner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="source-category" className="block text-xs font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              id="source-category"
              value={form.category || 'Data Ingestion'}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-environment" className="block text-xs font-medium text-slate-700 mb-1">
              Environment
            </label>
            <select
              id="source-environment"
              value={form.environment || 'Production'}
              onChange={(e) => updateField('environment', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.id} value={env.name}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-owner" className="block text-xs font-medium text-slate-700 mb-1">
              Owner
            </label>
            <select
              id="source-owner"
              value={form.owner || 'Priya S.'}
              onChange={(e) => updateField('owner', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {OWNERS.map((own) => (
                <option key={own.id} value={own.id}>
                  {own.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="source-tags" className="block text-xs font-medium text-slate-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-md border border-slate-300 bg-white min-h-[38px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            {(form.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="size-3.5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))}
            <input
              id="source-tags"
              type="text"
              value={tagInputText}
              onChange={(e) => setTagInputText(e.target.value)}
              onKeyDown={handleKeyDownTag}
              placeholder={(form.tags || []).length === 0 ? 'orders, customers, production…' : 'Add tag…'}
              className="flex-1 min-w-[120px] text-xs bg-transparent border-0 focus:outline-hidden focus:ring-0 p-0 text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Comma-separated tags for filtering and pipeline discovery.
          </p>
        </div>

        {/* Metadata Strip matching Figma node 155:2272 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Node Type
            </span>
            <span className="text-xs font-medium text-slate-800">
              {form.nodeType || 'Source'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Version
            </span>
            <span className="text-xs font-mono font-medium text-slate-800">
              {form.version || 'v2.4.1'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Created By
            </span>
            <span className="text-xs font-medium text-slate-800">
              {form.createdBy || 'Priya S.'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Last Modified
            </span>
            <span className="text-xs font-medium text-slate-800">
              {form.lastModified || '2 hr ago'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
