import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Database,
  Warehouse,
  Cloud,
  Globe,
  Hexagon,
  Share2,
  Activity,
  FileText,
  Filter,
  Workflow,
  GitMerge,
  BarChart2,
  ArrowUpDown,
  GitPullRequest,
  Code,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Layers,
  GitBranch,
  Clock,
  Repeat,
  Bell,
  AlertTriangle,
  Calendar,
  X,
} from 'lucide-react';

const NODE_ICON_MAP = {
  database: Database,
  warehouse: Warehouse,
  cloud_storage: Cloud,
  rest_api: Globe,
  graphql: Hexagon,
  kafka: Share2,
  streaming: Activity,
  file: FileText,
  filter: Filter,
  map: Workflow,
  join: GitMerge,
  aggregate: BarChart2,
  sort: ArrowUpDown,
  merge: GitPullRequest,
  sql: Code,
  python: Terminal,
  validation: ShieldCheck,
  rest_endpoint: ExternalLink,
  data_lake: Layers,
  conditional: GitBranch,
  delay: Clock,
  loop: Repeat,
  notification: Bell,
  error_handler: AlertTriangle,
  scheduler: Calendar,
};

const CATEGORY_COLORS = {
  sources: {
    border: 'border-blue-400',
    selectedBorder: 'border-blue-500',
    bg: 'bg-blue-50/70',
    iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
    port: '#3b82f6',
    minimap: '#bfdbfe',
  },
  transformations: {
    border: 'border-violet-300',
    selectedBorder: 'border-violet-500',
    bg: 'bg-purple-50/70',
    iconBg: 'bg-purple-50 border-purple-200 text-purple-600',
    port: '#8b5cf6',
    minimap: '#ddd6fe',
  },
  destinations: {
    border: 'border-emerald-300',
    selectedBorder: 'border-emerald-500',
    bg: 'bg-emerald-50/70',
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    port: '#10b981',
    minimap: '#bbf7d0',
  },
  utility: {
    border: 'border-amber-300',
    selectedBorder: 'border-amber-500',
    bg: 'bg-amber-50/70',
    iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
    port: '#f59e0b',
    minimap: '#fde68a',
  },
};

