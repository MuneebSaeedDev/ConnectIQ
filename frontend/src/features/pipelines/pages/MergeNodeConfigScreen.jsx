import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useMergeNodeConfig } from '../hooks/useMergeNodeConfig';
import MergeNodeHeader from '../components/mergeNode/MergeNodeHeader';
import GeneralInfoSection from '../components/mergeNode/GeneralInfoSection';
import InputStreamsSection from '../components/mergeNode/InputStreamsSection';
import JoinStrategySection from '../components/mergeNode/JoinStrategySection';
import JoinConditionsSection from '../components/mergeNode/JoinConditionsSection';
import FieldMappingSection from '../components/mergeNode/FieldMappingSection';
import ConflictResolutionSection from '../components/mergeNode/ConflictResolutionSection';
import DeduplicationSection from '../components/mergeNode/DeduplicationSection';
import PerformanceBufferSection from '../components/mergeNode/PerformanceBufferSection';
import SummaryRail from '../components/mergeNode/SummaryRail';
import TestExecutionSection from '../components/mergeNode/TestExecutionSection';
import StickyFooterActionBar from '../components/mergeNode/StickyFooterActionBar';
import DuplicateNodeModal from '../components/mergeNode/DuplicateNodeModal';
import DiscardChangesModal from '../components/mergeNode/DiscardChangesModal';
import ViewSourceSchemaModal from '../components/mergeNode/ViewSourceSchemaModal';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function MergeNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'customer-etl-pipeline';
  const nodeId = routeNodeId || 'mrg_node_0072';

  const {
    form,

    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,

    actionFeedback,
    isSaving,
    isValidating,
    isTesting,
    validationReport,
    testResults,

    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,

    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addJoinCondition,
    removeJoinCondition,
    updateFieldMapping,

    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateJoin,
    handleRunTest,
    handleDuplicate,
  } = useMergeNodeConfig(nodeId, pipelineId);

  const handleCancelClick = () => {
    if (isDirty) {
      setDiscardModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Nodes', 'Merge Node Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading merge node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Nodes', 'Merge Node Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load Merge Node</h2>
          <p className="text-xs text-rose-700">{error?.message || 'Error communicating with configuration service'}</p>
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
    <AppShell breadcrumb={[]}>
      {/* Toast Notification */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : actionFeedback.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {actionFeedback.type === 'success' && <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />}
          {actionFeedback.type === 'warning' && <AlertCircle className="size-4.5 text-amber-600 shrink-0" />}
          {actionFeedback.type === 'error' && <AlertCircle className="size-4.5 text-rose-600 shrink-0" />}
          {actionFeedback.type === 'info' && <Info className="size-4.5 text-blue-600 shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <MergeNodeHeader
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        isSaving={isSaving}
        isTesting={isTesting}
        isValidating={isValidating}
        onCancel={handleCancelClick}
        onReset={handleReset}
        onDuplicate={() => setDuplicateModalOpen(true)}
        onValidate={handleValidateJoin}
        onSave={handleSave}
      />

      {/* Main 2-Column Canvas Layout */}
      <main className="max-w-[1920px] mx-auto px-6 py-6 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">

          {/* Main Content Column */}
          <div className="space-y-6 min-w-0">
            {/* 01. General Info */}
            <GeneralInfoSection
              form={form}
              updateField={updateField}
              addTag={addTag}
              removeTag={removeTag}
            />

            {/* 02. Input Streams */}
            <InputStreamsSection
              primaryStream={form.primaryStream}
              secondaryStream={form.secondaryStream}
              onViewSchema={(side) => setViewSchemaModalOpen(side)}
              onRefreshSchemas={() => {/* refresh stream logic */}}
            />

            {/* 03. Merge Strategy */}
            <JoinStrategySection
              selectedStrategy={form.strategy}
              onSelectStrategy={(val) => updateField('strategy', val)}
            />

            {/* 04. Join Conditions */}
            <JoinConditionsSection
              conditions={form.joinConditions}
              primaryStream={form.primaryStream}
              secondaryStream={form.secondaryStream}
              mismatchHandling={form.joinMismatchHandling}
              onAddCondition={addJoinCondition}
              onRemoveCondition={removeJoinCondition}
              onUpdateCondition={(idx, field, val) => {
                 const updated = [...form.joinConditions];
                 updated[idx] = { ...updated[idx], [field]: val };
                 updateField('joinConditions', updated);
              }}
              onUpdateMismatchHandling={(val) => updateField('joinMismatchHandling', val)}
            />

            {/* 05. Output Collision & Matrix */}
            <FieldMappingSection
              fieldMappings={form.fieldMappings}
              conflictResolution={form.conflictResolution}
              leftPrefix={form.leftPrefix}
              rightPrefix={form.rightPrefix}
              updateNestedField={(parent, field, val) => {
                 // Hack for top-level fields passed to this section
                 if (!parent) updateField(field, val);
                 else updateNestedField(parent, field, val);
              }}
              updateFieldMapping={updateFieldMapping}
            />

            {/* 06. Deduplication */}
            <DeduplicationSection
              deduplication={form.deduplication}
              updateNestedField={updateNestedField}
            />

            {/* 07. Performance & Tuning */}
            <PerformanceBufferSection
              performance={form.performance}
              monitoring={form.monitoring}
              updateNestedField={updateNestedField}
            />

            {/* 08. Dry Run */}
            <TestExecutionSection
              isTesting={isTesting}
              testResults={testResults}
              onRunTest={handleRunTest}
            />
          </div>

          {/* Right Rail */}
          <div className="hidden xl:block">
             <SummaryRail
                form={form}
                isTesting={isTesting}
                isValidating={isValidating}
                onRunTest={handleRunTest}
                onValidate={handleValidateJoin}
             />
          </div>

        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <StickyFooterActionBar
        isDirty={isDirty}
        lastSaved="2026-09-18 16:45:00"
        onCancel={handleCancelClick}
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidateJoin}
        onPreviewData={() => handleRunTest(50)}
        onApplyConfig={handleSave}
        isSaving={isSaving}
        isValidating={isValidating}
        isPreviewing={isTesting}
      />

      {/* Modals */}
      <DuplicateNodeModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onConfirm={handleDuplicate}
        currentNodeName={form.nodeName}
      />

      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={() => {
          setDiscardModalOpen(false);
          navigate(-1);
        }}
        unsavedCount={unsavedChangesCount}
      />

      <ViewSourceSchemaModal
        isOpen={Boolean(viewSchemaModalOpen)}
        onClose={() => setViewSchemaModalOpen(false)}
        inputDataset={viewSchemaModalOpen === 'primary' ? form.primaryStream : form.secondaryStream}
      />

    </AppShell>
  );
}
