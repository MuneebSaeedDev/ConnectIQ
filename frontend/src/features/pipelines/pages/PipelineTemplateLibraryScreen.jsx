import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineTemplates } from '../hooks/usePipelineTemplates';
import { TEMPLATE_CATEGORIES } from '../services/pipelineTemplates.api';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreviewModal from '../components/templates/TemplatePreviewModal';
import UseTemplateModal from '../components/templates/UseTemplateModal';

import {
  LayoutTemplate,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  ChevronRight,
  Filter,
  Plus,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export default function PipelineTemplateLibraryScreen() {
  const navigate = useNavigate();
  const {
    templates,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    updateFilters,
    handleUseTemplate,
    isInstantiating,
    actionFeedback,
  } = usePipelineTemplates();

  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [instantiateTarget, setInstantiateTarget] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'newest', 'nodes'

  const sortedTemplates = [...templates].sort((a, b) => {
    if (sortBy === 'popular') return (b.usageCount || 0) - (a.usageCount || 0);
    if (sortBy === 'newest') return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    if (sortBy === 'nodes') return b.nodesCount - a.nodesCount;
    return 0;
  });

  const onConfirmUse = async (config) => {
    if (!instantiateTarget) return;
    const res = await handleUseTemplate(instantiateTarget, config);
    if (res && res.pipelineId) {
      setInstantiateTarget(null);
      setPreviewTemplate(null);
      setTimeout(() => {
        navigate(`/pipelines/${res.pipelineId}/builder`);
      }, 800);
    }
  };

  const handleCategoryToggle = (category) => {
    const current = filters.categories || [];
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updateFilters({ categories: next });
  };

  const handleOwnershipToggle = (type) => {
    const current = filters.ownership || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilters({ ownership: next });
  };

  const handleStatusToggle = (type) => {
    const current = filters.status || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFilters({ status: next });
  };

  const handleClearFilters = () => {
    updateFilters({
      search: '',
      categories: [],
      ownership: ['system', 'organization', 'personal'],
      status: ['active', 'draft']
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.ownership.length < 3 ||
    filters.status.includes('archived');

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Template Library']}>
      {/* Toast Notification */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150 ${
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

      {/* Screen Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-[1920px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="hover:text-slate-800 transition cursor-pointer" onClick={() => navigate('/pipelines')}>
                Pipelines
              </span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">Template Library</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                <LayoutTemplate className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">Pipeline Template Library</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Discover, preview, and build production-ready data pipelines from verified enterprise blueprints.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/pipelines/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="size-4" /> Create Custom Template
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex max-w-[1920px] mx-auto w-full min-h-[calc(100vh-140px)]">

        {/* Sidebar Filters (Desktop) */}
        <aside className="w-64 border-r border-slate-200 bg-white shrink-0 overflow-y-auto hidden lg:block p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5 text-slate-500" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Category
            </h4>
            <div className="space-y-1.5">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const checked = filters.categories.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCategoryToggle(cat)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-3.5"
                    />
                    <span className="flex-1 truncate">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ownership */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Ownership
            </h4>
            <div className="space-y-1.5">
              {[
                { id: 'system', label: 'System Blueprints' },
                { id: 'organization', label: 'Organization' },
                { id: 'personal', label: 'Personal (Mine)' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={filters.ownership.includes(item.id)}
                    onChange={() => handleOwnershipToggle(item.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-3.5"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Status
            </h4>
            <div className="space-y-1.5">
              {[
                { id: 'active', label: 'Active' },
                { id: 'draft', label: 'Drafts' },
                { id: 'archived', label: 'Archived' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(item.id)}
                    onChange={() => handleStatusToggle(item.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-3.5"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Feed */}
        <main className="flex-1 bg-slate-50/50 p-6 lg:p-8 overflow-y-auto">

          {/* Search & Sort Controls Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="size-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search templates by name, tags, connectors..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400 font-medium"
              />
            </div>

            {/* Sorting & Count */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-slate-900 font-bold">{sortedTemplates.length}</strong> templates
              </span>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Recently Updated</option>
                  <option value="nodes">Pipeline Complexity</option>
                </select>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <Filter className="size-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active:</span>

              {filters.search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Keyword: "{filters.search}"
                  <button onClick={() => updateFilters({ search: '' })} className="text-slate-400 hover:text-slate-600 font-bold">
                    ×
                  </button>
                </span>
              )}

              {filters.categories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs">
                  {c}
                  <button onClick={() => handleCategoryToggle(c)} className="text-blue-400 hover:text-blue-600 font-bold">
                    ×
                  </button>
                </span>
              ))}

              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 ml-2"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Results Grid / States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
              <Loader2 className="size-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-600">Loading pipeline catalog…</p>
            </div>
          ) : isError ? (
            <div className="p-8 max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3 shadow-sm">
              <AlertCircle className="size-8 text-rose-600 mx-auto" />
              <h2 className="text-sm font-bold text-rose-900">Failed to load templates</h2>
              <p className="text-xs text-rose-700">{error?.message || 'Error communicating with template registry service'}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Retry Request
              </button>
            </div>
          ) : sortedTemplates.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl bg-white p-12 text-center max-w-xl mx-auto mt-6 shadow-2xs">
              <div className="size-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <LayoutTemplate className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No templates matched your criteria</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
                Try refining your search keyword or clearing selected categories to see more pipeline templates.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClickDetails={setPreviewTemplate}
                  onUseTemplate={setInstantiateTarget}
                  isInstantiating={isInstantiating}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Details/Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={(t) => {
            setInstantiateTarget(t);
          }}
          isInstantiating={isInstantiating}
        />
      )}

      {/* Configuration & Use Template Modal */}
      {instantiateTarget && (
        <UseTemplateModal
          template={instantiateTarget}
          onClose={() => setInstantiateTarget(null)}
          onConfirm={onConfirmUse}
          isInstantiating={isInstantiating}
        />
      )}
    </AppShell>
  );
}
