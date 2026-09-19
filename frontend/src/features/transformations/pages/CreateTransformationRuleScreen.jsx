import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useTransformationRuleForm } from '../hooks/useTransformationRuleForm';

// Form Subcomponents
import CreateRuleHeader from '../components/createRule/CreateRuleHeader';
import RuleBasicInfoSection from '../components/createRule/RuleBasicInfoSection';
import TransformationTypeSelector from '../components/createRule/TransformationTypeSelector';
import RuleFieldsSection from '../components/createRule/RuleFieldsSection';
import RuleLogicSection from '../components/createRule/RuleLogicSection';
import RuleLogicBuilderSection from '../components/createRule/RuleLogicBuilderSection';
import RuleTestPreviewSection from '../components/createRule/RuleTestPreviewSection';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateTransformationRuleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    existingRule,
    isLoadingRule,
    createRule,
    isCreating,
    updateRule,
    isUpdating,
    feedbackError,
    clearFeedbackError,
  } = useTransformationRuleForm(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Data Cleaning',
    type: 'rule_based',
    status: 'Active',
    inputField: '',
    outputField: '',
    sourceType: 'String',
    targetType: 'String',
    operation: 'Normalize Case + Trim',
    parameters: { case: 'lowercase', trim: true, whitespace: 'trim' },
    expression: '',
    tags: [],
    isGlobal: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingRule && isEditMode) {
      setFormData({
        name: existingRule.name || '',
        description: existingRule.description || '',
        category: existingRule.category || 'Data Cleaning',
        type: existingRule.type || 'rule_based',
        status: existingRule.status || 'Active',
        inputField: existingRule.inputField || '',
        outputField: existingRule.outputField || '',
        sourceType: existingRule.sourceType || 'String',
        targetType: existingRule.targetType || 'String',
        operation: existingRule.operation || 'Normalize Case + Trim',
        parameters: existingRule.parameters || {},
        expression: existingRule.expression || '',
        tags: existingRule.tags || [],
        isGlobal: existingRule.isGlobal || false,
      });
    }
  }, [existingRule, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleParameterChange = (paramKey, value) => {
    setFormData((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramKey]: value,
      },
    }));
  };

  const handleExpressionChange = (expression) => {
    setFormData((prev) => ({
      ...prev,
      expression,
    }));
    if (errors.expression) {
      setErrors((prev) => ({ ...prev, expression: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Rule name is required';
    if (!formData.inputField?.trim()) errs.inputField = 'Source field is required';
    if (!formData.outputField?.trim()) errs.outputField = 'Target/output field is required';

    if (formData.category === 'Custom Expression' && !formData.expression?.trim()) {
      errs.expression = 'An expression formula is required for Custom Expression rules';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (targetStatus = 'Active') => {
    if (!validate()) return;
    clearFeedbackError();

    const payload = {
      ...formData,
      status: targetStatus,
    };

    try {
      if (isEditMode) {
        await updateRule(payload);
      } else {
        await createRule(payload);
      }
    } catch (_err) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    navigate('/transformations/rules');
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <AppShell
      breadcrumb={[
        'ConnectIQ',
        'Transformations',
        isEditMode ? 'Edit Transformation Rule' : 'Create Transformation Rule',
      ]}
    >
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Action Bar */}
          <CreateRuleHeader
            isEditMode={isEditMode}
            onSave={() => handleSubmit('Active')}
            onSaveAsDraft={() => handleSubmit('Draft')}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />

          {/* Feedback Errors */}
          {feedbackError && (
            <div className="p-4 rounded-md bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          {/* 1. Basic Info */}
          <RuleBasicInfoSection
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

          {/* 2. Transformation Type Paradigm */}
          <TransformationTypeSelector
            selectedCategory={formData.category}
            onSelectCategory={handleCategorySelect}
          />

          {/* 3. Field Definitions */}
          <RuleFieldsSection
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />

          {/* 4. Logic & Parameters Builder */}
          <RuleLogicBuilderSection
            category={formData.category}
            parameters={formData.parameters}
            onParameterChange={handleParameterChange}
            expression={formData.expression}
            onExpressionChange={handleExpressionChange}
          />

          {/* 5. Interactive Testing & Simulator Preview */}
          <RuleTestPreviewSection formData={formData} />

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            >
              Cancel
            </button>
            {!isEditMode && (
              <button
                type="button"
                onClick={() => handleSubmit('Draft')}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
              >
                Save as Draft
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit('Active')}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-xs focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Rule...' : isEditMode ? 'Update Rule' : 'Save & Publish Rule'}
            </button>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
