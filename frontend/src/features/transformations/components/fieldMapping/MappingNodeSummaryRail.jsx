import React from 'react';
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function MappingNodeSummaryRail({
  summary = {},
  nodeId = 'map_node_0041',
  pipelineId = 'customer-etl-v2',
  stageNumber = 3,
  totalStages = 7,
  onRunValidation,
  isValidating = false,
}) {
  const completion = summary.completionPercentage || 75;
  const passed = summary.validationSummary?.passed || 6;
  const warnings = summary.validationSummary?.warnings || 1;
  const errors = summary.validationSummary?.errors || 1;

  return (
    <aside
      className="w-full xl:w-[320px] shrink-0 space-y-4 text-xs select-none"
      aria-label="Node Configuration Summary"
    >
      {/* 1. Node Summary Card matching Figma 170:2820 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Node Summary
        </h3>

        {/* Status Badge */}
        <div>
          <span className="text-[11px] font-bold text-slate-700 block mb-1">
            Configuration Status
          </span>
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-md">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              Draft
            </span>
            <p className="text-[11px] text-amber-900 mt-1 leading-tight">
              Mapping incomplete. 1 required target field missing.
            </p>
          </div>
        </div>

        {/* Mapping Completeness Meter matching Figma 170:2832 */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Mapping Completeness</span>
            <span className="font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${completion}%` }}
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Overall completion</span>
        </div>

        {/* Metric counts grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-mono text-[11px]">
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Total Source Fields</span>
            <span className="font-bold text-slate-800">{summary.totalSourceFields || 18}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Mapped Fields</span>
            <span className="font-bold text-emerald-600">{summary.mappedFields || 6}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Unmapped Fields</span>
            <span className="font-bold text-slate-600">{summary.unmappedFields || 2}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Total Target Fields</span>
            <span className="font-bold text-slate-800">{summary.totalTargetFields || 14}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Required Mapped</span>
            <span className="font-bold text-blue-600">{summary.requiredFieldsMapped || '5 / 6'}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-slate-400 block">Transformations</span>
            <span className="font-bold text-purple-600">{summary.transformations || 4}</span>
          </div>
        </div>
      </div>

      {/* 2. Schema Summary matching Figma 170:2879 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Schema Summary
        </h3>
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Source Fields</span>
            <span className="font-mono font-bold text-slate-800">{summary.schemaSummary?.sourceFields || 18}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target Fields</span>
            <span className="font-mono font-bold text-slate-800">{summary.schemaSummary?.targetFields || 14}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Required Fields</span>
            <span className="font-mono font-bold text-rose-600">{summary.schemaSummary?.requiredFields || 9}</span>
          </div>
        </div>
      </div>

      {/* 3. Transformation Summary matching Figma 170:2898 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Transformation Summary
        </h3>
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Direct Mappings</span>
            <span className="font-mono font-bold text-blue-600">{summary.transformationSummary?.directMappings || 2}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Transformations</span>
            <span className="font-mono font-bold text-purple-600">{summary.transformationSummary?.transformations || 3}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Type Conversions</span>
            <span className="font-mono font-bold text-amber-600">{summary.transformationSummary?.typeConversions || 1}</span>
          </div>
        </div>
      </div>

      {/* 4. Validation Summary & Action matching Figma 170:2917 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Validation Summary
        </h3>

        <div className="space-y-2 font-medium">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Passed
            </span>
            <span className="font-mono font-bold">{passed}</span>
          </div>

          <div className="flex items-center justify-between text-amber-700">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              Warnings
            </span>
            <span className="font-mono font-bold">{warnings}</span>
          </div>

          <div className="flex items-center justify-between text-rose-700">
            <span className="flex items-center gap-1.5">
              <XCircle className="size-3.5" />
              Errors
            </span>
            <span className="font-mono font-bold">{errors}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunValidation}
          disabled={isValidating}
          className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
        >
          {isValidating ? 'Running Validation…' : 'Run Validation'}
        </button>
      </div>

      {/* 5. Mapping Status Breakdown matching Figma 170:2941 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Mapping Status
        </h3>
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Total Mappings</span>
            <span className="font-mono font-bold text-slate-800">{summary.mappingStatus?.totalMappings || 8}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Complete</span>
            <span className="font-mono font-bold text-emerald-600">{summary.mappingStatus?.complete || 6}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Incomplete</span>
            <span className="font-mono font-bold text-amber-600">{summary.mappingStatus?.incomplete || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Invalid</span>
            <span className="font-mono font-bold text-rose-600">{summary.mappingStatus?.invalid || 1}</span>
          </div>
        </div>
      </div>

      {/* 6. Context Metadata Footer matching Figma 170:2967 */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Node ID:</span>
          <span className="text-slate-700 font-bold">{nodeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Pipeline:</span>
          <span className="text-slate-700">{pipelineId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-sans">Stage:</span>
          <span className="text-slate-700 font-bold">{stageNumber} of {totalStages}</span>
        </div>
      </div>
    </aside>
  );
}
