import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';
import { DATA_TYPES } from '../../services/mappingNodeConfig.api';

export default function InputTargetSchemasSection({
  inputSchema,
  targetSchema,
  mappings = [],
  onRefreshInput,
  onRefreshTarget,
  onFieldClick,
}) {
  // Input schema filters
  const [srcSearch, setSrcSearch] = useState('');
  const [srcTypeFilter, setSrcTypeFilter] = useState('All');
  const [srcUnmappedOnly, setSrcUnmappedOnly] = useState(false);

  // Target schema filters
  const [tgtSearch, setTgtSearch] = useState('');
  const [tgtRequiredOnly, setTgtRequiredOnly] = useState(false);
  const [tgtUnmappedOnly, setTgtUnmappedOnly] = useState(false);

  const mappedSrcFields = useMemo(() => {
    return new Set(mappings.flatMap((m) => (m.sourceField || '').split(',').map((s) => s.trim())));
  }, [mappings]);

  const mappedTgtFields = useMemo(() => {
    return new Set(mappings.map((m) => m.targetField));
  }, [mappings]);

  // Filtered lists
  const filteredInputFields = useMemo(() => {
    return (inputSchema?.fields || []).filter((f) => {
      const matchName = !srcSearch || f.name.toLowerCase().includes(srcSearch.toLowerCase());
      const matchType = srcTypeFilter === 'All' || f.type === srcTypeFilter;
      const isMapped = mappedSrcFields.has(f.name);
      const matchUnmapped = !srcUnmappedOnly || !isMapped;
      return matchName && matchType && matchUnmapped;
    });
  }, [inputSchema?.fields, srcSearch, srcTypeFilter, srcUnmappedOnly, mappedSrcFields]);

  const filteredTargetFields = useMemo(() => {
    return (targetSchema?.fields || []).filter((f) => {
      const matchName = !tgtSearch || f.name.toLowerCase().includes(tgtSearch.toLowerCase());
      const matchReq = !tgtRequiredOnly || f.required;
      const isMapped = mappedTgtFields.has(f.name);
      const matchUnmapped = !tgtUnmappedOnly || !isMapped;
      return matchName && matchReq && matchUnmapped;
    });
  }, [targetSchema?.fields, tgtSearch, tgtRequiredOnly, tgtUnmappedOnly, mappedTgtFields]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* 02 INPUT SCHEMA */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="input-schema-heading"
      >
        {/* Header matching Figma 170:1653 */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="size-5 rounded bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
              02
            </span>
            <h2 id="input-schema-heading" className="text-xs font-bold text-slate-900">
              Input Schema
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              SOURCE
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshInput}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="size-3 text-slate-400" />
            Refresh
          </button>
        </div>

        {/* Source metadata summary badges matching Figma 170:1664 */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200 text-[11px] grid grid-cols-3 gap-2 font-mono">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Source Node
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {inputSchema?.sourceNode || 'filter_node_02'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Dataset
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {inputSchema?.dataset || 'customers_raw'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Schema Version
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {inputSchema?.schemaVersion || '3.1.0'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Total Fields
            </span>
            <span className="text-slate-800 font-semibold">
              {inputSchema?.totalFields || 18}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Est. Records
            </span>
            <span className="text-slate-800 font-semibold">
              {inputSchema?.estRecords || '4.2M'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Last Refreshed
            </span>
            <span className="text-slate-800 font-semibold">
              {inputSchema?.lastRefreshed || '08:14 UTC'}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={srcSearch}
              onChange={(e) => setSrcSearch(e.target.value)}
              placeholder="Search fields…"
              className="w-full pl-8 pr-2.5 h-7 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={srcTypeFilter}
            onChange={(e) => setSrcTypeFilter(e.target.value)}
            className="h-7 text-xs bg-white border border-slate-200 rounded px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Filter input fields by type"
          >
            <option value="All">All Types</option>
            {DATA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSrcUnmappedOnly((prev) => !prev)}
            className={`h-7 px-2.5 text-xs font-medium rounded border transition-colors ${
              srcUnmappedOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unmapped Only
          </button>
        </div>

        {/* Input fields table */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2 px-3 font-semibold">Field Name</th>
                <th scope="col" className="py-2 px-3 font-semibold">Type</th>
                <th scope="col" className="py-2 px-2 font-semibold text-center">Null</th>
                <th scope="col" className="py-2 px-3 font-semibold">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredInputFields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                    No source fields match criteria
                  </td>
                </tr>
              ) : (
                filteredInputFields.map((f) => {
                  const isMapped = mappedSrcFields.has(f.name);
                  return (
                    <tr
                      key={f.name}
                      onClick={() => onFieldClick && onFieldClick('source', f)}
                      className="hover:bg-blue-50/50 cursor-pointer group transition-colors"
                    >
                      <td className="py-2 px-3 flex items-center gap-1.5 font-medium text-slate-900">
                        <span
                          className={`size-1.5 rounded-full shrink-0 ${
                            isMapped ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={isMapped ? 'Mapped' : 'Unmapped'}
                        />
                        <span className="group-hover:text-blue-600">{f.name}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {f.type}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-slate-500">
                        {f.nullable ? 'YES' : 'NO'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[120px]" title={f.sample}>
                        {f.sample || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 03 TARGET SCHEMA */}
      <section
        className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
        aria-labelledby="target-schema-heading"
      >
        {/* Header matching Figma 170:1816 */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="size-5 rounded bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
              03
            </span>
            <h2 id="target-schema-heading" className="text-xs font-bold text-slate-900">
              Target Schema
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              TARGET
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshTarget}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="size-3 text-slate-400" />
            Refresh
          </button>
        </div>

        {/* Target metadata summary badges matching Figma 170:1824 */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200 text-[11px] grid grid-cols-3 gap-2 font-mono">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Target Node
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {targetSchema?.targetNode || 'crm_loader_01'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Dataset
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {targetSchema?.dataset || 'customers_unified'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Schema Version
            </span>
            <span className="text-slate-800 font-semibold truncate block">
              {targetSchema?.schemaVersion || '1.8.2'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Total Fields
            </span>
            <span className="text-slate-800 font-semibold">
              {targetSchema?.totalFields || 14}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Required Fields
            </span>
            <span className="text-rose-600 font-semibold">
              {targetSchema?.requiredFields || 9}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block leading-tight">
              Schema Mode
            </span>
            <span className="text-slate-800 font-semibold">
              {targetSchema?.schemaMode || 'STRICT'}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tgtSearch}
              onChange={(e) => setTgtSearch(e.target.value)}
              placeholder="Search fields…"
              className="w-full pl-8 pr-2.5 h-7 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setTgtRequiredOnly((prev) => !prev)}
            className={`h-7 px-2.5 text-xs font-medium rounded border transition-colors ${
              tgtRequiredOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Required Only
          </button>

          <button
            type="button"
            onClick={() => setTgtUnmappedOnly((prev) => !prev)}
            className={`h-7 px-2.5 text-xs font-medium rounded border transition-colors ${
              tgtUnmappedOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unmapped Only
          </button>
        </div>

        {/* Target fields table */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th scope="col" className="py-2 px-3 font-semibold">Field Name</th>
                <th scope="col" className="py-2 px-3 font-semibold">Type</th>
                <th scope="col" className="py-2 px-2 font-semibold text-center">Req</th>
                <th scope="col" className="py-2 px-3 font-semibold">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredTargetFields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                    No target fields match criteria
                  </td>
                </tr>
              ) : (
                filteredTargetFields.map((f) => {
                  const isMapped = mappedTgtFields.has(f.name);
                  return (
                    <tr
                      key={f.name}
                      onClick={() => onFieldClick && onFieldClick('target', f)}
                      className="hover:bg-blue-50/50 cursor-pointer group transition-colors"
                    >
                      <td className="py-2 px-3 flex items-center gap-1.5 font-medium text-slate-900">
                        <span
                          className={`size-1.5 rounded-full shrink-0 ${
                            isMapped ? 'bg-emerald-500' : f.required ? 'bg-rose-500' : 'bg-slate-300'
                          }`}
                          title={isMapped ? 'Mapped' : f.required ? 'Required & Missing' : 'Optional Unmapped'}
                        />
                        <span className="group-hover:text-blue-600">{f.name}</span>
                        {f.required && (
                          <span className="text-[9px] text-rose-600 font-sans font-bold uppercase bg-rose-50 px-1 py-0.2 rounded">
                            REQ
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {f.type}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-[10px]">
                        {f.required ? (
                          <span className="font-bold text-rose-600">YES</span>
                        ) : (
                          <span className="text-slate-400">no</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[120px]" title={f.defaultValue}>
                        {f.defaultValue || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
