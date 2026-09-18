import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Code,
  Shield,
  Key,
  Layers,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

export default function PipelineParametersScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pipelineId = id || 'pip_001';

  // State
  const [parameters, setParameters] = useState([
    {
      id: 'param_1',
      name: 'BATCH_SIZE',
      type: 'Integer',
      defaultValue: '5000',
      description: 'Number of rows to chunk per extraction batch',
      required: true,
      secure: false,
    },
    {
      id: 'param_2',
      name: 'TARGET_ENVIRONMENT',
      type: 'String',
      defaultValue: 'production',
      description: 'Environment identifier for downstream table partition prefixing',
      required: true,
      secure: false,
    },
    {
      id: 'param_3',
      name: 'ENCRYPTION_SECRET_KEY',
      type: 'Secret',
      defaultValue: '••••••••••••••••',
      description: 'Vault secret reference for column hashing salt',
      required: true,
      secure: true,
    },
    {
      id: 'param_4',
      name: 'ENABLE_DATA_CLEANING',
      type: 'Boolean',
      defaultValue: 'true',
      description: 'Whether to strip whitespace and normalize case on text fields',
      required: false,
      secure: false,
    },
  ]);

  const [newParam, setNewParam] = useState({
    name: '',
    type: 'String',
    defaultValue: '',
    description: '',
    required: false,
    secure: false,
  });

  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAddParameter = (e) => {
    e.preventDefault();
    if (!newParam.name.trim()) return;

    const formattedName = newParam.name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const paramObj = {
      id: `param_${Date.now()}`,
      name: formattedName,
      type: newParam.type,
      defaultValue: newParam.defaultValue,
      description: newParam.description,
      required: newParam.required,
      secure: newParam.secure,
    };

    setParameters([...parameters, paramObj]);
    setNewParam({
      name: '',
      type: 'String',
      defaultValue: '',
      description: '',
      required: false,
      secure: false,
    });
    showFeedback('success', `Parameter "${formattedName}" added.`);
  };

  const handleDeleteParameter = (idToDelete) => {
    setParameters(parameters.filter((p) => p.id !== idToDelete));
    showFeedback('info', 'Parameter removed.');
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showFeedback('success', 'Runtime parameter matrix saved successfully.');
    }, 600);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Parameters']}>
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <Info className="size-4 text-blue-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Sliders className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-slate-900">Pipeline Runtime Parameters</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {parameters.length} Parameter{parameters.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure runtime arguments, environment flags, secure variables, and dynamic inputs injected into pipeline tasks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="size-3.5" />
              {isSaving ? 'Saving...' : 'Save Parameters'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* 1. Add New Parameter Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="size-4 text-blue-600" />
            Add Runtime Parameter
          </h2>

          <form onSubmit={handleAddParameter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parameter Key
              </label>
              <input
                type="text"
                required
                value={newParam.name}
                onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                placeholder="e.g. S3_BUCKET_NAME"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Type
              </label>
              <select
                value={newParam.type}
                onChange={(e) => setNewParam({ ...newParam, type: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="String">String</option>
                <option value="Integer">Integer</option>
                <option value="Boolean">Boolean</option>
                <option value="JSON">JSON / Object</option>
                <option value="Secret">Secret / Key</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Value
              </label>
              <input
                type={newParam.type === 'Secret' ? 'password' : 'text'}
                value={newParam.defaultValue}
                onChange={(e) => setNewParam({ ...newParam, defaultValue: e.target.value })}
                placeholder="Value..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newParam.description}
                onChange={(e) => setNewParam({ ...newParam, description: e.target.value })}
                placeholder="Operational purpose..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add Param
              </button>
            </div>
          </form>
        </div>

        {/* 2. Existing Parameters Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Declared Parameter Table</h2>
            <span className="text-xs text-slate-500">Accessible in node logic as <code className="text-blue-600 font-mono font-bold">$PARAMS.key</code></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Parameter Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Default Value</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Properties</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parameters.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.secure ? '••••••••' : p.defaultValue || '(none)'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {p.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {p.required && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            REQUIRED
                          </span>
                        )}
                        {p.secure && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            SECURE
                          </span>
                        )}
                        {!p.required && !p.secure && (
                          <span className="text-slate-400 text-[11px]">Optional</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteParameter(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Delete parameter"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
