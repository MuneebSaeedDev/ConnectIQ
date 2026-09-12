import React, { useState } from 'react';
import { X, Upload, FileArchive } from 'lucide-react';

export default function ImportNodePackageModal({
  isOpen,
  onClose,
  onImport,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verifySignature, setVerifySignature] = useState(true);
  const [runHealthCheck, setRunHealthCheck] = useState(true);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = () => {
    onImport({
      fileName: selectedFile?.name || 'custom-node-bundle.zip',
      fileSize: selectedFile?.size || 1024 * 450,
      verifySignature,
      runHealthCheck,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-pkg-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 id="import-pkg-title" className="text-base font-bold text-slate-900">
                Import Node Package
              </h2>
              <p className="text-xs text-slate-500">
                Upload verified ConnectIQ component archives (.zip, .jar, .json).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-colors"
          >
            <input
              type="file"
              id="node-pkg-upload"
              onChange={handleFileChange}
              accept=".zip,.jar,.json,.tar.gz"
              className="hidden"
            />
            <label htmlFor="node-pkg-upload" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileArchive className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click or drag and drop package file here'}
              </div>
              <div className="text-[11px] text-slate-400">
                Supports ConnectIQ Node Bundle (.zip, .jar, .json, max 50MB)
              </div>
            </label>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={verifySignature}
                onChange={(e) => setVerifySignature(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Verify cryptographic enterprise signature</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={runHealthCheck}
                onChange={(e) => setRunHealthCheck(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Run automated sandbox health check before activation</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Import & Register
          </button>
        </div>
      </div>
    </div>
  );
}
