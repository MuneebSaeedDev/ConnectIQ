import React, { useState } from 'react';
import { Tag, Info, AlertCircle, X } from 'lucide-react';

export default function GeneralInfoSection({ form, updateField, addTag, removeTag }) {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Target Section Header */}
      <header className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">General Information</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Identify the purpose of this mapping logic
          </p>
        </div>
        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
          <Info className="size-4" />
        </div>
      </header>

      {/* Target Body Forms */}
      <div className="p-5 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Node Name */}
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="nodeName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Node Name
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="nodeName"
              type="text"
              value={form?.nodeName || ''}
              onChange={(e) => updateField('nodeName', e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow transition-colors shadow-2xs"
              placeholder="e.g. Map Customer Payload"
            />
            <p className="text-[11px] text-slate-500">Must be unique within the current pipeline graph.</p>
          </div>

          {/* Node Display Name */}
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="displayName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={form?.displayName || ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow transition-colors shadow-2xs"
              placeholder="Display Name in Studio"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 flex flex-col">
          <label htmlFor="description" className="text-xs font-semibold text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={form?.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow transition-colors resize-y shadow-2xs"
            placeholder="Explain the purpose of this mapping step and any specific business logic handled..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-2 flex flex-col">
          <label htmlFor="tags" className="text-xs font-semibold text-slate-700">
            Tags / Labels
          </label>

          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {(form?.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
              >
                <Tag className="size-3 text-slate-400" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="relative">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              onBlur={handleAddTag}
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow transition-colors shadow-2xs"
              placeholder="Type a tag and press Enter"
            />
            <Tag className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-500">Provide context for teammates and auditors reviewing this pipeline.</p>
        </div>
      </div>
    </section>
  );
}
