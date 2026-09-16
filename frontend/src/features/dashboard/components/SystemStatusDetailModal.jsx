import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Cpu,
  HardDrive,
  Database,
  Globe,
  Radio,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function SystemStatusDetailModal({
  isOpen,
  onClose,
  status,
  health,
  onRefresh,
  isRefreshing,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOperational = status?.state === 'operational' || status?.state === 'healthy';

  const services = [
    {
      name: 'PostgreSQL Database Cluster',
      type: 'Relational DB',
      status: 'Healthy',
      uptime: '99.99%',
      latency: '4ms',
      icon: Database,
    },
    {
      name: 'API Gateway & Ingestion Layer',
      type: 'Core API',
      status: 'Operational',
      uptime: '99.98%',
      latency: '182ms',
      icon: Globe,
    },
    {
      name: 'Worker Fleet (12 nodes)',
      type: 'Processing Pool',
      status: 'Healthy',
      uptime: '100%',
      latency: '< 10ms queue',
      icon: Server,
    },
    {
      name: 'Event Streaming & Message Queue',
      type: 'Kafka / Redis',
      status: 'Operational',
      uptime: '99.95%',
      latency: '0 lag',
      icon: Radio,
    },
    {
      name: 'Storage & Artifact Repository',
      type: 'Object Storage',
      status: 'Healthy',
      uptime: '100%',
      latency: '18ms',
      icon: HardDrive,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-status-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isOperational ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {isOperational ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="system-status-modal-title" className="text-base font-bold text-slate-900">
                  System Status & Health
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isOperational
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  {isOperational ? 'All Systems Operational' : 'Degraded Performance'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational status of platform components, compute workers, and services.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close status modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Headline Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isOperational ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 flex-1">
              <p className="font-semibold text-slate-900 text-sm">
                {status?.headline || 'All systems operational'}
              </p>
              <p className="text-slate-600">
                {status?.detail || '12 workers healthy · No alerts · Queue normal · Last checked 1m ago'}
              </p>
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh system telemetry"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking…' : 'Check Now'}</span>
              </button>
            )}
          </div>

          {/* Infrastructure Metrics Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Infrastructure Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">Worker Fleet</span>
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {health?.workers?.value || '12 / 12'}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  All workers active
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">Job Queue</span>
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {health?.queue?.value || '8 pending'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Avg latency: 18ms
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">CPU Load</span>
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {health?.cpu?.percent ?? 42}%
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${health?.cpu?.percent ?? 42}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">Memory Usage</span>
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {health?.memory?.percent ?? 61}%
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${health?.memory?.percent ?? 61}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">Disk Storage</span>
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {health?.disk?.percent ?? 34}%
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${health?.disk?.percent ?? 34}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
                  <span className="font-medium">Network Mesh</span>
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-base font-bold text-emerald-700">Operational</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  0 packet loss · 12ms
                </div>
              </div>
            </div>
          </div>

          {/* Component & Service Health List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Core Platform Services
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
              {services.map((svc) => {
                const IconComponent = svc.icon;
                return (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{svc.name}</div>
                        <div className="text-[11px] text-slate-500">{svc.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="font-mono text-slate-700 text-[11px]">{svc.latency}</div>
                        <div className="text-[10px] text-slate-400">Uptime {svc.uptime}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {svc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Log Note */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Incident History & SLA Compliance</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              No active incidents reported in the last 30 days. System uptime is currently tracking at 99.98% against the 99.9% target SLA.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-2xs"
          >
            Close
          </button>
          <Link
            to="/dashboard/system-health"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Open System Health Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
