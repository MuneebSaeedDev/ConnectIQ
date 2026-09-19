import React from 'react';
import { AlertCircle, GitMerge as PipelineIcon } from 'lucide-react';
import { TypeConversionMatrix } from './TypeConversionMatrix';
import { TypeConversionRulesTable } from './TypeConversionRulesTable';

export const TypeConversionRulesContainer = ({
  data,
  pagination,
  filters,
  isLoading,
  isError,
  onTableChange,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus
}) => {
  const [activeTab, setActiveTab] = React.useState('rules');

  return (
    <div className="flex flex-col">
       <div className="flex items-center space-x-6 border-b border-slate-200 px-4 bg-slate-50">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Rules Library ({pagination?.total || data?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Type Conversion Matrix
          </button>
       </div>

      {activeTab === 'matrix' ? (
        <TypeConversionMatrix />
      ) : (
        <TypeConversionRulesTable
           data={data}
           pagination={pagination}
           filters={filters}
           isLoading={isLoading}
           isError={isError}
           onTableChange={onTableChange}
           onEdit={onEdit}
           onDelete={onDelete}
           onDuplicate={onDuplicate}
           onToggleStatus={onToggleStatus}
         />
      )}
    </div>
  );
};
