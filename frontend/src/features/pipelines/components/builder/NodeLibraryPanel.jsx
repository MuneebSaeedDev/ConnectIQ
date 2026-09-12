import React, { useState, useMemo } from 'react';
import {
  Search,
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
  Building,
  ExternalLink,
  Layers,
  GitBranch,
  Clock,
  Repeat,
  Bell,
  AlertTriangle,
  Calendar,
  Plus,
} from 'lucide-react';
import { NODE_CATEGORIES, RECENTLY_USED_NODES } from '../../services/visualPipelineBuilder.api';

const ICON_MAP = {
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
  Building,
  ExternalLink,
  Layers,
  GitBranch,
  Clock,
  Repeat,
  Bell,
  AlertTriangle,
  Calendar,
};

export default function NodeLibraryPanel({ onAddNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return NODE_CATEGORIES;
    }
    const q = searchQuery.toLowerCase();
    const result = {};
    Object.entries(NODE_CATEGORIES).forEach(([catKey, cat]) => {
      const matchingItems = cat.items.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      );
      if (matchingItems.length > 0) {
        result[catKey] = {
          ...cat,
          items: matchingItems,
        };
      }
    });
    return result;
  }, [searchQuery]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none overflow-hidden h-full z-10">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-white">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Node Library
        </span>
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            aria-label="Search available nodes"
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Scrollable Node Categories List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {Object.entries(filteredCategories).map(([catKey, category]) => (
          <div key={catKey} className="space-y-1">
            {/* Category Header */}
            <div className="flex items-center gap-1.5 px-2 py-1">
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">
                {category.name}
              </span>
            </div>

            {/* Category Items */}
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || Layers;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => onAddNode(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onAddNode(item);
                      }
                    }}
                    title={`Drag to canvas or click to add ${item.name}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent
                        className="size-3.5 shrink-0 transition"
                        style={{ color: category.color }}
                      />
                      <span className="truncate text-[11px]">{item.name}</span>
                    </div>
                    <Plus className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">
            No matching nodes found.
          </div>
        )}
      </div>

      {/* Recently Used Nodes Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Recently Used
        </span>
        <div className="space-y-1">
          {RECENTLY_USED_NODES.map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => {
                const item = Object.values(NODE_CATEGORIES)
                  .flatMap((c) => c.items)
                  .find((i) => i.type === rec.type);
                if (item) onAddNode(item);
              }}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-slate-600 hover:text-blue-600 hover:bg-white transition text-left"
            >
              <span className="size-1.5 rounded-full bg-slate-300" />
              <span className="truncate">{rec.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
