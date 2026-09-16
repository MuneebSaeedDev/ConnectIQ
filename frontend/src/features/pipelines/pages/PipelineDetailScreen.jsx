import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Workflow,
  Play,
  Pause,
  CheckCircle2,
  History,
  Settings,
  Database,
  Layers,
  Shield,
  Tag,
  ExternalLink,
  ChevronRight,
  Server,
} from 'lucide-react';
import AppShell from '../../shell/components/AppShell';
import { BASELINE_PIPELINES } from '../services/pipelineList.api';

const STATUS_CONFIG = {
  Running: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Scheduled: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Paused: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Disabled: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  Retrying: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500 animate-spin' },
  Draft: { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

const EXEC_STATUS = {
  Success: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Running: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  Failed: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  Queued: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

// Fallback lookup for dashboard and mock IDs
const DASHBOARD_PIPELINE_MAP = {
  p1: {
    id: 'p1',
    name: 'Customer Sync',
    description: 'Bi-directional enterprise customer synchronization from Salesforce CRM to PostgreSQL.',
    status: 'Running',
    source: 'Salesforce CRM',
    destination: 'PostgreSQL DW',
    owner: 'A. Chen',
    team: 'Data Eng',
    environment: 'Production',
    version: 'v2.4',
    tags: ['salesforce', 'postgres', 'crm', 'batch'],
    trigger: 'Continuous (CDC)',
    frequency: 'Streaming',
    timezone: 'UTC',
    nextExec: 'In 3m',
    duration: '02:14',
    records: '68.4K',
    successRate: '99.4%',
    progress: 68,
  },
  p2: {
    id: 'p2',
    name: 'Inventory Sync',
    description: 'Warehouse inventory levels and stock movements synced to Amazon Redshift analytics cluster.',
    status: 'Running',
    source: 'Warehouse API',
    destination: 'Amazon Redshift',
    owner: 'R. Patel',
    team: 'Platform',
    environment: 'Production',
    version: 'v1.8',
    tags: ['warehouse', 'redshift', 'inventory'],
    trigger: 'Scheduled',
    frequency: 'Every 15m',
    timezone: 'UTC',
    nextExec: 'In 11m',
    duration: '01:32',
    records: '124.5K',
    successRate: '98.8%',
    progress: 44,
  },
  p3: {
    id: 'p3',
    name: 'Orders Sync',
    description: 'E-commerce order fulfillment events and payment records ingested into Google BigQuery.',
    status: 'Failed',
    source: 'Shopify Store',
    destination: 'Google BigQuery',
    owner: 'S. Kim',
    team: 'Finance',
    environment: 'Production',
    version: 'v3.1',
    tags: ['shopify', 'bigquery', 'orders', 'ecommerce'],
    trigger: 'Event-driven',
    frequency: 'Real-time',
    timezone: 'UTC',
    nextExec: 'Retry queued',
    duration: '01:18',
    records: '8.2K',
    successRate: '91.2%',
    progress: null,
  },
  p4: {
    id: 'p4',
    name: 'Product Catalog',
    description: 'Master catalog taxonomy and search index updates pushed to Elasticsearch cluster.',
    status: 'Completed',
    source: 'PIM Core',
    destination: 'Elasticsearch',
    owner: 'M. Torres',
    team: 'Analytics',
    environment: 'Production',
    version: 'v2.0',
    tags: ['pim', 'elasticsearch', 'catalog'],
    trigger: 'Scheduled',
    frequency: 'Hourly',
    timezone: 'UTC',
    nextExec: 'In 42m',
    duration: '05:42',
    records: '310K',
    successRate: '100%',
    progress: 100,
  },
  p5: {
    id: 'p5',
    name: 'User Analytics',
    description: 'Mobile app clickstream events and telemetry streams ingested into Snowflake data cloud.',
    status: 'Running',
    source: 'Mixpanel API',
    destination: 'Snowflake DW',
    owner: 'L. Wang',
    team: 'Analytics',
    environment: 'Production',
    version: 'v1.4',
    tags: ['mixpanel', 'snowflake', 'analytics', 'telemetry'],
    trigger: 'Streaming',
    frequency: 'Continuous',
    timezone: 'UTC',
    nextExec: 'Active',
    duration: '00:47',
    records: '1.2M',
    successRate: '99.9%',
    progress: 21,
  },
  p6: {
    id: 'p6',
    name: 'Financial Data',
    description: 'ERP general ledger, invoicing, and billing transactions synced to PostgreSQL audit replica.',
    status: 'Scheduled',
    source: 'NetSuite ERP',
    destination: 'PostgreSQL Audit',
    owner: 'J. Lee',
    team: 'Finance',
    environment: 'Production',
    version: 'v2.2',
    tags: ['netsuite', 'finance', 'ledger', 'audit'],
    trigger: 'Scheduled',
    frequency: 'Daily 02:00',
    timezone: 'UTC',
    nextExec: 'Tomorrow 02:00',
    duration: '03:15',
    records: '14.8K',
    successRate: '99.5%',
    progress: null,
  },
};

export default function PipelineDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState(null);
  const [statusOverride, setStatusOverride] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const pipeline = useMemo(() => {
    // 1. Check BASELINE_PIPELINES
    const foundBaseline = BASELINE_PIPELINES.find((p) => p.id === id);
    if (foundBaseline) return foundBaseline;

    // 2. Check dashboard map
    const foundDashboard = DASHBOARD_PIPELINE_MAP[id];
    if (foundDashboard) {
      return {
        ...BASELINE_PIPELINES[0],
        ...foundDashboard,
        operationalMetrics: {
          successRate: foundDashboard.successRate || '99.1%',
          avgDuration: foundDashboard.duration || '1m 42s',
          recordsToday: foundDashboard.records || '48.2K',
          throughput: '450 rec/s',
          retryCount: foundDashboard.status === 'Failed' ? '1' : '0',
          queueTime: '< 20ms',
        },
      };
    }

    // 3. Fallback to first pipeline enriched with target ID
    return {
      ...BASELINE_PIPELINES[0],
      id: id || 'pipe-001',
      name: `Pipeline ${id || '001'}`,
    };
  }, [id]);

  const currentStatus = statusOverride || pipeline.status;
  const statusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Running;

  const handleRun = () => {
    setIsExecuting(true);
    setStatusOverride('Running');
    showToast(`Execution triggered for ${pipeline.name}. Job ID: EX-${Math.floor(10000 + Math.random() * 90000)}`);
    setTimeout(() => {
      setIsExecuting(false);
    }, 1500);
  };

  const handleTogglePause = () => {
    const next = currentStatus === 'Paused' ? 'Running' : 'Paused';
    setStatusOverride(next);
    showToast(`Pipeline ${pipeline.name} is now ${next.toLowerCase()}`);
  };

  const recentExecutions = [
    {
      id: 'EX-98421',
      status: 'Success',
      records: '48,210',
      duration: '1m 38s',
      started: '2m ago',
      worker: 'worker-node-03',
    },
    {
      id: 'EX-98390',
      status: currentStatus === 'Failed' ? 'Failed' : 'Success',
      records: currentStatus === 'Failed' ? '1,420' : '47,950',
      duration: '1m 44s',
      started: '17m ago',
      worker: 'worker-node-07',
    },
    {
      id: 'EX-98354',
      status: 'Success',
      records: '48,110',
      duration: '1m 41s',
      started: '32m ago',
      worker: 'worker-node-02',
    },
    {
      id: 'EX-98312',
      status: 'Success',
      records: '48,340',
      duration: '1m 40s',
      started: '47m ago',
      worker: 'worker-node-05',
    },
    {
      id: 'EX-98280',
      status: 'Success',
      records: '47,890',
      duration: '1m 45s',
      started: '1h ago',
      worker: 'worker-node-01',
    },
  ];

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', pipeline.name]}>
      <div className="flex flex-col gap-token-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back Link & Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-slate-300">|</span>
            <Link
              to="/pipelines"
              className="text-xs font-medium text-slate-500 hover:text-blue-600 transition"
            >
              All Pipelines
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-semibold text-slate-800">{pipeline.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/pipelines/${pipeline.id}/builder`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition shadow-2xs"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Visual Builder</span>
            </Link>
            <Link
              to={`/pipelines/${pipeline.id}/settings`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
            <Link
              to={`/pipelines/${pipeline.id}/history`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Main Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                {pipeline.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                {pipeline.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {currentStatus}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                {pipeline.environment || 'Production'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-mono">
                {pipeline.version || 'v1.0'}
              </span>
            </div>
            <p className="text-xs text-slate-600 m-0 max-w-3xl">
              {pipeline.description || 'Continuous data pipeline and automated sync stream.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span>Owner: <strong className="text-slate-800 font-semibold">{pipeline.owner || 'A. Chen'}</strong></span>
              <span>•</span>
              <span>Team: <strong className="text-slate-800 font-semibold">{pipeline.team || 'Data Eng'}</strong></span>
              <span>•</span>
              <span>Schedule: <strong className="text-slate-800 font-semibold">{pipeline.schedule || 'Every 15m'}</strong></span>
              <span>•</span>
              <span>Last Run: <strong className="text-slate-800 font-semibold">{pipeline.lastExec || '2m ago'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              {currentStatus === 'Paused' ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={isExecuting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Running…' : 'Run Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Success Rate</span>
            <span className="text-lg font-bold text-emerald-600 block">
              {pipeline.operationalMetrics?.successRate || pipeline.successRate || '99.4%'}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">↑ 0.3% this week</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Avg Duration</span>
            <span className="text-lg font-bold text-slate-900 block">
              {pipeline.operationalMetrics?.avgDuration || pipeline.duration || '1m 42s'}
            </span>
            <span className="text-[10px] text-slate-500">Fast batch execution</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Records Today</span>
            <span className="text-lg font-bold text-slate-900 block">
              {pipeline.operationalMetrics?.recordsToday || pipeline.records || '48.2K'}
            </span>
            <span className="text-[10px] text-slate-500">Processed volume</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Throughput</span>
            <span className="text-lg font-bold text-blue-600 block">
              {pipeline.operationalMetrics?.throughput || '450 rec/s'}
            </span>
            <span className="text-[10px] text-slate-500">Peak 1,200 rec/s</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Queue Latency</span>
            <span className="text-lg font-bold text-slate-900 block">
              {pipeline.operationalMetrics?.queueTime || '< 20ms'}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Optimal buffer</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Active Alerts</span>
            <span className="text-lg font-bold text-slate-900 block">0</span>
            <span className="text-[10px] text-emerald-600 font-medium">Healthy stream</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Connectors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('executions')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'executions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Execution History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('configuration')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'configuration'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Topology & Schema
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Flow Topology & Pipeline Connectors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Connector Flow Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 m-0">
                      Connector Flow & Routing
                    </h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Data lineage from ingestion source to downstream analytical destination.
                    </p>
                  </div>
                  <Link
                    to={`/pipelines/${pipeline.id}/builder`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Open in Builder</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative items-center">
                  {/* Source Connector */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Source</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">{pipeline.source || 'Salesforce CRM'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">Poll frequency: 15m · Rate limit: 200 req/s</p>
                  </div>

                  {/* Transformation Node */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transform</span>
                      <span className="text-[10px] font-mono text-slate-500">3 Stages</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">Schema Normalize & Dedup</span>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">Type coercion, PII masking, currency calc</p>
                  </div>

                  {/* Destination Connector */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Destination</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">{pipeline.destination || 'Snowflake DW'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">Upsert on `customer_id` · Batch size 5,000</p>
                  </div>
                </div>
              </div>

              {/* Recent Executions Strip */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 m-0">Recent Executions</h2>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Last 5 execution runs and worker assignments</p>
                  </div>
                  <Link
                    to="/dashboard/executions"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all executions →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Run ID</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Records</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3">Started</th>
                        <th className="px-6 py-3 text-right">Worker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentExecutions.map((run) => {
                        const style = EXEC_STATUS[run.status] || EXEC_STATUS.Success;
                        return (
                          <tr key={run.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-6 py-3.5 font-mono font-bold text-blue-600">
                              {run.id}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold border ${style.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                {run.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 font-mono text-slate-700">{run.records}</td>
                            <td className="px-6 py-3.5 font-mono text-slate-700">{run.duration}</td>
                            <td className="px-6 py-3.5 text-slate-500">{run.started}</td>
                            <td className="px-6 py-3.5 text-right font-mono text-slate-500">{run.worker}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata & Configuration Cards */}
            <div className="space-y-6">
              {/* Schedule & Trigger Config */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 m-0">Schedule & Trigger</h2>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Trigger Type</span>
                    <span className="font-semibold text-slate-800">{pipeline.trigger || 'Scheduled'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Frequency</span>
                    <span className="font-semibold text-slate-800">{pipeline.frequency || 'Every 15m'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Timezone</span>
                    <span className="font-mono text-slate-700">{pipeline.timezone || 'UTC'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Next Scheduled Run</span>
                    <span className="font-semibold text-emerald-600">{pipeline.nextExec || 'In 13m'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Retry Policy</span>
                    <span className="font-semibold text-slate-800">3 retries · Exponential backoff</span>
                  </div>
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 m-0">Tags & Categorization</h2>
                <div className="flex flex-wrap gap-1.5">
                  {(pipeline.tags || ['etl', 'salesforce', 'sync', 'crm', 'production']).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Health Assurance */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Data Quality & Integrity Rules</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Active schema enforcement enabled. Zero unmapped field drops detected over the last 1,000 executions.
                </p>
                <Link
                  to="/dashboard/data-quality"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-block pt-1"
                >
                  View Data Quality Metrics →
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'executions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 m-0">Detailed Execution Telemetry</h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Historical executions, execution steps, and worker logs</p>
              </div>
              <Link
                to="/dashboard/executions"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition"
              >
                <span>Full Execution Statistics</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Run ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Records Processed</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Throughput</th>
                    <th className="px-4 py-3">Execution Time</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentExecutions.map((run) => {
                    const style = EXEC_STATUS[run.status] || EXEC_STATUS.Success;
                    return (
                      <tr key={run.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{run.id}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700">{run.records}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-700">{run.duration}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">450 rec/s</td>
                        <td className="px-4 py-3.5 text-slate-500">{run.started}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => showToast(`Viewing logs for run ${run.id}`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View Logs
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 m-0">Topology & Node Configuration</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Detailed node configuration, parameter overrides, and mapping logic</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Source Parameters</span>
                <pre className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
{JSON.stringify(
  {
    endpoint: 'https://api.salesforce.com/v58.0/sobjects/Account',
    batchSize: 5000,
    pollInterval: '15m',
    incrementalField: 'LastModifiedDate',
  },
  null,
  2
)}
                </pre>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Destination Parameters</span>
                <pre className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
{JSON.stringify(
  {
    schema: 'ANALYTICS_PROD',
    table: 'DIM_CUSTOMERS',
    writeMode: 'UPSERT',
    primaryKey: ['customer_id'],
    deduplication: true,
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
