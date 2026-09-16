import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function ExportDashboardModal({
  isOpen,
  onClose,
  data,
  onExportSuccess,
}) {
  const [format, setFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDownload = () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      let content = '';
      let mimeType = 'application/json';
      let extension = 'json';

      if (format === 'json') {
        content = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            platform: 'ConnectIQ ETL Platform',
            summary: data,
          },
          null,
          2
        );
        mimeType = 'application/json';
        extension = 'json';
      } else if (format === 'csv') {
        // Generate CSV of pipeline activity & KPIs
        const kpiRows = (data?.kpis || [])
          .map((k) => `"KPI","${k.label}","${k.value}","${k.trend || ''}"`)
          .join('\n');
        const pipelineHeader = '"Pipeline ID","Name","Route","Status","Progress","Duration","Started"';
        const pipelineRows = (data?.pipelineActivity || [])
          .map(
            (p) =>
              `"${p.id}","${p.name}","${p.route}","${p.status}","${p.progress ?? ''}","${p.duration ?? ''}","${p.started ?? ''}"`
          )
          .join('\n');
        content = `Category,Metric/Name,Value/Route,Details\n${kpiRows}\n\n${pipelineHeader}\n${pipelineRows}`;
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
      } else if (format === 'txt') {
        content = `ConnectIQ Dashboard Executive Summary\n=====================================\nExported: ${new Date().toLocaleString()}\nStatus: ${data?.systemStatus?.headline || 'Operational'}\nDetail: ${data?.systemStatus?.detail || ''}\n\nKey Performance Indicators:\n${(data?.kpis || [])
          .map((k) => ` - ${k.label}: ${k.value} (${k.trend || 'N/A'})`)
          .join('\n')}\n\nPipeline Activity:\n${(data?.pipelineActivity || [])
          .map((p) => ` - [${p.status.toUpperCase()}] ${p.name} (${p.route}) - ${p.duration || 'N/A'}`)
          .join('\n')}\n\nExecution Performance Today:\n - Total: ${data?.executionPerformance?.totalToday}\n - Successful: ${data?.executionPerformance?.successful}\n - Failed: ${data?.executionPerformance?.failed}\n - Avg Duration: ${data?.executionPerformance?.avgDuration}\n`;
        mimeType = 'text/plain;charset=utf-8;';
        extension = 'txt';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `connectiq-dashboard-${timestamp}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onExportSuccess) {
        onExportSuccess(`Dashboard summary exported successfully as ${format.toUpperCase()}`);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dashboard-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-dashboard-modal-title" className="text-base font-bold text-slate-900">
                Export Dashboard Report
              </h2>
              <p className="text-xs text-slate-500">
                Download summary snapshot, KPIs, and pipeline activity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <label className="font-semibold text-slate-700 block">Select Export Format</label>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileJson className="w-6 h-6 text-blue-600" />
              <span className="text-xs">JSON</span>
              <span className="text-[10px] text-slate-400 font-normal">Raw Payload</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'csv'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <span className="text-xs">CSV</span>
              <span className="text-[10px] text-slate-400 font-normal">Spreadsheet</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('txt')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'txt'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-700 ring-2 ring-purple-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <span className="text-xs">Text</span>
              <span className="text-[10px] text-slate-400 font-normal">Summary Report</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Included Snapshot Data</span>
            </div>
            <ul className="text-[11px] list-disc list-inside text-slate-500 space-y-0.5 ml-1">
              <li>Platform health & infrastructure metrics</li>
              <li>Active KPI benchmarks & 24h trends</li>
              <li>Recent pipeline executions ({data?.pipelineActivity?.length || 0} pipelines)</li>
              <li>Today's execution performance summary</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting…' : 'Download Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
