import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineSettings } from '../hooks/usePipelineSettings';
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Server,
  Bell,
  Cpu,
  Shield,
  Tag as TagIcon,
  X,
  ChevronRight
} from 'lucide-react';

export default function PipelineSettingsScreen() {
  const { id: routePipelineId } = useParams();
  const navigate = useNavigate();
  const pipelineId = routePipelineId || 'pip_001';

  const {
    form,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    isSaving,
    actionFeedback,
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    handleSave,
    handleReset,
  } = usePipelineSettings(pipelineId);

  const [tagInput, setTagInput] = React.useState('');

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  if (isLoading) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Settings']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading pipeline settings…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Settings']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load Settings</h2>
          <p className="text-xs text-rose-700">{error?.message || 'Error communicating with settings service'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition"
          >
            Retry Loading
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', form.name || 'Pipeline', 'Settings']}>
      {/* Toast */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {actionFeedback.type === 'success' && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
          {actionFeedback.type === 'error' && <AlertCircle className="size-4 text-rose-600 shrink-0" />}
          {actionFeedback.type === 'info' && <Info className="size-4 text-blue-600 shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
              <span className="hover:text-slate-800 transition cursor-pointer" onClick={() => navigate('/pipelines')}>Pipelines</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">Settings</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Sliders className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">{form.name} Settings</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition shadow-2xs disabled:opacity-50"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-24">
        {/* General Details */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Server className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">General Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Owner</label>
                <input
                  type="text"
                  value={form.owner || ''}
                  onChange={(e) => updateField('owner', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <TagIcon className="size-3 text-slate-400" />
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-2 border border-slate-300 rounded-md bg-slate-50/50">
                {(form.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <form onSubmit={handleAddTagSubmit} className="inline-flex items-center">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="+ Add tag..."
                    className="px-2 py-1 text-xs bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 min-w-[100px]"
                  />
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Execution Profile */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Cpu className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Execution Profile & Resources</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Execution Engine</label>
              <select
                value={form.executionProfile?.engine || 'spark_distributed'}
                onChange={(e) => updateNestedField('executionProfile', 'engine', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="spark_distributed">Distributed Apache Spark</option>
                <option value="flink_stream">Apache Flink Real-time Stream</option>
                <option value="native_node">Node.js Low-Latency Ingest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timeout (Minutes)</label>
              <input
                type="number"
                value={form.executionProfile?.timeoutMinutes || 120}
                onChange={(e) => updateNestedField('executionProfile', 'timeoutMinutes', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Memory Allocation (MB)</label>
              <input
                type="number"
                step="512"
                value={form.resources?.memoryMb || 8192}
                onChange={(e) => updateNestedField('resources', 'memoryMb', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Notifications & Alerting */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Bell className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Alerting & Notification Rules</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.alerting?.onFailure || false}
                  onChange={(e) => updateNestedField('alerting', 'onFailure', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Alert on Execution Failure
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.alerting?.onStalled || false}
                  onChange={(e) => updateNestedField('alerting', 'onStalled', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Alert on Stalled Run (&gt; 30m no progress)
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.alerting?.onSuccess || false}
                  onChange={(e) => updateNestedField('alerting', 'onSuccess', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Alert on Successful Run
              </label>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
