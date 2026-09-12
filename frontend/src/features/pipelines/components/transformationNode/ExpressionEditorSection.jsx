import React from 'react';
import { DATA_TYPES } from '../../services/transformationNodeConfig.api';
import { Code2, CheckCircle2, Play, Sparkles } from 'lucide-react';

const EXPRESSION_SNIPPET_CATEGORIES = [
  'String',
  'Numeric',
  'Date / Time',
  'Logical',
  'Null',
  'Conversion',
  'Conditional',
  'Format',
];

const SNIPPET_EXAMPLES = {
  String: 'CONCAT(TRIM(first_name), " ", UPPER(last_name))',
  Numeric: 'ROUND(unit_price * (1 - discount_rate), 2)',
  'Date / Time': 'DATE_ADD(order_date, INTERVAL 30 DAY)',
  Logical: 'IF(is_active AND credit_score > 700, "APPROVED", "REVIEW")',
  Null: 'COALESCE(alternate_email, primary_email, "no-email@domain.com")',
  Conversion: 'CAST(total_amount AS DECIMAL(10,2))',
  Conditional: 'CASE WHEN status = 1 THEN "NEW" WHEN status = 2 THEN "PROCESSED" ELSE "UNKNOWN" END',
  Format: 'REGEXP_REPLACE(phone_number, "[^0-9]", "")',
};

export default function ExpressionEditorSection({
  expressionEditor = {},
  expressionTab = 'String',
  onSetExpressionTab,
  onUpdateNestedField,
}) {
  const insertSnippet = (category) => {
    onSetExpressionTab(category);
    const snippet = SNIPPET_EXAMPLES[category];
    if (snippet) {
      onUpdateNestedField(
        'expressionEditor',
        'expression',
        `output_field = ${snippet}`
      );
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Expression Editor</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Custom expression with field autocomplete and syntax validation
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Output Field & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Output Field <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={expressionEditor.outputField || 'full_name'}
              onChange={(e) => onUpdateNestedField('expressionEditor', 'outputField', e.target.value)}
              placeholder="e.g. full_name"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Output Type
            </label>
            <select
              value={expressionEditor.outputType || 'String'}
              onChange={(e) => onUpdateNestedField('expressionEditor', 'outputType', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
            >
              {DATA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expression Category Buttons matching Figma 220:6719 - 220:6736 */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="text-xs font-medium text-slate-700">Expression Syntax</label>
            <span className="text-[11px] text-slate-400">Click category to load template</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {EXPRESSION_SNIPPET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => insertSnippet(cat)}
                className={`text-[11px] px-2.5 py-1 rounded font-medium transition ${
                  expressionTab === cat
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Monospace Code Box matching Figma 220:6739 - 220:6741 */}
          <div className="mt-2 bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs shadow-inner">
            <div className="text-slate-400 text-[11px] select-none mb-1">
              {expressionEditor.comment || '// Full name from first + last'}
            </div>
            <textarea
              rows={3}
              value={expressionEditor.expression || 'output_field = CONCAT(TRIM(first_name), " ", UPPER(last_name))'}
              onChange={(e) => onUpdateNestedField('expressionEditor', 'expression', e.target.value)}
              className="w-full bg-transparent text-emerald-400 focus:outline-none resize-y font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Validation Bar matching Figma 220:6744 */}
        <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>Expression valid · Output type: {expressionEditor.outputType || 'String'}</span>
        </div>

        {/* Evaluation Preview Grid matching Figma 220:6750 - 220:6757 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Input Sample</span>
            <span className="text-xs font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
              {expressionEditor.inputSample || 'first_name="alice", last_name="smith"'}
            </span>
          </div>

          <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg">
            <span className="text-[11px] font-semibold text-blue-700 block mb-1">Evaluated Output</span>
            <span className="text-xs font-mono font-bold text-blue-900 bg-white px-2 py-1 rounded border border-blue-200 block truncate">
              {expressionEditor.evaluatedOutput || '"alice SMITH"'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
