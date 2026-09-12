import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useValidationNodeConfig } from '../hooks/useValidationNodeConfig';
import ValidationNodeHeader from '../components/validationNode/ValidationNodeHeader';
import GeneralInfoSection from '../components/validationNode/GeneralInfoSection';
import InputDatasetSection from '../components/validationNode/InputDatasetSection';
import ValidationModeSection from '../components/validationNode/ValidationModeSection';
import ValidationRuleBuilderSection from '../components/validationNode/ValidationRuleBuilderSection';
import RequiredFieldValidationSection from '../components/validationNode/RequiredFieldValidationSection';
import DataTypeValidationSection from '../components/validationNode/DataTypeValidationSection';
import FieldValidationRulesSection from '../components/validationNode/FieldValidationRulesSection';
import EmailValidationSection from '../components/validationNode/EmailValidationSection';
import PhoneValidationSection from '../components/validationNode/PhoneValidationSection';
import BusinessRulesSection from '../components/validationNode/BusinessRulesSection';
import ReferentialDuplicateSection from '../components/validationNode/ReferentialDuplicateSection';
import SeverityFailureBehaviorSection from '../components/validationNode/SeverityFailureBehaviorSection';
import ValidationTestSection from '../components/validationNode/ValidationTestSection';
import DataPreviewSection from '../components/validationNode/DataPreviewSection';
import ResultsQualitySection from '../components/validationNode/ResultsQualitySection';
import ErrorStructureSection from '../components/validationNode/ErrorStructureSection';
import RuntimeMonitoringSection from '../components/validationNode/RuntimeMonitoringSection';
import AdvancedConfigSection from '../components/validationNode/AdvancedConfigSection';
import ValidationNodeSummaryRail from '../components/validationNode/ValidationNodeSummaryRail';
import StickyFooterActionBar from '../components/validationNode/StickyFooterActionBar';
import DuplicateNodeModal from '../components/validationNode/DuplicateNodeModal';
import ViewSourceSchemaModal from '../components/validationNode/ViewSourceSchemaModal';
import DiscardChangesModal from '../components/validationNode/DiscardChangesModal';
import AddRuleModal from '../components/validationNode/AddRuleModal';
import AddBusinessRuleModal from '../components/validationNode/AddBusinessRuleModal';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function ValidationNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'customer-etl-pipeline';
  const nodeId = routeNodeId || 'val_node_0052';

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
    isTesting,
    isPreviewing,
    previewTab,
    setPreviewTab,
    resultsFilter,
    setResultsFilter,
    previewLimit,
    setPreviewLimit,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    viewSchemaModalOpen,
    setViewSchemaModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    addRuleModalOpen,
    setAddRuleModalOpen,
    addBusinessRuleModalOpen,
    setAddBusinessRuleModalOpen,

    // Accordions
    advancedOpen,
    setAdvancedOpen,

    // Mutators
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addRule,
    toggleRuleActive,
    deleteRule,
    addBusinessRule,
    deleteBusinessRule,
    toggleMonitoringOption,
    toggleMonitoringChannel,

    // Action handlers
    handleSave,
    handleSaveDraft,
    handleReset,
    handleValidateRules,
    handleRunTest,
    handlePreviewData,
    handleRefreshSchema,
    handleDuplicate,
  } = useValidationNodeConfig(nodeId, pipelineId);

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
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Validation Node', 'Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading validation node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Validation Node', 'Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load Validation Node</h2>
          <p className="text-xs text-rose-700">{error?.message || 'Error communicating with validation service'}</p>
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
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Validation Node', 'Configuration']}>
      {/* Toast Notification */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : actionFeedback.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {actionFeedback.type === 'success' && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
          {actionFeedback.type === 'warning' && <AlertCircle className="size-4 text-amber-600 shrink-0" />}
          {actionFeedback.type === 'error' && <AlertCircle className="size-4 text-rose-600 shrink-0" />}
          {actionFeedback.type === 'info' && <Info className="size-4 text-blue-600 shrink-0" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <ValidationNodeHeader
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        isSaving={isSaving}
        isTesting={isTesting}
        isValidating={isValidating}
        onCancel={handleCancelClick}
        onReset={handleReset}
        onDuplicate={() => setDuplicateModalOpen(true)}
        onRunTest={handleRunTest}
        onSave={handleSave}
      />

      {/* Main 2-Column Canvas & Summary Rail Layout matching Figma */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* Main Left Column (Sections 01 - 22) */}
          <div className="space-y-6 min-w-0 pb-20">
            {/* 01. General Information */}
            <GeneralInfoSection
              form={form}
              updateField={updateField}
              addTag={addTag}
              removeTag={removeTag}
            />

            {/* 02. Input Dataset */}
            <InputDatasetSection
              dataset={form.inputDataset}
              onRefreshSchema={handleRefreshSchema}
              onViewInputData={() => setViewSchemaModalOpen(true)}
            />

            {/* 03. Validation Mode */}
            <ValidationModeSection
              selectedMode={form.validationMode}
              onSelectMode={(mode) => updateField('validationMode', mode)}
            />

            {/* 04. Validation Rule Builder */}
            <ValidationRuleBuilderSection
              rules={form.rules || []}
              onAddRule={() => setAddRuleModalOpen(true)}
              onImportRules={() => handleValidateRules()}
              onEditRule={(rule) => setAddRuleModalOpen(true)}
              onDeleteRule={deleteRule}
              onToggleActive={toggleRuleActive}
              onTestRule={handleRunTest}
            />

            {/* 05. Required Field Validation */}
            <RequiredFieldValidationSection
              requiredConfig={form.requiredFieldValidation}
              updateNestedField={updateNestedField}
            />

            {/* 06. Data Type Validation */}
            <DataTypeValidationSection
              dataTypeConfig={form.dataTypeValidation}
              onValidateSchema={handleValidateRules}
            />

            {/* 07. Field Validation Rules */}
            <FieldValidationRulesSection
              fieldRules={form.fieldValidationRules}
              onAddTextRule={() => setAddRuleModalOpen(true)}
              onAddNumericRule={() => setAddRuleModalOpen(true)}
              onAddDateTimeRule={() => setAddRuleModalOpen(true)}
            />

            {/* 08 & 09. Email and Phone Validation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmailValidationSection emailConfig={form.emailValidation} />
              <PhoneValidationSection phoneConfig={form.phoneValidation} />
            </div>

            {/* 10. Business Rules */}
            <BusinessRulesSection
              businessRules={form.businessRules || []}
              onAddBusinessRule={() => setAddBusinessRuleModalOpen(true)}
              onEditBusinessRule={() => setAddBusinessRuleModalOpen(true)}
              onDeleteBusinessRule={deleteBusinessRule}
            />

            {/* 11 & 12. Referential Validation & Duplicate Detection */}
            <ReferentialDuplicateSection
              referentialConfig={form.referentialValidation}
              duplicateConfig={form.duplicateDetection}
              updateNestedField={updateNestedField}
            />

            {/* 13 & 14. Rule Severity & Failure Behavior */}
            <SeverityFailureBehaviorSection
              failureBehavior={form.failureBehavior}
              onSelectBehavior={(b) => updateNestedField('failureBehavior', 'primaryBehavior', b)}
            />

            {/* 15. Validation Test */}
            <ValidationTestSection
              testConfig={form.validationTest}
              updateNestedField={updateNestedField}
              onRunTest={handleRunTest}
              isTesting={isTesting}
            />

            {/* 16. Data Preview */}
            <DataPreviewSection
              dataPreview={form.dataPreview}
              previewTab={previewTab}
              setPreviewTab={setPreviewTab}
              previewLimit={previewLimit}
              setPreviewLimit={setPreviewLimit}
              onRefreshPreview={handlePreviewData}
              isPreviewing={isPreviewing}
            />

            {/* 17 & 18. Validation Results & Data Quality Metrics */}
            <ResultsQualitySection
              resultsConfig={form.validationResults}
              qualityMetrics={form.dataQualityMetrics}
              resultsFilter={resultsFilter}
              setResultsFilter={setResultsFilter}
            />

            {/* 19. Error Structure */}
            <ErrorStructureSection
              errorRows={form.errorStructure?.rows || []}
              onResolveError={() => handleValidateRules()}
            />

            {/* 20 & 21. Runtime Configuration & Monitoring */}
            <RuntimeMonitoringSection
              runtimeConfig={form.runtimeConfig}
              monitoringConfig={form.monitoring}
              updateNestedField={updateNestedField}
              toggleMonitoringChannel={toggleMonitoringChannel}
              toggleMonitoringOption={toggleMonitoringOption}
            />

            {/* 22. Advanced Configuration */}
            <AdvancedConfigSection
              advancedConfig={form.advancedConfig}
              isOpen={advancedOpen}
              onToggle={() => setAdvancedOpen(!advancedOpen)}
              updateNestedField={updateNestedField}
            />
          </div>

          {/* Right Summary Rail matching Figma 221:7477 */}
          <div className="sticky top-20">
            <ValidationNodeSummaryRail
              form={form}
              onRunTest={handleRunTest}
              isTesting={isTesting}
            />
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <StickyFooterActionBar
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        isSaving={isSaving}
        isValidating={isValidating}
        isTesting={isTesting}
        onCancel={handleCancelClick}
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidateRules}
        onTestValidation={handleRunTest}
        onApplyConfiguration={handleSave}
      />

      {/* Modals */}
      <DuplicateNodeModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onDuplicate={handleDuplicate}
        currentNodeName={form.nodeName}
      />

      <ViewSourceSchemaModal
        isOpen={viewSchemaModalOpen}
        onClose={() => setViewSchemaModalOpen(false)}
        dataset={form.inputDataset}
      />

      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={handleConfirmDiscard}
        unsavedCount={unsavedChangesCount}
      />

      <AddRuleModal
        isOpen={addRuleModalOpen}
        onClose={() => setAddRuleModalOpen(false)}
        onAddRule={addRule}
        availableFields={form.inputDataset?.fields || []}
      />

      <AddBusinessRuleModal
        isOpen={addBusinessRuleModalOpen}
        onClose={() => setAddBusinessRuleModalOpen(false)}
        onAddBusinessRule={addBusinessRule}
        availableFields={form.inputDataset?.fields || []}
      />
    </AppShell>
  );
}
