import React from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useVisualPipelineBuilder } from '../hooks/useVisualPipelineBuilder';
import BuilderHeader from '../components/builder/BuilderHeader';
import BuilderSubheader from '../components/builder/BuilderSubheader';
import NodeLibraryPanel from '../components/builder/NodeLibraryPanel';
import PipelineCanvas from '../components/builder/PipelineCanvas';
import NodeConfigPanel from '../components/builder/NodeConfigPanel';
import ExecutionConsole from '../components/builder/ExecutionConsole';

export default function VisualPipelineBuilderScreen() {
  const { id: routePipelineId } = useParams();
  const pipelineId = routePipelineId || 'pipe-001';

  const builder = useVisualPipelineBuilder({
    orgId: 'current',
    pipelineId,
  });

  return (
    <AppShell
      breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Library', 'Visual Pipeline Builder']}
      fullBleed={true}
    >
      <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden relative">
        {/* Top Builder Header */}
        <BuilderHeader
          meta={builder.meta}
          isDirty={builder.isDirty}
          lastSavedTime={builder.lastSavedTime}
          canUndo={builder.canUndo}
          canRedo={builder.canRedo}
          onUndo={builder.undo}
          onRedo={builder.redo}
          onValidate={builder.handleValidate}
          isValidating={builder.isValidating}
          onRun={builder.handleRunExecution}
          onSaveDraft={builder.handleSaveDraft}
          isSaving={builder.isSaving}
          onPublish={builder.handlePublish}
          isPublishing={builder.isPublishing}
          onExport={builder.handleExport}
        />

        {/* Subheader Controls Toolbar */}
        <BuilderSubheader
          zoom={builder.zoom}
          onZoomIn={builder.zoomIn}
          onZoomOut={builder.zoomOut}
          onResetZoom={builder.resetZoom}
          onFitToScreen={builder.fitToScreen}
          gridEnabled={builder.gridEnabled}
          onToggleGrid={builder.toggleGrid}
          onAutoLayout={builder.autoLayout}
        />

        {/* Center Builder Body: Left Node Library | Canvas | Right Node Config */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
          {/* Left Node Library Aside */}
          <NodeLibraryPanel onAddNode={builder.addNodeFromLibrary} />

          {/* Canvas View */}
          <PipelineCanvas
            nodes={builder.nodes}
            edges={builder.edges}
            selectedNodeId={builder.selectedNodeId}
            onSelectNode={builder.selectNode}
            onUpdatePosition={builder.updateNodePosition}
            onAddNode={builder.addNodeFromLibrary}
            onConnectNodes={builder.connectNodes}
            onDeleteEdge={builder.deleteEdge}
            onDeleteNode={builder.deleteNode}
            zoom={builder.zoom}
            pan={builder.pan}
            setPan={builder.setPan}
            gridEnabled={builder.gridEnabled}
            activeTool={builder.activeTool}
            setActiveTool={builder.setActiveTool}
            isMinimapOpen={builder.isMinimapOpen}
            onToggleMinimap={builder.toggleMinimap}
          />

          {/* Right Node Configuration Aside */}
          {builder.selectedNode && (
            <NodeConfigPanel
              selectedNode={builder.selectedNode}
              onUpdateConfig={builder.updateNodeConfig}
              onClose={() => builder.selectNode(null)}
            />
          )}
        </div>

        {/* Bottom Execution Console */}
        <ExecutionConsole
          isOpen={builder.isConsoleOpen}
          onToggleOpen={builder.toggleConsole}
          activeTab={builder.activeConsoleTab}
          onSelectTab={builder.setActiveConsoleTab}
          searchQuery={builder.searchLogQuery}
          onSearchChange={builder.setSearchLogQuery}
          logLevelFilter={builder.logLevelFilter}
          onLogLevelChange={builder.setLogLevelFilter}
          logs={builder.filteredLogs}
          validationItems={builder.validationItems}
          errorsCount={builder.errorsCount}
          warningsCount={builder.warningsCount}
          executionStatus={builder.executionStatus}
          progressPercent={builder.progressPercent}
          activeExecutingNode={builder.activeExecutingNode}
          recordsProcessed={builder.recordsProcessed}
          duration={builder.duration}
          eta={builder.eta}
          onTogglePause={builder.handleTogglePause}
          onStopExecution={builder.handleStopExecution}
        />

        {/* Floating Notification Toast */}
        {builder.notification && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-fade-in"
          >
            <span>{builder.notification}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
