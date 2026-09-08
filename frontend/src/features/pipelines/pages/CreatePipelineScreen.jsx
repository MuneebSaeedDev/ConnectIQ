import React, { useState, useId, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import AppShell from '../../shell/components/AppShell';
import {
  ENVIRONMENTS,
  CATEGORIES,
  BUSINESS_DOMAINS,
  TEAMS,
  TEMPLATES,
  WIZARD_STEPS,
  INITIAL_PIPELINE_FORM,
  validatePipelineForm,
  createPipeline,
  savePipelineDraft,
} from '../services/createPipeline.api';

// ChevronRight component icon matching Figma Component 1
function ChevronRightIcon({ className = 'size-3.5 text-[#9ca3af]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.25 3.5L8.75 7L5.25 10.5" />
    </svg>
  );
}

export default function CreatePipelineScreen() {
  const navigate = useNavigate();
  const formId = useId();

  const [form, setForm] = useState(INITIAL_PIPELINE_FORM);
  const [touched, setTouched] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Validation
  const errors = useMemo(() => validatePipelineForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;
  const isRequiredComplete = Boolean(
    form.name.trim() &&
    !errors.name &&
    form.environment &&
    form.owner.trim()
  );

  // Form field updater
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Tags management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (clean && !form.tags.includes(clean)) {
        updateField('tags', [...form.tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    updateField('tags', form.tags.filter((t) => t !== tagToRemove));
  };

  // Template selection
  const handleSelectTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      template: template.id,
      category: template.defaultCategory || prev.category,
      businessDomain: template.defaultDomain || prev.businessDomain,
      tags: Array.from(new Set([...prev.tags, ...(template.defaultTags || [])])),
    }));
    setIsDirty(true);
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await savePipelineDraft(form);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(timeStr);
      setSaveSuccessMessage(`Draft saved at ${timeStr} (MOD-008 local boundary)`);
      setIsDirty(false);
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch {
      setSaveSuccessMessage('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Proceed to next step
  const handleNextStep = async (e) => {
    e?.preventDefault();
    setTouched({
      name: true,
      environment: true,
      owner: true,
      version: true,
    });

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createPipeline(form);
      // Advance to Source Configuration step
      navigate('/pipelines/new/source');
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setConfirmCancelOpen(true);
    } else {
      navigate('/pipelines');
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Create Pipeline']}>
      <div className="flex flex-col min-h-screen bg-[#f0f2f5] text-[#0f1117] font-sans">
        {/* Toast / Notification Banner */}
        {saveSuccessMessage && (
          <div
            role="status"
            className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-[#0f1117] text-white px-4 py-2.5 rounded-md shadow-lg text-xs font-mono border border-[#374151] animate-in fade-in slide-in-from-top-2"
          >
            <Check className="size-4 text-[#10b981]" />
            <span>{saveSuccessMessage}</span>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage('')}
              className="ml-2 text-[#9ca3af] hover:text-white"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Top Header Bar (Node 146:7810) */}
        <header className="bg-white border-b border-[#e2e5ea] px-6 py-4 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {/* Breadcrumb Navigation (Node 146:7813) */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-[#9ca3af] mb-1">
                <Link to="/pipelines" className="hover:text-[#0f1117] transition-colors">
                  Pipelines
                </Link>
                <span>/</span>
                <Link to="/pipelines" className="hover:text-[#0f1117] transition-colors">
                  Pipeline Library
                </Link>
                <span>/</span>
                <span className="font-medium text-[#0f1117]">Create Pipeline</span>
              </nav>

              {/* Title & Description (Node 146:7824, 146:7826) */}
              <h1 className="text-[18px] font-semibold text-[#0f1117] leading-tight">
                Create Pipeline
              </h1>
              <p className="text-sm text-[#6b7280] mt-0.5 max-w-2xl">
                Configure a new data pipeline by defining its workflow, connectivity, scheduling, ownership, and execution settings.
              </p>
            </div>

            {/* Header Action Buttons (Node 146:7828) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium text-[#4b5563] bg-white border border-[#e2e5ea] rounded hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#0f1117] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-[#4b5563] bg-white border border-[#e2e5ea] rounded hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#0f1117] transition-colors"
              >
                Import Template
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-semibold text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] rounded hover:bg-[#dbeafe] focus:outline-none focus:ring-2 focus:ring-[#2563eb] disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </header>

        {/* Stepper Bar (Node 146:7835) */}
        <div className="bg-white border-b border-[#e2e5ea] px-6 py-3 shrink-0 overflow-x-auto">
          <ol className="flex items-center gap-0 min-w-max">
            {WIZARD_STEPS.map((step, idx) => {
              const isActive = step.id === 1;
              const isPassed = step.id < 1;
              return (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                        isActive
                          ? 'bg-[#0f1117] text-white shadow-[0px_0px_0px_1px_white,0px_0px_0px_3px_#0f1117]'
                          : isPassed
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#f3f4f6] border border-[#e2e5ea] text-[#9ca3af]'
                      }`}
                    >
                      {step.id}
                    </div>
                    <span
                      className={`text-xs ${
                        isActive
                          ? 'font-medium text-[#0f1117]'
                          : 'font-medium text-[#9ca3af]'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {idx < WIZARD_STEPS.length - 1 && (
                    <div className="w-8 h-px bg-[#e2e5ea] mx-0.5 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Main Content Area (Two Columns: Max-w-3xl Form + Right Sidebar) */}
        <main className="flex-1 flex flex-col lg:flex-row items-start overflow-auto">
          {/* Form Column (Node 146:7886) */}
          <div className="flex-1 min-w-0 p-6 flex justify-center lg:justify-start">
            <div className="w-full max-w-3xl flex flex-col gap-5">
              {/* Step Header Badge (Node 146:7888) */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e2e5ea] rounded">
                  STEP 1 / 7
                </span>
                <h2 className="text-sm font-semibold text-[#0f1117]">
                  General Information
                </h2>
              </div>

              {/* Form Content Cards */}
              <form onSubmit={handleNextStep} noValidate className="flex flex-col gap-5">
                {/* Card 1: Pipeline Identity (Node 146:7894) */}
                <section className="bg-white border border-[#e2e5ea] rounded overflow-hidden shadow-sm">
                  <div className="bg-[#f9fafb] border-b border-[#e2e5ea] px-4 py-3">
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#4b5563]">
                      Pipeline Identity
                    </h3>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pipeline Name (Full Width) */}
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label htmlFor={`${formId}-name`} className="block text-xs font-medium text-[#374151]">
                        Pipeline Name <span className="text-[#dc2626]" aria-hidden="true">*</span>
                      </label>
                      <input
                        id={`${formId}-name`}
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                        placeholder="e.g. customer-orders-to-warehouse"
                        aria-invalid={touched.name && Boolean(errors.name)}
                        aria-describedby={`${formId}-name-hint ${touched.name && errors.name ? `${formId}-name-error` : ''}`}
                        className={`w-full h-9 px-3 py-2 bg-white border rounded text-sm font-mono text-[#0f1117] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#0f1117] ${
                          touched.name && errors.name ? 'border-[#dc2626] bg-[#fef2f2]' : 'border-[#e2e5ea]'
                        }`}
                      />
                      <p id={`${formId}-name-hint`} className="text-[11px] text-[#9ca3af]">
                        Use lowercase letters, numbers, and hyphens. Must be unique within the organization.
                      </p>
                      {touched.name && errors.name && (
                        <p id={`${formId}-name-error`} role="alert" className="text-[11px] text-[#dc2626] font-medium flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Description (Full Width) */}
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label htmlFor={`${formId}-desc`} className="block text-xs font-medium text-[#374151]">
                        Description
                      </label>
                      <textarea
                        id={`${formId}-desc`}
                        rows={3}
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Describe the purpose and data flow of this pipeline…"
                        className="w-full px-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-sans text-[#0f1117] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#0f1117] resize-none"
                      />
                    </div>

                    {/* Category Select */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${formId}-category`} className="block text-xs font-medium text-[#374151]">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          id={`${formId}-category`}
                          value={form.category}
                          onChange={(e) => updateField('category', e.target.value)}
                          className="w-full h-9 px-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-sans text-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117] appearance-none pr-8 cursor-pointer"
                        >
                          <option value="">Select category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="size-4 text-[#9ca3af] absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Business Domain Select */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${formId}-domain`} className="block text-xs font-medium text-[#374151]">
                        Business Domain
                      </label>
                      <div className="relative">
                        <select
                          id={`${formId}-domain`}
                          value={form.businessDomain}
                          onChange={(e) => updateField('businessDomain', e.target.value)}
                          className="w-full h-9 px-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-sans text-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117] appearance-none pr-8 cursor-pointer"
                        >
                          <option value="">Select domain</option>
                          {BUSINESS_DOMAINS.map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="size-4 text-[#9ca3af] absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 2: Environment & Classification (Node 146:7924) */}
                <section className="bg-white border border-[#e2e5ea] rounded overflow-hidden shadow-sm">
                  <div className="bg-[#f9fafb] border-b border-[#e2e5ea] px-4 py-3">
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#4b5563]">
                      Environment & Classification
                    </h3>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Environment Toggle */}
                    <div className="flex flex-col gap-1">
                      <span className="block text-xs font-medium text-[#374151]">
                        Environment <span className="text-[#dc2626]" aria-hidden="true">*</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {ENVIRONMENTS.map((env) => {
                          const isSelected = form.environment === env.id;
                          return (
                            <button
                              key={env.id}
                              type="button"
                              onClick={() => updateField('environment', env.id)}
                              className={`px-3 py-2 rounded text-xs transition-colors ${
                                isSelected
                                  ? 'bg-[#eff6ff] border border-[#2563eb] text-[#2563eb] font-medium'
                                  : 'bg-white border border-[#e2e5ea] text-[#6b7280] font-normal hover:bg-[#f9fafb]'
                              }`}
                            >
                              {env.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Version */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${formId}-version`} className="block text-xs font-medium text-[#374151]">
                        Version
                      </label>
                      <input
                        id={`${formId}-version`}
                        type="text"
                        value={form.version}
                        onChange={(e) => updateField('version', e.target.value)}
                        placeholder="1.0.0"
                        className="w-full h-9 px-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-mono text-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117]"
                      />
                    </div>

                    {/* Tags Input (Full Width) */}
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label htmlFor={`${formId}-tags-input`} className="block text-xs font-medium text-[#374151]">
                        Tags
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-[#e2e5ea] rounded min-h-[38px] focus-within:ring-2 focus-within:ring-[#0f1117] focus-within:border-transparent">
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f3f4f6] border border-[#e2e5ea] rounded text-[11px] font-mono font-medium text-[#374151]"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-[#9ca3af] hover:text-[#374151] leading-none focus:outline-none"
                              aria-label={`Remove tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          id={`${formId}-tags-input`}
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder={form.tags.length === 0 ? 'Add tags (e.g. etl, orders)...' : 'Add tag…'}
                          className="flex-1 min-w-[100px] border-0 p-0 text-sm font-sans placeholder:text-[#d1d5db] focus:outline-none focus:ring-0"
                        />
                      </div>
                      <p className="text-[11px] text-[#9ca3af]">
                        Press Enter to add a tag.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Card 3: Ownership (Node 146:7968) */}
                <section className="bg-white border border-[#e2e5ea] rounded overflow-hidden shadow-sm">
                  <div className="bg-[#f9fafb] border-b border-[#e2e5ea] px-4 py-3">
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#4b5563]">
                      Ownership
                    </h3>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pipeline Owner */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${formId}-owner`} className="block text-xs font-medium text-[#374151]">
                        Pipeline Owner <span className="text-[#dc2626]" aria-hidden="true">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-2.5 size-4 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[8px] font-bold pointer-events-none">
                          {form.owner ? form.owner.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <input
                          id={`${formId}-owner`}
                          type="text"
                          value={form.owner}
                          onChange={(e) => updateField('owner', e.target.value)}
                          placeholder="Pipeline Owner"
                          className="w-full h-9 pl-8 pr-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-sans text-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117]"
                        />
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${formId}-team`} className="block text-xs font-medium text-[#374151]">
                        Team
                      </label>
                      <div className="relative">
                        <select
                          id={`${formId}-team`}
                          value={form.team}
                          onChange={(e) => updateField('team', e.target.value)}
                          className="w-full h-9 px-3 py-2 bg-white border border-[#e2e5ea] rounded text-sm font-sans text-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117] appearance-none pr-8 cursor-pointer"
                        >
                          {TEAMS.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="size-4 text-[#9ca3af] absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 4: Pipeline Template (Node 146:7988) */}
                <section className="bg-white border border-[#e2e5ea] rounded overflow-hidden shadow-sm">
                  <div className="bg-[#f9fafb] border-b border-[#e2e5ea] px-4 py-3 flex items-center gap-2">
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#4b5563]">
                      Pipeline Template
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#9ca3af] bg-white border border-[#e2e5ea] rounded">
                      OPTIONAL
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {TEMPLATES.map((tmpl) => {
                        const isSelected = form.template === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => handleSelectTemplate(tmpl)}
                            className={`flex flex-col items-start text-left p-3 rounded border transition-all ${
                              isSelected
                                ? 'bg-[#eff6ff] border-[#2563eb] shadow-sm'
                                : 'bg-white border-[#e2e5ea] hover:border-[#cbd5e1] hover:bg-[#fafafa]'
                            }`}
                          >
                            <div className="text-[18px] leading-none mb-1 text-[#0f1117]" aria-hidden="true">
                              {tmpl.icon}
                            </div>
                            <div className={`text-xs font-medium leading-tight ${isSelected ? 'text-[#2563eb]' : 'text-[#0f1117]'}`}>
                              {tmpl.name}
                            </div>
                            <div className="text-[11px] text-[#9ca3af] leading-tight mt-0.5">
                              {tmpl.subtitle}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* Future Steps Preview / Collapsible Row Cards (Steps 2 to 7) */}
                <div className="flex flex-col gap-2 mt-1">
                  {WIZARD_STEPS.slice(1).map((step) => (
                    <div
                      key={step.id}
                      onClick={() => {
                        if (isRequiredComplete) {
                          navigate(step.route);
                        }
                      }}
                      className={`bg-white border border-[#e2e5ea] rounded p-3 flex items-center justify-between transition-colors ${
                        isRequiredComplete ? 'cursor-pointer hover:bg-[#f9fafb]' : 'opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-5 rounded-full bg-[#f3f4f6] border border-[#e2e5ea] flex items-center justify-center font-mono font-bold text-[10px] text-[#9ca3af]">
                          {step.id}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[#6b7280]">
                            {step.name}
                          </h4>
                          <p className="text-[11px] text-[#9ca3af]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRightIcon className="size-3.5 text-[#9ca3af] shrink-0" />
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Pipeline Summary (Node 146:8114) */}
          <aside className="w-full lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-[#e2e5ea] shrink-0 flex flex-col">
            <div className="bg-[#f9fafb] border-b border-[#e2e5ea] px-4 py-3">
              <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#6b7280]">
                Pipeline Summary
              </h3>
            </div>

            <div className="p-4 flex flex-col gap-4 text-xs">
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono uppercase text-[10px] text-[#9ca3af] tracking-wider">
                  Status
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-mono font-bold text-xs rounded">
                    <span className="size-1.5 rounded-full bg-[#d97706]" aria-hidden="true" />
                    Draft
                  </span>
                </div>
              </div>

              {/* Configuration Progress */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="uppercase text-[10px] text-[#9ca3af] tracking-wider">
                    Configuration Progress
                  </span>
                  <span className="font-bold text-[11px] text-[#374151]">
                    {isRequiredComplete ? '14%' : '0%'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563eb] transition-all duration-300"
                    style={{ width: isRequiredComplete ? '14%' : '4%' }}
                  />
                </div>
                <span className="text-[10px] text-[#9ca3af]">
                  {isRequiredComplete ? '1 of 7 steps completed' : '0 of 7 steps completed'}
                </span>
              </div>

              {/* Quick Summary */}
              <div className="flex flex-col gap-2">
                <span className="font-mono uppercase text-[10px] text-[#9ca3af] tracking-wider">
                  Quick Summary
                </span>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Source</span>
                    <span className="text-[#d1d5db] italic font-normal">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Destination</span>
                    <span className="text-[#d1d5db] italic font-normal">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Schedule</span>
                    <span className="text-[#d1d5db] italic font-normal">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Owner</span>
                    <span className="font-mono font-medium text-[#374151]">{form.owner || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Environment</span>
                    <span className="font-mono font-medium text-[#374151]">{form.environment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Version</span>
                    <span className="font-mono font-medium text-[#374151]">{form.version || '1.0.0'}</span>
                  </div>
                </div>
              </div>

              {/* Validation Status */}
              <div className="flex flex-col gap-2">
                <span className="font-mono uppercase text-[10px] text-[#9ca3af] tracking-wider">
                  Validation Status
                </span>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Configuration</span>
                    <span className="font-mono text-[#9ca3af]">— Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Source Connectivity</span>
                    <span className="font-mono text-[#9ca3af]">— Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Destination Connectivity</span>
                    <span className="font-mono text-[#9ca3af]">— Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Scheduling</span>
                    <span className="font-mono text-[#9ca3af]">— Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Required Fields</span>
                    <span className={`font-mono ${isRequiredComplete ? 'text-[#10b981]' : 'text-[#2563eb]'}`}>
                      {isRequiredComplete ? '✓ Ready' : '… Checking'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Vertical List */}
              <div className="flex flex-col gap-2 pt-1 border-t border-[#e2e5ea]">
                <span className="font-mono uppercase text-[10px] text-[#9ca3af] tracking-wider">
                  Steps
                </span>
                <nav aria-label="Step progress" className="flex flex-col gap-1.5 text-[11px]">
                  {WIZARD_STEPS.map((step) => {
                    const isCurrent = step.id === 1;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <div
                          className={`size-3.5 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'border-2 border-[#0f1117]'
                              : 'border border-[#9ca3af]'
                          }`}
                        >
                          {isCurrent && <div className="size-1.5 rounded-full bg-[#0f1117]" />}
                        </div>
                        <span
                          className={`${
                            isCurrent ? 'font-medium text-[#0f1117]' : 'text-[#6b7280]'
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>
        </main>

        {/* Bottom Sticky Footer Bar (Node 146:8225) */}
        <footer className="sticky bottom-0 z-20 bg-white border-t border-[#e2e5ea] px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          {/* Left Status: Unsaved Changes / Last saved */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${isDirty ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`}
                aria-hidden="true"
              />
              <span className="text-[#6b7280]">
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
            <span className="text-[#9ca3af] font-mono">
              Last saved: {lastSaved || 'never'}
            </span>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 text-xs font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e2e5ea] rounded cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-medium text-[#4b5563] bg-white border border-[#e2e5ea] rounded hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#0f1117] transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0f1117] rounded hover:bg-[#1e2330] focus:outline-none focus:ring-2 focus:ring-[#0f1117] transition-colors shadow-sm"
            >
              {isSubmitting ? 'Proceeding...' : 'Next → Source Configuration'}
            </button>

            <button
              type="button"
              disabled
              title="Complete all 7 steps before publishing"
              className="px-3 py-1.5 text-xs font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e2e5ea] rounded cursor-not-allowed"
            >
              Publish
            </button>
          </div>
        </footer>

        {/* Modal 1: Import Template Modal */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-lg border border-[#e2e5ea] shadow-xl max-w-2xl w-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e2e5ea] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-[#0f1117]">
                    Import Pipeline Template
                  </h3>
                  <p className="text-xs text-[#6b7280]">
                    Select a pre-built blueprint to populate initial configuration and node pipeline structure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="text-[#9ca3af] hover:text-[#0f1117]"
                  aria-label="Close modal"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      handleSelectTemplate(tmpl);
                      setImportModalOpen(false);
                    }}
                    className="p-3 border border-[#e2e5ea] rounded hover:border-[#2563eb] hover:bg-[#eff6ff]/40 cursor-pointer transition-colors flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tmpl.icon}</span>
                      <span className="text-xs font-semibold text-[#0f1117]">{tmpl.name}</span>
                    </div>
                    <p className="text-[11px] text-[#6b7280]">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tmpl.defaultTags.map((t) => (
                        <span key={t} className="text-[10px] font-mono bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e5ea]">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4b5563] bg-white border border-[#e2e5ea] rounded hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Confirm Cancel / Discard Dialog */}
        {confirmCancelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-lg border border-[#e2e5ea] shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#fef2f2] flex items-center justify-center text-[#dc2626] shrink-0">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0f1117]">
                    Discard Unsaved Changes?
                  </h3>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    You have unsaved changes on this pipeline. Leaving now will discard your configuration.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4b5563] bg-white border border-[#e2e5ea] rounded hover:bg-[#f9fafb]"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/pipelines')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#dc2626] rounded hover:bg-[#b91c1c]"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
