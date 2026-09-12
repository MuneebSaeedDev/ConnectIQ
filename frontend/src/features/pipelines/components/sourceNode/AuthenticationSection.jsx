import React from 'react';
import {
  AUTH_METHODS,
} from '../../services/sourceNodeConfig.api';
import {
  Eye,
  EyeOff,
  Lock,
  Activity,
  RotateCcw,
} from 'lucide-react';

export default function AuthenticationSection({
  form,
  updateField,
  passwordRevealed,
  setPasswordRevealed,
  onTestAuth,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs" aria-labelledby="auth-heading">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
          3
        </div>
        <div>
          <h2 id="auth-heading" className="text-sm font-semibold text-slate-900 leading-tight">
            Authentication
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Credential configuration and access control
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Authentication Method Options */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Authentication Method <span className="text-rose-500">*</span>
          </label>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="Authentication Method"
          >
            {AUTH_METHODS.map((method) => {
              const isSelected = form.authMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => updateField('authMethod', method.id)}
                  className={`px-3 py-2 rounded-md text-xs font-medium text-center border transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {method.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Username & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source-auth-username" className="block text-xs font-medium text-slate-700 mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              id="source-auth-username"
              type="text"
              value={form.username || ''}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="e.g. etl_service_reader"
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="source-auth-password" className="block text-xs font-medium text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="source-auth-password"
                type={passwordRevealed ? 'text' : 'password'}
                value={form.password || ''}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 text-slate-900 pr-16 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setPasswordRevealed(!passwordRevealed)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {passwordRevealed ? (
                  <span className="inline-flex items-center gap-1">
                    <EyeOff className="size-3.5" /> Hide
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" /> Show
                  </span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Lock className="size-3 text-slate-400 shrink-0" />
              Credentials are AES-256 encrypted. Never exposed after saving.
            </p>
          </div>
        </div>

        {/* Auth Status Strip matching Figma node 155:2506 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-center flex-wrap gap-4 text-xs">
            <div>
              <span className="text-slate-400 mr-1.5 font-medium">Auth Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {form.authStatus || 'Verified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5 font-medium">Credential Expiry</span>
              <span className="font-semibold text-amber-700">
                {form.credentialExpiry || '90 days'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5 font-medium">Last Validation</span>
              <span className="text-slate-700 font-medium">
                {form.lastValidation || '8 min ago'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTestAuth}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            >
              <Activity className="size-3.5 text-blue-600" />
              Test Authentication
            </button>
            <button
              type="button"
              onClick={() => updateField('lastValidation', 'Just now')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Refresh Credentials
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