export default function PipelineCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdatePosition,
  onAddNode,
  onConnectNodes,
  onDeleteEdge,
  onDeleteNode,
  zoom,
  pan,
  setPan,
  gridEnabled,
  activeTool,
  setActiveTool,
  isMinimapOpen,
  onToggleMinimap,
}) {
  const canvasRef = useRef(null);

  // Dragging state for nodes and canvas pan
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Port connection dragging state
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Delete key shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        if (onDeleteNode) onDeleteNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onDeleteNode]);

  // Map nodes by ID for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Convert mouse event client coordinates to canvas space coordinates
  const getCanvasCoords = useCallback(
    (e) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      return {
        x: (e.clientX - rect.left - pan.x) / scale,
        y: (e.clientY - rect.top - pan.y) / scale,
      };
    },
    [zoom, pan]
  );

  // Node Drag Handlers
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    onSelectNode(nodeId);

    if (activeTool === 'pan') return;

    const coords = getCanvasCoords(e);
    const node = nodeMap.get(nodeId);
    if (node) {
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: coords.x - node.x,
        y: coords.y - node.y,
      });
    }
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return; // Left or middle button
    if (activeTool === 'pan' || e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else {
      // Deselect if clicking blank canvas
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    setMouseCanvasPos(coords);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingNodeId) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      onUpdatePosition(draggingNodeId, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
    setConnectingFromId(null);
  };

  // Port connection start
  const handlePortMouseDown = (e, nodeId, isOutput) => {
    e.stopPropagation();
    if (isOutput) {
      setConnectingFromId(nodeId);
      setMouseCanvasPos(getCanvasCoords(e));
    }
  };

  // Port connection target drop
  const handlePortMouseUp = (e, nodeId, isInput) => {
    e.stopPropagation();
    if (connectingFromId && isInput && connectingFromId !== nodeId) {
      onConnectNodes(connectingFromId, nodeId);
    }
    setConnectingFromId(null);
  };

  // Drop node from library onto canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;
    try {
      const item = JSON.parse(dataStr);
      const coords = getCanvasCoords(e);
      onAddNode(item, { x: coords.x - 70, y: coords.y - 40 });
    } catch {
      // Ignore parse errors
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
      className={`relative flex-1 w-full h-full overflow-hidden select-none bg-[#f8f9fb] ${
        activeTool === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundImage: gridEnabled
          ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)'
          : 'none',
        backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoomable & Pannable Canvas Container */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
        }}
      >
        {/* SVG Connections & Edges Layer */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: 4000, height: 4000 }}
        >
          <defs>
            <marker
              id="edge-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Render Connections */}
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            // Output port is at (node.x + 158, node.y + 53)
            const x1 = fromNode.x + 158;
            const y1 = fromNode.y + 53;
            // Input port is at (node.x, node.y + 53)
            const x2 = toNode.x;
            const y2 = toNode.y + 53;

            const dx = Math.max(50, Math.abs(x2 - x1) * 0.5);
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isRunningFlow = fromNode.status === 'Running…' || toNode.status === 'Running…';

            return (
              <g key={edge.id} className="group pointer-events-auto cursor-pointer">
                {/* Hit area for selection/deletion */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  onClick={() => onDeleteEdge(edge.id)}
                />
                {/* Main edge line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isRunningFlow ? 'url(#flow-gradient)' : '#94a3b8'}
                  strokeWidth={isRunningFlow ? '2' : '1.5'}
                  strokeDasharray={isRunningFlow ? '6 4' : 'none'}
                  className={isRunningFlow ? 'animate-[dash_1s_linear_infinite]' : ''}
                />
              </g>
            );
          })}

          {/* Dragging Connection Preview */}
          {connectingFromId && (() => {
            const fromNode = nodeMap.get(connectingFromId);
            if (!fromNode) return null;
            const x1 = fromNode.x + 158;
            const y1 = fromNode.y + 53;
            const x2 = mouseCanvasPos.x;
            const y2 = mouseCanvasPos.y;
            const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            return (
              <path
                d={pathData}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })()}
        </svg>

        {/* Node Cards Layer */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.transformations;
          const IconComponent = NODE_ICON_MAP[node.type] || Layers;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '158px',
              }}
              className={`absolute bg-white rounded-lg border text-left shadow-xs transition-shadow duration-150 select-none ${
                isSelected
                  ? 'border-blue-500 shadow-[0px_0px_0px_2px_rgba(59,130,246,0.25),0px_4px_12px_0px_rgba(0,0,0,0.08)] ring-1 ring-blue-500 z-10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Left Input Port */}
              {node.category !== 'sources' && (
                <div
                  onMouseUp={(e) => handlePortMouseUp(e, node.id, true)}
                  title="Input Port (Connect upstream output here)"
                  className="absolute -left-1.5 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-white border-2 border-slate-400 hover:scale-125 hover:border-blue-600 transition z-20 cursor-crosshair"
                  style={{ borderColor: colors.port }}
                />
              )}

              {/* Right Output Port */}
              {node.category !== 'destinations' && (
                <div
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, true)}
                  title="Output Port (Drag to connect downstream input)"
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-2.5 rounded-full hover:scale-125 transition z-20 cursor-crosshair"
                  style={{ backgroundColor: colors.port }}
                />
              )}

              {/* Top Header Strip */}
              <div
                className={`flex items-start gap-2 p-2 rounded-t-[7px] border-b border-slate-100 ${colors.bg}`}
              >
                <div
                  className={`size-5.5 rounded flex items-center justify-center shrink-0 border ${colors.iconBg}`}
                >
                  <IconComponent className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-semibold text-slate-900 truncate leading-3.5">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate leading-3 mt-0.5">
                    {node.subtitle}
                  </p>
                </div>
              </div>

              {/* Body / Status & Metrics */}
              <div className="p-2 space-y-1.5">
                {/* Status indicator row */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1">
                    <span
                      className={`size-1.5 rounded-full ${
                        node.status === 'Running…'
                          ? 'bg-blue-500 animate-pulse'
                          : node.status === 'warning'
                          ? 'bg-amber-500'
                          : node.status === 'connected' || node.status === 'valid'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span
                      className={`font-medium capitalize ${
                        node.status === 'Running…'
                          ? 'text-blue-600'
                          : node.status === 'warning'
                          ? 'text-amber-600'
                          : node.status === 'connected' || node.status === 'valid'
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* Running animation progress bar */}
                  {node.status === 'Running…' && (
                    <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[63%]" />
                    </div>
                  )}
                </div>

                {/* Metrics 2-column strip */}
                {node.metrics && node.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 pt-0.5 border-t border-slate-50 text-[9px]">
                    {node.metrics.map((metric, idx) => (
                      <div key={idx} className="min-w-0">
                        <span className="text-slate-500 uppercase tracking-tight block truncate text-[8.5px]">
                          {metric.label}
                        </span>
                        <span className="font-mono font-medium text-slate-700 text-[10px] truncate block">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom-Left Navigation Tools */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-200 p-1 rounded-md shadow-xs z-10 text-[10px]">
        {[
          { id: 'pan', label: 'Pan' },
          { id: 'zoom', label: 'Zoom' },
          { id: 'select', label: 'Select' },
          { id: 'multiselect', label: 'Multi-select' },
        ].map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            aria-pressed={activeTool === tool.id}
            className={`px-2 py-0.5 rounded transition ${
              activeTool === tool.id
                ? 'bg-slate-900 text-white font-medium'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Floating Bottom-Right Minimap matching Figma node 150:8962 */}
      {isMinimapOpen && (
        <div className="absolute bottom-3 right-3 w-36 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-10 select-none">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 bg-slate-50/60 text-[10px]">
            <span className="font-bold text-slate-500 tracking-wider uppercase text-[9px]">
              Minimap
            </span>
            <button
              type="button"
              onClick={onToggleMinimap}
              title="Close Minimap"
              aria-label="Close minimap"
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="h-16 bg-slate-50 relative p-1.5 overflow-hidden">
            {/* Miniature nodes */}
            {nodes.map((n) => {
              const colors = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.transformations;
              return (
                <div
                  key={n.id}
                  style={{
                    left: `${Math.min(115, Math.max(2, (n.x / 1200) * 110))}px`,
                    top: `${Math.min(50, Math.max(2, (n.y / 550) * 45))}px`,
                    backgroundColor: colors.minimap,
                  }}
                  className="absolute size-2 rounded-xs border border-black/10"
                />
              );
            })}
            {/* Viewport Frame */}
            <div className="absolute left-1 top-1 w-20 h-12 border border-blue-500 bg-blue-500/10 rounded-xs pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}
