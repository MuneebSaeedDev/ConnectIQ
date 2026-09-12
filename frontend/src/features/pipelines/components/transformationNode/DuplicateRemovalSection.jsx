import React, { useState } from 'react';
import { CopyX, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DuplicateRemovalSection({
  deduplication = {},
  datasetFields = [],
  onAddDeduplicationField,
  onRemoveDeduplicationField,
  onUpdateNestedField,
}) {
  const [selectedFieldToAdd, setSelectedFieldToAdd] = useState('');

  const handleAddField = () => {
    if (selectedFieldToAdd) {
      onAddDeduplicationField(selectedFieldToAdd);
      setSelectedFieldToAdd('');
    }
  };

  const fields = deduplication.fields || ['customer_id', 'email', 'order_date'];

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Duplicate Removal</h2>
        <p className="text-xs text-slate-500 mt-0.5">Deterministic duplicate detection and removal</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Fields used for duplicate detection */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Fields Used for Duplicate Detection
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {fields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200"
              >
                {field}
                <button
                  type="button"
                  onClick={() => onRemoveDeduplicationField(field)}
                  className="text-slate-400 hover:text-rose-600 focus:outline-none"
                  title={`Remove ${field}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center gap-1">
              <select
                value={selectedFieldToAdd}
                onChange={(e) => setSelectedFieldToAdd(e.target.value)}
                className="text-xs px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700"
              >
                <option value="">Select field...</option>
                {datasetFields
                  .filter((f) => !fields.includes(f.name))
                  .map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddField}
                disabled={!selectedFieldToAdd}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition disabled:opacity-40"
              >
                <Plus className="size-3" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Matching Strategy</label>
            <select
              value={deduplication.matchingStrategy || 'Exact Match'}
              onChange={(e) => onUpdateNestedField('deduplication', 'matchingStrategy', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              <option value="Exact Match">Exact Match</option>
              <option value="Fuzzy Match (Levenshtein)">Fuzzy Match (Levenshtein)</option>
              <option value="Case-Insensitive Match">Case-Insensitive Match</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Keep Strategy</label>
            <select
              value={deduplication.keepStrategy || 'First Record'}
              onChange={(e) => onUpdateNestedField('deduplication', 'keepStrategy', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              <option value="First Record">First Record</option>
              <option value="Last Record">Last Record</option>
              <option value="Highest Value Record">Highest Value Record</option>
              <option value="Drop All Duplicates">Drop All Duplicates</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Null Handling</label>
            <select
              value={deduplication.nullHandling || 'Treat as Distinct'}
              onChange={(e) => onUpdateNestedField('deduplication', 'nullHandling', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            >
              <option value="Treat as Distinct">Treat as Distinct</option>
              <option value="Treat as Match">Treat as Match</option>
              <option value="Ignore Null Keys">Ignore Null Keys</option>
            </select>
          </div>
        </div>

        {/* Estimated Stats Banner matching Figma 220:6614 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <span className="text-[11px] font-semibold text-amber-700 block">Estimated Duplicates</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-amber-900">
                {deduplication.estimatedDuplicates?.toLocaleString() || '3,241'}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                {deduplication.duplicatePercentage || '1.14% of input records'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[11px] font-semibold text-emerald-700 block">Estimated Unique</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-emerald-900">
                {deduplication.estimatedUnique?.toLocaleString() || '281,349'}
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                {deduplication.uniquePercentage || '98.86% retained'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
