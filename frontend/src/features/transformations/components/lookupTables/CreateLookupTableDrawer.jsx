import React, { useState } from 'react';
import { X, Table, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function CreateLookupTableDrawer({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Key/Value');
  const [dataSource, setDataSource] = useState('Internal Managed');
  const [keyField, setKeyField] = useState('');
  const [returnFields, setReturnFields] = useState(['']);
  const [status, setStatus] = useState('Active');

  // Advanced match and missing lookup settings
  const [matchStrategy, setMatchStrategy] = useState('Exact');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [missingStrategy, setMissingStrategy] = useState('Return Null');
  const [missingDefaultValue, setMissingDefaultValue] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddReturnField = () => {
    setReturnFields([...returnFields, '']);
  };

  const handleRemoveReturnField = (index) => {
    if (returnFields.length > 1) {
      setReturnFields(returnFields.filter((_, i) => i !== index));
    }
  };

  const handleReturnFieldChange = (index, value) => {
    const updated = [...returnFields];
    updated[index] = value;
    setReturnFields(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !keyField.trim()) return;

    setIsSubmitting(true);
    const newTable = {
      name,
      description,
      type,
      dataSource,
      keyField,
      returnFields: returnFields.filter(f => f.trim() !== ''),
      status,
      matchStrategy,
      caseSensitive,
      trimWhitespace,
      missingStrategy,
      missingDefaultValue,
      records: 0,
      pipelinesCount: 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Current User'
    };

    setTimeout(() => {
      onCreate(newTable);
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
                  <Table className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Create Lookup Table
                  </h2>
                  <p className="text-xs text-slate-500">Configure new reference lookup dataset for pipeline transformations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Lookup Table Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Country Codes, Product Categories"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the reference data purpose and usage..."
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Lookup Type & Data Source */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type & Data Source
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Lookup Type</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Key/Value">Key/Value</option>
                      <option value="Multi-Column">Multi-Column</option>
                      <option value="Composite Key">Composite Key</option>
                      <option value="Range Lookup">Range Lookup</option>
                      <option value="Conditional">Conditional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Data Source</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={dataSource}
                      onChange={(e) => setDataSource(e.target.value)}
                    >
                      <option value="Internal Managed">Internal Managed</option>
                      <option value="Database (MySQL)">Database (MySQL)</option>
                      <option value="Database (PostgreSQL)">Database (PostgreSQL)</option>
                      <option value="MongoDB">MongoDB</option>
                      <option value="CSV Import">CSV Import</option>
                      <option value="Excel Import">Excel Import</option>
                      <option value="API">REST API Endpoint</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Key and Return Field Configuration */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Key & Output Fields
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Lookup Key Field *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iso_code, customer_id"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={keyField}
                    onChange={(e) => setKeyField(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">The column or attribute matched against pipeline input records.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700">Return Fields</label>
                    <button
                      type="button"
                      onClick={handleAddReturnField}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Add Field
                    </button>
                  </div>
                  <div className="space-y-2 mt-1.5">
                    {returnFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Return field ${idx + 1} (e.g. country_name)`}
                          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={field}
                          onChange={(e) => handleReturnFieldChange(idx, e.target.value)}
                        />
                        {returnFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReturnField(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match & Missing Logic */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Matching & Fallback Rules
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Match Strategy</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={matchStrategy}
                      onChange={(e) => setMatchStrategy(e.target.value)}
                    >
                      <option value="Exact">Exact Match</option>
                      <option value="Normalized">Normalized Match</option>
                      <option value="Range">Range Match</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Missing Key Action</label>
                    <select
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={missingStrategy}
                      onChange={(e) => setMissingStrategy(e.target.value)}
                    >
                      <option value="Return Null">Return Null</option>
                      <option value="Use Default">Use Default Value</option>
                      <option value="Keep Original">Keep Original Value</option>
                      <option value="Fail Node">Fail Node / Error</option>
                    </select>
                  </div>
                </div>

                {missingStrategy === 'Use Default' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Default Value</label>
                    <input
                      type="text"
                      placeholder="e.g. UNKNOWN, 0, N/A"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={missingDefaultValue}
                      onChange={(e) => setMissingDefaultValue(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trimWhitespace}
                      onChange={(e) => setTrimWhitespace(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700">Trim Whitespace</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700">Case Sensitive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !keyField.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Lookup Table'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
