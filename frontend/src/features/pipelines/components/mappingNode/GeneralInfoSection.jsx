import React, { useState } from 'react';
import { X, Plus, Info, Clock, User, FileCode, CheckCircle2 } from 'lucide-react';

export default function GeneralInfoSection({
  form,
  updateField,
  addTag,
  removeTag,
}) {
  const [tagInput, setTagInput] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNameChange = (e) => {
    const val = e.target.value;
    updateField('nodeName', val);
    if (!val.trim()) {
      setNameError('Node name is required.');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(val)) {
      setNameError('Node name can only contain letters, numbers, underscores, and dashes.');
    } else {
      setNameError('');
    }
  };

  const handleAddTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden" aria-labelledby="general-info-heading">
      {/* Section Header with 01 Badge */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            01
          </span>
          <h2 id="general-info-heading" className="text-sm font-bold text-slate-900">
            General Information
          </h2>
        </div>

        {/* Metadata summary strip matching Figma 170:1605 */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Node Type:</span>
            <span className="font-semibold text-slate-700">{form.nodeType || 'MAPPING'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Version:</span>
            <span className="font-semibold text-slate-700">{form.version || '2.4.1'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Created by:</span>
            <span className="font-semibold text-slate-700">{form.createdBy || '[EMAIL_REDACTED]'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Modified:</span>
            <span className="font-semibold text-slate-700">{form.lastModified || '2026-08-07 14:32'}</span>
          </span>
        </div>
      </div>

      {/* Main Input Grid */}
      <div className="p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Node Name */}
          <div>
            <label htmlFor="nodeName" className="block font-semibold text-slate-700 mb-1">
              Node Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="nodeName"
              type="text"
              value={form.nodeName || ''}
              onChange={handleNameChange}
              placeholder="customer_field_mapper"
              className={`w-full h-8 px-2.5 font-mono text-xs text-slate-800 bg-white border ${
                nameError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
              } rounded shadow-sm focus:outline-none focus:ring-1`}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'nodeName-error' : undefined}
            />
            {nameError && (
              <p id="nodeName-error" className="mt-1 text-[11px] text-rose-600 font-medium">
                {nameError}
              </p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block font-semibold text-slate-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={form.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Customer Field Mapper"
              className="w-full h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Owner */}
          <div>
            <label htmlFor="owner" className="block font-semibold text-slate-700 mb-1">
              Owner
            </label>
            <input
              id="owner"
              type="text"
              value={form.owner || ''}
              onChange={(e) => updateField('owner', e.target.value)}
              placeholder="data-engineering-team"
              className="w-full h-8 px-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={2}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe what fields this mapping node transforms and any business routing logic..."
            className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tagInput" className="block font-semibold text-slate-700 mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded min-h-[36px]">
            {(form.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="size-3.5 rounded-full hover:bg-blue-200 inline-flex items-center justify-center text-blue-600 focus:outline-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))}
            <input
              id="tagInput"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTagKeyDown}
              placeholder="Add tag (press Enter)…"
              className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-700 px-1 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
