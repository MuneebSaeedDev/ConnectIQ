import React from 'react';
import {
  CONNECTOR_TYPES,
  CONNECTOR_INSTANCES,
  CONNECTION_PROFILES,
  ENVIRONMENTS,
  REGIONS,
} from '../../services/sourceNodeConfig.api';
import { CheckCircle2 } from 'lucide-react';

export default function SourceConnectorSection({
  form,
  updateField,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="source-connector-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
            2
          </div>
          <div>
            <h2 id="source-connector-heading" className="text-sm font-semibold text-slate-900 leading-tight">
              Source Connector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the data source and configure the connector instance
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="size-3 text-emerald-600" />
          Healthy
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Connector Type Grid */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Connector Type <span className="text-rose-500">*</span>
          </label>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
            role="radiogroup"
            aria-label="Connector Type"
          >
            {CONNECTOR_TYPES.map((conn) => {
              const isSelected = form.connectorType === conn.id;
              return (
                <button
                  key={conn.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => updateField('connectorType', conn.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`size-8 rounded-md flex items-center justify-center font-bold text-xs ${conn.bg} ${conn.border} ${conn.text} border mb-1.5`}
                  >
                    {conn.code}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {conn.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {conn.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connector Instance & Connection Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source-connector-instance" className="block text-xs font-medium text-slate-700 mb-1">
              Connector Instance <span className="text-rose-500">*</span>
            </label>
            <select
              id="source-connector-instance"
              value={form.connectorInstance || 'pg-prod-primary'}
              onChange={(e) => updateField('connectorInstance', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {CONNECTOR_INSTANCES.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Active connection profile to use for this node.
            </p>
          </div>

          <div>
            <label htmlFor="source-connection-profile" className="block text-xs font-medium text-slate-700 mb-1">
              Connection Profile
            </label>
            <select
              id="source-connection-profile"
              value={form.connectionProfile || 'default'}
              onChange={(e) => updateField('connectionProfile', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {CONNECTION_PROFILES.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Environment & Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source-conn-env" className="block text-xs font-medium text-slate-700 mb-1">
              Environment
            </label>
            <select
              id="source-conn-env"
              value={form.environment || 'Production'}
              onChange={(e) => updateField('environment', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.id} value={env.name}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source-region" className="block text-xs font-medium text-slate-700 mb-1">
              Region
            </label>
            <select
              id="source-region"
              value={form.region || 'us-east-1'}
              onChange={(e) => updateField('region', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {REGIONS.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
