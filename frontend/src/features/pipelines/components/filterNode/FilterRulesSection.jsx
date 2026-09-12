import React from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Code,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  OPERATOR_OPTIONS,
  DATA_TYPE_OPTIONS,
  NULL_HANDLING_OPTIONS,
  generateExpressionFromRules,
} from '../../services/filterNodeConfig.api';

export default function FilterRulesSection({
  basicRules,
  inputSchema = [],
  setLogic,
  toggleNotGroup,
  addRule,
  removeRule,
  updateRule,
}) {
  const logic = basicRules?.logic || 'AND';
  const notGroup = basicRules?.notGroup || false;
  const rules = basicRules?.rules || [];

  const generatedExpr = generateExpressionFromRules(basicRules);

  const availableFields = inputSchema.length > 0
    ? inputSchema
    : [
        { name: 'status', type: 'STRING' },
        { name: 'revenue', type: 'DECIMAL' },
        { name: 'country_code', type: 'STRING' },
        { name: 'customer_name', type: 'STRING' },
        { name: 'order_id', type: 'INTEGER' },
        { name: 'order_date', type: 'DATE' },
        { name: 'email', type: 'STRING' },
        { name: 'channel', type: 'STRING' },
      ];

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-filter-rules"
    >
      {/* Header & Logic Controls matching Figma 157:3863 */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 id="section-filter-rules" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Filter Rules
          </h2>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs">
            <span className="text-[11px] font-medium text-slate-500">Logic:</span>
            <div className="inline-flex p-0.5 bg-slate-200/80 rounded-md">
              <button
                type="button"
                onClick={() => setLogic('AND')}
                className={`px-2.5 py-0.5 text-xs font-bold rounded transition ${
                  logic === 'AND'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => setLogic('OR')}
                className={`px-2.5 py-0.5 text-xs font-bold rounded transition ${
                  logic === 'OR'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OR
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleNotGroup}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
              notGroup
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Invert entire condition group"
          >
            {notGroup ? (
              <span className="size-2 rounded-full bg-rose-500" />
            ) : (
              <span className="size-2 rounded-full bg-slate-300" />
            )}
            NOT Group
          </button>

          <button
            type="button"
            onClick={addRule}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-2xs"
          >
            <Plus className="size-3.5" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Rule Rows Container matching Figma 157:3881 */}
      <div className="p-5 space-y-3">
        {rules.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
            No filter rules configured. Click <strong>+ Add Rule</strong> to define filtering conditions.
          </div>
        ) : (
          rules.map((rule, idx) => (
            <React.Fragment key={rule.id || idx}>
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col xl:flex-row xl:items-center gap-3 transition hover:border-slate-300 shadow-2xs">
                {/* Drag Handle & Order */}
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <GripVertical className="size-4 cursor-grab text-slate-400 hover:text-slate-600" />
                  <span className="size-5 rounded-full bg-slate-200/80 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                {/* Field Select */}
                <div className="flex-1 min-w-[130px] space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Field
                  </label>
                  <select
                    value={rule.field || ''}
                    onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableFields.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operator Select */}
                <div className="flex-1 min-w-[140px] space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Operator
                  </label>
                  <select
                    value={rule.operator || 'equals'}
                    onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {OPERATOR_OPTIONS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value Input */}
                <div className="flex-1 min-w-[150px] space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Value
                  </label>
                  <input
                    type="text"
                    disabled={rule.operator === 'is_null' || rule.operator === 'is_not_null'}
                    value={rule.value || ''}
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                    placeholder={rule.operator === 'in_list' ? 'US,GB,DE,FR' : 'e.g. active'}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Data Type Select */}
                <div className="w-28 shrink-0 space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Data Type
                  </label>
                  <select
                    value={rule.dataType || 'STRING'}
                    onChange={(e) => updateRule(rule.id, 'dataType', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs"
                  >
                    {DATA_TYPE_OPTIONS.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Null Handling Select */}
                <div className="w-32 shrink-0 space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Null Handling
                  </label>
                  <select
                    value={rule.nullHandling || 'EXCLUDE'}
                    onChange={(e) => updateRule(rule.id, 'nullHandling', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs"
                  >
                    {NULL_HANDLING_OPTIONS.map((nh) => (
                      <option key={nh.value} value={nh.value}>
                        {nh.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Case Sensitive Toggle & Delete */}
                <div className="flex items-center gap-3 self-end xl:self-center shrink-0 pt-3 xl:pt-4">
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, 'caseSensitive', !rule.caseSensitive)}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition ${
                      rule.caseSensitive
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                    }`}
                    title="Case-sensitive string evaluation"
                  >
                    {rule.caseSensitive ? (
                      <ToggleRight className="size-4 text-purple-600" />
                    ) : (
                      <ToggleLeft className="size-4 text-slate-400" />
                    )}
                    Case
                  </button>

                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    aria-label={`Remove rule ${idx + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Conjunction Indicator between rules */}
              {idx < rules.length - 1 && (
                <div className="flex items-center justify-center -my-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 tracking-wider shadow-2xs">
                    {logic}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))
        )}

        {/* Generated Expression Card matching Figma 157:4031 */}
        <div className="mt-4 p-3.5 bg-slate-900 rounded-lg text-slate-100 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-slate-400">
              <Code className="size-3.5 text-blue-400" />
              Generated Expression
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Check className="size-3" /> Syntax OK
            </span>
          </div>
          <div className="font-mono text-xs text-blue-200 bg-slate-950/80 p-2.5 rounded border border-slate-800 overflow-x-auto select-all">
            {generatedExpr}
          </div>
        </div>
      </div>
    </section>
  );
}
