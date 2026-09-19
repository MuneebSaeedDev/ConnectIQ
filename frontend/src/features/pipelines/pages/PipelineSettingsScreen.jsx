import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { usePipelineSettings } from '../hooks/usePipelineSettings';
import PipelineSettingsHeader from '../components/settings/PipelineSettingsHeader';
import GeneralSettingsSection from '../components/settings/GeneralSettingsSection';
import ExecutionSettingsSection from '../components/settings/ExecutionSettingsSection';
import ErrorHandlingSection from '../components/settings/ErrorHandlingSection';
import RetryConfigSection from '../components/settings/RetryConfigSection';
import DataProcessingSection from '../components/settings/DataProcessingSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import AdvancedSettingsSection from '../components/settings/AdvancedSettingsSection';
import PipelineSettingsSummaryRail from '../components/settings/PipelineSettingsSummaryRail';
import ValidationSummarySection from '../components/settings/ValidationSummarySection';
import DiscardChangesModal from '../components/settings/DiscardChangesModal';
import ResetSettingsModal from '../components/settings/ResetSettingsModal';

import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Sliders,
  Cpu,
  ShieldAlert,
  RotateCw,
  Database,
  Bell,
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
    unsavedChangesCount,
    isSaving,
    actionFeedback,
    activeTab,
    setActiveTab,
    validation,

    discardModalOpen,
    setDiscardModalOpen,
    resetModalOpen,
    setResetModalOpen,

    updateField,
    updateNestedField,
    addTag,
    removeTag,
    addEnvVar,
    updateEnvVar,
    removeEnvVar,
    addSecretRef,
    updateSecretRef,
    removeSecretRef,
    addEmailRecipient,
    removeEmailRecipient,
    addSlackChannel,
    removeSlackChannel,

    handleSave,
    handleReset,
  } = usePipelineSettings(pipelineId);

  const handleCancel = () => {
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
          <h2 className="text-sm font-bold text-rose-900">Failed to load Pipeline Settings</h2>
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

  const tabs = [
    { id: 'general', label: 'General Identity', icon: Sliders },
    { id: 'execution', label: 'Execution Profile', icon: Cpu, hasError: validation?.errors?.timeoutMinutes },
    { id: 'error', label: 'Error Handling', icon: ShieldAlert, hasError: validation?.errors?.maxErrorThresholdPct },
    { id: 'retry', label: 'Retry Policies', icon: RotateCw, hasError: validation?.errors?.maxRetries || validation?.errors?.initialDelaySeconds },
    { id: 'data', label: 'Data Processing', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <AppShell breadcrumb={[]}>
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

      {/* Main Header */}
      <PipelineSettingsHeader
        form={form}
        isDirty={isDirty}
        unsavedChangesCount={unsavedChangesCount}
        onReset={() => setResetModalOpen(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        validation={validation}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.hasError && (
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Active Settings Panel */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
              {activeTab === 'general' && (
                <GeneralSettingsSection
                  form={form}
                  updateField={updateField}
                  addTag={addTag}
                  removeTag={removeTag}
                  validation={validation}
                />
              )}

              {activeTab === 'execution' && (
                <ExecutionSettingsSection
                  form={form}
                  updateNestedField={updateNestedField}
                  validation={validation}
                />
              )}

              {activeTab === 'error' && (
                <ErrorHandlingSection
                  form={form}
                  updateNestedField={updateNestedField}
                  validation={validation}
                />
              )}

              {activeTab === 'retry' && (
                <RetryConfigSection
                  form={form}
                  updateNestedField={updateNestedField}
                  validation={validation}
                />
              )}

              {activeTab === 'data' && (
                <DataProcessingSection
                  form={form}
                  updateNestedField={updateNestedField}
                  validation={validation}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsSection
                  form={form}
                  updateNestedField={updateNestedField}
                  validation={validation}
                  addEmailRecipient={addEmailRecipient}
                  removeEmailRecipient={removeEmailRecipient}
                  addSlackChannel={addSlackChannel}
                  removeSlackChannel={removeSlackChannel}
                />
              )}

              {/* Validation Summary Bar */}
              <ValidationSummarySection validation={validation} />
            </div>

            {/* Advanced Settings Accordion (Persistent across tabs) */}
            <AdvancedSettingsSection
              form={form}
              updateNestedField={updateNestedField}
              addEnvVar={addEnvVar}
              updateEnvVar={updateEnvVar}
              removeEnvVar={removeEnvVar}
              addSecretRef={addSecretRef}
              updateSecretRef={updateSecretRef}
              removeSecretRef={removeSecretRef}
            />
          </div>

          {/* Right Summary Rail */}
          <PipelineSettingsSummaryRail
            form={form}
            validation={validation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </main>

      {/* Discard Changes Modal */}
      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirmDiscard={handleConfirmDiscard}
        unsavedChangesCount={unsavedChangesCount}
      />

      {/* Reset Confirmation Modal */}
      <ResetSettingsModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={handleReset}
      />
    </AppShell>
  );
}
