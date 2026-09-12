import React, { useState } from 'react';
import { X, Plus, Workflow, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_PIPELINES = [
  { id: 'pipe-001', name: 'Customer Ingestion & Enrichment', env: 'Production', nodesCount: 6 },
  { id: 'pipe-002', name: 'Real-time Telemetry Stream', env: 'Production', nodesCount: 4 },
  { id: 'pipe-003', name: 'Warehouse Daily Sync', env: 'Staging', nodesCount: 8 },
  { id: 'pipe-004', name: 'Payment Transactions CDC', env: 'Production', nodesCount: 5 },
];

export default function AddToPipelineModal({
  isOpen,
  onClose,
  node,
}) {
  const navigate = useNavigate();
  const [selectedPipelineId, setSelectedPipelineId] = useState(SAMPLE_PIPELINES[0].id);

  if (!isOpen || !node) return null;

  const handleConfirm = () => {
    onClose();
    if (selectedPipelineId === 'new') {
      navigate('/pipelines/new');
    } else {
      navigate(`/pipelines/${selectedPipelineId}/builder`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-pipeline-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="add-pipeline-title" className="text-base font-bold text-slate-900">
                Add to Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Insert <strong>{node.name}</strong> into an existing workflow or create a new one.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of pipelines */}
        <div className="p-6 space-y-3 text-xs">
          <span className="font-semibold text-slate-700 block">Select Target Pipeline</span>

          <div className="space-y-2">
            {SAMPLE_PIPELINES.map((pipe) => {
              const isSelected = selectedPipelineId === pipe.id;
              return (
                <div
                  key={pipe.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPipelineId(pipe.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedPipelineId(pipe.id);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Workflow className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-xs">{pipe.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {pipe.env} · {pipe.nodesCount} active nodes
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </div>
              );
            })}

            {/* Create new pipeline option */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPipelineId('new')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedPipelineId('new');
              }}
              className={`p-3 rounded-xl border border-dashed flex items-center justify-between cursor-pointer transition-all ${
                selectedPipelineId === 'new'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-300 hover:border-slate-400 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-xs">Start a New Pipeline</span>
              </div>
              {selectedPipelineId === 'new' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Continue in Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
