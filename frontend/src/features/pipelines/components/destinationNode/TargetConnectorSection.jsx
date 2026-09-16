import React from 'react';
import { Database, PlugZap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DESTINATION_TYPES } from '../../services/destinationNodeConfig.api';

export default function TargetConnectorSection({ form, updateField }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">02. Target Sink Connector</h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="size-3" />
          TLS 1.3 Encrypted
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Connector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Select Sink Type & Destination Platform
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DESTINATION_TYPES.map((dst) => {
              const isSelected = form.destinationType === dst.id;
              return (
                <button
                  key={dst.id}
                  type="button"
                  onClick={() => updateField('destinationType', dst.id)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {dst.category}
                    </span>
                    {isSelected && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {dst.name}
                    </span>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {dst.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Connector Instance */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Active Connection Instance
            </label>
            <select
              value={form.connectionId || 'conn_snw_prod_01'}
              onChange={(e) => updateField('connectionId', e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="conn_snw_prod_01">Production Snowflake Cluster (US-East) - [ACTIVE]</option>
              <option value="conn_snw_stage_02">Staging Snowflake Warehouse (US-West)</option>
              <option value="conn_snw_dr_03">Disaster Recovery Snowflake Vault</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 md:pt-0">
            <div className="text-xs">
              <span className="text-slate-500 block text-[11px]">Authentication Mode</span>
              <span className="font-semibold text-slate-800">RSA Key Pair + Role (SYSADMIN)</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300 rounded">
              <PlugZap className="size-3.5" />
              Live Connected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
