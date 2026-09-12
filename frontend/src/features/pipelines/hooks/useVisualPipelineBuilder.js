import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPipelineBuilderGraph,
  savePipelineBuilderGraph,
  validatePipelineGraph,
  executePipelineRun,
  publishPipelineVersion,
  INITIAL_PIPELINE_NODES,
  INITIAL_PIPELINE_EDGES,
  INITIAL_CONSOLE_LOGS,
  INITIAL_VALIDATION_ITEMS,
  MOCK_PIPELINE_META,
} from '../services/visualPipelineBuilder.api';

export function useVisualPipelineBuilder({ orgId = 'current', pipelineId = 'pipe-001' } = {}) {
  const queryClient = useQueryClient();

  // Server state query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pipeline-builder', orgId, pipelineId],
    queryFn: () => fetchPipelineBuilderGraph(orgId, pipelineId),
    staleTime: 60 * 1000,
  });

  // Local interactive state initialized from data / constants
  const [nodes, setNodes] = useState(INITIAL_PIPELINE_NODES);
  const [edges, setEdges] = useState(INITIAL_PIPELINE_EDGES);
  const [logs, setLogs] = useState(INITIAL_CONSOLE_LOGS);
  const [validationItems, setValidationItems] = useState(INITIAL_VALIDATION_ITEMS);

  // Sync with loaded data once fetched
  useEffect(() => {
    if (data?.nodes && data.nodes.length > 0) {
      setNodes(data.nodes);
    }
    if (data?.edges && data.edges.length > 0) {
      setEdges(data.edges);
    }
    if (data?.logs && data.logs.length > 0) {
      setLogs(data.logs);
    }
    if (data?.validationItems && data.validationItems.length > 0) {
      setValidationItems(data.validationItems);
    }
  }, [data]);

  // Active selection & editor state
  const [selectedNodeId, setSelectedNodeId] = useState('node-1');
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridEnabled, setGridEnabled] = useState(true);
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'pan' | 'zoom' | 'multiselect'
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('logs'); // 'validation' | 'execution' | 'logs' | 'errors' | 'metrics'
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState('ALL'); // 'ALL' | 'INFO' | 'WARN' | 'ERROR'

  // Execution simulation state
  const [executionStatus, setExecutionStatus] = useState('Running'); // 'Running' | 'Paused' | 'Stopped' | 'Idle'
  const [progressPercent, setProgressPercent] = useState(63);
  const [activeExecutingNode, setActiveExecutingNode] = useState('Aggregate');
  const [recordsProcessed, setRecordsProcessed] = useState('7.8M / 12.4M');
  const [duration] = useState('2m 14s');
  const [eta, setEta] = useState('~1m 18s');

  // Live simulation tick when status is 'Running'
  useEffect(() => {
    if (executionStatus !== 'Running') return;

    const interval = setInterval(() => {
      setProgressPercent((p) => {
        if (p >= 100) {
          setExecutionStatus('Idle');
          setActiveExecutingNode('Completed');
          setRecordsProcessed('12.4M / 12.4M');
          setEta('0s');
          return 100;
        }
        const next = Math.min(100, p + 1);
        const processedM = (12.4 * (next / 100)).toFixed(1);
        setRecordsProcessed(`${processedM}M / 12.4M`);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [executionStatus]);

  // Metadata & Dirty state tracking
  const [meta, setMeta] = useState(MOCK_PIPELINE_META);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('2m ago');
  const [notification, setNotification] = useState(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const pushHistory = useCallback((prevNodes, prevEdges) => {
    setHistory((h) => [...h.slice(-20), { nodes: prevNodes, edges: prevEdges }]);
    setFuture([]);
    setIsDirty(true);
  }, []);

  // Selected node object
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Validation counts
  const errorsCount = useMemo(() => {
    return validationItems.filter((v) => v.status === 'Error').reduce((acc, v) => acc + (v.count || 1), 0);
  }, [validationItems]);

  const warningsCount = useMemo(() => {
    return validationItems.filter((v) => v.status === 'Warning').reduce((acc, v) => acc + (v.count || 1), 0);
  }, [validationItems]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = logLevelFilter === 'ALL' || log.level.toUpperCase() === logLevelFilter;
      const matchesSearch =
        !searchLogQuery.trim() ||
        log.message.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.node.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.time.includes(searchLogQuery);
      return matchesLevel && matchesSearch;
    });
  }, [logs, logLevelFilter, searchLogQuery]);

  // Selection handler
  const selectNode = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Update a node's config
  const updateNodeConfig = useCallback((nodeId, updatedConfig) => {
    setNodes((prev) => {
      pushHistory(prev, edges);
      return prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            title: updatedConfig.name || node.title,
            config: { ...node.config, ...updatedConfig },
          };
        }
        return node;
      });
    });
  }, [edges, pushHistory]);

  // Drag node position
  const updateNodePosition = useCallback((nodeId, x, y) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return { ...node, x: Math.max(20, x), y: Math.max(20, y) };
        }
        return node;
      })
    );
    setIsDirty(true);
  }, []);

  // Add node from library
  const addNodeFromLibrary = useCallback((item, customPos = null) => {
    const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const x = customPos ? customPos.x : 400 + Math.floor(Math.random() * 100);
    const y = customPos ? customPos.y : 200 + Math.floor(Math.random() * 100);

    const newNode = {
      id: newId,
      category: item.category || 'transformations',
      type: item.type || 'filter',
      title: item.defaultTitle || item.name,
      subtitle: item.defaultSubtitle || 'Configured Node',
      x,
      y,
      status: 'valid',
      statusTone: 'success',
      metrics: [
        { label: 'STATUS', value: 'Ready' },
        { label: 'BATCH', value: '5000' },
      ],
      config: {
        name: item.defaultTitle || item.name,
        description: `Configured ${item.name} pipeline node`,
        tags: [item.category, item.type],
        connection: 'Default Connection',
        database: '',
        schema: '',
        tableOrQuery: 'Table',
        table: '',
        sqlQuery: '',
        batchSize: '5000',
        parallelism: '4',
        timeoutSeconds: '30',
        retries: '3',
        retryPolicy: 'Exponential Backoff',
        schemaValidation: true,
        requiredFields: true,
        nullHandling: false,
        duplicateCheck: false,
        enableMetrics: true,
        enableLogs: true,
        alerts: true,
      },
    };

    setNodes((prev) => {
      pushHistory(prev, edges);
      return [...prev, newNode];
    });
    setSelectedNodeId(newId);

    // Add log entry
    setLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}`,
        time: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
        level: 'INFO',
        node: newNode.title,
        message: `Node ${newNode.title} (${newId}) added to canvas topology.`,
      },
    ]);
  }, [edges, pushHistory]);

  // Delete node
  const deleteNode = useCallback((nodeId) => {
    setNodes((prev) => {
      pushHistory(prev, edges);
      return prev.filter((n) => n.id !== nodeId);
    });
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
  }, [edges, pushHistory]);

  // Connect nodes
  const connectNodes = useCallback((fromId, toId) => {
    if (fromId === toId) return;
    setEdges((prev) => {
      const exists = prev.some((e) => e.from === fromId && e.to === toId);
      if (exists) return prev;
      pushHistory(nodes, prev);
      return [...prev, { id: `edge_${fromId}_${toId}`, from: fromId, to: toId }];
    });
  }, [nodes, pushHistory]);

  // Delete edge
  const deleteEdge = useCallback((edgeId) => {
    setEdges((prev) => {
      pushHistory(nodes, prev);
      return prev.filter((e) => e.id !== edgeId);
    });
  }, [nodes, pushHistory]);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom((z) => Math.min(200, z + 15)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(25, z - 15)), []);
  const resetZoom = useCallback(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }, []);
  const fitToScreen = useCallback(() => {
    setZoom(90);
    setPan({ x: 10, y: 10 });
  }, []);

  // Auto layout algorithm (layered hierarchical layout)
  const autoLayout = useCallback(() => {
    const categoryOrder = { sources: 0, transformations: 1, destinations: 2, utility: 3 };
    const columns = { 0: [], 1: [], 2: [], 3: [] };

    nodes.forEach((node) => {
      const col = categoryOrder[node.category] ?? 1;
      columns[col].push(node);
    });

    const colXPositions = { 0: 118, 1: 460, 2: 820, 3: 1180 };
    const newPositions = {};

    Object.entries(columns).forEach(([colIdx, colNodes]) => {
      const x = colXPositions[colIdx] || 400;
      let startY = 88;
      colNodes.forEach((node) => {
        newPositions[node.id] = { x, y: startY };
        startY += 150;
      });
    });

    setNodes((prev) => {
      pushHistory(prev, edges);
      return prev.map((node) => ({
        ...node,
        ...(newPositions[node.id] || {}),
      }));
    });

    setNotification('Auto-layout applied successfully across 4 pipeline stages.');
    setTimeout(() => setNotification(null), 3000);
  }, [nodes, edges, pushHistory]);

  // Undo & Redo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setFuture((f) => [{ nodes, edges }, ...f]);
    setNodes(last.nodes);
    setEdges(last.edges);
    setHistory((h) => h.slice(0, -1));
  }, [history, nodes, edges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setFuture((f) => f.slice(1));
  }, [future, nodes, edges]);

  // Save draft mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => savePipelineBuilderGraph(orgId, pipelineId, payload),
    onSuccess: (res) => {
      setIsDirty(false);
      setLastSavedTime('Just now');
      queryClient.invalidateQueries({ queryKey: ['pipeline-builder', orgId, pipelineId] });
      setNotification(`Draft saved successfully (${res.mocked ? 'MOD-008 Simulated' : 'Server Sync'}).`);
      setTimeout(() => setNotification(null), 3500);
    },
  });

  const handleSaveDraft = useCallback(() => {
    saveMutation.mutate({
      nodes,
      edges,
      meta,
    });
  }, [saveMutation, nodes, edges, meta]);

  // Validate mutation
  const validateMutation = useMutation({
    mutationFn: () => validatePipelineGraph(orgId, pipelineId, { nodes, edges }),
    onSuccess: (res) => {
      setValidationItems(res.items || INITIAL_VALIDATION_ITEMS);
      setActiveConsoleTab('validation');
      setIsConsoleOpen(true);
      setNotification(`Validation complete: ${res.errorsCount} errors, ${res.warningsCount} warnings.`);
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const handleValidate = useCallback(() => {
    validateMutation.mutate();
  }, [validateMutation]);

  // Run execution
  const executeMutation = useMutation({
    mutationFn: () => executePipelineRun(orgId, pipelineId),
    onSuccess: () => {
      setExecutionStatus('Running');
      setActiveConsoleTab('logs');
      setIsConsoleOpen(true);
      setNotification('Pipeline execution started. Stream logs actively monitored.');
      setTimeout(() => setNotification(null), 3500);
    },
  });

  const handleRunExecution = useCallback(() => {
    executeMutation.mutate();
  }, [executeMutation]);

  // Pause / Stop execution
  const handleTogglePause = useCallback(() => {
    setExecutionStatus((prev) => (prev === 'Paused' ? 'Running' : 'Paused'));
  }, []);

  const handleStopExecution = useCallback(() => {
    setExecutionStatus('Stopped');
    setNotification('Pipeline execution halted by operator.');
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Publish pipeline
  const publishMutation = useMutation({
    mutationFn: () => publishPipelineVersion(orgId, pipelineId, { version: meta.version }),
    onSuccess: (res) => {
      setMeta((prev) => ({ ...prev, status: 'Published' }));
      setNotification(`Pipeline published as active production version ${res.version}.`);
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const handlePublish = useCallback(() => {
    publishMutation.mutate();
  }, [publishMutation]);

  // Export pipeline JSON definition
  const handleExport = useCallback(() => {
    const pipelineData = {
      meta,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const jsonBlob = new Blob([JSON.stringify(pipelineData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.name.toLowerCase().replace(/\s+/g, '_')}_builder.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification('Pipeline definition exported as JSON.');
    setTimeout(() => setNotification(null), 3000);
  }, [meta, nodes, edges]);

  return {
    meta,
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    selectNode,
    updateNodeConfig,
    updateNodePosition,
    addNodeFromLibrary,
    deleteNode,
    connectNodes,
    deleteEdge,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    pan,
    setPan,
    gridEnabled,
    toggleGrid: () => setGridEnabled((g) => !g),
    activeTool,
    setActiveTool,
    autoLayout,
    isMinimapOpen,
    toggleMinimap: () => setIsMinimapOpen((m) => !m),
    isConsoleOpen,
    toggleConsole: () => setIsConsoleOpen((c) => !c),
    activeConsoleTab,
    setActiveConsoleTab,
    searchLogQuery,
    setSearchLogQuery,
    logLevelFilter,
    setLogLevelFilter,
    filteredLogs,
    validationItems,
    errorsCount,
    warningsCount,
    executionStatus,
    progressPercent,
    activeExecutingNode,
    recordsProcessed,
    duration,
    eta,
    handleTogglePause,
    handleStopExecution,
    handleRunExecution,
    isDirty,
    lastSavedTime,
    handleSaveDraft,
    isSaving: saveMutation.isPending,
    handleValidate,
    isValidating: validateMutation.isPending,
    handlePublish,
    isPublishing: publishMutation.isPending,
    handleExport,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    notification,
    isLoading,
    isError,
  };
}
