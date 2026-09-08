import React, { useState } from 'react';

// Reusable SVG Sparkline component
function Sparkline({ data, color = '#3b82f6', height = 36 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-full h-9 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function PipelineAnalyticsSection({ analytics }) {
  const [timeframe, setTimeframe] = useState('7d');

  if (!analytics) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-2xs">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Pipeline Analytics
          </h3>
          <p className="text-xs text-slate-600">
            Historical trends, throughput, and distribution metrics across the execution fleet.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-medium">
          {['24h', '7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Execution Trend */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Execution Trend</span>
            <span className="text-[11px] text-slate-600 block">Total runs per day</span>
          </div>
          <div className="pt-2">
            <Sparkline data={analytics.executionTrend} color="#3b82f6" />
          </div>
        </div>

        {/* 2. Success Rate */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Success Rate</span>
            <span className="text-[11px] text-slate-600 block">% successful</span>
          </div>
          <div className="pt-2">
            <Sparkline data={analytics.successRate} color="#10b981" />
          </div>
        </div>

        {/* 3. Failure Trend */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Failure Trend</span>
            <span className="text-[11px] text-slate-600 block">Failed executions</span>
          </div>
          <div className="pt-2">
            <Sparkline data={analytics.failureTrend} color="#ef4444" />
          </div>
        </div>

        {/* 4. Throughput */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Throughput</span>
            <span className="text-[11px] text-slate-600 block">Records / min (M)</span>
          </div>
          <div className="pt-2">
            <Sparkline data={analytics.throughput} color="#8b5cf6" />
          </div>
        </div>

        {/* 5. Avg Duration */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Avg Duration</span>
            <span className="text-[11px] text-slate-600 block">Minutes per run</span>
          </div>
          <div className="pt-2">
            <Sparkline data={analytics.avgDuration} color="#06b6d4" />
          </div>
        </div>

        {/* 6. Pipeline Activity */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Pipeline Activity</span>
            <span className="text-[11px] text-slate-600 block">Most active pipelines</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {analytics.pipelineActivity?.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-600 w-6 text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Segmented Distribution Bars Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* By Status */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">By Status</span>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
            {analytics.distributionByStatus?.map((seg, i) => (
              <div
                key={i}
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            {analytics.distributionByStatus?.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label} {seg.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* By Team */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">By Team</span>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
            {analytics.distributionByTeam?.map((seg, i) => (
              <div
                key={i}
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            {analytics.distributionByTeam?.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label} {seg.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* By Environment */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">By Environment</span>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
            {analytics.distributionByEnvironment?.map((seg, i) => (
              <div
                key={i}
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            {analytics.distributionByEnvironment?.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label} {seg.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* By Schedule */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">By Schedule</span>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
            {analytics.distributionBySchedule?.map((seg, i) => (
              <div
                key={i}
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
            {analytics.distributionBySchedule?.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label} {seg.percentage}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
