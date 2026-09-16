import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineTemplates } from '../hooks/usePipelineTemplates';
import { TEMPLATE_CATEGORIES } from '../services/pipelineTemplates.api';
import {
  LayoutTemplate,
  Search,
  Sparkles,
  ArrowRight,
  Layers,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  ChevronRight
} from 'lucide-react';

export default function PipelineTemplateLibraryScreen() {
  const navigate = useNavigate();
  const {
    templates,
    isLoading,
    isError,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    handleUseTemplate,
    isInstantiating,
    actionFeedback,
  } = usePipelineTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const onConfirmUse = async (t) => {
    const res = await handleUseTemplate(t);
    if (res && res.pipelineId) {
      setTimeout(() => {
        navigate(`/pipelines/${res.pipelineId}/builder`);
      }, 1000);
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Template Library']}>
      {/* Toast Feedback */}
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
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
              <span className="hover:text-slate-800 transition cursor-pointer" onClick={() => navigate('/pipelines')}>Pipelines</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">Template Library</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <LayoutTemplate className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Pre-Built Pipeline Blueprints</h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="size-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, sources, nodes..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </header>

      {/* Category Pills Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
        <div className="max-w-[1920px] mx-auto flex items-center gap-2 overflow-x-auto">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
            <Loader2 className="size-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium text-slate-600">Loading pipeline templates…</p>
          </div>
        ) : isError ? (
          <div className="p-6 max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
            <AlertCircle className="size-8 text-rose-600 mx-auto" />
            <h2 className="text-sm font-bold text-rose-900">Failed to load templates</h2>
            <p className="text-xs text-rose-700">{error?.message || 'Error communicating with catalog service'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-700 border border-blue-100">
                      {template.category}
                    </span>
                    {template.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sparkles className="size-3 text-amber-500" /> Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {template.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3.5 text-slate-400" /> {template.nodesCount} Nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-slate-400" /> ~{template.estimatedSetupTime}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      {template.complexity}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onConfirmUse(template)}
                    disabled={isInstantiating}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition disabled:opacity-50"
                  >
                    Use this Blueprint <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
