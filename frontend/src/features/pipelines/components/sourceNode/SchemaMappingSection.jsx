import React from 'react';
import {
  TARGET_DATA_TYPES,
} from '../../services/sourceNodeConfig.api';
import {
  RotateCcw,
  Zap,
  ArrowUpToLine,
  ArrowDownToLine,
  Search,
} from 'lucide-react';

export default function SchemaMappingSection({
  form,
  updateSchemaMapping,
  toggleAllSchemaSelected,
  onAutoDetect,
}) {
  const schemaMappings = form.schemaMappings || [];
  const allSelected = schemaMappings.length > 0 && schemaMappings.every((r) => r.selected);
  const indeterminate = !allSelected && schemaMappings.some((r) => r.selected);

  const handleSelectAllChange = (e) => {
    toggleAllSchemaSelected(e.target.checked);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="schema-mapping-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
            7
          </div>
          <div>
            <h2 id="schema-mapping-heading" className="text-sm font-semibold text-slate-900 leading-tight">
              Schema Mapping
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Field-level type mapping, nullable controls, and validation rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onAutoDetect}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <Zap className="size-3.5 text-slate-500" />
            Auto Detect
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <ArrowUpToLine className="size-3.5 text-slate-500" />
            Import
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors shrink-0"
          >
            <ArrowDownToLine className="size-3.5 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search fields…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-8 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
              defaultValue="All Types"
              aria-label="Filter by type"
            >
              <option value="All Types">All Types</option>
              <option value="Numeric">Numeric</option>
              <option value="String">String</option>
              <option value="Date/Time">Date/Time</option>
            </select>
            <select
              className="px-8 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
              defaultValue="All Fields"
              aria-label="Filter by field status"
            >
              <option value="All Fields">All Fields</option>
              <option value="Mapped">Mapped</option>
              <option value="Unmapped">Unmapped</option>
            </select>
          </div>
        </div>

        {/* Schema Table */}
        <div className="border border-slate-200 rounded-md overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap" role="table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = indeterminate;
                    }}
                    onChange={handleSelectAllChange}
                    className="size-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    aria-label="Select all schema fields"
                  />
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">Field ↕</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">Source Type ↕</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">Target Type ↕</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600 text-center">Nullable ↕</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">Default Value ↕</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-slate-600">Validation Rule ↕</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemaMappings.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) => updateSchemaMapping(row.id, { selected: e.target.checked })}
                      className="size-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      aria-label={`Select ${row.field}`}
                    />
                  </td>
                  <td className="px-4 py-2 font-mono font-medium text-slate-800">
                    {row.field}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono leading-none bg-slate-100 text-slate-600 border border-slate-200">
                      {row.source_type}
                    </span>
                  </td>
                  <td className="px-4 py-1.5">
                    <select
                      value={row.target_type}
                      onChange={(e) => updateSchemaMapping(row.id, { target_type: e.target.value })}
                      className="w-28 px-2 py-1 text-[11px] font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-slate-400 cursor-pointer"
                      aria-label={`Target type for ${row.field}`}
                    >
                      {TARGET_DATA_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-1.5 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.nullable}
                      onClick={() => updateSchemaMapping(row.id, { nullable: !row.nullable })}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                        row.nullable ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                      aria-label={`Allow null values for ${row.field}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block size-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          row.nullable ? 'translate-x-1.5' : '-translate-x-1.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-1.5">
                    <input
                      type="text"
                      value={row.default_value}
                      onChange={(e) => updateSchemaMapping(row.id, { default_value: e.target.value })}
                      className="w-24 px-2 py-1 text-[11px] font-mono rounded-md border border-transparent hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-transparent text-slate-600 transition-colors"
                      aria-label={`Default value for ${row.field}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[120px]" title={row.validation_rule}>
                      {row.validation_rule}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
