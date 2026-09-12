import React from 'react';

export default function BuilderSubheader({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  gridEnabled,
  onToggleGrid,
  onAutoLayout,
}) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-10">
      {/* Title & Description */}
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-5">
          Visual Pipeline Builder
        </h1>
        <p className="text-[11px] text-slate-500 leading-4">
          Design, configure, validate, execute, and monitor enterprise data pipelines using a visual workflow.
        </p>
      </div>

      {/* Canvas View Controls (Zoom & Layout) */}
      <div className="flex items-center gap-3">
        {/* Zoom Controls group */}
        <div className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden bg-white shadow-xs">
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out (−)"
            aria-label="Zoom out"
            className="px-2 py-1 text-slate-600 hover:bg-slate-50 border-r border-slate-200 text-sm font-medium transition"
          >
            −
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            title="Reset to 100%"
            aria-label="Reset zoom to 100 percent"
            className="px-2.5 py-1 text-[11px] font-mono text-slate-700 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 transition"
          >
            {zoom}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom in"
            className="px-2 py-1 text-slate-600 hover:bg-slate-50 border-r border-slate-200 text-sm font-medium transition"
          >
            +
          </button>
          <button
            type="button"
            onClick={onFitToScreen}
            title="Fit to Screen (⊡)"
            aria-label="Fit graph to screen"
            className="px-2 py-1 text-slate-600 hover:bg-slate-50 text-xs transition"
          >
            ⊡
          </button>
        </div>

        {/* View Mode & Layout buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleGrid}
            aria-pressed={gridEnabled}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition shadow-2xs ${
              gridEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-400 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={onAutoLayout}
            className="px-2.5 py-1 text-[11px] font-normal text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition shadow-2xs"
          >
            Auto-layout
          </button>
        </div>
      </div>
    </div>
  );
}
