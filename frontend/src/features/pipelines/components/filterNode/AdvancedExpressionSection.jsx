import React from 'react';
import { Code2, Database, Terminal, Sparkles } from 'lucide-react';

export default function AdvancedExpressionSection({
  filterMode,
  form,
  updateField,
}) {
  if (filterMode === 'basic') return null;

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden"
      aria-labelledby="section-advanced-editor"
    >
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filterMode === 'advanced' && <Code2 className="size-4 text-purple-600" />}
          {filterMode === 'sql' && <Database className="size-4 text-blue-600" />}
          {filterMode === 'script' && <Terminal className="size-4 text-emerald-600" />}
          <h2 id="section-advanced-editor" className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            {filterMode === 'advanced' && 'Advanced Expression Editor'}
            {filterMode === 'sql' && 'SQL WHERE Clause Editor'}
            {filterMode === 'script' && 'Custom Script Filter (Python / JS)'}
          </h2>
        </div>

        <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          Engine: Apache Spark / Arrow Core
        </span>
      </div>

      <div className="p-5 space-y-4">
        {filterMode === 'advanced' && (
          <>
            <p className="text-xs text-slate-500">
              Enter a boolean expression using dataset column names, relational operators (<code>==, !=, &gt;, &lt;, &gt;=, &lt;=</code>), boolean logic (<code>&amp;&amp;, ||, !</code>), and built-in functions (<code>in, contains, is_null, regex_match</code>).
            </p>
            <div className="space-y-1.5">
              <label htmlFor="advancedExpression" className="block text-xs font-semibold text-slate-700">
                Boolean Expression
              </label>
              <textarea
                id="advancedExpression"
                rows={5}
                value={form.advancedExpression || ''}
                onChange={(e) => updateField('advancedExpression', e.target.value)}
                placeholder='e.g. (status == "active" && revenue > 1000 && in(country_code, ["US","GB","DE","FR"]))'
                className="w-full p-3 text-xs font-mono text-blue-100 bg-slate-900 border border-slate-800 rounded-lg shadow-inner focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 resize-y"
              />
            </div>
          </>
        )}

        {filterMode === 'sql' && (
          <>
            <p className="text-xs text-slate-500">
              Provide an ANSI-compliant SQL predicate to filter rows directly. This WHERE clause is pushed down to source engines whenever supported.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="sqlWhereClause" className="block text-xs font-semibold text-slate-700">
                SQL Predicate (WHERE ...)
              </label>
              <textarea
                id="sqlWhereClause"
                rows={5}
                value={form.sqlWhereClause || ''}
                onChange={(e) => updateField('sqlWhereClause', e.target.value)}
                placeholder="status = 'active' AND revenue > 1000 AND country_code IN ('US','GB','DE','FR')"
                className="w-full p-3 text-xs font-mono text-emerald-100 bg-slate-900 border border-slate-800 rounded-lg shadow-inner focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 resize-y"
              />
            </div>
          </>
        )}

        {filterMode === 'script' && (
          <>
            <p className="text-xs text-slate-500">
              Write a Python record filter function. Return <code>True</code> to retain the record or <code>False</code> to discard it.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="customScript" className="block text-xs font-semibold text-slate-700">
                Filter Function Definition
              </label>
              <textarea
                id="customScript"
                rows={8}
                value={form.customScript || ''}
                onChange={(e) => updateField('customScript', e.target.value)}
                placeholder={`def filter_record(record):\n    return record.get("status") == "active"`}
                className="w-full p-3 text-xs font-mono text-amber-100 bg-slate-900 border border-slate-800 rounded-lg shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 resize-y"
              />
            </div>
          </>
        )}

        {/* Quick Syntax Assist Chips */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
            <Sparkles className="size-3 text-amber-500" />
            Quick Reference & Tokens
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {['status', 'revenue', 'country_code', 'customer_name', 'order_id', 'order_date', 'channel'].map((field) => (
              <span
                key={field}
                className="font-mono text-[11px] px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800 shadow-2xs cursor-pointer hover:bg-slate-100"
                title={`Insert ${field}`}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
