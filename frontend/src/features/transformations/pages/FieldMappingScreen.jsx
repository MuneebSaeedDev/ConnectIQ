import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useFieldMapping } from '../hooks/useFieldMapping';
import MappingNodeHeader from '../components/fieldMapping/MappingNodeHeader';
import GeneralInfoSection from '../components/fieldMapping/GeneralInfoSection';
import InputTargetSchemasSection from '../components/fieldMapping/InputTargetSchemasSection';
import AutoMappingSection from '../components/fieldMapping/AutoMappingSection';
import MappingWorkspaceSection from '../components/fieldMapping/MappingWorkspaceSection';
import TransformationConfigSection from '../components/fieldMapping/TransformationConfigSection';
import DataTypeAndNullSection from '../components/fieldMapping/DataTypeAndNullSection';
import DataPreviewSection from '../components/fieldMapping/DataPreviewSection';
import RuntimeAndMonitoringSection from '../components/fieldMapping/RuntimeAndMonitoringSection';
import AdvancedConfigSection from '../components/fieldMapping/AdvancedConfigSection';
import LiveValidationPanel from '../components/fieldMapping/LiveValidationPanel';
import MappingNodeSummaryRail from '../components/fieldMapping/MappingNodeSummaryRail';
import StickyFooterActionBar from '../components/fieldMapping/StickyFooterActionBar';
import AddMappingModal from '../components/fieldMapping/AddMappingModal';
import PreviewMatchesModal from '../components/fieldMapping/PreviewMatchesModal';
import DuplicateNodeModal from '../components/fieldMapping/DuplicateNodeModal';
import DiscardChangesModal from '../components/fieldMapping/DiscardChangesModal';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function FieldMappingScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'customer-etl-v2';
  const nodeId = routeNodeId || 'map_node_0041';

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
    previewTab,
    setPreviewTab,
    previewLimit,
    setPreviewLimit,
    selectedMappingId,
    setSelectedMappingId,
    selectedMapping,
    computedSummary,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    addMappingModalOpen,
    setAddMappingModalOpen,
    autoMapModalOpen,
    setAutoMapModalOpen,

    // Accordions
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    toggleAutoMapOption,
    addMappingItem,
    updateMappingItem,
    removeMappingItem,
    clearAllMappings,
    applyAutoMatches,
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateMapping,
    handlePreviewData,
    handleDuplicate,
    handleFixValidation,
  } = useFieldMapping(nodeId, pipelineId);

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

  const handleFieldClick = (side, field) => {
    // When clicking a source or target field in schemas, open add mapping modal
    setAddMappingModalOpen(true);
  };

  if (isLoading) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Mapping Node', 'Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading mapping node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Mapping Node', 'Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load mapping node</h2>
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
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Mapping Node', 'Configuration']}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Header */}
        <MappingNodeHeader
          nodeName={form.nodeName}
          version={form.version}
          status={form.status}
          isDirty={isDirty}
          unsavedChangesCount={unsavedChangesCount}
          onReset={handleReset}
          onDuplicate={() => setDuplicateModalOpen(true)}
          onCancel={handleCancelClick}
          onValidate={handleValidateMapping}
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
          {isDirty ? `${unsavedChangesCount} unsaved changes in Mapping Node Configuration.` : 'All changes saved.'}
        </div>

        {/* Main Content Layout */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto" role="main">
          <div className="flex flex-col xl:flex-row items-start gap-6">
            {/* Left Form Zones (Sections 01 - 15) */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* 01 General Information */}
              <GeneralInfoSection
                form={form}
                updateField={updateField}
                addTag={addTag}
                removeTag={removeTag}
              />

              {/* 02 Input Schema & 03 Target Schema */}
              <InputTargetSchemasSection
                inputSchema={form.inputSchema}
                targetSchema={form.targetSchema}
                mappings={form.mappings}
                onRefreshInput={handlePreviewData}
                onRefreshTarget={handleValidateMapping}
                onFieldClick={handleFieldClick}
              />

              {/* 05 Auto Mapping */}
              <AutoMappingSection
                config={form.autoMappingConfig}
                onToggleOption={toggleAutoMapOption}
                onPreviewMatches={() => setAutoMapModalOpen(true)}
                onApplyMatches={applyAutoMatches}
              />

              {/* 04 Mapping Workspace */}
              <MappingWorkspaceSection
                mappings={form.mappings}
                selectedMappingId={selectedMappingId}
                onSelectMapping={setSelectedMappingId}
                onAddMapping={() => setAddMappingModalOpen(true)}
                onAutoMap={() => setAutoMapModalOpen(true)}
                onClearAll={clearAllMappings}
                onEditMapping={(m) => setSelectedMappingId(m.id)}
                onDuplicateMapping={(m) => addMappingItem({ ...m, targetField: `${m.targetField}_copy` })}
                onRemoveMapping={removeMappingItem}
              />

              {/* 06 Transformation Configuration */}
              <TransformationConfigSection
                transformationConfig={form.transformationConfig}
                selectedMapping={selectedMapping}
                updateTransformationConfig={(field, val) => updateNestedField('transformationConfig', field, val)}
                onApplyExpression={(expr) => {
                  if (selectedMappingId) {
                    updateMappingItem(selectedMappingId, { transformation: expr, mappingType: 'Expression' });
                  }
                }}
              />

              {/* 08 Data Type Conversion & 09 Null & Default Handling */}
              <DataTypeAndNullSection
                dataTypeConversion={form.dataTypeConversion}
                nullHandling={form.nullHandling}
                updateDataTypeConversion={(field, val) => updateNestedField('dataTypeConversion', field, val)}
                updateNullHandling={(field, val) => updateNestedField('nullHandling', field, val)}
              />

              {/* 12 Data Preview */}
              <DataPreviewSection
                dataPreview={form.dataPreview}
                previewTab={previewTab}
                setPreviewTab={setPreviewTab}
                previewLimit={previewLimit}
                setPreviewLimit={setPreviewLimit}
                onRefresh={handlePreviewData}
                onRunPreview={handlePreviewData}
                isPreviewing={isPreviewing}
              />

              {/* 13 Runtime Configuration & 14 Monitoring */}
              <RuntimeAndMonitoringSection
                runtimeConfig={form.runtimeConfig}
                monitoring={form.monitoring}
                updateRuntimeConfig={(field, val) => updateNestedField('runtimeConfig', field, val)}
                updateMonitoring={(field, val) => updateNestedField('monitoring', field, val)}
              />

              {/* 15 Advanced Configuration */}
              <AdvancedConfigSection
                advancedConfig={form.advancedConfig}
                updateAdvancedConfig={(field, val) => updateNestedField('advancedConfig', field, val)}
                isOpen={advancedOpen}
                onToggle={() => setAdvancedOpen((prev) => !prev)}
              />

              {/* Bottom Live Validation Inspector Panel */}
              <LiveValidationPanel
                validationChecks={form.validationChecks}
                dataPreview={form.dataPreview}
                onFixIssue={handleFixValidation}
                onRunValidation={handleValidateMapping}
                isValidating={isValidating}
              />
            </div>

            {/* Right Summary Sidebar Rail */}
            <MappingNodeSummaryRail
              summary={computedSummary}
              nodeId={form.nodeId}
              pipelineId={form.pipelineId}
              stageNumber={form.stageNumber}
              totalStages={form.totalStages}
              onRunValidation={handleValidateMapping}
              isValidating={isValidating}
            />
          </div>
        </main>

        {/* Bottom Sticky Action Bar */}
        <StickyFooterActionBar
          isDirty={isDirty}
          lastSaved={form.lastSaved}
          onCancel={handleCancelClick}
          onSaveDraft={handleSaveDraft}
          onValidate={handleValidateMapping}
          onPreview={handlePreviewData}
          onApplyConfiguration={handleSave}
          isSaving={isSaving}
          isValidating={isValidating}
          isPreviewing={isPreviewing}
        />

        {/* Modal Dialogs */}
        <AddMappingModal
          isOpen={addMappingModalOpen}
          onClose={() => setAddMappingModalOpen(false)}
          onAdd={addMappingItem}
          inputFieldOptions={form.inputSchema?.fields || []}
          targetFieldOptions={form.targetSchema?.fields || []}
        />

        <PreviewMatchesModal
          isOpen={autoMapModalOpen}
          onClose={() => setAutoMapModalOpen(false)}
          onApply={applyAutoMatches}
          sourceFields={form.inputSchema?.fields || []}
          targetFields={form.targetSchema?.fields || []}
          autoMappingConfig={form.autoMappingConfig}
        />

        <DuplicateNodeModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          onDuplicate={handleDuplicate}
          currentNodeName={form.nodeName}
        />

        <DiscardChangesModal
          isOpen={discardModalOpen}
          onClose={() => setDiscardModalOpen(false)}
          onConfirmDiscard={handleConfirmDiscard}
        />
      </div>
    </AppShell>
  );
}
