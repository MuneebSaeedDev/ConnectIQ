import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function CreateCleaningRuleDrawer({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Text Cleaning');
  const [subType, setSubType] = useState('trim_whitespace');
  const [targetField, setTargetField] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic parameters based on category/type
  const [trimLeading, setTrimLeading] = useState(true);
  const [trimTrailing, setTrimTrailing] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [casingType, setCasingType] = useState('lowercase');
  const [nullCondition, setNullCondition] = useState('isNullOrEmpty');
  const [nullDefaultValue, setNullDefaultValue] = useState('');
  const [dateFormatInput, setDateFormatInput] = useState('Auto-detect');
  const [dateFormatOutput, setDateFormatOutput] = useState('YYYY-MM-DDTHH:mm:ssZ');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !targetField.trim()) return;

    setIsSubmitting(true);
    const newRule = {
      name,
      description,
      category,
      subType,
      targetField,
      status,
      parameters: {
        trimLeading,
        trimTrailing,
        collapseSpaces,
        casingType,
        nullCondition,
        nullDefaultValue,
        dateFormatInput,
        dateFormatOutput,
      },
    };

    setTimeout(() => {
      onCreate(newRule);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <form
            onSubmit={handleSubmit}
            className="pointer-events-auto w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Create Data Cleaning Rule
                  </h2>
                  <p className="text-xs text-slate-500">Configure new reusable ETL cleansing policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-500 rounded-md focus:outline-none"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Basic Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Rule Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Trim Leading and Trailing Whitespace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Explain the purpose and cleaning operation of this rule..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                  />
                </div>
              </div>

              {/* Categorization and Target */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Category & Target Field
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="Text Cleaning">Text Cleaning</option>
                      <option value="Null / Missing Data">Null / Missing Data</option>
                      <option value="Duplicate Handling">Duplicate Handling</option>
                      <option value="Formatting">Formatting</option>
                      <option value="Data Type Cleaning">Data Type Cleaning</option>
                      <option value="Custom Rules">Custom Rules</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700">Target Field *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. customer_name"
                      value={targetField}
                      onChange={(e) => setTargetField(e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Cleaning Rule Options */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Cleansing Parameters
                </h3>

                {category === 'Text Cleaning' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trimLeading}
                        onChange={(e) => setTrimLeading(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-700">Trim leading whitespace</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trimTrailing}
                        onChange={(e) => setTrimTrailing(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-700">Trim trailing whitespace</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={collapseSpaces}
                        onChange={(e) => setCollapseSpaces(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-700">Collapse multiple inner spaces</span>
                    </label>
                  </div>
                )}

                {category === 'Null / Missing Data' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Null Condition</label>
                      <select
                        value={nullCondition}
                        onChange={(e) => setNullCondition(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="isNullOrEmpty">Is Null or Empty String</option>
                        <option value="isNullOnly">Is Null Only</option>
                        <option value="isEmptyOnly">Is Empty String Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Fallback Default Value</label>
                      <input
                        type="text"
                        placeholder="e.g. N/A or US"
                        value={nullDefaultValue}
                        onChange={(e) => setNullDefaultValue(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}

                {category === 'Formatting' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Standardized Target Format</label>
                      <select
                        value={dateFormatOutput}
                        onChange={(e) => setDateFormatOutput(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="YYYY-MM-DDTHH:mm:ssZ">ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)</option>
                        <option value="YYYY-MM-DD">Standard Date (YYYY-MM-DD)</option>
                        <option value="E.164">Phone International (E.164)</option>
                        <option value="LOWERCASE_EMAIL">Sanitized Lowercase Email</option>
                      </select>
                    </div>
                  </div>
                )}

                {category !== 'Text Cleaning' && category !== 'Null / Missing Data' && category !== 'Formatting' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
                    Standard cleaning operations will be applied using platform transformation rules.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name || !targetField}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Creating Rule...' : 'Save & Activate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
