import React from 'react';
import { TRANSFORMATION_CATEGORIES } from '../../services/transformationRules.api';

export default function RuleBasicInfoSection({ formData, handleChange, errors }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-800">1. Basic Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">Define identity, category, and scope of this rule.</p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600 transition-colors">
            Rule Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${errors.name ? 'ring-rose-300 focus:ring-rose-500 bg-rose-50/50' : 'ring-slate-300 focus:ring-blue-600'}`}
            placeholder="e.g., Email Normalization & Sanitization"
          />
          {errors.name && <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-rose-600"></span>{errors.name}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600 transition-colors">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={formData.description || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Briefly describe what this transformation rule handles..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-slate-700 mb-1.5 focus-within:text-blue-600 transition-colors">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category || 'General'}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            {TRANSFORMATION_CATEGORIES.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="isGlobal" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Rule Scope
          </label>
          <div className="flex items-center mt-3 gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isGlobal"
                value="false"
                checked={formData.isGlobal === false}
                onChange={() => handleChange({ target: { name: 'isGlobal', value: false }})}
                className="size-4 border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Organization (Private)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isGlobal"
                value="true"
                checked={formData.isGlobal === true}
                onChange={() => handleChange({ target: { name: 'isGlobal', value: true }})}
                className="size-4 border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Global (Shared)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
