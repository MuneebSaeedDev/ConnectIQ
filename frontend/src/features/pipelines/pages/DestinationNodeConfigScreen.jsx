import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useDestinationNodeConfig } from '../hooks/useDestinationNodeConfig';
import DestinationNodeHeader from '../components/destinationNode/DestinationNodeHeader';
import GeneralInfoSection from '../components/destinationNode/GeneralInfoSection';
import TargetConnectorSection from '../components/destinationNode/TargetConnectorSection';
import TargetSchemaWriteStrategySection from '../components/destinationNode/TargetSchemaWriteStrategySection';
import SchemaMappingSection from '../components/destinationNode/SchemaMappingSection';
import ErrorDeadLetterPerformanceSection from '../components/destinationNode/ErrorDeadLetterPerformanceSection';
import DryRunSection from '../components/destinationNode/DryRunSection';
import SummaryRail from '../components/destinationNode/SummaryRail';

import StickyFooterActionBar from '../components/validationNode/StickyFooterActionBar';
import DuplicateNodeModal from '../components/validationNode/DuplicateNodeModal';
import DiscardChangesModal from '../components/validationNode/DiscardChangesModal';
import TestConnectionModal from '../components/sourceNode/TestConnectionModal';

import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function DestinationNodeConfigScreen() {
  const { id: routePipelineId, nodeId: routeNodeId } = useParams();
  const navigate = useNavigate();

  const pipelineId = routePipelineId || 'customer-etl-pipeline';
  const nodeId = routeNodeId || 'dst_node_0073';

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
    isTestingConn,
    isTestingLoad,
    testConnResult,
    dryRunResult,

    duplicateModalOpen,
    setDuplicateModalOpen,
    discardModalOpen,
    setDiscardModalOpen,
    testConnModalOpen,
    setTestConnModalOpen,

    updateField,
    updateNestedField,
    addTag,
    removeTag,
    updateFieldMapping,

    handleSave,
    handleSaveDraft,
    handleReset,
    handleTestConnection,
    handleRunDryLoad,
    handleDuplicate,
  } = useDestinationNodeConfig(nodeId, pipelineId);

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
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Destination Node Configuration']}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
          <Loader2 className="size-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading destination node configuration…</p>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Destination Node Configuration']}>
        <div className="p-6 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
          <AlertCircle className="size-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">Failed to load Destination Node</h2>
          <p className="text-xs text-rose-700">{error?.message || 'Error communicating with execution service'}</p>
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

      <DestinationNodeHeader
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        isSaving={isSaving}
        isTestingConn={isTestingConn}
        onCancel={handleCancelClick}
        onReset={handleReset}
        onDuplicate={() => setDuplicateModalOpen(true)}
        onTestConnection={handleTestConnection}
        onSave={handleSave}
      />

      <main className="max-w-[1920px] mx-auto px-6 py-6 border-b border-slate-200">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">

          <div className="space-y-6 min-w-0 pb-16">
            <GeneralInfoSection
              form={form}
              updateField={updateField}
              addTag={addTag}
              removeTag={removeTag}
            />

            <TargetConnectorSection
              form={form}
              updateField={updateField}
            />

            <TargetSchemaWriteStrategySection
              form={form}
              updateField={updateField}
            />

            <SchemaMappingSection
              fieldMappings={form.fieldMappings}
              updateFieldMapping={updateFieldMapping}
            />

            <ErrorDeadLetterPerformanceSection
              form={form}
              updateField={updateField}
              updateNestedField={updateNestedField}
            />

            <DryRunSection
              isTestingLoad={isTestingLoad}
              dryRunResult={dryRunResult}
              onRunDryLoad={handleRunDryLoad}
              form={form}
            />
          </div>

          <div className="hidden xl:block">
             <SummaryRail
                form={form}
                isTestingConn={isTestingConn}
                isTestingLoad={isTestingLoad}
                onTestConnection={handleTestConnection}
                onRunDryLoad={handleRunDryLoad}
             />
          </div>

        </div>
      </main>

      <StickyFooterActionBar
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        isSaving={isSaving}
        isValidating={isTestingConn}
        isTesting={isTestingLoad}
        onCancel={handleCancelClick}
        onSaveDraft={handleSaveDraft}
        onValidate={handleTestConnection}
        onTestValidation={handleRunDryLoad}
        onApplyConfiguration={handleSave}
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
        onConfirm={handleConfirmDiscard}
        unsavedCount={unsavedChangesCount}
      />

      <TestConnectionModal
        isOpen={testConnModalOpen}
        onClose={() => setTestConnModalOpen(false)}
        result={testConnResult}
        connectorInstance={form.connectionName}
        onReTest={handleTestConnection}
      />

    </AppShell>
  );
}
