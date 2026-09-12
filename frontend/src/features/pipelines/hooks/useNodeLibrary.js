import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getNodeCatalog,
  getNodeCategories,
  getNodeMetrics,
  createCustomNode,
  importNodePackage,
  exportCatalogFile,
  INITIAL_NODES,
  INITIAL_CATEGORIES,
  INITIAL_METRICS,
} from '../services/nodeLibrary.api';

export function useNodeLibrary({ orgId = 'current', initialNodeId = null } = {}) {
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [quickFilter, setQuickFilter] = useState(null);
  const [connectorType, setConnectorType] = useState('All Connector Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [compatibilityFilter, setCompatibilityFilter] = useState('All Versions');
  const [ownerFilter, setOwnerFilter] = useState('All Owners');
  const [certificationFilter, setCertificationFilter] = useState('All Certifications');
  const [sortBy, setSortBy] = useState('most_used');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'compact'

  // Data state
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mocked, setMocked] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [favoriteIds, setFavoriteIds] = useState(() => {
    return new Set(INITIAL_NODES.filter((n) => n.isFavorite).map((n) => n.id));
  });

  // Selected node and drawer state
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId || 'node-pg-src-01');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeDrawerTab, setActiveDrawerTab] = useState('Overview');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddToPipelineModalOpen, setIsAddToPipelineModalOpen] = useState(false);
  const [nodeToAddToPipeline, setNodeToAddToPipeline] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch catalog data
  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [catalogRes, categoriesRes, metricsRes] = await Promise.all([
        getNodeCatalog({
          orgId,
          search: searchQuery,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          quickFilter,
          connectorType,
          status: statusFilter,
          compatibility: compatibilityFilter,
          owner: ownerFilter,
          certification: certificationFilter,
          sort: sortBy,
        }),
        getNodeCategories({ orgId }),
        getNodeMetrics({ orgId }),
      ]);

      setNodes(catalogRes.items);
      setMocked(catalogRes.mocked);
      setCategories(categoriesRes.categories);
      setMetrics(metricsRes.metrics);
      setLastUpdated('Updated just now');
    } catch (err) {
      setError(err.message || 'Failed to load node catalog.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    orgId,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    quickFilter,
    connectorType,
    statusFilter,
    compatibilityFilter,
    ownerFilter,
    certificationFilter,
    sortBy,
  ]);

  // Initial and reactive load
  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      try {
        const [catalogRes, categoriesRes, metricsRes] = await Promise.all([
          getNodeCatalog({
            orgId,
            search: searchQuery,
            category: selectedCategory,
            subcategory: selectedSubcategory,
            quickFilter,
            connectorType,
            status: statusFilter,
            compatibility: compatibilityFilter,
            owner: ownerFilter,
            certification: certificationFilter,
            sort: sortBy,
          }),
          getNodeCategories({ orgId }),
          getNodeMetrics({ orgId }),
        ]);

        if (active) {
          setNodes(catalogRes.items);
          setMocked(catalogRes.mocked);
          setCategories(categoriesRes.categories);
          setMetrics(metricsRes.metrics);
          setLastUpdated('Updated just now');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load node catalog.');
        }
      }
    };

    fetchCatalog();
    return () => {
      active = false;
    };
  }, [
    orgId,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    quickFilter,
    connectorType,
    statusFilter,
    compatibilityFilter,
    ownerFilter,
    certificationFilter,
    sortBy,
  ]);

  // Derived selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Node selection handlers
  const handleSelectNode = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Favorite toggle
  const handleToggleFavorite = useCallback((nodeId, e) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, isFavorite: !n.isFavorite };
        }
        return n;
      })
    );
  }, []);

  // Quick filter toggle
  const handleToggleQuickFilter = useCallback((filterKey) => {
    setQuickFilter((prev) => (prev === filterKey ? null : filterKey));
  }, []);

  // Category select
  const handleSelectCategory = useCallback((catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
  }, []);

  const handleSelectSubcategory = useCallback((subcatId) => {
    setSelectedSubcategory(subcatId);
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setQuickFilter(null);
    setConnectorType('All Connector Types');
    setStatusFilter('All Statuses');
    setCompatibilityFilter('All Versions');
    setOwnerFilter('All Owners');
    setCertificationFilter('All Certifications');
    setSortBy('most_used');
  }, []);

  // Create Custom Node
  const handleCreateCustomNode = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const res = await createCustomNode({ orgId, payload });
      if (res.success && res.node) {
        setNodes((prev) => [res.node, ...prev]);
        setSelectedNodeId(res.node.id);
        setIsDrawerOpen(true);
        setIsCreateModalOpen(false);
        setNotification({
          type: 'success',
          message: `Custom node "${res.node.name}" created successfully.`,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create custom node.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  // Import Package
  const handleImportPackage = useCallback(async (packageData) => {
    setIsLoading(true);
    try {
      const res = await importNodePackage({ orgId, packageData });
      if (res.success) {
        setIsImportModalOpen(false);
        setNotification({
          type: 'success',
          message: `Successfully imported ${res.count} node package(s).`,
        });
        loadData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to import package.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [orgId, loadData]);

  // Export Catalog
  const handleExportCatalog = useCallback((format = 'json') => {
    try {
      const success = exportCatalogFile(nodes, format);
      if (success) {
        setIsExportModalOpen(false);
        setNotification({
          type: 'success',
          message: `Exported ${nodes.length} nodes in ${format.toUpperCase()} format.`,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to export catalog.',
      });
    }
  }, [nodes]);

  // Add to pipeline
  const handleOpenAddToPipeline = useCallback((node, e) => {
    if (e) e.stopPropagation();
    setNodeToAddToPipeline(node || selectedNode);
    setIsAddToPipelineModalOpen(true);
  }, [selectedNode]);

  const handleCloseAddToPipeline = useCallback(() => {
    setIsAddToPipelineModalOpen(false);
    setNodeToAddToPipeline(null);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    // Filter State & Setters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    quickFilter,
    setQuickFilter,
    connectorType,
    setConnectorType,
    statusFilter,
    setStatusFilter,
    compatibilityFilter,
    setCompatibilityFilter,
    ownerFilter,
    setOwnerFilter,
    certificationFilter,
    setCertificationFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,

    // Data
    nodes,
    categories,
    metrics,
    totalCount: 284,
    filteredCount: nodes.length,
    isLoading,
    isRefreshing,
    error,
    mocked,
    lastUpdated,
    favoriteIds,

    // Selected & Drawer
    selectedNodeId,
    selectedNode,
    isDrawerOpen,
    activeDrawerTab,
    setActiveDrawerTab,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isManageCategoriesOpen,
    setIsManageCategoriesOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    isAddToPipelineModalOpen,
    nodeToAddToPipeline,
    notification,

    // Handlers
    handleSelectNode,
    handleCloseDrawer,
    handleToggleFavorite,
    handleToggleQuickFilter,
    handleSelectCategory,
    handleSelectSubcategory,
    handleResetFilters,
    handleRefresh: () => loadData(true),
    handleCreateCustomNode,
    handleImportPackage,
    handleExportCatalog,
    handleOpenAddToPipeline,
    handleCloseAddToPipeline,
    clearNotification,
  };
}
