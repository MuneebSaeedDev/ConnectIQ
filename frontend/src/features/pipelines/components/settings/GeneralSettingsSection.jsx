import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { PIPELINE_SETTINGS_OPTIONS } from '../../services/pipelineSettings.api';

export default function GeneralSettingsSection({ form, updateField, addTag, removeTag, validation }) {
  const [tagInput, setTagInput] = React.useState('');

  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 mb-6">
        <h3 className="text-sm font-semibold text-slate-900">General Information</h3>
        <p className="text-xs text-slate-500 mt-0.5">Pipeline identity, classification, and lifecycle controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="pipeline-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pipeline Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="pipeline-name"
            type="text"
            value={form.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validation?.errors?.name ? 'border-rose-300 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:border-blue-500 text-slate-900'
              }`}
            placeholder="e.g., Customer 360 Ingestion"
          />
          {validation?.errors?.name && (
            <p className="mt-1.5 text-[11px] font-medium text-rose-600">
              {validation.errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="pipeline-desc" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="pipeline-desc"
            rows={3}
            value={form.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y min-h-[80px]"
            placeholder="Briefly describe the purpose of this pipeline..."
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="pipeline-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Business Category
          </label>
          <select
            id="pipeline-category"
            value={form.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="" disabled>Select category...</option>
            {PIPELINE_SETTINGS_OPTIONS.categories.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Environment */}
        <div>
          <label htmlFor="pipeline-env" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Environment
          </label>
          <select
            id="pipeline-env"
            value={form.environment || ''}
            onChange={(e) => updateField('environment', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PIPELINE_SETTINGS_OPTIONS.environments.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Owner */}
        <div>
          <label htmlFor="pipeline-owner" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Primary Owner
          </label>
          <div className="relative">
            <select
              id="pipeline-owner"
              value={form.owner || ''}
              onChange={(e) => updateField('owner', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="" disabled>Assign owner...</option>
              {PIPELINE_SETTINGS_OPTIONS.owners.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="size-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700 uppercase tracking-tighter">
                {form.owner ? form.owner.charAt(0) : '?'}
              </div>
            </div>
            {/* Custom dropdown caret */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Operational Tags
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-colors">
            <div className="flex flex-wrap gap-1.5 items-center min-h-[28px]">
              {(form.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-white border border-slate-300 rounded shadow-2xs text-xs font-medium text-slate-700 group"
                >
                  <TagIcon className="size-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="p-0.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                    title={`Remove tag ${tag}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <form onSubmit={handleTagSubmit} className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={form.tags?.length > 0 ? "Add tag..." : "Type and press Enter to add tags..."}
                  className="w-full bg-transparent border-none p-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
