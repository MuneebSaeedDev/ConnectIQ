import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, ArrowRight } from 'lucide-react';
import { COMMON_INPUT_FORMATS, COMMON_OUTPUT_FORMATS, SUPPORTED_TIMEZONES, SUPPORTED_LOCALES, INVALID_DATE_STRATEGIES, NULL_DATE_STRATEGIES, SUPPORTED_DATE_TYPES } from '../../services/dateFormatting.api';

export default function CreateDateFormattingRuleDrawer({ isOpen, onClose, onCreate }) {
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Date Normalization');
  const [inputType, setInputType] = useState('String');
  const [outputType, setOutputType] = useState('Date');
  const [inputFormat, setInputFormat] = useState('MM/DD/YYYY');
  const [outputFormat, setOutputFormat] = useState('YYYY-MM-DD');
  const [sourceTimezone, setSourceTimezone] = useState('UTC');
  const [targetTimezone, setTargetTimezone] = useState('UTC');
  const [locale, setLocale] = useState('en-US');
  const [targetField, setTargetField] = useState('');
  const [targetFields, setTargetFields] = useState(['order_date']);
  const [invalidDateBehavior, setInvalidDateBehavior] = useState('reject');
  const [nullDateBehavior, setNullDateBehavior] = useState('preserve');
  const [defaultValue, setDefaultValue] = useState('');
  const [tags, setTags] = useState('ETL, Standardization');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    if (targetField.trim() && !targetFields.includes(targetField.trim())) {
      setTargetFields([...targetFields, targetField.trim()]);
      setTargetField('');
    }
  };

  const handleRemoveField = (field) => {
    setTargetFields(targetFields.filter(f => f !== field));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    setIsSubmitting(true);
    const newRule = {
      ruleName,
      description,
      category,
      inputType,
      outputType,
      inputFormat,
      outputFormat,
      sourceTimezone,
      targetTimezone,
      locale,
      targetFields: targetFields.length > 0 ? targetFields : ['date_field'],
      invalidDateBehavior,
      nullDateBehavior,
      defaultValue: defaultValue || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'active'
    };

    try {
      await onCreate(newRule);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create Date Formatting Rule</h2>
              <p className="text-xs text-slate-500">Define reusable date standardization logic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Rule Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Rule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. Standardize Order Timestamps"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the purpose and expected behavior of this rule..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Type Mappings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_DATE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Output Type
              </label>
              <select
                value={outputType}
                onChange={(e) => setOutputType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_DATE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Formats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Input Format
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
              >
                {COMMON_INPUT_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
              >
                {COMMON_OUTPUT_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timezone & Locale */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Timezone
              </label>
              <select
                value={targetTimezone}
                onChange={(e) => setTargetTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Locale
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_LOCALES.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Fields
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add target field name (e.g. created_at)"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddField();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targetFields.map(f => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200">
                  {f}
                  <button type="button" onClick={() => handleRemoveField(f)} className="text-slate-400 hover:text-red-500">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Error & Null Handling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Invalid Date Action
              </label>
              <select
                value={invalidDateBehavior}
                onChange={(e) => setInvalidDateBehavior(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              >
                {INVALID_DATE_STRATEGIES.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Null Value Action
              </label>
              <select
                value={nullDateBehavior}
                onChange={(e) => setNullDateBehavior(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              >
                {NULL_DATE_STRATEGIES.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Orders, Timezone, UTC"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Rule...' : 'Save & Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}