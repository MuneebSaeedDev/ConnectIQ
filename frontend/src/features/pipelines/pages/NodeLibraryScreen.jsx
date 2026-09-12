import React from 'react';
import AppShell from '../../shell/components/AppShell';
import { useNodeLibrary } from '../hooks/useNodeLibrary';
import NodeLibraryHeader from '../components/nodeLibrary/NodeLibraryHeader';
import NodeCategoriesSidebar from '../components/nodeLibrary/NodeCategoriesSidebar';
import NodeStatsRow from '../components/nodeLibrary/NodeStatsRow';
import NodeFilterToolbar from '../components/nodeLibrary/NodeFilterToolbar';
import NodeCatalogGrid from '../components/nodeLibrary/NodeCatalogGrid';
import NodeCatalogTable from '../components/nodeLibrary/NodeCatalogTable';
import NodeDetailDrawer from '../components/nodeLibrary/NodeDetailDrawer';
import CreateCustomNodeModal from '../components/nodeLibrary/CreateCustomNodeModal';
import ImportNodePackageModal from '../components/nodeLibrary/ImportNodePackageModal';
import ManageCategoriesModal from '../components/nodeLibrary/ManageCategoriesModal';
import ExportCatalogModal from '../components/nodeLibrary/ExportCatalogModal';
import AddToPipelineModal from '../components/nodeLibrary/AddToPipelineModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function NodeLibraryScreen() {
  const lib = useNodeLibrary({ orgId: 'current' });

  const handleStatsCardClick = (card) => {
    if (card.categoryTarget) {
      lib.handleSelectCategory(card.categoryTarget);
    } else if (card.quickFilterTarget) {
      lib.handleToggleQuickFilter(card.quickFilterTarget);
    } else if (card.statusTarget) {
      lib.setStatusFilter(card.statusTarget);
    }
  };

  return (
    <AppShell
      breadcrumb={['ConnectIQ', 'Pipelines', 'Pipeline Library', 'Node Library']}
      fullBleed={true}
    >
      <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden relative">
        {/* Toast Notification */}
        {lib.notification && (
          <div
            className={`absolute top-3 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
              lib.notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {lib.notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{lib.notification.message}</span>
            <button
              type="button"
              onClick={lib.clearNotification}
              className="p-1 hover:bg-black/5 rounded text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <NodeLibraryHeader
          onRefresh={lib.handleRefresh}
          isRefreshing={lib.isRefreshing}
          onExport={() => lib.setIsExportModalOpen(true)}
          onManageCategories={() => lib.setIsManageCategoriesOpen(true)}
          onImportPackage={() => lib.setIsImportModalOpen(true)}
          onCreateCustomNode={() => lib.setIsCreateModalOpen(true)}
        />

        {/* Filter Toolbar */}
        <NodeFilterToolbar
          searchQuery={lib.searchQuery}
          onSearchChange={lib.setSearchQuery}
          categoryFilter={lib.selectedCategory}
          onCategoryChange={lib.setSelectedCategory}
          connectorType={lib.connectorType}
          onConnectorTypeChange={lib.setConnectorType}
          statusFilter={lib.statusFilter}
          onStatusChange={lib.setStatusFilter}
          compatibilityFilter={lib.compatibilityFilter}
          onCompatibilityChange={lib.setCompatibilityFilter}
          ownerFilter={lib.ownerFilter}
          onOwnerChange={lib.setOwnerFilter}
          certificationFilter={lib.certificationFilter}
          onCertificationChange={lib.setCertificationFilter}
          quickFilter={lib.quickFilter}
          onToggleQuickFilter={lib.handleToggleQuickFilter}
          filteredCount={lib.filteredCount}
          totalCount={lib.totalCount}
          lastUpdated={lib.lastUpdated}
          viewMode={lib.viewMode}
          onViewModeChange={lib.setViewMode}
          onResetFilters={lib.handleResetFilters}
        />

        {/* Main Body Layout: Left Sidebar | Main Scrollable Workspace | Right Drawer */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
          {/* Left Categories Tree & Quick Filters Sidebar */}
          <NodeCategoriesSidebar
            categories={lib.categories}
            selectedCategory={lib.selectedCategory}
            onSelectCategory={lib.handleSelectCategory}
            selectedSubcategory={lib.selectedSubcategory}
            onSelectSubcategory={lib.handleSelectSubcategory}
            quickFilter={lib.quickFilter}
            onToggleQuickFilter={lib.handleToggleQuickFilter}
          />

          {/* Center Main Workspace */}
          <div className="flex-1 min-w-0 flex flex-col overflow-y-auto bg-slate-50/60">
            {/* KPI Stat Cards Strip */}
            <div className="p-6 pb-2 shrink-0">
              <NodeStatsRow
                metrics={lib.metrics}
                onCardClick={handleStatsCardClick}
              />
            </div>

            {/* Catalog Grid or Table */}
            <div className="flex-1 flex flex-col min-w-0">
              {lib.viewMode === 'table' ? (
                <div className="p-6 pt-2">
                  <NodeCatalogTable
                    nodes={lib.nodes}
                    selectedNodeId={lib.selectedNodeId}
                    onSelectNode={lib.handleSelectNode}
                    favoriteIds={lib.favoriteIds}
                    onToggleFavorite={lib.handleToggleFavorite}
                    onAddToPipeline={lib.handleOpenAddToPipeline}
                  />
                </div>
              ) : (
                <NodeCatalogGrid
                  nodes={lib.nodes}
                  totalCount={lib.totalCount}
                  filteredCount={lib.filteredCount}
                  sortBy={lib.sortBy}
                  onSortChange={lib.setSortBy}
                  selectedNodeId={lib.selectedNodeId}
                  onSelectNode={lib.handleSelectNode}
                  favoriteIds={lib.favoriteIds}
                  onToggleFavorite={lib.handleToggleFavorite}
                  onAddToPipeline={lib.handleOpenAddToPipeline}
                  isLoading={lib.isLoading}
                  error={lib.error}
                  onRetry={lib.handleRefresh}
                  onResetFilters={lib.handleResetFilters}
                  viewMode={lib.viewMode}
                />
              )}
            </div>

            {/* MOCK BOUNDARY & SAMPLE DATA DISCLOSURE FOOTER */}
            {lib.mocked && (
              <footer className="px-6 py-2 bg-slate-100/80 border-t border-slate-200 text-center shrink-0">
                <p className="text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700">MOD-008 Mock Preview:</span> Displaying design-system verified node catalog (Figma frame 151:9778). Backend integration PLANNED.
                </p>
              </footer>
            )}
          </div>

          {/* Right Inspector Drawer (sticky/collapsible) */}
          <NodeDetailDrawer
            node={lib.selectedNode}
            isOpen={lib.isDrawerOpen}
            onClose={lib.handleCloseDrawer}
            activeTab={lib.activeDrawerTab}
            onTabChange={lib.setActiveDrawerTab}
            isFavorite={lib.selectedNode ? lib.favoriteIds.has(lib.selectedNode.id) : false}
            onToggleFavorite={lib.handleToggleFavorite}
            onAddToPipeline={lib.handleOpenAddToPipeline}
          />
        </div>

        {/* Modals */}
        <CreateCustomNodeModal
          isOpen={lib.isCreateModalOpen}
          onClose={() => lib.setIsCreateModalOpen(false)}
          onSubmit={lib.handleCreateCustomNode}
        />

        <ImportNodePackageModal
          isOpen={lib.isImportModalOpen}
          onClose={() => lib.setIsImportModalOpen(false)}
          onImport={lib.handleImportPackage}
        />

        <ManageCategoriesModal
          isOpen={lib.isManageCategoriesOpen}
          onClose={() => lib.setIsManageCategoriesOpen(false)}
          categories={lib.categories}
        />

        <ExportCatalogModal
          isOpen={lib.isExportModalOpen}
          onClose={() => lib.setIsExportModalOpen(false)}
          onExport={lib.handleExportCatalog}
          filteredCount={lib.filteredCount}
        />

        <AddToPipelineModal
          isOpen={lib.isAddToPipelineModalOpen}
          onClose={lib.handleCloseAddToPipeline}
          node={lib.nodeToAddToPipeline}
        />
      </div>
    </AppShell>
  );
}
