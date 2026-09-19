import React from 'react';
import { RefreshCw, Download, Upload, Plus } from 'lucide-react';

export const TypeConversionRulesHeader = ({ onCreateClick, onRefresh }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Type Conversion Rules
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage reusable data-type conversion rules for ETL pipelines to ensure data compatibility.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Refresh
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Import
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Conversion Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
