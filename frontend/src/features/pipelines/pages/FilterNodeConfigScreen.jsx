import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useFilterNodeConfig } from '../hooks/useFilterNodeConfig';
import FilterNodeHeader from '../components/filterNode/FilterNodeHeader';
import GeneralInfoSection from '../components/filterNode/GeneralInfoSection';
import InputDatasetSection from '../components/filterNode/InputDatasetSection';
import FilterModeSelector from '../components/filterNode/FilterModeSelector';
import FilterRulesSection from '../components/filterNode/FilterRulesSection';
import AdvancedExpressionSection from '../components/filterNode/AdvancedExpressionSection';
import DataPreviewSection from '../components/filterNode/DataPreviewSection';
import PerformanceOptimizationSection from '../components/filterNode/PerformanceOptimizationSection';
import RuntimeConfigSection from '../components/filterNode/RuntimeConfigSection';
import MonitoringAlertsSection from '../components/filterNode/MonitoringAlertsSection';
import AdvancedConfigSection from '../components/filterNode/AdvancedConfigSection';
import LiveValidationPanel from '../components/filterNode/LiveValidationPanel';
import FilterNodeSummaryRail from '../components/filterNode/FilterNodeSummaryRail';
import StickyFooterActionBar from '../components/filterNode/StickyFooterActionBar';
import DuplicateNodeModal from '../components/filterNode/DuplicateNodeModal';
import ViewSourceSchemaModal from '../components/filterNode/ViewSourceSchemaModal';
import DiscardChangesModal from '../components/filterNode/DiscardChangesModal';
import FixValidationModal from '../components/filterNode/FixValidationModal';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function FilterNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'pip_001';
  const nodeId = routeNodeId || 'node_filter_007';

  const {
    form,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,

    // Actions & Feedback
    actionFeedback,
    isSaving,
    isValidating,
    isPreviewing,
    validationSummary,
    previewTab,
    setPreviewTab,
    sampleLimit,
    setSampleLimit,
    evaluatedPreview,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    fixModalOpen,
    setFixModalOpen,
    activeFixItem,

    // Accordions
    monitoringOpen,
    setMonitoringOpen,
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    setLogic,
    toggleNotGroup,
    addRule,
    removeRule,
    updateRule,
    togglePerformanceOpt,
    toggleMonitoringChannel,
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateFilter,
    handlePreviewData,
    handleRefreshMetadata,
    handleDuplicate,
    handleOpenFix,
    handleApplyFix,
  } = useFilterNodeConfig(nodeId, pipelineId);

  const handleCancelClick = () => {
    if (isDirty) {
      setDiscardModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Filter Node', 'Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading filter node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Filter Node', 'Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load filter node</h2>
          <p className="text-xs text-rose-700">{error?.message || 'An error occurred while fetching node configuration.'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Filter Node', 'Configuration']}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Sticky Header */}
        <FilterNodeHeader
          nodeName={form.nodeName}
          isDirty={isDirty}
          unsavedChangesCount={unsavedChangesCount}
          onReset={handleReset}
          onDuplicate={() => setDuplicateModalOpen(true)}
          onCancel={handleCancelClick}
          onValidate={handleValidateFilter}
          onSave={handleSave}
          isSaving={isSaving}
          isValidating={isValidating}
        />

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : actionFeedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
              {actionFeedback.type === 'error' && <AlertCircle className="size-4 text-rose-600 shrink-0" />}
              {actionFeedback.type === 'info' && <Info className="size-4 text-blue-600 shrink-0" />}
              <span>{actionFeedback.message}</span>
            </div>
            {form.mocked && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current">
                Sample data
              </span>
            )}
          </div>
        )}

        {/* Screen Reader Live Region */}
        <div className="sr-only" role="status" aria-live="polite">
          {isDirty ? `${unsavedChangesCount} unsaved changes in Filter Node Configuration.` : 'All changes saved.'}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto" role="main">
          <div className="flex flex-col xl:flex-row items-start gap-6">
            {/* Left Main Form Column */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* 1. General Information */}
              <GeneralInfoSection
                form={form}
                updateField={updateField}
                addTag={addTag}
                removeTag={removeTag}
              />

              {/* 2. Input Dataset */}
              <InputDatasetSection
                inputDataset={form.inputDataset}
                onRefreshMetadata={handleRefreshMetadata}
                onViewSourceSchema={() => setViewSchemaModalOpen(true)}
              />

              {/* 3. Filter Mode */}
              <FilterModeSelector
                filterMode={form.filterMode}
                onSelectMode={(mode) => updateField('filterMode', mode)}
              />

              {/* 4. Filter Rules (Basic Mode) or Advanced Editors */}
              {form.filterMode === 'basic' ? (
                <FilterRulesSection
                  basicRules={form.basicRules}
                  inputSchema={form.inputDataset?.columns || []}
                  setLogic={setLogic}
                  toggleNotGroup={toggleNotGroup}
                  addRule={addRule}
                  removeRule={removeRule}
                  updateRule={updateRule}
                />
              ) : (
                <AdvancedExpressionSection
                  filterMode={form.filterMode}
                  form={form}
                  updateField={updateField}
                />
              )}

              {/* 5. Data Preview */}
              <DataPreviewSection
                previewData={evaluatedPreview}
                previewTab={previewTab}
                setPreviewTab={setPreviewTab}
                sampleLimit={sampleLimit}
                setSampleLimit={setSampleLimit}
                onRefreshPreview={handlePreviewData}
                isPreviewing={isPreviewing}
              />

              {/* 6. Performance Optimization */}
              <PerformanceOptimizationSection
                performanceOpt={form.performanceOpt}
                togglePerformanceOpt={togglePerformanceOpt}
              />

              {/* 7. Runtime Configuration */}
              <RuntimeConfigSection
                runtimeConfig={form.runtimeConfig}
                updateNestedField={updateNestedField}
              />

              {/* 8. Monitoring & Alerts (Collapsible) */}
              <MonitoringAlertsSection
                monitoring={form.monitoring}
                updateNestedField={updateNestedField}
                toggleMonitoringChannel={toggleMonitoringChannel}
                isOpen={monitoringOpen}
                onToggleOpen={() => setMonitoringOpen((v) => !v)}
              />

              {/* 9. Advanced Configuration (Collapsible) */}
              <AdvancedConfigSection
                advancedConfig={form.advancedConfig}
                updateNestedField={updateNestedField}
                isOpen={advancedOpen}
                onToggleOpen={() => setAdvancedOpen((v) => !v)}
              />

              {/* 10. Live Validation Panel */}
              <LiveValidationPanel
                validationSummary={validationSummary}
                onOpenFix={handleOpenFix}
              />
            </div>

            {/* Right Summary Sidebar Rail */}
            <FilterNodeSummaryRail
              form={form}
              validationSummary={validationSummary}
              onSave={handleSave}
              onValidate={handleValidateFilter}
              isSaving={isSaving}
            />
          </div>
        </main>

        {/* Sticky Footer Action Bar matching Figma 157:4453 */}
        <StickyFooterActionBar
          isDirty={isDirty}
          lastSaved={form.lastSaved}
          onCancel={handleCancelClick}
          onSaveDraft={handleSaveDraft}
          onValidate={handleValidateFilter}
          onPreviewData={handlePreviewData}
          onApplyConfig={handleSave}
          isSaving={isSaving}
          isValidating={isValidating}
          isPreviewing={isPreviewing}
        />

        {/* Modals & Dialogs */}
        <DuplicateNodeModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          onConfirm={handleDuplicate}
          currentNodeName={form.nodeName}
        />

        <ViewSourceSchemaModal
          isOpen={viewSchemaModalOpen}
          onClose={() => setViewSchemaModalOpen(false)}
          inputDataset={form.inputDataset}
        />

        <DiscardChangesModal
          isOpen={discardModalOpen}
          onClose={() => setDiscardModalOpen(false)}
          onConfirm={handleConfirmDiscard}
          unsavedCount={unsavedChangesCount}
        />

        <FixValidationModal
          isOpen={fixModalOpen}
          onClose={() => setFixModalOpen(false)}
          checkItem={activeFixItem}
          onApplyFix={handleApplyFix}
        />
      </div>
    </AppShell>
  );
}
