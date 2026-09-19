import React from 'react';
import { Search, Database, List, Key } from 'lucide-react';

export default function InputTargetSchemasSection({ inputSchema, targetSchema, mappings, onFieldClick }) {
  // Helper to determine active match highlighting
  const isSourceMapped = (fieldName) =>
    mappings?.some((m) => m.sourceField === fieldName && m.status !== 'missing');

  const isTargetMapped = (fieldName) =>
    mappings?.some((m) => m.targetField === fieldName && m.status !== 'missing');

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Schemas Overview</h2>
          <p className="text-sm text-slate-500">Source and destination schemas used in this mapping context.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">

        {/* Source Schema */}
        <div className="flex flex-col h-[400px]">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-800">Source Schema</h3>
            </div>
            <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {inputSchema?.fields?.length || 0} fields
            </span>
          </div>

          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search source fields..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
            <div className="space-y-1">
              {inputSchema?.fields?.map((field) => (
                <div
                  key={`src-${field.name}`}
                  onClick={() => onFieldClick?.('source', field)}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    isSourceMapped(field.name)
                      ? 'bg-white border-slate-200 opacity-70'
                      : 'bg-white border-slate-300 hover:border-indigo-400 hover:shadow-sm shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <List className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm font-mono text-slate-800 truncate">{field.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide ml-2">{field.type}</span>
                </div>
              ))}
              {(!inputSchema?.fields || inputSchema.fields.length === 0) && (
                <div className="text-center py-8 text-sm text-slate-500">
                  No source fields discovered yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Target Schema */}
        <div className="flex flex-col h-[400px]">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-medium text-slate-800">Target Schema</h3>
            </div>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
              {targetSchema?.fields?.length || 0} fields
            </span>
          </div>

          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search target fields..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
            <div className="space-y-1">
              {targetSchema?.fields?.map((field) => (
                <div
                  key={`tgt-${field.name}`}
                  onClick={() => onFieldClick?.('target', field)}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    isTargetMapped(field.name)
                      ? 'bg-white border-emerald-100 bg-emerald-50/30'
                      : 'bg-white border-slate-300 hover:border-emerald-400 hover:shadow-sm shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {field.primaryKey ? (
                      <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <List className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-sm font-mono text-slate-800 flex items-center">
                      {field.name}
                      {field.required && <span className="text-rose-500 ml-1 text-lg leading-none">*</span>}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide ml-2">{field.type}</span>
                </div>
              ))}
              {(!targetSchema?.fields || targetSchema.fields.length === 0) && (
                <div className="text-center py-8 text-sm text-slate-500">
                  No target fields discovered yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
