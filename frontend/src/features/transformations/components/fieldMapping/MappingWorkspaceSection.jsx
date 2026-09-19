import React from 'react';
import { Search, Map, Plus, Trash2, ArrowRight, Settings2, Database, Key, Copy } from 'lucide-react';

export default function MappingWorkspaceSection({
  mappings,
  selectedMappingId,
  onSelectMapping,
  onAddMapping,
  onAutoMap,
  onClearAll,
  onEditMapping,
  onDuplicateMapping,
  onRemoveMapping,
}) {

  // Helper for badging mapping types
  const getMappingTypeStyle = (type) => {
    switch (type) {
      case 'Direct':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expression':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Lookup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Conditional':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cast':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Mapping Workspace</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Determine how source fields transport or morph into target schemas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            Clear All
          </button>
          <button
            onClick={onAutoMap}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Map className="size-3 text-indigo-500" />
            Auto-Map
          </button>
          <button
            onClick={onAddMapping}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-blue-600 outline outline-1 outline-blue-700 rounded hover:bg-blue-700 transition shadow-xs"
          >
            <Plus className="size-3" />
            Add Mapping
          </button>
        </div>
      </div>

      <div className="p-0 sm:p-2 divide-y divide-slate-100">
        {mappings?.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Map className="size-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No Mappings Configured</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start by adding a manual mapping, or use the auto-map feature based on schema similarity.
            </p>
            <button
              onClick={onAutoMap}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors inline-block"
            >
              Run Auto-Mapper
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-semibold text-slate-700 w-[45%]">Source Field</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-700 text-center w-24">Type</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-700 w-[43%]">Target Field</th>
                  <th className="px-4 py-2.5 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappings?.map((mapping) => (
                  <tr
                    key={mapping.id}
                    onClick={() => onSelectMapping(mapping.id)}
                    className={`group cursor-pointer transition-colors ${
                      selectedMappingId === mapping.id
                        ? 'bg-blue-50/50 hover:bg-blue-50/80 ring-1 ring-inset ring-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full flex-col">
                           <div className="flex items-center">
                             <Database className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                             <span className={`font-mono font-medium truncate ${mapping.sourceField === '—' ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                              {mapping.sourceField}
                             </span>
                           </div>
                           <div className="text-[10px] text-slate-500 uppercase font-mono mt-1 ml-5">
                             {mapping.srcType}
                           </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle text-center">
                       <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getMappingTypeStyle(mapping.mappingType)}`}>
                         {mapping.mappingType}
                       </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                         <div className="w-full flex-col">
                           <div className="flex items-center">
                             <ArrowRight className="w-3.5 h-3.5 text-slate-300 mr-2 shrink-0" />
                             <span className={`font-mono font-medium truncate ${mapping.targetField === '—' ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                              {mapping.targetField}
                             </span>
                           </div>
                           <div className="text-[10px] text-slate-500 uppercase font-mono mt-1 ml-5 flex items-center">
                             {mapping.tgtType}
                             {mapping.status === 'missing' && (
                                <span className="ml-2 text-rose-500 normal-case font-sans">(Missing in destination)</span>
                             )}
                           </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={(e) => { e.stopPropagation(); onEditMapping(mapping); }}
                           className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                           title="Configure Transformation"
                         >
                           <Settings2 className="w-3.5 h-3.5" />
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); onDuplicateMapping(mapping); }}
                           className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                           title="Duplicate"
                         >
                           <Copy className="w-3.5 h-3.5" />
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); onRemoveMapping(mapping.id); }}
                           className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                           title="Remove Mapping"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
