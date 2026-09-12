import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useTransformationNodeConfig } from '../hooks/useTransformationNodeConfig';

// Subcomponents
import TransformationNodeHeader from '../components/transformationNode/TransformationNodeHeader';
import GeneralInfoSection from '../components/transformationNode/GeneralInfoSection';
import InputDatasetSection from '../components/transformationNode/InputDatasetSection';
import TransformationModeSelector from '../components/transformationNode/TransformationModeSelector';
import TransformationRulesSection from '../components/transformationNode/TransformationRulesSection';
import DataCleaningSection from '../components/transformationNode/DataCleaningSection';
import TypeConversionSection from '../components/transformationNode/TypeConversionSection';
import DateFormattingSection from '../components/transformationNode/DateFormattingSection';
import DuplicateRemovalSection from '../components/transformationNode/DuplicateRemovalSection';
import LookupTransformationSection from '../components/transformationNode/LookupTransformationSection';
import ExpressionEditorSection from '../components/transformationNode/ExpressionEditorSection';
import TransformationPreviewSection from '../components/transformationNode/TransformationPreviewSection';
import TransformationTestingSection from '../components/transformationNode/TransformationTestingSection';
import ValidationSection from '../components/transformationNode/ValidationSection';
import RuntimeConfigSection from '../components/transformationNode/RuntimeConfigSection';
import MonitoringSection from '../components/transformationNode/MonitoringSection';
import AdvancedConfigSection from '../components/transformationNode/AdvancedConfigSection';
import TransformationNodeSummaryRail from '../components/transformationNode/TransformationNodeSummaryRail';
import BottomTelemetryPanel from '../components/transformationNode/BottomTelemetryPanel';

// Modals
import DuplicateNodeModal from '../components/transformationNode/DuplicateNodeModal';
import ViewInputDataModal from '../components/transformationNode/ViewInputDataModal';
import DiscardChangesModal from '../components/transformationNode/DiscardChangesModal';
import AddRuleModal from '../components/transformationNode/AddRuleModal';
import FixValidationModal from '../components/transformationNode/FixValidationModal';

