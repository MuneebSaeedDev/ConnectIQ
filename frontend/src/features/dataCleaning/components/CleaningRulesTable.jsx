import React from 'react';
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
import CleaningRuleStatusBadge from './CleaningRuleStatusBadge';
import CleaningRuleTypeBadge from './CleaningRuleTypeBadge';

export default function CleaningRulesTable({
  rules,
  isLoading,
  selectedRuleIds,
  onSelectRule,
  onToggleStatus,
  onDelete,
  onEdit, // To be implemented later (Drawer/Modal)
  onTest, // To be implemented later
}) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-12 text-center animate-pulse">
        <div className="mx-auto size-8 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-slate-100 rounded-md w-48 mx-auto"></div>
      </div>
    );
  }

  if (!rules?.length) {
    return (
      <div className="bg-white border border-slate-200 border-dashed rounded-lg shadow-xs p-12 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No cleaning rules found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          There are no data cleaning rules matching your current filters, or none have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="relative px-4 sm:w-12 sm:px-6">
                 {/* Visual header spacing for checkboxes */}
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Target Field
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
            {rules.map((rule) => {
              const ruleId = rule._id || rule.ruleId;
              const isSelected = selectedRuleIds.includes(ruleId);

              return (
                <tr
                  key={ruleId}
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
                      onChange={() => onSelectRule(ruleId)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-slate-900">{rule.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] sm:max-w-xs md:max-w-sm truncate" title={rule.description}>
                          {rule.ruleId} • {rule.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <CleaningRuleTypeBadge category={rule.category} subType={rule.subType} />
                  </td>
                  <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {rule.targetField || 'Multiple Fields'}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm">
                    <CleaningRuleStatusBadge status={rule.status} />
                  </td>
                  <td className="hidden xl:table-cell whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <span className={`font-medium ${rule.pipelinesCount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {rule.pipelinesCount || 0}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <div className="text-slate-900">{new Date(rule.updatedAt).toLocaleDateString()}</div>
                    <div className="text-[11px]">{rule.updatedBy}</div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2 group">
                      {/* Quick Actions (visible on hover) */}
                      <button
                        onClick={() => onTopicAction(rule, 'test')}
                        className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 focus:outline-hidden focus:opacity-100"
                        title="Test/Preview Rule"
                      >
                        <SearchCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(ruleId)}
                        className={`p-1 transition-opacity focus:outline-hidden ${
                          rule.status === 'Active'
                            ? 'text-emerald-600 hover:text-amber-600 opacity-0 group-hover:opacity-100 focus:opacity-100'
                            : 'text-slate-400 hover:text-emerald-600'
                        }`}
                        title={rule.status === 'Active' ? 'Deactivate Rule' : 'Activate Rule'}
                      >
                        {rule.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Dropdown Menu (mocked as simple buttons for now per agent rules, could use a real dropdown component if available) */}
                      <div className="relative inline-block text-left ml-2">
                        <button className="text-slate-400 hover:text-slate-600 p-1 focus:outline-hidden">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {/* Hidden Dropdown overlay concept */}
                        <div className="hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden">
                           <div className="py-1">
                             <a href="#" className="flex px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Pencil className="mr-3 h-4 w-4 text-slate-400" /> Edit</a>
                             <a href="#" className="flex px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Copy className="mr-3 h-4 w-4 text-slate-400" /> Duplicate</a>
                             <a href="#" className="flex px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><History className="mr-3 h-4 w-4 text-slate-400" /> View History</a>
                             <a href="#" className="flex px-4 py-2 text-sm text-rose-600 hover:bg-slate-100" onClick={(e) => { e.preventDefault(); onDelete(rule); }}><Trash2 className="mr-3 h-4 w-4 text-rose-400" /> Delete</a>
                           </div>
                        </div>
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

// Dummy helper just for button prop usage right now
function onTopicAction(rule, actionType) {
  console.log(`Action ${actionType} triggered for ${rule.name}`);
}
