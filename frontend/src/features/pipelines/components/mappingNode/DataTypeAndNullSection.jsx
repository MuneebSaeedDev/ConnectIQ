import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DATA_TYPES, NULL_HANDLING_STRATEGIES } from '../../services/mappingNodeConfig.api';

export default function DataTypeAndNullSection({
  dataTypeConversion = {},
  nullHandling = {},
  updateDataTypeConversion,
  updateNullHandling,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* 08 DATA TYPE CONVERSION */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="datatype-conversion-heading"
      >
        {/* Header matching Figma 170:2404 */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              08
            </span>
            <h2 id="datatype-conversion-heading" className="text-sm font-bold text-slate-900">
              Data Type Conversion
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Source & Target Types Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="srcTypeConv" className="block font-semibold text-slate-700 mb-1">
                Source Type
              </label>
              <select
                id="srcTypeConv"
                value={dataTypeConversion.sourceType || 'DECIMAL'}
                onChange={(e) => updateDataTypeConversion('sourceType', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tgtTypeConv" className="block font-semibold text-slate-700 mb-1">
                Target Type
              </label>
              <select
                id="tgtTypeConv"
                value={dataTypeConversion.targetType || 'DECIMAL'}
                onChange={(e) => updateDataTypeConversion('targetType', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversion Rule */}
          <div>
            <label htmlFor="convRule" className="block font-semibold text-slate-700 mb-1">
              Conversion Rule
            </label>
            <input
              id="convRule"
              type="text"
              value={dataTypeConversion.conversionRule || 'CAST(x AS DECIMAL(10,2))'}
              onChange={(e) => updateDataTypeConversion('conversionRule', e.target.value)}
              className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Invalid Value Handling & Default */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="invHandling" className="block font-semibold text-slate-700 mb-1">
                Invalid Value Handling
              </label>
              <select
                id="invHandling"
                value={dataTypeConversion.invalidValueHandling || 'Use Default'}
                onChange={(e) => updateDataTypeConversion('invalidValueHandling', e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded shadow-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Use Default">Use Default</option>
                <option value="Nullify">Set to Null</option>
                <option value="Reject Record">Reject Record</option>
                <option value="Fail Pipeline">Fail Pipeline</option>
              </select>
            </div>

            <div>
              <label htmlFor="convDefault" className="block font-semibold text-slate-700 mb-1">
                Default Value
              </label>
              <input
                id="convDefault"
                type="text"
                value={dataTypeConversion.defaultValue || '0.00'}
                onChange={(e) => updateDataTypeConversion('defaultValue', e.target.value)}
                className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Precision warning callout matching Figma 170:2441 */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-md flex items-start gap-2 text-amber-900 text-[11px] leading-relaxed">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Precision warning:</span> Source DECIMAL may have higher precision than target DECIMAL(10,2). Values will be rounded. Verify with sample data.
            </div>
          </div>
        </div>
      </section>

      {/* 09 NULL & DEFAULT HANDLING */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="null-handling-heading"
      >
        {/* Header matching Figma 170:2445 */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="size-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              09
            </span>
            <h2 id="null-handling-heading" className="text-sm font-bold text-slate-900">
              Null &amp; Default Handling
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Strategy Radiogroup matching Figma 170:2451 */}
          <div>
            <span className="block font-semibold text-slate-700 mb-2">
              Null Handling Strategy
            </span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Null Handling Strategy">
              {NULL_HANDLING_STRATEGIES.map((strat) => {
                const isSelected = (nullHandling.strategy || 'default') === strat.value;
                return (
                  <label
                    key={strat.value}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 text-blue-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nullStrategy"
                      value={strat.value}
                      checked={isSelected}
                      onChange={() => updateNullHandling('strategy', strat.value)}
                      className="size-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs">{strat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Default Value */}
          <div>
            <label htmlFor="nullDefaultValue" className="block font-semibold text-slate-700 mb-1">
              Default Value
            </label>
            <input
              id="nullDefaultValue"
              type="text"
              value={nullHandling.defaultValue || 'UNKNOWN'}
              onChange={(e) => updateNullHandling('defaultValue', e.target.value)}
              placeholder="UNKNOWN"
              className="w-full h-8 px-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Default Expression */}
          <div>
            <label htmlFor="defaultExpr" className="block font-semibold text-slate-700 mb-1">
              Default Expression
            </label>
            <input
              id="defaultExpr"
              type="text"
              value={nullHandling.defaultExpression || "COALESCE(country_code, 'UNKNOWN')"}
              onChange={(e) => updateNullHandling('defaultExpression', e.target.value)}
              className="w-full h-8 px-2.5 text-xs font-mono text-blue-800 bg-blue-50/40 border border-blue-200 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