import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function TransformationNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'pip_001';
  const nodeId = routeNodeId || 'node_trans_008';

  const {
    form,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,

    // Status & Feedback
    actionFeedback,
    isSaving,
    isTesting,
    isRefreshing,
    summaries,

    // Tabs & View modes
    previewTab,
    setPreviewTab,
    testingMode,
    setTestingMode,
    bottomTab,
    setBottomTab,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    viewInputDataModalOpen,
    setViewInputDataModalOpen,
    addRuleModalOpen,
    setAddRuleModalOpen,
    fixValidationModalOpen,
    setFixValidationModalOpen,
    activeFixItem,

    // Accordions
    advancedAccordionOpen,
    setAdvancedAccordionOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addTransformationRule,
    removeTransformationRule,
    toggleRuleStatus,
    addDeduplicationField,
    removeDeduplicationField,
    toggleMonitoringOption,

    // Actions
    handleSaveConfig,
    handleResetConfig,
    handleRunTests,
    handleRefreshSchema,
    handleDuplicateNode,
    handleOpenFix,
    handleApplyFix,
  } = useTransformationNodeConfig(nodeId, pipelineId);

  const handleCancelClick = () => {
    if (isDirty) {
      setDiscardModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading Transformation Node Configuration…
          </p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto mt-12 p-6 bg-white border border-rose-200 rounded-xl shadow-sm text-center">
          <AlertCircle className="size-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Failed to Load Transformation Node</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {error?.message || 'Unable to retrieve node configuration.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Retry Loading
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-slate-100/70">
        {/* Top Header matching Figma 220:6006 */}
        <TransformationNodeHeader
          form={form}
          isDirty={isDirty}
          unsavedChangesCount={unsavedChangesCount}
          isSaving={isSaving}
          isTesting={isTesting}
          onCancel={handleCancelClick}
          onReset={handleResetConfig}
          onDuplicate={() => setDuplicateModalOpen(true)}
          onTest={handleRunTests}
          onSave={handleSaveConfig}
        />

        {/* Global Banner / Feedback Toast */}
        {actionFeedback && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold transition-all duration-200 animate-in slide-in-from-bottom-5 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-900 text-white'
                : actionFeedback.type === 'error'
                ? 'bg-rose-900 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-400" />
            ) : actionFeedback.type === 'error' ? (
              <AlertCircle className="size-4 text-rose-400" />
            ) : (
              <Info className="size-4 text-blue-400" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {/* Main Content Area matching Figma Grid 1448px (Left Column) + 220px (Right Rail) */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-5 space-y-4">
          <div className="flex flex-col xl:flex-row items-start gap-4">
            {/* Left 1448px Column */}
            <div className="flex-1 w-full min-w-0 space-y-4">
              {/* Section 1: General Information (Figma 220:6029) */}
              <GeneralInfoSection
                form={form}
                updateField={updateField}
                addTag={addTag}
                removeTag={removeTag}
              />

              {/* Section 2: Input Dataset (Figma 220:6101) */}
              <InputDatasetSection
                dataset={form.inputDataset}
                isRefreshing={isRefreshing}
                onRefreshSchema={handleRefreshSchema}
                onViewInputData={() => setViewInputDataModalOpen(true)}
              />

              {/* Section 3: Transformation Mode (Figma 220:6217) */}
              <TransformationModeSelector
                activeMode={form.activeMode}
                onSelectMode={(modeId) => updateField('activeMode', modeId)}
              />

              {/* Section 4: Transformation Rules (Figma 220:6241) */}
              <TransformationRulesSection
                rules={form.transformationRules}
                onAddRuleClick={() => setAddRuleModalOpen(true)}
                onRemoveRule={removeTransformationRule}
                onToggleStatus={toggleRuleStatus}
              />

              {/* Section 5: Data Cleaning (Figma 220:6367) */}
              <DataCleaningSection
                dataCleaning={form.dataCleaning}
                inputDataset={form.inputDataset}
                onUpdateField={(f, v) => updateNestedField('dataCleaning', f, v)}
              />

              {/* Section 6: Type Conversion (Figma 220:6436) */}
              <TypeConversionSection
                typeConversion={form.typeConversion}
                inputDataset={form.inputDataset}
                onUpdateField={(f, v) => updateNestedField('typeConversion', f, v)}
              />

              {/* Section 7: Date Formatting (Figma 220:6494) */}
              <DateFormattingSection
                dateFormatting={form.dateFormatting}
                datasetFields={form.inputDataset?.fields || []}
                onUpdateNestedField={updateNestedField}
              />

              {/* Section 8: Duplicate Removal (Figma 220:6560) */}
              <DuplicateRemovalSection
                deduplication={form.deduplication}
                datasetFields={form.inputDataset?.fields || []}
                onAddDeduplicationField={addDeduplicationField}
                onRemoveDeduplicationField={removeDeduplicationField}
                onUpdateNestedField={updateNestedField}
              />

              {/* Section 9: Lookup Transformation (Figma 220:6626) */}
              <LookupTransformationSection
                lookup={form.lookup}
                datasetFields={form.inputDataset?.fields || []}
                onUpdateNestedField={updateNestedField}
              />

              {/* Section 10: Expression Editor (Figma 220:6692) */}
              <ExpressionEditorSection
                expressionEditor={form.expressionEditor}
                expressionTab="String"
                onSetExpressionTab={() => {}}
                onUpdateNestedField={updateNestedField}
              />

              {/* Section 11: Transformation Preview (Figma 220:6758) */}
              <TransformationPreviewSection
                preview={form.preview}
                previewTab={previewTab}
                onSelectTab={setPreviewTab}
              />

              {/* Section 12: Transformation Testing (Figma 220:6857) */}
              <TransformationTestingSection
                testing={form.testing}
                testingMode={testingMode}
                isTesting={isTesting}
                onSetTestingMode={setTestingMode}
                onRunTests={handleRunTests}
              />

              {/* Section 13: Validation (Figma 220:6935) */}
              <ValidationSection
                validation={form.validation}
                onOpenFix={handleOpenFix}
              />

              {/* Section 14: Runtime Configuration (Figma 220:6977) */}
              <RuntimeConfigSection
                runtimeConfig={form.runtimeConfig}
                onUpdateNestedField={updateNestedField}
              />

              {/* Section 15: Monitoring (Figma 220:7019) */}
              <MonitoringSection
                monitoring={form.monitoring}
                onToggleOption={toggleMonitoringOption}
              />

              {/* Section 16: Advanced Configuration (Figma 220:7089) */}
              <AdvancedConfigSection
                advancedConfig={form.advancedConfig}
                isOpen={advancedAccordionOpen}
                onToggleOpen={() => setAdvancedAccordionOpen(!advancedAccordionOpen)}
                onUpdateNestedField={updateNestedField}
              />
            </div>

            {/* Right Summary Rail (Figma 220:7098 - 220px) */}
            <TransformationNodeSummaryRail
              form={form}
              summaries={summaries}
            />
          </div>

          {/* Full-width Bottom Telemetry & Validation Panel (Figma 220:7271 & 220:7320) */}
          <BottomTelemetryPanel
            summaries={summaries}
            validationItems={form.validation?.items || []}
            testResults={form.testing?.testResults || []}
            bottomTab={bottomTab}
            onSelectTab={setBottomTab}
            onOpenFix={handleOpenFix}
          />
        </main>

        {/* Modals */}
        <DuplicateNodeModal
          isOpen={duplicateModalOpen}
          currentNodeName={form.nodeName}
          onClose={() => setDuplicateModalOpen(false)}
          onDuplicate={handleDuplicateNode}
        />

        <ViewInputDataModal
          isOpen={viewInputDataModalOpen}
          dataset={form.inputDataset}
          onClose={() => setViewInputDataModalOpen(false)}
        />

        <DiscardChangesModal
          isOpen={discardModalOpen}
          unsavedCount={unsavedChangesCount}
          onClose={() => setDiscardModalOpen(false)}
          onConfirmDiscard={() => {
            setDiscardModalOpen(false);
            navigate(-1);
          }}
        />

        <AddRuleModal
          isOpen={addRuleModalOpen}
          datasetFields={form.inputDataset?.fields || []}
          onClose={() => setAddRuleModalOpen(false)}
          onAddRule={addTransformationRule}
        />

        <FixValidationModal
          isOpen={fixValidationModalOpen}
          valItem={activeFixItem}
          onClose={() => setFixValidationModalOpen(false)}
          onApplyFix={handleApplyFix}
        />
      </div>
    </AppShell>
  );
}
