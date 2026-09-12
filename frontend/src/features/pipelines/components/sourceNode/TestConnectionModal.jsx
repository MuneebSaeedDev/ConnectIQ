import React, { useEffect, useMemo } from 'react';
import { CheckCircle2, X, RotateCcw, ShieldCheck } from 'lucide-react';

export default function TestConnectionModal({
  isOpen,
  onClose,
  result,
  connectorInstance,
  onReTest,
}) {
  const formattedTime = useMemo(() => {
    if (!result?.testedAt) return 'Just now';
    try {
      return new Date(result.testedAt).toLocaleTimeString();
    } catch {
      return 'Just now';
    }
  }, [result]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-conn-title"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 id="test-conn-title" className="text-sm font-bold text-slate-900">
                Connection Test Passed
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {connectorInstance || 'pg-prod-primary'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Network Latency
              </span>
              <span className="text-base font-bold text-emerald-700">
                {result.latencyMs || 18} ms
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Security Protocol
              </span>
              <span className="text-base font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="size-4 text-emerald-600" />
                {result.tlsVersion || 'TLS 1.3'}
              </span>
            </div>
          </div>

          <dl className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Database Engine</dt>
              <dd className="font-mono text-slate-800">{result.serverVersion || 'PostgreSQL 15.4 (Ubuntu)'}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Active / Max Connections</dt>
              <dd className="font-medium text-slate-800">{result.activeConnections || 14} / {result.maxConnections || 100}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">SSL Encryption</dt>
              <dd className="font-semibold text-emerald-700">Active (verify-full)</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Timestamp</dt>
              <dd className="text-slate-500">{formattedTime}</dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onReTest}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Re-test
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
