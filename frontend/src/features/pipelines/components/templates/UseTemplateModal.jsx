import React, { useState } from 'react';
import { Play, ArrowRight, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UseTemplateModal({ template, onClose, onConfirm, isInstantiating }) {
  const [pipelineName, setPipelineName] = useState(`Copy of ${template?.title || ''}`);
  const [description, setDescription] = useState(template?.description || '');
  const [validationError, setValidationError] = useState('');

  if (!template) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pipelineName.trim()) {
      setValidationError('Pipeline name is required.');
      return;
    }
    setValidationError('');
    onConfirm({
      name: pipelineName.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-1.5 inline-block">
              Instantiate Pipeline
            </span>
            <h2 className="text-xl font-bold text-slate-900">Create from Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Template Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start gap-3">
            <div className="p-2 rounded bg-blue-100 text-blue-700">
              <Layers className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{template.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-slate-600">
                <span>{template.nodesCount} Nodes</span>
                <span>•</span>
                <span>{template.category}</span>
                <span>•</span>
                <span>~{template.estimatedSetupTime} Setup</span>
              </div>
            </div>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                New Pipeline Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="Enter unique pipeline name..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs font-medium"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the purpose of this pipeline..."
                rows={3}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs resize-none"
              />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-900 flex items-start gap-2">
            <CheckCircle2 className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              All connector credentials and sensitive keys are sanitized and must be configured after creating the pipeline.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInstantiating}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="size-4" fill="currentColor" />
              {isInstantiating ? 'Creating...' : 'Create & Open Builder'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
