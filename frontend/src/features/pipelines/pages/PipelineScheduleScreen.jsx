import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Timer
} from 'lucide-react';

export default function PipelineScheduleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pipelineId = id || 'pip_001';

  // Schedule state
  const [scheduleType, setScheduleType] = useState('cron'); // 'cron', 'interval', 'manual'
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [timezone, setTimezone] = useState('UTC');
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState('hours'); // 'minutes', 'hours', 'days'
  const [retryOnFailure, setRetryOnFailure] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelayMinutes, setRetryDelayMinutes] = useState(5);
  const [concurrencyPolicy, setConcurrencyPolicy] = useState('Forbid'); // 'Allow', 'Forbid', 'Replace'
  const [paused, setPaused] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showFeedback('success', 'Pipeline schedule settings saved successfully.');
    }, 600);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Builder', 'Schedule']}>
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Screen Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-slate-900">Pipeline Execution Schedule</h1>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  paused
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {paused ? 'Paused' : 'Active Schedule'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Define automated recurrence intervals, cron triggers, retry policies, and concurrency controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition cursor-pointer"
            >
              {paused ? 'Resume Trigger' : 'Pause Trigger'}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="size-3.5" />
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls - 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Schedule Mode Selection */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="size-4 text-blue-600" />
                Execution Trigger Mode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'cron', title: 'Cron Schedule', desc: 'Predictable time-based runs using standard cron expression syntax' },
                  { id: 'interval', title: 'Fixed Interval', desc: 'Repeats periodically every N minutes, hours, or days' },
                  { id: 'manual', title: 'Manual Only', desc: 'Triggered solely via webhook, API, or explicit manual runs' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setScheduleType(mode.id)}
                    className={`p-3 text-left rounded-lg border text-xs transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      scheduleType === mode.id
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{mode.title}</span>
                      <span className="text-slate-500 mt-1 block leading-relaxed">{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mode-Specific Options */}
              {scheduleType === 'cron' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cron Expression (UTC)
                      </label>
                      <input
                        type="text"
                        value={cronExpression}
                        onChange={(e) => setCronExpression(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="0 0 * * *"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Runs every day at 00:00 UTC (Midnight)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'interval' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Repeat Every
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={intervalValue}
                        onChange={(e) => setIntervalValue(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={intervalUnit}
                        onChange={(e) => setIntervalUnit(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Resilience, Concurrency, and Retries */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="size-4 text-purple-600" />
                Execution Guardrails & Retries
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Auto-Retry on Job Failure</span>
                    <span className="text-slate-500">Automatically re-attempt failed batches using exponential backoff.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={retryOnFailure}
                    onChange={(e) => setRetryOnFailure(e.target.checked)}
                    className="size-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {retryOnFailure && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max Retry Attempts</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Backoff Delay (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={retryDelayMinutes}
                        onChange={(e) => setRetryDelayMinutes(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <label className="block font-semibold text-slate-800 mb-1">Concurrency Policy</label>
                  <select
                    value={concurrencyPolicy}
                    onChange={(e) => setConcurrencyPolicy(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Forbid">Forbid (Skip new execution if previous is still running)</option>
                    <option value="Allow">Allow (Run parallel executions concurrently)</option>
                    <option value="Replace">Replace (Cancel previous running run and start new)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Telemetry & Next Run Preview */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Scheduled Runs
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { time: 'Today, 24:00 UTC', status: 'Scheduled', type: 'Daily Batch' },
                  { time: 'Tomorrow, 24:00 UTC', status: 'Scheduled', type: 'Daily Batch' },
                  { time: 'In 2 days, 24:00 UTC', status: 'Scheduled', type: 'Daily Batch' },
                ].map((run, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 block">{run.time}</span>
                      <span className="text-[11px] text-slate-500">{run.type}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Timer className="size-3.5 text-slate-400" />
                <span>Next queue evaluation in ~4h 12m</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-500" />
                Execution Tip
              </span>
              <p className="leading-relaxed">
                High-volume pipelines processing &gt;500k records should avoid sub-hourly intervals to prevent staging database connection pool starvation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
