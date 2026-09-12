import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useSourceNodeConfig } from '../hooks/useSourceNodeConfig';
import SourceNodeHeader from '../components/sourceNode/SourceNodeHeader';
import GeneralInfoSection from '../components/sourceNode/GeneralInfoSection';
import SourceConnectorSection from '../components/sourceNode/SourceConnectorSection';
import AuthenticationSection from '../components/sourceNode/AuthenticationSection';
import SourceConfigSection from '../components/sourceNode/SourceConfigSection';
import DataExtractionSection from '../components/sourceNode/DataExtractionSection';
import DataSamplingPreviewSection from '../components/sourceNode/DataSamplingPreviewSection';
import SchemaMappingSection from '../components/sourceNode/SchemaMappingSection';
import ValidationRulesSection from '../components/sourceNode/ValidationRulesSection';
import RuntimeConfigSection from '../components/sourceNode/RuntimeConfigSection';
import MonitoringSection from '../components/sourceNode/MonitoringSection';
import AdvancedSettingsSection from '../components/sourceNode/AdvancedSettingsSection';
import LiveValidationCard from '../components/sourceNode/LiveValidationCard';
import SourceNodeSummaryRail from '../components/sourceNode/SourceNodeSummaryRail';
import DuplicateNodeModal from '../components/sourceNode/DuplicateNodeModal';
import TestConnectionModal from '../components/sourceNode/TestConnectionModal';
import DiscardChangesModal from '../components/sourceNode/DiscardChangesModal';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function SourceNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'pip_001';
  const nodeId = routeNodeId || 'source_node_001';

  const {
    form,
    isLoading,
    isError,
    error,
    refetch,
    isDirty,
    unsavedChangesCount,
    passwordRevealed,
    setPasswordRevealed,
    advancedOpen,
    setAdvancedOpen,

    // Modals
    duplicateModalOpen,
    setDuplicateModalOpen,
    testConnModalOpen,
    setTestConnModalOpen,
    discardModalOpen,
    setDiscardModalOpen,

    // Feedback & state
    actionFeedback,
    testConnResult,
    validationSummary,
    isSaving,

    // Actions
    updateField,
    updateNestedField,
    addTag,
    removeTag,
    updateSchemaMapping,
    toggleAllSchemaSelected,
    toggleValidationRule,
    toggleNotificationChannel,
    handleSave,
    handleReset,
    handleTestConnection,
    handleTestAuth,
    handleDetectSchema,
    handlePreviewData,
    handleReRunValidation,
    handleDuplicate,
  } = useSourceNodeConfig(nodeId, pipelineId);

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
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Source Node', 'Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading source node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Source Node', 'Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load source node</h2>
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
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Source Node', 'Configuration']}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Sticky Header */}
        <SourceNodeHeader
          nodeName={form.nodeName}
          isDirty={isDirty}
          unsavedChangesCount={unsavedChangesCount}
          onCancel={handleCancelClick}
          onReset={handleReset}
          onDuplicate={() => setDuplicateModalOpen(true)}
          onTestConnection={handleTestConnection}
          onSave={handleSave}
          isSaving={isSaving}
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
          {isDirty ? `${unsavedChangesCount} unsaved changes in Source Node Configuration.` : 'All changes saved.'}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto" role="main">
          <div className="flex flex-col xl:flex-row items-start gap-6">
            {/* Left 11-Section Column */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* 1. General Information */}
              <GeneralInfoSection
                form={form}
                updateField={updateField}
                addTag={addTag}
                removeTag={removeTag}
              />

              {/* 2. Source Connector */}
              <SourceConnectorSection
                form={form}
                updateField={updateField}
              />

              {/* 3. Authentication */}
              <AuthenticationSection
                form={form}
                updateField={updateField}
                passwordRevealed={passwordRevealed}
                setPasswordRevealed={setPasswordRevealed}
                onTestAuth={handleTestAuth}
              />

              {/* 4. Source Configuration */}
              <SourceConfigSection
                form={form}
                updateField={updateField}
              />

              {/* 5. Data Extraction */}
              <DataExtractionSection
                form={form}
                updateField={updateField}
              />

              {/* 6. Data Sampling & Preview */}
              <DataSamplingPreviewSection
                form={form}
                onPreviewData={handlePreviewData}
              />

              {/* 7. Schema Mapping */}
              <SchemaMappingSection
                form={form}
                updateSchemaMapping={updateSchemaMapping}
                toggleAllSchemaSelected={toggleAllSchemaSelected}
                onAutoDetect={handleDetectSchema}
              />

              {/* 8. Validation Rules */}
              <ValidationRulesSection
                form={form}
                toggleValidationRule={toggleValidationRule}
              />

              {/* 9. Runtime Configuration */}
              <RuntimeConfigSection
                form={form}
                updateField={updateField}
              />

              {/* 10. Monitoring */}
              <MonitoringSection
                form={form}
                updateField={updateField}
                toggleNotificationChannel={toggleNotificationChannel}
              />

              {/* 11. Advanced Settings */}
              <AdvancedSettingsSection
                form={form}
                updateNestedField={updateNestedField}
                advancedOpen={advancedOpen}
                setAdvancedOpen={setAdvancedOpen}
              />

              {/* Live Validation Card */}
              <LiveValidationCard
                form={form}
                validationSummary={validationSummary}
                onReRunValidation={handleReRunValidation}
              />
            </div>

            {/* Right Summary Sidebar Rail */}
            <SourceNodeSummaryRail
              form={form}
              validationSummary={validationSummary}
              onSave={handleSave}
              onTestConnection={handleTestConnection}
              onDuplicate={() => setDuplicateModalOpen(true)}
              isSaving={isSaving}
            />
          </div>
        </main>

        {/* Modals & Dialogs */}
        <DuplicateNodeModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          onConfirm={handleDuplicate}
          currentNodeName={form.nodeName}
        />

        <TestConnectionModal
          isOpen={testConnModalOpen}
          onClose={() => setTestConnModalOpen(false)}
          result={testConnResult}
          connectorInstance={form.connectorInstance}
          onReTest={handleTestConnection}
        />

        <DiscardChangesModal
          isOpen={discardModalOpen}
          onClose={() => setDiscardModalOpen(false)}
          onConfirmDiscard={handleConfirmDiscard}
          unsavedChangesCount={unsavedChangesCount}
        />
      </div>
    </AppShell>
  );
}
