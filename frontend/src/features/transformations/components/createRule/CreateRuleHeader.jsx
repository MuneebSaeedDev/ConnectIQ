import React from 'react';
import { ArrowLeft, Save, Sparkles, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateRuleHeader({ isEditMode, onSave, onSaveAsDraft, isSubmitting, onCancel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <Link
            to="/transformations/rules"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 transition"
            title="Back to rules list"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Transformation Rule' : 'Create Transformation Rule'}
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {isEditMode ? 'Editing' : 'New Rule'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure standard data operations, mapping logic, and formulas for reuse in pipeline execution nodes.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          Cancel
        </button>

        {!isEditMode && (
          <button
            type="button"
            onClick={onSaveAsDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            Save as Draft
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Rule' : 'Create & Publish Rule'}
        </button>
      </div>
    </div>
  );
}
