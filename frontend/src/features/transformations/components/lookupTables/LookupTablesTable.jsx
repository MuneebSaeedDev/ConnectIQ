import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  CheckCircle2,
  Ban,
  Pencil,
  Copy,
  Trash2,
  SearchCode,
  History,
  Info,
} from 'lucide-react';
import LookupTableStatusBadge from './LookupTableStatusBadge';
import LookupTypeBadge from './LookupTypeBadge';

export default function LookupTablesTable({
  tables,
  isLoading,
  selectedTableIds,
  onSelectTable,
  onToggleStatus,
  onDelete,
  onEdit,
  onTest,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (e, id) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-12 text-center animate-pulse">
        <div className="mx-auto size-8 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-slate-100 rounded-md w-48 mx-auto"></div>
      </div>
    );
  }

  if (!tables?.length) {
    return (
      <div className="bg-white border border-slate-200 border-dashed rounded-lg shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No lookup tables found</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Create your first lookup table to start enriching your pipeline data, or adjust your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden pb-[120px]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="relative px-4 sm:w-12 sm:px-6">
                 {/* Visual header spacing for checkboxes */}
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Table Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Lookup Type
              </th>
              <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Key → Return Field
              </th>
              <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="hidden xl:table-cell px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Pipelines
              </th>
              <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tables.map((table) => {
              const tableId = table._id || table.id;
              const isSelected = selectedTableIds.includes(tableId);

              return (
                <tr
                  key={tableId}
                  className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="relative px-4 sm:w-12 sm:px-6">
                    {isSelected && (
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-600" />
                    )}
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                      checked={isSelected}
                      onChange={() => onSelectTable(tableId)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="max-w-[200px] sm:max-w-xs md:max-w-sm">
                        <div className="font-medium text-slate-900 truncate" title={table.name}>{table.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={table.description}>
                           {table.records?.toLocaleString() || 0} records • {table.dataSource}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <LookupTypeBadge type={table.type} />
                  </td>
                  <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 overflow-hidden max-w-[220px]">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[90px]" title={table.keyField}>
                        {table.keyField}
                      </span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={table.returnFields?.join(', ')}>
                        {table.returnFields?.[0] || 'Unknown'} {table.returnFields?.length > 1 && `(+${table.returnFields.length - 1})`}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm">
                    <LookupTableStatusBadge status={table.status} />
                  </td>
                  <td className="hidden xl:table-cell whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <span className={`font-medium ${table.pipelinesCount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {table.pipelinesCount || 0}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div className="text-slate-900">{new Date(table.lastUpdated || Date.now()).toLocaleDateString()}</div>
                    <div className="text-[11px] truncate max-w-[120px]">{table.updatedBy}</div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2 group">
                      <button
                        onClick={() => onTest(table)}
                        className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 focus:outline-hidden focus:opacity-100"
                        title="Test Lookup Table"
                      >
                        <SearchCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(tableId)}
                        className={`p-1 transition-opacity focus:outline-hidden ${
                          table.status === 'Active'
                            ? 'text-emerald-600 hover:text-amber-600 opacity-0 group-hover:opacity-100 focus:opacity-100'
                            : 'text-slate-400 hover:text-emerald-600'
                        }`}
                        title={table.status === 'Active' ? 'Deactivate Table' : 'Activate Table'}
                      >
                        {table.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Dropdown Menu */}
                      <div className="relative inline-block text-left ml-2" ref={openDropdownId === tableId ? dropdownRef : null}>
                        <button
                          onClick={(e) => handleDropdownClick(e, tableId)}
                          className={`p-1 focus:outline-hidden transition-colors rounded ${
                            openDropdownId === tableId ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === tableId && (
                          <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden">
                             <div className="py-1">
                               <button
                                 onClick={() => { onEdit(table); setOpenDropdownId(null); }}
                                 className="flex w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
                                >
                                 <Pencil className="mr-3 h-4 w-4 text-slate-400" /> Edit
                               </button>
                               <button
                                 onClick={() => { setOpenDropdownId(null); }}
                                 className="flex w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
                                >
                                 <Copy className="mr-3 h-4 w-4 text-slate-400" /> Duplicate
                               </button>
                               <button
                                 onClick={() => { setOpenDropdownId(null); }}
                                 className="flex w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
                                >
                                 <History className="mr-3 h-4 w-4 text-slate-400" /> View History
                               </button>
                               <button
                                 onClick={() => { onDelete(table); setOpenDropdownId(null); }}
                                 className="flex w-full px-4 py-2 text-sm text-left text-rose-600 hover:bg-slate-100"
                                >
                                 <Trash2 className="mr-3 h-4 w-4 text-rose-400" /> Delete
                               </button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
